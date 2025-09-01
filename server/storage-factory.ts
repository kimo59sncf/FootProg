import { DatabaseStorage } from './storage.db';
import { SQLiteStorage } from './storage-sqlite';
import { IStorage } from './storage';

export function createStorage(): IStorage {
  if (process.env.USE_SQLITE === 'true') {
    console.log('Utilisation du storage SQLite');
    return new SQLiteStorage();
  } else {
    console.log('Utilisation du storage PostgreSQL');
    return new DatabaseStorage();
  }
}

export const storage = createStorage();
