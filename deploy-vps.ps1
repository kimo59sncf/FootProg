# Script de déploiement FootProg sur VPS
# Usage: .\deploy-vps.ps1

param(
    [string]$VPS_IP = "149.102.152.126",
    [string]$USERNAME = "root",
    [string]$APP_DIR = "/var/www/footprog",
    [string]$DOMAIN = "www.footprog.com"
)

Write-Host "🚀 Déploiement FootProg sur VPS $VPS_IP" -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Green

# Test de connectivité
Write-Host "🔍 Test de connectivité au VPS..." -ForegroundColor Yellow
$connectivity = Test-NetConnection -ComputerName $VPS_IP -Port 22
if (-not $connectivity.TcpTestSucceeded) {
    Write-Host "❌ Impossible de se connecter au VPS $VPS_IP sur le port 22" -ForegroundColor Red
    Write-Host "Vérifiez que :" -ForegroundColor Red
    Write-Host "  - Le VPS est démarré" -ForegroundColor Red
    Write-Host "  - Le service SSH est actif" -ForegroundColor Red
    Write-Host "  - Le firewall autorise le port 22" -ForegroundColor Red
    Write-Host "  - L'adresse IP est correcte" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Connectivité OK`n" -ForegroundColor Green

# Préparation des fichiers locaux
Write-Host "📦 Préparation des fichiers..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) {
    Write-Host "🔨 Build de l'application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors du build" -ForegroundColor Red
        exit 1
    }
}

# Création du package de déploiement
Write-Host "📋 Création du package..." -ForegroundColor Yellow
$deployFiles = @(
    "dist/",
    "package.json",
    "ecosystem.config.js",
    "nginx.conf",
    "footprog.service",
    "server-setup.sh",
    "deploy.sh"
)

# Commandes SSH pour le déploiement
$sshCommands = @"
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y nodejs npm nginx git certbot python3-certbot-nginx

# Installation de PM2
sudo npm install -g pm2

# Création du répertoire de l'application
sudo mkdir -p $APP_DIR
sudo chown $USERNAME:$USERNAME $APP_DIR

# Installation des dépendances Node.js
cd $APP_DIR
npm install --production

# Configuration du service systemd
sudo cp footprog.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable footprog

# Configuration Nginx
sudo cp nginx.conf /etc/nginx/sites-available/footprog
sudo ln -sf /etc/nginx/sites-available/footprog /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test de la configuration Nginx
sudo nginx -t

# Redémarrage des services
sudo systemctl restart nginx
sudo systemctl start footprog

# Configuration SSL avec Let's Encrypt (si domaine fourni)
if [ "$DOMAIN" != "votre-domaine.com" ]; then
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

# Affichage du statut
sudo systemctl status footprog --no-pager
sudo systemctl status nginx --no-pager

echo "🎉 Déploiement terminé !"
echo "📱 Application accessible sur :"
if [ "$DOMAIN" != "votre-domaine.com" ]; then
    echo "   https://$DOMAIN"
else
    echo "   http://$VPS_IP"
fi
"@

Write-Host "🔑 Instructions pour le déploiement :" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

Write-Host "1. Assurez-vous que votre VPS est accessible :" -ForegroundColor White
Write-Host "   ssh $USERNAME@$VPS_IP`n" -ForegroundColor Gray

Write-Host "2. Copiez les fichiers sur le VPS :" -ForegroundColor White
Write-Host "   scp -r dist/ package.json ecosystem.config.js nginx.conf footprog.service server-setup.sh deploy.sh $USERNAME@${VPS_IP}:$APP_DIR`n" -ForegroundColor Gray

Write-Host "3. Connectez-vous au VPS et exécutez :" -ForegroundColor White
Write-Host "   ssh $USERNAME@$VPS_IP" -ForegroundColor Gray
Write-Host "   cd $APP_DIR" -ForegroundColor Gray
Write-Host "   chmod +x server-setup.sh deploy.sh" -ForegroundColor Gray
Write-Host "   sudo ./server-setup.sh`n" -ForegroundColor Gray

Write-Host "4. Variables d'environnement à configurer sur le VPS :" -ForegroundColor White
Write-Host "   DATABASE_URL=sqlite:./footprog.sqlite" -ForegroundColor Gray
Write-Host "   SESSION_SECRET=votre-secret-unique" -ForegroundColor Gray
Write-Host "   NODE_ENV=production" -ForegroundColor Gray
Write-Host "   PORT=3000`n" -ForegroundColor Gray

# Génération du script de copie automatique
$copyScript = @"
# Script de copie des fichiers vers le VPS
scp -r dist/ package.json ecosystem.config.js nginx.conf footprog.service server-setup.sh deploy.sh $USERNAME@${VPS_IP}:$APP_DIR

# Commandes à exécuter sur le VPS
ssh $USERNAME@$VPS_IP "cd $APP_DIR && chmod +x server-setup.sh deploy.sh && sudo ./server-setup.sh"
"@

$copyScript | Out-File -FilePath "copy-to-vps.sh" -Encoding UTF8

Write-Host "📝 Script de copie créé : copy-to-vps.sh" -ForegroundColor Green
Write-Host "`n🔧 Dépannage de la connexion SSH :" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Si la connexion SSH échoue, vérifiez :" -ForegroundColor White
Write-Host "• VPS Panel/Console de votre hébergeur" -ForegroundColor Gray
Write-Host "• Redémarrage du VPS depuis le panel" -ForegroundColor Gray
Write-Host "• Configuration du firewall (port 22)" -ForegroundColor Gray
Write-Host "• Logs SSH sur le VPS : journalctl -u ssh" -ForegroundColor Gray
Write-Host "• Test avec un autre port : ssh -p 2222 $USERNAME@$VPS_IP" -ForegroundColor Gray
