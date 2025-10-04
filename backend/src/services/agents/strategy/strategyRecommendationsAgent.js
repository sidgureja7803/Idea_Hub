/**
 * Strategic Recommendations Agent
 * Specializes in providing go-to-market strategies and competitive advantage recommendations
 */

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Strategic recommendations system prompt
const STRATEGY_RECOMMENDATIONS_SYSTEM_PROMPT = `You are a strategic advisor specializing in startup go-to-market strategies and competitive positioning.

Your task is to analyze a startup idea and all previous analyses to provide strategic recommendations covering:
1. Go-to-market strategy - channels, messaging, and initial target segments
2. Competitive positioning - how to position relative to competitors
3. Monetization strategy - pricing models, revenue streams, and pricing strategies
4. Growth strategy - customer acquisition, retention, and expansion strategies
5. Partnership opportunities - potential strategic partners and collaboration models

FORMAT YOUR RESPONSE AS VALID JSON with the following structure:
{
  "goToMarket": {
    "initialTargetSegment": "Specific customer segment to target first",
    "valueProposition": "Clear value proposition statement",
    "channels": ["Channel 1", "Channel 2", "Channel 3"],
    "messaging": "Key messaging recommendations",
    "timeline": "Recommended launch timeline"
  },
  "competitivePositioning": {
    "positioningStatement": "How to position relative to competitors",
    "keyDifferentiators": ["Differentiator 1", "Differentiator 2", "Differentiator 3"],
    "messagingAngles": ["Angle 1", "Angle 2", "Angle 3"]
  },
  "monetization": {
    "recommendedModel": "Primary business model",
    "pricingStrategy": "Pricing approach and rationale",
    "revenueStreams": ["Stream 1", "Stream 2", "Stream 3"],
    "unitEconomics": "Key unit economics considerations"
  },
  "growthStrategy": {
    "customerAcquisition": ["Strategy 1", "Strategy 2", "Strategy 3"],
    "retention": ["Strategy 1", "Strategy 2", "Strategy 3"],
    "expansion": ["Strategy 1", "Strategy 2", "Strategy 3"],
    "keyMetrics": ["Metric 1", "Metric 2", "Metric 3"]
  },
  "partnerships": [
    {
      "partnerType": "Type of partner",
      "potentialPartners": ["Partner 1", "Partner 2"],
      "collaborationModel": "How to structure the partnership",
      "strategicValue": "Value this partnership would provide"
    }
  ],
  "summary": "A comprehensive 3-4 paragraph summary of strategic recommendations"
}`;

// Create the prompt template
const strategyRecommendationsPrompt = PromptTemplate.fromTemplate(`
{system_prompt}

STARTUP IDEA:
{idea}

CONTEXT FROM OTHER ANALYSES:
{context}

Based on the above information and analyses, provide comprehensive strategic recommendations for this startup idea.
Ensure your recommendations are actionable, practical, and specifically tailored to this idea.
Consider market conditions, competitive landscape, feasibility factors, and target audience needs in your recommendations.
Focus on creating sustainable competitive advantages and a clear path to market entry and growth.
`);

// Create the strategy recommendations agent
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
  temperature: 0.3,
});

// Build the strategy recommendations agent chain
export const strategyRecommendationsAgent = RunnableSequence.from([
  {
    system_prompt: () => STRATEGY_RECOMMENDATIONS_SYSTEM_PROMPT,
    idea: (input) => JSON.stringify(input.idea),
    context: (input) => input.context || "No previous analyses available.",
  },
  strategyRecommendationsPrompt,
  model,
  new StringOutputParser(),
  async (output) => {
    try {
      // Try to parse as JSON
      return JSON.parse(output);
    } catch (error) {
      console.error("Error parsing strategy recommendations output:", error);
      
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
        error: "Failed to parse strategy recommendations results",
        rawOutput: output,
      };
    }
  },
]);
