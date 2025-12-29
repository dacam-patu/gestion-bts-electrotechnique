import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Building, 
  Calendar, 
  Activity, 
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSchoolYear } from '../contexts/SchoolYearContext';
import VisitesStageModal from '../components/VisitesStageModal';
import VisitesCalendarModal from '../components/VisitesCalendarModal';
import ColorationLogo from '../components/ColorationLogo';

const RapportStage = () => {
  const { selectedYear } = useSchoolYear();
  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [activities, setActivities] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  
  // États pour le redimensionnement des colonnes
  const [columnWidths, setColumnWidths] = useState({
    student: 200,
    class: 120,
    company: 150,
    address: 300,
    phone: 120,
    supervisor: 150,
    supervisorPhone: 120,
    period: 180,
    status: 120,
    actions: 200
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);
  
  // Fonctions pour le redimensionnement des colonnes
  const handleMouseDown = (e, column) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(column);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !resizingColumn) return;
    
    const table = document.querySelector('table');
    if (!table) return;
    
    const tableRect = table.getBoundingClientRect();
    const newWidth = e.clientX - tableRect.left;
    
    if (newWidth > 80) { // Largeur minimale
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizingColumn(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fonctions pour la modification d'entreprise (même que dans Entreprise.js)
  const handleEditCompany = () => {
    const selectedCompany = entreprises.find(e => e.id == internshipForm.company_id);
    if (selectedCompany) {
      setEditingEntreprise(selectedCompany);
      setEditFormData({
        raisonSociale: selectedCompany.raisonSociale || '',
        activite: selectedCompany.activite || '',
        ape: selectedCompany.ape || '',
        adresse1: selectedCompany.adresse1 || '',
        adresse2: selectedCompany.adresse2 || '',
        codePostal: selectedCompany.codePostal || '',
        ville: selectedCompany.ville || '',
        pays: selectedCompany.pays || '',
        telephoneFixe: selectedCompany.telephoneFixe || '',
        telephonePortable: selectedCompany.telephonePortable || '',
        email: selectedCompany.email || '',
        siret: selectedCompany.siret || '',
        ursaff: selectedCompany.ursaff || '',
        tva: selectedCompany.tva || '',
        capital: selectedCompany.capital || '',
        formeJuridique: selectedCompany.formeJuridique || '',
        effectif: selectedCompany.effectif || '',
        dirigeant: selectedCompany.dirigeant || '',
        contact: selectedCompany.contact || '',
        telephoneContact: selectedCompany.telephoneContact || '',
        emailContact: selectedCompany.emailContact || '',
        siteWeb: selectedCompany.siteWeb || '',
        observations: selectedCompany.observations || ''
      });
      setShowEditCompanyModal(true);
    }
  };

  const closeEditModal = () => {
    setShowEditCompanyModal(false);
    setEditingEntreprise(null);
    setEditFormData({});
  };

  const handleSaveEdit = () => {
    // Mise à jour locale (même logique que dans Entreprise.js)
    const updatedEntreprises = entreprises.map(entreprise => 
      entreprise.id === editingEntreprise.id 
        ? { ...entreprise, ...editFormData }
        : entreprise
    );
    
    setEntreprises(updatedEntreprises);
    
    // Mettre à jour le formulaire de stage avec les nouvelles données
    setInternshipForm({
      ...internshipForm,
      company_name: editFormData.raisonSociale,
      company_address: `${editFormData.adresse1 || ''} ${editFormData.adresse2 || ''} ${editFormData.codePostal || ''} ${editFormData.ville || ''}`.trim(),
      company_phone: editFormData.telephoneFixe || editFormData.telephonePortable || '',
      company_email: editFormData.email || ''
    });
    
    // Fermer le modal
    closeEditModal();
    toast.success('Entreprise mise à jour avec succès');
  };

  // Fonction pour afficher les détails de l'étudiant
  const handleViewStudentDetails = (student) => {
    setSelectedStudentForDetails(student);
    setShowStudentDetails(true);
  };
  
  // États pour les modals
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showVisitesModal, setShowVisitesModal] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);
  
  // États pour les formulaires
  const [internshipForm, setInternshipForm] = useState({
    student_id: '',
    company_id: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    supervisor_name: '',
    supervisor_phone: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });
  
  const [absenceForm, setAbsenceForm] = useState({
    student_id: '',
    date: '',
    reason: '',
    type: 'justified',
    duration: 'full_day'
  });
  
  const [activityForm, setActivityForm] = useState({
    student_id: '',
    date: '',
    title: '',
    description: '',
    type: 'technical',
    hours: 0,
    observations: ''
  });


  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  // Event listeners pour le redimensionnement
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizingColumn]);

  const fetchData = async () => {
    try {
      const [studentsRes, internshipsRes, activitiesRes, absencesRes] = await Promise.all([
        axios.get(`/api/students?school_year=${selectedYear}`),
        axios.get('/api/internships').catch(err => {
          // Si l'API internships n'existe pas encore, retourner une réponse vide
          if (err.response?.status === 404) {
            return { data: { success: true, data: [] } };
          }
          throw err;
        }),
        axios.get(`/api/activities?school_year=${selectedYear}`).catch(err => {
          if (err.response?.status === 404) {
            return { data: { success: true, data: [] } };
          }
          throw err;
        }),
        axios.get(`/api/absences?school_year=${selectedYear}`).catch(err => {
          if (err.response?.status === 404) {
            return { data: { success: true, data: [] } };
          }
          throw err;
        })
      ]);

      if (studentsRes.data.success) {
        // Filtrer seulement les étudiants du BTS Électrotechnique
        const electrotechStudents = studentsRes.data.data.filter(
          student => student.class === 'STS ELEC1' || student.class === 'BTS ELEC'
        );
        setStudents(electrotechStudents);
      }

      if (internshipsRes.data.success) {
        setInternships(internshipsRes.data.data);
      }

      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.data);
      }

      if (absencesRes.data.success) {
        setAbsences(absencesRes.data.data);
      }
      
      // Charger les données d'entreprises
      await loadEntreprisesData();
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les données d'entreprises
  const loadEntreprisesData = async () => {
    try {
      const response = await fetch('/entreprise.csv');
      const csvText = await response.text();
      
      // Parser le CSV
      const lines = csvText.split('\n');
      
      const data = lines.slice(1).map((line, index) => {
        // Parser CSV correctement en gérant les virgules dans les guillemets
        const values = parseCSVLine(line);
        
        return {
          id: index + 1,
          raisonSociale: cleanText(values[0]) || '',
          activite: cleanText(values[1]) || '',
          ape: cleanText(values[2]) || '',
          adresse1: cleanText(values[3]) || '',
          adresse2: cleanText(values[4]) || '',
          codePostal: cleanText(values[5]) || '',
          ville: cleanText(values[6]) || '',
          pays: cleanText(values[7]) || '',
          telephoneFixe: cleanText(values[8]) || '',
          telephonePortable: cleanText(values[9]) || '',
          email: cleanText(values[10]) || '',
          siret: cleanText(values[11]) || '',
          ursaff: cleanText(values[12]) || '',
          compagnieAssurance: cleanText(values[13]) || '',
          policeAssurance: cleanText(values[14]) || '',
          civiliteResponsable: cleanText(values[15]) || '',
          nomResponsable: cleanText(values[16]) || '',
          prenomResponsable: cleanText(values[17]) || '',
          fonctionResponsable: cleanText(values[18]) || '',
          telephoneFixeResponsable: cleanText(values[19]) || '',
          faxResponsable: cleanText(values[20]) || '',
          telephonePortableResponsable: cleanText(values[21]) || '',
          emailResponsable: cleanText(values[22]) || ''
        };
      }).filter(item => item.raisonSociale.trim() !== '');
      
      setEntreprises(data);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    }
  };

  // Fonction pour parser une ligne CSV correctement
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Ajouter le dernier élément
    result.push(current.trim());
    
    return result;
  };

  // Fonction pour nettoyer le texte
  const cleanText = (text) => {
    if (!text) return '';
    
    return text
      .toString()
      .trim()
      // Supprimer les guillemets en début et fin
      .replace(/^"(.*)"$/, '$1')
      // Corrections de base pour les caractères français
      .replace(/Activit/g, 'Activité')
      .replace(/Tlphone/g, 'Téléphone')
      .replace(/Civilit/g, 'Civilité')
      .replace(/Prnom/g, 'Prénom')
      .replace(/Scurit/g, 'Sécurité')
      .replace(/Matriel/g, 'Matériel')
      .replace(/Gnrale/g, 'Générale');
  };

  // Fonction pour gérer la sélection d'entreprise
  const handleCompanySelection = (companyId) => {
    const selectedCompany = entreprises.find(company => company.id === parseInt(companyId));
    if (selectedCompany) {
      setInternshipForm({
        ...internshipForm,
        company_id: companyId,
        company_name: selectedCompany.raisonSociale,
        company_address: selectedCompany.adresse1 + (selectedCompany.adresse2 ? ', ' + selectedCompany.adresse2 : '') + ', ' + selectedCompany.codePostal + ' ' + selectedCompany.ville,
        company_phone: selectedCompany.telephoneFixe || selectedCompany.telephonePortable || '',
        company_email: selectedCompany.email || '',
        supervisor_name: selectedCompany.prenomResponsable + ' ' + selectedCompany.nomResponsable,
        supervisor_phone: selectedCompany.telephoneFixeResponsable || selectedCompany.telephonePortableResponsable || ''
      });
    }
  };

  const handleDeleteInternship = async (internshipId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce stage ?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/internships/${internshipId}`);
      
      if (response.data.success) {
        toast.success('Stage supprimé avec succès');
        await fetchData(); // Rafraîchir les données
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du stage:', error);
      toast.error(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleInternshipSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('💾 Sauvegarde du stage:', internshipForm);
      
      const response = await axios.post('/api/internships', internshipForm).catch(err => {
        if (err.response?.status === 404) {
          // Si l'API n'existe pas encore, simuler la sauvegarde en local
          toast.warning('API internships non disponible, sauvegarde locale temporaire');
          return { data: { success: true } };
        }
        throw err;
      });
      
      if (response.data.success) {
        toast.success('Stage ajouté avec succès');
      setShowInternshipModal(false);
      setInternshipForm({
        student_id: '',
          company_id: '',
        company_name: '',
        company_address: '',
        company_phone: '',
        company_email: '',
        supervisor_name: '',
        supervisor_phone: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
        // Rafraîchir les données
        await fetchData();
      } else {
      toast.error('Erreur lors de l\'ajout du stage');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du stage:', error);
      toast.error(`Erreur lors de l'ajout du stage: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('💾 Sauvegarde de l\'absence:', absenceForm);

      // Tentative de sauvegarde via l'API
      try {
        const response = await axios.post('/api/absences', { ...absenceForm, school_year: selectedYear });
        if (response.data.success) {
          toast.success('Absence enregistrée avec succès');
          setShowAbsenceModal(false);
          setAbsenceForm({
            student_id: '',
            date: '',
            reason: '',
            type: 'justified',
            duration: 'full_day'
          });
          await fetchData(); // Recharger les données
        } else {
          throw new Error('Erreur de sauvegarde');
        }
      } catch (apiError) {
        if (apiError.response?.status === 404) {
          // API non disponible, sauvegarde locale temporaire
          console.warn('API absences non disponible, sauvegarde locale temporaire');
          const newAbsence = {
            id: Date.now(),
            ...absenceForm,
            student: students.find(s => s.id == absenceForm.student_id)
          };
          setAbsences([...absences, newAbsence]);
          setShowAbsenceModal(false);
          setAbsenceForm({
            student_id: '',
            date: '',
            reason: '',
            type: 'justified',
            duration: 'full_day'
          });
          toast.success('Absence sauvegardée localement (API non disponible)');
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de l\'absence:', error);
      toast.error(`Erreur lors de l'enregistrement de l'absence: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('💾 Sauvegarde de l\'activité:', activityForm);

      // Tentative de sauvegarde via l'API
      try {
        const response = await axios.post('/api/activities', { ...activityForm, school_year: selectedYear });
        if (response.data.success) {
          toast.success('Activité ajoutée avec succès');
          setShowActivityModal(false);
          setActivityForm({
            student_id: '',
            date: '',
            title: '',
            description: '',
            type: 'technical',
            hours: 0,
            observations: ''
          });
          await fetchData(); // Recharger les données
        } else {
          throw new Error('Erreur de sauvegarde');
        }
      } catch (apiError) {
        if (apiError.response?.status === 404) {
          // API non disponible, sauvegarde locale temporaire
          console.warn('API activities non disponible, sauvegarde locale temporaire');
          const newActivity = {
            id: Date.now(),
            ...activityForm,
            student: students.find(s => s.id == activityForm.student_id)
          };
          setActivities([...activities, newActivity]);
          setShowActivityModal(false);
          setActivityForm({
            student_id: '',
            date: '',
            title: '',
            description: '',
            type: 'technical',
            hours: 0,
            observations: ''
          });
          toast.success('Activité sauvegardée localement (API non disponible)');
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'activité:', error);
      toast.error(`Erreur lors de l'ajout de l'activité: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'terminated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAbsenceTypeColor = (type) => {
    switch (type) {
      case 'justified': return 'text-green-600 bg-green-100';
      case 'unjustified': return 'text-red-600 bg-red-100';
      case 'medical': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredStudents = students.filter(student => {
    // Filtre par recherche textuelle
    const matchesSearch = searchTerm === '' || 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par classe
    const matchesClass = selectedClass === '' || student.class === selectedClass;
    
    // Filtre par session (année scolaire)
    const matchesSession = selectedSession === '' || student.school_year === selectedSession;
    
    return matchesSearch && matchesClass && matchesSession;
  });

  // Grouper les étudiants par classe et session
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const key = `${student.school_year || 'Non défini'}-${student.class || 'Non défini'}`;
    if (!groups[key]) {
      groups[key] = {
        session: student.school_year || 'Non défini',
        class: student.class || 'Non défini',
        students: []
      };
    }
    groups[key].students.push(student);
    return groups;
  }, {});

  // Trier les groupes par session puis par classe
  const sortedGroups = Object.values(groupedStudents).sort((a, b) => {
    if (a.session !== b.session) {
      return b.session.localeCompare(a.session); // Sessions récentes en premier
    }
    return a.class.localeCompare(b.class);
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Stages</h1>
          <p className="mt-1 text-sm text-gray-500">
            BTS Électrotechnique - Suivi des stages en entreprise
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
          <button className="btn btn-primary flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Étudiants
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
                <Building className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Stages actifs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {internships.filter(i => i.status === 'active').length}
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
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Absences ce mois
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {absences.length}
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
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Activités
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activities.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'students', name: 'Étudiants', icon: User },
              { id: 'internships', name: 'Stages', icon: Building },
              { id: 'absences', name: 'Absences', icon: AlertCircle },
              { id: 'activities', name: 'Activités', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Barre de recherche et filtres */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
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
            
            {/* Filtres par classe et session */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Toutes les classes</option>
                  {[...new Set(students.map(s => s.class).filter(Boolean))].sort().map(classe => (
                    <option key={classe} value={classe}>{classe}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Toutes les sessions</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setSelectedClass('');
                    setSelectedSession('');
                    setSearchTerm('');
                  }}
                  className="btn btn-secondary flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Gestion des stages par classe et session
                  {selectedClass && (
                    <span className="ml-2 text-sm text-blue-600">- Classe: {selectedClass}</span>
                  )}
                  {selectedSession && (
                    <span className="ml-2 text-sm text-green-600">- Session: {selectedSession}</span>
                  )}
                </h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowCalendarModal(true)}
                    className="btn btn-secondary flex items-center bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Planning Calendrier
                  </button>
                  <button 
                    onClick={() => setShowStudentModal(true)}
                    className="btn btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter étudiant
                  </button>
                </div>
              </div>
              
              {/* Affichage par groupes (classe et session) */}
              {sortedGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun étudiant trouvé avec les critères sélectionnés</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      {/* En-tête du groupe */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Building className="h-5 w-5 text-blue-600" />
                              <span className="text-lg font-semibold text-gray-900">
                                {group.class}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">
                                Session {group.session}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {group.students.length} étudiant{group.students.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tableau des étudiants du groupe */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Étudiant
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Entreprise
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Adresse
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Téléphone
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Nom du tuteur
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Tél. tuteur
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Période
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Statut
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                    </tr>
                  </thead>
                          <tbody className="bg-white">
                            {group.students.map((student) => {
                              const studentInternship = internships.find(i => i.student_id == student.id);
                              return (
                                <tr 
                                  key={student.id} 
                                  className="hover:bg-gray-50 cursor-pointer"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    if (studentInternship) {
                                      // Si un stage existe, ouvrir le modal en mode modification
                                      setShowInternshipModal(true);
                                      setInternshipForm({
                                        ...internshipForm,
                                        student_id: student.id,
                                        company_id: studentInternship.company_id,
                                        company_name: studentInternship.company_name,
                                        company_address: studentInternship.company_address,
                                        company_phone: studentInternship.company_phone,
                                        company_email: studentInternship.company_email,
                                        supervisor_name: studentInternship.supervisor_name,
                                        supervisor_phone: studentInternship.supervisor_phone,
                                        start_date: studentInternship.start_date,
                                        end_date: studentInternship.end_date,
                                        status: studentInternship.status
                                      });
                                    } else {
                                      // Si aucun stage, ouvrir le modal en mode création
                                      setShowInternshipModal(true);
                                      setInternshipForm({...internshipForm, student_id: student.id});
                                    }
                                  }}
                                >
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary-600" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                  <span>{student.first_name} {student.last_name}</span>
                                  <ColorationLogo coloration={student.coloration} className="h-12 w-12" />
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.date_de_naissance}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {student.class || 'Non assigné'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {studentInternship ? (
                                <div className="font-medium">{studentInternship.company_name}</div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {studentInternship ? (
                              <div className="whitespace-normal break-words">
                                {studentInternship.company_address || '-'}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {studentInternship ? (
                              <div>{studentInternship.company_phone || '-'}</div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {studentInternship ? (
                              <div className="font-medium">{studentInternship.supervisor_name || '-'}</div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {studentInternship ? (
                              <div>{studentInternship.supervisor_phone || '-'}</div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {studentInternship ? (
                              <div className="text-xs">
                                {studentInternship.start_date && studentInternship.end_date ? (
                                  `${formatDate(studentInternship.start_date)} au ${formatDate(studentInternship.end_date)}`
                                ) : (
                                  'Non défini'
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {studentInternship ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(studentInternship.status)}`}>
                                {studentInternship.status === 'active' ? 'En cours' : 
                                 studentInternship.status === 'completed' ? 'Terminé' : 'Terminé anticipé'}
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-gray-600 bg-gray-100">
                                En attente
                              </span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                  setShowInternshipModal(true);
                                  setInternshipForm({...internshipForm, student_id: student.id});
                                }}
                                className="text-primary-600 hover:text-primary-900"
                                title="Gérer le stage"
                              >
                                <Building className="h-4 w-4" />
                              </button>
                              {studentInternship && (
                                <>
                              <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedStudent(student);
                                      setShowInternshipModal(true);
                                      setInternshipForm({
                                        ...internshipForm,
                                        student_id: student.id,
                                        company_id: studentInternship.company_id,
                                        company_name: studentInternship.company_name,
                                        company_address: studentInternship.company_address,
                                        company_phone: studentInternship.company_phone,
                                        company_email: studentInternship.company_email,
                                        supervisor_name: studentInternship.supervisor_name,
                                        supervisor_phone: studentInternship.supervisor_phone,
                                        start_date: studentInternship.start_date,
                                        end_date: studentInternship.end_date,
                                        status: studentInternship.status
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Modifier le stage"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteInternship(studentInternship.id);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Supprimer le stage"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                  setShowAbsenceModal(true);
                                  setAbsenceForm({...absenceForm, student_id: student.id});
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Enregistrer une absence"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                  setShowActivityModal(true);
                                  setActivityForm({...activityForm, student_id: student.id});
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Ajouter une activité"
                              >
                                <Activity className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                  setShowVisitesModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-900"
                                title="Gérer les visites de stage"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewStudentDetails(student);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Voir les détails"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Autres onglets à implémenter */}
          {activeTab === 'internships' && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Gestion des stages</h3>
              <p className="mt-1 text-sm text-gray-500">
                Interface de gestion des stages en entreprise
              </p>
            </div>
          )}

          {activeTab === 'absences' && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Registre des absences</h3>
              <p className="mt-1 text-sm text-gray-500">
                Suivi des absences des étudiants
              </p>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Activités réalisées</h3>
              <p className="mt-1 text-sm text-gray-500">
                Suivi des activités pendant les stages
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Stage */}
      {showInternshipModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowInternshipModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleInternshipSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedStudent ? `Stage pour ${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Nouveau stage'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Étudiant</label>
                      <select
                        required
                        className="input"
                        value={internshipForm.student_id}
                        onChange={(e) => setInternshipForm({...internshipForm, student_id: e.target.value})}
                      >
                        <option value="">Sélectionner un étudiant</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.first_name} {student.last_name} - {student.class}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Statut</label>
                      <select
                        required
                        className="input"
                        value={internshipForm.status}
                        onChange={(e) => setInternshipForm({...internshipForm, status: e.target.value})}
                      >
                        <option value="active">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="terminated">Terminé anticipé</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Nom de l'entreprise *</label>
                      <div className="flex space-x-2">
                        <select
                          required
                          className="input flex-1"
                          value={internshipForm.company_id}
                          onChange={(e) => handleCompanySelection(e.target.value)}
                        >
                          <option value="">Sélectionner une entreprise</option>
                          {entreprises.map((entreprise) => (
                            <option key={entreprise.id} value={entreprise.id}>
                              {entreprise.raisonSociale}
                            </option>
                          ))}
                        </select>
                        {internshipForm.company_id && (
                          <button
                            type="button"
                            onClick={handleEditCompany}
                            className="btn btn-secondary flex items-center px-3 py-2"
                            title="Modifier l'entreprise sélectionnée"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">Adresse de l'entreprise</label>
                      <input
                        type="text"
                        className="input"
                        value={internshipForm.company_address}
                        onChange={(e) => setInternshipForm({...internshipForm, company_address: e.target.value})}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="label">Téléphone entreprise</label>
                      <input
                        type="tel"
                        className="input"
                        value={internshipForm.company_phone}
                        onChange={(e) => setInternshipForm({...internshipForm, company_phone: e.target.value})}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="label">Email entreprise</label>
                      <input
                        type="email"
                        className="input"
                        value={internshipForm.company_email}
                        onChange={(e) => setInternshipForm({...internshipForm, company_email: e.target.value})}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="label">Nom du tuteur</label>
                      <input
                        type="text"
                        className="input"
                        value={internshipForm.supervisor_name}
                        onChange={(e) => setInternshipForm({...internshipForm, supervisor_name: e.target.value})}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="label">Téléphone tuteur</label>
                      <input
                        type="tel"
                        className="input"
                        value={internshipForm.supervisor_phone}
                        onChange={(e) => setInternshipForm({...internshipForm, supervisor_phone: e.target.value})}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="label">Date de début *</label>
                      <div className="relative">
                      <input
                        type="date"
                        required
                          className="input pr-10"
                        value={internshipForm.start_date}
                        onChange={(e) => setInternshipForm({...internshipForm, start_date: e.target.value})}
                      />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">Date de fin *</label>
                      <div className="relative">
                      <input
                        type="date"
                        required
                          className="input pr-10"
                        value={internshipForm.end_date}
                        onChange={(e) => setInternshipForm({...internshipForm, end_date: e.target.value})}
                      />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setShowInternshipModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer le stage
                  </button>
                </div>
                </form>
              </div>
            </div>
          </div>
      )}

      {/* Modal Absence */}
      {showAbsenceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAbsenceModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAbsenceSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedStudent ? `Absence pour ${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Nouvelle absence'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label">Étudiant</label>
                      <select
                        required
                        className="input"
                        value={absenceForm.student_id}
                        onChange={(e) => setAbsenceForm({...absenceForm, student_id: e.target.value})}
                      >
                        <option value="">Sélectionner un étudiant</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.first_name} {student.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Date *</label>
                      <input
                        type="date"
                        required
                        className="input"
                        value={absenceForm.date}
                        onChange={(e) => setAbsenceForm({...absenceForm, date: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Type d'absence</label>
                      <select
                        required
                        className="input"
                        value={absenceForm.type}
                        onChange={(e) => setAbsenceForm({...absenceForm, type: e.target.value})}
                      >
                        <option value="justified">Justifiée</option>
                        <option value="unjustified">Non justifiée</option>
                        <option value="medical">Médicale</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Durée</label>
                      <select
                        required
                        className="input"
                        value={absenceForm.duration}
                        onChange={(e) => setAbsenceForm({...absenceForm, duration: e.target.value})}
                      >
                        <option value="full_day">Journée complète</option>
                        <option value="half_day">Demi-journée</option>
                        <option value="hours">Heures spécifiques</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Raison *</label>
                      <textarea
                        required
                        className="input"
                        rows="3"
                        value={absenceForm.reason}
                        onChange={(e) => setAbsenceForm({...absenceForm, reason: e.target.value})}
                        placeholder="Détails de l'absence..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3 sm:w-auto"
                  >
                    Enregistrer l'absence
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary sm:mt-0 sm:w-auto"
                    onClick={() => setShowAbsenceModal(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Activité */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowActivityModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleActivitySubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedStudent ? `Activité pour ${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Nouvelle activité'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label">Étudiant</label>
                      <select
                        required
                        className="input"
                        value={activityForm.student_id}
                        onChange={(e) => setActivityForm({...activityForm, student_id: e.target.value})}
                      >
                        <option value="">Sélectionner un étudiant</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.first_name} {student.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Date *</label>
                      <input
                        type="date"
                        required
                        className="input"
                        value={activityForm.date}
                        onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Titre de l'activité *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Type d'activité</label>
                      <select
                        required
                        className="input"
                        value={activityForm.type}
                        onChange={(e) => setActivityForm({...activityForm, type: e.target.value})}
                      >
                        <option value="technical">Technique</option>
                        <option value="administrative">Administrative</option>
                        <option value="formation">Formation</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Nombre d'heures</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="input"
                        value={activityForm.hours}
                        onChange={(e) => setActivityForm({...activityForm, hours: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Description *</label>
                      <textarea
                        required
                        className="input"
                        rows="4"
                        value={activityForm.description}
                        onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                        placeholder="Détails de l'activité réalisée..."
                      />
                    </div>
                    
                    <div>
                      <label className="label">Observations</label>
                      <textarea
                        className="input"
                        rows="3"
                        value={activityForm.observations}
                        onChange={(e) => setActivityForm({...activityForm, observations: e.target.value})}
                        placeholder="Observations supplémentaires sur l'activité..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3 sm:w-auto"
                  >
                    Enregistrer l'activité
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary sm:mt-0 sm:w-auto"
                    onClick={() => setShowActivityModal(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'entreprise (même que dans Entreprise.js) */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête du modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Modifier l'entreprise</h2>
                  <p className="text-blue-100 mt-1">
                    {editingEntreprise?.raisonSociale}
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne gauche */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison sociale *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.raisonSociale || ''}
                      onChange={(e) => setEditFormData({...editFormData, raisonSociale: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activité
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.activite || ''}
                      onChange={(e) => setEditFormData({...editFormData, activite: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code APE
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.ape || ''}
                      onChange={(e) => setEditFormData({...editFormData, ape: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse 1
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.adresse1 || ''}
                      onChange={(e) => setEditFormData({...editFormData, adresse1: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse 2
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.adresse2 || ''}
                      onChange={(e) => setEditFormData({...editFormData, adresse2: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editFormData.codePostal || ''}
                        onChange={(e) => setEditFormData({...editFormData, codePostal: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editFormData.ville || ''}
                        onChange={(e) => setEditFormData({...editFormData, ville: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.pays || ''}
                      onChange={(e) => setEditFormData({...editFormData, pays: e.target.value})}
                    />
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone fixe
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editFormData.telephoneFixe || ''}
                        onChange={(e) => setEditFormData({...editFormData, telephoneFixe: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone portable
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editFormData.telephonePortable || ''}
                        onChange={(e) => setEditFormData({...editFormData, telephonePortable: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SIRET
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.siret || ''}
                      onChange={(e) => setEditFormData({...editFormData, siret: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URSSAF
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.ursaff || ''}
                      onChange={(e) => setEditFormData({...editFormData, ursaff: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TVA
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.tva || ''}
                      onChange={(e) => setEditFormData({...editFormData, tva: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capital
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.capital || ''}
                      onChange={(e) => setEditFormData({...editFormData, capital: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Forme juridique
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.formeJuridique || ''}
                      onChange={(e) => setEditFormData({...editFormData, formeJuridique: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effectif
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.effectif || ''}
                      onChange={(e) => setEditFormData({...editFormData, effectif: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Section contact */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.contact || ''}
                      onChange={(e) => setEditFormData({...editFormData, contact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone contact
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.telephoneContact || ''}
                      onChange={(e) => setEditFormData({...editFormData, telephoneContact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email contact
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.emailContact || ''}
                      onChange={(e) => setEditFormData({...editFormData, emailContact: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Observations */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observations
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.observations || ''}
                  onChange={(e) => setEditFormData({...editFormData, observations: e.target.value})}
                />
              </div>
            </div>

            {/* Pied du modal */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sauvegarder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de l'étudiant */}
      {showStudentDetails && selectedStudentForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête du modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Détails de l'étudiant</h2>
                  <p className="text-blue-100 mt-1">
                    {selectedStudentForDetails.first_name} {selectedStudentForDetails.last_name} - {selectedStudentForDetails.class || 'Non assigné'}
                  </p>
                </div>
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6">
              {/* Informations de l'étudiant */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <p className="text-gray-900">{selectedStudentForDetails.first_name} {selectedStudentForDetails.last_name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                    <p className="text-gray-900">{selectedStudentForDetails.date_de_naissance}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                    <p className="text-gray-900">{selectedStudentForDetails.class || 'Non assigné'}</p>
                  </div>
                </div>
              </div>

              {/* Informations du stage */}
              {(() => {
                const studentInternship = internships.find(i => i.student_id == selectedStudentForDetails.id);
                return studentInternship ? (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du stage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <p className="text-gray-900 font-medium">{studentInternship.company_name}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tuteur</label>
                        <p className="text-gray-900">{studentInternship.supervisor_name || 'Non défini'}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                        <p className="text-gray-900">
                          {studentInternship.start_date && studentInternship.end_date ? (
                            `${formatDate(studentInternship.start_date)} au ${formatDate(studentInternship.end_date)}`
                          ) : (
                            'Non défini'
                          )}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          studentInternship.status === 'active' ? 'bg-green-100 text-green-800' :
                          studentInternship.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {studentInternship.status === 'active' ? 'En cours' : 
                           studentInternship.status === 'completed' ? 'Terminé' : 'Terminé anticipé'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du stage</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">Aucun stage assigné</p>
                    </div>
                  </div>
                );
              })()}

              {/* Tableau des activités */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activités enregistrées</h3>
                {(() => {
                  const studentActivities = activities.filter(a => a.student_id == selectedStudentForDetails.id);
                  return studentActivities.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Titre
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Heures
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Observations
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {studentActivities.map((activity, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                {formatDate(activity.date)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                                {activity.title || 'Sans titre'}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  activity.type === 'technical' ? 'bg-blue-100 text-blue-800' :
                                  activity.type === 'administrative' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {activity.type === 'technical' ? 'Technique' :
                                   activity.type === 'administrative' ? 'Administrative' : 'Formation'}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                {activity.hours}h
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={activity.description}>
                                  {activity.description}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={activity.observations || 'Aucune observation'}>
                                  {activity.observations || '-'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">Aucune activité enregistrée</p>
                    </div>
                  );
                })()}
              </div>

              {/* Tableau des absences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Absences enregistrées</h3>
                {(() => {
                  const studentAbsences = absences.filter(a => a.student_id == selectedStudentForDetails.id);
                  return studentAbsences.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Durée
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Raison
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {studentAbsences.map((absence, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                {formatDate(absence.date)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  absence.type === 'justified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {absence.type === 'justified' ? 'Justifiée' : 'Non justifiée'}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                {absence.duration === 'full_day' ? 'Journée complète' : 'Demi-journée'}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                {absence.reason || 'Non spécifiée'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">Aucune absence enregistrée</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Pied du modal */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => setShowStudentDetails(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visites de Stage */}
      {showVisitesModal && selectedStudent && (
        <VisitesStageModal
          student={selectedStudent}
          onClose={() => {
            setShowVisitesModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Modal Planning Calendrier */}
      <VisitesCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />
    </div>
  );
};

export default RapportStage;
