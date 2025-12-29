# 🏢 Guide de la Gestion des Stages par Classe et Session

## 📋 Description

La page "Stage en entreprise" a été améliorée pour permettre une gestion organisée des stages par classe et par session, avec des filtres avancés pour faciliter la navigation et l'organisation.

## ✨ Nouvelles Fonctionnalités

### 🔍 Filtres Avancés
- **Filtre par Classe** : Sélectionner une classe spécifique pour voir uniquement ses étudiants
- **Filtre par Session** : Filtrer par année scolaire (2024-2025, 2025-2026, 2026-2027)
- **Recherche textuelle** : Rechercher par nom, prénom ou classe
- **Bouton Réinitialiser** : Effacer tous les filtres d'un clic

### 📊 Affichage Organisé par Groupes
- **Groupes automatiques** : Les étudiants sont automatiquement groupés par classe et session
- **En-têtes de groupe** : Chaque groupe affiche :
  - Nom de la classe avec icône Building
  - Session avec icône Calendar
  - Nombre d'étudiants dans le groupe
- **Tri intelligent** : Les groupes sont triés par session (récentes en premier) puis par classe

### 🎨 Interface Améliorée
- **Design moderne** : En-têtes de groupe avec dégradé bleu
- **Statistiques visuelles** : Compteur d'étudiants par groupe
- **Navigation intuitive** : Filtres clairement organisés
- **Messages informatifs** : Affichage des filtres actifs dans le titre

## 🚀 Comment utiliser

### 1. Accéder aux filtres
1. Allez dans **"Stage en entreprise"**
2. Dans l'onglet **"Étudiants"**, vous verrez :
   - Barre de recherche en haut
   - Filtres par classe et session en dessous

### 2. Filtrer par classe
1. Dans le dropdown **"Classe"**
2. Sélectionnez une classe spécifique (ex: "STS ELEC1", "STS ELEC2")
3. Seuls les étudiants de cette classe s'affichent

### 3. Filtrer par session
1. Dans le dropdown **"Session"**
2. Sélectionnez une année scolaire (ex: "2025-2026")
3. Seuls les étudiants de cette session s'affichent

### 4. Recherche textuelle
1. Tapez dans le champ **"Rechercher un étudiant..."**
2. La recherche porte sur :
   - Prénom de l'étudiant
   - Nom de l'étudiant
   - Classe de l'étudiant

### 5. Combiner les filtres
- Vous pouvez combiner tous les filtres
- Exemple : Classe "STS ELEC1" + Session "2025-2026" + Recherche "Martin"

### 6. Réinitialiser
1. Cliquez sur **"Réinitialiser"** pour effacer tous les filtres
2. Tous les étudiants redeviennent visibles

## 📊 Organisation des Données

### Structure des Groupes
```
Session 2025-2026
├── STS ELEC1 (15 étudiants)
├── STS ELEC2 (12 étudiants)
└── STSELE2AP (8 étudiants)

Session 2024-2025
├── STS ELEC1 (18 étudiants)
└── STS ELEC2 (14 étudiants)
```

### Affichage par Groupe
Chaque groupe affiche :
- **En-tête coloré** avec nom de classe et session
- **Compteur d'étudiants** dans le groupe
- **Tableau détaillé** avec toutes les informations de stage

## 🔧 Implémentation technique

### Frontend (React)
- **Fichier modifié** : `client/src/pages/RapportStage.js`
- **Nouveaux états** :
  - `selectedClass` : Classe sélectionnée pour le filtre
  - `selectedSession` : Session sélectionnée pour le filtre
- **Nouvelles fonctions** :
  - Logique de filtrage combinée (recherche + classe + session)
  - Groupement automatique par classe et session
  - Tri intelligent des groupes

### Logique de Filtrage
```javascript
const filteredStudents = students.filter(student => {
  // Filtre par recherche textuelle
  const matchesSearch = searchTerm === '' || 
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class?.toLowerCase().includes(searchTerm.toLowerCase());
  
  // Filtre par classe
  const matchesClass = selectedClass === '' || student.class === selectedClass;
  
  // Filtre par session (année scolaire)
  const matchesSession = selectedSession === '' || student.school_year === selectedSession;
  
  return matchesSearch && matchesClass && matchesSession;
});
```

### Groupement des Données
```javascript
const groupedStudents = filteredStudents.reduce((groups, student) => {
  const key = `${student.school_year || 'Non défini'}-${student.class || 'Non défini'}`;
  if (!groups[key]) {
    groups[key] = {
      session: student.school_year || 'Non défini',
      class: student.class || 'Non défini',
      students: []
    };
  }
  groups[key].students.push(student);
  return groups;
}, {});
```

## 🎯 Cas d'usage

### 1. Gestion par classe
**Scénario** : L'enseignant veut voir tous les stages de la classe STS ELEC1
1. Sélectionner "STS ELEC1" dans le filtre Classe
2. Tous les étudiants de cette classe s'affichent groupés par session

### 2. Gestion par session
**Scénario** : Voir tous les stages de l'année 2025-2026
1. Sélectionner "2025-2026" dans le filtre Session
2. Tous les étudiants de cette session s'affichent groupés par classe

### 3. Recherche spécifique
**Scénario** : Trouver un étudiant particulier
1. Taper le nom dans la recherche
2. L'étudiant apparaît dans son groupe respectif

### 4. Vue d'ensemble
**Scénario** : Voir tous les stages de toutes les classes
1. Laisser tous les filtres vides
2. Tous les étudiants s'affichent organisés par groupe

## 📱 Interface Utilisateur

### Filtres
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 [Rechercher un étudiant...                    ]          │
├─────────────────────────────────────────────────────────────┤
│ Classe: [Toutes les classes ▼]  Session: [Toutes ▼] [Reset] │
└─────────────────────────────────────────────────────────────┘
```

### Groupes
```
┌─────────────────────────────────────────────────────────────┐
│ 🏢 STS ELEC1  📅 Session 2025-2026           15 étudiants   │
├─────────────────────────────────────────────────────────────┤
│ Étudiant    │ Entreprise │ Adresse │ Tél │ Tuteur │ Actions │
│ Martin Dupont│ Entreprise X│ Adresse │ 01...│ Jean Y │ [👁️]  │
│ ...         │ ...        │ ...     │ ... │ ...    │ ...     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Maintenance

### Ajouter une nouvelle session
Pour ajouter une nouvelle session, modifiez le dropdown dans le code :

```javascript
<select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
  <option value="">Toutes les sessions</option>
  <option value="2024-2025">2024-2025</option>
  <option value="2025-2026">2025-2026</option>
  <option value="2026-2027">2026-2027</option>
  <option value="2027-2028">2027-2028</option> {/* ✅ Nouvelle session */}
</select>
```

### Modifier l'ordre de tri
Pour changer l'ordre d'affichage des groupes :

```javascript
const sortedGroups = Object.values(groupedStudents).sort((a, b) => {
  if (a.session !== b.session) {
    return a.session.localeCompare(b.session); // Ordre croissant
    // return b.session.localeCompare(a.session); // Ordre décroissant
  }
  return a.class.localeCompare(b.class);
});
```

## 🐛 Résolution de problèmes

### Problème : Aucun étudiant ne s'affiche
**Solution** : Vérifiez que les filtres ne sont pas trop restrictifs. Cliquez sur "Réinitialiser".

### Problème : Les classes ne s'affichent pas dans le dropdown
**Solution** : Vérifiez que les étudiants ont bien un champ `class` renseigné en base de données.

### Problème : Les sessions ne s'affichent pas
**Solution** : Vérifiez que les étudiants ont bien un champ `school_year` renseigné.

## 📝 Notes importantes

- ✅ **Filtres combinés** : Tous les filtres fonctionnent ensemble
- ✅ **Performance** : Le groupement est optimisé pour de grandes listes
- ✅ **Tri intelligent** : Sessions récentes en premier, puis tri alphabétique des classes
- ✅ **Interface responsive** : Fonctionne sur tous les écrans
- ✅ **Accessibilité** : Labels clairs et navigation au clavier

---

**Développé pour U52 BTS Électrotechnique** 🎓
