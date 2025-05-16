$ErrorActionPreference = "Stop"

Write-Host "Deploying School Management System to Kubernetes..." -ForegroundColor Cyan

# Build and push Docker images
Write-Host "Building Backend Docker image..." -ForegroundColor Green
docker build -t school-management-api:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend Docker build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Building Frontend Docker image..." -ForegroundColor Green
docker build -t school-management-frontend:latest ./frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend Docker build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Apply Kubernetes manifests
Write-Host "Applying Kubernetes manifests..." -ForegroundColor Green

# Create namespace if it doesn't exist
kubectl apply -f - << @'
apiVersion: v1
kind: Namespace
metadata:
  name: school-management
'@

# Apply manifests in order
kubectl apply -f k8s/configmap.yaml -n school-management
kubectl apply -f k8s/secret.yaml -n school-management
kubectl apply -f k8s/postgres-service.yaml -n school-management
kubectl apply -f k8s/postgres.yaml -n school-management

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=postgres -n school-management --timeout=120s

# Apply remaining manifests
kubectl apply -f k8s/service.yaml -n school-management
kubectl apply -f k8s/deployment.yaml -n school-management
kubectl apply -f k8s/frontend-service.yaml -n school-management
kubectl apply -f k8s/frontend-deployment.yaml -n school-management
kubectl apply -f k8s/ingress.yaml -n school-management

Write-Host "Deployment complete!" -ForegroundColor Cyan
Write-Host "You can check the status with: kubectl get pods -n school-management" -ForegroundColor Yellow
Write-Host "Access your application at: http://school.example.com (configure DNS or use hostname mapping)" -ForegroundColor Yellow
