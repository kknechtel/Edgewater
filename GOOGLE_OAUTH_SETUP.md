# Google OAuth Setup Guide for Edgewater Beach Club

## Prerequisites
- Google Cloud Console account
- Admin access to your Google Cloud project

## Setup Steps

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Edgewater Beach Club" and create

### 2. Enable Google Identity API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Identity Toolkit API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in app name: "Edgewater Beach Club"
   - Add your email as support email
   - Add authorized domains (your production domain)
   - Save and continue through scopes (no additional scopes needed)
   - Add test users if in development

### 4. Configure OAuth Client
1. Back in "Create OAuth client ID":
   - Application type: "Web application"
   - Name: "Edgewater Beach Club Web"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-vercel-app.vercel.app` (for production)
   - Authorized redirect URIs (not needed for implicit flow)
   - Click "Create"

### 5. Save Your Credentials
You'll receive:
- **Client ID**: Something like `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: Keep this secure (only needed for backend)

### 6. Configure Your Application

#### Frontend Configuration
1. Create a `.env` file in your React app root:
```env
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

2. Or update directly in `src/GoogleSignIn.js`:
```javascript
client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-client-id-here.apps.googleusercontent.com',
```

#### Backend Configuration
1. Add to your backend `.env` file:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 7. Test the Integration
1. Start your backend server
2. Start your React app
3. Click "Sign in with Google"
4. You should see Google's sign-in popup
5. After signing in, you should be logged into the app

## Troubleshooting

### "popup_closed_by_user" Error
- User closed the popup before completing sign-in
- This is normal behavior

### "Not a valid origin" Error
- Add your current URL to Authorized JavaScript origins in Google Console
- Wait a few minutes for changes to propagate

### Token Verification Failed
- Ensure GOOGLE_CLIENT_ID matches in both frontend and backend
- Check that the backend is running and accessible

## Security Notes
- Never commit your Client Secret to version control
- Use environment variables for all credentials
- In production, restrict authorized origins to your domain only
- Regularly rotate credentials

## Production Deployment
When deploying to Vercel:
1. Add `REACT_APP_GOOGLE_CLIENT_ID` to Vercel environment variables
2. Update Authorized JavaScript origins to include your Vercel URL
3. Ensure your backend also has the Google credentials configured