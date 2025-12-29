# 🌐 Configuration spécifique pour serveur LWS

## 📋 Configuration du serveur LWS

### 1. Configuration du domaine
- **Nom de domaine** : `votre-domaine.com`
- **Sous-domaine** : `app.votre-domaine.com` (recommandé)
- **SSL** : Activer HTTPS (certificat Let's Encrypt recommandé)

### 2. Configuration Node.js sur LWS

#### A. Version Node.js
```bash
# Vérifier la version installée
node --version
npm --version

# Si nécessaire, installer Node.js 18+ via LWS
```

#### B. Configuration du point d'entrée
- **Fichier principal** : `start-production.js`
- **Port** : 3001 (ou port configuré dans LWS)
- **Mode** : Production

### 3. Configuration de la base de données

#### Option A : SQLite (recommandé)
```javascript
// Dans config.production.js
DATABASE_PATH: './database/database.sqlite'
```

#### Option B : MySQL (si disponible)
```javascript
// Configuration MySQL
const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'votre_utilisateur_mysql',
  password: 'votre_mot_de_passe_mysql',
  database: 'u52_evaluations',
  port: 3306
};
```

### 4. Variables d'environnement LWS

Créer un fichier `.env` sur le serveur :
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=votre-secret-jwt-tres-securise
CORS_ORIGIN=https://votre-domaine.com
DATABASE_PATH=./database/database.sqlite
```

### 5. Configuration des permissions

```bash
# Permissions pour les dossiers
chmod 755 logs/
chmod 755 uploads/
chmod 755 backups/
chmod 644 database/database.sqlite
```

### 6. Configuration du reverse proxy (si nécessaire)

#### Nginx (si utilisé par LWS)
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Configuration SSL/HTTPS

#### Let's Encrypt (recommandé)
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com
```

### 8. Monitoring et logs

#### A. Logs d'application
```javascript
// Les logs sont automatiquement créés dans le dossier logs/
// - app.log : Logs généraux
// - error.log : Erreurs uniquement
```

#### B. Monitoring des performances
```bash
# Vérifier l'utilisation des ressources
htop
df -h
free -m
```

### 9. Sauvegarde automatique

#### Script de sauvegarde quotidienne
```bash
#!/bin/bash
# backup-daily.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/path/to/backups"
APP_DIR="/path/to/your/app"

# Sauvegarder la base de données
cp $APP_DIR/database/database.sqlite $BACKUP_DIR/database-$DATE.sqlite

# Sauvegarder les uploads
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz $APP_DIR/uploads/

# Nettoyer les anciennes sauvegardes (garder 30 jours)
find $BACKUP_DIR -name "*.sqlite" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Sauvegarde terminée: $DATE"
```

#### Cron job pour sauvegarde automatique
```bash
# Ajouter à crontab
0 2 * * * /path/to/backup-daily.sh
```

### 10. Dépannage LWS

#### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :3001
   
   # Tuer le processus
   kill -9 PID
   ```

2. **Permissions insuffisantes**
   ```bash
   # Corriger les permissions
   chown -R www-data:www-data /path/to/your/app
   chmod -R 755 /path/to/your/app
   ```

3. **Base de données verrouillée**
   ```bash
   # Vérifier les processus SQLite
   lsof database.sqlite
   
   # Redémarrer l'application
   pm2 restart u52-app
   ```

4. **Erreur CORS**
   ```javascript
   // Vérifier la configuration CORS dans config.production.js
   CORS_ORIGIN: 'https://votre-domaine.com'
   ```

### 11. Commandes utiles LWS

```bash
# Démarrer l'application
npm start

# Vérifier les logs
tail -f logs/app.log

# Redémarrer l'application
pm2 restart u52-app

# Vérifier le statut
pm2 status

# Arrêter l'application
pm2 stop u52-app

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -m

# Vérifier les processus Node.js
ps aux | grep node
```

### 12. Sécurité LWS

#### A. Firewall
```bash
# Ouvrir uniquement les ports nécessaires
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

#### B. Mise à jour régulière
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade

# Mettre à jour Node.js
nvm install node --latest-npm
```

### 13. Performance LWS

#### A. Optimisation Node.js
```javascript
// Dans server.js
app.use(compression());
app.use(helmet());
```

#### B. Cache des fichiers statiques
```javascript
// Cache des assets
app.use('/static', express.static('public/static', {
  maxAge: '1y'
}));
```

### 14. Support et maintenance

#### A. Logs de surveillance
- **Application** : `logs/app.log`
- **Erreurs** : `logs/error.log`
- **Système** : `/var/log/syslog`

#### B. Alertes automatiques
```bash
# Script de vérification de santé
#!/bin/bash
if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "Application down!" | mail -s "Alert U52" admin@votre-domaine.com
fi
```

## 🎯 Checklist de déploiement

- [ ] Fichiers uploadés sur le serveur
- [ ] `npm install` exécuté
- [ ] Base de données configurée
- [ ] Variables d'environnement définies
- [ ] SSL/HTTPS configuré
- [ ] CORS configuré correctement
- [ ] Permissions des fichiers correctes
- [ ] Application accessible via le domaine
- [ ] Tests de connexion réussis
- [ ] Sauvegarde automatique configurée
- [ ] Monitoring en place
