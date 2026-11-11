# Byte Force - HomeGenie AI PowerShell Launcher
$rootDir = $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   BYTE FORCE - HOMEGENIE AI ECOSYSTEM LAUNCHER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$pythonExe = "C:\Users\bhavi\AppData\Local\Programs\Python\Python313\python.exe"
$phpExe = "$rootDir\php_runtime\php.exe"
$phpIni = "$rootDir\php_runtime\php.ini"
$nodeDir = "C:\Users\bhavi\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v26.4.0-win-x64"

# 1. Start AI Microservice
Write-Host "[1/3] Starting AI FastAPI Microservice on port 8000..." -ForegroundColor Green
Start-Process -FilePath $pythonExe -ArgumentList "-m uvicorn app.main:app --app-dir `"$rootDir\ai-service`" --host 127.0.0.1 --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Start PHP Backend
Write-Host "[2/3] Starting PHP Backend REST API on port 8080..." -ForegroundColor Green
Start-Process -FilePath $phpExe -ArgumentList "-c `"$phpIni`" -S 127.0.0.1:8080 -t `"$rootDir\backend`" `"$rootDir\backend\index.php`"" -WindowStyle Normal

Start-Sleep -Seconds 2

# 3. Start Frontend Web Server
Write-Host "[3/3] Starting Frontend React Application on port 5173..." -ForegroundColor Green
$npmCli = "$nodeDir\node_modules\npm\bin\npx-cli.js"
Start-Process -FilePath "$nodeDir\node.exe" -ArgumentList "`"$npmCli`" vite preview --host 0.0.0.0 --port 5173" -WorkingDirectory "$rootDir\frontend" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Opening Byte Force Website in browser: http://localhost:5173" -ForegroundColor Yellow
Start-Process "http://localhost:5173"
