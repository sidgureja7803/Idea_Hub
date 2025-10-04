/**
 * Cerebras LLM Service
 * Provides LLM functionality using Cerebras API for Llama model inference
 * Optimized for hackathon to demonstrate Cerebras platform with Llama models
 */

import Cerebras from '@cerebras/cerebras_cloud_sdk';

// Available Llama models on Cerebras platform
const LLAMA_MODELS = {
  LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct',
  LLAMA_3_70B: 'meta-llama/llama-3-70b-instruct',
  LLAMA_2_7B: 'meta-llama/llama-2-7b-chat',
  LLAMA_2_13B: 'meta-llama/llama-2-13b-chat',
  LLAMA_2_70B: 'meta-llama/llama-2-70b-chat',
  LLAMA_4_MAVERICK: 'llama-4-maverick-17b-128e-instruct'
};

// Task complexity categories
const TASK_COMPLEXITY = {
  LIGHT: 'light',   // Simple tasks, can use smaller models or local inference
  MEDIUM: 'medium', // Moderate complexity, use mid-sized models
  HEAVY: 'heavy'    // Complex reasoning, use largest models available
};

class CerebrasService {
  constructor() {
    // Check for API key
    if (!process.env.CEREBRAS_API_KEY) {
      throw new Error('CEREBRAS_API_KEY environment variable is required for CerebrasService');
    }
    
    // Initialize Cerebras client
    this.cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY
    });
    
    // Metrics tracking
    this.metrics = {
      totalCalls: 0,
      totalTokens: 0,
      totalLatency: 0,
      callsByModel: {},
      callsByComplexity: {
        [TASK_COMPLEXITY.LIGHT]: 0,
        [TASK_COMPLEXITY.MEDIUM]: 0,
        [TASK_COMPLEXITY.HEAVY]: 0
      },
      errors: 0,
      startTime: Date.now()
    };
    
    // Default model configuration - using Llama 3 8B for most tasks
    this.defaultConfig = {
      model: LLAMA_MODELS.LLAMA_3_8B,
      max_completion_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9
    };
    
    // Model configurations by complexity
    this.modelConfigs = {
      [TASK_COMPLEXITY.LIGHT]: {
        model: LLAMA_MODELS.LLAMA_3_8B,
        max_completion_tokens: 2048,
        temperature: 0.7
      },
      [TASK_COMPLEXITY.MEDIUM]: {
        model: LLAMA_MODELS.LLAMA_3_8B,
        max_completion_tokens: 4096,
        temperature: 0.7
      },
      [TASK_COMPLEXITY.HEAVY]: {
        model: LLAMA_MODELS.LLAMA_3_70B,
        max_completion_tokens: 8192,
        temperature: 0.5
      }
    };
    
    console.log(`🦙 Cerebras service initialized with Llama models`);
    console.log(`📊 Available models: ${Object.values(LLAMA_MODELS).join(', ')}`);
  }

  /**
   * Get metrics about Cerebras API usage
   * @returns {Object} Current metrics
   */
  getMetrics() {
    const runtimeMs = Date.now() - this.metrics.startTime;
    const avgLatency = this.metrics.totalCalls > 0 
      ? this.metrics.totalLatency / this.metrics.totalCalls 
      : 0;
    
    return {
      ...this.metrics,
      runtimeMs,
      avgLatencyMs: avgLatency,
      callsPerMinute: this.metrics.totalCalls / (runtimeMs / 60000),
      uptime: this._formatTime(runtimeMs)
    };
  }
  
  /**
   * Format milliseconds into human-readable time
   * @private
   */
  _formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  
  /**
   * Determine if a task should use local processing instead of API call
   * @private
   */
  _shouldUseLocalProcessing(complexity, messageLength) {
    // For hackathon demo, we'll use Cerebras for everything
    // In production, you might implement logic based on:
    // - Message length (short messages could be processed locally)
    // - Time of day (cost optimization)
    // - Current load/throughput
    return false;
  }
  
  /**
   * Select the appropriate model configuration based on task complexity
   * @private
   */
  _selectModelConfig(complexity = TASK_COMPLEXITY.MEDIUM, options = {}) {
    // Use specified complexity or default to medium
    const configForComplexity = this.modelConfigs[complexity] || this.modelConfigs[TASK_COMPLEXITY.MEDIUM];
    
    // Merge with default config and any provided options
    return { ...this.defaultConfig, ...configForComplexity, ...options };
  }

  /**
   * Generate a chat completion (non-streaming)
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Optional configuration overrides
   * @param {string} complexity - Task complexity (light, medium, heavy)
   * @returns {Promise<string>} The generated response content
   */
  async generateCompletion(messages, options = {}, complexity = TASK_COMPLEXITY.MEDIUM) {
    const startTime = Date.now();
    
    try {
      // Select model configuration based on complexity
      const config = this._selectModelConfig(complexity, options);
      const modelName = config.model;
      
      // Update metrics before API call
      this.metrics.totalCalls++;
      this.metrics.callsByComplexity[complexity]++;
      
      // Track calls by model
      if (!this.metrics.callsByModel[modelName]) {
        this.metrics.callsByModel[modelName] = 0;
      }
      this.metrics.callsByModel[modelName]++;
      
      // Check if we should use local processing (for demo, always use Cerebras)
      const messageLength = JSON.stringify(messages).length;
      if (this._shouldUseLocalProcessing(complexity, messageLength)) {
        // In a real implementation, you would have local processing logic here
        // For the hackathon, we'll always use Cerebras
      }
      
      console.log(`🦙 Using Llama model via Cerebras: ${modelName} (complexity: ${complexity})`);
      
      const response = await this.cerebras.chat.completions.create({
        messages,
        ...config,
        stream: false
      });
      
      // Update metrics after successful API call
      const latency = Date.now() - startTime;
      this.metrics.totalLatency += latency;
      
      // Track token usage if available
      if (response.usage) {
        this.metrics.totalTokens += (response.usage.total_tokens || 0);
      }
      
      console.log(`✅ Cerebras API call completed in ${latency}ms`);
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      // Update error metrics
      this.metrics.errors++;
      
      console.error('Cerebras completion error:', error);
      throw new Error(`Cerebras API error: ${error.message}`);
    }
  }

  /**
   * Generate a streaming chat completion
   * @param {Array} messages - Array of message objects with role and content
   * @param {Function} onToken - Callback function for each token received
   * @param {Object} options - Optional configuration overrides
   * @param {string} complexity - Task complexity (light, medium, heavy)
   * @returns {Promise<void>}
   */
  async generateStreamingCompletion(messages, onToken, options = {}, complexity = TASK_COMPLEXITY.MEDIUM) {
    const startTime = Date.now();
    let tokenCount = 0;
    
    try {
      // Select model configuration based on complexity
      const config = this._selectModelConfig(complexity, options);
      const modelName = config.model;
      
      // Update metrics before API call
      this.metrics.totalCalls++;
      this.metrics.callsByComplexity[complexity]++;
      
      // Track calls by model
      if (!this.metrics.callsByModel[modelName]) {
        this.metrics.callsByModel[modelName] = 0;
      }
      this.metrics.callsByModel[modelName]++;
      
      console.log(`🦙 Using Llama model via Cerebras (streaming): ${modelName} (complexity: ${complexity})`);
      
      const stream = await this.cerebras.chat.completions.create({
        messages,
        ...config,
        stream: true
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token && onToken) {
          tokenCount++;
          onToken(token);
        }
      }
      
      // Update metrics after successful streaming
      const latency = Date.now() - startTime;
      this.metrics.totalLatency += latency;
      this.metrics.totalTokens += tokenCount;
      
      console.log(`✅ Cerebras streaming completed in ${latency}ms (tokens: ~${tokenCount})`);
    } catch (error) {
      // Update error metrics
      this.metrics.errors++;
      
      console.error('Cerebras streaming error:', error);
      throw new Error(`Cerebras streaming API error: ${error.message}`);
    }
  }

  /**
   * Generate structured output using a system prompt and user input
   * @param {string} systemPrompt - System prompt for the AI
   * @param {string} userInput - User input/prompt
   * @param {Object} options - Optional configuration overrides
   * @param {string} complexity - Task complexity (light, medium, heavy)
   * @returns {Promise<string>} The generated response
   */
  async generateStructuredOutput(systemPrompt, userInput, options = {}, complexity = TASK_COMPLEXITY.MEDIUM) {
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userInput
      }
    ];

    return await this.generateCompletion(messages, options, complexity);
  }

  /**
   * Analyze business idea with structured approach
   * @param {Object} ideaData - Business idea data
   * @param {string} analysisType - Type of analysis to perform
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<string>} Analysis result
   */
  async analyzeBusinessIdea(ideaData, analysisType, options = {}) {
    // Map analysis types to complexity levels and prompts
    const analysisConfigs = {
      normalize: {
        complexity: TASK_COMPLEXITY.MEDIUM,
        prompt: `You are an expert startup analyst using Llama models on Cerebras infrastructure. 
        Analyze the following startup idea and extract structured metadata.
        Focus on clarity, market potential, and technical feasibility. Be concise and professional.`
      },
      
      marketResearch: {
        complexity: TASK_COMPLEXITY.HEAVY,
        prompt: `You are an expert market researcher using Llama models on Cerebras infrastructure.
        Analyze data for this business idea and provide comprehensive market analysis including 
        trends, competitors, and opportunities. Use chain-of-thought reasoning to reach conclusions.`
      },
      
      tamSam: {
        complexity: TASK_COMPLEXITY.HEAVY,
        prompt: `You are a market sizing expert using Llama models on Cerebras infrastructure.
        Calculate TAM, SAM, and SOM for this startup idea. Provide specific dollar amounts and 
        methodology. Show your reasoning step by step.`
      },
      
      culturalFit: {
        complexity: TASK_COMPLEXITY.MEDIUM,
        prompt: `Using Llama models on Cerebras infrastructure, analyze the cultural alignment 
        and consumer appeal for this startup idea. Provide insights on trend relevance and 
        target demographic preferences.`
      },
      
      competition: {
        complexity: TASK_COMPLEXITY.HEAVY,
        prompt: `Using Llama models on Cerebras infrastructure, analyze the competitive landscape 
        for this startup idea. Identify key competitors, market positioning, and differentiation 
        opportunities. Use multi-step reasoning to evaluate competitive advantages.`
      }
    };

    // Get the configuration for this analysis type or use normalize as default
    const config = analysisConfigs[analysisType] || analysisConfigs.normalize;
    
    const userInput = typeof ideaData === 'string' 
      ? ideaData 
      : JSON.stringify(ideaData, null, 2);

    return await this.generateStructuredOutput(
      config.prompt,
      userInput, 
      options,
      config.complexity
    );
  }
  
  /**
   * Get available Llama models
   * @returns {Object} Available models
   */
  getAvailableModels() {
    return LLAMA_MODELS;
  }
  
  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalCalls: 0,
      totalTokens: 0,
      totalLatency: 0,
      callsByModel: {},
      callsByComplexity: {
        [TASK_COMPLEXITY.LIGHT]: 0,
        [TASK_COMPLEXITY.MEDIUM]: 0,
        [TASK_COMPLEXITY.HEAVY]: 0
      },
      errors: 0,
      startTime: Date.now()
    };
    return true;
  }
}

// Create and export singleton instance (lazy initialization)
let cerebrasServiceInstance = null;

export default function getCerebrasService() {
  if (!cerebrasServiceInstance) {
    cerebrasServiceInstance = new CerebrasService();
  }
  return cerebrasServiceInstance;
}
