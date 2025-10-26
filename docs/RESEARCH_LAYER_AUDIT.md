# Research Layer & Orchestrator Implementation Audit

## 📋 Executive Summary

This document tracks the implementation status of the Retrieval Layer and Research Orchestrator for IdeaHub MVP.

**Status Date**: October 26, 2025  
**Overall Progress**: 30% complete

---

## ✅ What Already Exists

### 1. **Infrastructure**
- ✅ Redis connection via BullMQ (`/server/src/queue/queueConfig.js`)
- ✅ Appwrite service for persistence (`/server/src/services/appwriteService.js`)
- ✅ Socket.IO for real-time events (`/server/src/utils/socketManager.js`)
- ✅ Worker queue system with retry logic (BullMQ with exponential backoff)

### 2. **Search Integration**
- ✅ Tavily search adapter implemented (`/server/src/agents/marketSearcher.js`)
  - Configured with `maxResults: 8`
  - Domain filtering support
  - Integrated with MarketSearcherAgent
- ✅ Tavily API key configuration in `.env`

### 3. **Agents & Orchestration**
- ✅ Base agent architecture (`/server/src/agents/baseAgent.js`)
- ✅ IdeaOrchestrator with LangGraph (`/server/src/agents/graph/ideaOrchestrator.js`)
  - Sequential agent execution
  - Error handling and state management
  - Appwrite job status tracking
- ✅ 5 specialized agents:
  - IdeaNormalizerAgent
  - MarketSearcherAgent (uses Tavily)
  - MarketSizerAgent
  - CompetitionAnalyzerAgent
  - StrategyAdvisorAgent

### 4. **AI/LLM Integration**
- ✅ Cerebras service with Llama models (`/server/src/services/cerebrasService.js`)
- ✅ Structured output generation
- ✅ Streaming support

### 5. **Data Models**
- ✅ Appwrite collections: IDEAS, USERS, ANALYSIS_RESULTS, JOBS
- ✅ Job status tracking with progress indicators

---

## ❌ What's Missing (To Implement)

### 1. **Perplexity Integration** ⚠️ PRIORITY
- ❌ Perplexity API adapter (`/server/src/retrieval/perplexity.js`)
  - Answer + citation extraction
  - Normalized result format
  - Error handling and retries
- ❌ Perplexity API key in `.env`
- ❌ Rate limiting for Perplexity API calls

### 2. **Enhanced Tavily Support**
- ❌ Feature flag: `ENABLE_TAVILY` in `.env`
- ❌ Conditional Tavily usage based on flag
- ❌ Merged result handling (Perplexity + Tavily)

### 3. **Content Fetching & Extraction**
- ❌ HTML fetching and extraction (`/server/src/retrieval/fetchAndExtract.js`)
  - Readability library integration
  - Clean text extraction
  - Metadata extraction (title, author, date)
- ❌ PDF parsing (`pdf-parse` or similar)
- ❌ Content hash generation (SHA-256)
  - For deduplication
  - For cache key generation
- ❌ Whitespace normalization
- ❌ robots.txt compliance checking
- ❌ User-Agent header configuration

### 4. **Deduplication & Ranking**
- ❌ Deduplication module (`/server/src/retrieval/dedupeRank.js`)
  - URL canonicalization
  - Content hash deduplication
  - Simple text similarity (cosine/jaccard)
- ❌ Ranking algorithm
  - Recency scoring
  - Domain authority estimation
  - Query overlap calculation
  - Combined ranking score

### 5. **ResearchPack Model**
- ❌ ResearchPack schema/model (`/server/src/models/ResearchPack.js`)
  ```javascript
  {
    ideaId: string,
    researchHash: string,  // Hash of queries + filters
    queries: string[],
    sources: Array<{url, title, domain, fetchedAt}>,
    documents: Array<{
      url, 
      title, 
      content, 
      contentHash, 
      metadata: {author, date, domain}
    }>,
    facts: string[],
    metrics: object,
    assumptions: string[],
    createdAt: Date,
    ttl: Date
  }
  ```
- ❌ Appwrite collection for ResearchPacks
- ❌ CRUD operations for ResearchPacks

### 6. **Redis Caching Layer**
- ❌ Redis cache service (`/server/src/services/cacheService.js`)
  - Cache key scheme: `research:${ideaId}:${researchHash}`
  - TTL: 72 hours (259200 seconds)
  - Cache hit/miss tracking
- ❌ Cache invalidation logic
- ❌ Cache warming strategies

### 7. **SSE Streaming Endpoint**
- ❌ SSE route (`/server/src/routes/researchRoutes.js`)
- ❌ SSE controller (`/server/src/controllers/researchController.js`)
- ❌ Event types:
  - `research:start` - Job initiated
  - `research:query:generated` - Queries created (count)
  - `research:search:perplexity` - Perplexity search complete (count)
  - `research:search:tavily` - Tavily search complete (count, conditional)
  - `research:doc:fetched` - Document fetched (url, title)
  - `research:doc:extracted` - Content extracted (url)
  - `research:dedupe` - Deduplication complete (originalCount, finalCount)
  - `research:ranked` - Ranking complete (topUrls)
  - `research:packed` - ResearchPack saved (id, totalSources, totalDocs)
  - `research:cached` - Cache saved
  - `research:complete` - Job complete
  - `research:error` - Error occurred

### 8. **Research Orchestrator Node** (Enhanced)
- ❌ Refactor `MarketSearcherAgent` into `ResearchOrchestrator`
  - Query expansion logic (idea → 5-7 queries)
  - Multi-provider search (Perplexity + Tavily)
  - Document fetching & extraction
  - Deduplication & ranking
  - ResearchPack persistence
  - Cache integration
  - SSE event emission
- ❌ Integration with existing LangGraph pipeline

### 9. **Reliability & Compliance**
- ❌ Retry logic with exponential backoff + jitter
  - For HTTP requests
  - For API calls
  - Max retries: 3
- ❌ Rate limiting
  - Perplexity: 10 requests/minute
  - Tavily: 10 requests/minute
  - Document fetching: 20 requests/minute
- ❌ robots.txt checker (`/server/src/utils/robotsChecker.js`)
- ❌ Blocked content handling
- ❌ Timeout configuration (30s for fetches)

### 10. **Observability**
- ❌ Structured logging
  - Node timings
  - Retry attempts
  - Cache hits/misses
  - API latencies
- ❌ Metrics collection
  - Research job duration
  - Document fetch success rate
  - Cache hit rate
  - API error rates

### 11. **Environment Variables**
- ❌ Add to `.env.example`:
  ```env
  # Perplexity API (REQUIRED)
  PERPLEXITY_API_KEY=your_perplexity_api_key
  
  # Feature Flags
  ENABLE_TAVILY=false
  
  # Research Configuration
  RESEARCH_CACHE_TTL=259200  # 72 hours in seconds
  RESEARCH_MAX_DOCUMENTS=20
  RESEARCH_FETCH_TIMEOUT=30000  # 30 seconds
  
  # Rate Limits (requests per minute)
  PERPLEXITY_RATE_LIMIT=10
  TAVILY_RATE_LIMIT=10
  FETCH_RATE_LIMIT=20
  ```

### 12. **Dependencies to Add**
```json
{
  "dependencies": {
    "@mozilla/readability": "^0.5.0",
    "jsdom": "^24.0.0",
    "pdf-parse": "^1.1.1",
    "robots-parser": "^3.0.1",
    "bottleneck": "^2.19.5"  // For rate limiting
  }
}
```

---

## 🎯 Implementation Priority

### Phase 1: Core Retrieval (Days 1-2)
1. Perplexity adapter
2. fetchAndExtract (HTML + PDF)
3. Content hash generation
4. Basic dedupeRank

### Phase 2: Persistence & Caching (Day 3)
5. ResearchPack model + Appwrite collection
6. Redis cache service
7. Cache key scheme

### Phase 3: Orchestration (Day 4)
8. Refactor MarketSearcherAgent → ResearchOrchestrator
9. Query expansion logic
10. Multi-provider integration

### Phase 4: Streaming & UX (Day 5)
11. SSE endpoint and events
12. Progress tracking
13. Frontend SSE consumer

### Phase 5: Reliability (Day 6)
14. Retry logic + backoff
15. Rate limiting
16. robots.txt compliance
17. Structured logging

---

## 📊 Acceptance Criteria Checklist

- [ ] Perplexity adapter returns normalized results with citations
- [ ] Tavily integration optional via `ENABLE_TAVILY` flag
- [ ] HTML content extracted cleanly with readability
- [ ] PDF content parsed and text extracted
- [ ] Content hash computed (SHA-256) for all documents
- [ ] URL canonicalization works (removes www, trailing slash, etc.)
- [ ] Duplicate documents filtered by content hash
- [ ] Ranking algorithm prioritizes recent, authoritative sources
- [ ] ResearchPack saved to Appwrite with all required fields
- [ ] Redis caching works with `research:${ideaId}:${researchHash}` key scheme
- [ ] Cache TTL set to 72 hours
- [ ] Repeated/near-identical ideas reuse cached results
- [ ] SSE endpoint streams progress events with counts
- [ ] Research Orchestrator emits events at each step
- [ ] robots.txt respected before fetching
- [ ] Blocked content skipped and logged
- [ ] Retry logic with exponential backoff on failures
- [ ] Rate limits enforced per provider
- [ ] No API keys exposed to client
- [ ] Structured logs show timings and retry counts
- [ ] Pipeline works with Perplexity alone
- [ ] Enabling Tavily augments results without breaking flow

---

## 🔄 Next Steps

1. **Create directory structure**:
   ```
   /server/src/retrieval/
     ├── perplexity.js
     ├── tavily.js
     ├── fetchAndExtract.js
     ├── dedupeRank.js
     └── SearchTool.js (interface)
   ```

2. **Update package.json** with new dependencies

3. **Create ResearchPack model** in `/server/src/models/`

4. **Implement cache service** in `/server/src/services/`

5. **Create SSE routes** in `/server/src/routes/`

6. **Refactor orchestrator** to use new retrieval layer

---

**Last Updated**: October 26, 2025  
**Audited By**: Elite Engineer Agent  
**Status**: Ready for implementation
