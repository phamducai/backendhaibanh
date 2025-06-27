#!/bin/bash

echo "🧹 Cleaning up Docker containers and images..."

# Stop and remove containers
docker-compose down

# Remove old containers
docker container prune -f

# Remove old images
docker image prune -f

# Remove specific images related to this project
docker rmi backendhaibanh_backend 2>/dev/null || true
docker rmi course_platform_backend 2>/dev/null || true

echo "🔄 Rebuilding Docker containers..."

# Build and start with fresh containers
docker-compose up --build -d

echo "✅ Docker rebuild completed!"
echo "📝 Check logs with: docker-compose logs -f backend" 