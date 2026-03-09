#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="nexrender-server"
REGION="us-central1"
PORT=3000
SECRET="myapisecret" # CHANGE THIS

echo "🚀 Deploying $SERVICE_NAME to Google Cloud Run in $REGION..."

# 1. Build and Deploy to Google Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port $PORT \
  --set-env-vars="NEXRENDER_SECRET=$SECRET"

# 2. Get the Service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo "✅ Deployment complete!"
echo "🔗 Your nexrender-server URL is: $SERVICE_URL"
echo "📡 MoDeck Webhook Endpoint: $SERVICE_URL/api/v1/jobs"
echo "🔑 Webhook Secret Header: nexrender-secret: $SECRET"
