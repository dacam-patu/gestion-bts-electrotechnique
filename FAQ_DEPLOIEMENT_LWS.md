# ❓ FAQ - Questions fréquentes sur le déploiement LWS

## 📌 Questions avant le déploiement

### ❓ Mon hébergement LWS est-il compatible ?

**Réponse** : Votre hébergement LWS doit avoir :
- ✅ **cPanel** installé
- ✅ Support **Node.js** (version 16 ou supérieure)
- ✅ Au moins **500 Mo d'espace disque** disponible
- ✅ Support **SQLite** (généralement inclus)

Pour vérifier :
1. Connectez-vous à cPanel
2. Cherchez "Setup Node.js App" ou "Application Node.js"
3. Si vous le voyez → ✅ Compatible !
4. Si vous ne le voyez pas → Contactez le support LWS pour l'activer

---

### ❓ Ai-je besoin d'un domaine spécifique ?

**Réponse** : Non ! Vous avez plusieurs options :

1. **Domaine principal** : `https://mondomaine.fr`
2. **Sous-domaine** : `https://app.mondomaine.fr` ⭐ (recommandé)
3. **Sous-dossier** : `https://mondomaine.fr/u52-app`

Le plus simple pour commencer : créer un sous-domaine.

---

### ❓ Combien de temps prend le déploiement ?

**Réponse** : 
- **Premier déploiement** : 20-30 minutes (en suivant le guide pas à pas)
- **Déploiements suivants** : 10-15 minutes (vous serez plus rapide)
- **Installation des dépendances** : 2-5 minutes (automatique)

---

### ❓ Faut-il des connaissances techniques ?

**Réponse** : Non ! Le guide `GUIDE_DEBUTANT_CPANEL_LWS.md` est fait pour les débutants complets.

Vous devez juste savoir :
- ✅ Naviguer dans des dossiers
- ✅ Cliquer sur des boutons dans cPanel
- ✅ Copier/coller du texte

Tout est expliqué étape par étape avec des captures d'écran décrites.

---

## 📌 Questions pendant le déploiement

### ❓ L'upload du fichier ZIP est très lent

**Réponse** : C'est normal si vous avez une connexion lente.

**Solutions** :
1. **Patience** : Le fichier fait 50-100 Mo, cela peut prendre 5-10 minutes
2. **Connexion plus rapide** : Utilisez une connexion filaire plutôt que WiFi
3. **FTP** : Alternative plus rapide (demandez au support LWS pour les identifiants FTP)

---

### ❓ Erreur "Cannot create directory"

**Réponse** : Problème de permissions.

**Solution** :
1. Vérifiez que vous êtes dans le bon dossier (`public_html`)
2. Dans cPanel → Gestionnaire de fichiers
3. Sélectionnez `public_html`
4. Vérifiez les permissions : doivent être `755`

---

### ❓ "Run NPM Install" échoue

**Réponse** : Plusieurs causes possibles.

**Solutions** :
1. **Vérifiez la version Node.js** : doit être 16+ (changez-la si besoin)
2. **Vérifiez le fichier** : `package.json` doit être présent dans `u52-app/`
3. **Réessayez** : Parfois c'est temporaire, cliquez à nouveau
4. **Logs** : Consultez les erreurs dans les logs

Si ça persiste → Contactez le support LWS

---

### ❓ L'application n'apparaît pas dans "Setup Node.js App"

**Réponse** : Vous ne l'avez peut-être pas créée.

**Solution** :
1. Dans "Setup Node.js App"
2. Cliquez sur **"Create Application"** (bouton en haut)
3. Remplissez le formulaire
4. Cliquez sur "Create"

---

### ❓ Quelle version de Node.js choisir ?

**Réponse** : Choisissez la **plus récente disponible**.

- ✅ **Recommandé** : 18.x ou 20.x
- ✅ **Minimum** : 16.x
- ❌ **Évitez** : versions < 16

---

## 📌 Questions après le déploiement

### ❓ J'ai une page blanche

**Réponse** : Le "Document root" n'est pas correct.

**Solution** :
1. cPanel → **Sous-domaines** (ou Domaines)
2. Trouvez votre domaine/sous-domaine
3. Vérifiez le "Document root"
4. Il doit se terminer par `/public` 
5. Exemple correct : `/home/user/public_html/u52-app/public`
6. Exemple incorrect : `/home/user/public_html/u52-app`

---

### ❓ Erreur "502 Bad Gateway"

**Réponse** : L'application Node.js n'est pas démarrée.

**Solution** :
1. cPanel → **Setup Node.js App**
2. Cliquez sur votre application
3. Vérifiez le statut
4. Si "Stopped" → Cliquez sur **"Start"**
5. Si "Running" → Cliquez sur **"Restart"**

---

### ❓ Erreur CORS dans la console du navigateur

**Réponse** : La variable `CORS_ORIGIN` n'est pas correcte.

**Solution** :
1. cPanel → **Setup Node.js App** → Votre application
2. Section "Environment Variables"
3. Trouvez `CORS_ORIGIN`
4. La valeur doit être EXACTEMENT votre domaine :
   - ✅ Correct : `https://app.mondomaine.fr`
   - ❌ Incorrect : `http://app.mondomaine.fr` (pas de 's')
   - ❌ Incorrect : `https://app.mondomaine.fr/` (slash à la fin)
   - ❌ Incorrect : `app.mondomaine.fr` (manque https://)
5. **Sauvegardez**
6. **Redémarrez** l'application

---

### ❓ "Cannot find module 'express'" ou autre module

**Réponse** : Les dépendances ne sont pas installées.

**Solution** :
1. cPanel → **Setup Node.js App** → Votre application
2. Cliquez sur **"Run NPM Install"**
3. Attendez que ça se termine (2-5 minutes)
4. **Redémarrez** l'application

---

### ❓ Impossible de se connecter avec admin/admin123

**Réponse** : La base de données n'est pas correctement uploadée.

**Solution** :
1. Vérifiez que le fichier existe : `u52-app/server/database/u52.db`
2. Si le fichier n'existe pas :
   - Sur votre PC, allez dans `deploy/server/database/`
   - Uploadez `u52.db` dans cPanel : `u52-app/server/database/`
3. Vérifiez les permissions du fichier : `644`
4. Redémarrez l'application

---

### ❓ Le SSL ne fonctionne pas (https)

**Réponse** : Le certificat SSL n'est pas installé.

**Solution** :
1. cPanel → **SSL/TLS Status**
2. Trouvez votre domaine dans la liste
3. Cliquez sur **"Run AutoSSL"**
4. Attendez 1-2 minutes
5. Vérifiez : statut doit être "SSL is active"

Si ça ne fonctionne toujours pas :
- Attendez quelques heures (propagation DNS)
- Vérifiez que votre domaine pointe bien vers le serveur

---

## 📌 Questions sur l'utilisation

### ❓ Comment ajouter des utilisateurs ?

**Réponse** :
1. Connectez-vous en tant qu'admin
2. Menu → **Utilisateurs**
3. Bouton **"+"** ou "Nouveau"
4. Remplissez le formulaire
5. Choisissez un rôle (Professeur, Admin, etc.)
6. **Enregistrez**

---

### ❓ Comment importer mes étudiants ?

**Réponse** :
1. Préparez un fichier CSV avec les colonnes :
   - `nom`, `prenom`, `email`, `classe` (optionnel)
2. Menu → **Étudiants**
3. Bouton **"Importer"**
4. Sélectionnez votre fichier CSV
5. Vérifiez l'aperçu
6. **Importez**

Un fichier d'exemple existe : `exemple_etudiants.csv`

---

### ❓ Comment créer une grille d'évaluation ?

**Réponse** :
1. Menu → **Évaluations**
2. Choisissez l'unité (U51, U52, U61, U62)
3. Bouton **"Nouvelle évaluation"**
4. Remplissez les informations :
   - Titre
   - Date
   - Classe
   - Étudiants
5. Ajoutez les critères d'évaluation
6. **Enregistrez**

---

### ❓ Comment imprimer une grille d'évaluation ?

**Réponse** :
1. Ouvrez l'évaluation
2. Cliquez sur le bouton **"Imprimer"** ou icône imprimante
3. Une fenêtre s'ouvre avec l'aperçu
4. Utilisez Ctrl+P (ou Cmd+P sur Mac)
5. Choisissez votre imprimante
6. **Imprimez**

---

## 📌 Questions sur la maintenance

### ❓ Comment faire une sauvegarde ?

**Réponse** : **TRÈS IMPORTANT - À faire régulièrement !**

**Sauvegarde de la base de données** :
1. cPanel → **Gestionnaire de fichiers**
2. Allez dans : `public_html/u52-app/server/database/`
3. Sélectionnez : `u52.db`
4. Cliquez sur **"Télécharger"**
5. Sauvegardez sur votre PC avec la date : `u52-backup-2024-10-09.db`

**Sauvegarde complète** :
1. Sélectionnez tout le dossier `u52-app/`
2. Clic droit → **"Compresser"**
3. Créez un ZIP
4. **Téléchargez** le ZIP

💡 **Conseil** : Faites-le chaque semaine !

---

### ❓ Comment restaurer une sauvegarde ?

**Réponse** :

1. **Arrêtez l'application** (Setup Node.js App → Stop)
2. Dans le gestionnaire de fichiers :
   - Allez dans `u52-app/server/database/`
   - Supprimez l'ancien `u52.db`
   - Uploadez votre sauvegarde
   - Renommez-la en `u52.db`
3. **Redémarrez** l'application

---

### ❓ Comment mettre à jour l'application ?

**Réponse** :

**IMPORTANT : Faites une sauvegarde complète AVANT !**

1. Sur votre PC, récupérez la nouvelle version
2. Exécutez : `.\deploy-to-lws.bat`
3. Créez le ZIP de `deploy`
4. Dans cPanel :
   - **Arrêtez** l'application
   - **Sauvegardez** `database/` et `uploads/`
   - Supprimez les anciens fichiers (sauf `database/` et `uploads/`)
   - Uploadez et extrayez le nouveau ZIP
   - Remettez `database/` et `uploads/`
   - **Run NPM Install**
   - **Redémarrez** l'application

---

### ❓ Combien d'espace disque utilise l'application ?

**Réponse** :

- **Application seule** : ~50-80 Mo
- **Avec base de données** : ~100 Mo (dépend du nombre d'étudiants)
- **Avec fichiers uploadés** : Variable (dépend de vous)

Pour vérifier :
- cPanel → En haut à droite, vous voyez "Disk Usage"

---

## 📌 Questions sur la sécurité

### ❓ Comment changer le mot de passe admin ?

**Réponse** :

1. Connectez-vous avec `admin` / `admin123`
2. Menu → **Utilisateurs**
3. Trouvez l'utilisateur "admin"
4. Cliquez sur **"Modifier"** ou icône crayon
5. Section "Mot de passe"
6. Entrez un **mot de passe fort** (12+ caractères, lettres, chiffres, symboles)
7. **Enregistrez**

⚠️ **À FAIRE IMMÉDIATEMENT après le premier déploiement !**

---

### ❓ Qu'est-ce que JWT_SECRET ?

**Réponse** : C'est la clé secrète qui sécurise les sessions utilisateur.

**Important** :
- ✅ Doit être **unique** (ne pas utiliser l'exemple)
- ✅ Doit être **long** (30+ caractères)
- ✅ Doit être **complexe** (lettres, chiffres, symboles)
- ✅ Ne JAMAIS le partager
- ✅ Le changer tous les 6 mois

**Exemple de bon JWT_SECRET** :
```
Kj8$mP2!xL9@vN5#qR7&wT3^yU6*zA1
```

Pour le générer : utilisez un générateur de mot de passe fort.

---

### ❓ Mon application est-elle sécurisée ?

**Réponse** : Si vous avez fait ceci, OUI :

- ✅ HTTPS/SSL activé
- ✅ Mot de passe admin changé
- ✅ JWT_SECRET unique et fort
- ✅ CORS_ORIGIN configuré correctement
- ✅ Sauvegardes régulières

**Recommandations supplémentaires** :
- ✅ Créez des comptes séparés pour chaque utilisateur
- ✅ Ne partagez pas le compte admin
- ✅ Surveillez les logs régulièrement
- ✅ Gardez l'application à jour

---

## 📌 Questions sur les problèmes

### ❓ L'application est très lente

**Réponse** : Plusieurs causes possibles.

**Solutions** :
1. **Videz le cache du navigateur** (Ctrl+Shift+Del)
2. **Vérifiez les ressources du serveur** (cPanel → Stats)
3. **Consultez les logs** : y a-t-il des erreurs ?
4. **Redémarrez l'application**
5. **Nettoyez les anciens logs** dans `logs/`

---

### ❓ Erreur "Database is locked"

**Réponse** : Un autre processus utilise la base de données.

**Solution** :
1. **Redémarrez l'application** (généralement ça suffit)
2. Si le problème persiste :
   - Vérifiez qu'il n'y a pas 2 instances de l'app qui tournent
   - Consultez les logs pour voir quelle opération bloque

---

### ❓ Les modifications que je fais ne s'affichent pas

**Réponse** : Problème de cache.

**Solution** :
1. **Rafraîchissez avec le cache** : Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)
2. **Videz le cache du navigateur**
3. **Redémarrez l'application** dans cPanel

---

## 📞 BESOIN D'AIDE SUPPLÉMENTAIRE ?

### 📚 Documentation disponible

1. **`GUIDE_DEBUTANT_CPANEL_LWS.md`** - Guide détaillé pas à pas ⭐
2. **`DEPLOIEMENT_RAPIDE_LWS.md`** - Version rapide
3. **`AIDE_MEMOIRE_APRES_DEPLOIEMENT.md`** - Utilisation quotidienne
4. **`DEPLOYMENT_GUIDE.md`** - Guide technique complet
5. **`README.md`** - Documentation de l'application

### 🆘 Support

- **Support LWS** : https://aide.lws.fr/
- **Ticket LWS** : Via votre espace client
- **Consulter les logs** : Souvent la réponse est là !

### 💡 Astuce

**Avant de demander de l'aide** :
1. ✅ Consultez cette FAQ
2. ✅ Lisez les logs (cPanel → Setup Node.js App → Log file)
3. ✅ Vérifiez la checklist dans `AIDE_MEMOIRE_APRES_DEPLOIEMENT.md`
4. ✅ Redémarrez l'application (ça résout 50% des problèmes !)

---

## 🎯 QUESTIONS NON RÉPONDUES ?

Si votre question n'est pas dans cette FAQ :

1. **Consultez les logs** : la réponse y est souvent
2. **Vérifiez le README.md** pour les questions sur l'utilisation
3. **Contactez le support LWS** pour les questions sur l'hébergement
4. **Notez votre question** : peut-être pour une prochaine version de cette FAQ !

---

_Dernière mise à jour : Octobre 2024_
_Cette FAQ sera mise à jour régulièrement avec vos questions._

