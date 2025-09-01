@echo off
title Vaeleth - Production Build
color 0A

echo.
echo =====================================
echo   VAELETH - PRODUCTION BUILD SCRIPT
echo =====================================
echo.

:: Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    goto :eof
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
    echo [OK] Node.js found: %NODE_VERSION%
)

:: Check if we're in the right directory
echo [2/5] Verifying project directory...
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
echo [3/5] Checking environment configuration...
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please run setup-vaeleth.bat first to set up your environment.
    echo.
    pause
    goto :eof
) else (
    echo [OK] Environment file found
)

:: Install/update dependencies
echo [4/5] Installing production dependencies...
call npm ci --include=dev
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    echo.
    pause
    goto :eof
) else (
    echo [OK] Dependencies installed
)

:: Clean previous build
if exist "dist" (
    echo [INFO] Cleaning previous build...
    rmdir /s /q dist
)

:: Build the project
echo [5/5] Building Vaeleth for production...
echo This may take a moment...
echo.
call npm run build

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    echo Check the error messages above for details.
    echo.
    pause
    goto :eof
) else (
    echo.
    echo ========================================
    echo        BUILD COMPLETED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Built files are in the 'dist' folder
    echo You can now deploy these files to your web server.
    echo.
    echo To preview the build locally, run:
    echo   npm run preview
    echo.
    if exist "dist" (
        echo Build directory contents:
        dir "dist" /B
    )
    echo.
)

pause
goto :eof