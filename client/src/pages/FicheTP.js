import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Edit, Trash2, Eye, Printer, Copy } from 'lucide-react';
import TPSheetModal from '../components/TPSheetModal';
import axios from 'axios';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

// Icône Word inline
const WordIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="56" y="24" width="176" height="208" rx="16" fill="#185ABD"/>
    <rect x="24" y="56" width="128" height="144" rx="8" fill="#fff"/>
    <path fill="#185ABD" d="M60 170 L76 90 L96 150 L116 90 L132 170 L116 170 L104 122 L92 170 Z"/>
  </svg>
);

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

  // Dupliquer une fiche et l'insérer juste en dessous
  const handleDuplicateTPSheet = async (sheet) => {
    try {
      // Préparer le payload attendu par l'API (camelCase sur certains champs)
      const payload = {
        title: `${sheet.title || 'Fiche TP'} (copie)`,
        subtitle: sheet.subtitle || '',
        context: sheet.context || '',
        objectives: sheet.objectives || '',
        documents: sheet.documents || '',
        tasks: sheet.tasks || '',
        competencies: sheet.competencies || '',
        workRequired: sheet.work_required || sheet.workRequired || '',
        evaluation: sheet.evaluation || '',
        equipment: sheet.equipment || '',
        images: typeof sheet.images === 'string' ? sheet.images : JSON.stringify(sheet.images || {}),
        duration: sheet.duration || '',
        safety: sheet.safety || '',
        controlQuestions: sheet.control_questions || sheet.controlQuestions || '',
        observations: sheet.observations || '',
        imageZone: sheet.image_zone || sheet.imageZone || ''
      };
      const response = await axios.post('/api/tp-sheets', payload);
      const newSheet = response.data;
      // Insérer localement juste sous l'original sans re-trier par created_at
      setTpSheets((prev) => {
        const idx = prev.findIndex((s) => s.id === sheet.id);
        if (idx === -1) return [newSheet, ...prev];
        const next = prev.slice();
        next.splice(idx + 1, 0, newSheet);
        return next;
      });
    } catch (error) {
      console.error('❌ Erreur lors de la duplication de la fiche TP:', error);
      alert('Erreur lors de la duplication de la fiche TP');
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
    
    // Préparer HTML des critères en liste à puces si non formaté
    const evalRaw = (sheet.evaluation || '').toString();
    const evalHasList = /<(ul|ol)\b/i.test(evalRaw);
    const evalHtml = (() => {
      if (evalHasList) return evalRaw;
      const plain = evalRaw
        .replace(/<\/p>\s*<p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?p>/gi, '');
      const lines = plain.split(/\n+/).map(s => s.trim()).filter(Boolean);
      if (!lines.length) return '';
      return `<ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul>`;
    })();
    
    // Créer le contenu HTML propre pour l'impression
    const printHTML = `
      <html>
        <head>
          <title>Fiche TP - ${sheet.title || 'TP'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 10px;
              font-size: 22px;
              line-height: 1.65;
              color: #000;
              background: white;
            }
            
            /* Styles pour l'aperçu à l'écran et le gestionnaire Windows */
            @media screen {
              body {
                font-size: 20px;
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
              font-size: 16px;
              line-height: 1.2;
              font-weight: bold;
            }
            
            .page-info {
              text-align: right;
              font-size: 14px;
              line-height: 1.2;
            }
            
            /* Tailles de police optimisées pour le gestionnaire Windows */
            @media screen {
              .school-info {
                font-size: 20px;
              }
              .page-info {
                font-size: 18px;
              }
              .title-section h1 {
                font-size: 40px;
              }
              .title-section h2 {
                font-size: 30px;
              }
              .duration {
                font-size: 20px;
              }
              .section-header {
                font-size: 24px;
              }
              .section-content {
                font-size: 22px;
              }
              .footer {
                font-size: 18px;
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
              font-size: 36px; 
              font-weight: bold; 
              margin: 0 0 5px 0;
              text-transform: uppercase;
            }
            
            .title-section h2 { 
              font-size: 28px; 
              margin: 0 0 3px 0;
              font-weight: normal;
            }
            
            /* Durée */
            .duration {
              text-align: center;
              margin: 10px 0 15px 0;
              font-size: 20px;
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
              font-size: 22px;
              text-transform: uppercase;
            }
            
            .section-content { 
              padding: 8px; 
              border: 1px solid #000; 
              border-top: none;
              white-space: normal;
              font-size: 22px;
              line-height: 1.65;
              min-height: 32px;
            }
            .section-content ul { list-style: disc; padding-left: 18px; margin: 0; }
            .section-content ol { list-style: decimal; padding-left: 18px; margin: 0; }
            .section-content li { display: list-item; }
            
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
              /* Utiliser des unités physiques pour garantir la taille réelle (réduction forte) */
              body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                box-sizing: border-box;
                font-size: 11pt;
                line-height: 1.5;
              }
              /* Activer le saut de page à l'impression */
              .page-break {
                display: block;
                page-break-before: always;
                break-before: page;
              }
              .title-section h1 { font-size: 18pt; }
              .title-section h2 { font-size: 14pt; }
              .duration { font-size: 11pt; }
              .section-header { font-size: 13pt; }
              /* revenir à la précédente (x1 supplémentaire): contenu 16pt */
              .section-content { font-size: 16pt; line-height: 1.6; }
              .school-info { font-size: 10pt; }
              .page-info { font-size: 9pt; }
              /* Pas de transformation d'échelle pour éviter les effets de zoom du driver */
              #print-scale-wrapper { transform: none !important; width: auto !important; }
            }
          </style>
        </head>
        <body>
          <div id="print-scale-wrapper"><div class="print-container">
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

            <div class="page-break"></div>

            <!-- Section 7: Travail demandé -->
            <div class="section">
              <div class="section-header">7. Travail demandé</div>
              <div class="section-content">${sheet.work_required || sheet.workRequired || ''}</div>
            </div>

            <!-- Section 8: Évaluation -->
            <div class="section">
              <div class="section-header">8. Critères d'évaluation</div>
              <div class="section-content">${evalHtml}</div>
            </div>

            <!-- Section 9: Sécurité -->
            <div class="section">
              <div class="section-header">9. Consignes de sécurité</div>
              <div class="section-content">${sheet.safety || ''}</div>
            </div>

          </div></div>
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

  // Fonctions utilitaires pour l'export Word
  const stripHtml = (html = '') => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || '').replace(/\u00A0/g, ' ').trim();
  };

  const splitLines = (s = '') => String(s).split('\n').map(v => v.trim()).filter(Boolean);

  const schoolYear = () => {
    const d = new Date(), y = d.getFullYear(), m = d.getMonth() + 1;
    return m >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
  };

  // Convertir un texte en liste à puces pour Word (format tableau Docxtemplater)
  const formatAsBulletList = (text) => {
    if (!text) return [];
    const lines = splitLines(text);
    return lines.map(line => ({ text: line }));
  };

  // Convertir un texte en liste à puces simple (avec puces •)
  const formatAsBulletText = (text) => {
    if (!text) return '';
    const lines = splitLines(text);
    return lines.map(line => `• ${line}`).join('\n');
  };

  // Convertir un texte en liste numérotée pour Word (format tableau Docxtemplater)
  const formatAsNumberedList = (text) => {
    if (!text) return [];
    
    // Créer un élément DOM temporaire pour parser le HTML
    const div = document.createElement('div');
    div.innerHTML = text;
    
    // Fonction pour retirer les numéros existants
    const removeExistingNumber = (text) => {
      const numPattern = /^\d+\.\s*/;
      return numPattern.test(text) ? text.replace(numPattern, '').trim() : text;
    };
    
    // Extraire les éléments de liste <li> s'ils existent (priorité)
    const listItems = div.querySelectorAll('ol li, ul li');
    if (listItems.length > 0) {
      return Array.from(listItems)
        .map((li, index) => {
          let text = li.textContent.trim();
          if (text) {
            text = removeExistingNumber(text);
            return { 
              num: index + 1,
              text: text 
            };
          }
          return null;
        })
        .filter(item => item !== null);
    }
    
    // Extraire les paragraphes <p> s'ils existent
    const paragraphs = div.querySelectorAll('p');
    if (paragraphs.length > 0) {
      return Array.from(paragraphs)
        .map((p, index) => {
          let text = p.textContent.trim();
          if (text) {
            text = removeExistingNumber(text);
            return { 
              num: index + 1,
              text: text 
            };
          }
          return null;
        })
        .filter(item => item !== null);
    }
    
    // Si pas de structure HTML, extraire le texte brut et séparer par lignes
    const plainText = stripHtml(text);
    const lines = plainText.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return lines.map((line, index) => {
      const cleanLine = removeExistingNumber(line);
      return { 
        num: index + 1,
        text: cleanLine 
      };
    });
  };

  // Convertir un texte en liste numérotée simple (texte avec numéros) - une phrase par ligne et numérotée
  const formatAsNumberedText = (text) => {
    if (!text) return '';
    
    // Créer un élément DOM temporaire pour parser le HTML
    const div = document.createElement('div');
    div.innerHTML = text;
    
    // Extraire les éléments de liste <li> s'ils existent (priorité)
    const listItems = div.querySelectorAll('ol li, ul li');
    if (listItems.length > 0) {
      const result = [];
      Array.from(listItems).forEach((li, index) => {
        // Extraire le texte de l'élément de liste
        let text = li.textContent.trim();
        
        // Si l'élément contient des paragraphes, les traiter séparément
        const paragraphs = li.querySelectorAll('p');
        if (paragraphs.length > 0) {
          paragraphs.forEach((p, pIndex) => {
            let pText = p.textContent.trim();
            if (pText) {
              const numPattern = /^\d+\.\s*/;
              if (numPattern.test(pText)) {
                pText = pText.replace(numPattern, '').trim();
              }
              result.push(`${result.length + 1}. ${pText}`);
            }
          });
        } else if (text) {
          // Vérifier si le texte commence déjà par un numéro (format "1. ", "2. ", etc.)
          const numPattern = /^\d+\.\s*/;
          if (numPattern.test(text)) {
            text = text.replace(numPattern, '').trim();
          }
          // Séparer par points suivis d'une majuscule (phrases)
          // Pattern amélioré: point suivi d'espace(s) optionnel(s) et majuscule
          const sentences = text.split(/\.\s*(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/);
          
          if (sentences.length > 1) {
            sentences.forEach((sentence) => {
              let cleanSentence = sentence.trim();
              // Ajouter le point si la phrase ne se termine pas par un point
              if (cleanSentence && !cleanSentence.endsWith('.')) {
                cleanSentence += '.';
              }
              if (cleanSentence && cleanSentence.length > 0) {
                result.push(`${result.length + 1}. ${cleanSentence}`);
              }
            });
          } else {
            // Si une seule phrase, vérifier s'il y a des points sans espace après
            const altSentences = text.split(/\.(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/);
            if (altSentences.length > 1) {
              altSentences.forEach((sentence) => {
                let cleanSentence = sentence.trim();
                if (cleanSentence && !cleanSentence.endsWith('.')) {
                  cleanSentence += '.';
                }
                if (cleanSentence && cleanSentence.length > 0) {
                  result.push(`${result.length + 1}. ${cleanSentence}`);
                }
              });
            } else {
              result.push(`${result.length + 1}. ${text}`);
            }
          }
        }
      });
      return result.join('\r\n'); // Utiliser \r\n pour Word
    }
    
    // Extraire les paragraphes <p> s'ils existent - chaque paragraphe = une phrase
    const paragraphs = div.querySelectorAll('p');
    if (paragraphs.length > 0) {
      const result = [];
      Array.from(paragraphs).forEach((p) => {
        let text = p.textContent.trim();
        if (text) {
          // Vérifier si le texte commence déjà par un numéro (format "1. ", "2. ", etc.)
          const numPattern = /^\d+\.\s*/;
          if (numPattern.test(text)) {
            text = text.replace(numPattern, '').trim();
          }
          // Séparer par points suivis d'une majuscule (phrases)
          const sentences = text.split(/\.\s*(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/);
          
          if (sentences.length > 1) {
            sentences.forEach((sentence) => {
              let cleanSentence = sentence.trim();
              if (cleanSentence && !cleanSentence.endsWith('.')) {
                cleanSentence += '.';
              }
              if (cleanSentence && cleanSentence.length > 0) {
                result.push(`${result.length + 1}. ${cleanSentence}`);
              }
            });
          } else {
            // Si une seule phrase, vérifier s'il y a des points sans espace après
            const altSentences = text.split(/\.(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/);
            if (altSentences.length > 1) {
              altSentences.forEach((sentence) => {
                let cleanSentence = sentence.trim();
                if (cleanSentence && !cleanSentence.endsWith('.')) {
                  cleanSentence += '.';
                }
                if (cleanSentence && cleanSentence.length > 0) {
                  result.push(`${result.length + 1}. ${cleanSentence}`);
                }
              });
            } else {
              result.push(`${result.length + 1}. ${text}`);
            }
          }
        }
      });
      return result.join('\r\n'); // Utiliser \r\n pour Word
    }
    
    // Si pas de structure HTML, extraire le texte brut
    const plainText = stripHtml(text);
    
    // Séparer par retours à la ligne d'abord
    let lines = plainText.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Si une seule ligne ou plusieurs lignes, séparer par points suivis d'espaces (phrases)
    if (lines.length > 0) {
      const allSentences = [];
      lines.forEach(line => {
        // Séparer par points suivis d'une majuscule (avec ou sans espace)
        // Pattern amélioré: point suivi d'espace(s) optionnel(s) et majuscule
        let sentences = line.split(/\.\s*(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/);
        
        // Si aucune séparation, essayer avec point directement suivi de majuscule
        if (sentences.length === 1) {
          sentences = line.split(/\.(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/);
        }
        
        sentences.forEach((sentence) => {
          let cleanSentence = sentence.trim();
          // Ajouter le point si la phrase ne se termine pas par un point
          if (cleanSentence && !cleanSentence.endsWith('.')) {
            cleanSentence += '.';
          }
          if (cleanSentence && cleanSentence.length > 0) {
            allSentences.push(cleanSentence);
          }
        });
      });
      
      if (allSentences.length > 0) {
        // Numéroter chaque phrase
        return allSentences.map((sentence, index) => {
          let cleanSentence = sentence.trim();
          // Vérifier si la phrase commence déjà par un numéro
          const numPattern = /^\d+\.\s*/;
          if (numPattern.test(cleanSentence)) {
            cleanSentence = cleanSentence.replace(numPattern, '').trim();
          }
          return `${index + 1}. ${cleanSentence}`;
        }).join('\r\n');
      }
    }
    
    if (lines.length === 0) return '';
    
    // Fallback: numéroter chaque ligne
    return lines.map((line, index) => {
      let cleanLine = line.trim();
      const numPattern = /^\d+\.\s*/;
      if (numPattern.test(cleanLine)) {
        cleanLine = cleanLine.replace(numPattern, '').trim();
      }
      return `${index + 1}. ${cleanLine}`;
    }).join('\r\n'); // Utiliser \r\n pour Word (retour à la ligne Windows)
  };

  const buildTemplateData = (sheet = {}) => {
    const evaluationText = sheet.evaluation || '';
    
    // Extraire le numéro de TP du titre si présent (ex: "TP 1" ou "TP1" ou "TP dépannage 2")
    const extractTPNumber = (title) => {
      if (!title) return '';
      const match = title.match(/TP\s*(\d+)/i) || title.match(/(\d+)/);
      return match ? match[1] : '';
    };
    
    // Matière par défaut
    const defaultMatiere = 'ANALYSE DIAGNOSTIC ET MAINTENANCE';
    
    return {
      titre: sheet.title || '',
      sous_titre: sheet.subtitle || '',
      matiere: defaultMatiere, // Matière fixe pour BTS Électrotechnique
      numero_tp: extractTPNumber(sheet.title || '') || (sheet.id ? `TP ${sheet.id}` : ''),
      intitule_tp: sheet.title || '',
      duree: sheet.duration || '4 heures',
      nom_etudiant: '', // Non disponible dans la base de données
      prenom_etudiant: '', // Non disponible dans la base de données
      classe_etudiant: '', // Non disponible dans la base de données
      contexte: stripHtml(sheet.context || ''),
      objectifs: stripHtml(sheet.objectives || ''),
      // Format liste à puces pour les rubriques qui le nécessitent (texte simple)
      documents_texte: formatAsBulletText(sheet.documents || ''),
      equipements_texte: formatAsBulletText(sheet.equipment || ''),
      taches_texte: formatAsBulletText(sheet.tasks || ''),
      competences_texte: formatAsBulletText(sheet.competencies || ''),
      // Format liste numérotée pour le travail demandé - format texte avec numéros
      travail_demande_texte: formatAsNumberedText(sheet.work_required || sheet.workRequired || ''),
      criteres_evaluation_texte: formatAsBulletText(stripHtml(evaluationText)),
      // Format liste numérotée pour les consignes de sécurité - format texte avec numéros
      securite_texte: formatAsNumberedText(sheet.safety || ''),
      questions_controle: formatAsBulletText(sheet.control_questions || sheet.controlQuestions || ''),
      observations: sheet.observations || '',
      date_du_jour: new Date().toLocaleDateString('fr-FR'),
      annee_scolaire: schoolYear(),
      // Tableaux pour Docxtemplater (format liste à puces)
      documents: formatAsBulletList(sheet.documents || ''),
      equipements: formatAsBulletList(sheet.equipment || ''),
      taches: formatAsBulletList(sheet.tasks || ''),
      competences: formatAsBulletList(sheet.competencies || ''),
      criteres_evaluation: formatAsBulletList(stripHtml(evaluationText)),
      // Tableaux pour liste numérotée (travail demandé et consignes de sécurité)
      travail_demande: formatAsNumberedList(sheet.work_required || sheet.workRequired || ''),
      securite: formatAsNumberedList(sheet.safety || ''),
    };
  };

  const handleExportWord = async (sheet) => {
    try {
      console.log('📄 Export Word de la fiche:', sheet.title);
      
      // Charger le gabarit Word
      const res = await fetch('/Gabarit_tp.docx');
      if (!res.ok) {
        throw new Error(`Le fichier Gabarit_tp.docx est introuvable dans client/public/\n\nVeuillez placer votre gabarit d'origine dans :\nclient/public/Gabarit_tp.docx`);
      }
      
      const buf = await res.arrayBuffer();
      
      // Vérifier que le fichier n'est pas vide
      if (buf.byteLength === 0) {
        throw new Error('Le fichier Gabarit_tp.docx est vide ou corrompu');
      }
      
      // Vérifier la taille minimale (un fichier Word valide fait au moins quelques KB)
      if (buf.byteLength < 1000) {
        throw new Error('Le fichier Gabarit_tp.docx semble trop petit et pourrait être corrompu');
      }
      
      console.log('📦 Taille du gabarit:', buf.byteLength, 'bytes');
      
      let zip;
      try {
        zip = new PizZip(buf);
      } catch (zipError) {
        throw new Error('Le fichier Gabarit_tp.docx est corrompu ou n\'est pas un fichier Word valide. Veuillez le rouvrir et le sauvegarder avec Microsoft Word.');
      }
      
      const doc = new Docxtemplater(zip, { 
        paragraphLoop: true, 
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        },
        nullGetter: (part) => {
          // Si une variable n'est pas trouvée, retourner une chaîne vide au lieu de générer une erreur
          console.warn(`⚠️ Variable non trouvée: ${part.module} ${part.value}`);
          return '';
        }
      });
      
      // Remplir avec les données de la fiche
      const data = buildTemplateData(sheet);
      console.log('📝 Données pour le modèle:', data);
      console.log('📋 Variables disponibles:', Object.keys(data).join(', '));
      
      try {
        doc.setData(data);
        doc.render();
      } catch (renderError) {
        console.error('❌ Erreur lors du rendu:', renderError);
        // Afficher des détails sur l'erreur
        if (renderError.properties && renderError.properties.errors) {
          const errors = renderError.properties.errors.map(e => {
            const varName = e.properties?.xtag || e.properties?.context || 'inconnue';
            return `- ${e.name}: ${e.message}\n  Variable: ${varName}\n  Fichier: ${e.properties?.file || 'inconnu'}`;
          }).join('\n\n');
          throw new Error(`Erreur dans le gabarit Word:\n\n${errors}\n\n💡 Vérifiez que les variables dans votre gabarit sont au format {{nom_variable}} (avec doubles accolades)`);
        }
        throw renderError;
      }
      
      // Créer le fichier blob
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE'
      });
      
      // Télécharger le fichier avec possibilité de choisir l'emplacement
      const name = (sheet.title || 'Fiche TP').replace(/[\\/:*?"<>|]/g, '_');
      const fileName = `${name}.docx`;
      
      // Essayer d'abord avec l'API File System Access (Chrome, Edge moderne)
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'Document Word',
              accept: {
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
              }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(out);
          await writable.close();
          
          console.log('✅ Document Word enregistré avec succès via File System Access API');
          alert(`✅ Document Word "${fileName}" enregistré avec succès !`);
          return;
        } catch (error) {
          // Si l'utilisateur annule ou erreur, continuer avec la méthode de fallback
          if (error.name !== 'AbortError') {
            console.warn('⚠️ Erreur File System Access API:', error);
          }
        }
      }
      
      // Fallback: utiliser saveAs qui devrait ouvrir la boîte de dialogue
      try {
        saveAs(out, fileName);
        console.log('✅ Document Word généré avec succès');
        // Laisser l'utilisateur interagir avec la boîte de dialogue
      } catch (saveError) {
        // Dernier fallback: créer un lien de téléchargement
        console.warn('⚠️ saveAs a échoué, utilisation du fallback:', saveError);
        const url = URL.createObjectURL(out);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        alert(`✅ Document Word "${fileName}" prêt à être téléchargé !\n\nSi la boîte de dialogue ne s'ouvre pas, vérifiez les paramètres de téléchargement de votre navigateur.`);
      }
    } catch (e) {
      console.error('❌ Erreur génération Word:', e);
      const errorMsg = e.message || 'Erreur inconnue lors de la génération du document Word';
      alert('❌ Erreur lors de la génération du document Word:\n\n' + errorMsg + '\n\n💡 Vérifiez que :\n- Le fichier Gabarit_tp.docx existe dans client/public/\n- Le fichier n\'est pas corrompu\n- Les variables dans le gabarit sont au format {nom_variable}');
    }
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
                              onClick={() => handleExportWord(sheet)}
                              className="p-2 text-[#185ABD] hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                              title="Exporter en Word (.docx)"
                            >
                              <WordIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateTPSheet(sheet)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors border border-indigo-200"
                              title="Dupliquer"
                            >
                              <Copy className="h-5 w-5" />
                            </button>
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
