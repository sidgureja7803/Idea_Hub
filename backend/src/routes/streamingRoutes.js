const express = require('express');
const router = express.Router();
const streamingController = require('../controllers/streamingController');

// OpenRouter chat endpoint
router.post('/chat', streamingController.getChatCompletion);

module.exports = router;