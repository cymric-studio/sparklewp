@echo off
echo Killing development servers...

REM Kill processes on port 3000 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 3000
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill processes on port 5000 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 5000
    taskkill /f /pid %%a >nul 2>&1
)

echo Development servers killed!