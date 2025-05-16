# PowerShell script to test deployment

param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("docker", "k8s")]
    [string]$DeploymentType
)

Write-Host "Testing full-stack deployment..." -ForegroundColor Cyan

# Function to test Docker Compose deployment
function Test-DockerCompose {
    Write-Host "Testing Docker Compose deployment..." -ForegroundColor Yellow
    
    # Check if services are running
    Write-Host "Checking if services are running..."
    
    # Check database
    $dbStatus = docker-compose ps db | Select-String "Up"
    if ($dbStatus) {
        Write-Host "✅ Database is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Database is not running" -ForegroundColor Red
        return $false
    }
    
    # Check backend
    $backendStatus = docker-compose ps app | Select-String "Up"
    if ($backendStatus) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend is not running" -ForegroundColor Red
        return $false
    }
    
    # Check frontend
    $frontendStatus = docker-compose ps frontend | Select-String "Up"
    if ($frontendStatus) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend is not running" -ForegroundColor Red
        return $false
    }
    
    # Check API health endpoint
    Write-Host "Checking API health endpoint..."
    try {
        $apiHealth = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET -UseBasicParsing
        if ($apiHealth.status -eq "ok" -or $apiHealth.message -like "*healthy*") {
            Write-Host "✅ API health check passed" -ForegroundColor Green
        } else {
            Write-Host "❌ API health check failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ API health check failed: $_" -ForegroundColor Red
        return $false
    }
    
    # Check frontend access
    Write-Host "Checking frontend access..."
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Host "✅ Frontend access successful" -ForegroundColor Green
        } else {
            Write-Host "❌ Frontend access failed with status code: $($frontendResponse.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Frontend access failed: $_" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Docker Compose deployment tests passed! ✅" -ForegroundColor Green
    return $true
}

# Function to test Kubernetes deployment
function Test-Kubernetes {
    Write-Host "Testing Kubernetes deployment..." -ForegroundColor Yellow
    
    # Check if all pods are running
    Write-Host "Checking if pods are running..."
    kubectl get pods -n school-management
    
    # Count running pods
    $pods = kubectl get pods -n school-management | Select-String "Running"
    $totalPods = (kubectl get pods -n school-management | Measure-Object -Line).Lines - 1
    $runningPods = ($pods | Measure-Object).Count
    
    if ($runningPods -eq $totalPods) {
        Write-Host "✅ All pods are running ($runningPods/$totalPods)" -ForegroundColor Green
    } else {
        Write-Host "❌ Not all pods are running ($runningPods/$totalPods)" -ForegroundColor Red
        return $false
    }
    
    # Get service endpoints
    Write-Host "Getting service endpoints..."
    $apiEndpoint = kubectl get svc school-management-api -n school-management -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
    $frontendEndpoint = kubectl get svc school-management-frontend -n school-management -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
    
    # Check if endpoints are available
    if ($apiEndpoint) {
        Write-Host "✅ API endpoint available: $apiEndpoint" -ForegroundColor Green
    } else {
        Write-Host "❓ API endpoint not yet available (may be normal for ClusterIP services)" -ForegroundColor Yellow
    }
    
    if ($frontendEndpoint) {
        Write-Host "✅ Frontend endpoint available: $frontendEndpoint" -ForegroundColor Green
    } else {
        Write-Host "❓ Frontend endpoint not yet available (may be normal for ClusterIP services)" -ForegroundColor Yellow
    }
    
    # Check ingress
    Write-Host "Checking ingress..."
    $ingressHost = kubectl get ingress school-management-ingress -n school-management -o jsonpath='{.spec.rules[0].host}'
    
    if ($ingressHost) {
        Write-Host "✅ Ingress host configured: $ingressHost" -ForegroundColor Green
        Write-Host "ℹ️ Add an entry to your hosts file to test the ingress: 127.0.0.1 $ingressHost" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ingress host not configured" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Kubernetes deployment tests passed! ✅" -ForegroundColor Green
    return $true
}

# Execute tests based on deployment type
if ($DeploymentType -eq "docker") {
    Test-DockerCompose
} elseif ($DeploymentType -eq "k8s") {
    Test-Kubernetes
}
