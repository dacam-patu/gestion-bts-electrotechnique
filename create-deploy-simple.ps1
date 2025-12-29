# Script simple pour creer le dossier deploy
Write-Host "Creation du dossier deploy..." -ForegroundColor Cyan

# Verifier que nous sommes dans le bon repertoire
if (-not (Test-Path "client") -or -not (Test-Path "server")) {
    Write-Host "Erreur: Ce script doit etre execute depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Creer le dossier deploy
if (Test-Path "deploy") {
    Write-Host "Suppression de l'ancien dossier deploy..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "deploy"
}
New-Item -ItemType Directory -Name "deploy" | Out-Null
Write-Host "Dossier deploy cree" -ForegroundColor Green

# Verifier que le build React existe
if (-not (Test-Path "client\build")) {
    Write-Host "Erreur: Le dossier client\build n'existe pas" -ForegroundColor Red
    Write-Host "Veuillez d'abord executer: cd client puis npm run build" -ForegroundColor Red
    exit 1
}

# Copier le build React
Write-Host "Copie du build React..." -ForegroundColor Yellow
Copy-Item -Path "client\build" -Destination "deploy\build" -Recurse
Write-Host "Build React copie vers deploy\build" -ForegroundColor Green

# Copier le serveur
Write-Host "Copie du serveur..." -ForegroundColor Yellow
Copy-Item -Path "server" -Destination "deploy\server" -Recurse
Write-Host "Serveur copie vers deploy\server" -ForegroundColor Green

# Creer le package.json de production
Write-Host "Creation du package.json de production..." -ForegroundColor Yellow
$packageJson = '{
  "name": "u52-planning-production",
  "version": "1.0.0",
  "description": "Application U52 BTS Electrotechnique - Version Production",
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
}'
$packageJson | Out-File -FilePath "deploy\package.json" -Encoding UTF8
Write-Host "package.json de production cree" -ForegroundColor Green

# Creer le serveur de production
Write-Host "Creation du serveur de production..." -ForegroundColor Yellow
$serverJs = 'const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

// Routes API
app.use("/api/auth", require("./server/src/routes/auth"));
app.use("/api/users", require("./server/src/routes/users"));
app.use("/api/students", require("./server/src/routes/students"));
app.use("/api/projects", require("./server/src/routes/projects"));
app.use("/api/planning", require("./server/src/routes/planning"));
app.use("/api/evaluations", require("./server/src/routes/evaluations"));
app.use("/api/documents", require("./server/src/routes/documents"));
app.use("/api/roles", require("./server/src/routes/roles"));

// Route pour servir l application React
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Demarrage du serveur
app.listen(PORT, HOST, () => {
    console.log("Serveur demarre sur le port", PORT);
    console.log("Application U52 BTS Electrotechnique");
    console.log("Mode production - Serveur complet");
    console.log("Accessible sur:", `http://${HOST}:${PORT}`);
});

// Gestion des erreurs
process.on("uncaughtException", (err) => {
    console.error("Erreur non geree:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Promesse rejetee non geree:", reason);
    process.exit(1);
});'
$serverJs | Out-File -FilePath "deploy\server.js" -Encoding UTF8
Write-Host "Serveur de production cree" -ForegroundColor Green

# Creer le fichier .env.example
Write-Host "Creation du fichier .env.example..." -ForegroundColor Yellow
$envExample = 'NODE_ENV=production
PORT=3001
DB_PATH=./server/database/app.db
JWT_SECRET=votre_secret_jwt_tres_long_et_securise_123456789
HOST=0.0.0.0'
$envExample | Out-File -FilePath "deploy\.env.example" -Encoding UTF8
Write-Host "Fichier .env.example cree" -ForegroundColor Green

# Afficher le resume
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Dossier deploy cree avec succes !" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Contenu du dossier deploy :" -ForegroundColor Yellow
Get-ChildItem -Path "deploy" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\deploy\", "")
    if ($_.PSIsContainer) {
        Write-Host "   Dossier: $relativePath" -ForegroundColor Blue
    } else {
        Write-Host "   Fichier: $relativePath" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "1. Compressez le dossier deploy en ZIP" -ForegroundColor White
Write-Host "2. Uploadez le ZIP sur votre serveur LWS" -ForegroundColor White
Write-Host "3. Extrayez les fichiers dans le dossier racine" -ForegroundColor White
Write-Host "4. Configurez Node.js dans cPanel LWS" -ForegroundColor White
Write-Host "5. Demarrez l application" -ForegroundColor White
