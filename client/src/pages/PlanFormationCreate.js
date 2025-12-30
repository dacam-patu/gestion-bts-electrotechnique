import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Pencil, Plus } from 'lucide-react';

// Simple color palette for categories
const CATEGORY_COLORS = {
  cours: 'bg-green-100 text-green-800 border border-green-200',
  tp: 'bg-orange-100 text-orange-800 border border-orange-200',
  projet: 'bg-violet-100 text-violet-800 border border-violet-200',
  sae: 'bg-violet-100 text-violet-800 border border-violet-200',
  evaluation: 'bg-red-100 text-red-800 border border-red-200',
  vacance: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
  feries: 'bg-gray-100 text-gray-700',
  stage: 'bg-blue-900 text-white',
  examens: 'bg-red-900 text-white',
  evenement: 'bg-indigo-200 text-indigo-900',
};

// Référentiel synthétique des compétences (code -> définition)
const COMPETENCE_LABELS = {
  C1: "recenser et prendre en compte les normes, les réglementations applicables au projet/chantier",
  C2: "extraire les informations nécessaires à la réalisation des tâches",
  C3: "gérer les risques et les aléas liés à la réalisation des tâches",
  C4: "communiquer de manière adaptée à l'oral, à l'écrit, y compris en langue anglaise",
  C5: "interpréter un besoin client/utilisateur, un CCTP, un cahier des charges",
  C6: "modéliser le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique",
  C7: "simuler le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique",
  C8: "dimensionner les constituants d’un ouvrage, d’une installation, d’un équipement électrique",
  C9: "choisir les constituants d’un ouvrage, d’une installation, d’un équipement électrique",
  C10: "proposer l’architecture d’un ouvrage, d’une installation, d’un équipement électrique",
  C11: "réaliser les documents du projet/chantier (plans, schémas, maquette virtuelle, etc.)",
  C12: "gérer et conduire (organisation, planification, suivi, pilotage, réception, etc.) le projet/chantier",
  C13: "mesurer les grandeurs caractéristiques d’un ouvrage, d’une installation, d’un équipement électrique",
  C14: "réaliser un ouvrage, une installation, un équipement électrique",
  C15: "configurer et programmer les matériels dans le cadre du projet/chantier",
  C16: "appliquer un protocole pour mettre en service un ouvrage, une installation, un équipement électrique",
  C17: "réaliser un diagnostic de performance (énergétique, sécurité, etc.) d’un ouvrage/installation/équipement",
  C18: "réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique",
};
const COMPETENCE_LIST = Object.entries(COMPETENCE_LABELS).map(([code, label]) => ({ code, label }));

// Référentiel des tâches (code -> libellé)
const TASK_LABELS = {
  'T 1.1': "analyser et/ou élaborer les documents relatifs aux besoins du client/utilisateur",
  'T 1.2': "élaborer un avant-projet/chantier (ou avant-projet sommaire)",
  'T 1.3': "dimensionner les constituants de l’installation",
  'T 1.4': "définir les coûts pour préparer une offre commerciale",
  'T 2.1': "choisir les matériels",
  'T 2.2': "réaliser les documents techniques du projet/chantier",
  'T 3.1': "proposer un protocole pour analyser le fonctionnement et/ou le comportement de l’installation",
  'T 3.2': "mesurer et contrôler l’installation, exploiter les mesures pour faire le diagnostic",
  'T 3.3': "formuler des préconisations",
  'T 4.1': "organiser la maintenance",
  'T 4.2': "réaliser la maintenance préventive ou prévisionnelle",
  'T 4.3': "réaliser la maintenance corrective",
  'T 5.1': "s’approprier et vérifier les informations relatives au projet/chantier",
  'T 5.2': "planifier les étapes du projet/chantier",
  'T 5.3': "assurer le suivi de la réalisation du projet/chantier (coûts, délais, qualité)",
  'T 5.4': "faire appliquer les règles liées à la santé, la sécurité et l’environnement",
  'T 5.5': "gérer et animer l’équipe projet/chantier",
  'T 6.1': "organiser l’espace de travail",
  'T 6.2': "implanter, poser, installer, câbler, raccorder les matériels électriques",
  'T 6.3': "programmer les applications métiers",
  'T 7.1': "réaliser les contrôles, les configurations, les essais fonctionnels",
  'T 7.2': "vérifier le fonctionnement de l’installation",
  'T 7.3': "réceptionner l’installation avec le client/utilisateur",
  'T 8.1': "constituer et mettre à jour les dossiers du projet/chantier",
  'T 8.2': "échanger, y compris en langue anglaise, avec les parties prenantes du projet/chantier",
  'T 8.3': "expliquer, y compris en langue anglaise, le fonctionnement de l’installation et former le client/utilisateur à son utilisation",
  'T 8.4': "préparer et animer des réunions",
  'T 8.5': "présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur",
};

// Correspondances Tâche -> Compétences (extraites du référentiel)
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
  'T 8.1': ['C11'],
};

// Dérivé: Compétence -> Tâches
const COMPETENCE_TO_TASKS = Object.entries(TASK_TO_COMPETENCIES).reduce((acc, [task, comps]) => {
  comps.forEach((c) => {
    if (!acc[c]) acc[c] = [];
    acc[c].push(task);
  });
  // trier pour stabilité
  Object.values(acc).forEach((arr) => arr.sort((a, b) => a.localeCompare(b, 'fr')));
  return acc;
}, {});

// Distinct, accessible palette for teachers (cycled if > length)
const TEACHER_COLOR_PALETTE = [
  '#e53935', // red
  '#fb8c00', // orange
  '#43a047', // green
  '#1e88e5', // blue
  '#8e24aa', // purple
  '#00897b', // teal
  '#fdd835', // amber
  '#5e35b1', // deep purple
  '#d81b60', // pink
  '#3949ab', // indigo
  '#00acc1', // cyan
  '#7cb342', // light green
];

function buildTeacherColorMap(teachers = []) {
  const map = {};
  const ids = teachers.map((t) => String(t.id)).sort((a, b) => {
    // numeric sort when possible for stability
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
  ids.forEach((id, idx) => {
    map[id] = TEACHER_COLOR_PALETTE[idx % TEACHER_COLOR_PALETTE.length];
  });
  return map;
}

// Helpers
function toDate(value) {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function inRange(day, start, end) {
  const x = toDate(day).getTime();
  return x >= toDate(start).getTime() && x <= toDate(end).getTime();
}
function formatShort(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

// Default seed data (editable in UI)
const DEFAULT_DATA = {
  calendrier: {
    annee: '2025-2026',
    dateDebut: '2025-08-18',
    dateFin: '2026-07-05',
    vacances: [
      { label: 'Vacances Toussaint', type: 'vacance', debut: '2025-10-20', fin: '2025-11-02' },
      { label: 'Vacances Noël', type: 'vacance', debut: '2025-12-22', fin: '2026-01-04' },
      { label: 'Vacances Hiver', type: 'vacance', debut: '2026-03-02', fin: '2026-03-15' },
    ],
    stages: [
      { label: 'Stage BTS1', type: 'stage', debut: '2026-05-04', fin: '2026-05-31', classes: ['BTS1'] },
    ],
    examens: [
      { label: 'CCF U52', type: 'examens', debut: '2026-02-16', fin: '2026-02-22' },
      { label: 'Écrits BTS', type: 'examens', debut: '2026-06-01', fin: '2026-06-14' },
    ],
    feries: [
      { label: '1er novembre', type: 'feries', debut: '2025-11-01', fin: '2025-11-01' },
      { label: '11 novembre', type: 'feries', debut: '2025-11-11', fin: '2025-11-11' },
      { label: 'Lundi de Pâques', type: 'feries', debut: '2026-04-06', fin: '2026-04-06' },
      { label: '1er mai', type: 'feries', debut: '2026-05-01', fin: '2026-05-01' },
      { label: '8 mai', type: 'feries', debut: '2026-05-08', fin: '2026-05-08' },
      { label: 'Ascension', type: 'feries', debut: '2026-05-14', fin: '2026-05-14' },
    ],
  },
  // Deuxième année (BTS2) — valeurs par défaut pour 2026-2027
  calendrier2: {
    annee: '2026-2027',
    dateDebut: '2026-08-17',
    dateFin: '2027-07-04',
    vacances: [
      { label: 'Vacances Toussaint', type: 'vacance', debut: '2026-10-26', fin: '2026-11-08' },
      { label: 'Vacances Noël', type: 'vacance', debut: '2026-12-21', fin: '2027-01-03' },
      { label: 'Vacances Hiver', type: 'vacance', debut: '2027-02-22', fin: '2027-03-07' },
    ],
    stages: [
      { label: 'Stage BTS2', type: 'stage', debut: '2027-04-26', fin: '2027-05-23', classes: ['BTS2'] },
    ],
    examens: [
      { label: 'CCF U52', type: 'examens', debut: '2027-02-15', fin: '2027-02-21' },
      { label: 'Écrits BTS', type: 'examens', debut: '2027-06-07', fin: '2027-06-20' },
    ],
    feries: [
      { label: '1er novembre', type: 'feries', debut: '2026-11-01', fin: '2026-11-01' },
      { label: '11 novembre', type: 'feries', debut: '2026-11-11', fin: '2026-11-11' },
      { label: 'Lundi de Pâques', type: 'feries', debut: '2027-03-29', fin: '2027-03-29' },
      { label: '1er mai', type: 'feries', debut: '2027-05-01', fin: '2027-05-01' },
      { label: '8 mai', type: 'feries', debut: '2027-05-08', fin: '2027-05-08' },
      { label: 'Ascension', type: 'feries', debut: '2027-05-13', fin: '2027-05-13' },
    ],
  },
  matieres: [],
  // Profs désormais chargés depuis /api/users (role=teacher)
  profs: [],
  templates: [
    { id: 'T1', libelle: 'Cours 2h', type: 'cours', dureeH: 2, livrable: '', tags: [] },
    { id: 'T2', libelle: 'TP 4h', type: 'tp', dureeH: 4, livrable: 'CR TP', tags: ['sécurité'] },
    { id: 'T3', libelle: 'Éval 1h', type: 'evaluation', dureeH: 1, livrable: 'Note + corrigé', tags: [] },
    { id: 'T4', libelle: 'Projet', type: 'projet', dureeH: 3, livrable: 'Jalon', tags: [] },
  ],
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-md text-sm font-medium ${
      active ? 'bg-primary-100 text-primary-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

const Badge = ({ colorClass, children, title }) => (
  <span
    title={title}
    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
    style={{ whiteSpace: 'nowrap' }}
  >
    {children}
  </span>
);

// Generic period editor (vacances, examens, fériés, stage)
const PeriodEditor = ({ title, items, onChange, type, showClasses = false }) => {
  const addItem = () => {
    const base = { label: '', type, debut: '', fin: '' };
    if (showClasses) Object.assign(base, { classes: [] });
    onChange([...(items || []), base]);
  };
  const updateItem = (idx, field, value) => {
    const next = (items || []).map((it, i) => (i === idx ? { ...it, [field]: value } : it));
    onChange(next);
  };
  const removeItem = (idx) => {
    const next = (items || []).filter((_, i) => i !== idx);
    onChange(next);
  };
  const classesToString = (arr) => (Array.isArray(arr) ? arr.join(', ') : (arr || ''));
  const stringToClasses = (str) =>
    str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <button type="button" className="btn btn-primary" onClick={addItem}>
          Ajouter
        </button>
      </div>
      <div className="space-y-2">
        {(items || []).length === 0 && (
          <div className="text-xs text-gray-500">Aucune période. Cliquez sur Ajouter.</div>
        )}
        {(items || []).map((it, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border rounded-md p-2"
          >
            <div className="md:col-span-4">
              <label className="label">Libellé</label>
              <input
                className="input"
                value={it.label || ''}
                onChange={(e) => updateItem(idx, 'label', e.target.value)}
                placeholder="Ex: Vacances Noël / Stage BTS1"
              />
            </div>
            <div className="md:col-span-3">
              <label className="label">Début</label>
              <input
                type="date"
                className="input"
                value={it.debut || ''}
                onChange={(e) => updateItem(idx, 'debut', e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <label className="label">Fin</label>
              <input
                type="date"
                className="input"
                value={it.fin || ''}
                onChange={(e) => updateItem(idx, 'fin', e.target.value)}
              />
            </div>
            {showClasses && (
              <div className="md:col-span-10">
                <label className="label">Classes concernées</label>
                <input
                  className="input"
                  placeholder="Ex: BTS1, BTS2"
                  value={classesToString(it.classes)}
                  onChange={(e) => updateItem(idx, 'classes', stringToClasses(e.target.value))}
                />
              </div>
            )}
            <div className={`${showClasses ? 'md:col-span-2' : 'md:col-span-2'}`}>
              <button
                type="button"
                className="btn w-full p-2 flex items-center justify-center"
                title="Supprimer"
                aria-label="Supprimer"
                onClick={() => removeItem(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal d'édition du calendrier (année)
const CalendarModal = ({ open, title, calendrier, onChangeCalendrier, onClose }) => {
  const [local, setLocal] = useState(calendrier);
  useEffect(() => {
    if (open) setLocal(calendrier);
  }, [open, calendrier]);
  if (!open) return null;
  const apply = () => {
    onChangeCalendrier(local);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-md shadow-lg w-full max-w-6xl max-h-[85vh] flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={apply}>Valider</button>
          </div>
        </div>
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Année scolaire</label>
              <input
                className="input"
                value={local.annee}
                onChange={(e) => setLocal({ ...local, annee: e.target.value })}
              />
            </div>
            <div />
            <div>
              <label className="label">Début</label>
              <input
                type="date"
                className="input"
                value={local.dateDebut}
                onChange={(e) => setLocal({ ...local, dateDebut: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Fin</label>
              <input
                type="date"
                className="input"
                value={local.dateFin}
                onChange={(e) => setLocal({ ...local, dateFin: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-1">
            <div className="text-sm font-medium text-gray-700">Périodes</div>
            <div className="text-xs text-gray-500 mb-2">
              Ajoutez, modifiez ou supprimez les périodes qui bloquent l&apos;emploi du temps.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PeriodEditor
                title="Vacances"
                type="vacance"
                items={local.vacances}
                onChange={(items) => setLocal({ ...local, vacances: items })}
              />
              <PeriodEditor
                title="Jours fériés"
                type="feries"
                items={local.feries}
                onChange={(items) => setLocal({ ...local, feries: items })}
              />
              <PeriodEditor
                title="Périodes de stage"
                type="stage"
                showClasses
                items={local.stages}
                onChange={(items) => setLocal({ ...local, stages: items })}
              />
              <PeriodEditor
                title="Examens"
                type="examens"
                items={local.examens}
                onChange={(items) => setLocal({ ...local, examens: items })}
              />
            </div>
          </div>
        </div>
        <div className="p-3 border-t flex items-center justify-end gap-2">
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={apply}>Valider</button>
        </div>
      </div>
    </div>
  );
};

// Modal de sélection de compétences
const CompetencesModal = ({ open, onClose, selectedCodes = [], onSave }) => {
  const [query, setQuery] = useState('');
  const [local, setLocal] = useState(new Set(selectedCodes));
  useEffect(() => {
    setLocal(new Set(selectedCodes));
  }, [selectedCodes, open]);

  if (!open) return null;
  const filtered = COMPETENCE_LIST.filter(
    (c) =>
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.label.toLowerCase().includes(query.toLowerCase())
  );
  const toggle = (code) => {
    const next = new Set(local);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setLocal(next);
  };
  const save = () => onSave(Array.from(local));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-md shadow-lg w-full max-w-2xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sélectionner des compétences</h3>
          <button className="btn" onClick={onClose}>Fermer</button>
        </div>
        <div className="p-4 flex items-center gap-2">
          <input
            className="input w-full"
            placeholder="Rechercher une compétence (code ou définition)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="p-4 max-h-[60vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map((c) => {
              const checked = local.has(c.code);
              return (
                <label key={c.code} className={`flex items-start gap-2 p-2 border rounded cursor-pointer ${checked ? 'bg-blue-50 border-blue-200' : ''}`} title={c.label}>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={() => toggle(c.code)}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{c.code}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{c.label}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={save}>Valider</button>
        </div>
      </div>
    </div>
  );
};

// Modal d'ajout/édition d'une matière
const SubjectModal = ({ open, initial, onSave, onClose, weeks1 = [], weeks2 = [], teachers = [], selectedTeacherId = '' }) => {
  const TYPE_OPTIONS = [
    { value: 'cours', label: 'Cours' },
    { value: 'tp', label: 'TP' },
    { value: 'projet', label: 'Projet' },
    { value: 'sae', label: 'SAÉ' },
    { value: 'evaluation', label: 'Évaluation' },
  ];
  const CLASSE_OPTIONS = ['BTS1', 'BTS2', 'BTS1+BTS2'];

  const defaults = {
    id: 'MX',
    code: '',
    nom: '',
    type: 'cours',
    classe: 'BTS1',
    volumeSeances: 1,
    dureeSeanceH: 1,
    competences: [],
    taches: [],
  };

  const [local, setLocal] = useState(initial || defaults);
  const [showCompModal, setShowCompModal] = useState(false);
  const [teacherId, setTeacherId] = useState(selectedTeacherId || '');

  useEffect(() => {
    if (open) {
      setLocal(initial || defaults);
      setTeacherId(selectedTeacherId || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id, selectedTeacherId]);

  if (!open) return null;

  const weeksForClasse = (classe) => {
    const c = String(classe || '').toUpperCase();
    if (c.includes('BTS2')) return weeks2 || [];
    return weeks1 || [];
  };

  const apply = () => {
    onSave(local, teacherId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-md shadow-lg w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{initial ? 'Modifier la matière' : 'Ajouter une matière'}</h3>
          <button className="btn" onClick={onClose}>Fermer</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="label">Code</label>
              <input className="input" value={local.code || ''} onChange={(e) => setLocal({ ...local, code: e.target.value })} />
            </div>
            <div className="md:col-span-5">
              <label className="label">Intitulé</label>
              <input className="input" value={local.nom || ''} onChange={(e) => setLocal({ ...local, nom: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Type</label>
              <select
                className="input"
                value={local.type || 'cours'}
                onChange={(e) => setLocal({ ...local, type: e.target.value })}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Classe</label>
              <select
                className="input"
                value={local.classe || 'BTS1'}
                onChange={(e) => setLocal({ ...local, classe: e.target.value })}
              >
                {CLASSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-12">
              <label className="label">Professeur</label>
              <select
                className="input w-full"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              >
                <option value="">— Choisir un professeur —</option>
                {teachers.map((t) => {
                  const display = (t.first_name && t.last_name) ? `${t.first_name} ${t.last_name}` : t.username;
                  return (
                    <option key={t.id} value={t.id}>{display}</option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="label">Séances</label>
              <input
                type="number"
                min="0"
                className="input"
                value={local.volumeSeances ?? 0}
                onChange={(e) => setLocal({ ...local, volumeSeances: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="label">Durée séance (h)</label>
              <input
                type="number"
                min="1"
                className="input"
                value={local.dureeSeanceH ?? 1}
                onChange={(e) => setLocal({ ...local, dureeSeanceH: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-6">
              <label className="label">Période de placement</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-600">Début</span>
                  <select
                    className="input w-full"
                    value={Number.isInteger(local.weekStartIndex) ? local.weekStartIndex : ''}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        weekStartIndex: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  >
                    <option value="">— Non défini —</option>
                    {weeksForClasse(local.classe).map((w, i) => (
                      <option key={i} value={i}>{w.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Fin</span>
                  <select
                    className="input w-full"
                    value={Number.isInteger(local.weekEndIndex) ? local.weekEndIndex : ''}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        weekEndIndex: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  >
                    <option value="">— Non défini —</option>
                    {weeksForClasse(local.classe).map((w, i) => (
                      <option key={i} value={i}>{w.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Si non défini, le placement commencera le plus tôt possible et/ou s’étendra jusqu’à la fin de l’année.
              </div>
            </div>
          </div>

          <div>
            <label className="label">Compétences associées</label>
            <div className="flex flex-wrap gap-2">
              {(local.competences || []).length === 0 && (
                <span className="text-xs text-gray-500">Aucune compétence. Cliquez sur “Ajouter des compétences”.</span>
              )}
              {(local.competences || []).map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border"
                  title={COMPETENCE_LABELS[code] || 'Compétence'}
                >
                  {code}
                </span>
              ))}
            </div>
            <div className="mt-2">
              <button type="button" className="btn" onClick={() => setShowCompModal(true)}>
                Ajouter / Modifier les compétences
              </button>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Tâches associées (déduites des compétences sélectionnées)</div>
              <div className="flex flex-wrap gap-1">
                {(local.taches || []).length === 0 && (
                  <span className="text-xs text-gray-500">Aucune tâche associée pour l’instant.</span>
                )}
                {(local.taches || []).map((tCode) => (
                  <span
                    key={tCode}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-900 border border-blue-200"
                    title={TASK_LABELS[tCode] || 'Tâche'}
                  >
                    {tCode}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={apply}>Valider</button>
        </div>
      </div>

      <CompetencesModal
        open={showCompModal}
        onClose={() => setShowCompModal(false)}
        selectedCodes={local.competences || []}
        onSave={(codes) => {
          const tasksSet = new Set();
          codes.forEach((c) => (COMPETENCE_TO_TASKS[c] || []).forEach((t) => tasksSet.add(t)));
          const tasks = Array.from(tasksSet).sort((a, b) => a.localeCompare(b, 'fr'));
          setLocal((prev) => ({ ...prev, competences: codes, taches: tasks }));
          setShowCompModal(false);
        }}
      />
    </div>
  );
};

// Editor for subjects (Matières / Modules)
const SubjectEditor = ({ items, onChange, weeks1, weeks2, teachers = [], affectations = {}, onChangeAffectations = () => {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState('');

  const nextId = () => {
    const nums = (items || [])
      .map((m) => (typeof m.id === 'string' && m.id.startsWith('M') ? Number(m.id.slice(1)) : 0))
      .filter((n) => !Number.isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return `M${max + 1}`;
  };

  const weeksForClasse = (classe) => {
    const c = String(classe || '').toUpperCase();
    if (c.includes('BTS2')) return weeks2 || [];
    return weeks1 || [];
  };

  const weekLabel = (classe, idx) => {
    if (!Number.isInteger(idx)) return '— Non défini —';
    const arr = weeksForClasse(classe);
    return arr[idx]?.label || `S${idx + 1}`;
  };

  const openAdd = () => {
    const id = nextId();
    setDraft({
      id,
      code: '',
      nom: '',
      type: 'cours',
      classe: 'BTS1',
      volumeSeances: 1,
      dureeSeanceH: 1,
      competences: [],
      taches: [],
    });
    setEditingIndex(null);
    setEditingTeacherId('');
    setIsModalOpen(true);
  };

  const openEdit = (idx) => {
    setDraft(items[idx]);
    setEditingIndex(idx);
    const id = items[idx]?.id;
    setEditingTeacherId(affectations?.[id] || '');
    setIsModalOpen(true);
  };

  const remove = (idx) => {
    const next = (items || []).filter((_, i) => i !== idx);
    onChange(next);
  };

  const saveDraft = (subject, teacherId) => {
    if (editingIndex === null || editingIndex === undefined) {
      onChange([...(items || []), subject]);
    } else {
      const next = (items || []).map((m, i) => (i === editingIndex ? subject : m));
      onChange(next);
    }
    // mettre à jour l'affectation professeur
    const nextAff = { ...(affectations || {}) };
    if (teacherId) nextAff[subject.id] = teacherId;
    else delete nextAff[subject.id];
    onChangeAffectations(nextAff);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Matières / Modules</h3>
        <button type="button" className="btn btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Ajouter une matière
        </button>
      </div>

      {(items || []).length === 0 && (
        <div className="text-xs text-gray-500">Aucune matière. Cliquez sur “Ajouter une matière”.</div>
      )}

      <div className="space-y-2">
        {(items || []).map((m, idx) => (
          <div key={m.id || idx} className="p-3 border rounded-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-900 truncate">{m.nom || '(Sans intitulé)'}</div>
                  <Badge colorClass={CATEGORY_COLORS[m.type] || CATEGORY_COLORS.cours}>
                    {(m.type || '').toString().toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 truncate">
                  Code: <span className="font-mono">{m.code || '—'}</span> • Classe: {(m.classe || '').toString().toUpperCase()} • Séances: {m.volumeSeances ?? 0} × {m.dureeSeanceH ?? 1}h
                </div>
                <div className="text-[11px] text-gray-500">
                  Fenêtre: {weekLabel(m.classe, m.weekStartIndex)} → {weekLabel(m.classe, m.weekEndIndex)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="btn p-2" title="Modifier" aria-label="Modifier" onClick={() => openEdit(idx)}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="btn p-2" title="Supprimer" aria-label="Supprimer" onClick={() => remove(idx)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubjectModal
        open={isModalOpen}
        initial={draft}
        onClose={() => setIsModalOpen(false)}
        onSave={saveDraft}
        selectedTeacherId={editingTeacherId}
        teachers={teachers}
        weeks1={weeks1}
        weeks2={weeks2}
      />
    </div>
  );
};

function generateWeeks(dateStart, dateEnd) {
  const start = toDate(dateStart);
  const end = toDate(dateEnd);
  const weeks = [];
  // Align to Monday
  const cursor = new Date(start);
  const day = cursor.getDay(); // 0 Sun - 6 Sat
  const offsetToMonday = ((day + 6) % 7);
  cursor.setDate(cursor.getDate() - offsetToMonday);
  let index = 1;
  while (cursor <= end) {
    const startOfWeek = new Date(cursor);
    const endOfWeek = addDays(startOfWeek, 6);
    weeks.push({
      index,
      start: startOfWeek,
      end: endOfWeek,
      label: `S${index} (${formatShort(startOfWeek)}–${formatShort(endOfWeek)})`,
    });
    cursor.setDate(cursor.getDate() + 7);
    index += 1;
  }
  return weeks;
}

function buildBlockedBands(weeks, calendrier) {
  const bands = weeks.map(() => ({ types: [] }));
  const pushBand = (range, type, label) => {
    weeks.forEach((w, idx) => {
      if (inRange(w.start, range.debut, range.fin) || inRange(w.end, range.debut, range.fin) || (w.start <= toDate(range.debut) && w.end >= toDate(range.fin))) {
        bands[idx].types.push({ type, label });
      }
    });
  };
  calendrier.vacances.forEach(v => pushBand(v, 'vacance', v.label));
  calendrier.feries.forEach(f => pushBand(f, 'feries', f.label));
  calendrier.stages.forEach(s => pushBand(s, 'stage', s.label));
  calendrier.examens.forEach(e => pushBand(e, 'examens', e.label));
  return bands;
}

function autoGeneratePlan(weeks, bands, data, teachers = []) {
  const sessionsBySubject = {};
  const sessionsByProf = {};
  const evalPressureByWeek = Array.from({ length: weeks.length }, () => 0);

  // Build quick teacher map
  const teacherById = {};
  teachers.forEach((t) => { teacherById[String(t.id)] = t; });
  const teacherColorById = buildTeacherColorMap(teachers);

  const isBlockedWeek = (idx) => {
    const t = bands[idx]?.types?.map(x => x.type) || [];
    return t.includes('vacance') || t.includes('stage') || t.includes('examens') || t.includes('feries');
  };

  const getColor = (type) => CATEGORY_COLORS[type] || CATEGORY_COLORS.cours;

  const subjectsOrdered = [...data.matieres];

  subjectsOrdered.forEach((matiere) => {
    let remaining = matiere.volumeSeances;
    const subjectId = matiere.id;
    sessionsBySubject[subjectId] = {};

    // Resolve main professor from affectations mapping
    const teacherId = data.affectations?.[subjectId];
    const t = teacherById[String(teacherId)];
    const prof = t
      ? {
          id: t.id,
          nom: (t.first_name && t.last_name) ? `${t.first_name} ${t.last_name}` : (t.username || 'Prof'),
          initiales: initialsFromUser(t),
          couleur: teacherColorById[String(t.id)] || colorFromId(t.id),
        }
      : null;

    // Determine scheduling window [startIdx, endIdx]
    const hasStart = Number.isInteger(matiere.weekStartIndex);
    const hasEnd = Number.isInteger(matiere.weekEndIndex);
    let startIdx = hasStart ? Math.max(0, Math.min(weeks.length - 1, Number(matiere.weekStartIndex))) : 0;
    let endIdx = hasEnd ? Math.max(0, Math.min(weeks.length - 1, Number(matiere.weekEndIndex))) : weeks.length - 1;
    if (endIdx < startIdx) {
      const tmp = startIdx;
      startIdx = endIdx;
      endIdx = tmp;
    }

    // If a period is defined, place exactly one session per (non-bloquée) week in the inclusive window
    const hasWindow = hasStart || hasEnd;
    if (hasWindow) {
      for (let w = startIdx; w <= endIdx; w++) {
        if (isBlockedWeek(w)) continue;
        if (matiere.type === 'evaluation' && evalPressureByWeek[w] >= 2) continue;

        const cell = sessionsBySubject[subjectId][w] || [];
        const sessionLabel =
          matiere.type === 'evaluation'
            ? `Éval ${matiere.code}`
            : matiere.type === 'tp'
            ? `TP ${matiere.code}`
            : matiere.type === 'projet'
            ? `Projet ${matiere.code}`
            : `Cours ${matiere.code}`;

        cell.push({
          label: sessionLabel,
          type: matiere.type,
          livrable:
            matiere.type === 'tp' ? 'CR TP' : matiere.type === 'evaluation' ? 'Note + corrigé' : '',
          prof,
          colorClass: getColor(matiere.type),
          competences: Array.isArray(matiere.competences) ? [...matiere.competences] : [],
          taches: Array.isArray(matiere.taches) ? [...matiere.taches] : [],
        });

        sessionsBySubject[subjectId][w] = cell;
        if (matiere.type === 'evaluation') evalPressureByWeek[w] += 1;
      }
    } else {
      // Otherwise, place sessions sequentially from the start of the year
      for (let w = startIdx; w < weeks.length && remaining > 0; w++) {
        if (isBlockedWeek(w)) continue;
        if (matiere.type === 'evaluation' && evalPressureByWeek[w] >= 2) continue;

        const cell = sessionsBySubject[subjectId][w] || [];
        const sessionLabel =
          matiere.type === 'evaluation'
            ? `Éval ${matiere.code}`
            : matiere.type === 'tp'
            ? `TP ${matiere.code}`
            : matiere.type === 'projet'
            ? `Projet ${matiere.code}`
            : `Cours ${matiere.code}`;

        cell.push({
          label: sessionLabel,
          type: matiere.type,
          livrable:
            matiere.type === 'tp' ? 'CR TP' : matiere.type === 'evaluation' ? 'Note + corrigé' : '',
          prof,
          colorClass: getColor(matiere.type),
          competences: Array.isArray(matiere.competences) ? [...matiere.competences] : [],
          taches: Array.isArray(matiere.taches) ? [...matiere.taches] : [],
        });

        sessionsBySubject[subjectId][w] = cell;
        if (matiere.type === 'evaluation') evalPressureByWeek[w] += 1;
        remaining -= 1;
      }
    }
  });

  // Build tasks by prof (keyed by teacher id)
  Object.values(sessionsBySubject).forEach((byWeek) => {
    Object.entries(byWeek).forEach(([wIdxStr, list]) => {
      const wIdx = Number(wIdxStr);
      list.forEach((s) => {
        if (!s.prof) return;
        const key = String(s.prof.id);
        if (!sessionsByProf[key]) sessionsByProf[key] = [];
        sessionsByProf[key].push({
          weekIndex: wIdx,
          weekLabel: weeks[wIdx].label,
          label: s.label,
          type: s.type,
          colorClass: s.colorClass,
        });
      });
    });
  });

  return { sessionsBySubject, sessionsByProf };
}

// Utils for teachers
const initialsFromUser = (u) => {
  if (!u) return '';
  const first = (u.first_name || '').trim();
  const last = (u.last_name || '').trim();
  if (first || last) return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
  const name = (u.username || '').trim();
  return name ? name.slice(0, 2).toUpperCase() : '';
};
const colorFromId = (id) => {
  // Deterministic pastel color from string id
  const str = String(id || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 45%)`;
};

const PlanFormationCreate = () => {
  const [tab, setTab] = useState('generer'); // 'calendrier' | 'matieres' | 'profs' | 'templates' | 'generer' | 'plan' | 'taches'
  const [data, setData] = useState(DEFAULT_DATA);
  const [generatedY1, setGeneratedY1] = useState({ sessionsBySubject: {}, sessionsByProf: {} });
  const [generatedY2, setGeneratedY2] = useState({ sessionsBySubject: {}, sessionsByProf: {} });
  const [selectedProf, setSelectedProf] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teacherColors, setTeacherColors] = useState({});
  const [showCal1, setShowCal1] = useState(false);
  const [showCal2, setShowCal2] = useState(false);

  // Weeks & bands computed
  const weeks1 = useMemo(
    () => generateWeeks(data.calendrier.dateDebut, data.calendrier.dateFin),
    [data.calendrier.dateDebut, data.calendrier.dateFin]
  );
  const bands1 = useMemo(() => buildBlockedBands(weeks1, data.calendrier), [weeks1, data.calendrier]);
  const weeks2 = useMemo(
    () => generateWeeks(data.calendrier2.dateDebut, data.calendrier2.dateFin),
    [data.calendrier2.dateDebut, data.calendrier2.dateFin]
  );
  const bands2 = useMemo(() => buildBlockedBands(weeks2, data.calendrier2), [weeks2, data.calendrier2]);

  useEffect(() => {
    // Load teachers from API
    (async () => {
      try {
        const res = await axios.get('/api/users');
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const onlyTeachers = list.filter((u) => u.role === 'teacher');
        setTeachers(onlyTeachers);
        setTeacherColors(buildTeacherColorMap(onlyTeachers));
        if (!selectedProf && onlyTeachers.length > 0) setSelectedProf(onlyTeachers[0].id);
      } catch (e) {
        console.error('Erreur chargement professeurs:', e);
      } finally {
        setLoadingTeachers(false);
      }
    })();
  }, []); // load once

  useEffect(() => {
    if (!selectedProf && teachers.length > 0) setSelectedProf(teachers[0].id);
  }, [teachers, selectedProf]);

  const belongsToClasse = (m, classe) => {
    const c = String(m.classe || '').toUpperCase();
    if (c === classe.toUpperCase()) return true;
    if (c.includes('+')) return c.split('+').map((s) => s.trim().toUpperCase()).includes(classe.toUpperCase());
    return false;
  };
  const filterDataByClasse = (d, classe) => ({
    ...d,
    matieres: (d.matieres || []).filter((m) => belongsToClasse(m, classe)),
  });
  const handleGenerate = () => {
    const res1 = autoGeneratePlan(weeks1, bands1, filterDataByClasse(data, 'BTS1'), teachers);
    const res2 = autoGeneratePlan(weeks2, bands2, filterDataByClasse(data, 'BTS2'), teachers);
    setGeneratedY1(res1);
    setGeneratedY2(res2);
    setTab('plan');
  };

  const exportPrint = () => {
    window.print();
  };

  // Génération automatique quand l'onglet "plan" est affiché ou que les données changent
  useEffect(() => {
    if (tab !== 'plan') return;
    const res1 = autoGeneratePlan(weeks1, bands1, filterDataByClasse(data, 'BTS1'), teachers);
    const res2 = autoGeneratePlan(weeks2, bands2, filterDataByClasse(data, 'BTS2'), teachers);
    setGeneratedY1(res1);
    setGeneratedY2(res2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, data, weeks1, bands1, weeks2, bands2, teachers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Générateur visuel — Plan de formation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configurez l&apos;année, les matières et professeurs, puis générez un plan annuel coloré.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => setTab('generer')}>Données</button>
          <button className="btn btn-primary" onClick={handleGenerate}>Générer</button>
          <button className="btn" onClick={exportPrint}>Exporter / Imprimer</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <TabButton active={tab === 'generer'} onClick={() => setTab('generer')}>Données</TabButton>
        <TabButton active={tab === 'plan'} onClick={() => setTab('plan')}>Plan annuel</TabButton>
        <TabButton active={tab === 'taches'} onClick={() => setTab('taches')}>Mes tâches</TabButton>
      </div>

      {tab === 'generer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Boutons pour ouvrir les calendriers en modal */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Calendriers</h2>
            <div className="text-xs text-gray-500 mb-3">Configurez séparément chaque année sans surcharger la page.</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={() => setShowCal1(true)}>
                Ouvrir le calendrier — Année 1 (BTS1) • {data.calendrier.annee}
              </button>
              <button type="button" className="btn" onClick={() => setShowCal2(true)}>
                Ouvrir le calendrier — Année 2 (BTS2) • {data.calendrier2.annee}
              </button>
            </div>
          </div>

          {/* Matières (éditeur) */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Matières / Modules</h2>
            <SubjectEditor
              items={data.matieres}
              weeks1={weeks1}
              weeks2={weeks2}
              teachers={teachers}
              affectations={data.affectations || {}}
              onChangeAffectations={(aff) => setData((d) => ({ ...d, affectations: aff }))}
              onChange={(items) => setData((d) => ({ ...d, matieres: items }))}
            />
          </div>

          {/* Profs - sélection depuis Utilisateurs */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Professeurs</h2>
            {loadingTeachers ? (
              <div className="text-sm text-gray-500">Chargement des professeurs…</div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-gray-500">
                  Sélectionnez le professeur responsable pour chaque matière. Les noms proviennent de la rubrique
                  &quot;Utilisateurs&quot; (rôle: professeur).
                </div>
                {(data.matieres || []).map((m) => {
                  const sel = data.affectations?.[m.id] || '';
                  return (
                    <div key={m.id} className="p-3 border rounded-md flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-gray-900">{m.nom}</div>
                        <div className="text-xs text-gray-500">{m.code} • {m.classe.toUpperCase()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="input w-64"
                          value={sel}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              affectations: { ...(d.affectations || {}), [m.id]: e.target.value },
                            }))
                          }
                        >
                          <option value="">— Choisir un professeur —</option>
                          {teachers.map((t) => {
                            const display =
                              (t.first_name && t.last_name) ? `${t.first_name} ${t.last_name}` : t.username;
                            return (
                              <option key={t.id} value={t.id}>
                                {display}
                              </option>
                            );
                          })}
                        </select>
                        {sel && (
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.5"
                            style={{ background: teacherColors[String(sel)] || colorFromId(sel), color: 'white' }}
                            title="Couleur prof"
                          >
                            {initialsFromUser(teachers.find(t => String(t.id) === String(sel)))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales de calendrier */}
      <CalendarModal
        open={showCal1}
        title={`Calendrier — Année 1 (BTS1)`}
        calendrier={data.calendrier}
        onChangeCalendrier={(cal) => setData((d) => ({ ...d, calendrier: cal }))}
        onClose={() => setShowCal1(false)}
      />
      <CalendarModal
        open={showCal2}
        title={`Calendrier — Année 2 (BTS2)`}
        calendrier={data.calendrier2}
        onChangeCalendrier={(cal) => setData((d) => ({ ...d, calendrier2: cal }))}
        onClose={() => setShowCal2(false)}
      />

      {tab === 'plan' && (
        <>
          {/* Année 1 */}
          <div className="card overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Plan — {data.calendrier.annee} (BTS1)</h2>
              <div className="text-xs text-gray-600 flex gap-2 items-center">
                <Badge colorClass={CATEGORY_COLORS.cours}>Cours</Badge>
                <Badge colorClass={CATEGORY_COLORS.tp}>TP</Badge>
                <Badge colorClass={CATEGORY_COLORS.projet}>Projet/SAÉ</Badge>
                <Badge colorClass={CATEGORY_COLORS.evaluation}>Évaluation</Badge>
                <Badge colorClass={CATEGORY_COLORS.vacance}>Vacances</Badge>
                <Badge colorClass={CATEGORY_COLORS.stage}>Stage</Badge>
                <Badge colorClass={CATEGORY_COLORS.examens}>Examens</Badge>
              </div>
            </div>
            <div className="min-w-[900px]">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 z-20 border-b border-r px-2 py-2 text-left text-xs font-semibold text-gray-700 w-48">
                      Matières
                    </th>
                    {weeks1.map((w) => (
                      <th key={w.index} className="border-b px-2 py-2 text-center text-[11px] font-semibold text-gray-700">
                        {w.label}
                      </th>
                    ))}
                  </tr>
                  {/* Bandes bloquantes */}
                  <tr>
                    <th className="sticky left-0 bg-white z-10 border-b border-r px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Bandeaux
                    </th>
                    {weeks1.map((_, idx) => {
                      const types = bands1[idx]?.types || [];
                      if (types.length === 0) {
                        return <th key={idx} className="border-b px-1 py-1"></th>;
                      }
                      const label = types.map(t => t.label).join(' • ');
                      const mainType = types[0]?.type || 'vacance';
                      const color = CATEGORY_COLORS[mainType] || CATEGORY_COLORS.vacance;
                      return (
                        <th key={idx} className={`border-b px-1 py-1 ${color}`} title={label}>
                          <span className="text-[10px] font-medium">{types.map(t => t.label).join(' / ')}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.matieres.filter(m => belongsToClasse(m, 'BTS1')).map((m) => (
                    <tr key={m.id} className="bg-white">
                      <td className="sticky left-0 bg-white z-10 border-r px-2 py-2 text-sm font-medium text-gray-900 w-48">
                        <div className="flex items-center gap-2">
                          <Badge colorClass={CATEGORY_COLORS[m.type] || CATEGORY_COLORS.cours}>{m.type.toUpperCase()}</Badge>
                          <div className="truncate">
                            <div className="truncate">{m.nom}</div>
                            <div className="text-xs text-gray-500">{m.code} • {m.classe.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      {weeks1.map((_, idx) => {
                        const list = generatedY1.sessionsBySubject?.[m.id]?.[idx] || [];
                        return (
                          <td key={idx} className="border-t border-gray-200 align-top px-1 py-1 min-w-[110px]">
                            <div className="flex flex-col gap-1">
                              {list.map((s, i) => (
                                <div key={i} className={`rounded px-2 py-1 text-[11px] ${s.colorClass}`}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate">{s.label}</span>
                                    {s.prof && (
                                      <span
                                        className="ml-1 inline-flex items-center justify-center rounded-full text-[9px] font-bold px-1.5 py-0.5"
                                        style={{ background: s.prof.couleur, color: 'white' }}
                                        title={s.prof.nom}
                                      >
                                        {s.prof.initiales}
                                      </span>
                                    )}
                                  </div>
                                  {s.livrable && <div className="text-[10px] opacity-80">{s.livrable}</div>}
                                  {(Array.isArray(s.competences) && s.competences.length > 0) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {s.competences.map((c) => (
                                        <span
                                          key={c}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800 border"
                                          title={COMPETENCE_LABELS[c] || 'Compétence'}
                                        >
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {(Array.isArray(s.taches) && s.taches.length > 0) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {s.taches.map((t) => (
                                        <span
                                          key={t}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-900 border border-blue-200"
                                          title={TASK_LABELS[t] || 'Tâche'}
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Année 2 */}
          <div className="card overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Plan — {data.calendrier2.annee} (BTS2)</h2>
            </div>
            <div className="min-w-[900px]">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 z-20 border-b border-r px-2 py-2 text-left text-xs font-semibold text-gray-700 w-48">
                      Matières
                    </th>
                    {weeks2.map((w) => (
                      <th key={w.index} className="border-b px-2 py-2 text-center text-[11px] font-semibold text-gray-700">
                        {w.label}
                      </th>
                    ))}
                  </tr>
                  {/* Bandes bloquantes */}
                  <tr>
                    <th className="sticky left-0 bg-white z-10 border-b border-r px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Bandeaux
                    </th>
                    {weeks2.map((_, idx) => {
                      const types = bands2[idx]?.types || [];
                      if (types.length === 0) {
                        return <th key={idx} className="border-b px-1 py-1"></th>;
                      }
                      const label = types.map(t => t.label).join(' • ');
                      const mainType = types[0]?.type || 'vacance';
                      const color = CATEGORY_COLORS[mainType] || CATEGORY_COLORS.vacance;
                      return (
                        <th key={idx} className={`border-b px-1 py-1 ${color}`} title={label}>
                          <span className="text-[10px] font-medium">{types.map(t => t.label).join(' / ')}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.matieres.filter(m => belongsToClasse(m, 'BTS2')).map((m) => (
                    <tr key={m.id} className="bg-white">
                      <td className="sticky left-0 bg-white z-10 border-r px-2 py-2 text-sm font-medium text-gray-900 w-48">
                        <div className="flex items-center gap-2">
                          <Badge colorClass={CATEGORY_COLORS[m.type] || CATEGORY_COLORS.cours}>{m.type.toUpperCase()}</Badge>
                          <div className="truncate">
                            <div className="truncate">{m.nom}</div>
                            <div className="text-xs text-gray-500">{m.code} • {m.classe.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      {weeks2.map((_, idx) => {
                        const list = generatedY2.sessionsBySubject?.[m.id]?.[idx] || [];
                        return (
                          <td key={idx} className="border-t border-gray-200 align-top px-1 py-1 min-w-[110px]">
                            <div className="flex flex-col gap-1">
                              {list.map((s, i) => (
                                <div key={i} className={`rounded px-2 py-1 text-[11px] ${s.colorClass}`}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate">{s.label}</span>
                                    {s.prof && (
                                      <span
                                        className="ml-1 inline-flex items-center justify-center rounded-full text-[9px] font-bold px-1.5 py-0.5"
                                        style={{ background: s.prof.couleur, color: 'white' }}
                                        title={s.prof.nom}
                                      >
                                        {s.prof.initiales}
                                      </span>
                                    )}
                                  </div>
                                  {s.livrable && <div className="text-[10px] opacity-80">{s.livrable}</div>}
                                  {(Array.isArray(s.competences) && s.competences.length > 0) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {s.competences.map((c) => (
                                        <span
                                          key={c}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800 border"
                                          title={COMPETENCE_LABELS[c] || 'Compétence'}
                                        >
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {(Array.isArray(s.taches) && s.taches.length > 0) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {s.taches.map((t) => (
                                        <span
                                          key={t}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-900 border border-blue-200"
                                          title={TASK_LABELS[t] || 'Tâche'}
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'taches' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Mes tâches</h2>
            <select
              className="input w-56"
              value={selectedProf || ''}
              onChange={(e) => setSelectedProf(e.target.value)}
            >
              {teachers.map((t) => {
                const display =
                  (t.first_name && t.last_name) ? `${t.first_name} ${t.last_name}` : t.username;
                return (
                  <option key={t.id} value={t.id}>
                    {display}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-3">
            {selectedProf && (
              [...(generatedY1.sessionsByProf[String(selectedProf)] || []), ...(generatedY2.sessionsByProf[String(selectedProf)] || [])]
                .sort((a, b) => a.weekIndex - b.weekIndex)
                .map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge colorClass={t.colorClass}>{t.type.toUpperCase()}</Badge>
                      <div className="text-sm font-medium text-gray-900">{t.label}</div>
                    </div>
                    <div className="text-xs text-gray-600">{t.weekLabel}</div>
                  </div>
                ))
            )}
            {selectedProf && (!generatedY1.sessionsByProf[String(selectedProf)] && !generatedY2.sessionsByProf[String(selectedProf)]) && (
              <div className="text-sm text-gray-500">Aucune tâche générée pour ce professeur. Lancez la génération.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanFormationCreate;

