# server/main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from io import BytesIO
import tempfile
import os

from pydub import AudioSegment
from pydub.utils import which
from faster_whisper import WhisperModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)
AudioSegment.converter = which("ffmpeg")

# -------------------------------------------------
# Model cache
# -------------------------------------------------
MODEL_SIZE_DEFAULT = os.getenv("WHISPER_MODEL", "small")  # tiny|base|small|medium|large-v3
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE", "auto")       # auto|int8|int8_float16|float16|float32
DEVICE = os.getenv("WHISPER_DEVICE", "auto")              # cpu|auto|metal (if supported by ctranslate2)

_models: Dict[str, WhisperModel] = {}

def get_model(size: str) -> WhisperModel:
    key = f"{size}:{DEVICE}:{COMPUTE_TYPE}"
    if key not in _models:
        _models[key] = WhisperModel(
            size,
            device=DEVICE,           # let ctranslate2 pick best device
            compute_type=COMPUTE_TYPE
        )
    return _models[key]

@app.on_event("startup")
def preload_model():
    get_model(MODEL_SIZE_DEFAULT)

@app.get("/health")
def health():
    return {"ok": True, "models_cached": list(_models.keys())}

# -------------------------------------------------
# /transcribe: now returns timestamped segments (and optional words)
# -------------------------------------------------
@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    model_size: str = Form(MODEL_SIZE_DEFAULT),
    language: Optional[str] = Form(None),              # e.g. "en" to force English
    word_timestamps: bool = Form(False),               # return word-level timings if True
    vad: bool = Form(True),                            # voice activity detection
    beam_size: int = Form(5),
    temperature: float = Form(0.0)
):
    blob = await file.read()

    # Decode & normalize with pydub, then export to temp WAV (16k mono)
    try:
        audio = AudioSegment.from_file(BytesIO(blob))
        duration_sec = round(len(audio) / 1000.0, 2)
        pcm16 = audio.set_channels(1).set_frame_rate(16000)
    except Exception as e:
        return {"ok": False, "error": f"Failed to decode audio: {e}"}

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        pcm16.export(tmp_path, format="wav")
    except Exception as e:
        return {"ok": False, "error": f"Failed to export WAV: {e}"}

    try:
        model = get_model(model_size)
        segments, info = model.transcribe(
            tmp_path,
            language=language,
            vad_filter=vad,
            vad_parameters=dict(min_silence_duration_ms=500),
            beam_size=beam_size,
            temperature=temperature,
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
            "ok": True,
            "transcript": transcript,
            "stats": {
                "durationSec": duration_sec,
                "wordCount": word_count
            },
            "segments": out_segments
        }
    except Exception as e:
        return {"ok": False, "error": f"Transcription error: {e}"}
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass