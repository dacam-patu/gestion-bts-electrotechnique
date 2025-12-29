# Script PowerShell pour démarrer l'application
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DEMARRAGE DE L'APPLICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Vérification des dossiers..." -ForegroundColor Yellow
if (-not (Test-Path "server")) {
    Write-Host "ERREUR: Dossier 'server' non trouvé !" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}
if (-not (Test-Path "client")) {
    Write-Host "ERREUR: Dossier 'client' non trouvé !" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}
Write-Host "OK - Dossiers vérifiés" -ForegroundColor Green

Write-Host ""
Write-Host "[2/3] Démarrage du serveur backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host 'Démarrage du serveur backend...' -ForegroundColor Green; node server.js"

Write-Host "Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[3/3] Démarrage du client frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; Write-Host 'Démarrage du client frontend...' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    APPLICATION DEMARRÉE AVEC SUCCÈS !" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Server: http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend Client: http://localhost:3005" -ForegroundColor Green
Write-Host ""
Write-Host "Les fenêtres de terminal vont s'ouvrir automatiquement." -ForegroundColor Yellow
Write-Host "Pour arrêter l'application, fermez les fenêtres de terminal." -ForegroundColor Yellow
Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer..."
