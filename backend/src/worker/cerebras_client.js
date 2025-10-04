import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class CerebrasClient {
  constructor() {
    this.apiUrl = process.env.CEREBRAS_API_URL;
    this.apiKey = process.env.CEREBRAS_API_KEY;
    this.mockMode = !this.apiUrl || !this.apiKey;
    
    if (this.mockMode) {
      console.warn('⚠️ Cerebras API credentials not found. Running in mock mode.');
    } else {
      console.log('✅ Cerebras API initialized');
    }
  }

  /**
   * Generate text using Cerebras API
   * @param {string} prompt - The prompt to send to the model
   * @param {object} options - Additional options
   * @returns {Promise<{text: string, latencyMs: number}>}
   */
  async generateText(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
      // If in mock mode, return mock response
      if (this.mockMode) {
        return this._getMockResponse(prompt, startTime);
      }
      
      // Prepare request to Cerebras API
      const response = await axios({
        method: 'post',
        url: this.apiUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          prompt,
          max_tokens: options.maxTokens || 1024,
          temperature: options.temperature || 0.7,
          stream: false
        }
      });
      
      const latencyMs = Date.now() - startTime;
      
      return {
        text: response.data.choices[0].text,
        latencyMs
      };
    } catch (error) {
      console.error('Error calling Cerebras API:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(`Cerebras API error: ${error.message}`);
    }
  }
  
  /**
   * Generate mock response when Cerebras API credentials are not available
   * @param {string} prompt - The original prompt
   * @param {number} startTime - Start time for latency calculation
   * @returns {{text: string, latencyMs: number}}
   */
  _getMockResponse(prompt, startTime) {
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
        
        // Determine which type of response to return based on prompt content
        let responseType = 'aggregator';
        if (prompt.toLowerCase().includes('market') && prompt.toLowerCase().includes('snapshot')) {
          responseType = 'marketSnapshot';
        } else if (prompt.toLowerCase().includes('tam') || prompt.toLowerCase().includes('market size')) {
          responseType = 'tam';
        } else if (prompt.toLowerCase().includes('competition') || prompt.toLowerCase().includes('competitor')) {
          responseType = 'competition';
        } else if (prompt.toLowerCase().includes('feasibility') || prompt.toLowerCase().includes('viable')) {
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
