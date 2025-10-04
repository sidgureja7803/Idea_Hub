/**
 * Cerebras LLM Service
 * Provides LLM functionality using Cerebras API instead of Gemini
 */

import Cerebras from '@cerebras/cerebras_cloud_sdk';

class CerebrasService {
  constructor() {
    // Check for API key
    if (!process.env.CEREBRAS_API_URL) {
      throw new Error('CEREBRAS_API_URL environment variable is required for CerebrasService');
    }
    
    // Initialize Cerebras client
    this.cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_URL
    });
    
    // Default model configuration
    this.defaultConfig = {
      model: 'llama-4-maverick-17b-128e-instruct',
      max_completion_tokens: 32768,
      temperature: 0.6,
      top_p: 0.9
    };
  }

  /**
   * Generate a chat completion (non-streaming)
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<string>} The generated response content
   */
  async generateCompletion(messages, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };
      
      const response = await this.cerebras.chat.completions.create({
        messages,
        ...config,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Cerebras completion error:', error);
      throw new Error(`Cerebras API error: ${error.message}`);
    }
  }

  /**
   * Generate a streaming chat completion
   * @param {Array} messages - Array of message objects with role and content
   * @param {Function} onToken - Callback function for each token received
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<void>}
   */
  async generateStreamingCompletion(messages, onToken, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };
      
      const stream = await this.cerebras.chat.completions.create({
        messages,
        ...config,
        stream: true
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token && onToken) {
          onToken(token);
        }
      }
    } catch (error) {
      console.error('Cerebras streaming error:', error);
      throw new Error(`Cerebras streaming API error: ${error.message}`);
    }
  }

  /**
   * Generate structured output using a system prompt and user input
   * @param {string} systemPrompt - System prompt for the AI
   * @param {string} userInput - User input/prompt
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<string>} The generated response
   */
  async generateStructuredOutput(systemPrompt, userInput, options = {}) {
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

    return await this.generateCompletion(messages, options);
  }

  /**
   * Analyze business idea with structured approach
   * @param {Object} ideaData - Business idea data
   * @param {string} analysisType - Type of analysis to perform
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<string>} Analysis result
   */
  async analyzeBusinessIdea(ideaData, analysisType, options = {}) {
    const systemPrompts = {
      normalize: `You are an expert startup analyst. Analyze the following startup idea and extract structured metadata. 
      Focus on clarity, market potential, and technical feasibility. Be concise and professional.`,
      
      marketResearch: `You are an expert market researcher analyzing data for a business idea. 
      Provide comprehensive market analysis including trends, competitors, and opportunities.`,
      
      tamSam: `You are a market sizing expert. Calculate TAM, SAM, and SOM for startup ideas. 
      Provide specific dollar amounts and methodology.`,
      
      culturalFit: `Analyze the cultural alignment and consumer appeal for startup ideas. 
      Provide insights on trend relevance and target demographic preferences.`,
      
      competition: `Analyze competitive landscape for startup ideas. 
      Identify key competitors, market positioning, and differentiation opportunities.`
    };

    const systemPrompt = systemPrompts[analysisType] || systemPrompts.normalize;
    
    const userInput = typeof ideaData === 'string' 
      ? ideaData 
      : JSON.stringify(ideaData, null, 2);

    return await this.generateStructuredOutput(systemPrompt, userInput, options);
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
