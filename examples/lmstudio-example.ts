/**
 * Example: Using LM Studio with hikma-pr
 * 
 * This example shows how to use LM Studio as your LLM provider
 * for PR analysis with streaming support.
 */

import { createLLMClient } from '../src/services/llmService';

async function testLMStudio() {
  // Create LM Studio client
  const lmstudioClient = createLLMClient({
    provider: 'lmstudio',
    baseUrl: 'http://localhost:1234',
    model: 'qwen/qwen3-4b' // Make sure this model is loaded in LM Studio
  });

  const testPrompt = `
    Review the following simple code change:
    
    \`\`\`diff
    - const message = "Hello World";
    + const message = "Hello LM Studio";
    \`\`\`
    
    Provide a brief analysis of this change.
  `;

  console.log('🤖 Testing LM Studio integration...');
  console.log('📤 Sending test prompt...\n');

  try {
    const startTime = Date.now();
    
    // Test with streaming
    const response = await lmstudioClient.generate(testPrompt, {
      onData: (chunk: string) => {
        // Real-time streaming output
        process.stdout.write(chunk);
      },
      onComplete: (fullResponse: string) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n\n✅ LM Studio response completed in ${duration}s`);
        console.log(`📊 Total length: ${fullResponse.length} characters`);
      },
      onError: (error: Error) => {
        console.error('❌ Streaming error:', error.message);
      }
    });

    console.log('\n🎉 LM Studio integration test successful!');
    
  } catch (error) {
    console.error('❌ Error testing LM Studio:', error);
    console.log('\n💡 Make sure:');
    console.log('   - LM Studio is running (lms status)');
    console.log('   - A model is loaded');
    console.log('   - Server is accessible on port 1234');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testLMStudio();
}

export { testLMStudio }; 
