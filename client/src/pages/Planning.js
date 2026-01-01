import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, RotateCcw, Copy, Clock, Calendar, Printer } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import HyperPlanningView from '../components/HyperPlanningView';
import PlanningModal from '../components/PlanningModal';
import AdvancedPlanningTools from '../components/AdvancedPlanningTools';
import PlanningAnalytics from '../components/PlanningAnalytics';
import WorkersModal from '../components/WorkersModal';
import EvaluationU52Modal from '../components/EvaluationU52Modal';

const Planning = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [initialSlotData, setInitialSlotData] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [viewMode, setViewMode] = useState('calendar'); // 'hyperplanning', 'table', 'calendar'
  const [copiedSlot, setCopiedSlot] = useState(null);
  
  // Nouvelles fonctionnalités avancées
  const [selectedSlots, setSelectedSlots] = useState([]); // Sélection multiple
  const [history, setHistory] = useState([]); // Historique des modifications
  const [showHistory, setShowHistory] = useState(false);
  const [conflictSlots, setConflictSlots] = useState([]); // Créneaux en conflit
  const [isMultiSelect, setIsMultiSelect] = useState(false); // Mode sélection multiple
  const [lastAction, setLastAction] = useState(null); // Dernière action pour Undo
  // Ouvriers (sélection par classes)
  const [workersModalOpen, setWorkersModalOpen] = useState(false);
  const [workersContext, setWorkersContext] = useState({ groupId: null, selected: [], disabled: [] });
  
  // État pour préserver la vue actuelle lors des modifications
  const [currentViewState, setCurrentViewState] = useState({
    selectedWeek: null,
    viewMode: 'calendar'
  });

  // Auto planification (réinitialiser et replanifier Phase 1 pour tous les groupes)
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [autoDate, setAutoDate] = useState('');
  const [autoStart, setAutoStart] = useState('08:00');
  const [autoEnd, setAutoEnd] = useState('12:00');
  const [autoLoading, setAutoLoading] = useState(false);
  const [u52ModalOpen, setU52ModalOpen] = useState(false);

  // Tableau récapitulatif par groupe (Projet • Groupe/étudiants • Phases)
  const summaryRows = React.useMemo(() => {
    // Indexer les slots par étudiant
    const studentIdToSlots = new Map();
    slots.forEach(s => {
      if (!studentIdToSlots.has(s.student_id)) studentIdToSlots.set(s.student_id, []);
      studentIdToSlots.get(s.student_id).push(s);
    });
    // Construire les lignes par groupe
    return (groups || []).map(g => {
      // Assurer que tous les étudiants du groupe sont listés
      // 1) Prendre ceux renvoyés par /groups/all
      const fromGroupsAll = Array.isArray(g.students) ? g.students : [];
      // 2) Compléter avec la liste globale si besoin (fallback)
      const fromStudents = Array.isArray(students)
        ? students.filter(s => String(s.group_id) === String(g.id))
        : [];
      // 3) Fusionner par id pour éviter les doublons
      const mergedMap = new Map();
      [...fromGroupsAll, ...fromStudents].forEach(s => {
        if (!s || !s.id) return;
        mergedMap.set(s.id, s);
      });
      const groupStudents = Array.from(mergedMap.values());
      const studentNames = groupStudents.map(s => `${s.first_name} ${s.last_name}`).join(', ');
      const phaseToAgg = { 1: new Map(), 2: new Map(), 3: new Map() }; // key: date|start|end -> {slots, repr}
      groupStudents.forEach(s => {
        const sSlots = studentIdToSlots.get(s.id) || [];
        sSlots.forEach(slot => {
          const p = parseInt(slot.phase) || 0;
          if (![1,2,3].includes(p)) return;
          const date = slot.start_date || '';
          const time = slot.start_time && slot.end_time ? `${slot.start_time}-${slot.end_time}` : (slot.start_time || '');
          const startT = slot.start_time ? slot.start_time.substring(0,5) : '';
          const endT = slot.end_time ? slot.end_time.substring(0,5) : '';
          const key = `${date}|${startT}|${endT}`;
          if (!phaseToAgg[p].has(key)) {
            phaseToAgg[p].set(key, { slots: [slot], repr: slot });
          } else {
            phaseToAgg[p].get(key).slots.push(slot);
          }
        });
      });
      // Lieux uniques à partir de tous les créneaux du groupe
      const locationsSet = new Set();
      groupStudents.forEach(s => {
        const sSlots = studentIdToSlots.get(s.id) || [];
        sSlots.forEach(slot => {
          const loc = (slot.location || '').trim();
          if (loc) locationsSet.add(loc);
        });
      });
      const locations = Array.from(locationsSet.values());
      // Pilotage par étudiant: associer chaque étudiant à son (premier) créneau de phase 2
      const p2ByStudent = groupStudents.map(s => {
        const sSlots = (studentIdToSlots.get(s.id) || []).filter(sl => (parseInt(sl.phase) || 0) === 2);
        // Trier par date/heure croissante
        sSlots.sort((a, b) => {
          const ad = (a.start_date || '') + (a.start_time || '');
          const bd = (b.start_date || '') + (b.start_time || '');
          return ad.localeCompare(bd);
        });
        return { student: s, slot: sSlots[0] || null };
      });
      // Soutenance par étudiant: associer chaque étudiant à son (premier) créneau de phase 3
      const p3ByStudent = groupStudents.map(s => {
        const sSlots = (studentIdToSlots.get(s.id) || []).filter(sl => (parseInt(sl.phase) || 0) === 3);
        sSlots.sort((a, b) => {
          const ad = (a.start_date || '') + (a.start_time || '');
          const bd = (b.start_date || '') + (b.start_time || '');
          return ad.localeCompare(bd);
        });
        return { student: s, slot: sSlots[0] || null };
      });
      return {
        groupId: g.id,
        projectId: g.project_id || null,
        project: g.project_title || (g.project && (g.project.title || g.project.name)) || 'Aucun projet',
        group: g.name,
        students: studentNames || '—',
        studentsList: groupStudents,
        locations,
        p1Agg: Array.from(phaseToAgg[1].values()),
        p2Agg: Array.from(phaseToAgg[2].values()),
        p3Agg: Array.from(phaseToAgg[3].values()),
        p2ByStudent,
        p3ByStudent,
        workers: Array.isArray(g.workers) ? g.workers : []
      };
    });
  }, [groups, students, slots]);



  useEffect(() => {
    fetchData();
  }, []);

  // Gestion de l'historique
  const addToHistory = useCallback((action, data) => {
    const historyEntry = {
      id: Date.now(),
      action,
      data,
      timestamp: new Date().toISOString(),
      description: getActionDescription(action, data)
    };
    
    setHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Garder 50 dernières actions
    setLastAction(historyEntry);
  }, []);

  const getActionDescription = (action, data) => {
    switch (action) {
      case 'create': return `Création du créneau ${data.first_name} ${data.last_name}`;
      case 'update': return `Modification du créneau ${data.first_name} ${data.last_name}`;
      case 'delete': return `Suppression du créneau ${data.first_name} ${data.last_name}`;
      case 'move': return `Déplacement du créneau ${data.first_name} ${data.last_name}`;
      case 'resize': return `Redimensionnement du créneau ${data.first_name} ${data.last_name}`;
      case 'delete_all': return `Suppression de tous les créneaux (${data.slots.length} créneau${data.slots.length > 1 ? 'x' : ''})`;
      default: return 'Action inconnue';
    }
  };

  const handleUndo = async () => {
    if (!lastAction) {
      toast.error('Aucune action à annuler');
      return;
    }

    try {
      switch (lastAction.action) {
        case 'create':
          await handleDeleteSlot(lastAction.data.id);
          break;
        case 'delete':
          await handleSlotSave(lastAction.data);
          break;
        case 'update':
        case 'move':
        case 'resize':
          await handleSlotSave(lastAction.data);
          break;
        case 'delete_all':
          // Restaurer tous les créneaux supprimés
          for (const slot of lastAction.data.slots) {
            await handleSlotSave(slot);
          }
          break;
        default:
          toast.error('Type d\'action non supporté pour l\'annulation');
          break;
      }
      
      toast.success('Action annulée');
      setLastAction(null);
    } catch (error) {
      toast.error('Impossible d\'annuler cette action');
    }
  };

  // Validation des conflits
  const checkConflicts = useCallback((slot, excludeId = null) => {
    const conflicts = slots.filter(s => 
      s.id !== excludeId &&
      s.start_date === slot.start_date &&
      s.student_id === slot.student_id &&
      s.start_time && slot.start_time &&
      s.end_time && slot.end_time &&
      (
        (s.start_time < slot.end_time && s.end_time > slot.start_time) ||
        (slot.start_time < s.end_time && slot.end_time > s.start_time)
      )
    );
    
    setConflictSlots(conflicts);
    return conflicts.length > 0;
  }, [slots]);

  // Sélection multiple
  const handleSlotSelect = (slot, isMultiSelect = false) => {
    if (!isMultiSelect) {
      setSelectedSlots([slot]);
    } else {
      setSelectedSlots(prev => {
        const isSelected = prev.find(s => s.id === slot.id);
        if (isSelected) {
          return prev.filter(s => s.id !== slot.id);
        } else {
          return [...prev, slot];
        }
      });
    }
  };

  const handleDeleteMultipleSlots = async () => {
    if (selectedSlots.length === 0) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSlots.length} créneau${selectedSlots.length > 1 ? 'x' : ''} ?`)) {
      return;
    }

    try {
      await Promise.all(selectedSlots.map(slot => handleDeleteSlot(slot.id)));
      setSelectedSlots([]);
      toast.success(`${selectedSlots.length} créneau${selectedSlots.length > 1 ? 'x' : ''} supprimé${selectedSlots.length > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Erreur lors de la suppression multiple');
    }
  };

  // Fonction pour supprimer tous les créneaux
  const handleDeleteAllSlots = async () => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer TOUS les créneaux ? Cette action est irréversible.');
    if (!confirmed) return;

    try {
      setLoading(true);
      
      // Ajouter à l'historique avant suppression
      addToHistory('delete_all', { slots: [...slots] });
      
      await axios.delete('/api/planning/');
      
      setSlots([]);
      setSelectedSlots([]);
      setIsMultiSelect(false);
      
      toast.success('Tous les créneaux ont été supprimés avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les créneaux:', error);
      toast.error('Erreur lors de la suppression de tous les créneaux');
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir la modale de création depuis une cellule du tableau récapitulatif
  const handleCreateFromSummary = (groupId, projectId, phase) => {
    const initial = {
      project_id: projectId || null,
      group_id: groupId,
      phase: phase,
      // Laisse les champs date/heure vides pour que l'utilisateur choisisse
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: ''
    };
    handleCreateSlot(initial);
  };

  const printSummary = () => {
    const win = window.open('', '_blank');
    const logoUrl = `${window.location.origin}/logo%20patu.png`;
    const formatDate = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatSlotHTML = (slot) => {
      if (!slot) return '';
      const startDate = formatDate(slot.start_date);
      const endDate = formatDate(slot.end_date);
      const startT = slot.start_time ? slot.start_time.substring(0,5) : '';
      const endT = slot.end_time ? slot.end_time.substring(0,5) : '';
      const time = startT && endT ? `${startT}-${endT}` : startT || '';
      const dateHtml = endDate && endDate !== startDate
        ? `<span style="color:#2563eb;font-weight:600">${startDate}</span> <span style="color:#2563eb;font-weight:600">→ ${endDate}</span>`
        : (startDate ? `<span style="color:#2563eb;font-weight:600">${startDate}</span>` : '');
      const timeHtml = time ? ` <span style="color:#dc2626;font-weight:600">${time}</span>` : '';
      return `${dateHtml}${timeHtml}`;
    };
    const formatStudentLine = (name, slot) => {
      if (!slot) return `<div>${name}</div>`;
      const dateHtml = `<span style="color:#2563eb;font-weight:600">${formatDate(slot.start_date)}</span>`;
      const s = (slot.start_time || '').substring(0,5);
      const e = slot.end_time ? slot.end_time.substring(0,5) : '';
      const time = s && e ? `${s}-${e}` : s;
      const timeHtml = time ? ` <span style="color:#dc2626;font-weight:600">${time}</span>` : '';
      return `<div>${name} ${dateHtml}${timeHtml}</div>`;
    };
    const tableRows = summaryRows.map(r => {
      const studentsBlock = Array.isArray(r.studentsList) && r.studentsList.length
        ? r.studentsList.map(s => `<div>${s.first_name} ${s.last_name}</div>`).join('')
        : (r.students || '—');
      const locationsBlock = (r.locations && r.locations.length)
        ? r.locations.map(loc => `<div>${loc}</div>`).join('')
        : '—';
      const workersBlock = (r.workers && r.workers.length)
        ? r.workers.map(w => `<div>${w.first_name} ${w.last_name}</div>`).join('')
        : '—';
      const p1Block = r.p1Agg && r.p1Agg.length
        ? r.p1Agg.map(agg => `<div>${formatSlotHTML(agg.repr)}</div>`).join('')
        : '—';
      const p2Map = new Map((r.p2ByStudent || []).map(({ student, slot }) => [student.id, slot]));
      const p2Block = (r.studentsList || []).length
        ? r.studentsList.map(st => formatStudentLine(`${st.first_name} ${st.last_name}`, p2Map.get(st.id) || null)).join('')
        : '—';
      const p3Map = new Map((r.p3ByStudent || []).map(({ student, slot }) => [student.id, slot]));
      const p3Block = (r.studentsList || []).length
        ? r.studentsList.map(st => formatStudentLine(`${st.first_name} ${st.last_name}`, p3Map.get(st.id) || null)).join('')
        : '—';
      return `
        <tr>
          <td class="cell"><div class="proj">${r.project}</div></td>
          <td class="cell">${locationsBlock}</td>
          <td class="cell"><div class="grp"><div class="name">${r.group}</div><div class="std">${studentsBlock}</div></div></td>
          <td class="cell plan">${p1Block}</td>
          <td class="cell pilot">${p2Block}</td>
          <td class="cell ouv">${workersBlock}</td>
          <td class="cell sout">${p3Block}</td>
        </tr>
      `;
    }).join('');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>EPREUVE DE CONDUITE DE CHANTIER/PROJET E52 — Tableau de planification</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 10mm; } /* 1 cm */
              body { margin: 0; }
            }
            body { font-family: Arial, sans-serif; color: #111827; }
            .print-header { display:flex; align-items:center; margin-bottom: 6px; }
            .print-header .logo { height: 72px; margin-right: 12px; }
            .title { flex:1; text-align: center; font-size: 24px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
            .subtitle { text-align:center; font-size: 12px; color: #6b7280; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; }
            th { background: #f9fafb; text-align: left; }
            .proj { font-weight: 600; }
            .name { font-weight: 600; margin-bottom: 2px; }
            .std { color: #374151; font-size: 11px; }
            /* Couleurs de phases */
            .plan { background:#eff6ff; border-color:#bfdbfe; }
            .pilot { background:#fff7ed; border-color:#fed7aa; }
            .sout { background:#ecfdf5; border-color:#a7f3d0; }
            .ouv { background:#ffffff; border-color:#d1d5db; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <img class="logo" src="${logoUrl}" alt="Logo" />
            <div class="title">EPREUVE DE CONDUITE DE CHANTIER/PROJET E52</div>
          </div>
          <div class="subtitle">Projet • Lieu • Groupe et étudiants • Planification • Pilotage • Ouvrier • Soutenance</div>
          <table>
            <thead>
              <tr>
                <th>Projet</th>
                <th>Lieu</th>
                <th>Groupe et étudiants</th>
                <th>Planification</th>
                <th>Pilotage</th>
                <th>Ouvrier</th>
                <th>Soutenance</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); }; };
          </script>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  const handleSubmitAutoPlanify = async () => {
    if (!autoDate) {
      toast.error('Veuillez choisir la date');
      return;
    }
    setAutoLoading(true);
    try {
      // 1) Supprimer tous les créneaux
      await axios.delete('/api/planning/');

      // 2) Créer un créneau Phase 1 pour chaque étudiant de chaque groupe
      const posts = [];
      groups.forEach(g => {
        const groupStudents = Array.isArray(g.students) ? g.students : [];
        if (groupStudents.length === 0) return;
        const projId = g.project_id ? parseInt(g.project_id) : null;
        groupStudents.forEach(st => {
          posts.push(axios.post('/api/planning', {
            student_id: parseInt(st.id),
            project_id: projId,
            phase: 1,
            phase_name: 'Phase 1 - Planification',
            start_date: autoDate,
            end_date: autoDate,
            start_time: autoStart || '08:00',
            end_time: autoEnd || autoStart || '12:00',
            location: '',
            notes: ''
          }));
        });
      });

      await Promise.all(posts);
      toast.success('Réinitialisation et replanification effectuées');
      setShowAutoModal(false);
      await fetchData(true);
    } catch (err) {
      console.error('Auto-planification error:', err);
      toast.error('Erreur lors de la replanification');
    } finally {
      setAutoLoading(false);
    }
  };

  // Formatage d'une entrée "YYYY-MM-DD [HH:MM(-HH:MM)]" en "jj/mm/AAAA" (bleu) + heure (rouge)
  const renderEntry = (entry) => {
    if (!entry) return null;
    const [datePart, ...timeParts] = entry.split(' ');
    // Convertir YYYY-MM-DD -> DD/MM/YYYY
    let formattedDate = datePart;
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split('-');
      formattedDate = `${d}/${m}/${y}`;
    }
    const timePart = timeParts.join(' ').trim(); // "08:00-12:00" ou ""
    return (
      <div>
        <span className="text-blue-600 font-medium">{formattedDate}</span>
        {timePart && (
          <>
            {' '}
            <span className="text-red-600 font-medium">{timePart}</span>
          </>
        )}
      </div>
    );
  };

  const renderSlotEntry = (slot) => {
    if (!slot) return null;
    let formattedStartDate = '';
    let formattedEndDate = '';
    if (slot.start_date) {
      const d = new Date(slot.start_date);
      if (!isNaN(d.getTime())) {
        formattedStartDate = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }
    if (slot.end_date) {
      const de = new Date(slot.end_date);
      if (!isNaN(de.getTime())) {
        formattedEndDate = de.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }
    const startT = slot.start_time ? slot.start_time.substring(0,5) : '';
    const endT = slot.end_time ? slot.end_time.substring(0,5) : '';
    const timePart = startT && endT ? `${startT}-${endT}` : startT || '';
    return (
      <div>
        {formattedStartDate && (
          <span className="text-blue-600 font-medium">{formattedStartDate}</span>
        )}
        {formattedEndDate && formattedEndDate !== formattedStartDate && (
          <>
            {' '}
            <span className="text-blue-600 font-medium">→ {formattedEndDate}</span>
          </>
        )}
        {timePart && (
          <>
            {' '}
            <span className="text-red-600 font-medium">{timePart}</span>
          </>
        )}
      </div>
    );
  };

  const handleDeleteGroupSlot = async (slotsToDelete = []) => {
    try {
      if (slotsToDelete.length === 0) return;
      await Promise.all(slotsToDelete.map(s => axios.delete(`/api/planning/${s.id}`)));
      toast.success('Créneau supprimé');
      await fetchData(true);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la suppression');
    }
  };

  // ----- OUVRIERS -----
  const openWorkersModal = (row) => {
    const disabled = (row.p2ByStudent || [])
      .map(w => w?.slot?.student_id)
      .filter(Boolean);
    const selected = (row.workers || []).map(w => w.id);
    setWorkersContext({ groupId: row.groupId, selected, disabled });
    setWorkersModalOpen(true);
  };

  const handleSaveWorkers = async (groupId, studentIds) => {
    try {
      await axios.post(`/api/students/groups/${groupId}/workers`, { student_ids: studentIds });
      await fetchData(true);
      setWorkersModalOpen(false);
      toast.success('Ouvriers enregistrés');
    } catch (e) {
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error("Erreur lors de l'enregistrement des ouvriers");
      }
    }
  };

  const fetchData = async (preserveView = false) => {
    try {
      setLoading(true);
      const [slotsRes, studentsRes, projectsRes, statsRes, groupsRes] = await Promise.all([
        axios.get('/api/planning'),
        axios.get('/api/students'),
        axios.get('/api/projects'),
        axios.get('/api/planning/stats'),
        axios.get('/api/students/groups/all')
      ]);

      if (slotsRes.data.success) {
        // Éviter les logs répétés en vérifiant si les données ont changé
        const newSlots = slotsRes.data.data;
        console.log('📊 Créneaux reçus de l\'API:', newSlots.length, newSlots);
        
        if (JSON.stringify(newSlots) !== JSON.stringify(slots)) {
          console.log('📊 Créneaux reçus:', newSlots);
          // Nettoyer et valider les données des créneaux
          const cleanedSlots = newSlots.filter(slot => {
          // Vérifier que le slot a toutes les propriétés nécessaires
          return slot && 
                 slot.id && 
                 slot.start_date && 
                 slot.end_date && 
                 slot.first_name && 
                 slot.last_name &&
                 (slot.project_title || slot.project_name || slot.title);
        }).map(slot => {
          // Normaliser le format de date
          const normalizeDate = (dateStr) => {
            if (!dateStr) return new Date().toISOString().split('T')[0];
            
            // Si c'est déjà au format YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              return dateStr;
            }
            
            // Si c'est au format DD/MM/YYYY
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
              const [day, month, year] = dateStr.split('/');
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            // Si c'est une date ISO
            if (dateStr.includes('T')) {
              return dateStr.split('T')[0];
            }
            
            // Par défaut
            return new Date().toISOString().split('T')[0];
          };
          
          return {
            ...slot,
            // Normaliser les dates
            start_date: normalizeDate(slot.start_date),
            end_date: normalizeDate(slot.end_date),
            start_time: slot.start_time || '08:00',
            end_time: slot.end_time || '12:00',
            first_name: slot.first_name || 'Étudiant',
            last_name: slot.last_name || 'Inconnu',
            project_title: slot.project_title || slot.project_name || slot.title || 'Projet',
            phase: slot.phase || 1,
            location: slot.location || 'Atelier',
            notes: slot.notes || '',
            status: slot.status || 'scheduled',
            color: slot.color || '#3B82F6'
          };
          });
          
          // console.log('🧹 Créneaux nettoyés:', cleanedSlots);
          setSlots(cleanedSlots);
        }
      }
      
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
      
      if (projectsRes.data.success) {
        console.log('🔍 Planning - Projets chargés:', projectsRes.data.data);
        console.log('🔍 Planning - Nombre de projets:', projectsRes.data.data.length);
        setProjects(projectsRes.data.data);
      }
      
      if (groupsRes.data.success) {
        setGroups(groupsRes.data.data || []);
      }
      
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = (initialSlotData = null) => {
    // Pour la création, on ne set pas editingSlot mais on passe les données initiales au modal
    setEditingSlot(null);
    setInitialSlotData(initialSlotData);
    setShowModal(true);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setInitialSlotData(null); // On réinitialise les données initiales pour l'édition
    setShowModal(true);
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      return;
    }

    try {
      // Sauvegarder l'état avant suppression pour l'historique
      const slotToDelete = slots.find(s => s.id === slotId);
      if (slotToDelete) {
        addToHistory('delete', slotToDelete);
      }

      const response = await axios.delete(`/api/planning/${slotId}`);
      if (response.data.success) {
        toast.success('Créneau supprimé avec succès');
        fetchData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du créneau');
    }
  };

  const handleSlotSave = async (slotData) => {
    try {
      let response;
      if (slotData.id) {
        // Mise à jour d'un créneau existant
        response = await axios.put(`/api/planning/${slotData.id}`, slotData);
        if (response.data.success) {
          // Invalider le cache du créneau modifié
          const { planningEngine } = await import('../components/PlanningEngine');
          planningEngine.invalidateSlotCache(slotData.id);
          
          toast.success('Créneau mis à jour avec succès');
        }
      } else {
        // Création d'un nouveau créneau
        response = await axios.post('/api/planning', slotData);
        if (response.data.success) {
          toast.success('Créneau créé avec succès');
        }
      }
      
      if (response.data.success) {
        fetchData(true); // Préserver la vue actuelle
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du créneau');
    }
  };

  const handleSlotMove = async (slotId, newDate, newTime) => {
    try {
      const slot = slots.find(s => s.id === slotId);
      if (!slot) {
        toast.error('Créneau non trouvé');
        return;
      }

      const updatedSlot = {
        ...slot,
        start_date: newDate,
        start_time: newTime,
        end_date: newDate
      };

      // Vérifier les conflits avant déplacement
      const hasConflicts = checkConflicts(updatedSlot, slotId);
      if (hasConflicts) {
        const confirmMove = window.confirm(
          `⚠️ Conflit détecté ! ${conflictSlots.length} créneau${conflictSlots.length > 1 ? 'x' : ''} en conflit.\n\nVoulez-vous continuer ?`
        );
        if (!confirmMove) return;
      }

      // Sauvegarder l'état avant déplacement pour l'historique
      addToHistory('move', slot);

      const response = await axios.put(`/api/planning/${slotId}`, updatedSlot);
      if (response.data.success) {
        // Invalider le cache du créneau déplacé
        const { planningEngine } = await import('../components/PlanningEngine');
        planningEngine.invalidateSlotCache(slotId);
        
        toast.success('Créneau déplacé avec succès');
        fetchData(true); // Préserver la vue actuelle
      }
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      if (error.response && error.response.data) {
        console.error('Détails de l\'erreur:', error.response.data);
        toast.error(error.response.data.message || 'Erreur lors du déplacement du créneau');
      } else {
        toast.error('Erreur lors du déplacement du créneau');
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSlotResize = async (slot, newTimes) => {
    try {
      const updatedSlot = {
        ...slot,
        start_time: newTimes.start_time,
        end_time: newTimes.end_time
      };

      // Vérifier les conflits avant redimensionnement
      const hasConflicts = checkConflicts(updatedSlot, slot.id);
      if (hasConflicts) {
        const confirmResize = window.confirm(
          `⚠️ Conflit détecté ! ${conflictSlots.length} créneau${conflictSlots.length > 1 ? 'x' : ''} en conflit.\n\nVoulez-vous continuer ?`
        );
        if (!confirmResize) return;
      }

      // Sauvegarder l'état avant redimensionnement pour l'historique
      addToHistory('resize', slot);

      const response = await axios.put(`/api/planning/${slot.id}`, updatedSlot);
      if (response.data.success) {
        // Invalider le cache du créneau redimensionné
        const { planningEngine } = await import('../components/PlanningEngine');
        planningEngine.invalidateSlotCache(slot.id);
        
        toast.success('Créneau redimensionné avec succès');
        fetchData(true); // Préserver la vue actuelle
      }
    } catch (error) {
      console.error('Erreur lors du redimensionnement:', error);
      toast.error('Erreur lors du redimensionnement du créneau');
    }
  };

  const handleCopySlot = (slot) => {
    if (slot === null) {
      setCopiedSlot(null);
      toast.success('Copie annulée');
    } else {
      setCopiedSlot(slot);
      toast.success('Créneau copié ! Cliquez sur un emplacement libre pour le coller.');
    }
  };

  const handlePasteSlot = async (targetDate, targetTime) => {
    if (!copiedSlot) {
      toast.error('Aucun créneau copié');
      return;
    }

    try {
      // Créer un nouveau créneau basé sur le créneau copié
      const newSlotData = {
        ...copiedSlot,
        id: undefined, // S'assurer qu'un nouvel ID sera généré
        start_date: targetDate,
        start_time: targetTime,
        // Calculer l'heure de fin en conservant la durée du créneau original
        end_time: calculateEndTime(targetTime, copiedSlot.start_time, copiedSlot.end_time)
      };

      console.log('Collage du créneau:', newSlotData);
      const response = await axios.post('/api/planning', newSlotData);
      
      if (response.data.success) {
        toast.success('Créneau collé avec succès');
        setCopiedSlot(null); // Vider le presse-papiers
        fetchData(true); // Préserver la vue actuelle
      }
    } catch (error) {
      console.error('Erreur lors du collage:', error);
      toast.error('Erreur lors du collage du créneau');
    }
  };

  const calculateEndTime = (newStartTime, originalStartTime, originalEndTime) => {
    // Calculer la durée du créneau original
    const startParts = originalStartTime.split(':').map(Number);
    const endParts = originalEndTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    const durationMinutes = endMinutes - startMinutes;

    // Calculer la nouvelle heure de fin
    const newStartParts = newStartTime.split(':').map(Number);
    const newStartMinutes = newStartParts[0] * 60 + newStartParts[1];
    const newEndMinutes = newStartMinutes + durationMinutes;
    
    const newEndHours = Math.floor(newEndMinutes / 60);
    const newEndMinutesRemainder = newEndMinutes % 60;
    
    return `${newEndHours.toString().padStart(2, '0')}:${newEndMinutesRemainder.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-green-100 text-green-800'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const getPhaseTitle = (phase) => {
    const titles = {
      1: 'Planification',
      2: 'Pilotage',
      3: 'Soutenance'
    };
    return titles[phase] || 'Phase inconnue';
  };
  
  // Map rapide: student_id -> group_id pour éviter de fusionner des groupes quand group_id manque sur un slot
  const studentIdToGroupId = React.useMemo(() => {
    const m = new Map();
    (students || []).forEach(s => {
      if (s && s.id != null) m.set(parseInt(s.id), s.group_id);
    });
    return m;
  }, [students]);

  // Navigation du calendrier (mois/année)
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const goToPrevMonth = () => {
    setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const monthLabel = calendarViewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const filteredSlots = selectedPhase === 'all' 
    ? slots 
    : slots.filter(slot => slot.phase.toString() === selectedPhase);
  
  console.log('🔍 Slots filtrés pour le calendrier:', filteredSlots.length, filteredSlots);

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
      <div className="text-center">
        <div className="text-3xl font-extrabold text-blue-700 uppercase tracking-widest">
          EPREUVE DE CONDUITE DE CHANTIER/PROJET E52
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planification</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des créneaux de planification pour les trois phases
          </p>
        </div>
        <button
          onClick={handleCreateSlot}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau créneau
        </button>
      </div>

      {/* Modale de replanification */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !autoLoading && setShowAutoModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Réinitialiser et replanifier (Phase 1)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={autoDate}
                      onChange={(e) => setAutoDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      disabled={autoLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                      <input
                        type="time"
                        value={autoStart}
                        onChange={(e) => setAutoStart(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        disabled={autoLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                      <input
                        type="time"
                        value={autoEnd}
                        onChange={(e) => setAutoEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        disabled={autoLoading}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tous les groupes seront planifiés à la même date/heure sur leur projet (Phase 1).
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSubmitAutoPlanify}
                  disabled={autoLoading}
                  className={`btn btn-primary sm:ml-3 sm:w-auto ${autoLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {autoLoading ? 'Replanification...' : 'Valider'}
                </button>
                <button
                  onClick={() => !autoLoading && setShowAutoModal(false)}
                  className="btn btn-secondary sm:ml-3 sm:w-auto"
                  disabled={autoLoading}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tableau de planification intégré dans la page */}
      <div className="card mt-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Tableau de planification par groupe
            </h3>
            <p className="text-sm text-gray-500">
              Projet • Groupe et étudiants • Planification • Pilotage • Soutenance
            </p>
          </div>
          <button
            onClick={printSummary}
            className="btn btn-primary flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </button>
          <button
            onClick={() => setU52ModalOpen(true)}
            className="btn btn-primary flex items-center ml-2"
            title="Ouvrir la fiche d'évaluation U52 (Conduite de chantier) dans une fenêtre"
          >
            Evaluation U52
          </button>
          <button
            onClick={handleDeleteAllSlots}
            className="btn btn-danger ml-2"
            title="Supprimer définitivement tous les créneaux de la base"
          >
            Supprimer tous les créneaux
          </button>
        </div>
        
        <div className="overflow-auto border border-gray-300 rounded-md">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Projet</th>
                <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Lieu</th>
                <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Groupe et étudiants</th>
                <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Planification</th>
                <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Pilotage</th>
                <th className="border border-gray-300 px-3 py-2 text-left bg-white">Ouvrier</th>
                <th className="border border-gray-300 px-3 py-2 text-left bg-gray-50">Soutenance</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 align-top">{row.project}</td>
                  <td className="border border-gray-300 px-3 py-2 align-top">
                    {row.locations && row.locations.length ? (
                      <div className="text-sm text-gray-700 space-y-1">
                        {row.locations.map((loc, i) => (
                          <div key={`${loc}-${i}`} className="leading-5">{loc}</div>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 align-top">
                    <div className="font-medium">{row.group}</div>
                    <div className="text-sm text-gray-600">
                      {Array.isArray(row.studentsList) && row.studentsList.length > 0 ? (
                        <div className="space-y-1">
                          {row.studentsList.map(s => (
                            <div key={s.id} className="leading-5">{s.first_name} {s.last_name}</div>
                          ))}
                        </div>
                      ) : (
                        row.students || '—'
                      )}
                    </div>
                  </td>
                  <td
                    className="border border-blue-200 px-3 py-2 align-top cursor-pointer bg-blue-50 hover:bg-blue-100"
                    title="Cliquer pour programmer un créneau (Phase 1 - Planification)"
                    onClick={() => handleCreateFromSummary(row.groupId, row.projectId, 1)}
                  >
                    {row.p1Agg && row.p1Agg.length ? (
                      <div className="space-y-1">
                        {row.p1Agg.map((agg, i) => (
                          <div key={`${agg.repr?.id || i}`} className="flex items-center justify-between group">
                            <div
                              onClick={(e) => { e.stopPropagation(); handleEditSlot(agg.repr); }}
                              className="cursor-pointer hover:underline"
                              title="Modifier ce créneau"
                            >
                              {renderSlotEntry(agg.repr)}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteGroupSlot(agg.slots); }}
                              className="opacity-60 group-hover:opacity-100 ml-2"
                              title="Supprimer ce créneau"
                            >
                              <Trash2 className="h-3 w-3 text-red-600 hover:text-red-800" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td
                    className="border border-orange-200 px-3 py-2 align-top cursor-pointer bg-orange-50 hover:bg-orange-100"
                    title="Cliquer pour programmer un créneau (Phase 2 - Pilotage)"
                    onClick={() => handleCreateFromSummary(row.groupId, row.projectId, 2)}
                  >
                    {row.studentsList && row.studentsList.length ? (
                      <div className="space-y-1">
                        {(() => {
                          const p2Map = new Map((row.p2ByStudent || []).map(({ student, slot }) => [student.id, slot]));
                          return row.studentsList.map(student => {
                            const slot = p2Map.get(student.id) || null;
                          const time =
                            slot && (slot.start_time || slot.end_time)
                              ? `${(slot.start_time || '').substring(0,5)}${slot.end_time ? `-${slot.end_time.substring(0,5)}` : ''}`
                              : null;
                          const dateStr = slot && slot.start_date
                            ? (() => {
                                const d = new Date(slot.start_date);
                                return isNaN(d.getTime())
                                  ? null
                                  : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                              })()
                            : null;
                            return (
                            <div key={student.id} className="flex items-center justify-between leading-5 group">
                              <div
                                className={`cursor-${slot ? 'pointer hover:underline' : 'default'} truncate`}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (slot) handleEditSlot(slot); 
                                }}
                                title={slot ? 'Modifier le créneau de cet étudiant' : 'Aucun créneau – cliquez sur la cellule pour créer'}
                              >
                                <span className="text-gray-800">{student.first_name} {student.last_name}</span>
                                {dateStr && (
                                  <span className="ml-2 text-blue-600 font-medium">{dateStr}</span>
                                )}
                                {time && (
                                  <span className="ml-2 text-red-600 font-medium">{time}</span>
                                )}
                              </div>
                              {slot && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}
                                  className="opacity-60 group-hover:opacity-100 ml-2"
                                  title="Supprimer ce créneau"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600 hover:text-red-800" />
                                </button>
                              )}
                            </div>
                            );
                          });
                        })()}
                      </div>
                    ) : '—'}
                  </td>
                  <td
                    className="border border-gray-300 px-3 py-2 align-top cursor-pointer bg-white hover:bg-gray-50"
                    title="Choisir les ouvriers (parmi les classes)"
                    onClick={() => openWorkersModal(row)}
                  >
                    {row.workers && row.workers.length ? (
                      <div className="space-y-1">
                        {row.workers.map(w => (
                          <div key={w.id} className="flex items-center justify-between leading-5 group">
                            <div className="truncate">
                              <span className="text-gray-800">{w.first_name} {w.last_name}</span>
                            </div>
                            <button
                              className="opacity-60 group-hover:opacity-100 ml-2"
                              title="Retirer"
                              onClick={(e) => {
                                e.stopPropagation();
                                const remaining = row.workers.filter(rw => rw.id !== w.id).map(rw => rw.id);
                                handleSaveWorkers(row.groupId, remaining);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-600 hover:text-red-800" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td
                    className="border border-green-200 px-3 py-2 align-top cursor-pointer bg-green-50 hover:bg-green-100"
                    title="Cliquer pour programmer un créneau (Phase 3 - Soutenance)"
                    onClick={() => handleCreateFromSummary(row.groupId, row.projectId, 3)}
                  >
                    {row.studentsList && row.studentsList.length ? (
                      <div className="space-y-1">
                        {(() => {
                          const p3Map = new Map((row.p3ByStudent || []).map(({ student, slot }) => [student.id, slot]));
                          return row.studentsList.map(student => {
                            const slot = p3Map.get(student.id) || null;
                          const time =
                            slot && (slot.start_time || slot.end_time)
                              ? `${(slot.start_time || '').substring(0,5)}${slot.end_time ? `-${slot.end_time.substring(0,5)}` : ''}`
                              : null;
                          const dateStr = slot && slot.start_date
                            ? (() => {
                                const d = new Date(slot.start_date);
                                return isNaN(d.getTime())
                                  ? null
                                  : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                              })()
                            : null;
                            return (
                            <div key={student.id} className="flex items-center justify-between leading-5 group">
                              <div
                                className={`cursor-${slot ? 'pointer hover:underline' : 'default'} truncate`}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (slot) handleEditSlot(slot); 
                                }}
                                title={slot ? 'Modifier le créneau de cet étudiant' : 'Aucun créneau – cliquez sur la cellule pour créer'}
                              >
                                <span className="text-gray-800">{student.first_name} {student.last_name}</span>
                                {dateStr && (
                                  <span className="ml-2 text-blue-600 font-medium">{dateStr}</span>
                                )}
                                {time && (
                                  <span className="ml-2 text-red-600 font-medium">{time}</span>
                                )}
                              </div>
                              {slot && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}
                                  className="opacity-60 group-hover:opacity-100 ml-2"
                                  title="Supprimer ce créneau"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600 hover:text-red-800" />
                                </button>
                              )}
                            </div>
                            );
                          });
                        })()}
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {summaryRows.length === 0 && (
                <tr>
                  <td className="border border-gray-300 px-3 py-6 text-center text-gray-500" colSpan="5">
                    Aucun groupe à afficher
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Statistiques des phases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(phase => {
          const phaseStat = stats.find(s => s.phase === phase) || {
            total_slots: 0,
            scheduled: 0,
            in_progress: 0,
            completed: 0
          };
          
          return (
            <div key={phase} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(phase)}`}>
                  Phase {phase}: {getPhaseTitle(phase)}
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {phaseStat.total_slots}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Programmés</span>
                  <span className="font-medium">{phaseStat.scheduled}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">En cours</span>
                  <span className="font-medium">{phaseStat.in_progress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Terminés</span>
                  <span className="font-medium">{phaseStat.completed}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outils avancés retirés pour alléger l'interface */}

      {/* Analyses et statistiques */}
      <PlanningAnalytics
        slots={slots}
        students={students}
        projects={projects}
      />

      {/* Barre d'outils avancée */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Vue :</h3>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                  viewMode === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendrier</span>
              </button>
              <button
                onClick={() => setViewMode('hyperplanning')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'hyperplanning' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                Planning
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                Tableau
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Phase :</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="input w-48"
            >
              <option value="all">Toutes les phases</option>
              <option value="1">Phase 1 - Planification</option>
              <option value="2">Phase 2 - Pilotage</option>
              <option value="3">Phase 3 - Soutenance</option>
            </select>
          </div>
        </div>

        {/* Outils avancés retirés */}

        {/* Historique des modifications */}
        {showHistory && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Historique des modifications</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune modification récente</p>
              ) : (
                history.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{entry.description}</span>
                    <span className="text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Affichage conditionnel selon le mode de vue */}
      {viewMode === 'calendar' && (
        <div className="card">
          {/* Légende des phases */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Légende des phases :</h4>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Phase 1 - Planification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>Phase 2 - Pilotage</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Phase 3 - Soutenance</span>
              </div>
            </div>
          </div>

          {/* Navigation du mois */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPrevMonth}
              className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Mois précédent"
            >
              ←
            </button>
            <div className="text-lg font-semibold text-gray-800">
              {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
            </div>
            <button
              onClick={goToNextMonth}
              className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Mois suivant"
            >
              →
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2 bg-gray-50 rounded">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const date = calendarViewDate;
              const startOfMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1);
              const firstDayOfWeek = (startOfMonth.getDay() + 6) % 7; // Lundi = 0
              const dayNumber = i - firstDayOfWeek + 1;
              const currentDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), dayNumber);
              
              const daySlots = filteredSlots.filter(slot => {
                if (!slot.start_date) return false;
                const parseDateOnly = (d) => {
                  const s = (d || '').toString();
                  const iso = s.includes('T') ? s.split('T')[0] : s;
                  const [y,m,dd] = iso.split('-').map(Number);
                  return new Date(y, (m || 1) - 1, dd || 1);
                };
                const start = parseDateOnly(slot.start_date);
                const end = parseDateOnly(slot.end_date || slot.start_date);
                const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                return day >= start && day <= end;
              });

              // ISO date string for this cell
              const y = calendarViewDate.getFullYear();
              const m = (calendarViewDate.getMonth() + 1).toString().padStart(2, '0');
              const dnum = Math.max(1, Math.min(31, dayNumber)).toString().padStart(2, '0');
              const cellISO = `${y}-${m}-${dnum}`;

              return (
                <div
                  key={i}
                  className={`min-h-[160px] p-2 border border-gray-200 ${dayNumber < 1 || dayNumber > new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate() ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-blue-50 cursor-pointer'}`}
                  onClick={() => {
                    if (dayNumber > 0 && dayNumber <= new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate()) {
                      handleCreateSlot({
                        start_date: cellISO,
                        end_date: cellISO,
                        start_time: '',
                        end_time: '',
                        phase: 1
                      });
                    }
                  }}
                >
                  {dayNumber > 0 && dayNumber <= new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate() && (
                    <>
                      <div className="font-medium text-sm mb-1">{dayNumber}</div>
                      <div className="space-y-1">
                        {(() => {
                          // Agréger par groupe + phase + date/heure pour afficher tous les étudiants d'un même créneau
                          const agg = new Map();
                          daySlots.forEach(s => {
                            const gid = (s.group_id != null && s.group_id !== undefined)
                              ? s.group_id
                              : (s.groupId != null ? s.groupId : studentIdToGroupId.get(parseInt(s.student_id)) || 'nogroup');
                            const key = [
                              gid,
                              s.phase,
                              s.start_date,
                              (s.start_time || '').substring(0,5),
                              (s.end_time || '').substring(0,5)
                            ].join('|');
                            if (!agg.has(key)) {
                              agg.set(key, { slots: [s], repr: s });
                            } else {
                              agg.get(key).slots.push(s);
                            }
                          });
                          const aggregated = Array.from(agg.values()).slice(0, 3);
                          return aggregated.map(({ slots: groupSlots, repr }) => {
                          const getPhaseColor = (phase) => {
                            switch(parseInt(phase)) {
                                case 1: return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
                                case 2: return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
                                case 3: return 'bg-green-100 text-green-800 hover:bg-green-200';
                              default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
                            }
                          };
                            const phaseColor = getPhaseColor(repr.phase);
                            // Préférer la liste complète d'étudiants du groupe si disponible
                            let studentNames = '';
                            const gid = (repr.group_id != null && repr.group_id !== undefined)
                              ? repr.group_id
                              : (repr.groupId != null ? repr.groupId : studentIdToGroupId.get(parseInt(repr.student_id)));
                            if (gid && Array.isArray(groups)) {
                              const grp = groups.find(g => String(g.id) === String(gid));
                              if (grp && Array.isArray(grp.students) && grp.students.length > 0) {
                                studentNames = grp.students.map(s => `${s.first_name} ${s.last_name}`).join(', ');
                              }
                            }
                            // Fallback: agréger depuis les slots si la liste du groupe est indisponible
                            if (!studentNames) {
                              studentNames = Array.from(new Set(groupSlots.map(gs => `${gs.first_name} ${gs.last_name}`))).join(', ');
                            }
                          return (
                            <div
                                key={`${repr.group_id || repr.groupId || 'nogroup'}|${repr.phase}|${repr.start_time}|${repr.end_time}`}
                              className={`text-xs p-1 rounded cursor-pointer ${phaseColor}`}
                                onClick={(e) => { e.stopPropagation(); handleEditSlot(repr); }}
                                title={`${repr.group_name || 'Groupe'} • ${studentNames} • ${repr.project_name || ''} • ${repr.start_time}-${repr.end_time} • ${repr.phase_name || `Phase ${repr.phase}`}`}
                            >
                                <div className="font-medium text-[10px] mb-1">
                                  {(repr.group_name || 'Groupe')}{studentNames ? ` — ${studentNames}` : ''}
                                </div>
                                {repr.project_name && repr.project_name.trim() !== '' && (
                                <div className="text-[9px] font-semibold truncate bg-white bg-opacity-30 px-1 py-0.5 rounded text-center mb-1">
                                  <span className="text-[7px] opacity-75">Projet/Chantier: </span>
                                    {repr.project_name}
                                </div>
                              )}
                              <div className="text-[8px] font-medium opacity-90 mb-1">
                                  Phase {repr.phase} - {repr.phase_name || (repr.phase === 1 ? 'Planification' : repr.phase === 2 ? 'Pilotage' : 'Soutenance')}
                              </div>
                                <div className="text-[8px] opacity-75">{repr.start_time}-{repr.end_time}</div>
                            </div>
                          );
                          });
                        })()}
                        {daySlots.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{daySlots.length - 3} autres
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'hyperplanning' && (
        <div className="card p-0 h-[600px]">
          <HyperPlanningView
            slots={filteredSlots}
            onSlotEdit={handleEditSlot}
            onSlotDelete={handleDeleteSlot}
            onSlotMove={handleSlotMove}
            onSlotCreate={handleCreateSlot}
            onSlotResize={handleSlotResize}
            onSlotCopy={handleCopySlot}
            onSlotPaste={handlePasteSlot}
            copiedSlot={copiedSlot}
            selectedSlots={selectedSlots}
            onSlotSelect={handleSlotSelect}
            isMultiSelect={isMultiSelect}
            conflictSlots={conflictSlots}
            currentViewState={currentViewState}
            onViewStateChange={setCurrentViewState}
          />
        </div>
      )}

      {viewMode === 'table' && filteredSlots.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Liste des créneaux ({filteredSlots.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSlots.map(slot => {
                  const date = new Date(slot.start_date);
                  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                  
                  return (
                    <tr key={slot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(slot.phase)}`}>
                          Phase {slot.phase}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {slot.first_name} {slot.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {slot.class}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {date.getDate()}/{monthNames[date.getMonth()]}/{date.getFullYear()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dayNames[date.getDay()]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {slot.start_time ? (
                            <div>
                              <div>{slot.start_time.substring(0, 5)}</div>
                              {slot.end_time && (
                                <div className="text-xs text-gray-500">
                                  → {slot.end_time.substring(0, 5)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Non définie</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {slot.project_title || <span className="text-gray-400 italic">Aucun</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {slot.location || <span className="text-gray-400 italic">Non défini</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slot.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          slot.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          slot.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {slot.status === 'scheduled' ? 'Programmé' :
                           slot.status === 'in_progress' ? 'En cours' :
                           slot.status === 'completed' ? 'Terminé' :
                           'Annulé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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
      )}

      {/* Modal de création/édition */}
      {showModal && (
        <PlanningModal
          slot={editingSlot || initialSlotData}
          students={students}
          projects={projects}
          groups={groups}
          existingSlots={slots}
          onSave={handleSlotSave}
          onClose={() => {
            setShowModal(false);
            setEditingSlot(null);
            setInitialSlotData(null);
          }}
        />
      )}

      {/* Modal sélection des ouvriers */}
      {workersModalOpen && (
        <WorkersModal
          isOpen={workersModalOpen}
          onClose={() => setWorkersModalOpen(false)}
          onSave={(ids) => handleSaveWorkers(workersContext.groupId, ids)}
          initialSelected={workersContext.selected}
          disabledIds={workersContext.disabled}
        />
      )}
      {/* Fenêtre surgissante - Évaluation U52 */}
      <EvaluationU52Modal
        isOpen={u52ModalOpen}
        onClose={() => setU52ModalOpen(false)}
        src="/evaluations/u52/standalone"
      />
    </div>
  );
};

export default Planning;