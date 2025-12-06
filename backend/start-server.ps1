# Start Server Script
# This script stops any existing server and starts a new one

Write-Host "Starting Banking App Server..." -ForegroundColor Cyan

# Stop any existing server first
Write-Host "`nChecking for existing server..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processes) {
    Write-Host "Stopping existing server..." -ForegroundColor Yellow
    $processes | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Start the server
Write-Host "`nStarting server..." -ForegroundColor Green
npm start

