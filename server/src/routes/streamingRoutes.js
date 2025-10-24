import express from 'express';
import streamingController from '../controllers/streamingController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// OpenRouter chat endpoint - using optionalAuth to allow unauthenticated access
router.post('/chat', optionalAuth, streamingController.getChatCompletion);

export default router;