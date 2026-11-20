"""
SQLAlchemy Database Models for SalaryAI
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database import db

class User(db.Model):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default="user") # 'super_admin', 'admin', 'user'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }

class PredictionLog(db.Model):
    __tablename__ = "prediction_logs"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    candidate_role = db.Column(db.String(80), nullable=False)
    experience_years = db.Column(db.Float, nullable=False)
    skill_rank = db.Column(db.Integer, nullable=False)
    education_level = db.Column(db.String(50), nullable=False)
    workloads_count = db.Column(db.Integer, default=0)
    location_tier = db.Column(db.String(80), nullable=False)
    company_tier = db.Column(db.String(80), nullable=False)
    predicted_ctc = db.Column(db.Integer, nullable=False)
    percentile_rank = db.Column(db.String(30), nullable=False) # e.g. "Top 6.1%"
    model_used = db.Column(db.String(80), nullable=False)
    verification_tag = db.Column(db.String(40), default="Algorithmic Estimate") # "Verified Offer", "Algorithmic Estimate", "Peer Benchmark"

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "candidate_role": self.candidate_role,
            "experience_years": self.experience_years,
            "skill_rank": self.skill_rank,
            "education_level": self.education_level,
            "workloads_count": self.workloads_count,
            "location_tier": self.location_tier,
            "company_tier": self.company_tier,
            "predicted_ctc": self.predicted_ctc,
            "percentile_rank": self.percentile_rank,
            "model_used": self.model_used,
            "verification_tag": self.verification_tag
        }

class SavedProfile(db.Model):
    __tablename__ = "saved_profiles"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    title = db.Column(db.String(120), nullable=False)
    candidate_role = db.Column(db.String(80), nullable=False)
    experience_years = db.Column(db.Float, nullable=False)
    skill_rank = db.Column(db.Integer, nullable=False)
    education_level = db.Column(db.String(50), nullable=False)
    workloads_count = db.Column(db.Integer, default=0)
    location_tier = db.Column(db.String(80), nullable=False)
    company_tier = db.Column(db.String(80), nullable=False)
    predicted_ctc = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "candidate_role": self.candidate_role,
            "experience_years": self.experience_years,
            "skill_rank": self.skill_rank,
            "education_level": self.education_level,
            "workloads_count": self.workloads_count,
            "location_tier": self.location_tier,
            "company_tier": self.company_tier,
            "predicted_ctc": self.predicted_ctc,
            "notes": self.notes,
            "created_at": self.created_at.isoformat()
        }
