/**
 * Idea Routes
 * Handles all idea-related API endpoints
 */

const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new idea
router.post('/', ideaController.createIdea);

// Get all ideas for current user
router.get('/my-ideas', ideaController.getUserIdeas);

// Get all public ideas
router.get('/public', ideaController.getPublicIdeas);

// Get idea by ID
router.get('/:ideaId', ideaController.getIdea);

// Update idea
router.put('/:ideaId', ideaController.updateIdea);

// Delete idea
router.delete('/:ideaId', ideaController.deleteIdea);

// Get job status
router.get('/job/:jobId', ideaController.getJobStatus);

module.exports = router;