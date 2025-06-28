import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

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