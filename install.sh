#!/bin/bash

# Script d'installation automatique pour FootProg sur serveur Ubuntu/Debian
# Usage: curl -fsSL https://raw.githubusercontent.com/your-repo/footprog/main/install.sh | bash

set -e

DOMAIN=""
EMAIL=""
DB_PASSWORD=""
APP_USER="footprog"
APP_DIR="/var/www/footprog"

echo "🚀 Installation automatique de FootProg"
echo "======================================="

# Vérifier si l'utilisateur est root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Ce script doit être exécuté en tant que root"
   exit 1
fi

# Demander les informations nécessaires
read -p "Nom de domaine (ex: footprog.com): " DOMAIN
read -p "Email pour SSL (Let's Encrypt): " EMAIL
read -s -p "Mot de passe pour la base de données: " DB_PASSWORD
echo

if [[ -z "$DOMAIN" || -z "$EMAIL" || -z "$DB_PASSWORD" ]]; then
    echo "❌ Toutes les informations sont requises"
    exit 1
fi

echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

echo "📥 Installation des dépendances..."
# Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Nginx
apt install -y nginx

# SSL avec Certbot
apt install -y certbot python3-certbot-nginx

# PM2 pour la gestion des processus Node.js
npm install -g pm2

# SQLite (base de données par défaut)
apt install -y sqlite3

# Fail2ban pour la sécurité
apt install -y fail2ban

echo "👤 Création de l'utilisateur application..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    usermod -aG www-data "$APP_USER"
fi

echo "📁 Création des répertoires..."
mkdir -p "$APP_DIR"
mkdir -p /var/log/footprog
mkdir -p /var/backups/footprog

# Permissions
chown -R "$APP_USER:www-data" "$APP_DIR"
chown -R "$APP_USER:www-data" /var/log/footprog

echo "⚙️ Configuration Nginx..."
cat > /etc/nginx/sites-available/footprog << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL sera configuré par Certbot
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Gzip
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/footprog /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test de la configuration Nginx
nginx -t

echo "🔒 Configuration SSL avec Let's Encrypt..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

echo "🔒 Configuration de Fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo "⚙️ Configuration des variables d'environnement..."
cat > "$APP_DIR/.env.production" << EOF
NODE_ENV=production
PORT=3000
USE_SQLITE=true
DATABASE_URL=sqlite://$APP_DIR/footprog.sqlite
SESSION_SECRET=$(openssl rand -hex 32)
DOMAIN=$DOMAIN
EOF

chown "$APP_USER:www-data" "$APP_DIR/.env.production"
chmod 640 "$APP_DIR/.env.production"

echo "🔄 Configuration PM2..."
sudo -u "$APP_USER" pm2 startup
pm2 startup ubuntu -u "$APP_USER" --hp "/home/$APP_USER"

echo "📋 Configuration des logs..."
cat > /etc/logrotate.d/footprog << EOF
/var/log/footprog/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 $APP_USER www-data
    postrotate
        sudo -u $APP_USER pm2 reload footprog
    endscript
}
EOF

echo "⏰ Configuration des tâches automatiques..."
cat > /etc/cron.d/footprog << EOF
# Sauvegarde quotidienne de la base de données
0 2 * * * $APP_USER cp $APP_DIR/footprog.sqlite /var/backups/footprog/footprog-\$(date +\%Y\%m\%d).sqlite

# Nettoyage des anciennes sauvegardes (garde 30 jours)
0 3 * * * root find /var/backups/footprog -name "footprog-*.sqlite" -mtime +30 -delete

# Génération du sitemap (chaque heure)
0 * * * * $APP_USER cd $APP_DIR && npm run generate-sitemap

# Redémarrage hebdomadaire pour la maintenance
0 4 * * 0 $APP_USER pm2 restart footprog
EOF

echo "🔥 Configuration du firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'

echo "✅ Démarrage des services..."
systemctl enable nginx
systemctl restart nginx

echo "🎉 Installation terminée avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Clonez votre code dans $APP_DIR"
echo "2. Installez les dépendances: cd $APP_DIR && npm ci --production"
echo "3. Démarrez l'application: sudo -u $APP_USER pm2 start ecosystem.config.js"
echo "4. Sauvegardez la configuration PM2: sudo -u $APP_USER pm2 save"
echo ""
echo "🌐 Votre site sera disponible sur: https://$DOMAIN"
echo "📊 Monitoring: pm2 monit"
echo "📝 Logs: pm2 logs footprog"
