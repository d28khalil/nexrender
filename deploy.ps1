# Configuration
$SERVICE_NAME = "nexrender-server"
$REGION = "us-central1"
$PORT = 3000
$SECRET = "myapisecret" # CHANGE THIS

Write-Host "Deploying $SERVICE_NAME to Google Cloud Run in $REGION..."

# Ensure gcloud is in the session path
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    $env:PATH += ";$env:LocalAppData\Google\Cloud SDK\google-cloud-sdk\bin"
}

# 1. Build and Deploy to Google Cloud Run
# We use --source . to let Google Cloud Build the Docker container automatically
gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --port $PORT `
  --set-env-vars="NEXRENDER_SECRET=$SECRET"

# 2. Get the Service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'

Write-Host "Deployment complete!"
Write-Host "Your nexrender-server URL is: $SERVICE_URL"
Write-Host "MoDeck Webhook Endpoint: $SERVICE_URL/api/v1/jobs"
Write-Host "Webhook Secret Header: nexrender-secret: $SECRET"
