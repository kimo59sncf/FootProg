import { defineConfig } from "drizzle-kit";

// Détecter le type de base de données selon l'environnement
const isDevelopment = process.env.NODE_ENV === 'development';
const useSQLite = process.env.USE_SQLITE === 'true' || isDevelopment;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Configuration dynamique selon le type de base de données
const config = useSQLite ? {
  out: "./migrations",
  schema: "./shared/schema-sqlite.ts",
  dialect: "sqlite" as const,
  dbCredentials: {
    url: "./footprog.sqlite",
  },
} : {
  out: "./migrations",
  schema: "./shared/schema.ts", 
  dialect: "postgresql" as const,
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};

export default defineConfig(config);
