# Script pour démarrer l'application en mode développement

Write-Host "🚀 Démarrage de l'application U52 BTS Électrotechnique..." -ForegroundColor Cyan

# Vérifier si Node.js est installé
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé !" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js version: $(node --version)" -ForegroundColor Green

# Fonction pour démarrer le serveur backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location server
    Write-Host "🔧 Démarrage du serveur backend..." -ForegroundColor Yellow
    node server.js
}

Write-Host "✅ Serveur backend démarré (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Attendre 3 secondes pour que le backend démarre
Start-Sleep -Seconds 3

# Fonction pour démarrer le serveur frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location client
    Write-Host "🎨 Démarrage du serveur frontend..." -ForegroundColor Yellow
    npm start
}

Write-Host "✅ Serveur frontend démarré (Job ID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Application démarrée avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host "🎨 Frontend: http://localhost:3005" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour arrêter l'application, appuyez sur Ctrl+C" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Afficher les logs en temps réel
Write-Host "📋 Logs du backend:" -ForegroundColor Magenta
Receive-Job -Job $backendJob -Wait -AutoRemoveJob -WriteEvents

Write-Host "📋 Logs du frontend:" -ForegroundColor Magenta
Receive-Job -Job $frontendJob -Wait -AutoRemoveJob -WriteEvents

# Nettoyer les jobs à la fin
Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue

