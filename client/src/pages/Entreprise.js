import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Phone, Mail, Edit, Trash2, Search, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const Entreprise = () => {
  const [entreprises, setEntreprises] = useState([]);
  const [filteredEntreprises, setFilteredEntreprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortField, setSortField] = useState('raisonSociale');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // États pour le modal de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // État pour la suppression
  const [deletingId, setDeletingId] = useState(null);

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

  // Fonction pour nettoyer les caractères d'encodage (simplifiée pour Excel)
  const cleanText = (text) => {
    if (!text) return '';
    
    // Nettoyage simple - Excel gère mieux l'encodage
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

  const loadEntreprisesData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/entreprise.csv');
      const csvText = await response.text();
      
      // Parser le CSV
      const lines = csvText.split('\n');
      
      const data = lines.slice(1).map((line, index) => {
        // Parser CSV correctement en gérant les virgules dans les guillemets
        const values = parseCSVLine(line);
        
        // Debug pour les premières lignes
        if (index < 3) {
          // console.log(`Ligne ${index + 1}:`, line);
          // console.log(`Valeurs parsées:`, values);
        }
        
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
      setFilteredEntreprises(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setEntreprises([]);
      setFilteredEntreprises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données du fichier CSV
  useEffect(() => {
    loadEntreprisesData();
  }, [loadEntreprisesData]);

  // Filtrer les entreprises en fonction du terme de recherche
  useEffect(() => {
    const filtered = entreprises.filter(entreprise => 
      entreprise.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entreprise.activite?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entreprise.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entreprise.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEntreprises(filtered);
    setCurrentPage(1);
  }, [searchTerm, entreprises]);


  // Trier les données
  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    
    const sorted = [...filteredEntreprises].sort((a, b) => {
      const aValue = a[field] || '';
      const bValue = b[field] || '';
      
      if (direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    
    setFilteredEntreprises(sorted);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEntreprises.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntreprises.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fonction pour modifier une entreprise
  const handleEdit = (entreprise) => {
    setEditingEntreprise(entreprise);
    setEditFormData({
      raisonSociale: entreprise.raisonSociale || '',
      activite: entreprise.activite || '',
      ape: entreprise.ape || '',
      adresse1: entreprise.adresse1 || '',
      adresse2: entreprise.adresse2 || '',
      codePostal: entreprise.codePostal || '',
      ville: entreprise.ville || '',
      pays: entreprise.pays || '',
      telephoneFixe: entreprise.telephoneFixe || '',
      telephonePortable: entreprise.telephonePortable || '',
      email: entreprise.email || '',
      siret: entreprise.siret || '',
      ursaff: entreprise.ursaff || '',
      compagnieAssurance: entreprise.compagnieAssurance || '',
      policeAssurance: entreprise.policeAssurance || '',
      civiliteResponsable: entreprise.civiliteResponsable || '',
      nomResponsable: entreprise.nomResponsable || '',
      prenomResponsable: entreprise.prenomResponsable || '',
      fonctionResponsable: entreprise.fonctionResponsable || '',
      telephoneFixeResponsable: entreprise.telephoneFixeResponsable || '',
      faxResponsable: entreprise.faxResponsable || '',
      telephonePortableResponsable: entreprise.telephonePortableResponsable || '',
      emailResponsable: entreprise.emailResponsable || ''
    });
    setIsEditModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEntreprise(null);
    setEditFormData({});
  };

  // Fonction pour gérer les changements dans le formulaire
  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = () => {
    // Ici, on pourrait envoyer les données au serveur
    console.log('Sauvegarde des modifications:', editFormData);
    
    // Pour l'instant, on met à jour localement
    const updatedEntreprises = entreprises.map(entreprise => 
      entreprise.id === editingEntreprise.id 
        ? { ...entreprise, ...editFormData }
        : entreprise
    );
    
    setEntreprises(updatedEntreprises);
    setFilteredEntreprises(updatedEntreprises);
    
    // Fermer le modal
    closeEditModal();
    
    // Afficher un message de succès
    alert('Entreprise modifiée avec succès !');
  };

  // Fonction pour supprimer une entreprise
  const handleDelete = async (entreprise) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${entreprise.raisonSociale}" ?\n\nCette action est irréversible.`)) {
      try {
        setDeletingId(entreprise.id);
        
        // Simuler un délai de suppression (pour l'UX)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Supprimer l'entreprise de la liste
        const updatedEntreprises = entreprises.filter(ent => ent.id !== entreprise.id);
        setEntreprises(updatedEntreprises);
        setFilteredEntreprises(updatedEntreprises);
        
        // Gérer la pagination après suppression
        const newTotalPages = Math.ceil(updatedEntreprises.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
        // Afficher un message de succès
        alert(`L'entreprise "${entreprise.raisonSociale}" a été supprimée avec succès.`);
        
        // Optionnel : Ici on pourrait aussi envoyer une requête au serveur pour supprimer de la base de données
        // await deleteEntrepriseFromServer(entreprise.id);
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'entreprise.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Fonction pour importer un fichier XLSX
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Prendre la première feuille
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          alert('Le fichier Excel doit contenir au moins un en-tête et une ligne de données');
          return;
        }

        // Traiter les données
        const importedEntreprises = jsonData.slice(1).map((row, index) => {
          return {
            id: index + 1,
            raisonSociale: cleanText(row[0]) || '',
            activite: cleanText(row[1]) || '',
            ape: cleanText(row[2]) || '',
            adresse1: cleanText(row[3]) || '',
            adresse2: cleanText(row[4]) || '',
            codePostal: cleanText(row[5]) || '',
            ville: cleanText(row[6]) || '',
            pays: cleanText(row[7]) || '',
            telephoneFixe: cleanText(row[8]) || '',
            telephonePortable: cleanText(row[9]) || '',
            email: cleanText(row[10]) || '',
            siret: cleanText(row[11]) || '',
            ursaff: cleanText(row[12]) || '',
            compagnieAssurance: cleanText(row[13]) || '',
            policeAssurance: cleanText(row[14]) || '',
            civiliteResponsable: cleanText(row[15]) || '',
            nomResponsable: cleanText(row[16]) || '',
            prenomResponsable: cleanText(row[17]) || '',
            fonctionResponsable: cleanText(row[18]) || '',
            telephoneFixeResponsable: cleanText(row[19]) || '',
            faxResponsable: cleanText(row[20]) || '',
            telephonePortableResponsable: cleanText(row[21]) || '',
            emailResponsable: cleanText(row[22]) || ''
          };
        }).filter(item => item.raisonSociale.trim() !== '');

        if (importedEntreprises.length === 0) {
          alert('Aucune entreprise valide trouvée dans le fichier');
          return;
        }

        // Demander confirmation
        if (window.confirm(`Voulez-vous remplacer les données actuelles par les ${importedEntreprises.length} entreprises du fichier ?\n\nCette action remplacera toutes les données existantes.`)) {
          setEntreprises(importedEntreprises);
          setFilteredEntreprises(importedEntreprises);
          setCurrentPage(1);
          alert(`Importation réussie ! ${importedEntreprises.length} entreprises ont été importées.`);
        }

      } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
        alert('Erreur lors de la lecture du fichier Excel. Vérifiez que le fichier n\'est pas corrompu.');
      }
    };

    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
    };

    reader.readAsArrayBuffer(file);
    
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Entreprises</h1>
              <p className="mt-2 text-blue-100 text-sm sm:text-base">
                {entreprises.length} entreprises trouvées dans la base de données
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et actions */}
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise, ville, activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <div className="flex space-x-3">
              <label className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer">
                <Upload className="h-5 w-5" />
                <span className="font-medium">Importer fichier XLSX</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des entreprises */}
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <span className="mt-4 text-lg text-gray-600">Chargement des données...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Debug info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Debug:</strong> {entreprises.length} entreprises chargées, {filteredEntreprises.length} après filtrage, 
                Page {currentPage} sur {totalPages}, Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredEntreprises.length)}
              </p>
            </div>

            {/* Bouton Créer une entreprise */}
            <div className="mb-6">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md">
                <span className="text-lg">+</span>
                <span>Créer une entreprise</span>
              </button>
            </div>

            {/* Tableau quadrillé avec meilleure visibilité */}
            {currentItems.length > 0 ? (
              <div className="bg-white border-2 border-gray-400 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-200">
                      <tr>
                        <th 
                          className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => handleSort('raisonSociale')}
                        >
                          <div className="flex items-center space-x-2">
                            <span>Raison Sociale</span>
                            {sortField === 'raisonSociale' && (
                              <span className="text-blue-700 text-lg">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => handleSort('activite')}
                        >
                          <div className="flex items-center space-x-2">
                            <span>Activité</span>
                            {sortField === 'activite' && (
                              <span className="text-blue-700 text-lg">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          APE
                        </th>
                        <th className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Métiers
                        </th>
                        <th 
                          className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => handleSort('ville')}
                        >
                          <div className="flex items-center space-x-2">
                            <span>Ville</span>
                            {sortField === 'ville' && (
                              <span className="text-blue-700 text-lg">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Téléphone
                        </th>
                        <th className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Responsable
                        </th>
                        <th className="border-2 border-gray-400 px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {currentItems.map((entreprise, index) => (
                        <tr key={entreprise.id} className={`hover:bg-blue-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="border-2 border-gray-400 px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {entreprise.raisonSociale}
                            </div>
                            {entreprise.denominationCommerciale && entreprise.denominationCommerciale !== entreprise.raisonSociale && (
                              <div className="text-sm text-gray-600 italic">
                                {entreprise.denominationCommerciale}
                              </div>
                            )}
                          </td>
                        <td className="border-2 border-gray-400 px-4 py-3">
                          <div className="text-sm text-gray-900 max-w-sm truncate" title={entreprise.activite}>
                            {entreprise.activite}
                          </div>
                        </td>
                        <td className="border-2 border-gray-400 px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono font-semibold">
                            {entreprise.ape}
                          </div>
                        </td>
                        <td className="border-2 border-gray-400 px-4 py-3">
                          <div className="text-sm text-gray-900 max-w-sm truncate">
                            {entreprise.metiers || 'Non spécifié'}
                          </div>
                        </td>
                          <td className="border-2 border-gray-400 px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {entreprise.ville}
                            </div>
                            {entreprise.codePostal && (
                              <div className="text-sm text-gray-600">
                                {entreprise.codePostal}
                              </div>
                            )}
                          </td>
                          <td className="border-2 border-gray-400 px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 space-y-1">
                              {entreprise.telephoneFixe && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium">{entreprise.telephoneFixe}</span>
                                </div>
                              )}
                              {entreprise.telephonePortable && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium">{entreprise.telephonePortable}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="border-2 border-gray-400 px-4 py-3 whitespace-nowrap">
                            {entreprise.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-900 truncate max-w-32 font-medium" title={entreprise.email}>
                                  {entreprise.email}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="border-2 border-gray-400 px-4 py-3 whitespace-nowrap">
                            {(entreprise.nomResponsable || entreprise.prenomResponsable) && (
                              <div className="text-sm text-gray-900">
                                <div className="font-semibold">
                                  {entreprise.civiliteResponsable} {entreprise.prenomResponsable} {entreprise.nomResponsable}
                                </div>
                                {entreprise.fonctionResponsable && (
                                  <div className="text-gray-600 text-xs">
                                    {entreprise.fonctionResponsable}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="border-2 border-gray-400 px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex space-x-2 justify-center">
                              <button 
                                onClick={() => handleEdit(entreprise)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                                title="Modifier l'entreprise"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(entreprise)}
                                disabled={deletingId === entreprise.id}
                                className={`p-2 rounded-lg transition-all duration-200 border ${
                                  deletingId === entreprise.id 
                                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed' 
                                    : 'text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm'
                                }`}
                                title={deletingId === entreprise.id ? "Suppression en cours..." : "Supprimer l'entreprise"}
                              >
                                {deletingId === entreprise.id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-400 p-8 text-center">
                <div className="text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Aucune entreprise ne correspond à votre recherche.' : 'Aucune entreprise n\'a été chargée.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination intégrée au tableau */}
            {totalPages > 1 && (
              <div className="bg-white border-l-2 border-r-2 border-b-2 border-gray-400 px-4 py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-blue-600">{itemsPerPage}</span> <span className="font-medium text-blue-600">{currentPage}</span> <span className="font-medium text-blue-600">{filteredEntreprises.length}</span> / <span className="font-medium text-blue-600">{filteredEntreprises.length}</span>
                    </p>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Search className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Précédent
                      </button>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNumber
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 3 ||
                          pageNumber === currentPage + 3
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de modification */}
      {isEditModalOpen && (
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
                  className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/20"
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
                {/* Informations générales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Informations générales
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Raison Sociale *
                    </label>
                    <input
                      type="text"
                      value={editFormData.raisonSociale || ''}
                      onChange={(e) => handleFormChange('raisonSociale', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activité
                    </label>
                    <input
                      type="text"
                      value={editFormData.activite || ''}
                      onChange={(e) => handleFormChange('activite', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code APE
                    </label>
                    <input
                      type="text"
                      value={editFormData.ape || ''}
                      onChange={(e) => handleFormChange('ape', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SIRET
                    </label>
                    <input
                      type="text"
                      value={editFormData.siret || ''}
                      onChange={(e) => handleFormChange('siret', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Adresse
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse 1
                    </label>
                    <input
                      type="text"
                      value={editFormData.adresse1 || ''}
                      onChange={(e) => handleFormChange('adresse1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse 2
                    </label>
                    <input
                      type="text"
                      value={editFormData.adresse2 || ''}
                      onChange={(e) => handleFormChange('adresse2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        value={editFormData.codePostal || ''}
                        onChange={(e) => handleFormChange('codePostal', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={editFormData.ville || ''}
                        onChange={(e) => handleFormChange('ville', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={editFormData.pays || ''}
                      onChange={(e) => handleFormChange('pays', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Contact
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone Fixe
                    </label>
                    <input
                      type="tel"
                      value={editFormData.telephoneFixe || ''}
                      onChange={(e) => handleFormChange('telephoneFixe', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone Portable
                    </label>
                    <input
                      type="tel"
                      value={editFormData.telephonePortable || ''}
                      onChange={(e) => handleFormChange('telephonePortable', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Responsable */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Responsable
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Civilité
                    </label>
                    <select
                      value={editFormData.civiliteResponsable || ''}
                      onChange={(e) => handleFormChange('civiliteResponsable', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                      <option value="Mlle">Mlle</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={editFormData.prenomResponsable || ''}
                        onChange={(e) => handleFormChange('prenomResponsable', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={editFormData.nomResponsable || ''}
                        onChange={(e) => handleFormChange('nomResponsable', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fonction
                    </label>
                    <input
                      type="text"
                      value={editFormData.fonctionResponsable || ''}
                      onChange={(e) => handleFormChange('fonctionResponsable', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Responsable
                    </label>
                    <input
                      type="email"
                      value={editFormData.emailResponsable || ''}
                      onChange={(e) => handleFormChange('emailResponsable', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pied du modal */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
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
    </div>
  );
};

export default Entreprise;