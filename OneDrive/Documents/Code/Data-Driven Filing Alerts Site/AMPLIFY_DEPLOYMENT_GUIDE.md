# AWS Amplify Deployment Guide

## Overview

Your React frontend is now connected to your Step Function backend via:
- **Step Function** → Saves to **DynamoDB** (`BankruptcyFilings`) → **API Gateway** → **React App**

**API Endpoint:** `https://tsojl7sith.execute-api.us-east-1.amazonaws.com/prod/filings`

---

## ✅ What's Already Done

1. ✅ API Lambda (`api-get-filings`) created and deployed
2. ✅ API Gateway configured with CORS
3. ✅ DynamoDB permissions configured
4. ✅ React Dashboard updated to fetch real data
5. ✅ `amplify.yml` build configuration created

---

## 🚀 Deploy to AWS Amplify

### Step 1: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Select your Git provider (GitHub/GitLab/Bitbucket/etc.)
4. Authorize AWS Amplify to access your repository
5. Select this repository: `Data-Driven Filing Alerts Site`
6. Select branch: `main` (or your default branch)

### Step 2: Configure Build Settings

Amplify will auto-detect the `amplify.yml` file. Verify it contains:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 3: Environment Variables (Optional)

If you want to make the API URL configurable:

1. In Amplify Console → **App settings** → **Environment variables**
2. Add: `REACT_APP_API_URL` = `https://tsojl7sith.execute-api.us-east-1.amazonaws.com/prod`
3. Update `src/utils/api/filings.ts` to use `process.env.REACT_APP_API_URL || 'https://...'`

### Step 4: Deploy

1. Click **"Save and deploy"**
2. Amplify will:
   - Clone your repository
   - Run `npm ci` to install dependencies
   - Run `npm run build` to build your React app
   - Deploy to CloudFront CDN
3. Wait 5-10 minutes for the build to complete

### Step 5: Get Your App URL

Once deployed, Amplify will provide a URL like:
```
https://main.d1234abcd5678.amplifyapp.com
```

---

## 🔒 Update CORS for Production

Once you have your Amplify URL, update the API Gateway CORS to restrict access:

1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Select **"Bankruptcy Filings API"** (ID: `tsojl7sith`)
3. Go to **Resources** → `/filings` → **OPTIONS**
4. Update the `Access-Control-Allow-Origin` header from `*` to your Amplify URL

Or use the AWS CLI:

```bash
# Update CORS to allow only your Amplify domain
aws apigateway put-integration-response \
  --rest-api-id tsojl7sith \
  --resource-id xaagl0 \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{
    "method.response.header.Access-Control-Allow-Origin":"'"'"'https://main.d1234abcd5678.amplifyapp.com'"'"'"
  }' \
  --region us-east-1

# Redeploy API
aws apigateway create-deployment \
  --rest-api-id tsojl7sith \
  --stage-name prod \
  --region us-east-1
```

---

## 🧪 Testing the Full Pipeline

### Test Step Function → DynamoDB → API → React

1. **Trigger Step Function** with a test case:
   ```bash
   aws stepfunctions start-execution \
     --state-machine-arn arn:aws:states:us-east-1:115304973740:stateMachine:bankruptcy-processing-workflow \
     --input file://aws/test-brandhoot.json \
     --region us-east-1
   ```

2. **Wait 1-2 minutes** for the Step Function to complete

3. **Check DynamoDB** to verify data was saved:
   ```bash
   aws dynamodb scan \
     --table-name BankruptcyFilings \
     --limit 5 \
     --region us-east-1
   ```

4. **Test API** directly:
   ```bash
   curl "https://tsojl7sith.execute-api.us-east-1.amazonaws.com/prod/filings?limit=5"
   ```

5. **Open your React app** in the browser and verify filings appear!

---

## 📊 Architecture Diagram

```
┌─────────────────┐
│  RSS/Manual     │
│    Trigger      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step Function   │
│  (Orchestrator) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DynamoDB      │
│ BankruptcyFilings│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │
│  /filings       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lambda         │
│  api-get-filings│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React App      │
│  (Amplify)      │
└─────────────────┘
```

---

## 🛠️ Troubleshooting

### Issue: "Failed to load filings"

**Check API:**
```bash
curl "https://tsojl7sith.execute-api.us-east-1.amazonaws.com/prod/filings?limit=1"
```

**Check Lambda logs:**
```bash
aws logs tail /aws/lambda/api-get-filings --since 5m --region us-east-1
```

### Issue: CORS Error in Browser

**Symptom:** Console shows "blocked by CORS policy"

**Fix:** Update API Gateway CORS headers (see "Update CORS for Production" section)

### Issue: No Data in Dashboard

**Check if DynamoDB has data:**
```bash
aws dynamodb scan --table-name BankruptcyFilings --limit 1 --region us-east-1
```

**If empty:** Run the Step Function with a test case to populate data

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Amplify app is deployed and accessible via HTTPS
2. ✅ Dashboard shows "Loading..." then displays real filing data
3. ✅ Filings are clickable and show details
4. ✅ Filters work (Chapter, District, etc.)
5. ✅ New Step Function executions appear in the dashboard within 1-2 minutes

---

## 📝 Next Steps

After deployment:

1. **Set up custom domain** in Amplify (optional)
2. **Enable HTTPS redirect** in Amplify settings
3. **Set up branch previews** for testing
4. **Configure monitoring** with CloudWatch dashboards
5. **Add authentication** with Cognito (if needed for private access)

---

## 🔗 Useful Links

- **API Gateway Console:** https://console.aws.amazon.com/apigateway
- **Amplify Console:** https://console.aws.amazon.com/amplify
- **DynamoDB Console:** https://console.aws.amazon.com/dynamodb
- **Lambda Console:** https://console.aws.amazon.com/lambda
- **Step Functions Console:** https://console.aws.amazon.com/states

---

**Need help?** Check the AWS Amplify documentation: https://docs.aws.amazon.com/amplify/

