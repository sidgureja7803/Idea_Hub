import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { v4 as uuidv4 } from 'uuid';

class CerebrasClient {
  constructor() {
    this.apiKey = process.env.CEREBRAS_API_KEY;
    this.mockMode = !this.apiKey;
    
    if (this.mockMode) {
      console.warn('⚠️ Cerebras API credentials not found. Running in mock mode.');
    } else {
      // Initialize Cerebras client with the official SDK
      this.cerebras = new Cerebras({
        apiKey: this.apiKey
      });
      console.log('✅ Cerebras API initialized with official SDK');
    }
    
    // Default model configuration
    this.defaultModel = 'llama-3.3-70b';
    this.defaultConfig = {
      max_completion_tokens: 2048,
      temperature: 0.2,
      top_p: 1
    };
  }

  /**
   * Generate text using Cerebras API with official SDK
   * @param {string|Array} input - The prompt string or messages array
   * @param {object} options - Additional options
   * @returns {Promise<{text: string, latencyMs: number}>}
   */
  async generateText(input, options = {}) {
    const startTime = Date.now();
    
    try {
      // If in mock mode, return mock response
      if (this.mockMode) {
        return this._getMockResponse(input, startTime);
      }
      
      // Prepare messages for chat completion
      let messages;
      if (typeof input === 'string') {
        messages = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specialized in startup analysis and business validation.'
          },
          {
            role: 'user',
            content: input
          }
        ];
      } else if (Array.isArray(input)) {
        messages = input;
      } else {
        throw new Error('Input must be a string or array of messages');
      }
      
      // Merge default config with provided options
      const config = {
        ...this.defaultConfig,
        ...options,
        model: options.model || this.defaultModel,
        messages,
        stream: false
      };
      
      console.log(`🦙 Calling Cerebras API with model: ${config.model}`);
      
      // Call Cerebras API using official SDK
      const response = await this.cerebras.chat.completions.create(config);
      
      const latencyMs = Date.now() - startTime;
      const text = response.choices[0]?.message?.content || '';
      
      console.log(`✅ Cerebras API call completed in ${latencyMs}ms`);
      
      return {
        text,
        latencyMs,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error calling Cerebras API:', error.message);
      throw new Error(`Cerebras API error: ${error.message}`);
    }
  }

  /**
   * Generate streaming text using Cerebras API
   * @param {string|Array} input - The prompt string or messages array
   * @param {Function} onToken - Callback for each token
   * @param {object} options - Additional options
   * @returns {Promise<{totalLatencyMs: number}>}
   */
  async generateStreamingText(input, onToken, options = {}) {
    const startTime = Date.now();
    
    try {
      // If in mock mode, simulate streaming
      if (this.mockMode) {
        return this._getMockStreamingResponse(input, onToken, startTime);
      }
      
      // Prepare messages for chat completion
      let messages;
      if (typeof input === 'string') {
        messages = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specialized in startup analysis and business validation.'
          },
          {
            role: 'user',
            content: input
          }
        ];
      } else if (Array.isArray(input)) {
        messages = input;
      } else {
        throw new Error('Input must be a string or array of messages');
      }
      
      // Merge default config with provided options
      const config = {
        ...this.defaultConfig,
        ...options,
        model: options.model || this.defaultModel,
        messages,
        stream: true
      };
      
      console.log(`🦙 Starting Cerebras streaming with model: ${config.model}`);
      
      // Call Cerebras API for streaming
      const stream = await this.cerebras.chat.completions.create(config);
      
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token && onToken) {
          onToken(token);
        }
      }
      
      const totalLatencyMs = Date.now() - startTime;
      console.log(`✅ Cerebras streaming completed in ${totalLatencyMs}ms`);
      
      return { totalLatencyMs };
    } catch (error) {
      console.error('Error in Cerebras streaming:', error.message);
      throw new Error(`Cerebras streaming error: ${error.message}`);
    }
  }
  
  /**
   * Generate mock streaming response
   * @param {string|Array} input - The original input
   * @param {Function} onToken - Token callback
   * @param {number} startTime - Start time for latency calculation
   * @returns {Promise<{totalLatencyMs: number}>}
   */
  async _getMockStreamingResponse(input, onToken, startTime) {
    const mockResponse = await this._getMockResponse(input, startTime);
    const tokens = mockResponse.text.split(' ');
    
    // Simulate streaming by sending tokens with delays
    for (const token of tokens) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onToken(token + ' ');
    }
    
    return { totalLatencyMs: Date.now() - startTime };
  }

  /**
   * Generate mock response when Cerebras API credentials are not available
   * @param {string|Array} input - The original input
   * @param {number} startTime - Start time for latency calculation
   * @returns {Promise<{text: string, latencyMs: number}>}
   */
  _getMockResponse(input, startTime) {
    // Simulate network delay
    const mockLatency = Math.floor(Math.random() * 1500) + 500;
    
    return new Promise(resolve => {
      setTimeout(() => {
        // Generate a deterministic but varied mock response based on the prompt
        const mockResponses = {
          marketSnapshot: {
            text: JSON.stringify({
              marketSize: "$24.5 billion",
              growthRate: "14.3% CAGR",
              keyTrends: [
                "Increasing consumer adoption",
                "Integration with mobile technology",
                "Expansion into emerging markets"
              ],
              majorPlayers: [
                "TechCorp Inc.",
                "InnovateSolutions",
                "MarketLeader Group"
              ],
              summary: "The market shows strong growth potential with increasing digital adoption."
            }, null, 2),
          },
          tam: {
            text: JSON.stringify({
              totalAddressableMarket: "$47.8 billion",
              servicableAddressableMarket: "$18.2 billion",
              servicableObtainableMarket: "$4.5 billion",
              keyDemographics: [
                "Urban professionals (25-45)",
                "Tech-savvy consumers",
                "Enterprise clients (mid-size to large)"
              ],
              growthProjection: "Expected to reach $82.3B by 2029"
            }, null, 2),
          },
          competition: {
            text: JSON.stringify({
              directCompetitors: [
                { name: "CompA", strengths: ["Market leader", "Strong brand"], weaknesses: ["Legacy systems", "Higher costs"] },
                { name: "CompB", strengths: ["Innovative tech", "Lower pricing"], weaknesses: ["Limited reach", "New entrant"] }
              ],
              indirectCompetitors: [
                { name: "AltSolution", differentiator: "Serves adjacent market with overlap" },
                { name: "OldGuard", differentiator: "Traditional solution that could be disrupted" }
              ],
              competitiveAdvantage: "Unique positioning in cost and technology innovation"
            }, null, 2),
          },
          feasibility: {
            text: JSON.stringify({
              technicalFeasibility: {
                score: 8.2,
                challenges: ["API integration complexity", "Scaling infrastructure"],
                solutions: ["Microservice architecture", "Cloud-native deployment"]
              },
              financialFeasibility: {
                score: 7.5,
                initialInvestment: "$750K - $1.2M",
                breakEvenTimeframe: "18-24 months",
                keyMetrics: ["CAC:LTV ratio", "Gross margin"]
              },
              riskAssessment: {
                regulatoryRisks: "Medium",
                marketRisks: "Low-Medium",
                technicalRisks: "Medium"
              }
            }, null, 2),
          },
          aggregator: {
            text: JSON.stringify({
              overallScore: 8.4,
              recommendation: "Proceed with development with focus on differentiators",
              keyInsights: [
                "Strong market potential with healthy growth",
                "Clear competitive advantage in target segments",
                "Manageable technical challenges with modern architecture",
                "Attractive financial projections with reasonable risk"
              ],
              nextSteps: [
                "Develop MVP with core features",
                "Test with early adopters in prime demographic",
                "Refine pricing strategy based on competition",
                "Secure initial funding for 18-month runway"
              ]
            }, null, 2),
          }
        };
        
        // Determine which type of response to return based on input content
        const inputText = typeof input === 'string' ? input : JSON.stringify(input);
        let responseType = 'aggregator';
        if (inputText.toLowerCase().includes('market') && inputText.toLowerCase().includes('snapshot')) {
          responseType = 'marketSnapshot';
        } else if (inputText.toLowerCase().includes('tam') || inputText.toLowerCase().includes('market size')) {
          responseType = 'tam';
        } else if (inputText.toLowerCase().includes('competition') || inputText.toLowerCase().includes('competitor')) {
          responseType = 'competition';
        } else if (inputText.toLowerCase().includes('feasibility') || inputText.toLowerCase().includes('viable')) {
          responseType = 'feasibility';
        }
        
        const response = mockResponses[responseType];
        const latencyMs = Date.now() - startTime;
        
        resolve({
          text: response.text,
          latencyMs
        });
      }, mockLatency);
    });
  }
}

// Export singleton instance
export default new CerebrasClient();
