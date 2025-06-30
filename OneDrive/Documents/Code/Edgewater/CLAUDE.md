# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Status: ✅ REFACTORED

**Backend**: `Edgewater-1/edgewater-backend/` - Fully refactored with:
- Complete models for all features (User, Event, SasquatchSighting, Photo, Message, Bag)
- Working authentication routes with both email/password + Google OAuth
- Implemented SasqWatch routes with full CRUD operations
- PostgreSQL configuration (with SQLite fallback)
- Proper API structure with `/api/` prefix

**Frontend**: `Edgewater-1/edgewater-frontend/` - Connected with:
- Updated AuthContext for new API endpoints
- Created API service layer with automatic token handling
- Event and SasqWatch services ready for integration

## Development Commands

### Backend Setup (Edgewater-1/edgewater-backend/)
```bash
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.template .env
# Edit .env with your configuration
flask db init      # First time only
flask db migrate -m "Initial migration with all models"
flask db upgrade
flask run
```

### Frontend Setup (Edgewater-1/edgewater-frontend/)
```bash
npm install
# Create .env file with your API URL and Google Client ID
npm start
```

### Database Management
```bash
flask db migrate -m "Migration description"
flask db upgrade
```

### Running the Application
Backend runs on `http://localhost:5000` by default.
Frontend runs on `http://localhost:3000` by default.

## Architecture Overview

### Backend (Flask - Edgewater-1/edgewater-backend/)
- **Application Factory Pattern** in `app/__init__.py`
- **Blueprint Routes** organized by feature (all with `/api/` prefix):
  - `auth_routes.py` - ✅ Complete: email/password + Google OAuth
  - `event_routes.py` - ✅ Complete: CRUD operations with band ratings
  - `sasqwatch_routes.py` - ✅ Complete: Sasquatch sighting reports
  - `photo_routes.py` - 🚧 Stub: Ready for S3 photo uploads
  - `message_routes.py` - 🚧 Stub: Ready for messaging system
  - `bags_routes.py` - 🚧 Stub: Ready for bag tracking
- **Models**: Complete set with User, Event, SasquatchSighting, Photo, Message, Bag
- **Database**: PostgreSQL (production) / SQLite (development) with Flask-Migrate
- **Authentication**: JWT tokens with 30-day expiration
- **Configuration**: Environment-based config with CORS and security settings

### Frontend (React - Edgewater-1/edgewater-frontend/)
- **Single Page Application**: React Router with protected routes
- **Authentication**: ✅ Updated AuthContext with proper API integration
- **API Layer**: ✅ Centralized API service with automatic token handling
- **Services**: 
  - ✅ `authService.js` - Complete authentication management
  - ✅ `eventService.js` - Complete event management
  - 🚧 Additional services needed for sasqwatch, photos, messages, bags
- **Component Structure**: 
  - `MainApp.js` orchestrates the main tabbed interface
  - View components for each feature (Calendar, Music, Dinner, Photos, Messages, SasqWatch, Bags)
  - Modal system for event creation/editing
- **Navigation**: Bottom tab navigation with header menu for additional options
- **State Management**: React Context for authentication, local state for UI

## Environment Configuration

**Backend (.env)** - Copy from `.env.template`:
```bash
# Required for basic functionality
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (choose one)
DATABASE_URL=sqlite:///app.db  # Development
# DATABASE_URL=postgresql://user:pass@localhost/edgewater_db  # Production

# Optional for photo uploads
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-bucket-name

# CORS for frontend
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env)** - Create manually in `Edgewater-1/edgewater-frontend/`:
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## Implementation Status

### ✅ Completed Features
- **Authentication**: Email/password + Google OAuth
- **Events**: Full CRUD with band ratings and vibes
- **SasqWatch**: Sasquatch sighting reports with credibility ratings
- **Database**: All models created and relationships defined
- **API Structure**: Consistent `/api/` endpoints with error handling
- **Frontend Services**: API integration layer with token management

### 🚧 Ready to Implement
- **Photos**: S3 upload routes (models ready)
- **Messages**: Public/private messaging (models ready)
- **Bags**: Lost & found bag tracking (models ready)
- **Music**: Static band guide integration
- **Dinner**: Restaurant features

### 🔧 Next Steps
1. Run database migrations: `flask db migrate && flask db upgrade`
2. Set up environment variables from templates
3. Test authentication flow between frontend/backend
4. Implement remaining photo/message/bag routes
5. Connect frontend views to new API services

## Beach Club Features

This is a fun community app for Edgewater Beach Club members featuring:
- **Event Planning**: ✅ Beach events, parties, gatherings with band ratings
- **SasqWatch**: ✅ Playful sasquatch "sightings" with credibility system
- **Photo Sharing**: 🚧 Beach memories and club photos (S3 ready)
- **Communication**: 🚧 Member messaging system
- **Bag Tracking**: 🚧 Lost & found for beach gear
- **Music Guide**: 🚧 Band ratings and vibes for events
- **Dinner**: 🚧 Restaurant features