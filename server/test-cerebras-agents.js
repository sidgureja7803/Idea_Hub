import cerebrasOrchestrator from './src/agents/cerebrasOrchestrator.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🧪 Testing Cerebras 5-Agent System');
console.log('===================================\n');

const requiredVars = ['CEREBRAS_API_KEY', 'PERPLEXITY_API_KEY', 'MONGODB_URI'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing:', missing.join(', '));
  process.exit(1);
}

async function runTest() {
  try {
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    const testIdea = {
      title: 'AI-powered personal finance coach',
      industry: 'FinTech',
      targetAudience: 'Young professionals aged 25-35',
      description: 'Mobile app that uses AI to analyze spending patterns, provide personalized budgeting advice, and automate savings',
      keyFeatures: ['AI spending analysis', 'Automated budgeting', 'Goal-based savings', 'Investment recommendations']
    };

    console.log('🚀 Starting analysis for:', testIdea.title);
    console.log('   Industry:', testIdea.industry);
    console.log('   Target:', testIdea.targetAudience);
    console.log('\n⏳ Running full pipeline (2-4 minutes)...\n');

    const startTime = Date.now();
    const ideaId = 'test_' + Date.now();
    const taskId = 'task_' + Date.now();

    const result = await cerebrasOrchestrator.run(testIdea, ideaId, taskId);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Analysis Complete!');
    console.log('═════════════════════════════════════');
    console.log('⏱️  Total Duration:', duration, 'seconds');
    console.log('📦 Research Pack ID:', result.researchPackId);
    
    console.log('\n📊 Market Analysis:');
    console.log('   Market Size:', result.marketAnalysis.marketSize.currentSize);
    console.log('   Growth Rate:', result.marketAnalysis.marketSize.growthRate);
    console.log('   Trends:', result.marketAnalysis.trends.length);
    console.log('   Confidence:', result.marketAnalysis.confidence + '%');

    console.log('\n💰 TAM/SAM/SOM:');
    console.log('   TAM:', result.tamSamEstimate.tam.value);
    console.log('   SAM:', result.tamSamEstimate.sam.value);
    console.log('   SOM:', result.tamSamEstimate.som.value);
    console.log('   Methodology:', result.tamSamEstimate.methodology);
    console.log('   Confidence:', result.tamSamEstimate.confidence + '%');

    console.log('\n🏢 Competition:');
    console.log('   Market Leaders:', result.competitorAnalysis.marketLeaders.length);
    console.log('   Emerging Players:', result.competitorAnalysis.emergingPlayers.length);
    console.log('   Differentiation Opps:', result.competitorAnalysis.differentiationOpportunities.length);
    console.log('   Confidence:', result.competitorAnalysis.confidence + '%');

    console.log('\n⚙️  Feasibility:');
    console.log('   Overall Score:', result.feasibilityAssessment.overallFeasibilityScore + '/10');
    console.log('   Technical:', result.feasibilityAssessment.technical.score + '/10');
    console.log('   Financial:', result.feasibilityAssessment.financial.score + '/10');
    console.log('   Market:', result.feasibilityAssessment.market.score + '/10');
    console.log('   Confidence:', result.feasibilityAssessment.confidence + '%');

    console.log('\n🎯 Strategy:');
    console.log('   Target Segment:', result.strategy.goToMarket.initialTargetSegment);
    console.log('   Channels:', result.strategy.goToMarket.channels.length);
    console.log('   Revenue Streams:', result.strategy.monetization.revenueStreams.length);
    console.log('   Partnerships:', result.strategy.partnerships.length);
    console.log('   Confidence:', result.strategy.confidence + '%');

    console.log('\n📈 Timings:');
    console.log('   Market Analyst:', result.metadata.timings.market + 'ms');
    console.log('   TAM/SAM Estimator:', result.metadata.timings.tamSam + 'ms');
    console.log('   Competitor Scanner:', result.metadata.timings.competitor + 'ms');
    console.log('   Feasibility Evaluator:', result.metadata.timings.feasibility + 'ms');
    console.log('   Strategy Recommender:', result.metadata.timings.strategy + 'ms');

    console.log('\n🔄 Retry Attempts:');
    console.log('   Market:', result.metadata.attempts.market);
    console.log('   TAM/SAM:', result.metadata.attempts.tamSam);
    console.log('   Competitor:', result.metadata.attempts.competitor);
    console.log('   Feasibility:', result.metadata.attempts.feasibility);
    console.log('   Strategy:', result.metadata.attempts.strategy);

    console.log('\n═════════════════════════════════════');
    console.log('✅ Test completed successfully!\n');

    console.log('🔄 Testing cache retrieval...');
    const cacheStart = Date.now();
    const cachedResult = await cerebrasOrchestrator.run(testIdea, ideaId, taskId + '_cache');
    const cacheDuration = ((Date.now() - cacheStart) / 1000).toFixed(2);

    console.log(`✅ Cache test complete in ${cacheDuration}s (should be <5s)\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected');
    process.exit(0);
  }
}

runTest();
