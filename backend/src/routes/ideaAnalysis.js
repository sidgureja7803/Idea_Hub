import express from 'express';
import { runIdeaAnalysis, getIdeaAnalysisStatus } from '../controllers/ideaAnalysisController.js';

const router = express.Router();

/**
 * @route POST /api/run-idea
 * @desc Start a new idea analysis
 * @access Public
 */
router.post('/run-idea', runIdeaAnalysis);

/**
 * @route GET /api/idea-analysis/:taskId
 * @desc Get the status of an idea analysis
 * @access Public
 */
router.get('/idea-analysis/:taskId', getIdeaAnalysisStatus);

export default router;
