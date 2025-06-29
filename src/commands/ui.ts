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
  
  // Find the GUI directory - it should be in the same directory as the main package
  const packageRoot = path.resolve(__dirname, '..', '..');
  const guiPath = path.join(packageRoot, 'hikma-pr-gui');
  
  // Check if GUI directory exists
  if (!fs.existsSync(guiPath)) {
    console.error(chalk.red('❌ GUI directory not found at:'), guiPath);
    console.log(chalk.yellow('💡 Make sure you have the complete hikma-pr package installed.'));
    process.exit(1);
  }
  
  // Check if package.json exists in GUI directory
  const guiPackageJson = path.join(guiPath, 'package.json');
  if (!fs.existsSync(guiPackageJson)) {
    console.error(chalk.red('❌ GUI package.json not found. The GUI may not be properly installed.'));
    process.exit(1);
  }
  
  console.log(chalk.gray('📁 GUI path:'), guiPath);
  console.log(chalk.gray('🌐 Starting server on port:'), port);
  
  // Check if node_modules exists, if not, install dependencies
  const nodeModulesPath = path.join(guiPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(chalk.yellow('📦 Installing GUI dependencies (this may take a moment)...'));
    
    await new Promise<void>((resolve, reject) => {
      const installProcess = spawn('npm', ['install'], {
        cwd: guiPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ Dependencies installed successfully!'));
          resolve();
        } else {
          console.error(chalk.red('❌ Failed to install dependencies'));
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
      
      installProcess.on('error', (error) => {
        console.error(chalk.red('❌ Failed to run npm install:'), error.message);
        reject(error);
      });
    });
  }
  
  // Set environment variables for the GUI
  const dbPath = getDatabasePath();
  const databaseUrl = `file:${dbPath}`;
  const env = {
    ...process.env,
    PORT: port.toString(),
    NODE_ENV: 'development',
    DATABASE_URL: databaseUrl
  };
  
  // Ensure .env file exists in GUI directory with proper DATABASE_URL
  const envPath = path.join(guiPath, '.env');
  const envContent = `# Database Configuration for Hikma PR GUI\nDATABASE_URL="${databaseUrl}"\n`;
  
  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(chalk.gray('📝 Updated GUI .env file with database configuration'));
  } catch (error: unknown) {
    console.warn(chalk.yellow('⚠️  Could not write .env file to GUI directory:'), (error as Error).message);
  }
  
  // Generate Prisma client to prevent compilation issues
  console.log(chalk.blue('🔧 Generating Prisma client...'));
  await new Promise<void>((resolve, reject) => {
    const prismaProcess = spawn('npm', ['run', 'db:generate'], {
      cwd: guiPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      env
    });
    
    prismaProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ Prisma client generated successfully!'));
        resolve();
      } else {
        console.warn(chalk.yellow('⚠️  Prisma generation failed, but continuing...'));
        resolve(); // Continue even if Prisma generation fails
      }
    });
    
    prismaProcess.on('error', (error: Error) => {
      console.warn(chalk.yellow('⚠️  Prisma generation error:'), error.message);
      resolve(); // Continue even if there's an error
    });
  });

  console.log(chalk.green('🎉 Starting the web interface...'));
  console.log(chalk.cyan(`📱 Open your browser to: http://localhost:${port}`));
  console.log(chalk.gray('💡 Press Ctrl+C to stop the server'));
  console.log('');
  
  // Start the simple Express server instead of Next.js
  const devProcess = spawn('node', ['simple-server.js'], {
    cwd: guiPath,
    stdio: 'inherit',
    env
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down UI server...'));
    devProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    devProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  devProcess.on('error', (error) => {
    console.error(chalk.red('❌ Failed to start UI server:'), error.message);
    process.exit(1);
  });
  
  devProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(chalk.red(`❌ UI server exited with code ${code}`));
      process.exit(code || 1);
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
  const guiPath = path.join(packageRoot, 'hikma-pr-gui');
  
  if (!fs.existsSync(guiPath)) {
    console.error(chalk.red('❌ GUI directory not found at:'), guiPath);
    process.exit(1);
  }
  
  console.log(chalk.gray('📁 GUI path:'), guiPath);
  
  // Install dependencies if needed
  const nodeModulesPath = path.join(guiPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(chalk.yellow('📦 Installing GUI dependencies...'));
    
    await new Promise<void>((resolve, reject) => {
      const installProcess = spawn('npm', ['install'], {
        cwd: guiPath,
        stdio: 'inherit'
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }
  
  // Build the application
  console.log(chalk.blue('🔨 Building application...'));
  
  await new Promise<void>((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: guiPath,
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
