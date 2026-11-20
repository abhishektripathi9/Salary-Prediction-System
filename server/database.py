"""
Database Configuration for SalaryAI
"""
import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(CURRENT_DIR, "salaryai.db")

def init_db(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "salaryai_secret_jwt_and_session_key_2026_x871"
    db.init_app(app)
    with app.app_context():
        db.create_all()
