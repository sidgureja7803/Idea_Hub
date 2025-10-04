import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import queue configuration
import { QUEUE_NAMES } from '../queue/queueConfig.js';

// Import models
import Job from '../models/Job.js';

// Import Cerebras client
import cerebrasClient from './cerebras_client.js';

// Redis connection options
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined
};

// Initialize MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-buddy')
  .then(() => console.log('Worker connected to MongoDB'))
  .catch(err => {
    console.error('Worker MongoDB connection error:', err);
    process.exit(1);
  });

// Global metrics tracking
const metrics = {
  totalRequests: 0,
  latencies: [],
  avgLatencyMs: 0
};

// Initialize worker
const worker = new Worker(QUEUE_NAMES.IDEA_ANALYSIS, async job => {
  console.log(`Processing job ${job.id}`);
  metrics.totalRequests++;
  
  // Retrieve or create job record in MongoDB
  let jobRecord = await Job.findOne({ _id: job.id });
  if (!jobRecord) {
    jobRecord = new Job({
      _id: job.id,
      ideaData: job.data,
      status: 'processing',
      metrics: {
        startTime: new Date(),
        agentLatencies: {}
      }
    });
    await jobRecord.save();
  } else {
    jobRecord.status = 'processing';
    jobRecord.metrics.startTime = new Date();
    await jobRecord.save();
  }

  try {
    // Update progress
    await job.updateProgress(10);
    await updateJobProgress(jobRecord, 10, 'Starting market analysis');
    
    // Process with pipeline of agents
    const startTime = Date.now();
    
    // 1. Market Snapshot Analysis
    await job.updateProgress(20);
    await updateJobProgress(jobRecord, 20, 'Analyzing market snapshot');
    
    const marketSnapshotResult = await runAgent(
      'marketSnapshot',
      `Analyze the following startup idea and provide a comprehensive market snapshot:
       ${JSON.stringify(job.data, null, 2)}
       
       Format your response as a JSON object with the following structure:
       {
         "marketSize": string,
         "growthRate": string,
         "keyTrends": string[],
         "majorPlayers": string[],
         "summary": string
       }`
    );
    
    jobRecord.results.marketSnapshot = JSON.parse(marketSnapshotResult.text);
    jobRecord.metrics.agentLatencies.marketSnapshot = marketSnapshotResult.latencyMs;
    await jobRecord.save();
    
    // 2. TAM/SAM Analysis
    await job.updateProgress(40);
    await updateJobProgress(jobRecord, 40, 'Calculating market sizing (TAM/SAM/SOM)');
    
    const tamResult = await runAgent(
      'tam',
      `Based on the following startup idea and market snapshot, calculate TAM (Total Addressable Market), 
       SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market):
       
       Idea: ${JSON.stringify(job.data, null, 2)}
       Market Snapshot: ${JSON.stringify(jobRecord.results.marketSnapshot, null, 2)}
       
       Format your response as a JSON object with the following structure:
       {
         "totalAddressableMarket": string,
         "servicableAddressableMarket": string,
         "servicableObtainableMarket": string,
         "keyDemographics": string[],
         "growthProjection": string
       }`
    );
    
    jobRecord.results.tam = JSON.parse(tamResult.text);
    jobRecord.metrics.agentLatencies.tam = tamResult.latencyMs;
    await jobRecord.save();
    
    // 3. Competitive Analysis
    await job.updateProgress(60);
    await updateJobProgress(jobRecord, 60, 'Analyzing competition');
    
    const competitionResult = await runAgent(
      'competition',
      `Based on the following startup idea and market information, conduct a competitive analysis:
       
       Idea: ${JSON.stringify(job.data, null, 2)}
       Market Snapshot: ${JSON.stringify(jobRecord.results.marketSnapshot, null, 2)}
       Market Sizing: ${JSON.stringify(jobRecord.results.tam, null, 2)}
       
       Format your response as a JSON object with the following structure:
       {
         "directCompetitors": [{ "name": string, "strengths": string[], "weaknesses": string[] }],
         "indirectCompetitors": [{ "name": string, "differentiator": string }],
         "competitiveAdvantage": string
       }`
    );
    
    jobRecord.results.competition = JSON.parse(competitionResult.text);
    jobRecord.metrics.agentLatencies.competition = competitionResult.latencyMs;
    await jobRecord.save();
    
    // 4. Feasibility Analysis
    await job.updateProgress(80);
    await updateJobProgress(jobRecord, 80, 'Evaluating feasibility');
    
    const feasibilityResult = await runAgent(
      'feasibility',
      `Based on the following startup idea and analysis, evaluate the technical and financial feasibility:
       
       Idea: ${JSON.stringify(job.data, null, 2)}
       Market Snapshot: ${JSON.stringify(jobRecord.results.marketSnapshot, null, 2)}
       Market Sizing: ${JSON.stringify(jobRecord.results.tam, null, 2)}
       Competition: ${JSON.stringify(jobRecord.results.competition, null, 2)}
       
       Format your response as a JSON object with the following structure:
       {
         "technicalFeasibility": {
           "score": number,
           "challenges": string[],
           "solutions": string[]
         },
         "financialFeasibility": {
           "score": number,
           "initialInvestment": string,
           "breakEvenTimeframe": string,
           "keyMetrics": string[]
         },
         "riskAssessment": {
           "regulatoryRisks": string,
           "marketRisks": string,
           "technicalRisks": string
         }
       }`
    );
    
    jobRecord.results.feasibility = JSON.parse(feasibilityResult.text);
    jobRecord.metrics.agentLatencies.feasibility = feasibilityResult.latencyMs;
    await jobRecord.save();
    
    // 5. Final Aggregation
    await job.updateProgress(90);
    await updateJobProgress(jobRecord, 90, 'Generating final report');
    
    const aggregatorResult = await runAgent(
      'aggregator',
      `Based on the complete analysis, generate a comprehensive summary and recommendations:
       
       Idea: ${JSON.stringify(job.data, null, 2)}
       Market Snapshot: ${JSON.stringify(jobRecord.results.marketSnapshot, null, 2)}
       Market Sizing: ${JSON.stringify(jobRecord.results.tam, null, 2)}
       Competition: ${JSON.stringify(jobRecord.results.competition, null, 2)}
       Feasibility: ${JSON.stringify(jobRecord.results.feasibility, null, 2)}
       
       Format your response as a JSON object with the following structure:
       {
         "overallScore": number,
         "recommendation": string,
         "keyInsights": string[],
         "nextSteps": string[]
       }`
    );
    
    jobRecord.results.aggregated = JSON.parse(aggregatorResult.text);
    jobRecord.metrics.agentLatencies.aggregator = aggregatorResult.latencyMs;
    
    // Calculate total duration
    const totalDuration = Date.now() - startTime;
    jobRecord.metrics.totalDurationMs = totalDuration;
    jobRecord.metrics.endTime = new Date();
    
    // Update job status
    jobRecord.status = 'completed';
    await jobRecord.save();
    
    // Update progress to 100%
    await job.updateProgress(100);
    await updateJobProgress(jobRecord, 100, 'Analysis completed');
    
    // Update global metrics
    updateMetrics(totalDuration);
    
    console.log(`Job ${job.id} completed successfully`);
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    
    // Update job with error
    jobRecord.status = 'failed';
    jobRecord.results.error = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    jobRecord.metrics.endTime = new Date();
    await jobRecord.save();
    
    throw error;
  }
}, { connection: redisOptions });

/**
 * Run an agent with Cerebras
 * @param {string} agentName - Name of the agent
 * @param {string} prompt - Prompt to send to Cerebras
 * @returns {Promise<{text: string, latencyMs: number}>}
 */
async function runAgent(agentName, prompt) {
  console.log(`Running ${agentName} agent`);
  return await cerebrasClient.generateText(prompt, {
    temperature: 0.3,
    maxTokens: 2048
  });
}

/**
 * Update job progress in MongoDB
 * @param {Object} jobRecord - MongoDB job record
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} stage - Current stage description
 */
async function updateJobProgress(jobRecord, progress, stage) {
  jobRecord.progress = progress;
  jobRecord.currentStage = stage;
  await jobRecord.save();
}

/**
 * Update global metrics
 * @param {number} latencyMs - Latency in milliseconds
 */
function updateMetrics(latencyMs) {
  metrics.latencies.push(latencyMs);
  metrics.avgLatencyMs = metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length;
}

/**
 * Get current metrics
 * @returns {Object} Metrics object
 */
export function getMetrics() {
  return {
    totalRequests: metrics.totalRequests,
    avgLatencyMs: metrics.avgLatencyMs,
    latencies: metrics.latencies
  };
}

// Register event handlers
worker.on('completed', job => {
  console.log(`Job ${job.id} has completed successfully`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job.id} has failed with error ${error.message}`);
});

// Keep process alive
process.on('SIGTERM', async () => {
  console.log('Worker shutting down...');
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
});

console.log(`Worker started and listening for jobs in queue: ${QUEUE_NAMES.IDEA_ANALYSIS}`);

export { metrics };
export default worker;
