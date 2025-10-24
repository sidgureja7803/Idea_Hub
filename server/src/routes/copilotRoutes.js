/**
 * CopilotKit Routes
 * API endpoints for context-aware AI assistance
 */

import express from 'express';
import copilotController from '../controllers/copilotController.js';

const router = express.Router();

// Handle copilot assistance requests
router.post('/copilot/assist', copilotController.handleCopilotRequest);

// Handle copilot action execution
router.post('/copilot/action', copilotController.handleActionRequest);

export default router;
