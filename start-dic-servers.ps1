# PowerShell script to start both DIC backend servers: translation API and WebSocket
# Usage: .\start-dic-servers.ps1

Write-Host "Starting DIC translation API on port 3000..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd api/dic; node server.js'

Start-Sleep -Seconds 2

Write-Host "Starting DIC WebSocket server on port 5001..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd api/dic; node ws.js'

Write-Host "Both DIC servers started."
