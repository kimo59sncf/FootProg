import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), 'dist', '.env') });

import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import VisitorTracker from "./visitor-tracker";
import SEOGenerator from "./seo-generator";
import './db'; // Initialise la base de données au démarrage

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('USE_SQLITE:', process.env.USE_SQLITE);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Initialisation des modules SEO et Analytics
const visitorTracker = new VisitorTracker();
const seoGenerator = new SEOGenerator(process.env.DOMAIN ? `https://${process.env.DOMAIN}` : 'http://localhost:5001');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de tracking des visiteurs
app.use(visitorTracker.trackVisitor);

// Middleware SEO
app.use(seoGenerator.injectSEOMiddleware);

// Configuration CORS pour permettre les credentials
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  let server;
  
  if (process.env.NO_DB === 'true') {
    console.log('Mode sans base de données activé - routes API désactivées');
    const { createServer } = await import('http');
    server = createServer(app);
    
    // Route de base pour tester
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', mode: 'no-db' });
    });
  } else {
    console.log('Mode base de données activé - chargement des routes');
    const { registerRoutes } = await import("./routes");
    const { matchCleanupService } = await import("./match-cleanup");
    
    server = await registerRoutes(app);
    
    // Démarrer le service de nettoyage automatique des matchs expirés
    if (process.env.NODE_ENV === 'production') {
      matchCleanupService.start(120);
    } else {
      matchCleanupService.start(30);
    }
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = Number(process.env.PORT) || 5000;
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
