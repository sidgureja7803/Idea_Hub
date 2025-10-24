import express from 'express';
import { metrics } from '../worker/worker.js';

const router = express.Router();

/**
 * @route GET /api/metrics
 * @desc Get system metrics
 * @access Public
 */
router.get('/metrics', (req, res) => {
  try {
    // Return metrics
    res.json({
      totalRequests: metrics.totalRequests,
      avgLatencyMs: metrics.avgLatencyMs,
      latencies: metrics.latencies
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ message: 'Failed to retrieve metrics', error: error.message });
  }
});

export default router;
