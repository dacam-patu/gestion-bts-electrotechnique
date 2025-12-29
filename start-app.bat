@echo off
echo 🚀 DÉMARRAGE DE L'APPLICATION - GESTION DES GROUPES
echo =====================================================

echo.
echo 📡 Démarrage du serveur backend (port 3001)...
start "Backend Server" cmd /k "cd /d C:\Users\dacam\Documents\planning epreuve chantier\server && npm start"

echo.
echo ⏳ Attente du démarrage du backend...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Démarrage du serveur frontend (port 3000)...
start "Frontend Server" cmd /k "cd /d C:\Users\dacam\Documents\planning epreuve chantier\client && npm start"

echo.
echo ✅ APPLICATION DÉMARRÉE !
echo.
echo 📍 URLs d'accès :
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo    Page Groupes: http://localhost:3000/groups
echo.
echo 🎯 INSTRUCTIONS :
echo    1. Ouvrez http://localhost:3000/groups dans votre navigateur
echo    2. Vous devriez voir les étudiants dans les groupes
echo    3. Testez l'affectation d'étudiants
echo.
echo ⚠️  Si les étudiants ne s'affichent pas :
echo    - Cliquez sur "🧪 Test API" pour vérifier l'API
echo    - Cliquez sur "🚀 Diagnostic Radical" pour vider le cache
echo.
pause

