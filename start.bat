@echo off
title FarmDirect Hub Server
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "%~dp0"
echo ==========================================
echo Starting FarmDirect Hub (Backend + Frontend)
echo ==========================================
npm run dev
pause
