"""
Dataset Generator for SalaryAI - 2,540 Realistic Tech Compensation Benchmark Records
"""
import os
import numpy as np
import pandas as pd

ROLES = [
    "ML / AI Engineer",
    "Senior Backend Engineer",
    "Lead Product Designer",
    "Full Stack Engineer",
    "Engineering Manager",
    "SDE-1",
    "SDE-2"
]

ROLE_BASE_MULTIPLIER = {
    "SDE-1": 0.85,
    "Full Stack Engineer": 1.0,
    "Senior Backend Engineer": 1.25,
    "SDE-2": 1.2,
    "Lead Product Designer": 1.18,
    "ML / AI Engineer": 1.35,
    "Engineering Manager": 1.45
}

LOCATION_TIERS = [
    "Tier 1 Metro (BLR/MUM/NCR)",
    "Tier 2 Metro (HYD/PUN)",
    "Remote"
]

LOCATION_MULTIPLIER = {
    "Tier 1 Metro (BLR/MUM/NCR)": 1.15,
    "Tier 2 Metro (HYD/PUN)": 1.0,
    "Remote": 1.05
}

COMPANY_TIERS = [
    "Early Startup",
    "Growth Mid-Market ($50M-$250M ARR)",
    "FAANG / Tier-1 MNC"
]

COMPANY_MULTIPLIER = {
    "Early Startup": 0.90,
    "Growth Mid-Market ($50M-$250M ARR)": 1.15,
    "FAANG / Tier-1 MNC": 1.45
}

EDUCATION_LEVELS = [
    "Bachelor's",
    "Master's",
    "PhD / D.Sc"
]

EDUCATION_MULTIPLIER = {
    "Bachelor's": 1.0,
    "Master's": 1.12,
    "PhD / D.Sc": 1.28
}

def generate_benchmark_dataset(num_records=2540, output_path=None, seed=42):
    np.random.seed(seed)
    
    # 1. Experience (0 - 25 years with slight right skew)
    exp = np.random.gamma(shape=2.5, scale=3.0, size=num_records)
    exp = np.clip(exp, 0.0, 25.0)
    exp = np.round(exp, 1)

    # 2. Skill/System Algorithmic Rank (0 - 100 correlated with experience)
    base_skill = 40 + (exp / 25.0) * 45 + np.random.normal(0, 8, num_records)
    skill_score = np.clip(np.round(base_skill), 10, 100).astype(int)

    # 3. Roles assignment
    roles = []
    for e, s in zip(exp, skill_score):
        if e < 3.0:
            assigned_role = np.random.choice(["SDE-1", "Full Stack Engineer", "ML / AI Engineer"], p=[0.6, 0.3, 0.1])
        elif e < 6.0:
            assigned_role = np.random.choice(["SDE-2", "Full Stack Engineer", "ML / AI Engineer", "Lead Product Designer"], p=[0.45, 0.25, 0.2, 0.1])
        elif e < 11.0:
            assigned_role = np.random.choice(["Senior Backend Engineer", "ML / AI Engineer", "Lead Product Designer", "Engineering Manager"], p=[0.4, 0.35, 0.15, 0.1])
        else:
            assigned_role = np.random.choice(["Engineering Manager", "ML / AI Engineer", "Senior Backend Engineer", "Lead Product Designer"], p=[0.45, 0.3, 0.15, 0.1])
        roles.append(assigned_role)
    roles = np.array(roles)

    # 4. Locations & Company Tiers
    locations = np.random.choice(LOCATION_TIERS, size=num_records, p=[0.58, 0.27, 0.15])
    companies = np.random.choice(COMPANY_TIERS, size=num_records, p=[0.25, 0.45, 0.30])
    
    # 5. Education
    edu_weights = [0.68, 0.26, 0.06]
    educations = np.random.choice(EDUCATION_LEVELS, size=num_records, p=edu_weights)

    # 6. Production AI Workloads (0 to 30)
    # Higher for ML/AI and Senior engineers
    workloads = []
    for r, e in zip(roles, exp):
        base_w = 4 if "ML" in r else 1
        w = int(np.clip(base_w + (e * 0.9) + np.random.poisson(3), 0, 30))
        workloads.append(w)
    workloads = np.array(workloads)

    # 7. Ground Truth CTC Calculation (INR)
    # Base benchmark baseline for fresh grad = ₹8,50,000 to ₹12,00,000
    records = []
    for i in range(num_records):
        r = roles[i]
        e = exp[i]
        s = skill_score[i]
        l = locations[i]
        c = companies[i]
        ed = educations[i]
        w = workloads[i]

        # Base market formula
        # Baseline ₹9.5 LPA
        baseline = 950000.0
        
        # Exponential/Compounding experience curve (approx 12-15% CAGR early on, leveling off)
        exp_factor = 1.0 + (e * 0.11) + (0.003 * (e ** 1.85))
        skill_factor = 0.65 + (s / 100.0) * 0.70
        role_mult = ROLE_BASE_MULTIPLIER[r]
        loc_mult = LOCATION_MULTIPLIER[l]
        comp_mult = COMPANY_MULTIPLIER[c]
        edu_mult = EDUCATION_MULTIPLIER[ed]
        workload_mult = 1.0 + min(w * 0.012, 0.30)

        # Total expected compensation
        raw_ctc = baseline * exp_factor * skill_factor * role_mult * loc_mult * comp_mult * edu_mult * workload_mult
        # Add realistic market variance (+- 6%)
        noise = np.random.normal(1.0, 0.045)
        ctc_inr = int(np.round((raw_ctc * noise) / 10000.0) * 10000) # round to nearest 10k
        ctc_inr = max(600000, min(9500000, ctc_inr)) # between 6 LPA and 95 LPA

        # Package Breakdown: Base, Bonus, Equity
        if c == "FAANG / Tier-1 MNC":
            base_ratio = 0.60 if e > 7 else 0.70
            bonus_ratio = 0.15
            equity_ratio = 1.0 - (base_ratio + bonus_ratio)
        elif c == "Early Startup":
            base_ratio = 0.75
            bonus_ratio = 0.08
            equity_ratio = 0.17
        else: # Growth Mid-Market
            base_ratio = 0.70
            bonus_ratio = 0.18
            equity_ratio = 0.12

        base_amt = int(np.round(ctc_inr * base_ratio))
        bonus_amt = int(np.round(ctc_inr * bonus_ratio))
        equity_amt = ctc_inr - (base_amt + bonus_amt)

        records.append({
            "candidate_role": r,
            "experience_years": e,
            "skill_rank": s,
            "education_level": ed,
            "workloads_count": w,
            "location_tier": l,
            "company_tier": c,
            "ctc_inr": ctc_inr,
            "base_inr": base_amt,
            "bonus_inr": bonus_amt,
            "equity_inr": equity_amt,
            "created_at": "2026-03-15T09:00:00Z"
        })

    df = pd.DataFrame(records)
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"[Dataset] Generated {len(df)} records -> {output_path}")
    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, "data")
    csv_file = os.path.join(data_dir, "salary_dataset.csv")
    generate_benchmark_dataset(2540, csv_file)
