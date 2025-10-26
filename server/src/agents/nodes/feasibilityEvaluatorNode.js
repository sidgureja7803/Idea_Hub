import cerebrasClient from '../../llm/cerebrasClient.js';
import { FeasibilitySchema } from '../schemas/agentOutputSchemas.js';
import { emitResearchEvent } from '../../controllers/researchController.js';
import appwriteService from '../../services/appwriteService.js';

const SYSTEM_PROMPT = `You are a startup feasibility expert evaluating technical, operational, financial, regulatory, and market feasibility.

Provide realistic assessments with scores (1-10) for each dimension.

CRITICAL REQUIREMENTS:
1. Assess 5 dimensions: technical, operational, financial, regulatory, market
2. Each dimension must have complexity level, risks, and score (1-10)
3. Financial section needs startup costs, burn rate, break-even timeframe
4. List key assumptions for each dimension
5. Calculate overall feasibility score (1-10)
6. Provide confidence level (0-100)
7. Be honest about challenges and risks
8. Return ONLY valid JSON matching the schema

10 = highly feasible, 1 = not feasible.`;

export async function feasibilityEvaluatorNode({ researchPack, normalizedIdea, ideaId, taskId }) {
  const nodeName = 'feasibilityEvaluator';
  const startTime = Date.now();
  
  emitResearchEvent(taskId, 'node:start', { node: nodeName });

  try {
    const docsContext = researchPack.documents
      .slice(0, 10)
      .map(d => `[${d.metadata.domain}] ${d.title}:\n${d.content.substring(0, 500)}...`)
      .join('\n\n');

    const userPrompt = `BUSINESS IDEA:
Title: ${normalizedIdea.title}
Industry: ${normalizedIdea.industry}
Target Audience: ${normalizedIdea.targetAudience}
Description: ${normalizedIdea.description}
Key Features: ${normalizedIdea.keyFeatures?.join(', ') || 'N/A'}

RESEARCH DATA (${researchPack.documents.length} sources):
${docsContext}

Evaluate feasibility across all dimensions. Be realistic and identify potential blockers.`;

    const result = await cerebrasClient.jsonResponse(FeasibilitySchema, {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      model: 'HEAVY',
      maxRetries: 2
    });

    if (!result.success) {
      throw new Error(`Validation failed after ${result.attempts} attempts: ${result.error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[${nodeName}] Completed in ${duration}ms, overall score: ${result.data.overallFeasibilityScore}`);

    await appwriteService.saveJobStatus(taskId, {
      [`${nodeName}Result`]: result.data,
      [`${nodeName}Timing`]: duration,
      [`${nodeName}Attempts`]: result.attempts
    });

    emitResearchEvent(taskId, 'node:end', {
      node: nodeName,
      duration,
      confidence: result.data.confidence,
      overallScore: result.data.overallFeasibilityScore,
      technicalScore: result.data.technical.score
    });

    return { success: true, data: result.data, timing: duration, attempts: result.attempts };

  } catch (error) {
    console.error(`[${nodeName}] Error:`, error.message);
    emitResearchEvent(taskId, 'node:error', { node: nodeName, error: error.message });
    throw error;
  }
}
