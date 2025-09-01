#!/bin/bash

# Script de préparation serveur Linux pour FootProg
# À exécuter sur votre serveur Linux (Ubuntu/Debian)

set -e

echo "🐧 Préparation du serveur Linux pour FootProg"
echo "=============================================="

# Vérifier les privilèges root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Ce script doit être exécuté en tant que root"
   echo "   Utilisez: sudo bash server-setup.sh"
   exit 1
fi

# Mise à jour du système
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

# Installation Node.js 20.x (LTS)
echo "📥 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Vérification version
node --version
npm --version

# Installation de Nginx
echo "🌐 Installation de Nginx..."
apt install -y nginx

# Installation de PM2 globalement
echo "⚡ Installation de PM2..."
npm install -g pm2

# Installation de SQLite
echo "🗄️ Installation de SQLite..."
apt install -y sqlite3

# Installation SSL avec Certbot
echo "🔒 Installation de Certbot (SSL)..."
apt install -y certbot python3-certbot-nginx

# Installation de sécurité
echo "🛡️ Installation de Fail2ban..."
apt install -y fail2ban ufw

# Création de l'utilisateur pour l'application
echo "👤 Création de l'utilisateur footprog..."
if ! id "footprog" &>/dev/null; then
    adduser --disabled-password --gecos "" footprog
    usermod -aG www-data footprog
fi

# Création des répertoires
echo "📁 Création des répertoires..."
mkdir -p /var/www/footprog
mkdir -p /var/log/footprog
mkdir -p /var/backups/footprog
mkdir -p /home/footprog/.ssh

# Permissions
chown -R footprog:www-data /var/www/footprog
chown -R footprog:www-data /var/log/footprog
chown -R footprog:footprog /var/backups/footprog

# Configuration SSH pour l'utilisateur footprog (optionnel)
echo "🔑 Configuration SSH pour footprog..."
read -p "Voulez-vous configurer l'accès SSH pour l'utilisateur footprog? (y/N): " setup_ssh

if [[ $setup_ssh =~ ^[Yy]$ ]]; then
    echo "Copiez votre clé publique SSH:"
    read -p "Clé publique SSH: " ssh_key
    if [[ -n "$ssh_key" ]]; then
        echo "$ssh_key" > /home/footprog/.ssh/authorized_keys
        chmod 700 /home/footprog/.ssh
        chmod 600 /home/footprog/.ssh/authorized_keys
        chown -R footprog:footprog /home/footprog/.ssh
        echo "✅ Clé SSH configurée pour l'utilisateur footprog"
    fi
fi

# Configuration du firewall UFW
echo "🔥 Configuration du firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'

# Affichage des informations
echo ""
echo "✅ Serveur Linux préparé avec succès!"
echo ""
echo "📋 Informations:"
echo "   - Node.js: $(node --version)"
echo "   - NPM: $(npm --version)" 
echo "   - Nginx: installé"
echo "   - PM2: installé"
echo "   - SQLite: installé"
echo "   - Utilisateur: footprog"
echo "   - Répertoire app: /var/www/footprog"
echo ""
echo "🔄 Prochaines étapes:"
echo "   1. Configurez votre domaine DNS"
echo "   2. Exécutez le script de déploiement depuis votre machine"
echo "   3. Configurez SSL avec certbot"
echo ""
