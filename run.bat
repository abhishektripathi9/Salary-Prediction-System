@echo off
title SalaryAI — Tech Compensation & Leveling Engine
echo ====================================================================
echo     SalaryAI — Tech Compensation & Leveling Engine (v4.2.0)
echo     Unified Monorepo: Public Website (5173) & Admin Panel (5173/admin)
echo     Backend REST API & ML Inference Engine (5000)
echo ====================================================================
echo.

if not exist "server\ml\data\saved_models\models_metadata.json" (
    echo [1/3] Training 3 ML Models on 2,540 benchmark profiles...
    python server\ml\train.py
    echo.
) else (
    echo [1/3] Pre-trained models found in server\ml\data\saved_models\
)

if not exist "server\salaryai.db" (
    echo [2/3] Seeding SQLite Database with Super Admin and logs...
    python server\seed.py
    echo.
) else (
    echo [2/3] SQLite database found.
)

echo [3/3] Launching Full-Stack Platform with npm run dev...
echo Opening browser at http://localhost:5173 ...
start http://localhost:5173
npm run dev
pause
