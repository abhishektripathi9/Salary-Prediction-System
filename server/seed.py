"""
Database Seeder for SalaryAI
Seeds:
1. Super Admin: admin@salaryai.in / Admin@123
2. Standard test user: demo@salaryai.in / Demo@123
3. Initial realistic live prediction logs (25-30 records)
"""
import os
import random
from datetime import datetime, timedelta
from flask import Flask
from database import db, init_db
from models import User, PredictionLog, SavedProfile

def seed_database(app):
    with app.app_context():
        db.create_all()

        # 1. Seed Super Admin
        admin_email = "admin@salaryai.in"
        existing_admin = User.query.filter_by(email=admin_email).first()
        if not existing_admin:
            admin = User(
                email=admin_email,
                full_name="Aarav Sharma (Chief People Analytics)",
                role="super_admin"
            )
            admin.set_password("Admin@123")
            db.session.add(admin)
            print(f"[Seed] Created Super Admin: {admin_email} / Admin@123")

        # 2. Seed Demo User
        demo_email = "candidate@salaryai.in"
        existing_demo = User.query.filter_by(email=demo_email).first()
        if not existing_demo:
            demo_user = User(
                email=demo_email,
                full_name="Priya Varma",
                role="user"
            )
            demo_user.set_password("Demo@123")
            db.session.add(demo_user)
            print(f"[Seed] Created Demo User: {demo_email} / Demo@123")

        db.session.commit()

        # 3. Seed Prediction Logs if empty
        if PredictionLog.query.count() < 10:
            sample_roles = [
                ("ML / AI Engineer", 10.5, 88, "Bachelor's", 14, "Tier 1 Metro (BLR/MUM/NCR)", "Growth Mid-Market ($50M-$250M ARR)", 4052000, "Top 6.1%", "Verified Offer"),
                ("Senior Backend Engineer", 7.0, 82, "Bachelor's", 8, "Tier 1 Metro (BLR/MUM/NCR)", "FAANG / Tier-1 MNC", 3620000, "Top 11.4%", "Verified Offer"),
                ("Lead Product Designer", 9.0, 85, "Master's", 5, "Remote", "Growth Mid-Market ($50M-$250M ARR)", 3350000, "Top 15.2%", "Algorithmic Estimate"),
                ("Engineering Manager", 14.0, 92, "Master's", 18, "Tier 1 Metro (BLR/MUM/NCR)", "FAANG / Tier-1 MNC", 6850000, "Top 1.2%", "Verified Offer"),
                ("Full Stack Engineer", 4.5, 74, "Bachelor's", 4, "Tier 2 Metro (HYD/PUN)", "Early Startup", 1850000, "Top 45.0%", "Peer Benchmark"),
                ("SDE-2", 5.0, 80, "Bachelor's", 6, "Tier 1 Metro (BLR/MUM/NCR)", "Growth Mid-Market ($50M-$250M ARR)", 2750000, "Top 26.8%", "Algorithmic Estimate"),
                ("SDE-1", 1.5, 68, "Bachelor's", 2, "Tier 1 Metro (BLR/MUM/NCR)", "Growth Mid-Market ($50M-$250M ARR)", 1420000, "Top 64.2%", "Peer Benchmark"),
                ("ML / AI Engineer", 6.0, 85, "PhD / D.Sc", 12, "Remote", "FAANG / Tier-1 MNC", 4950000, "Top 4.3%", "Verified Offer"),
                ("Senior Backend Engineer", 11.0, 90, "Master's", 16, "Tier 1 Metro (BLR/MUM/NCR)", "Growth Mid-Market ($50M-$250M ARR)", 4420000, "Top 5.2%", "Algorithmic Estimate"),
                ("Engineering Manager", 16.5, 95, "Bachelor's", 22, "Tier 1 Metro (BLR/MUM/NCR)", "FAANG / Tier-1 MNC", 7450000, "Top 0.8%", "Verified Offer")
            ]

            now = datetime.utcnow()
            for i, item in enumerate(sample_roles):
                r, exp, sk, edu, w, loc, comp, ctc, rank, tag = item
                log = PredictionLog(
                    timestamp=now - timedelta(minutes=(i * 18) + random.randint(1, 10)),
                    candidate_role=r,
                    experience_years=exp,
                    skill_rank=sk,
                    education_level=edu,
                    workloads_count=w,
                    location_tier=loc,
                    company_tier=comp,
                    predicted_ctc=ctc,
                    percentile_rank=rank,
                    model_used="Random Forest Regressor v4.2.0",
                    verification_tag=tag
                )
                db.session.add(log)

            # Also seed a sample saved profile
            saved = SavedProfile(
                user_id=1,
                title="Lead AI Engineer - Series B Tech",
                candidate_role="ML / AI Engineer",
                experience_years=10.5,
                skill_rank=88,
                education_level="Bachelor's",
                workloads_count=14,
                location_tier="Tier 1 Metro (BLR/MUM/NCR)",
                company_tier="Growth Mid-Market ($50M-$250M ARR)",
                predicted_ctc=4052000,
                notes="Target offer evaluation for Q2 hiring cycle"
            )
            db.session.add(saved)
            db.session.commit()
            print("[Seed] Seeded initial prediction logs and candidate profile.")

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    seed_database(app)
