# Edgewater

Edgewater is a modular full-stack application designed for a financial advisory firm specializing in bankruptcy and restructuring services. The application is built with a Flask backend and a React frontend, and is structured to support core functionalities such as client onboarding, case management, and document handling.

## Features
- **Client Onboarding:** Streamlined process for adding and managing new clients.
- **Case Management:** Tools for tracking, updating, and managing client cases.
- **Document Handling:** Secure upload, storage, and retrieval of client documents.
- **Modular Architecture:** Each feature is implemented as a separate module for easy maintenance and extensibility.

## Project Structure
```
Edgewater/
  Edgewater/            # React frontend (legacy or alternate)
  Edgewater-1/
    edgewater-backend/  # Flask backend
    edgewater-frontend/ # React frontend
  local-edgewater/      # Local development environment
```

## Technology Stack
- **Backend:** Python, Flask
- **Frontend:** React.js
- **Database:** SQLite (default, can be changed)

## Getting Started
### Backend Setup
1. Navigate to the backend directory:
   ```sh
   cd Edgewater-1/edgewater-backend
   ```
2. Create a virtual environment and install dependencies:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```sh
   python run.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd Edgewater-1/edgewater-frontend
   ```
2. Install dependencies and start the development server:
   ```sh
   npm install
   npm start
   ```

## Contributing
- The project is organized into modules for each major feature.
- New features should be added as separate modules to maintain modularity.
- Please follow the code style and contribution guidelines.

## License
This project is for internal use by the financial advisory firm Edgewater. Licensing details TBD. 