import express from 'express';
import { getJob } from '../queue/queueConfig.js';
import Job from '../models/Job.js';

const router = express.Router();

/**
 * @route GET /api/jobs/:id
 * @desc Get job status and results
 * @access Public
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check MongoDB for job record (which has results)
    const jobRecord = await Job.findById(id);
    
    if (jobRecord) {
      // Format response based on job status
      const response = {
        id: jobRecord._id,
        status: jobRecord.status,
        progress: jobRecord.progress,
        currentStage: jobRecord.currentStage,
        createdAt: jobRecord.createdAt,
        updatedAt: jobRecord.updatedAt
      };
      
      // If job is completed, include results
      if (jobRecord.status === 'completed') {
        response.results = jobRecord.results;
      }
      
      // If job failed, include error
      if (jobRecord.status === 'failed' && jobRecord.results?.error) {
        response.error = jobRecord.results.error.message;
      }
      
      return res.json(response);
    }
    
    // If not in MongoDB, check the queue
    const queueJob = await getJob(id);
    
    if (queueJob) {
      const jobState = await queueJob.getState();
      const jobProgress = await queueJob.progress;
      
      return res.json({
        id: queueJob.id,
        status: jobState === 'active' ? 'processing' : jobState,
        progress: jobProgress || 0,
        currentStage: 'In queue',
        createdAt: new Date(queueJob.timestamp),
        updatedAt: new Date()
      });
    }
    
    // Job not found
    return res.status(404).json({ message: 'Job not found' });
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ message: 'Failed to get job status', error: error.message });
  }
});

export default router;
