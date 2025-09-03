import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';
import { initializeSQLiteDB } from './db-sqlite';

// Check if database is disabled
if (process.env.NO_DB === 'true') {
  console.log('Mode sans base de données activé - DB désactivée');
}

let pool: Pool | null = null;
let db: any = null;

// Choisir entre SQLite et PostgreSQL
if (process.env.NO_DB === 'true') {
  console.log('Mode sans base de données activé - DB désactivée');
  // Ne pas initialiser de DB
} else if (process.env.USE_SQLITE === 'true') {
  console.log('Utilisation de SQLite comme base de données');
  const { sqlite, db: sqliteDb } = initializeSQLiteDB();
  db = sqliteDb;
  pool = null; // SQLite n'utilise pas de pool
} else {
  console.log('Utilisation de PostgreSQL comme base de données');
  // Setup websocket for Neon serverless
  neonConfig.webSocketConstructor = ws;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { pool, db };