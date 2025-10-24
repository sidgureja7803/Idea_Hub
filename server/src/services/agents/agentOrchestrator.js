/**
 * Agent Orchestrator - Manages the multi-agent system for idea analysis
 * 
 * This orchestrator coordinates five specialized AI agents:
 * 1. Market Analysis Agent
 * 2. TAM/SAM Analysis Agent
 * 3. Competitive Landscape Agent
 * 4. Feasibility Assessment Agent
 * 5. Strategic Recommendations Agent
 */

import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { RunnableLambda, RunnablePassthrough } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { z } from "zod";

// Import agent-specific tools and prompts
import { marketAnalysisAgent } from "./market-analysis/marketAnalysisAgent.js";
import { tamSamAnalysisAgent } from "./market-analysis/tamSamAnalysisAgent.js";
import { competitiveAnalysisAgent } from "./competition/competitiveAnalysisAgent.js";
import { feasibilityAnalysisAgent } from "./feasibility/feasibilityAnalysisAgent.js";
import { strategyRecommendationsAgent } from "./strategy/strategyRecommendationsAgent.js";

class AgentOrchestrator {
  constructor() {
    this.model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
      temperature: 0.1,
      streaming: true,
    });

    // Initialize the agent graph
    this.initializeAgentGraph();
  }

  async initializeAgentGraph() {
    // Define the LangGraph for sequential agent execution
    this.agentGraph = {
      marketAnalysis: marketAnalysisAgent,
      tamSamAnalysis: tamSamAnalysisAgent,
      competitiveAnalysis: competitiveAnalysisAgent,
      feasibilityAnalysis: feasibilityAnalysisAgent,
      strategyRecommendations: strategyRecommendationsAgent
    };
  }

  // Build context from previous tasks for the next agent
  buildContext(currentTaskName, results, completedTasks) {
    const relevantTasks = completedTasks.filter(taskName => 
        taskName !== currentTaskName
    );

    return relevantTasks.map(taskName => 
        `${this.formatTaskName(taskName)}:\n${JSON.stringify(results[taskName])}`
    ).join('\n\n');
  }

  formatTaskName(taskName) {
    return taskName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  // Analyze an idea using the multi-agent system with streaming
  async analyzeIdea(ideaData, streamCallbacks = {}) {
    const results = {};
    const completedTasks = [];
    const agentNames = Object.keys(this.agentGraph);
    
    // Process each agent sequentially while streaming partial results
    for (const agentName of agentNames) {
      try {
        // Build context from previous agent results
        const context = this.buildContext(agentName, results, completedTasks);
        
        // Stream start of current analysis step
        if (streamCallbacks.onTaskStart) {
          streamCallbacks.onTaskStart(agentName);
        }
        
        // Execute current agent with context from previous agents
        const agentResult = await this.agentGraph[agentName].invoke({
          idea: ideaData,
          context,
        }, {
          callbacks: [{
            handleLLMNewToken(token) {
              if (streamCallbacks.onTokenStream) {
                streamCallbacks.onTokenStream(agentName, token);
              }
            }
          }]
        });
        
        // Save results and mark as completed
        results[agentName] = agentResult;
        completedTasks.push(agentName);
        
        // Stream completion of current analysis step
        if (streamCallbacks.onTaskComplete) {
          streamCallbacks.onTaskComplete(agentName, agentResult);
        }
      } catch (error) {
        console.error(`Error in ${agentName}:`, error);
        
        // Stream error for current analysis step
        if (streamCallbacks.onTaskError) {
          streamCallbacks.onTaskError(agentName, error.message);
        }
        
        // Provide fallback result for this agent to allow others to continue
        results[agentName] = { error: error.message };
        completedTasks.push(agentName);
      }
    }
    
    return {
      status: "completed",
      results
    };
  }

  // Repair malformed JSON from LLM outputs
  repairJsonData(malformedJson) {
    try {
      return JSON.parse(this.cleanupMarkdownCodeFences(malformedJson));
    } catch (error) {
      return this.extractDataFromMalformedJson(malformedJson);
    }
  }

  cleanupMarkdownCodeFences(text) {
    return text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  extractDataFromMalformedJson(text) {
    // Attempt to extract structured data even when JSON is malformed
    try {
      // Find content between curly braces
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return { error: "Failed to parse response" };
    } catch (error) {
      return { error: "Failed to parse response" };
    }
  }
}

export default new AgentOrchestrator();
