
# Image de base Node.js
FROM node:20-slim

# Définition du répertoire de travail
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Installation des dépendances de construction
COPY package*.json ./
RUN npm ci

# Copie des fichiers du projet
COPY . .

# Construction du frontend
RUN npm run build

# Exposition du port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "run", "start"]

# Configuration de santé
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Optimisations
RUN npm cache clean --force

# Métadonnées
LABEL maintainer="FootballConnect Team" \
      version="1.0" \
      description="Application de gestion de matchs de football"
