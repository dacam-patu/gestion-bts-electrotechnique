import React, { useState, useEffect } from 'react';
import { useSchoolYear } from '../contexts/SchoolYearContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
// import { toast } from 'react-toastify'; // Module non disponible
import { 
  FileText, 
  ClipboardList, 
  Edit, 
  Trash2, 
  Printer, 
  User,
  Search
} from 'lucide-react';
import EvaluationGrid from '../components/EvaluationGrid';
import TPSheetModal from '../components/TPSheetModal';
import ColorationLogo from '../components/ColorationLogo';

const EvaluationsU51New = () => {
  const { selectedYear } = useSchoolYear();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState(null);
  const [grids, setGrids] = useState([]);
  const [showEvaluationGrid, setShowEvaluationGrid] = useState(false);
  const [selectedGrid, setSelectedGrid] = useState(null);
  const [showTPSheetModal, setShowTPSheetModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleStudentSelect = (student) => {
    setSelectedStudentForEvaluation(student);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Récupération des données...');
      
      const classesRes = await axios.get(`/api/classes?school_year=${selectedYear}`);
      
      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
        
        // Récupérer tous les étudiants de toutes les classes
        const allStudents = [];
        for (const classItem of classesRes.data.data) {
          try {
            const studentsRes = await axios.get(`/api/classes/${classItem.id}/students`);
            if (studentsRes.data.success) {
              allStudents.push(...studentsRes.data.data);
            }
          } catch (error) {
            console.error(`Erreur lors du chargement des étudiants de la classe ${classItem.id}:`, error);
          }
        }
        
        console.log('👥 Étudiants trouvés:', allStudents.length);
        
        // Récupérer toutes les évaluations et filtrer les U51
        try {
          console.log('🔄 Appel API /api/evaluations...');
          const allEvaluationsRes = await axios.get('/api/evaluations');
          console.log('✅ Réponse API reçue:', allEvaluationsRes.data);
          
          if (allEvaluationsRes.data.success) {
            console.log('📊 Total évaluations dans la base:', allEvaluationsRes.data.data.length);
            
            // Debug: afficher tous les types d'évaluations
            const allTypes = [...new Set(allEvaluationsRes.data.data.map(e => e.type))];
            console.log('🔍 Types d\'évaluations trouvés:', allTypes);
            
            // Debug: afficher quelques évaluations pour voir leur structure
            console.log('🔍 Premières évaluations:', allEvaluationsRes.data.data.slice(0, 3));
            
            // Essayer différents filtres pour voir ce qui existe
            const u51Evaluations = allEvaluationsRes.data.data.filter(evaluation => evaluation.type === 'U51');
            const u52Evaluations = allEvaluationsRes.data.data.filter(evaluation => evaluation.type === 'U52');
            const u61Evaluations = allEvaluationsRes.data.data.filter(evaluation => evaluation.type === 'U61');
            const u62Evaluations = allEvaluationsRes.data.data.filter(evaluation => evaluation.type === 'U62');
            
            console.log('📊 Évaluations U51 trouvées dans la base:', u51Evaluations.length);
            console.log('📊 Évaluations U52 trouvées dans la base:', u52Evaluations.length);
            console.log('📊 Évaluations U61 trouvées dans la base:', u61Evaluations.length);
            console.log('📊 Évaluations U62 trouvées dans la base:', u62Evaluations.length);
            
            // Debug: afficher toutes les évaluations U51 pour voir leur structure
            if (u51Evaluations.length > 0) {
              console.log('🔍 Détail des évaluations U51:', u51Evaluations.map(e => ({
                id: e.id,
                student_id: e.student_id,
                competence: e.competence,
                score: e.score,
                type: e.type,
                evaluated_at: e.evaluated_at,
                activity_name: e.activity_name,
                created_at: e.created_at,
                comments: e.comments
              })));
            }
            
            // TEMPORAIRE: Afficher les évaluations U52 pour tester l'affichage
            // TODO: Remplacer par U51 quand des évaluations U51 seront créées
            const evaluationsToShow = u51Evaluations.length > 0 ? u51Evaluations : u52Evaluations;
            console.log('🔧 Utilisation des évaluations pour l\'affichage:', evaluationsToShow.length, 'évaluations de type', evaluationsToShow.length > 0 ? evaluationsToShow[0].type : 'aucune');
            
            // Grouper les évaluations par étudiant
            const evaluationsByStudent = {};
            u51Evaluations.forEach(evaluation => {
              console.log('🔍 Évaluation U51 trouvée:', {
                id: evaluation.id,
                student_id: evaluation.student_id,
                student_id_type: typeof evaluation.student_id,
                student_name: `${evaluation.first_name} ${evaluation.last_name}`,
                type: evaluation.type,
                competence: evaluation.competence,
                score: evaluation.score
              });
              
              if (!evaluationsByStudent[evaluation.student_id]) {
                evaluationsByStudent[evaluation.student_id] = [];
              }
              evaluationsByStudent[evaluation.student_id].push(evaluation);
            });
            
            console.log('📊 Évaluations groupées par étudiant:', Object.keys(evaluationsByStudent).length, 'étudiants');
            
            // Créer les grilles pour chaque étudiant qui a des évaluations U51
            const gridsWithEvaluations = [];
            Object.keys(evaluationsByStudent).forEach(studentId => {
              const studentEvaluations = evaluationsByStudent[studentId];
              const student = allStudents.find(s => s.id == studentId);
              
              console.log('🔍 Traitement étudiant:', {
                studentId,
                studentFound: !!student,
                studentName: student ? `${student.first_name} ${student.last_name}` : 'Non trouvé',
                evaluationsCount: studentEvaluations.length
              });
              
              if (student && studentEvaluations.length > 0) {
                // Grouper les évaluations par session (même evaluated_at)
                const evaluationsBySession = {};
                studentEvaluations.forEach(evaluation => {
                  const sessionKey = evaluation.evaluated_at || evaluation.created_at;
                  if (!evaluationsBySession[sessionKey]) {
                    evaluationsBySession[sessionKey] = [];
                  }
                  evaluationsBySession[sessionKey].push(evaluation);
                });
                
                // Créer une grille pour chaque session d'évaluation
                Object.keys(evaluationsBySession).forEach(sessionKey => {
                  const sessionEvaluations = evaluationsBySession[sessionKey];
                  const recalculatedScore = calculateStudentScore(sessionEvaluations);
                  
                  // Extraire les commentaires globaux de la session
                  const globalComments = sessionEvaluations
                    .map(evaluation => evaluation.global_comments)
                    .filter(comment => comment && comment.trim() !== '')
                    .find(comment => comment) || '';
                  
                  const grid = {
                    id: `grid-${studentId}-${sessionKey}-${Date.now()}`, // ID unique avec timestamp
                    student_id: studentId,
                    student_name: `${student.first_name} ${student.last_name}`,
                    type: 'U51',
                    created_at: sessionKey,
                    calculated_score: recalculatedScore.average,
                    has_evaluations: recalculatedScore.hasEvaluations,
                    global_comments: globalComments,
                    evaluations: sessionEvaluations
                  };
                  gridsWithEvaluations.push(grid);
                  console.log('✅ Grille créée pour:', student.first_name, student.last_name, 'session:', sessionKey, 'global_comments:', globalComments);
                });
              }
            });
            
            // Trier les grilles par nom d'étudiant (ordre alphabétique)
            const sortedGrids = gridsWithEvaluations.sort((a, b) => {
              const nameA = a.student_name.toLowerCase();
              const nameB = b.student_name.toLowerCase();
              return nameA.localeCompare(nameB);
            });
            
            console.log('📊 Grilles U51 créées:', sortedGrids.length);
            setGrids(sortedGrids);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des évaluations:', error);
          console.error('❌ Détails de l\'erreur:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      console.error('Erreur lors du chargement des données');
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateStudentScore = (evaluations) => {
    if (!evaluations || evaluations.length === 0) {
      return { average: 0, hasEvaluations: false };
    }

    const validEvaluations = evaluations.filter(evaluation => evaluation.score !== null && evaluation.score !== undefined);
    
    if (validEvaluations.length === 0) {
      return { average: 0, hasEvaluations: false };
    }

    // Calculer la note globale avec la même logique que le backend
    // Normaliser chaque compétence sur 20, puis faire la moyenne
    const validScores = [];
    
    validEvaluations.forEach(evaluation => {
      const competence = evaluation.competence;
      const score = evaluation.score || 0;
      
      // Définir les scores maximaux pour chaque compétence U51
      let maxScore = 5; // Par défaut pour U51
      
      // Normaliser chaque compétence sur 20 si elle a un score
      if (score > 0 && maxScore > 0) {
        const normalizedScore = (score / maxScore) * 20;
        validScores.push(normalizedScore);
      }
    });
    
    // Calculer la moyenne des scores normalisés
    const average = validScores.length > 0 
      ? Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 100) / 100
      : 0;
    
    return { average, hasEvaluations: true };
  };

  useEffect(() => {
    if (selectedYear) {
      fetchData();
    }
  }, [selectedYear]);

  const handleClassSelect = async (classItem) => {
    setSelectedClass(classItem);
    setSelectedStudentForEvaluation(null);
    
    try {
      const studentsRes = await axios.get(`/api/classes/${classItem.id}/students`);
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      console.error('Erreur lors du chargement des étudiants');
      alert('Erreur lors du chargement des étudiants');
    }
  };

  const handleCreateGrid = (student) => {
    console.log('🔧 Création d\'évaluation pour:', student);
    setSelectedGrid({
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      type: 'U51'
    });
    setShowEvaluationGrid(true);
  };

  const handleEditGrid = (grid) => {
    setSelectedGrid(grid);
    setShowEvaluationGrid(true);
  };

  const generateU51PrintContent = (grid) => {
    const formatDate = () => {
      return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Définir les compétences U51 avec leurs critères - Correspondance exacte avec la feuille d'impression
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
        <p><strong>Nom et prénom :</strong> ${grid.student_name} &nbsp;&nbsp;&nbsp; <strong>Classe :</strong> ${selectedClass?.name || 'Non renseigné'}</p>
        <p><strong>Nom de l'activité :</strong> ${grid.evaluations?.[0]?.activity_name || 'Non renseigné'}</p>
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
      const evaluation = grid.evaluations?.find(e => e.competence === competenceCode);
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
        // 1) Si pas de critères exploitables mais un score existe, déduire la note directe (N1..N4) à partir du score
        //    U51: max 5 points par compétence
        if (!evaluation?.criteria) {
          const score = typeof evaluation?.score === 'number' ? evaluation.score : null;
          if (score !== null) {
            const percentage = (score / 5) * 100;
            let avgN1 = '', avgN2 = '', avgN3 = '', avgN4 = '';
            if (percentage >= 75) {
              avgN4 = '✗';
            } else if (percentage >= 50) {
              avgN3 = '✗';
            } else if (percentage >= 25) {
              avgN2 = '✗';
            } else {
              avgN1 = '✗';
            }
            return { avgN1, avgN2, avgN3, avgN4, averageText: 'Note directe' };
          }
          return { avgN1: '', avgN2: '', avgN3: '', avgN4: '', averageText: 'Aucune évaluation' };
        }
        
        // Parser les critères s'ils sont en JSON
        let criteria = evaluation.criteria;
        if (typeof criteria === 'string') {
          try {
            criteria = JSON.parse(criteria);
          } catch (e) {
            console.error('Erreur de parsing des critères:', e);
            return { avgN1: '', avgN2: '', avgN3: '', avgN4: '', averageText: 'Erreur de données' };
          }
        }
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
          // Aucun critère sélectionné: fallback sur la note directe si un score est présent
          const score = typeof evaluation?.score === 'number' ? evaluation.score : null;
          if (score !== null) {
            const percentage = (score / 5) * 100;
            let avgN1 = '', avgN2 = '', avgN3 = '', avgN4 = '';
            if (percentage >= 75) {
              avgN4 = '✗';
            } else if (percentage >= 50) {
              avgN3 = '✗';
            } else if (percentage >= 25) {
              avgN2 = '✗';
            } else {
              avgN1 = '✗';
            }
            return { avgN1, avgN2, avgN3, avgN4, averageText: 'Note directe' };
          }
          return { avgN1: '', avgN2: '', avgN3: '', avgN4: '', averageText: 'Aucune croix' };
        }

        // Calculer la moyenne pondérée
        const weightedSum = (n1Count * 1) + (n2Count * 2) + (n3Count * 3) + (n4Count * 4);
        const averageValue = weightedSum / totalSelected;
        
        // Déterminer quelle colonne afficher la croix
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
          averageText: 'Moyenne (' + (Math.round(averageValue * 100) / 100) + ')'
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
        // Parser les critères s'ils sont en JSON
        let parsedCriteria = evaluation?.criteria;
        if (typeof parsedCriteria === 'string') {
          try {
            parsedCriteria = JSON.parse(parsedCriteria);
          } catch (e) {
            parsedCriteria = {};
          }
        }
        
        const criteriaData = parsedCriteria?.[criteriaName];
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
        Note globale : ${grid.calculated_score || 0}/20
      </div>
    `;

    return html;
  };

  const handlePrintGrid = (grid) => {
    console.log('🖨️ Impression de la grille:', grid);
    
    const printWindow = window.open('', '_blank');
    const printContent = generateU51PrintContent(grid);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fiche d'évaluation U51 - ${grid.student_name}</title>
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
              font-size: 9pt;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDeleteGrid = async (grid) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette grille d\'évaluation ?')) {
      return;
    }

    try {
      console.log('🗑️ Suppression de la grille:', grid);
      
      // Pour les évaluations U51, nous devons supprimer toutes les évaluations de la session
      // en utilisant student_id, type et evaluated_at
      const deleteData = {
        student_id: grid.student_id,
        type: 'U51',
        evaluated_at: grid.created_at
      };
      
      console.log('📤 Données de suppression:', deleteData);
      
      // Utiliser la nouvelle route de suppression par session
      await axios.delete(`/api/evaluations/session/${grid.student_id}`, {
        data: deleteData
      });
      
      console.log('✅ Grille supprimée avec succès');
      alert('Grille supprimée avec succès');
      
      await refreshAfterEvaluation();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateTPSheet = () => {
    console.log('🖱️ Bouton Créer une fiche TP cliqué');
    setShowTPSheetModal(true);
    console.log('📝 showTPSheetModal défini à true');
  };

  const handleSaveTPSheet = async (content) => {
    console.log('💾 Sauvegarde de la fiche TP:', content);
    
    try {
      // Préparer les données à sauvegarder (même format que FicheTP.js)
      const dataToSave = {
        title: content.sheetName || content.title || 'Fiche TP sans nom',
        subtitle: content.subtitle || '',
        context: content.context || '',
        objectives: content.objectives || '',
        documents: content.documents || '',
        equipment: content.equipment || '',
        tasks: content.tasks || '',
        competencies: content.competencies || '',
        workRequired: content.workRequired || '',
        evaluation: content.evaluation || '',
        duration: content.duration || '',
        safety: content.safety || '',
        controlQuestions: content.controlQuestions || '',
        observations: content.observations || '',
        imageZone: content.imageZone || '',
        images: JSON.stringify(content.images || {})
      };

      const response = await axios.post('/api/tp-sheets', dataToSave);
      
      if (response.status === 201) {
        alert('Fiche TP sauvegardée avec succès !');
        setShowTPSheetModal(false);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la fiche TP:', error);
      alert('Erreur lors de la sauvegarde de la fiche TP: ' + (error.response?.data?.message || error.message));
    }
  };

  // Récupérer les évaluations de l'étudiant sélectionné
  const getStudentEvaluations = (studentId) => {
    console.log('🔍 getStudentEvaluations appelé avec studentId:', studentId, 'type:', typeof studentId);
    console.log('🔍 Toutes les grilles disponibles:', grids.map(g => ({ 
      id: g.id, 
      student_id: g.student_id, 
      student_id_type: typeof g.student_id,
      student_name: g.student_name 
    })));
    
    // Essayer avec conversion de type
    const studentEvaluations = grids.filter(grid => {
      const match = parseInt(grid.student_id) === parseInt(studentId); // Conversion explicite en nombre
      console.log('🔍 Comparaison:', grid.student_id, '===', studentId, '=', match);
      return match;
    });
    
    console.log('🔍 Évaluations trouvées pour cet étudiant:', studentEvaluations);
    return studentEvaluations;
  };

  // Calculer la moyenne des notes d'un étudiant
  const getStudentAverageScore = (studentId) => {
    const studentEvaluations = getStudentEvaluations(studentId);
    if (studentEvaluations.length === 0) {
      return null;
    }
    
    const totalScore = studentEvaluations.reduce((sum, grid) => sum + (grid.calculated_score || 0), 0);
    const average = totalScore / studentEvaluations.length;
    return average.toFixed(1);
  };

  // Récupérer les commentaires généraux d'une évaluation
  const getGeneralComments = (grid) => {
    console.log('🔍 getGeneralComments appelé pour grid:', grid);
    
    // Vérifier d'abord si la grille a des commentaires globaux au niveau de la grille
    if (grid.global_comments && grid.global_comments.trim() !== '') {
      console.log('📝 Commentaires globaux trouvés au niveau de la grille:', grid.global_comments);
      return grid.global_comments;
    }
    
    if (!grid.evaluations || grid.evaluations.length === 0) {
      console.log('❌ Aucune évaluation trouvée dans la grille');
      return null;
    }
    
    console.log('📊 Évaluations dans la grille:', grid.evaluations.length);
    grid.evaluations.forEach((evaluation, index) => {
      console.log(`📝 Évaluation ${index + 1}:`, {
        competence: evaluation.competence,
        comments: evaluation.comments,
        global_comments: evaluation.global_comments,
        commentsType: typeof evaluation.comments,
        globalCommentsType: typeof evaluation.global_comments,
        commentsLength: evaluation.comments ? evaluation.comments.length : 0,
        globalCommentsLength: evaluation.global_comments ? evaluation.global_comments.length : 0
      });
    });
    
    // Chercher les commentaires généraux dans les évaluations individuelles
    const globalComments = grid.evaluations
      .map(evaluation => evaluation.global_comments)
      .filter(comment => comment && comment.trim() !== '')
      .find(comment => comment); // Prendre le premier commentaire général trouvé
    
    if (globalComments) {
      console.log('📝 Commentaires généraux trouvés dans les évaluations:', globalComments);
      return globalComments;
    }
    
    // Sinon, chercher les commentaires individuels
    const individualComments = grid.evaluations
      .map(evaluation => evaluation.comments)
      .filter(comment => comment && comment.trim() !== '')
      .join(' | ');
    
    console.log('📝 Commentaires individuels combinés:', individualComments);
    return individualComments || null;
  };

  // Fonction pour rafraîchir les données après création/modification d'évaluation
  const refreshAfterEvaluation = async () => {
    console.log('🔄 Rafraîchissement après évaluation...');
    
    // Sauvegarder l'ID de l'étudiant sélectionné
    const selectedStudentId = selectedStudentForEvaluation?.id;
    console.log('🔍 Étudiant sélectionné avant rafraîchissement:', selectedStudentId);
    
    // Attendre un peu pour s'assurer que la sauvegarde est terminée
    await new Promise(resolve => setTimeout(resolve, 3000)); // Augmenté à 3 secondes
    
    try {
      // Rafraîchir les données principales
      await fetchData();
      
      // Restaurer la sélection de l'étudiant après le rafraîchissement
      if (selectedStudentId) {
        // Trouver l'étudiant dans la liste mise à jour
        const updatedStudent = students.find(s => s.id === selectedStudentId);
        if (updatedStudent) {
          console.log('✅ Restauration de la sélection pour:', updatedStudent.first_name, updatedStudent.last_name);
          setSelectedStudentForEvaluation(updatedStudent);
        } else {
          console.log('⚠️ Étudiant non trouvé après rafraîchissement, ID:', selectedStudentId);
        }
      }
      
      console.log('✅ Rafraîchissement terminé');
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      // Essayer de rafraîchir quand même les données
      await fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des évaluations de compétences U51</h1>
              <p className="mt-2 text-gray-600">Évaluez les compétences des étudiants selon le référentiel U51</p>
            </div>
            <button
              onClick={handleCreateTPSheet}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              Créer une fiche TP
            </button>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune classe trouvée</h3>
            <p className="text-gray-500">Aucune classe n'est disponible pour l'année scolaire sélectionnée.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne de gauche - Sélection de classe et étudiants */}
            <div className="lg:col-span-1 space-y-6">
              {/* Sélection de classe */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner une classe</h2>
                <div className="space-y-3">
                  <select
                    value={selectedClass?.id || ''}
                    onChange={(e) => {
                      const classId = e.target.value;
                      const classItem = classes.find(c => c.id == classId);
                      if (classItem) {
                        handleClassSelect(classItem);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Choisir une classe --</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name} ({classItem.student_count} étudiant{classItem.student_count > 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                  
                  {selectedClass && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="font-medium text-blue-900">{selectedClass.name}</div>
                      <div className="text-sm text-blue-700">{selectedClass.student_count} étudiant{selectedClass.student_count > 1 ? 's' : ''}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Liste des étudiants */}
              {selectedClass && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Étudiants - {selectedClass.name}
                  </h2>
                  
                  {/* Barre de recherche */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un étudiant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                    {students
                      .filter(student => 
                        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((student) => {
                        const studentEvaluations = getStudentEvaluations(student.id);
                        const averageScore = getStudentAverageScore(student.id);
                        const hasEvaluations = studentEvaluations.length > 0;
                        
                        return (
                          <div
                            key={student.id}
                            onClick={() => handleStudentSelect(student)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedStudentForEvaluation?.id === student.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm flex items-center space-x-2">
                                  <div className="flex items-center space-x-2">
                                    {student.photo && (
                                      <img 
                                        src={student.photo} 
                                        alt={`${student.first_name} ${student.last_name}`}
                                        className="h-6 w-6 rounded-full object-cover border border-gray-200"
                                        onError={(e) => e.target.style.display = 'none'}
                                      />
                                    )}
                                    <span>{student.first_name} {student.last_name}</span>
                                  </div>
                                  <ColorationLogo coloration={student.coloration} className="h-12 w-12" />
                                </div>
                                <p className="text-xs text-gray-500 truncate">{student.email}</p>
                              </div>
                              <div className="text-right">
                                {hasEvaluations ? (
                                  <div>
                                    <div className="text-xs text-gray-600">
                                      Moyenne: <span className="font-semibold text-blue-600">
                                        {averageScore}/20
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {studentEvaluations.length} éval.
                                    </div>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    Non évalué
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne de droite - Évaluations de l'étudiant sélectionné */}
            <div className="lg:col-span-2">
              {selectedStudentForEvaluation ? (
                <div className="space-y-6">
                  {/* En-tête de l'étudiant sélectionné */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedStudentForEvaluation.first_name} {selectedStudentForEvaluation.last_name}
                        </h2>
                        <p className="text-gray-600">{selectedStudentForEvaluation.email}</p>
                      </div>
                      <button
                        onClick={() => handleCreateGrid(selectedStudentForEvaluation)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Créer évaluation
                      </button>
                    </div>
                  </div>

                  {/* Évaluations existantes */}
                  {(() => {
                    const studentEvaluations = getStudentEvaluations(selectedStudentForEvaluation.id);
                    console.log('📊 Évaluations pour l\'étudiant sélectionné:', studentEvaluations);
                    
                    return studentEvaluations.length > 0 ? (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <ClipboardList className="h-5 w-5 mr-2" />
                          Évaluations existantes ({studentEvaluations.length})
                        </h3>
                        <div className="space-y-4">
                          {studentEvaluations.map((grid) => (
                            <div key={grid.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900">Évaluation U51</h4>
                                  {grid.evaluations && grid.evaluations.length > 0 && (
                                    <div className="text-sm text-gray-600 mt-1 font-bold">
                                      Activité: {grid.evaluations[0].activity_name || 'Non spécifiée'}
                                    </div>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    Créée le {new Date(grid.created_at).toLocaleDateString()}
                                  </p>
                                  {grid.evaluations && grid.evaluations.length > 0 && (
                                    <p className="text-xs text-gray-500">
                                      {grid.evaluations.length} compétence{grid.evaluations.length > 1 ? 's' : ''} évaluée{grid.evaluations.length > 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  U51
                                </span>
                              </div>
                              
                              <div className="mb-3">
                                <div className="text-sm text-gray-600">
                                  Note: <span className="font-semibold text-blue-600">
                                    {grid.calculated_score?.toFixed(1) || '0.0'}/20
                                  </span>
                                </div>
                                {(() => {
                                  console.log('🔍 Affichage des commentaires pour grid:', grid.id);
                                  console.log('🔍 Structure complète de la grille:', JSON.stringify(grid, null, 2));
                                  const generalComments = getGeneralComments(grid);
                                  console.log('📝 Commentaires récupérés:', generalComments);
                                  
                                  return generalComments ? (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                                      <div className="text-sm font-medium text-gray-700 mb-2">Commentaires généraux:</div>
                                      <div className="text-base text-gray-600 leading-relaxed">
                                        {generalComments.length > 100 
                                          ? `${generalComments.substring(0, 100)}...` 
                                          : generalComments
                                        }
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                                      <div className="text-xs text-yellow-700">Aucun commentaire général trouvé</div>
                                      <div className="text-xs text-yellow-600 mt-1">
                                        Debug: {grid.evaluations ? `${grid.evaluations.length} évaluations` : 'Pas d\'évaluations'}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditGrid(grid)}
                                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handlePrintGrid(grid)}
                                  className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                                >
                                  <Printer className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGrid(grid)}
                                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation</h3>
                        <p className="text-gray-600 mb-4">
                          Cet étudiant n'a pas encore d'évaluation U51.
                        </p>
                        
                        {/* Debug info */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4 text-left">
                          <h4 className="font-medium text-yellow-800 mb-2">🔍 Informations de debug:</h4>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <p>• Total grilles trouvées: <strong>{grids.length}</strong></p>
                            <p>• Étudiant sélectionné ID: <strong>{selectedStudentForEvaluation?.id}</strong></p>
                            <p>• Évaluations pour cet étudiant: <strong>{studentEvaluations.length}</strong></p>
                            <p>• Toutes les grilles: {grids.map(g => `${g.student_id}(${g.student_name})`).join(', ')}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleCreateGrid(selectedStudentForEvaluation)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center mx-auto"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Créer la première évaluation
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un étudiant</h3>
                  <p className="text-gray-600">
                    Choisissez un étudiant dans la liste de gauche pour voir ses évaluations.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de grille d'évaluation */}
        {(() => {
          console.log('🔍 État du modal:', { showEvaluationGrid, selectedGrid: !!selectedGrid, studentId: selectedGrid?.student_id });
          return showEvaluationGrid && selectedGrid && selectedGrid.student_id;
        })() && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
                setShowEvaluationGrid(false);
                setSelectedGrid(null);
              }}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <EvaluationGrid
                  student={{
                    id: selectedGrid.student_id,
                    first_name: selectedGrid.student_name.split(' ')[0],
                    last_name: selectedGrid.student_name.split(' ').slice(1).join(' ')
                  }}
                  evaluationType="U51"
                  evaluation={selectedGrid.evaluations ? {
                    ...selectedGrid.evaluations[0],
                    global_comments: selectedGrid.evaluations[0]?.global_comments || '',
                    existingScores: selectedGrid.evaluations.reduce((acc, evaluation) => {
                      acc[evaluation.competence] = {
                        score: evaluation.score,
                        comments: evaluation.comments,
                        criteria: evaluation.criteria
                      };
                      return acc;
                    }, {})
                  } : null}
                  onCancel={() => {
                    setShowEvaluationGrid(false);
                    setSelectedGrid(null);
                  }}
                  onSave={() => {
                    setShowEvaluationGrid(false);
                    setSelectedGrid(null);
                    refreshAfterEvaluation();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Fiche TP */}
        <TPSheetModal
          isOpen={showTPSheetModal}
          onClose={() => setShowTPSheetModal(false)}
          onSave={handleSaveTPSheet}
        />
      </div>
    </div>
  );
};

export default EvaluationsU51New;
