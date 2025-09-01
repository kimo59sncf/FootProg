# 🚀 Guide de Déploiement FootProg

## Vue d'ensemble

Ce guide vous explique comment déployer automatiquement votre application FootProg sur un serveur de production avec monitoring avancé et optimisation SEO.

## 📋 Prérequis

- Serveur Ubuntu/Debian 20.04+ 
- Nom de domaine configuré
- Accès SSH root
- Git installé

## 🔧 Installation Automatique

### 1. Installation sur serveur vierge

```bash
# Connexion au serveur
ssh root@votre-serveur.com

# Téléchargement et exécution du script d'installation
curl -fsSL https://raw.githubusercontent.com/votre-repo/footprog/main/install.sh | bash
```

Le script vous demandera :
- **Nom de domaine** : footprog.com
- **Email SSL** : votre@email.com  
- **Mot de passe BDD** : mot de passe sécurisé

### 2. Déploiement du code

```bash
# Sur votre machine locale
git clone https://github.com/votre-repo/footprog.git
cd footprog

# Configuration des serveurs
nano deploy.sh
# Modifier SERVER_HOST et SERVER_USER

# Déploiement en production
./deploy.sh production

# Ou déploiement en staging  
./deploy.sh staging
```

### 3. Alternative Windows

```powershell
# PowerShell sur Windows
.\deploy.ps1 -Environment production -ServerHost "votre-serveur.com" -ServerUser "footprog"
```

## 📊 Monitoring et Analytics

### Suivi des visiteurs

L'application track automatiquement :
- ✅ **Nombre de visiteurs uniques**
- ✅ **Pages vues** 
- ✅ **Géolocalisation** (pays/ville)
- ✅ **Appareils** (mobile/desktop/tablet)
- ✅ **Sources de trafic** (referrers)
- ✅ **Statistiques temps réel**

### Accès aux statistiques

```bash
# API Analytics (admin requis)
GET /api/analytics

# Exemple de réponse
{
  "totalVisitors": 1250,
  "uniqueVisitors": 980, 
  "pageViews": 3400,
  "countries": {
    "FR": 850,
    "BE": 120,
    "CH": 80
  },
  "last24h": {
    "visitors": 45,
    "pageViews": 120
  }
}
```

### Logs et monitoring

```bash
# Monitoring en temps réel
pm2 monit

# Logs de l'application
pm2 logs footprog

# Logs serveur web
tail -f /var/log/nginx/access.log

# Analytics détaillés
tail -f /var/www/footprog/logs/visitors.log
```

## 🔍 Optimisation SEO

### Fonctionnalités SEO automatiques

✅ **Métadonnées dynamiques** - Titre/description par page  
✅ **Sitemap XML** - Généré automatiquement  
✅ **Robots.txt** - Configuration optimale  
✅ **Open Graph** - Partage réseaux sociaux  
✅ **Schema.org** - Données structurées  
✅ **URLs canoniques** - Évite contenu dupliqué  

### Pages optimisées

- `/` - Page d'accueil avec schema WebSite
- `/find-matches` - Liste des matchs avec pagination
- `/match/{id}` - Détails match avec schema SportsEvent  
- `/create-match` - Création de match
- `/how-it-works` - Guide utilisateur

### Génération automatique

```bash
# Sitemap généré chaque heure via cron
0 * * * * cd /var/www/footprog && npm run generate-sitemap

# Accès public
https://footprog.com/sitemap.xml
https://footprog.com/robots.txt
```

### URLs SEO-friendly

- ✅ `footprog.com/match/123-match-lille-favbrique`
- ✅ `footprog.com/find-matches?city=lille` 
- ✅ `footprog.com/how-it-works`

## 🛡️ Sécurité et Performance

### Sécurité

- ✅ **SSL/TLS** automatique (Let's Encrypt)
- ✅ **Headers sécurisés** (CSP, HSTS, etc.)
- ✅ **Rate limiting** API et login
- ✅ **Fail2ban** protection brute force
- ✅ **Firewall UFW** configuré

### Performance 

- ✅ **Compression Gzip** activée
- ✅ **Cache statique** (images, CSS, JS)
- ✅ **CDN ready** pour assets
- ✅ **PM2 cluster** mode multi-processus
- ✅ **Keep-alive** connections

## 📈 Commandes Utiles

### Gestion PM2

```bash
# Démarrer l'application
npm run pm2:start

# Redémarrer
npm run pm2:restart

# Voir les logs
npm run pm2:logs

# Monitoring
pm2 monit

# Sauvegarder config
pm2 save
```

### Maintenance

```bash
# Sauvegarde base de données
npm run backup-db

# Health check
curl https://footprog.com/health

# Regénérer sitemap
curl -X POST https://footprog.com/api/generate-sitemap

# Analyser les logs Nginx
goaccess /var/log/nginx/access.log -o /var/www/html/report.html --log-format=COMBINED
```

### SSL et certificats

```bash
# Renouvellement SSL (automatique)
certbot renew --dry-run

# Vérifier certificat
openssl x509 -in /etc/letsencrypt/live/footprog.com/fullchain.pem -text -noout
```

## 🔄 Processus de Déploiement

### 1. Développement local

```bash
# Tests
npm test

# Build local  
npm run build

# Vérification
npm run health-check
```

### 2. Déploiement automatique

Le script `deploy.sh` effectue :

1. ✅ **Build** de l'application
2. ✅ **Tests** de validation  
3. ✅ **Backup** ancienne version
4. ✅ **Upload** nouvelle version
5. ✅ **Migration** base de données
6. ✅ **Health check** avant basculement
7. ✅ **Basculement** atomique
8. ✅ **Rollback** automatique si échec

### 3. Vérification post-déploiement

```bash
# Status des services
systemctl status footprog nginx

# Métriques PM2  
pm2 show footprog

# Test fonctionnel
curl -f https://footprog.com/health
```

## 📝 Configuration Avancée

### Variables d'environnement

```bash
# /var/www/footprog/.env.production
NODE_ENV=production
PORT=3000
USE_SQLITE=true
DOMAIN=footprog.com
SESSION_SECRET=...
ANALYTICS_ENABLED=true
SEO_ENABLED=true
```

### Optimisation base de données

```bash
# Index SQLite pour performance
sqlite3 footprog.sqlite "CREATE INDEX idx_matches_date ON matches(date);"
sqlite3 footprog.sqlite "CREATE INDEX idx_participants_match ON participants(match_id);"
```

### Monitoring externe

```bash
# Intégration avec des services comme:
# - UptimeRobot (monitoring uptime)
# - Google Analytics 4 
# - Sentry (error tracking)
# - New Relic (APM)
```

## 🎯 Résultats Attendus

### Performance SEO

- ✅ **Score Lighthouse** > 90
- ✅ **Temps de chargement** < 2s
- ✅ **Mobile-friendly** 100%
- ✅ **Indexation** Google optimale

### Analytics

- 📊 **Dashboard** temps réel  
- 📈 **Métriques** détaillées par page
- 🌍 **Géolocalisation** des visiteurs  
- 📱 **Analyse** des appareils

### Disponibilité  

- ⚡ **99.9%** uptime garanti
- 🔄 **Redémarrage** automatique en cas d'erreur
- 💾 **Sauvegardes** quotidiennes automatiques
- 🔐 **Sécurité** renforcée

---

## 🆘 Support et Dépannage

### Logs importants

```bash
# Application
tail -f /var/log/footprog/error.log

# Nginx  
tail -f /var/log/nginx/error.log

# Système
journalctl -u footprog -f
```

### Problèmes courants

1. **Port 3000 occupé** → `pm2 restart footprog`
2. **SSL expiré** → `certbot renew`  
3. **Base corrompue** → Restaurer backup
4. **Mémoire pleine** → `pm2 restart footprog`

Pour plus d'aide : `support@footprog.com`

## Installation serveur (une seule fois)
curl -fsSL https://raw.githubusercontent.com/votre-repo/footprog/main/install.sh | bash

# Déploiement application  
./deploy.sh production

# Monitoring
pm2 monit