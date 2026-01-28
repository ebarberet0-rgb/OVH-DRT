@echo off
echo ========================================
echo  Yamaha DRT - Stopping All Services
echo ========================================
echo.

echo Killing Node.js processes on ports 3001, 5173, 5174, 5175...

REM Kill processes on port 3001 (API)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 5173 (Web)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 5174 (Tablette)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 5175 (Backoffice)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5175') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All services stopped.
echo.
pause
