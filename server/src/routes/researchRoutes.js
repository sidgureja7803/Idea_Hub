import express from 'express';
import { createSSEConnection } from '../controllers/researchController.js';

const router = express.Router();

router.get('/stream/:jobId', createSSEConnection);

export default router;
