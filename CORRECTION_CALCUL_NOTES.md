# Correction du calcul des notes globales

## Problème identifié
La note affichée dans la liste des grilles d'évaluation n'était **pas la même** que celle affichée dans le modal d'évaluation. Il y avait une incohérence dans le calcul de la note globale.

## Cause du problème
Il y avait **deux méthodes de calcul différentes** :

### 1. Méthode backend (correcte)
- Normalise chaque compétence sur 20, puis fait la moyenne
- C1: (score/5) × 20, C3: (score/5) × 20, C12: (score/10) × 20
- Puis moyenne des 3 notes normalisées

### 2. Méthode frontend (incorrecte)
- Additionne les scores bruts, additionne les max, puis pourcentage × 20
- Total: (C1 + C3 + C12) / (5 + 5 + 10) × 20

## Exemple de différence
Pour les scores C1=4/5, C3=3/5, C12=8/10 :

**Méthode backend** :
- C1 normalisé: (4/5)×20 = 16/20
- C3 normalisé: (3/5)×20 = 12/20  
- C12 normalisé: (8/10)×20 = 16/20
- Moyenne: (16+12+16)/3 = **14.67/20**

**Méthode frontend (ancienne)** :
- Total obtenu: 4+3+8 = 15
- Total maximal: 5+5+10 = 20
- Note: (15/20)×20 = **15.00/20**

**Différence** : 0.33 points sur 20 !

## Solutions implémentées

### 1. Correction du frontend - Liste des grilles
**Fichier** : `client/src/pages/Evaluations.js`
- Remplacement de la méthode d'addition des scores bruts
- Implémentation de la méthode de normalisation puis moyenne
- Cohérence avec le calcul backend

### 2. Correction du frontend - Modal d'évaluation
**Fichier** : `client/src/components/EvaluationGrid.js`
- Remplacement de la méthode d'addition des scores bruts
- Implémentation de la méthode de normalisation puis moyenne
- Prise en compte du mode d'évaluation (critères vs direct)

## Avantages de la nouvelle méthode

1. **Équité** : Chaque compétence a le même poids dans le calcul final
2. **Cohérence** : Même calcul partout (backend, liste, modal)
3. **Logique** : Normalisation sur 20 puis moyenne est plus intuitive
4. **Précision** : Arrondi à 2 décimales pour éviter les erreurs de calcul

## Tests effectués

Un script de test `test-score-calculation.js` a été créé pour vérifier :
- La cohérence entre les deux méthodes
- Les différents cas de figure (scores élevés, faibles, compétences manquantes)
- L'impact des différences sur les résultats

## Résultat
Maintenant, la note affichée dans la liste est **identique** à celle affichée dans le modal d'évaluation. Le calcul est cohérent partout dans l'application.

## Fichiers modifiés
- `client/src/pages/Evaluations.js` : Correction du calcul dans la liste
- `client/src/components/EvaluationGrid.js` : Correction du calcul dans le modal
- `test-score-calculation.js` : Script de test pour vérifier la cohérence

## Impact
- ✅ Notes cohérentes entre la liste et le modal
- ✅ Calcul plus équitable et logique
- ✅ Synchronisation parfaite avec le backend
- ✅ Aucune migration de données nécessaire
