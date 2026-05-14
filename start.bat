@echo off
title HEC ERP System
echo ============================================
echo  Holiness Evangelistic Church - ERP System
echo ============================================
echo.
echo Starting backend server...
start "HEC Server" cmd /c "cd /d %~dp0server && node index.js"
timeout /t 3 /nobreak >nul
echo.
echo Starting frontend dev server...
start "HEC Frontend" cmd /c "cd /d %~dp0 && npx vite --host"
timeout /t 2 /nobreak >nul
echo.
echo ============================================
echo  Backend:  http://localhost:3001
echo  Frontend: http://localhost:5173
echo  Health:   http://localhost:3001/api/health
echo ============================================
echo.
pause
