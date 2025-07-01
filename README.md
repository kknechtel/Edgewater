# Edgewater Beach Club

A comprehensive community management platform for beach club members featuring event management, bags (cornhole) game tracking, and admin tools.

## Features

- 📅 **Event Calendar** - Create and manage community events
- 🎯 **Bags Game System** - Track games, tournaments, and leaderboards
- 👥 **User Management** - Admin dashboard with role-based access
- 🔐 **Authentication** - Email/password and Google OAuth support
- 📊 **Statistics** - Player stats, rankings, and tournament history

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Redis (optional, for waitlist feature)

### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python3 -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"

# Run Flask server
python3 run.py
```

### Frontend Setup
```bash
# Install Node dependencies
npm install

# Run React development server
npm start
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Configuration

Create a `.env` file with:
```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ADMIN_EMAILS=admin@example.com
```

## Development

See [CLAUDE.md](CLAUDE.md) for detailed development documentation.

## License

This project is proprietary and confidential.