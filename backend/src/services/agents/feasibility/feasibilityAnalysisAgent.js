/**
 * Feasibility Assessment Agent
 * Specializes in evaluating technical, operational, and financial feasibility of startup ideas
 */

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Feasibility analysis system prompt
const FEASIBILITY_ANALYSIS_SYSTEM_PROMPT = `You are a startup feasibility expert specializing in technical, operational, and financial feasibility assessment.

Your task is to analyze a startup idea and provide a detailed feasibility assessment covering:
1. Technical feasibility - technical requirements, complexity, development timeline
2. Operational feasibility - operational requirements, supply chain, logistics
3. Financial feasibility - startup costs, operating costs, revenue projections, break-even analysis
4. Regulatory feasibility - legal requirements, compliance needs, potential regulatory hurdles
5. Market feasibility - product-market fit, adoption barriers, market readiness

FORMAT YOUR RESPONSE AS VALID JSON with the following structure:
{
  "technical": {
    "complexity": "High/Medium/Low with brief explanation",
    "requiredTechnologies": ["Technology 1", "Technology 2"],
    "developmentTimeline": "Estimated development timeline",
    "technicalRisks": ["Risk 1", "Risk 2"],
    "score": "1-10 score with 10 being highly feasible"
  },
  "operational": {
    "complexity": "High/Medium/Low with brief explanation",
    "keyRequirements": ["Requirement 1", "Requirement 2"],
    "operationalRisks": ["Risk 1", "Risk 2"],
    "score": "1-10 score with 10 being highly feasible"
  },
  "financial": {
    "startupCosts": "Estimated range in dollars",
    "monthlyBurnRate": "Estimated range in dollars per month",
    "breakEvenTimeframe": "Estimated time to break-even",
    "keyAssumptions": ["Assumption 1", "Assumption 2"],
    "score": "1-10 score with 10 being highly feasible"
  },
  "regulatory": {
    "keyRegulations": ["Regulation 1", "Regulation 2"],
    "complianceComplexity": "High/Medium/Low with brief explanation",
    "regulatoryRisks": ["Risk 1", "Risk 2"],
    "score": "1-10 score with 10 being highly feasible"
  },
  "market": {
    "productMarketFit": "Assessment of product-market fit",
    "adoptionBarriers": ["Barrier 1", "Barrier 2"],
    "marketReadiness": "Assessment of market readiness for this solution",
    "score": "1-10 score with 10 being highly feasible"
  },
  "overallFeasibilityScore": "1-10 score with 10 being highly feasible",
  "summary": "A comprehensive 2-3 paragraph summary of the feasibility assessment"
}`;

// Create the prompt template
const feasibilityAnalysisPrompt = PromptTemplate.fromTemplate(`
{system_prompt}

STARTUP IDEA:
{idea}

CONTEXT FROM OTHER ANALYSES:
{context}

Based on the above information, perform a comprehensive feasibility assessment for this startup idea.
Consider all aspects of feasibility: technical, operational, financial, regulatory, and market.
Be realistic but fair in your assessments, and provide specific reasons for your scores.
The goal is to identify potential challenges early while recognizing genuinely promising opportunities.
`);

// Create the feasibility analysis agent
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
  temperature: 0.2,
});

// Build the feasibility analysis agent chain
export const feasibilityAnalysisAgent = RunnableSequence.from([
  {
    system_prompt: () => FEASIBILITY_ANALYSIS_SYSTEM_PROMPT,
    idea: (input) => JSON.stringify(input.idea),
    context: (input) => input.context || "No previous analyses available.",
  },
  feasibilityAnalysisPrompt,
  model,
  new StringOutputParser(),
  async (output) => {
    try {
      // Try to parse as JSON
      return JSON.parse(output);
    } catch (error) {
      console.error("Error parsing feasibility analysis output:", error);
      
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
        error: "Failed to parse feasibility analysis results",
        rawOutput: output,
      };
    }
  },
]);
