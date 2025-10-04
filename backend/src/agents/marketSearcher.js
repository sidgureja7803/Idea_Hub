import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { BaseAgent } from './baseAgent.js';
import { AGENT_IDS } from './schema/agentSchema.js';
import getCerebrasService from '../services/cerebrasService.js';
import { z } from 'zod';

/**
 * Schema for market search results
 */
const marketResearchSchema = z.object({
  marketSize: z.string().describe('Estimated market size and growth rate'),
  trends: z.array(z.string()).describe('3-5 key market trends'),
  competitors: z.array(z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().optional(),
  })).describe('3-7 main competitors in this market'),
  insights: z.array(z.string()).describe('3-5 key market insights based on the research'),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
  })).describe('Sources of information used'),
});

/**
 * Agent that performs market research using Tavily API
 */
export class MarketSearcherAgent extends BaseAgent {
  constructor() {
    super(AGENT_IDS.MARKET_SEARCHER);
    
    // Check for API keys
    if (!process.env.TAVILY_API_KEY) {
      throw new Error('TAVILY_API_KEY environment variable is required for MarketSearcherAgent');
    }

    if (!process.env.CEREBRAS_API_KEY) {
      throw new Error('CEREBRAS_API_KEY environment variable is required for MarketSearcherAgent');
    }
    
    // Initialize Tavily search tool
    this.tavilySearch = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 8,
    });

    // Initialize Cerebras service
    this.cerebrasService = getCerebrasService();
    
  }

  /**
   * Create search queries based on the normalized idea
   * @param {Object} normalizedIdea - The normalized idea
   * @returns {string[]} - Array of search queries
   */
  generateSearchQueries(normalizedIdea) {
    const { title, industry, targetAudience, keyFeatures } = normalizedIdea;
    
    // Generate a set of focused search queries
    const queries = [
      `${industry} market size growth trends ${new Date().getFullYear()}`,
      `${title} competitors market analysis ${targetAudience}`,
      `${industry} industry challenges opportunities for ${targetAudience}`,
    ];
    
    // Add feature-specific queries if available
    if (keyFeatures && keyFeatures.length > 0) {
      const featureQuery = `market demand for ${keyFeatures.slice(0, 2).join(', ')} in ${industry}`;
      queries.push(featureQuery);
    }
    
    return queries;
  }

  /**
   * Process the market search
   * @param {Object} task - Task containing the normalized idea
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} - Market research results
   */
  async process(task, taskId) {
    if (!task.normalizedIdea) {
      throw new Error('Invalid input: normalizedIdea is required');
    }

    const normalizedIdea = task.normalizedIdea;
    
    // Emit start event
    this.emitEvent(taskId, 'searching', `Researching market for: ${normalizedIdea.title}`);

    try {
      // Generate search queries
      const searchQueries = this.generateSearchQueries(normalizedIdea);
      
      // Execute searches in parallel
      const searchResults = [];
      
      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        this.emitEvent(taskId, `search_${i+1}`, `Searching for: ${query}`);
        
        // Define domains to prioritize if they exist in normalized idea
        const includeDomains = [];
        if (normalizedIdea.keywords && normalizedIdea.keywords.length > 0) {
          // Extract potential domains from keywords
          const domainKeywords = normalizedIdea.keywords
            .filter(k => k.includes('.com') || k.includes('.org') || k.includes('.io'));
          
          if (domainKeywords.length > 0) {
            includeDomains.push(...domainKeywords);
          }
        }
        
        // Execute search with Tavily
        const queryResults = await this.tavilySearch.invoke(query, {
          include_domains: includeDomains.length > 0 ? includeDomains : undefined
        });
        
        searchResults.push(...queryResults);
        
        this.emitEvent(
          taskId, 
          `search_${i+1}_complete`, 
          `Found ${queryResults.length} results for query ${i+1}`
        );
      }
      
      // Emit event
      this.emitEvent(taskId, 'analyzing', 'Analyzing search results');
      
      // Create system prompt for market research synthesis
      const systemPrompt = `You are an expert market researcher analyzing data for a business idea.

Based on search results, provide a structured market analysis.

Think step-by-step:
1. Analyze the search results to understand the market landscape
2. Identify key market size information and growth trends
3. Extract notable market trends and patterns
4. Identify main competitors and their offerings
5. Synthesize key insights from the research
6. Include source attribution for the information

IMPORTANT: Return ONLY a valid JSON structure with these exact fields:
{
  "marketSize": "Estimated market size and growth rate",
  "trends": ["3-5 key market trends"],
  "competitors": [
    {
      "name": "competitor name",
      "description": "brief description",
      "url": "optional url"
    }
  ],
  "insights": ["3-5 key market insights based on the research"],
  "sources": [
    {
      "title": "source title",
      "url": "optional url"
    }
  ]
}

Do not include any additional text, explanations, or markdown formatting.`;

      // Create user input with business idea and search results
      const userInput = `BUSINESS IDEA:
Title: ${normalizedIdea.title}
Description: ${normalizedIdea.description}
Industry: ${normalizedIdea.industry}
Target Audience: ${normalizedIdea.targetAudience}

SEARCH RESULTS:
${JSON.stringify(searchResults, null, 2)}`;

      // Use Cerebras service to generate structured output
      const response = await this.cerebrasService.generateStructuredOutput(
        systemPrompt,
        userInput,
        { temperature: 0.2 }
      );

      // Parse the JSON response
      let marketResearch;
      try {
        // Clean the response to extract JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          marketResearch = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing Cerebras response:', parseError);
        console.error('Raw response:', response);
        
        // Fallback: create a basic structure
        marketResearch = {
          marketSize: 'Market size analysis unavailable',
          trends: ['Market analysis in progress'],
          competitors: [],
          insights: ['Market research completed with limited data'],
          sources: []
        };
      }

      // Validate the result against our schema
      marketResearch = marketResearchSchema.parse(marketResearch);
      
      // Emit completion event
      this.emitEvent(
        taskId, 
        'analyzed', 
        `Completed market research with ${marketResearch.competitors.length} competitors identified`,
        'market_research'
      );

      // Return both the raw search results and synthesized research
      return {
        rawResults: searchResults,
        marketResearch,
      };
    } catch (error) {
      console.error('Error in MarketSearcherAgent:', error);
      this.emitEvent(taskId, 'error', `Error researching market: ${error.message}`);
      throw error;
    }
  }
}
