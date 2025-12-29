import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Edit3, Trash2, User, Move } from 'lucide-react';
import toast from 'react-hot-toast';

const PlanningTable = ({ slots, onSlotEdit, onSlotDelete, onSlotMove }) => {
  const [draggedSlot, setDraggedSlot] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  // Générer les heures de 8h à 18h
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Générer les dates pour la semaine courante
  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const dayIndex = date.getDay() - 1;
    return `${days[dayIndex]} ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getSlotForCell = (date, time) => {
    const dateStr = formatDate(date);
    return slots.find(slot => {
      const slotDate = slot.start_date.split('T')[0];
      const slotTime = slot.start_time ? slot.start_time.substring(0, 5) : null;
      
      // Correspondance exacte de date et heure
      if (slotDate === dateStr && slotTime === time) {
        return true;
      }
      
      // Si pas d'heure définie, afficher sur le premier créneau de la journée (9h)
      if (slotDate === dateStr && !slotTime && time === '09:00') {
        return true;
      }
      
      return false;
    });
  };

  const getPhaseColor = (phase) => {
    const colors = {
      1: 'bg-blue-500 hover:bg-blue-600',
      2: 'bg-orange-500 hover:bg-orange-600',
      3: 'bg-green-500 hover:bg-green-600'
    };
    return colors[phase] || 'bg-gray-500 hover:bg-gray-600';
  };

  const getPhaseTitle = (phase) => {
    const titles = {
      1: 'Planification',
      2: 'Pilotage',
      3: 'Soutenance'
    };
    return titles[phase] || 'Phase inconnue';
  };

  const handleDragStart = (e, slot) => {
    setDraggedSlot(slot);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, date, time) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ date: formatDate(date), time });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e, date, time) => {
    e.preventDefault();
    setDragOverCell(null);
    
    if (draggedSlot) {
      const newDate = formatDate(date);
      const existingSlot = getSlotForCell(date, time);
      
      if (existingSlot && existingSlot.id !== draggedSlot.id) {
        toast.error('Ce créneau est déjà occupé');
        return;
      }
      
      onSlotMove(draggedSlot.id, newDate, time);
      setDraggedSlot(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDragOverCell(null);
  };

  const SlotCard = ({ slot }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, slot)}
      onDragEnd={handleDragEnd}
      className={`
        ${getPhaseColor(slot.phase)} text-white rounded-lg p-2 cursor-move text-xs
        shadow-sm transition-all duration-200 transform hover:scale-105
        ${draggedSlot?.id === slot.id ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium truncate">
          Phase {slot.phase}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSlotEdit(slot);
            }}
            className="text-white hover:text-gray-200 opacity-75 hover:opacity-100"
            title="Modifier"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSlotDelete(slot.id);
            }}
            className="text-white hover:text-red-200 opacity-75 hover:opacity-100"
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1 opacity-75" />
          <span className="truncate">
            {slot.first_name} {slot.last_name}
          </span>
        </div>
        
        {slot.project_title && (
          <div className="text-xs opacity-75 truncate">
            {slot.project_title}
          </div>
        )}
        
        {slot.location && (
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1 opacity-75" />
            <span className="text-xs opacity-75 truncate">
              {slot.location}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* En-tête avec les jours */}
        <div className="grid grid-cols-6 gap-1 mb-2">
          <div className="p-2 text-sm font-medium text-gray-500">
            Horaires
          </div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-2 text-center">
              <div className="text-sm font-medium text-gray-900">
                {formatDisplayDate(date)}
              </div>
            </div>
          ))}
        </div>

        {/* Grille de planification */}
        <div className="space-y-1">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-6 gap-1">
              {/* Colonne horaire */}
              <div className="p-2 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {time}
              </div>
              
              {/* Cellules pour chaque jour */}
              {weekDates.map((date, dayIndex) => {
                const slot = getSlotForCell(date, time);
                const cellKey = `${formatDate(date)}-${time}`;
                const isDragOver = dragOverCell?.date === formatDate(date) && dragOverCell?.time === time;
                
                return (
                  <div
                    key={cellKey}
                    className={`
                      p-1 min-h-[60px] border-2 border-dashed border-gray-200 rounded-lg
                      transition-all duration-200
                      ${isDragOver ? 'border-primary-500 bg-primary-50' : 'hover:border-gray-300'}
                      ${slot ? '' : 'hover:bg-gray-50'}
                    `}
                    onDragOver={(e) => handleDragOver(e, date, time)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date, time)}
                  >
                    {slot ? (
                      <SlotCard slot={slot} />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        {isDragOver && (
                          <Move className="h-4 w-4 text-primary-500" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Légende des phases */}
      <div className="mt-6 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Phase 1 - Planification</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-sm text-gray-600">Phase 2 - Pilotage</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Phase 3 - Soutenance</span>
        </div>
      </div>
    </div>
  );
};

export default PlanningTable;