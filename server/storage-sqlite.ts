import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema-sqlite";
import { db } from "./db-sqlite";
import bcrypt from "bcryptjs";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import { IStorage, MatchFilters } from "./storage";

// Pour SQLite, on utilise SQLiteStore pour les sessions
const SQLiteSessionStore = SQLiteStore(session);

export class SQLiteStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Configuration SQLite pour les sessions avec casting approprié
    this.sessionStore = new SQLiteSessionStore({
      db: './sessions.sqlite',
      table: 'sessions'
    }) as unknown as session.Store;
  }
  
  // Méthodes pour les utilisateurs
  async getUser(id: number): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    return user || undefined;
  }

  async createUser(userData: any): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    // Ne pas hacher le mot de passe ici car il est déjà haché dans auth.ts
    const [user] = await db.insert(schema.users).values({
      username: userData.username,
      password: userData.password, // Utiliser le mot de passe tel quel (déjà haché)
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      city: userData.city,
      language: userData.language || 'fr',
      createdAt: new Date()
    }).returning();
    
    return user;
  }

  async updateUser(id: number, updates: any): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [user] = await db.update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, id))
      .returning();
    
    return user || undefined;
  }

  // Méthodes pour les matchs
  async createMatch(matchData: any): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [match] = await db.insert(schema.matches).values({
      title: matchData.title,
      fieldType: matchData.fieldType,
      date: new Date(matchData.date),
      duration: matchData.duration,
      playersNeeded: matchData.playersNeeded,
      playersTotal: matchData.playersTotal,
      location: matchData.location,
      coordinates: matchData.coordinates,
      complexName: matchData.complexName,
      complexUrl: matchData.complexUrl,
      pricePerPlayer: matchData.pricePerPlayer,
      additionalInfo: matchData.additionalInfo,
      isPrivate: matchData.isPrivate,
      creatorId: matchData.creatorId,
      createdAt: new Date()
    }).returning();
    
    return match;
  }

  async getMatch(id: number): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [match] = await db.select()
      .from(schema.matches)
      .where(eq(schema.matches.id, id));
    
    return match || undefined;
  }

  async getMatchWithDetails(id: number): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const match = await this.getMatch(id);
    if (!match) return undefined;

    const creator = await this.getUser(match.creatorId);
    if (!creator) return undefined;

    const participants = await this.getParticipants(id);
    const messages = await this.getMessages(id);
    
    // Calculer les places restantes
    const confirmedParticipants = participants.filter(p => p.status === 'confirmed').length;
    const availableSpots = match.playersTotal - confirmedParticipants;

    return {
      ...match,
      creator,
      participants,
      messages,
      currentParticipants: confirmedParticipants,
      availableSpots: Math.max(0, availableSpots)
    };
  }

  async getMatches(filters?: MatchFilters): Promise<any[]> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const results = await db.select()
      .from(schema.matches)
      .innerJoin(schema.users, eq(schema.matches.creatorId, schema.users.id))
      .orderBy(desc(schema.matches.date))
      .limit(50);
    
    // Calculer les places restantes pour chaque match
    const matchesWithSpots = await Promise.all(results.map(async (result: any) => {
      const participants = await this.getParticipants(result.matches.id);
      const confirmedParticipants = participants.filter(p => p.status === 'confirmed').length;
      const availableSpots = result.matches.playersTotal - confirmedParticipants;
      
      return {
        ...result.matches,
        creator: result.users,
        currentParticipants: confirmedParticipants,
        availableSpots: Math.max(0, availableSpots)
      };
    }));
    
    return matchesWithSpots;
  }

  async updateMatch(id: number, updates: any): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [match] = await db.update(schema.matches)
      .set(updates)
      .where(eq(schema.matches.id, id))
      .returning();
    
    return match || undefined;
  }

  async deleteMatch(id: number): Promise<boolean> {
    if (!db) throw new Error("Base de données non initialisée");
    
    await db.delete(schema.matches)
      .where(eq(schema.matches.id, id));
    
    return true;
  }

  // Méthodes pour les participants
  async addParticipant(participantData: any): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [participant] = await db.insert(schema.participants).values({
      matchId: participantData.matchId,
      userId: participantData.userId,
      status: participantData.status,
      joinedAt: new Date()
    }).returning();
    
    return participant;
  }

  async removeParticipant(matchId: number, userId: number): Promise<boolean> {
    if (!db) throw new Error("Base de données non initialisée");
    
    await db.delete(schema.participants)
      .where(and(
        eq(schema.participants.matchId, matchId),
        eq(schema.participants.userId, userId)
      ));
    
    return true;
  }

  async getParticipants(matchId: number): Promise<any[]> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const results = await db.select()
      .from(schema.participants)
      .innerJoin(schema.users, eq(schema.participants.userId, schema.users.id))
      .where(eq(schema.participants.matchId, matchId));
    
    return results.map((result: any) => ({
      ...result.participants,
      user: result.users
    }));
  }

  // Méthodes pour les messages
  async createMessage(messageData: any): Promise<any> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const [message] = await db.insert(schema.messages).values({
      matchId: messageData.matchId,
      userId: messageData.userId,
      content: messageData.content,
      createdAt: new Date()
    }).returning();
    
    return message;
  }

  async getMessages(matchId: number): Promise<any[]> {
    if (!db) throw new Error("Base de données non initialisée");
    
    const results = await db.select()
      .from(schema.messages)
      .innerJoin(schema.users, eq(schema.messages.userId, schema.users.id))
      .where(eq(schema.messages.matchId, matchId))
      .orderBy(schema.messages.createdAt);
    
    return results.map((result: any) => ({
      ...result.messages,
      user: result.users
    }));
  }
}
