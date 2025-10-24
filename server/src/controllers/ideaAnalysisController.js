import { v4 as uuidv4 } from 'uuid';
import ideaOrchestrator from '../agents/graph/ideaOrchestrator.js';

/**
 * Run a full idea analysis using the orchestrator
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const runIdeaAnalysis = async (req, res, next) => {
  try {
    const { idea } = req.body;
    
    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'The idea parameter is required and must be a string' 
      });
    }
    
    // Generate a task ID
    const taskId = uuidv4();
    
    // Start the orchestration as a background task to allow for streaming
    // Just send back the taskId immediately
    res.status(202).json({
      taskId,
      message: 'Idea analysis started',
      status: 'processing',
    });
    
    // Run the orchestrator (this will emit events via websocket)
    ideaOrchestrator.run(idea, taskId)
      .catch(error => {
        console.error('Error during orchestration:', error);
        // Error handling is done within the orchestrator via websocket events
      });
      
  } catch (error) {
    next(error);
  }
};

/**
 * Get the status of an idea analysis
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getIdeaAnalysisStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'The taskId parameter is required' 
      });
    }
    
    // In a real implementation, we would query the database to get the status
    // For now, we'll just return a placeholder
    
    res.json({
      taskId,
      status: 'Check WebSocket events for real-time updates',
      message: 'Use the WebSocket connection to get real-time updates for this task',
    });
    
  } catch (error) {
    next(error);
  }
};
