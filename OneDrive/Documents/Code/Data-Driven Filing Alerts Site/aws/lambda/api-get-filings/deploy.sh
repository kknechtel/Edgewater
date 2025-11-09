#!/bin/bash

# Deploy API Get Filings Lambda
echo "Deploying api-get-filings Lambda..."

cd "$(dirname "$0")"

# Create deployment package
zip -j function.zip lambda_function.py

# Update Lambda
aws lambda update-function-code \
  --function-name api-get-filings \
  --zip-file fileb://function.zip \
  --region us-east-1

# Update environment variables
aws lambda update-function-configuration \
  --function-name api-get-filings \
  --environment Variables="{TABLE_NAME=bankruptcy-filings-dev}" \
  --region us-east-1

echo "Deployment complete!"

