@echo off
echo.
echo 🏈 Démarrage de FootProg en mode développement local
echo =================================================
echo.

echo 📦 Vérification des dépendances...
if not exist node_modules (
    echo 📥 Installation des dépendances...
    npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
) else (
    echo ✅ Dépendances déjà installées
)

echo.
echo 🗄️ Vérification de la base de données...
if exist footprog.sqlite (
    echo ✅ Base de données SQLite trouvée
) else (
    echo ⚠️ Base de données non trouvée, elle sera créée automatiquement
)

echo.
echo ⚙️ Configuration de l'environnement...
if not exist .env (
    echo 📝 Création du fichier .env...
    (
        echo NODE_ENV=development
        echo PORT=5000
        echo USE_SQLITE=true
        echo SQLITE_DB_PATH=./footprog.sqlite
        echo DATABASE_URL=sqlite:./footprog.sqlite
        echo SESSION_SECRET=dev-secret-key-for-local-development
        echo NO_DB=false
    ) > .env
    echo ✅ Fichier .env créé
) else (
    echo ✅ Fichier .env existant
)

echo.
echo 🚀 Démarrage de l'application...
echo.
echo 🌐 L'application sera accessible sur:
echo    http://localhost:5000
echo.
echo 📋 Commandes utiles pendant le développement:
echo    Ctrl+C        : Arrêter l'application
echo    F5            : Recharger la page
echo    Ctrl+Shift+I  : Outils de développement
echo.
echo 🔄 Démarrage en cours...
echo.

npx cross-env NODE_ENV=development USE_SQLITE=true tsx server/index.ts

if errorlevel 1 (
    echo.
    echo ❌ Erreur lors du démarrage
    echo 💡 Solutions possibles:
    echo    1. Vérifiez que le port 5000 n'est pas déjà utilisé
    echo    2. Essayez: taskkill /F /IM node.exe
    echo    3. Supprimez node_modules et relancez
    pause
    exit /b 1
)
