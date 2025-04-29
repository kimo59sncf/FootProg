import { users, matches, participants, messages, type User, type InsertUser, type Match, type InsertMatch, type Participant, type InsertParticipant, type Message, type InsertMessage, type MatchWithCreator, type MatchWithDetails } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatch(id: number): Promise<Match | undefined>;
  getMatchWithDetails(id: number): Promise<MatchWithDetails | undefined>;
  getMatches(filters?: MatchFilters): Promise<MatchWithCreator[]>;
  updateMatch(id: number, match: Partial<InsertMatch>): Promise<Match | undefined>;
  deleteMatch(id: number): Promise<boolean>;

  // Participant operations
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  removeParticipant(matchId: number, userId: number): Promise<boolean>;
  getParticipants(matchId: number): Promise<(Participant & { user: User })[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(matchId: number): Promise<(Message & { user: User })[]>;

  sessionStore: session.Store;
}

export type MatchFilters = {
  location?: string;
  date?: Date;
  fieldType?: string;
  minAvailableSpots?: number;
  isPrivate?: boolean;
};

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private participants: Map<number, Participant>;
  private messages: Map<number, Message>;
  currentUserId: number;
  currentMatchId: number;
  currentParticipantId: number;
  currentMessageId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.participants = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentMatchId = 1;
    this.currentParticipantId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Match operations
  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = { ...insertMatch, id, createdAt: new Date() };
    this.matches.set(id, match);
    return match;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchWithDetails(id: number): Promise<MatchWithDetails | undefined> {
    const match = await this.getMatch(id);
    if (!match) return undefined;

    const creator = await this.getUser(match.creatorId);
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
    let matchList = Array.from(this.matches.values());

    // Apply filters if provided
    if (filters) {
      if (filters.location) {
        matchList = matchList.filter(match => 
          match.location.toLowerCase().includes(filters.location!.toLowerCase()));
      }
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        matchList = matchList.filter(match => {
          const matchDate = new Date(match.date);
          return matchDate.getFullYear() === filterDate.getFullYear() && 
                 matchDate.getMonth() === filterDate.getMonth() && 
                 matchDate.getDate() === filterDate.getDate();
        });
      }

      if (filters.fieldType) {
        matchList = matchList.filter(match => match.fieldType === filters.fieldType);
      }

      if (filters.isPrivate !== undefined) {
        matchList = matchList.filter(match => match.isPrivate === filters.isPrivate);
      }
    }

    // Sort by date (newest first)
    matchList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get creator information for each match
    const matchesWithCreator: MatchWithCreator[] = [];
    for (const match of matchList) {
      const creator = await this.getUser(match.creatorId);
      if (creator) {
        matchesWithCreator.push({
          ...match,
          creator
        });
      }
    }

    // Apply minimum available spots filter if provided
    if (filters?.minAvailableSpots) {
      const filteredMatches: MatchWithCreator[] = [];
      
      for (const match of matchesWithCreator) {
        const participants = await this.getParticipants(match.id);
        const confirmedCount = participants.filter(p => p.status === 'confirmed').length;
        const availableSpots = match.playersTotal - confirmedCount;
        
        if (availableSpots >= filters.minAvailableSpots) {
          filteredMatches.push(match);
        }
      }
      
      return filteredMatches;
    }

    return matchesWithCreator;
  }

  async updateMatch(id: number, matchData: Partial<InsertMatch>): Promise<Match | undefined> {
    const match = await this.getMatch(id);
    if (!match) return undefined;

    const updatedMatch = { ...match, ...matchData };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async deleteMatch(id: number): Promise<boolean> {
    return this.matches.delete(id);
  }

  // Participant operations
  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.currentParticipantId++;
    const participant: Participant = { ...insertParticipant, id, joinedAt: new Date() };
    this.participants.set(id, participant);
    return participant;
  }

  async removeParticipant(matchId: number, userId: number): Promise<boolean> {
    const participants = Array.from(this.participants.values());
    const participantToRemove = participants.find(
      p => p.matchId === matchId && p.userId === userId
    );

    if (participantToRemove) {
      return this.participants.delete(participantToRemove.id);
    }
    return false;
  }

  async getParticipants(matchId: number): Promise<(Participant & { user: User })[]> {
    const participants = Array.from(this.participants.values())
      .filter(p => p.matchId === matchId);
    
    const result: (Participant & { user: User })[] = [];
    
    for (const participant of participants) {
      const user = await this.getUser(participant.userId);
      if (user) {
        result.push({
          ...participant,
          user
        });
      }
    }
    
    return result;
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { ...insertMessage, id, createdAt: new Date() };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(matchId: number): Promise<(Message & { user: User })[]> {
    const messages = Array.from(this.messages.values())
      .filter(m => m.matchId === matchId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const result: (Message & { user: User })[] = [];
    
    for (const message of messages) {
      const user = await this.getUser(message.userId);
      if (user) {
        result.push({
          ...message,
          user
        });
      }
    }
    
    return result;
  }
}

export const storage = new MemStorage();
