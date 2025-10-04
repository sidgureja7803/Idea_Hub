import express from 'express';
import Idea from '../models/Idea.js';

const router = express.Router();

// Get analysis results
router.get('/analysis/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const idea = await Idea.findOne({ id: analysisId });
    
    if (!idea) {
      return res.status(404).json({
        message: 'Analysis not found'
      });
    }

    // Return analysis data
    res.json({
      id: idea.id,
      idea: {
        description: idea.description,
        category: idea.category,
        targetAudience: idea.targetAudience,
        problemSolved: idea.problemSolved
      },
      results: idea.results || {},
      status: idea.status,
      createdAt: idea.createdAt
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      message: 'Failed to fetch analysis',
      error: error.message
    });
  }
});

// Get analysis status
router.get('/analysis/:analysisId/status', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const idea = await Idea.findOne({ id: analysisId }).select('status updatedAt');
    
    if (!idea) {
      return res.status(404).json({
        message: 'Analysis not found'
      });
    }

    res.json({
      status: idea.status,
      updatedAt: idea.updatedAt
    });
  } catch (error) {
    console.error('Error fetching analysis status:', error);
    res.status(500).json({
      message: 'Failed to fetch analysis status',
      error: error.message
    });
  }
});

export default router;
