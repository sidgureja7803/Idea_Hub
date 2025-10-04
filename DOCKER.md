# FoundrIQ Docker Setup

This document explains how to run FoundrIQ using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Services Architecture

The Docker setup includes the following services:

- **frontend**: React + Vite frontend served via Nginx
- **backend**: Node.js Express API server
- **worker**: Node.js worker process consuming jobs from the queue
- **mongo**: MongoDB database
- **redis**: Redis for job queue and caching
- **vectordb**: ChromaDB vector database
- **gateway**: Traefik as API gateway and reverse proxy
- **demo-submitter**: Service to auto-submit a sample idea (demo profile only)

## Running the Stack

### Standard Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd FoundrIQ
   ```

2. Create a `.env` file in the root directory with your environment variables:
   ```
   # API Keys
   CEREBRAS_API_URL=https://api.cerebras.com/v1/generate
   CEREBRAS_API_KEY=your_cerebras_api_key
   GEMINI_API_KEY=your_gemini_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

3. Build and start the services:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Traefik Dashboard: http://traefik.localhost:8080

### Demo Mode

To run the application with an automatic sample idea submission:

```bash
docker compose --profile demo up --build
```

This will start all services and automatically submit a sample idea for processing.

## Environment Variables

### Backend & Worker

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Backend server port | 8000 |
| MONGODB_URI | MongoDB connection string | mongodb://mongo:27017/foundriq |
| REDIS_HOST | Redis hostname | redis |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | (none) |
| CEREBRAS_API_URL | Cerebras API URL | |
| CEREBRAS_API_KEY | Cerebras API key | |
| GEMINI_API_KEY | Google Gemini API key | |
| TAVILY_API_KEY | Tavily search API key | |

## Service URLs

When running the application with Docker Compose, the following URLs are available:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379
- **Vector DB (Chroma)**: http://localhost:8001
- **Traefik Dashboard**: http://traefik.localhost:8080

## Development Setup

For development purposes, you can run specific services:

```bash
# Run only database services
docker-compose up mongo redis vectordb

# Run only backend services
docker-compose up backend worker
```

## Troubleshooting

### Connection Issues

If services can't connect to each other, check that they're all on the same Docker network:

```bash
docker network ls
docker network inspect foundriq-network
```

### Missing Environment Variables

If API services are failing, check that your environment variables are correctly set in your .env file.

### Mock Mode

If API keys are not provided, the Cerebras client will run in mock mode with simulated responses.
