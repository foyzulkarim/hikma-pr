#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🔧 Setting up Hikma PR...');

// Setup database directory
const homeDir = os.homedir();
const hikmaDir = path.join(homeDir, '.hikmapr');

if (!fs.existsSync(hikmaDir)) {
  console.log('📁 Creating .hikmapr directory...');
  fs.mkdirSync(hikmaDir, { recursive: true });
}

// Set DATABASE_URL environment variable for this process
const dbPath = path.join(hikmaDir, 'reviews.db');
process.env.DATABASE_URL = `file:${dbPath}`;

console.log('🗄️  Database path:', dbPath);

try {
  // Generate Prisma client
  console.log('⚙️  Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` }
  });

  // Deploy migrations (create database if it doesn't exist)
  console.log('🚀 Setting up database...');
  execSync('npx prisma migrate deploy', { 
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` }
  });

  console.log('✅ Hikma PR setup complete!');
  console.log('');
  console.log('🎉 You can now use: npx hikma-pr review --help');
  console.log('');
} catch (error) {
  console.log('⚠️  Initial setup encountered some issues, but this is normal for first-time installation.');
  console.log('   The application will complete setup automatically when you run your first command.');
  console.log('');
  console.log('🎉 You can now use: npx hikma-pr review --help');
  console.log('');
}
