import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    executors: '',
    type: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProject) {
        await axios.put(`/api/projects/${editingProject.id}`, formData);
        toast.success('Projet mis à jour avec succès');
      } else {
        await axios.post('/api/projects', formData);
        toast.success('Projet créé avec succès');
      }
      
      setShowModal(false);
      setEditingProject(null);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${id}`);
      toast.success('Projet supprimé avec succès');
      fetchProjects();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      executors: project.executors || '',
      type: project.type || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      executors: '',
      type: ''
    });
  };

  const getStatusBadge = (project) => {
    const now = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);

    if (!project.start_date || !project.end_date) {
      return <span className="badge badge-info">Non défini</span>;
    }

    if (now < startDate) {
      return <span className="badge badge-info">À venir</span>;
    } else if (now >= startDate && now <= endDate) {
      return <span className="badge badge-success">En cours</span>;
    } else {
      return <span className="badge badge-warning">Terminé</span>;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CONDUITE DE PROJET/CHANTIER</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des projets support de l'épreuve
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau projet
        </button>
      </div>

      {/* Liste des projets */}
      <div className="card">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier projet U52.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {project.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.type || 'Non défini'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(project)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {project.student_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {project.start_date && (
                          <div>Début: {new Date(project.start_date).toLocaleDateString('fr-FR')}</div>
                        )}
                        {project.end_date && (
                          <div>Fin: {new Date(project.end_date).toLocaleDateString('fr-FR')}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label">Titre du projet *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Description</label>
                      <textarea
                        className="input"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Date de début</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="label">Date de fin</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.end_date}
                          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">Exécutants</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Équipe, entreprise..."
                        value={formData.executors}
                        onChange={(e) => setFormData({...formData, executors: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Type de projet</label>
                      <select
                        className="input"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="atelier">Atelier</option>
                        <option value="entreprise">Entreprise</option>
                        <option value="laboratoire">Laboratoire</option>
                        <option value="simulation">Simulation</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3 sm:w-auto"
                  >
                    {editingProject ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary sm:mt-0 sm:w-auto"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProject(null);
                      resetForm();
                    }}
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

export default Projects; 