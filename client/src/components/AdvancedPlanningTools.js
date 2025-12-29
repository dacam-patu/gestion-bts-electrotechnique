import React, { useState } from 'react';
import { Repeat, Download, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdvancedPlanningTools = ({ 
  slots, 
  onSlotCreate, 
  onSlotDelete, 
  students, 
  projects,
  onValidateSchedule 
}) => {
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [recurrenceData, setRecurrenceData] = useState({
    baseSlot: null,
    frequency: 'weekly',
    interval: 1,
    endDate: '',
    daysOfWeek: [],
    excludeDates: []
  });

  // Créer des créneaux récurrents
  const handleCreateRecurrence = async () => {
    if (!recurrenceData.baseSlot) {
      toast.error('Veuillez sélectionner un créneau de base');
      return;
    }

    try {
      const slots = generateRecurringSlots(recurrenceData);
      
      // Créer tous les créneaux récurrents
      for (const slot of slots) {
        await onSlotCreate(slot);
      }

      toast.success(`${slots.length} créneaux récurrents créés`);
      setShowRecurrenceModal(false);
      setRecurrenceData({
        baseSlot: null,
        frequency: 'weekly',
        interval: 1,
        endDate: '',
        daysOfWeek: [],
        excludeDates: []
      });
    } catch (error) {
      toast.error('Erreur lors de la création des créneaux récurrents');
    }
  };

  const generateRecurringSlots = (data) => {
    const slots = [];
    const baseDate = new Date(data.baseSlot.start_date);
    const endDate = new Date(data.endDate);
    
    let currentDate = new Date(baseDate);
    
    while (currentDate <= endDate) {
      // Vérifier si le jour de la semaine est sélectionné
      const dayOfWeek = currentDate.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      
      if (data.daysOfWeek.includes(dayName)) {
        // Vérifier si la date n'est pas exclue
        const dateString = currentDate.toISOString().split('T')[0];
        if (!data.excludeDates.includes(dateString)) {
          const newSlot = {
            ...data.baseSlot,
            id: undefined,
            start_date: dateString,
            end_date: dateString
          };
          slots.push(newSlot);
        }
      }
      
      // Passer à la semaine suivante
      currentDate.setDate(currentDate.getDate() + (data.interval * 7));
    }
    
    return slots;
  };

  // Exporter le planning
  const handleExportPlanning = () => {
    const exportData = {
      slots: slots,
      students: students,
      projects: projects,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Planning exporté avec succès');
  };

  // Importer le planning
  const handleImportPlanning = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validation des données importées
        if (!importData.slots || !Array.isArray(importData.slots)) {
          toast.error('Format de fichier invalide');
          return;
        }

        // Traiter les créneaux importés
        importData.slots.forEach(slot => {
          onSlotCreate(slot);
        });

        toast.success(`${importData.slots.length} créneaux importés`);
        setShowImportModal(false);
      } catch (error) {
        toast.error('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
  };

  // Validation avancée du planning
  const handleValidateSchedule = () => {
    const issues = [];
    
    // Vérifier les conflits
    slots.forEach((slot1, index) => {
      slots.slice(index + 1).forEach(slot2 => {
        if (slot1.student_id === slot2.student_id && 
            slot1.start_date === slot2.start_date &&
            slot1.start_time && slot2.start_time &&
            slot1.end_time && slot2.end_time) {
          
          const start1 = new Date(`${slot1.start_date}T${slot1.start_time}`);
          const end1 = new Date(`${slot1.start_date}T${slot1.end_time}`);
          const start2 = new Date(`${slot2.start_date}T${slot2.start_time}`);
          const end2 = new Date(`${slot2.start_date}T${slot2.end_time}`);
          
          if (start1 < end2 && end1 > start2) {
            issues.push({
              type: 'conflict',
              message: `Conflit entre ${slot1.first_name} ${slot1.last_name} et ${slot2.first_name} ${slot2.last_name}`,
              slots: [slot1, slot2]
            });
          }
        }
      });
    });

    // Vérifier les créneaux trop longs
    slots.forEach(slot => {
      if (slot.start_time && slot.end_time) {
        const start = new Date(`2000-01-01T${slot.start_time}`);
        const end = new Date(`2000-01-01T${slot.end_time}`);
        const duration = (end - start) / (1000 * 60 * 60); // heures
        
        if (duration > 8) {
          issues.push({
            type: 'long_duration',
            message: `Créneau trop long pour ${slot.first_name} ${slot.last_name} (${duration}h)`,
            slot: slot
          });
        }
      }
    });

    // Vérifier les étudiants sans créneaux
    students.forEach(student => {
      const hasSlots = slots.some(slot => slot.student_id === student.id);
      if (!hasSlots) {
        issues.push({
          type: 'no_slots',
          message: `${student.first_name} ${student.last_name} n'a aucun créneau`,
          student: student
        });
      }
    });

    if (issues.length === 0) {
      toast.success('Planning validé avec succès !');
    } else {
      toast.error(`${issues.length} problème${issues.length > 1 ? 's' : ''} détecté${issues.length > 1 ? 's' : ''}`);
      console.log('Problèmes détectés:', issues);
    }

    if (onValidateSchedule) {
      onValidateSchedule(issues);
    }
  };

  return (
    <div className="space-y-4">
      {/* Outils de récurrence */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Outils avancés</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Récurrence */}
          <button
            onClick={() => setShowRecurrenceModal(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <Repeat className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Créer des récurrences</span>
              <p className="text-xs text-gray-500 mt-1">Créneaux répétitifs</p>
            </div>
          </button>

          {/* Export */}
          <button
            onClick={handleExportPlanning}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Exporter</span>
              <p className="text-xs text-gray-500 mt-1">Sauvegarder le planning</p>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <div className="text-center">
              <Upload className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Importer</span>
              <p className="text-xs text-gray-500 mt-1">Charger un planning</p>
            </div>
          </button>

          {/* Validation */}
          <button
            onClick={handleValidateSchedule}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
          >
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Valider</span>
              <p className="text-xs text-gray-500 mt-1">Vérifier le planning</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de récurrence */}
      {showRecurrenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Créer des créneaux récurrents</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence
                </label>
                <select
                  value={recurrenceData.frequency}
                  onChange={(e) => setRecurrenceData({...recurrenceData, frequency: e.target.value})}
                  className="w-full input"
                >
                  <option value="weekly">Hebdomadaire</option>
                  <option value="biweekly">Bi-hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jours de la semaine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={recurrenceData.daysOfWeek.includes(day)}
                        onChange={(e) => {
                          const days = e.target.checked 
                            ? [...recurrenceData.daysOfWeek, day]
                            : recurrenceData.daysOfWeek.filter(d => d !== day);
                          setRecurrenceData({...recurrenceData, daysOfWeek: days});
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {day === 'monday' ? 'Lundi' :
                         day === 'tuesday' ? 'Mardi' :
                         day === 'wednesday' ? 'Mercredi' :
                         day === 'thursday' ? 'Jeudi' :
                         day === 'friday' ? 'Vendredi' :
                         day === 'saturday' ? 'Samedi' : 'Dimanche'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={recurrenceData.endDate}
                  onChange={(e) => setRecurrenceData({...recurrenceData, endDate: e.target.value})}
                  className="w-full input"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRecurrenceModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateRecurrence}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Importer un planning</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier JSON
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportPlanning}
                  className="w-full input"
                />
              </div>
              
              <p className="text-sm text-gray-500">
                Sélectionnez un fichier JSON exporté depuis cette application.
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedPlanningTools; 