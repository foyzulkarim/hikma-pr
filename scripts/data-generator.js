const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Helper functions
function extractPRTitle(prUrl) {
  // Try to extract PR title from URL or return a default
  const match = prUrl.match(/\/pull\/(\d+)/);
  if (match) {
    return `PR #${match[1]}`;
  }
  return 'Pull Request Analysis';
}

function extractRepoName(prUrl) {
  try {
    const url = new URL(prUrl);
    const pathParts = url.pathname.split('/');
    if (pathParts.length >= 3) {
      return `${pathParts[1]}/${pathParts[2]}`;
    }
  } catch (e) {
    // Invalid URL
  }
  return 'unknown/repo';
}

function calculateQualityScore(review) {
  // Calculate based on findings severity
  const findings = review.analysisPasses || [];
  let score = 100;
  
  findings.forEach(pass => {
    const issues = JSON.parse(pass.issuesFound || '[]');
    issues.forEach(issue => {
      switch (issue.severity?.toLowerCase()) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });
  });
  
  return Math.max(0, Math.min(100, score));
}

function transformFindings(review) {
  const findings = [];
  
  // Transform plugin findings
  (review.pluginFindings || []).forEach(pf => {
    findings.push({
      id: pf.id,
      severity: pf.severity.toLowerCase(),
      type: pf.pluginName,
      title: pf.message,
      description: pf.message,
      file: 'Unknown', // Plugin findings don't have file info in current schema
      line: pf.line || 0,
      plugin: pf.pluginName,
      recommendation: 'See analysis details'
    });
  });
  
  // Transform analysis pass issues
  (review.analysisPasses || []).forEach(pass => {
    const issues = JSON.parse(pass.issuesFound || '[]');
    issues.forEach((issue, index) => {
      findings.push({
        id: `${pass.id}_${index}`,
        severity: issue.severity?.toLowerCase() || 'medium',
        type: pass.passType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        title: issue.title || issue.description || 'Analysis Finding',
        description: issue.description || issue.title || 'See analysis details',
        file: issue.file || 'Multiple files',
        line: issue.line || 0,
        plugin: `${pass.passType} Analysis`,
        recommendation: issue.recommendation || 'See recommendations in analysis'
      });
    });
  });
  
  return findings;
}

function calculateQualityMetrics(review) {
  const findings = transformFindings(review);
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  
  // Simple scoring algorithm
  const security = Math.max(20, 100 - (criticalCount * 30 + highCount * 15));
  const performance = Math.max(20, 100 - (criticalCount * 25 + highCount * 12));
  const maintainability = Math.max(20, 100 - (mediumCount * 8 + highCount * 10));
  const standards = Math.max(20, 100 - (findings.length * 3));
  
  return { security, performance, maintainability, standards };
}

function formatTime(timestamp) {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp).toLocaleString();
}

function calculateDuration(start, end) {
  if (!start || !end) return 'Unknown';
  const diff = new Date(end) - new Date(start);
  return `${Math.round(diff / 1000)}s`;
}

function transformPrismaToUI(prismaReviews) {
  return prismaReviews.map(review => {
    const findings = transformFindings(review);
    
    return {
      id: review.id,
      title: extractPRTitle(review.prUrl),
      repository: extractRepoName(review.prUrl),
      author: 'Unknown', // Not in current schema
      date: review.createdAt.split('T')[0],
      url: review.prUrl,
      status: review.completedAt ? 'completed' : (review.error ? 'failed' : 'in-progress'),
      qualityScore: calculateQualityScore(review),
      filesAnalyzed: review.fileAnalyses?.length || 0,
      linesOfCode: review.chunkAnalyses?.reduce((sum, chunk) => sum + chunk.sizeTokens, 0) || 0,
      linesAdded: 0, // Not tracked in current schema
      linesRemoved: 0, // Not tracked in current schema
      findings: findings,
      semantic: {
        summary: review.fileAnalyses?.[0]?.analysis || 'Analysis in progress',
        impact: findings.length > 5 ? 'High impact - multiple issues found' : 'Low to medium impact',
        suggestions: review.analysisPasses?.map(pass => {
          const recs = JSON.parse(pass.recommendations || '[]');
          return recs[0] || 'See detailed analysis';
        }).filter(Boolean).slice(0, 3) || []
      },
      quality: calculateQualityMetrics(review),
      analysisPerformance: {
        llmProvider: review.modelProvider || 'Unknown',
        modelUsed: review.modelName || 'Unknown',
        startTime: formatTime(review.startedAt),
        endTime: formatTime(review.completedAt),
        totalDuration: calculateDuration(review.startedAt, review.completedAt),
        averagePerFile: review.fileAnalyses?.length ? 
          `${Math.round(parseInt(calculateDuration(review.startedAt, review.completedAt)) / review.fileAnalyses.length)}s` : 
          'Unknown'
      }
    };
  });
}

async function generateReviewsData(dbPath = './hikma.db') {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Failed to connect to database:', err.message);
        reject(err);
        return;
      }
    });

    // Query to get all reviews with related data
    const query = `
      SELECT 
        r.*,
        json_group_array(
          DISTINCT json_object(
            'id', fa.id,
            'fileName', fa.fileName,
            'analysis', fa.analysis,
            'diffSize', fa.diffSize
          )
        ) FILTER (WHERE fa.id IS NOT NULL) as fileAnalyses,
        json_group_array(
          DISTINCT json_object(
            'id', ca.id,
            'chunkId', ca.chunkId,
            'filePath', ca.filePath,
            'sizeTokens', ca.sizeTokens,
            'diffContent', ca.diffContent
          )
        ) FILTER (WHERE ca.id IS NOT NULL) as chunkAnalyses,
        json_group_array(
          DISTINCT json_object(
            'id', ap.id,
            'passType', ap.passType,
            'analysisResult', ap.analysisResult,
            'riskLevel', ap.riskLevel,
            'issuesFound', ap.issuesFound,
            'recommendations', ap.recommendations
          )
        ) FILTER (WHERE ap.id IS NOT NULL) as analysisPasses,
        json_group_array(
          DISTINCT json_object(
            'id', pf.id,
            'pluginName', pf.pluginName,
            'message', pf.message,
            'severity', pf.severity,
            'line', pf.line
          )
        ) FILTER (WHERE pf.id IS NOT NULL) as pluginFindings
      FROM Review r
      LEFT JOIN FileAnalysis fa ON r.id = fa.reviewId
      LEFT JOIN ChunkAnalysis ca ON r.id = ca.reviewId  
      LEFT JOIN AnalysisPass ap ON r.id = ap.reviewId
      LEFT JOIN PluginFinding pf ON r.id = pf.reviewId
      GROUP BY r.id
      ORDER BY r.createdAt DESC
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('❌ Database query failed:', err.message);
        reject(err);
        return;
      }

      try {
        // Parse JSON fields and transform data
        const reviews = rows.map(row => ({
          ...row,
          state: JSON.parse(row.state || '{}'),
          fileAnalyses: JSON.parse(row.fileAnalyses || '[]').filter(fa => fa.id),
          chunkAnalyses: JSON.parse(row.chunkAnalyses || '[]').filter(ca => ca.id),
          analysisPasses: JSON.parse(row.analysisPasses || '[]').filter(ap => ap.id),
          pluginFindings: JSON.parse(row.pluginFindings || '[]').filter(pf => pf.id)
        }));

        const transformedReviews = transformPrismaToUI(reviews);
        
        // Calculate summary stats
        const summaryStats = {
          totalReviews: reviews.length,
          criticalFindings: transformedReviews.reduce((sum, r) => 
            sum + r.findings.filter(f => f.severity === 'critical').length, 0),
          avgQualityScore: reviews.length > 0 ? 
            Math.round(transformedReviews.reduce((sum, r) => sum + r.qualityScore, 0) / reviews.length) : 0,
          activeRepos: new Set(transformedReviews.map(r => r.repository)).size
        };

        console.log(`📊 Generated data for ${reviews.length} reviews`);
        resolve({ reviews: transformedReviews, summaryStats });
        
      } catch (parseErr) {
        console.error('❌ Data transformation failed:', parseErr.message);
        reject(parseErr);
      }
    });

    db.close();
  });
}

module.exports = { generateReviewsData, transformPrismaToUI };
