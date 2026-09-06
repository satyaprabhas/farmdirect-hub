@echo off
title FarmDirect Hub Server + Tunnel
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\cloudflared;%PATH%"
cd /d "%~dp0"
echo ==========================================
echo Starting FarmDirect Hub + Cloudflare Tunnel
echo ==========================================
start "Cloudflare Tunnel" "%LOCALAPPDATA%\Programs\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173
npm run dev
pause
