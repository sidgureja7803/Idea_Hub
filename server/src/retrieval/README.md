# Retrieval Layer Documentation

## Overview

The retrieval layer provides a complete research pipeline for the IdeaHub platform. It orchestrates multi-provider search, content extraction, deduplication, ranking, and caching to deliver high-quality research results for startup idea validation.

## Components

### 1. SearchTool.js
**Base interface for search providers**

All search tools implement this interface to ensure consistency:
- `search(query, options)` - Execute search
- `normalizeResult(rawResult)` - Standardize results

### 2. perplexity.js
**Perplexity AI search adapter**

```javascript
import PerplexitySearchTool from './retrieval/perplexity.js';

const perplexity = new PerplexitySearchTool();
const results = await perplexity.search('AI market trends 2025');
```

**Features:**
- Answer + citation extraction
- Rate limiting (10 req/min)
- Retry logic with exponential backoff
- Structured logging

**Configuration:**
```env
PERPLEXITY_API_KEY=your_key_here
PERPLEXITY_RATE_LIMIT=10
```

### 3. tavily.js
**Tavily search adapter with feature flag**

```javascript
import TavilySearchTool from './retrieval/tavily.js';

const tavily = new TavilySearchTool();

if (tavily.isEnabled()) {
  const results = await tavily.search('startup market research');
}
```

**Features:**
- Feature flag support (`ENABLE_TAVILY`)
- Graceful degradation
- Domain filtering
- Rate limiting

**Configuration:**
```env
ENABLE_TAVILY=true
TAVILY_API_KEY=your_key_here
TAVILY_RATE_LIMIT=10
```

### 4. fetchAndExtract.js
**Content fetching and extraction**

```javascript
import ContentFetcher from './retrieval/fetchAndExtract.js';

const fetcher = new ContentFetcher();
const doc = await fetcher.fetchAndExtract('https://example.com/article');

console.log(doc.title);        // "Article Title"
console.log(doc.content);      // Clean extracted text
console.log(doc.contentHash);  // SHA-256 hash
```

**Features:**
- HTML extraction (Mozilla Readability)
- PDF parsing (pdf-parse)
- robots.txt compliance
- Content hash generation
- Metadata extraction
- Rate limiting (20 req/min)
- Retry logic

**Configuration:**
```env
RESEARCH_FETCH_TIMEOUT=30000
FETCH_RATE_LIMIT=20
```

### 5. dedupeRank.js
**Deduplication and ranking**

```javascript
import DedupeRanker from './retrieval/dedupeRank.js';

const ranker = new DedupeRanker();

// Remove duplicates
const unique = ranker.deduplicate(documents);

// Rank by relevance
const ranked = ranker.rank(unique, ['AI', 'market', 'trends']);
```

**Features:**
- URL canonicalization
- Content hash deduplication
- Recency scoring
- Domain authority estimation
- Query overlap calculation

## Usage Examples

### Basic Research Flow

```javascript
import PerplexitySearchTool from './retrieval/perplexity.js';
import ContentFetcher from './retrieval/fetchAndExtract.js';
import DedupeRanker from './retrieval/dedupeRank.js';

// 1. Search
const perplexity = new PerplexitySearchTool();
const searchResults = await perplexity.search('AI market trends');

// 2. Fetch documents
const fetcher = new ContentFetcher();
const documents = await Promise.all(
  searchResults.map(r => fetcher.fetchAndExtract(r.url))
);

// 3. Deduplicate and rank
const ranker = new DedupeRanker();
const unique = ranker.deduplicate(documents);
const ranked = ranker.rank(unique, ['AI', 'market']);

console.log('Top document:', ranked[0].title);
```

### Multi-Provider Search

```javascript
import PerplexitySearchTool from './retrieval/perplexity.js';
import TavilySearchTool from './retrieval/tavily.js';

const perplexity = new PerplexitySearchTool();
const tavily = new TavilySearchTool();

const query = 'startup funding trends';

// Search both providers
const [perplexityResults, tavilyResults] = await Promise.all([
  perplexity.search(query),
  tavily.isEnabled() ? tavily.search(query) : []
]);

// Combine results
const allResults = [...perplexityResults, ...tavilyResults];
```

### With Caching

```javascript
import cacheService from '../services/cacheService.js';
import { ResearchOrchestrator } from '../agents/researchOrchestrator.js';

await cacheService.connect();

const orchestrator = new ResearchOrchestrator();
const ideaId = 'idea_123';
const queries = ['market research', 'competitor analysis'];

// Generate cache key
const researchHash = cacheService.generateResearchHash(ideaId, queries);

// Check cache
let result = await cacheService.get(ideaId, researchHash);

if (!result) {
  // Execute research
  result = await orchestrator.process({ normalizedIdea, ideaId }, taskId);
  
  // Cache result
  await cacheService.set(ideaId, researchHash, result);
}
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              User Request (Idea)                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         Research Orchestrator                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ 1. Generate Queries                          │  │
│  │ 2. Check Cache                               │  │
│  │ 3. Multi-Provider Search                     │  │
│  │    - Perplexity (required)                   │  │
│  │    - Tavily (optional)                       │  │
│  │ 4. Fetch & Extract Documents                 │  │
│  │ 5. Deduplicate                               │  │
│  │ 6. Rank                                      │  │
│  │ 7. Create ResearchPack                       │  │
│  │ 8. Cache Result                              │  │
│  │ 9. Stream Progress (SSE)                     │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         ResearchPack (MongoDB)                      │
│  - ideaId, researchHash                             │
│  - queries, sources, documents                      │
│  - facts, metrics, assumptions                      │
│  - TTL (72 hours)                                   │
└─────────────────────────────────────────────────────┘
```

## Error Handling

All components implement robust error handling:

```javascript
try {
  const doc = await fetcher.fetchAndExtract(url);
  
  if (doc.metadata?.blocked) {
    console.log('Blocked by robots.txt:', url);
  } else if (doc.metadata?.error) {
    console.log('Fetch failed:', doc.metadata.errorMessage);
  } else {
    // Success - use document
  }
} catch (error) {
  // Fatal error - log and continue with next URL
  console.error('Critical error:', error.message);
}
```

## Rate Limiting

All external calls are rate-limited using Bottleneck:

```javascript
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: 6000,    // 10 requests per minute
  maxConcurrent: 1  // Sequential processing
});

await limiter.schedule(() => externalAPICall());
```

## Retry Logic

Exponential backoff with jitter:

```javascript
const delay = Math.min(
  1000 * Math.pow(2, retryCount) + Math.random() * 1000,
  10000 // Max 10 seconds
);
```

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: ~1-2 seconds
- Attempt 3: ~2-3 seconds
- Attempt 4: ~4-5 seconds
- Max: 3 retries

## Logging

All components emit structured logs:

```
[Perplexity] Searching: "AI market trends 2025"
[Perplexity] Search completed in 1850ms
[Perplexity] Found 8 citations
[Fetch] Processing: https://example.com/article
[Fetch] Downloaded (text/html) in 850ms
[Fetch] Blocked by robots.txt: https://blocked-site.com
[Cache] HIT: research:idea_123:a1b2c3d4
[Cache] SET: research:idea_123:a1b2c3d4 (TTL: 259200s)
```

## Testing

```bash
# Run unit tests
npm test

# Test research flow
node test-research.js

# Test specific component
node -e "
import PerplexitySearchTool from './src/retrieval/perplexity.js';
const tool = new PerplexitySearchTool();
const results = await tool.search('test query');
console.log(results);
"
```

## Performance

**Typical Research Job:**
- Queries: 5-7
- Search time: 10-20 seconds
- Document fetching: 20-30 seconds
- Processing: 5-10 seconds
- **Total: 35-60 seconds**

**With Cache:**
- Cache hit: <100ms
- Cache miss: Full pipeline

**Rate Limits:**
- Perplexity: 10 req/min → Max 6 seconds per query
- Tavily: 10 req/min → Max 6 seconds per query
- Fetching: 20 req/min → Max 3 seconds per URL

## Troubleshooting

### "Rate limit exceeded"
Reduce rate limit in .env:
```env
PERPLEXITY_RATE_LIMIT=5
```

### "robots.txt blocking all requests"
Update User-Agent in fetchAndExtract.js or add delays.

### "Redis connection failed"
Start Redis:
```bash
brew services start redis  # macOS
```

### "Perplexity API error"
Check API key and account status.

---

**Version**: 1.0.0  
**Last Updated**: October 26, 2025  
**Status**: Production Ready
