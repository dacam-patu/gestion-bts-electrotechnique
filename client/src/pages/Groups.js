import React, { useState, useEffect } from 'react';
import { Plus, Users, User, Edit, Trash2, CheckCircle, AlertCircle, Printer, ClipboardList } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    project_id: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGroupData, setEditGroupData] = useState({
    id: '',
    name: '',
    project_id: '',
    addStudentIds: [],
    removeStudentIds: []
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showGridModal, setShowGridModal] = useState(false);
  const [gridRows, setGridRows] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData(false); // Pas de force refresh au démarrage
  }, []);

  // Fonction utilitaire pour normaliser les libellés de classe
  const normalizeClass = (v) => (v || '').toString().replace(/\s+/g, '').toUpperCase();

  // Fonction pour filtrer les étudiants sans groupe par classe
  const getStudentsWithoutGroup = () => {
    // S'assurer qu'on ne prend que les étudiants vraiment sans groupe
    let filteredStudents = students.filter(s => {
      const hasNoGroup = !s.group_id || s.group_id === null || s.group_id === undefined;
      if (!hasNoGroup) {
        console.log(`⚠️ ${s.first_name} ${s.last_name} a déjà un group_id: ${s.group_id}`);
      }
      return hasNoGroup;
    });
    
    if (selectedClass && selectedClass !== '') {
      const selectedClassObj = classes.find(c => String(c.id) === String(selectedClass));
      const selectedName = selectedClassObj?.name || '';
      filteredStudents = filteredStudents.filter(s => {
        const byId = s.class_id != null && String(s.class_id) === String(selectedClass);
        const byExactName = normalizeClass(s.class) === normalizeClass(selectedName);
        const byPrefix = normalizeClass(s.class).startsWith(normalizeClass(selectedName));
        return byId || byExactName || byPrefix;
      });
    }
    
    return filteredStudents;
  };

  const fetchData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        console.log('🔄 Rafraîchissement des données...');
      }
      
      // Cache-busting seulement si nécessaire
      const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
      
      const [groupsRes, studentsRes, projectsRes, classesRes] = await Promise.all([
        axios.get(`/api/students/groups/all${cacheBuster}`),
        axios.get(`/api/students${cacheBuster}`),
        axios.get(`/api/projects${cacheBuster}`),
        axios.get(`/api/classes${cacheBuster}`)
      ]);

      if (groupsRes.data.success) {
        const groupsData = groupsRes.data.data || [];
        setGroups(groupsData);
        if (forceRefresh) {
          console.log('✅ Groupes mis à jour:', groupsData.length, 'groupes');
        }
      }
      
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data || []);
        if (forceRefresh) {
          console.log('✅ Étudiants mis à jour:', studentsRes.data.data.length);
        }
      }
      
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.data || []);
      }
      
      if (classesRes.data.success) {
        setClasses(classesRes.data.data || []);
      }
      
      if (forceRefresh) {
        console.log('✅ Rafraîchissement terminé');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      // L'API des groupes est exposée sous /api/students/groups
      const response = await axios.post('/api/students/groups', groupFormData);
      if (response.data.success) {
        toast.success('Groupe créé avec succès');
        setShowModal(false);
        setGroupFormData({ name: '', project_id: '' });
        fetchData(true);
      }
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du groupe');
    }
  };

  // Ouvrir la modale d'édition pour un groupe
  const openEditGroupModal = (group) => {
    setEditGroupData({
      id: group.id,
      name: group.name || '',
      project_id: group.project_id || '',
      addStudentIds: [],
      removeStudentIds: []
    });
    setShowEditModal(true);
  };

  // Sauvegarder les modifications du groupe (nom/projet + ajouts/retraits étudiants)
  const handleSaveEditGroup = async (e) => {
    e.preventDefault();
    if (!editGroupData.id) {
      toast.error('Groupe introuvable');
      return;
    }
    try {
      await axios.put(`/api/students/groups/${editGroupData.id}`, {
        name: editGroupData.name,
        project_id: editGroupData.project_id || null
      });
      
      if (editGroupData.addStudentIds.length > 0) {
        await axios.post('/api/students/bulk-assign-group', {
          student_ids: editGroupData.addStudentIds,
          group_id: editGroupData.id
        });
      }
      
      if (editGroupData.removeStudentIds.length > 0) {
        await Promise.all(
          editGroupData.removeStudentIds.map((studentId) =>
            axios.post('/api/students/remove-from-group', { student_id: studentId })
          )
        );
      }
      
      toast.success('Groupe modifié avec succès');
      setShowEditModal(false);
      setEditGroupData({
        id: '',
        name: '',
        project_id: '',
        addStudentIds: [],
        removeStudentIds: []
      });
      fetchData(true);
    } catch (error) {
      console.error('Erreur lors de la modification du groupe:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du groupe');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/groups/${groupId}`);
      if (response.data.success) {
        toast.success('Groupe supprimé avec succès');
        fetchData(true);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du groupe');
    }
  };

  const handleBulkAssign = async (studentIds, groupId) => {
    // Vérifier que les étudiants sélectionnés sont bien disponibles
    const selectedStudents = students.filter(s => studentIds.includes(s.id));
    const availableStudents = selectedStudents.filter(s => !s.group_id || s.group_id === null || s.group_id === undefined);
    
    console.log('🔍 Vérification avant affectation:');
    console.log(`  📋 Étudiants sélectionnés: ${selectedStudents.length}`);
    console.log(`  📋 Étudiants disponibles: ${availableStudents.length}`);
    
    if (availableStudents.length === 0) {
      toast.error('❌ Aucun des étudiants sélectionnés n\'est disponible (ils sont peut-être déjà dans un groupe)', {
        duration: 5000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });
      return;
    }
    
    // Afficher un toast de chargement
    const loadingToast = toast.loading(`🔄 Affectation de ${availableStudents.length} étudiant(s) en cours...`, {
      duration: 0 // Ne pas fermer automatiquement
    });
    
    try {
      const response = await axios.post('/api/students/bulk-assign-group', {
        student_ids: availableStudents.map(s => s.id),
        group_id: groupId
      });
      
      console.log('✅ Réponse affectation:', response.data);
      
      // Fermer le toast de chargement
      toast.dismiss(loadingToast);
      
      // Message basé sur la vraie réponse de l'API
      const { assigned_count, group_name } = response.data;
      
      if (assigned_count > 0) {
        const addedStudents = students.filter(s => studentIds.includes(s.id));
        const studentNames = addedStudents.map(s => `${s.first_name} ${s.last_name}`).join(', ');
        
        toast.success(`✅ ${assigned_count} étudiant(s) ajouté(s) au ${group_name}:\n${studentNames}`, {
          duration: 6000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'pre-line'
          }
        });
      } else {
        toast.info(`ℹ️ Aucun étudiant n'a été ajouté au ${group_name}.\nLes étudiants sélectionnés sont peut-être déjà dans ce groupe ou dans un autre groupe.`, {
          duration: 5000,
          style: {
            background: '#3B82F6',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'pre-line'
          }
        });
      }
      
      // Fermer le modal et réinitialiser les états
      setShowBulkAssignModal(false);
      setSelectedClass('');
      setSelectedStudents([]);
      setTargetGroupId('');
      
      // Attendre un peu pour s'assurer que la base de données est mise à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Rafraîchir les données une seule fois
      await fetchData(true);
      
      // Mise à jour directe de l'état pour forcer l'affichage immédiat
      setTimeout(async () => {
        try {
          const response = await axios.get('/api/students/groups/all');
          if (response.data.success) {
            const newGroups = response.data.data;
            setGroups(newGroups);
            
            // Forcer le re-render de l'interface
            setRefreshKey(prev => prev + 1);
            
            // Log pour vérifier que l'étudiant est bien ajouté
            const targetGroup = newGroups.find(g => g.id === groupId);
            if (targetGroup) {
              console.log(`✅ ${targetGroup.name} contient maintenant ${targetGroup.students?.length || 0} étudiants`);
              if (targetGroup.students && targetGroup.students.length > 0) {
                console.log('📋 Étudiants dans le groupe:', targetGroup.students.map(s => `${s.first_name} ${s.last_name}`));
              }
            }
            
            console.log('✅ Interface mise à jour avec les nouvelles données');
          }
        } catch (error) {
          console.error('❌ Erreur mise à jour interface:', error);
        }
      }, 200);
      
      console.log('✅ Affectation terminée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affectation:', error);
      
      // Fermer le toast de chargement en cas d'erreur
      toast.dismiss(loadingToast);
      
      toast.error('Erreur lors de l\'affectation des étudiants', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });
    }
  };

  const handleSelectAll = () => {
    const availableStudents = getStudentsWithoutGroup();
    if (selectedStudents.length === availableStudents.length) {
      // Désélectionner tous
      setSelectedStudents([]);
    } else {
      // Sélectionner tous
      setSelectedStudents(availableStudents.map(s => s.id));
    }
  };

  // Fonction pour ouvrir la modal avec pré-sélection du groupe
  const openBulkAssignModal = (groupId = '') => {
    // Rafraîchir les données avant d'ouvrir le modal pour s'assurer de la synchronisation
    fetchData(true).then(() => {
      setTargetGroupId(groupId);
      setSelectedClass('');
      setSelectedStudents([]);
      setShowBulkAssignModal(true);
      
      // Log des étudiants disponibles après rafraîchissement
      const availableStudents = students.filter(s => !s.group_id || s.group_id === null || s.group_id === undefined);
      console.log('🔄 Modal ouvert - Étudiants disponibles après rafraîchissement:', availableStudents.length);
    });
  };

  const handleResetAllStudents = async () => {
    try {
      await axios.post('/api/students/reset-all-groups');
      toast.success('Tous les étudiants ont été retirés de leurs groupes');
      fetchData(true);
    } catch (error) {
      console.error('Erreur lors du reset:', error);
      toast.error('Erreur lors du reset des groupes');
    }
  };

  // Générer le tableau quadrillé avec colonnes de phases (Planification, Pilotage, Soutenance)
  const handleGenerateGrid = async () => {
    try {
      setIsGenerating(true);
      const planningRes = await axios.get('/api/planning');
      const slots = planningRes.data?.data || [];
      
      const studentIdToSlots = new Map();
      slots.forEach(slot => {
        if (!studentIdToSlots.has(slot.student_id)) {
          studentIdToSlots.set(slot.student_id, []);
        }
        studentIdToSlots.get(slot.student_id).push(slot);
      });
      
      const rows = groups.map(group => {
        const groupStudents = Array.isArray(group.students) ? group.students : [];
        const studentNames = groupStudents.map(s => `${s.first_name} ${s.last_name}`);
        
        // Par phase, stocker des entrées uniques "YYYY-MM-DD HH:MM-HH:MM"
        const phaseToEntries = {
          1: new Set(), // Planification
          2: new Set(), // Pilotage
          3: new Set()  // Soutenance
        };
        groupStudents.forEach(s => {
          const sSlots = studentIdToSlots.get(s.id) || [];
          sSlots.forEach(slot => {
            const phaseNum = parseInt(slot.phase) || 0;
            if (![1,2,3].includes(phaseNum)) return;
            const date = slot.start_date || '';
            const time =
              slot.start_time && slot.end_time
                ? `${slot.start_time}-${slot.end_time}`
                : slot.start_time || '';
            const entry = `${date}${time ? ` ${time}` : ''}`.trim();
            if (entry) {
              phaseToEntries[phaseNum].add(entry);
            }
          });
        });
        
        return {
          project: group.project_title || (group.project && (group.project.title || group.project.name)) || 'Aucun projet',
          group: group.name,
          students: studentNames.join(', ') || '—',
          p1: Array.from(phaseToEntries[1]).sort(),
          p2: Array.from(phaseToEntries[2]).sort(),
          p3: Array.from(phaseToEntries[3]).sort()
        };
      });
      
      setGridRows(rows);
      setShowGridModal(true);
    } catch (error) {
      console.error('Erreur lors de la génération du tableau:', error);
      toast.error('Erreur lors de la génération du tableau');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des groupes</h1>
        <p className="text-gray-600">Organisez les étudiants en groupes pour les projets</p>
      </div>

      {/* Actions principales */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau groupe
          </button>
          <button
            onClick={handleGenerateGrid}
            className="btn btn-outline flex items-center"
            title="Générer le tableau quadrillé"
            disabled={isGenerating}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            {isGenerating ? 'Génération...' : 'Générer tableau'}
          </button>
          <button
            onClick={handleResetAllStudents}
            className="btn btn-warning flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Retirer tous les étudiants
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total groupes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {groups.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Étudiants assignés
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => s.group_id).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sans groupe
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => !s.group_id).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des groupes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groupe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projet associé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Étudiants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" key={refreshKey}>
            {groups.map((group) => {
              // S'assurer que students est un tableau et forcer l'affichage
              const groupStudents = Array.isArray(group.students) ? group.students : [];
              
              return (
                <React.Fragment key={group.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{group.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.project_title || (group.project && (group.project.title || group.project.name)) || 'Aucun projet'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {groupStudents.length} étudiant(s)
                        </span>
                        {groupStudents.length > 0 && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditGroupModal(group)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier le groupe"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openBulkAssignModal(group.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Affecter des étudiants"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer le groupe"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Affichage des étudiants du groupe */}
                  {groupStudents.length > 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="font-medium mb-2 text-gray-800 flex items-center justify-between">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-blue-600" />
                              Étudiants du groupe ({groupStudents.length})
                            </div>
                            <button
                              onClick={async () => {
                                console.log('🔄 Actualisation manuelle demandée pour le groupe:', group.name);
                                await fetchData(true);
                                console.log('✅ Actualisation manuelle terminée');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              title="Actualiser l'affichage des étudiants"
                            >
                              🔄 Actualiser
                            </button>
                          </div>
                          
                          {groupStudents.length > 0 ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4" key={`students-${group.id}-${refreshKey}`}>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {groupStudents.map((student, index) => (
                                  <div 
                                    key={student.id} 
                                    className="flex items-center space-x-3 bg-white px-4 py-3 rounded-lg border-2 border-green-300 hover:border-green-400 hover:shadow-md transition-all"
                                  >
                                    <div className="flex-shrink-0">
                                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-green-800">
                                          {index + 1}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {student.first_name} {student.last_name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {student.class || 'Classe non définie'}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        ID: {student.id}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <button
                                        onClick={async () => {
                                          if (window.confirm(`Retirer ${student.first_name} ${student.last_name} de ce groupe ?`)) {
                                            try {
                                              await axios.post('/api/students/remove-from-group', {
                                                student_id: student.id
                                              });
                                              toast.success(`${student.first_name} ${student.last_name} retiré du groupe`);
                                              fetchData(true);
                                            } catch (error) {
                                              console.error('Erreur lors du retrait:', error);
                                              toast.error('Erreur lors du retrait de l\'étudiant');
                                            }
                                          }
                                        }}
                                        className="text-red-400 hover:text-red-600"
                                        title="Retirer de ce groupe"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>Aucun étudiant dans ce groupe</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de création de groupe */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un nouveau groupe</h3>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du groupe
                  </label>
                  <input
                    type="text"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projet associé
                  </label>
                  <select
                    value={groupFormData.project_id}
                    onChange={(e) => setGroupFormData({...groupFormData, project_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(project => {
                      const label = project.title || project.name || 'Projet sans nom';
                      return (
                      <option key={project.id} value={project.id}>
                          {label}
                      </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
  {/* Modal tableau quadrillé Projet / Groupe / Phases */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowGridModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Tableau de planification par groupe
                  </h3>
                  <p className="text-sm text-gray-500">
                    Projet • Groupe et étudiants • Planification • Pilotage • Soutenance
                  </p>
                </div>
                
                <div className="overflow-auto border border-gray-300 rounded-md">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Projet</th>
                        <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Groupe et étudiants</th>
                        <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Planification</th>
                        <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Pilotage</th>
                        <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Soutenance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gridRows.map((row, idx) => (
                        <tr key={idx} className="odd:bg-white even:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 align-top">{row.project}</td>
                          <td className="border border-gray-300 px-3 py-2 align-top">
                            <div className="font-medium">{row.group}</div>
                            <div className="text-sm text-gray-600">{row.students}</div>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 align-top">
                            {row.p1 && row.p1.length ? (
                              <div className="space-y-1">
                                {row.p1.map((e, i) => <div key={i}>{e}</div>)}
                              </div>
                            ) : '—'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 align-top">
                            {row.p2 && row.p2.length ? (
                              <div className="space-y-1">
                                {row.p2.map((e, i) => <div key={i}>{e}</div>)}
                              </div>
                            ) : '—'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 align-top">
                            {row.p3 && row.p3.length ? (
                              <div className="space-y-1">
                                {row.p3.map((e, i) => <div key={i}>{e}</div>)}
                              </div>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                      {gridRows.length === 0 && (
                        <tr>
                          <td className="border border-gray-300 px-3 py-6 text-center text-gray-500" colSpan="5">
                            Aucun groupe à afficher
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-secondary sm:ml-3 sm:w-auto"
                  onClick={() => setShowGridModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'affectation en masse */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Affecter des étudiants à un groupe</h3>
              
              {/* Filtre par classe */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par classe
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Liste des étudiants */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Étudiants disponibles
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedStudents.length === getStudentsWithoutGroup().length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                </div>
                
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                  {getStudentsWithoutGroup().map(student => (
                    <label key={student.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.class || 'Classe non définie'} - ID: {student.id}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (selectedStudents.length === 0) {
                      toast.error('Veuillez sélectionner au moins un étudiant');
                      return;
                    }
                    if (!targetGroupId) {
                      toast.error('Veuillez sélectionner un groupe de destination');
                      return;
                    }
                    handleBulkAssign(selectedStudents, targetGroupId);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Affecter {selectedStudents.length} étudiant(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de modification d'un groupe */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-16 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mt-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le groupe</h3>
              <form onSubmit={handleSaveEditGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du groupe
                  </label>
                  <input
                    type="text"
                    value={editGroupData.name}
                    onChange={(e) => setEditGroupData({ ...editGroupData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projet associé
                  </label>
                  <select
                    value={editGroupData.project_id || ''}
                    onChange={(e) => setEditGroupData({ ...editGroupData, project_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map((project) => {
                      const label = project.title || project.name || 'Projet sans nom';
                      return (
                        <option key={project.id} value={project.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="font-medium text-gray-800 mb-2">Étudiants dans le groupe</div>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                      {(groups.find(g => g.id === editGroupData.id)?.students || []).length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">Aucun étudiant dans ce groupe</div>
                      ) : (
                        (groups.find(g => g.id === editGroupData.id)?.students || []).map((student) => {
                          const checked = editGroupData.removeStudentIds.includes(student.id);
                          return (
                            <label key={student.id} className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditGroupData({
                                      ...editGroupData,
                                      removeStudentIds: [...editGroupData.removeStudentIds, student.id]
                                    });
                                  } else {
                                    setEditGroupData({
                                      ...editGroupData,
                                      removeStudentIds: editGroupData.removeStudentIds.filter(id => id !== student.id)
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.first_name} {student.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.class || 'Classe non définie'}
                                </div>
                              </div>
                              <span className="text-xs text-red-600 font-medium">Retirer</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-gray-800 mb-2">Ajouter des étudiants disponibles</div>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                      {students.filter(s => !s.group_id).length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">Aucun étudiant disponible</div>
                      ) : (
                        students
                          .filter((s) => !s.group_id)
                          .map((student) => {
                            const checked = editGroupData.addStudentIds.includes(student.id);
                            return (
                              <label key={student.id} className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditGroupData({
                                        ...editGroupData,
                                        addStudentIds: [...editGroupData.addStudentIds, student.id]
                                      });
                                    } else {
                                      setEditGroupData({
                                        ...editGroupData,
                                        addStudentIds: editGroupData.addStudentIds.filter(id => id !== student.id)
                                      });
                                    }
                                  }}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.first_name} {student.last_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {student.class || 'Classe non définie'}
                                  </div>
                                </div>
                                <span className="text-xs text-green-700 font-medium">Ajouter</span>
                              </label>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;