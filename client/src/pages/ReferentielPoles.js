import React from 'react';

const ReferentielPoles = () => {
  const poles = [
    'Pôle « Conception - étude préliminaire »',
    'Pôle « Conception - étude détaillée du projet »',
    'Pôle « Analyse, diagnostic, maintenance »',
    'Pôle « Conduite de projet/chantier »',
    'Pôle « Réalisation, mise en service d’un projet »'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Liste des pôles</h2>
          <p className="mt-1 text-sm text-gray-500">Référentiel BTS Électrotechnique</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700 w-16">N°</th>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700">Intitulé du pôle</th>
                </tr>
              </thead>
              <tbody>
                {poles.map((label, index) => (
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

export default ReferentielPoles;

