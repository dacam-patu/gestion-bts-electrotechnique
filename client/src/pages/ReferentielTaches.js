import React from 'react';

const ReferentielTaches = () => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Liste des tâches</h2>
          <p className="mt-1 text-sm text-gray-500">Référentiel BTS Électrotechnique</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700 w-24">Code</th>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700">Intitulé de la tâche</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.code} id={encodeURIComponent(t.code)} className="odd:bg-white even:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{t.code}</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">{t.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferentielTaches;

