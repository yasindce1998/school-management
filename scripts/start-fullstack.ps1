# PowerShell script to start the full stack application

Write-Host "Starting School Management System (Full Stack)..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running or not installed." -ForegroundColor Red
    exit 1
}

# Navigate to the project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptPath "..")

# Clean up previous containers if they exist
Write-Host "Cleaning up previous containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null

# Fix the docker-compose.yml file
Write-Host "Recreating docker-compose.yml file..." -ForegroundColor Yellow
$dockerComposeContent = @"
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: school-management-api
    ports:
      - "8080:8080"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=school_db
      - JWT_SECRET=your_jwt_secret
      - PORT=8080
    volumes:
      - ./api:/app/api
      - ./internal:/app/internal
      - ./config:/app/config
    networks:
      - school-network
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:8080/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: school-management-frontend
    ports:
      - "3000:80"
    depends_on:
      - app
    networks:
      - school-network
    restart: always

  db:
    image: postgres:15-alpine
    container_name: school-management-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=school_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - school-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  school-network:
    driver: bridge
"@

Set-Content -Path "docker-compose.yml" -Value $dockerComposeContent

# Build and start the services
Write-Host "Building and starting services..." -ForegroundColor Yellow
docker-compose build
docker-compose up -d

# Wait for the services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Write-Host "Database..." -NoNewline

do {
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
    $dbReady = $false
    try {
        docker-compose exec db pg_isready -U postgres | Out-Null
        $dbReady = $LASTEXITCODE -eq 0
    } catch {
        $dbReady = $false
    }
} until ($dbReady)

Write-Host " Ready!" -ForegroundColor Green

Write-Host "Backend API..." -NoNewline
do {
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
    $apiReady = $false
    try {
        Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -UseBasicParsing | Out-Null
        $apiReady = $true
    } catch {
        $apiReady = $false
    }
} until ($apiReady)

Write-Host " Ready!" -ForegroundColor Green

Write-Host "Frontend..." -NoNewline
do {
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
    $frontendReady = $false
    try {
        Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing | Out-Null
        $frontendReady = $true
    } catch {
        $frontendReady = $false
    }
} until ($frontendReady)

Write-Host " Ready!" -ForegroundColor Green

Write-Host "School Management System is now running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can stop the services with: docker-compose down" -ForegroundColor Yellow
