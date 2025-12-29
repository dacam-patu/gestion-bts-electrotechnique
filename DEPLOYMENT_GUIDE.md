# 🚀 Guide de déploiement sur serveur LWS

## 📋 Prérequis
- Serveur LWS configuré et accessible
- Accès FTP/SFTP ou interface de gestion de fichiers
- Base de données SQLite ou MySQL/PostgreSQL

## 🔧 Étapes de déploiement

### 1. Préparation des fichiers

#### A. Frontend (React)
Les fichiers de production sont déjà créés dans le dossier `client/build/`

#### B. Backend (Node.js)
Créer un package de production pour le serveur :

```bash
# Dans le dossier server/
npm install --production
```

### 2. Structure des fichiers à déployer

```
votre-serveur-lws/
├── public/                    # Dossier web public
│   ├── index.html            # Fichier principal React
│   ├── static/               # Assets statiques (CSS, JS, images)
│   │   ├── css/
│   │   ├── js/
│   │   └── media/
│   └── manifest.json
├── server/                   # Backend Node.js
│   ├── server.js
│   ├── package.json
│   ├── node_modules/
│   └── database/
│       └── database.sqlite
└── config.js                 # Configuration de production
```

### 3. Configuration de production

#### A. Créer config.js pour la production
```javascript
module.exports = {
  // Configuration serveur
  PORT: process.env.PORT || 3001,
  NODE_ENV: 'production',
  
  // Base de données
  DATABASE_PATH: './database/database.sqlite',
  
  // CORS pour production
  CORS_ORIGIN: 'https://votre-domaine.com',
  
  // JWT
  JWT_SECRET: 'votre-secret-jwt-production',
  
  // Uploads
  UPLOAD_PATH: './uploads'
};
```

#### B. Modifier server.js pour la production
```javascript
// Ajouter au début du fichier
const config = require('./config');

// Modifier la configuration CORS
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

// Servir les fichiers statiques React
app.use(express.static(path.join(__dirname, '../public')));

// Route catch-all pour React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
```

### 4. Déploiement sur LWS

#### A. Upload des fichiers
1. **Frontend** : Copier tout le contenu de `client/build/` vers le dossier `public/` de votre serveur
2. **Backend** : Copier le dossier `server/` vers votre serveur
3. **Base de données** : Copier le fichier `database.sqlite` ou créer une nouvelle base

#### B. Configuration du serveur LWS
1. **Point d'entrée** : Configurer `server/server.js` comme point d'entrée
2. **Port** : Utiliser le port configuré (par défaut 3001)
3. **Variables d'environnement** : Définir `NODE_ENV=production`

### 5. Configuration de la base de données

#### Option A : SQLite (recommandé pour débuter)
```bash
# Copier le fichier database.sqlite existant
# Ou créer une nouvelle base vide
```

#### Option B : MySQL/PostgreSQL (pour production avancée)
```javascript
// Modifier la configuration dans server.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'votre-utilisateur',
  password: 'votre-mot-de-passe',
  database: 'u52_evaluations'
});
```

### 6. Scripts de démarrage

#### A. Créer start-production.js
```javascript
const { spawn } = require('child_process');
const path = require('path');

// Démarrer le serveur
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

server.on('close', (code) => {
  console.log(`Serveur fermé avec le code ${code}`);
});
```

#### B. Package.json pour la production
```json
{
  "name": "u52-production",
  "version": "1.0.0",
  "scripts": {
    "start": "node start-production.js",
    "dev": "node server/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1"
  }
}
```

### 7. Sécurité en production

#### A. Variables d'environnement
```bash
# Créer un fichier .env
NODE_ENV=production
PORT=3001
JWT_SECRET=votre-secret-tres-securise
DATABASE_URL=./database/database.sqlite
```

#### B. Configuration HTTPS (recommandé)
```javascript
// Dans server.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

### 8. Test du déploiement

1. **Vérifier l'accès** : `https://votre-domaine.com`
2. **Tester l'API** : `https://votre-domaine.com/api/students`
3. **Vérifier la base de données** : Créer un utilisateur de test
4. **Tester l'authentification** : Se connecter avec admin/admin123

### 9. Maintenance

#### A. Sauvegarde régulière
```bash
# Script de sauvegarde
cp database/database.sqlite backups/database-$(date +%Y%m%d).sqlite
```

#### B. Logs de production
```javascript
// Ajouter dans server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## 🔍 Dépannage

### Problèmes courants

1. **Erreur CORS** : Vérifier la configuration CORS_ORIGIN
2. **Base de données** : Vérifier les permissions du fichier SQLite
3. **Port occupé** : Changer le port dans la configuration
4. **Fichiers statiques** : Vérifier le chemin vers le dossier public

### Commandes utiles

```bash
# Vérifier les processus Node.js
ps aux | grep node

# Tuer un processus
kill -9 PID

# Vérifier les logs
tail -f logs/combined.log

# Redémarrer le serveur
pm2 restart u52-app
```

## 📞 Support

En cas de problème, vérifiez :
1. Les logs du serveur
2. La configuration de la base de données
3. Les permissions des fichiers
4. La configuration CORS
