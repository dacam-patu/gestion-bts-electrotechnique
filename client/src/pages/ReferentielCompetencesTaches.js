import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskDetails } from '../data/taskDetails';

const competencies = [
  { code: 'C1', label: 'recenser et prendre en compte les normes, les réglementations applicables au projet/chantier' },
  { code: 'C2', label: 'extraire les informations nécessaires à la réalisation des tâches' },
  { code: 'C3', label: 'gérer les risques et les aléas liés à la réalisation des tâches' },
  { code: 'C4', label: 'communiquer de manière adaptée à l\'oral, à l\'écrit, y compris en langue anglaise' },
  { code: 'C5', label: 'interpréter un besoin client/utilisateur, un CCTP, un cahier des charges' },
  { code: 'C6', label: 'modéliser le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique' },
  { code: 'C7', label: 'simuler le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique' },
  { code: 'C8', label: 'dimensionner les constituants d’un ouvrage, d’une installation, d’un équipement électrique' },
  { code: 'C9', label: 'faire le choix des constituants d’un ouvrage, d’une installation, d’un équipement électrique' },
  { code: 'C10', label: 'proposer l’architecture d’un ouvrage, d’une installation, d’un équipement électrique' },
  { code: 'C11', label: 'réaliser les documents du projet/chantier (plans, schémas, maquette virtuelle, etc.)' },
  { code: 'C12', label: 'gérer et conduire (y compris : organisation, planification, suivi, pilotage, réception, etc.) le projet/chantier' },
  { code: 'C13', label: 'mesurer les grandeurs caractéristiques d’un ouvrage, d’une installation, d’un équipement électrique' },
  { code: 'C14', label: 'réaliser un ouvrage, une installation, un équipement électrique' },
  { code: 'C15', label: 'configurer et programmer les matériels dans le cadre du projet/chantier' },
  { code: 'C16', label: 'appliquer un protocole pour mettre en service un ouvrage, une installation, un équipement électrique' },
  { code: 'C17', label: 'réaliser un diagnostic de performance y compris énergétique, de sécurité, d’un ouvrage, d’une installation, d’un équipement électrique' },
  { code: 'C18', label: 'réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique' }
];

const tasks = [
  { code: 'T 1.1', label: 'analyser et/ou élaborer les documents relatifs aux besoins du client/utilisateur' },
  { code: 'T 1.2', label: 'élaborer un avant-projet/chantier (ou avant-projet sommaire)' },
  { code: 'T 1.3', label: 'dimensionner les constituants de l’installation' },
  { code: 'T 1.4', label: 'définir les coûts pour préparer une offre commerciale' },
  { code: 'T 2.1', label: 'choisir les matériels' },
  { code: 'T 2.2', label: 'réaliser les documents techniques du projet/chantier' },
  { code: 'T 3.1', label: 'proposer un protocole pour analyser le fonctionnement et/ou le comportement de l’installation' },
  { code: 'T 3.2', label: 'mesurer et contrôler l’installation, exploiter les mesures pour faire le diagnostic' },
  { code: 'T 3.3', label: 'formuler des préconisations' },
  { code: 'T 4.1', label: 'organiser la maintenance' },
  { code: 'T 4.2', label: 'réaliser la maintenance préventive ou prévisionnelle' },
  { code: 'T 4.3', label: 'réaliser la maintenance corrective' },
  { code: 'T 5.1', label: 's’approprier et vérifier les informations relatives au projet/chantier' },
  { code: 'T 5.2', label: 'planifier les étapes du projet/chantier' },
  { code: 'T 5.3', label: 'assurer le suivi de la réalisation du projet/chantier (coûts, délais, qualité)' },
  { code: 'T 5.4', label: 'faire appliquer les règles liées à la santé, la sécurité et l’environnement' },
  { code: 'T 5.5', label: 'gérer et animer l’équipe projet/chantier' },
  { code: 'T 6.1', label: 'organiser l’espace de travail' },
  { code: 'T 6.2', label: 'implanter, poser, installer, câbler, raccorder les matériels électriques' },
  { code: 'T 6.3', label: 'programmer les applications métiers' },
  { code: 'T 7.1', label: 'réaliser les contrôles, les configurations, les essais fonctionnels' },
  { code: 'T 7.2', label: 'vérifier le fonctionnement de l’installation' },
  { code: 'T 7.3', label: 'réceptionner l’installation avec le client/utilisateur' },
  { code: 'T 8.1', label: 'constituer et mettre à jour les dossiers du projet/chantier' },
  { code: 'T 8.2', label: 'échanger, y compris en langue anglaise, avec les parties prenantes du projet/chantier' },
  { code: 'T 8.3', label: 'expliquer, y compris en langue anglaise, le fonctionnement de l’installation et former le client/utilisateur à son utilisation' },
  { code: 'T 8.4', label: 'préparer et animer des réunions' },
  { code: 'T 8.5', label: 'présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur' }
];

// Mapping tache -> compétences (aligné avec TPSheetModal)
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

export default function ReferentielCompetencesTaches() {
  const navigate = useNavigate();
  const [openedTask, setOpenedTask] = useState(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState('byCompetence'); // 'byCompetence' | 'byTask'

  const compIndex = useMemo(() => {
    const map = new Map();
    competencies.forEach(c => map.set(c.code, c));
    return map;
  }, []);

  const taskIndex = useMemo(() => {
    const map = new Map();
    tasks.forEach(t => map.set(t.code, t));
    return map;
  }, []);

  const compToTasks = useMemo(() => {
    const res = new Map();
    competencies.forEach(c => res.set(c.code, []));
    Object.entries(TASK_TO_COMPETENCIES).forEach(([tCode, compCodes]) => {
      compCodes.forEach(cc => {
        if (!res.has(cc)) res.set(cc, []);
        res.get(cc).push(tCode);
      });
    });
    // sort tasks by code
    for (const [k, arr] of res.entries()) {
      arr.sort((a, b) => a.localeCompare(b, 'fr'));
    }
    return res;
  }, []);

  const filteredComps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return competencies;
    return competencies.filter(c => c.code.toLowerCase().includes(q) || c.label.toLowerCase().includes(q));
  }, [query]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t => t.code.toLowerCase().includes(q) || t.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Correspondance Compétences ↔︎ Tâches</h2>
          <p className="text-gray-600">Tableau de relations entre les compétences (C1–C18) et les tâches (T1.x–T8.x).</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border rounded-md px-3 py-2 text-sm"
            placeholder="Rechercher (code ou libellé)…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select
            className="border rounded-md px-2 py-2 text-sm"
            value={view}
            onChange={e => setView(e.target.value)}
          >
            <option value="byCompetence">Vue par compétence</option>
            <option value="byTask">Vue par tâche</option>
          </select>
        </div>
      </div>

      {view === 'byCompetence' ? (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Comp.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intitulé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Tâches associées</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredComps.map(c => {
                const tCodes = compToTasks.get(c.code) || [];
                const tasksLabels = tCodes.map(code => taskIndex.get(code)?.label || '').filter(Boolean);
                return (
                  <tr key={c.code} className="align-top">
                    <td className="px-4 py-3 font-semibold text-gray-800">{c.code}</td>
                    <td className="px-4 py-3">{c.label}</td>
                    <td className="px-4 py-3">
                      {tCodes.length === 0 ? (
                        <span className="text-gray-400">Aucune tâche liée</span>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {tCodes.map((code, idx) => (
                            <li key={code}>
                              <button
                                type="button"
                                className="text-left text-blue-600 hover:underline"
                                onClick={() => navigate(`/referentiel/description-activites?task=${encodeURIComponent(code)}`)}
                              >
                                <span className="font-medium">{code}</span> — {tasksLabels[idx] || ''}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Tâche</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intitulé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Compétences associées</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredTasks.map(t => {
                const cCodes = TASK_TO_COMPETENCIES[t.code] || [];
                return (
                  <tr
                    key={t.code}
                    id={encodeURIComponent(t.code)}
                    className="align-top hover:bg-blue-50 cursor-pointer"
                    onClick={() => setOpenedTask({ code: t.code, label: t.label })}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      <span className="text-blue-700 underline">{t.code}</span>
                    </td>
                    <td className="px-4 py-3">{t.label}</td>
                    <td className="px-4 py-3">
                      {cCodes.length === 0 ? (
                        <span className="text-gray-400">Aucune compétence liée</span>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {cCodes.map(code => {
                            const c = competencies.find(cc => cc.code === code);
                            return (
                              <li key={code}>
                                <a
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                  href={`/referentiel/competences#${encodeURIComponent(code)}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="font-medium">{code}</span> — {c ? c.label : ''}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal fiche tâche (restons sur la page) */}
      {openedTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {openedTask.code} · {openedTask.label}
                </h3>
              </div>
              <button
                onClick={() => setOpenedTask(null)}
                className="text-gray-500 hover:text-gray-700 rounded-md px-2 py-1"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {(() => {
              const details = taskDetails[openedTask.code] || null;
              const selectedAuto = new Set();
              if (details?.autonomie) selectedAuto.add(details.autonomie);
              const selectedResp = new Set(details?.responsabilites || []);
              return (
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <section>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Description</h4>
                    {details?.description ? (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                        {details.description.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Contenu à compléter.</p>
                    )}
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Moyens et ressources</h4>
                    {details?.ressources ? (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                        {details.ressources.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Contenu à compléter.</p>
                    )}
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Autonomie</div>
                      <div className="flex items-center space-x-4 text-sm">
                        <label className="inline-flex items-center space-x-2">
                          <input type="checkbox" className="h-4 w-4" disabled checked={selectedAuto.has('Partielle')} onChange={() => {}} />
                          <span>Partielle</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                          <input type="checkbox" className="h-4 w-4" disabled checked={selectedAuto.has('Totale')} onChange={() => {}} />
                          <span>Totale</span>
                        </label>
                      </div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Responsabilité</div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {['Des personnes', 'Des moyens', 'Du résultat'].map((label) => (
                          <label key={label} className="inline-flex items-center space-x-2">
                            <input type="checkbox" className="h-4 w-4" disabled checked={selectedResp.has(label)} onChange={() => {}} />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Résultats attendus</h4>
                    {details?.resultats ? (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                        {details.resultats.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Contenu à compléter.</p>
                    )}
                  </section>
                </div>
              );
            })()}

            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setOpenedTask(null)}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

