# 📝 AIDE-MÉMOIRE - Après le déploiement

> **Gardez ce document sous la main pour l'utilisation quotidienne**

---

## 🔗 INFORMATIONS DE CONNEXION

**URL de l'application** : `https://___________________`

**Identifiants admin** :
- Utilisateur : `admin`
- Mot de passe : `___________________` (CHANGEZ le mot de passe par défaut !)

**Accès cPanel** :
- URL : `https://panel.lws.fr`
- Login : `___________________`
- Pass : `___________________`

---

## 🚀 OPÉRATIONS COURANTES

### ✅ Redémarrer l'application

1. Connexion à cPanel
2. **Setup Node.js App**
3. Cliquer sur votre application
4. Bouton **"Restart"**

### 📊 Consulter les logs

**Méthode 1 - Via cPanel** :
1. **Setup Node.js App** → Votre application
2. Cliquer sur **"Log file"**

**Méthode 2 - Via gestionnaire de fichiers** :
1. **Gestionnaire de fichiers**
2. Aller dans : `public_html/u52-app/logs/`
3. Ouvrir : `app.log`

### 💾 Sauvegarder la base de données

**Important : À faire régulièrement !**

1. **Gestionnaire de fichiers** cPanel
2. Aller dans : `public_html/u52-app/server/database/`
3. Sélectionner : `u52.db`
4. Cliquer sur **"Télécharger"**
5. Sauvegarder sur votre PC avec la date : `u52-backup-2024-10-09.db`

💡 **Conseil** : Faites une sauvegarde chaque semaine !

### 🔄 Mettre à jour l'application

1. Créer une **sauvegarde complète** d'abord !
2. Sur votre PC : récupérer la nouvelle version
3. Exécuter : `.\deploy-to-lws.bat`
4. Créer le ZIP du nouveau `deploy`
5. Dans cPanel :
   - **Arrêter** l'application (Stop)
   - Remplacer les fichiers (sauf `database/` et `uploads/`)
   - **Run NPM Install**
   - **Redémarrer** l'application

### 📁 Télécharger les fichiers uploadés

1. **Gestionnaire de fichiers**
2. Aller dans : `public_html/u52-app/uploads/`
3. Sélectionner les fichiers
4. **Télécharger**

---

## 🆘 PROBLÈMES ET SOLUTIONS

### L'application ne répond plus

1. ✅ Vérifier le statut : cPanel → Setup Node.js App
2. ✅ Si "Stopped" : cliquer sur **Start**
3. ✅ Si "Running" : cliquer sur **Restart**
4. ✅ Consulter les logs pour voir l'erreur

### Erreur 500 ou 502

1. ✅ L'application a planté
2. ✅ Consulter les logs : voir l'erreur exacte
3. ✅ Redémarrer l'application
4. ✅ Si le problème persiste : restaurer une sauvegarde

### Les modifications ne s'affichent pas

1. ✅ Vider le cache du navigateur (Ctrl+F5)
2. ✅ Redémarrer l'application
3. ✅ Vérifier les logs

### Impossible de se connecter

1. ✅ Vérifier que l'application est "Running"
2. ✅ Vérifier l'URL (avec https://)
3. ✅ Vérifier les logs pour erreurs
4. ✅ Vérifier la variable `CORS_ORIGIN`

### Base de données corrompue

1. ✅ **Arrêter** l'application immédiatement
2. ✅ Aller dans `server/database/`
3. ✅ Supprimer `u52.db`
4. ✅ Uploader votre dernière sauvegarde
5. ✅ Renommer en `u52.db`
6. ✅ **Redémarrer** l'application

---

## 🛠️ MAINTENANCE RECOMMANDÉE

### Quotidienne
- ✅ Vérifier que l'application fonctionne
- ✅ Pas d'erreurs visibles dans l'interface

### Hebdomadaire
- ✅ **Sauvegarder la base de données** (très important !)
- ✅ Consulter les logs pour détecter des erreurs
- ✅ Vérifier l'espace disque utilisé

### Mensuelle
- ✅ Sauvegarder aussi le dossier `uploads/`
- ✅ Nettoyer les anciens logs (si trop volumineux)
- ✅ Vérifier les mises à jour disponibles
- ✅ Tester toutes les fonctionnalités principales

---

## 📍 EMPLACEMENTS IMPORTANTS

### Dans cPanel

| Élément | Emplacement |
|---------|-------------|
| **Fichiers de l'app** | `public_html/u52-app/` |
| **Base de données** | `public_html/u52-app/server/database/u52.db` |
| **Logs** | `public_html/u52-app/logs/app.log` |
| **Fichiers uploadés** | `public_html/u52-app/uploads/` |
| **Sauvegardes** | `public_html/u52-app/backups/` |
| **Configuration** | `public_html/u52-app/config.production.js` |

### Sur votre PC

| Élément | Emplacement |
|---------|-------------|
| **Code source** | Dossier du projet |
| **Package déploiement** | `deploy/` |
| **Sauvegardes BDD** | Créer un dossier `sauvegardes/` |

---

## 🔐 SÉCURITÉ - À FAIRE ABSOLUMENT

### Première installation

- [ ] ✅ Changer le mot de passe admin par défaut (`admin123`)
- [ ] ✅ Utiliser un JWT_SECRET unique et complexe
- [ ] ✅ Activer HTTPS/SSL
- [ ] ✅ Vérifier que CORS_ORIGIN correspond à votre domaine

### Utilisation régulière

- [ ] ✅ Ne pas partager vos identifiants admin
- [ ] ✅ Créer des comptes séparés pour chaque utilisateur
- [ ] ✅ Sauvegarder régulièrement la base de données
- [ ] ✅ Surveiller les logs pour activités suspectes

---

## 📞 CONTACTS UTILES

### Support technique

| Service | Contact |
|---------|---------|
| **Support LWS** | https://aide.lws.fr/ |
| **Espace client LWS** | https://panel.lws.fr/ |
| **Ticket support** | Via l'espace client LWS |

### Documentation

| Document | Utilité |
|----------|---------|
| `GUIDE_DEBUTANT_CPANEL_LWS.md` | Guide détaillé étape par étape |
| `DEPLOIEMENT_RAPIDE_LWS.md` | Version rapide du déploiement |
| `DEPLOYMENT_GUIDE.md` | Guide technique complet |
| `README.md` | Documentation de l'application |

---

## 📋 CHECKLIST DE VÉRIFICATION RAPIDE

Utilisez cette checklist pour vérifier que tout fonctionne :

**Tous les jours** (1 minute) :
- [ ] L'application se charge-t-elle ? (ouvrir l'URL)
- [ ] Peut-on se connecter ?
- [ ] Les fonctions de base marchent-elles ?

**Toutes les semaines** (5 minutes) :
- [ ] Sauvegarder la base de données (`u52.db`)
- [ ] Consulter les logs rapidement
- [ ] Vérifier l'espace disque (cPanel → Utilisation)

**Tous les mois** (15 minutes) :
- [ ] Sauvegarder BDD + dossier `uploads/`
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier les erreurs dans les logs
- [ ] Nettoyer les anciens logs si nécessaire

---

## 🎯 FONCTIONNALITÉS PRINCIPALES

Pour référence rapide :

### Gestion des étudiants
- **Menu** : Étudiants
- **Import CSV** : Bouton "Importer"
- **Ajouter** : Bouton "+"

### Gestion des classes
- **Menu** : Classes
- **Créer classe** : Bouton "Nouvelle classe"

### Évaluations
- **Menu** : Évaluations → Choisir l'unité (U51, U52, U61, U62)
- **Créer** : Bouton "Nouvelle évaluation"
- **Imprimer** : Bouton "Imprimer" sur une évaluation

### Planning
- **Menu** : Planning
- **Ajouter activité** : Cliquer sur un créneau
- **Modes d'affichage** : Semaine / Mois / Vue chronologique

### Fiches TP
- **Menu** : Fiches TP
- **Créer fiche** : Bouton "Nouvelle fiche TP"

---

## 💡 ASTUCES

### Gain de temps
- ✅ Favoris navigateur : ajoutez l'URL de l'app
- ✅ Favoris navigateur : ajoutez l'URL cPanel
- ✅ Créez un raccourci bureau vers cPanel
- ✅ Planifiez les sauvegardes le même jour chaque semaine

### Performance
- ✅ Nettoyez régulièrement les anciens logs
- ✅ Supprimez les évaluations d'anciens semestres (après sauvegarde !)
- ✅ Videz le cache navigateur si l'app est lente

### Sécurité
- ✅ Utilisez un gestionnaire de mots de passe
- ✅ Ne restez pas connecté sur un PC partagé
- ✅ Changez le JWT_SECRET régulièrement (tous les 6 mois)
- ✅ Gardez vos sauvegardes sur 2 supports différents

---

## 🎉 VOUS ÊTES PRÊT !

Ce document contient tout ce dont vous avez besoin pour :
- ✅ Utiliser l'application au quotidien
- ✅ Résoudre les problèmes courants
- ✅ Maintenir l'application en bon état
- ✅ Sauvegarder vos données

**Bonne utilisation ! 🚀**

---

_Dernière mise à jour : Octobre 2024_
_Version : 1.0_

