#!/bin/bash
# Docker Build and Push Script for CodeArmour AI
# Usage: ./docker-build-push.sh <dockerhub-username>

set -e

# Check if username is provided
if [ -z "$1" ]; then
    echo "Usage: ./docker-build-push.sh <dockerhub-username>"
    echo "Example: ./docker-build-push.sh suryauser"
    exit 1
fi

DOCKER_USERNAME=$1
VERSION=${2:-latest}

echo "=========================================="
echo "  CodeArmour AI - Docker Build & Push"
echo "=========================================="
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "Version: $VERSION"
echo ""

# Login to Docker Hub
echo "Step 1: Docker Hub Login..."
docker login

# Build Backend Image
echo ""
echo "Step 2: Building Backend Image..."
cd backend
docker build -t $DOCKER_USERNAME/codearmour-backend:$VERSION .
docker tag $DOCKER_USERNAME/codearmour-backend:$VERSION $DOCKER_USERNAME/codearmour-backend:latest
cd ..

# Build Frontend Image
echo ""
echo "Step 3: Building Frontend Image..."
cd frontend
docker build -t $DOCKER_USERNAME/codearmour-frontend:$VERSION .
docker tag $DOCKER_USERNAME/codearmour-frontend:$VERSION $DOCKER_USERNAME/codearmour-frontend:latest
cd ..

# Push Images
echo ""
echo "Step 4: Pushing Images to Docker Hub..."
docker push $DOCKER_USERNAME/codearmour-backend:$VERSION
docker push $DOCKER_USERNAME/codearmour-backend:latest
docker push $DOCKER_USERNAME/codearmour-frontend:$VERSION
docker push $DOCKER_USERNAME/codearmour-frontend:latest

echo ""
echo "=========================================="
echo "  SUCCESS! Images pushed to Docker Hub"
echo "=========================================="
echo ""
echo "Your images:"
echo "  - $DOCKER_USERNAME/codearmour-backend:$VERSION"
echo "  - $DOCKER_USERNAME/codearmour-frontend:$VERSION"
echo ""
echo "Pull commands:"
echo "  docker pull $DOCKER_USERNAME/codearmour-backend:latest"
echo "  docker pull $DOCKER_USERNAME/codearmour-frontend:latest"
