@echo off
echo 🚀 Démarrage des serveurs...

echo 📡 Démarrage du serveur backend...
start "Backend Server" cmd /k "cd /d C:\Users\dacam\Documents\planning epreuve chantier\server && npm start"

timeout /t 3 /nobreak > nul

echo 🌐 Démarrage du serveur frontend...
start "Frontend Server" cmd /k "cd /d C:\Users\dacam\Documents\planning epreuve chantier\client && npm start"

echo ✅ Serveurs démarrés !
echo 📍 Backend: http://localhost:3001
echo 📍 Frontend: http://localhost:3000
echo 📍 Page groupes: http://localhost:3000/groups

pause

