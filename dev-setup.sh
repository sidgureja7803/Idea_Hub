#!/bin/bash

# FoundrIQ Development Setup Script
echo "🛠️  Setting up FoundrIQ for development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual API keys!"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root
cd ..

echo ""
echo "✅ Development setup completed!"
echo ""
echo "🚀 To start development servers:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "🐳 To start with Docker:"
echo "   ./deploy.sh"
echo ""
echo "📝 Don't forget to:"
echo "   1. Edit .env file with your API keys"
echo "   2. Start MongoDB and Redis locally (or use Docker)"
echo "   3. Configure Clerk authentication keys"
