// Analysis Types for Multi-Pass PR Review Architecture

import { PluginFinding } from './plugins';

export interface PrContext {
  repo_name: string;
  source_branch: string;
  target_branch: string;
  file_count: number;
  additions: number;
  deletions: number;
  diff_summary: string;
}

export interface ChunkInfo {
  id: string;
  file_path: string;
  start_line?: number;
  end_line?: number;
  size_tokens: number;
  context_before?: string;
  context_after?: string;
  diff_content: string;
  is_complete_file: boolean;
}

export interface AnalysisPass {
  id: string;
  chunk_id: string;
  pass_type: 'syntax_logic' | 'security_performance' | 'architecture_design' | 'testing_docs';
  analysis_result: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issues_found: string[];
  recommendations: string[];
  tokens_used: number;
  duration_ms: number;
  timestamp: Date;
}

export interface FileAnalysisResult {
  file_path: string;
  total_chunks: number;
  chunk_analyses: {
    [chunk_id: string]: {
      syntax_logic?: AnalysisPass;
      security_performance?: AnalysisPass;
      architecture_design?: AnalysisPass;
      testing_docs?: AnalysisPass;
    };
  };
  file_synthesis: string;
  overall_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_issues: number;
  recommendations: string[];
}

export interface ReviewState {
  // Core identification
  pr_url: string;
  task_id: string;
  
  // Context establishment
  pr_details?: {
    title: string;
    body: string | null;
    author: string;
    state: string;
    additions: number;
    deletions: number;
  };
  pr_context?: PrContext;
  
  // File processing
  all_changed_files?: string[];        // All files changed in PR
  filtered_files?: string[];           // Files that will be analyzed
  files_to_process?: string[];         // Queue of files remaining
  current_file?: string;               // File currently being processed
  full_pr_diff?: string;               // Complete PR diff (fetched once)
  
  // Chunk processing
  file_chunks?: {
    [file_path: string]: ChunkInfo[];
  };
  current_chunks?: ChunkInfo[];        // Chunks for current file
  chunks_to_process?: ChunkInfo[];     // Queue of chunks remaining
  current_chunk?: ChunkInfo;           // Chunk currently being analyzed
  current_pass?: 'syntax_logic' | 'security_performance' | 'architecture_design' | 'testing_docs';
  
  // Analysis results
  chunk_analyses?: {
    [chunk_id: string]: {
      syntax_logic?: AnalysisPass;
      security_performance?: AnalysisPass;
      architecture_design?: AnalysisPass;
      testing_docs?: AnalysisPass;
      plugin_findings?: PluginFinding[]; // Add this line
    };
  };
  file_results?: {
    [file_path: string]: FileAnalysisResult;
  };
  
  // Final synthesis
  synthesis_data?: {
    critical_issues: string[];
    important_recommendations: string[];
    minor_suggestions: string[];
    overall_assessment: string;
    decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
    reasoning: string;
  };
  final_report?: string;
  
  // Progress tracking
  progress?: {
    total_files: number;
    completed_files: number;
    total_chunks: number;
    completed_chunks: number;
    total_passes: number;
    completed_passes: number;
  };
}

export interface ProjectConfig {
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | 'auto';
  file_extensions: string[];
  exclude_patterns: string[];
  max_chunk_tokens: number;
  context_lines: number;
}

export interface PromptTemplate {
  name: string;
  template: string;
  variables: string[];
}

export type Provider = 'ollama' | 'openai' | 'lmstudio';
  
export interface ModelConfig {
  name: string;
  provider: Provider;
  base_url?: string;
  api_key?: string;
  max_tokens: number;
  temperature: number;
}

export interface AnalysisConfig {
  // models: {
  //   syntax_logic: ModelConfig;
  //   security_performance: ModelConfig;
  //   architecture_design: ModelConfig;
  //   testing_docs: ModelConfig;
  //   synthesis: ModelConfig;
  // };
  project: ProjectConfig;
  chunking: {
    max_tokens: number;
    overlap_lines: number;
    min_chunk_size: number;
  };
  modelInfo: {
    provider: string;
    providerUrl: string;
    modelName: string;
  }
} 

// Enhanced types for comprehensive analysis system

export interface CompleteRepositoryContext {
  repoPath: string;
  repoUrl: string;
  prNumber: number;
  changedFiles: string[];
  codebaseMap: CodebaseMap;
  architecturalPatterns: ArchitecturalPattern[];
  historicalPatterns: HistoricalPattern[];
  dependencyGraph: DependencyGraph;
  qualityMetrics: QualityMetrics;
  repositoryMetadata?: RepositoryMetadata;
  completeFiles?: Map<string, string>;
  historicalContext?: HistoricalContext;
  changeClassification?: ChangeClassification;
}

export interface BlastRadius {
  directImpact: string[];
  indirectImpact: string[];
  testImpact: string[];
  documentationImpact: string[];
  migrationImpact: string[];
  configurationImpact: string[];
}

export interface ContextualCodeMap extends Map<string, ContextualCode> {}

export interface ContextualCode {
  completeFileContent: string;
  relatedFunctions: RelatedFunction[];
  dependencyChain: DependencyChain;
  usageExamples: UsageExample[];
  testCoverage: TestCoverage;
  historicalContext: HistoricalContext;
}

export interface SemanticAnalysis {
  functionSignatures: FunctionSignature[];
  typeDefinitions: TypeDefinition[];
  importExportChains: ImportExportChain[];
  callGraphs: CallGraph[];
  dataFlows: DataFlow[];
}

export interface SemanticChunk {
  id: string;
  content: string;
  semanticBoundaries: SemanticBoundary[];
  relatedTypes: string[];
  crossReferences: CrossReference[];
}

export interface EnhancedPRContext {
  repositoryMetadata: RepositoryMetadata;
  architecturalPatterns: ArchitecturalPattern[];
  completeFiles: Map<string, string>;
  historicalContext: HistoricalContext;
  blastRadius: BlastRadius;
  changeClassification: ChangeClassification;
  semanticAnalysis: SemanticAnalysis;
}

// Multi-Agent Analysis Types
export interface SpecializedAnalysis {
  type: string;
  findings: Finding[];
  recommendations: Recommendation[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
}

export interface ArchitecturalAnalysis extends SpecializedAnalysis {
  designPatternConsistency: PatternConsistency;
  architecturalDebt: ArchitecturalDebt;
  scalabilityImpact: ScalabilityImpact;
  boundaryViolations: BoundaryViolation[];
  couplingAnalysis: CouplingAnalysis;
  cohesionAnalysis: CohesionAnalysis;
}

export interface SecurityAnalysis extends SpecializedAnalysis {
  vulnerabilityAssessment: VulnerabilityAssessment;
  authenticationImpact: AuthenticationImpact;
  authorizationImpact: AuthorizationImpact;
  dataExposureRisk: DataExposureRisk;
  inputValidation: InputValidation;
  dependencySecurity: DependencySecurity;
}

export interface PerformanceAnalysis extends SpecializedAnalysis {
  algorithmicComplexity: AlgorithmicComplexity;
  databaseImpact: DatabaseImpact;
  memoryUsage: MemoryUsage;
  networkOptimization: NetworkOptimization;
  cachingStrategy: CachingStrategy;
  regressionRisk: RegressionRisk;
}

export interface TestingAnalysis extends SpecializedAnalysis {
  testCoverage: TestCoverageAnalysis;
  testQuality: TestQuality;
  missingTests: MissingTest[];
  edgeCases: EdgeCase[];
  integrationTesting: IntegrationTesting;
  testMaintainability: TestMaintainability;
}

export interface MultiModelAnalysisResult {
  individualResults: SpecializedAnalysis[];
  crossValidation: CrossValidationResult;
  consensus: ConsensusResult;
  confidenceScores: Map<string, number>;
}

export interface RefinedAnalysisResult extends MultiModelAnalysisResult {
  iterations: number;
  convergenceScore: number;
  deepDiveAreas: string[];
  finalRecommendations: Recommendation[];
}

export interface QualityValidation {
  completeness: CompletenessScore;
  consistency: ConsistencyScore;
  actionability: ActionabilityScore;
  evidenceBased: EvidenceScore;
  confidenceScores: Map<string, number>;
}

export interface ComprehensiveReview {
  executiveSummary: ExecutiveSummary;
  detailedAnalysis: DetailedAnalysis;
  recommendations: PrioritizedRecommendations;
  qualityAssurance: QualityAssurance;
  metadata: ReviewMetadata;
}

// Supporting interfaces
export interface CodebaseMap {
  structure: DirectoryStructure;
  fileTypes: Map<string, number>;
  totalLines: number;
  languages: string[];
}

export interface ArchitecturalPattern {
  name: string;
  description: string;
  files: string[];
  confidence: number;
}

export interface HistoricalPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  commonIssues: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  cycles: DependencyCycle[];
}

export interface QualityMetrics {
  codeComplexity: number;
  testCoverage: number;
  duplication: number;
  maintainabilityIndex: number;
}

export interface RelatedFunction {
  name: string;
  file: string;
  signature: string;
  relationship: 'calls' | 'called-by' | 'overrides' | 'implements';
}

export interface DependencyChain {
  imports: string[];
  exports: string[];
  transitiveDependencies: string[];
}

export interface UsageExample {
  file: string;
  context: string;
  lineNumber: number;
}

export interface TestCoverage {
  covered: boolean;
  testFiles: string[];
  coveragePercentage: number;
}

export interface HistoricalContext {
  recentChanges: GitCommit[];
  changeFrequency: number;
  bugHistory: BugReport[];
}

export interface FunctionSignature {
  name: string;
  parameters: Parameter[];
  returnType: string;
  file: string;
  lineNumber: number;
}

export interface TypeDefinition {
  name: string;
  type: 'interface' | 'class' | 'enum' | 'type';
  properties: Property[];
  file: string;
}

export interface ImportExportChain {
  file: string;
  imports: ImportStatement[];
  exports: ExportStatement[];
}

export interface CallGraph {
  caller: string;
  callee: string;
  file: string;
  lineNumber: number;
}

export interface DataFlow {
  source: string;
  target: string;
  type: 'assignment' | 'parameter' | 'return';
  file: string;
}

export interface SemanticBoundary {
  type: 'function' | 'class' | 'module';
  name: string;
  startLine: number;
  endLine: number;
}

export interface CrossReference {
  target: string;
  type: 'type' | 'function' | 'variable';
  file: string;
  lineNumber: number;
}

export interface RepositoryMetadata {
  name: string;
  language: string;
  framework: string;
  architecture: string;
  size: RepositorySize;
}

export interface ChangeClassification {
  type: 'feature' | 'bugfix' | 'refactor' | 'docs' | 'test' | 'config';
  scope: 'local' | 'module' | 'system';
  risk: 'low' | 'medium' | 'high';
}

// Additional supporting types
export interface DirectoryStructure {
  [key: string]: DirectoryStructure | null;
}

export interface DependencyNode {
  id: string;
  file: string;
  type: 'file' | 'function' | 'class';
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'imports' | 'calls' | 'extends';
}

export interface DependencyCycle {
  nodes: string[];
  severity: 'warning' | 'error';
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
}

export interface BugReport {
  id: string;
  description: string;
  files: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Parameter {
  name: string;
  type: string;
  optional: boolean;
}

export interface Property {
  name: string;
  type: string;
  optional: boolean;
}

export interface ImportStatement {
  module: string;
  imports: string[];
  isDefault: boolean;
}

export interface ExportStatement {
  name: string;
  type: 'default' | 'named';
}

export interface RepositorySize {
  files: number;
  lines: number;
  bytes: number;
}

export interface Finding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file: string;
  lineNumber?: number;
  evidence: string[];
  confidence: number;
  sourceModel?: string;
  supportingModels?: string[];
  consensusMethod?: string;
}

export interface Recommendation {
  id: string;
  priority: 'must-fix' | 'should-fix' | 'consider';
  category: string;
  description: string;
  rationale: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
}

// Specialized analysis detail types
export interface PatternConsistency {
  followedPatterns: string[];
  violatedPatterns: string[];
  missedOpportunities: string[];
}

export interface ArchitecturalDebt {
  technicalDebt: TechnicalDebt[];
  designSmells: DesignSmell[];
  refactoringOpportunities: RefactoringOpportunity[];
}

export interface ScalabilityImpact {
  bottlenecks: Bottleneck[];
  scalabilityRisks: ScalabilityRisk[];
  recommendations: string[];
}

export interface BoundaryViolation {
  type: string;
  description: string;
  files: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface CouplingAnalysis {
  afferentCoupling: number;
  efferentCoupling: number;
  instability: number;
  recommendations: string[];
}

export interface CohesionAnalysis {
  cohesionScore: number;
  cohesionType: string;
  recommendations: string[];
}

export interface VulnerabilityAssessment {
  vulnerabilities: Vulnerability[];
  riskScore: number;
  mitigations: string[];
}

export interface AuthenticationImpact {
  changes: AuthChange[];
  risks: string[];
  recommendations: string[];
}

export interface AuthorizationImpact {
  changes: AuthChange[];
  risks: string[];
  recommendations: string[];
}

export interface DataExposureRisk {
  exposurePoints: ExposurePoint[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigations: string[];
}

export interface InputValidation {
  validationGaps: ValidationGap[];
  recommendations: string[];
}

export interface DependencySecurity {
  vulnerableDependencies: VulnerableDependency[];
  recommendations: string[];
}

export interface AlgorithmicComplexity {
  timeComplexity: ComplexityAnalysis;
  spaceComplexity: ComplexityAnalysis;
  recommendations: string[];
}

export interface DatabaseImpact {
  queries: QueryAnalysis[];
  indexingNeeds: IndexingNeed[];
  recommendations: string[];
}

export interface MemoryUsage {
  memoryLeaks: MemoryLeak[];
  optimizations: MemoryOptimization[];
  recommendations: string[];
}

export interface NetworkOptimization {
  networkCalls: NetworkCall[];
  optimizations: NetworkOptimizationOpportunity[];
  recommendations: string[];
}

export interface CachingStrategy {
  cachingOpportunities: CachingOpportunity[];
  recommendations: string[];
}

export interface RegressionRisk {
  riskAreas: RiskArea[];
  testingNeeds: TestingNeed[];
  recommendations: string[];
}

export interface TestCoverageAnalysis {
  currentCoverage: number;
  targetCoverage: number;
  uncoveredAreas: UncoveredArea[];
  recommendations: string[];
}

export interface TestQuality {
  qualityScore: number;
  issues: TestIssue[];
  recommendations: string[];
}

export interface MissingTest {
  area: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface EdgeCase {
  scenario: string;
  risk: 'low' | 'medium' | 'high';
  testingApproach: string;
}

export interface IntegrationTesting {
  needs: IntegrationTestNeed[];
  recommendations: string[];
}

export interface TestMaintainability {
  maintainabilityScore: number;
  issues: TestMaintainabilityIssue[];
  recommendations: string[];
}

export interface CrossValidationResult {
  agreements: Agreement[];
  disagreements: Disagreement[];
  consensusScore: number;
}

export interface ConsensusResult {
  finalFindings: Finding[];
  finalRecommendations: Recommendation[];
  confidenceLevel: number;
}

export interface CompletenessScore {
  score: number;
  missingAreas: string[];
}

export interface ConsistencyScore {
  score: number;
  inconsistencies: string[];
}

export interface ActionabilityScore {
  score: number;
  vagueSuggestions: string[];
}

export interface EvidenceScore {
  score: number;
  unsupportedClaims: string[];
}

export interface ExecutiveSummary {
  changePurpose: string;
  overallImpact: 'low' | 'medium' | 'high';
  keyFindings: string[];
  criticalIssues: string[];
  recommendation: 'approve' | 'request-changes' | 'reject';
}

export interface DetailedAnalysis {
  architectural: ArchitecturalAnalysis;
  security: SecurityAnalysis;
  performance: PerformanceAnalysis;
  testing: TestingAnalysis;
}

export interface PrioritizedRecommendations {
  mustFix: Recommendation[];
  shouldFix: Recommendation[];
  consider: Recommendation[];
}

export interface QualityAssurance {
  validationResults: QualityValidation;
  confidenceLevel: number;
  reviewCompleteness: number;
}

export interface ReviewMetadata {
  analysisTime: number;
  modelsUsed: string[];
  iterationsPerformed: number;
  contextDepth: number;
}

// Additional detailed types
export interface TechnicalDebt {
  type: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface DesignSmell {
  name: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
}

export interface RefactoringOpportunity {
  type: string;
  description: string;
  benefit: string;
  effort: 'low' | 'medium' | 'high';
}

export interface Bottleneck {
  location: string;
  type: string;
  impact: string;
  solution: string;
}

export interface ScalabilityRisk {
  area: string;
  risk: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Vulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  mitigation: string;
}

export interface AuthChange {
  type: string;
  description: string;
  impact: string;
}

export interface ExposurePoint {
  location: string;
  dataType: string;
  risk: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface ValidationGap {
  input: string;
  location: string;
  risk: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface VulnerableDependency {
  name: string;
  version: string;
  vulnerability: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix: string;
}

export interface ComplexityAnalysis {
  current: string;
  optimal: string;
  impact: string;
}

export interface QueryAnalysis {
  query: string;
  performance: 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export interface IndexingNeed {
  table: string;
  columns: string[];
  reason: string;
}

export interface MemoryLeak {
  location: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  fix: string;
}

export interface MemoryOptimization {
  location: string;
  opportunity: string;
  benefit: string;
}

export interface NetworkCall {
  location: string;
  type: string;
  optimization: string;
}

export interface NetworkOptimizationOpportunity {
  type: string;
  description: string;
  benefit: string;
}

export interface CachingOpportunity {
  location: string;
  type: string;
  benefit: string;
  implementation: string;
}

export interface RiskArea {
  area: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
}

export interface TestingNeed {
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UncoveredArea {
  file: string;
  functions: string[];
  risk: 'low' | 'medium' | 'high';
}

export interface TestIssue {
  type: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
}

export interface IntegrationTestNeed {
  components: string[];
  scenario: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TestMaintainabilityIssue {
  type: string;
  description: string;
  location: string;
  impact: string;
}

export interface Agreement {
  topic: string;
  models: string[];
  confidence: number;
}

export interface Disagreement {
  topic: string;
  positions: Map<string, string>;
  resolution: string;
}
// Prompt and Context Types
export type AnalysisType = 'architectural' | 'security' | 'performance' | 'testing' | 'code-quality';

export interface ContextualPrompt {
  content: string;
  metadata: {
    analysisType: AnalysisType;
    contextSize: number;
    templateVersion: string;
    generatedAt: string;
    repositoryLanguage: string;
    changeComplexity: string;
  };
}
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface Feedback {
  overallScore: number;
  improvementAreas: ImprovementArea[];
  strengths: string[];
  weaknesses: string[];
}

export interface ImprovementArea {
  type: 'missing-evidence' | 'vague-recommendation' | 'low-confidence' | 'incomplete-analysis';
  targetId: string;
  description: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}
