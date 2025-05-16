$ErrorActionPreference = "Stop"

Write-Host "Building and starting the School Management API..." -ForegroundColor Cyan

# Build the application
Write-Host "Building the application..." -ForegroundColor Green
go build -o school-management-api.exe

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Start PostgreSQL database using Docker
Write-Host "Starting PostgreSQL database..." -ForegroundColor Green
docker-compose up -d db

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start database with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Run the application
Write-Host "Starting the application..." -ForegroundColor Green
.\school-management-api.exe

# Cleanup
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Force -ErrorAction SilentlyContinue school-management-api.exe
