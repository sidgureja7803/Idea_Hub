/**
 * Market Analysis Agent
 * Specializes in analyzing market trends, size, and growth potential for startup ideas
 */

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// Market analysis system prompt
const MARKET_ANALYSIS_SYSTEM_PROMPT = `You are a market research expert specializing in startup market analysis.
Your task is to analyze a startup idea and provide comprehensive insights on:
1. Market size and growth rates
2. Current market trends and future projections
3. Customer needs and pain points
4. Target audience identification and segmentation
5. Market barriers to entry

FORMAT YOUR RESPONSE AS VALID JSON with the following structure:
{
  "marketSize": {
    "currentSize": "Size in dollars with source",
    "growthRate": "Annual growth percentage with source",
    "projectedSize": "5-year projected size"
  },
  "trends": [
    {
      "name": "Trend name",
      "description": "Brief description of the trend",
      "impact": "How this trend affects the startup idea"
    }
  ],
  "customerNeeds": [
    {
      "need": "Specific customer need",
      "painPoint": "Associated pain point",
      "currentSolutions": "How it's currently being addressed"
    }
  ],
  "targetAudience": {
    "primarySegment": "Primary customer segment",
    "demographics": "Key demographics",
    "psychographics": "Relevant psychographic factors",
    "size": "Estimated size of target audience"
  },
  "barriers": [
    {
      "barrier": "Specific market barrier",
      "severity": "High/Medium/Low",
      "mitigation": "Potential mitigation strategy"
    }
  ],
  "summary": "A comprehensive 2-3 paragraph summary of the market analysis"
}`;

// Create the prompt template
const marketAnalysisPrompt = PromptTemplate.fromTemplate(`
{system_prompt}

STARTUP IDEA:
{idea}

CONTEXT FROM OTHER ANALYSES:
{context}

Based on the above information, perform a comprehensive market analysis for this startup idea.
Search the web for current, accurate data about market size, trends, and customer needs.
Be specific with numbers and data points whenever possible and cite your sources.
`);

// Create the market analysis agent
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
  temperature: 0.2,
});

// Create Tavily search tool for real-time market research (optional)
let tavilySearchTool = null;
if (process.env.TAVILY_API_KEY) {
  try {
    tavilySearchTool = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 5,
    });
  } catch (error) {
    console.warn('Tavily API key not configured, market research will use fallback data');
  }
} else {
  console.warn('Tavily API key not found, market research will use fallback data');
}

// Build the market analysis agent chain
export const marketAnalysisAgent = RunnableSequence.from([
  {
    system_prompt: () => MARKET_ANALYSIS_SYSTEM_PROMPT,
    idea: (input) => JSON.stringify(input.idea),
    context: (input) => input.context || "No previous analyses available.",
  },
  marketAnalysisPrompt,
  model,
  new StringOutputParser(),
  async (output) => {
    try {
      // Try to parse as JSON
      return JSON.parse(output);
    } catch (error) {
      console.error("Error parsing market analysis output:", error);
      
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
        error: "Failed to parse market analysis results",
        rawOutput: output,
      };
    }
  },
]);
