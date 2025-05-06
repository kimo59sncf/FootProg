
# Documentation Technique

## Architecture du Projet

### Structure Frontend (client/)
- Framework: React avec TypeScript
- État: React Query pour la gestion des données
- UI: Composants personnalisés avec Radix UI et Tailwind CSS
- Internationalisation: i18next (Français/Anglais)
- Routing: Wouter pour la navigation

#### Organisation des dossiers frontend:
```
client/src/
├── components/         # Composants réutilisables
│   ├── layout/        # Composants de mise en page
│   └── ui/            # Composants d'interface utilisateur
├── hooks/             # Hooks React personnalisés
├── lib/              # Utilitaires et configurations
├── locales/          # Fichiers de traduction
└── pages/            # Composants de pages
```

### Structure Backend (server/)
- Runtime: Node.js avec Express
- Base de données: PostgreSQL avec Drizzle ORM
- Authentication: Passport.js avec sessions
- WebSocket: Pour le chat en temps réel

#### Organisation des dossiers backend:
```
server/
├── auth.ts           # Configuration de l'authentification
├── db.ts            # Configuration de la base de données
├── routes.ts        # Routes API
├── storage.ts       # Gestion du stockage
└── index.ts         # Point d'entrée du serveur
```

### Schéma de Base de Données

#### Users
- id: number (Primary Key)
- username: string
- email: string
- password: string (hashed)
- createdAt: Date

#### Matches
- id: number (Primary Key)
- title: string
- fieldType: string
- location: string
- date: Date
- duration: number
- maxPlayers: number
- creatorId: number (Foreign Key -> Users)

#### Participants
- id: number (Primary Key)
- matchId: number (Foreign Key -> Matches)
- userId: number (Foreign Key -> Users)
- status: string

## API Endpoints

### Authentication
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- GET /api/auth/logout - Déconnexion

### Matches
- GET /api/matches - Liste des matchs
- POST /api/matches - Création d'un match
- GET /api/matches/:id - Détails d'un match
- PUT /api/matches/:id - Modification d'un match
- DELETE /api/matches/:id - Suppression d'un match

### Participants
- POST /api/matches/:id/join - Rejoindre un match
- DELETE /api/matches/:id/leave - Quitter un match

## Configuration Technique

### Environnement de Développement
- Node.js 20.x
- PostgreSQL 16
- Vite pour le bundling
- TypeScript pour le typage statique

### Dépendances Principales
- React 18.x
- Express 4.x
- Drizzle ORM
- TailwindCSS
- i18next
- React Query

### Performance
- Optimisation des images
- Lazy loading des composants
- Mise en cache avec React Query
- Compression Gzip

### Sécurité
- CSRF Protection
- Sessions sécurisées
- Validation des données avec Zod
- Sanitization des entrées

## Déploiement
- Hébergement: Replit
- Base de données: PostgreSQL sur Replit
- Environnement de production configuré via .replit
- Ports: 5000 (dev) / 80,443 (prod)
