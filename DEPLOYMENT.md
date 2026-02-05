# Docker Hub Deployment Guide - CodeArmour AI

## Quick Overview

```
Local Machine → Build Images → Push to Docker Hub → Pull on Server → Deploy!
```

---

## Step 1: Prerequisites

### A. Docker Hub Account
1. Go to https://hub.docker.com/
2. Create free account
3. Remember your username (e.g., `suryauser`)

### B. Docker Installed
- **Windows**: Install Docker Desktop or use WSL2
- **Linux**: `sudo apt install docker.io docker-compose`
- **Mac**: Install Docker Desktop

---

## Step 2: Build & Push Images

### Option A: Manual (PowerShell - Windows)
```powershell
cd c:\Users\surya\Desktop\codearmour-ai

# Login to Docker Hub
docker login

# Build Backend
cd backend
docker build -t YOUR_USERNAME/codearmour-backend:latest .
docker push YOUR_USERNAME/codearmour-backend:latest
cd ..

# Build Frontend
cd frontend
docker build -t YOUR_USERNAME/codearmour-frontend:latest .
docker push YOUR_USERNAME/codearmour-frontend:latest
cd ..
```

### Option B: Using Script (Easier)
```powershell
cd c:\Users\surya\Desktop\codearmour-ai\scripts
.\docker-build-push.ps1 -Username YOUR_DOCKERHUB_USERNAME
```

---

## Step 3: Deploy on Any Server

### A. On Your VPS/Cloud Server

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Create project directory
sudo mkdir -p /opt/codearmour-ai
cd /opt/codearmour-ai

# 3. Download docker-compose file
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/codearmour-ai/main/docker-compose.hub.yml

# 4. Create .env file
cat > .env << EOF
DOCKER_USERNAME=YOUR_DOCKERHUB_USERNAME
FIREBASE_PROJECT_ID=codearmouir-ai
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
MODEL_NAME=microsoft/codebert-base
EOF

# 5. Pull and Run
docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d
```

### B. Quick Deploy Command
```bash
DOCKER_USERNAME=your-username docker compose -f docker-compose.hub.yml up -d
```

---

## Step 4: Setup GitHub Actions (Auto Deploy)

### Add Secrets to GitHub Repository

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password or Access Token |
| `SERVER_HOST` | Your server IP (for auto-deploy) |
| `SERVER_USER` | SSH username (e.g., `root` or `ubuntu`) |
| `SERVER_SSH_KEY` | Your private SSH key |
| `FIREBASE_PROJECT_ID` | codearmouir-ai |
| `FIREBASE_PRIVATE_KEY` | Your Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Your Firebase client email |

---

## Step 5: Verify Deployment

```bash
# Check running containers
docker ps

# Check logs
docker logs codearmour-backend
docker logs codearmour-frontend

# Access your app
# Frontend: http://YOUR_SERVER_IP
# Backend API: http://YOUR_SERVER_IP:8000
# API Docs: http://YOUR_SERVER_IP:8000/docs
```

---

## Useful Commands

```bash
# Start containers
docker compose -f docker-compose.hub.yml up -d

# Stop containers
docker compose -f docker-compose.hub.yml down

# View logs
docker compose -f docker-compose.hub.yml logs -f

# Update to latest images
docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d

# Restart a service
docker compose -f docker-compose.hub.yml restart backend

# Check container status
docker ps -a
```

---

## CI/CD Flow (Auto Deploy on Push)

```
Code Change → git push → GitHub Actions
                              ↓
                    [Run Tests]
                              ↓
                    [Build Docker Images]
                              ↓
                    [Push to Docker Hub]
                              ↓
                    [SSH to Server]
                              ↓
                    [Pull & Restart Containers]
                              ↓
                    [App Updated! 🎉]
```

---

## Free Hosting Options

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| Railway.app | $5/month credit | Full stack |
| Render.com | Free tier | Backend API |
| Fly.io | Free tier | Docker containers |
| Oracle Cloud | Always free VPS | Self-hosted |
| Google Cloud | $300 credit | Production |

---

## Troubleshooting

### Images not pulling?
```bash
docker login
docker pull YOUR_USERNAME/codearmour-backend:latest
```

### Container crashing?
```bash
docker logs codearmour-backend --tail 100
```

### Port already in use?
```bash
docker compose -f docker-compose.hub.yml down
sudo lsof -i :8000  # Find process
sudo kill -9 <PID>  # Kill it
```

### Update to latest code?
```bash
docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d --force-recreate
```
