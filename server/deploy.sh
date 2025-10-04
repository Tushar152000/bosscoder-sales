#!/bin/bash

# Set variables
PROJECT_ID="bosscoderplatformindia"
REGION="asia-south1"
REPO_NAME="bosscoder-website-repo"
SERVICE_NAME="sales-recording-worker"
IMAGE_NAME="asia-south1-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME"

echo "Building and deploying $SERVICE_NAME..."

# Build the Docker image
docker build -t $IMAGE_NAME:latest .

# Push to Artifact Registry
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars "WHISPER_MODEL=small,WHISPER_DEVICE=cpu,WHISPER_COMPUTE=int8,GCS_BUCKET=bosscoderplatformindia.appspot.com,AUDIO_FOLDER=zoom-phone-recording,FIRESTORE_COLLECTION=website_zoom_phone" \
  --timeout 300

echo "Deployment completed for $SERVICE_NAME"