import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { mockDeep } from 'jest-mock-extended';

// Mock modules
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
  })),
  model: jest.fn().mockImplementation(() => ({
    findById: jest.fn().mockResolvedValue({
      _id: 'job123',
      status: 'completed',
      progress: 100,
      currentStage: 'Analysis completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      results: {
        marketSnapshot: { marketSize: "$24.5 billion" },
        tam: { totalAddressableMarket: "$47.8 billion" },
        competition: { competitiveAdvantage: "Unique positioning" },
        feasibility: { score: 8.2 },
        aggregated: { recommendation: "Proceed with development" }
      },
    }),
    findOne: jest.fn().mockResolvedValue({
      _id: 'job123',
      status: 'completed',
      progress: 100,
    }),
    save: jest.fn().mockResolvedValue({
      _id: 'job123',
      status: 'pending',
    }),
  })),
}));

jest.mock('../src/queue/queueConfig.js', () => ({
  enqueueIdeaAnalysis: jest.fn().mockResolvedValue({
    id: 'job123',
  }),
  getJob: jest.fn().mockResolvedValue({
    id: 'job123',
    getState: jest.fn().mockResolvedValue('completed'),
    progress: 100,
    timestamp: Date.now(),
  }),
  QUEUE_NAMES: { IDEA_ANALYSIS: 'idea-analysis' }
}));

jest.mock('../src/worker/cerebras_client.js', () => ({
  generateText: jest.fn().mockResolvedValue({
    text: JSON.stringify({ result: "Analysis complete" }),
    latencyMs: 1500,
  }),
}));

// Test data
const sampleIdea = {
  description: "A mobile app that connects dog owners with local dog walkers",
  category: "Marketplace",
  targetAudience: "Busy urban professionals with dogs",
  problemSolved: "Dog owners often struggle to find reliable dog walking services",
};

// Import routes after mocks are set up
import ideaRoutes from '../src/routes/ideas.js';
import jobsRoutes from '../src/routes/jobs.js';

describe('API Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', ideaRoutes);
    app.use('/api', jobsRoutes);
  });

  describe('POST /api/ideas', () => {
    it('should create a job and return jobId', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send(sampleIdea)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('jobId', 'job123');
      expect(response.body).toHaveProperty('message', expect.any(String));
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteIdea = { description: "Incomplete idea" };
      
      const response = await request(app)
        .post('/api/ideas')
        .send(incompleteIdea)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message', expect.stringContaining('Missing required fields'));
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return job status and results', async () => {
      const response = await request(app)
        .get('/api/jobs/job123')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', 'job123');
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('progress', 100);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveProperty('marketSnapshot');
      expect(response.body.results).toHaveProperty('tam');
      expect(response.body.results).toHaveProperty('competition');
      expect(response.body.results).toHaveProperty('feasibility');
      expect(response.body.results).toHaveProperty('aggregated');
    });

    it('should return 404 if job is not found', async () => {
      // Mock findById to return null for a different job ID
      const originalFindById = mongoose.model().findById;
      mongoose.model().findById = jest.fn().mockResolvedValue(null);
      
      // Mock getJob to return null as well
      const originalGetJob = require('../src/queue/queueConfig.js').getJob;
      require('../src/queue/queueConfig.js').getJob = jest.fn().mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/jobs/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', expect.stringContaining('not found'));
      
      // Restore the original mocks
      mongoose.model().findById = originalFindById;
      require('../src/queue/queueConfig.js').getJob = originalGetJob;
    });
  });
});
