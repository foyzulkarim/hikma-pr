import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import { getDatabasePath } from '../config/databaseConfig';

/**
 * Start the UI server
 */
export async function startUIServer(options: { port?: number; open?: boolean } = {}): Promise<void> {
  const { port = 3000, open = true } = options;
  
  console.log(chalk.blue('🚀 Starting Hikma PR Web UI...'));
  
  // Use our new serve-ui script
  const packageRoot = path.resolve(__dirname, '..', '..');
  const serveScript = path.join(packageRoot, 'scripts', 'serve-ui.js');
  
  // Check if serve script exists
  if (!fs.existsSync(serveScript)) {
    console.error(chalk.red('❌ UI serve script not found at:'), serveScript);
    console.log(chalk.yellow('💡 Make sure you have the complete hikma-pr package installed.'));
    process.exit(1);
  }
  
  // Get database path
  const dbPath = getDatabasePath();
  console.log(chalk.gray('🗄️  Database path:'), dbPath);
  console.log(chalk.gray('🌐 Starting server on port:'), port);
  
  // Check if UI build exists, if not build it
  const uiBuildPath = path.join(packageRoot, 'dist', 'ui');
  if (!fs.existsSync(uiBuildPath)) {
    console.log(chalk.yellow('🔨 UI not built yet, building now...'));
    await buildUI();
  }
  
  console.log(chalk.green('🎉 Starting the web interface...'));
  console.log(chalk.cyan(`📱 Open your browser to: http://localhost:${port}`));
  console.log(chalk.gray('💡 Press Ctrl+C to stop the server'));
  console.log('');
  
  // Start the UI server with our script
  const serverArgs = ['--port', port.toString(), '--db', dbPath];
  const serverProcess = spawn('node', [serveScript, ...serverArgs], {
    stdio: 'inherit'
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down UI server...'));
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  serverProcess.on('error', (error) => {
    console.error(chalk.red('❌ Failed to start UI server:'), error.message);
    process.exit(1);
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(chalk.red(`❌ UI server exited with code ${code}`));
      process.exit(code);
    }
  });
  
  // Optionally open browser
  if (open) {
    // Wait a bit for the server to start, then try to open browser
    setTimeout(() => {
      const openCommand = process.platform === 'darwin' ? 'open' : 
                         process.platform === 'win32' ? 'start' : 'xdg-open';
      
      spawn(openCommand, [`http://localhost:${port}`], {
        stdio: 'ignore',
        detached: true
      }).unref();
    }, 3000);
  }
}

/**
 * Build the UI for production
 */
export async function buildUI(): Promise<void> {
  console.log(chalk.blue('🔨 Building Hikma PR Web UI for production...'));
  
  const packageRoot = path.resolve(__dirname, '..', '..');
  const buildScript = path.join(packageRoot, 'scripts', 'build-ui.js');
  
  if (!fs.existsSync(buildScript)) {
    console.error(chalk.red('❌ Build script not found at:'), buildScript);
    process.exit(1);
  }
  
  console.log(chalk.gray('🔨 Running build script...'));
  
  // Run the build script
  await new Promise<void>((resolve, reject) => {
    const buildProcess = spawn('node', [buildScript], {
      stdio: 'inherit'
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ UI built successfully!'));
        resolve();
      } else {
        console.error(chalk.red(`❌ Build failed with code ${code}`));
        reject(new Error(`Build failed with code ${code}`));
      }
    });
    
    buildProcess.on('error', (error) => {
      console.error(chalk.red('❌ Build process failed:'), error.message);
      reject(error);
    });
  });
}
