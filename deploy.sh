#!/bin/bash

# Script de déploiement automatique FootProg
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
APP_NAME="footprog"
SERVER_USER="footprog"
SERVER_HOST="VOTRE_IP_OU_DOMAINE"  # Remplacez par votre IP ou domaine
SERVER_PATH="/var/www/$APP_NAME"
BACKUP_PATH="/var/backups/$APP_NAME"
LOG_PATH="/var/log/$APP_NAME"

# Configuration selon l'environnement
if [ "$ENVIRONMENT" = "production" ]; then
    SERVER_PORT="5000"
    NODE_ENV="production"
elif [ "$ENVIRONMENT" = "staging" ]; then
    SERVER_PORT="5001"
    NODE_ENV="staging"
fi

echo "🚀 Déploiement de FootProg en mode: $ENVIRONMENT"

# 1. Build de l'application
echo "📦 Construction de l'application..."
npm install
npm run build

# 2. Tests avant déploiement
echo "🧪 Exécution des tests..."
npm test || echo "⚠️ Tests échoués, continuez? (y/N)" && read -r confirm && [[ $confirm != [yY] ]] && exit 1

# 3. Création de l'archive
echo "📁 Création de l'archive de déploiement..."
tar -czf deploy-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=*.log \
  --exclude=.env.local \
  .

# 4. Backup de l'ancienne version
echo "💾 Sauvegarde de l'ancienne version..."
ssh $SERVER_USER@$SERVER_HOST "
  if [ -d '$SERVER_PATH' ]; then
    sudo cp -r $SERVER_PATH $BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S)
    sudo find $BACKUP_PATH -name 'backup-*' -mtime +7 -delete
  fi
"

# 5. Upload et extraction
echo "📤 Upload vers le serveur..."
scp deploy-*.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

ssh $SERVER_USER@$SERVER_HOST "
  sudo rm -rf $SERVER_PATH.new
  sudo mkdir -p $SERVER_PATH.new
  sudo tar -xzf /tmp/deploy-*.tar.gz -C $SERVER_PATH.new
  sudo chown -R $SERVER_USER:www-data $SERVER_PATH.new
"

# 6. Installation des dépendances sur le serveur
echo "📥 Installation des dépendances..."
ssh $SERVER_USER@$SERVER_HOST "
  cd $SERVER_PATH.new
  sudo -u $SERVER_USER npm ci --production
  sudo -u $SERVER_USER cp .env.$ENVIRONMENT .env
"

# 7. Migration de base de données
echo "🗄️ Migration de la base de données..."
ssh $SERVER_USER@$SERVER_HOST "
  cd $SERVER_PATH.new
  sudo -u $SERVER_USER npm run db:migrate
"

# 8. Tests de santé
echo "🏥 Tests de santé..."
ssh $SERVER_USER@$SERVER_HOST "
  cd $SERVER_PATH.new
  timeout 30 npm run health-check || exit 1
"

# 9. Basculement atomique
echo "🔄 Basculement vers la nouvelle version..."
ssh $SERVER_USER@$SERVER_HOST "
  sudo mv $SERVER_PATH $SERVER_PATH.old || true
  sudo mv $SERVER_PATH.new $SERVER_PATH
  sudo systemctl restart $APP_NAME
  sudo systemctl reload nginx
"

# 10. Vérification finale
echo "✅ Vérification du déploiement..."
sleep 5
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_HOST/health)
if [ "$HEALTH_CHECK" = "200" ]; then
  echo "🎉 Déploiement réussi!"
  ssh $SERVER_USER@$SERVER_HOST "sudo rm -rf $SERVER_PATH.old"
else
  echo "❌ Échec du déploiement, rollback..."
  ssh $SERVER_USER@$SERVER_HOST "
    sudo mv $SERVER_PATH $SERVER_PATH.failed
    sudo mv $SERVER_PATH.old $SERVER_PATH
    sudo systemctl restart $APP_NAME
  "
  exit 1
fi

# Nettoyage
rm deploy-*.tar.gz
echo "🧹 Nettoyage terminé"
