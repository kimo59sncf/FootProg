import { 
  users, matches, participants, messages, 
  type User, type InsertUser, 
  type Match, type InsertMatch, 
  type Participant, type InsertParticipant,
  type Message, type InsertMessage,
  type MatchWithCreator, type MatchWithDetails 
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and, ilike, sql, desc, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { IStorage, MatchFilters } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      avatarUrl: insertUser.avatarUrl,
      bio: insertUser.bio,
      location: insertUser.location,
      preferredLanguage: insertUser.preferredLanguage
    }).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Match operations
  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values({
      date: insertMatch.date,
      title: insertMatch.title,
      fieldType: insertMatch.fieldType,
      duration: insertMatch.duration,
      playersNeeded: insertMatch.playersNeeded,
      playersTotal: insertMatch.playersTotal,
      location: insertMatch.location,
      coordinates: insertMatch.coordinates,
      additionalInfo: insertMatch.additionalInfo,
      complexName: insertMatch.complexName,
      complexUrl: insertMatch.complexUrl,
      pricePerPlayer: insertMatch.pricePerPlayer,
      isPrivate: insertMatch.isPrivate,
      creatorId: insertMatch.creatorId
    }).returning();
    return match;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getMatchWithDetails(id: number): Promise<MatchWithDetails | undefined> {
    const match = await this.getMatch(id);
    if (!match) return undefined;
    
    const [creator] = await db.select().from(users).where(eq(users.id, match.creatorId));
    if (!creator) return undefined;
    
    const matchParticipants = await this.getParticipants(id);
    const matchMessages = await this.getMessages(id);
    
    return {
      ...match,
      creator,
      participants: matchParticipants,
      messages: matchMessages
    };
  }

  async getMatches(filters?: MatchFilters): Promise<MatchWithCreator[]> {
    const creator = alias(users, "creator");
    
    let query = db.select({
      match: matches,
      creator: creator
    })
    .from(matches)
    .innerJoin(creator, eq(matches.creatorId, creator.id));
    
    // Apply filters if provided
    if (filters) {
      const conditions = [];
      
      if (filters.location) {
        conditions.push(ilike(matches.location, `%${filters.location}%`));
      }
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        // Format date to ignore time component
        const formattedDate = filterDate.toISOString().split('T')[0];
        conditions.push(
          sql`DATE(${matches.date}) = DATE(${formattedDate})`
        );
      }
      
      if (filters.fieldType) {
        conditions.push(eq(matches.fieldType, filters.fieldType));
      }
      
      // Filter by privacy setting
      if (filters.isPrivate !== undefined) {
        conditions.push(eq(matches.isPrivate, filters.isPrivate));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    // Sort by date (newest first)
    query = query.orderBy(desc(matches.date));
    
    const result = await query;
    
    // Transform the result to the expected format
    const matchesWithCreator: MatchWithCreator[] = result.map(row => ({
      ...row.match,
      creator: row.creator
    }));
    
    // If we need to filter by available spots, we need to do it in JS
    // since it requires additional participant data
    if (filters?.minAvailableSpots) {
      const filteredMatches = [];
      
      for (const match of matchesWithCreator) {
        const participants = await this.getParticipants(match.id);
        const confirmedParticipants = participants.filter(p => p.status === "confirmed");
        const availableSpots = match.playersTotal - confirmedParticipants.length;
        
        if (availableSpots >= filters.minAvailableSpots) {
          filteredMatches.push(match);
        }
      }
      
      return filteredMatches;
    }
    
    return matchesWithCreator;
  }

  async updateMatch(id: number, matchData: Partial<InsertMatch>): Promise<Match | undefined> {
    const [updatedMatch] = await db
      .update(matches)
      .set(matchData)
      .where(eq(matches.id, id))
      .returning();
    return updatedMatch;
  }

  async deleteMatch(id: number): Promise<boolean> {
    // Delete messages first (foreign key constraint)
    await db.delete(messages).where(eq(messages.matchId, id));
    
    // Delete participants (foreign key constraint)
    await db.delete(participants).where(eq(participants.matchId, id));
    
    // Delete the match
    const result = await db.delete(matches).where(eq(matches.id, id)).returning();
    return result.length > 0;
  }

  // Participant operations
  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const [participant] = await db
      .insert(participants)
      .values({
        status: insertParticipant.status,
        matchId: insertParticipant.matchId,
        userId: insertParticipant.userId
      })
      .returning();
    return participant;
  }

  async removeParticipant(matchId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(participants)
      .where(
        and(
          eq(participants.matchId, matchId),
          eq(participants.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async getParticipants(matchId: number): Promise<(Participant & { user: User })[]> {
    const participantData = await db
      .select({
        participant: participants,
        user: users
      })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(eq(participants.matchId, matchId));
    
    return participantData.map(row => ({
      ...row.participant,
      user: row.user
    }));
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        matchId: insertMessage.matchId,
        userId: insertMessage.userId,
        content: insertMessage.content
      })
      .returning();
    return message;
  }

  async getMessages(matchId: number): Promise<(Message & { user: User })[]> {
    const messageData = await db
      .select({
        message: messages,
        user: users
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
    
    return messageData.map(row => ({
      ...row.message,
      user: row.user
    }));
  }
}