# 🚀 Guide de Lancement Local - FootProg

## Étapes pour démarrer l'application en local

### 1. Installation des dépendances

```powershell
# Dans le répertoire du projet
npm install
```

### 2. Configuration de l'environnement

Créer un fichier `.env` à la racine avec :
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:./footprog.sqlite
SESSION_SECRET=your-secret-key-here
```

### 3. Initialisation de la base de données

```powershell
# Pousser le schéma vers la base SQLite
npm run db:push
```

### 4. Lancement de l'application

#### Option A : Mode développement avec rechargement automatique
```powershell
npm run dev
```

#### Option B : Lancement manuel avec tsx
```powershell
npx cross-env NODE_ENV=development tsx server/index.ts
```

#### Option C : Mode production local
```powershell
npm run build
npm start
```

### 5. Accès à l'application

Une fois démarrée, l'application sera accessible sur :
- **Frontend** : http://localhost:5000
- **API** : http://localhost:5000/api
- **Health Check** : http://localhost:5000/health

## Commandes de développement

### Surveillance des logs
```powershell
# Voir les logs de l'application en temps réel
Get-Content -Path ".\logs\app.log" -Wait -Tail 10
```

### Réinitialiser la base de données
```powershell
# Supprimer et recréer la base
Remove-Item footprog.sqlite -ErrorAction SilentlyContinue
npm run db:push
```

### Tests et vérifications
```powershell
# Vérifier les types TypeScript
npm run check

# Test de santé de l'API
Invoke-WebRequest http://localhost:5000/health

# Test de connexion
$body = '{"username":"testuser","password":"test123"}'
Invoke-WebRequest -Uri "http://localhost:5000/api/login" -Method POST -Body $body -ContentType "application/json"
```

## Structure de l'application

### Frontend (Client)
- **Port** : 5000 (intégré avec le serveur)
- **Framework** : React + Vite
- **Dossier** : `client/`

### Backend (Serveur)
- **Port** : 5000
- **Framework** : Express.js
- **Dossier** : `server/`
- **Base de données** : SQLite (`footprog.sqlite`)

### API Endpoints
- `GET /api/matches` - Liste des matchs
- `POST /api/matches` - Créer un match
- `GET /api/matches/:id` - Détails d'un match
- `POST /api/matches/:id/join` - Rejoindre un match
- `POST /api/login` - Connexion
- `POST /api/register` - Inscription
- `GET /health` - Santé du serveur

## Dépannage

### Port déjà utilisé
```powershell
# Tuer les processus Node.js
taskkill /F /IM node.exe

# Vérifier les ports occupés
netstat -ano | findstr :5000
```

### Problèmes de base de données
```powershell
# Réinitialiser complètement
Remove-Item footprog.sqlite -ErrorAction SilentlyContinue
Remove-Item sessions.sqlite -ErrorAction SilentlyContinue
npm run db:push
```

### Erreurs de compilation
```powershell
# Nettoyer et réinstaller
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Variables d'environnement manquantes
Vérifiez que le fichier `.env` contient toutes les variables nécessaires :
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:./footprog.sqlite
SESSION_SECRET=dev-secret-key-change-in-production
```

## Développement

### Mode développement avec hot reload
```powershell
# Terminal 1 : Serveur backend
npm run dev

# Terminal 2 : Client frontend (si séparé)
cd client && npm run dev
```

### Construction pour production
```powershell
npm run build
```

### Analyse du bundle
```powershell
npx vite build --mode analyze
```

## Commandes PM2 (optionnel pour le développement)

```powershell
# Démarrer avec PM2
npm run pm2:start

# Voir les logs PM2
npm run pm2:logs

# Redémarrer
npm run pm2:restart

# Arrêter
npm run pm2:stop
```

## Surveillance et monitoring

### Logs de l'application
- **Serveur** : Console + fichiers logs
- **Client** : Console du navigateur
- **Base de données** : SQLite logs

### Métriques
- **Visiteurs** : `/var/log/footprog/visitors.log`
- **Performance** : Console Network du navigateur
- **Erreurs** : Console + logs serveur
