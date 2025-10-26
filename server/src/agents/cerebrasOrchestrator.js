import { ResearchOrchestrator } from './researchOrchestrator.js';
import { marketAnalystNode } from './nodes/marketAnalystNode.js';
import { tamSamEstimatorNode } from './nodes/tamSamEstimatorNode.js';
import { competitorScannerNode } from './nodes/competitorScannerNode.js';
import { feasibilityEvaluatorNode } from './nodes/feasibilityEvaluatorNode.js';
import { strategyRecommenderNode } from './nodes/strategyRecommenderNode.js';
import { emitResearchEvent } from '../controllers/researchController.js';
import appwriteService from '../services/appwriteService.js';
import cacheService from '../services/cacheService.js';

class CerebrasOrchestrator {
  constructor() {
    this.researchOrchestrator = new ResearchOrchestrator();
    this.maxRetries = 2;
    cacheService.connect().catch(e => console.warn('[Orchestrator] Cache unavailable'));
  }

  async executeWithCache(nodeName, nodeFunc, inputs, taskId) {
    const cacheKey = `node:${inputs.ideaId}:${nodeName}:${inputs.researchHash}`;
    const cached = await cacheService.get(inputs.ideaId, cacheKey);
    
    if (cached) {
      console.log(`[${nodeName}] Cache HIT`);
      emitResearchEvent(taskId, 'node:cached', { node: nodeName });
      return cached;
    }

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await nodeFunc(inputs);
        await cacheService.set(inputs.ideaId, cacheKey, result);
        return result;
      } catch (error) {
        console.error(`[${nodeName}] Attempt ${attempt + 1} failed:`, error.message);
        if (attempt === this.maxRetries) throw error;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  async run(normalizedIdea, ideaId, taskId) {
    const startTime = Date.now();
    
    try {
      console.log(`[CerebrasOrchestrator] Starting for ${ideaId}`);
      
      await appwriteService.saveJobStatus(taskId, {
        status: 'processing',
        step: 'research',
        progress: 10,
        message: 'Deep research in progress...'
      });

      emitResearchEvent(taskId, 'orchestrator:phase', { phase: 'research' });
      
      const researchResult = await this.researchOrchestrator.process({
        normalizedIdea, ideaId
      }, taskId);

      const researchPack = researchResult.researchPack;
      const inputs = { 
        researchPack, 
        normalizedIdea, 
        ideaId, 
        taskId, 
        researchHash: researchPack.researchHash 
      };

      await appwriteService.saveJobStatus(taskId, {
        step: 'analysis',
        progress: 30,
        message: 'Running 5 Cerebras agents in parallel...'
      });

      emitResearchEvent(taskId, 'orchestrator:phase', { phase: 'parallel_analysis' });
      
      const [marketResult, tamResult, competitorResult, feasibilityResult] = 
        await Promise.all([
          this.executeWithCache('marketAnalyst', marketAnalystNode, inputs, taskId),
          this.executeWithCache('tamSamEstimator', tamSamEstimatorNode, inputs, taskId),
          this.executeWithCache('competitorScanner', competitorScannerNode, inputs, taskId),
          this.executeWithCache('feasibilityEvaluator', feasibilityEvaluatorNode, inputs, taskId)
        ]);

      await appwriteService.saveJobStatus(taskId, {
        step: 'strategy',
        progress: 80,
        message: 'Generating strategic recommendations...'
      });

      emitResearchEvent(taskId, 'orchestrator:phase', { phase: 'strategy' });
      
      const strategyResult = await this.executeWithCache('strategyRecommender',
        strategyRecommenderNode, {
          ...inputs,
          marketAnalysis: marketResult.data,
          tamSamEstimate: tamResult.data,
          competitorAnalysis: competitorResult.data,
          feasibilityAssessment: feasibilityResult.data
        }, taskId);

      const totalDuration = Date.now() - startTime;
      const finalResult = {
        researchPackId: researchPack._id,
        marketAnalysis: marketResult.data,
        tamSamEstimate: tamResult.data,
        competitorAnalysis: competitorResult.data,
        feasibilityAssessment: feasibilityResult.data,
        strategy: strategyResult.data,
        metadata: {
          totalDuration,
          timings: {
            market: marketResult.timing,
            tamSam: tamResult.timing,
            competitor: competitorResult.timing,
            feasibility: feasibilityResult.timing,
            strategy: strategyResult.timing
          },
          attempts: {
            market: marketResult.attempts,
            tamSam: tamResult.attempts,
            competitor: competitorResult.attempts,
            feasibility: feasibilityResult.attempts,
            strategy: strategyResult.attempts
          }
        }
      };

      await appwriteService.saveJobStatus(taskId, {
        status: 'completed',
        progress: 100,
        message: 'Analysis complete!',
        result: finalResult
      });

      emitResearchEvent(taskId, 'orchestrator:complete', { 
        duration: totalDuration,
        nodes: 5
      });

      console.log(`[CerebrasOrchestrator] Complete in ${totalDuration}ms`);

      return finalResult;

    } catch (error) {
      console.error('[CerebrasOrchestrator] Error:', error);
      
      await appwriteService.saveJobStatus(taskId, {
        status: 'failed',
        error: error.message
      });

      emitResearchEvent(taskId, 'orchestrator:error', { error: error.message });
      throw error;
    }
  }
}

export default new CerebrasOrchestrator();
