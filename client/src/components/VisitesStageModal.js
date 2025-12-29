import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Building, Plus, Edit, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VisitesStageModal = ({ student, onClose }) => {
  const [visites, setVisites] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVisite, setEditingVisite] = useState(null);
  
  const [formData, setFormData] = useState({
    date: '',
    heure: '',
    type: 'premiere',
    professeur: '',
    tuteur: '',
    lieu: '',
    observations: '',
    statut: 'planifiee'
  });

  // Charger les visites de l'étudiant et les professeurs
  useEffect(() => {
    if (student) {
      loadVisites();
      loadProfesseurs();
    }
  }, [student]);

  const loadVisites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/visites-stage/student/${student.id}`);
      setVisites(response.data);
    } catch (error) {
      console.error('Erreur chargement visites:', error);
      // Pour l'instant, utilisons des données de démonstration
      setVisites([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfesseurs = async () => {
    try {
      console.log('🔄 Chargement des professeurs...');
      const response = await axios.get('/api/users');
      console.log('📊 Réponse complète:', response.data);
      
      // L'API retourne { success: true, data: users }
      const users = response.data.data || response.data;
      console.log('👥 Utilisateurs extraits:', users);
      
      // Filtrer uniquement les utilisateurs avec le rôle "teacher"
      const profs = users.filter(user => 
        user.role === 'teacher' ||
        user.role === 'Teacher' ||
        user.role === 'professeur' ||
        user.role === 'Professeur'
      );
      
      console.log('👨‍🏫 Professeurs filtrés:', profs);
      console.log('🔍 Rôles trouvés:', [...new Set(users.map(u => u.role))]);
      
      setProfesseurs(profs);
      
      if (profs.length === 0) {
        console.warn('⚠️ Aucun professeur trouvé !');
        console.log('💡 Rôles disponibles:', [...new Set(users.map(u => u.role))]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement professeurs:', error);
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      setProfesseurs([]);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      heure: '',
      type: 'premiere',
      professeur: '',
      tuteur: '',
      lieu: '',
      observations: '',
      statut: 'planifiee'
    });
    setShowAddForm(false);
    setEditingVisite(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingVisite) {
        // Mode édition
        const response = await axios.put(`/api/visites-stage/${editingVisite.id}`, {
          ...formData,
          student_id: student.id
        });
        setVisites(visites.map(v => v.id === editingVisite.id ? response.data : v));
        toast.success('Visite modifiée avec succès !');
      } else {
        // Mode création
        const response = await axios.post('/api/visites-stage', {
          ...formData,
          student_id: student.id
        });
        setVisites([...visites, response.data]);
        toast.success('Visite ajoutée avec succès !');
      }
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde visite:', error);
      toast.error('Erreur lors de la sauvegarde de la visite');
    }
  };

  const handleEdit = (visite) => {
    setEditingVisite(visite);
    setFormData({
      date: visite.date,
      heure: visite.heure || '',
      type: visite.type,
      professeur: visite.professeur,
      tuteur: visite.tuteur,
      lieu: visite.lieu || '',
      observations: visite.observations || '',
      statut: visite.statut
    });
    setShowAddForm(true);
  };

  const handleDelete = async (visiteId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) {
      return;
    }

    try {
      await axios.delete(`/api/visites-stage/${visiteId}`);
      setVisites(visites.filter(v => v.id !== visiteId));
      toast.success('Visite supprimée avec succès !');
    } catch (error) {
      console.error('Erreur suppression visite:', error);
      toast.error('Erreur lors de la suppression de la visite');
    }
  };

  const handleMarkAsRealisee = async (visiteId) => {
    try {
      const response = await axios.put(`/api/visites-stage/${visiteId}`, {
        statut: 'realisee'
      });
      setVisites(visites.map(v => v.id === visiteId ? response.data : v));
      toast.success('Visite marquée comme réalisée !');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatType = (type) => {
    switch (type) {
      case 'premiere': return 'Première visite';
      case 'suivi': return 'Visite de suivi';
      case 'finale': return 'Visite finale';
      default: return type;
    }
  };

  const formatStatut = (statut) => {
    switch (statut) {
      case 'planifiee': return 'Planifiée';
      case 'realisee': return 'Réalisée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'planifiee': return 'bg-blue-100 text-blue-800';
      case 'realisee': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'premiere': return 'bg-purple-100 text-purple-800';
      case 'suivi': return 'bg-yellow-100 text-yellow-800';
      case 'finale': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Visites de Stage</h2>
              <p className="text-purple-100 mt-1">
                {student.first_name} {student.last_name} - {student.class || 'Classe non assignée'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Bouton Ajouter */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Planifier une nouvelle visite
            </button>
          )}

          {/* Formulaire d'ajout/édition */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-purple-50 p-6 rounded-lg mb-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingVisite ? 'Modifier la visite' : 'Nouvelle visite'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date de visite *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Heure de visite *
                  </label>
                  <input
                    type="time"
                    value={formData.heure}
                    onChange={(e) => setFormData({...formData, heure: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de visite
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="premiere">Première visite</option>
                    <option value="suivi">Visite de suivi</option>
                    <option value="finale">Visite finale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Professeur référent *
                  </label>
                  <select
                    value={formData.professeur}
                    onChange={(e) => setFormData({...formData, professeur: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">
                      {professeurs.length === 0 ? "Chargement des professeurs..." : "Sélectionner un professeur"}
                    </option>
                    {professeurs.map(prof => (
                      <option key={prof.id} value={`${prof.first_name} ${prof.last_name}`}>
                        {prof.first_name} {prof.last_name}
                      </option>
                    ))}
                  </select>
                  {professeurs.length === 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ Aucun professeur trouvé. Vérifiez la console pour plus de détails.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Tuteur entreprise *
                  </label>
                  <input
                    type="text"
                    value={formData.tuteur}
                    onChange={(e) => setFormData({...formData, tuteur: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Nom du tuteur"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Lieu de visite *
                  </label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Adresse, salle, atelier..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Observations
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Notes sur cette visite..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingVisite ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          )}

          {/* Liste des visites */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement des visites...</p>
            </div>
          ) : visites.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune visite planifiée
              </h3>
              <p className="text-gray-600">
                Commencez par planifier une première visite de stage.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visites.map((visite) => (
                <div key={visite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(visite.type)}`}>
                        {formatType(visite.type)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(visite.statut)}`}>
                        {formatStatut(visite.statut)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {visite.statut === 'planifiee' && (
                        <button
                          onClick={() => handleMarkAsRealisee(visite.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Marquer comme réalisée"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(visite)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(visite.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{formatDate(visite.date)}</span>
                      {visite.heure && (
                        <span className="ml-2 text-purple-600 font-semibold">à {visite.heure}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Prof: {visite.professeur}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span>Tuteur: {visite.tuteur}</span>
                    </div>
                    {visite.lieu && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span>Lieu: {visite.lieu}</span>
                      </div>
                    )}
                    {visite.statut === 'realisee' && visite.date_realisation && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Réalisée le: {formatDate(visite.date_realisation)}</span>
                      </div>
                    )}
                  </div>

                  {visite.observations && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <FileText className="w-4 h-4 inline mr-1 text-gray-500" />
                        {visite.observations}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied du modal */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitesStageModal;
