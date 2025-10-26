import axios from 'axios';
import Bottleneck from 'bottleneck';
import { SearchTool } from './SearchTool.js';

/**
 * Perplexity search adapter
 * Provides search with answers and citations
 */
export class PerplexitySearchTool extends SearchTool {
  constructor() {
    super();
    
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }

    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseUrl = 'https://api.perplexity.ai';
    
    // Rate limiter: 10 requests per minute by default
    const rateLimit = parseInt(process.env.PERPLEXITY_RATE_LIMIT || '10');
    this.limiter = new Bottleneck({
      minTime: Math.ceil(60000 / rateLimit), // Distribute evenly across minute
      maxConcurrent: 1
    });

    // Axios instance with retry logic
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add retry interceptor with exponential backoff
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const config = error.config;
        
        // Initialize retry count
        if (!config.__retryCount) {
          config.__retryCount = 0;
        }

        // Max 3 retries
        if (config.__retryCount >= 3) {
          console.error(`[Perplexity] Max retries reached for ${config.url}`);
          return Promise.reject(error);
        }

        config.__retryCount += 1;

        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, config.__retryCount) + Math.random() * 1000, 10000);
        
        console.log(`[Perplexity] Retry ${config.__retryCount}/3 after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.client(config);
      }
    );
  }

  /**
   * Execute search via Perplexity API
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<SearchResult[]>}
   */
  async search(query, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`[Perplexity] Searching: "${query}"`);

      // Use rate limiter
      const response = await this.limiter.schedule(() =>
        this.client.post('/chat/completions', {
          model: options.model || 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful research assistant. Provide comprehensive answers with relevant citations.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.2,
          return_citations: true,
          return_related_questions: false
        })
      );

      const duration = Date.now() - startTime;
      console.log(`[Perplexity] Search completed in ${duration}ms`);

      const data = response.data;
      
      // Extract answer and citations
      const answer = data.choices?.[0]?.message?.content || '';
      const citations = data.citations || [];

      // Normalize citations to SearchResult format
      const results = citations.map((citation, index) => 
        this.normalizeResult({ ...citation, answer, index })
      );

      console.log(`[Perplexity] Found ${results.length} citations`);

      return results;

    } catch (error) {
      console.error('[Perplexity] Search error:', error.message);
      
      if (error.response) {
        console.error('[Perplexity] Response status:', error.response.status);
        console.error('[Perplexity] Response data:', error.response.data);
      }

      throw new Error(`Perplexity search failed: ${error.message}`);
    }
  }

  /**
   * Normalize Perplexity citation to standard SearchResult format
   * @param {object} rawResult - Raw citation from Perplexity
   * @returns {SearchResult}
   */
  normalizeResult(rawResult) {
    try {
      const url = new URL(rawResult.url || rawResult.link || '');
      const domain = url.hostname.replace('www.', '');

      return {
        url: rawResult.url || rawResult.link,
        title: rawResult.title || domain,
        snippet: rawResult.snippet || rawResult.text || '',
        content: rawResult.answer || '', // Include answer for context
        metadata: {
          domain,
          source: 'perplexity',
          fetchedAt: new Date(),
          score: rawResult.score || 1.0 - (rawResult.index || 0) * 0.1, // Higher score for earlier citations
          citationIndex: rawResult.index
        }
      };
    } catch (error) {
      console.error('[Perplexity] Error normalizing result:', error.message);
      
      // Fallback normalization
      return {
        url: rawResult.url || rawResult.link || 'unknown',
        title: rawResult.title || 'Untitled',
        snippet: rawResult.snippet || rawResult.text || '',
        content: rawResult.answer || '',
        metadata: {
          domain: 'unknown',
          source: 'perplexity',
          fetchedAt: new Date(),
          score: 0.5
        }
      };
    }
  }
}

export default PerplexitySearchTool;
