# 🚀 Guide de Démarrage de l'Application U52 BTS Électrotechnique

## 📋 Prérequis
- Node.js installé (version 14 ou supérieure)
- npm installé

---

## 🎯 Méthode 1 : Démarrage Automatique (Recommandé)

### Option A : Script PowerShell Complet
Exécutez le script qui démarre automatiquement backend + frontend :

```powershell
.\start-dev.ps1
```

---

## 🔧 Méthode 2 : Démarrage Manuel (2 Terminaux)

### Terminal 1 : Serveur Backend

**Option A : Avec script PowerShell**
```powershell
.\start-backend.ps1
```

**Option B : Manuellement**
```powershell
cd server
node server.js
```

Le backend démarre sur : **http://localhost:3001**

---

### Terminal 2 : Serveur Frontend

**Option A : Avec script PowerShell**
```powershell
.\start-frontend.ps1
```

**Option B : Manuellement**
```powershell
cd client
npm start
```

Le frontend démarre sur : **http://localhost:3005**

---

## ✅ Vérification

Une fois démarrés, vous devriez voir :

### Backend (Terminal 1)
```
✅ Serveur démarré sur le port 3001
✅ Base de données connectée
✅ Table visites_stage créée ou existe déjà
```

### Frontend (Terminal 2)
```
Compiled successfully!

You can now view u52-client in the browser.

  Local:            http://localhost:3005
  On Your Network:  http://192.168.x.x:3005
```

---

## 🌐 Accès à l'Application

Ouvrez votre navigateur et allez sur :
```
http://localhost:3005
```

---

## ⚠️ Résolution de Problèmes

### Erreur : "Port 3001 already in use"
Le backend est déjà en cours d'exécution. Arrêtez les processus Node.js :

```powershell
Stop-Process -Name node -Force
```

Puis redémarrez.

---

### Erreur : "Cannot connect to backend"
Vérifiez que le serveur backend est bien démarré sur le port 3001 :

```powershell
# Tester l'API backend
Invoke-WebRequest -Uri "http://localhost:3001/api/health"
```

---

### Erreur : "Module not found"
Installez les dépendances :

**Backend :**
```powershell
cd server
npm install
```

**Frontend :**
```powershell
cd client
npm install
```

---

## 🛑 Arrêter l'Application

### Méthode Douce
Dans chaque terminal, appuyez sur : **Ctrl + C**

### Méthode Force
Arrêtez tous les processus Node.js :

```powershell
Stop-Process -Name node -Force
```

---

## 📊 Ports Utilisés

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Backend  | 3001 | http://localhost:3001    |
| Frontend | 3005 | http://localhost:3005    |

---

## 🎉 Fonctionnalités Disponibles

Une fois l'application démarrée, vous pouvez :

✅ Gérer les étudiants  
✅ Gérer les stages en entreprise  
✅ Planifier les visites de stage  
✅ Voir le calendrier des visites  
✅ Gérer les évaluations  
✅ Consulter les rapports de stage  

---

## 💡 Astuce

Pour un développement plus rapide, gardez **les deux terminaux ouverts** :
- 🔧 Terminal 1 : Backend (reste en arrière-plan)
- 🎨 Terminal 2 : Frontend (recharge automatiquement à chaque modification)

---

## 📞 Support

En cas de problème, vérifiez :
1. ✅ Node.js est installé : `node --version`
2. ✅ npm est installé : `npm --version`
3. ✅ Les dépendances sont installées : `npm install` dans `/server` et `/client`
4. ✅ Les ports 3001 et 3005 sont libres
5. ✅ Le backend est démarré avant le frontend

---

**Bon développement ! 🚀**

