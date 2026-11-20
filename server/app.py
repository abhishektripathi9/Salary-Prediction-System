"""
SalaryAI — Tech Compensation & Leveling Engine Backend
Flask API server running on PORT 5000
"""

import os
import sys
import json
import csv
import io
from datetime import datetime, date, timedelta, timezone
import jwt
from functools import wraps

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import pandas as pd
import numpy as np

# Ensure server and ml directories are on sys.path
SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)
ML_DIR = os.path.join(SERVER_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from database import db, init_db
from models import User, PredictionLog, SavedProfile
from seed import seed_database
from ml.predictor import predictor
from ml.train import train_all_models, DATASET_PATH, METADATA_PATH

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize Database & run Seed
init_db(app)
seed_database(app)

JWT_SECRET = "salaryai_production_jwt_secret_2026_super_key_8849"
JWT_ALGORITHM = "HS256"

def generate_jwt(user):
    payload = {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = User.query.get(payload["user_id"])
            if not current_user:
                return jsonify({"error": "User no longer exists"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = User.query.get(payload["user_id"])
            if not current_user or current_user.role not in ["admin", "super_admin"]:
                return jsonify({"error": "Admin access required"}), 403
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ==========================================
# PUBLIC & ML ENDPOINTS
# ==========================================

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "SalaryAI Backend Engine",
        "version": "v4.2.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@app.route("/api/ml/metadata", methods=["GET"])
@app.route("/api/metadata", methods=["GET"])
def get_metadata():
    """Returns active model details, R2 score, available models, bell curve data, and feature importance."""
    meta = predictor.metadata
    if not meta:
        meta = train_all_models()
    return jsonify(meta)

@app.route("/api/predict", methods=["POST"])
def run_prediction():
    """Live ML compensation inference with confidence intervals, breakdown & automatic log saving."""
    data = request.get_json() or {}

    role = data.get("candidate_role", "ML / AI Engineer")
    exp = float(data.get("experience_years", 10.5))
    skill = float(data.get("skill_rank", 88))
    edu = data.get("education_level", "Bachelor's")
    workloads = int(data.get("workloads_count", 14))
    location = data.get("location_tier", "Tier 1 Metro (BLR/MUM/NCR)")
    company = data.get("company_tier", "Growth Mid-Market ($50M-$250M ARR)")
    model_override = data.get("model_override", None)

    # Perform inference
    result = predictor.predict(
        candidate_role=role,
        experience_years=exp,
        skill_rank=skill,
        education_level=edu,
        workloads_count=workloads,
        location_tier=location,
        company_tier=company,
        model_override=model_override
    )

    # Automatically persist to PredictionLog table so Admin Prediction Stream updates live
    try:
        new_log = PredictionLog(
            timestamp=datetime.now(timezone.utc),
            candidate_role=role,
            experience_years=exp,
            skill_rank=int(skill),
            education_level=edu,
            workloads_count=workloads,
            location_tier=location,
            company_tier=company,
            predicted_ctc=result["predicted_ctc"],
            percentile_rank=result["market_position"]["percentile_label"],
            model_used=result["model_used"]["name"],
            verification_tag="Algorithmic Estimate"
        )
        db.session.add(new_log)
        db.session.commit()
        result["log_id"] = new_log.id
    except Exception as e:
        db.session.rollback()
        print(f"Failed to log prediction: {e}")

    return jsonify(result)

@app.route("/api/benchmarks", methods=["GET"])
def get_benchmarks():
    """Filterable verified salary bands from dataset for public Benchmarks page."""
    role = request.args.get("role")
    location = request.args.get("location")
    company = request.args.get("company")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    search = request.args.get("search", "").lower()

    if predictor.df is None or predictor.df.empty:
        predictor.reload()
    
    df = predictor.df.copy()

    if search:
        df = df[df["candidate_role"].str.lower().str.contains(search) | 
                df["company_tier"].str.lower().str.contains(search) |
                df["location_tier"].str.lower().str.contains(search)]

    if role and role != "All Roles":
        df = df[df["candidate_role"] == role]
    if location and location != "All Locations":
        df = df[df["location_tier"] == location]
    if company and company != "All Tiers":
        df = df[df["company_tier"] == company]

    total = len(df)
    start = (page - 1) * limit
    records = df.iloc[start:start + limit].to_dict(orient="records")

    return jsonify({
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, int(np.ceil(total / limit))),
        "records": records
    })

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_jwt(user)
    return jsonify({
        "token": token,
        "user": user.to_dict()
    })

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "")

    if not email or not password or not full_name:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already registered"}), 400

    new_user = User(
        email=email,
        full_name=full_name,
        role="user"
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    token = generate_jwt(new_user)
    return jsonify({
        "token": token,
        "user": new_user.to_dict()
    }), 201

@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    return jsonify({"user": current_user.to_dict()})

# ==========================================
# SAVED CANDIDATE PROFILES
# ==========================================

@app.route("/api/saved-profiles", methods=["GET"])
def get_saved_profiles():
    # If token present, filter by user; otherwise return demo/public list
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            payload = jwt.decode(auth_header.split(" ")[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("user_id")
        except Exception:
            pass

    query = SavedProfile.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    profiles = query.order_by(SavedProfile.created_at.desc()).all()
    return jsonify([p.to_dict() for p in profiles])

@app.route("/api/saved-profiles", methods=["POST"])
def save_profile():
    data = request.get_json() or {}
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            payload = jwt.decode(auth_header.split(" ")[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("user_id")
        except Exception:
            pass

    profile = SavedProfile(
        user_id=user_id,
        title=data.get("title", f"{data.get('candidate_role', 'Engineer')} Profile"),
        candidate_role=data.get("candidate_role", "ML / AI Engineer"),
        experience_years=float(data.get("experience_years", 5.0)),
        skill_rank=int(data.get("skill_rank", 80)),
        education_level=data.get("education_level", "Bachelor's"),
        workloads_count=int(data.get("workloads_count", 5)),
        location_tier=data.get("location_tier", "Tier 1 Metro (BLR/MUM/NCR)"),
        company_tier=data.get("company_tier", "Growth Mid-Market ($50M-$250M ARR)"),
        predicted_ctc=int(data.get("predicted_ctc", 3500000)),
        notes=data.get("notes", "")
    )
    db.session.add(profile)
    db.session.commit()
    return jsonify(profile.to_dict()), 201

@app.route("/api/saved-profiles/<int:profile_id>", methods=["DELETE"])
def delete_saved_profile(profile_id):
    profile = SavedProfile.query.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    db.session.delete(profile)
    db.session.commit()
    return jsonify({"success": True, "message": "Profile deleted"})

# ==========================================
# ADMIN CONTROL PANEL ENDPOINTS
# ==========================================

@app.route("/api/admin/kpis", methods=["GET"])
def get_admin_kpis():
    """Returns top 4 KPI cards for Admin Dashboard."""
    meta = predictor.metadata or {}
    active_model = meta.get("active_model_name", "Random Forest Regressor v4.2.0")
    active_r2 = meta.get("active_r2", 0.942)
    benchmark_records = len(predictor.df) if predictor.df is not None else 2540

    # Predictions run today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = PredictionLog.query.filter(PredictionLog.timestamp >= today_start).count()
    if today_count < 10:
        today_count = 348 # canonical default as specified

    # Sparkline data for today's predictions
    sparkline = [18, 25, 42, 68, 92, 140, 210, 280, 312, 348]

    return jsonify({
        "active_model": active_model,
        "active_r2": active_r2,
        "benchmark_records": benchmark_records,
        "predictions_today": today_count,
        "predictions_sparkline": sparkline
    })

@app.route("/api/admin/models", methods=["GET"])
def get_admin_models():
    """Returns all 3 models from registry with R2, MAE, architecture, and live status."""
    meta = predictor.metadata or {}
    models_dict = meta.get("models", {})
    return jsonify(list(models_dict.values()))

@app.route("/api/admin/models/activate", methods=["POST"])
def activate_model():
    """Working button that immediately switches active model used by public website."""
    data = request.get_json() or {}
    model_key = data.get("model_key")
    if not model_key:
        return jsonify({"error": "model_key is required"}), 400

    try:
        predictor.set_active_model(model_key)
        return jsonify({
            "success": True,
            "message": f"Successfully activated {predictor.metadata['active_model_name']}",
            "active_model": {
                "key": model_key,
                "name": predictor.metadata["active_model_name"],
                "short_name": predictor.metadata["active_model_short"],
                "r2_score": predictor.metadata["active_r2"]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/admin/models/retrain", methods=["POST"])
def retrain_models():
    """Retrains all 3 models on the current dataset."""
    try:
        updated_meta = train_all_models(force_regenerate=False)
        predictor.reload()
        return jsonify({
            "success": True,
            "message": "All 3 models retrained and serialized successfully",
            "metadata": updated_meta
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/logs", methods=["GET"])
def get_admin_prediction_logs():
    """Real-time log of predictions run on public website with search, tier filter, and pagination."""
    search = request.args.get("search", "").strip().lower()
    tier = request.args.get("tier", "All")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 15))

    query = PredictionLog.query

    if search:
        query = query.filter(
            (PredictionLog.candidate_role.ilike(f"%{search}%")) |
            (PredictionLog.model_used.ilike(f"%{search}%")) |
            (PredictionLog.location_tier.ilike(f"%{search}%"))
        )
    if tier and tier != "All":
        query = query.filter(PredictionLog.location_tier.ilike(f"%{tier}%"))

    total = query.count()
    logs = query.order_by(PredictionLog.timestamp.desc()).offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, int(np.ceil(total / limit))),
        "logs": [l.to_dict() for l in logs]
    })

@app.route("/api/admin/logs/export", methods=["GET"])
def export_prediction_logs():
    """Export prediction logs as downloadable CSV."""
    logs = PredictionLog.query.order_by(PredictionLog.timestamp.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Timestamp", "Candidate Role", "Experience (Years)", "Skill Rank",
        "Education", "AI Workloads", "Location Tier", "Company Tier",
        "Predicted Annual CTC (INR)", "Percentile Rank", "Model Used", "Verification"
    ])

    for l in logs:
        writer.writerow([
            l.id, l.timestamp.isoformat(), l.candidate_role, l.experience_years,
            l.skill_rank, l.education_level, l.workloads_count, l.location_tier,
            l.company_tier, l.predicted_ctc, l.percentile_rank, l.model_used, l.verification_tag
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=salaryai_prediction_logs.csv"}
    )

@app.route("/api/admin/dataset", methods=["GET"])
def get_dataset_records():
    """Paginated view of benchmark records for Dataset Manager."""
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    search = request.args.get("search", "").lower()

    if predictor.df is None or predictor.df.empty:
        predictor.reload()
    
    df = predictor.df.copy()
    if search:
        df = df[df["candidate_role"].str.lower().str.contains(search) | 
                df["company_tier"].str.lower().str.contains(search) |
                df["location_tier"].str.lower().str.contains(search)]

    total = len(df)
    start = (page - 1) * limit
    records = df.iloc[start:start + limit].to_dict(orient="records")

    return jsonify({
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, int(np.ceil(total / limit))),
        "records": records
    })

@app.route("/api/admin/dataset", methods=["POST"])
def add_dataset_record():
    """Add a new salary benchmark record to dataset and CSV."""
    data = request.get_json() or {}
    try:
        new_row = {
            "candidate_role": data.get("candidate_role", "ML / AI Engineer"),
            "experience_years": float(data.get("experience_years", 5.0)),
            "skill_rank": int(data.get("skill_rank", 80)),
            "education_level": data.get("education_level", "Bachelor's"),
            "workloads_count": int(data.get("workloads_count", 5)),
            "location_tier": data.get("location_tier", "Tier 1 Metro (BLR/MUM/NCR)"),
            "company_tier": data.get("company_tier", "Growth Mid-Market ($50M-$250M ARR)"),
            "ctc_inr": int(data.get("ctc_inr", 3500000)),
            "base_inr": int(data.get("base_inr", 2450000)),
            "bonus_inr": int(data.get("bonus_inr", 630000)),
            "equity_inr": int(data.get("equity_inr", 420000)),
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        df = pd.read_csv(DATASET_PATH)
        df = pd.concat([pd.DataFrame([new_row]), df], ignore_index=True)
        df.to_csv(DATASET_PATH, index=False)
        predictor.reload()

        return jsonify({"success": True, "record": new_row}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/admin/dataset/upload-csv", methods=["POST"])
def upload_csv_dataset():
    """Upload CSV to append/replace benchmark records."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are allowed"}), 400

    try:
        uploaded_df = pd.read_csv(file)
        # Ensure required columns exist
        required_cols = ["candidate_role", "experience_years", "skill_rank", "education_level", "location_tier", "company_tier", "ctc_inr"]
        for col in required_cols:
            if col not in uploaded_df.columns:
                return jsonify({"error": f"Missing required column in CSV: {col}"}), 400

        # Merge with existing
        existing_df = pd.read_csv(DATASET_PATH)
        combined_df = pd.concat([uploaded_df, existing_df], ignore_index=True).drop_duplicates()
        combined_df.to_csv(DATASET_PATH, index=False)

        # Trigger quick retrain
        train_all_models(force_regenerate=False)
        predictor.reload()

        return jsonify({
            "success": True,
            "message": f"Successfully ingested {len(uploaded_df)} records. Dataset now contains {len(combined_df)} records.",
            "total_records": len(combined_df)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("==================================================================")
    print("    SalaryAI — Tech Compensation & Leveling Engine Backend        ")
    print("    Running on http://127.0.0.1:5000                              ")
    print("==================================================================")
    app.run(host="0.0.0.0", port=5000, debug=False)
