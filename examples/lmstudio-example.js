"use strict";
/**
 * Example: Using LM Studio with hikma-pr
 *
 * This example shows how to use LM Studio as your LLM provider
 * for PR analysis with streaming support.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testLMStudio = testLMStudio;
const llmService_1 = require("../src/services/llmService");
function testLMStudio() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create LM Studio client
        const lmstudioClient = (0, llmService_1.createLLMClient)({
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
            const response = yield lmstudioClient.generate(testPrompt, {
                onData: (chunk) => {
                    // Real-time streaming output
                    process.stdout.write(chunk);
                },
                onComplete: (fullResponse) => {
                    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                    console.log(`\n\n✅ LM Studio response completed in ${duration}s`);
                    console.log(`📊 Total length: ${fullResponse.length} characters`);
                },
                onError: (error) => {
                    console.error('❌ Streaming error:', error.message);
                }
            });
            console.log('\n🎉 LM Studio integration test successful!');
        }
        catch (error) {
            console.error('❌ Error testing LM Studio:', error);
            console.log('\n💡 Make sure:');
            console.log('   - LM Studio is running (lms status)');
            console.log('   - A model is loaded');
            console.log('   - Server is accessible on port 1234');
        }
    });
}
// Run the test if this file is executed directly
if (require.main === module) {
    testLMStudio();
}
