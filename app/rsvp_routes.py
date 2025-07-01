from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import User, Event, RSVP
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

rsvp_bp = Blueprint("rsvp_bp", __name__, url_prefix="/api/events/<event_id>/rsvps")

@rsvp_bp.route("", methods=["POST"])
@jwt_required()
def create_or_update_rsvp(event_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    status = data.get("status")

    if not status or status not in ["going", "not_going", "interested"]:
        return jsonify({"message": "Invalid RSVP status provided."}), 400

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found."}), 404

    rsvp = RSVP.query.filter_by(user_id=current_user_id, event_id=event_id).first()

    if rsvp:
        # Update existing RSVP
        rsvp.status = status
        rsvp.updated_at = datetime.utcnow()
        message = "RSVP updated successfully."
    else:
        # Create new RSVP
        rsvp = RSVP(
            user_id=current_user_id,
            event_id=event_id,
            status=status,
        )
        db.session.add(rsvp)
        message = "RSVP created successfully."

    db.session.commit()
    return jsonify({"message": message, "rsvp": rsvp.to_dict()}), 200 if rsvp else 201

@rsvp_bp.route("", methods=["GET"])
def get_rsvps_for_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found."}), 404

    rsvps = RSVP.query.filter_by(event_id=event_id).all()
    return jsonify({"rsvps": [r.to_dict() for r in rsvps]}), 200

# It might be better to have a separate endpoint for user-specific RSVPs not nested under event_id
# For now, let's add it to a different blueprint or adjust the plan.
# According to the plan: GET /api/users/<user_id>/rsvps
# This will be handled separately when modifying app/auth_routes.py or a new user_routes.py.
