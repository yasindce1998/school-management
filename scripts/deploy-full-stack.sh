#!/bin/bash

# Exit immediately if a command fails
set -e

echo "Building and deploying School Management System..."

# Build Docker images
echo "Building backend Docker image..."
docker build -t school-management-api:latest .

echo "Building frontend Docker image..."
docker build -t school-management-frontend:latest ./frontend

# Check if minikube is being used
if command -v minikube &> /dev/null; then
    echo "Loading Docker images into minikube..."
    minikube image load school-management-api:latest
    minikube image load school-management-frontend:latest
fi

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."

# Create namespace if it doesn't exist
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: school-management
EOF

# Apply manifests in the correct order
kubectl apply -f k8s/configmap.yaml -n school-management
kubectl apply -f k8s/secret.yaml -n school-management
kubectl apply -f k8s/postgres.yaml -n school-management
kubectl apply -f k8s/postgres-service.yaml -n school-management

# Wait for database to be ready
echo "Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n school-management --timeout=120s

# Apply the rest of the manifests
kubectl apply -f k8s/deployment.yaml -n school-management
kubectl apply -f k8s/service.yaml -n school-management
kubectl apply -f k8s/frontend-deployment.yaml -n school-management
kubectl apply -f k8s/frontend-service.yaml -n school-management
kubectl apply -f k8s/ingress.yaml -n school-management

echo "School Management System deployed successfully!"

# If using minikube, provide URL to access the application
if command -v minikube &> /dev/null; then
    echo "You can access the application at: $(minikube service school-management-api -n school-management --url)"
    echo "Frontend is available at: $(minikube service school-management-frontend -n school-management --url)"
fi
