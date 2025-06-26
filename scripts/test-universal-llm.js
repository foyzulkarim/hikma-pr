#!/usr/bin/env node

/**
 * Test Universal LLM Client - Verify Local LLM Connections
 * Tests LM Studio, Ollama, and other OpenAI-compatible endpoints
 */

import { createLLMClient, PROVIDER_CONFIGS } from './src/services/universalLLMClient.js';
import { CURRENT_LLM_CONFIG } from './src/config/llmConfig.js';
import { EnhancedLLMService } from './src/services/enhancedLLMService.js';

async function testLLMProvider(providerName, providerConfig) {
  console.log(`\n🔍 Testing ${providerName}...`);
  console.log(`   URL: ${providerConfig.baseURL}`);
  console.log(`   Model: ${providerConfig.defaultModel}`);
  
  try {
    const client = createLLMClient(providerConfig, {
      enableRetry: false, // Disable retry for quick testing
      enableFallback: false
    });
    
    // Test connection
    const isConnected = await client.testConnection();
    
    if (isConnected) {
      console.log(`   ✅ Connection successful`);
      
      // Test simple completion
      const response = await client.simpleCompletion(
        "Write a simple 'Hello World' function in JavaScript.",
        { maxTokens: 100, temperature: 0.1 }
      );
      
      console.log(`   ✅ Simple completion test passed`);
      console.log(`   📝 Response preview: ${response.substring(0, 100)}...`);
      
      // Test available models
      try {
        const models = await client.getAvailableModels();
        console.log(`   📋 Available models: ${models.slice(0, 3).join(', ')}${models.length > 3 ? '...' : ''}`);
      } catch (error) {
        console.log(`   ⚠️ Could not fetch models: ${error.message}`);
      }
      
      return true;
    } else {
      console.log(`   ❌ Connection test failed`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testEnhancedLLMService() {
  console.log(`\n🧠 Testing Enhanced LLM Service...`);
  
  try {
    const llmService = new EnhancedLLMService();
    
    // Test all connections
    const connectionResults = await llmService.testConnections();
    
    console.log(`\n📊 Connection Results:`);
    for (const [analysisType, isConnected] of Object.entries(connectionResults)) {
      const status = isConnected ? '✅' : '❌';
      console.log(`   ${status} ${analysisType}: ${isConnected ? 'Connected' : 'Failed'}`);
    }
    
    // Test a simple analysis if any connection works
    const workingAnalysisTypes = Object.entries(connectionResults)
      .filter(([_, isConnected]) => isConnected)
      .map(([analysisType, _]) => analysisType);
    
    if (workingAnalysisTypes.length > 0) {
      console.log(`\n🔬 Testing analysis generation with ${workingAnalysisTypes[0]}...`);
      
      // Create minimal context for testing
      const testContext = {
        repositoryMetadata: {
          primaryLanguage: 'JavaScript',
          framework: 'Node.js',
          architecture: 'MVC'
        },
        changedFiles: ['test.js'],
        blastRadius: {
          directImpact: ['test.js'],
          indirectImpact: []
        }
      };
      
      const testPrompt = "Analyze this simple JavaScript function for potential issues:\n\nfunction add(a, b) {\n  return a + b;\n}";
      
      const analysis = await llmService.generateAnalysis(
        workingAnalysisTypes[0],
        testContext,
        testPrompt
      );
      
      console.log(`   ✅ Analysis generation successful`);
      console.log(`   📋 Findings: ${analysis.findings.length}`);
      console.log(`   💡 Recommendations: ${analysis.recommendations.length}`);
      console.log(`   🎯 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    }
    
    // Show performance stats
    const stats = llmService.getPerformanceStats();
    console.log(`\n📈 Performance Stats:`);
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Error Rate: ${stats.errorRate.toFixed(1)}%`);
    
  } catch (error) {
    console.log(`   ❌ Enhanced LLM Service test failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Universal LLM Client Test Suite');
  console.log('=' .repeat(50));
  
  // Test individual providers
  const providers = [
    ['LM Studio', PROVIDER_CONFIGS.LM_STUDIO],
    ['Ollama', PROVIDER_CONFIGS.OLLAMA],
    ['vLLM', PROVIDER_CONFIGS.VLLM]
  ];
  
  const results = {};
  
  for (const [name, config] of providers) {
    results[name] = await testLLMProvider(name, config);
  }
  
  // Test Enhanced LLM Service
  await testEnhancedLLMService();
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('=' .repeat(50));
  
  const workingProviders = Object.entries(results)
    .filter(([_, isWorking]) => isWorking)
    .map(([name, _]) => name);
  
  if (workingProviders.length > 0) {
    console.log(`✅ Working providers: ${workingProviders.join(', ')}`);
    console.log(`\n🎯 Recommendation: Use HIKMA_LLM_SETUP=${workingProviders[0].toUpperCase().replace(' ', '_')}_ONLY`);
  } else {
    console.log(`❌ No working providers found`);
    console.log(`\n🔧 Setup Instructions:`);
    console.log(`   1. Install LM Studio: https://lmstudio.ai/`);
    console.log(`   2. Download a coding model (e.g., DeepSeek Coder, Qwen2.5 Coder)`);
    console.log(`   3. Start the local server on port 1234`);
    console.log(`   4. Or install Ollama: https://ollama.ai/`);
    console.log(`   5. Run: ollama pull deepseek-coder:6.7b`);
  }
  
  console.log(`\n🏁 Test completed!`);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

main().catch(console.error);
