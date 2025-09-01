# Script de diagnostic VPS
# Usage: .\diagnose-vps.ps1

param(
    [string]$VPS_IP = "148.169.40.11"
)

Write-Host "🔍 Diagnostic de connexion VPS" -ForegroundColor Green
Write-Host "==============================`n" -ForegroundColor Green

Write-Host "🌐 Test de base..." -ForegroundColor Yellow
Write-Host "IP du VPS : $VPS_IP"
Write-Host "Date/Heure : $(Get-Date)"
Write-Host ""

# Test de résolution DNS (si c'est un nom de domaine)
if ($VPS_IP -match '^[a-zA-Z]') {
    Write-Host "🔍 Résolution DNS..." -ForegroundColor Yellow
    try {
        $resolved = Resolve-DnsName $VPS_IP -ErrorAction Stop
        Write-Host "✅ DNS résolu : $($resolved.IPAddress)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur de résolution DNS : $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test de ping
Write-Host "🏓 Test de ping..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $VPS_IP -Count 4 -Quiet
if ($pingResult) {
    Write-Host "✅ Ping réussi" -ForegroundColor Green
} else {
    Write-Host "❌ Ping échoué - Le serveur ne répond pas" -ForegroundColor Red
}
Write-Host ""

# Test des ports communs
$ports = @(22, 80, 443, 21, 25, 53)
Write-Host "🔌 Test des ports communs..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $result = Test-NetConnection -ComputerName $VPS_IP -Port $port -WarningAction SilentlyContinue
    $status = if ($result.TcpTestSucceeded) { "✅ OUVERT" } else { "❌ FERMÉ" }
    $color = if ($result.TcpTestSucceeded) { "Green" } else { "Red" }
    Write-Host "Port $port : $status" -ForegroundColor $color
}
Write-Host ""

# Traceroute
Write-Host "🗺️ Traceroute (premiers 10 sauts)..." -ForegroundColor Yellow
try {
    $tracert = Test-NetConnection -ComputerName $VPS_IP -TraceRoute -Hops 10 -WarningAction SilentlyContinue
    if ($tracert.TraceRoute) {
        foreach ($hop in $tracert.TraceRoute) {
            Write-Host "  → $hop" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Impossible d'effectuer le traceroute" -ForegroundColor Red
}
Write-Host ""

# Suggestions de dépannage
Write-Host "🛠️ Suggestions de dépannage :" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

if (-not $pingResult) {
    Write-Host "🔥 Le serveur ne répond pas au ping. Causes possibles :" -ForegroundColor Yellow
    Write-Host "   • Serveur éteint ou en panne" -ForegroundColor White
    Write-Host "   • Firewall bloque ICMP (ping)" -ForegroundColor White
    Write-Host "   • Adresse IP incorrecte" -ForegroundColor White
    Write-Host "   • Problème réseau chez l'hébergeur" -ForegroundColor White
}

$sshTest = Test-NetConnection -ComputerName $VPS_IP -Port 22 -WarningAction SilentlyContinue
if (-not $sshTest.TcpTestSucceeded) {
    Write-Host "🔐 SSH (port 22) inaccessible. Solutions :" -ForegroundColor Yellow
    Write-Host "   • Vérifiez le panel de votre hébergeur" -ForegroundColor White
    Write-Host "   • Redémarrez le VPS depuis le panel" -ForegroundColor White
    Write-Host "   • Vérifiez si SSH utilise un autre port" -ForegroundColor White
    Write-Host "   • Contactez le support de l'hébergeur" -ForegroundColor White
}

Write-Host "`n📞 Actions recommandées :" -ForegroundColor Cyan
Write-Host "1. Connectez-vous au panel de votre hébergeur VPS" -ForegroundColor White
Write-Host "2. Vérifiez l'état du serveur (Online/Offline)" -ForegroundColor White
Write-Host "3. Redémarrez le VPS si nécessaire" -ForegroundColor White
Write-Host "4. Vérifiez les logs de démarrage" -ForegroundColor White
Write-Host "5. Testez la console web si disponible" -ForegroundColor White

Write-Host "`n🔧 Commandes de test alternatives :" -ForegroundColor Cyan
Write-Host "ssh -p 2222 root@$VPS_IP  # Test port SSH alternatif" -ForegroundColor Gray
Write-Host "ssh -o ConnectTimeout=10 root@$VPS_IP  # Timeout court" -ForegroundColor Gray
Write-Host "ssh -v root@$VPS_IP  # Mode verbose pour debug" -ForegroundColor Gray

Write-Host "`n📋 Informations pour le support :" -ForegroundColor Cyan
Write-Host "IP du VPS : $VPS_IP" -ForegroundColor White
Write-Host "Ping : $(if ($pingResult) {'✅'} else {'❌'})" -ForegroundColor White
Write-Host "SSH (22) : $(if ($sshTest.TcpTestSucceeded) {'✅'} else {'❌'})" -ForegroundColor White
Write-Host "Date du test : $(Get-Date)" -ForegroundColor White
