# 🏖️ Edgewater Beach Club Community App

A comprehensive beach club community application featuring event management, band guides, sasquatch sightings, cornhole tournaments, and more!

## 📁 Project Structure

```
edgewater-beach-club/
├── README.md                           # This file
├── .gitignore                          # Git ignore file
├── CLAUDE.md                          # AI development notes
├── 
├── Edgewater-1/edgewater-backend/     # Flask API Backend
│   ├── app/
│   │   ├── __init__.py                 # Flask app factory
│   │   ├── models.py                   # SQLAlchemy models
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth_routes.py          # Authentication endpoints
│   │   │   ├── event_routes.py         # Event management
│   │   │   ├── sasqwatch_routes.py     # Sasquatch sightings
│   │   │   ├── bags_routes.py          # Cornhole game tracking
│   │   │   ├── photo_routes.py         # Photo uploads
│   │   │   └── message_routes.py       # Community messaging
│   │   └── services/
│   │       ├── __init__.py
│   │       └── google_auth_service.py  # Google OAuth
│   ├── migrations/                     # Database migrations
│   ├── config.py                       # Flask configuration
│   ├── requirements.txt               # Python dependencies
│   └── run.py                         # Flask development server
│
└── Edgewater-1/edgewater-frontend/   # React Frontend
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── Login.js            # Login/Register component
    │   │   ├── features/
    │   │   │   ├── Calendar.js         # Event calendar & weather
    │   │   │   ├── Music.js            # Band guide & ratings
    │   │   │   ├── Messages.js         # Community chat
    │   │   │   ├── Photos.js           # Photo sharing
    │   │   │   └── SasqWatch.js        # Sasquatch sightings
    │   │   ├── views/
    │   │   │   ├── BagsView.js         # Cornhole tournaments
    │   │   │   ├── CalendarView.js     # Event calendar
    │   │   │   ├── ComingSoonView.js   # Future features
    │   │   │   ├── DinnerView.js       # Dinner planning
    │   │   │   ├── MessagesView.js     # Chat interface
    │   │   │   ├── MusicView.js        # Band database
    │   │   │   ├── PhotosView.js       # Photo gallery
    │   │   │   ├── ProfileSettingsView.js # User settings
    │   │   │   └── SasqWatchView.js    # Cryptid sightings
    │   │   ├── MainApp.js              # Main application component
    │   │   ├── MobileApp.js            # Mobile-optimized app
    │   │   └── ProtectedRoute.js       # Route protection
    │   ├── contexts/
    │   │   └── AuthContext.js          # Authentication state
    │   ├── data/
    │   │   └── bandGuideData.js        # Complete band database
    │   ├── services/
    │   │   ├── authService.js          # Authentication API calls
    │   │   └── eventService.js         # Event API calls
    │   ├── App.js                      # Root component with router
    │   └── index.js                    # React entry point
    ├── package.json                   # Node.js dependencies
    └── tailwind.config.js             # Tailwind CSS config

```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/edgewater-beach-club.git
cd edgewater-beach-club
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Edgewater-1/edgewater-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
flask db upgrade

# Run the backend server
python run.py
```

Backend will be running at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd Edgewater-1/edgewater-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will be running at `http://localhost:3000`

## 🎯 Features Overview

### ✅ Implemented (Frontend Complete, Backend Ready)

- **🔐 Authentication**
  - Email/password registration and login
  - Google OAuth integration
  - JWT token management
  - Protected routes

- **📅 Event Calendar**
  - View daily events with weather integration
  - Create, edit, and delete custom events
  - "I'm Going" attendance tracking
  - Who's attending display

- **🎸 Band Guide**
  - Comprehensive summer 2025 band database
  - 5-star rating system with detailed reviews
  - Band categorization (Top Recommendations, Strong Contenders, etc.)
  - Search and filter functionality
  - Set reminders for favorite bands

- **👁️ SasqWatch**
  - Report sasquatch and cryptid sightings
  - View community sighting reports
  - Credibility rating system
  - Photo evidence upload

- **🎯 Bags (Cornhole) Game Center**
  - Live scorekeeping for matches
  - "Who's Got Next" waitlist
  - Player rankings and statistics
  - Tournament bracket system (4 or 8 players)
  - "Game On!" notifications

- **🍽️ Dinner Planning**
  - Host dinner events
  - Potluck organization
  - Spot reservation system
  - "Sign up to bring" functionality

- **📸 Photo Sharing**
  - Upload and share beach photos
  - Like and comment system
  - Community photo gallery

- **💬 Community Messaging**
  - Group chat functionality
  - Real-time message display
  - Customizable display names

- **⚙️ Profile Settings**
  - User profile management
  - Notification preferences
  - Account settings

### 🔮 Coming Soon Features

- **Luma Locator™** - AI-powered sunscreen application optimization
- **Tiki Douche Factor (TDF) Real-time Index™** - Monitor and avoid problematic beach behavior
- **Critical Lobster Roll Alert System™** - Never miss the perfect lobster roll
- **Stormtrooper Activity Tracker** - Club management operations
- **AI-Powered Karaoke Night Optimal Song Path Planner™**
- **Quantum Entangled Cornhole Bag Retrieval System™**
- **Seagull Mind-Control Beacons™** - French fry defense system
- **Sub-Sand Compression Algorithm™** - Revolutionary sandwich storage

## 📱 Mobile Optimization

This application is designed mobile-first with:
- Responsive design for all screen sizes
- Touch-optimized interface elements
- Bottom navigation for easy thumb access
- Inline styles for consistent appearance
- PWA capabilities (installable on mobile devices)

## 🛠️ Development Commands

### Backend

```bash
# Database operations
flask db migrate -m "Description"  # Create migration
flask db upgrade                   # Apply migrations

# Run with debug
python run.py

# Install new packages
pip install package_name
pip freeze > requirements.txt
```

### Frontend

```bash
# Development server
npm start

# Build for production
npm run build

# Install new packages
npm install package-name
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### SasqWatch
- `GET /api/sasqwatch` - Get all sightings
- `POST /api/sasqwatch` - Report sighting

## 🚀 Tech Stack

### Backend
- **Python 3.8+** with Flask web framework
- **SQLAlchemy** for database ORM
- **Flask-Migrate** for database migrations
- **Flask-JWT-Extended** for authentication
- **Flask-CORS** for cross-origin requests
- **SQLite** for development (PostgreSQL for production)

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API calls
- **Tailwind CSS** for styling (with inline fallbacks)
- **Lucide React** for icons

## 📞 Support

For questions, issues, or feature requests:
- Create an issue in this repository
- Check the CLAUDE.md file for development notes

## 📄 License

This project is for the Edgewater Beach Club community.

---

**Made with ❤️ for the Edgewater Beach Club community** 🏖️ 