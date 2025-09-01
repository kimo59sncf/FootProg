# 🚀 Script de Lancement Local - FootProg

Write-Host "🏈 Démarrage de FootProg en mode développement local" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js n'est pas installé ou non accessible" -ForegroundColor Red
    Write-Host "   Veuillez installer Node.js depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Vérifier si npm est installé
try {
    $npmVersion = npm --version
    Write-Host "✅ NPM détecté: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ NPM n'est pas accessible" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Cyan

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✅ Dépendances déjà installées" -ForegroundColor Green
}

Write-Host ""
Write-Host "🗄️ Vérification de la base de données..." -ForegroundColor Cyan

# Vérifier si la base de données SQLite existe
if (Test-Path "footprog.sqlite") {
    Write-Host "✅ Base de données SQLite trouvée" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Base de données non trouvée, elle sera créée automatiquement" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚙️ Configuration de l'environnement..." -ForegroundColor Cyan

# Vérifier et configurer le fichier .env
if (-not (Test-Path ".env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    @"
NODE_ENV=development
PORT=5000
USE_SQLITE=true
SQLITE_DB_PATH=./footprog.sqlite
DATABASE_URL=sqlite:./footprog.sqlite
SESSION_SECRET=dev-secret-key-for-local-development
NO_DB=false
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
}
else {
    Write-Host "✅ Fichier .env existant" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Démarrage de l'application..." -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 L'application sera accessible sur:" -ForegroundColor Yellow
Write-Host "   http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📋 Commandes utiles pendant le développement:" -ForegroundColor Yellow
Write-Host "   Ctrl+C        : Arrêter l'application" -ForegroundColor White
Write-Host "   F5            : Recharger la page" -ForegroundColor White
Write-Host "   Ctrl+Shift+I  : Outils de développement" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Démarrage en cours..." -ForegroundColor Cyan

# Démarrer l'application
try {
    npx cross-env NODE_ENV=development USE_SQLITE=true tsx server/index.ts
}
catch {
    Write-Host ""
    Write-Host "❌ Erreur lors du démarrage" -ForegroundColor Red
    Write-Host "💡 Solutions possibles:" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que le port 5000 n'est pas déjà utilisé" -ForegroundColor White
    Write-Host "   2. Essayez: taskkill /F /IM node.exe" -ForegroundColor White
    Write-Host "   3. Supprimez node_modules et relancez" -ForegroundColor White
    exit 1
}
