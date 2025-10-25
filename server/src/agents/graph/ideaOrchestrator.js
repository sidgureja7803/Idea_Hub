import { v4 as uuidv4 } from 'uuid';
import { StateGraph, END } from '@langchain/langgraph';
import { IdeaNormalizerAgent } from '../ideaNormalizer.js';
import { MarketSearcherAgent } from '../marketSearcher.js';
import { MarketSizerAgent } from '../marketSizer.js';
import { CompetitionAnalyzerAgent } from '../competitionAnalyzer.js';
import { StrategyAdvisorAgent } from '../strategyAdvisor.js';
import socketManager from '../../utils/socketManager.js';
import appwriteService from '../../services/appwriteService.js';

/**
 * IdeaOrchestrator class that manages the sequential execution of agents
 * using LangGraph's StateGraph
 */
export class IdeaOrchestrator {
  constructor() {
    // Initialize all agents according to the 5-agent system
    this.ideaNormalizerAgent = new IdeaNormalizerAgent();
    this.marketSearcherAgent = new MarketSearcherAgent();
    this.marketSizerAgent = new MarketSizerAgent();
    this.competitionAnalyzerAgent = new CompetitionAnalyzerAgent();
    this.strategyAdvisorAgent = new StrategyAdvisorAgent();
    
    // Create state graph
    this.graph = this.buildGraph();
  }

  /**
   * Build the LangGraph StateGraph for orchestrating agents
   * @returns {StateGraph} - LangGraph state graph
   */
  buildGraph() {
    // Define the state schema
    const stateSchema = {
      taskId: { type: 'string' },
      idea: { type: 'string' },
      normalizedIdea: { type: 'object', default: null },
      marketResearch: { type: 'object', default: null },
      marketSizing: { type: 'object', default: null },
      competitionAnalysis: { type: 'object', default: null },
      strategyRecommendations: { type: 'object', default: null },
      error: { type: 'string', default: null }
    };
    
    // Create state graph
    const graph = new StateGraph({
      channels: stateSchema
    });
    
    // Define nodes for each agent
    graph.addNode('normalizeIdea', async (state) => {
      try {
        // Update job status
        await appwriteService.saveJobStatus(state.taskId, {
          status: 'processing',
          step: 'normalize',
          progress: 10,
          message: 'Normalizing idea with Llama 3 8B'
        });
        
        const normalizedIdea = await this.ideaNormalizerAgent.run(
          { idea: state.idea }, 
          state.taskId
        );
        return { normalizedIdea };
      } catch (error) {
        return { error: `Error normalizing idea: ${error.message}` };
      }
    });
    
    graph.addNode('searchMarket', async (state) => {
      try {
        if (state.error) return { error: state.error };
        
        // Update job status
        await appwriteService.saveJobStatus(state.taskId, {
          status: 'processing',
          step: 'market_research',
          progress: 30,
          message: 'Conducting market research with Llama 3.3 70B'
        });
        
        const marketResearchResult = await this.marketSearcherAgent.run(
          { normalizedIdea: state.normalizedIdea }, 
          state.taskId
        );
        return { marketResearch: marketResearchResult };
      } catch (error) {
        return { error: `Error searching market: ${error.message}` };
      }
    });
    
    graph.addNode('sizeMarket', async (state) => {
      try {
        if (state.error) return { error: state.error };
        
        // Update job status
        await appwriteService.saveJobStatus(state.taskId, {
          status: 'processing',
          step: 'market_sizing',
          progress: 50,
          message: 'Calculating market size with Llama 3 8B'
        });
        
        const marketSizing = await this.marketSizerAgent.run(
          { 
            normalizedIdea: state.normalizedIdea, 
            marketResearch: state.marketResearch.marketResearch
          }, 
          state.taskId
        );
        return { marketSizing };
      } catch (error) {
        return { error: `Error sizing market: ${error.message}` };
      }
    });

    graph.addNode('analyzeCompetition', async (state) => {
      try {
        if (state.error) return { error: state.error };
        
        // Update job status
        await appwriteService.saveJobStatus(state.taskId, {
          status: 'processing',
          step: 'competition',
          progress: 70,
          message: 'Analyzing competition with Llama 3.3 70B'
        });
        
        const competitionAnalysis = await this.competitionAnalyzerAgent.run(
          { 
            normalizedIdea: state.normalizedIdea,
            marketResearch: state.marketResearch.marketResearch,
            marketSizing: state.marketSizing
          }, 
          state.taskId
        );
        return { competitionAnalysis };
      } catch (error) {
        return { error: `Error analyzing competition: ${error.message}` };
      }
    });

    graph.addNode('recommendStrategy', async (state) => {
      try {
        if (state.error) return { error: state.error };
        
        // Update job status
        await appwriteService.saveJobStatus(state.taskId, {
          status: 'processing',
          step: 'strategy',
          progress: 90,
          message: 'Developing strategy recommendations with Llama 3.3 70B'
        });
        
        const strategyRecommendations = await this.strategyAdvisorAgent.run(
          { 
            normalizedIdea: state.normalizedIdea,
            marketResearch: state.marketResearch.marketResearch,
            marketSizing: state.marketSizing,
            competitionAnalysis: state.competitionAnalysis
          }, 
          state.taskId
        );
        return { strategyRecommendations };
      } catch (error) {
        return { error: `Error generating strategy: ${error.message}` };
      }
    });
    
    // Define the flow for all 5 agents
    graph.addEdge('normalizeIdea', 'searchMarket');
    graph.addEdge('searchMarket', 'sizeMarket');
    graph.addEdge('sizeMarket', 'analyzeCompetition');
    graph.addEdge('analyzeCompetition', 'recommendStrategy');
    graph.addEdge('recommendStrategy', END);
    
    // Add conditional routing for errors
    graph.addConditionalEdges(
      'normalizeIdea',
      (state) => {
        return state.error ? END : 'searchMarket';
      }
    );
    
    graph.addConditionalEdges(
      'searchMarket',
      (state) => {
        return state.error ? END : 'sizeMarket';
      }
    );
    
    graph.addConditionalEdges(
      'sizeMarket',
      (state) => {
        return state.error ? END : 'analyzeCompetition';
      }
    );

    graph.addConditionalEdges(
      'analyzeCompetition',
      (state) => {
        return state.error ? END : 'recommendStrategy';
      }
    );
    
    // Set the entry point
    graph.setEntryPoint('normalizeIdea');
    
    return graph.compile();
  }

  /**
   * Run the orchestrator with a given idea
   * @param {string} idea - The business idea to analyze
   * @param {string} taskId - Optional task ID, generated if not provided
   * @returns {Promise<Object>} - The final state with all agent results
   */
  async run(idea, taskId = uuidv4()) {
    // Validate input
    if (!idea || typeof idea !== 'string') {
      throw new Error('Invalid input: idea must be a string');
    }
    
    // Initialize job status in Appwrite
    await appwriteService.saveJobStatus(taskId, {
      status: 'initiated',
      progress: 0,
      message: 'Starting idea analysis',
      createdAt: new Date().toISOString()
    });
    
    // Emit orchestration start event
    socketManager.emitAgentEvent({
      taskId,
      agentId: 'orchestrator',
      step: 'start',
      message: `Starting analysis of business idea`,
      timestamp: new Date().toISOString(),
    });
    
    try {
      // Initialize state
      const initialState = {
        taskId,
        idea,
      };
      
      // Execute the graph
      const { state } = await this.graph.invoke(initialState);
      
      // Check for errors
      if (state.error) {
        // Update job status with error
        await appwriteService.saveJobStatus(taskId, {
          status: 'failed',
          progress: 100,
          error: state.error,
          message: 'Analysis failed: ' + state.error
        });
        
        socketManager.emitAgentEvent({
          taskId,
          agentId: 'orchestrator',
          step: 'error',
          message: state.error,
          timestamp: new Date().toISOString(),
        });
        throw new Error(state.error);
      }
      
      // Create final result
      const result = {
        taskId,
        idea: state.idea,
        normalizedIdea: state.normalizedIdea,
        marketResearch: state.marketResearch?.marketResearch || null,
        marketSizing: state.marketSizing || null,
        competitionAnalysis: state.competitionAnalysis || null,
        strategyRecommendations: state.strategyRecommendations || null,
        timestamp: new Date().toISOString(),
      };
      
      // Update job status to completed
      await appwriteService.saveJobStatus(taskId, {
        status: 'completed',
        progress: 100,
        message: 'Analysis complete',
        completedAt: new Date().toISOString()
      });
      
      // Emit completion event
      socketManager.emitAgentEvent({
        taskId,
        agentId: 'orchestrator',
        step: 'complete',
        message: 'Business idea analysis complete',
        timestamp: new Date().toISOString(),
      });
      
      socketManager.emitOrchestrationComplete(taskId, result);
      
      return result;
    } catch (error) {
      console.error('Error in orchestration:', error);
      
      // Update job status with error
      await appwriteService.saveJobStatus(taskId, {
        status: 'failed',
        progress: 100,
        error: error.message,
        message: 'Orchestration failed: ' + error.message
      });
      
      socketManager.emitAgentEvent({
        taskId,
        agentId: 'orchestrator',
        step: 'error',
        message: `Orchestration failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}

// Export singleton instance
export default new IdeaOrchestrator();