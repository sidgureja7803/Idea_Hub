/**
 * Streaming Routes
 * API endpoints for real-time streaming of AI analysis results
 */

import express from 'express';
import streamingController from '../controllers/streamingController.js';

const router = express.Router();

// Initialize streaming connection
router.get('/analysis/stream/:analysisId', streamingController.initStream);

// Start a new analysis
router.post('/analyze-idea', streamingController.startAnalysis);

// Get analysis result
router.get('/analysis/:analysisId', streamingController.getAnalysis);

export default router;
