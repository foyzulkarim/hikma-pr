#!/usr/bin/env node

// Simple test to verify UI command works
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing UI command functionality...');

// Test from a different directory to simulate npx usage
process.chdir('/tmp');

const testProcess = spawn('node', [
  path.join(__dirname, 'dist/index.js'),
  'ui',
  'start',
  '--no-open',
  '--port',
  '3002'
], {
  stdio: 'pipe'
});

let output = '';
testProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log(data.toString());
  
  // Kill the process after we see it's starting successfully
  if (output.includes('Ready in')) {
    console.log('✅ UI command test successful!');
    testProcess.kill('SIGTERM');
  }
});

testProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

testProcess.on('close', (code) => {
  if (code === 0 || code === null) {
    console.log('✅ Test completed successfully');
  } else {
    console.log(`❌ Test failed with code ${code}`);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - killing process');
  testProcess.kill('SIGKILL');
}, 30000);
