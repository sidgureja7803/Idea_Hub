import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import Bottleneck from 'bottleneck';
import { SearchTool } from './SearchTool.js';

/**
 * Tavily search adapter with feature flag support
 */
export class TavilySearchTool extends SearchTool {
  constructor() {
    super();

    // Check if Tavily is enabled via feature flag
    this.enabled = process.env.ENABLE_TAVILY === 'true';

    if (this.enabled) {
      if (!process.env.TAVILY_API_KEY) {
        console.warn('[Tavily] ENABLE_TAVILY is true but TAVILY_API_KEY is not set. Disabling Tavily.');
        this.enabled = false;
        return;
      }

      // Initialize Tavily search tool
      this.tavilySearch = new TavilySearchResults({
        apiKey: process.env.TAVILY_API_KEY,
        maxResults: parseInt(process.env.TAVILY_MAX_RESULTS || '8'),
        searchDepth: 'advanced'
      });

      // Rate limiter: 10 requests per minute by default
      const rateLimit = parseInt(process.env.TAVILY_RATE_LIMIT || '10');
      this.limiter = new Bottleneck({
        minTime: Math.ceil(60000 / rateLimit),
        maxConcurrent: 1
      });

      console.log('[Tavily] Initialized successfully');
    } else {
      console.log('[Tavily] Disabled via feature flag (ENABLE_TAVILY=false)');
    }
  }

  /**
   * Check if Tavily is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Execute search via Tavily API
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<SearchResult[]>}
   */
  async search(query, options = {}) {
    if (!this.enabled) {
      console.log('[Tavily] Skipping search - disabled');
      return [];
    }

    const startTime = Date.now();

    try {
      console.log(`[Tavily] Searching: "${query}"`);

      // Prepare search options
      const searchOptions = {
        include_domains: options.includeDomains || undefined,
        exclude_domains: options.excludeDomains || undefined,
      };

      // Use rate limiter
      const rawResults = await this.limiter.schedule(() =>
        this.tavilySearch.invoke(query, searchOptions)
      );

      const duration = Date.now() - startTime;
      console.log(`[Tavily] Search completed in ${duration}ms`);

      // Normalize results
      const results = rawResults.map(result => this.normalizeResult(result));

      console.log(`[Tavily] Found ${results.length} results`);

      return results;

    } catch (error) {
      console.error('[Tavily] Search error:', error.message);
      
      // Don't throw - return empty results to allow pipeline to continue
      console.warn('[Tavily] Returning empty results due to error');
      return [];
    }
  }

  /**
   * Normalize Tavily result to standard SearchResult format
   * @param {object} rawResult - Raw result from Tavily
   * @returns {SearchResult}
   */
  normalizeResult(rawResult) {
    try {
      const url = new URL(rawResult.url);
      const domain = url.hostname.replace('www.', '');

      return {
        url: rawResult.url,
        title: rawResult.title || domain,
        snippet: rawResult.content || '',
        content: rawResult.content || '',
        metadata: {
          domain,
          source: 'tavily',
          fetchedAt: new Date(),
          score: rawResult.score || 0.5,
          publishedDate: rawResult.published_date || null
        }
      };
    } catch (error) {
      console.error('[Tavily] Error normalizing result:', error.message);
      
      // Fallback normalization
      return {
        url: rawResult.url || 'unknown',
        title: rawResult.title || 'Untitled',
        snippet: rawResult.content || '',
        content: rawResult.content || '',
        metadata: {
          domain: 'unknown',
          source: 'tavily',
          fetchedAt: new Date(),
          score: 0.5
        }
      };
    }
  }
}

export default TavilySearchTool;
