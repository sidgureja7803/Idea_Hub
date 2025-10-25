import { BaseAgent } from './baseAgent.js';
import getCerebrasService from '../services/cerebrasService.js';

/**
 * Strategy Advisor Agent
 * Generates strategic recommendations for a business idea using Llama 3.3 70B model
 */
export class StrategyAdvisorAgent extends BaseAgent {
  constructor() {
    super('strategy-advisor');
    this.cerebrasService = getCerebrasService();
  }

  async process(task, taskId) {
    try {
      this.emitEvent(taskId, 'processing', 'Generating strategic recommendations with Llama 3.3 70B');

      const { normalizedIdea, marketResearch, marketSizing, competitionAnalysis } = task;
      
      if (!normalizedIdea) {
        throw new Error('Normalized idea data is required');
      }
      
      const systemPrompt = `You are a Strategic Business Advisor using Llama 3.3 70B on Cerebras infrastructure.
      Your job is to develop comprehensive strategic recommendations for a business idea.
      
      Provide the following:
      1. Go-to-market strategy recommendations
      2. Initial target audience and expansion plan
      3. Recommended pricing strategy
      4. Key differentiators to develop
      5. Strategic partnerships to consider
      6. Growth strategy milestones (6, 12, 24 months)
      7. Potential risks and mitigation strategies
      
      Present the strategic recommendations in a structured format with clear sections.`;
      
      const userPrompt = `
      # Business Idea
      ${JSON.stringify(normalizedIdea, null, 2)}
      
      # Market Research
      ${marketResearch ? JSON.stringify(marketResearch, null, 2) : 'No market research data available.'}
      
      # Market Sizing
      ${marketSizing ? JSON.stringify(marketSizing, null, 2) : 'No market sizing data available.'}
      
      # Competition Analysis
      ${competitionAnalysis ? JSON.stringify(competitionAnalysis, null, 2) : 'No competition analysis data available.'}
      
      Develop a comprehensive strategic plan for this business idea.
      `;
      
      // Emit status update
      this.emitEvent(taskId, 'thinking', 'Developing strategic recommendations using Llama 3.3 70B model');
      
      // Call Cerebras API with the heavy complexity (uses 70B model)
      const strategyResult = await this.cerebrasService.generateStructuredOutput(
        systemPrompt, 
        userPrompt,
        {
          temperature: 0.3,
          max_completion_tokens: 4096
        },
        'heavy'  // Use the "heavy" complexity level to get the 70B model
      );
      
      // Process the result
      let strategyRecommendations;
      try {
        // Try to parse as JSON if the result is structured that way
        strategyRecommendations = JSON.parse(strategyResult);
      } catch (error) {
        // If not JSON, use the raw text
        strategyRecommendations = {
          rawStrategy: strategyResult,
          generatedAt: new Date().toISOString()
        };
      }
      
      // Add metadata
      const result = {
        strategyRecommendations,
        meta: {
          model: "Llama 3.3 70B",
          taskId,
          timestamp: new Date().toISOString(),
          agent: this.agentId
        }
      };
      
      this.emitEvent(taskId, 'completed', 'Strategy recommendations complete');
      
      return result;
    } catch (error) {
      console.error('Error in strategy advisor agent:', error);
      this.emitEvent(taskId, 'error', `Strategy recommendations failed: ${error.message}`);
      throw error;
    }
  }
}

export default StrategyAdvisorAgent;
