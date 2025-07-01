# Edgewater Beach Club - Deployment Guide

## Prerequisites
✅ Production build created (`npm run build`)
✅ All fake data removed
✅ App tested and working locally

## Deployment to Vercel

### 1. Login to Vercel
```bash
vercel login
```
Choose your preferred authentication method (GitHub recommended).

### 2. Deploy the Application
```bash
vercel --prod
```

When prompted:
- Set up and deploy: Y
- Which scope: Select your account
- Link to existing project?: N
- Project name: edgewater-beach-club (or press enter for default)
- In which directory is your code located?: ./ (press enter)
- Want to override the settings?: N

### 3. Environment Variables
After deployment, add these environment variables in Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `REACT_APP_API_URL` = Your backend API URL (if deployed separately)
   - Any other environment variables your app needs

### 4. Custom Domain (Optional)
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain

## Alternative: Deploy with GitHub

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial deployment - Edgewater Beach Club"
git remote add origin https://github.com/YOUR_USERNAME/edgewater-beach-club.git
git push -u origin main
```

2. Import to Vercel:
- Go to https://vercel.com/new
- Import your GitHub repository
- Configure build settings (should auto-detect React)
- Deploy

## Manual Deployment via UI

1. Visit https://vercel.com
2. Click "Add New Project"
3. Upload the `build` folder
4. Configure settings
5. Deploy

## Post-Deployment

1. Test the production URL
2. Share with users
3. Monitor usage and errors in Vercel dashboard

## Backend Deployment (If Needed)

If you have a Flask backend, consider deploying it to:
- Render.com (recommended for Flask)
- Railway.app
- Heroku
- AWS/GCP/Azure

Update the `REACT_APP_API_URL` in Vercel after backend deployment.