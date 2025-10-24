import { BaseAgent } from './baseAgent.js';
import { AGENT_IDS } from './schema/agentSchema.js';

/**
 * Agent that provides market size estimates (TAM/SAM/SOM)
 * This is a placeholder implementation that returns fake numbers
 */
export class MarketSizerAgent extends BaseAgent {
  constructor() {
    super(AGENT_IDS.MARKET_SIZER);
  }

  /**
   * Generate a random number within a range with specified formatting
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} format - 'millions' or 'billions'
   * @returns {string} - Formatted market size value
   */
  getRandomMarketValue(min, max, format) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    
    if (format === 'billions') {
      return `$${value} billion`;
    } else {
      return `$${value} million`;
    }
  }

  /**
   * Generate random growth rate
   * @param {number} min - Minimum percentage
   * @param {number} max - Maximum percentage
   * @returns {string} - Growth rate with percentage
   */
  getRandomGrowthRate(min, max) {
    const value = (Math.random() * (max - min) + min).toFixed(1);
    return `${value}%`;
  }

  /**
   * Process market sizing
   * @param {Object} task - Task containing normalized idea and market research
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} - Market sizing estimates
   */
  async process(task, taskId) {
    const { normalizedIdea, marketResearch } = task;

    if (!normalizedIdea || !marketResearch) {
      throw new Error('Invalid input: normalizedIdea and marketResearch are required');
    }

    // Emit start event
    this.emitEvent(taskId, 'calculating', `Estimating market size for: ${normalizedIdea.title}`);

    try {
      // In a real implementation, this would use the market research data and possibly
      // additional APIs to calculate realistic market size estimates
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate placeholder market sizing data
      const marketSizing = {
        tam: {
          value: this.getRandomMarketValue(50, 500, 'billions'),
          description: `Total Addressable Market for ${normalizedIdea.industry}`,
          growthRate: this.getRandomGrowthRate(5.0, 15.0),
        },
        sam: {
          value: this.getRandomMarketValue(10, 80, 'billions'),
          description: `Serviceable Available Market for ${normalizedIdea.targetAudience} segment`,
          growthRate: this.getRandomGrowthRate(8.0, 20.0),
        },
        som: {
          value: this.getRandomMarketValue(20, 500, 'millions'),
          description: `Serviceable Obtainable Market in first 3-5 years of operation`,
          growthRate: this.getRandomGrowthRate(15.0, 40.0),
        },
        keyInsights: [
          `The ${normalizedIdea.industry} industry is experiencing strong growth due to increasing demand.`,
          `${normalizedIdea.targetAudience} represents a particularly fast-growing segment of the market.`,
          `Competition is moderate with ${marketResearch.competitors.length} significant players identified.`,
          `Market entry barriers are moderate, with opportunity for innovation.`
        ],
        methodology: 'Top-down market sizing based on industry reports and competitor analysis.'
      };

      // Calculate estimated market share percentage
      const samValue = parseInt(marketSizing.sam.value.replace(/[^0-9]/g, ''));
      const somValue = parseInt(marketSizing.som.value.replace(/[^0-9]/g, ''));
      const marketSharePct = somValue / (samValue * 1000) * 100;
      
      marketSizing.marketShare = {
        percentage: `${marketSharePct.toFixed(2)}%`,
        description: `Estimated market share within the serviceable available market`
      };
      
      // Emit completion event
      this.emitEvent(
        taskId, 
        'calculated', 
        `Market sizing complete: TAM ${marketSizing.tam.value}, SAM ${marketSizing.sam.value}, SOM ${marketSizing.som.value}`,
        'market_sizing'
      );

      return marketSizing;
    } catch (error) {
      console.error('Error in MarketSizerAgent:', error);
      this.emitEvent(taskId, 'error', `Error calculating market size: ${error.message}`);
      throw error;
    }
  }
}
