import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Database Configuration for GUI
 * Sets up the DATABASE_URL environment variable to use the user's home directory
 */
export function setupDatabaseConfig() {
  // Only set DATABASE_URL if it's not already configured
  if (!process.env.DATABASE_URL) {
    const homeDir = os.homedir();
    const hikmaDir = path.join(homeDir, '.hikmapr');
    const dbPath = path.join(hikmaDir, 'reviews.db');
    
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
export function getDatabaseDir() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.hikmapr');
}

/**
 * Get the full database file path
 */
export function getDatabasePath() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.hikmapr', 'reviews.db');
}
