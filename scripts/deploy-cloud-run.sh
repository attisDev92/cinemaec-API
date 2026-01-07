#!/usr/bin/env bash
set -euo pipefail

# Deploy NestJS backend to Google Cloud Run using source-based build
# Requirements:
# - gcloud CLI installed and authenticated (gcloud auth login)
# - PROJECT_ID configured (gcloud config set project <PROJECT_ID>)
# - .env.production present with required env vars

SERVICE_NAME=${SERVICE_NAME:-cinema-ec-backend}
REGION=${REGION:-us-east4}
PLATFORM=managed

# Ensure project is set
PROJECT_ID=$(gcloud config get-value project)
if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "(unset)" ]]; then
  echo "Error: gcloud project not set. Run: gcloud config set project <PROJECT_ID>"
  exit 1
fi

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# Build env var list from .env.production (skip comments/blank lines)
if [[ ! -f .env.production ]]; then
  echo "Error: .env.production not found at project root"
  exit 1
fi
ENV_VARS=$(grep -vE '^#|^$' .env.production | tr '\n' ',' | sed 's/,$//')

# Always enforce production mode
if [[ -n "$ENV_VARS" ]]; then
  ENV_VARS="NODE_ENV=production,$ENV_VARS"
else
  ENV_VARS="NODE_ENV=production"
fi

echo "Deploying $SERVICE_NAME to Cloud Run in $REGION (project: $PROJECT_ID)"

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform "$PLATFORM" \
  --region "$REGION" \
  --allow-unauthenticated \
  --timeout=600 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="$ENV_VARS"

# Show service URL
URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')
echo "Service URL: $URL"
