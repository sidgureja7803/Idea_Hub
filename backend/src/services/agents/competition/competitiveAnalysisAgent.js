/**
 * Competitive Landscape Agent
 * Specializes in analyzing competitors, market leaders, emerging players, and differentiation strategies
 */

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// Competitive analysis system prompt
const COMPETITIVE_ANALYSIS_SYSTEM_PROMPT = `You are a competitive intelligence expert specializing in startup competitive analysis.

Your task is to analyze the competitive landscape for a startup idea and provide detailed insights on:
1. Market leaders and their strengths/weaknesses
2. Emerging players and their innovations
3. Differentiation strategies for the startup
4. Competitive positioning recommendations

FORMAT YOUR RESPONSE AS VALID JSON with the following structure:
{
  "marketLeaders": [
    {
      "name": "Company name",
      "description": "Brief description",
      "marketShare": "Estimated market share if available",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
      "threat": "High/Medium/Low threat level to startup idea"
    }
  ],
  "emergingPlayers": [
    {
      "name": "Company name",
      "description": "Brief description",
      "uniqueValue": "What makes them stand out",
      "fundingStatus": "Funding information if available",
      "threat": "High/Medium/Low threat level to startup idea"
    }
  ],
  "differentiationOpportunities": [
    {
      "area": "Area for differentiation",
      "strategy": "Proposed strategy",
      "impact": "Potential impact"
    }
  ],
  "competitiveAdvantages": [
    {
      "advantage": "Potential competitive advantage",
      "sustainability": "How sustainable this advantage is",
      "developmentNeeds": "What's needed to develop this advantage"
    }
  ],
  "summary": "A comprehensive 2-3 paragraph summary of competitive analysis"
}`;

// Create the prompt template
const competitiveAnalysisPrompt = PromptTemplate.fromTemplate(`
{system_prompt}

STARTUP IDEA:
{idea}

CONTEXT FROM OTHER ANALYSES:
{context}

Based on the above information, perform a detailed competitive landscape analysis for this startup idea.
Search the web for current information about competitors in this market space.
Identify both established market leaders and emerging innovative players.
Focus on identifying specific differentiation opportunities and sustainable competitive advantages.
`);

// Create the competitive analysis agent
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
  temperature: 0.2,
});

// Create Tavily search tool for real-time competitive research (optional)
let tavilySearchTool = null;
if (process.env.TAVILY_API_KEY) {
  try {
    tavilySearchTool = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 5,
    });
  } catch (error) {
    console.warn('Tavily API key not configured, competitive analysis will use fallback data');
  }
} else {
  console.warn('Tavily API key not found, competitive analysis will use fallback data');
}

// Build the competitive analysis agent chain
export const competitiveAnalysisAgent = RunnableSequence.from([
  {
    system_prompt: () => COMPETITIVE_ANALYSIS_SYSTEM_PROMPT,
    idea: (input) => JSON.stringify(input.idea),
    context: (input) => input.context || "No previous analyses available.",
  },
  competitiveAnalysisPrompt,
  model,
  new StringOutputParser(),
  async (output) => {
    try {
      // Try to parse as JSON
      return JSON.parse(output);
    } catch (error) {
      console.error("Error parsing competitive analysis output:", error);
      
      // Extract JSON if it's within markdown code blocks
      const jsonMatch = output.match(/```(?:json)?([\s\S]+?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (e) {
          console.error("Error parsing extracted JSON:", e);
        }
      }
      
      // Return error object as fallback
      return {
        error: "Failed to parse competitive analysis results",
        rawOutput: output,
      };
    }
  },
]);
