import React from 'react';

const ReferentielActivites = () => {
  const activities = [
    'Activité 1 : conception - étude préliminaire',
    'Activité 2 : conception - étude détaillée du projet',
    'Activité 3 : analyse – diagnostic',
    'Activité 4 : maintenance d’une installation électrique',
    'Activité 5 : conduite de projet/chantier',
    'Activité 6 : réalisation : installation – intégration',
    'Activité 7 : mise en service',
    'Activité 8 : communication'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Liste des activités</h2>
          <p className="mt-1 text-sm text-gray-500">Référentiel BTS Électrotechnique</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700 w-16">N°</th>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700">Intitulé de l’activité</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((label, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">{label}</td>
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

export default ReferentielActivites;

