#!/bin/bash

# Exit on error
set -e

echo "Testing full-stack deployment..."

# Check Docker Compose deployment
test_docker_compose() {
  echo "Testing Docker Compose deployment..."
  
  # Check if services are running
  echo "Checking if services are running..."
  
  # Check database
  if docker-compose ps db | grep -q "Up"; then
    echo "✅ Database is running"
  else
    echo "❌ Database is not running"
    return 1
  fi
  
  # Check backend
  if docker-compose ps app | grep -q "Up"; then
    echo "✅ Backend is running"
  else
    echo "❌ Backend is not running"
    return 1
  fi
  
  # Check frontend
  if docker-compose ps frontend | grep -q "Up"; then
    echo "✅ Frontend is running"
  else
    echo "❌ Frontend is not running"
    return 1
  fi
  
  # Check API health endpoint
  echo "Checking API health endpoint..."
  if curl -s http://localhost:8080/api/health | grep -q "healthy"; then
    echo "✅ API health check passed"
  else
    echo "❌ API health check failed"
    return 1
  fi
  
  # Check frontend access
  echo "Checking frontend access..."
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Frontend access successful"
  else
    echo "❌ Frontend access failed"
    return 1
  fi
  
  echo "Docker Compose deployment tests passed! ✅"
  return 0
}

# Test Kubernetes deployment
test_kubernetes() {
  echo "Testing Kubernetes deployment..."
  
  # Check if all pods are running
  echo "Checking if pods are running..."
  kubectl get pods -n school-management
  
  # Count running pods
  running_pods=$(kubectl get pods -n school-management | grep Running | wc -l)
  total_pods=$(kubectl get pods -n school-management | grep -v NAME | wc -l)
  
  if [ "$running_pods" -eq "$total_pods" ]; then
    echo "✅ All pods are running ($running_pods/$total_pods)"
  else
    echo "❌ Not all pods are running ($running_pods/$total_pods)"
    return 1
  fi
  
  # Get service endpoints
  echo "Getting service endpoints..."
  api_endpoint=$(kubectl get svc school-management-api -n school-management -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  frontend_endpoint=$(kubectl get svc school-management-frontend -n school-management -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  
  # Check if endpoints are available
  if [ -n "$api_endpoint" ]; then
    echo "✅ API endpoint available: $api_endpoint"
  else
    echo "❓ API endpoint not yet available (may be normal for ClusterIP services)"
  fi
  
  if [ -n "$frontend_endpoint" ]; then
    echo "✅ Frontend endpoint available: $frontend_endpoint"
  else
    echo "❓ Frontend endpoint not yet available (may be normal for ClusterIP services)"
  fi
  
  # Check ingress
  echo "Checking ingress..."
  ingress_host=$(kubectl get ingress school-management-ingress -n school-management -o jsonpath='{.spec.rules[0].host}')
  
  if [ -n "$ingress_host" ]; then
    echo "✅ Ingress host configured: $ingress_host"
    echo "ℹ️ Add an entry to your hosts file to test the ingress: 127.0.0.1 $ingress_host"
  else
    echo "❌ Ingress host not configured"
    return 1
  fi
  
  echo "Kubernetes deployment tests passed! ✅"
  return 0
}

# Choose deployment type to test
if [ "$1" == "k8s" ]; then
  test_kubernetes
elif [ "$1" == "docker" ]; then
  test_docker_compose
else
  echo "Usage: $0 [docker|k8s]"
  echo "  docker - Test Docker Compose deployment"
  echo "  k8s    - Test Kubernetes deployment"
  exit 1
fi
