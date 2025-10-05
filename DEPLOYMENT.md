# IdeaHub Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- API keys for required services

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your actual API keys
nano .env
```

### 2. Deploy with Docker
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🔧 Manual Deployment Steps

### Step 1: Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# API Keys
CEREBRAS_API_KEY=your_cerebras_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Database (for Docker)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/startup-buddy?authSource=admin
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

### Step 2: Start Services
```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps
```

### Step 3: Verify Deployment
```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:5173

# View logs
docker-compose logs -f backend
```

## 🏗️ Architecture

### Services
- **Frontend**: React + Vite application (Port 5173)
- **Backend**: Node.js + Express API (Port 3001)
- **Worker**: Background job processor
- **MongoDB**: Database (Port 27017)
- **Redis**: Queue management (Port 6379)
- **Nginx**: Reverse proxy (Port 80)

### Key Features
- ✅ AI-powered startup validation using Cerebras
- ✅ Real-time chat with OpenRouter integration
- ✅ User authentication with Clerk
- ✅ Search history and limits tracking
- ✅ Background job processing with BullMQ
- ✅ Comprehensive market analysis
- ✅ Docker containerization

## 🔍 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f worker
```

### Health Checks
- Backend: `http://localhost:3001/health`
- Frontend: `http://localhost:5173`
- Database: Check MongoDB connection in logs

## 🛠️ Development Setup

### Local Development
```bash
# Run development setup
chmod +x dev-setup.sh
./dev-setup.sh

# Start backend
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev
```

### Docker Development
```bash
# Start only database services
docker-compose up mongodb redis -d

# Run backend and frontend locally
cd backend && npm run dev
cd frontend && npm run dev
```

## 🔧 Configuration

### API Keys Required
1. **Cerebras API Key**: For AI model inference
2. **Tavily API Key**: For market research
3. **OpenRouter API Key**: For chat functionality
4. **Clerk Keys**: For user authentication

### Database Configuration
- MongoDB runs on port 27017
- Redis runs on port 6379
- Both are accessible within Docker network

### Security
- All containers run as non-root users
- Environment variables are securely managed
- CORS is configured for frontend-backend communication

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using port 3001
   lsof -i:3001
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

2. **Environment Variables**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify variables are loaded
   docker-compose exec backend env | grep API
   ```

3. **Database Connection**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Test connection
   docker-compose exec backend node -e "console.log(process.env.MONGODB_URI)"
   ```

4. **Service Restart**
   ```bash
   # Restart specific service
   docker-compose restart backend
   
   # Restart all services
   docker-compose restart
   ```

### Performance Optimization
- Use `docker-compose up --build -d` for production
- Monitor resource usage with `docker stats`
- Scale worker instances if needed

## 📊 Production Deployment

### For Production Servers
1. Update CORS_ORIGIN to your domain
2. Set up SSL certificates in nginx
3. Configure proper firewall rules
4. Set up monitoring and logging
5. Configure backup strategies for MongoDB

### Scaling
```bash
# Scale worker instances
docker-compose up --scale worker=3 -d

# Use external Redis/MongoDB for high availability
```

## 🔐 Security Checklist
- [ ] All API keys are properly secured
- [ ] Environment variables are not committed to git
- [ ] SSL certificates are configured
- [ ] Database credentials are strong
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled

## 📞 Support
For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check service health endpoints
4. Review this deployment guide
