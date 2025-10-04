#!/bin/bash

set -e  # Exit on any error

SERVICE_NAME="sales-recording-worker"
REGION="asia-south1"
PROJECT_ID="bosscoderplatformindia"
TOPIC_NAME="gcs-zoom-recordings"
SUBSCRIPTION_NAME="zoom-recordings-worker-sub"
BUCKET_NAME="$PROJECT_ID.appspot.com"

echo "🔧 Setting up Pub/Sub for GCS notifications..."

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Please login to gcloud first: gcloud auth login"
    exit 1
fi

# Set the project
echo "📁 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Get the service URL
echo "🔍 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)" 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    echo "❌ Service $SERVICE_NAME not found in region $REGION"
    echo "Please deploy the service first using: ./deploy.sh"
    exit 1
fi

echo "✅ Service URL: $SERVICE_URL"

# Enable required APIs
echo "🚀 Enabling required APIs..."
gcloud services enable pubsub.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com

# Create Pub/Sub topic
echo "📢 Creating Pub/Sub topic..."
gcloud pubsub topics create $TOPIC_NAME 2>/dev/null || echo "Topic already exists"

# Create GCS notification with specific prefix
echo "📁 Creating GCS notification for zoom-phone-recording folder..."
# First, remove any existing notifications to avoid duplicates
gsutil notification delete gs://$BUCKET_NAME 2>/dev/null || true
sleep 2

# Create new notification with object prefix filter
gsutil notification create -t $TOPIC_NAME -f json -e OBJECT_FINALIZE -p zoom-phone-recording/ gs://$BUCKET_NAME

# Create push subscription
echo "📨 Creating push subscription..."
gcloud pubsub subscriptions create $SUBSCRIPTION_NAME \
  --topic=$TOPIC_NAME \
  --push-endpoint=$SERVICE_URL/process-pubsub-event \
  --push-auth-service-account=$PROJECT_ID@appspot.gserviceaccount.com \
  --ack-deadline=300 \
  --max-delivery-attempts=5 \
  --min-retry-delay=10s 2>/dev/null || echo "Subscription already exists"

# Set up permissions for Cloud Run invocation
echo "🔐 Setting up Cloud Run permissions..."
gcloud run services add-iam-policy-binding $SERVICE_NAME \
  --region=$REGION \
  --member=serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com \
  --role=roles/run.invoker 2>/dev/null || echo "Permissions already set"

# Set up permissions for GCS to publish to Pub/Sub
echo "🔐 Setting up GCS permissions..."
gsutil iam ch serviceAccount:service-$PROJECT_ID@gcp-sa-pubsub.iam.gserviceaccount.com:roles/pubsub.publisher gs://$BUCKET_NAME 2>/dev/null || echo "GCS permissions already set"

# Grant Pub/Sub service account permissions
PUBSUB_SERVICE_ACCOUNT="service-$PROJECT_ID@gcp-sa-pubsub.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PUBSUB_SERVICE_ACCOUNT" \
    --role="roles/pubsub.publisher" 2>/dev/null || echo "Pub/Sub SA permissions already set"

echo ""
echo "✅ Setup completed successfully!"
echo "📊 Summary:"
echo "   Topic: $TOPIC_NAME"
echo "   Subscription: $SUBSCRIPTION_NAME"
echo "   Push endpoint: $SERVICE_URL/process-pubsub-event"
echo "   GCS Bucket: $BUCKET_NAME"
echo "   Folder: zoom-phone-recording/"
echo ""
echo "🔍 To test:"
echo "   gsutil cp test.mp3 gs://$BUCKET_NAME/zoom-phone-recording/"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=10 --order=desc"