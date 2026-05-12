@echo off
echo ===================================================
echo   ethara.ai - TaskFlow Server ^& Client Start Script
echo ===================================================
echo.

echo [1/3] Terminating any existing node process on ports 5000 and 5173...
:: Kill processes running on port 5000 (Express Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: Kill processes running on port 5173 (Vite Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo Done. Existing processes cleared.
echo.

echo [2/3] Starting Express Backend Server (Port 5000)...
start "TaskFlow Backend" cmd /c "npm run dev:server"

echo [3/3] Starting Vite Frontend Client (Port 5173)...
start "TaskFlow Frontend" cmd /c "npm run dev:client"

echo.
echo ===================================================
echo   System Started! 
echo   Backend is running at: http://localhost:5000
echo   Frontend is running at: http://localhost:5173
echo ===================================================
echo.
pause
