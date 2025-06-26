#!/usr/bin/env node

/**
 * Test LLM connection and basic functionality
 */

import { RealLLMService } from './dist/services/realLLMService.js';

async function testLLMConnection() {
  console.log('🧪 Testing LM Studio Connection');
  console.log('='.repeat(50));
  
  try {
    const llmService = new RealLLMService('http://localhost:1234', 'gemma-3-1b-it-qat');
    
    // Test connection
    console.log('🔌 Testing connection to LM Studio...');
    const isConnected = await llmService.testConnection();
    
    if (!isConnected) {
      throw new Error('Could not connect to LM Studio');
    }
    
    // Test basic prompt
    console.log('\n💬 Testing basic prompt...');
    const response = await llmService.generateResponse(
      'Hello! Please respond with "LM Studio is working correctly" if you can understand this message.'
    );
    
    console.log('✅ LLM Response:', response.substring(0, 200) + (response.length > 200 ? '...' : ''));
    
    // Test structured analysis
    console.log('\n🔍 Testing structured analysis...');
    const analysisResult = await llmService.generateAnalysis(
      'test',
      { language: 'javascript', framework: 'node.js' },
      'Analyze this simple JavaScript function for any issues: function add(a, b) { return a + b; }'
    );
    
    console.log('✅ Analysis Result:');
    console.log(`   Analysis: ${analysisResult.analysis.substring(0, 100)}...`);
    console.log(`   Findings: ${analysisResult.findings.length}`);
    console.log(`   Recommendations: ${analysisResult.recommendations.length}`);
    console.log(`   Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%`);
    
    console.log('\n🎉 LM Studio integration is working perfectly!');
    console.log('✅ Ready to run comprehensive PR analysis with real LLM');
    
  } catch (error) {
    console.error('❌ LLM connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure LM Studio is running on localhost:1234');
    console.error('2. Ensure the model "gemma-3-1b-it-qat" is loaded');
    console.error('3. Check that the model is not busy with other requests');
    console.error('4. Verify network connectivity');
    
    process.exit(1);
  }
}

testLLMConnection().catch(console.error);
