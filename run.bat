@echo off
cd /d "%~dp0"
title SalaryAI — Tech Compensation ^& Leveling Engine
color 0b

echo ====================================================================
echo     SalaryAI - Tech Compensation and Leveling Engine (v4.2.0)
echo     Unified Monorepo: Public Website (5173) and Admin Panel (/admin)
echo     Backend REST API and ML Inference Engine (Port 5000)
echo ====================================================================
echo.

if not exist "server\ml\data\saved_models\models_metadata.json" (
    echo [1/3] Training 3 ML Models on 2,540 benchmark profiles...
    python server\ml\train.py
    echo.
) else (
    echo [1/3] Pre-trained models verified.
)

if not exist "server\salaryai.db" (
    echo [2/3] Seeding SQLite Database with Super Admin and logs...
    python server\seed.py
    echo.
) else (
    echo [2/3] SQLite database verified.
)

echo.
echo [3/3] Starting Full-Stack Server...
echo  - Public Website:      http://localhost:5173
echo  - Admin Control Panel: http://localhost:5173/admin
echo  - Backend API:         http://localhost:5000/api/health
echo.
echo Launching your browser now...
start "" "http://localhost:5173"
echo.
npm run dev
pause
