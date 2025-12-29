@echo off
echo ========================================
echo   DEMARRAGE DU SERVEUR ET CLIENT
echo ========================================
echo.

echo [1/3] Demarrage du serveur backend...
start "Serveur Backend" cmd /k "cd server && npm start"
timeout /t 3 /nobreak > nul

echo [2/3] Attente du demarrage du serveur...
timeout /t 5 /nobreak > nul

echo [3/3] Demarrage du client frontend...
start "Client Frontend" cmd /k "cd client && npm start"

echo.
echo ========================================
echo   SERVEUR ET CLIENT DEMARRES
echo ========================================
echo.
echo Le serveur backend est accessible sur: http://localhost:3005
echo Le client frontend est accessible sur: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul