import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, User, Upload, CheckSquare, Square, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CSVImport from '../components/CSVImport';
import ColorationLogo from '../components/ColorationLogo';
import { useSchoolYear } from '../contexts/SchoolYearContext';

const Students = () => {
  const { selectedYear } = useSchoolYear();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showColorationModal, setShowColorationModal] = useState(false);
  const [colorationOptions, setColorationOptions] = useState([
    'Pas de coloration',
    'Ecole des reseaux',
    'Protendem'
  ]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_de_naissance: '',
    email: '',
    class: '',
    coloration: '',
    photo: '',
    school_year: selectedYear,
    username: '',
    password: ''
  });
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState(false);


  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, school_year: selectedYear }));
  }, [selectedYear]);

  // Générer identifiant par défaut "nom.prenom" si non modifié manuellement
  useEffect(() => {
    if (usernameEdited) return;
    const slugify = (str = '') =>
      String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, '');
    const ln = slugify(formData.last_name);
    const fn = slugify(formData.first_name);
    const candidate = [ln, fn].filter(Boolean).join('.');
    setFormData(prev => ({ ...prev, username: candidate }));
  }, [formData.first_name, formData.last_name, usernameEdited]);

  // Générer mot de passe par défaut (jjmmaaaa) depuis la date de naissance
  useEffect(() => {
    if (passwordEdited) return;
    if (!formData.date_de_naissance) {
      setFormData(prev => ({ ...prev, password: '' }));
      return;
    }
    try {
      const d = new Date(formData.date_de_naissance);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = String(d.getFullYear());
      setFormData(prev => ({ ...prev, password: `${dd}${mm}${yyyy}` }));
    } catch {
      // ignore
    }
  }, [formData.date_de_naissance, passwordEdited]);

  useEffect(() => {
    setSelectAll(selectedStudents.length === students.length && students.length > 0);
  }, [selectedStudents, students]);

  const fetchData = async () => {
    try {
      const studentsRes = await axios.get(`/api/students?school_year=${selectedYear}`);

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
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent.id}`, formData);
        toast.success('Étudiant mis à jour avec succès');
      } else {
        await axios.post('/api/students', formData);
        toast.success('Étudiant créé avec succès');
      }
      
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      return;
    }

    try {
      await axios.delete(`/api/students/${id}`);
      toast.success('Étudiant supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    
    // Convertir la date au format ISO pour l'input HTML
    let formattedDate = '';
    if (student.date_de_naissance) {
      try {
        // Si la date est au format français (dd/mm/yyyy), la convertir
        if (student.date_de_naissance.includes('/')) {
          const [day, month, year] = student.date_de_naissance.split('/');
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          // Si c'est déjà au format ISO, l'utiliser directement
          formattedDate = student.date_de_naissance;
        }
      } catch (error) {
        console.error('Erreur de format de date:', error);
        formattedDate = '';
      }
    }
    
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      date_de_naissance: formattedDate,
      email: student.email || '',
      class: student.class || '',
      coloration: student.coloration || '',
      photo: student.photo || '',
      username: '', // non stocké côté étudiant
      password: ''
    });
    setUsernameEdited(false);
    setPasswordEdited(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      date_de_naissance: '',
      email: '',
      class: '',
      coloration: '',
      photo: '',
      username: '',
      password: ''
    });
    setPhotoFile(null);
    setUsernameEdited(false);
    setPasswordEdited(false);
  };

  // Fonctions pour gérer les options de coloration
  const handleAddColorationOption = (newOption) => {
    if (newOption && !colorationOptions.includes(newOption)) {
      setColorationOptions([...colorationOptions, newOption]);
    }
  };

  const handleRemoveColorationOption = (optionToRemove) => {
    if (optionToRemove !== 'Pas de coloration') { // Ne pas permettre de supprimer "Pas de coloration"
      setColorationOptions(colorationOptions.filter(option => option !== optionToRemove));
    }
  };

  const handleColorationSelect = (coloration) => {
    setFormData({...formData, coloration});
    setShowColorationModal(false);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image doit faire moins de 5MB');
        return;
      }
      
      setPhotoFile(file);
      
      // Redimensionner et compresser l'image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Dimensions cibles pour la photo d'identité (format 3:4)
        const targetWidth = 300;
        const targetHeight = 400;
        
        // Calculer les dimensions en gardant les proportions
        let { width, height } = img;
        if (width > height) {
          height = (height * targetWidth) / width;
          width = targetWidth;
        } else {
          width = (width * targetHeight) / height;
          height = targetHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en base64 avec compression
        let quality = 0.7;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Vérifier la taille et réduire la qualité si nécessaire
        while (compressedDataUrl.length > 1024 * 1024 && quality > 0.1) { // Max 1MB
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        if (compressedDataUrl.length > 1024 * 1024) {
          toast.error('L\'image est trop volumineuse même après compression');
          return;
        }
        
        setFormData({...formData, photo: compressedDataUrl});
      };
      
      img.src = URL.createObjectURL(file);
    }
  };

  const handlePhotoClick = () => {
    document.getElementById('photo-upload').click();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = React.useMemo(() => {
    if (!sortConfig.key) return students;
    
    return [...students].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Gestion des valeurs nulles/undefined
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      // Conversion en string pour le tri
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [students, sortConfig]);


  const handleCSVImport = async (students) => {
    try {
      const response = await axios.post('/api/students/bulk', { students });
      
      if (response.data.success) {
        const { summary } = response.data;
        toast.success(
          `Import terminé: ${summary.success} succès, ${summary.error} erreurs, ${summary.skipped} ignorés`
        );
        fetchData(); // Refresh student list after import
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'import');
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
      setSelectAll(false);
    } else {
      setSelectedStudents(students.map(student => student.id));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Aucun étudiant sélectionné');
      return;
    }

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedStudents.length} étudiant(s) ? Cette action est irréversible.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await axios.delete('/api/students/bulk', {
        data: { student_ids: selectedStudents }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedStudents([]);
        setSelectAll(false);
        fetchData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression en masse:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression en masse');
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
          <h1 className="text-2xl font-bold text-gray-900">Étudiants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des étudiants et des groupes
          </p>
        </div>
                 <div className="flex space-x-3">
          {selectedStudents.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ({selectedStudents.length})
            </button>
          )}
          <button
            onClick={() => setShowCSVImport(true)}
            className="btn btn-secondary flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </button>
          <button
            onClick={async () => {
              try {
                const res = await axios.post('/api/students/generate-accounts', { school_year: selectedYear });
                const s = res.data.summary || {};
                toast.success(`Comptes générés: ${s.created || 0} créés, ${s.skipped || 0} existants, ${s.errors || 0} erreurs`);
              } catch (e) {
                console.error(e);
                toast.error(e.response?.data?.message || 'Erreur génération des comptes');
              }
            }}
            className="btn btn-secondary flex items-center"
            title="Créer les comptes pour tous les étudiants sans compte"
          >
            <Users className="h-4 w-4 mr-2" />
            Générer comptes étudiants
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel étudiant
          </button>
        </div>
      </div>

             {/* Statistiques */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white overflow-hidden shadow rounded-lg">
           <div className="p-5">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <Users className="h-6 w-6 text-gray-400" />
               </div>
               <div className="ml-5 w-0 flex-1">
                 <dl>
                   <dt className="text-sm font-medium text-gray-500 truncate">
                     Total étudiants
                   </dt>
                   <dd className="text-lg font-medium text-gray-900">
                     {students.length}
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
             </div>
           </div>
         </div>
       </div>

      

      {/* Liste des étudiants */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par ajouter un étudiant.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un étudiant
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600"
                    >
                      {selectAll ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('class')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Classe</span>
                      {sortConfig.key === 'class' && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coloration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groupe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de naissance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectStudent(student.id)}
                        className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600"
                      >
                        {selectedStudents.includes(student.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.photo ? (
                            <img 
                              src={student.photo} 
                              alt={`${student.first_name} ${student.last_name}`}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center ${student.photo ? 'hidden' : 'flex'}`}
                          >
                            <User className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.class || 'Non définie'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <ColorationLogo coloration={student.coloration} className="h-16 w-16" />
                        <span>{student.coloration || 'Aucune'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.group_name || 'Non assigné'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.date_de_naissance ? new Date(student.date_de_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email || 'Non renseigné'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
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

      {/* Modal Étudiant */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingStudent ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
                    </h3>
                    
                    {/* Champ photo d'identité */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center"
                        onClick={handlePhotoClick}
                      >
                        {formData.photo ? (
                          <img 
                            src={formData.photo} 
                            alt="Photo d'identité" 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`flex flex-col items-center justify-center text-gray-400 ${formData.photo ? 'hidden' : 'flex'}`}>
                          <User className="h-6 w-6 mb-1" />
                          <span className="text-xs text-center px-1">Photo</span>
                        </div>
                      </div>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handlePhotoClick}
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        {formData.photo ? 'Changer' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Prénom *</label>
                        <input
                          type="text"
                          required
                          className="input"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="label">Nom *</label>
                        <input
                          type="text"
                          required
                          className="input"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">Date de naissance</label>
                      <input
                        type="date"
                        className="input"
                        value={formData.date_de_naissance}
                        onChange={(e) => setFormData({...formData, date_de_naissance: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        className="input"
                        placeholder="exemple@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Classe</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="BTS Électrotechnique 2ème année"
                        value={formData.class}
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Coloration</label>
                      <div className="flex">
                        <input
                          type="text"
                          className="input flex-1"
                          placeholder="Sélectionner une coloration"
                          value={formData.coloration}
                          readOnly
                          onClick={() => setShowColorationModal(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowColorationModal(true)}
                          className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Choisir
                        </button>
                      </div>
                    </div>

                    {/* Identifiants de connexion */}
                    <div>
                      <label className="label">Identifiant (login) *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="nom.prenom"
                        value={formData.username}
                        onChange={(e) => {
                          setUsernameEdited(true);
                          setFormData({ ...formData, username: e.target.value });
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Par défaut: nom.prenom (accents et espaces supprimés)</p>
                    </div>
                    <div>
                      <label className="label">Mot de passe {editingStudent ? '(laisser vide pour ne pas changer)' : '*'}</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="jjmmaaaa"
                        value={formData.password}
                        onChange={(e) => {
                          setPasswordEdited(true);
                          setFormData({ ...formData, password: e.target.value });
                        }}
                      />
                      {!editingStudent && (
                        <p className="text-xs text-gray-500 mt-1">Par défaut: date de naissance au format jjmmaaaa</p>
                      )}
                    </div>
                    
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3 sm:w-auto"
                  >
                    {editingStudent ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary sm:mt-0 sm:w-auto"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStudent(null);
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

      

      {/* Modal d'import CSV */}
      {showCSVImport && (
        <CSVImport
          onImport={handleCSVImport}
          onClose={() => setShowCSVImport(false)}
        />
      )}

      {/* Modal de sélection de coloration */}
      {showColorationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowColorationModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Choisir une coloration
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {colorationOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleColorationSelect(option)}
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                  
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600 mb-2">Ajouter une nouvelle option :</div>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Nouvelle coloration"
                        className="input flex-1"
                        id="newColorationInput"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('newColorationInput');
                          const newOption = input.value.trim();
                          if (newOption) {
                            handleAddColorationOption(newOption);
                            handleColorationSelect(newOption);
                            input.value = '';
                          }
                        }}
                        className="ml-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-secondary sm:mt-0 sm:w-auto"
                  onClick={() => setShowColorationModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students; 