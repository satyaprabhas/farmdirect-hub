@echo off
title Push to GitHub - FarmDirect Hub
set "PATH=C:\Program Files\Git\cmd;%PATH%"
cd /d "%~dp0"
echo ==========================================
echo Pushing FarmDirect Hub to GitHub...
echo Repository: https://github.com/satyaprabhas/farmdirect-hub
echo ==========================================
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ==========================================
    echo SUCCESS! All files are now on GitHub.
    echo Refresh your GitHub page:
    echo https://github.com/satyaprabhas/farmdirect-hub
    echo ==========================================
) else (
    echo.
    echo PUSH FAILED. Please make sure you authorized GitHub in your browser.
)
pause
