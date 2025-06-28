# Google OAuth Setup Guide

## 🎯 Quick Setup Steps

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select Project
- Click "Select a project" dropdown
- Either create new project called "Edgewater Beach Club" 
- Or select existing project

### 3. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" 
- Click and enable it

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Choose "Web application"

### 5. Configure OAuth Client
**Application name**: Edgewater Beach Club

**Authorized JavaScript origins**:
```
http://localhost:3000
http://127.0.0.1:3000
https://your-domain.com  (for production later)
```

**Authorized redirect URIs**:
```
http://localhost:3000
http://localhost:3000/auth/callback
http://127.0.0.1:3000
http://127.0.0.1:3000/auth/callback
```

### 6. Copy Credentials
You'll get:
- **Client ID**: Looks like `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Looks like `GOCSPX-abc123def456`

### 7. Update Environment Files

**Backend (.env)**:
```bash
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**Frontend (.env)**:
```bash
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here
```

## 🧪 Test Google OAuth

1. **Start Backend**:
```bash
cd "Edgewater-1/edgewater-backend"
export PATH="/home/karl/.local/bin:$PATH"
flask run
```

2. **Start Frontend**:
```bash
cd "Edgewater"
npm start
```

3. **Test Login**:
- Go to http://localhost:3000
- Click "Sign in with Google"
- Should redirect to Google login
- After login, should return to app

## 🔍 Testing Commands

**Test Google Token Verification** (replace TOKEN with actual Google JWT):
```bash
curl -X POST "http://127.0.0.1:5000/api/auth/google" \
-H "Content-Type: application/json" \
-d '{"token":"GOOGLE_JWT_TOKEN_HERE"}'
```

## 🚨 Common Issues

### "redirect_uri_mismatch"
- Check authorized redirect URIs match exactly
- Include both localhost and 127.0.0.1

### "invalid_client"
- Client ID/Secret incorrect
- Check environment files loaded properly

### "access_blocked"
- OAuth consent screen needs configuration
- Add test users in Google Console

## 📋 OAuth Consent Screen Setup

If you see "access_blocked" errors:

1. Go to "OAuth consent screen" in Google Console
2. Choose "External" user type
3. Fill in required fields:
   - App name: "Edgewater Beach Club"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `openid`, `email`, `profile`
5. Add test users: your email addresses

## ✅ Verification

Once setup, you should be able to:
- ✅ Register with email/password
- ✅ Login with email/password  
- ✅ Sign in with Google
- ✅ Create events
- ✅ Report sasquatch sightings
- ✅ View all data in the app

Your app will then be fully functional for beach club members!