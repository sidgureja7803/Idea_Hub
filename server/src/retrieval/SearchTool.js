/**
 * Base interface for search tools
 * All search providers (Perplexity, Tavily) implement this interface
 */
export class SearchTool {
  /**
   * Execute a search query
   * @param {string} query - The search query
   * @param {object} options - Search options
   * @returns {Promise<SearchResult[]>} - Normalized search results
   */
  async search(query, options = {}) {
    throw new Error('search() must be implemented by subclass');
  }

  /**
   * Normalize raw API response to standard format
   * @param {any} rawResult - Raw API response
   * @returns {SearchResult} - Normalized result
   */
  normalizeResult(rawResult) {
    throw new Error('normalizeResult() must be implemented by subclass');
  }
}

/**
 * @typedef {Object} SearchResult
 * @property {string} url - URL of the result
 * @property {string} title - Title of the result
 * @property {string} snippet - Short snippet/description
 * @property {string} [content] - Full content if available
 * @property {object} metadata - Additional metadata
 * @property {string} metadata.domain - Domain of the URL
 * @property {string} metadata.source - Source provider (perplexity, tavily)
 * @property {Date} metadata.fetchedAt - When this was fetched
 * @property {number} [metadata.score] - Relevance score if available
 */
