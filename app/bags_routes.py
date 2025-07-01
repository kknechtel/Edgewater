from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, BagsGame, BagsTournament
from datetime import datetime
import uuid

bags_bp = Blueprint('bags', __name__)

@bags_bp.route('/games', methods=['GET'])
@jwt_required()
def get_games():
    """Get all bags games with optional filters"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        player_id = request.args.get('player_id')
        game_type = request.args.get('type')  # 'casual' or 'tournament'
        
        # Build query
        query = BagsGame.query
        
        # Filter by player if specified
        if player_id:
            # This would need a more complex query to check JSON fields
            # For now, return all games
            pass
        
        if game_type:
            query = query.filter_by(game_type=game_type)
        
        # Order by most recent first
        query = query.order_by(BagsGame.started_at.desc())
        
        # Apply pagination
        games = query.offset(offset).limit(limit).all()
        total = query.count()
        
        return jsonify({
            'games': [game.to_dict() for game in games],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/games', methods=['POST'])
@jwt_required()
def create_game():
    """Record a completed bags game"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required = ['team1_players', 'team2_players', 'team1_score', 'team2_score']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create game record
        game = BagsGame(
            team1_players=data['team1_players'],
            team2_players=data['team2_players'],
            team1_score=data['team1_score'],
            team2_score=data['team2_score'],
            winning_team=1 if data['team1_score'] > data['team2_score'] else 2,
            game_type=data.get('game_type', 'casual'),
            tournament_id=data.get('tournament_id'),
            tournament_round=data.get('tournament_round'),
            location=data.get('location', 'Beach Club'),
            started_at=datetime.fromisoformat(data['started_at']) if 'started_at' in data else datetime.utcnow(),
            ended_at=datetime.utcnow()
        )
        
        # Calculate duration
        game.calculate_duration()
        
        # Update player statistics
        winning_team_players = game.team1_players if game.winning_team == 1 else game.team2_players
        losing_team_players = game.team2_players if game.winning_team == 1 else game.team1_players
        
        # Update winners
        for player in winning_team_players:
            if player.get('id') and player['id'].startswith('user_'):
                user = User.query.get(player['id'].replace('user_', ''))
                if user:
                    user.bags_wins += 1
        
        # Update losers
        for player in losing_team_players:
            if player.get('id') and player['id'].startswith('user_'):
                user = User.query.get(player['id'].replace('user_', ''))
                if user:
                    user.bags_losses += 1
        
        db.session.add(game)
        db.session.commit()
        
        return jsonify({
            'message': 'Game recorded successfully',
            'game': game.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/games/<game_id>', methods=['GET'])
@jwt_required()
def get_game(game_id):
    """Get a specific game by ID"""
    try:
        game = BagsGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        return jsonify(game.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/tournaments', methods=['GET'])
@jwt_required()
def get_tournaments():
    """Get all tournaments"""
    try:
        status = request.args.get('status')  # 'setup', 'in_progress', 'completed'
        
        query = BagsTournament.query
        if status:
            query = query.filter_by(status=status)
        
        tournaments = query.order_by(BagsTournament.created_at.desc()).all()
        
        return jsonify({
            'tournaments': [t.to_dict() for t in tournaments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/tournaments', methods=['POST'])
@jwt_required()
def create_tournament():
    """Create a new tournament"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if 'name' not in data or 'tournament_type' not in data:
            return jsonify({'error': 'Name and tournament_type required'}), 400
        
        if data['tournament_type'] not in [4, 8]:
            return jsonify({'error': 'Tournament type must be 4 or 8'}), 400
        
        # Create tournament
        tournament = BagsTournament(
            name=data['name'],
            tournament_type=data['tournament_type'],
            players=data.get('players', []),
            creator_id=user_id,
            status='setup'
        )
        
        db.session.add(tournament)
        db.session.commit()
        
        return jsonify({
            'message': 'Tournament created successfully',
            'tournament': tournament.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/tournaments/<tournament_id>', methods=['PUT'])
@jwt_required()
def update_tournament(tournament_id):
    """Update tournament (add players, update bracket, etc.)"""
    try:
        user_id = get_jwt_identity()
        tournament = BagsTournament.query.get(tournament_id)
        
        if not tournament:
            return jsonify({'error': 'Tournament not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields based on status
        if tournament.status == 'setup':
            if 'players' in data:
                tournament.players = data['players']
            if 'name' in data:
                tournament.name = data['name']
        
        # Start tournament
        if data.get('action') == 'start':
            if len(tournament.players) != tournament.tournament_type:
                return jsonify({'error': f'Need exactly {tournament.tournament_type} players'}), 400
            
            tournament.status = 'in_progress'
            tournament.started_at = datetime.utcnow()
            tournament.bracket = data.get('bracket', [])
        
        # Update bracket (for ongoing games)
        if data.get('action') == 'update_bracket':
            tournament.bracket = data['bracket']
            tournament.current_round = data.get('current_round', tournament.current_round)
        
        # Complete tournament
        if data.get('action') == 'complete':
            tournament.status = 'completed'
            tournament.completed_at = datetime.utcnow()
            tournament.champion_id = data.get('champion_id')
            tournament.champion_name = data.get('champion_name')
            
            # Update tournament wins for champion
            if tournament.champion_id and tournament.champion_id.startswith('user_'):
                user = User.query.get(tournament.champion_id.replace('user_', ''))
                if user:
                    user.bags_tournament_wins += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tournament updated successfully',
            'tournament': tournament.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/stats/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Get bags leaderboard"""
    try:
        # Get all users with bags stats
        users = User.query.filter(
            db.or_(User.bags_wins > 0, User.bags_losses > 0)
        ).all()
        
        # Calculate stats and sort
        leaderboard = []
        for user in users:
            total_games = user.bags_wins + user.bags_losses
            win_rate = user.get_bags_win_rate()
            
            leaderboard.append({
                'id': user.id,
                'name': user.get_display_name(),
                'wins': user.bags_wins,
                'losses': user.bags_losses,
                'games_played': total_games,
                'win_rate': win_rate,
                'tournament_wins': user.bags_tournament_wins,
                'avatar_url': user.avatar_url or user.google_picture_url
            })
        
        # Sort by wins, then win rate
        leaderboard.sort(key=lambda x: (x['wins'], x['win_rate']), reverse=True)
        
        return jsonify({
            'leaderboard': leaderboard[:50]  # Top 50 players
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/stats/player/<player_id>', methods=['GET'])
@jwt_required()
def get_player_stats(player_id):
    """Get detailed stats for a specific player"""
    try:
        user = User.query.get(player_id)
        if not user:
            return jsonify({'error': 'Player not found'}), 404
        
        # Get recent games
        # This would need a more complex query to search JSON fields
        # For now, return basic stats
        
        stats = {
            'player': {
                'id': user.id,
                'name': user.get_display_name(),
                'avatar_url': user.avatar_url or user.google_picture_url
            },
            'stats': {
                'wins': user.bags_wins,
                'losses': user.bags_losses,
                'games_played': user.bags_wins + user.bags_losses,
                'win_rate': user.get_bags_win_rate(),
                'tournament_wins': user.bags_tournament_wins
            },
            'recent_games': [],  # Would populate with actual games
            'achievements': []  # Could add achievement system
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bags_bp.route('/waitlist', methods=['GET'])
@jwt_required()
def get_waitlist():
    """Get current waitlist (stored in memory/cache in production)"""
    # In production, this would use Redis or similar
    # For now, return empty list
    return jsonify({
        'waitlist': []
    }), 200

@bags_bp.route('/waitlist', methods=['POST'])
@jwt_required()
def join_waitlist():
    """Join the waitlist"""
    # In production, this would use Redis or similar
    # For now, just return success
    return jsonify({
        'message': 'Added to waitlist',
        'position': 1
    }), 200