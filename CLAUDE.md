# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edgewater Beach Club is a comprehensive community management platform for a beach club featuring:
- Event calendar and management
- Bags (Cornhole) game tracking, tournaments, and leaderboards
- User authentication with Google OAuth
- Admin dashboard for user management
- Role-based access control

## Tech Stack

### Backend
- **Framework**: Flask 3.0.0
- **Database**: SQLAlchemy with SQLite (development)
- **Authentication**: Flask-JWT-Extended + Google OAuth
- **Key Libraries**: Flask-Migrate, Flask-CORS, PyJWT, google-auth, redis
- **API Design**: RESTful with JWT token protection

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **State Management**: Context API for authentication
- **HTTP Client**: Axios with interceptors
- **UI Libraries**: lucide-react for icons, date-fns for date formatting
- **Authentication**: Google Identity Services (@react-oauth/google)

## Development Commands

### Backend Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Run Flask development server
python run.py

# Create database migrations
flask db init
flask db migrate -m "Description"
flask db upgrade

# Flask shell with context
flask shell
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

## Project Structure

```
/home/karl/Edgewater/
├── app/                    # Flask backend application
│   ├── __init__.py        # Flask app factory with JWT setup
│   ├── models.py          # Database models (User, Event, BagsGame, BagsTournament)
│   ├── routes.py          # Main API endpoints
│   ├── auth_routes.py     # Authentication endpoints with admin features
│   ├── bags_routes.py     # Bags game management endpoints
│   └── services/          # Business logic layer
│       └── google_auth_service.py
├── src/                    # React frontend application
│   ├── App.js             # Main app with routing
│   ├── GoogleSignIn.js    # Google OAuth component
│   ├── components/        # React components
│   │   ├── AdminDashboard.js   # Admin user management
│   │   ├── BagsView.js         # Bags game interface
│   │   └── CalendarView.js     # Event calendar
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js      # Authentication state management
│   └── services/          # API service layer
│       └── api.js              # Axios configuration and services
├── instance/              # Instance-specific files
│   └── edgewater.db       # SQLite database
├── config.py              # Flask configuration
├── run.py                 # Flask entry point
├── package.json           # Node dependencies
└── requirements.txt       # Python dependencies
```

## Key Features & Architecture

### Authentication System
- **Dual Authentication**: Supports both email/password and Google OAuth
- **JWT Tokens**: Used for session management
- **Protected Routes**: Decorator-based route protection (`@token_required`)

### Database Models
1. **User Model**
   - Identity: id, email, first_name, last_name, display_name, password_hash, google_id
   - Admin: is_admin, is_active
   - Profile: avatar_url, bio, favorite_band, beach_member_since
   - Stats: bags_wins/losses/tournament_wins, events_created, sasquatch_sightings
   - Preferences: notify_events, notify_bags_games, notify_messages
   - Methods: set_password(), check_password(), get_display_name(), update_bags_stats(), to_dict()

2. **Event Model**
   - Fields: id, title, description, date, location, created_by_id, created_at
   - Relationship: Many-to-one with User

3. **BagsGame Model**
   - Teams: team1_players, team2_players (JSON arrays)
   - Scores: team1_score, team2_score, winning_team
   - Metadata: game_type, tournament_id, tournament_round, location
   - Timestamps: started_at, ended_at, duration_minutes

4. **BagsTournament Model**
   - Setup: name, tournament_type (4 or 8 players), players (JSON)
   - Progress: bracket (JSON), status, current_round
   - Results: champion_id, champion_name
   - Timestamps: created_at, started_at, completed_at

### API Endpoints

#### Main Routes (`/api`)
- `GET /api/health` - Health check
- `GET /api/events` - List all events
- `POST /api/events` - Create new event (protected)

#### Auth Routes (`/api/auth`)
- `POST /register` - User registration with auto-admin for configured emails
- `POST /login` - User login with JWT token
- `GET /me` - Get current user (protected)
- `POST /google` - Google OAuth authentication
- `PUT /profile` - Update user profile (protected)
- `PUT /password` - Change password (protected)
- `GET /users` - Get all users with stats (admin only)
- `PUT /users/:id/admin` - Toggle admin status (admin only)
- `PUT /users/:id/active` - Toggle active status (admin only)
- `GET /stats` - Get system statistics (admin only)

#### Bags Routes (`/api/bags`)
- `GET /games` - List games with pagination
- `POST /games` - Create new game
- `GET /games/:id` - Get specific game
- `GET /leaderboard` - Get player rankings
- `GET /players/:id/stats` - Get player statistics
- `POST /tournaments` - Create tournament
- `GET /tournaments` - List tournaments
- `GET /tournaments/:id` - Get tournament details
- `PUT /tournaments/:id` - Update tournament (bracket, status)
- `GET /waitlist` - Get waitlist
- `POST /waitlist` - Join waitlist
- `DELETE /waitlist/:player_id` - Leave waitlist

### Frontend Architecture
- **Single Page Application**: Main App.js component handles routing and state
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: Token stored in localStorage
- **API Communication**: Axios with proxy to backend (localhost:5000)

## Configuration & Environment

### Required Environment Variables
Create a `.env` file with:
```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=sqlite:///edgewater.db  # Optional, defaults to SQLite
```

### CORS Configuration
- CORS is enabled for all origins in development
- Frontend proxy in package.json points to `http://localhost:5000`

## Development Workflow

### Starting the Application
1. **Backend**: Run `python run.py` (runs on port 5000)
2. **Frontend**: Run `npm start` (runs on port 3000)
3. Access the application at `http://localhost:3000`

### Database Management
- Database is automatically created on first run
- Use Flask-Migrate for schema changes:
  ```bash
  flask db migrate -m "Add new field"
  flask db upgrade
  ```

### Adding New Features
1. **New Model**: Add to `app/models.py`, create migration
2. **New Route**: Add to `app/routes.py`, use `@token_required` for protected routes
3. **Frontend Component**: Add to `src/components/`, import in App.js
4. **API Integration**: Use axios in frontend, handle JWT tokens in headers

## Testing & Debugging

### Backend Debugging
- Flask runs in debug mode by default (`app.run(debug=True)`)
- Use `flask shell` for interactive debugging with database context

### Frontend Debugging
- React development server includes hot reload
- Browser DevTools for network requests and console logs
- Check localStorage for JWT token issues

## Security Considerations

1. **Passwords**: Hashed using Werkzeug's security utilities
2. **JWT Tokens**: Used for stateless authentication
3. **Google OAuth**: Token verification using Google's libraries
4. **CORS**: Currently open for development, restrict in production
5. **SQL Injection**: Protected by SQLAlchemy ORM

## New Features Overview

### Bags (Cornhole) Game System
- **Quick Games**: 2v2 casual games with score tracking
- **Tournaments**: 4 or 8 player single-elimination brackets
- **Leaderboard**: Real-time rankings with win rates
- **Player Stats**: Games played, wins, losses, tournament victories
- **Waitlist**: "Who's Got Next" queue management

### Admin Dashboard
- **User Management**: View all users, toggle admin/active status
- **System Stats**: Total users, events, games, active users today
- **User Details**: Comprehensive user profiles with all statistics
- **Filter & Search**: Filter by status (active/inactive/admin)

### Enhanced Calendar
- **Dual Views**: Month calendar and list view
- **Event Types**: Different colors and icons by type
- **Inline Preview**: Quick event details without modal
- **Smart Headers**: "Today", "Tomorrow" labels for better UX

## Common Issues & Solutions

1. **Google OAuth Setup**: Ensure GOOGLE_CLIENT_ID is set in both backend (.env) and frontend (GoogleSignIn.js)
2. **Database Errors**: Delete `instance/edgewater.db` to reset database
3. **Token Errors**: Clear localStorage and re-authenticate
4. **CORS Issues**: Check that Flask backend is running on port 5000
5. **Redis Connection**: Waitlist feature requires Redis (optional)
6. **Admin Access**: Set ADMIN_EMAILS in .env for auto-admin on registration