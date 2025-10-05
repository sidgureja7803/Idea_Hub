/**
 * Idea Routes
 * Handles routes for idea submission, follow-up questions, and idea enhancement
 */

import express from 'express';
import { submitIdea, generateQuestions, enhanceIdea } from '../controllers/ideaController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { checkSearchLimits, trackSearchSubmission } from '../middleware/searchTracking.js';

const router = express.Router();

// Submit new idea for analysis (requires authentication and checks search limits)
router.post('/analyze-idea', requireAuth, checkSearchLimits, submitIdea, trackSearchSubmission);

// Generate follow-up questions based on the initial idea
router.post('/generate-questions', optionalAuth, generateQuestions);

// Enhance the idea based on follow-up question answers
router.post('/enhance-idea', optionalAuth, enhanceIdea);

// Get user's own ideas (search history)
router.get('/my-ideas', requireAuth, async (req, res) => {
  try {
    // This will be handled by the user routes, but we can add a direct endpoint here too
    res.redirect('/api/user/history');
  } catch (error) {
    console.error('Error fetching user ideas:', error);
    res.status(500).json({
      message: 'Failed to fetch user ideas',
      error: error.message
    });
  }
});

export default router;
