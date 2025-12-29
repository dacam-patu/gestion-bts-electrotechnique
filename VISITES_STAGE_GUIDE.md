# 📋 Guide - Visites de Stage

## 🎯 **FONCTIONNALITÉ AJOUTÉE**

Cette fonctionnalité permet de **gérer les visites de stage** entre professeurs et tuteurs d'entreprise pour chaque étudiant en stage.

---

## 🚀 **ACCÈS À LA FONCTIONNALITÉ**

1. **Aller dans** le menu **"Stage en entreprise"** (ou "Rapport de Stage")
2. **Trouver** l'étudiant concerné dans le tableau
3. **Cliquer** sur le bouton **violet (icône Calendrier)** dans la colonne "Actions"
4. Le modal de gestion des visites s'ouvre pour cet étudiant

---

## ✨ **FONCTIONNALITÉS DISPONIBLES**

### **1. Planifier une visite**
- Cliquer sur "Planifier une nouvelle visite"
- Remplir le formulaire :
  - **Date de visite** (obligatoire)
  - **Type de visite** : Première visite / Visite de suivi / Visite finale
  - **Professeur référent** (obligatoire)
  - **Tuteur entreprise** (obligatoire)
  - **Observations** (optionnel)
- Cliquer sur "Ajouter"

### **2. Modifier une visite**
- Cliquer sur l'icône **crayon** (Edit) sur une visite existante
- Modifier les informations
- Cliquer sur "Modifier" pour sauvegarder

### **3. Marquer comme réalisée**
- Pour les visites planifiées, cliquer sur l'icône **check** (CheckCircle)
- Le statut passe automatiquement à "Réalisée"
- La date de réalisation est enregistrée

### **4. Supprimer une visite**
- Cliquer sur l'icône **corbeille** (Trash2)
- Confirmer la suppression

---

## 📊 **TYPES DE VISITES**

| Type | Description | Badge |
|------|-------------|-------|
| 🟣 **Première visite** | Vérification initiale du cadre de travail et des conditions de stage | Purple |
| 🟡 **Visite de suivi** | Évaluation intermédiaire de la progression de l'étudiant | Yellow |
| 🔵 **Visite finale** | Évaluation globale du stage et debriefing | Indigo |

---

## 🏷️ **STATUTS DES VISITES**

| Statut | Description | Badge |
|--------|-------------|-------|
| 🔵 **Planifiée** | Visite programmée mais pas encore effectuée | Blue |
| 🟢 **Réalisée** | Visite effectuée | Green |
| 🔴 **Annulée** | Visite annulée | Red |

---

## 🗄️ **BASE DE DONNÉES**

### **Table : `visites_stage`**

```sql
CREATE TABLE visites_stage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,              -- ID de l'étudiant
  date TEXT NOT NULL,                       -- Date de la visite planifiée
  type TEXT NOT NULL,                       -- Type: 'premiere', 'suivi', 'finale'
  professeur TEXT NOT NULL,                 -- Nom du professeur
  tuteur TEXT NOT NULL,                     -- Nom du tuteur entreprise
  observations TEXT,                        -- Observations/notes
  statut TEXT NOT NULL DEFAULT 'planifiee', -- Statut: 'planifiee', 'realisee', 'annulee'
  date_realisation TEXT,                    -- Date de réalisation effective
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

---

## 🔌 **API ENDPOINTS**

### **GET `/api/visites-stage/student/:studentId`**
Récupérer toutes les visites d'un étudiant
```json
Response: [
  {
    "id": 1,
    "student_id": 5,
    "date": "2024-10-15",
    "type": "premiere",
    "professeur": "M. Bernard",
    "tuteur": "M. Durand",
    "observations": "Première visite - Bon cadre de travail",
    "statut": "planifiee",
    "date_realisation": null,
    "created_at": "2024-10-12 10:30:00",
    "updated_at": "2024-10-12 10:30:00"
  }
]
```

### **POST `/api/visites-stage`**
Créer une nouvelle visite
```json
Request Body:
{
  "student_id": 5,
  "date": "2024-10-15",
  "type": "premiere",
  "professeur": "M. Bernard",
  "tuteur": "M. Durand",
  "observations": "Première visite",
  "statut": "planifiee"
}
```

### **PUT `/api/visites-stage/:id`**
Mettre à jour une visite
```json
Request Body:
{
  "date": "2024-10-16",
  "statut": "realisee"
}
```

### **DELETE `/api/visites-stage/:id`**
Supprimer une visite

### **GET `/api/visites-stage/stats/overview`**
Récupérer les statistiques globales
```json
Response:
{
  "total": 45,
  "planifiees": 12,
  "realisees": 30,
  "annulees": 3,
  "premieres": 15,
  "suivis": 20,
  "finales": 10
}
```

---

## 📁 **FICHIERS CRÉÉS/MODIFIÉS**

### **Frontend (React)**
- ✅ `client/src/components/VisitesStageModal.js` - Modal de gestion des visites
- ✅ `client/src/pages/RapportStage.js` - Ajout du bouton et intégration du modal
- ✅ `client/src/components/Layout.js` - Suppression du menu séparé
- ✅ `client/src/App.js` - Suppression de la route séparée

### **Backend (Node.js + Express)**
- ✅ `server/src/routes/visitesStage.js` - Routes API pour les visites
- ✅ `server/server.js` - Intégration de la route

### **Fichiers supprimés**
- ❌ `client/src/pages/VisitesStage.js` - Page autonome (non nécessaire)
- ❌ `client/src/components/VisiteCard.js` - Composant autonome (non nécessaire)
- ❌ `client/src/components/PlanningModal.js` - Modal générique (remplacé)

---

## 🎨 **INTERFACE UTILISATEUR**

### **Bouton dans le tableau**
```jsx
<button
  onClick={() => {
    setSelectedStudent(student);
    setShowVisitesModal(true);
  }}
  className="text-purple-600 hover:text-purple-900"
  title="Gérer les visites de stage"
>
  <Calendar className="h-4 w-4" />
</button>
```

### **Modal des visites**
- **Titre** : Nom de l'étudiant + Classe
- **Couleur** : Purple (cohérent avec l'icône)
- **Formulaire** : Champs de saisie pour une nouvelle visite
- **Liste** : Affichage des visites existantes avec badges de statut

---

## 🔧 **INTÉGRATION**

La fonctionnalité est **entièrement intégrée** dans le flux existant :
- ✅ Pas de menu séparé (conforme à la demande)
- ✅ Accessible directement depuis la page "Stage en entreprise"
- ✅ Utilise la base de données existante (`u52.db`)
- ✅ Respecte l'architecture MVC du projet
- ✅ Compatible avec le système d'authentification existant

---

## 📝 **VALIDATION**

### **Champs obligatoires**
- Date de visite
- Type de visite
- Professeur référent
- Tuteur entreprise

### **Contraintes**
- Type : `premiere`, `suivi`, ou `finale` uniquement
- Statut : `planifiee`, `realisee`, ou `annulee` uniquement
- Date minimale : date du jour (pas de visite dans le passé)

---

## 🚨 **GESTION DES ERREURS**

- **Champs manquants** : Message d'erreur clair
- **Type/Statut invalide** : Validation côté serveur
- **Visite introuvable** : Erreur 404
- **Erreur serveur** : Toast d'erreur affiché à l'utilisateur

---

## 🎯 **PROCHAINES AMÉLIORATIONS POSSIBLES**

1. **Notifications** : Rappels automatiques avant une visite
2. **Rapports PDF** : Génération de rapports de visite
3. **Calendrier** : Vue calendrier des visites planifiées
4. **Filtres** : Filtrer les visites par type, statut, professeur
5. **Export** : Exporter les visites en Excel/CSV
6. **Commentaires** : Ajouter des commentaires après chaque visite
7. **Photos** : Joindre des photos du lieu de stage
8. **Signatures** : Signature électronique du professeur et tuteur

---

## ✅ **STATUT DE LA FONCTIONNALITÉ**

**🎉 FONCTIONNALITÉ COMPLÈTE ET OPÉRATIONNELLE !**

Tous les composants sont en place :
- ✅ Interface utilisateur (React)
- ✅ API REST (Express)
- ✅ Base de données (SQLite)
- ✅ Validation des données
- ✅ Gestion des erreurs
- ✅ Documentation

**Prêt pour les tests et la mise en production !** 🚀

