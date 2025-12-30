import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Edit, Trash2, Eye, Printer } from 'lucide-react';
import TPSheetModal from '../components/TPSheetModal';
import axios from 'axios';

const FicheTP = () => {
  const [showTPSheetModal, setShowTPSheetModal] = useState(false);
  const [tpSheets, setTpSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSheet, setEditingSheet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [renamingSheet, setRenamingSheet] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Charger les fiches TP au montage du composant
  useEffect(() => {
    fetchTPSheets();
  }, []);

  const fetchTPSheets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tp-sheets');
      console.log('📥 Fiches TP récupérées:', response.data);
      setTpSheets(response.data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des fiches TP:', error);
      setTpSheets([]); // S'assurer que la liste est vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTPSheet = () => {
    console.log('🖱️ Bouton Créer une fiche TP cliqué');
    setEditingSheet(null);
    setShowTPSheetModal(true);
    console.log('📝 showTPSheetModal défini à true');
  };

  const handleEditTPSheet = (sheet) => {
    console.log('✏️ Édition de la fiche TP:', sheet);
    setEditingSheet(sheet);
    setShowTPSheetModal(true);
  };

  const handleSaveTPSheet = async (content) => {
    try {
      console.log('💾 Sauvegarde de la fiche TP:', content);
      
      // Préparer les données à sauvegarder - n'envoyer que les champs attendus par le backend
      const dataToSave = {
        title: content.sheetName || content.title || 'Fiche TP sans nom',
        subtitle: content.subtitle || '',
        context: content.context || '',
        objectives: content.objectives || '',
        documents: content.documents || '',
        tasks: content.tasks || '',
        competencies: content.competencies || '',
        workRequired: content.workRequired || '',
        evaluation: content.evaluation || '',
        equipment: content.equipment || '',
        images: JSON.stringify(content.images || {}),
        duration: content.duration || '',
        safety: content.safety || '',
        controlQuestions: content.controlQuestions || '',
        observations: content.observations || '',
        imageZone: content.imageZone || ''
      };
      
      let savedSheet;
      if (editingSheet) {
        // Mise à jour d'une fiche existante
        const response = await axios.put(`/api/tp-sheets/${editingSheet.id}`, dataToSave);
        savedSheet = response.data;
        console.log('✅ Fiche TP mise à jour:', savedSheet);
      } else {
        // Création d'une nouvelle fiche
        const response = await axios.post('/api/tp-sheets', dataToSave);
        savedSheet = response.data;
        console.log('✅ Fiche TP créée:', savedSheet);
      }
      
      // Fermer la modal
      setShowTPSheetModal(false);
      setEditingSheet(null);
      
      // Attendre un court délai pour s'assurer que la base de données est mise à jour
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Recharger la liste des fiches
      await fetchTPSheets();
      
      console.log('📋 Liste des fiches rechargée');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la fiche TP: ' + error.message);
    }
  };

  const handleDeleteTPSheet = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette fiche TP ?')) {
      return;
    }

    try {
      await axios.delete(`/api/tp-sheets/${id}`);
      alert('Fiche TP supprimée avec succès !');
      await fetchTPSheets();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la fiche TP');
    }
  };

  // Fonctions pour le renommage
  const handleStartRename = (sheet) => {
    setRenamingSheet(sheet.id);
    setNewTitle(sheet.title || '');
  };

  const handleSaveRename = async (sheetId) => {
    if (newTitle.trim()) {
      try {
        await axios.put(`/api/tp-sheets/${sheetId}`, {
          title: newTitle.trim()
        });
        fetchTPSheets(); // Recharger la liste
        setRenamingSheet(null);
        setNewTitle('');
      } catch (error) {
        console.error('Erreur lors du renommage:', error);
        alert('Erreur lors du renommage de la fiche TP');
      }
    } else {
      alert('Le nom ne peut pas être vide');
    }
  };

  const handleCancelRename = () => {
    setRenamingSheet(null);
    setNewTitle('');
  };

  const handlePrintTPSheet = (sheet) => {
    console.log('🖨️ Impression de la fiche TP:', sheet);
    
    // Créer une nouvelle fenêtre pour l'impression avec taille optimisée pour le gestionnaire Windows
    const printWindow = window.open('', '_blank', 'width=1024,height=768,toolbar=no,menubar=no,location=no,status=no,scrollbars=yes');
    
    // Créer le contenu HTML propre pour l'impression
    const printHTML = `
      <html>
        <head>
          <title>Fiche TP - ${sheet.title || 'TP'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 10px;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: white;
            }
            
            /* Styles pour l'aperçu à l'écran et le gestionnaire Windows */
            @media screen {
              body {
                font-size: 13px;
                padding: 15px;
                background: white;
                margin: 0;
              }
              .print-container {
                background: white;
                padding: 15px;
                max-width: 210mm;
                margin: 0 auto;
              }
            }
            
            .print-container {
              max-width: 100%;
              margin: 0 auto;
            }
            
            /* En-tête simple */
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 15px;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .school-info {
              font-size: 10px;
              line-height: 1.2;
              font-weight: bold;
            }
            
            .page-info {
              text-align: right;
              font-size: 9px;
              line-height: 1.2;
            }
            
            /* Tailles de police optimisées pour le gestionnaire Windows */
            @media screen {
              .school-info {
                font-size: 12px;
              }
              .page-info {
                font-size: 11px;
              }
              .title-section h1 {
                font-size: 20px;
              }
              .title-section h2 {
                font-size: 16px;
              }
              .duration {
                font-size: 12px;
              }
              .section-header {
                font-size: 12px;
              }
              .section-content {
                font-size: 12px;
              }
              .footer {
                font-size: 11px;
              }
            }
            
            /* Titre principal simple */
            .title-section { 
              text-align: center; 
              margin: 15px 0 20px 0;
              border: 2px solid #000;
              padding: 10px;
            }
            
            .title-section h1 { 
              font-size: 16px; 
              font-weight: bold; 
              margin: 0 0 5px 0;
              text-transform: uppercase;
            }
            
            .title-section h2 { 
              font-size: 13px; 
              margin: 0 0 3px 0;
              font-weight: normal;
            }
            
            /* Durée */
            .duration {
              text-align: center;
              margin: 10px 0 15px 0;
              font-size: 10px;
              font-weight: bold;
            }
            
            /* Sections avec rectangles simples */
            .section { 
              margin-bottom: 8px;
            }
            
            .section-header { 
              background: #000; 
              color: white; 
              padding: 4px 8px; 
              font-weight: bold; 
              font-size: 10px;
              text-transform: uppercase;
            }
            
            .section-content { 
              padding: 8px; 
              border: 1px solid #000; 
              border-top: none;
              white-space: pre-line;
              font-size: 10px;
              line-height: 1.3;
              min-height: 20px;
            }
            
            /* Zone d'image */
            .image-section {
              border: 1px solid #000;
              padding: 10px;
              text-align: center;
              margin: 8px 0;
            }
            
            .image-section img {
              max-width: 100%;
              height: auto;
              border: 1px solid #ccc;
            }
            
            
            /* Pas de saut de page */
            .page-break {
              display: none;
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <!-- En-tête -->
            <div class="header">
              <div class="logo-section">
                <img src="/logo patu.png" alt="Logo PATU" style="width: 35px; height: 35px; object-fit: contain;" />
                <div class="school-info">
                  <div>Lycée PATU de Rosemont - SAINT-BENOÎT</div>
                  <div>BTS Électrotechnique</div>
                </div>
              </div>
              <div class="page-info">
                <div>Année scolaire : 2024-2025</div>
                <div>Date : ${new Date().toLocaleDateString('fr-FR')}</div>
              </div>
            </div>

            <!-- Titre principal -->
            <div class="title-section">
              <h1>${sheet.title || 'BTS ELECTROTECHNIQUE'}</h1>
              <h2>${sheet.subject || 'ANALYSE DIAGNOSTIC ET MAINTENANCE'}</h2>
            </div>

            <!-- Durée -->
            <div class="duration">
              <strong>Durée du TP : ${sheet.duration || '4 heures'}</strong>
            </div>

            <!-- Section 1: Contexte -->
            <div class="section">
              <div class="section-header">1. Contexte de l'intervention</div>
              <div class="section-content">${sheet.context || ''}</div>
            </div>

            <!-- Section 2: Objectifs -->
            <div class="section">
              <div class="section-header">2. Objectifs pédagogiques</div>
              <div class="section-content">${sheet.objectives || ''}</div>
            </div>

            <!-- Section 3: Documents -->
            <div class="section">
              <div class="section-header">3. Documents fournis</div>
              <div class="section-content">${sheet.documents || ''}</div>
            </div>

            <!-- Section 4: Matériel -->
            <div class="section">
              <div class="section-header">4. Matériel et équipements</div>
              <div class="section-content">${sheet.equipment || ''}</div>
            </div>

            <!-- Section 5: Tâches -->
            <div class="section">
              <div class="section-header">5. Tâches à réaliser</div>
              <div class="section-content">${sheet.tasks || ''}</div>
            </div>

            <!-- Section 6: Compétences -->
            <div class="section">
              <div class="section-header">6. Compétences évaluées</div>
              <div class="section-content">${sheet.competencies || ''}</div>
            </div>

            <!-- Zone d'image -->
            ${sheet.imageZone ? `
            <div class="image-section">
              ${sheet.imageZone}
            </div>
            ` : ''}

            <!-- Section 7: Travail demandé -->
            <div class="section">
              <div class="section-header">7. Travail demandé</div>
              <div class="section-content">${sheet.work_required || sheet.workRequired || ''}</div>
            </div>

            <!-- Section 8: Évaluation -->
            <div class="section">
              <div class="section-header">8. Critères d'évaluation</div>
              <div class="section-content">${sheet.evaluation || ''}</div>
            </div>

            <!-- Section 9: Sécurité -->
            <div class="section">
              <div class="section-header">9. Consignes de sécurité</div>
              <div class="section-content">${sheet.safety || ''}</div>
            </div>

          </div>
        </body>
      </html>
    `;
    
    // Écrire le contenu dans la fenêtre
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis ouvrir directement le gestionnaire d'impression
    printWindow.onload = () => {
      // Donner un titre à la fenêtre
      printWindow.document.title = `${sheet.title || 'Fiche TP'} - Aperçu d'impression`;
      
      // Attendre un court délai pour s'assurer que le contenu est bien chargé
      setTimeout(() => {
        // Ouvrir directement le gestionnaire d'impression Windows
        printWindow.print();
      }, 500);
    };
  };

  // Filtrer les fiches TP selon le terme de recherche
  const filteredTPSheets = tpSheets.filter(sheet =>
    sheet.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.tpTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 mr-3 text-blue-600" />
                Fiche TP
              </h1>
              <p className="mt-2 text-gray-600">
                Gestion des fiches de travaux pratiques
              </p>
            </div>
            <button 
              onClick={handleCreateTPSheet}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle fiche TP
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher une fiche TP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Toutes les classes</option>
                <option value="STS ELEC1">STS ELEC1</option>
                <option value="STS ELEC2">STS ELEC2</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les types</option>
                <option value="TP">TP</option>
                <option value="TD">TD</option>
                <option value="Projet">Projet</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Chargement des fiches TP...</p>
              </div>
            ) : filteredTPSheets.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucune fiche TP trouvée' : 'Aucune fiche TP créée'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Aucune fiche ne correspond à votre recherche.' 
                    : 'Commencez par créer votre première fiche de travaux pratiques.'
                  }
                </p>
                {!searchTerm && (
                  <button 
                    onClick={handleCreateTPSheet}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une fiche TP
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {filteredTPSheets.length} fiche{filteredTPSheets.length > 1 ? 's' : ''} TP
                  </h3>
                </div>
                
                <div className="grid gap-4">
                  {filteredTPSheets.map((sheet) => (
                    <div key={sheet.id} className="border border-gray-200 rounded-lg hover:shadow-lg transition-all bg-white overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {renamingSheet === sheet.id ? (
                              <div className="mb-2">
                                <input
                                  type="text"
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveRename(sheet.id);
                                    } else if (e.key === 'Escape') {
                                      handleCancelRename();
                                    }
                                  }}
                                  onBlur={() => handleSaveRename(sheet.id)}
                                  className="text-lg font-medium text-gray-900 bg-white border-2 border-blue-500 rounded px-2 py-1 w-full"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <h4 
                                className="text-lg font-bold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 hover:bg-blue-50 rounded px-2 py-1 transition-colors inline-block"
                                onDoubleClick={() => handleStartRename(sheet)}
                                title="Double-cliquez pour renommer"
                              >
                                📋 {sheet.title}
                              </h4>
                            )}
                            
                            {/* Badges et métadonnées */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {sheet.duration && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  ⏱️ {sheet.duration}
                                </span>
                              )}
                              {sheet.competencies && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Compétences définies
                                </span>
                              )}
                              {sheet.equipment && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  🔧 Matériel listé
                                </span>
                              )}
                              {sheet.evaluation && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  📊 Critères d'évaluation
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {sheet.subtitle && (
                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                                  <span className="font-semibold">📌 Sujet :</span> {sheet.subtitle}
                                </p>
                              )}
                              {sheet.context && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  <span className="font-medium">Contexte :</span> {sheet.context.substring(0, 150)}{sheet.context.length > 150 ? '...' : ''}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  <span className="font-medium">📅 Créée le :</span> {new Date(sheet.created_at).toLocaleDateString('fr-FR')} à {new Date(sheet.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                                </p>
                                {sheet.updated_at && sheet.updated_at !== sheet.created_at && (
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium">✏️ Modifiée :</span> {new Date(sheet.updated_at).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Boutons d'actions */}
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handlePrintTPSheet(sheet)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors border border-green-200"
                              title="Imprimer"
                            >
                              <Printer className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditTPSheet(sheet)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                              title="Modifier"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTPSheet(sheet.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques et informations */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Total de fiches</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{tpSheets.length}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 uppercase tracking-wide">✅ Fonctionnalités</p>
                <ul className="mt-2 text-xs text-green-800 space-y-1">
                  <li>✓ Création et édition de fiches</li>
                  <li>✓ Objectifs pédagogiques</li>
                  <li>✓ Matériel nécessaire</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Plus de fonctions</p>
                <ul className="mt-2 text-xs text-purple-800 space-y-1">
                  <li>✓ Procédures détaillées</li>
                  <li>✓ Critères d'évaluation</li>
                  <li>✓ Impression PDF</li>
                </ul>
              </div>
              <Printer className="h-12 w-12 text-purple-300" />
            </div>
          </div>
        </div>

        

        {/* Modal Fiche TP */}
        <TPSheetModal
          isOpen={showTPSheetModal}
          onClose={() => {
            setShowTPSheetModal(false);
            setEditingSheet(null);
          }}
          onSave={handleSaveTPSheet}
          editingSheet={editingSheet}
        />
      </div>
    </div>
  );
};

export default FicheTP;
