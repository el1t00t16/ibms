@echo off
title Deploy IBMS to XAMPP
echo ==========================================================
echo        Deploying IBMS to Local XAMPP Web Server
echo ==========================================================
echo.

set "SOURCE_DIR=%~dp0"
if "%SOURCE_DIR:~-1%"=="\" set "SOURCE_DIR=%SOURCE_DIR:~0,-1%"
set "XAMPP_HTDOCS=C:\xampp\htdocs\ibms"

echo [1/3] Checking XAMPP installation...
if not exist "C:\xampp\htdocs" (
    echo [ERROR] XAMPP htdocs directory not found at C:\xampp\htdocs.
    echo Please make sure XAMPP is installed at C:\xampp.
    pause
    exit /b 1
)

echo [2/3] Creating directory in XAMPP htdocs (%XAMPP_HTDOCS%)...
if not exist "%XAMPP_HTDOCS%" mkdir "%XAMPP_HTDOCS%"

echo [3/3] Syncing project files to XAMPP htdocs...
robocopy "%SOURCE_DIR%" "%XAMPP_HTDOCS%" /E /XF *.gs *.html deploy_to_xampp.bat /XD .git .system_generated
if %ERRORLEVEL% GEQ 8 (
    echo [ERROR] Failed to copy files to XAMPP.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo               DEPLOYMENT SUCCESSFUL!
echo ==========================================================
echo.
echo Next Steps:
echo 1. Open XAMPP Control Panel and start Apache and MySQL.
echo 2. Open your browser and navigate to:
echo    http://localhost/ibms/install.php
echo 3. Click 'Initialize Database Now' (or it will auto-initialize).
echo 4. Access the portal at:
echo    http://localhost/ibms/index.php
echo.
echo Default Admin Credentials:
echo    Username: admin
echo    Password: admin123 (or admin)
echo.
echo ==========================================================
pause
