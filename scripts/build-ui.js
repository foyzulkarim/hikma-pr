#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function buildUI() {
  console.log('🔨 Building PR Analysis UI...');
  
  const uiDir = path.join(__dirname, '../hikma-pr-ui');
  const targetDir = path.join(__dirname, '../dist/ui');
  
  // Check if UI directory exists
  if (!fs.existsSync(uiDir)) {
    console.error('❌ UI directory not found:', uiDir);
    process.exit(1);
  }
  
  try {
    // Install dependencies if node_modules doesn't exist
    const nodeModulesPath = path.join(uiDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('📦 Installing UI dependencies...');
      execSync('npm install', { cwd: uiDir, stdio: 'inherit' });
    }
    
    // Build the UI
    console.log('⚡ Building with Vite...');
    execSync('npm run build', { cwd: uiDir, stdio: 'inherit' });
    
    // Create target directory
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Copy built files
    const sourceDir = path.join(uiDir, 'dist');
    if (!fs.existsSync(sourceDir)) {
      throw new Error('Build output directory not found');
    }
    
    console.log('📁 Copying built files...');
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    
    console.log('✅ UI built successfully!');
    console.log(`📂 Built files available at: ${targetDir}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  buildUI();
}

module.exports = { buildUI };
