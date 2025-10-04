FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    WHISPER_MODEL=small \
    WHISPER_DEVICE=cpu \
    WHISPER_COMPUTE=int8 \
    GCS_BUCKET=bosscoderplatformindia.appspot.com \
    AUDIO_FOLDER=zoom-phone-recording \
    FIRESTORE_COLLECTION=website_zoom_phone

# System deps: ffmpeg for pydub, libgomp1 for ctranslate2
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg build-essential libgomp1 curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]