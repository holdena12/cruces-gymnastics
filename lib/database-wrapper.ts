// Database wrapper to handle build-time issues
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database | null {
  if (db) return db;
  
  // Skip database initialization during build
  if (process.env.ENABLE_DATABASE === 'false') {
    console.log('Database disabled for build environment');
    return null;
  }
  
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create database file
    const dbPath = path.join(dataDir, 'enrollment.db');
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return null;
  }
}

export function safeDbOperation<T>(operation: (db: Database.Database) => T): T | null {
  const database = getDatabase();
  if (!database) {
    console.log('Database not available for operation');
    return null;
  }
  
  try {
    return operation(database);
  } catch (error) {
    console.error('Database operation failed:', error);
    return null;
  }
} 