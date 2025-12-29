import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Folder, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Documents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    document_type: '',
    phase_id: '',
    file: null
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchDocuments(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      toast.error('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (studentId) => {
    try {
      const response = await axios.get(`/api/documents/student/${studentId}`);
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast.error('Erreur lors du chargement des documents');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('document', uploadForm.file);
    formData.append('student_id', selectedStudent.id);
    formData.append('document_type', uploadForm.document_type);
    if (uploadForm.phase_id) {
      formData.append('phase_id', uploadForm.phase_id);
    }

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Document uploadé avec succès');
      setShowUploadModal(false);
      setUploadForm({
        document_type: '',
        phase_id: '',
        file: null
      });
      fetchDocuments(selectedStudent.id);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await axios.get(`/api/documents/download/${documentId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await axios.delete(`/api/documents/${documentId}`);
      toast.success('Document supprimé avec succès');
      fetchDocuments(selectedStudent.id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      'planning': 'Planning',
      'fiche_technique': 'Fiche technique',
      'schema_electrique': 'Schéma électrique',
      'plan_securite': 'Plan de sécurité',
      'cahier_charges': 'Cahier des charges',
      'analyse_contraintes': 'Analyse des contraintes',
      'suivi_heures': 'Suivi des heures',
      'observations': 'Observations',
      'remarques_enseignant': 'Remarques enseignant',
      'modifications_planning': 'Modifications planning',
      'rapport_intermediaire': 'Rapport intermédiaire',
      'rapport_final': 'Rapport final',
      'presentation': 'Présentation',
      'grille_evaluation': 'Grille d\'évaluation',
      'commentaires_soutenance': 'Commentaires soutenance',
      'note_finale': 'Note finale'
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type) => {
    if (type.includes('planning') || type.includes('plan')) {
      return 'text-blue-600 bg-blue-100';
    } else if (type.includes('rapport') || type.includes('presentation')) {
      return 'text-green-600 bg-green-100';
    } else if (type.includes('evaluation') || type.includes('note')) {
      return 'text-purple-600 bg-purple-100';
    } else {
      return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestion des documents par phase et par étudiant
        </p>
      </div>

      {/* Sélection d'étudiant */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sélectionner un étudiant</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedStudent?.id === student.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {student.project_title || 'Aucun projet'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Documents - {selectedStudent.first_name} {selectedStudent.last_name}
            </h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par uploader des documents.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {document.filename}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`badge ${getDocumentTypeColor(document.document_type)}`}>
                            {getDocumentTypeLabel(document.document_type)}
                          </span>
                          {document.phase_number && (
                            <span className="badge badge-info">
                              Phase {document.phase_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Uploadé le {new Date(document.uploaded_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal d'upload */}
      {showUploadModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowUploadModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleFileUpload}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Upload de document
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label">Type de document *</label>
                      <select
                        required
                        className="input"
                        value={uploadForm.document_type}
                        onChange={(e) => setUploadForm({...uploadForm, document_type: e.target.value})}
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="planning">Planning</option>
                        <option value="fiche_technique">Fiche technique</option>
                        <option value="schema_electrique">Schéma électrique</option>
                        <option value="plan_securite">Plan de sécurité</option>
                        <option value="cahier_charges">Cahier des charges</option>
                        <option value="analyse_contraintes">Analyse des contraintes</option>
                        <option value="suivi_heures">Suivi des heures</option>
                        <option value="observations">Observations</option>
                        <option value="remarques_enseignant">Remarques enseignant</option>
                        <option value="rapport_intermediaire">Rapport intermédiaire</option>
                        <option value="rapport_final">Rapport final</option>
                        <option value="presentation">Présentation</option>
                        <option value="grille_evaluation">Grille d'évaluation</option>
                        <option value="note_finale">Note finale</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Phase (optionnel)</label>
                      <select
                        className="input"
                        value={uploadForm.phase_id}
                        onChange={(e) => setUploadForm({...uploadForm, phase_id: e.target.value})}
                      >
                        <option value="">Aucune phase spécifique</option>
                        <option value="1">Phase 1 - Planification</option>
                        <option value="2">Phase 2 - Pilotage</option>
                        <option value="3">Phase 3 - Soutenance</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Fichier *</label>
                      <input
                        type="file"
                        required
                        className="input"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formats acceptés : PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3 sm:w-auto"
                  >
                    Uploader
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary sm:mt-0 sm:w-auto"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Annuler
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

export default Documents; 