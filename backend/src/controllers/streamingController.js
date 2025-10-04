/**
 * Streaming Controller
 * Handles real-time streaming of AI agent analysis results
 */

import SSE from 'express-sse';
import agentOrchestrator from '../services/agents/agentOrchestrator.js';

// Create SSE instance for streaming
const analysisStream = new SSE();

// Track ongoing analyses
const ongoingAnalyses = new Map();

/**
 * Controller functions for streaming API endpoints
 */
const streamingController = {
  /**
   * Initialize streaming connection
   */
  initStream: (req, res, next) => {
    const { analysisId } = req.params;
    
    // Setup SSE connection
    analysisStream.init(req, res);
    
    // Send initial connection message
    analysisStream.send({
      event: 'connection',
      data: {
        message: 'Stream connection established',
        analysisId
      }
    });
  },
  
  /**
   * Start streaming analysis
   */
  startAnalysis: async (req, res) => {
    const ideaData = req.body;
    
    try {
      // Generate unique ID for this analysis
      const analysisId = Date.now().toString();
      
      // Store initial state in ongoing analyses
      ongoingAnalyses.set(analysisId, {
        status: 'pending',
        idea: ideaData,
        results: {},
        createdAt: new Date().toISOString()
      });
      
      // Send initial response with analysis ID
      res.status(200).json({
        analysisId,
        status: 'pending',
        message: 'Analysis started'
      });
      
      // Set up streaming callbacks
      const streamCallbacks = {
        onTaskStart: (taskName) => {
          analysisStream.send({
            event: 'taskStart',
            data: {
              analysisId,
              taskName,
              timestamp: new Date().toISOString()
            }
          });
        },
        
        onTokenStream: (taskName, token) => {
          analysisStream.send({
            event: 'token',
            data: {
              analysisId,
              taskName,
              token,
              timestamp: new Date().toISOString()
            }
          });
        },
        
        onTaskComplete: (taskName, result) => {
          // Update ongoing analysis with this result
          const analysis = ongoingAnalyses.get(analysisId);
          if (analysis) {
            analysis.results[taskName] = result;
            ongoingAnalyses.set(analysisId, analysis);
          }
          
          analysisStream.send({
            event: 'taskComplete',
            data: {
              analysisId,
              taskName,
              result,
              timestamp: new Date().toISOString()
            }
          });
        },
        
        onTaskError: (taskName, errorMessage) => {
          analysisStream.send({
            event: 'taskError',
            data: {
              analysisId,
              taskName,
              error: errorMessage,
              timestamp: new Date().toISOString()
            }
          });
        }
      };
      
      // Start the analysis with agent orchestrator (non-blocking)
      agentOrchestrator.analyzeIdea(ideaData, streamCallbacks)
        .then((finalResults) => {
          // Update stored analysis with completed status and results
          ongoingAnalyses.set(analysisId, {
            ...ongoingAnalyses.get(analysisId),
            status: 'completed',
            results: finalResults.results,
            completedAt: new Date().toISOString()
          });
          
          // Send completion event
          analysisStream.send({
            event: 'analysisComplete',
            data: {
              analysisId,
              results: finalResults.results,
              timestamp: new Date().toISOString()
            }
          });
        })
        .catch((error) => {
          console.error('Analysis error:', error);
          
          // Update stored analysis with error status
          ongoingAnalyses.set(analysisId, {
            ...ongoingAnalyses.get(analysisId),
            status: 'error',
            error: error.message,
            completedAt: new Date().toISOString()
          });
          
          // Send error event
          analysisStream.send({
            event: 'analysisError',
            data: {
              analysisId,
              error: error.message,
              timestamp: new Date().toISOString()
            }
          });
        });
      
    } catch (error) {
      console.error('Stream controller error:', error);
      res.status(500).json({
        error: 'Failed to start analysis',
        message: error.message
      });
    }
  },
  
  /**
   * Get analysis result
   */
  getAnalysis: (req, res) => {
    const { analysisId } = req.params;
    
    // Check if analysis exists
    if (ongoingAnalyses.has(analysisId)) {
      res.status(200).json(ongoingAnalyses.get(analysisId));
    } else {
      res.status(404).json({
        error: 'Analysis not found',
        message: `No analysis found with ID: ${analysisId}`
      });
    }
  }
};

export default streamingController;
