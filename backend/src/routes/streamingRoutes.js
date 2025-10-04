import express from 'express';
import streamingController from '../controllers/streamingController.js';

const router = express.Router();

// OpenRouter chat endpoint
router.post('/chat', streamingController.getChatCompletion);

export default router;