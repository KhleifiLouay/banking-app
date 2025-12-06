# Stop Server Script
# This script stops any Node.js server process

Write-Host "Stopping Banking App server..." -ForegroundColor Yellow

# Find all Node.js processes that might be our server
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found Node.js processes. Stopping..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "Stopping process: node (PID: $($_.Id))" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    Write-Host "`n✅ Server stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "No Node.js server process found" -ForegroundColor Green
}

Write-Host "`nYou can now start the server with: npm start" -ForegroundColor Cyan

