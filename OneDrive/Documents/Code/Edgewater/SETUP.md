# Edgewater Beach Club App - Setup Guide

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Google OAuth Client ID (optional for testing)

## Backend Setup (Flask)

### 1. Navigate to Backend Directory
```bash
cd "Edgewater-1/edgewater-backend"
```

### 2. Create Virtual Environment
```bash
# For Windows
python -m venv venv
.\venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
# .env file is already created with development defaults
# Update these values in .env:
# - GOOGLE_CLIENT_ID=your-actual-google-client-id
# - GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

### 5. Initialize Database
```bash
flask db init      # First time only
flask db migrate -m "Initial migration with all models"
flask db upgrade
```

### 6. Start Backend Server
```bash
flask run
# Server will run on http://localhost:5000
```

## Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd "Edgewater"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# .env file is already created
# Update REACT_APP_GOOGLE_CLIENT_ID if you want Google OAuth
```

### 4. Start Frontend Server
```bash
npm start
# Server will run on http://localhost:3000
```

## 🧪 Testing the Setup

### 1. Backend Health Check
Visit: http://localhost:5000/api/events
Expected: `[]` (empty array)

### 2. Frontend Load
Visit: http://localhost:3000
Expected: Login screen

### 3. Test User Registration
1. Click "Register" 
2. Create account with email/password
3. Should redirect to main app

## 📱 Features Ready to Test

### ✅ Working Features
- **Authentication**: Email/password registration and login
- **Events**: Create, view, edit, delete calendar events
- **SasqWatch**: Report and view sasquatch sightings

### 🚧 Features Needing Implementation
- **Google OAuth**: Needs real Google Client ID
- **Photos**: S3 upload functionality
- **Messages**: Messaging system
- **Bags**: Lost & found tracking

## 🔧 Troubleshooting

### Backend Issues
- **Database Error**: Run `flask db upgrade`
- **Import Error**: Check virtual environment is activated
- **Port 5000 in use**: Kill other Flask processes

### Frontend Issues
- **npm install fails**: Try `npm install --legacy-peer-deps`
- **API connection error**: Check backend is running on port 5000
- **CORS errors**: Verify CORS_ORIGINS in backend .env

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add `http://localhost:3000` to authorized origins
6. Update both .env files with the Client ID

## 🎯 Next Development Steps

1. **Test Basic Authentication Flow**
2. **Create Some Test Events**
3. **Report Test Sasquatch Sightings**
4. **Implement Photo Upload Routes**
5. **Add Messaging System**
6. **Connect Bag Tracking Feature**

## 📂 Key Files

### Backend
- `app/models.py` - Database models
- `app/routes/` - API endpoints
- `config.py` - Configuration
- `.env` - Environment variables

### Frontend
- `AuthContext.js` - Authentication state
- `services/` - API communication
- `MainApp.js` - Main app structure
- `.env` - Environment variables

The app is now ready for development and testing! 🎉