# Script de création du dossier deploy pour LWS
# Auteur: Assistant IA
# Date: $(Get-Date)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Création du dossier deploy pour LWS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "client") -or -not (Test-Path "server")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le dossier 'planning epreuve chantier'" -ForegroundColor Red
    exit 1
}

# Créer le dossier deploy
Write-Host "📁 Création du dossier deploy..." -ForegroundColor Yellow
if (Test-Path "deploy") {
    Write-Host "⚠️  Le dossier deploy existe déjà. Suppression..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "deploy"
}
New-Item -ItemType Directory -Name "deploy" | Out-Null
Write-Host "✅ Dossier deploy créé" -ForegroundColor Green

# Vérifier que le build React existe
if (-not (Test-Path "client\build")) {
    Write-Host "❌ Erreur: Le dossier client\build n'existe pas" -ForegroundColor Red
    Write-Host "   Veuillez d'abord executer: cd client puis npm run build" -ForegroundColor Red
    exit 1
}

# Copier le build React
Write-Host "📦 Copie du build React..." -ForegroundColor Yellow
Copy-Item -Path "client\build" -Destination "deploy\build" -Recurse
Write-Host "✅ Build React copié vers deploy\build" -ForegroundColor Green

# Copier le serveur
Write-Host "🖥️  Copie du serveur..." -ForegroundColor Yellow
Copy-Item -Path "server" -Destination "deploy\server" -Recurse
Write-Host "✅ Serveur copié vers deploy\server" -ForegroundColor Green

# Créer le package.json de production
Write-Host "📄 Création du package.json de production..." -ForegroundColor Yellow
$packageJson = @"
{
  "name": "u52-planning-production",
  "version": "1.0.0",
  "description": "Application U52 BTS Électrotechnique - Version Production",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "path": "^0.12.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
"@
$packageJson | Out-File -FilePath "deploy\package.json" -Encoding UTF8
Write-Host "✅ package.json de production créé" -ForegroundColor Green

# Créer le serveur de production
Write-Host "🚀 Création du serveur de production..." -ForegroundColor Yellow
$serverJs = @"
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Configuration de la base de données
const DB_PATH = process.env.DB_PATH || './server/database/app.db';
const db = new sqlite3.Database(DB_PATH);

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_123456789';

// Routes API
app.use('/api/auth', require('./server/src/routes/auth'));
app.use('/api/users', require('./server/src/routes/users'));
app.use('/api/students', require('./server/src/routes/students'));
app.use('/api/projects', require('./server/src/routes/projects'));
app.use('/api/planning', require('./server/src/routes/planning'));
app.use('/api/evaluations', require('./server/src/routes/evaluations'));
app.use('/api/documents', require('./server/src/routes/documents'));
app.use('/api/roles', require('./server/src/routes/roles'));

// Route pour servir l'application React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, HOST, () => {
    console.log('🚀 Serveur démarré sur le port', PORT);
    console.log('📊 Application U52 BTS Électrotechnique');
    console.log('🔧 Mode production - Serveur complet');
    console.log('🌐 Accessible sur:', `http://${HOST}:${PORT}`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
    console.error('❌ Erreur non gérée:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
    process.exit(1);
});
"@
$serverJs | Out-File -FilePath "deploy\server.js" -Encoding UTF8
Write-Host "✅ Serveur de production créé" -ForegroundColor Green

# Créer le fichier .env.example
Write-Host "⚙️  Création du fichier .env.example..." -ForegroundColor Yellow
$envExample = @"
# Configuration de production
NODE_ENV=production
PORT=3001

# Base de données
DB_PATH=./server/database/app.db

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise_123456789

# Configuration serveur
HOST=0.0.0.0
"@
$envExample | Out-File -FilePath "deploy\.env.example" -Encoding UTF8
Write-Host "✅ Fichier .env.example créé" -ForegroundColor Green

# Créer le README de déploiement
Write-Host "📖 Création du README de déploiement..." -ForegroundColor Yellow
$readme = @"
# Deploiement sur LWS

## Instructions de deploiement

### 1. Upload des fichiers
- Uploadez tout le contenu du dossier deploy sur votre serveur LWS
- Placez les fichiers dans le dossier racine de votre hebergement

### 2. Configuration Node.js dans cPanel
1. Connectez-vous a votre cPanel LWS
2. Allez dans Node.js Manager
3. Creez une nouvelle application Node.js
4. Configurez les parametres suivants :
   - Node.js Version : 18.x ou plus recent
   - Application Mode : Production
   - Application Root : / (racine)
   - Application URL : / (racine)
   - Application Startup File : server.js

### 3. Variables d'environnement
Dans cPanel Node.js Manager, ajoutez ces variables :
- NODE_ENV = production
- PORT = 3001
- DB_PATH = ./server/database/app.db
- JWT_SECRET = votre_secret_jwt_tres_long_et_securise_123456789
- HOST = 0.0.0.0

### 4. Installation des dependances
Dans le terminal cPanel, executez :
npm install

### 5. Demarrage de l'application
Dans cPanel Node.js Manager, cliquez sur Start App

## Structure des fichiers
deploy/
- build/                 (Frontend React compile)
- server/               (Backend Node.js)
- package.json          (Dependances de production)
- server.js            (Point d'entree de production)
- .env.example         (Exemple de configuration)
- README_DEPLOYMENT.md (Ce fichier)

## Acces a l'application
Une fois deployee, votre application sera accessible via :
- URL principale : https://votre-domaine.com
- API : https://votre-domaine.com/api/

## Identifiants par defaut
- Utilisateur : admin
- Mot de passe : admin123

## Support
En cas de probleme, contactez le support LWS ou consultez les logs dans cPanel.
"@
$readme | Out-File -FilePath "deploy\README_DEPLOYMENT.md" -Encoding UTF8
Write-Host "✅ README de déploiement créé" -ForegroundColor Green

# Afficher le résumé
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "✅ Dossier deploy créé avec succès !" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📁 Contenu du dossier deploy :" -ForegroundColor Yellow
Get-ChildItem -Path "deploy" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\deploy\", "")
    if ($_.PSIsContainer) {
        Write-Host "   📁 $relativePath" -ForegroundColor Blue
    } else {
        Write-Host "   📄 $relativePath" -ForegroundColor White
    }
}

Write-Host "`n🚀 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Compressez le dossier 'deploy' en ZIP" -ForegroundColor White
Write-Host "2. Uploadez le ZIP sur votre serveur LWS" -ForegroundColor White
Write-Host "3. Extrayez les fichiers dans le dossier racine" -ForegroundColor White
Write-Host "4. Configurez Node.js dans cPanel LWS" -ForegroundColor White
Write-Host "5. Démarrez l'application" -ForegroundColor White

Write-Host "`n📖 Consultez deploy\README_DEPLOYMENT.md pour les instructions détaillées" -ForegroundColor Cyan
