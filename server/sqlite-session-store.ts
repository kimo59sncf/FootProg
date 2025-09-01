import session from "express-session";
import { db } from "./db-sqlite";
import { sql } from "drizzle-orm";

export class SQLiteSessionStore extends session.Store {
  private tableName = 'sessions';

  constructor() {
    super();
    this.createTable();
  }

  private async createTable() {
    if (!db) return;
    
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS ${sql.identifier(this.tableName)} (
          sid TEXT PRIMARY KEY,
          sess TEXT NOT NULL,
          expire INTEGER NOT NULL
        )
      `);
    } catch (error) {
      console.error('Erreur lors de la création de la table sessions:', error);
    }
  }

  get(sid: string, callback: (err?: any, session?: session.SessionData | null) => void) {
    if (!db) {
      return callback(new Error('Database not initialized'));
    }

    try {
      const stmt = db.prepare('SELECT sess, expire FROM sessions WHERE sid = ?');
      const row = stmt.get(sid) as { sess: string; expire: number } | undefined;

      if (!row) {
        return callback(null, null);
      }

      if (row.expire < Date.now()) {
        // Session expirée, la supprimer
        this.destroy(sid, () => {});
        return callback(null, null);
      }

      const session = JSON.parse(row.sess);
      callback(null, session);
    } catch (error) {
      callback(error);
    }
  }

  set(sid: string, session: session.SessionData, callback?: (err?: any) => void) {
    if (!db) {
      return callback?.(new Error('Database not initialized'));
    }

    try {
      const maxAge = session.cookie?.maxAge || 86400000; // 24h par défaut
      const expire = Date.now() + maxAge;
      const sess = JSON.stringify(session);

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO sessions (sid, sess, expire) 
        VALUES (?, ?, ?)
      `);
      stmt.run(sid, sess, expire);

      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  destroy(sid: string, callback?: (err?: any) => void) {
    if (!db) {
      return callback?.(new Error('Database not initialized'));
    }

    try {
      const stmt = db.prepare('DELETE FROM sessions WHERE sid = ?');
      stmt.run(sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  length(callback: (err: any, length?: number) => void) {
    if (!db) {
      return callback(new Error('Database not initialized'));
    }

    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expire > ?');
      const result = stmt.get(Date.now()) as { count: number };
      callback(null, result.count);
    } catch (error) {
      callback(error);
    }
  }

  clear(callback?: (err?: any) => void) {
    if (!db) {
      return callback?.(new Error('Database not initialized'));
    }

    try {
      const stmt = db.prepare('DELETE FROM sessions');
      stmt.run();
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  touch(sid: string, session: session.SessionData, callback?: (err?: any) => void) {
    if (!db) {
      return callback?.(new Error('Database not initialized'));
    }

    try {
      const maxAge = session.cookie?.maxAge || 86400000;
      const expire = Date.now() + maxAge;

      const stmt = db.prepare('UPDATE sessions SET expire = ? WHERE sid = ?');
      stmt.run(expire, sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }
}
