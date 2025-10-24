/**
 * TAM/SAM Analysis Agent
 * Specializes in calculating Total Addressable Market and Serviceable Addressable Market for startup ideas
 */

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// TAM/SAM analysis system prompt
const TAM_SAM_SYSTEM_PROMPT = `You are a market sizing expert specializing in startup TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market) analysis.

Your task is to analyze a startup idea and provide detailed market sizing calculations with:
1. Total Addressable Market (TAM) - The total market demand for the product/service
2. Serviceable Addressable Market (SAM) - The segment of TAM targeted by the product/service 
3. Serviceable Obtainable Market (SOM) - The portion of SAM that can realistically be captured

FORMAT YOUR RESPONSE AS VALID JSON with the following structure:
{
  "tam": {
    "value": "Dollar value in billions/millions",
    "calculation": "How you calculated this figure",
    "sources": "Data sources used"
  },
  "sam": {
    "value": "Dollar value in billions/millions",
    "calculation": "How you calculated this figure",
    "percentage": "Percentage of TAM",
    "sources": "Data sources used"
  },
  "som": {
    "value": "Dollar value in millions",
    "calculation": "How you calculated this figure",
    "percentage": "Percentage of SAM",
    "timeline": "Expected timeline to reach this SOM",
    "sources": "Data sources used"
  },
  "marketGrowth": {
    "cagr": "Compound Annual Growth Rate percentage",
    "factors": ["Growth factor 1", "Growth factor 2", "Growth factor 3"]
  },
  "analysis": "A comprehensive 2-3 paragraph analysis of market sizing and growth potential"
}`;

// Create the prompt template
const tamSamAnalysisPrompt = PromptTemplate.fromTemplate(`
{system_prompt}

STARTUP IDEA:
{idea}

CONTEXT FROM OTHER ANALYSES:
{context}

Based on the above information, perform a detailed TAM, SAM, and SOM analysis for this startup idea.
Search the web for current, accurate market size data.
Be specific with numbers and data points whenever possible and cite your sources.
Show your calculation methodology clearly.
`);

// Create the TAM/SAM analysis agent
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
    console.warn('Tavily API key not configured, TAM/SAM analysis will use fallback data');
  }
} else {
  console.warn('Tavily API key not found, TAM/SAM analysis will use fallback data');
}

// Build the TAM/SAM analysis agent chain
export const tamSamAnalysisAgent = RunnableSequence.from([
  {
    system_prompt: () => TAM_SAM_SYSTEM_PROMPT,
    idea: (input) => JSON.stringify(input.idea),
    context: (input) => input.context || "No previous analyses available.",
  },
  tamSamAnalysisPrompt,
  model,
  new StringOutputParser(),
  async (output) => {
    try {
      // Try to parse as JSON
      return JSON.parse(output);
    } catch (error) {
      console.error("Error parsing TAM/SAM analysis output:", error);
      
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
        error: "Failed to parse TAM/SAM analysis results",
        rawOutput: output,
      };
    }
  },
]);
