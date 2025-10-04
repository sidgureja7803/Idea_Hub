# Cerebras Integration in FoundrIQ

This document details how FoundrIQ integrates with the Cerebras Inference API.

## Integration Architecture

FoundrIQ leverages Cerebras' powerful inference capabilities through a dedicated worker process that runs specialized agents for different aspects of startup analysis. The worker communicates with the Cerebras API to perform complex reasoning and analysis tasks.

## Key Features

- **Multi-Agent System**: Cerebras powers multiple specialized agents in our analysis pipeline
- **Asynchronous Processing**: Jobs are queued and processed in the background
- **Metrics Collection**: Latency is tracked for each inference request
- **Fallback Mock Mode**: System can run without Cerebras API keys for development

## Code Implementation

### Cerebras Client

The core integration is handled by our `CerebrasClient` class:

```javascript
import axios from 'axios';

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
      throw new Error(`Cerebras API error: ${error.message}`);
    }
  }
}
```

### Agent Implementation

Each analysis step uses a specialized agent powered by Cerebras:

```javascript
/**
 * Run an agent with Cerebras
 * @param {string} agentName - Name of the agent
 * @param {string} prompt - Prompt to send to Cerebras
 * @returns {Promise<{text: string, latencyMs: number}>}
 */
async function runAgent(agentName, prompt) {
  console.log(`Running ${agentName} agent`);
  return await cerebrasClient.generateText(prompt, {
    temperature: 0.3,
    maxTokens: 2048
  });
}
```

## Performance Metrics

We track performance metrics for all Cerebras inference calls:

```javascript
/**
 * Update global metrics
 * @param {number} latencyMs - Latency in milliseconds
 */
function updateMetrics(latencyMs) {
  metrics.latencies.push(latencyMs);
  metrics.avgLatencyMs = metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length;
}
```

These metrics are exposed via our `/api/metrics` endpoint for monitoring and analysis.

## Example Prompt for Market Analysis

```
Analyze the following startup idea and provide a comprehensive market snapshot:
{
  "description": "A mobile app that connects dog owners with local dog walkers",
  "category": "Marketplace",
  "targetAudience": "Busy urban professionals with dogs",
  "problemSolved": "Dog owners often struggle to find reliable, trustworthy dog walking services"
}
```

## Benefits of Cerebras Integration

1. **Performance**: Fast inference times (avg. 1.5-2s) enable real-time analysis
2. **Structured Outputs**: JSON-formatted responses for consistent data processing
3. **Reliability**: Fallback mock mode ensures the system works in development environments
4. **Scalability**: Can handle multiple concurrent analysis requests
