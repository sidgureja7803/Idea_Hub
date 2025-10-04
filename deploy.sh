#!/bin/bash

# FoundrIQ Deployment Script
echo "🚀 Starting FoundrIQ Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please edit .env file with your actual API keys before running again."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Check database connection
if docker-compose exec backend node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ Database connected')).catch(() => console.log('❌ Database connection failed'))" 2>/dev/null; then
    echo "✅ Database connection verified"
else
    echo "❌ Database connection failed"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📊 Service Status:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "📝 Logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo "   docker-compose logs -f worker"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
