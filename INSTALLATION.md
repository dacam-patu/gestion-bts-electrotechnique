# Guide d'installation rapide - Application U52

## 🚀 Installation automatique (Windows)

1. **Double-cliquer sur `start.bat`**
   - Ce script installera automatiquement toutes les dépendances
   - Suivez les instructions à l'écran

2. **Démarrer l'application**
   - Double-cliquer sur `run.bat`
   - Ou ouvrir un terminal et exécuter : `npm run dev`

## 🔧 Installation manuelle

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Étapes

1. **Installer les dépendances principales**
   ```bash
   npm install
   ```

2. **Installer les dépendances du serveur**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Installer les dépendances du client**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Démarrer l'application**
   ```bash
   npm run dev
   ```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000

## 🔐 Identifiants de connexion

- **Utilisateur** : `admin`
- **Mot de passe** : `admin123`

## 📱 Fonctionnalités disponibles

### Dashboard
- Vue d'ensemble des projets
- Statistiques en temps réel
- Navigation rapide

### Gestion des projets
- Création de projets U52
- Association d'étudiants
- Suivi des phases

### Gestion des étudiants
- Ajout d'étudiants
- Attribution de rôles
- Association aux projets

### Évaluations
- Suivi des 3 phases
- Évaluation des compétences C1, C3, C12
- Notes et commentaires

### Documents
- Upload de documents
- Organisation par phase
- Téléchargement et gestion

## 🛠️ Résolution de problèmes

### Erreur PowerShell
Si vous rencontrez des erreurs de politique d'exécution :
1. Ouvrir PowerShell en tant qu'administrateur
2. Exécuter : `Set-ExecutionPolicy RemoteSigned`
3. Confirmer avec `Y`

### Erreur de port
Si les ports 3000 ou 5000 sont occupés :
1. Fermer les applications utilisant ces ports
2. Ou modifier les ports dans les fichiers de configuration

### Erreur de base de données
La base SQLite sera créée automatiquement au premier démarrage.

## 📞 Support

Pour toute question ou problème :
- Consulter le README.md complet
- Vérifier les logs dans la console
- Contacter l'équipe de développement

---

**Application développée pour l'enseignement en BTS Électrotechnique** ⚡ 