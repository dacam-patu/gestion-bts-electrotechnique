import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Printer, 
  X
} from 'lucide-react';
import EvaluationPrint from './EvaluationPrint';

const EvaluationGrid = ({ 
  student, 
  competences = null,
  evaluation = null,
  evaluationType = "U52",
  onSave, 
  onCancel,
  initialShowPrintPreview = false
}) => {
  const [evaluations, setEvaluations] = useState({});
  const [globalScore, setGlobalScore] = useState(0);
  const [globalComments, setGlobalComments] = useState('');
  const [evaluationDateTime, setEvaluationDateTime] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityType, setActivityType] = useState(''); // 'entreprise' ou 'centre'
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(initialShowPrintPreview);
  const [evaluationMode, setEvaluationMode] = useState('criteria'); // 'criteria' ou 'direct'
  const [directNotes, setDirectNotes] = useState({}); // Pour stocker les notes directes N1, N2, N3, N4
  
  // Debug: log des changements d'état (removed to prevent infinite loops)
  
  // Effet pour ouvrir automatiquement l'impression si initialShowPrintPreview est true
  useEffect(() => {
    if (initialShowPrintPreview && isDataLoaded) {
      console.log('🖨️ Ouverture automatique de l\'impression - données chargées');
      setShowPrintPreview(true);
    }
  }, [initialShowPrintPreview, isDataLoaded]);
  const printRef = useRef(null);

  // Compétences par défaut pour U52 (rétrocompatibilité) et U51
  const defaultCompetences = evaluationType === 'U51' ? {
    C2: { name: 'Extraire les informations nécessaires à la réalisation des tâches', maxScore: 5, description: 'Analyser la demande client et extraire les informations techniques nécessaires' },
    C13: { name: 'Mesurer les grandeurs caractéristiques d\'un ouvrage, d\'une installation, d\'un équipement électrique', maxScore: 5, description: 'Effectuer des mesures et contrôles sur des installations électriques' },
    C17: { name: 'Réaliser un diagnostic de performance y compris énergétique, de sécurité, d\'un ouvrage, d\'une installation, d\'un équipement électrique', maxScore: 5, description: 'Diagnostiquer les performances et proposer des améliorations' },
    C18: { name: 'Réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique', maxScore: 5, description: 'Effectuer la maintenance préventive et corrective' }
  } : {
    C1: { name: 'Organisation et planification', maxScore: 5, description: 'Planifier et organiser les activités en tenant compte des contraintes réglementaires, de sécurité et des ressources disponibles' },
    C3: { name: 'Gestion des risques et sécurité', maxScore: 5, description: 'Identifier, évaluer et gérer les risques, proposer des solutions de prévention et adapter les activités aux circonstances' },
    C12: { name: 'Conduite de projet', maxScore: 10, description: 'Piloter un projet de bout en bout, coordonner les équipes, gérer les délais et les ressources, assurer la qualité et la communication' }
  };

  // Structure complète des critères pour chaque compétence (U52 par défaut, U51 si spécifié)
  const defaultCompleteCriteria = useMemo(() => {
    const baseCriteria = evaluationType === 'U51' ? {
      // Critères U51 - Correspondance exacte avec la feuille d'impression
      C2: {
        'La demande client/utilisateur est analysée': { N1: false, N2: false, N3: false, N4: false },
        'Les informations nécessaires à l\'analyse et aux mesures sont extraites des documents': { N1: false, N2: false, N3: false, N4: false },
        'Les informations relatives aux prescriptions techniques et aux réglementations sont recueillies': { N1: false, N2: false, N3: false, N4: false },
        'Les conditions de la maintenance sont prises en compte': { N1: false, N2: false, N3: false, N4: false },
        'Les risques professionnels sont identifiés': { N1: false, N2: false, N3: false, N4: false },
        'Les habilitations et les certifications sont vérifiées': { N1: false, N2: false, N3: false, N4: false },
        'Les informations écrites et orales nécessaires sont collectées et hiérarchisées': { N1: false, N2: false, N3: false, N4: false },
        'Les informations écrites et orales collectées sont pertinentes pour l\'activité': { N1: false, N2: false, N3: false, N4: false }
      },
      C13: {
        'La procédure définie est appliquée': { N1: false, N2: false, N3: false, N4: false },
        'L\'installation et l\'environnement de travail sont pris en compte': { N1: false, N2: false, N3: false, N4: false },
        'Le niveau d\'habilitation nécessaire avant l\'intervention est déterminé': { N1: false, N2: false, N3: false, N4: false },
        'Les actions de prévention et de sécurité sont mises en œuvre': { N1: false, N2: false, N3: false, N4: false },
        'Les appareils de mesures sont installés': { N1: false, N2: false, N3: false, N4: false },
        'Les mesures sont collectées': { N1: false, N2: false, N3: false, N4: false },
        'Les enregistrements sont réalisés': { N1: false, N2: false, N3: false, N4: false },
        'Les informations venant des objets connectés sont exploitées': { N1: false, N2: false, N3: false, N4: false },
        'Les contrôles (locaux ou à distance) sont effectués': { N1: false, N2: false, N3: false, N4: false },
        'Les essais associés sont effectués': { N1: false, N2: false, N3: false, N4: false }
      },
      C17: {
        'Le processus de diagnostic est appliqué': { N1: false, N2: false, N3: false, N4: false },
        'Les conditions de la maintenance sont prises en compte': { N1: false, N2: false, N3: false, N4: false },
        'Le niveau d\'habilitation nécessaire est déterminé': { N1: false, N2: false, N3: false, N4: false },
        'Les appareils de mesures sont sélectionnés et installés': { N1: false, N2: false, N3: false, N4: false },
        'Les actions de prévention et de sécurité sont mises en œuvre': { N1: false, N2: false, N3: false, N4: false },
        'Les mesures sont collectées et enregistrées': { N1: false, N2: false, N3: false, N4: false },
        'Les informations venant des objets connectés sont collectées et enregistrées': { N1: false, N2: false, N3: false, N4: false },
        'Le diagnostic est pertinent': { N1: false, N2: false, N3: false, N4: false },
        'Suite au diagnostic, des modifications de l\'installation sont proposées': { N1: false, N2: false, N3: false, N4: false },
        'Suite au diagnostic, des recommandations, des réglages, des améliorations de l\'installation sont proposées': { N1: false, N2: false, N3: false, N4: false }
      },
      C18: {
        'Le protocole de maintenance est pris en compte': { N1: false, N2: false, N3: false, N4: false },
        'Le niveau d\'habilitation nécessaire est déterminé': { N1: false, N2: false, N3: false, N4: false },
        'Les actions de prévention et de sécurité sont mises en œuvre': { N1: false, N2: false, N3: false, N4: false },
        'La zone d\'intervention est préparée': { N1: false, N2: false, N3: false, N4: false },
        'Les opérations de maintenance préventive sont réalisées': { N1: false, N2: false, N3: false, N4: false },
        'Le dysfonctionnement est diagnostiqué': { N1: false, N2: false, N3: false, N4: false },
        'Les opérations de dépannage sont réalisées': { N1: false, N2: false, N3: false, N4: false },
        'Les contrôles (locaux ou à distance) sont effectués': { N1: false, N2: false, N3: false, N4: false },
        'Les essais associés sont effectués': { N1: false, N2: false, N3: false, N4: false },
        'Le fonctionnement de l\'installation est vérifié par rapport aux prescriptions': { N1: false, N2: false, N3: false, N4: false },
        'Les fiches de contrôles, carnet de maintenance et/ou applications spécifiques sont complétées': { N1: false, N2: false, N3: false, N4: false }
      }
    } : {
      // Critères U52 (par défaut)
      C1: {
        'Les contraintes et ressources normatives et règlementaires dont celles liées à la qualité, la sécurité, la santé et l\'environnement sont prises en compte tout au long du projet/chantier': { N1: false, N2: false, N3: false, N4: false },
        'Les tâches sont réparties en fonction des habilitations, des certifications des équipiers en tenant compte du planning des autres intervenants (monteur-câbleurs, autres corps d\'état, sous-traitants)': { N1: false, N2: false, N3: false, N4: false },
        'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement applicable dans le cadre du projet/chantier': { N1: false, N2: false, N3: false, N4: false },
        'La bonne utilisation des dispositifs de protection des personnes et des biens est contrôlée': { N1: false, N2: false, N3: false, N4: false }
      },
      C3: {
        'Les différentes étapes de l\'activité sont adaptées pour tenir compte des nouvelles solutions retenues et des circonstances': { N1: false, N2: false, N3: false, N4: false },
        'Des solutions pour pallier les aléas sont proposées à la hiérarchie': { N1: false, N2: false, N3: false, N4: false },
        'La mise en œuvre des mesures de prévention est prévue': { N1: false, N2: false, N3: false, N4: false },
        'La présence des dispositifs de protection des personnes et des biens est contrôlée': { N1: false, N2: false, N3: false, N4: false },
        'Les dispositifs de protection des personnes et des biens sont utilisés': { N1: false, N2: false, N3: false, N4: false },
        'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement, applicables dans le cadre du projet/chantier': { N1: false, N2: false, N3: false, N4: false },
        'Toutes les règles de santé, de sécurité et d\'environnement sont respectées tout au long du projet/chantier': { N1: false, N2: false, N3: false, N4: false },
        'Les risques liés à l\'activité sont identifiés et recensés': { N1: false, N2: false, N3: false, N4: false },
        'Des solutions pour prévenir les risques sont proposées et validées': { N1: false, N2: false, N3: false, N4: false },
        'Les aléas sont gérés': { N1: false, N2: false, N3: false, N4: false }
      },
      C12: {
        'Les informations écrites et orales relatives au projet/chantier sont collectées': { N1: false, N2: false, N3: false, N4: false },
        'La liste et la disponibilité des matériels, équipements, outillages et outils numériques nécessaires sont vérifiées': { N1: false, N2: false, N3: false, N4: false },
        'L\'intervention est planifiée': { N1: false, N2: false, N3: false, N4: false },
        'La durée du projet/chantier est évaluée': { N1: false, N2: false, N3: false, N4: false },
        'Les approvisionnements sont planifiés': { N1: false, N2: false, N3: false, N4: false },
        'Le projet/chantier est organisé pour qu\'il soit mené de manière éco-responsable': { N1: false, N2: false, N3: false, N4: false },
        'Les tâches sont réparties en fonction des habilitations, des certifications des équipiers en tenant compte du planning des autres intervenants': { N1: false, N2: false, N3: false, N4: false },
        'Les revues de projet sont effectuées': { N1: false, N2: false, N3: false, N4: false },
        'Les situations imprévues, délicates, conflictuelles sont gérées en lien avec la hiérarchie': { N1: false, N2: false, N3: false, N4: false },
        'Les arbitrages nécessaires en fonction des contraintes rencontrées sont pris': { N1: false, N2: false, N3: false, N4: false },
        'Les différentes étapes du planning sont respectées ou adaptées': { N1: false, N2: false, N3: false, N4: false },
        'La qualité et la conformité des travaux réalisés, y compris par la sous-traitance, sont contrôlées': { N1: false, N2: false, N3: false, N4: false },
        'Les indicateurs (coûts, délais, qualité) de suivi du projet/chantier sont renseignés': { N1: false, N2: false, N3: false, N4: false },
        'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement, applicables dans le cadre du projet/chantier': { N1: false, N2: false, N3: false, N4: false },
        'Les dispositifs de protection des personnes et des biens sont présents et bien utilisés': { N1: false, N2: false, N3: false, N4: false },
        'Les règles de santé, de sécurité et environnementales sont respectées tout au long du projet/chantier': { N1: false, N2: false, N3: false, N4: false },
        'L\'équipe est animée pour mener à bien le projet/chantier': { N1: false, N2: false, N3: false, N4: false }
      }
    };

    // Ajouter le champ 'evaluated: true' à tous les critères
    const criteriaWithEvaluated = {};
    Object.keys(baseCriteria).forEach(competence => {
      criteriaWithEvaluated[competence] = {};
      Object.keys(baseCriteria[competence]).forEach(criteria => {
        criteriaWithEvaluated[competence][criteria] = {
          evaluated: true,
          ...baseCriteria[competence][criteria]
        };
      });
    });

    return criteriaWithEvaluated;
  }, []);

  // Utiliser les compétences passées en paramètres ou les compétences par défaut
  const competenceInfo = competences || defaultCompetences;
  
  // Debug pour voir ce qui se passe (désactivé)
  // console.log('🔍 competenceInfo:', competenceInfo);
  // console.log('🔍 competences prop:', competences);
  // console.log('🔍 defaultCompetences:', defaultCompetences);
  
  // Construire les critères complets basés sur les compétences
  const completeCriteria = useMemo(() => {
    if (competences) {
      // Pour les nouvelles évaluations (U51, etc.), construire les critères à partir des indicateurs
      const criteria = {};
      Object.keys(competences).forEach(competenceKey => {
        const competence = competences[competenceKey];
        criteria[competenceKey] = {};
        competence.indicators.forEach(indicator => {
          // Pour une nouvelle évaluation, toutes les cases sont vides (pas de croix)
          criteria[competenceKey][indicator] = { 
            evaluated: true, 
            N1: false, 
            N2: false, 
            N3: false, 
            N4: false 
          };
        });
      });
      // console.log('🔍 completeCriteria (from competences):', criteria);
      return criteria;
    } else {
      // Pour les évaluations U52 existantes
      // console.log('🔍 completeCriteria (from default):', defaultCompleteCriteria);
      return defaultCompleteCriteria;
    }
  }, [competences, defaultCompleteCriteria]);

  // Initialiser les évaluations avec la structure complète des critères
  const initializeEvaluations = useCallback(() => {
    if (!competenceInfo || Object.keys(competenceInfo).length === 0) {
      return;
    }
    
    const initialEvaluations = {};
    const initialDirectNotes = {};
    
    Object.keys(competenceInfo).forEach(competence => {
      initialEvaluations[competence] = {
        score: 0,
        comments: '',
        criteria: { ...completeCriteria[competence] || {} }
      };
      
      // Initialiser les notes directes
      initialDirectNotes[competence] = {
        N1: false,
        N2: false,
        N3: false,
        N4: false
      };
    });
    
    setEvaluations(initialEvaluations);
    setDirectNotes(initialDirectNotes);
    
    // Initialiser la date/heure et les champs d'activité pour une nouvelle évaluation
    if (!evaluation) {
      const now = new Date();
      const formattedDateTime = now.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
      setEvaluationDateTime(formattedDateTime);
      setActivityName('');
      setActivityType('');
    }
    
    setIsDataLoaded(true);
    
  }, [competenceInfo, completeCriteria, evaluation]);

  // Calculer la note globale
  // Calculer et mettre à jour la note globale directement dans useEffect
  useEffect(() => {
    if (!evaluations || Object.keys(evaluations).length === 0) {
      setGlobalScore(0);
      return;
    }
    
    // Calculer la note globale avec la même logique que le backend
    // Normaliser chaque compétence sur 20, puis faire la moyenne
    const validScores = [];
    
    Object.entries(evaluations).forEach(([competence, data]) => {
      // Ignorer la compétence GLOBAL si elle existe
      if (competence === 'GLOBAL') return;
      
      const maxScore = (competenceInfo[competence] || {}).maxScore || 0;
      let score = data.score || 0;
      
      // En mode direct, calculer le score à partir des notes directes
      if (evaluationMode === 'direct' && directNotes[competence]) {
        const directNote = directNotes[competence];
        
        if (directNote.N1) {
          score = 0; // 0%
        } else if (directNote.N2) {
          score = maxScore * 0.4; // 40%
        } else if (directNote.N3) {
          score = maxScore * 0.75; // 75%
        } else if (directNote.N4) {
          score = maxScore; // 100%
        } else {
          score = 0; // Aucune note sélectionnée
        }
      }
      
      // Normaliser chaque compétence sur 20 si elle a un score
      if (score > 0 && maxScore > 0) {
        const normalizedScore = (score / maxScore) * 20;
        validScores.push(normalizedScore);
      }
    });
    
    // Calculer la moyenne des scores normalisés
    const noteGlobale = validScores.length > 0 
      ? Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 100) / 100
      : 0;
    
    setGlobalScore(noteGlobale);
  }, [evaluations, competenceInfo, evaluationMode, directNotes]);



  // Charger une évaluation existante SPECIFIQUE (pour modification seulement)
  const loadExistingEvaluation = useCallback(async () => {
    if (!student?.id || !evaluation) return;
    
    // Réinitialiser l'état de chargement
    setIsDataLoaded(false);
    
    try {
      // Utiliser directement les données passées en paramètre si disponibles
      if (evaluation.existingScores) {
        console.log('📊 Chargement des données existantes depuis les paramètres:', evaluation.existingScores);
        
        const reconstructedEvaluations = {};
        
        Object.entries(evaluation.existingScores).forEach(([competence, data]) => {
          // Commencer avec les critères par défaut
          const reconstructedCriteria = { ...completeCriteria[competence] || {} };
          
          // Si on a des données de critères sauvegardées, les appliquer
          if (data.criteria && typeof data.criteria === 'string') {
            try {
              const parsedCriteria = JSON.parse(data.criteria);
              Object.entries(parsedCriteria).forEach(([criteria, levels]) => {
                if (reconstructedCriteria[criteria]) {
                  // S'assurer que tous les niveaux sont présents
                  reconstructedCriteria[criteria] = {
                    evaluated: levels.evaluated !== false,
                    N1: levels.N1 || false,
                    N2: levels.N2 || false,
                    N3: levels.N3 || false,
                    N4: levels.N4 || false
                  };
                }
              });
            } catch (error) {
              console.error('Erreur lors du parsing des critères:', error);
            }
          }
          
          reconstructedEvaluations[competence] = {
            criteria: reconstructedCriteria,
            score: data.score || 0,
            comments: data.comments || ''
          };
        });
        
        setEvaluations(reconstructedEvaluations);
          
        // Récupérer les autres données
        if (evaluation.evaluated_at) {
          const existingDateTime = new Date(evaluation.evaluated_at);
          const formattedDateTime = existingDateTime.toISOString().slice(0, 16);
          setEvaluationDateTime(formattedDateTime);
        }
        
        if (evaluation.activity_name) {
          setActivityName(evaluation.activity_name);
        }
        if (evaluation.activity_type) {
          // Gérer la rétrocompatibilité avec les anciennes valeurs
          if (evaluation.activity_type === 'entreprise') {
            setActivityType('Activités observées en entreprise');
          } else if (evaluation.activity_type === 'centre') {
            setActivityType('Activités observées en centre de formation');
          } else {
            setActivityType(evaluation.activity_type);
          }
        }
        
        // Charger les commentaires généraux
        if (evaluation.global_comments) {
          setGlobalComments(evaluation.global_comments);
        }
        
        // Détecter si l'évaluation a été faite en mode direct
        // Si une compétence a un score mais aucun critère évalué, c'est probablement du mode direct
        const detectedDirectNotes = {};
        let hasDirectMode = false;
        
        Object.entries(reconstructedEvaluations).forEach(([competence, data]) => {
          // Initialiser les notes directes pour toutes les compétences
          detectedDirectNotes[competence] = {
            N1: false,
            N2: false,
            N3: false,
            N4: false
          };
          
          if (data.score > 0) {
            // Vérifier si des critères sont évalués
            const hasEvaluatedCriteria = Object.values(data.criteria || {}).some(criteria => 
              criteria && criteria.evaluated !== false && (
                criteria.N1 || criteria.N2 || criteria.N3 || criteria.N4
              )
            );
            
            console.log(`🔍 Vérification ${competence}: score=${data.score}, hasEvaluatedCriteria=${hasEvaluatedCriteria}`);
            
            if (!hasEvaluatedCriteria) {
              // Probablement du mode direct, essayer de deviner le niveau
              const maxScore = competenceInfo[competence]?.maxScore || 0;
              const percentage = (data.score / maxScore) * 100;
              
              if (percentage <= 25) {
                detectedDirectNotes[competence].N1 = true;
              } else if (percentage <= 50) {
                detectedDirectNotes[competence].N2 = true;
              } else if (percentage <= 75) {
                detectedDirectNotes[competence].N3 = true;
              } else {
                detectedDirectNotes[competence].N4 = true;
              }
              
              hasDirectMode = true;
              console.log(`🔍 Détection mode direct pour ${competence}: score ${data.score}/${maxScore} (${percentage.toFixed(1)}%) -> ${detectedDirectNotes[competence].N1 ? 'N1' : detectedDirectNotes[competence].N2 ? 'N2' : detectedDirectNotes[competence].N3 ? 'N3' : 'N4'}`);
            }
          }
        });
        
        // Toujours initialiser les notes directes (même si pas en mode direct)
        setDirectNotes(detectedDirectNotes);
        
        if (hasDirectMode) {
          setEvaluationMode('direct');
          console.log('✅ Mode direct détecté et appliqué');
        } else {
          setEvaluationMode('criteria');
          console.log('✅ Mode critères détecté et appliqué');
        }
        
        // Marquer que les données ont été chargées
        console.log('✅ setIsDataLoaded(true) appelé - première branche');
        setIsDataLoaded(true);
        return;
      }
      
      // Fallback: faire un appel API si les données ne sont pas dans les paramètres
      const response = await axios.get(`/api/evaluations/student/${student.id}`);
      
      if (response.data.success && response.data.data) {
        // Filtrer seulement les évaluations de la session spécifique en cours de modification
        const evaluationsData = response.data.data.filter(evalData => 
          evalData.type === evaluationType && 
          evalData.evaluated_at === evaluation.evaluated_at
        );

        if (evaluationsData.length > 0) {
          const reconstructedEvaluations = {};
          
          evaluationsData.forEach(evalData => {
            const competence = evalData.competence;
            const originalCriteria = completeCriteria[competence] || {};
            
            // Reconstruire les critères avec les données sauvegardées
            const reconstructedCriteria = { ...originalCriteria };
            
            // Si on a des données de critères sauvegardées, les appliquer
            if (evalData.criteria) {
              try {
                const savedCriteria = JSON.parse(evalData.criteria);
                Object.entries(savedCriteria).forEach(([criteria, levels]) => {
                  if (reconstructedCriteria[criteria]) {
                    reconstructedCriteria[criteria] = { ...levels };
                  }
                });
              } catch (e) {
                console.error('Erreur lors du parsing des critères:', e);
              }
            }
            
            reconstructedEvaluations[competence] = {
              criteria: reconstructedCriteria,
              score: evalData.score || 0,
              comments: evalData.comments || ''
            };
          });
          
          setEvaluations(reconstructedEvaluations);
          
          // Détecter si l'évaluation a été faite en mode direct (même logique que plus haut)
          const detectedDirectNotes = {};
          let hasDirectMode = false;
          
          Object.entries(reconstructedEvaluations).forEach(([competence, data]) => {
            // Initialiser les notes directes pour toutes les compétences
            detectedDirectNotes[competence] = {
              N1: false,
              N2: false,
              N3: false,
              N4: false
            };
            
            if (data.score > 0) {
              // Vérifier si des critères sont évalués
              const hasEvaluatedCriteria = Object.values(data.criteria || {}).some(criteria => 
                criteria && criteria.evaluated !== false && (
                  criteria.N1 || criteria.N2 || criteria.N3 || criteria.N4
                )
              );
              
              console.log(`🔍 Vérification API ${competence}: score=${data.score}, hasEvaluatedCriteria=${hasEvaluatedCriteria}`);
              
              if (!hasEvaluatedCriteria) {
                // Probablement du mode direct, essayer de deviner le niveau
                const maxScore = competenceInfo[competence]?.maxScore || 0;
                const percentage = (data.score / maxScore) * 100;
                
                if (percentage <= 25) {
                  detectedDirectNotes[competence].N1 = true;
                } else if (percentage <= 50) {
                  detectedDirectNotes[competence].N2 = true;
                } else if (percentage <= 75) {
                  detectedDirectNotes[competence].N3 = true;
                } else {
                  detectedDirectNotes[competence].N4 = true;
                }
                
                hasDirectMode = true;
                console.log(`🔍 Détection mode direct API pour ${competence}: score ${data.score}/${maxScore} (${percentage.toFixed(1)}%) -> ${detectedDirectNotes[competence].N1 ? 'N1' : detectedDirectNotes[competence].N2 ? 'N2' : detectedDirectNotes[competence].N3 ? 'N3' : 'N4'}`);
              }
            }
          });
          
          // Toujours initialiser les notes directes (même si pas en mode direct)
          setDirectNotes(detectedDirectNotes);
          
          if (hasDirectMode) {
            setEvaluationMode('direct');
            console.log('✅ Mode direct détecté et appliqué (API)');
          } else {
            setEvaluationMode('criteria');
            console.log('✅ Mode critères détecté et appliqué (API)');
          }
          
          // Récupérer les données de la première évaluation trouvée
          if (evaluationsData.length > 0) {
            const firstEval = evaluationsData[0];
            
            // Date/heure
            if (firstEval.evaluated_at) {
              const existingDateTime = new Date(firstEval.evaluated_at);
              const formattedDateTime = existingDateTime.toISOString().slice(0, 16);
              setEvaluationDateTime(formattedDateTime);
            }
            
            // Nom d'activité et type
            if (firstEval.activity_name) {
              setActivityName(firstEval.activity_name);
            }
            if (firstEval.activity_type) {
              // Gérer la rétrocompatibilité avec les anciennes valeurs
              if (firstEval.activity_type === 'entreprise') {
                setActivityType('Activités observées en entreprise');
              } else if (firstEval.activity_type === 'centre') {
                setActivityType('Activités observées en centre de formation');
              } else {
                setActivityType(firstEval.activity_type);
              }
            }
          }
        } else {
          // Aucune évaluation trouvée, initialiser avec des valeurs par défaut
          initializeEvaluations();
        }
      } else {
        // Aucune évaluation trouvée, initialiser avec des valeurs par défaut
        initializeEvaluations();
      }
      
      // Marquer que les données ont été chargées
      console.log('✅ setIsDataLoaded(true) appelé - deuxième branche');
      setIsDataLoaded(true);
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'évaluation:', error);
      // Si pas d'évaluation existante, initialiser avec des valeurs par défaut
      initializeEvaluations();
    }
  }, [student?.id, completeCriteria, evaluationType, evaluation?.id, competenceInfo]);

  // Initialiser les évaluations au montage du composant - VERSION SIMPLIFIÉE
  useEffect(() => {
    // Éviter les re-renders infinis en utilisant une logique plus simple
    if (!isDataLoaded) {
      if (student?.id && evaluation) {
        // Charger une évaluation existante
        loadExistingEvaluation();
      } else {
        // Créer une nouvelle évaluation
        initializeEvaluations();
      }
    }
  }, [student?.id, evaluation?.id, loadExistingEvaluation, initializeEvaluations]);



  // Gérer les changements de critères
  const handleCriteriaChange = (competence, criteria, level) => {
    setEvaluations(prev => {
      const newEvaluations = { ...prev };
      
      if (!newEvaluations[competence]) {
        newEvaluations[competence] = {
          score: 0,
          comments: '',
          criteria: { ...completeCriteria[competence] || {} }
        };
      }
      
      // Décocher tous les niveaux pour ce critère
      Object.keys(newEvaluations[competence].criteria[criteria]).forEach(l => {
        if (l !== 'evaluated') {  // Ne pas décocher la case "Évalué"
        newEvaluations[competence].criteria[criteria][l] = false;
        }
      });
      
      // Cocher le niveau sélectionné
      newEvaluations[competence].criteria[criteria][level] = true;
      
      // Automatiquement cocher "Évalué" quand on sélectionne un niveau
      newEvaluations[competence].criteria[criteria].evaluated = true;
      
      // Recalculer le score pour cette compétence
      const levelScores = { N1: 0.0, N2: 0.4, N3: 0.75, N4: 1.0 };
      let totalScore = 0;
      let criteriaCount = 0;
      
      Object.entries(newEvaluations[competence].criteria).forEach(([criteriaName, levels]) => {
        // Ne compter que les critères évalués
        if (levels.evaluated !== false) {
          criteriaCount++;
          // Trouver le niveau le plus élevé sélectionné pour ce critère
          let maxLevelScore = 0;
          Object.entries(levels).forEach(([levelName, checked]) => {
            if (checked && levelName !== 'evaluated' && levelScores[levelName] > maxLevelScore) {
              maxLevelScore = levelScores[levelName];
            }
          });
          totalScore += maxLevelScore;
        }
      });
      
      const maxScore = competenceInfo[competence]?.maxScore || 0;
      if (criteriaCount > 0 && maxScore > 0) {
        // Moyenne des pourcentages des croix sélectionnées
        const averagePercentage = totalScore / criteriaCount;
        
        // Déterminer dans quelle zone se situe la moyenne et appliquer le pourcentage de cette zone
        let finalPercentage;
        if (averagePercentage <= 0.2) {
          finalPercentage = 0.0; // Zone N1: 0%
        } else if (averagePercentage <= 0.575) {
          finalPercentage = 0.4; // Zone N2: 40%
        } else if (averagePercentage <= 0.875) {
          finalPercentage = 0.75; // Zone N3: 75%
        } else {
          finalPercentage = 1.0; // Zone N4: 100%
        }
        
        newEvaluations[competence].score = Math.round((finalPercentage * maxScore) * 100) / 100;
      } else {
        newEvaluations[competence].score = 0;
      }
      
      return newEvaluations;
    });
  };

  // Gérer les changements d'état "évalué"
  const handleEvaluatedChange = (competence, criteria, isEvaluated) => {
    setEvaluations(prev => {
      const newEvaluations = { ...prev };
      
      if (!newEvaluations[competence]) {
        newEvaluations[competence] = {
          score: 0,
          comments: '',
          criteria: { ...completeCriteria[competence] || {} }
        };
      }
      
      // Mettre à jour l'état évalué
      newEvaluations[competence].criteria[criteria].evaluated = isEvaluated;
      
      // Si pas évalué, décocher tous les niveaux
      if (!isEvaluated) {
        Object.keys(newEvaluations[competence].criteria[criteria]).forEach(level => {
          if (level !== 'evaluated') {
            newEvaluations[competence].criteria[criteria][level] = false;
          }
        });
      }
      
      // Recalculer le score pour cette compétence
      const levelScores = { N1: 0.0, N2: 0.4, N3: 0.75, N4: 1.0 };
      let totalScore = 0;
      let criteriaCount = 0;
      
      Object.entries(newEvaluations[competence].criteria).forEach(([criteriaName, levels]) => {
        // Ne compter que les critères évalués
        if (levels.evaluated !== false) {
          criteriaCount++;
          Object.entries(levels).forEach(([levelName, checked]) => {
            if (checked && levelName !== 'evaluated') {
              totalScore += levelScores[levelName];
            }
          });
        }
      });
      
      const maxScore = competenceInfo[competence]?.maxScore || 0;
      if (criteriaCount > 0 && maxScore > 0) {
        // Moyenne des pourcentages des croix sélectionnées
        const averagePercentage = totalScore / criteriaCount;
        
        // Déterminer dans quelle zone se situe la moyenne et appliquer le pourcentage de cette zone
        let finalPercentage;
        if (averagePercentage <= 0.2) {
          finalPercentage = 0.0; // Zone N1: 0%
        } else if (averagePercentage <= 0.575) {
          finalPercentage = 0.4; // Zone N2: 40%
        } else if (averagePercentage <= 0.875) {
          finalPercentage = 0.75; // Zone N3: 75%
        } else {
          finalPercentage = 1.0; // Zone N4: 100%
        }
        
        newEvaluations[competence].score = Math.round((finalPercentage * maxScore) * 100) / 100;
      } else {
        newEvaluations[competence].score = 0;
      }
      
      return newEvaluations;
    });
  };

  // Gérer les changements de commentaires
  const handleCommentsChange = (competence, comments) => {
    setEvaluations(prev => ({
      ...prev,
      [competence]: {
        ...prev[competence],
        comments
      }
    }));
  };

  // Gérer les changements de notes directes (N1, N2, N3, N4)
  const handleDirectNoteChange = (competence, level) => {
    setDirectNotes(prev => {
      const newDirectNotes = { ...prev };
      
      // Désactiver toutes les autres notes pour cette compétence
      newDirectNotes[competence] = {
        N1: false,
        N2: false,
        N3: false,
        N4: false
      };
      
      // Activer seulement la note sélectionnée
      newDirectNotes[competence][level] = true;
      
      return newDirectNotes;
    });
    
    // Calculer et mettre à jour la note de la compétence
    const maxScore = competenceInfo[competence]?.maxScore || 0;
    let calculatedScore = 0;
    
    switch (level) {
      case 'N1':
        calculatedScore = 0; // 0%
        break;
      case 'N2':
        calculatedScore = (maxScore * 0.4); // 40%
        break;
      case 'N3':
        calculatedScore = (maxScore * 0.75); // 75%
        break;
      case 'N4':
        calculatedScore = maxScore; // 100%
        break;
      default:
        calculatedScore = 0;
    }
    
    // Mettre à jour la note dans les évaluations
    setEvaluations(prev => ({
      ...prev,
      [competence]: {
        ...prev[competence],
        score: calculatedScore
      }
    }));
  };

  // Basculer entre les modes d'évaluation
  const toggleEvaluationMode = (mode) => {
    setEvaluationMode(mode);
    
    // Si on passe en mode direct, réinitialiser les notes directes
    if (mode === 'direct') {
      const initialDirectNotes = {};
      Object.keys(competenceInfo).forEach(competence => {
        initialDirectNotes[competence] = {
          N1: false,
          N2: false,
          N3: false,
          N4: false
        };
      });
      setDirectNotes(initialDirectNotes);
    }
  };

  // Sauvegarder la grille
  const handleSave = async () => {
    try {
      // Validation des données avant envoi
      if (!student || !student.id) {
        toast.error('Erreur: Informations étudiant manquantes');
        console.error('❌ Student object invalide:', student);
        return;
      }
      
      // Vérifier que les évaluations ne sont pas vides
      if (!evaluations || Object.keys(evaluations).length === 0) {
        toast.error('Erreur: Aucune évaluation à sauvegarder');
        return;
      }
      
      // Vérifier que la date/heure est saisie
      if (!evaluationDateTime) {
        toast.error('Erreur: Veuillez saisir la date et heure d\'évaluation');
        return;
      }
      
      // Vérifier que le nom d'activité est saisi
      if (!activityName.trim()) {
        toast.error('Erreur: Veuillez saisir le nom de l\'activité');
        return;
      }
      
      // Vérifier que le type d'activité est sélectionné
      if (!activityType) {
        toast.error('Erreur: Veuillez sélectionner le type d\'activité');
        return;
      }
      
      // Convertir le type d'activité en format court pour la base de données
      let activityTypeForDB = '';
      if (activityType === 'Activités observées en entreprise') {
        activityTypeForDB = 'entreprise';
      } else if (activityType === 'Activités observées en centre de formation') {
        activityTypeForDB = 'centre';
      } else {
        activityTypeForDB = activityType; // Garder la valeur telle quelle si c'est déjà court
      }

      // Préparer les données d'évaluation
          const evaluationData = Object.entries(evaluations).map(([competence, data]) => {
        // Calculer le score selon le mode d'évaluation
        let finalScore = data.score;
        
        if (evaluationMode === 'direct' && directNotes[competence]) {
          // En mode direct, calculer le score à partir des notes directes
          const directNote = directNotes[competence];
          const maxScore = competenceInfo[competence]?.maxScore || 5;
          
          if (directNote.N1) {
            finalScore = 0; // 0%
          } else if (directNote.N2) {
            finalScore = maxScore * 0.4; // 40%
          } else if (directNote.N3) {
            finalScore = maxScore * 0.75; // 75%
          } else if (directNote.N4) {
            finalScore = maxScore; // 100%
          } else {
            finalScore = 0; // Aucune note sélectionnée
          }
          
          console.log(`📊 Mode direct - ${competence}: ${directNote.N1 ? 'N1' : directNote.N2 ? 'N2' : directNote.N3 ? 'N3' : directNote.N4 ? 'N4' : 'Aucune'} -> ${finalScore}/${maxScore}`);
        }
        
        const evaluationData = {
          student_id: parseInt(student.id),
          project_id: student.project_id ? parseInt(student.project_id) : null,
          competence,
          score: finalScore,
          comments: data.comments,
          global_comments: globalComments, // Ajouter les commentaires généraux
          criteria: JSON.stringify(data.criteria),
          type: evaluationType,
          evaluated_at: evaluationDateTime, // Ajouter la date/heure personnalisée
          activity_name: activityName, // Ajouter le nom d'activité
          activity_type: activityTypeForDB // Ajouter le type d'activité (format court)
        };
        
        console.log(`📤 Envoi évaluation ${competence}:`, {
          competence,
          global_comments: globalComments,
          global_comments_type: typeof globalComments,
          global_comments_length: globalComments ? globalComments.length : 0
        });
        
        return evaluationData;
      });
      

      
      // Distinguer création vs modification
      if (evaluation) {
        // MODIFICATION : mettre à jour les évaluations existantes

        
        // D'abord supprimer les anciennes évaluations de cette session spécifique
        const originalEvaluatedAt = evaluation.evaluated_at || evaluationDateTime;

        await axios.delete(`/api/evaluations/student/${student.id}?type=${evaluationType}&evaluated_at=${encodeURIComponent(originalEvaluatedAt)}`);
        
        // Puis créer les nouvelles évaluations avec la même date que l'originale
        const savePromises = evaluationData.map(evalData => 
          axios.post('/api/evaluations', evalData, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
        );
        
        await Promise.all(savePromises);
      } else {
        // CRÉATION : nouvelles évaluations
        console.log('🆕 CRÉATION de nouvelles évaluations:', evaluationData.length, 'évaluations');
        console.log('📊 Données à sauvegarder:', evaluationData);
        
        const savePromises = evaluationData.map((evalData, index) => {
          console.log(`💾 Sauvegarde évaluation ${index + 1}/${evaluationData.length}:`, {
            student_id: evalData.student_id,
            competence: evalData.competence,
            score: evalData.score,
            type: evalData.type,
            evaluated_at: evalData.evaluated_at,
            activity_name: evalData.activity_name
          });
          
          return axios.post('/api/evaluations', evalData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        });
        
        const results = await Promise.all(savePromises);
        console.log('✅ Toutes les évaluations sauvegardées:', results.length, 'résultats');
        results.forEach((result, index) => {
          console.log(`✅ Évaluation ${index + 1} sauvegardée:`, result.data);
        });
      }
      
      toast.success('Évaluation sauvegardée avec succès');
      
      if (onSave) {
        onSave(evaluationData);
      }
    } catch (error) {
      console.error('❌ Erreur complète lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      toast.error(`Erreur lors de la sauvegarde: ${errorMessage}`);
    }
  };

  const generateU51PrintContent = () => {
    const formatDate = () => {
      return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Définir les compétences U51 avec leurs critères
    const u51Competences = {
      'C2': {
        name: 'Extraire les informations nécessaires à la réalisation des tâches',
        criteria: [
          'La demande client/utilisateur est analysée',
          'Les informations nécessaires à l\'analyse et aux mesures sont extraites des documents',
          'Les informations relatives aux prescriptions techniques et aux réglementations sont recueillies',
          'Les conditions de la maintenance sont prises en compte',
          'Les risques professionnels sont identifiés',
          'Les habilitations et les certifications sont vérifiées',
          'Les informations écrites et orales nécessaires sont collectées et hiérarchisées',
          'Les informations écrites et orales collectées sont pertinentes pour l\'activité'
        ]
      },
      'C13': {
        name: 'Mesurer les grandeurs caractéristiques d\'un ouvrage, d\'une installation, d\'un équipement électrique',
        criteria: [
          'La procédure définie est appliquée',
          'L\'installation et l\'environnement de travail sont pris en compte',
          'Le niveau d\'habilitation nécessaire avant l\'intervention est déterminé',
          'Les actions de prévention et de sécurité sont mises en œuvre',
          'Les appareils de mesures sont installés',
          'Les mesures sont collectées',
          'Les enregistrements sont réalisés',
          'Les informations venant des objets connectés sont exploitées',
          'Les contrôles (locaux ou à distance) sont effectués',
          'Les essais associés sont effectués'
        ]
      },
      'C17': {
        name: 'Réaliser un diagnostic de performance y compris énergétique, de sécurité, d\'un ouvrage, d\'une installation, d\'un équipement électrique',
        criteria: [
          'Le processus de diagnostic est appliqué',
          'Les conditions de la maintenance sont prises en compte',
          'Le niveau d\'habilitation nécessaire est déterminé',
          'Les appareils de mesures sont sélectionnés et installés',
          'Les actions de prévention et de sécurité sont mises en œuvre',
          'Les mesures sont collectées et enregistrées',
          'Les informations venant des objets connectés sont collectées et enregistrées',
          'Le diagnostic est pertinent',
          'Suite au diagnostic, des modifications de l\'installation sont proposées',
          'Suite au diagnostic, des recommandations, des réglages, des améliorations de l\'installation sont proposées'
        ]
      },
      'C18': {
        name: 'Réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique',
        criteria: [
          'Le protocole de maintenance est pris en compte',
          'Le niveau d\'habilitation nécessaire est déterminé',
          'Les actions de prévention et de sécurité sont mises en œuvre',
          'La zone d\'intervention est préparée',
          'Les opérations de maintenance préventive sont réalisées',
          'Le dysfonctionnement est diagnostiqué',
          'Les opérations de dépannage sont réalisées',
          'Les contrôles (locaux ou à distance) sont effectués',
          'Les essais associés sont effectués',
          'Le fonctionnement de l\'installation est vérifié par rapport aux prescriptions',
          'Les fiches de contrôles, carnet de maintenance et/ou applications spécifiques sont complétées'
        ]
      }
    };

    let html = `
      <div class="header">
        <h1>FICHE D'ÉVALUATION DES COMPÉTENCES U51</h1>
        <p>Épreuve d'analyse, diagnostic et maintenance - Date : ${formatDate()}</p>
      </div>

      <div class="student-info">
        <p><strong>Nom et prénom :</strong> ${student?.student_name || `${student?.first_name} ${student?.last_name}`} &nbsp;&nbsp;&nbsp; <strong>Classe :</strong> ${student?.class_name || student?.class || 'Non renseigné'} &nbsp;&nbsp;&nbsp; <strong>Groupe :</strong> ${student?.group_name || 'Non assigné'}</p>
        <p><strong>Nom de l'activité :</strong> ${activityName || 'Non renseigné'}</p>
      </div>

              <table>
          <thead>
            <tr>
              <th style="width: 80%;">Indicateurs d'évaluation</th>
              <th style="width: 4%;">E</th>
              <th style="width: 4%;">N1<br/>0%</th>
              <th style="width: 4%;">N2<br/>40%</th>
              <th style="width: 4%;">N3<br/>75%</th>
              <th style="width: 4%;">N4<br/>100%</th>
            </tr>
          </thead>
        <tbody>
    `;

    // Générer le contenu pour toutes les compétences U51
    Object.entries(u51Competences).forEach(([competenceCode, competenceData]) => {
      const evaluation = evaluations[competenceCode];
      const note = evaluation?.score || 0;
      
                // En-tête de compétence
          html += `
            <tr>
              <td colspan="6" class="competence-header">
                ${competenceCode} - ${competenceData.name} - Note: ${note}/5
              </td>
            </tr>
          `;
      
      // Ligne de moyenne des croix pour cette compétence
      const calculateAverage = () => {
        // 1) Mode note directe: utiliser directement le niveau choisi (N1..N4)
        if (evaluationMode === 'direct' && directNotes && directNotes[competenceCode]) {
          const dn = directNotes[competenceCode] || {};
          let avgN1 = '', avgN2 = '', avgN3 = '', avgN4 = '';
          let averageText = 'Note directe';
          
          if (dn.N1) {
            avgN1 = '✗';
            averageText = 'Note directe : N1 (0%)';
          } else if (dn.N2) {
            avgN2 = '✗';
            averageText = 'Note directe : N2 (40%)';
          } else if (dn.N3) {
            avgN3 = '✗';
            averageText = 'Note directe : N3 (75%)';
          } else if (dn.N4) {
            avgN4 = '✗';
            averageText = 'Note directe : N4 (100%)';
          } else {
            averageText = 'Note directe : non renseignée';
          }
          
          return { avgN1, avgN2, avgN3, avgN4, averageText };
        }
        
        // 2) Mode critères détaillés: calculer la moyenne des croix
        if (!evaluation?.criteria) return { avgN1: '', avgN2: '', avgN3: '', avgN4: '', averageText: 'Aucune évaluation' };
        
        const criteria = evaluation.criteria;
        const evaluatedCriteria = Object.values(criteria).filter(levels => levels.evaluated !== false);
        
        if (evaluatedCriteria.length === 0) {
          return { avgN1: '', avgN2: '', avgN3: '', avgN4: '', averageText: 'Non évalué' };
        }

        // Compter le nombre de chaque niveau sélectionné
        let n1Count = 0, n2Count = 0, n3Count = 0, n4Count = 0;
        evaluatedCriteria.forEach(levels => {
          if (levels.N1) n1Count++;
          if (levels.N2) n2Count++;
          if (levels.N3) n3Count++;
          if (levels.N4) n4Count++;
        });

        const totalSelected = n1Count + n2Count + n3Count + n4Count;
        
        if (totalSelected === 0) {
          return { avgN1: '', avgN2: '', avgN3: '', avgN4: '', averageText: 'Aucune croix' };
        }

        // Calculer la moyenne pondérée
        const weightedSum = (n1Count * 1) + (n2Count * 2) + (n3Count * 3) + (n4Count * 4);
        const averageValue = weightedSum / totalSelected;
        
                        // Déterminer quelle colonne afficher la croix (X vert)
                        let avgN1 = '', avgN2 = '', avgN3 = '', avgN4 = '';
                        if (averageValue <= 1.5) {
                          avgN1 = '✗';
                        } else if (averageValue <= 2.5) {
                          avgN2 = '✗';
                        } else if (averageValue <= 3.5) {
                          avgN3 = '✗';
                        } else {
                          avgN4 = '✗';
                        }
        
        return { 
          avgN1, avgN2, avgN3, avgN4, 
          averageText: `Moyenne (${Math.round(averageValue * 100) / 100})`
        };
      };

      const avgData = calculateAverage();
      
                // Ajouter la ligne de moyenne
          html += `
            <tr style="background-color: #e3f2fd;">
              <td class="criteria-cell" style="font-weight: bold; color: #1976d2;">
                📊 ${avgData.averageText}
              </td>
              <td class="cross" style="background-color: #e3f2fd;">✗</td>
              <td class="cross" style="background-color: #e3f2fd;">${avgData.avgN1}</td>
              <td class="cross" style="background-color: #e3f2fd;">${avgData.avgN2}</td>
              <td class="cross" style="background-color: #e3f2fd;">${avgData.avgN3}</td>
              <td class="cross" style="background-color: #e3f2fd;">${avgData.avgN4}</td>
            </tr>
          `;

              // Critères de la compétence
        competenceData.criteria.forEach((criteriaName, index) => {
          const criteriaData = evaluation?.criteria?.[criteriaName];
          const isEvaluated = criteriaData?.evaluated !== false;
          
          html += `
            <tr>
              <td class="criteria-cell">${criteriaName}</td>
              <td class="cross">${isEvaluated ? '✗' : ''}</td>
              <td class="cross">${criteriaData?.N1 ? '✗' : ''}</td>
              <td class="cross">${criteriaData?.N2 ? '✗' : ''}</td>
              <td class="cross">${criteriaData?.N3 ? '✗' : ''}</td>
              <td class="cross">${criteriaData?.N4 ? '✗' : ''}</td>
            </tr>
          `;
        });
    });

    html += `
        </tbody>
      </table>

      <div class="global-note">
        Note globale : ${globalScore}/20
      </div>
    `;

    if (globalComments) {
      html += `
        <div style="margin-top: 20px;">
          <h4>Commentaires :</h4>
          <div style="border: 1px solid #000; padding: 10px; min-height: 50px;">
            ${globalComments}
          </div>
        </div>
      `;
    }

    return html;
  };

  const handlePrint = () => {
    if (evaluationType === 'U51') {
      // Pour U51, impression directe avec format spécialisé
    const printWindow = window.open('', '_blank');
      const printContent = generateU51PrintContent();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
            <title>Fiche d'évaluation U51 - ${student?.student_name || `${student?.first_name} ${student?.last_name}`}</title>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                  margin-top: 1cm;
                  margin-left: 10mm;
                  margin-right: 10mm;
                  margin-bottom: 10mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                  font-size: 9pt;
                  line-height: 1.1;
              }
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 9pt;
                line-height: 1.1;
                margin: 0;
                padding: 8px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 6px;
              }
              th, td {
                border: 1px solid #000;
                padding: 2px;
                text-align: left;
                vertical-align: top;
                font-size: 8pt;
              }
              th {
                background-color: #f0f0f0;
                font-weight: bold;
                text-align: center;
                line-height: 1.0;
              }
              .competence-header {
                background-color: #e0e0e0 !important;
                font-weight: bold;
                text-align: left;
                padding: 3px;
                font-size: 9pt;
              }
              .criteria-cell {
                padding-left: 8px;
                font-size: 9pt;
                line-height: 1.0;
              }
              .cross {
                color: green;
                font-weight: bold;
                font-size: 10pt;
                text-align: center;
              }
              .student-info {
                border: 1px solid #000;
                padding: 2px 4px;
                margin-bottom: 4px;
                background-color: #f9f9f9;
                font-size: 10pt;
                line-height: 1.0;
              }
              .student-info p {
                margin: 1px 0;
              }
              .global-note {
                border: 2px solid #000;
                padding: 6px;
                text-align: center;
                font-weight: bold;
                font-size: 10pt;
                margin-top: 6px;
              }
              .header {
                text-align: center;
                margin-bottom: 6px;
              }
              .header h1 {
                margin: 0 0 2px 0;
                font-size: 11pt;
                font-weight: bold;
              }
              .header p {
                margin: 0;
                font-size: 7pt;
                color: #666;
            }
          </style>
        </head>
        <body>
          ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    } else {
      // Pour U52, utiliser l'ancien système
      setShowPrintPreview(true);
    }
  };

  const handlePrintConfirm = () => {
    const printContent = printRef.current.innerHTML;
    
    // Créer un élément div caché pour l'impression
    const printDiv = document.createElement('div');
    printDiv.innerHTML = `
      <style>
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          .print-content {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.2;
          }
        }
      </style>
      <div class="print-content">
        ${printContent}
      </div>
    `;
    
    printDiv.style.position = 'absolute';
    printDiv.style.top = '-9999px';
    printDiv.style.left = '-9999px';
    
    document.body.appendChild(printDiv);
    
    // Lancer l'impression
    window.print();
    
    // Supprimer l'élément après l'impression
    setTimeout(() => {
      document.body.removeChild(printDiv);
    }, 1000);
    
    setShowPrintPreview(false);
    toast.success('Impression lancée');
  };

  if (!student) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Aucun étudiant sélectionné</div>
      </div>
    );
  }

  // Vérification de sécurité pour éviter les erreurs lors du premier rendu
  // console.log('🔍 Vérification de rendu - competenceInfo:', !!competenceInfo, 'completeCriteria:', !!completeCriteria, 'keys:', Object.keys(competenceInfo || {}).length);
  
  // FORCER LE RENDU - Ne jamais bloquer l'interface
  // if (!competenceInfo || !completeCriteria || Object.keys(competenceInfo).length === 0) {
  // SUPPRESSION COMPLÈTE DE LA CONDITION DE BLOCAGE
  // Les champs sont maintenant TOUJOURS rendus et interactifs

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="relative">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Grille d'évaluation complète
          </h2>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {student.student_name || `${student.first_name} ${student.last_name}`}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Date et heure d'évaluation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📅 Date et heure d'évaluation
        </label>
        <input
          type="datetime-local"
          value={evaluationDateTime}
          onChange={(e) => setEvaluationDateTime(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Cette date/heure permettra de distinguer les différentes sessions d'évaluation
        </p>
      </div>

      {/* Toggle Mode d'évaluation */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🎯 Mode d'évaluation
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="evaluationMode"
              value="criteria"
              checked={evaluationMode === 'criteria'}
              onChange={(e) => toggleEvaluationMode(e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700">
              📋 Évaluation par critères détaillés
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="evaluationMode"
              value="direct"
              checked={evaluationMode === 'direct'}
              onChange={(e) => toggleEvaluationMode(e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700">
              ⚡ Note directe (N1, N2, N3, N4)
            </span>
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {evaluationMode === 'criteria' 
            ? 'Évaluez chaque critère individuellement pour une évaluation précise'
            : 'Attribuez directement une note globale pour chaque compétence'
          }
        </p>
      </div>

      {/* Champs d'activité */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📋 Nom de l'activité
        </label>
        <input
          type="text"
          value={activityName || ''}
          onChange={(e) => {
            setActivityName(e.target.value);
          }}
          placeholder="Saisir le nom de l'activité évaluée"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
        
        <div className="mt-4">
          <span className="block text-sm font-medium text-gray-700 mb-3">
            🏢 Type d'activité
          </span>
          <div className="space-y-2">
            <label className="flex items-center">
            <input
              type="radio"
              name="activityType"
              value="Activités observées en entreprise"
              checked={activityType === 'Activités observées en entreprise'}
              onChange={(e) => {
                setActivityType(e.target.value);
              }}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              disabled={false}
            />
              <span className="ml-2 text-sm text-gray-700">
                🏭 Activités observées en entreprise <span className="text-xs text-gray-500">(coeff. 1/3)</span>
              </span>
            </label>
            <label className="flex items-center">
            <input
              type="radio"
              name="activityType"
              value="Activités observées en centre de formation"
              checked={activityType === 'Activités observées en centre de formation'}
              onChange={(e) => {
                setActivityType(e.target.value);
              }}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              disabled={false}
            />
              <span className="ml-2 text-sm text-gray-700">
                🎓 Activités observées en centre de formation <span className="text-xs text-gray-500">(coeff. 2/3)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Grilles d'évaluation par compétence */}
      {Object.keys(competenceInfo || {}).map((competence) => {
        // Utiliser une approche ultra-sécurisée
        const info = competenceInfo[competence] || {};
        const name = info.name || `Compétence ${competence}`;
        const description = info.description || 'Description non disponible';
        const maxScore = info.maxScore || 0;
        
        const data = evaluations[competence] || { 
          score: 0, 
          comments: '', 
          criteria: completeCriteria[competence] || {} 
        };
        
        const directNote = directNotes[competence] || { N1: false, N2: false, N3: false, N4: false };
        
        // Vérification finale
        if (!completeCriteria || !completeCriteria[competence]) {
          console.warn(`❌ Critères manquants pour ${competence}, ignorer`);
          return null;
        }
        
        return (
          <div key={competence} className="card">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <div>
              <h3 className="text-lg font-medium text-gray-900">
                    {competence} - {name}
              </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Note maximale: {maxScore}/20
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
                    Note: {data.score || 0}/{maxScore}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {maxScore > 0 ? Math.round(((data.score || 0) / maxScore) * 100) : 0}%
                  </div>
                  {/* Statut de la compétence en mode direct */}
                  {evaluationMode === 'direct' && directNotes[competence] && (
                    <div className="mt-2">
                      {(directNotes[competence].N1 || directNotes[competence].N2 || directNotes[competence].N3 || directNotes[competence].N4) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Compétence évaluée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          ⏳ Non évaluée
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tableau des critères - Mode conditionnel */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                      Critères d'évaluation
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                      Évalué
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                      N1<br />0%
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                      N2<br />40%
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                      N3<br />75%
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                      N4<br />100%
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Ligne de note directe en mode direct */}
                  {evaluationMode === 'direct' && (
                    <tr className="bg-orange-50 border-t-2 border-orange-200">
                      <td className="px-4 py-2 text-sm font-semibold text-orange-700 border">
                        ⚡ Note directe
                      </td>
                      <td className="px-4 py-2 text-center border">
                        <span className="text-green-600 font-bold">✓</span>
                      </td>
                      {['N1', 'N2', 'N3', 'N4'].map((level) => {
                        const isSelected = directNote[level];
                        return (
                          <td key={level} className="px-4 py-2 text-center border">
                            <button
                              type="button"
                              onClick={() => handleDirectNoteChange(competence, level)}
                              className={`flex items-center justify-center w-8 h-8 mx-auto border-2 rounded transition-colors ${
                                isSelected 
                                  ? 'bg-orange-500 text-white border-orange-500' 
                                  : 'border-gray-300 hover:border-orange-400'
                              }`}
                            >
                              {isSelected ? (
                                <span className="text-white font-bold text-lg">✗</span>
                              ) : (
                                <span className="text-gray-300 text-lg">□</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                  
                  {/* Ligne de moyenne des croix en mode critères */}
                  {evaluationMode === 'criteria' && (() => {
                    // Calculer la moyenne des niveaux pour cette compétence
                    const criteria = data.criteria || {};
                    const evaluatedCriteria = Object.values(criteria).filter(levels => levels.evaluated !== false);
                    
                    if (evaluatedCriteria.length === 0) {
                      return (
                        <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                          <td className="px-4 py-2 text-sm font-semibold text-gray-700 border">
                            📊 Moyenne des croix
                          </td>
                          <td className="px-4 py-2 text-center border">-</td>
                          <td className="px-4 py-2 text-center border">-</td>
                          <td className="px-4 py-2 text-center border">-</td>
                          <td className="px-4 py-2 text-center border">-</td>
                          <td className="px-4 py-2 text-center border">-</td>
                        </tr>
                      );
                    }

                    // Compter le nombre de chaque niveau sélectionné
                    let n1Count = 0, n2Count = 0, n3Count = 0, n4Count = 0;
                    evaluatedCriteria.forEach(levels => {
                      if (levels.N1) n1Count++;
                      if (levels.N2) n2Count++;
                      if (levels.N3) n3Count++;
                      if (levels.N4) n4Count++;
                    });

                    const totalSelected = n1Count + n2Count + n3Count + n4Count;
                    
                    // Calculer la moyenne pondérée
                    let averageLevel = '';
                    let averageColor = '';
                    
                    if (totalSelected > 0) {
                      const weightedSum = (n1Count * 1) + (n2Count * 2) + (n3Count * 3) + (n4Count * 4);
                      const averageValue = weightedSum / totalSelected;
                      
                      // Déterminer quel niveau représente le mieux la moyenne
                      if (averageValue <= 1.5) {
                        averageLevel = '✗';
                        averageColor = 'text-red-600';
                      } else if (averageValue <= 2.5) {
                        averageLevel = '✗';
                        averageColor = 'text-red-600';
                      } else if (averageValue <= 3.5) {
                        averageLevel = '✗';
                        averageColor = 'text-red-600';
                      } else {
                        averageLevel = '✗';
                        averageColor = 'text-red-600';
                      }
                      
                      // Placer la croix dans la colonne correspondante
                      const avgN1 = averageValue <= 1.5 ? averageLevel : '';
                      const avgN2 = averageValue > 1.5 && averageValue <= 2.5 ? averageLevel : '';
                      const avgN3 = averageValue > 2.5 && averageValue <= 3.5 ? averageLevel : '';
                      const avgN4 = averageValue > 3.5 ? averageLevel : '';
                      
                      return (
                        <tr className="bg-blue-50 border-t-2 border-blue-200">
                          <td className="px-4 py-2 text-sm font-semibold text-blue-700 border">
                            📊 Moyenne des croix ({Math.round(averageValue * 100) / 100})
                          </td>
                          <td className="px-4 py-2 text-center border">
                            <span className="text-green-600 font-bold">✓</span>
                          </td>
                          <td className="px-4 py-2 text-center border">
                            <span className={`font-bold text-lg ${averageColor}`}>{avgN1}</span>
                          </td>
                          <td className="px-4 py-2 text-center border">
                            <span className={`font-bold text-lg ${averageColor}`}>{avgN2}</span>
                          </td>
                          <td className="px-4 py-2 text-center border">
                            <span className={`font-bold text-lg ${averageColor}`}>{avgN3}</span>
                          </td>
                          <td className="px-4 py-2 text-center border">
                            <span className={`font-bold text-lg ${averageColor}`}>{avgN4}</span>
                          </td>
                        </tr>
                      );
                    }
                    
                    return null;
                  })()}
                  
                  {/* Critères individuels */}
                  {Object.entries(data.criteria || {}).map(([criteria, levels]) => (
                    <tr key={criteria}>
                      <td className="px-4 py-3 text-base text-gray-900 border align-top">
                        {criteria}
                      </td>
                      <td className="px-4 py-3 text-center border">
                        {evaluationMode === 'criteria' ? (
                          <input
                            type="checkbox"
                            checked={(levels || {}).evaluated !== false}
                            onChange={(e) => handleEvaluatedChange(competence, criteria, e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {Object.entries(levels || {}).filter(([level]) => level !== 'evaluated').map(([level, checked]) => (
                        <td key={level} className="px-4 py-3 text-center border">
                          {evaluationMode === 'criteria' ? (
                          <button
                            type="button"
                            onClick={() => handleCriteriaChange(competence, criteria, level)}
                              className="flex items-center justify-center w-8 h-8 mx-auto border-2 border-gray-300 rounded hover:border-gray-400 transition-colors"
                              disabled={(levels || {}).evaluated === false}
                          >
                            {checked ? (
                                <span className="text-green-600 font-bold text-lg">✓</span>
                            ) : (
                                <span className="text-gray-300 text-lg">□</span>
                            )}
                          </button>
                          ) : (
                            <span className="text-gray-300 text-lg">□</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section commentaires commune aux deux modes */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Observations, remarques..."
                  value={data.comments}
                  onChange={(e) => handleCommentsChange(competence, e.target.value)}
                />
            </div>
          </div>
        );
      })}

      {/* Résumé des compétences évaluées en mode direct */}
      {evaluationMode === 'direct' && (
        <div className="card bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-orange-900">
              ⚡ Résumé des compétences évaluées
            </h3>
            <p className="text-sm text-orange-700">
              Statut des compétences en mode d'évaluation directe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.keys(competenceInfo || {}).map((competence) => {
              const directNote = directNotes[competence] || { N1: false, N2: false, N3: false, N4: false };
              const isEvaluated = directNote.N1 || directNote.N2 || directNote.N3 || directNote.N4;
              const selectedLevel = directNote.N1 ? 'N1' : directNote.N2 ? 'N2' : directNote.N3 ? 'N3' : directNote.N4 ? 'N4' : null;
              
              return (
                <div key={competence} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="font-medium text-gray-900">{competence}</div>
                    <div className="text-xs text-gray-500">
                      {competenceInfo[competence]?.name?.substring(0, 30)}...
                    </div>
                  </div>
                  <div className="text-right">
                    {isEvaluated ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ {selectedLevel}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedLevel === 'N1' ? '0%' : selectedLevel === 'N2' ? '40%' : selectedLevel === 'N3' ? '75%' : '100%'}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        ⏳ Non évaluée
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Note globale et commentaires */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-blue-900">
            Note globale de l'évaluation
          </h3>
          <p className="text-sm text-blue-700">
            Note calculée automatiquement sur 20 points
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Note globale calculée
            </label>
            <div className="text-3xl font-bold text-blue-600">
              {globalScore.toFixed(2)}/20
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Basée sur la moyenne pondérée des compétences
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Commentaires généraux
            </label>
            <textarea
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              rows="4"
              placeholder="Commentaires généraux sur l'évaluation complète..."
              value={globalComments}
              onChange={(e) => setGlobalComments(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Répartition des notes :</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(evaluations).map(([competence, data]) => (
              <div key={competence} className="flex justify-between">
                <span className="text-blue-700">{competence}:</span>
                <span className="font-medium text-blue-900">
                  {data.score.toFixed(2)}/{(competenceInfo[competence] || {}).maxScore || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handlePrint}
          className="btn btn-outline flex items-center"
          title="Imprimer la fiche d'évaluation"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder l'évaluation
        </button>
      </div>

      {/* Modal de prévisualisation d'impression */}
      {showPrintPreview && isDataLoaded && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPrintPreview(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Prévisualisation de l'impression
                  </h3>
                  <p className="text-sm text-gray-500">
                    Aperçu de la fiche d'évaluation pour {student?.student_name || `${student?.first_name} ${student?.last_name}`}
                  </p>
                </div>
                
                <div className="max-h-[70vh] overflow-y-auto border border-gray-200 rounded-lg">
                  {!isDataLoaded ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des données d'évaluation...</p>
                      </div>
                    </div>
                  ) : (
                    <div ref={printRef}>
                      <EvaluationPrint
                        student={student}
                        evaluations={evaluations}
                        globalScore={globalScore}
                        globalComments={globalComments}
                        competenceInfo={competenceInfo}
                        evaluationType={evaluationType}
                        evaluationMode={evaluationMode}
                        directNotes={directNotes}
                        onEdit={() => {
                          setShowPrintPreview(false);
                          // Le modal de modification est déjà ouvert, on peut juste fermer la prévisualisation
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handlePrintConfirm}
                  disabled={!isDataLoaded}
                  className={`btn sm:ml-3 sm:w-auto flex items-center ${
                    isDataLoaded 
                      ? 'btn-primary' 
                      : 'btn-secondary opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isDataLoaded ? 'Imprimer' : 'Chargement...'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary sm:ml-3 sm:w-auto"
                  onClick={() => setShowPrintPreview(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationGrid; 