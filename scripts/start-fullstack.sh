#!/bin/bash

# Exit on error
set -e

echo "Starting School Management System (Full Stack)..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or not installed."
  exit 1
fi

# Navigate to the project root
cd "$(dirname "$0")/.."

# Clean up previous containers if they exist
echo "Cleaning up previous containers..."
docker-compose down -v 2>/dev/null || true

# Fix the docker-compose.yml file
echo "Recreating docker-compose.yml file..."
cat > docker-compose.yml << 'EOF'
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
EOF

# Build and start the services
echo "Building and starting services..."
docker-compose build
docker-compose up -d

# Wait for the services to be ready
echo "Waiting for services to be ready..."
echo "Database..."
until docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; do
  echo -n "."
  sleep 2
done
echo " Ready!"

echo "Backend API..."
until curl -s http://localhost:8080/api/health > /dev/null 2>&1; do
  echo -n "."
  sleep 2
done
echo " Ready!"

echo "Frontend..."
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  echo -n "."
  sleep 2
done
echo " Ready!"

echo "School Management System is now running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8080/api"
echo ""
echo "You can stop the services with: docker-compose down"
