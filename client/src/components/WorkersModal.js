import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const WorkersModal = ({ isOpen, onClose, onSave, initialSelected = [], disabledIds = [] }) => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set(initialSelected));
  const [currentClass, setCurrentClass] = useState('');

  useEffect(() => {
    setSelected(new Set(initialSelected));
  }, [initialSelected]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cls, std] = await Promise.all([
          axios.get('/api/classes'),
          axios.get('/api/students')
        ]);
        if (cls.data?.success) setClasses(cls.data.data || []);
        if (std.data?.data) setStudents(std.data.data || []);
      } catch (e) {
        console.error('Erreur chargement classes/étudiants:', e);
      }
    };
    if (isOpen) load();
  }, [isOpen]);

  const disabledSet = useMemo(() => new Set(disabledIds || []), [disabledIds]);
  const classOptions = useMemo(() => {
    const names = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
    return names.sort();
  }, [students]);

  const visibleStudents = useMemo(() => {
    const filterName = currentClass;
    return students
      .filter(s => (filterName ? s.class === filterName : true))
      .sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
  }, [students, currentClass]);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return new Set(next);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sélection des ouvriers (par classes)</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
        </div>

        <div className="p-6 overflow-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Toutes</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {visibleStudents.map(s => {
              const isDisabled = disabledSet.has(s.id);
              const checked = selected.has(s.id);
              return (
                <label key={s.id} className={`flex items-center gap-2 p-2 rounded border ${isDisabled ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    disabled={isDisabled}
                    checked={checked}
                    onChange={() => toggle(s.id)}
                  />
                  <span className={`${isDisabled ? 'text-red-500' : 'text-gray-800'}`}>
                    {s.first_name} {s.last_name} <span className="text-gray-400 text-xs">({s.class || '-'})</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button onClick={() => onSave(Array.from(selected))} className="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default WorkersModal;


