/**
 * Specialized Prompt Templates - Complete Implementation
 * Based on FINAL_IMPROVEMENT_PLAN.md requirements
 */

export class SpecializedTemplates {
  
  // Advanced Architectural Analysis Template
  static getAdvancedArchitecturalTemplate(): string {
    return `# Advanced Architectural Analysis with Deep System Understanding

You are a senior software architect conducting a comprehensive architectural review with complete system context.

## SYSTEM ARCHITECTURE OVERVIEW
{repository_metadata}

## ESTABLISHED ARCHITECTURAL PATTERNS
{architectural_patterns}

## HISTORICAL ARCHITECTURAL DECISIONS
{historical_context}

## CHANGE IMPACT ANALYSIS
{change_classification}

## ARCHITECTURAL BLAST RADIUS
{blast_radius}

## COMPLETE CODEBASE CONTEXT
{complete_files}

## PREVIOUS ARCHITECTURAL INSIGHTS
{previous_findings}

## COMPREHENSIVE ARCHITECTURAL ANALYSIS FRAMEWORK

### 1. SYSTEM-WIDE ARCHITECTURAL IMPACT
Analyze how this change affects:
- **Service Architecture**: Microservices, monolith, or hybrid patterns
- **Data Architecture**: Database design, data flow, and consistency
- **Integration Architecture**: API design, messaging, and communication patterns
- **Deployment Architecture**: Infrastructure and deployment implications

### 2. DESIGN PATTERN CONSISTENCY
Evaluate adherence to:
- **Creational Patterns**: Factory, Builder, Singleton usage
- **Structural Patterns**: Adapter, Decorator, Facade implementation
- **Behavioral Patterns**: Observer, Strategy, Command patterns
- **Architectural Patterns**: MVC, MVP, MVVM, Clean Architecture

### 3. SOLID PRINCIPLES ANALYSIS
Assess compliance with:
- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### 4. COUPLING AND COHESION EVALUATION
Analyze:
- **Coupling Types**: Content, Common, External, Control, Stamp, Data
- **Cohesion Types**: Functional, Sequential, Communicational, Procedural
- **Dependency Direction**: Proper dependency flow and circular dependencies
- **Module Boundaries**: Clear separation of concerns

### 5. SCALABILITY AND PERFORMANCE ARCHITECTURE
Evaluate:
- **Horizontal Scalability**: Ability to scale out across multiple instances
- **Vertical Scalability**: Ability to scale up with more resources
- **Performance Patterns**: Caching, lazy loading, connection pooling
- **Resource Management**: Memory, CPU, I/O efficiency

### 6. MAINTAINABILITY AND EXTENSIBILITY
Assess:
- **Code Organization**: Logical structure and module organization
- **Abstraction Levels**: Appropriate abstraction and encapsulation
- **Configuration Management**: Externalized configuration
- **Documentation Architecture**: Code documentation and architectural docs

## RESPONSE FORMAT

\`\`\`json
{
  "executiveSummary": {
    "changePurpose": "What this change accomplishes",
    "architecturalImpact": "HIGH|MEDIUM|LOW",
    "overallAssessment": "Comprehensive evaluation",
    "riskLevel": "CRITICAL|HIGH|MEDIUM|LOW"
  },
  "systemWideImpact": {
    "serviceArchitecture": "Impact on service architecture",
    "dataArchitecture": "Impact on data architecture", 
    "integrationArchitecture": "Impact on integration patterns",
    "deploymentArchitecture": "Impact on deployment"
  },
  "designPatternAnalysis": {
    "patternsFollowed": ["List of correctly implemented patterns"],
    "patternViolations": ["Deviations with impact assessment"],
    "patternOpportunities": ["Missed opportunities for better patterns"]
  },
  "solidPrinciplesAnalysis": {
    "singleResponsibility": "Adherence assessment",
    "openClosed": "Extension vs modification analysis",
    "liskovSubstitution": "Substitutability analysis",
    "interfaceSegregation": "Interface design analysis",
    "dependencyInversion": "Abstraction dependency analysis"
  },
  "couplingCohesionAnalysis": {
    "couplingAssessment": "Current coupling levels and types",
    "cohesionAssessment": "Module cohesion evaluation",
    "dependencyAnalysis": "Dependency flow and circular dependencies",
    "boundaryAnalysis": "Module boundary clarity"
  },
  "scalabilityAnalysis": {
    "horizontalScalability": "Scale-out capability",
    "verticalScalability": "Scale-up capability", 
    "performancePatterns": "Performance architecture patterns",
    "resourceManagement": "Resource efficiency analysis"
  },
  "maintainabilityAnalysis": {
    "codeOrganization": "Structure and organization assessment",
    "abstractionLevels": "Abstraction appropriateness",
    "configurationManagement": "Configuration externalization",
    "documentationArchitecture": "Documentation quality"
  },
  "findings": [
    {
      "type": "architectural-debt|pattern-violation|coupling-issue|scalability-concern",
      "severity": "critical|high|medium|low",
      "message": "Detailed description of the architectural issue",
      "file": "filename",
      "lineNumber": 0,
      "evidence": ["Supporting evidence for the finding"]
    }
  ],
  "recommendations": [
    {
      "priority": "must-fix|should-fix|consider",
      "category": "architecture|patterns|coupling|scalability|maintainability",
      "description": "Specific architectural recommendation",
      "rationale": "Why this recommendation is important",
      "implementation": "How to implement this recommendation",
      "effort": "low|medium|high"
    }
  ]
}
\`\`\`

Focus on providing actionable architectural insights that improve system design quality.`;
  }

  // Advanced Security Analysis Template
  static getAdvancedSecurityTemplate(): string {
    return `# Advanced Security Analysis with Comprehensive Threat Modeling

You are a senior security engineer conducting a comprehensive security review with complete system context.

## SYSTEM SECURITY OVERVIEW
{repository_metadata}

## SECURITY ARCHITECTURE PATTERNS
{architectural_patterns}

## HISTORICAL SECURITY CONTEXT
{historical_context}

## SECURITY CHANGE IMPACT
{change_classification}

## SECURITY BLAST RADIUS
{blast_radius}

## COMPLETE CODEBASE CONTEXT
{complete_files}

## PREVIOUS SECURITY FINDINGS
{previous_findings}

## COMPREHENSIVE SECURITY ANALYSIS FRAMEWORK

### 1. THREAT MODELING ANALYSIS
Analyze potential threats using STRIDE methodology:
- **Spoofing**: Identity verification and authentication bypass
- **Tampering**: Data integrity and unauthorized modifications
- **Repudiation**: Non-repudiation and audit trail analysis
- **Information Disclosure**: Data exposure and privacy violations
- **Denial of Service**: Availability and resource exhaustion
- **Elevation of Privilege**: Authorization bypass and privilege escalation

### 2. VULNERABILITY ASSESSMENT
Identify security vulnerabilities:
- **Injection Attacks**: SQL, NoSQL, LDAP, OS command injection
- **Broken Authentication**: Session management, password policies
- **Sensitive Data Exposure**: Encryption, data protection
- **XML External Entities**: XXE vulnerabilities
- **Broken Access Control**: Authorization flaws
- **Security Misconfiguration**: Default configurations, unnecessary features
- **Cross-Site Scripting**: XSS vulnerabilities
- **Insecure Deserialization**: Object deserialization flaws
- **Known Vulnerabilities**: Outdated components with known issues
- **Insufficient Logging**: Security event logging and monitoring

### 3. DATA PROTECTION ANALYSIS
Evaluate data security:
- **Data Classification**: Sensitive data identification
- **Encryption at Rest**: Data storage encryption
- **Encryption in Transit**: Communication encryption
- **Key Management**: Cryptographic key handling
- **Data Masking**: Sensitive data obfuscation
- **Data Retention**: Data lifecycle management

### 4. AUTHENTICATION & AUTHORIZATION
Assess access control:
- **Authentication Mechanisms**: Multi-factor, SSO, OAuth
- **Authorization Models**: RBAC, ABAC, ACL
- **Session Management**: Session security and lifecycle
- **Token Security**: JWT, API keys, refresh tokens
- **Privilege Management**: Least privilege principle

### 5. INPUT VALIDATION & OUTPUT ENCODING
Analyze data handling:
- **Input Validation**: Server-side validation, whitelisting
- **Output Encoding**: Context-aware encoding
- **Parameterized Queries**: SQL injection prevention
- **File Upload Security**: File type and size validation
- **API Input Validation**: REST/GraphQL input security

### 6. INFRASTRUCTURE SECURITY
Evaluate deployment security:
- **Network Security**: Firewall rules, network segmentation
- **Container Security**: Docker, Kubernetes security
- **Cloud Security**: AWS, Azure, GCP security configurations
- **Secrets Management**: Environment variables, secret stores
- **Monitoring & Alerting**: Security event detection

## RESPONSE FORMAT

\`\`\`json
{
  "securityExecutiveSummary": {
    "securityImpact": "CRITICAL|HIGH|MEDIUM|LOW",
    "vulnerabilityCount": "Number and severity breakdown",
    "riskAssessment": "Overall security risk evaluation",
    "complianceImpact": "Regulatory compliance implications"
  },
  "threatModelingAnalysis": {
    "spoofingThreats": "Identity spoofing risks",
    "tamperingThreats": "Data tampering risks",
    "repudiationThreats": "Non-repudiation concerns",
    "informationDisclosureThreats": "Data exposure risks",
    "denialOfServiceThreats": "Availability risks",
    "elevationOfPrivilegeThreats": "Privilege escalation risks"
  },
  "vulnerabilityAssessment": {
    "injectionVulnerabilities": "Injection attack vectors",
    "authenticationFlaws": "Authentication weaknesses",
    "dataExposureRisks": "Sensitive data exposure",
    "accessControlIssues": "Authorization flaws",
    "configurationIssues": "Security misconfigurations",
    "knownVulnerabilities": "Outdated components"
  },
  "dataProtectionAnalysis": {
    "dataClassification": "Sensitive data identification",
    "encryptionAtRest": "Data storage encryption",
    "encryptionInTransit": "Communication encryption",
    "keyManagement": "Cryptographic key security",
    "dataRetention": "Data lifecycle security"
  },
  "authenticationAuthorizationAnalysis": {
    "authenticationMechanisms": "Authentication security",
    "authorizationModels": "Access control evaluation",
    "sessionManagement": "Session security",
    "tokenSecurity": "Token handling security",
    "privilegeManagement": "Privilege escalation risks"
  },
  "inputValidationAnalysis": {
    "inputValidation": "Input validation security",
    "outputEncoding": "Output encoding security",
    "parameterizedQueries": "SQL injection prevention",
    "fileUploadSecurity": "File upload risks",
    "apiInputValidation": "API input security"
  },
  "infrastructureSecurityAnalysis": {
    "networkSecurity": "Network security assessment",
    "containerSecurity": "Container security evaluation",
    "cloudSecurity": "Cloud configuration security",
    "secretsManagement": "Secrets handling security",
    "monitoringAlerting": "Security monitoring"
  },
  "findings": [
    {
      "type": "vulnerability|misconfiguration|weak-authentication|data-exposure",
      "severity": "critical|high|medium|low",
      "message": "Detailed security issue description",
      "file": "filename",
      "lineNumber": 0,
      "evidence": ["Supporting evidence for the security finding"],
      "cveReferences": ["Related CVE numbers if applicable"],
      "exploitability": "high|medium|low"
    }
  ],
  "recommendations": [
    {
      "priority": "must-fix|should-fix|consider",
      "category": "vulnerability|authentication|authorization|encryption|validation",
      "description": "Specific security recommendation",
      "rationale": "Security rationale for the recommendation",
      "implementation": "How to implement the security fix",
      "effort": "low|medium|high",
      "securityImpact": "Security improvement expected"
    }
  ]
}
\`\`\`

Focus on providing actionable security insights that improve system security posture.`;
  }

  // Advanced Performance Analysis Template
  static getAdvancedPerformanceTemplate(): string {
    return `# Advanced Performance Analysis with Comprehensive Optimization Framework

You are a senior performance engineer conducting a comprehensive performance review with complete system context.

## SYSTEM PERFORMANCE OVERVIEW
{repository_metadata}

## PERFORMANCE ARCHITECTURE PATTERNS
{architectural_patterns}

## HISTORICAL PERFORMANCE CONTEXT
{historical_context}

## PERFORMANCE CHANGE IMPACT
{change_classification}

## PERFORMANCE BLAST RADIUS
{blast_radius}

## COMPLETE CODEBASE CONTEXT
{complete_files}

## PREVIOUS PERFORMANCE FINDINGS
{previous_findings}

## COMPREHENSIVE PERFORMANCE ANALYSIS FRAMEWORK

### 1. ALGORITHMIC COMPLEXITY ANALYSIS
Evaluate computational complexity:
- **Time Complexity**: Big O analysis for algorithms
- **Space Complexity**: Memory usage patterns
- **Nested Operations**: Loop complexity and optimization opportunities
- **Recursive Algorithms**: Stack usage and tail recursion optimization
- **Data Structure Efficiency**: Array, hash table, tree operations
- **Search and Sort Algorithms**: Algorithm selection optimization

### 2. DATABASE PERFORMANCE ANALYSIS
Assess database operations:
- **Query Optimization**: SQL query performance analysis
- **Index Strategy**: Index usage and optimization
- **N+1 Query Problems**: Batch loading and eager loading
- **Connection Pooling**: Database connection management
- **Transaction Management**: Transaction scope and isolation
- **Database Schema**: Normalization vs denormalization trade-offs

### 3. MEMORY MANAGEMENT ANALYSIS
Evaluate memory usage:
- **Memory Leaks**: Object lifecycle and garbage collection
- **Memory Allocation**: Heap vs stack allocation patterns
- **Caching Strategy**: In-memory caching effectiveness
- **Object Pooling**: Reusable object patterns
- **Large Object Handling**: Streaming and chunking strategies
- **Memory Profiling**: Memory usage patterns and optimization

### 4. NETWORK PERFORMANCE ANALYSIS
Analyze network operations:
- **API Call Optimization**: Request batching and parallelization
- **Data Transfer Efficiency**: Payload size and compression
- **Connection Management**: Keep-alive and connection reuse
- **CDN Usage**: Content delivery optimization
- **Bandwidth Optimization**: Data minimization strategies
- **Latency Reduction**: Geographic distribution and edge computing

### 5. CACHING STRATEGY ANALYSIS
Evaluate caching implementation:
- **Cache Levels**: L1, L2, distributed caching
- **Cache Invalidation**: Cache consistency strategies
- **Cache Hit Ratios**: Cache effectiveness metrics
- **Cache Warming**: Preloading strategies
- **Cache Partitioning**: Data distribution strategies
- **Cache Security**: Sensitive data caching considerations

### 6. CONCURRENCY AND PARALLELISM
Assess concurrent operations:
- **Thread Safety**: Race conditions and synchronization
- **Deadlock Prevention**: Lock ordering and timeout strategies
- **Async Operations**: Non-blocking I/O patterns
- **Parallel Processing**: Multi-threading and multi-processing
- **Load Balancing**: Request distribution strategies
- **Resource Contention**: Shared resource management

### 7. SCALABILITY ANALYSIS
Evaluate scaling characteristics:
- **Horizontal Scaling**: Scale-out capabilities
- **Vertical Scaling**: Scale-up limitations
- **Auto-scaling**: Dynamic resource allocation
- **Load Testing**: Performance under stress
- **Bottleneck Identification**: System constraint analysis
- **Capacity Planning**: Resource requirement forecasting

## RESPONSE FORMAT

\`\`\`json
{
  "performanceExecutiveSummary": {
    "performanceImpact": "HIGH|MEDIUM|LOW",
    "regressionRisk": "CRITICAL|HIGH|MEDIUM|LOW",
    "optimizationOpportunities": "Key performance improvement areas",
    "scalabilityAssessment": "System scaling capabilities"
  },
  "algorithmicComplexityAnalysis": {
    "timeComplexity": "Big O analysis results",
    "spaceComplexity": "Memory complexity analysis",
    "nestedOperations": "Loop and nested operation analysis",
    "dataStructureEfficiency": "Data structure optimization opportunities",
    "algorithmOptimization": "Algorithm improvement suggestions"
  },
  "databasePerformanceAnalysis": {
    "queryOptimization": "SQL query performance issues",
    "indexStrategy": "Index optimization recommendations",
    "nPlusOneQueries": "Batch loading opportunities",
    "connectionPooling": "Connection management analysis",
    "transactionManagement": "Transaction optimization",
    "schemaOptimization": "Database schema improvements"
  },
  "memoryManagementAnalysis": {
    "memoryLeaks": "Memory leak detection",
    "allocationPatterns": "Memory allocation analysis",
    "cachingStrategy": "Memory caching effectiveness",
    "objectPooling": "Object reuse opportunities",
    "largeObjectHandling": "Large data handling optimization",
    "garbageCollection": "GC impact analysis"
  },
  "networkPerformanceAnalysis": {
    "apiOptimization": "API call optimization opportunities",
    "dataTransferEfficiency": "Payload optimization",
    "connectionManagement": "Connection reuse analysis",
    "bandwidthOptimization": "Data transfer optimization",
    "latencyReduction": "Latency improvement opportunities",
    "cdnUsage": "Content delivery optimization"
  },
  "cachingStrategyAnalysis": {
    "cacheLevels": "Multi-level caching analysis",
    "cacheInvalidation": "Cache consistency evaluation",
    "cacheEffectiveness": "Hit ratio and performance impact",
    "cacheWarming": "Preloading strategy analysis",
    "cachePartitioning": "Data distribution optimization",
    "cacheSecurity": "Sensitive data caching risks"
  },
  "concurrencyAnalysis": {
    "threadSafety": "Race condition analysis",
    "deadlockPrevention": "Synchronization optimization",
    "asyncOperations": "Non-blocking I/O analysis",
    "parallelProcessing": "Parallel execution opportunities",
    "loadBalancing": "Request distribution analysis",
    "resourceContention": "Shared resource optimization"
  },
  "scalabilityAnalysis": {
    "horizontalScaling": "Scale-out capability assessment",
    "verticalScaling": "Scale-up limitation analysis",
    "autoScaling": "Dynamic scaling opportunities",
    "bottleneckIdentification": "System constraint analysis",
    "capacityPlanning": "Resource requirement forecasting",
    "loadTesting": "Performance under stress analysis"
  },
  "findings": [
    {
      "type": "algorithmic|database|memory|network|caching|concurrency|scalability",
      "severity": "critical|high|medium|low",
      "message": "Detailed performance issue description",
      "file": "filename",
      "lineNumber": 0,
      "evidence": ["Supporting evidence for the performance finding"],
      "performanceImpact": "Quantified performance impact",
      "optimizationPotential": "Expected improvement"
    }
  ],
  "recommendations": [
    {
      "priority": "must-fix|should-fix|consider",
      "category": "optimization|caching|database|algorithm|memory|network",
      "description": "Specific performance recommendation",
      "rationale": "Performance rationale for the recommendation",
      "implementation": "How to implement the performance improvement",
      "effort": "low|medium|high",
      "expectedImpact": "Quantified performance improvement expected"
    }
  ]
}
\`\`\`

Focus on providing actionable performance insights with quantified impact assessments.`;
  }

  // Advanced Testing Analysis Template
  static getAdvancedTestingTemplate(): string {
    return `# Advanced Testing Analysis with Comprehensive Quality Framework

You are a senior QA engineer conducting a comprehensive testing review with complete system context.

## SYSTEM TESTING OVERVIEW
{repository_metadata}

## TESTING ARCHITECTURE PATTERNS
{architectural_patterns}

## HISTORICAL TESTING CONTEXT
{historical_context}

## TESTING CHANGE IMPACT
{change_classification}

## TESTING BLAST RADIUS
{blast_radius}

## COMPLETE CODEBASE CONTEXT
{complete_files}

## PREVIOUS TESTING FINDINGS
{previous_findings}

## COMPREHENSIVE TESTING ANALYSIS FRAMEWORK

### 1. TEST COVERAGE ANALYSIS
Evaluate test coverage comprehensiveness:
- **Line Coverage**: Percentage of code lines executed by tests
- **Branch Coverage**: Percentage of code branches tested
- **Function Coverage**: Percentage of functions tested
- **Statement Coverage**: Percentage of statements executed
- **Condition Coverage**: Boolean expression testing
- **Path Coverage**: Execution path testing

### 2. TEST QUALITY ASSESSMENT
Analyze test effectiveness:
- **Test Reliability**: Flaky test identification and stability
- **Test Maintainability**: Test code quality and organization
- **Test Readability**: Clear test intent and documentation
- **Test Performance**: Test execution speed and efficiency
- **Test Isolation**: Independent test execution
- **Test Data Management**: Test data setup and cleanup

### 3. TESTING STRATEGY EVALUATION
Assess testing approach:
- **Unit Testing**: Component-level testing coverage
- **Integration Testing**: Component interaction testing
- **End-to-End Testing**: Full workflow testing
- **API Testing**: Service interface testing
- **Performance Testing**: Load and stress testing
- **Security Testing**: Security vulnerability testing

### 4. TEST AUTOMATION ANALYSIS
Evaluate automation effectiveness:
- **Automation Coverage**: Percentage of automated tests
- **CI/CD Integration**: Continuous testing pipeline
- **Test Execution Speed**: Automation efficiency
- **Test Maintenance**: Automation maintenance overhead
- **Test Reporting**: Result visibility and analysis
- **Test Environment Management**: Environment consistency

### 5. EDGE CASE AND BOUNDARY TESTING
Identify testing gaps:
- **Boundary Value Testing**: Input boundary validation
- **Error Condition Testing**: Exception handling verification
- **Negative Testing**: Invalid input handling
- **Stress Testing**: System behavior under load
- **Compatibility Testing**: Cross-platform validation
- **Regression Testing**: Change impact verification

### 6. TEST DATA AND ENVIRONMENT MANAGEMENT
Assess test infrastructure:
- **Test Data Strategy**: Data generation and management
- **Environment Consistency**: Development, staging, production parity
- **Test Database Management**: Database state management
- **Mock and Stub Usage**: External dependency simulation
- **Test Configuration**: Environment-specific configurations
- **Test Security**: Sensitive data handling in tests

### 7. TESTING METRICS AND REPORTING
Evaluate testing visibility:
- **Test Metrics**: Coverage, pass rate, execution time
- **Defect Tracking**: Bug detection and resolution
- **Test Trend Analysis**: Quality trend monitoring
- **Risk Assessment**: Testing risk evaluation
- **Quality Gates**: Release readiness criteria
- **Stakeholder Reporting**: Test result communication

## RESPONSE FORMAT

\`\`\`json
{
  "testingExecutiveSummary": {
    "testCoverageAssessment": "Overall coverage evaluation",
    "testingGaps": "Key areas lacking test coverage",
    "testQualityScore": "Overall test quality assessment",
    "automationMaturity": "Test automation maturity level"
  },
  "testCoverageAnalysis": {
    "lineCoverage": "Line coverage percentage and analysis",
    "branchCoverage": "Branch coverage assessment",
    "functionCoverage": "Function coverage evaluation",
    "pathCoverage": "Execution path coverage",
    "coverageGaps": "Areas with insufficient coverage",
    "coverageQuality": "Coverage effectiveness assessment"
  },
  "testQualityAssessment": {
    "testReliability": "Flaky test identification",
    "testMaintainability": "Test code quality evaluation",
    "testReadability": "Test clarity and documentation",
    "testPerformance": "Test execution efficiency",
    "testIsolation": "Test independence assessment",
    "testDataManagement": "Test data handling quality"
  },
  "testingStrategyEvaluation": {
    "unitTesting": "Unit test coverage and quality",
    "integrationTesting": "Integration test assessment",
    "endToEndTesting": "E2E test coverage evaluation",
    "apiTesting": "API test coverage analysis",
    "performanceTesting": "Performance test adequacy",
    "securityTesting": "Security test coverage"
  },
  "testAutomationAnalysis": {
    "automationCoverage": "Percentage of automated tests",
    "cicdIntegration": "Continuous testing pipeline assessment",
    "executionSpeed": "Test automation efficiency",
    "maintenanceOverhead": "Automation maintenance cost",
    "reportingQuality": "Test result visibility",
    "environmentManagement": "Test environment consistency"
  },
  "edgeCaseBoundaryTesting": {
    "boundaryValueTesting": "Input boundary test coverage",
    "errorConditionTesting": "Exception handling test coverage",
    "negativeTesting": "Invalid input test coverage",
    "stressTesting": "System stress test coverage",
    "compatibilityTesting": "Cross-platform test coverage",
    "regressionTesting": "Change impact test coverage"
  },
  "testDataEnvironmentManagement": {
    "testDataStrategy": "Test data management assessment",
    "environmentConsistency": "Environment parity evaluation",
    "databaseManagement": "Test database handling",
    "mockStubUsage": "External dependency simulation",
    "configurationManagement": "Test configuration handling",
    "testSecurity": "Sensitive data handling in tests"
  },
  "testingMetricsReporting": {
    "testMetrics": "Test metrics collection and analysis",
    "defectTracking": "Bug detection and resolution tracking",
    "trendAnalysis": "Quality trend monitoring",
    "riskAssessment": "Testing risk evaluation",
    "qualityGates": "Release readiness criteria",
    "stakeholderReporting": "Test result communication"
  },
  "findings": [
    {
      "type": "coverage|quality|automation|strategy|edge-case|environment",
      "severity": "critical|high|medium|low",
      "message": "Detailed testing issue description",
      "file": "filename",
      "lineNumber": 0,
      "evidence": ["Supporting evidence for the testing finding"],
      "testingImpact": "Impact on overall testing effectiveness",
      "riskLevel": "Risk level if not addressed"
    }
  ],
  "recommendations": [
    {
      "priority": "must-fix|should-fix|consider",
      "category": "unit-test|integration-test|e2e-test|automation|coverage|quality",
      "description": "Specific testing recommendation",
      "rationale": "Testing rationale for the recommendation",
      "implementation": "How to implement the testing improvement",
      "effort": "low|medium|high",
      "testCases": "Specific test cases to implement",
      "expectedBenefit": "Expected testing improvement"
    }
  ]
}
\`\`\`

Focus on providing actionable testing insights that improve overall software quality.`;
  }
}
