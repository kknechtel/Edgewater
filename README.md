# Edgewater Community App

A full-stack web application for managing community events and activities, built with Flask (backend) and React (frontend).

## Project Structure

```
Edgewater-1/
├── edgewater-backend/     # Flask backend API
│   ├── app/              # Flask application package
│   ├── migrations/       # Database migrations
│   ├── requirements.txt  # Python dependencies
│   ├── config.py        # Configuration
│   └── run.py           # Application entry point
├── edgewater-frontend/   # React frontend
│   ├── src/             # React source code
│   ├── public/          # Static assets
│   ├── package.json     # Node.js dependencies
│   └── README.md        # Frontend documentation
└── README.md            # This file
```

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd edgewater-backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment:
   ```bash
   cp env.template .env
   # Edit .env with your configuration
   ```

5. Initialize database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. Run the backend:
   ```bash
   flask run
   ```

The backend will be available at `http://127.0.0.1:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd edgewater-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.template .env
   # Update REACT_APP_API_URL if needed
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Features

- **User Authentication**: Register, login, and session management
- **Event Management**: Create, read, update, and delete community events
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modular Architecture**: Separate backend and frontend for easy maintenance

## Development

- Backend: Flask with SQLAlchemy, Flask-Migrate, and JWT authentication
- Frontend: React with React Router, Axios, and Tailwind CSS
- Database: SQLite (development) / PostgreSQL (production ready)

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `GET /events` - List all events
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
