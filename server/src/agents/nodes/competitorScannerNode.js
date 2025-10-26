import cerebrasClient from '../../llm/cerebrasClient.js';
import { CompetitorsSchema } from '../schemas/agentOutputSchemas.js';
import { emitResearchEvent } from '../../controllers/researchController.js';
import appwriteService from '../../services/appwriteService.js';

const SYSTEM_PROMPT = `You are a competitive intelligence expert analyzing market competitors.

Identify market leaders, emerging players, differentiation opportunities, and competitive advantages.

CRITICAL REQUIREMENTS:
1. Identify at least 2 market leaders with strengths/weaknesses
2. Find 1+ emerging players with unique value propositions
3. Propose 3+ differentiation opportunities
4. Define 2+ sustainable competitive advantages
5. CITE sources for competitor information
6. Assess threat levels (High/Medium/Low) for each competitor
7. Provide confidence level (0-100)
8. Return ONLY valid JSON matching the schema

Focus on actionable competitive insights.`;

export async function competitorScannerNode({ researchPack, normalizedIdea, ideaId, taskId }) {
  const nodeName = 'competitorScanner';
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

Analyze competitive landscape using this research. Identify specific competitors and differentiation opportunities.`;

    const result = await cerebrasClient.jsonResponse(CompetitorsSchema, {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      model: 'HEAVY',
      maxRetries: 2
    });

    if (!result.success) {
      throw new Error(`Validation failed after ${result.attempts} attempts: ${result.error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[${nodeName}] Completed in ${duration}ms, found ${result.data.marketLeaders.length} leaders`);

    await appwriteService.saveJobStatus(taskId, {
      [`${nodeName}Result`]: result.data,
      [`${nodeName}Timing`]: duration,
      [`${nodeName}Attempts`]: result.attempts
    });

    emitResearchEvent(taskId, 'node:end', {
      node: nodeName,
      duration,
      confidence: result.data.confidence,
      leadersCount: result.data.marketLeaders.length,
      emergingCount: result.data.emergingPlayers.length
    });

    return { success: true, data: result.data, timing: duration, attempts: result.attempts };

  } catch (error) {
    console.error(`[${nodeName}] Error:`, error.message);
    emitResearchEvent(taskId, 'node:error', { node: nodeName, error: error.message });
    throw error;
  }
}
