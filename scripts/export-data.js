#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateReviewsData } = require('./data-generator');

// Get the correct database path (same as your main app)
function getDatabasePath() {
  const homeDir = os.homedir();
  const hikmaDir = path.join(homeDir, '.hikmapr');
  return path.join(hikmaDir, 'reviews.db');
}

async function exportData() {
  const dbPath = process.argv[2] || getDatabasePath(); // Use correct default path
  const outputDir = process.argv[3] || './hikma-pr-ui/src/data';
  
  console.log('📊 Exporting data for validation...');
  console.log(`🗄️  Database: ${dbPath}`);
  console.log(`📁 Output directory: ${outputDir}`);
  
  try {
    // Generate the transformed data
    console.log('🔄 Generating data from SQLite...');
    const data = await generateReviewsData(dbPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Export complete dataset
    const completeDataPath = path.join(outputDir, 'exported-data.json');
    fs.writeFileSync(completeDataPath, JSON.stringify(data, null, 2));
    console.log(`✅ Complete dataset: ${completeDataPath}`);
    
    // Export just reviews array (for easier comparison with mockData)
    const reviewsOnlyPath = path.join(outputDir, 'exported-reviews.json');
    fs.writeFileSync(reviewsOnlyPath, JSON.stringify(data.reviews, null, 2));
    console.log(`✅ Reviews only: ${reviewsOnlyPath}`);
    
    // Export summary stats
    const summaryPath = path.join(outputDir, 'exported-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(data.summaryStats, null, 2));
    console.log(`✅ Summary stats: ${summaryPath}`);
    
    // Export first review for structure comparison
    if (data.reviews.length > 0) {
      const samplePath = path.join(outputDir, 'sample-review.json');
      fs.writeFileSync(samplePath, JSON.stringify(data.reviews[0], null, 2));
      console.log(`✅ Sample review: ${samplePath}`);
    }
    
    // Generate comparison report
    const reportPath = path.join(outputDir, 'data-comparison-report.md');
    const report = generateComparisonReport(data);
    fs.writeFileSync(reportPath, report);
    console.log(`📋 Comparison report: ${reportPath}`);
    
    console.log('');
    console.log('🎉 Data export complete!');
    console.log(`📊 Exported ${data.reviews.length} reviews`);
    console.log(`🔍 Critical findings: ${data.summaryStats.criticalFindings}`);
    console.log(`📈 Average quality score: ${data.summaryStats.avgQualityScore}`);
    console.log('');
    console.log('💡 Compare with your mock data:');
    console.log(`   Mock data: ${outputDir}/mockData.ts`);
    console.log(`   Real data: ${outputDir}/exported-reviews.json`);
    console.log(`   Sample:    ${outputDir}/sample-review.json`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

function generateComparisonReport(data) {
  const { reviews, summaryStats } = data;
  
  let report = `# Data Export Comparison Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n`;
  report += `- **Total Reviews**: ${reviews.length}\n`;
  report += `- **Critical Findings**: ${summaryStats.criticalFindings}\n`;
  report += `- **Average Quality Score**: ${summaryStats.avgQualityScore}\n`;
  report += `- **Active Repositories**: ${summaryStats.activeRepos}\n\n`;
  
  if (reviews.length > 0) {
    const sample = reviews[0];
    report += `## Sample Review Structure\n\n`;
    report += `\`\`\`json\n`;
    report += `{\n`;
    report += `  "id": "${sample.id}",\n`;
    report += `  "title": "${sample.title}",\n`;
    report += `  "repository": "${sample.repository}",\n`;
    report += `  "author": "${sample.author}",\n`;
    report += `  "date": "${sample.date}",\n`;
    report += `  "url": "${sample.url}",\n`;
    report += `  "status": "${sample.status}",\n`;
    report += `  "qualityScore": ${sample.qualityScore},\n`;
    report += `  "filesAnalyzed": ${sample.filesAnalyzed},\n`;
    report += `  "linesOfCode": ${sample.linesOfCode},\n`;
    report += `  "findings": [${sample.findings.length} items],\n`;
    report += `  "semantic": { summary, impact, suggestions },\n`;
    report += `  "quality": { security, performance, maintainability, standards },\n`;
    report += `  "analysisPerformance": { llmProvider, modelUsed, timing }\n`;
    report += `}\n`;
    report += `\`\`\`\n\n`;
    
    report += `## Field Comparison Checklist\n\n`;
    report += `Compare these fields with your mockData.ts:\n\n`;
    report += `### Basic Fields\n`;
    report += `- [ ] id: string\n`;
    report += `- [ ] title: string\n`;
    report += `- [ ] repository: string\n`;
    report += `- [ ] author: string\n`;
    report += `- [ ] date: string\n`;
    report += `- [ ] url: string\n`;
    report += `- [ ] status: 'completed' | 'in-progress' | 'failed'\n`;
    report += `- [ ] qualityScore: number\n\n`;
    
    report += `### Analysis Fields\n`;
    report += `- [ ] filesAnalyzed: number\n`;
    report += `- [ ] linesOfCode: number\n`;
    report += `- [ ] linesAdded: number\n`;
    report += `- [ ] linesRemoved: number\n\n`;
    
    report += `### Findings Array\n`;
    if (sample.findings.length > 0) {
      const finding = sample.findings[0];
      report += `- [ ] findings[].id: string\n`;
      report += `- [ ] findings[].severity: '${finding.severity}'\n`;
      report += `- [ ] findings[].type: '${finding.type}'\n`;
      report += `- [ ] findings[].title: string\n`;
      report += `- [ ] findings[].description: string\n`;
      report += `- [ ] findings[].file: string\n`;
      report += `- [ ] findings[].line: number\n`;
      report += `- [ ] findings[].plugin: string\n`;
      report += `- [ ] findings[].recommendation: string\n\n`;
    }
    
    report += `### Nested Objects\n`;
    report += `- [ ] semantic.summary: string\n`;
    report += `- [ ] semantic.impact: string\n`;
    report += `- [ ] semantic.suggestions: string[]\n`;
    report += `- [ ] quality.security: number\n`;
    report += `- [ ] quality.performance: number\n`;
    report += `- [ ] quality.maintainability: number\n`;
    report += `- [ ] quality.standards: number\n`;
    report += `- [ ] analysisPerformance.llmProvider: string\n`;
    report += `- [ ] analysisPerformance.modelUsed: string\n`;
    report += `- [ ] analysisPerformance.startTime: string\n`;
    report += `- [ ] analysisPerformance.endTime: string\n`;
    report += `- [ ] analysisPerformance.totalDuration: string\n`;
    report += `- [ ] analysisPerformance.averagePerFile: string\n\n`;
  }
  
  report += `## Next Steps\n\n`;
  report += `1. Compare the exported JSON structure with your mockData.ts\n`;
  report += `2. Check if all fields match between real and mock data\n`;
  report += `3. Update mock data if needed to match real data structure\n`;
  report += `4. Test the UI with both datasets to ensure compatibility\n`;
  
  return report;
}

// Run if called directly
if (require.main === module) {
  exportData();
}

module.exports = { exportData };
