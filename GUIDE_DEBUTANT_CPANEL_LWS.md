# 🎓 Guide DÉBUTANT - Déployer sur LWS cPanel

## 📌 Ce guide est pour vous si :
- ✅ Vous avez un hébergement LWS avec cPanel
- ✅ Vous êtes débutant
- ✅ Vous voulez déployer cette application pas à pas

---

## 🎯 ÉTAPE 1 : Préparer les fichiers sur votre PC

### 1.1 Créer le package de déploiement

1. **Ouvrez PowerShell** dans le dossier de votre projet
   - Clic droit sur le dossier → "Ouvrir dans le terminal"

2. **Exécutez cette commande** :
   ```powershell
   .\deploy-to-lws.bat
   ```

3. **Résultat** : Un dossier `deploy` va être créé avec tous les fichiers nécessaires

### 1.2 Créer un fichier ZIP

1. **Localisez le dossier `deploy`** qui vient d'être créé
2. **Clic droit** sur le dossier `deploy`
3. **Sélectionnez** : "Compresser vers → deploy.zip"
4. **Vous avez maintenant** : `deploy.zip` (environ 50-100 Mo)

---

## 🌐 ÉTAPE 2 : Se connecter à cPanel LWS

### 2.1 Accéder à cPanel

1. **Allez sur** : `https://panel.lws.fr/` (ou le lien fourni par LWS)
2. **Connectez-vous** avec vos identifiants LWS
3. **Cherchez l'icône** "cPanel" et cliquez dessus

### 2.2 Interface cPanel

Une fois dans cPanel, vous verrez plusieurs catégories :
- **Fichiers** 📁
- **Bases de données** 🗄️
- **Domaines** 🌐
- **Logiciels** ⚙️
- etc.

---

## 📁 ÉTAPE 3 : Uploader les fichiers

### 3.1 Gestionnaire de fichiers

1. Dans cPanel, **cliquez sur** "Gestionnaire de fichiers" (dans la section "FICHIERS")
2. Vous verrez une arborescence à gauche avec :
   - `public_html/` ← **C'est ici qu'on va travailler**
   - `tmp/`
   - `logs/`
   - etc.

### 3.2 Créer un dossier pour l'application

1. **Cliquez sur** `public_html/` pour l'ouvrir
2. **Cliquez sur** le bouton "+ Dossier" (en haut)
3. **Nommez-le** : `u52-app`
4. **Cliquez sur** "Créer un nouveau dossier"

### 3.3 Uploader le fichier ZIP

1. **Ouvrez le dossier** `u52-app` que vous venez de créer
2. **Cliquez sur** le bouton "Téléverser" (Upload) en haut
3. **Cliquez sur** "Sélectionner un fichier"
4. **Choisissez** le fichier `deploy.zip` de votre PC
5. **Attendez** que l'upload se termine (barre de progression verte)
6. Une fois terminé, **fermez la fenêtre** d'upload

### 3.4 Extraire le fichier ZIP

1. Dans le gestionnaire de fichiers, vous devriez voir `deploy.zip`
2. **Clic droit** sur `deploy.zip`
3. **Sélectionnez** "Extraire"
4. **Vérifiez** le chemin : `/home/votre-user/public_html/u52-app/`
5. **Cliquez sur** "Extract File(s)"
6. **Attendez** que l'extraction se termine
7. **Vous pouvez supprimer** `deploy.zip` après extraction

### 3.5 Réorganiser les fichiers

Après extraction, vous devriez avoir :
```
u52-app/
  └── deploy/
      ├── public/
      ├── server/
      ├── package.json
      └── start-production.js
```

**On veut déplacer le contenu de `deploy/` directement dans `u52-app/`** :

1. **Ouvrez** le dossier `deploy/`
2. **Sélectionnez tout** (Ctrl+A ou bouton "Tout sélectionner")
3. **Cliquez sur** "Déplacer" en haut
4. **Entrez le chemin** : `/home/votre-user/public_html/u52-app/`
5. **Cliquez sur** "Move File(s)"
6. **Supprimez** le dossier vide `deploy/`

Maintenant vous avez :
```
u52-app/
  ├── public/
  ├── server/
  ├── logs/
  ├── uploads/
  ├── backups/
  ├── package.json
  ├── start-production.js
  └── config.production.js
```

---

## ⚙️ ÉTAPE 4 : Configuration Node.js dans cPanel

### 4.1 Activer Node.js

1. **Retournez** à la page d'accueil de cPanel
2. **Cherchez** "Setup Node.js App" ou "Application Node.js"
   - C'est dans la section "LOGICIELS" ou "SOFTWARE"
3. **Cliquez dessus**

### 4.2 Créer une application Node.js

1. **Cliquez sur** "Create Application"
2. **Remplissez le formulaire** :

   | Champ | Valeur |
   |-------|--------|
   | **Node.js version** | Sélectionnez la version la plus récente (18.x ou 20.x) |
   | **Application mode** | `Production` |
   | **Application root** | `u52-app` |
   | **Application URL** | `u52-app` ou laissez vide |
   | **Application startup file** | `start-production.js` |
   | **Passenger log file** | Laissez par défaut |

3. **Cliquez sur** "CREATE"

### 4.3 Configurer les variables d'environnement

Dans la même page, descendez jusqu'à "Environment Variables" :

1. **Cliquez sur** "Add Variable"
2. **Ajoutez ces variables** une par une :

   | Variable | Valeur |
   |----------|--------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` (ou le port donné par cPanel) |
   | `JWT_SECRET` | `VotreSecretTresSécurisé123!` |
   | `CORS_ORIGIN` | `c` |

   ⚠️ **Important** : 
   - Remplacez `votre-domaine.fr` par votre vrai domaine
   - Créez un JWT_SECRET unique et complexe

3. **Cliquez sur** "Save" après chaque variable

### 4.4 Installer les dépendances

1. Dans la page "Setup Node.js App", cherchez la section "Detected configuration files"
2. Vous devriez voir `package.json`
3. **Cliquez sur** le bouton "Run NPM Install"
4. **Attendez** que l'installation se termine (cela peut prendre 2-5 minutes)
5. Vous verrez un message de succès en vert

---

## 🌐 ÉTAPE 5 : Configurer le domaine

### 5.1 Option A : Sous-domaine (recommandé pour tester)

1. Dans cPanel, allez dans **"Sous-domaines"** (section DOMAINES)
2. **Créez un sous-domaine** :
   - Sous-domaine : `app` ou `u52`
   - Domaine : Sélectionnez votre domaine principal
   - Document root : `/home/votre-user/public_html/u52-app/public`
3. **Cliquez sur** "Créer"

Votre application sera accessible à : `https://app.votre-domaine.fr`

### 5.2 Option B : Domaine principal

Si vous voulez utiliser votre domaine principal :

1. Dans cPanel, allez dans **"Domaines"**
2. **Modifiez** le domaine principal
3. **Changez** le "Document root" vers : `/home/votre-user/public_html/u52-app/public`
4. **Sauvegardez**

---

## 🔒 ÉTAPE 6 : Activer HTTPS (SSL)

### 6.1 Certificat SSL gratuit avec Let's Encrypt

1. Dans cPanel, cherchez **"SSL/TLS Status"** ou **"Let's Encrypt™ SSL"**
2. **Sélectionnez** votre domaine ou sous-domaine
3. **Cliquez sur** "Run AutoSSL" ou "Install"
4. **Attendez** quelques secondes
5. Vous verrez un message "SSL is active"

✅ Votre site est maintenant en HTTPS !

---

## 🚀 ÉTAPE 7 : Démarrer l'application

### 7.1 Démarrer via cPanel

1. **Retournez** dans "Setup Node.js App"
2. **Cliquez sur** votre application `u52-app`
3. **Vérifiez** que le statut est "Running"
4. Si ce n'est pas le cas, **cliquez sur** "Restart"

### 7.2 Vérifier que ça fonctionne

1. **Ouvrez votre navigateur**
2. **Allez sur** : `https://votre-domaine.fr/u52-app` (ou votre URL)
3. **Vous devriez voir** : La page de connexion de l'application ! 🎉

---

## 🔑 ÉTAPE 8 : Première connexion

### 8.1 Connexion administrateur

1. Sur la page de connexion, utilisez :
   - **Nom d'utilisateur** : `admin`
   - **Mot de passe** : `admin123`

2. **IMPORTANT - Changez ce mot de passe immédiatement** :
   - Allez dans "Utilisateurs"
   - Modifiez le mot de passe admin
   - Utilisez un mot de passe FORT

---

## 🛠️ ÉTAPE 9 : Configuration finale

### 9.1 Fichier de configuration

Si vous devez modifier la configuration :

1. Dans le gestionnaire de fichiers, allez dans `u52-app/`
2. **Éditez** le fichier `config.production.js`
3. **Modifiez** les valeurs si nécessaire
4. **Sauvegardez**
5. **Redémarrez** l'application Node.js dans cPanel

### 9.2 Vérifier les permissions

1. Dans le gestionnaire de fichiers
2. **Sélectionnez** les dossiers suivants :
   - `logs/`
   - `uploads/`
   - `backups/`
   - `server/database/`

3. **Clic droit** → "Change Permissions"
4. **Définissez** : `755` pour les dossiers
5. Pour le fichier database : `644`

---

## 📊 ÉTAPE 10 : Vérifications et tests

### 10.1 Tests à effectuer

✅ **Test 1 - Page d'accueil**
- URL : `https://votre-domaine.fr`
- Résultat attendu : Page de connexion s'affiche

✅ **Test 2 - Connexion**
- Connectez-vous avec `admin` / `admin123`
- Résultat attendu : Tableau de bord s'affiche

✅ **Test 3 - API**
- Allez dans la console du navigateur (F12)
- Vérifiez qu'il n'y a pas d'erreurs CORS (rouges)

✅ **Test 4 - Fonctionnalités**
- Testez la création d'un étudiant
- Testez la création d'une évaluation
- Testez l'impression d'une grille

### 10.2 Consulter les logs

Si quelque chose ne fonctionne pas :

1. Dans cPanel, allez dans "Setup Node.js App"
2. Cliquez sur votre application
3. Descendez jusqu'à "Log file"
4. Cliquez sur le lien pour voir les logs
5. Cherchez les messages d'erreur (en rouge)

OU

1. Dans le gestionnaire de fichiers
2. Allez dans `u52-app/logs/`
3. Ouvrez `app.log` pour voir les logs

---

## 🆘 DÉPANNAGE - Problèmes courants

### ❌ Problème 1 : "Application not running"

**Solution** :
1. Vérifiez que toutes les dépendances sont installées
2. Cliquez sur "Run NPM Install" à nouveau
3. Redémarrez l'application

### ❌ Problème 2 : "Error 502 Bad Gateway"

**Solution** :
1. L'application Node.js n'est pas démarrée
2. Allez dans "Setup Node.js App"
3. Cliquez sur "Restart"

### ❌ Problème 3 : Page blanche

**Solution** :
1. Vérifiez le chemin du "Document root"
2. Il doit pointer vers : `.../u52-app/public`
3. Pas vers `.../u52-app`

### ❌ Problème 4 : Erreur CORS dans la console

**Solution** :
1. Vérifiez la variable d'environnement `CORS_ORIGIN`
2. Elle doit correspondre EXACTEMENT à votre domaine
3. Avec `https://` et sans `/` à la fin
4. Exemple : `https://app.mondomaine.fr`

### ❌ Problème 5 : "Cannot find module"

**Solution** :
1. Les dépendances ne sont pas installées
2. Dans "Setup Node.js App"
3. Cliquez sur "Run NPM Install"
4. Attendez la fin de l'installation
5. Redémarrez

### ❌ Problème 6 : Erreur de base de données

**Solution** :
1. Vérifiez les permissions du fichier database
2. Dans le gestionnaire de fichiers :
   - `server/database/u52.db` → permissions `644`
3. Vérifiez que le dossier `server/database/` existe

---

## 📞 AIDE ET SUPPORT

### 📚 Fichiers de documentation

Dans votre dossier, vous avez plusieurs guides :
- `DEPLOYMENT_GUIDE.md` - Guide technique complet
- `LWS_CONFIGURATION.md` - Configuration avancée LWS
- `README.md` - Documentation générale

### 🔍 Consulter les logs

**Via cPanel** :
1. Setup Node.js App → Votre application → Log file

**Via gestionnaire de fichiers** :
1. `u52-app/logs/app.log` - Tous les logs
2. `u52-app/logs/error.log` - Erreurs uniquement

### 📧 Support LWS

Si vous avez des problèmes avec cPanel :
- Support LWS : https://aide.lws.fr/
- Ticket de support depuis votre espace client

---

## ✅ CHECKLIST FINALE

Avant de considérer le déploiement terminé :

- [ ] ✅ Fichiers uploadés et extraits dans `u52-app/`
- [ ] ✅ Application Node.js créée dans cPanel
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Dépendances installées (`npm install` réussi)
- [ ] ✅ Application "Running" dans cPanel
- [ ] ✅ Domaine ou sous-domaine configuré
- [ ] ✅ Document root pointe vers `.../u52-app/public`
- [ ] ✅ SSL/HTTPS activé et fonctionnel
- [ ] ✅ Page de connexion s'affiche
- [ ] ✅ Connexion admin fonctionne
- [ ] ✅ Mot de passe admin CHANGÉ
- [ ] ✅ Fonctionnalités testées (étudiants, évaluations)
- [ ] ✅ Aucune erreur dans les logs
- [ ] ✅ Pas d'erreur CORS dans la console navigateur

---

## 🎉 FÉLICITATIONS !

Votre application U52 BTS Électrotechnique est maintenant **déployée et fonctionnelle** sur votre hébergement LWS !

### 🚀 Prochaines étapes recommandées :

1. **Sécurité** :
   - Changez le mot de passe admin
   - Notez votre JWT_SECRET dans un endroit sûr
   - Activez les sauvegardes automatiques

2. **Configuration** :
   - Créez vos classes
   - Importez vos étudiants
   - Configurez les grilles d'évaluation

3. **Maintenance** :
   - Planifiez des sauvegardes régulières
   - Surveillez les logs occasionnellement
   - Mettez à jour l'application si nécessaire

### 🎯 Utilisation quotidienne :

- **URL de connexion** : `https://votre-domaine.fr`
- **Redémarrer l'app** : cPanel → Setup Node.js App → Restart
- **Consulter les logs** : cPanel → Setup Node.js App → Log file
- **Sauvegarder la BDD** : Téléchargez `server/database/u52.db`

---

**Bon travail et bonne utilisation ! 🎓**

_Si vous rencontrez des difficultés, consultez la section DÉPANNAGE ou les logs de l'application._

