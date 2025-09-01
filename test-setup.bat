@echo off
echo Testing batch file...
pause
echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo Node.js not found
) else (
    echo Node.js found
)
pause