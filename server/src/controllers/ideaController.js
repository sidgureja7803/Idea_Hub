/**
 * Idea Controller
 * Handles idea-related API endpoints
 */

const appwriteService = require('../services/appwriteService');
const ideaOrchestrator = require('../agents/graph/ideaOrchestrator');

/**
 * Create a new idea and start analysis
 */
const createIdea = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    const userId = req.userId; // Extracted from auth middleware
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    // Check free tier limits
    const tierInfo = await appwriteService.checkFreeTierLimit(userId);
    if (tierInfo.reachedLimit) {
      return res.status(403).json({
        success: false,
        message: 'Free tier limit reached. Maximum 5 ideas allowed.'
      });
    }
    
    // Create the idea in database
    const idea = await appwriteService.createIdea({
      userId,
      title,
      description,
      isPublic: isPublic || false
    });
    
    // Start the analysis process with agent orchestration
    const jobId = idea.$id; // Use idea ID as job ID
    
    // Queue the analysis job (this runs asynchronously)
    ideaOrchestrator.run(description, jobId)
      .then(async (result) => {
        // Once analysis is complete, save results to Appwrite
        await appwriteService.saveAnalysisResults(idea.$id, result);
      })
      .catch(async (error) => {
        console.error('Error during idea analysis:', error);
        // Update job status with error
        await appwriteService.saveJobStatus(jobId, {
          status: 'failed',
          error: error.message
        });
      });
    
    // Save initial job status
    await appwriteService.saveJobStatus(jobId, {
      ideaId: idea.$id,
      userId,
      status: 'processing',
      progress: 0
    });
    
    // Return the created idea and job ID
    return res.status(201).json({
      success: true,
      data: {
        idea,
        jobId
      }
    });
    
  } catch (error) {
    console.error('Error creating idea:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get idea by ID
 */
const getIdea = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const userId = req.userId; // Extracted from auth middleware
    
    const idea = await appwriteService.getIdea(ideaId);
    
    // Check if idea exists
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }
    
    // Check if user has access (either owner or public)
    if (idea.userId !== userId && !idea.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get analysis results if available
    const analysisResults = await appwriteService.getAnalysisResults(ideaId);
    
    return res.json({
      success: true,
      data: {
        idea,
        analysisResults: analysisResults ? analysisResults.results : null
      }
    });
    
  } catch (error) {
    console.error('Error getting idea:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all ideas for current user
 */
const getUserIdeas = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from auth middleware
    
    const ideas = await appwriteService.getUserIdeas(userId);
    
    // Return ideas with tier info
    const tierInfo = await appwriteService.checkFreeTierLimit(userId);
    
    return res.json({
      success: true,
      data: {
        ideas,
        tierInfo
      }
    });
    
  } catch (error) {
    console.error('Error getting user ideas:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all public ideas
 */
const getPublicIdeas = async (req, res) => {
  try {
    const ideas = await appwriteService.getPublicIdeas();
    
    return res.json({
      success: true,
      data: ideas
    });
    
  } catch (error) {
    console.error('Error getting public ideas:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update an existing idea
 */
const updateIdea = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { title, description, isPublic } = req.body;
    const userId = req.userId; // Extracted from auth middleware
    
    // Check if idea exists and belongs to user
    const idea = await appwriteService.getIdea(ideaId);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }
    
    if (idea.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update the idea
    const updatedIdea = await appwriteService.updateIdea(ideaId, {
      title,
      description,
      isPublic
    });
    
    return res.json({
      success: true,
      data: updatedIdea
    });
    
  } catch (error) {
    console.error('Error updating idea:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete an idea
 */
const deleteIdea = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const userId = req.userId; // Extracted from auth middleware
    
    // Check if idea exists and belongs to user
    const idea = await appwriteService.getIdea(ideaId);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }
    
    if (idea.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Delete the idea
    await appwriteService.deleteIdea(ideaId);
    
    return res.json({
      success: true,
      message: 'Idea deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting idea:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get job status
 */
const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await appwriteService.getJobStatus(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    return res.json({
      success: true,
      data: job
    });
    
  } catch (error) {
    console.error('Error getting job status:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createIdea,
  getIdea,
  getUserIdeas,
  getPublicIdeas,
  updateIdea,
  deleteIdea,
  getJobStatus
};