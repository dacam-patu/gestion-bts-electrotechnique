import React, { useState, useEffect } from 'react';

const EvaluationU52Modal = ({ isOpen, onClose, src = '/evaluations/u52/standalone', title = 'Évaluation U52' }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) setLoading(true);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-label="Fermer la fenêtre d'évaluation"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Fermer"
            >
              Fermer
            </button>
          </div>
          <div className="relative flex-1">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            )}
            <iframe
              title="Fiche U52"
              src={src}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationU52Modal;


