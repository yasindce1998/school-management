#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo -e "\033[0;36mDeploying School Management System to Kubernetes...\033[0m"

# Build and push Docker images
echo -e "\033[0;32mBuilding Backend Docker image...\033[0m"
docker build -t school-management-api:latest .

if [ $? -ne 0 ]; then
    echo -e "\033[0;31mBackend Docker build failed with exit code $?\033[0m"
    exit $?
fi

echo -e "\033[0;32mBuilding Frontend Docker image...\033[0m"
docker build -t school-management-frontend:latest ./frontend

if [ $? -ne 0 ]; then
    echo -e "\033[0;31mFrontend Docker build failed with exit code $?\033[0m"
    exit $?
fi

# Apply Kubernetes manifests
echo -e "\033[0;32mApplying Kubernetes manifests...\033[0m"

# Create namespace if it doesn't exist
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: school-management
EOF

# Apply manifests in order
kubectl apply -f k8s/configmap.yaml -n school-management
kubectl apply -f k8s/secret.yaml -n school-management
kubectl apply -f k8s/postgres-service.yaml -n school-management
kubectl apply -f k8s/postgres.yaml -n school-management

# Wait for database to be ready
echo -e "\033[0;33mWaiting for database to be ready...\033[0m"
kubectl wait --for=condition=ready pod -l app=postgres -n school-management --timeout=120s

# Apply remaining manifests
kubectl apply -f k8s/service.yaml -n school-management
kubectl apply -f k8s/deployment.yaml -n school-management
kubectl apply -f k8s/frontend-service.yaml -n school-management
kubectl apply -f k8s/frontend-deployment.yaml -n school-management
kubectl apply -f k8s/ingress.yaml -n school-management

echo -e "\033[0;36mDeployment complete!\033[0m"
echo -e "\033[0;33mYou can check the status with: kubectl get pods -n school-management\033[0m"
echo -e "\033[0;33mAccess your application at: http://school.example.com (configure DNS or use hostname mapping)\033[0m"
