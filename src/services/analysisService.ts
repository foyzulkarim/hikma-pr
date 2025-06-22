// Analysis Service - Coordinates multi-pass analysis with specialized prompts

import { AnalysisPass, ChunkInfo, AnalysisConfig, FileAnalysisResult } from '../types/analysis';
import { LLMClient } from './llmService';
import { 
  PromptBuilder, 
  SYNTAX_LOGIC_TEMPLATE,
  SECURITY_PERFORMANCE_TEMPLATE,
  ARCHITECTURE_DESIGN_TEMPLATE,
  TESTING_DOCS_TEMPLATE 
} from '../prompts/templates';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

export class AnalysisService {
  private llmClient: LLMClient;
  private config: AnalysisConfig;

  constructor(config: AnalysisConfig) {
    this.config = config;
    // For now, use the same model for all passes as requested
    this.llmClient = new LLMClient({
      baseUrl: config.models.syntax_logic.base_url || 'http://localhost:11434',
      model: config.models.syntax_logic.name,
      provider: config.models.syntax_logic.provider
    });
    
    console.log(chalk.blue(`🔬 Analysis service initialized with model: ${chalk.yellow(config.models.syntax_logic.name)}`));
  }

  /**
   * Perform all four analysis passes on a chunk
   */
  async analyzeChunk(chunk: ChunkInfo): Promise<{
    syntax_logic?: AnalysisPass;
    security_performance?: AnalysisPass;
    architecture_design?: AnalysisPass;
    testing_docs?: AnalysisPass;
  }> {
    console.log(chalk.blue(`\n🔬 Starting 4-pass analysis for chunk: ${chunk.id.slice(0, 8)}`));
    console.log(chalk.gray(`📁 File: ${chunk.file_path}`));
    console.log(chalk.gray(`🔢 Tokens: ${chunk.size_tokens}`));
    
    const results: any = {};
    
    // Perform each analysis pass
    const passes = [
      { name: 'syntax_logic', template: SYNTAX_LOGIC_TEMPLATE },
      { name: 'security_performance', template: SECURITY_PERFORMANCE_TEMPLATE },
      { name: 'architecture_design', template: ARCHITECTURE_DESIGN_TEMPLATE },
      { name: 'testing_docs', template: TESTING_DOCS_TEMPLATE }
    ];
    
    for (const pass of passes) {
      try {
        console.log(chalk.cyan(`\n📝 Running ${pass.name} analysis...`));
        const startTime = Date.now();
        
        const analysis = await this.runSinglePass(
          chunk, 
          pass.name as 'syntax_logic' | 'security_performance' | 'architecture_design' | 'testing_docs',
          pass.template
        );
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(chalk.green(`✅ ${pass.name} completed in ${(duration / 1000).toFixed(1)}s`));
        console.log(chalk.gray(`📊 Risk level: ${analysis.risk_level}`));
        console.log(chalk.gray(`🔍 Issues found: ${analysis.issues_found.length}`));
        
        results[pass.name] = analysis;
        
        // Brief pause between passes to avoid overwhelming the LLM
        await this.sleep(1000);
        
      } catch (error) {
        console.error(chalk.red(`❌ Error in ${pass.name} analysis:`), error);
        // Continue with other passes even if one fails
        results[pass.name] = this.createErrorAnalysis(chunk, pass.name as any, error as Error);
      }
    }
    
    console.log(chalk.green(`✅ All 4 passes completed for chunk ${chunk.id.slice(0, 8)}`));
    
    return results;
  }

  /**
   * Run a single analysis pass
   */
  private async runSinglePass(
    chunk: ChunkInfo, 
    passType: 'syntax_logic' | 'security_performance' | 'architecture_design' | 'testing_docs',
    template: string
  ): Promise<AnalysisPass> {
    const prompt = PromptBuilder.buildAnalysisPrompt(template, chunk);
    
    console.log(chalk.blue(`📤 Sending ${passType} prompt (${prompt.length} chars)`));
    console.log(chalk.gray(`"${prompt.substring(0, 150)}..."`));
    
    const startTime = Date.now();
    
    // Use streaming for real-time feedback
    let fullResponse = '';
    const response = await this.llmClient.generate(prompt, {
      onData: (chunk: string) => {
        fullResponse += chunk;
        process.stdout.write(chalk.cyan(chunk));
      },
      onComplete: (response: string) => {
        console.log(); // New line after streaming
      },
      onError: (error: Error) => {
        console.error(chalk.red(`❌ Streaming error:`), error.message);
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Parse the structured response
    const parsedAnalysis = this.parseAnalysisResponse(response, passType);
    
    return {
      id: uuidv4(),
      chunk_id: chunk.id,
      pass_type: passType,
      analysis_result: response,
      risk_level: parsedAnalysis.riskLevel,
      issues_found: parsedAnalysis.issues,
      recommendations: parsedAnalysis.recommendations,
      tokens_used: Math.ceil(prompt.length / 4) + Math.ceil(response.length / 4),
      duration_ms: duration,
      timestamp: new Date()
    };
  }

  /**
   * Parse structured analysis response to extract key information
   */
  private parseAnalysisResponse(response: string, passType: string): {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    issues: string[];
    recommendations: string[];
  } {
    // Extract risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    const riskMatch = response.match(/Risk\s+(?:Level|Assessment).*?:\s*(\w+)/i);
    if (riskMatch) {
      const level = riskMatch[1].toUpperCase();
      if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(level)) {
        riskLevel = level as any;
      }
    }
    
    // Extract issues (lines that start with - or bullet points)
    const issues: string[] = [];
    const issueMatches = response.match(/^[\s]*[-•*]\s*(.+)$/gm);
    if (issueMatches) {
      issues.push(...issueMatches.map(match => match.replace(/^[\s]*[-•*]\s*/, '').trim()));
    }
    
    // Extract recommendations (looking for recommendation sections)
    const recommendations: string[] = [];
    const recSections = response.match(/(?:Recommendations?|Suggestions?)[\s\S]*?(?=##|$)/gi);
    if (recSections) {
      for (const section of recSections) {
        const recMatches = section.match(/^[\s]*[-•*]\s*(.+)$/gm);
        if (recMatches) {
          recommendations.push(...recMatches.map(match => match.replace(/^[\s]*[-•*]\s*/, '').trim()));
        }
      }
    }
    
    return {
      riskLevel,
      issues: issues.slice(0, 10), // Limit to top 10 issues
      recommendations: recommendations.slice(0, 10) // Limit to top 10 recommendations
    };
  }

  /**
   * Synthesize file-level analysis from chunk analyses
   */
  async synthesizeFileAnalysis(
    filePath: string, 
    chunkAnalyses: { [chunkId: string]: any }
  ): Promise<FileAnalysisResult> {
    console.log(chalk.magenta(`\n📊 Synthesizing file analysis for: ${chalk.yellow(filePath)}`));
    
    const chunks = Object.keys(chunkAnalyses);
    console.log(chalk.blue(`🧩 Combining results from ${chunks.length} chunks`));
    
    // Prepare analysis summary for synthesis
    let analysisText = '';
    let totalIssues = 0;
    let highestRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    const allRecommendations: string[] = [];
    
    for (const chunkId of chunks) {
      const chunkAnalysis = chunkAnalyses[chunkId];
      analysisText += `\n## Chunk ${chunkId.slice(0, 8)}\n`;
      
      for (const passType of ['syntax_logic', 'security_performance', 'architecture_design', 'testing_docs']) {
        const pass = chunkAnalysis[passType];
        if (pass) {
          analysisText += `\n### ${passType.replace('_', ' ').toUpperCase()}\n`;
          analysisText += `Risk: ${pass.risk_level}\n`;
          analysisText += `Analysis: ${pass.analysis_result}\n`;
          
          totalIssues += pass.issues_found.length;
          allRecommendations.push(...pass.recommendations);
          
          // Track highest risk level
          const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
          if (riskLevels.indexOf(pass.risk_level) > riskLevels.indexOf(highestRisk)) {
            highestRisk = pass.risk_level;
          }
        }
      }
    }
    
    // Generate synthesis using LLM
    const synthesisPrompt = PromptBuilder.buildFileSynthesisPrompt(
      filePath,
      chunks.length,
      analysisText
    );
    
    console.log(chalk.magenta(`🤖 Generating file synthesis...`));
    
    const synthesis = await this.llmClient.generate(synthesisPrompt, {
      onData: (chunk: string) => {
        process.stdout.write(chalk.magenta(chunk));
      },
      onComplete: () => {
        console.log(); // New line
        console.log(chalk.green(`✅ File synthesis completed for ${filePath}`));
      }
    });
    
    return {
      file_path: filePath,
      total_chunks: chunks.length,
      chunk_analyses: chunkAnalyses,
      file_synthesis: synthesis,
      overall_risk: highestRisk,
      total_issues: totalIssues,
      recommendations: [...new Set(allRecommendations)].slice(0, 15) // Dedupe and limit
    };
  }

  /**
   * Create error analysis when a pass fails
   */
  private createErrorAnalysis(
    chunk: ChunkInfo, 
    passType: 'syntax_logic' | 'security_performance' | 'architecture_design' | 'testing_docs',
    error: Error
  ): AnalysisPass {
    return {
      id: uuidv4(),
      chunk_id: chunk.id,
      pass_type: passType,
      analysis_result: `Error during ${passType} analysis: ${error.message}`,
      risk_level: 'LOW',
      issues_found: [`Analysis failed: ${error.message}`],
      recommendations: ['Retry analysis or review manually'],
      tokens_used: 0,
      duration_ms: 0,
      timestamp: new Date()
    };
  }

  /**
   * Helper to pause between operations
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update model configuration
   */
  updateModel(modelName: string): void {
    console.log(chalk.blue(`🔄 Switching to model: ${chalk.yellow(modelName)}`));
    this.llmClient = new LLMClient({
      ...this.config.models.syntax_logic,
      model: modelName
    });
  }

  /**
   * Get analysis statistics
   */
  getAnalysisStats(analyses: { [key: string]: any }): {
    totalChunks: number;
    totalPasses: number;
    avgRiskLevel: string;
    totalIssues: number;
    totalRecommendations: number;
  } {
    const chunks = Object.keys(analyses);
    let totalPasses = 0;
    let totalIssues = 0;
    let totalRecommendations = 0;
    const riskLevels: string[] = [];
    
    for (const chunkId of chunks) {
      const chunkAnalysis = analyses[chunkId];
      for (const passType of ['syntax_logic', 'security_performance', 'architecture_design', 'testing_docs']) {
        const pass = chunkAnalysis[passType];
        if (pass) {
          totalPasses++;
          totalIssues += pass.issues_found.length;
          totalRecommendations += pass.recommendations.length;
          riskLevels.push(pass.risk_level);
        }
      }
    }
    
    // Calculate average risk level
    const riskValues = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const avgRiskValue = riskLevels.reduce((sum, level) => sum + (riskValues[level as keyof typeof riskValues] || 1), 0) / riskLevels.length;
    const avgRiskLevel = Object.keys(riskValues).find(key => riskValues[key as keyof typeof riskValues] >= avgRiskValue) || 'LOW';
    
    return {
      totalChunks: chunks.length,
      totalPasses,
      avgRiskLevel,
      totalIssues,
      totalRecommendations
    };
  }
} 
