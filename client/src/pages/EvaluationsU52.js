import React, { useState, useEffect } from 'react';
import { useSchoolYear } from '../contexts/SchoolYearContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  ClipboardList, 
  Edit, 
  Trash2, 
  Printer, 
  User,
  Search,
  X
} from 'lucide-react';
import EvaluationGrid from '../components/EvaluationGrid';
import TPSheetModal from '../components/TPSheetModal';
import ColorationLogo from '../components/ColorationLogo';

const EvaluationsU52 = () => {
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
      
      // Définir les scores maximaux pour chaque compétence U52
      let maxScore = 5; // Par défaut pour U52
      
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

  const handleStudentSelect = (student) => {
    setSelectedStudentForEvaluation(student);
  };

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
      alert('Erreur lors du chargement des étudiants');
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Récupération des données U52...');
      
      const classesRes = await axios.get(`/api/classes?school_year=${selectedYear}`);
      
      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
        
        // Récupérer toutes les évaluations U52
        try {
          console.log('🔄 Appel API /api/evaluations...');
          const allEvaluationsRes = await axios.get('/api/evaluations');
          console.log('✅ Réponse API reçue:', allEvaluationsRes.data);
          
          if (allEvaluationsRes.data.success) {
            console.log('📊 Total évaluations dans la base:', allEvaluationsRes.data.data.length);
            
            // Filtrer les évaluations U52
            const u52Evaluations = allEvaluationsRes.data.data.filter(evaluation => evaluation.type === 'U52');
            console.log('📊 Évaluations U52 trouvées dans la base:', u52Evaluations.length);
            
            // Grouper les évaluations par étudiant
            const evaluationsByStudent = {};
            u52Evaluations.forEach(evaluation => {
              if (!evaluationsByStudent[evaluation.student_id]) {
                evaluationsByStudent[evaluation.student_id] = [];
              }
              evaluationsByStudent[evaluation.student_id].push(evaluation);
            });
            
            console.log('📊 Évaluations groupées par étudiant:', Object.keys(evaluationsByStudent).length, 'étudiants');
            
            // Créer les grilles pour chaque étudiant qui a des évaluations U52
            const gridsWithEvaluations = [];
            Object.keys(evaluationsByStudent).forEach(studentId => {
              const studentEvaluations = evaluationsByStudent[studentId];
              
              console.log('🔍 Traitement étudiant U52:', {
                studentId,
                evaluationsCount: studentEvaluations.length
              });
              
              if (studentEvaluations.length > 0) {
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
                      student_id: String(studentId), // S'assurer que c'est un string
                      student_name: `${sessionEvaluations[0].first_name || ''} ${sessionEvaluations[0].last_name || ''}`,
                      type: 'U52',
                      created_at: sessionKey,
                      calculated_score: recalculatedScore.average,
                      has_evaluations: recalculatedScore.hasEvaluations,
                      global_comments: globalComments,
                      evaluations: sessionEvaluations
                    };
                  gridsWithEvaluations.push(grid);
                  console.log('✅ Grille U52 créée pour:', grid.student_name, 'session:', sessionKey, 'global_comments:', globalComments);
                });
              }
            });
            
            // Trier les grilles par nom d'étudiant (ordre alphabétique)
            const sortedGrids = gridsWithEvaluations.sort((a, b) => {
              const nameA = a.student_name.toLowerCase();
              const nameB = b.student_name.toLowerCase();
              return nameA.localeCompare(nameB);
            });
            
            console.log('📊 Grilles U52 créées:', sortedGrids.length);
            setGrids(sortedGrids);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des évaluations:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer les évaluations U52
    const getStudentEvaluations = (studentId) => {
      // Convertir studentId en string pour la comparaison
      const studentIdStr = String(studentId);
      
      const studentEvaluations = grids.filter(grid => {
        const gridStudentIdStr = String(grid.student_id);
        return gridStudentIdStr === studentIdStr;
      });
      
      return studentEvaluations;
    };

  const getStudentAverageScore = (studentId) => {
    const studentEvaluations = getStudentEvaluations(studentId);
    if (studentEvaluations.length === 0) return 0;
    
    // Utiliser le score calculé de la grille si disponible
    const totalScore = studentEvaluations.reduce((sum, grid) => {
      return sum + (grid.calculated_score || 0);
    }, 0);
    
    return studentEvaluations.length > 0 ? Math.round((totalScore / studentEvaluations.length) * 10) / 10 : 0;
  };

  const getGeneralComments = (grid) => {
    if (!grid.evaluations || grid.evaluations.length === 0) {
      return null;
    }
    
    // Chercher les commentaires généraux dans les évaluations individuelles
    const globalComments = grid.evaluations
      .map(evaluation => evaluation.global_comments)
      .filter(comment => comment && comment.trim() !== '')
      .find(comment => comment);
    
    if (globalComments) {
      return globalComments;
    }
    
    // Sinon, chercher les commentaires individuels
    const individualComments = grid.evaluations
      .map(evaluation => evaluation.comments)
      .filter(comment => comment && comment.trim() !== '')
      .join(' | ');
    
    return individualComments || null;
  };

  const handleCreateGrid = (student) => {
    setSelectedStudentForEvaluation(student);
    setSelectedGrid(null);
    setShowEvaluationGrid(true);
  };

  const handleEditGrid = (grid) => {
    setSelectedGrid(grid);
    const student = students.find(s => s.id === grid.student_id);
    setSelectedStudentForEvaluation(student);
    setShowEvaluationGrid(true);
  };

  const handleCreateTPSheet = () => {
    setShowTPSheetModal(true);
  };

  // Fonction pour rafraîchir les données après création/modification d'évaluation
  const refreshAfterEvaluation = async () => {
    console.log('🔄 Rafraîchissement après évaluation...');
    
    const selectedStudentId = selectedStudentForEvaluation?.id;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await fetchData();
      
      if (selectedStudentId) {
        const updatedStudent = students.find(s => s.id === selectedStudentId);
        if (updatedStudent) {
          setSelectedStudentForEvaluation(updatedStudent);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      await fetchData();
    }
  };

  const handleDeleteGrid = async (grid) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      try {
        // Supprimer toutes les évaluations de cette grille
        for (const evaluation of grid.evaluations) {
          await axios.delete(`/api/evaluations/${evaluation.id}`);
        }
        
        // Rafraîchir les données
        await fetchData();
        
        // Désélectionner l'étudiant si c'était sa grille
        if (selectedStudentForEvaluation && selectedStudentForEvaluation.id === grid.student_id) {
          setSelectedStudentForEvaluation(null);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handlePrintGrid = (grid) => {
    // Logique d'impression
    window.print();
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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des évaluations de compétences U52</h1>
              <p className="mt-2 text-gray-600">Évaluez les compétences des étudiants selon le référentiel U52</p>
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
                                  <h4 className="font-medium text-gray-900">Évaluation U52</h4>
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
                                  U52
                                </span>
                              </div>
                              
                              <div className="mb-3">
                                <div className="text-sm text-gray-600">
                                  Note: <span className="font-semibold text-blue-600">
                                    {grid.calculated_score?.toFixed(1) || '0.0'}/20
                                  </span>
                                </div>
                                {(() => {
                                  const generalComments = getGeneralComments(grid);
                                  
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
                                  ) : null;
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
                          Cet étudiant n'a pas encore d'évaluation U52.
                        </p>
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
        {showEvaluationGrid && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEvaluationGrid(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Grille d'évaluation U52</h3>
                    <button
                      onClick={() => setShowEvaluationGrid(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <EvaluationGrid
                    student={selectedStudentForEvaluation}
                    existingGrid={selectedGrid}
                    type="U52"
                    onClose={() => {
                      setShowEvaluationGrid(false);
                      setSelectedGrid(null);
                    }}
                    onSave={async () => {
                      setShowEvaluationGrid(false);
                      setSelectedGrid(null);
                      await refreshAfterEvaluation();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de création de fiche TP */}
        <TPSheetModal
          isOpen={showTPSheetModal}
          onClose={() => setShowTPSheetModal(false)}
        />
      </div>
    </div>
  );
};

export default EvaluationsU52;