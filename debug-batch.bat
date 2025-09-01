@echo off
echo ========================================
echo           DEBUG BATCH FILE
echo ========================================
echo.
echo Current directory: %CD%
echo.

echo Checking if package.json exists...
if exist "package.json" (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json NOT found
)
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found or failed
) else (
    echo [OK] Node.js working
)
echo.

echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo [ERROR] npm not found or failed
) else (
    echo [OK] npm working
)
echo.

echo Batch file debugging complete.
echo.
echo If you see this message, the batch file is working correctly.
echo The issue might be with Node.js/npm or file permissions.
echo.
pause