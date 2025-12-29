# Guide des Numéros de Semaine - U52 BTS Électrotechnique

## 📋 Résumé de la Solution

J'ai recodé complètement le système de numérotation des semaines en utilisant la **norme ISO-8601** et créé une option pour basculer vers le **système scolaire français**.

## 🔧 Deux Systèmes Disponibles

### 1. **ISO-8601 (Standard International) - PAR DÉFAUT**
- ✅ **Semaine 1** = première semaine contenant le 4 janvier
- ✅ **Lundi** = premier jour de la semaine
- ✅ **Jeudi** = jour de référence pour déterminer l'année
- ✅ **Standard international** reconnu partout

**Exemples pour 2025-2026 :**
- Août 2025 : semaines 31-35
- Décembre 2025 : semaines 49-53
- Janvier 2026 : semaines 1-5
- Juillet 2026 : semaines 26-30

### 2. **Système Scolaire Français (Optionnel)**
- 🎓 **Août-Décembre** : semaines 31-52
- 🎓 **Janvier-Juillet** : semaines 1-30
- 🎓 **Lundi** = premier jour de la semaine
- 🎓 **Adapté au contexte éducatif français**

**Exemples pour 2025-2026 :**
- Août 2025 : semaines 31-35
- Décembre 2025 : semaines 48-52
- Janvier 2026 : semaines 1-5
- Juillet 2026 : semaines 26-30

## ⚙️ Comment Changer de Système

Dans le fichier `client/src/components/HyperPlanningView.js`, ligne ~120 :

```javascript
const getCivilWeekNumber = (date) => {
  const useSchoolSystem = false; // Changez à true pour le système scolaire
  
  if (useSchoolSystem) {
    return getSchoolWeekNumber(date);
  } else {
    return getISOWeekNumber(date);
  }
};
```

**Pour utiliser le système scolaire :**
- Changez `useSchoolSystem = false` en `useSchoolSystem = true`

**Pour utiliser ISO-8601 (recommandé) :**
- Laissez `useSchoolSystem = false`

## 📊 Résultats des Tests

### Test ISO-8601 (Actuel)
```
Août 2025, semaine du 4 août : Semaine 32
Décembre 2025, semaine du 29 décembre : Semaine 53
Janvier 2026, semaine du 5 janvier : Semaine 2
Juillet 2026, semaine du 28 juillet : Semaine 30
```

### Test Système Scolaire
```
Août 2025, semaine du 4 août : Semaine 31
Décembre 2025, semaine du 29 décembre : Semaine 52
Janvier 2026, semaine du 5 janvier : Semaine 1
Juillet 2026, semaine du 28 juillet : Semaine 30
```

## 🎯 Recommandation

**Je recommande d'utiliser ISO-8601** car :
1. ✅ C'est le standard international
2. ✅ Compatible avec tous les logiciels
3. ✅ Logique cohérente toute l'année
4. ✅ Pas de "saut" de numérotation

## 🔄 Prochaines Étapes

1. **Testez l'application** avec ISO-8601 (actuel)
2. **Si vous préférez le système scolaire**, changez `useSchoolSystem = true`
3. **Relancez l'application** pour voir les changements
4. **Validez** que les numéros correspondent à vos attentes

## 📞 Support

Si vous avez des questions ou souhaitez ajuster le système, n'hésitez pas à me le dire !
