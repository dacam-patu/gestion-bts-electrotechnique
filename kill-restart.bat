@echo off
echo ========================================
echo Arret des processus et redemarrage
echo ========================================

echo Arret de tous les processus Node.js...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im nodemon.exe >nul 2>&1

echo Attente de 2 secondes...
timeout /t 2 >nul

echo Redemarrage de l'application...
call run.bat