@echo off
title Vaeleth - Divine Realm Launcher
color 0E

echo.
echo =====================================
echo    VAELETH - DIVINE REALM LAUNCHER
echo =====================================
echo.

:: Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    echo Minimum required version: 18.x
    echo.
    pause
    goto :eof
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
    echo [OK] Node.js found: %NODE_VERSION%
)

:: Check if npm is installed
echo [2/6] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH
    echo.
    pause
    goto :eof
) else (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
    echo [OK] npm found: %NPM_VERSION%
)

:: Check if we're in the right directory
echo [3/6] Verifying project directory...
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

:: Check for .env file
echo [4/6] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo.
    echo Please run setup-vaeleth.bat first to create the environment file.
    echo Or create .env manually with your Firebase configuration.
    echo.
    echo [ACTION REQUIRED] Please run setup-vaeleth.bat first
    echo Then restart this launcher.
    echo.
    pause
    goto :eof
) else (
    echo [OK] Environment file found
)

:: Check if node_modules exists, install if needed
echo [5/6] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] Dependencies not found, installing...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        echo.
        pause
        goto :eof
    )
) else (
    echo [OK] Dependencies installed
)

:: Start the development server
echo [6/6] Starting Vaeleth development server...
echo.
echo ========================================
echo  Server will start at: http://localhost:5173
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

:: Open browser after delay (background task)
start "" cmd /c "ping 127.0.0.1 -n 4 >nul && start http://localhost:5173"

:: Start the dev server
echo Starting server...
call npm run dev

:: If we get here, the server has stopped
echo.
echo ========================================
echo       Server stopped. Goodbye!
echo ========================================
echo.
pause
goto :eof