@echo off
chcp 65001 >nul
title Yenepoya ICCAQI 2026 - Website Launcher
cls
color 0A

echo =====================================================================
echo       YENEPOYA UNIVERSITY - SCHOOL OF ENGINEERING ^& TECHNOLOGY
echo             ICCAQI 2026 INTERNATIONAL CONFERENCE
echo                   OFFICIAL WEBSITE LAUNCHER
echo =====================================================================
echo.

:: Check if port 3000 is already active
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo [*] Website server is already running on http://localhost:3000
    echo [*] Opening your browser now...
    start http://localhost:3000
    goto :done
)

echo [*] Starting Next.js Development Server...
echo [*] Please wait a moment while the portal starts up...
echo.

:: Launch the development server in a separate background window
start "Yenepoya ICCAQI 2026 Server" /min cmd /c "npm run dev"

:: Wait for server to become responsive
echo [*] Initializing server on http://localhost:3000...
timeout /t 3 /nobreak >nul

echo [*] Opening the website in your default browser...
start http://localhost:3000

:done
echo.
echo =====================================================================
echo   The website is launched!
echo   When the browser opens, click the "Launch Website" button to unveil
echo   the conference website with the celebratory animation!
echo =====================================================================
echo.
echo Press any key to exit this launcher window...
pause >nul
