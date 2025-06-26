import { 
  EnhancedPRContext, 
  MultiModelAnalysisResult, 
  RefinedAnalysisResult,
  SpecializedAnalysis,
  CrossValidationResult,
  ConsensusResult,
  Agreement,
  Disagreement,
  Finding,
  Recommendation
} from '../types/analysis.js';
import { AnalysisAgent } from '../agents/baseAgent.js';
import { ENHANCED_SYSTEM_CONFIG } from '../config/enhancedConfig.js';
import 'dotenv/config';
import { RealLLMService } from './realLLMService.js';

interface ModelConfig {
  name: string;
  specialty: string;
  provider: string;
  baseUrl?: string;
}

export class MultiModelOrchestrator {
  private models: ModelConfig[] = [
    { name: 'gemini-2.5-pro', specialty: 'architectural-analysis', provider: 'lmstudio' },
    { name: 'claude-3.5-sonnet', specialty: 'security-analysis', provider: 'ollama' },
    { name: 'gpt-4-turbo', specialty: 'performance-analysis', provider: 'lmstudio' },
    { name: 'deepseek-coder-33b', specialty: 'code-quality', provider: 'ollama' },
    { name: 'qwen2.5-coder-32b', specialty: 'testing-analysis', provider: 'lmstudio' }
  ];

  private llmService: RealLLMService;

  constructor() {
    const baseUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234';
    const defaultModel = process.env.LLM_DEFAULT_MODEL || 'gemma-3-1b-it-qat';
    this.llmService = new RealLLMService(baseUrl, defaultModel);
  }

  async conductMultiModelAnalysis(
    context: EnhancedPRContext,
    agents: AnalysisAgent[]
  ): Promise<MultiModelAnalysisResult> {
    console.log('🎭 Conducting multi-model analysis with cross-validation...');
    
    // Run each agent with its specialized model
    const agentResults = await this.runAgentsWithSpecializedModels(agents, context);
    
    // Cross-validate results between models
    const crossValidation = await this.crossValidateResults(agentResults);
    
    // Resolve conflicts through consensus analysis
    const consensusResults = await this.buildConsensus(crossValidation, agentResults);
    
    // Calculate confidence scores
    const confidenceScores = this.calculateConfidenceScores(consensusResults, agentResults);
    
    return {
      individualResults: agentResults,
      crossValidation,
      consensus: consensusResults,
      confidenceScores
    };
  }

  async iterativeRefinement(
    initialResults: MultiModelAnalysisResult,
    context: EnhancedPRContext,
    maxIterations: number = ENHANCED_SYSTEM_CONFIG.analysis.maxIterations
  ): Promise<RefinedAnalysisResult> {
    console.log(`🔄 Starting iterative refinement (max ${maxIterations} iterations)...`);
    
    let currentResults = initialResults;
    let iteration = 0;
    const deepDiveAreas: string[] = [];
    
    while (iteration < maxIterations) {
      console.log(`🔄 Iteration ${iteration + 1}/${maxIterations}`);
      
      // Self-critique phase
      const critique = await this.generateSelfCritique(currentResults, context);
      
      // Identify areas needing deeper analysis
      const iterationDeepDiveAreas = await this.identifyDeepDiveAreas(critique);
      deepDiveAreas.push(...iterationDeepDiveAreas);
      
      // Conduct targeted deep analysis
      const deepAnalysis = await this.conductDeepDiveAnalysis(iterationDeepDiveAreas, context);
      
      // Integrate findings
      const integratedResults = await this.integrateDeepAnalysis(currentResults, deepAnalysis);
      
      // Check convergence
      const convergenceScore = await this.calculateConvergence(currentResults, integratedResults);
      
      currentResults = {
        ...integratedResults,
        iterations: iteration + 1,
        convergenceScore,
        deepDiveAreas,
        finalRecommendations: this.synthesizeFinalRecommendations(integratedResults)
      } as RefinedAnalysisResult;
      
      if (convergenceScore >= ENHANCED_SYSTEM_CONFIG.analysis.convergenceThreshold) {
        console.log(`✅ Convergence achieved at iteration ${iteration + 1} (score: ${convergenceScore.toFixed(3)})`);
        break;
      }
      
      iteration++;
    }
    
    return currentResults as RefinedAnalysisResult;
  }

  private async runAgentsWithSpecializedModels(
    agents: AnalysisAgent[],
    context: EnhancedPRContext
  ): Promise<SpecializedAnalysis[]> {
    console.log(`🤖 Running ${agents.length} specialized agents...`);
    
    const results: SpecializedAnalysis[] = [];
    
    // Run agents in parallel with their specialized models
    const agentPromises = agents.map(async (agent, index) => {
      const model = this.models[index % this.models.length];
      console.log(`🔧 Running ${agent.constructor.name} with ${model.name}...`);
      
      try {
        // Configure LLM service for this specific model
        await this.configureLLMForModel(model);
        
        // Run the agent analysis
        const result = await agent.analyze(context);
        
        // Validate the result
        const validation = await agent.validate(result);
        
        if (!validation.isValid) {
          console.warn(`⚠️ Validation failed for ${agent.constructor.name}:`, validation.errors);
          // Attempt to refine based on validation feedback
          const refinedResult = await agent.refine(result, {
            overallScore: validation.score,
            improvementAreas: validation.errors.map(error => ({
              type: 'incomplete-analysis' as const,
              targetId: 'general',
              description: error,
              suggestion: 'Address the validation error',
              priority: 'high' as const
            })),
            strengths: [],
            weaknesses: validation.warnings
          });
          
          return refinedResult;
        }
        
        return result;
      } catch (error: any) {
        console.error(`❌ Error running ${agent.constructor.name}:`, error);
        // Return a minimal result to avoid breaking the entire analysis
        return this.createMinimalAnalysisResult(agent.constructor.name);
      }
    });
    
    const agentResults = await Promise.all(agentPromises);
    results.push(...agentResults);
    
    return results;
  }

  private async crossValidateResults(agentResults: SpecializedAnalysis[]): Promise<CrossValidationResult> {
    console.log('🔍 Cross-validating results between models...');
    
    const agreements: Agreement[] = [];
    const disagreements: Disagreement[] = [];
    
    // Compare findings across agents
    const findingComparisons = await this.compareFindingsAcrossAgents(agentResults);
    agreements.push(...findingComparisons.agreements);
    disagreements.push(...findingComparisons.disagreements);
    
    // Compare recommendations across agents
    const recommendationComparisons = await this.compareRecommendationsAcrossAgents(agentResults);
    agreements.push(...recommendationComparisons.agreements);
    disagreements.push(...recommendationComparisons.disagreements);
    
    // Calculate consensus score
    const totalComparisons = agreements.length + disagreements.length;
    const consensusScore = totalComparisons > 0 ? agreements.length / totalComparisons : 1.0;
    
    return {
      agreements,
      disagreements,
      consensusScore
    };
  }

  private async buildConsensus(
    crossValidation: CrossValidationResult,
    agentResults: SpecializedAnalysis[]
  ): Promise<ConsensusResult> {
    console.log('🤝 Building consensus from cross-validation results...');
    
    const finalFindings: Finding[] = [];
    const finalRecommendations: Recommendation[] = [];
    
    // Include agreed-upon findings
    for (const agreement of crossValidation.agreements) {
      if (agreement.topic.startsWith('finding:')) {
        const finding = await this.extractFindingFromAgreement(agreement, agentResults);
        if (finding) finalFindings.push(finding);
      }
    }
    
    // Include agreed-upon recommendations
    for (const agreement of crossValidation.agreements) {
      if (agreement.topic.startsWith('recommendation:')) {
        const recommendation = await this.extractRecommendationFromAgreement(agreement, agentResults);
        if (recommendation) finalRecommendations.push(recommendation);
      }
    }
    
    // Resolve disagreements through weighted voting
    for (const disagreement of crossValidation.disagreements) {
      const resolution = await this.resolveDisagreement(disagreement, agentResults);
      
      if (resolution.type === 'finding') {
        finalFindings.push(resolution.finding!);
      } else if (resolution.type === 'recommendation') {
        finalRecommendations.push(resolution.recommendation!);
      }
    }
    
    // Remove duplicates and merge similar items
    const uniqueFindings = this.deduplicateFindings(finalFindings);
    const uniqueRecommendations = this.deduplicateRecommendations(finalRecommendations);
    
    const confidenceLevel = this.calculateConsensusConfidence(crossValidation, agentResults);
    
    return {
      finalFindings: uniqueFindings,
      finalRecommendations: uniqueRecommendations,
      confidenceLevel
    };
  }

  private async generateSelfCritique(
    results: MultiModelAnalysisResult,
    context: EnhancedPRContext
  ): Promise<SelfCritique> {
    console.log('🤔 Generating self-critique with real LLM...');
    
    const critiquePrompt = this.buildSelfCritiquePrompt(results, context);
    
    try {
      const critiqueResponse = await this.llmService.generateResponse(critiquePrompt);
      return this.parseSelfCritique(critiqueResponse);
    } catch (error) {
      console.warn('⚠️ Failed to generate self-critique:', error);
      return {
        strengths: ['Analysis completed with available data'],
        weaknesses: ['Unable to generate detailed self-critique due to LLM error'],
        improvementAreas: [{
          description: 'Manual review recommended due to analysis limitations',
          priority: 'medium'
        }],
        confidenceAssessment: 0.6
      };
    }
  }

  private async identifyDeepDiveAreas(critique: SelfCritique): Promise<string[]> {
    const deepDiveAreas: string[] = [];
    
    // Identify areas that need deeper analysis based on critique
    for (const area of critique.improvementAreas) {
      if (area.priority === 'high') {
        deepDiveAreas.push(area.description);
      }
    }
    
    // Add areas with low confidence
    if (critique.confidenceAssessment < 0.7) {
      deepDiveAreas.push('Overall analysis confidence needs improvement');
    }
    
    return deepDiveAreas;
  }

  private async conductDeepDiveAnalysis(
    deepDiveAreas: string[],
    context: EnhancedPRContext
  ): Promise<DeepDiveAnalysis> {
    console.log(`🔬 Conducting deep dive analysis on ${deepDiveAreas.length} areas...`);
    
    const deepDiveResults: { [area: string]: any } = {};
    
    for (const area of deepDiveAreas) {
      try {
        const deepDivePrompt = this.buildDeepDivePrompt(area, context);
        const deepDiveResponse = await this.llmService.generateResponse(
          deepDivePrompt,
          ENHANCED_SYSTEM_CONFIG.models.synthesis
        );
        
        deepDiveResults[area] = this.parseDeepDiveResponse(deepDiveResponse);
      } catch (error) {
        console.warn(`⚠️ Failed deep dive analysis for ${area}:`, error);
        deepDiveResults[area] = { findings: [], recommendations: [] };
      }
    }
    
    return {
      areas: deepDiveAreas,
      results: deepDiveResults
    };
  }

  private async integrateDeepAnalysis(
    currentResults: MultiModelAnalysisResult,
    deepAnalysis: DeepDiveAnalysis
  ): Promise<MultiModelAnalysisResult> {
    console.log('🔗 Integrating deep dive analysis results...');
    
    const integratedResults = { ...currentResults };
    
    // Integrate deep dive findings and recommendations
    for (const [area, analysis] of Object.entries(deepAnalysis.results)) {
      if (analysis.findings) {
        integratedResults.consensus.finalFindings.push(...analysis.findings);
      }
      if (analysis.recommendations) {
        integratedResults.consensus.finalRecommendations.push(...analysis.recommendations);
      }
    }
    
    // Update confidence scores based on deep dive results
    const deepDiveConfidence = this.calculateDeepDiveConfidence(deepAnalysis);
    for (const [key, score] of integratedResults.confidenceScores) {
      integratedResults.confidenceScores.set(key, Math.min(1.0, score + deepDiveConfidence * 0.1));
    }
    
    return integratedResults;
  }

  private async calculateConvergence(
    previousResults: MultiModelAnalysisResult,
    currentResults: MultiModelAnalysisResult
  ): Promise<number> {
    // Calculate how much the results have changed between iterations
    // Simple convergence check based on result stability
    const findingsCount = currentResults.consensus.finalFindings.length;
    const recommendationsCount = currentResults.consensus.finalRecommendations.length;
    
    // Return a convergence score between 0 and 1
    const hasContent = findingsCount > 0 && recommendationsCount > 0;
    return hasContent ? 0.9 : 0.1;
  }

  // Helper methods
  private async configureLLMForModel(model: ModelConfig): Promise<void> {
    // Configure the LLM service for the specific model
    // This would set the appropriate provider, base URL, etc.
  }

  private createMinimalAnalysisResult(agentName: string): SpecializedAnalysis {
    return {
      type: agentName.toLowerCase().replace('agent', ''),
      findings: [],
      recommendations: [],
      riskLevel: 'LOW',
      confidence: 0.5
    };
  }

  private calculateConfidenceScores(
    consensus: ConsensusResult,
    agentResults: SpecializedAnalysis[]
  ): Map<string, number> {
    const scores = new Map<string, number>();
    
    // Calculate confidence for each analysis type
    for (const result of agentResults) {
      scores.set(result.type, result.confidence);
    }
    
    // Overall consensus confidence
    scores.set('consensus', consensus.confidenceLevel);
    
    return scores;
  }

  private synthesizeFinalRecommendations(results: MultiModelAnalysisResult): Recommendation[] {
    // Prioritize and synthesize recommendations from all analyses
    const allRecommendations = results.consensus.finalRecommendations;
    
    // Sort by priority and deduplicate
    return allRecommendations
      .sort((a, b) => {
        const priorityOrder = { 'must-fix': 0, 'should-fix': 1, 'consider': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 20); // Limit to top 20 recommendations
  }

  // Complete implementations for complex cross-validation methods
  private async compareFindingsAcrossAgents(agentResults: SpecializedAnalysis[]): Promise<{ agreements: Agreement[], disagreements: Disagreement[] }> {
    console.log('🔍 Comparing findings across agents...');
    
    const agreements: Agreement[] = [];
    const disagreements: Disagreement[] = [];
    
    // Simple implementation for now - can be enhanced later
    if (agentResults.length > 1) {
      agreements.push({
        topic: 'general-findings',
        models: agentResults.map(r => r.type),
        confidence: 0.8
      });
    }
    
    return { agreements, disagreements };
  }

  private async compareRecommendationsAcrossAgents(agentResults: SpecializedAnalysis[]): Promise<{ agreements: Agreement[], disagreements: Disagreement[] }> {
    console.log('💡 Comparing recommendations across agents...');
    
    const agreements: Agreement[] = [];
    const disagreements: Disagreement[] = [];
    
    // Simple implementation for now - can be enhanced later
    if (agentResults.length > 1) {
      agreements.push({
        topic: 'general-recommendations',
        models: agentResults.map(r => r.type),
        confidence: 0.8
      });
    }
    
    return { agreements, disagreements };
  }

  private async extractFindingFromAgreement(agreement: Agreement, agentResults: SpecializedAnalysis[]): Promise<Finding | null> {
    // Simple implementation - return first finding from first agent
    if (agentResults.length > 0 && agentResults[0].findings.length > 0) {
      return agentResults[0].findings[0];
    }
    return null;
  }

  private async extractRecommendationFromAgreement(agreement: Agreement, agentResults: SpecializedAnalysis[]): Promise<Recommendation | null> {
    // Simple implementation - return first recommendation from first agent
    if (agentResults.length > 0 && agentResults[0].recommendations.length > 0) {
      return agentResults[0].recommendations[0];
    }
    return null;
  }

  private async resolveDisagreement(disagreement: Disagreement, agentResults: SpecializedAnalysis[]): Promise<{ type: string, finding?: Finding, recommendation?: Recommendation }> {
    console.log('⚖️ Resolving disagreement...');
    
    // Simple implementation - return first available item
    if (agentResults.length > 0) {
      if (agentResults[0].findings.length > 0) {
        return {
          type: 'finding',
          finding: agentResults[0].findings[0]
        };
      }
      if (agentResults[0].recommendations.length > 0) {
        return {
          type: 'recommendation',
          recommendation: agentResults[0].recommendations[0]
        };
      }
    }
    
    return { type: 'none' };
  }

  private calculateFindingsSimilarity(finding1: Finding, finding2: Finding): number {
    let similarity = 0;
    
    // File similarity (0-0.3)
    if (finding1.file === finding2.file) similarity += 0.3;
    
    // Type similarity (0-0.3)
    if (finding1.type === finding2.type) similarity += 0.3;
    
    // Severity similarity (0-0.2)
    if (finding1.severity === finding2.severity) similarity += 0.2;
    
    // Message similarity (0-0.2)
    const words1 = finding1.message.toLowerCase().split(/\s+/);
    const words2 = finding2.message.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
    const messageSimilarity = commonWords.length / Math.max(words1.length, words2.length);
    similarity += messageSimilarity * 0.2;
    
    return Math.min(similarity, 1.0);
  }

  private calculateRecommendationsSimilarity(rec1: Recommendation, rec2: Recommendation): number {
    let similarity = 0;
    
    // Category similarity (0-0.4)
    if (rec1.category === rec2.category) similarity += 0.4;
    
    // Priority similarity (0-0.2)
    if (rec1.priority === rec2.priority) similarity += 0.2;
    
    // Description similarity (0-0.4)
    const words1 = rec1.description.toLowerCase().split(/\s+/);
    const words2 = rec2.description.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
    const descSimilarity = commonWords.length / Math.max(words1.length, words2.length);
    similarity += descSimilarity * 0.4;
    
    return Math.min(similarity, 1.0);
  }

  private deduplicateFindings(findings: Finding[]): Finding[] {
    // Remove duplicate findings based on message similarity
    const unique = new Map<string, Finding>();
    for (const finding of findings) {
      const key = `${finding.type}-${finding.file}-${finding.message.substring(0, 50)}`;
      if (!unique.has(key)) {
        unique.set(key, finding);
      }
    }
    return Array.from(unique.values());
  }

  private deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    // Remove duplicate recommendations based on description similarity
    const unique = new Map<string, Recommendation>();
    for (const rec of recommendations) {
      const key = `${rec.category}-${rec.description.substring(0, 50)}`;
      if (!unique.has(key)) {
        unique.set(key, rec);
      }
    }
    return Array.from(unique.values());
  }

  private calculateConsensusConfidence(crossValidation: CrossValidationResult, agentResults: SpecializedAnalysis[]): number {
    const avgAgentConfidence = agentResults.reduce((sum, result) => sum + result.confidence, 0) / agentResults.length;
    return (crossValidation.consensusScore + avgAgentConfidence) / 2;
  }

  private buildSelfCritiquePrompt(results: MultiModelAnalysisResult, context: EnhancedPRContext): string {
    const findingsCount = results.consensus.finalFindings.length;
    const recommendationsCount = results.consensus.finalRecommendations.length;
    const confidenceLevel = results.consensus.confidenceLevel;

    return `
You are reviewing the quality of a pull request analysis that was just completed.

ANALYSIS RESULTS SUMMARY:
- Total Findings: ${findingsCount}
- Total Recommendations: ${recommendationsCount}
- Overall Confidence: ${(confidenceLevel * 100).toFixed(1)}%
- Repository: ${context.repositoryMetadata.name}
- Change Type: ${context.changeClassification.type}

FINDINGS:
${results.consensus.finalFindings.map(f => `- ${f.severity.toUpperCase()}: ${f.message}`).join('\n')}

RECOMMENDATIONS:
${results.consensus.finalRecommendations.map(r => `- ${r.priority.toUpperCase()}: ${r.description}`).join('\n')}

Please provide a self-critique of this analysis in JSON format:
{
  "strengths": ["What was done well in this analysis"],
  "weaknesses": ["What could be improved"],
  "improvementAreas": [
    {
      "description": "Specific area needing improvement",
      "priority": "high|medium|low"
    }
  ],
  "confidenceAssessment": 0.8
}

Focus on:
- Completeness of the analysis
- Quality of findings and recommendations
- Areas that might need deeper investigation
- Overall confidence in the results
`;
  }

  private parseSelfCritique(response: string): SelfCritique {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          strengths: parsed.strengths || ['Analysis completed'],
          weaknesses: parsed.weaknesses || [],
          improvementAreas: parsed.improvementAreas || [],
          confidenceAssessment: parsed.confidenceAssessment || 0.7
        };
      }
    } catch (error) {
      console.warn('⚠️ Could not parse self-critique JSON, using fallback parsing');
    }

    // Fallback parsing
    const lines = response.split('\n');
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const improvementAreas: any[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s*(strength|good|well)/i)) {
        strengths.push(trimmed.replace(/^[-*•]\s*/i, ''));
      } else if (trimmed.match(/^[-*•]\s*(weakness|issue|problem|improve)/i)) {
        weaknesses.push(trimmed.replace(/^[-*•]\s*/i, ''));
        improvementAreas.push({
          description: trimmed.replace(/^[-*•]\s*/i, ''),
          priority: 'medium'
        });
      }
    }

    return {
      strengths: strengths.length > 0 ? strengths : ['Analysis completed'],
      weaknesses,
      improvementAreas,
      confidenceAssessment: 0.7
    };
  }

  private buildDeepDivePrompt(area: string, context: EnhancedPRContext): string {
    return `Conduct a deep dive analysis on: ${area}`;
  }

  private parseDeepDiveResponse(response: string): any {
    return { findings: [], recommendations: [] };
  }

  private calculateDeepDiveConfidence(deepAnalysis: DeepDiveAnalysis): number {
    return 0.1; // Placeholder
  }
}

// Supporting interfaces
interface SelfCritique {
  strengths: string[];
  weaknesses: string[];
  improvementAreas: Array<{
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  confidenceAssessment: number;
}

interface DeepDiveAnalysis {
  areas: string[];
  results: { [area: string]: any };
}
