import cerebrasClient from '../../llm/cerebrasClient.js';
import { MarketInsightsSchema } from '../schemas/agentOutputSchemas.js';
import { emitResearchEvent } from '../../controllers/researchController.js';
import appwriteService from '../../services/appwriteService.js';

const SYSTEM_PROMPT = `You are an expert market research analyst using data from comprehensive research.

Analyze market size, trends, customer needs, target audience, and barriers.

CRITICAL REQUIREMENTS:
1. CITE sources for non-obvious claims using [Source: URL]
2. Include at least 3 trends with impact assessment
3. Identify 2+ customer needs with pain points
4. Define target audience with size estimates
5. List barriers with severity and mitigation
6. Provide confidence level (0-100) based on data quality
7. Return ONLY valid JSON matching the schema

Use the ResearchPack documents to ground your analysis in real data.`;

export async function marketAnalystNode({ researchPack, normalizedIdea, ideaId, taskId }) {
  const nodeName = 'marketAnalyst';
  const startTime = Date.now();
  
  emitResearchEvent(taskId, 'node:start', { node: nodeName });

  try {
    // Build context from ResearchPack
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

KEY QUERIES USED:
${researchPack.queries.join('\n')}

Perform comprehensive market analysis using this research data.`;

    const result = await cerebrasClient.jsonResponse(MarketInsightsSchema, {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      model: 'HEAVY',
      maxRetries: 2
    });

    if (!result.success) {
      throw new Error(`Validation failed after ${result.attempts} attempts: ${result.error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[${nodeName}] Completed in ${duration}ms, attempts: ${result.attempts}`);

    // Persist to Appwrite
    await appwriteService.saveJobStatus(taskId, {
      [`${nodeName}Result`]: result.data,
      [`${nodeName}Timing`]: duration,
      [`${nodeName}Attempts`]: result.attempts
    });

    emitResearchEvent(taskId, 'node:end', {
      node: nodeName,
      duration,
      confidence: result.data.confidence,
      trendsCount: result.data.trends.length
    });

    return { success: true, data: result.data, timing: duration, attempts: result.attempts };

  } catch (error) {
    console.error(`[${nodeName}] Error:`, error.message);
    emitResearchEvent(taskId, 'node:error', { node: nodeName, error: error.message });
    throw error;
  }
}
