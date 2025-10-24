import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import axios from 'axios';
import Idea from '../models/Idea.js';
import { 
  IdeaInterpreterAgent,
  MarketResearchAgent,
  TAMSamAgent,
  QlooTasteAgent,
  CompetitionScanAgent,
  FeasibilityEvaluatorAgent,
  StrategyRecommenderAgent,
  ReportGeneratorAgent
} from './agents/index.js';

class AnalysisOrchestrator {
  constructor() {
    this.agents = {
      interpreter: new IdeaInterpreterAgent(),
      marketResearch: new MarketResearchAgent(),
      tamSam: new TAMSamAgent(),
      qloo: new QlooTasteAgent(),
      competition: new CompetitionScanAgent(),
      feasibility: new FeasibilityEvaluatorAgent(),
      strategy: new StrategyRecommenderAgent(),
      report: new ReportGeneratorAgent()
    };
  }

  async processIdea(ideaId) {
    try {
      console.log(`🚀 Starting analysis for idea: ${ideaId}`);
      
      // Get idea from database
      const idea = await Idea.findOne({ id: ideaId });
      if (!idea) {
        throw new Error('Idea not found');
      }

      // Update status to processing
      await Idea.findOneAndUpdate(
        { id: ideaId },
        { status: 'processing' }
      );

      // Step 1: Interpret the idea
      console.log(`📝 Step 1: Interpreting idea...`);
      const interpretedData = await this.agents.interpreter.process({
        description: idea.description,
        category: idea.category,
        targetAudience: idea.targetAudience,
        problemSolved: idea.problemSolved
      });

      // Update metadata
      await Idea.findOneAndUpdate(
        { id: ideaId },
        { metadata: interpretedData }
      );

      // Step 2: Market Research
      console.log(`🔍 Step 2: Conducting market research...`);
      const marketResearch = await this.agents.marketResearch.process(interpretedData);

      // Step 3: TAM/SAM/SOM Analysis
      console.log(`📊 Step 3: Analyzing market size...`);
      const tamSamSom = await this.agents.tamSam.process({
        ...interpretedData,
        marketData: marketResearch
      });

      // Step 4: Cultural Alignment (Qloo)
      console.log(`🎯 Step 4: Evaluating cultural alignment...`);
      const culturalAlignment = await this.agents.qloo.process(interpretedData);

      // Step 5: Competition Analysis
      console.log(`🏆 Step 5: Scanning competition...`);
      const competition = await this.agents.competition.process(interpretedData);

      // Step 6: Feasibility Assessment
      console.log(`⚙️ Step 6: Evaluating feasibility...`);
      const feasibility = await this.agents.feasibility.process({
        ...interpretedData,
        marketData: marketResearch,
        competition
      });

      // Step 7: Strategy Recommendations
      console.log(`💡 Step 7: Generating strategy...`);
      const strategy = await this.agents.strategy.process({
        ...interpretedData,
        marketData: marketResearch,
        tamSamSom,
        culturalAlignment,
        competition,
        feasibility
      });

      // Step 8: Generate Full Report
      console.log(`📄 Step 8: Generating report...`);
      const fullReport = await this.agents.report.process({
        idea: {
          description: idea.description,
          category: idea.category,
          targetAudience: idea.targetAudience,
          problemSolved: idea.problemSolved
        },
        interpretedData,
        marketResearch,
        tamSamSom,
        culturalAlignment,
        competition,
        feasibility,
        strategy
      });

      // Save all results
      await Idea.findOneAndUpdate(
        { id: ideaId },
        {
          status: 'completed',
          results: {
            marketResearch,
            tamSamSom,
            culturalAlignment,
            competition,
            feasibility,
            strategy
          },
          fullReport
        }
      );

      console.log(`✅ Analysis completed for idea: ${ideaId}`);
      return true;

    } catch (error) {
      console.error(`❌ Analysis failed for idea ${ideaId}:`, error);
      
      // Update status to error
      await Idea.findOneAndUpdate(
        { id: ideaId },
        { status: 'error' }
      );
      
      throw error;
    }
  }
}

// Main function to process idea analysis
export async function processIdeaAnalysis(ideaId) {
  const orchestrator = new AnalysisOrchestrator();
  return await orchestrator.processIdea(ideaId);
}
