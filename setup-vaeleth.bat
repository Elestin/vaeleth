@echo off
title Vaeleth - Initial Setup
color 0B

echo.
echo =====================================
echo     VAELETH - INITIAL SETUP SCRIPT
echo =====================================
echo.
echo This script will help you set up Vaeleth for the first time.
echo.

:: Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js ^(version 18 or higher^) from:
    echo https://nodejs.org/
    echo.
    echo After installation, restart your command prompt and run this script again.
    echo.
    pause
    goto :eof
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
    echo [OK] Node.js found: %NODE_VERSION%
    
    :: Extract major version number for validation
    set "version_str=%NODE_VERSION%"
    set "version_str=%version_str:v=%"
    for /f "tokens=1 delims=." %%a in ("%version_str%") do set MAJOR_VERSION=%%a
    
    if %MAJOR_VERSION% lss 18 (
        echo [WARNING] Node.js version may be too old. Recommended: 18+
        echo Current version: %NODE_VERSION%
        echo.
    )
)

:: Check if we're in the right directory
echo [2/4] Verifying project directory...
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please make sure you're running this from the Vaeleth project root directory.
    echo Current directory: %CD%
    echo.
    pause
    goto :eof
) else (
    echo [OK] Project files found in: %CD%
)

:: Install dependencies
echo [3/4] Installing project dependencies...
echo This may take several minutes, please wait...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install dependencies
    echo This could be due to:
    echo - Network connectivity issues
    echo - Node.js version compatibility
    echo - Permissions issues
    echo.
    echo Try running as administrator or check your internet connection.
    echo.
    pause
    goto :eof
) else (
    echo.
    echo [OK] Dependencies installed successfully
)

:: Create environment file
echo [4/4] Setting up environment configuration...
if exist ".env" (
    echo [INFO] .env file already exists, backing up to .env.backup
    copy ".env" ".env.backup" >nul 2>&1
)

echo Creating .env file...
echo # Vaeleth Environment Configuration > .env
echo # Replace these values with your actual Firebase configuration >> .env
echo. >> .env
echo # Firebase Configuration >> .env
echo VITE_FIREBASE_API_KEY=your_api_key_here >> .env
echo VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com >> .env
echo VITE_FIREBASE_PROJECT_ID=your_project_id >> .env
echo VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com >> .env
echo VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012 >> .env
echo VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012 >> .env
echo VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/ >> .env
echo. >> .env
echo # Development Settings >> .env
echo VITE_DEV_MODE=true >> .env

echo [OK] Environment file created

echo.
echo ========================================
echo         SETUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo IMPORTANT: Next steps to complete setup:
echo.
echo 1. Edit the .env file with your Firebase configuration:
echo    - Go to Firebase Console ^(https://console.firebase.google.com^)
echo    - Select your project or create a new one
echo    - Go to Project Settings ^> General ^> Your apps
echo    - Copy the config values to .env file
echo.
echo 2. Enable Firebase services:
echo    - Authentication ^(Email/Password provider^)
echo    - Realtime Database
echo.
echo 3. Run 'start-vaeleth.bat' to start the development server
echo.
echo For production builds, use 'build-vaeleth.bat'
echo.

:: Ask if user wants to open .env file
set /p OPEN_ENV=Open .env file for editing now? ^(y/n^): 
if /i "%OPEN_ENV%"=="y" (
    if exist "%ProgramFiles%\Notepad++\notepad++.exe" (
        start "" "%ProgramFiles%\Notepad++\notepad++.exe" .env
    ) else if exist "%ProgramFiles(x86)%\Notepad++\notepad++.exe" (
        start "" "%ProgramFiles(x86)%\Notepad++\notepad++.exe" .env
    ) else (
        start notepad .env
    )
)

echo.
echo Press any key to exit...
pause >nul
goto :eof