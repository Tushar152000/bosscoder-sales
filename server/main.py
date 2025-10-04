import os
import json
import tempfile
from typing import Dict, Any, List, Optional
from io import BytesIO
import asyncio

from google.cloud import storage, firestore
from google.cloud.exceptions import NotFound
from pydub import AudioSegment
from pydub.utils import which
from faster_whisper import WhisperModel

# Configure audio segment
AudioSegment.converter = which("ffmpeg")

# Environment variables
MODEL_SIZE_DEFAULT = os.getenv("WHISPER_MODEL", "small")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE", "int8")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
BUCKET_NAME = os.getenv("GCS_BUCKET", "bosscoderplatformindia.appspot.com")
AUDIO_FOLDER = os.getenv("AUDIO_FOLDER", "zoom-phone-recording")
FIRESTORE_COLLECTION = os.getenv("FIRESTORE_COLLECTION", "website_zoom_phone")

# Model cache
_models: Dict[str, WhisperModel] = {}

def get_model(size: str) -> WhisperModel:
    key = f"{size}:{DEVICE}:{COMPUTE_TYPE}"
    if key not in _models:
        _models[key] = WhisperModel(
            size,
            device=DEVICE,
            compute_type=COMPUTE_TYPE
        )
    return _models[key]

class TranscriptionWorker:
    def __init__(self):
        self.storage_client = storage.Client()
        self.firestore_client = firestore.Client()
        self.bucket = self.storage_client.bucket(BUCKET_NAME)
        self.model = get_model(MODEL_SIZE_DEFAULT)
        
    def download_audio(self, blob_name: str) -> BytesIO:
        """Download audio file from GCS"""
        try:
            blob = self.bucket.blob(blob_name)
            audio_data = BytesIO()
            blob.download_to_file(audio_data)
            audio_data.seek(0)
            return audio_data
        except Exception as e:
            raise Exception(f"Failed to download audio from GCS: {e}")
    
    def transcribe_audio(self, audio_data: BytesIO, word_timestamps: bool = False) -> Dict[str, Any]:
        """Transcribe audio using Whisper model"""
        try:
            # Decode & normalize with pydub
            audio = AudioSegment.from_file(audio_data)
            duration_sec = round(len(audio) / 1000.0, 2)
            pcm16 = audio.set_channels(1).set_frame_rate(16000)
            
            # Export to temp WAV file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp_path = tmp.name
            
            try:
                pcm16.export(tmp_path, format="wav")
                
                # Transcribe
                segments, info = self.model.transcribe(
                    tmp_path,
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=500),
                    beam_size=5,
                    temperature=0.0,
                    word_timestamps=word_timestamps
                )
                
                out_segments: List[Dict[str, Any]] = []
                word_count = 0

                for seg in segments:
                    item: Dict[str, Any] = {
                        "id": seg.id,
                        "start": float(seg.start),
                        "end": float(seg.end),
                        "text": seg.text.strip()
                    }
                    word_count += len(item["text"].split())

                    if word_timestamps and getattr(seg, "words", None):
                        item["words"] = [
                            {"start": float(w.start), "end": float(w.end), "word": w.word}
                            for w in seg.words
                        ]
                    out_segments.append(item)

                transcript = " ".join(s["text"] for s in out_segments).strip()

                return {
                    "success": True,
                    "transcript": transcript,
                    "duration_sec": duration_sec,
                    "word_count": word_count,
                    "segments": out_segments
                }
                
            finally:
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
                    
        except Exception as e:
            return {
                "success": False,
                "error": f"Transcription error: {e}"
            }
    
    def find_firestore_document(self, recording_url: str) -> Optional[Any]:
        """Find Firestore document by recordingUrl"""
        try:
            collection_ref = self.firestore_client.collection(FIRESTORE_COLLECTION)
            query = collection_ref.where("recordingUrl", "==", recording_url).limit(1)
            docs = list(query.stream())
            
            if docs:
                return docs[0]
            return None
        except Exception as e:
            print(f"Error finding Firestore document: {e}")
            return None
    
    def update_firestore_document(self, doc_ref, transcription_data: Dict[str, Any]):
        """Update Firestore document with transcription results"""
        try:
            update_data = {
                "transcription": transcription_data["transcript"],
                "transcriptionSegments": transcription_data["segments"],
                "audioDuration": transcription_data["duration_sec"],
                "wordCount": transcription_data["word_count"],
                "transcriptionStatus": "completed",
                "transcriptionUpdatedAt": firestore.SERVER_TIMESTAMP
            }
            
            doc_ref.update(update_data)
            print(f"Successfully updated Firestore document {doc_ref.id}")
            
        except Exception as e:
            print(f"Error updating Firestore document: {e}")
            raise
    
    def process_recording(self, blob_name: str):
        """Main processing function for a recording"""
        print(f"Processing recording: {blob_name}")
        
        try:
            # Construct recording URL
            recording_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_name}"
            
            # Check if document exists in Firestore
            doc = self.find_firestore_document(recording_url)
            if not doc:
                print(f"No Firestore document found for recording: {recording_url}")
                return
            
            print(f"Found Firestore document: {doc.id}")
            
            # Download audio from GCS
            audio_data = self.download_audio(blob_name)
            
            # Transcribe audio
            transcription_result = self.transcribe_audio(audio_data, word_timestamps=False)
            
            if not transcription_result["success"]:
                print(f"Transcription failed: {transcription_result.get('error')}")
                # Update document with error status
                doc_ref = self.firestore_client.collection(FIRESTORE_COLLECTION).document(doc.id)
                doc_ref.update({
                    "transcriptionStatus": "failed",
                    "transcriptionError": transcription_result.get('error'),
                    "transcriptionUpdatedAt": firestore.SERVER_TIMESTAMP
                })
                return
            
            # Update Firestore document with transcription
            doc_ref = self.firestore_client.collection(FIRESTORE_COLLECTION).document(doc.id)
            self.update_firestore_document(doc_ref, transcription_result)
            
            print(f"Successfully processed recording: {blob_name}")
            
        except Exception as e:
            print(f"Error processing recording {blob_name}: {e}")

def process_gcs_event(event: Dict[str, Any]):
    """Process GCS event from Pub/Sub"""
    try:
        # Parse the event data
        if 'data' in event:
            # For Pub/Sub messages
            import base64
            data = json.loads(base64.b64decode(event['data']).decode('utf-8'))
        else:
            # Direct GCS event format
            data = event
        
        # Extract bucket and file information
        bucket_name = data.get('bucket', BUCKET_NAME)
        blob_name = data.get('name', '')
        
        # Check if it's in the zoom-phone-recording folder
        if blob_name.startswith(f"{AUDIO_FOLDER}/") and blob_name.lower().endswith(('.mp3', '.wav', '.m4a', '.flac')):
            print(f"New audio file detected: {blob_name}")
            
            # Initialize worker and process
            worker = TranscriptionWorker()
            worker.process_recording(blob_name)
        else:
            print(f"Ignoring non-audio file: {blob_name}")
            
    except Exception as e:
        print(f"Error processing GCS event: {e}")

# HTTP endpoint for manual triggering and health checks
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Sales Recording Worker")

@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "model_loaded": MODEL_SIZE_DEFAULT in [m.split(':')[0] for m in _models.keys()]
    }

@app.post("/process-recording")
async def process_recording_endpoint(blob_name: str):
    """Manual trigger to process a specific recording"""
    try:
        worker = TranscriptionWorker()
        worker.process_recording(blob_name)
        return {"status": "processing started", "blob_name": blob_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-pubsub-event")
async def process_pubsub_event(event: Dict[str, Any]):
    """Endpoint for Pub/Sub push subscriptions"""
    try:
        process_gcs_event(event)
        return {"status": "event processed"}
    except Exception as e:
        print(f"Error processing Pub/Sub event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Preload model on startup
    get_model(MODEL_SIZE_DEFAULT)
    print("Transcription worker started with model:", MODEL_SIZE_DEFAULT)