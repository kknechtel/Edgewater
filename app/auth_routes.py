from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User
from app.services.google_auth_service import verify_google_token
from datetime import datetime, timedelta
import os

auth_bp = Blueprint('auth', __name__)

# Admin email - set this in your .env file
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'karl@example.com')  # Change this to your email

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        user = User(
            email=data['email'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            display_name=data.get('display_name')
        )
        user.set_password(data['password'])
        
        # Set admin if email matches
        if user.email == ADMIN_EMAIL:
            user.is_admin = True
        
        # Set beach member since date if provided
        if data.get('beach_member_since'):
            try:
                user.beach_member_since = datetime.strptime(data['beach_member_since'], '%Y-%m-%d').date()
            except:
                pass
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=30),
            additional_claims={'is_admin': user.is_admin}
        )
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=30),
            additional_claims={'is_admin': user.is_admin}
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(include_stats=True)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token required'}), 400
        
        # Verify Google token
        google_user_info = verify_google_token(token)
        
        if not google_user_info:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Find or create user
        user = User.query.filter_by(google_id=google_user_info['sub']).first()
        
        if not user:
            # Check if user exists with this email
            user = User.query.filter_by(email=google_user_info['email']).first()
            
            if user:
                # Link Google account to existing user
                user.google_id = google_user_info['sub']
                user.google_picture_url = google_user_info.get('picture')
            else:
                # Create new user
                user = User(
                    email=google_user_info['email'],
                    google_id=google_user_info['sub'],
                    first_name=google_user_info.get('given_name'),
                    last_name=google_user_info.get('family_name'),
                    google_picture_url=google_user_info.get('picture')
                )
                
                # Set admin if email matches
                if user.email == ADMIN_EMAIL:
                    user.is_admin = True
                
                db.session.add(user)
        
        # Update last login and picture
        user.last_login = datetime.utcnow()
        if google_user_info.get('picture'):
            user.google_picture_url = google_user_info.get('picture')
        
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=30),
            additional_claims={'is_admin': user.is_admin}
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(include_stats=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict(include_stats=True)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'display_name' in data:
            user.display_name = data['display_name']
        if 'bio' in data:
            user.bio = data['bio']
        if 'favorite_band' in data:
            user.favorite_band = data['favorite_band']
        if 'beach_member_since' in data:
            try:
                user.beach_member_since = datetime.strptime(data['beach_member_since'], '%Y-%m-%d').date()
            except:
                pass
        
        # Update notification preferences
        if 'notify_events' in data:
            user.notify_events = data['notify_events']
        if 'notify_bags_games' in data:
            user.notify_bags_games = data['notify_bags_games']
        if 'notify_messages' in data:
            user.notify_messages = data['notify_messages']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict(include_stats=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current and new password required'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Invalid current password'}), 401
        
        # Set new password
        user.set_password(data['new_password'])
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Admin routes
@auth_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all users with stats
        users = User.query.all()
        users_data = [user.to_dict(include_stats=True) for user in users]
        
        return jsonify({
            'users': users_data,
            'total': len(users_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/admin/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user_admin(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Admin can update these fields
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_admin' in data and user_id != current_user_id:  # Can't remove own admin
            user.is_admin = data['is_admin']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict(include_stats=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get various stats
        from app.models import Event, BagsGame, BagsTournament
        
        stats = {
            'total_users': User.query.count(),
            'active_users': User.query.filter_by(is_active=True).count(),
            'total_events': Event.query.count(),
            'total_sightings': 0,  # Placeholder for future feature
            'total_bags_games': BagsGame.query.count(),
            'total_tournaments': BagsTournament.query.count(),
            'users_logged_in_today': User.query.filter(
                User.last_login >= datetime.utcnow().replace(hour=0, minute=0, second=0)
            ).count()
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500