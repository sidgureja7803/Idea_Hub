import { BaseAgent } from './baseAgent.js';
import { AGENT_IDS } from './schema/agentSchema.js';
import PerplexitySearchTool from '../retrieval/perplexity.js';
import TavilySearchTool from '../retrieval/tavily.js';
import ContentFetcher from '../retrieval/fetchAndExtract.js';
import DedupeRanker from '../retrieval/dedupeRank.js';
import ResearchPack from '../models/ResearchPack.js';
import cacheService from '../services/cacheService.js';
import { emitResearchEvent } from '../controllers/researchController.js';
import appwriteService from '../services/appwriteService.js';

export class ResearchOrchestrator extends BaseAgent {
  constructor() {
    super(AGENT_IDS.RESEARCH_ORCHESTRATOR || 'research_orchestrator');
    
    this.perplexity = new PerplexitySearchTool();
    this.tavily = new TavilySearchTool();
    this.fetcher = new ContentFetcher();
    this.ranker = new DedupeRanker();
    this.maxDocuments = parseInt(process.env.RESEARCH_MAX_DOCUMENTS || '20');
    
    cacheService.connect().catch(err => 
      console.warn('[ResearchOrchestrator] Cache connection failed:', err.message)
    );
  }

  generateQueries(normalizedIdea) {
    const { title, industry, targetAudience, keyFeatures } = normalizedIdea;
    return [
      `${industry} market size growth trends ${new Date().getFullYear()}`,
      `${title} competitors market analysis`,
      `${targetAudience} needs ${industry} solutions`,
      `${industry} industry challenges opportunities`,
      `market demand ${keyFeatures?.slice(0, 2).join(' ')} ${industry}`,
      `${title} business model validation`,
      `${industry} startup funding trends`
    ].filter(q => q.length > 10);
  }

  async process(task, taskId) {
    if (!task.normalizedIdea) throw new Error('normalizedIdea required');
    
    const idea = task.normalizedIdea;
    const ideaId = task.ideaId || taskId;
    
    emitResearchEvent(taskId, 'research:start', { message: 'Starting research', ideaId });
    
    try {
      const queries = this.generateQueries(idea);
      const researchHash = cacheService.generateResearchHash(ideaId, queries);
      
      emitResearchEvent(taskId, 'research:query:generated', { count: queries.length, queries });
      
      const cached = await cacheService.get(ideaId, researchHash);
      if (cached) {
        emitResearchEvent(taskId, 'research:cached', { message: 'Using cached results' });
        return cached;
      }
      
      const searchResults = [];
      
      for (const query of queries) {
        const perplexityResults = await this.perplexity.search(query);
        searchResults.push(...perplexityResults);
        emitResearchEvent(taskId, 'research:search:perplexity', { query, count: perplexityResults.length });
        
        if (this.tavily.isEnabled()) {
          const tavilyResults = await this.tavily.search(query);
          searchResults.push(...tavilyResults);
          emitResearchEvent(taskId, 'research:search:tavily', { query, count: tavilyResults.length });
        }
      }
      
      const uniqueUrls = [...new Set(searchResults.map(r => r.url))];
      const documents = [];
      
      for (const url of uniqueUrls.slice(0, this.maxDocuments)) {
        const doc = await this.fetcher.fetchAndExtract(url);
        if (doc && doc.content) {
          documents.push(doc);
          emitResearchEvent(taskId, 'research:doc:fetched', { url, title: doc.title });
        }
      }
      
      const originalCount = documents.length;
      const deduped = this.ranker.deduplicate(documents);
      emitResearchEvent(taskId, 'research:dedupe', { originalCount, finalCount: deduped.length });
      
      const ranked = this.ranker.rank(deduped, queries);
      emitResearchEvent(taskId, 'research:ranked', { topUrls: ranked.slice(0, 5).map(d => d.url) });
      
      const researchPack = await this.createResearchPack(ideaId, researchHash, queries, searchResults, ranked);
      emitResearchEvent(taskId, 'research:packed', { 
        id: researchPack._id, 
        totalSources: searchResults.length, 
        totalDocs: ranked.length 
      });
      
      await cacheService.set(ideaId, researchHash, researchPack);
      emitResearchEvent(taskId, 'research:cached', { message: 'Results cached' });
      
      await appwriteService.saveJobStatus(taskId, {
        researchPackId: researchPack._id.toString(),
        researchComplete: true
      });
      
      emitResearchEvent(taskId, 'research:complete', { researchPackId: researchPack._id });
      
      return { researchPack, documents: ranked };
    } catch (error) {
      console.error('[ResearchOrchestrator] Error:', error);
      emitResearchEvent(taskId, 'research:error', { error: error.message });
      throw error;
    }
  }

  async createResearchPack(ideaId, researchHash, queries, sources, documents) {
    const ttl = new Date(Date.now() + cacheService.ttl * 1000);
    
    const pack = new ResearchPack({
      ideaId,
      researchHash,
      queries,
      sources: sources.map(s => ({
        url: s.url,
        title: s.title,
        domain: s.metadata?.domain,
        fetchedAt: s.metadata?.fetchedAt || new Date()
      })),
      documents: documents.map(d => ({
        url: d.url,
        title: d.title,
        content: d.content?.substring(0, 10000),
        contentHash: d.contentHash,
        metadata: d.metadata
      })),
      facts: [],
      metrics: {},
      assumptions: [],
      ttl
    });
    
    return await pack.save();
  }
}

export default ResearchOrchestrator;
