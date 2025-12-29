import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, User, Search, X, Check, ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSchoolYear } from '../contexts/SchoolYearContext';
import ColorationLogo from '../components/ColorationLogo';

const Classes = () => {
  const { selectedYear } = useSchoolYear();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    school_year: selectedYear
  });

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, school_year: selectedYear }));
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      const [classesRes, studentsRes] = await Promise.all([
        axios.get(`/api/classes?school_year=${selectedYear}`),
        axios.get(`/api/students?school_year=${selectedYear}`)
      ]);

      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
      }
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await axios.put(`/api/classes/${editingClass.id}`, formData);
        toast.success('Classe modifiée avec succès');
      } else {
        await axios.post('/api/classes', formData);
        toast.success('Classe créée avec succès');
      }
      
      setShowModal(false);
      setEditingClass(null);
      setFormData({ name: '', description: '', school_year: selectedYear });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la classe');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      school_year: classItem.school_year
    });
    setShowModal(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      try {
        await axios.delete(`/api/classes/${classId}`);
        toast.success('Classe supprimée avec succès');
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de la classe');
      }
    }
  };

  const handleSelectClass = async (classItem) => {
    try {
      const response = await axios.get(`/api/classes/${classItem.id}`);
      if (response.data.success) {
        setSelectedClass(response.data.data);
        setSelectedStudents(response.data.data.students || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la classe:', error);
      toast.error('Erreur lors du chargement de la classe');
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Aucun étudiant sélectionné');
      return;
    }

    try {
      const studentIds = selectedStudents.map(student => student.id);
      await axios.post(`/api/classes/${selectedClass.id}/students`, {
        student_ids: studentIds
      });
      toast.success(`${selectedStudents.length} étudiant(s) assigné(s) à la classe`);
      setShowAssignModal(false);
      setSelectedStudents([]);
      setSearchTerm('');
      handleSelectClass(selectedClass);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error('Erreur lors de l\'assignation des étudiants');
    }
  };

  const handleOpenAssignModal = (classItem) => {
    setSelectedClass(classItem);
    setShowAssignModal(true);
    setSelectedStudents([]);
    setSearchTerm('');
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`/api/classes/${selectedClass.id}/students`, {
        data: { student_ids: [studentId] }
      });
      toast.success('Étudiant retiré de la classe');
      handleSelectClass(selectedClass);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'étudiant');
    }
  };

  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s.id === student.id);
      if (isSelected) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const filteredStudents = students.filter(student => 
    !selectedClass?.students?.some(classStudent => classStudent.id === student.id) &&
    (student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Classes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle Classe</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des classes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Classes ({selectedYear})</h2>
            <div className="space-y-2">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedClass?.id === classItem.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectClass(classItem)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{classItem.name}</h3>
                      {classItem.description && (
                        <p className="text-sm text-gray-600 mt-1">{classItem.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAssignModal(classItem);
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Assigner des étudiants"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(classItem);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Modifier la classe"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(classItem.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Supprimer la classe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucune classe créée</p>
              )}
            </div>
          </div>
        </div>

        {/* Zone centrale - Liste des étudiants */}
        <div className="lg:col-span-2">
          {selectedClass ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Étudiants de la classe "{selectedClass.name}"
                </h2>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Liste des étudiants de la classe */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-3">Étudiants assignés ({selectedClass.students?.length || 0})</h3>
                {selectedClass.students && selectedClass.students.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Nom Prénom
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Date de naissance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Coloration
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedClass.students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                              <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
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
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                              <div className="text-sm text-gray-900">
                                {student.date_de_naissance ? new Date(student.date_de_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                              <div className="text-sm text-gray-900 flex items-center justify-center space-x-2">
                                <ColorationLogo coloration={student.coloration} className="h-16 w-16" />
                                <span>{student.coloration || 'Aucune'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleRemoveStudent(student.id)}
                                className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                                title="Retirer de la classe"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun étudiant assigné à cette classe</p>
                  </div>
                )}
              </div>

              {/* Bouton pour assigner des étudiants */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleOpenAssignModal(selectedClass)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Assigner des étudiants</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez une classe pour voir ses étudiants</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/modification de classe */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingClass ? 'Modifier la classe' : 'Nouvelle classe'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la classe *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: BTS Électrotechnique 1A"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Description optionnelle de la classe"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingClass ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingClass(null);
                      setFormData({ name: '', description: '', school_year: selectedYear });
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'assignation d'étudiants */}
      {showAssignModal && selectedClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAssignModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Assigner des étudiants à "{selectedClass.name}"
                  </h3>
                </div>
                
                {/* Recherche d'étudiants */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un étudiant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Liste des étudiants disponibles */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredStudents.length > 0 ? (
                    <div className="bg-white">
                      {/* En-tête du tableau */}
                      <div className="bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="col-span-1"></div>
                          <div className="col-span-4">Nom Prénom</div>
                          <div className="col-span-3">Date de naissance</div>
                          <div className="col-span-4">Classe</div>
                        </div>
                      </div>
                      
                      {/* Corps du tableau */}
                      <div className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            className={`grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition-colors ${
                              selectedStudents.some(s => s.id === student.id)
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => toggleStudentSelection(student)}
                          >
                            <div className="col-span-1 flex items-center justify-center">
                              {selectedStudents.some(s => s.id === student.id) && (
                                <Check className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div className="col-span-4">
                              <p className="font-medium text-gray-900 flex items-center space-x-2">
                                <span>{student.first_name} {student.last_name}</span>
                                <ColorationLogo coloration={student.coloration} />
                              </p>
                            </div>
                            <div className="col-span-3">
                              <p className="text-sm text-gray-600">
                                {student.date_de_naissance ? new Date(student.date_de_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                              </p>
                            </div>
                            <div className="col-span-4">
                              <p className="text-sm text-gray-600">
                                {student.class || 'Non définie'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm ? 'Aucun étudiant trouvé' : 'Tous les étudiants sont déjà assignés à cette classe'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Compteur d'étudiants sélectionnés */}
                {selectedStudents.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {selectedStudents.length} étudiant(s) sélectionné(s)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleAssignStudents}
                  disabled={selectedStudents.length === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Assigner {selectedStudents.length} étudiant(s)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudents([]);
                    setSearchTerm('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default Classes;
