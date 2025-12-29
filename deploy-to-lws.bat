@echo off
echo ========================================
echo   Deploiement U52 sur serveur LWS
echo ========================================
echo.

REM Vérifier que nous sommes dans le bon dossier
if not exist "client\build" (
    echo ❌ Erreur: Le dossier client\build n'existe pas
    echo    Veuillez d'abord executer: npm run build
    pause
    exit /b 1
)

if not exist "server\server.js" (
    echo ❌ Erreur: Le dossier server n'existe pas
    pause
    exit /b 1
)

echo 🔧 Preparation des fichiers de production...

REM Créer le dossier de déploiement
if exist "deploy" rmdir /s /q deploy
mkdir deploy

REM Copier les fichiers de production
echo 📁 Copie des fichiers frontend...
xcopy "client\build\*" "deploy\public\" /E /I /Y

echo 📁 Copie des fichiers backend...
xcopy "server\*" "deploy\server\" /E /I /Y

echo 📁 Copie des fichiers de configuration...
copy "config.production.js" "deploy\"
copy "start-production.js" "deploy\"
copy "package.production.json" "deploy\package.json"

REM Créer les dossiers nécessaires
mkdir "deploy\logs"
mkdir "deploy\uploads"
mkdir "deploy\backups"

echo.
echo ✅ Fichiers de production prepares dans le dossier 'deploy'
echo.
echo 📋 Prochaines etapes:
echo    1. Compresser le dossier 'deploy' en ZIP
echo    2. Uploader le ZIP sur votre serveur LWS
echo    3. Extraire les fichiers sur le serveur
echo    4. Executer: npm install
echo    5. Executer: npm start
echo.
echo 📁 Dossier de deploiement: %cd%\deploy
echo.
pause
