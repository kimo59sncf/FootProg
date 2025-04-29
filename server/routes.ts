import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMatchSchema, insertParticipantSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Match routes
  app.get("/api/matches", async (req, res) => {
    try {
      const { location, date, fieldType, minSpots: minSpotsStr } = req.query;
      
      const filters: any = {};
      
      if (location) filters.location = location as string;
      if (date) filters.date = new Date(date as string);
      if (fieldType) filters.fieldType = fieldType as string;
      if (minSpotsStr) filters.minAvailableSpots = parseInt(minSpotsStr as string);
      
      // By default, don't show private matches in the main listing
      if (req.query.includePrivate !== 'true') {
        filters.isPrivate = false;
      }
      
      const matches = await storage.getMatches(filters);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      const match = await storage.getMatchWithDetails(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ message: "Failed to fetch match details" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create a match" });
      }

      const user = req.user;
      // Process the request body to pre-handle date conversion
      const requestData = {
        ...req.body,
        creatorId: user.id,
        // Convert date string to Date object if it's a string
        date: req.body.date ? new Date(req.body.date) : undefined
      };
      
      const matchData = insertMatchSchema.parse(requestData);
      
      const match = await storage.createMatch(matchData);
      
      // Automatically add creator as a participant
      await storage.addParticipant({
        matchId: match.id,
        userId: user.id,
        status: "confirmed"
      });
      
      res.status(201).json(match);
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(400).json({ message: "Failed to create match", error });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update a match" });
      }

      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if user is the creator of the match
      if (match.creatorId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to update this match" });
      }
      
      const updatedMatch = await storage.updateMatch(matchId, req.body);
      res.json(updatedMatch);
    } catch (error) {
      console.error("Error updating match:", error);
      res.status(400).json({ message: "Failed to update match", error });
    }
  });

  app.delete("/api/matches/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to delete a match" });
      }

      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if user is the creator of the match
      if (match.creatorId !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to delete this match" });
      }
      
      await storage.deleteMatch(matchId);
      res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
      console.error("Error deleting match:", error);
      res.status(500).json({ message: "Failed to delete match" });
    }
  });

  // Participant routes
  app.post("/api/matches/:id/join", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to join a match" });
      }

      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if user is already a participant
      const participants = await storage.getParticipants(matchId);
      const isAlreadyParticipant = participants.some(p => p.userId === req.user.id);
      
      if (isAlreadyParticipant) {
        return res.status(400).json({ message: "You are already a participant in this match" });
      }
      
      // Check if match is full
      const confirmedParticipants = participants.filter(p => p.status === "confirmed");
      if (confirmedParticipants.length >= match.playersTotal) {
        return res.status(400).json({ message: "This match is already full" });
      }
      
      const participantData = insertParticipantSchema.parse({
        matchId,
        userId: req.user.id,
        status: "confirmed" // For simplicity, all joins are automatically confirmed
      });
      
      const participant = await storage.addParticipant(participantData);
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error joining match:", error);
      res.status(400).json({ message: "Failed to join match", error });
    }
  });

  app.delete("/api/matches/:id/leave", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to leave a match" });
      }

      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if user is a participant
      const participants = await storage.getParticipants(matchId);
      const isParticipant = participants.some(p => p.userId === req.user.id);
      
      if (!isParticipant) {
        return res.status(400).json({ message: "You are not a participant in this match" });
      }
      
      // Check if user is the creator (creators cannot leave their own matches)
      if (match.creatorId === req.user.id) {
        return res.status(400).json({ message: "Match creators cannot leave their own matches. Delete the match instead." });
      }
      
      await storage.removeParticipant(matchId, req.user.id);
      res.status(200).json({ message: "Successfully left the match" });
    } catch (error) {
      console.error("Error leaving match:", error);
      res.status(500).json({ message: "Failed to leave match" });
    }
  });

  // Message routes
  app.post("/api/matches/:id/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to send messages" });
      }

      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if user is a participant
      const participants = await storage.getParticipants(matchId);
      const isParticipant = participants.some(p => p.userId === req.user.id);
      
      if (!isParticipant) {
        return res.status(403).json({ message: "Only match participants can send messages" });
      }
      
      const messageData = insertMessageSchema.parse({
        matchId,
        userId: req.user.id,
        content: req.body.content
      });
      
      const message = await storage.createMessage(messageData);
      
      // Get user info to include in response
      const messageWithUser = {
        ...message,
        user: req.user
      };
      
      res.status(201).json(messageWithUser);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message", error });
    }
  });

  // User profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to access your profile" });
      }
      
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update your profile" });
      }
      
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile", error });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
