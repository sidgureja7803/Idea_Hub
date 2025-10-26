# Research Layer Integration Guide

## Overview

The Research Orchestrator is now integrated into IdeaHub as a standalone agent that can be used independently or as part of the analysis pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Research Orchestrator                    │
├─────────────────────────────────────────────────────────────┤
│  1. Query Expansion (idea → 5-7 targeted queries)          │
│  2. Multi-Provider Search (Perplexity + Tavily optional)   │
│  3. Document Fetching & Extraction (HTML + PDF)            │
│  4. Deduplication & Ranking                                │
│  5. ResearchPack Persistence (MongoDB + Appwrite)          │
│  6. Redis Caching (72h TTL)                                │
│  7. SSE Progress Streaming                                 │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Option 1: Standalone Research (Recommended for Now)

```javascript
import { ResearchOrchestrator } from './agents/researchOrchestrator.js';

const orchestrator = new ResearchOrchestrator();

const result = await orchestrator.process({
  normalizedIdea: {
    title: 'AI-powered fitness app',
    industry: 'Health & Fitness',
    targetAudience: 'Millennials',
    keyFeatures: ['AI coaching', 'Nutrition tracking']
  },
  ideaId: 'idea_123'
}, 'task_456');

console.log('Research Pack ID:', result.researchPack._id);
console.log('Top Documents:', result.documents.slice(0, 5));
```

### Option 2: Integrate with Existing MarketSearcherAgent

Replace or extend the current `MarketSearcherAgent` in the `ideaOrchestrator.js`:

```javascript
// In ideaOrchestrator.js
import { ResearchOrchestrator } from '../researchOrchestrator.js';

// Replace:
// this.marketSearcherAgent = new MarketSearcherAgent();

// With:
this.researchOrchestrator = new ResearchOrchestrator();

// Update the searchMarket node:
graph.addNode('searchMarket', async (state) => {
  try {
    if (state.error) return { error: state.error };
    
    await appwriteService.saveJobStatus(state.taskId, {
      status: 'processing',
      step: 'market_research',
      progress: 30,
      message: 'Deep research with Perplexity & document extraction'
    });
    
    const researchResult = await this.researchOrchestrator.run(
      { 
        normalizedIdea: state.normalizedIdea,
        ideaId: state.taskId
      }, 
      state.taskId
    );
    
    return { 
      marketResearch: researchResult,
      researchPackId: researchResult.researchPack._id 
    };
  } catch (error) {
    return { error: `Error in research: ${error.message}` };
  }
});
```

## SSE Event Streaming

### Frontend Integration

```javascript
// Connect to SSE endpoint for real-time updates
const eventSource = new EventSource(`/api/research/stream/${taskId}`);

eventSource.addEventListener('research:start', (e) => {
  const data = JSON.parse(e.data);
  console.log('Research started:', data);
});

eventSource.addEventListener('research:query:generated', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Generated ${data.count} queries:`, data.queries);
});

eventSource.addEventListener('research:doc:fetched', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Fetched: ${data.title} from ${data.url}`);
});

eventSource.addEventListener('research:packed', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Research pack saved: ${data.id}`);
  console.log(`Total sources: ${data.totalSources}, documents: ${data.totalDocs}`);
});

eventSource.addEventListener('research:complete', (e) => {
  const data = JSON.parse(e.data);
  console.log('Research complete!', data);
  eventSource.close();
});

eventSource.addEventListener('research:error', (e) => {
  const data = JSON.parse(e.data);
  console.error('Research error:', data.error);
  eventSource.close();
});
```

## Environment Configuration

### Required Variables

```env
# Perplexity API (REQUIRED)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Cerebras API (REQUIRED for agents)
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Redis (REQUIRED for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Optional Variables

```env
# Enable Tavily for additional search results
ENABLE_TAVILY=true
TAVILY_API_KEY=your_tavily_api_key_here

# Research Configuration
RESEARCH_CACHE_TTL=259200          # 72 hours in seconds
RESEARCH_MAX_DOCUMENTS=20          # Max documents to fetch
RESEARCH_FETCH_TIMEOUT=30000       # 30 seconds

# Rate Limits (requests per minute)
PERPLEXITY_RATE_LIMIT=10
TAVILY_RATE_LIMIT=10
FETCH_RATE_LIMIT=20
```

## Cache Behavior

The research orchestrator uses Redis to cache results:

- **Cache Key**: `research:${ideaId}:${researchHash}`
- **Research Hash**: Generated from `ideaId + sorted(queries)`
- **TTL**: 72 hours (configurable via `RESEARCH_CACHE_TTL`)
- **Cache Hit**: Returns cached ResearchPack instantly
- **Cache Miss**: Executes full research pipeline and caches result

### Example Cache Keys

```
research:idea_abc123:f4d5e6a7b8c9d0e1
research:idea_xyz789:a1b2c3d4e5f6g7h8
```

## API Endpoints

### SSE Stream Endpoint

**GET** `/api/research/stream/:jobId`

Establishes Server-Sent Events connection for real-time research progress.

**Response Events:**
- `research:start` - Research job initiated
- `research:query:generated` - Search queries generated
- `research:search:perplexity` - Perplexity search completed
- `research:search:tavily` - Tavily search completed (if enabled)
- `research:doc:fetched` - Document fetched and extracted
- `research:dedupe` - Deduplication completed
- `research:ranked` - Documents ranked
- `research:packed` - ResearchPack persisted
- `research:cached` - Results cached in Redis
- `research:complete` - Research completed successfully
- `research:error` - Error occurred

## ResearchPack Schema

```javascript
{
  _id: ObjectId,
  ideaId: String,                   // Link to idea
  researchHash: String,              // Cache key component
  queries: [String],                 // Search queries used
  sources: [{                        // Raw search results
    url: String,
    title: String,
    domain: String,
    fetchedAt: Date
  }],
  documents: [{                      // Extracted & ranked documents
    url: String,
    title: String,
    content: String,                 // Cleaned text (max 10k chars)
    contentHash: String,             // SHA-256 for deduplication
    metadata: Map                    // Domain, author, dates, etc.
  }],
  facts: [String],                   // Reserved for future use
  metrics: Map,                      // Reserved for future use
  assumptions: [String],             // Reserved for future use
  ttl: Date,                         // Expiration date
  createdAt: Date,                   // Auto-generated
  updatedAt: Date                    // Auto-generated
}
```

## Compliance & Reliability

### robots.txt Compliance

- All URLs are checked against robots.txt before fetching
- Blocked URLs are skipped and marked in metadata
- 1-hour cache for robots.txt files per domain

### Retry Logic

- **Perplexity API**: 3 retries with exponential backoff (1s, 2s, 4s)
- **Tavily API**: 3 retries with exponential backoff
- **Document Fetching**: 3 retries per URL
- **Jitter**: Random 0-1s added to backoff delays

### Rate Limiting

- **Perplexity**: 10 requests/minute (configurable)
- **Tavily**: 10 requests/minute (configurable)
- **Document Fetching**: 20 requests/minute (configurable)
- **Implementation**: Bottleneck library with leaky bucket algorithm

## Testing

### Install Dependencies

```bash
cd server
npm install
```

### Test Perplexity Connection

```javascript
// test-research.js
import { ResearchOrchestrator } from './src/agents/researchOrchestrator.js';

const orchestrator = new ResearchOrchestrator();

const testIdea = {
  title: 'AI-powered note-taking app',
  industry: 'Productivity',
  targetAudience: 'Students and professionals',
  keyFeatures: ['Voice-to-text', 'Smart organization']
};

const result = await orchestrator.process({
  normalizedIdea: testIdea,
  ideaId: 'test_001'
}, 'task_test_001');

console.log('Research Pack ID:', result.researchPack._id);
console.log('Documents found:', result.documents.length);
```

```bash
node test-research.js
```

## Monitoring & Observability

### Log Events

All components emit structured logs:

```
[Perplexity] Searching: "Productivity market size growth trends 2025"
[Perplexity] Search completed in 1850ms
[Perplexity] Found 8 citations
[Fetch] Processing: https://example.com/article
[Fetch] Downloaded https://example.com/article (text/html) in 850ms
[Fetch] HTML extraction successful
[Cache] MISS: research:test_001:a1b2c3d4
[Cache] SET: research:test_001:a1b2c3d4 (TTL: 259200s)
[SSE] Event research:doc:fetched sent to job task_test_001
```

### Key Metrics to Monitor

- Research job duration (target: <60s for 20 documents)
- Cache hit rate (target: >40% for repeated ideas)
- Perplexity API latency (typical: 1-3s per query)
- Document fetch success rate (target: >80%)
- Deduplication efficiency (typical: 20-30% reduction)

## Next Steps

1. **Run Tests**: Execute `node test-research.js` to validate setup
2. **Monitor Logs**: Watch console for errors during first run
3. **Check Redis**: Verify cache keys are being created
4. **Integrate**: Connect research orchestrator to your analysis pipeline
5. **Frontend**: Implement SSE event listeners for real-time updates

## Troubleshooting

### "PERPLEXITY_API_KEY is not defined"

Add your Perplexity API key to `.env`:
```env
PERPLEXITY_API_KEY=your_api_key_here
```

### "Redis connection failed"

Ensure Redis is running:
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### "Rate limit exceeded"

Adjust rate limits in `.env`:
```env
PERPLEXITY_RATE_LIMIT=5  # Reduce to 5 req/min
```

### "robots.txt blocking all requests"

Check your User-Agent string in `fetchAndExtract.js`. Some sites block generic bots.

---

**Last Updated**: October 26, 2025  
**Status**: ✅ Implemented and ready for integration
