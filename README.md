# Application U52 BTS Électrotechnique

Application web de planification et de suivi de l'épreuve U52 en BTS Électrotechnique, avec gestion des phases du projet, des étudiants et des documents.

## 🎯 Objectifs

- Créer des groupes d'étudiants
- Définir un projet support de l'épreuve
- Suivre la progression dans les 3 phases (préparation, pilotage, soutenance)
- Gérer les documents à produire par phase
- Suivre les indicateurs d'évaluation des compétences C1, C3, C12
- Générer une fiche de synthèse par étudiant

## 🚀 Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Base de données légère
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **bcryptjs** - Hashage des mots de passe

### Frontend
- **React** - Interface utilisateur
- **Tailwind CSS** - Framework CSS
- **React Router** - Navigation
- **Axios** - Requêtes HTTP
- **Lucide React** - Icônes
- **React Hot Toast** - Notifications

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd planning-epreuve-u52
   ```

2. **Installer les dépendances**
   ```bash
   # Installer les dépendances principales
   npm install
   
   # Installer les dépendances du serveur
   cd server
   npm install
   
   # Installer les dépendances du client
   cd ../client
   npm install
   ```

3. **Démarrer l'application**
   ```bash
   # Depuis la racine du projet
   npm run dev
   ```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000

## 🔐 Identifiants par défaut

- **Utilisateur** : `admin`
- **Mot de passe** : `admin123`

## 📊 Fonctionnalités principales

### 1. Authentification
- Connexion sécurisée pour les professeurs
- Gestion de session avec JWT
- Interface de connexion moderne

### 2. Gestion des projets
- Création de projets U52 avec titre, description, dates
- Association de groupes d'étudiants
- Types de projets : atelier, entreprise, laboratoire, simulation
- Suivi du statut des projets

### 3. Gestion des étudiants
- Ajout d'étudiants avec informations personnelles
- Association à des projets et groupes
- Attribution de rôles : conducteur, exécutant, assistant, observateur
- Interface de gestion complète

### 4. Suivi des phases
- **Phase 1 : Planification**
  - Planning, fiches techniques, schémas électriques
  - Plans de sécurité, cahiers des charges
  - Analyse des contraintes

- **Phase 2 : Pilotage**
  - Suivi des heures de travail
  - Observations et remarques de l'enseignant
  - Modifications du planning
  - Rapports intermédiaires

- **Phase 3 : Soutenance**
  - Rapports finaux
  - Présentations
  - Grilles d'évaluation
  - Notes finales

### 5. Évaluation des compétences
- **C1 : Analyser** (20 points)
  - Analyser le cahier des charges
  - Identifier les contraintes techniques
  - Proposer des solutions adaptées
  - Justifier les choix techniques

- **C3 : Organiser** (20 points)
  - Planifier les activités
  - Organiser le travail d'équipe
  - Gérer les ressources
  - Suivre l'avancement

- **C12 : Communiquer** (20 points)
  - Rédiger la documentation technique
  - Présenter les résultats
  - Argumenter les choix
  - Répondre aux questions

### 6. Gestion des documents
- Upload de documents par type et phase
- Formats supportés : PDF, DOC, DOCX, JPG, PNG, GIF
- Téléchargement et suppression de documents
- Organisation par étudiant et phase

## 🗂️ Structure de la base de données

### Tables principales
- `users` - Utilisateurs (professeurs)
- `projects` - Projets U52
- `students` - Étudiants
- `groups` - Groupes d'étudiants
- `phases` - Phases de l'épreuve
- `evaluations` - Évaluations des compétences
- `documents` - Documents uploadés

## 📱 Interface utilisateur

### Dashboard
- Vue d'ensemble des projets en cours
- Statistiques des projets actifs/terminés
- Informations sur l'épreuve U52
- Navigation rapide vers les fonctionnalités

### Responsive Design
- Interface adaptée aux tablettes et ordinateurs
- Navigation mobile optimisée
- Design moderne avec Tailwind CSS

## 🔧 Scripts disponibles

```bash
# Développement (frontend + backend)
npm run dev

# Serveur uniquement
npm run server

# Client uniquement
npm run client

# Build de production
npm run build

# Installation complète
npm run install-all
```

## 📁 Structure du projet

```
planning-epreuve-u52/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/         # Pages principales
│   │   ├── contexts/      # Contextes React
│   │   └── index.css      # Styles Tailwind
│   ├── public/            # Fichiers statiques
│   └── package.json
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── routes/        # Routes API
│   │   ├── database/      # Configuration DB
│   │   └── uploads/       # Documents uploadés
│   ├── database/          # Base SQLite
│   └── package.json
└── README.md
```

## 🚀 Déploiement

### Production
1. Build du frontend : `cd client && npm run build`
2. Configuration du serveur de production
3. Variables d'environnement pour la sécurité

### Docker (optionnel)
```dockerfile
# Dockerfile pour le déploiement
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Sécurité

- Authentification JWT
- Hashage des mots de passe avec bcrypt
- Validation des données côté serveur
- Protection contre les injections SQL
- Gestion sécurisée des uploads de fichiers

## 📈 Évolutions futures

- Export PDF des fiches de synthèse
- Génération de rapports Excel
- Notifications en temps réel
- API REST complète
- Interface mobile native
- Intégration avec les systèmes d'information

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**Développé pour l'enseignement en BTS Électrotechnique** ⚡ 