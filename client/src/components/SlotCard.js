import React, { useCallback } from 'react';
import { planningEngine } from './PlanningEngine';

// Composant SlotCard professionnel pour l'affichage des créneaux
const SlotCard = ({ slot, position, date, onSlotEdit, onSlotResize, onSlotMove, onSlotCopy }) => {
  
  const isMultiDay = position.isMultiDay;
  const isShortSlot = position.height < 8;
  
  // Gestionnaire de redimensionnement professionnel
  const handleResizeStart = useCallback((e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startY = e.clientY;
    const startHeight = position.height;
    const startTop = position.top;
    let isResizing = true;
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      const deltaY = moveEvent.clientY - startY;
      const containerHeight = e.target.closest('.time-slot-container')?.offsetHeight || 600;
      const deltaPercent = (deltaY / containerHeight) * 100;
      
      let newTop = startTop;
      let newHeight = startHeight;
      
      if (direction === 'top') {
        newTop = Math.max(0, startTop + deltaPercent);
        newHeight = Math.max(4, startHeight - deltaPercent);
      } else if (direction === 'bottom') {
        newHeight = Math.max(4, startHeight + deltaPercent);
      }
      
      // Mise à jour visuelle pendant le drag
      const slotElement = e.target.closest('.slot-card');
      if (slotElement) {
        slotElement.style.top = `${newTop}%`;
        slotElement.style.height = `${newHeight}%`;
      }
    };
    
    const handleMouseUp = (upEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Calcul des nouvelles heures avec snapping par demi-heure
      const containerHeight = e.target.closest('.time-slot-container')?.offsetHeight || 600;
      const totalMinutes = 10 * 60;
      const minutesPerPixel = totalMinutes / containerHeight;
      
      let newStartTime, newEndTime;
      
      if (direction === 'top') {
        const deltaY = upEvent.clientY - startY;
        const deltaMinutes = Math.round(deltaY * minutesPerPixel);
        const currentStartMinutes = planningEngine.parseTime(slot.start_time);
        const newStartMinutes = Math.max(7 * 60 + 30, currentStartMinutes + deltaMinutes);
        
        // Snapping par demi-heure
        const snappedStartMinutes = Math.round(newStartMinutes / 30) * 30;
        newStartTime = `${Math.floor(snappedStartMinutes / 60).toString().padStart(2, '0')}:${(snappedStartMinutes % 60).toString().padStart(2, '0')}`;
        newEndTime = slot.end_time;
      } else if (direction === 'bottom') {
        const deltaY = upEvent.clientY - startY;
        const deltaMinutes = Math.round(deltaY * minutesPerPixel);
        const currentEndMinutes = planningEngine.parseTime(slot.end_time || slot.start_time);
        const newEndMinutes = Math.min(17 * 60 + 30, currentEndMinutes + deltaMinutes);
        
        // Snapping par demi-heure
        const snappedEndMinutes = Math.round(newEndMinutes / 30) * 30;
        newEndTime = `${Math.floor(snappedEndMinutes / 60).toString().padStart(2, '0')}:${(snappedEndMinutes % 60).toString().padStart(2, '0')}`;
        newStartTime = slot.start_time;
      }
      
      // Appel de la fonction de redimensionnement
      if (onSlotResize) {
        onSlotResize(slot, { start_time: newStartTime, end_time: newEndTime });
      }
      
      // Maintenir la vue après redimensionnement
      setTimeout(() => {
        const event = new Event('resize-complete');
        document.dispatchEvent(event);
      }, 200);
      
      setTimeout(() => {
        isResizing = false;
      }, 200);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return isResizing;
  }, [position, slot, onSlotResize]);
  
  // Gestionnaire de drag and drop
  const handleDragStart = useCallback((e) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({
      slotId: slot.id,
      slot: slot,
      sourceDate: planningEngine.formatDate(date)
    }));
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  }, [slot, date]);
  
  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
  }, []);
  
  // Détermination du style selon la phase
  const getSlotStyle = () => {
    const baseStyle = `
      slot-card absolute left-1 right-1 rounded-lg border-l-4 shadow-lg cursor-move
      transition-all duration-300 hover:shadow-xl hover:z-20 hover:scale-105 hover:border-l-8
      ${isMultiDay ? 'opacity-90' : ''}
      ${isShortSlot ? 'text-center' : ''}
      backdrop-blur-sm
    `;
    
    const phaseStyle = {
      1: 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 text-white',
      2: 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-600 text-white',
      3: 'bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white'
    };
    
    return `${baseStyle} ${phaseStyle[slot.phase] || 'bg-gradient-to-r from-gray-500 to-gray-600 border-gray-600 text-white'}`;
  };
  
  return (
    <div
      className={getSlotStyle()}
      style={{
        top: `${position.top}%`,
        height: `${position.height}%`,
        minHeight: isShortSlot ? '16px' : '24px',
        zIndex: 1
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        if (e.target.closest('.resize-handle')) {
          e.stopPropagation();
          return;
        }
        onSlotEdit && onSlotEdit(slot);
      }}
      title={`${slot.first_name} ${slot.last_name} - ${slot.phase_name || `Phase ${slot.phase}`}${slot.location ? ` - ${slot.location}` : ''} (${slot.start_time || 'Toute la journée'}${slot.end_time ? ` - ${slot.end_time}` : ''}) - Glisser-déposer pour déplacer`}
    >
      {/* Bouton de copie */}
      {onSlotCopy && (
        <button
          className="absolute top-1 right-1 w-6 h-6 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full text-xs font-bold text-gray-700 hover:text-gray-900 z-30 transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onSlotCopy(slot);
          }}
          title="Copier ce créneau"
        >
          📋
        </button>
      )}
      
      {/* Poignée de redimensionnement en haut */}
      {!isMultiDay && !isShortSlot && (
        <div
          className="resize-handle absolute top-0 left-0 right-0 h-3 bg-white bg-opacity-60 hover:bg-opacity-90 cursor-ns-resize z-20 border-t-2 border-white rounded-t-lg transition-all duration-200 hover:h-4"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, 'top');
          }}
          title="Redimensionner le début (par pas de 30 min)"
        >
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-gray-400 rounded-full"></div>
        </div>
      )}
      
      <div className={`p-2 h-full overflow-hidden flex flex-col ${isShortSlot ? 'justify-center' : 'justify-start'}`}>
        {/* Nom de l'étudiant */}
        <div className={`font-bold truncate ${isShortSlot ? 'text-[10px]' : 'text-sm'} drop-shadow-sm`}>
          {slot.first_name} {slot.last_name}
        </div>
        
        {/* Informations supplémentaires selon la hauteur */}
        {!isShortSlot && (
          <>
            <div className="text-xs font-medium opacity-95 truncate mt-1">
              {slot.phase_name || `Phase ${slot.phase}`}
            </div>
            
            {slot.location && position.height > 12 && (
              <div className="text-xs opacity-90 truncate mt-1 flex items-center">
                <span className="mr-1">📍</span>
                {slot.location}
              </div>
            )}
            
            {slot.start_time && position.height > 16 && (
              <div className="text-xs opacity-90 truncate font-mono mt-1 flex items-center">
                <span className="mr-1">🕐</span>
                {slot.start_time.substring(0, 5)}
                {slot.end_time && ` - ${slot.end_time.substring(0, 5)}`}
              </div>
            )}
            
            {position.duration && position.duration > 1 && position.height > 20 && (
              <div className="text-[10px] opacity-80 truncate mt-auto flex items-center">
                <span className="mr-1">⏱️</span>
                {position.duration}h
              </div>
            )}
          </>
        )}
        
        {/* Badge de phase pour les créneaux courts */}
        {isShortSlot && (
          <div className="text-[8px] opacity-90 truncate font-bold">
            P{slot.phase}
          </div>
        )}
      </div>
      
      {/* Poignée de redimensionnement en bas */}
      {!isMultiDay && !isShortSlot && (
        <div
          className="resize-handle absolute bottom-0 left-0 right-0 h-3 bg-white bg-opacity-60 hover:bg-opacity-90 cursor-ns-resize z-20 border-b-2 border-white rounded-b-lg transition-all duration-200 hover:h-4"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, 'bottom');
          }}
          title="Redimensionner la fin (par pas de 30 min)"
        >
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-gray-400 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default SlotCard;
