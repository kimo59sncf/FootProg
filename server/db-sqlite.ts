import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@shared/schema-sqlite';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

let sqlite: Database.Database | null = null;
let db: any = null;

// Fonction pour initialiser la base de données SQLite
export function initializeSQLiteDB() {
  if (process.env.NO_DB === 'true') {
    console.log('Mode sans base de données activé - SQLite désactivée');
    return { sqlite: null, db: null };
  }

  try {
    // Créer ou ouvrir la base de données SQLite
    const dbPath = process.env.SQLITE_DB_PATH || './footprog.sqlite';
    console.log(`Initialisation de la base de données SQLite: ${dbPath}`);
    
    sqlite = new Database(dbPath);
    
    // Activer les clés étrangères
    sqlite.pragma('foreign_keys = ON');
    
    // Créer la connexion drizzle
    db = drizzle(sqlite, { schema });
    
    // Créer les tables si elles n'existent pas
    createTables();
    
    console.log('Base de données SQLite initialisée avec succès !');
    return { sqlite, db };
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de SQLite:', error);
    throw error;
  }
}

// Fonction pour créer les tables manuellement
function createTables() {
  if (!sqlite) return;
  
  try {
    // Créer la table users
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        avatar_url TEXT,
        preferred_position TEXT,
        skill_level TEXT,
        city TEXT,
        preferences TEXT,
        language TEXT DEFAULT 'fr',
        created_at INTEGER NOT NULL
      )
    `);

    // Créer la table matches
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        field_type TEXT NOT NULL,
        date INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        players_needed INTEGER NOT NULL,
        players_total INTEGER NOT NULL,
        location TEXT NOT NULL,
        coordinates TEXT,
        complex_name TEXT,
        complex_url TEXT,
        price_per_player REAL,
        additional_info TEXT,
        is_private INTEGER DEFAULT 0,
        creator_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    // Créer la table participants
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        joined_at INTEGER NOT NULL
      )
    `);

    // Créer la table messages
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'message',
        created_at INTEGER NOT NULL
      )
    `);

    // Créer la table notifications
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        related_match_id INTEGER,
        created_at INTEGER NOT NULL
      )
    `);

    // Créer la table sessions pour express-session
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS session (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expire INTEGER NOT NULL
      )
    `);

    console.log('Tables SQLite créées avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
    throw error;
  }
}

// Fonction pour fermer la connexion
export function closeSQLiteDB() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
    console.log('Connexion SQLite fermée');
  }
}

// Exporter les instances
export { sqlite, db };
