# 📄 Guide pour corriger le gabarit Word

## 📍 Emplacement du fichier
Le gabarit doit être placé dans : `client/public/Gabarit_tp.docx`

## ✅ Variables disponibles

Pour que la génération automatique fonctionne, votre gabarit Word doit contenir ces variables au format `{{nom_variable}}` (avec **doubles accolades**) :

### Variables principales
- `{{titre}}` - Titre de la fiche TP
- `{{sous_titre}}` - Sous-titre
- `{{duree}}` - Durée du TP (ex: "4 heures")
- `{{contexte}}` - Contexte de l'intervention
- `{{objectifs}}` - Objectifs pédagogiques
- `{{documents_texte}}` - Documents fournis
- `{{equipements_texte}}` - Matériel et équipements
- `{{taches_texte}}` - Tâches à réaliser
- `{{competences_texte}}` - Compétences évaluées
- `{{travail_demande_texte}}` - Travail demandé
- `{{criteres_evaluation_texte}}` - Critères d'évaluation
- `{{securite_texte}}` - Consignes de sécurité
- `{{date_du_jour}}` - Date du jour (format français)
- `{{annee_scolaire}}` - Année scolaire (ex: "2024-2025")
- `{{matiere}}` - Matière
- `{{nom_etudiant}}` - Nom de l'étudiant
- `{{prenom_etudiant}}` - Prénom de l'étudiant
- `{{classe_etudiant}}` - Classe de l'étudiant

## 🔧 Comment modifier votre gabarit

1. **Ouvrez** le fichier `client/public/Gabarit_tp.docx` avec Microsoft Word
2. **Placez le curseur** où vous voulez insérer une donnée
3. **Tapez** la variable entre **doubles accolades**, par exemple : `{{titre}}`
4. **Sauvegardez** le fichier
5. **Rechargez** la page web (Ctrl+F5)

## 📝 Exemple de structure

```
BTS ÉLECTROTECHNIQUE
{{titre}}
{{sous_titre}}

Durée : {{duree}}

1. CONTEXTE DE L'INTERVENTION
{{contexte}}

2. OBJECTIFS PÉDAGOGIQUES
{{objectifs}}

3. DOCUMENTS FOURNIS
{{documents_texte}}

4. MATÉRIEL ET ÉQUIPEMENTS
{{equipements_texte}}

5. TÂCHES À RÉALISER
{{taches_texte}}

6. COMPÉTENCES ÉVALUÉES
{{competences_texte}}

7. TRAVAIL DEMANDÉ
{{travail_demande_texte}}

8. CRITÈRES D'ÉVALUATION
{{criteres_evaluation_texte}}

9. CONSIGNES DE SÉCURITÉ
{{securite_texte}}

Date : {{date_du_jour}}
Année scolaire : {{annee_scolaire}}
```

## ⚠️ Points importants

- Les variables doivent être **exactement** au format `{{nom_variable}}` (avec **doubles accolades**)
- Les variables sont **sensibles à la casse** : `{{titre}}` ≠ `{{Titre}}`
- Si une variable n'est pas trouvée, elle sera remplacée par une chaîne vide
- Vous pouvez utiliser les mêmes variables plusieurs fois dans le document

## 📋 Format des listes

### Listes à puces (•)

Certaines variables sont automatiquement formatées avec des puces (une par ligne) :

- `{{documents_texte}}` - Documents fournis (avec puces)
- `{{equipements_texte}}` - Matériel et équipements (avec puces)
- `{{taches_texte}}` - Tâches à réaliser (avec puces)
- `{{competences_texte}}` - Compétences évaluées (avec puces)
- `{{criteres_evaluation_texte}}` - Critères d'évaluation (avec puces)
- `{{questions_controle}}` - Questions de contrôle (avec puces)

Ces variables affichent automatiquement chaque ligne avec une puce (•) devant.

### Liste numérotée (1., 2., 3., etc.)

**Format texte simple (recommandé)**
- `{{travail_demande_texte}}` - Travail demandé (texte avec numéros, une ligne par numéro)
- `{{securite_texte}}` - Consignes de sécurité (texte avec numéros, une ligne par numéro)

Ces variables affichent automatiquement chaque ligne avec un numéro (1., 2., 3., etc.), une ligne par numéro. Chaque ligne du texte dans la fiche TP devient une ligne numérotée dans le document Word généré.

**Format liste native Word (avancé)**
Pour avoir une vraie liste numérotée formatée dans Word avec la syntaxe Docxtemplater, utilisez cette syntaxe dans votre gabarit :

```
{#travail_demande}
{num}. {text}
{/travail_demande}
```

ou

```
{#securite}
{num}. {text}
{/securite}
```

Cela créera une liste numérotée native de Word avec des tableaux Docxtemplater.

## 🐛 En cas d'erreur

Si vous obtenez une erreur lors de la génération :

1. Vérifiez que le fichier `Gabarit_tp.docx` existe dans `client/public/`
2. Vérifiez que le fichier n'est pas corrompu (essayez de l'ouvrir avec Word)
3. Vérifiez que les variables sont au bon format `{{nom_variable}}` (avec doubles accolades)
4. Consultez la console du navigateur (F12) pour plus de détails
