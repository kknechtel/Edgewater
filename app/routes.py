from flask import Blueprint, jsonify, request, current_app
from app import db
from app.models import User, Event
from datetime import datetime
import jwt
from functools import wraps
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import requests

main = Blueprint('main', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@main.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Edgewater API is running'})

@main.route('/api/events')
def get_events():
    events = Event.query.order_by(Event.date.desc()).all()
    return jsonify({'events': [event.to_dict() for event in events]})

@main.route('/api/events', methods=['POST'])
@token_required
def create_event(current_user):
    data = request.get_json()
    
    event = Event(
        title=data['title'],
        description=data.get('description'),
        date=datetime.fromisoformat(data['date']),
        location=data.get('location'),
        created_by_id=current_user.id
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify({
        'message': 'Event created successfully',
        'event': event.to_dict()
    }), 201

