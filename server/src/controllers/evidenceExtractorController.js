/**
 * Evidence Extractor Controller
 * Extracts facts and sources from search keywords using AI
 */

import { cerebrasService } from '../services/cerebrasService.js';

const extractEvidence = async (req, res) => {
  try {
    const { searchKeywords, maxSourcesPerKeyword = 6 } = req.body;

    if (!searchKeywords || !Array.isArray(searchKeywords) || searchKeywords.length === 0) {
      return res.status(400).json({
        error: 'Search keywords array is required'
      });
    }

    // Limit the number of keywords to prevent abuse
    const limitedKeywords = searchKeywords.slice(0, 10);
    
    // Create the structured prompt for evidence extraction
    const prompt = `SYSTEM:
You are FoundrIQ Evidence Extractor. Return VALID JSON ONLY.

USER:
searchKeywords: ${JSON.stringify(limitedKeywords)}
maxSourcesPerKeyword: ${maxSourcesPerKeyword}

INSTRUCTIONS:
1. For each keyword, return top results as 'sources' (title, url, snippet, date).
2. Extract up to 12 concrete 'facts' (market sizes, growth rates, competitor metrics, pricing) with:
   { id, value, context, sourceUrl, sourceTitle, sourceDate, confidence: "low|medium|high" }
3. If a fact is an inference, mark 'confidence' accordingly.

OUTPUT_JSON:
{
 "sources": [{ "keyword":"", "title":"", "url":"", "snippet":"", "date":"" }],
 "facts": [ { "id":"f1", "value":"", "context":"", "sourceUrl":"", "sourceTitle":"", "sourceDate":"", "confidence":"high" } ]
}`;

    // Call Cerebras API for evidence extraction
    const response = await cerebrasService.generateText(prompt, {
      temperature: 0.2,
      maxTokens: 3000
    });

    // Parse the JSON response
    let extractedData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(response);
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
    if (!extractedData.sources || !extractedData.facts || 
        !Array.isArray(extractedData.sources) || !Array.isArray(extractedData.facts)) {
      return res.status(500).json({
        error: 'Invalid response structure from AI',
        received: extractedData
      });
    }

    // Ensure sources have all required fields
    extractedData.sources = extractedData.sources.filter(source => 
      source && source.keyword && source.title && source.url);

    // Ensure facts have all required fields and valid confidence levels
    extractedData.facts = extractedData.facts.filter(fact => {
      if (!fact || !fact.id || !fact.value || !fact.sourceUrl) return false;
      
      // Normalize confidence level
      if (!['low', 'medium', 'high'].includes(fact.confidence)) {
        fact.confidence = 'medium';
      }
      
      return true;
    });

    // Assign unique IDs to facts if they don't have them
    extractedData.facts = extractedData.facts.map((fact, index) => {
      if (!fact.id) {
        fact.id = `f${index + 1}`;
      }
      return fact;
    });

    // Log successful extraction
    console.log(`Successfully extracted evidence for ${limitedKeywords.length} keywords`);
    console.log(`Found ${extractedData.sources.length} sources and ${extractedData.facts.length} facts`);

    // Return the extracted evidence data
    res.json(extractedData);

  } catch (error) {
    console.error('Error extracting evidence:', error);
    
    res.status(500).json({
      error: 'Failed to extract evidence',
      message: error.message
    });
  }
};

const getExtractionStatus = async (req, res) => {
  try {
    // Simple health check for the extraction service
    res.json({
      status: 'operational',
      service: 'FoundrIQ Evidence Extractor',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking extraction status:', error);
    res.status(500).json({
      error: 'Service unavailable'
    });
  }
};

export {
  extractEvidence,
  getExtractionStatus
};

