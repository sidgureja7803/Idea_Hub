/**
 * Metrics Routes - For hackathon demonstration of Cerebras API usage
 */

import express from 'express';
import getCerebrasService from '../services/cerebrasService.js';

const router = express.Router();

/**
 * @route GET /api/metrics/cerebras
 * @description Get Cerebras API usage metrics
 * @access Public (for hackathon demo)
 */
router.get('/metrics/cerebras', (req, res) => {
  const cerebrasService = getCerebrasService();
  const metrics = cerebrasService.getMetrics();
  
  res.json({
    success: true,
    metrics: {
      ...metrics,
      // Add hackathon-specific fields
      hackathon: {
        platform: 'Cerebras',
        models: Object.entries(metrics.callsByModel || {}).map(([model, calls]) => ({
          model,
          calls,
          percentage: metrics.totalCalls > 0 ? (calls / metrics.totalCalls * 100).toFixed(1) + '%' : '0%'
        })),
        modelArchitecture: 'Llama',
        inferenceInfrastructure: 'Cerebras',
        averageLatencyMs: metrics.avgLatencyMs || 0,
        throughputPerMinute: metrics.callsPerMinute || 0,
      }
    }
  });
});

/**
 * @route GET /api/metrics/models
 * @description Get available Llama models on Cerebras platform
 * @access Public (for hackathon demo)
 */
router.get('/metrics/models', (req, res) => {
  const cerebrasService = getCerebrasService();
  const models = cerebrasService.getAvailableModels();
  
  res.json({
    success: true,
    models: Object.entries(models).map(([key, value]) => ({
      id: key,
      name: value,
      architecture: key.includes('LLAMA') ? 'Llama' : 'Other',
      platform: 'Cerebras'
    }))
  });
});

/**
 * @route POST /api/metrics/reset
 * @description Reset metrics (for demo purposes)
 * @access Public (for hackathon demo)
 */
router.post('/metrics/reset', (req, res) => {
  const cerebrasService = getCerebrasService();
  cerebrasService.resetMetrics();
  
  res.json({
    success: true,
    message: 'Metrics reset successfully'
  });
});

export default router;
