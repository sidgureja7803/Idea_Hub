/**
 * Evidence Extractor Routes
 * API routes for extracting facts and sources from search keywords
 */

import express from 'express';
import { extractEvidence, getExtractionStatus } from '../controllers/evidenceExtractorController.js';

const router = express.Router();

// Health check endpoint
router.get('/status', getExtractionStatus);

// Main evidence extraction endpoint
router.post('/extract', extractEvidence);

// Alternative endpoint for compatibility
router.post('/extract-evidence', extractEvidence);

export default router;

