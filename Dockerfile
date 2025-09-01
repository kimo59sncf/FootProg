# Image de base Node.js
FROM node:20-slim

# Définition du répertoire de travail
WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie des fichiers du projet
COPY . .

# Variables d'environnement pour la base de données
ENV DATABASE_URL="postgresql://neondb_owner:npg_i9FdKvX0mqfx@ep-autumn-tooth-a63j6amr.us-west-2.aws.neon.tech/neondb?sslmode=require"
ENV NODE_ENV=production

# Build du projet TypeScript
RUN npm run build

# Exposition du port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]