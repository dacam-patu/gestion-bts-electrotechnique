import React from 'react';

const ReferentielUnites = () => {
  const unites = [
    { code: 'U4', label: 'Conception - étude préliminaire' },
    { code: 'U61', label: 'Conception - étude détaillée du projet' },
    { code: 'U52', label: 'Conduite de projet/chantier' },
    { code: 'U62', label: 'Réalisation, mise en service d’un projet' },
    { code: 'U51', label: 'Analyse, diagnostic, maintenance' },
    { code: 'U1', label: 'Culture générale et expression' },
    { code: 'U2', label: 'Langue vivante étrangère 1 : Anglais' },
    { code: 'U3', label: 'Mathématiques' },
    { code: 'UF', label: 'Langue vivante facultative' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Liste des unités</h2>
          <p className="mt-1 text-sm text-gray-500">Référentiel BTS Électrotechnique</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700 w-24">Code</th>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700">Intitulé de l’unité</th>
                </tr>
              </thead>
              <tbody>
                {unites.map((u) => (
                  <tr key={u.code} className="odd:bg-white even:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{u.code}</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">{u.label}</td>
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

export default ReferentielUnites;

