# SalaryAI — Tech Compensation & Leveling Engine 💼🤖

A unified, full-stack **Machine Learning Tech Compensation Benchmarking Platform** featuring a **Public Website (`/`)** and an **Admin Control Panel (`/admin`)** running simultaneously in a single React application connected to a shared **Python Flask + Scikit-Learn + SQLite** backend.

---

## 🌟 Architecture & Monorepo Overview

- **Frontend (`/client`):** React 19 + Vite + Tailwind CSS v4 + React Router + Lucide-React icons + Recharts on `http://localhost:5173`.
- **Backend (`/server`):** Python 3 + Flask + Flask-CORS + Scikit-Learn + Pandas + NumPy + SQLAlchemy + PyJWT on `http://localhost:5000`.
- **Root Setup:** Monorepo configured via root `package.json` with `concurrently` for one-command startup (`npm run dev`).
- **ML Pipeline & Seed Data (`/server/ml`):**
  - Synthesizes and maintains `2,540` realistic benchmark records across Tier 1, Tier 2, and Remote cohorts.
  - Automatically trains and serializes 3 production regression models:
    - `Random Forest Regressor v4.2.0` ($R^2 \approx 0.942$, MAE = ₹1.41L) — *Default Active Live Model*
    - `Gradient Boosting Regressor v4.1` ($R^2 \approx 0.938$, MAE = ₹1.52L)
    - `Multi-variable Ridge Regression v3.8` ($R^2 \approx 0.955$, MAE = ₹1.36L)
  - Live prediction computes 90% confidence intervals (`min_ctc`, `max_ctc`), Base/Bonus/Equity breakdown, SHAP feature weights, bell-curve market distribution, and exact percentile rank (`Top 6.1%`).

---

## 🔒 Strict One-Way Navigation Rule

1. **Public Website (`/`):** Has **ZERO links, buttons, or references** to `/admin`.
2. **Admin Control Panel (`/admin`):** The top-right header features a solid black **"View Live Website ↗"** button that opens `/` in a new tab.

---

## 🚀 One-Command Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Start Both Server & Client
```bash
npm run dev
```
Or on Windows:
```bash
run.bat
```

- **Public Website:** [http://localhost:5173](http://localhost:5173)
- **Admin Control Panel:** [http://localhost:5173/admin](http://localhost:5173/admin)
- **Backend REST API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo & Admin Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@salaryai.in` | `Admin@123` | Full Admin Control Panel (`/admin`) |
| **Demo Candidate** | `candidate@salaryai.in` | `Demo@123` | Public Website Saved Profiles |

---

## 🧪 Automated Testing

```bash
python test_e2e.py
```
Verifies:
- Live ML inference and confidence intervals
- Automatic streaming of public predictions to the Admin Prediction Stream
- Real-time model activation switching (`Activate Model` button)
- Super Admin authentication & JWT validation
- Benchmarks filtering & dataset pagination
