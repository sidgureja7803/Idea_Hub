#!/usr/bin/env node

/**
 * Test script for Cerebras integration
 * Run with: node test-cerebras.js
 */

import dotenv from 'dotenv';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

// Load environment variables
dotenv.config();

async function testCerebrasIntegration() {
  console.log('🧪 Testing Cerebras Integration...\n');

  // Check for API key
  if (!process.env.CEREBRAS_API_KEY) {
    console.error('❌ CEREBRAS_API_KEY not found in environment variables');
    console.log('Please add your Cerebras API key to the .env file');
    process.exit(1);
  }

  try {
    // Initialize Cerebras client
    const cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY
    });

    console.log('✅ Cerebras client initialized successfully');

    // Test basic completion
    console.log('\n🦙 Testing Llama model completion...');
    const startTime = Date.now();

    const response = await cerebras.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specialized in startup analysis.'
        },
        {
          role: 'user',
          content: 'Analyze this startup idea: "A mobile app that helps people find and book local fitness classes." Provide a brief market assessment.'
        }
      ],
      model: 'llama-3.3-70b',
      max_completion_tokens: 500,
      temperature: 0.3,
      top_p: 0.9
    });

    const latency = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || 'No response';

    console.log(`✅ Completion successful in ${latency}ms`);
    console.log(`📊 Model: llama-3.3-70b`);
    console.log(`🔢 Tokens: ${response.usage?.total_tokens || 'N/A'}`);
    console.log('\n📝 Response:');
    console.log(content);

    // Test streaming
    console.log('\n\n🌊 Testing streaming completion...');
    const streamStartTime = Date.now();

    const stream = await cerebras.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a concise startup advisor.'
        },
        {
          role: 'user',
          content: 'Give me 3 quick tips for validating a startup idea.'
        }
      ],
      model: 'llama-3.3-70b',
      max_completion_tokens: 200,
      temperature: 0.2,
      stream: true
    });

    console.log('📡 Streaming response:');
    let streamedContent = '';
    
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        process.stdout.write(token);
        streamedContent += token;
      }
    }

    const streamLatency = Date.now() - streamStartTime;
    console.log(`\n\n✅ Streaming completed in ${streamLatency}ms`);
    console.log(`📏 Response length: ${streamedContent.length} characters`);

    console.log('\n🎉 All tests passed! Cerebras integration is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 This looks like an authentication error. Please check your CEREBRAS_API_KEY.');
    } else if (error.message.includes('rate limit')) {
      console.log('💡 Rate limit exceeded. Please wait a moment and try again.');
    } else if (error.message.includes('network')) {
      console.log('💡 Network error. Please check your internet connection.');
    }
    
    process.exit(1);
  }
}

// Run the test
testCerebrasIntegration().catch(console.error);