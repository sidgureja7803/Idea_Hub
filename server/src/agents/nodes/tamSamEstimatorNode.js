import cerebrasClient from '../../llm/cerebrasClient.js';
import { TAMSAMSOMSchema } from '../schemas/agentOutputSchemas.js';
import { emitResearchEvent } from '../../controllers/researchController.js';
import appwriteService from '../../services/appwriteService.js';

const SYSTEM_PROMPT = `You are a market sizing expert calculating TAM, SAM, and SOM.

Use EITHER top-down (market size × addressable %) OR bottom-up (units × price × adoption) methodology.

CRITICAL REQUIREMENTS:
1. State your methodology clearly (top-down, bottom-up, or hybrid)
2. CITE sources for all market size figures
3. List assumptions for each calculation
4. Provide confidence level (0-100) based on data availability
5. Include realistic timeline for SOM achievement
6. Show calculations step-by-step
7. Return ONLY valid JSON matching the schema

Be realistic and conservative in estimates.`;

export async function tamSamEstimatorNode({ researchPack, normalizedIdea, ideaId, taskId }) {
  const nodeName = 'tamSamEstimator';
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

RESEARCH DATA (${researchPack.documents.length} sources):
${docsContext}

Calculate TAM, SAM, and SOM using research data. Be specific with numbers and methodology.`;

    const result = await cerebrasClient.jsonResponse(TAMSAMSOMSchema, {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      model: 'HEAVY',
      maxRetries: 2
    });

    if (!result.success) {
      throw new Error(`Validation failed after ${result.attempts} attempts: ${result.error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[${nodeName}] Completed in ${duration}ms, methodology: ${result.data.methodology}`);

    await appwriteService.saveJobStatus(taskId, {
      [`${nodeName}Result`]: result.data,
      [`${nodeName}Timing`]: duration,
      [`${nodeName}Attempts`]: result.attempts
    });

    emitResearchEvent(taskId, 'node:end', {
      node: nodeName,
      duration,
      confidence: result.data.confidence,
      methodology: result.data.methodology,
      tamValue: result.data.tam.value
    });

    return { success: true, data: result.data, timing: duration, attempts: result.attempts };

  } catch (error) {
    console.error(`[${nodeName}] Error:`, error.message);
    emitResearchEvent(taskId, 'node:error', { node: nodeName, error: error.message });
    throw error;
  }
}
