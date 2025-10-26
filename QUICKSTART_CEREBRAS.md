# Cerebras 5-Agent System - Quick Start

## ✅ What's Ready

**5 Cerebras-powered agents** consuming ResearchPack with strict JSON validation:
1. Market Analyst
2. TAM/SAM Estimator  
3. Competitor Scanner
4. Feasibility Evaluator
5. Strategy Recommender

## 🚀 Run in 3 Steps

### 1. Configure

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
CEREBRAS_API_KEY=your_key_here
PERPLEXITY_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017/ideahub
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. Start Services

```bash
# Redis
brew services start redis

# MongoDB
brew services start mongodb-community
```

### 3. Test

```bash
node test-cerebras-agents.js
```

**Expected**: Full analysis in 70-110 seconds, cache test <5 seconds.

## 🔌 Integration (Pick One)

### Option A: New Route (Recommended)

Create `/server/src/routes/cerebrasAnalysisRoutes.js`:

```javascript
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cerebrasOrchestrator from '../agents/cerebrasOrchestrator.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { idea } = req.body;
  const taskId = uuidv4();
  
  cerebrasOrchestrator.run(idea, idea.id || taskId, taskId);
  
  res.json({ 
    taskId,
    streamUrl: `/api/research/stream/${taskId}`
  });
});

export default router;
```

Register in `/server/src/index.js`:
```javascript
import cerebrasRoutes from './routes/cerebrasAnalysisRoutes.js';
app.use('/api/cerebras', cerebrasRoutes);
```

### Option B: Replace Existing

In `/server/src/agents/graph/ideaOrchestrator.js`:

```javascript
import cerebrasOrchestrator from '../cerebrasOrchestrator.js';

async run(input) {
  return await cerebrasOrchestrator.run(
    input.normalizedIdea,
    input.taskId,
    input.taskId
  );
}
```

## 📡 Frontend (SSE)

```javascript
const eventSource = new EventSource(`/api/research/stream/${taskId}`);

eventSource.addEventListener('node:start', e => {
  console.log('Node started:', JSON.parse(e.data).node);
});

eventSource.addEventListener('node:end', e => {
  const data = JSON.parse(e.data);
  console.log(`${data.node} done in ${data.duration}ms`);
});

eventSource.addEventListener('orchestrator:complete', e => {
  console.log('Analysis complete!', JSON.parse(e.data));
  eventSource.close();
});
```

## 📁 Key Files

- `/server/src/llm/cerebrasClient.js` - Cerebras wrapper
- `/server/src/agents/schemas/agentOutputSchemas.js` - Zod schemas
- `/server/src/agents/nodes/*.js` - 5 agent nodes
- `/server/src/agents/cerebrasOrchestrator.js` - Main orchestrator
- `/server/test-cerebras-agents.js` - Test script

## 📊 Architecture

```
Idea → Research (Perplexity) → ResearchPack → 
  [4 Parallel Cerebras Agents] → Strategy → Final Report
```

## 🎯 What You Get

```json
{
  "marketAnalysis": { ... },
  "tamSamEstimate": { ... },
  "competitorAnalysis": { ... },
  "feasibilityAssessment": { ... },
  "strategy": { ... },
  "metadata": {
    "totalDuration": 85000,
    "timings": { "market": 12500, ... },
    "attempts": { "market": 1, ... }
  }
}
```

## 📚 Full Docs

- `/docs/CEREBRAS_IMPLEMENTATION_COMPLETE.md` - Complete guide
- `/docs/RESEARCH_INTEGRATION.md` - Research layer details
- `/docs/CEREBRAS_AGENTS_STATUS.md` - Component status

---

**Status**: ✅ Ready to integrate  
**Test**: `node test-cerebras-agents.js`  
**Integration**: 5-10 minutes
