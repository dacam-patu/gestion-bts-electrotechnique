import React, { useState, useEffect, useRef } from 'react';
import { ClipboardList, FileText, Trash2, Printer, Edit, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import EvaluationGrid from '../components/EvaluationGrid';
import EvaluationPrint from '../components/EvaluationPrint';

const Evaluations = () => {
  const [grids, setGrids] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGrid, setSelectedGrid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEvaluationGrid, setShowEvaluationGrid] = useState(false);
  const [showCreateGrid, setShowCreateGrid] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedGridForPrint, setSelectedGridForPrint] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gridsRes, studentsRes] = await Promise.all([
        axios.get('/api/evaluations/grids/all'),
        axios.get('/api/students')
      ]);

      if (gridsRes.data.success) {
        // Trier les grilles par nom d'étudiant (ordre alphabétique)
        const sortedGrids = gridsRes.data.data.sort((a, b) => {
          const nameA = a.student_name.toLowerCase();
          const nameB = b.student_name.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        // Recalculer les notes pour chaque grille avec la même logique que le modal
        const gridsWithRecalculatedScores = await Promise.all(
          sortedGrids.map(async (grid) => {
            try {
              // Récupérer les évaluations existantes pour cet étudiant
              const response = await axios.get(`/api/evaluations/student/${grid.student_id}`);
              
              if (response.data.success && response.data.data) {
                // Filtrer seulement les évaluations U52
                const evaluationsData = response.data.data.filter(evalData => 
                  evalData.type === 'U52'
                );
                
                if (evaluationsData.length > 0) {
                  // Recalculer les scores avec la même logique que le modal
                  const competenceInfo = {
                    C1: { maxScore: 5 },
                    C3: { maxScore: 5 },
                    C12: { maxScore: 10 }
                  };
                  
                  let totalObtenu = 0;
                  let totalMaximal = 0;
                  const recalculatedScores = {};
                  
                  // Récupérer les scores des compétences
                  evaluationsData.forEach(evaluation => {
                    if (evaluation.competence !== 'GLOBAL') {
                      const competence = evaluation.competence;
                      const maxScore = competenceInfo[competence]?.maxScore || 0;
                      const score = evaluation.score || 0;
                      
                      recalculatedScores[competence] = score;
                    }
                  });
                  
                  // Calculer la note globale avec la même logique que le backend
                  // Normaliser chaque compétence sur 20, puis faire la moyenne
                  const validScores = [];
                  
                  if (recalculatedScores.C1 > 0) {
                    validScores.push((recalculatedScores.C1 / 5) * 20); // C1 sur 5 → normaliser sur 20
                  }
                  if (recalculatedScores.C3 > 0) {
                    validScores.push((recalculatedScores.C3 / 5) * 20); // C3 sur 5 → normaliser sur 20
                  }
                  if (recalculatedScores.C12 > 0) {
                    validScores.push((recalculatedScores.C12 / 10) * 20); // C12 sur 10 → normaliser sur 20
                  }
                  
                  const noteGlobale = validScores.length > 0 
                    ? Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 100) / 100
                    : 0;
                  
                  // Mettre à jour la grille avec les scores recalculés
                  return {
                    ...grid,
                    competence_scores: recalculatedScores,
                    global_score: noteGlobale
                  };
                }
              }
              
              // Si pas d'évaluations trouvées, retourner la grille telle quelle
              return grid;
            } catch (error) {
              console.error(`Erreur lors du recalcul des scores pour l'étudiant ${grid.student_id}:`, error);
              return grid;
            }
          })
        );
        
        setGrids(gridsWithRecalculatedScores);
      }
      
      if (studentsRes.data.success) {
        // Trier aussi les étudiants par nom pour la modal de création
        const sortedStudents = studentsRes.data.data.sort((a, b) => {
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setStudents(sortedStudents);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleGridClick = async (grid) => {
    console.log('🖱️ Clic sur la grille:', grid);
    
    try {
      // Récupérer les évaluations existantes pour cet étudiant (même logique que handleEditGrid)
      const response = await axios.get(`/api/evaluations/student/${grid.student_id}`);
      
      if (response.data.success && response.data.data) {
        // Filtrer seulement les évaluations U52
        const evaluationsData = response.data.data.filter(evalData => 
          evalData.type === 'U52'
        );
        
        if (evaluationsData.length > 0) {
          // Récupérer les informations supplémentaires depuis la première évaluation
          const firstEval = evaluationsData[0];
          
          // Créer un objet evaluation avec toutes les données existantes
          const existingEvaluation = {
            student_id: grid.student_id,
            evaluated_at: firstEval.evaluated_at,
            type: 'U52',
            activity_name: firstEval.activity_name || '',
            activity_type: firstEval.activity_type || '',
            // Récupérer les scores et commentaires existants
            existingScores: evaluationsData.reduce((acc, evaluation) => {
              if (evaluation.competence !== 'GLOBAL') {
                acc[evaluation.competence] = {
                  score: evaluation.score,
                  comments: evaluation.comments || '',
                  criteria: evaluation.criteria ? JSON.parse(evaluation.criteria) : null
                };
              }
              
              return acc;
            }, {}),
            // Récupérer la note globale si elle existe
            globalScore: evaluationsData.find(e => e.competence === 'GLOBAL')?.score || 0,
            globalComments: evaluationsData.find(e => e.global_comments)?.global_comments || ''
          };
          
          console.log('📊 Données existantes récupérées pour clic:', existingEvaluation);
          
          // Mettre à jour selectedGrid avec les données existantes
          setSelectedGrid({
            ...grid,
            existingEvaluation: existingEvaluation
          });
        } else {
          setSelectedGrid(grid);
        }
      } else {
        setSelectedGrid(grid);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des évaluations existantes pour clic:', error);
      setSelectedGrid(grid);
    }
    
    setShowEvaluationGrid(true);
  };

  const handleCreateNewGrid = () => {
    setSelectedGrid(null);
    setShowCreateGrid(true);
  };

  const handleEditGrid = async (grid) => {
    console.log('✏️ Modification de la grille:', grid);
    
    try {
      // Récupérer les évaluations existantes pour cet étudiant
      const response = await axios.get(`/api/evaluations/student/${grid.student_id}`);
      
      if (response.data.success && response.data.data) {
        // Filtrer seulement les évaluations U52
        const evaluationsData = response.data.data.filter(evalData => 
          evalData.type === 'U52'
        );
        
        if (evaluationsData.length > 0) {
          // Récupérer les informations supplémentaires depuis la première évaluation
          const firstEval = evaluationsData[0];
          
          // Créer un objet evaluation avec toutes les données existantes
          const existingEvaluation = {
            student_id: grid.student_id,
            evaluated_at: firstEval.evaluated_at,
            type: 'U52',
            activity_name: firstEval.activity_name || '',
            activity_type: firstEval.activity_type || '',
            // Récupérer les scores et commentaires existants
            existingScores: evaluationsData.reduce((acc, evaluation) => {
              if (evaluation.competence !== 'GLOBAL') {
                acc[evaluation.competence] = {
                  score: evaluation.score,
                  comments: evaluation.comments || '',
                  criteria: evaluation.criteria ? JSON.parse(evaluation.criteria) : null
                };
              }
              

              
              return acc;
            }, {}),
            // Récupérer la note globale si elle existe
            globalScore: evaluationsData.find(e => e.competence === 'GLOBAL')?.score || 0,
            globalComments: evaluationsData.find(e => e.global_comments)?.global_comments || ''
          };
          
          console.log('📊 Données existantes récupérées:', existingEvaluation);
          
          // Mettre à jour selectedGrid avec les données existantes
          setSelectedGrid({
            ...grid,
            existingEvaluation: existingEvaluation
          });
        } else {
          setSelectedGrid(grid);
        }
      } else {
        setSelectedGrid(grid);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des évaluations existantes:', error);
      setSelectedGrid(grid);
    }
    
    setShowEvaluationGrid(true);
  };

  const handleStudentSelect = (student) => {
    console.log('🧑‍🎓 Étudiant sélectionné:', student);
    
    setSelectedGrid({
      student_id: student.id,
      project_id: student.project_id,
      student_name: `${student.first_name} ${student.last_name}`,
      class: student.class,
      group_name: student.group_name,
      project_title: student.project_title,
      // S'assurer que les IDs sont bien transmis
      id: student.id // Ajout pour compatibilité
    });
    setShowCreateGrid(false);
    setShowEvaluationGrid(true);
  };

  const handleEvaluationGridSave = async (evaluationData) => {
    try {
      console.log('🔄 Début de la sauvegarde de la grille d\'évaluation finalisée');
      console.log('📊 Données à sauvegarder:', evaluationData);
      
      // Validation des données avant envoi
      if (!selectedGrid?.student_id) {
        toast.error('Erreur: Informations étudiant manquantes');
        return;
      }
      
      if (!evaluationData || evaluationData.length === 0) {
        toast.error('Erreur: Aucune évaluation à sauvegarder');
        return;
      }

      // Vérifier si c'est une modification (grille existante) ou une création
      const isModification = selectedGrid.id && selectedGrid.student_id;
      
      if (isModification) {
        console.log('🔄 Modification d\'une grille existante');
        
        // Supprimer seulement les évaluations de cette grille spécifique
        try {
          await axios.delete(`/api/evaluations/grid/${selectedGrid.id}`);
          console.log('🗑️ Anciennes évaluations de cette grille supprimées');
        } catch (deleteError) {
          console.log('⚠️ Erreur lors de la suppression des anciennes évaluations:', deleteError);
        }
      }
      
      // Calculer la note globale basée sur les scores des compétences
      let globalScore = 0;
      let competenceCount = 0;
      
      // Sauvegarder chaque évaluation avec validation complète
      for (const evaluation of evaluationData) {
        // Validation des champs requis
        if (!evaluation.competence) {
          console.error('❌ Compétence manquante pour:', evaluation);
          continue;
        }
        
        if (typeof evaluation.score !== 'number' || evaluation.score < 0) {
          console.error('❌ Score invalide pour:', evaluation);
          continue;
        }
        
        // Ignorer la compétence GLOBAL pour le calcul de la moyenne
        if (evaluation.competence !== 'GLOBAL') {
          globalScore += parseFloat(evaluation.score);
          competenceCount++;
        }
        
        console.log(`💾 Sauvegarde de l'évaluation: ${evaluation.competence} - ${evaluation.score}/20`);
        
        const evaluationPayload = {
          student_id: parseInt(selectedGrid.student_id),
          project_id: selectedGrid.project_id ? parseInt(selectedGrid.project_id) : null,
          competence: evaluation.competence,
          type: 'U52',
          score: parseFloat(evaluation.score),
          comments: evaluation.comments || '',
          criteria: evaluation.criteria || null,
          activity_name: evaluation.activity_name || '',
          activity_type: evaluation.activity_type || ''
        };
        
        console.log('📤 Payload envoyé:', evaluationPayload);
        
        const response = await axios.post('/api/evaluations', evaluationPayload);
        console.log('✅ Réponse du serveur:', response.data);
      }
      
      // Calculer la moyenne et sauvegarder la note globale
      if (competenceCount > 0) {
        const averageScore = globalScore / competenceCount;
        console.log(`📊 Note globale calculée: ${averageScore.toFixed(2)}/20`);
        
        // Sauvegarder la note globale
        const globalEvaluationPayload = {
          student_id: parseInt(selectedGrid.student_id),
          project_id: selectedGrid.project_id ? parseInt(selectedGrid.project_id) : null,
          competence: 'GLOBAL',
          type: 'U52',
          score: parseFloat(averageScore.toFixed(2)),
          comments: 'Note globale calculée automatiquement',
          criteria: null,
          activity_name: evaluationData[0]?.activity_name || '',
          activity_type: evaluationData[0]?.activity_type || ''
        };
        
        console.log('📤 Sauvegarde de la note globale:', globalEvaluationPayload);
        
        try {
          const globalResponse = await axios.post('/api/evaluations', globalEvaluationPayload);
          console.log('✅ Note globale sauvegardée:', globalResponse.data);
        } catch (globalError) {
          console.error('❌ Erreur lors de la sauvegarde de la note globale:', globalError);
        }
      }
      
      const successMessage = isModification ? 'Grille d\'évaluation modifiée avec succès' : 'Grille d\'évaluation finalisée avec succès';
      toast.success(successMessage);
      setShowEvaluationGrid(false);
      setShowCreateGrid(false);
      fetchData(); // Rafraîchir la liste des grilles
    } catch (error) {
      console.error('❌ Erreur détaillée lors de la sauvegarde de la grille:', error);
      console.error('📋 Réponse d\'erreur:', error.response?.data);
      console.error('🔢 Status code:', error.response?.status);
      toast.error(`Erreur lors de la sauvegarde de la grille: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteGrid = async (gridId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette grille d\'évaluation et toutes les évaluations associées ? Cette action est irréversible.')) {
      return;
    }

    try {
      console.log(`🗑️ Suppression de la grille ID: ${gridId}`);
      
      const response = await axios.delete(`/api/evaluations/grid/${gridId}`);
      
      if (response.data.success) {
        toast.success('Grille d\'évaluation supprimée avec succès');
        fetchData(); // Rafraîchir la liste des grilles
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la grille:', error);
      toast.error(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePrintGrid = async (grid) => {
    try {
      console.log('🖨️ Début de handlePrintGrid pour:', grid);
      
      // Récupérer les évaluations existantes pour cet étudiant
      const response = await axios.get(`/api/evaluations/student/${grid.student_id}`);

      if (response.data.success && response.data.data) {
        // Filtrer seulement les évaluations U52
        const evaluationsData = response.data.data.filter(evalData =>
          evalData.type === 'U52'
        );

        if (evaluationsData.length > 0) {
          // Récupérer les informations supplémentaires depuis la première évaluation
          const firstEval = evaluationsData[0];

          // Créer un objet evaluation avec toutes les données existantes
          const existingEvaluation = {
            student_id: grid.student_id,
            evaluated_at: firstEval.evaluated_at,
            type: 'U52',
            activity_name: firstEval.activity_name || '',
            activity_type: firstEval.activity_type || '',
            // Récupérer les scores et commentaires existants
            existingScores: evaluationsData.reduce((acc, evaluation) => {
              if (evaluation.competence !== 'GLOBAL') {
                acc[evaluation.competence] = {
                  score: evaluation.score,
                  comments: evaluation.comments || '',
                  criteria: evaluation.criteria ? JSON.parse(evaluation.criteria) : null
                };
              }

              return acc;
            }, {}),
            // Récupérer la note globale si elle existe
            globalScore: evaluationsData.find(e => e.competence === 'GLOBAL')?.score || 0,
            globalComments: evaluationsData.find(e => e.global_comments)?.global_comments || ''
          };
          
          console.log('📊 Données existantes récupérées pour impression:', existingEvaluation);

          // Toujours utiliser le mode critères pour l'impression (mode détaillé)
          let detectedEvaluationMode = 'criteria';
          let detectedDirectNotes = {};
          
          // Calculer le niveau le plus élevé basé sur le score pour chaque compétence
          Object.entries(existingEvaluation.existingScores).forEach(([competence, data]) => {
            if (data.score) {
              // Calculer le niveau N basé sur le score
              let maxScore = 5; // Par défaut
              if (competence === 'C12') maxScore = 10;
              
              const percentage = (data.score / maxScore) * 100;
              let level = 'N1';
              if (percentage >= 75) level = 'N4';
              else if (percentage >= 50) level = 'N3';
              else if (percentage >= 25) level = 'N2';
              
              // Stocker le niveau le plus élevé pour l'affichage d'une seule croix
              detectedDirectNotes[competence] = {
                [level]: true
              };
            }
          });

          // Créer l'objet pour l'impression avec les bonnes propriétés
          const printData = {
            ...grid,
            firstName: grid.student_name.split(' ')[0] || '',
            lastName: grid.student_name.split(' ').slice(1).join(' ') || '',
            grid_data: existingEvaluation.existingScores,
            global_comments: existingEvaluation.globalComments,
            global_score: existingEvaluation.globalScore,
            activity_name: existingEvaluation.activity_name,
            activity_type: existingEvaluation.activity_type,
            evaluationMode: detectedEvaluationMode,
            directNotes: detectedDirectNotes
          };

          console.log('🖨️ Données préparées pour impression:', printData);
          console.log('🖨️ Mode d\'évaluation détecté:', detectedEvaluationMode);
          console.log('🖨️ Notes directes détectées:', detectedDirectNotes);

          // Définir les données pour l'impression
          setSelectedGridForPrint(printData);
          
          // Ouvrir directement la prévisualisation d'impression
          setShowPrintPreview(true);
        } else {
          toast.error('Aucune évaluation trouvée pour cet étudiant');
        }
      } else {
        toast.error('Impossible de récupérer les données de la grille');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la grille:', error);
      toast.error('Erreur lors de la récupération des données');
    }
  };

  const handlePrintConfirm = () => {
    const printWindow = window.open('', '_blank');
    const printContent = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fiche d'évaluation - ${selectedGridForPrint?.student_name}</title>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 20mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.2;
              }
              .print-container {
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
            @media screen {
              body {
                font-family: Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.2;
                background-color: #f5f5f5;
                padding: 20px;
              }
              .print-container {
                background-color: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin: 0 auto;
              }
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
      printWindow.close();
    }, 500);
    
    setShowPrintPreview(false);
    toast.success('Impression lancée');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Finalisée</span>;
      case 'draft':
        return <span className="badge badge-danger">Non finalisé</span>;
      default:
        return <span className="badge badge-secondary">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grilles d'évaluation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des grilles d'évaluation des trois compétences (C1, C3, C12)
          </p>
        </div>
        <button
          onClick={handleCreateNewGrid}
          className="btn btn-primary flex items-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          Nouvelle grille
        </button>
      </div>

      {/* Liste des grilles */}
      <div className="card">
        {grids.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune grille d'évaluation</h3>
            <p className="mt-2 text-sm text-gray-500">
              Commencez par créer une grille d'évaluation pour un étudiant.
            </p>
            <button
              onClick={handleCreateNewGrid}
              className="mt-4 btn btn-primary"
            >
              Créer une grille
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {grids.map((grid) => (
              <div
                key={grid.id}
                className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
                onClick={() => handleGridClick(grid)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {grid.student_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {grid.class} • {grid.group_name || 'Sans groupe'} • {grid.project_title || 'Sans projet'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(grid.status)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGrid(grid);
                      }}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Modifier cette grille"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintGrid(grid);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Imprimer cette grille"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGrid(grid.id);
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Supprimer cette grille"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Scores des compétences */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">C1</div>
                    <div className="text-lg font-bold text-blue-600">
                      {grid.competence_scores?.C1 ? grid.competence_scores.C1.toFixed(1) : '0.0'}/5
                    </div>
                    <div className="text-xs text-blue-700">Normes et réglementations</div>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-900">C3</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {grid.competence_scores?.C3 ? grid.competence_scores.C3.toFixed(1) : '0.0'}/5
                    </div>
                    <div className="text-xs text-yellow-700">Gestion des risques</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-900">C12</div>
                    <div className="text-lg font-bold text-green-600">
                      {grid.competence_scores?.C12 ? grid.competence_scores.C12.toFixed(1) : '0.0'}/10
                    </div>
                    <div className="text-xs text-green-700">Conduite de projet</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">GLOBAL</div>
                    <div className="text-lg font-bold text-gray-600">
                      {grid.global_score ? grid.global_score.toFixed(1) : '0.0'}/20
                    </div>
                    <div className="text-xs text-gray-700">Note finale</div>
                  </div>
                </div>

                {/* Commentaires et dates */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    {grid.global_comments && grid.global_comments.length > 0 && (
                      <p className="italic">"{grid.global_comments.substring(0, 100)}{grid.global_comments.length > 100 ? '...' : ''}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p>Créée le {grid.created_at ? formatDate(grid.created_at) : 'Date inconnue'}</p>
                    {grid.updated_at && grid.created_at && grid.updated_at !== grid.created_at && (
                      <p>Modifiée le {formatDate(grid.updated_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Sélection d'étudiant pour nouvelle grille */}
      {showCreateGrid && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateGrid(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Créer une nouvelle grille d'évaluation
                  </h3>
                  <p className="text-sm text-gray-500">
                    Sélectionnez un étudiant pour créer sa grille d'évaluation
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Ajoutez des étudiants pour commencer les évaluations.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="border rounded-lg p-4 cursor-pointer transition-colors hover:border-gray-300"
                          onClick={() => handleStudentSelect(student)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <ClipboardList className="h-6 w-6 text-primary-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {student.class} • {student.group_name || 'Sans groupe'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-secondary sm:ml-3 sm:w-auto"
                  onClick={() => setShowCreateGrid(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Grille d'évaluation */}
      {showEvaluationGrid && selectedGrid && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEvaluationGrid(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Grille d'évaluation complète
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedGrid.student_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEvaluationGrid(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="max-h-[80vh] overflow-y-auto">
                  <EvaluationGrid 
                    student={selectedGrid}
                    competences={null}
                    evaluation={selectedGrid.existingEvaluation || null}
                    evaluationType="U52"
                    initialShowPrintPreview={showPrintPreview}
                    onSave={handleEvaluationGridSave}
                    onDraftSave={fetchData}
                    onCancel={() => setShowEvaluationGrid(false)}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-secondary sm:ml-3 sm:w-auto"
                  onClick={() => {
                    setShowEvaluationGrid(false);
                    setShowPrintPreview(false);
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation d'impression */}
      {showPrintPreview && selectedGridForPrint && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowPrintPreview(false);
              setSelectedGridForPrint(null);
            }} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Prévisualisation de l'impression
                  </h3>
                  <p className="text-sm text-gray-500">
                    Aperçu de la fiche d'évaluation pour {selectedGridForPrint.student_name}
                  </p>
                </div>
                
                <div className="max-h-[80vh] overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4">
                  <div ref={printRef} className="bg-white">
                    <EvaluationPrint
                      student={selectedGridForPrint}
                      evaluations={selectedGridForPrint.grid_data || {}}
                      globalScore={selectedGridForPrint.global_score || 0}
                      globalComments={selectedGridForPrint.global_comments || 'Note globale calculée automatiquement'}
                      evaluationType="U52"
                      evaluationMode={selectedGridForPrint.evaluationMode || 'criteria'}
                      directNotes={selectedGridForPrint.directNotes || {}}
                      competenceInfo={{
                        C1: { title: 'Recenser et prendre en compte les normes, les réglementations applicables au projet/chantier', maxScore: 5 },
                        C3: { title: 'Gérer les risques et les aléas liés à la réalisation des tâches', maxScore: 5 },
                        C12: { title: 'Gérer et conduire le projet/chantier professionnel', maxScore: 10 }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handlePrintConfirm}
                  className="btn btn-primary sm:ml-3 sm:w-auto flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </button>
                <button
                  type="button"
                  className="btn btn-secondary sm:ml-3 sm:w-auto"
                  onClick={() => {
                    setShowPrintPreview(false);
                    setSelectedGridForPrint(null);
                  }}
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

export default Evaluations; 