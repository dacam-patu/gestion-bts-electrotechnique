import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Download, Printer, Eye, CheckSquare, ListChecks, Wrench, FileText } from 'lucide-react';
import { COMPETENCE_CRITERIA } from '../data/competenceCriteria';

const TPSheetModal = ({ isOpen, onClose, onSave, editingSheet }) => {
  console.log('🔍 TPSheetModal render - isOpen:', isOpen);
  
  const [content, setContent] = useState({
    title: 'BTS ELECTROTECHNIQUE',
    subject: 'ÉLECTROTECHNIQUE',
    tpNumber: 'TP N°',
    tpTitle: 'ANALYSE DIAGNOSTIC ET MAINTENANCE',
    subtitle: 'Intervention sur armoire de commande électrique',
    studentName: '',
    studentFirstName: '',
    studentClass: '',
    context: '',
    objectives: '',
    documents: '',
    equipment: '',
    tasks: '',
    competencies: '',
    workRequired: '',
    evaluation: '',
    duration: '4 heures',
    safety: 'Respect strict des consignes de sécurité électrique - Port des EPI obligatoire',
  });

  const [showNameModal, setShowNameModal] = useState(false);
  const [sheetName, setSheetName] = useState('');
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  // Séparer les compétences ajoutées automatiquement (via tâches) et celles ajoutées manuellement
  const [autoCompetencies, setAutoCompetencies] = useState([]);
  const [manualCompetencies, setManualCompetencies] = useState([]);
  // Liste des compétences auto que l'utilisateur a explicitement retirées
  const [excludedAutoCompetencies, setExcludedAutoCompetencies] = useState([]);
  const [showCompetenciesModal, setShowCompetenciesModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [customEquipment, setCustomEquipment] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [customDocument, setCustomDocument] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  // Critères d'évaluation
  const [autoCriteria, setAutoCriteria] = useState([]);
  const [manualCriteria, setManualCriteria] = useState([]);
  const [excludedAutoCriteria, setExcludedAutoCriteria] = useState([]);
  const [customCriterion, setCustomCriterion] = useState('');

  // Référentiel - Liste des tâches (mêmes libellés que Référentiel > Liste des tâches)
  const ALL_TASKS = [
    'T 1.1 : analyser et/ou élaborer les documents relatifs aux besoins du client/utilisateur',
    'T 1.2 : élaborer un avant-projet/chantier (ou avant-projet sommaire)',
    'T 1.3 : dimensionner les constituants de l’installation',
    'T 1.4 : définir les coûts pour préparer une offre commerciale',
    'T 2.1 : choisir les matériels',
    'T 2.2 : réaliser les documents techniques du projet/chantier',
    'T 3.1 : proposer un protocole pour analyser le fonctionnement et/ou le comportement de l’installation',
    'T 3.2 : mesurer et contrôler l’installation, exploiter les mesures pour faire le diagnostic',
    'T 3.3 : formuler des préconisations',
    'T 4.1 : organiser la maintenance',
    'T 4.2 : réaliser la maintenance préventive ou prévisionnelle',
    'T 4.3 : réaliser la maintenance corrective',
    'T 5.1 : s’approprier et vérifier les informations relatives au projet/chantier',
    'T 5.2 : planifier les étapes du projet/chantier',
    'T 5.3 : assurer le suivi de la réalisation du projet/chantier (coûts, délais, qualité)',
    'T 5.4 : faire appliquer les règles liées à la santé, la sécurité et l’environnement',
    'T 5.5 : gérer et animer l’équipe projet/chantier',
    'T 6.1 : organiser l’espace de travail',
    'T 6.2 : implanter, poser, installer, câbler, raccorder les matériels électriques',
    'T 6.3 : programmer les applications métiers',
    'T 7.1 : réaliser les contrôles, les configurations, les essais fonctionnels',
    'T 7.2 : vérifier le fonctionnement de l’installation',
    'T 7.3 : réceptionner l’installation avec le client/utilisateur',
    'T 8.1 : constituer et mettre à jour les dossiers du projet/chantier',
    'T 8.2 : échanger, y compris en langue anglaise, avec les parties prenantes du projet/chantier',
    'T 8.3 : expliquer, y compris en langue anglaise, le fonctionnement de l’installation et former le client/utilisateur à son utilisation',
    'T 8.4 : préparer et animer des réunions',
    'T 8.5 : présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur'
  ];

  // Référentiel - Liste complète des compétences (C1..C18)
  const COMPETENCE_LABELS = {
    'C1': 'recenser et prendre en compte les normes, les réglementations applicables au projet/chantier',
    'C2': 'extraire les informations nécessaires à la réalisation des tâches',
    'C3': 'gérer les risques et les aléas liés à la réalisation des tâches',
    'C4': 'communiquer de manière adaptée à l\'oral, à l\'écrit, y compris en langue anglaise',
    'C5': 'interpréter un besoin client/utilisateur, un CCTP, un cahier des charges',
    'C6': 'modéliser le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique',
    'C7': 'simuler le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique',
    'C8': 'dimensionner les constituants d’un ouvrage, d’une installation, d’un équipement électrique',
    'C9': 'choisir les constituants d’un ouvrage, d’une installation, d’un équipement électrique',
    'C10': 'proposer l’architecture d’un ouvrage, d’une installation, d’un équipement électrique',
    'C11': 'réaliser les documents du projet/chantier (plans, schémas, maquette virtuelle, etc.)',
    'C12': 'gérer et conduire (y compris avec les documents de : organisation, planification, suivi, pilotage, réception, etc.) le projet/chantier',
    'C13': 'mesurer les grandeurs caractéristiques d’un ouvrage, d’une installation, d’un équipement électrique',
    'C14': 'réaliser un ouvrage, une installation, un équipement électrique',
    'C15': 'configurer et programmer les matériels dans le cadre du projet/chantier',
    'C16': 'appliquer un protocole pour mettre en service un ouvrage, une installation, un équipement électrique',
    'C17': 'réaliser un diagnostic de performance y compris énergétique, de sécurité, d’un ouvrage, d’une installation, d’un équipement électrique',
    'C18': 'réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique'
  };
  const ALL_COMPETENCIES = Object.entries(COMPETENCE_LABELS).map(([k, v]) => `${k} : ${v}`);

  // Référentiel - Correspondances Tâche -> Compétences
  const TASK_TO_COMPETENCIES = {
    'T 5.2': ['C1', 'C10'], 'T 5.4': ['C1', 'C3'],
    'T 3.1': ['C2'], 'T 4.1': ['C2'], 'T 4.2': ['C2', 'C13', 'C18'], 'T 4.3': ['C2', 'C13', 'C17', 'C18'],
    'T 5.3': ['C3'], 
    'T 7.3': ['C4'], 'T 8.2': ['C4', 'C12'], 'T 8.3': ['C4'], 'T 8.4': ['C4'], 'T 8.5': ['C4', 'C5', 'C10'],
    'T 1.1': ['C5'], 'T 1.2': ['C5', 'C6', 'C8', 'C10'], 'T 1.3': ['C5', 'C6', 'C8'], 'T 1.4': ['C5'],
    'T 2.1': ['C7', 'C9'], 'T 2.2': ['C11'], 
    'T 5.1': ['C12'], 'T 5.5': ['C12'],
    'T 3.2': ['C13', 'C17'], 'T 3.3': ['C17'],
    'T 6.1': ['C14'], 'T 6.2': ['C14'],
    'T 6.3': ['C15'], 'T 7.1': ['C15', 'C16'], 'T 7.2': ['C15', 'C16'],
    'T 8.1': ['C11']
  };

  // Listes disponibles pour les modaux
  const availableTasks = ALL_TASKS;
  const availableCompetencies = ALL_COMPETENCIES;

  const availableEquipment = [
    'Pont roulant - Ledent',
    'Le banc d\'éclairage ERM',
    'Le système de ventilation',
    'Le banc harmonique',
    'Le four Réal MAX',
    'Les appareils de mesures',
    'Les EPI'
  ];

  const availableDocuments = [
    'Dossier technique',
    'Schémas électriques de l\'installation',
    'Normes en vigueur',
    'Notice appareils de mesure'
  ];

  // Fonctions pour les compétences
  const handleCompetencyToggle = (competency) => {
    setSelectedCompetencies(prev => 
      prev.includes(competency) 
        ? prev.filter(c => c !== competency)
        : [...prev, competency]
    );
  };

  const handleCompetenciesModalSave = () => {
    // Calculer les ajouts manuels sélectionnés par l'utilisateur
    const newManual = selectedCompetencies.filter(c => !autoCompetencies.includes(c));
    setManualCompetencies(newManual);

    // Calculer les compétences auto explicitement retirées par l'utilisateur
    const newExcludedAuto = autoCompetencies.filter(c => !selectedCompetencies.includes(c));
    setExcludedAutoCompetencies(newExcludedAuto);

    // Appliquer l'exclusion aux auto et fusionner
    const effectiveAuto = autoCompetencies.filter(c => !newExcludedAuto.includes(c));
    const merged = Array.from(new Set([...newManual, ...effectiveAuto]));
    setSelectedCompetencies(merged);
    setContent(prev => ({ ...prev, competencies: merged.join('\n') }));
    // Mettre à jour les critères d'observation proposés
    updateCriteriaFromSelected(merged);
    setShowCompetenciesModal(false);
  };

  // Fonctions pour les tâches
  const handleTaskToggle = (task) => {
    setSelectedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const handleTasksModalSave = () => {
    const tasksText = selectedTasks.join('\n');
    // Déterminer les compétences associées aux tâches sélectionnées
    const detectedCompetenceCodes = new Set();
    selectedTasks.forEach(task => {
      const code = task.split(':')[0].trim(); // ex "T 3.2"
      const linked = TASK_TO_COMPETENCIES[code] || [];
      linked.forEach(c => detectedCompetenceCodes.add(c));
    });
    // Convertir en libellés "Cxx : label"
    const autoList = Array.from(detectedCompetenceCodes).map(c => `${c} : ${COMPETENCE_LABELS[c]}`);
    setAutoCompetencies(autoList);
    // Appliquer les exclusions auto si existantes
    const effectiveAuto = autoList.filter(c => !(excludedAutoCompetencies || []).includes(c));
    const merged = Array.from(new Set([...(manualCompetencies || []), ...effectiveAuto]));
    setSelectedCompetencies(merged);
    // Mettre à jour le texte
    const competenciesText = merged.join('\n');
    setContent(prev => ({ ...prev, tasks: tasksText, competencies: competenciesText }));
    // Mettre à jour les critères d'observation proposés
    updateCriteriaFromSelected(merged);
    setShowTasksModal(false);
  };

  // Utilitaires pour gérer les critères d'observation
  const extractCodes = (competencyItems) => {
    // Items format "C1 : label" -> "C1"
    return (competencyItems || []).map(it => (it.split(':')[0] || '').trim()).filter(Boolean);
  };

  const updateCriteriaFromSelected = (competencyItems) => {
    const codes = extractCodes(competencyItems);
    // Union de tous les critères liés aux codes
    const nextAuto = Array.from(new Set(
      codes.flatMap(c => COMPETENCE_CRITERIA[c] || [])
    ));
    setAutoCriteria(nextAuto);
    const effectiveAuto = nextAuto.filter(cr => !(excludedAutoCriteria || []).includes(cr));
    const mergedCriteria = Array.from(new Set([...(manualCriteria || []), ...effectiveAuto]));
    setContent(prev => ({ ...prev, evaluation: mergedCriteria.join('\n') }));
  };

  const handleAddCriterion = () => {
    const value = (customCriterion || '').trim();
    if (!value) return;
    const nextManual = Array.from(new Set([...(manualCriteria || []), value]));
    setManualCriteria(nextManual);
    setCustomCriterion('');
    const effectiveAuto = (autoCriteria || []).filter(cr => !(excludedAutoCriteria || []).includes(cr));
    const merged = Array.from(new Set([...nextManual, ...effectiveAuto]));
    setContent(prev => ({ ...prev, evaluation: merged.join('\n') }));
  };

  const handleRemoveCriterion = (criterion) => {
    // S'il vient des manuels -> retirer des manuels
    if ((manualCriteria || []).includes(criterion)) {
      const nextManual = manualCriteria.filter(c => c !== criterion);
      setManualCriteria(nextManual);
      const effectiveAuto = (autoCriteria || []).filter(cr => !(excludedAutoCriteria || []).includes(cr));
      const merged = Array.from(new Set([...nextManual, ...effectiveAuto]));
      setContent(prev => ({ ...prev, evaluation: merged.join('\n') }));
      return;
    }
    // S'il vient des auto -> l'exclure
    if ((autoCriteria || []).includes(criterion)) {
      const nextExcluded = Array.from(new Set([...(excludedAutoCriteria || []), criterion]));
      setExcludedAutoCriteria(nextExcluded);
      const effectiveAuto = autoCriteria.filter(cr => !nextExcluded.includes(cr));
      const merged = Array.from(new Set([...(manualCriteria || []), ...effectiveAuto]));
      setContent(prev => ({ ...prev, evaluation: merged.join('\n') }));
    }
  };

  // Fonctions pour les équipements
  const handleEquipmentToggle = (equipment) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const handleEquipmentModalSave = () => {
    let finalEquipment = [...selectedEquipment];
    if (customEquipment.trim()) {
      finalEquipment.push(customEquipment.trim());
      setCustomEquipment('');
    }
    // Dédupliquer et mettre à jour l'état d'affichage
    finalEquipment = Array.from(new Set(finalEquipment));
    setSelectedEquipment(finalEquipment);
    const equipmentText = finalEquipment.join('\n');
    setContent(prev => ({ ...prev, equipment: equipmentText }));
    setShowEquipmentModal(false);
  };

  // Fonctions pour les documents
  const handleDocumentToggle = (document) => {
    setSelectedDocuments(prev => 
      prev.includes(document) 
        ? prev.filter(d => d !== document)
        : [...prev, document]
    );
  };

  const handleDocumentsModalSave = () => {
    let finalDocuments = [...selectedDocuments];
    if (customDocument.trim()) {
      finalDocuments.push(customDocument.trim());
      setCustomDocument('');
    }
    // Dédupliquer et mettre à jour l'état d'affichage
    finalDocuments = Array.from(new Set(finalDocuments));
    setSelectedDocuments(finalDocuments);
    const documentsText = finalDocuments.join('\n');
    setContent(prev => ({ ...prev, documents: documentsText }));
    setShowDocumentsModal(false);
  };

  // Charger les données d'édition
  useEffect(() => {
    if (editingSheet) {
      setContent({
        title: editingSheet.title || 'BTS ELECTROTECHNIQUE',
        subject: editingSheet.subject || 'ÉLECTROTECHNIQUE',
        tpNumber: editingSheet.tpNumber || 'TP N°',
        tpTitle: editingSheet.tpTitle || '',
        subtitle: editingSheet.subtitle || '',
        studentName: editingSheet.studentName || '',
        studentFirstName: editingSheet.studentFirstName || '',
        studentClass: editingSheet.studentClass || '',
        context: editingSheet.context || '',
        objectives: editingSheet.objectives || '',
        documents: editingSheet.documents || '',
        equipment: editingSheet.equipment || '',
        tasks: editingSheet.tasks || '',
        competencies: editingSheet.competencies || '',
        workRequired: editingSheet.work_required || '',
        evaluation: editingSheet.evaluation || '',
        duration: editingSheet.duration || '4 heures',
        safety: editingSheet.safety || '',
      });

      if (editingSheet.competencies) {
        const comps = editingSheet.competencies.split('\n').filter(c => c.trim());
        setSelectedCompetencies(comps);
        setManualCompetencies(comps); // tout est considéré manuel au chargement
      }
      if (editingSheet.tasks) {
        setSelectedTasks(editingSheet.tasks.split('\n').filter(t => t.trim()));
      }
      if (editingSheet.equipment) {
        setSelectedEquipment(editingSheet.equipment.split('\n').filter(e => e.trim()));
      }
      if (editingSheet.documents) {
        setSelectedDocuments(editingSheet.documents.split('\n').filter(d => d.trim()));
      }
    }
  }, [editingSheet]);

  const handleSave = () => {
    if (editingSheet) {
      onSave({ ...content, sheetName: sheetName || editingSheet.title });
      onClose();
    } else {
      setShowNameModal(true);
    }
  };

  const handleConfirmSave = () => {
    if (sheetName.trim()) {
      onSave({ ...content, sheetName: sheetName.trim() });
      setShowNameModal(false);
      onClose();
    } else {
      alert('Veuillez entrer un nom pour la fiche TP');
    }
  };

  const handlePrintDirect = (event) => {
    // Empêcher la propagation de l'événement
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Protection contre les appels multiples
    if (isPrinting) {
      console.log('🖨️ Impression déjà en cours, ignorer l\'appel');
      return;
    }
    
    setIsPrinting(true);
    console.log('🖨️ Début de l\'impression...');
    
    // Logo SVG de secours intégré directement dans le code
    const logoSVG = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="#1e40af" rx="8"/>
        <text x="20" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">PATU</text>
      </svg>
    `;
    
    // Utiliser directement le chemin du serveur pour le logo
    const logoUrl = `${window.location.protocol}//${window.location.host}/logo patu.png`;
    console.log('🖨️ URL du logo:', logoUrl);
    
    // Créer un div caché pour l'impression (pas d'iframe = pas de about:blank)
    const printDiv = document.createElement('div');
    printDiv.id = 'print-content-hidden';
    printDiv.style.position = 'fixed';
    printDiv.style.left = '-9999px';
    printDiv.style.top = '0';
    
    printDiv.innerHTML = `
      <div style="width: 210mm; padding: 10mm; font-family: 'Times New Roman', serif; font-size: 12px; background: white;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center;">
            <div style="height: 40px; margin-right: 15px; display: flex; align-items: center;">
              <img src="${logoUrl}" alt="Logo PATU" style="height: 40px; max-width: 40px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <div style="display: none;">${logoSVG}</div>
            </div>
            <div>
              <strong style="font-size: 14px;">BTS ÉLECTROTECHNIQUE</strong><br>
              <span style="font-size: 11px;">Lycée PATU de Rosemont - SAINT-BENOÎT</span>
            </div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            Année scolaire: 2025-2026<br>
            Date: ${new Date().toLocaleDateString('fr-FR')}<br>
            Durée: ${content.duration}
          </div>
        </div>
        
        <div style="border: 2px solid #333; padding: 12px; margin-bottom: 20px; background: #f9fafb;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 12px;">
            <div>
              <strong style="color: #1e40af;">Nom :</strong>
              <div style="border-bottom: 1px solid #333; min-height: 25px; padding: 4px;">${content.studentName || '___________________________'}</div>
            </div>
            <div>
              <strong style="color: #1e40af;">Prénom :</strong>
              <div style="border-bottom: 1px solid #333; min-height: 25px; padding: 4px;">${content.studentFirstName || '___________________________'}</div>
            </div>
            <div>
              <strong style="color: #1e40af;">Classe :</strong>
              <div style="border-bottom: 1px solid #333; min-height: 25px; padding: 4px;">${content.studentClass || '___________________________'}</div>
            </div>
          </div>
        </div>

        <div style="text-align: center; background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #2563eb; padding: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 0 0 8px 0; text-transform: uppercase;">${content.title}</h1>
          <h2 style="font-size: 15px; color: #1e40af; margin: 0 0 6px 0;">${content.tpNumber} - ${content.tpTitle}</h2>
          <div style="font-size: 12px; color: #2563eb;">${content.subtitle}</div>
            </div>

        ${content.context ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">1. Contexte et Situation</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.context}</div>
            </div>
        ` : ''}
        
        ${content.objectives ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">2. Objectifs Pédagogiques</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.objectives}</div>
            </div>
        ` : ''}
        
        ${content.documents ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">3. Documents et Ressources Fournis</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.documents}</div>
            </div>
            ` : ''}

        ${content.equipment ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">4. Matériel et Équipements</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.equipment}</div>
            </div>
        ` : ''}
        
        ${content.tasks ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">5. Tâches à Réaliser</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.tasks}</div>
            </div>
        ` : ''}
        
        ${content.competencies ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">6. Compétences Évaluées</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.competencies}</div>
            </div>
        ` : ''}
        
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">7. Travail Demandé</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${(content.workRequired || '').trim()}</div>
        </div>
        
        ${content.evaluation ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">8. Critères d'Évaluation</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.evaluation}</div>
            </div>
        ` : ''}
        
        ${content.safety ? `
        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 13px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 8px;">9. Consignes de Sécurité</div>
          <div style="font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${content.safety}</div>
            </div>
        ` : ''}
            </div>
    `;
    
    document.body.appendChild(printDiv);
    
    // Ajouter des styles d'impression temporaires
    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles-temp';
    printStyles.textContent = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #print-content-hidden,
        #print-content-hidden * {
          visibility: visible !important;
        }
        #print-content-hidden {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
        }
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    // Lancer l'impression
    window.print();
    
    // Nettoyer après l'impression
    setTimeout(() => {
      const divToRemove = document.getElementById('print-content-hidden');
      const stylesToRemove = document.getElementById('print-styles-temp');
      if (divToRemove) document.body.removeChild(divToRemove);
      if (stylesToRemove) document.head.removeChild(stylesToRemove);
      
      // Réinitialiser le flag d'impression
      setIsPrinting(false);
      console.log('🖨️ Impression terminée, flag réinitialisé');
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        {/* Modal principal */}
        <div className="inline-block align-bottom bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-4 sm:align-middle sm:max-w-7xl sm:w-full">
          {/* Header coloré */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-white" />
                <h3 className="text-2xl font-bold text-white">
                  {editingSheet ? '✏️ Modifier la Fiche TP' : '📝 Créer une Fiche TP'}
              </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintDirect}
                  disabled={isPrinting}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-all ${
                    isPrinting 
                      ? 'bg-white bg-opacity-10 text-white cursor-not-allowed opacity-50' 
                      : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
                  }`}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isPrinting ? 'Impression...' : 'Imprimer'}
                </button>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu du modal avec scroll */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Section Informations générales */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                  Informations Générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Titre de la fiche</label>
                    <input
                      type="text"
                      value={content.title}
                      onChange={(e) => setContent({...content, title: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      placeholder="BTS ELECTROTECHNIQUE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Matière</label>
                    <input
                      type="text"
                      value={content.subject}
                      onChange={(e) => setContent({...content, subject: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      placeholder="ÉLECTROTECHNIQUE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro TP</label>
                    <input
                      type="text"
                      value={content.tpNumber}
                      onChange={(e) => setContent({...content, tpNumber: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      placeholder="TP N°1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Durée prévue</label>
                    <input
                      type="text"
                      value={content.duration}
                      onChange={(e) => setContent({...content, duration: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      placeholder="4 heures"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Titre du TP</label>
                    <input
                      type="text"
                      value={content.tpTitle}
                      onChange={(e) => setContent({...content, tpTitle: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      placeholder="Titre du TP"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sous-titre</label>
                    <input
                      type="text"
                      value={content.subtitle}
                      onChange={(e) => setContent({...content, subtitle: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      placeholder="Sous-titre du TP"
                    />
                  </div>
                </div>
              </div>

              {/* Section Informations Étudiant */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 shadow-md border-l-4 border-cyan-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">👤</span>
                  Informations Étudiant
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de l'étudiant</label>
                    <input
                      type="text"
                      value={content.studentName}
                      onChange={(e) => setContent({...content, studentName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition-all"
                      placeholder="Nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom de l'étudiant</label>
                    <input
                      type="text"
                      value={content.studentFirstName}
                      onChange={(e) => setContent({...content, studentFirstName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition-all"
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Classe</label>
                    <input
                      type="text"
                      value={content.studentClass}
                      onChange={(e) => setContent({...content, studentClass: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition-all"
                      placeholder="STS ELEC1"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                  💡 Ces informations apparaîtront sur la fiche imprimée pour identifier l'étudiant
                </p>
              </div>

              {/* Section Contexte */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                  Contexte et Situation
                </h4>
                <textarea
                  value={content.context}
                  onChange={(e) => setContent({...content, context: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 transition-all"
                  rows={4}
                  placeholder="Décrivez le contexte et la situation..."
                />
              </div>

              {/* Section Objectifs */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                  Objectifs Pédagogiques
                </h4>
                <textarea
                  value={content.objectives}
                  onChange={(e) => setContent({...content, objectives: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                  rows={5}
                  placeholder="Décrivez les objectifs pédagogiques..."
                />
              </div>

              {/* Section Documents - Sélection avec modal */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                  Documents et Ressources Fournis
                </h4>
                <div
                  onClick={() => setShowDocumentsModal(true)}
                  className="w-full p-4 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:bg-orange-50 transition-all min-h-[100px]"
                  >
                    {selectedDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700 bg-orange-100 px-3 py-2 rounded">
                          <FileText className="h-4 w-4 mr-2 text-orange-600" />
                          {doc}
                          </div>
                        ))}
                      </div>
                    ) : (
                    <div className="text-center text-gray-400 py-8">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-orange-300" />
                      <p>Cliquez pour sélectionner les documents fournis</p>
                      </div>
                    )}
                </div>
              </div>

              {/* Section Matériel - Sélection avec modal */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-pink-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">5</span>
                  Matériel et Équipements
                </h4>
                <div
                  onClick={() => setShowEquipmentModal(true)}
                  className="w-full p-4 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer hover:bg-pink-50 transition-all min-h-[100px]"
                  >
                    {selectedEquipment.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEquipment.map((equip, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700 bg-pink-100 px-3 py-2 rounded">
                          <Wrench className="h-4 w-4 mr-2 text-pink-600" />
                          {equip}
                          </div>
                        ))}
                      </div>
                    ) : (
                    <div className="text-center text-gray-400 py-8">
                      <Wrench className="h-12 w-12 mx-auto mb-2 text-pink-300" />
                      <p>Cliquez pour sélectionner le matériel et équipements</p>
                      </div>
                    )}
                </div>
              </div>

              {/* Section Tâches - Sélection avec modal */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-teal-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">6</span>
                  Tâches à Réaliser
                </h4>
                <div
                  onClick={() => setShowTasksModal(true)}
                  className="w-full p-4 border-2 border-dashed border-teal-300 rounded-lg cursor-pointer hover:bg-teal-50 transition-all min-h-[100px]"
                >
                  {selectedTasks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTasks.map((task, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700 bg-teal-100 px-3 py-2 rounded">
                          <ListChecks className="h-4 w-4 mr-2 text-teal-600" />
                          {task}
                        </div>
                      ))}
                      </div>
                    ) : (
                    <div className="text-center text-gray-400 py-8">
                      <ListChecks className="h-12 w-12 mx-auto mb-2 text-teal-300" />
                      <p>Cliquez pour sélectionner les tâches à réaliser</p>
                      </div>
                    )}
                </div>
              </div>

              {/* Section Compétences - Sélection avec modal */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-indigo-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">7</span>
                  Compétences Évaluées
                </h4>
                <div
                  onClick={() => setShowCompetenciesModal(true)}
                  className="w-full p-4 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-all min-h-[100px]"
                >
                  {selectedCompetencies.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCompetencies.map((comp, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700 bg-indigo-100 px-3 py-2 rounded">
                          <CheckSquare className="h-4 w-4 mr-2 text-indigo-600" />
                          {comp}
                        </div>
                      ))}
                </div>
                    ) : (
                    <div className="text-center text-gray-400 py-8">
                      <CheckSquare className="h-12 w-12 mx-auto mb-2 text-indigo-300" />
                      <p>Cliquez pour sélectionner les compétences évaluées</p>
              </div>
                    )}
                </div>
              </div>

              {/* Section Travail demandé */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">8</span>
                  Travail Demandé
                </h4>
                  <textarea
                  value={content.workRequired}
                  onChange={(e) => setContent({...content, workRequired: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition-all"
                  rows={5}
                    placeholder="Décrivez le travail demandé..."
                />
              </div>

              {/* Section Critères d'évaluation */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">9</span>
                  Critères d'Évaluation
                </h4>
                <div className="space-y-3">
                  {/* Liste des critères actuels avec suppression */}
                  <div className="border-2 border-dashed border-red-200 rounded-lg p-4 min-h-[80px]">
                    {(content.evaluation?.split('\n').filter(c => c.trim()) || []).length === 0 ? (
                      <div className="text-center text-gray-400">Aucun critère. Sélectionnez des compétences ou ajoutez vos critères.</div>
                    ) : (
                      <ul className="space-y-2">
                        {content.evaluation.split('\n').filter(c => c.trim()).map((cr, idx) => (
                          <li key={`${cr}-${idx}`} className="flex items-start justify-between bg-red-50 border border-red-100 rounded px-3 py-2">
                            <span className="text-sm text-gray-800 pr-3">{cr}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(cr)}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold"
                              title="Supprimer ce critère"
                            >
                              Retirer
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Ajout manuel d'un critère */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCriterion}
                      onChange={(e) => setCustomCriterion(e.target.value)}
                      placeholder="Ajouter un critère personnalisé…"
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring focus:ring-red-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Sécurité */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-rose-500">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">10</span>
                  Consignes de Sécurité
                </h4>
                  <textarea
                  value={content.safety}
                  onChange={(e) => setContent({...content, safety: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:ring focus:ring-rose-200 transition-all"
                  rows={3}
                  placeholder="Décrivez les consignes de sécurité..."
                  />
                </div>
                </div>
              </div>

          {/* Footer avec boutons */}
          <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
            <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md"
              >
                Annuler
            </button>
            <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Enregistrer
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Compétences */}
      {showCompetenciesModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowCompetenciesModal(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <CheckSquare className="h-7 w-7 mr-3 text-indigo-600" />
                  Sélectionner les Compétences
                    </h3>
                <button onClick={() => setShowCompetenciesModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                      </button>
      </div>
                    
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {availableCompetencies.map((comp, index) => (
                  <label key={index} className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                          <input
                            type="checkbox"
                      checked={selectedCompetencies.includes(comp)}
                      onChange={() => handleCompetencyToggle(comp)}
                      className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{comp}</span>
                        </label>
                      ))}
                    </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCompetenciesModal(false)}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCompetenciesModalSave}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tâches */}
      {showTasksModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowTasksModal(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <ListChecks className="h-7 w-7 mr-3 text-teal-600" />
                  Sélectionner les Tâches
                    </h3>
                <button onClick={() => setShowTasksModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                      </button>
                    </div>
                    
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {availableTasks.map((task, index) => (
                  <label key={index} className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition-all">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task)}
                            onChange={() => handleTaskToggle(task)}
                      className="mt-1 h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                          />
                    <span className="ml-3 text-sm text-gray-700">{task}</span>
                        </label>
                      ))}
                    </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTasksModal(false)}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleTasksModalSave}
                  className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Équipements */}
      {showEquipmentModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowEquipmentModal(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Wrench className="h-7 w-7 mr-3 text-pink-600" />
                  Sélectionner les Équipements
                    </h3>
                <button onClick={() => setShowEquipmentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                      </button>
                    </div>
                    
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {availableEquipment.map((equip, index) => (
                  <label key={index} className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-pink-50 hover:border-pink-300 transition-all">
                          <input
                            type="checkbox"
                      checked={selectedEquipment.includes(equip)}
                      onChange={() => handleEquipmentToggle(equip)}
                      className="mt-1 h-5 w-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{equip}</span>
                        </label>
                      ))}
                    </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ajouter un équipement personnalisé</label>
                        <input
                          type="text"
                          value={customEquipment}
                          onChange={(e) => setCustomEquipment(e.target.value)}
                          placeholder="Nom de l'équipement..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring focus:ring-pink-200"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                        <button
                  onClick={() => setShowEquipmentModal(false)}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Annuler
                        </button>
                <button
                  onClick={handleEquipmentModalSave}
                  className="px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Documents */}
      {showDocumentsModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowDocumentsModal(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FileText className="h-7 w-7 mr-3 text-orange-600" />
                  Sélectionner les Documents
                    </h3>
                <button onClick={() => setShowDocumentsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                      </button>
                    </div>
                    
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {availableDocuments.map((doc, index) => (
                  <label key={index} className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all">
                          <input
                            type="checkbox"
                      checked={selectedDocuments.includes(doc)}
                      onChange={() => handleDocumentToggle(doc)}
                      className="mt-1 h-5 w-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{doc}</span>
                        </label>
                      ))}
                    </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ajouter un document personnalisé</label>
                        <input
                          type="text"
                          value={customDocument}
                          onChange={(e) => setCustomDocument(e.target.value)}
                          placeholder="Nom du document..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                        <button
                  onClick={() => setShowDocumentsModal(false)}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Annuler
                        </button>
                <button
                  onClick={handleDocumentsModalSave}
                  className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nom de la fiche */}
      {showNameModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowNameModal(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Nom de la fiche TP</h3>
                      <input
                        type="text"
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        placeholder="Ex: TP Diagnostic Armoire Electrique"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 mb-6"
                        autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNameModal(false)}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPSheetModal;
