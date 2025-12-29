# ⚡ Déploiement RAPIDE - LWS cPanel

## 🎯 Version courte - Si vous êtes pressé

### 📦 SUR VOTRE PC (5 minutes)

1. **Ouvrir PowerShell** dans ce dossier
2. **Exécuter** :
   ```powershell
   .\deploy-to-lws.bat
   ```
3. **Compresser** le dossier `deploy` en ZIP
4. Vous avez maintenant : `deploy.zip` ✅

---

### 🌐 SUR CPANEL LWS (15 minutes)

#### 📁 1. Upload des fichiers (3 min)

1. cPanel → **Gestionnaire de fichiers**
2. Ouvrir `public_html/`
3. Créer dossier : `u52-app`
4. Uploader `deploy.zip` dedans
5. Extraire le ZIP
6. Déplacer le contenu de `deploy/` dans `u52-app/`

#### ⚙️ 2. Configuration Node.js (5 min)

1. cPanel → **Setup Node.js App**
2. **Create Application** :
   - Node version : `18.x` ou plus
   - Application root : `u52-app`
   - Startup file : `start-production.js`
   - Mode : `Production`
3. **Ajouter variables** :
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=VotreSecretTresFort123!
   CORS_ORIGIN=https://votre-domaine.fr
   ```
4. **Run NPM Install** (attendez 2-5 min)

#### 🌐 3. Configuration domaine (3 min)

1. cPanel → **Sous-domaines**
2. Créer : `app` ou `u52`
3. Document root : `/home/user/public_html/u52-app/public`

#### 🔒 4. SSL (2 min)

1. cPanel → **SSL/TLS Status**
2. Sélectionner votre domaine
3. **Run AutoSSL**

#### 🚀 5. Démarrage (2 min)

1. **Setup Node.js App** → Votre app
2. Vérifier statut : **Running** ✅
3. Si besoin : **Restart**

---

### ✅ VÉRIFICATION

1. **Ouvrir** : `https://app.votre-domaine.fr`
2. **Connexion** : `admin` / `admin123`
3. **CHANGER** le mot de passe immédiatement !

---

## 🔥 Commandes rapides

### Sur votre PC

```powershell
# Créer le package de déploiement
.\deploy-to-lws.bat

# Vérifier les fichiers
dir deploy
```

### Sur cPanel (Terminal SSH si disponible)

```bash
# Aller dans le dossier de l'app
cd ~/public_html/u52-app

# Installer les dépendances
npm install

# Démarrer (via Node.js App dans cPanel de préférence)
npm start

# Vérifier les logs
tail -f logs/app.log
```

---

## 🆘 Problèmes fréquents

| Problème | Solution rapide |
|----------|----------------|
| 🔴 App not running | cPanel → Setup Node.js → Run NPM Install → Restart |
| 🔴 502 Bad Gateway | Setup Node.js → Restart |
| 🔴 Page blanche | Vérifier Document root → doit finir par `/public` |
| 🔴 Erreur CORS | Vérifier `CORS_ORIGIN` = votre VRAI domaine avec https:// |
| 🔴 Cannot find module | Run NPM Install dans cPanel |

---

## 📞 Besoin d'aide ?

➡️ **Guide détaillé** : Ouvrez `GUIDE_DEBUTANT_CPANEL_LWS.md`

➡️ **Logs** : cPanel → Setup Node.js App → Log file

➡️ **Support LWS** : https://aide.lws.fr/

---

## ⏱️ Temps total estimé : 20-30 minutes

✅ **Prérequis** :
- Hébergement LWS avec cPanel
- Support Node.js activé sur votre hébergement
- Un domaine ou sous-domaine configuré

🎉 **C'est tout ! Votre application sera en ligne !**

