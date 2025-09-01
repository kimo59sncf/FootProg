# Script de déploiement PowerShell pour FootProg
# Usage: .\deploy.ps1 -Environment production

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("production", "staging")]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerHost = "your_server.com",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerUser = "your_user"
)

$ErrorActionPreference = "Stop"
$AppName = "footprog"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "🚀 Déploiement de FootProg en mode: $Environment" -ForegroundColor Green

try {
    # 1. Build de l'application
    Write-Host "📦 Construction de l'application..." -ForegroundColor Yellow
    npm install
    npm run build

    # 2. Tests
    Write-Host "🧪 Exécution des tests..." -ForegroundColor Yellow
    try {
        npm test
    } catch {
        $confirm = Read-Host "⚠️ Tests échoués, continuer? (y/N)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            exit 1
        }
    }

    # 3. Création de l'archive
    Write-Host "📁 Création de l'archive..." -ForegroundColor Yellow
    $ArchiveName = "deploy-$Timestamp.zip"
    
    $ExcludePatterns = @(
        "node_modules",
        ".git",
        "*.log",
        ".env.local",
        "deploy-*.zip"
    )
    
    Compress-Archive -Path "." -DestinationPath $ArchiveName -Force

    # 4. Upload vers le serveur (nécessite SSH configuré)
    Write-Host "📤 Upload vers le serveur..." -ForegroundColor Yellow
    scp $ArchiveName "$ServerUser@$ServerHost:/tmp/"

    # 5. Déploiement sur le serveur
    Write-Host "🔄 Déploiement sur le serveur..." -ForegroundColor Yellow
    $DeployScript = @"
    cd /tmp
    sudo rm -rf /var/www/$AppName.new
    sudo mkdir -p /var/www/$AppName.new
    sudo unzip -q $ArchiveName -d /var/www/$AppName.new
    cd /var/www/$AppName.new
    sudo npm ci --production
    sudo cp .env.$Environment .env
    sudo systemctl stop $AppName || true
    sudo mv /var/www/$AppName /var/www/$AppName.backup || true
    sudo mv /var/www/$AppName.new /var/www/$AppName
    sudo systemctl start $AppName
    sudo systemctl reload nginx
"@

    ssh "$ServerUser@$ServerHost" $DeployScript

    # 6. Vérification
    Write-Host "✅ Vérification du déploiement..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    try {
        $Response = Invoke-WebRequest -Uri "http://$ServerHost/health" -UseBasicParsing
        if ($Response.StatusCode -eq 200) {
            Write-Host "🎉 Déploiement réussi!" -ForegroundColor Green
        } else {
            throw "Health check failed"
        }
    } catch {
        Write-Host "❌ Échec du déploiement" -ForegroundColor Red
        throw
    }

} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Nettoyage
    if (Test-Path "deploy-*.zip") {
        Remove-Item "deploy-*.zip" -Force
    }
}

Write-Host "✅ Déploiement terminé avec succès!" -ForegroundColor Green
