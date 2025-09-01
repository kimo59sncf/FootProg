# Script de diagnostic VPS simplifié
param([string]$VPS_IP = "148.169.40.11")

Write-Host "Diagnostic de connexion VPS" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

Write-Host "IP du VPS : $VPS_IP"
Write-Host "Date/Heure : $(Get-Date)"
Write-Host ""

# Test de ping
Write-Host "Test de ping..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $VPS_IP -Count 4 -Quiet
if ($pingResult) {
    Write-Host "✅ Ping réussi" -ForegroundColor Green
} else {
    Write-Host "❌ Ping échoué - Le serveur ne répond pas" -ForegroundColor Red
}
Write-Host ""

# Test des ports
Write-Host "Test des ports..." -ForegroundColor Yellow
$ports = @(22, 80, 443)
foreach ($port in $ports) {
    $result = Test-NetConnection -ComputerName $VPS_IP -Port $port -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "Port $port : ✅ OUVERT" -ForegroundColor Green
    } else {
        Write-Host "Port $port : ❌ FERMÉ" -ForegroundColor Red
    }
}
Write-Host ""

# Suggestions
Write-Host "Suggestions de dépannage :" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if (-not $pingResult) {
    Write-Host "Le serveur ne répond pas. Vérifiez :" -ForegroundColor Yellow
    Write-Host "• Panel de votre hébergeur VPS" -ForegroundColor White
    Write-Host "• État du serveur (Online/Offline)" -ForegroundColor White
    Write-Host "• Redémarrage du VPS" -ForegroundColor White
    Write-Host "• Configuration firewall" -ForegroundColor White
}

$sshTest = Test-NetConnection -ComputerName $VPS_IP -Port 22 -WarningAction SilentlyContinue
if (-not $sshTest.TcpTestSucceeded) {
    Write-Host "SSH inaccessible. Solutions :" -ForegroundColor Yellow
    Write-Host "• Vérifiez que le service SSH est démarré" -ForegroundColor White
    Write-Host "• Testez un autre port SSH si configuré" -ForegroundColor White
    Write-Host "• Utilisez la console web de votre hébergeur" -ForegroundColor White
}

Write-Host ""
Write-Host "Résumé :" -ForegroundColor Cyan
Write-Host "IP : $VPS_IP" -ForegroundColor White
$pingStatus = if ($pingResult) {"✅"} else {"❌"}
Write-Host "Ping : $pingStatus" -ForegroundColor White
$sshStatus = if ($sshTest.TcpTestSucceeded) {"✅"} else {"❌"}
Write-Host "SSH : $sshStatus" -ForegroundColor White
