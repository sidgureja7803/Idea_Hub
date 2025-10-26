import cerebrasClient from '../../llm/cerebrasClient.js';
import { StrategySchema } from '../schemas/agentOutputSchemas.js';
import { emitResearchEvent } from '../../controllers/researchController.js';
import appwriteService from '../../services/appwriteService.js';

const SYSTEM_PROMPT = `You are a strategic advisor synthesizing ALL previous analyses to provide actionable go-to-market strategy.

Recommend GTM strategy, positioning, monetization, growth tactics, and partnerships.

CRITICAL REQUIREMENTS:
1. Use insights from Market, TAM/SAM, Competitor, and Feasibility analyses
2. Define initial target segment (specific niche)
3. Provide 3+ marketing channels with rationale
4. Recommend pricing/monetization model
5. List 3+ customer acquisition strategies
6. Identify 2+ partnership opportunities
7. Ensure recommendations align with feasibility constraints
8. Provide confidence level (0-100)
9. Return ONLY valid JSON matching the schema

Be specific, actionable, and realistic.`;

export async function strategyRecommenderNode({
  researchPack,
  normalizedIdea,
  marketAnalysis,
  tamSamEstimate,
  competitorAnalysis,
  feasibilityAssessment,
  ideaId,
  taskId
}) {
  const nodeName = 'strategyRecommender';
  const startTime = Date.now();
  
  emitResearchEvent(taskId, 'node:start', { node: nodeName });

  try {
    const userPrompt = `BUSINESS IDEA:
Title: ${normalizedIdea.title}
Industry: ${normalizedIdea.industry}
Target Audience: ${normalizedIdea.targetAudience}
Description: ${normalizedIdea.description}

PREVIOUS ANALYSES:

MARKET INSIGHTS:
- Market Size: ${marketAnalysis?.marketSize?.currentSize || 'N/A'}
- Growth Rate: ${marketAnalysis?.marketSize?.growthRate || 'N/A'}
- Key Trends: ${marketAnalysis?.trends?.map(t => t.name).join(', ') || 'N/A'}
- Target Segment: ${marketAnalysis?.targetAudience?.primarySegment || 'N/A'}

TAM/SAM/SOM:
- TAM: ${tamSamEstimate?.tam?.value || 'N/A'}
- SAM: ${tamSamEstimate?.sam?.value || 'N/A'}
- SOM: ${tamSamEstimate?.som?.value || 'N/A'}
- CAGR: ${tamSamEstimate?.marketGrowth?.cagr || 'N/A'}

COMPETITIVE LANDSCAPE:
- Market Leaders: ${competitorAnalysis?.marketLeaders?.map(c => c.name).join(', ') || 'N/A'}
- Differentiation Opportunities: ${competitorAnalysis?.differentiationOpportunities?.map(d => d.area).join(', ') || 'N/A'}

FEASIBILITY:
- Overall Score: ${feasibilityAssessment?.overallFeasibilityScore || 'N/A'}/10
- Technical: ${feasibilityAssessment?.technical?.score || 'N/A'}/10
- Financial: ${feasibilityAssessment?.financial?.score || 'N/A'}/10

Based on ALL these analyses, provide comprehensive strategic recommendations.`;

    const result = await cerebrasClient.jsonResponse(StrategySchema, {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      model: 'HEAVY',
      maxRetries: 2
    });

    if (!result.success) {
      throw new Error(`Validation failed after ${result.attempts} attempts: ${result.error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[${nodeName}] Completed in ${duration}ms`);

    await appwriteService.saveJobStatus(taskId, {
      [`${nodeName}Result`]: result.data,
      [`${nodeName}Timing`]: duration,
      [`${nodeName}Attempts`]: result.attempts,
      status: 'completed',
      progress: 100
    });

    emitResearchEvent(taskId, 'node:end', {
      node: nodeName,
      duration,
      confidence: result.data.confidence,
      channelsCount: result.data.goToMarket.channels.length
    });

    return { success: true, data: result.data, timing: duration, attempts: result.attempts };

  } catch (error) {
    console.error(`[${nodeName}] Error:`, error.message);
    emitResearchEvent(taskId, 'node:error', { node: nodeName, error: error.message });
    throw error;
  }
}
