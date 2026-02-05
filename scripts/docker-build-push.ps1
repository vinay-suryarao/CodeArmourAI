# Docker Build and Push Script for CodeArmour AI (Windows PowerShell)
# Usage: .\docker-build-push.ps1 -Username <dockerhub-username>

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  CodeArmour AI - Docker Build & Push" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Docker Hub Username: $Username" -ForegroundColor Yellow
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host ""

# Login to Docker Hub
Write-Host "Step 1: Docker Hub Login..." -ForegroundColor Green
docker login
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker login failed!" -ForegroundColor Red
    exit 1
}

# Build Backend Image
Write-Host ""
Write-Host "Step 2: Building Backend Image..." -ForegroundColor Green
Set-Location backend
docker build -t "$Username/codearmour-backend:$Version" .
docker tag "$Username/codearmour-backend:$Version" "$Username/codearmour-backend:latest"
Set-Location ..

# Build Frontend Image
Write-Host ""
Write-Host "Step 3: Building Frontend Image..." -ForegroundColor Green
Set-Location frontend
docker build -t "$Username/codearmour-frontend:$Version" .
docker tag "$Username/codearmour-frontend:$Version" "$Username/codearmour-frontend:latest"
Set-Location ..

# Push Images
Write-Host ""
Write-Host "Step 4: Pushing Images to Docker Hub..." -ForegroundColor Green
docker push "$Username/codearmour-backend:$Version"
docker push "$Username/codearmour-backend:latest"
docker push "$Username/codearmour-frontend:$Version"
docker push "$Username/codearmour-frontend:latest"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SUCCESS! Images pushed to Docker Hub" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your images:" -ForegroundColor Yellow
Write-Host "  - $Username/codearmour-backend:$Version"
Write-Host "  - $Username/codearmour-frontend:$Version"
Write-Host ""
Write-Host "Pull commands:" -ForegroundColor Yellow
Write-Host "  docker pull $Username/codearmour-backend:latest"
Write-Host "  docker pull $Username/codearmour-frontend:latest"
Write-Host ""
Write-Host "Deploy command:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker-compose.hub.yml up -d"
