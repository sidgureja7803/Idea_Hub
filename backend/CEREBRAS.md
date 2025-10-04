# Cerebras Integration for FoundrIQ

This document outlines the integration of Cerebras inference API with the FoundrIQ platform, including the job queue system, worker pipeline, and metrics tracking.

## Overview

The system uses:
- BullMQ job queue with Redis for handling asynchronous tasks
- MongoDB for storing job results and status
- Cerebras API for AI inference
- Worker processes to handle the pipeline
- API endpoints for job submission, status checking, and metrics

## Setup

### Prerequisites

1. Redis server (for BullMQ)
2. MongoDB
3. Cerebras API credentials

### Environment Variables

Add the following to your `.env` file:

```
# Redis Connection (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cerebras API Configuration
CEREBRAS_API_URL=https://api.cerebras.com/v1/generate
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Processing Configuration
LEGACY_PROCESSING=false
```

## Architecture

### Job Queue System

- Uses BullMQ for robust and scalable job queueing
- Redis backend for persistence and reliability
- Automatic retries on failure
- Job status tracking

### Worker Pipeline

The worker pipeline processes ideas through 5 stages:
1. **MarketSnapshot** - Analyzes market overview and trends
2. **TAM/SAM/SOM** - Calculates market sizing metrics
3. **Competition** - Identifies and analyzes competitors
4. **Feasibility** - Evaluates technical and financial feasibility
5. **Aggregator** - Combines insights into a comprehensive report

### Cerebras Client

- Integrates with Cerebras API for AI inference
- Handles authentication and request formatting
- Includes fallback mock mode for development
- Tracks latency metrics

## Usage

### Starting the System

1. Start backend server:
   ```
   npm start
   ```

2. Start worker process (in a separate terminal):
   ```
   npm run worker
   ```

For development with auto-restart:
```
npm run dev
npm run dev:worker
```

### API Endpoints

#### Submit Idea
```
POST /api/ideas

Request body:
{
  "description": "A mobile app that connects dog owners with local dog walkers",
  "category": "Marketplace",
  "targetAudience": "Busy urban professionals with dogs",
  "problemSolved": "Dog owners often struggle to find reliable, trustworthy dog walking services"
}

Response:
{
  "message": "Idea submitted successfully",
  "jobId": "job123",
  "analysisId": "idea456"
}
```

#### Check Job Status
```
GET /api/jobs/:id

Response:
{
  "id": "job123",
  "status": "processing", // pending, processing, completed, failed
  "progress": 60,
  "currentStage": "Analyzing competition",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:05:00Z"
}
```

For completed jobs, results will be included:
```
{
  "id": "job123",
  "status": "completed",
  "progress": 100,
  "currentStage": "Analysis completed",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:10:00Z",
  "results": {
    "marketSnapshot": { ... },
    "tam": { ... },
    "competition": { ... },
    "feasibility": { ... },
    "aggregated": { ... }
  }
}
```

#### Get Metrics
```
GET /api/metrics

Response:
{
  "totalRequests": 150,
  "avgLatencyMs": 5823,
  "latencies": [4532, 6134, 6804, ...]
}
```

## Fallback Mock Mode

If Cerebras API credentials are not available, the system automatically operates in mock mode:
- Generates realistic-looking responses
- Simulates varying latency
- Helps with local development and testing

## Scaling

The system can be scaled horizontally:
- Run multiple worker processes
- Configure Redis for high availability
- Use MongoDB replica sets for data redundancy

For high-load scenarios, consider:
- Redis Cluster for queue scalability
- Dedicated worker instances by type
- Monitoring and auto-scaling with orchestration tools
