#!/bin/bash

# Script de configuration finale FootProg sur serveur Linux
# À exécuter APRÈS le déploiement

set -e

APP_PATH="/var/www/footprog"
DOMAIN="${1:-votre-domaine.com}"

echo "🔧 Configuration finale de FootProg"
echo "===================================="

# Vérifier les permissions
echo "📁 Vérification des permissions..."
sudo chown -R footprog:www-data $APP_PATH
sudo chmod -R 755 $APP_PATH
sudo chmod 644 $APP_PATH/footprog.sqlite

# Configuration Nginx
echo "🌐 Configuration de Nginx..."
if [ ! -f /etc/nginx/sites-available/footprog ]; then
    sudo cp $APP_PATH/nginx.conf /etc/nginx/sites-available/footprog
    
    # Remplacer le domaine par défaut
    sudo sed -i "s/footprog\.com/$DOMAIN/g" /etc/nginx/sites-available/footprog
    sudo sed -i "s/www\.footprog\.com/www.$DOMAIN/g" /etc/nginx/sites-available/footprog
    
    # Activer le site
    sudo ln -sf /etc/nginx/sites-available/footprog /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    echo "✅ Configuration Nginx créée"
else
    echo "ℹ️ Configuration Nginx existe déjà"
fi

# Test de la configuration Nginx
echo "🧪 Test de la configuration Nginx..."
if sudo nginx -t; then
    echo "✅ Configuration Nginx valide"
    sudo systemctl reload nginx
else
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# Service systemd
echo "⚙️ Configuration du service systemd..."
if [ ! -f /etc/systemd/system/footprog.service ]; then
    sudo cp $APP_PATH/footprog.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable footprog
    echo "✅ Service systemd configuré"
else
    echo "ℹ️ Service systemd existe déjà"
fi

# Démarrage PM2 et du service
echo "🚀 Démarrage de l'application..."
sudo -u footprog bash -c "cd $APP_PATH && pm2 start ecosystem.config.js"
sudo systemctl start footprog

# Attendre que l'application démarre
echo "⏳ Attente du démarrage..."
sleep 5

# Test de santé
echo "🏥 Test de santé de l'application..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Application démarrée avec succès"
else
    echo "❌ Problème de démarrage de l'application"
    echo "📋 Logs PM2:"
    sudo -u footprog pm2 logs --lines 10
    exit 1
fi

# Configuration SSL si domaine fourni
if [ "$DOMAIN" != "votre-domaine.com" ]; then
    echo "🔒 Configuration SSL avec Let's Encrypt..."
    echo "Exécutez cette commande pour configurer SSL:"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
else
    echo "⚠️ Configurez SSL manuellement:"
    echo "sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com"
fi

# Affichage du statut final
echo ""
echo "✅ Configuration finale terminée!"
echo ""
echo "📊 Statut des services:"
sudo systemctl is-active nginx && echo "✅ Nginx: actif" || echo "❌ Nginx: inactif"
sudo systemctl is-active footprog && echo "✅ FootProg: actif" || echo "❌ FootProg: inactif"

echo ""
echo "🌐 Accès à l'application:"
if [ "$DOMAIN" != "votre-domaine.com" ]; then
    echo "   HTTP:  http://$DOMAIN"
    echo "   HTTPS: https://$DOMAIN (après configuration SSL)"
else
    echo "   Local: http://localhost"
    echo "   HTTP:  http://VOTRE_IP"
fi

echo ""
echo "📋 Commandes utiles:"
echo "   Logs service: sudo journalctl -u footprog -f"
echo "   Logs PM2:     sudo -u footprog pm2 logs"
echo "   Logs Nginx:   sudo tail -f /var/log/nginx/footprog_access.log"
echo "   Redémarrer:   sudo systemctl restart footprog"
echo "   Monitoring:   sudo -u footprog pm2 monit"
echo ""
