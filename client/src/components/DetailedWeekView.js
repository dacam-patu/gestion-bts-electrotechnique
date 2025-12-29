import React, { useMemo, useCallback } from 'react';
import { planningEngine } from './PlanningEngine';

// Composant de vue détaillée de la semaine
const DetailedWeekView = ({ 
  selectedWeek, 
  slots, 
  onSlotEdit, 
  onSlotDelete, 
  onSlotCreate, 
  onSlotResize, 
  onSlotMove, 
  onSlotCopy, 
  onSlotPaste, 
  copiedSlot, 
  currentViewState,
  onViewStateChange 
}) => {
  
  // Génération des créneaux horaires
  const timeSlots = useMemo(() => {
    return [
      { time: '07:30', index: 0 },
      { time: '08:30', index: 1 },
      { time: '09:30', index: 2 },
      { time: '10:30', index: 3 },
      { time: '11:30', index: 4 },
      { time: '12:30', index: 5 },
      { time: '13:30', index: 6 },
      { time: '14:30', index: 7 },
      { time: '15:30', index: 8 },
      { time: '16:30', index: 9 },
      { time: '17:30', index: 10 }
    ];
  }, []);

  // Filtrage des créneaux pour la semaine sélectionnée
  const weekSlots = useMemo(() => {
    if (!selectedWeek || !slots) return [];
    
    return slots.filter(slot => {
      const slotDate = slot.start_date ? slot.start_date.split('T')[0] : null;
      return selectedWeek.some(day => {
        const dayDate = day.toISOString().split('T')[0];
        return slotDate === dayDate;
      });
    });
  }, [selectedWeek, slots]);

  // Gestionnaire de clic sur un créneau
  const handleSlotClick = useCallback((slot) => {
    if (onSlotEdit) {
      onSlotEdit(slot);
    }
  }, [onSlotEdit]);

  // Gestionnaire de suppression
  const handleSlotDelete = useCallback((slot) => {
    if (onSlotDelete) {
      onSlotDelete(slot);
    }
  }, [onSlotDelete]);

  // Gestionnaire de copie
  const handleSlotCopy = useCallback((slot) => {
    if (onSlotCopy) {
      onSlotCopy(slot);
    }
  }, [onSlotCopy]);

  // Gestionnaire de collage
  const handleSlotPaste = useCallback((day) => {
    if (onSlotPaste && copiedSlot) {
      onSlotPaste(copiedSlot, day);
    }
  }, [onSlotPaste, copiedSlot]);

  // Formatage de la date
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Formatage de l'affichage de la date
  const formatDisplayDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // Vérification si c'est un weekend
  const isWeekend = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  if (!selectedWeek) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Sélectionnez une semaine pour voir les détails
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Détails de la semaine
        </h3>
        <p className="text-sm text-gray-500">
          {formatDisplayDate(selectedWeek[0])} - {formatDisplayDate(selectedWeek[6])}
        </p>
      </div>

      {/* Grille horaire */}
      <div className="grid grid-cols-8 border border-gray-200 rounded-lg overflow-hidden">
        {/* En-tête des heures */}
        <div className="bg-gray-50 border-r">
          <div className="h-12 border-b flex items-center justify-center text-xs font-medium text-gray-700">
            Heures
          </div>
          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot.time}
              className="h-8 border-b border-gray-200 flex items-center justify-center text-xs text-gray-600 bg-gray-50"
            >
              {timeSlot.time}
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        {selectedWeek.map((date, dayIndex) => {
          const dayInfo = formatDisplayDate(date);
          const daySlots = weekSlots.filter(slot => {
            const parseDateOnly = (s) => {
              if (!s) return null;
              const iso = s.includes('T') ? s.split('T')[0] : s;
              const [y, m, d] = iso.split('-').map(Number);
              return new Date(y, (m || 1) - 1, d || 1);
            };
            const start = parseDateOnly(slot.start_date);
            const end = parseDateOnly(slot.end_date || slot.start_date);
            const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return start && day >= start && day <= end;
          });

          return (
            <div key={dayIndex} className={`border-r ${dayIndex === 6 ? 'border-r-0' : ''}`}>
              {/* En-tête du jour */}
              <div className={`h-12 border-b flex flex-col items-center justify-center text-xs font-medium ${
                isWeekend(date) ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900'
              }`}>
                <div className="font-bold">{dayInfo.split(' ')[0]}</div>
                <div>{date.getDate()}</div>
              </div>

              {/* Grille horaire de fond */}
              <div className="relative">
                {timeSlots.map((timeSlot, timeIndex) => (
                  <div
                    key={timeSlot.time}
                    className="h-8 border-b border-gray-200"
                  />
                ))}

                {/* Superposition des créneaux avec positionnement précis */}
                <div className="absolute inset-0">
                  {daySlots.map((slot, slotIndex) => {
                    // Parse times "HH:MM"
                    const parseMinutes = (t) => {
                      if (!t || !/^\d{2}:\d{2}$/.test(t)) return null;
                      const [hh, mm] = t.split(':').map(Number);
                      return hh * 60 + mm;
                    };
                    const baseStart = parseMinutes('07:30'); // début de la grille
                    const startM = parseMinutes(slot.start_time) ?? baseStart;
                    const endM = parseMinutes(slot.end_time) ?? (startM + 60);
                    const totalRows = timeSlots.length; // 11 lignes -> 11 * 32px
                    const rowHeight = 32; // h-8 approx
                    const gridHeight = totalRows * rowHeight;
                    const top = Math.max(0, ((startM - baseStart) / 60) * rowHeight);
                    const height = Math.max(20, ((endM - startM) / 60) * rowHeight);

                    return (
                      <div
                        key={`${slot.id}-${slotIndex}`}
                      className="absolute left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-blue-600 transition-colors shadow-sm"
                        style={{
                          top: Math.min(top, gridHeight - 20),
                          height: Math.min(height, gridHeight - top)
                        }}
                        onClick={() => handleSlotClick(slot)}
                        title={`${slot.student_name || (slot.first_name ? `${slot.first_name} ${slot.last_name}` : 'Étudiant')} - ${slot.start_time || ''} ${slot.end_time ? `à ${slot.end_time}` : ''}`}
                      >
                      <button
                        className="absolute top-1 right-1 text-white/90 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onSlotDelete && onSlotDelete(slot.id); }}
                        title="Supprimer"
                      >
                        ×
                      </button>
                        <div className="truncate font-medium">
                          {slot.student_name || (slot.first_name ? `${slot.first_name} ${slot.last_name}` : 'Étudiant')}
                        </div>
                        <div className="text-[10px] opacity-90">
                          {(slot.start_time || '').substring(0,5)}{slot.end_time ? ` - ${slot.end_time.substring(0,5)}` : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {weekSlots.length} créneau{weekSlots.length > 1 ? 'x' : ''} cette semaine
        </div>
        
        <div className="flex space-x-2">
          {copiedSlot && (
            <button
              onClick={() => handleSlotPaste(selectedWeek[0])}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Coller
            </button>
          )}
          
          <button
            onClick={() => onSlotCreate && onSlotCreate(selectedWeek[0])}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Nouveau créneau
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedWeekView;
