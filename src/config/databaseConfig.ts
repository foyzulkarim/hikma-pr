import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { execSync } from 'child_process';

const DATABASE_DIR = '.hikmapr';
const DATABASE_FILE = 'reviews.db';

/**
 * Database Configuration
 * Sets up the DATABASE_URL environment variable to use the user's home directory
 */
export function setupDatabaseConfig(): void {
  // Only set DATABASE_URL if it's not already configured
  if (!process.env.DATABASE_URL) {
    const homeDir = os.homedir();
    const hikmaDir = path.join(homeDir, DATABASE_DIR);
    const dbPath = path.join(hikmaDir, DATABASE_FILE); 
    
    // Ensure the .hikmapr directory exists
    if (!fs.existsSync(hikmaDir)) {
      fs.mkdirSync(hikmaDir, { recursive: true });
    }
    
    // Set the DATABASE_URL environment variable
    process.env.DATABASE_URL = `file:${dbPath}`;
  }
}

/**
 * Ensure Prisma client is generated and database is set up
 */
export async function ensureDatabaseSetup(): Promise<void> {
  try {
    // Try to import Prisma client to see if it's generated
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Try a simple query to check if database is accessible
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
  } catch (error) {
    console.log('🔧 Setting up database for first-time use...');
    
    try {
      // Generate Prisma client
      console.log('⚙️  Generating Prisma client...');
      execSync('npx prisma generate', { 
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env
      });

      // Deploy migrations
      console.log('🚀 Setting up database schema...');
      execSync('npx prisma migrate deploy', { 
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env
      });

      console.log('✅ Database setup complete!');
    } catch (setupError) {
      const errorMessage = setupError instanceof Error ? setupError.message : String(setupError);
      console.error('❌ Failed to set up database:', errorMessage);
      console.log('💡 Please try running: npx prisma generate && npx prisma migrate deploy');
      throw setupError;
    }
  }
}

/**
 * Get the database directory path
 */
export function getDatabaseDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, DATABASE_DIR);
}

/**
 * Get the full database file path
 */
export function getDatabasePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, DATABASE_DIR, DATABASE_FILE);
}