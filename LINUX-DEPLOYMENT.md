# 🐧 Guide de Déploiement Linux pour FootProg

## Étapes de Déploiement

### 1. Préparation de votre serveur Linux

Connectez-vous à votre serveur via SSH et exécutez le script de préparation :

```bash
# Téléchargez le script de setup
wget https://raw.githubusercontent.com/votre-repo/server-setup.sh
# ou copiez le fichier server-setup.sh sur votre serveur

# Rendez-le exécutable
chmod +x server-setup.sh

# Exécutez le script (nécessite les droits root)
sudo ./server-setup.sh
```

### 2. Configuration de votre domaine

Configurez votre DNS pour pointer vers votre serveur :
- **Type A** : `votre-domaine.com` → `IP_DE_VOTRE_SERVEUR`
- **Type A** : `www.votre-domaine.com` → `IP_DE_VOTRE_SERVEUR`

### 3. Configuration SSH (Recommandé)

Sur votre machine Windows, générez une clé SSH :
```powershell
ssh-keygen -t rsa -b 4096 -C "votre-email@exemple.com"
```

Copiez la clé publique sur votre serveur :
```powershell
ssh-copy-id footprog@IP_SERVEUR
```

### 4. Modification des fichiers de configuration

Modifiez ces fichiers avec vos vraies valeurs :

#### `deploy.sh`
```bash
SERVER_HOST="VOTRE_IP_OU_DOMAINE"  # ex: 192.168.1.100 ou footprog.example.com
```

#### `nginx.conf`
```nginx
server_name votre-domaine.com www.votre-domaine.com;  # Votre vrai domaine
ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
```

#### `ecosystem.config.js`
Aucune modification nécessaire, il est déjà configuré pour Linux.

### 5. Déploiement de l'application

Depuis votre machine Windows (PowerShell ou WSL) :

```bash
# Rendez le script exécutable
chmod +x deploy.sh

# Lancez le déploiement
./deploy.sh production
```

### 6. Configuration Nginx sur le serveur

Connectez-vous à votre serveur et configurez Nginx :

```bash
# Copiez la configuration Nginx
sudo cp /var/www/footprog/nginx.conf /etc/nginx/sites-available/footprog

# Activez le site
sudo ln -sf /etc/nginx/sites-available/footprog /etc/nginx/sites-enabled/

# Supprimez la configuration par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Testez la configuration
sudo nginx -t

# Redémarrez Nginx
sudo systemctl restart nginx
```

### 7. Configuration SSL avec Let's Encrypt

```bash
# Générez les certificats SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Testez le renouvellement automatique
sudo certbot renew --dry-run
```

### 8. Démarrage de l'application

```bash
# Activez et démarrez le service
sudo systemctl enable footprog
sudo systemctl start footprog

# Vérifiez le statut
sudo systemctl status footprog
```

## Commandes de maintenance

### Vérifier les logs
```bash
# Logs du service
sudo journalctl -u footprog -f

# Logs PM2
sudo -u footprog pm2 logs

# Logs Nginx
sudo tail -f /var/log/nginx/footprog_access.log
sudo tail -f /var/log/nginx/footprog_error.log
```

### Redémarrer l'application
```bash
sudo systemctl restart footprog
```

### Sauvegarder la base de données
```bash
sudo -u footprog cp /var/www/footprog/footprog.sqlite /var/backups/footprog/footprog-$(date +%Y%m%d).sqlite
```

### Mettre à jour l'application
```bash
# Depuis votre machine locale
./deploy.sh production
```

## Configuration du pare-feu

```bash
# Vérifier le statut UFW
sudo ufw status

# Ouvrir les ports nécessaires (si pas déjà fait)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Variables d'environnement

Le fichier `.env` sera automatiquement créé avec :
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:///var/www/footprog/footprog.sqlite
SESSION_SECRET=[généré automatiquement]
```

## Monitoring

### Vérifier la santé de l'application
```bash
curl http://localhost:5000/health
```

### Statistiques PM2
```bash
sudo -u footprog pm2 monit
```

### Logs de visite
```bash
sudo tail -f /var/log/footprog/visitors.log
```

## Dépannage

### L'application ne démarre pas
```bash
# Vérifiez les logs
sudo journalctl -u footprog -n 50

# Vérifiez PM2
sudo -u footprog pm2 list
sudo -u footprog pm2 logs
```

### Nginx ne fonctionne pas
```bash
# Testez la configuration
sudo nginx -t

# Vérifiez les logs
sudo tail -f /var/log/nginx/error.log
```

### SSL ne fonctionne pas
```bash
# Renouvelez les certificats
sudo certbot renew

# Vérifiez la configuration SSL
sudo nginx -t
```

## Contacts et Support

- **Logs système** : `/var/log/footprog/`
- **Logs Nginx** : `/var/log/nginx/`
- **Configuration** : `/var/www/footprog/`
- **Sauvegardes** : `/var/backups/footprog/`
