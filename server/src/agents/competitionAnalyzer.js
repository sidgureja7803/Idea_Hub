import { BaseAgent } from './baseAgent.js';
import getCerebrasService from '../services/cerebrasService.js';

/**
 * Competition Analyzer Agent
 * Analyzes the competitive landscape for a business idea using Llama 3.3 70B model
 */
export class CompetitionAnalyzerAgent extends BaseAgent {
  constructor() {
    super('competition-analyzer');
    this.cerebrasService = getCerebrasService();
  }

  async process(task, taskId) {
    try {
      this.emitEvent(taskId, 'processing', 'Analyzing competitive landscape with Llama 3.3 70B');

      const { normalizedIdea, marketResearch, marketSizing } = task;
      
      if (!normalizedIdea) {
        throw new Error('Normalized idea data is required');
      }
      
      const systemPrompt = `You are a Competition Analysis Expert using Llama 3.3 70B on Cerebras infrastructure.
      Your job is to perform a thorough competitive analysis for a business idea.
      
      Provide the following:
      1. Identify key direct and indirect competitors
      2. Analyze their strengths and weaknesses
      3. Determine market positioning opportunities
      4. Identify key differentiators needed to succeed
      5. Assess barriers to entry
      6. Analyze competitor pricing strategies
      
      Present the analysis in structured format with clear sections.`;
      
      const userPrompt = `
      # Business Idea
      ${JSON.stringify(normalizedIdea, null, 2)}
      
      # Market Research
      ${marketResearch ? JSON.stringify(marketResearch, null, 2) : 'No market research data available.'}
      
      # Market Sizing
      ${marketSizing ? JSON.stringify(marketSizing, null, 2) : 'No market sizing data available.'}
      
      Conduct a comprehensive competitive analysis for this business idea.
      `;
      
      // Emit status update
      this.emitEvent(taskId, 'thinking', 'Analyzing competitors using Llama 3.3 70B model');
      
      // Call Cerebras API with the heavy complexity (uses 70B model)
      const analysisResult = await this.cerebrasService.generateStructuredOutput(
        systemPrompt, 
        userPrompt,
        {
          temperature: 0.2,
          max_completion_tokens: 4096
        },
        'heavy'  // Use the "heavy" complexity level to get the 70B model
      );
      
      // Process the result
      let competitionAnalysis;
      try {
        // Try to parse as JSON if the result is structured that way
        competitionAnalysis = JSON.parse(analysisResult);
      } catch (error) {
        // If not JSON, use the raw text
        competitionAnalysis = {
          rawAnalysis: analysisResult,
          generatedAt: new Date().toISOString()
        };
      }
      
      // Add metadata
      const result = {
        competitionAnalysis,
        meta: {
          model: "Llama 3.3 70B",
          taskId,
          timestamp: new Date().toISOString(),
          agent: this.agentId
        }
      };
      
      this.emitEvent(taskId, 'completed', 'Competition analysis complete');
      
      return result;
    } catch (error) {
      console.error('Error in competition analyzer agent:', error);
      this.emitEvent(taskId, 'error', `Competition analysis failed: ${error.message}`);
      throw error;
    }
  }
}

export default CompetitionAnalyzerAgent;
