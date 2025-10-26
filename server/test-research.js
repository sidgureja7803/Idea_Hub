import { ResearchOrchestrator } from './src/agents/researchOrchestrator.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🧪 Testing IdeaHub Research Layer');
console.log('===================================\n');

// Verify required environment variables
const requiredVars = ['PERPLEXITY_API_KEY', 'CEREBRAS_API_KEY', 'MONGODB_URI'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('Please add them to your .env file\n');
  process.exit(1);
}

async function runTest() {
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Initialize Research Orchestrator
    console.log('🔧 Initializing Research Orchestrator...');
    const orchestrator = new ResearchOrchestrator();
    console.log('✅ Orchestrator initialized\n');

    // Test idea
    const testIdea = {
      title: 'AI-powered note-taking app',
      industry: 'Productivity',
      targetAudience: 'Students and professionals',
      keyFeatures: ['Voice-to-text', 'Smart organization', 'AI summarization']
    };

    console.log('🚀 Starting research for:', testIdea.title);
    console.log('   Industry:', testIdea.industry);
    console.log('   Target:', testIdea.targetAudience);
    console.log('   Features:', testIdea.keyFeatures.join(', '));
    console.log('\n⏳ Processing (this may take 30-60 seconds)...\n');

    const startTime = Date.now();

    // Run research
    const result = await orchestrator.process({
      normalizedIdea: testIdea,
      ideaId: 'test_' + Date.now()
    }, 'task_test_' + Date.now());

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Display results
    console.log('\n✅ Research Complete!');
    console.log('═════════════════════════════════════');
    console.log('⏱️  Duration:', duration, 'seconds');
    console.log('📦 Research Pack ID:', result.researchPack._id);
    console.log('🔍 Queries Generated:', result.researchPack.queries.length);
    console.log('🌐 Sources Found:', result.researchPack.sources.length);
    console.log('📄 Documents Extracted:', result.documents.length);
    console.log('💾 Cached:', result.researchPack.researchHash);
    console.log('\n📚 Top 5 Sources:');
    
    result.documents.slice(0, 5).forEach((doc, i) => {
      console.log(`\n${i + 1}. ${doc.title}`);
      console.log(`   🔗 ${doc.url}`);
      console.log(`   🏷️  ${doc.metadata.domain}`);
      console.log(`   📊 Score: ${doc.rankScore?.toFixed(2) || 'N/A'}`);
      console.log(`   📝 Content: ${doc.content.substring(0, 100)}...`);
    });

    console.log('\n═════════════════════════════════════');
    console.log('✅ Test completed successfully!\n');

    // Test cache retrieval
    console.log('🔄 Testing cache retrieval...');
    const cachedResult = await orchestrator.process({
      normalizedIdea: testIdea,
      ideaId: result.researchPack.ideaId
    }, 'task_cache_test_' + Date.now());

    if (cachedResult.researchPack._id.toString() === result.researchPack._id.toString()) {
      console.log('✅ Cache working! Results retrieved from cache instantly.\n');
    } else {
      console.log('⚠️  Cache may not be working correctly.\n');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected');
    process.exit(0);
  }
}

// Run the test
runTest();
