#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { generateReviewsData } = require('./data-generator');

// Get the correct database path (same as your main app)
function getDatabasePath() {
  const homeDir = os.homedir();
  const hikmaDir = path.join(homeDir, '.hikmapr');
  return path.join(hikmaDir, 'reviews.db');
}

async function startUI(options = {}) {
  const { port = 3000, dbPath, skipDataGeneration = false } = options;
  
  // Use the correct database path if not provided
  const actualDbPath = dbPath || getDatabasePath();
  
  console.log('🚀 Starting PR Analysis UI...');
  
  // Check if UI build exists
  const uiPath = path.join(__dirname, '../dist/ui');
  if (!fs.existsSync(uiPath)) {
    console.error('❌ UI build not found. Please run: npm run build-ui');
    process.exit(1);
  }
  
  let reviewsData = { reviews: [], summaryStats: { totalReviews: 0, criticalFindings: 0, avgQualityScore: 0, activeRepos: 0 } };
  
  if (!skipDataGeneration) {
    try {
      console.log('📊 Generating data from SQLite database...');
      reviewsData = await generateReviewsData(actualDbPath);
      console.log(`✅ Loaded ${reviewsData.reviews.length} reviews`);
    } catch (error) {
      console.warn('⚠️  Failed to load database:', error.message);
      console.log('📝 Using empty dataset (UI will show no data)');
    }
  }
  
  // Create Express app
  const app = express();
  
  // Serve static files from UI build
  app.use(express.static(uiPath));
  
  // API endpoint for reviews data
  app.get('/api/reviews', (req, res) => {
    res.json(reviewsData);
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      reviewCount: reviewsData.reviews.length,
      timestamp: new Date().toISOString()
    });
  });
  
  // Catch-all handler: send back React app's index.html file for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(uiPath, 'index.html'));
  });
  
  // Start server
  const server = app.listen(port, () => {
    console.log('');
    console.log('🎉 PR Analysis UI is ready!');
    console.log(`📱 Open: http://localhost:${port}`);
    console.log(`📊 Reviews loaded: ${reviewsData.reviews.length}`);
    console.log(`🔍 Critical findings: ${reviewsData.summaryStats.criticalFindings}`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
  
  return server;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        options.port = parseInt(args[++i]);
        break;
      case '--db':
        options.dbPath = args[++i];
        break;
      case '--skip-data':
        options.skipDataGeneration = true;
        break;
    }
  }
  
  startUI(options).catch(error => {
    console.error('❌ Failed to start UI:', error.message);
    process.exit(1);
  });
}

module.exports = { startUI };
