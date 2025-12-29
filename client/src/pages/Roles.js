import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Settings, 
  CheckSquare, 
  Square,
  Users,
  Eye,
  Edit,
  Save,
  X
} from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
      toast.error('Erreur lors du chargement des rôles');
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await axios.get('/api/roles/permissions/all');
      if (response.data.success) {
        setPermissions(response.data.data.permissions);
        setGroupedPermissions(response.data.data.grouped);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      toast.error('Erreur lors du chargement des permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (role) => {
    setSelectedRole(role);
    // Charger les permissions actuelles du rôle
    loadRolePermissions(role.id);
    setShowPermissionsModal(true);
  };

  const loadRolePermissions = async (roleId) => {
    try {
      const response = await axios.get(`/api/roles/${roleId}`);
      if (response.data.success) {
        const currentPermissions = response.data.data.permissions.map(p => p.id);
        setEditingPermissions(currentPermissions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions du rôle:', error);
      toast.error('Erreur lors du chargement des permissions');
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setEditingPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSavePermissions = async () => {
    try {
      const response = await axios.put(`/api/roles/${selectedRole.id}/permissions`, {
        permissionIds: editingPermissions
      });
      if (response.data.success) {
        toast.success('Permissions mises à jour avec succès');
        setShowPermissionsModal(false);
        setSelectedRole(null);
        setEditingPermissions([]);
        loadRoles(); // Recharger pour mettre à jour les compteurs
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des permissions:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const getModuleIcon = (module) => {
    const icons = {
      dashboard: '📊',
      projects: '📁',
      students: '👥',
      planning: '📅',
      evaluations: '📋',
      documents: '📄',
      roles: '🛡️',
      users: '👤'
    };
    return icons[module] || '⚙️';
  };

  const getModuleName = (module) => {
    const names = {
      dashboard: 'Tableau de bord',
      projects: 'Projets',
      students: 'Étudiants',
      planning: 'Planification',
      evaluations: 'Évaluations',
      documents: 'Documents',
      roles: 'Rôles',
      users: 'Utilisateurs'
    };
    return names[module] || module;
  };

  const getActionName = (action) => {
    const actions = {
      view: 'Voir',
      create: 'Créer',
      edit: 'Modifier',
      delete: 'Supprimer',
      print: 'Imprimer',
      upload: 'Télécharger',
      manage: 'Gérer'
    };
    return actions[action] || action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          Gestion des rôles et permissions
        </h1>
        <p className="text-gray-600 mt-1">
          Configurez les permissions pour chaque rôle dans l'application
        </p>
      </div>

      {/* Cartes des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {role.name === 'admin' ? 'Administrateur' : 
                     role.name === 'teacher' ? 'Professeur' : 
                     role.name === 'student' ? 'Étudiant' : role.name}
                  </h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Permissions :</span>
                <span className="font-medium text-primary-600">
                  {role.permission_count}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Créé le :</span>
                <span className="text-gray-500">
                  {new Date(role.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEditPermissions(role)}
                className="w-full btn btn-outline flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Gérer les permissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vue d'ensemble des permissions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Vue d'ensemble des permissions
        </h2>
        
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
            <div key={module} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">{getModuleIcon(module)}</span>
                <h3 className="text-lg font-medium text-gray-900">
                  {getModuleName(module)}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modulePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center p-2 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {getActionName(permission.action)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {permission.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de gestion des permissions */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPermissionsModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Permissions pour {selectedRole.name === 'admin' ? 'Administrateur' : 
                                       selectedRole.name === 'teacher' ? 'Professeur' : 
                                       selectedRole.name === 'student' ? 'Étudiant' : selectedRole.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Cochez les permissions que vous souhaitez attribuer à ce rôle
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <div key={module} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <span className="text-lg mr-2">{getModuleIcon(module)}</span>
                          <h4 className="text-md font-medium text-gray-900">
                            {getModuleName(module)}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {modulePermissions.map((permission) => (
                            <label key={permission.id} className="flex items-center p-3 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={editingPermissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {getActionName(permission.action)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {permission.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSavePermissions}
                  className="btn btn-primary sm:ml-3 sm:w-auto flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </button>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="btn btn-secondary sm:ml-3 sm:w-auto"
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

export default Roles;
