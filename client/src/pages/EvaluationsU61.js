import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  FileText,
  Search,
  Printer,
  CheckSquare,
  Square
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ColorationLogo from '../components/ColorationLogo';
import { useSchoolYear } from '../contexts/SchoolYearContext';

const EvaluationsU61 = () => {
  const { selectedYear } = useSchoolYear();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const classesRes = await axios.get(`/api/classes?school_year=${selectedYear}`);

      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentsByClass = useCallback(async (classId) => {
    try {
      const response = await axios.get(`/api/classes/${classId}/students`);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants de la classe:', error);
      toast.error('Erreur lors du chargement des étudiants');
    }
  }, []);

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    fetchStudentsByClass(classItem.id);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData, selectedYear]);

  // Fonction pour sélectionner un étudiant
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">U61 - Conception et étude détaillée</h1>
          <p className="mt-1 text-sm text-gray-500">
            Grille d'évaluation des compétences U61
          </p>
        </div>
        <div className="flex space-x-3">
          {selectedStudent && (
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Évaluation
            </button>
          )}
        </div>
      </div>

      {/* Sélection de classe */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sélectionner une classe</h3>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                onClick={() => handleClassSelect(classItem)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedClass?.id === classItem.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                {classItem.description && (
                  <p className="text-sm text-gray-600 mt-1">{classItem.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucune classe disponible</p>
        )}
      </div>

      {/* Affichage conditionnel basé sur la sélection de classe */}
      {selectedClass ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Étudiants de la classe "{selectedClass.name}" ({students.length})
          </h3>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Veuillez sélectionner une classe pour afficher les étudiants et leurs évaluations.</p>
        </div>
      )}

      {/* Interface à deux panneaux - Affichée seulement si une classe est sélectionnée */}
      {selectedClass && (
      <div className="flex space-x-6 h-screen">
        {/* Panneau gauche - Liste des étudiants */}
        <div className="w-1/3 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Étudiants</h3>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              
              return (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
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
                        <div className="text-xs text-gray-500">
                          {student.class || 'Non définie'} • {student.group_name || 'Non assigné'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        U61 - En attente
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panneau droit - Zone d'évaluation (vide en attendant les instructions) */}
        <div className="flex-1 bg-white shadow rounded-lg overflow-hidden">
          {selectedStudent ? (
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Évaluations U61 de <span className="text-xl font-bold text-blue-600">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.class || 'Non définie'} • {selectedStudent.group_name || 'Non assigné'}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">En attente des instructions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    La grille d'évaluation U61 sera configurée selon vos spécifications.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sélectionnez un étudiant</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choisissez un étudiant dans la liste pour voir ses évaluations U61.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default EvaluationsU61;
