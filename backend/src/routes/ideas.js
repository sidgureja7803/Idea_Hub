import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Idea from '../models/Idea.js';
import { processIdeaAnalysis } from '../services/analysisService.js';
import { enqueueIdeaAnalysis } from '../queue/queueConfig.js';
import { requireAuth } from '../middleware/auth.js';
import { checkSearchLimits, trackSearchSubmission } from '../middleware/searchTracking.js';

const router = express.Router();

// Submit new idea for analysis (requires authentication and checks search limits)
router.post('/analyze-idea', requireAuth, checkSearchLimits, async (req, res) => {
  try {
    const { description, category, targetAudience, problemSolved, title } = req.body;

    // Validate required fields
    if (!description || !category || !problemSolved) {
      return res.status(400).json({
        message: 'Missing required fields: description, category, and problemSolved are required'
      });
    }

    // Create new idea record
    const ideaId = uuidv4();
    const idea = new Idea({
      id: ideaId,
      description,
      category,
      targetAudience,
      problemSolved,
      status: 'pending'
    });

    await idea.save();

    // Add idea to job queue
    const ideaData = {
      ideaId,
      description,
      category,
      targetAudience,
      problemSolved
    };
    
    const job = await enqueueIdeaAnalysis(ideaData);

    // Prepare data for tracking
    req.trackedSearch = {
      ideaId,
      jobId: job.id,
      title: title || `${category} Business Idea`,
      description,
      category
    };

    // For backward compatibility, also call the existing analysis service
    // This can be removed once migration to the queue is complete
    if (process.env.LEGACY_PROCESSING === 'true') {
      processIdeaAnalysis(ideaId).catch(error => {
        console.error(`Legacy analysis failed for idea ${ideaId}:`, error);
        // Update idea status to error
        Idea.findOneAndUpdate(
          { id: ideaId },
          { status: 'error' }
        ).exec();
      });
    }

    res.status(201).json({
      message: 'Idea submitted successfully',
      jobId: job.id,
      analysisId: ideaId,
      userStats: req.userStats
    });
  } catch (error) {
    console.error('Error submitting idea:', error);
    res.status(500).json({
      message: 'Failed to submit idea',
      error: error.message
    });
  }
}, trackSearchSubmission);

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

// Get all ideas (for admin/debugging)
router.get('/ideas', async (req, res) => {
  try {
    const ideas = await Idea.find()
      .select('id description category status createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(ideas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({
      message: 'Failed to fetch ideas',
      error: error.message
    });
  }
});

export default router;
