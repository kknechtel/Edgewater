from google.oauth2 import id_token
from google.auth.transport import requests
from flask import current_app


def verify_google_token(token):
    """Verify Google OAuth token and return user info"""
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), current_app.config["GOOGLE_CLIENT_ID"]
        )

        # Extract user information
        return {
            "sub": idinfo["sub"],  # Keep as 'sub' to match auth_routes.py
            "email": idinfo["email"],
            "name": idinfo.get("name", ""),
            "picture": idinfo.get("picture", ""),
            "given_name": idinfo.get("given_name", ""),
            "family_name": idinfo.get("family_name", ""),
        }
    except ValueError:
        # Invalid token
        return None
