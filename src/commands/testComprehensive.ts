/**
 * Test command for the comprehensive analysis system
 */
import chalk from 'chalk';
import { enhancedReview } from './enhancedReview.js';

export async function testComprehensive(prUrl?: string): Promise<void> {
  console.log(chalk.bold.blue('🧪 Testing Comprehensive Analysis System'));
  console.log(chalk.blue('='.repeat(50)));

  // Use a default test PR URL if none provided
  const testPrUrl = prUrl || 'https://github.com/octocat/Hello-World/pull/1';
  
  console.log(chalk.blue(`🔗 Testing with PR: ${chalk.cyan(testPrUrl)}`));
  
  try {
    await enhancedReview(testPrUrl, {
      useComprehensiveAnalysis: true,
      enableIterativeRefinement: true,
      qualityGatesEnabled: true
    });
    
    console.log(chalk.bold.green('\n✅ Comprehensive analysis test completed successfully!'));
    
  } catch (error: any) {
    console.error(chalk.bold.red('\n❌ Comprehensive analysis test failed:'));
    console.error(chalk.red(error.message));
    console.error(chalk.gray(error.stack));
    
    // Provide troubleshooting guidance
    console.log(chalk.yellow('\n🔧 Troubleshooting:'));
    console.log(chalk.yellow('1. Ensure all required services are running (LLM providers)'));
    console.log(chalk.yellow('2. Check network connectivity for repository cloning'));
    console.log(chalk.yellow('3. Verify database permissions and schema'));
    console.log(chalk.yellow('4. Check available disk space for repository cloning'));
    
    process.exit(1);
  }
}

// Export for CLI usage
export { testComprehensive as test };
