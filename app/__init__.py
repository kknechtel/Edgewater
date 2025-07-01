from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            }
        },
    )

    from app.routes import main
    from app.auth_routes import auth_bp
    from app.bags_routes import bags_bp
    from app.rsvp_routes import rsvp_bp # Import the new blueprint

    app.register_blueprint(main)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(bags_bp, url_prefix="/api/bags")
    app.register_blueprint(rsvp_bp) # Register the new blueprint

    return app
