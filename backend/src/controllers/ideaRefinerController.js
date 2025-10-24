/**
 * Idea Refiner Controller
 * Refines raw startup ideas into structured format using AI
 */

import { cerebrasService } from '../services/cerebrasService.js';

const refineIdea = async (req, res) => {
  try {
    const { rawIdea } = req.body;

    if (!rawIdea || typeof rawIdea !== 'string' || rawIdea.trim().length === 0) {
      return res.status(400).json({
        error: 'Raw idea text is required'
      });
    }

    // Create the structured prompt for idea refinement
    const prompt = `SYSTEM:
You are FoundrIQ Idea Refiner. Return VALID JSON ONLY. No commentary, no markdown.

USER:
RawIdea: """${rawIdea.trim()}"""

INSTRUCTIONS:
1. Return a concise structured 'refinedIdea' object with keys:
   - title, oneLinePitch, problem, solution, targetCustomers, userPersona, uniqueValueProps (array up to 4),
     topAssumptions (array up to 4), topRisks (array up to 4)
2. Generate 'searchKeywords' (6 strings) prioritized for web search.
3. If needed, list up to 5 'clarifyingQuestions' for the founder.
4. Provide 'complexity' as "low"|"medium"|"high".

OUTPUT_JSON:
{
 "refinedIdea": {...},
 "searchKeywords": ["..."],
 "clarifyingQuestions": ["..."],
 "complexity": "low|medium|high"
}`;

    // Call Cerebras API for idea refinement
    const response = await cerebrasService.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 2048
    });

    // Parse the JSON response
    let refinedData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        refinedData = JSON.parse(jsonMatch[0]);
      } else {
        refinedData = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', response);
      
      // Fallback: return a structured error response
      return res.status(500).json({
        error: 'Failed to parse AI response',
        rawResponse: response
      });
    }

    // Validate the response structure
    if (!refinedData.refinedIdea || !refinedData.searchKeywords || !refinedData.complexity) {
      return res.status(500).json({
        error: 'Invalid response structure from AI',
        received: refinedData
      });
    }

    // Ensure arrays are properly formatted
    if (!Array.isArray(refinedData.searchKeywords)) {
      refinedData.searchKeywords = [];
    }
    if (!Array.isArray(refinedData.clarifyingQuestions)) {
      refinedData.clarifyingQuestions = [];
    }

    // Validate complexity value
    if (!['low', 'medium', 'high'].includes(refinedData.complexity)) {
      refinedData.complexity = 'medium';
    }

    // Log successful refinement
    console.log(`Successfully refined idea: "${refinedData.refinedIdea.title || 'Untitled'}"`);

    // Return the refined idea data
    res.json(refinedData);

  } catch (error) {
    console.error('Error refining idea:', error);
    
    res.status(500).json({
      error: 'Failed to refine idea',
      message: error.message
    });
  }
};

const getRefinementStatus = async (req, res) => {
  try {
    // Simple health check for the refinement service
    res.json({
      status: 'operational',
      service: 'FoundrIQ Idea Refiner',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking refinement status:', error);
    res.status(500).json({
      error: 'Service unavailable'
    });
  }
};

export {
  refineIdea,
  getRefinementStatus
};
