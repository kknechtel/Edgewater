from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    display_name = db.Column(db.String(100))  # For display in app

    # Admin and role fields
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)

    # Profile fields
    avatar_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    favorite_band = db.Column(db.String(100))
    beach_member_since = db.Column(db.Date)

    # Stats tracking
    bags_wins = db.Column(db.Integer, default=0)
    bags_losses = db.Column(db.Integer, default=0)
    bags_tournament_wins = db.Column(db.Integer, default=0)
    events_created = db.Column(db.Integer, default=0)
    sasquatch_sightings = db.Column(db.Integer, default=0)

    # Notification preferences
    notify_events = db.Column(db.Boolean, default=True)
    notify_bags_games = db.Column(db.Boolean, default=True)
    notify_messages = db.Column(db.Boolean, default=True)

    # Google OAuth fields (existing)
    google_id = db.Column(db.String(100), unique=True)
    google_picture_url = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_login = db.Column(db.DateTime)

    # Relationships
    events = db.relationship(
        "Event", backref="creator", lazy=True, cascade="all, delete-orphan"
    )
    rsvps = db.relationship(
        "RSVP", backref="user", lazy="dynamic", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_display_name(self):
        """Return display name or construct from first/last name"""
        if self.display_name:
            return self.display_name
        elif self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.email.split("@")[0]

    def update_bags_stats(self, won, tournament_win=False):
        """Update bags game statistics"""
        if won:
            self.bags_wins += 1
        else:
            self.bags_losses += 1

        if tournament_win:
            self.bags_tournament_wins += 1

        db.session.commit()

    def get_bags_win_rate(self):
        """Calculate win rate percentage"""
        total_games = self.bags_wins + self.bags_losses
        if total_games == 0:
            return 0
        return round((self.bags_wins / total_games) * 100, 1)

    def to_dict(self, include_stats=False):
        data = {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "display_name": self.get_display_name(),
            "is_admin": self.is_admin,
            "is_active": self.is_active,
            "avatar_url": self.avatar_url or self.google_picture_url,
            "bio": self.bio,
            "favorite_band": self.favorite_band,
            "beach_member_since": (
                self.beach_member_since.isoformat() if self.beach_member_since else None
            ),
            "created_at": self.created_at.isoformat(),
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }

        if include_stats:
            data.update(
                {
                    "bags_wins": self.bags_wins,
                    "bags_losses": self.bags_losses,
                    "bags_win_rate": self.get_bags_win_rate(),
                    "bags_tournament_wins": self.bags_tournament_wins,
                    "events_created": len(self.events),
                    "sasquatch_sightings": self.sasquatch_sightings,
                }
            )

        return data


# Add a new model for Bags Game History
class BagsGame(db.Model):
    __tablename__ = "bags_games"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Teams (stored as JSON arrays of player IDs)
    team1_players = db.Column(
        db.JSON, nullable=False
    )  # [{'id': 'user_id', 'name': 'Player Name'}]
    team2_players = db.Column(db.JSON, nullable=False)

    # Scores
    team1_score = db.Column(db.Integer, nullable=False)
    team2_score = db.Column(db.Integer, nullable=False)
    winning_team = db.Column(db.Integer)  # 1 or 2

    # Game metadata
    game_type = db.Column(db.String(20), default="casual")  # 'casual', 'tournament'
    tournament_id = db.Column(db.String(36))
    tournament_round = db.Column(db.Integer)

    # Timestamps
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    duration_minutes = db.Column(db.Integer)

    # Location
    location = db.Column(db.String(100), default="Beach Club")

    def calculate_duration(self):
        if self.ended_at and self.started_at:
            delta = self.ended_at - self.started_at
            self.duration_minutes = int(delta.total_seconds() / 60)

    def to_dict(self):
        return {
            "id": self.id,
            "team1_players": self.team1_players,
            "team2_players": self.team2_players,
            "team1_score": self.team1_score,
            "team2_score": self.team2_score,
            "winning_team": self.winning_team,
            "game_type": self.game_type,
            "tournament_id": self.tournament_id,
            "tournament_round": self.tournament_round,
            "started_at": self.started_at.isoformat(),
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "duration_minutes": self.duration_minutes,
            "location": self.location,
        }


# Add a new model for Tournaments
class BagsTournament(db.Model):
    __tablename__ = "bags_tournaments"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    tournament_type = db.Column(db.Integer, nullable=False)  # 4 or 8 players

    # Players and bracket stored as JSON
    players = db.Column(
        db.JSON, nullable=False
    )  # [{'id': 'user_id', 'name': 'Player Name'}]
    bracket = db.Column(db.JSON)  # Tournament bracket structure

    # Winner
    champion_id = db.Column(db.String(36))
    champion_name = db.Column(db.String(100))

    # Status
    status = db.Column(
        db.String(20), default="setup"
    )  # 'setup', 'in_progress', 'completed'
    current_round = db.Column(db.Integer, default=0)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

    # Created by
    creator_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tournament_type": self.tournament_type,
            "players": self.players,
            "bracket": self.bracket,
            "champion_id": self.champion_id,
            "champion_name": self.champion_name,
            "status": self.status,
            "current_round": self.current_round,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "creator_id": self.creator_id,
        }


# Original Event model
class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    created_by_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    event_type = db.Column(
        db.String(50), nullable=False, default="general"
    )  # Added event_type

    # Relationship to RSVPs
    rsvps = db.relationship(
        "RSVP", backref="event", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat(),
            "location": self.location,
            "created_by_id": self.created_by_id,
            "created_at": self.created_at.isoformat(),
            "event_type": self.event_type,  # Added event_type
            "rsvp_count": self.rsvps.filter_by(status="going").count(),  # Added RSVP count
        }


class RSVP(db.Model):
    __tablename__ = "rsvps"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    event_id = db.Column(db.String(36), db.ForeignKey("events.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="interested")  # e.g., "going", "not_going", "interested"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (db.UniqueConstraint("user_id", "event_id", name="uq_user_event_rsvp"),)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_id": self.event_id,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
