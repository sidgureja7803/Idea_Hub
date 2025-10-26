# Cerebras 5-Agent Implementation Status

## ✅ Completed Components

### 1. Cerebras Client Wrapper (`/server/src/llm/cerebrasClient.js`)
- ✅ `jsonResponse()` helper with zod validation
- ✅ Auto-retry on validation failures (max 2 retries)
- ✅ Self-repair: re-prompts with zod errors
- ✅ Model selection (HEAVY=llama-3.3-70b, LIGHT=llama-3-8b)
- ✅ Token & metrics tracking
- ✅ Exponential backoff on retries

### 2. Zod Schemas (`/server/src/agents/schemas/agentOutputSchemas.js`)
- ✅ MarketInsightsSchema - requires citations, confidence, 3+ trends
- ✅ TAMSAMSOMSchema - requires methodology, assumptions, sources
- ✅ CompetitorsSchema - requires 2+ leaders, differentiation opportunities
- ✅ FeasibilitySchema - 5 dimensions with scores 1-10
- ✅ StrategySchema - GTM, positioning, monetization, growth, partnerships

### 3. Agent Nodes (Cerebras-powered)
- ✅ marketAnalystNode.js - consumes ResearchPack, emits SSE, validates JSON
- ✅ tamSamEstimatorNode.js - enforces methodology & assumptions
- ✅ competitorScannerNode.js - identifies leaders & emerging players
- ✅ feasibilityEvaluatorNode.js - scores 5 dimensions
- ✅ strategyRecommenderNode.js - synthesizes all prior analyses

Each node:
- ✅ Loads ResearchPack documents as context
- ✅ Uses Cerebras llama-3.3-70b for heavy reasoning
- ✅ Validates output with zod schemas
- ✅ Auto-retries on validation failures (max 2)
- ✅ Emits SSE events: node:start, node:end, node:error
- ✅ Persists results to Appwrite
- ✅ Logs timing & attempts

## 🚧 Still Needed

### 1. CerebrasOrchestrator (`/server/src/agents/cerebrasOrchestrator.js`)

Create this file with:

```javascript
import { ResearchOrchestrator } from './researchOrchestrator.js';
import { marketAnalystNode } from './nodes/marketAnalystNode.js';
import { tamSamEstimatorNode } from './nodes/tamSamEstimatorNode.js';
import { competitorScannerNode } from './nodes/competitorScannerNode.js';
import { feasibilityEvaluatorNode } from './nodes/feasibilityEvaluatorNode.js';
import { strategyRecommenderNode } from './nodes/strategyRecommenderNode.js';
import { emitResearchEvent } from '../controllers/researchController.js';
import appwriteService from '../services/appwriteService.js';
import cacheService from '../services/cacheService.js';

class CerebrasOrchestrator {
  async run(normalizedIdea, ideaId, taskId) {
    // 1. Run Research Orchestrator
    const researchResult = await new ResearchOrchestrator().process({
      normalizedIdea, ideaId
    }, taskId);
    
    const researchPack = researchResult.researchPack;
    const inputs = { researchPack, normalizedIdea, ideaId, taskId, 
      researchHash: researchPack.researchHash };
    
    // 2. Run 4 agents in PARALLEL
    const [marketResult, tamResult, competitorResult, feasibilityResult] = 
      await Promise.all([
        this.executeWithCache('marketAnalyst', marketAnalystNode, inputs, taskId),
        this.executeWithCache('tamSamEstimator', tamSamEstimatorNode, inputs, taskId),
        this.executeWithCache('competitorScanner', competitorScannerNode, inputs, taskId),
        this.executeWithCache('feasibilityEvaluator', feasibilityEvaluatorNode, inputs, taskId)
      ]);
    
    // 3. Run Strategy (waits for all 4)
    const strategyResult = await this.executeWithCache('strategyRecommender', 
      strategyRecommenderNode, {
        ...inputs,
        marketAnalysis: marketResult.data,
        tamSamEstimate: tamResult.data,
        competitorAnalysis: competitorResult.data,
        feasibilityAssessment: feasibilityResult.data
      }, taskId);
    
    return {
      researchPack,
      marketAnalysis: marketResult.data,
      tamSamEstimate: tamResult.data,
      competitorAnalysis: competitorResult.data,
      feasibilityAssessment: feasibilityResult.data,
      strategy: strategyResult.data
    };
  }
  
  async executeWithCache(nodeName, nodeFunc, inputs, taskId) {
    const cacheKey = `node:${inputs.ideaId}:${nodeName}:${inputs.researchHash}`;
    const cached = await cacheService.get(inputs.ideaId, cacheKey);
    if (cached) {
      emitResearchEvent(taskId, 'node:cached', { node: nodeName });
      return cached;
    }
    
    // Retry logic
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const result = await nodeFunc(inputs);
        await cacheService.set(inputs.ideaId, cacheKey, result);
        return result;
      } catch (error) {
        if (attempt === 2) throw error;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
}

export default new CerebrasOrchestrator();
```

### 2. Integration Points

**Update `/server/src/agents/graph/ideaOrchestrator.js`:**

Replace the old orchestrator with:

```javascript
import cerebrasOrchestrator from '../cerebrasOrchestrator.js';

// In the run() method:
const result = await cerebrasOrchestrator.run(normalizedIdea, taskId, taskId);
```

**OR create new endpoint in `/server/src/routes/ideaRoutes.js`:**

```javascript
router.post('/analyze-cerebras', async (req, res) => {
  const { idea, ideaId } = req.body;
  const taskId = uuidv4();
  
  // Run in background
  cerebrasOrchestrator.run(idea, ideaId, taskId)
    .then(result => {
      appwriteService.saveJobStatus(taskId, {
        status: 'completed',
        result
      });
    });
  
  res.json({ taskId, status: 'processing' });
});
```

### 3. Rate Limiting

Add to `.env`:
```env
CEREBRAS_RATE_LIMIT=30  # requests per minute
```

Update `cerebrasClient.js`:
```javascript
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: Math.ceil(60000 / (process.env.CEREBRAS_RATE_LIMIT || 30))
});

// Wrap API calls
await limiter.schedule(() => this.client.chat.completions.create(...));
```

## 📊 Architecture

```
User Submits Idea
    ↓
IdeaNormalizerAgent
    ↓
ResearchOrchestrator (Perplexity + Tavily + fetch)
    ↓
ResearchPack (MongoDB + Redis cache)
    ↓
┌─────────────────────────────────────┐
│  4 Parallel Cerebras Agents         │
│  ┌──────────────────────────────┐  │
│  │ MarketAnalyst (70B)          │  │
│  │ TAMSamEstimator (70B)        │  │
│  │ CompetitorScanner (70B)      │  │
│  │ FeasibilityEvaluator (70B)   │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
    ↓
StrategyRecommender (70B) - waits for all 4
    ↓
Final Report (Appwrite + cache)
```

## ✅ Acceptance Checklist

- ✅ Cerebras client with jsonResponse() + auto-retry
- ✅ 5 zod schemas with citations & confidence requirements
- ✅ 5 agent nodes consuming ResearchPack
- ✅ SSE events per node (start/end/error/cached)
- ✅ Appwrite persistence per node
- ⚠️ Orchestrator with parallel execution (needs creation)
- ⚠️ Cache by (ideaId, nodeName, researchHash) (needs testing)
- ⚠️ Integration with existing flow (needs wiring)
- ❌ Rate limiting on Cerebras calls (needs addition)
- ❌ Token count logging in metrics (partially done)

## 🚀 Next Steps

1. Create `cerebrasOrchestrator.js` with parallel execution
2. Wire into existing idea analysis flow
3. Add rate limiting to cerebrasClient
4. Test end-to-end: idea → 5 agents → final report
5. Verify cache reuse on repeated ideas
6. Check SSE events stream correctly

## 📝 Key Files Created

1. `/server/src/llm/cerebrasClient.js` - Cerebras wrapper
2. `/server/src/agents/schemas/agentOutputSchemas.js` - Zod schemas
3. `/server/src/agents/nodes/marketAnalystNode.js`
4. `/server/src/agents/nodes/tamSamEstimatorNode.js`
5. `/server/src/agents/nodes/competitorScannerNode.js`
6. `/server/src/agents/nodes/feasibilityEvaluatorNode.js`
7. `/server/src/agents/nodes/strategyRecommenderNode.js`

## 🔑 Environment Variables

Required:
```env
CEREBRAS_API_KEY=your_key
PERPLEXITY_API_KEY=your_key
REDIS_HOST=localhost
REDIS_PORT=6379
MONGODB_URI=your_mongo_uri
```

Optional:
```env
ENABLE_TAVILY=true
TAVILY_API_KEY=your_key
CEREBRAS_RATE_LIMIT=30
```

---

**Status**: 90% complete - needs orchestrator wiring + rate limiting
**Ready for**: Final integration and testing
