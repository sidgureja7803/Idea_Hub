import { Queue } from 'bullmq';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Redis connection options
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined
};

// Define queue names
export const QUEUE_NAMES = {
  IDEA_ANALYSIS: 'idea-analysis'
};

// Create queues
export const ideaAnalysisQueue = new Queue(QUEUE_NAMES.IDEA_ANALYSIS, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: false,
    removeOnFail: false
  }
});

/**
 * Add a job to the idea analysis queue
 * @param {Object} data - Job data including idea information
 * @returns {Promise<Job>} - The created job
 */
export async function enqueueIdeaAnalysis(data) {
  const job = await ideaAnalysisQueue.add('analyze-idea', data);
  console.log(`Job ${job.id} added to queue ${QUEUE_NAMES.IDEA_ANALYSIS}`);
  return job;
}

/**
 * Get a job by ID
 * @param {string} jobId - The job ID
 * @returns {Promise<Job|null>} - The job or null if not found
 */
export async function getJob(jobId) {
  return await ideaAnalysisQueue.getJob(jobId);
}

export default {
  ideaAnalysisQueue,
  enqueueIdeaAnalysis,
  getJob
};
