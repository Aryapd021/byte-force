@echo off
title Byte Force - HomeGenie AI Launcher
echo ========================================================
echo    BYTE FORCE - HOMEGENIE AI ECOSYSTEM LAUNCHER
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting AI FastAPI Microservice on port 8000...
start "Byte Force - AI Service (8000)" cmd /k "C:\Users\bhavi\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn app.main:app --app-dir ai-service --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/3] Starting PHP Backend REST API Gateway on port 8080...
start "Byte Force - PHP Backend (8080)" cmd /k ""%~dp0php_runtime\php.exe" -c "%~dp0php_runtime\php.ini" -S 127.0.0.1:8080 -t "%~dp0backend" "%~dp0backend\index.php""

timeout /t 2 /nobreak >nul

echo [3/3] Starting React Web Application on port 5173...
set "NODE_PATH=C:\Users\bhavi\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v26.4.0-win-x64"
start "Byte Force - Web App (5173)" cmd /k "cd /d "%~dp0frontend" && "%NODE_PATH%\node.exe" "%NODE_PATH%\node_modules\npm\bin\npx-cli.js" vite preview --host 0.0.0.0 --port 5173"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   Byte Force HomeGenie AI is now running!
echo   Opening website in your default browser...
echo.
echo   Web Application: http://localhost:5173
echo   REST API:        http://127.0.0.1:8080/api
echo   AI Microservice: http://127.0.0.1:8000/docs
echo ========================================================
echo.

start http://localhost:5173
pause
