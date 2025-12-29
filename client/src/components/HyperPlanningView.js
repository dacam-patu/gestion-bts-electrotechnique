import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { planningEngine } from './PlanningEngine';
import ChronologicalView from './ChronologicalView';
import DetailedWeekView from './DetailedWeekView';

// Styles CSS pour les effets visuels
const styles = `
  .drop-zone-active {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
    border-color: #3b82f6 !important;
    box-shadow: inset 0 0 0 2px #3b82f6 !important;
    transform: scale(1.02);
    transition: all 0.2s ease-in-out;
  }
  
  .slot-card {
    backdrop-filter: blur(4px);
  }
  
  .slot-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  
  .resize-handle:hover {
    background: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .time-slot-container {
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  }
`;

// Injecter les styles dans le head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Fonctions utilitaires définies en premier
const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Date invalide dans formatDate:', date);
    return 'Date invalide';
  }
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const formatDisplayDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Date invalide dans formatDisplayDate:', date);
    return 'Date invalide';
  }
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
};

const isWeekend = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  const day = date.getDay();
  return day === 0 || day === 6; // Dimanche = 0, Samedi = 6
};

// Fonction pour calculer le numéro de semaine ISO-8601
// Norme ISO-8601 : semaine 1 = première semaine contenant le 4 janvier
const getISOWeekNumber = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 1;
  }
  
  // Créer une copie de la date pour ne pas modifier l'original
  const d = new Date(date.getTime());
  
  // Aller au jeudi de la semaine courante (ISO-8601)
  const dayOfWeek = d.getDay();
  const thursdayOffset = dayOfWeek >= 4 ? 4 - dayOfWeek : -3 - dayOfWeek;
  d.setDate(d.getDate() + thursdayOffset);
  
  // Obtenir le 4 janvier de l'année du jeudi
  const jan4 = new Date(d.getFullYear(), 0, 4);
  
  // Aller au jeudi de la semaine contenant le 4 janvier
  const jan4DayOfWeek = jan4.getDay();
  const jan4ThursdayOffset = jan4DayOfWeek >= 4 ? 4 - jan4DayOfWeek : -3 - jan4DayOfWeek;
  jan4.setDate(jan4.getDate() + jan4ThursdayOffset);
  
  // Calculer le numéro de semaine
  const timeDiff = d.getTime() - jan4.getTime();
  const weekDiff = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
  
  return weekDiff + 1;
};

// Fonction pour adapter les numéros de semaine au contexte scolaire
// Année scolaire : août (mois 7) à juillet (mois 6)
// Semaines 31-52 pour août-décembre, 1-30 pour janvier-juillet
const getSchoolWeekNumber = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 1;
  }
  
  const month = date.getMonth(); // 0-11 (janvier = 0, août = 7)
  const year = date.getFullYear();
  
  // Créer une copie de la date pour ne pas modifier l'original
  const d = new Date(date.getTime());
  
  // Aller au lundi de la semaine courante
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + mondayOffset);
  
  if (month >= 7) { // Août à décembre (mois 7-11)
    // Calculer depuis le 1er août de l'année courante
    const augustStart = new Date(year, 7, 1); // 1er août
    
    // Aller au lundi de la semaine contenant le 1er août
    const augustStartDayOfWeek = augustStart.getDay();
    const augustStartMondayOffset = augustStartDayOfWeek === 0 ? -6 : 1 - augustStartDayOfWeek;
    augustStart.setDate(augustStart.getDate() + augustStartMondayOffset);
    
    // Calculer le numéro de semaine depuis le 1er août
    const timeDiff = d.getTime() - augustStart.getTime();
    const weekDiff = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
    const weekNumber = weekDiff + 31; // Commencer à 31
    
    return Math.max(31, Math.min(52, weekNumber)); // Limiter entre 31 et 52
  } else { // Janvier à juillet (mois 0-6)
    // Calculer depuis le 1er janvier de l'année courante
    const januaryStart = new Date(year, 0, 1); // 1er janvier
    
    // Aller au lundi de la semaine contenant le 1er janvier
    const januaryStartDayOfWeek = januaryStart.getDay();
    const januaryStartMondayOffset = januaryStartDayOfWeek === 0 ? -6 : 1 - januaryStartDayOfWeek;
    januaryStart.setDate(januaryStart.getDate() + januaryStartMondayOffset);
    
    // Calculer le numéro de semaine depuis le 1er janvier
    const timeDiff = d.getTime() - januaryStart.getTime();
    const weekDiff = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
    const weekNumber = weekDiff + 1; // Commencer à 1
    
    return Math.max(1, Math.min(30, weekNumber)); // Limiter entre 1 et 30
  }
};

// Fonction pour calculer le numéro de semaine selon la logique scolaire
// Par défaut, utilise ISO-8601 (standard international)
// Vous pouvez changer useSchoolSystem à true pour utiliser le système scolaire
const getCivilWeekNumber = (date) => {
  const useSchoolSystem = false; // Changez à true pour le système scolaire
  
  if (useSchoolSystem) {
    return getSchoolWeekNumber(date);
  } else {
    return getISOWeekNumber(date);
  }
};

const HyperPlanningView = ({ 
  slots, 
  onSlotEdit, 
  onSlotDelete, 
  onSlotMove, 
  onSlotCreate, 
  onSlotResize, 
  onSlotCopy, 
  onSlotPaste, 
  copiedSlot, 
  currentViewState, 
  onViewStateChange 
}) => {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('year');
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    if (isNaN(now.getTime())) {
      const fallbackDate = new Date(2025, 8, 1);
      return planningEngine.getWeekDays(fallbackDate);
    }
    return planningEngine.getWeekDays(now);
  });

  // Synchronisation avec l'état de vue externe (une seule fois au montage)
  useEffect(() => {
    if (currentViewState) {
      if (currentViewState.selectedWeek && !selectedWeek) {
        setSelectedWeek(currentViewState.selectedWeek);
      }
      if (currentViewState.viewMode && currentViewState.viewMode !== viewMode) {
        setViewMode(currentViewState.viewMode);
      }
    }
  }, []); // Ne s'exécute qu'au montage pour éviter les boucles

  // Mise à jour de l'état de vue externe (stabilisé avec useCallback)
  const updateViewState = useCallback(() => {
    if (onViewStateChange) {
      onViewStateChange({
        selectedWeek,
        viewMode
      });
    }
  }, [selectedWeek, viewMode, onViewStateChange]);

  useEffect(() => {
    updateViewState();
  }, [updateViewState]);

  // Utilisation du moteur de planning pour les créneaux horaires
  const timeSlots = useMemo(() => planningEngine.timeSlots, []);

  // Utilisation du moteur de planning pour générer les semaines
  const weeks = useMemo(() => {
    if (viewMode === 'year') {
      return planningEngine.generateYearWeeks(currentDate);
    } else if (viewMode === 'month') {
      return planningEngine.getMonthWeeks ? planningEngine.getMonthWeeks(currentDate) : [];
    }
    return [];
  }, [viewMode, currentDate]);

  // Optimisation du filtrage des créneaux
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      // Vérifier que le créneau a toutes les propriétés nécessaires
      return slot && 
             slot.id && 
             slot.start_date && 
             slot.first_name && 
             slot.last_name;
    });
  }, [slots]);

  const getMonthName = (date) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[date.getMonth()];
  };

  // Obtenir l'année scolaire courante (ex: "2024-2025")
  const getCurrentSchoolYear = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (month >= 7) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }, []);



  const navigateMonth = useCallback((direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
      setSelectedWeek(null);
    } else if (viewMode === 'year') {
      newDate.setFullYear(currentDate.getFullYear() + direction);
      setSelectedWeek(null);
    } else {
      newDate.setDate(currentDate.getDate() + (direction * 7));
      setSelectedWeek(planningEngine.getWeekDays(newDate));
    }
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const handleWeekClick = useCallback((week) => {
    setSelectedWeek(week);
  }, []);

  // Fonction pour maintenir le planning détaillé ouvert après redimensionnement
  const handleSlotResizeWithDetail = useCallback((slot, newTimes) => {
    if (onSlotResize) {
      onSlotResize(slot, newTimes);
    }
    
    // Maintenir la vue après redimensionnement
    setTimeout(() => {
      const event = new Event('resize-complete');
      document.dispatchEvent(event);
    }, 200);
  }, [onSlotResize]);

  const backToMonth = useCallback(() => {
    setViewMode('month');
    setSelectedWeek(null);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white w-full">
      {/* En-tête de navigation */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
            {viewMode === 'week' && selectedWeek ? (
              <>
                Semaine du {selectedWeek[0].getDate()}/{selectedWeek[0].getMonth() + 1} au {selectedWeek[6].getDate()}/{selectedWeek[6].getMonth() + 1}/{selectedWeek[6].getFullYear()}
              </>
            ) : viewMode === 'year' ? (
              <>Année scolaire {getCurrentSchoolYear(currentDate)}</>
            ) : (
              <>{getMonthName(currentDate)} {currentDate.getFullYear()}</>
            )}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            📅 Aujourd'hui
          </button>
          
          <div className="flex bg-white rounded-xl p-1 shadow-md">
            {viewMode === 'week' && (
              <button
                onClick={backToMonth}
                className="px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-600 font-medium"
              >
                ← Retour
              </button>
            )}
            <button
              onClick={() => {
                if (viewMode === 'month') {
                  setViewMode('week');
                  setSelectedWeek(planningEngine.getWeekDays(currentDate));
                } else if (viewMode === 'week') {
                  backToMonth();
                }
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                viewMode === 'week' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              📊 {viewMode === 'month' ? 'Semaine' : 'Courante'}
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                viewMode === 'month' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              📅 Mois
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                viewMode === 'year' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              📈 Année
            </button>
          </div>
        </div>
      </div>

      {/* Indicateur de copie */}
      {copiedSlot && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📋</span>
              </div>
              <div>
                <span className="text-sm font-bold text-blue-800">
                  Créneau copié
                </span>
                <div className="text-xs text-blue-600">
                  {copiedSlot.first_name} {copiedSlot.last_name} - {copiedSlot.start_time} à {copiedSlot.end_time}
                </div>
              </div>
            </div>
            <button
              onClick={() => onSlotCopy && onSlotCopy(null)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium"
            >
              ✕ Annuler
            </button>
          </div>
        </div>
      )}

      {/* Ligne de temps quadrillée */}
      {viewMode === 'month' && weeks.length > 1 && (
        <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-8 text-xs">
            {/* Colonne vide pour aligner avec les horaires */}
            <div className="border-r bg-gray-100"></div>
            
            {/* Timeline par semaine */}
            {weeks.map((week, weekIndex) => {
              const weekStart = week[0];
              const weekEnd = week[6];
              const isCurrentWeek = week.some(day => 
                formatDate(day) === formatDate(new Date())
              );
               
              return (
                <div 
                  key={weekIndex} 
                  className={`border-r p-2 text-center cursor-pointer transition-all duration-200 ${
                    isCurrentWeek ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-200 hover:bg-blue-50'
                  }`}
                  onClick={() => handleWeekClick(week)}
                  title="Cliquer pour voir cette semaine en détail"
                >
                  <div className="font-semibold text-gray-700">
                    Semaine {getCivilWeekNumber(week[0])}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {weekStart.getDate()}/{weekStart.getMonth() + 1} - {weekEnd.getDate()}/{weekEnd.getMonth() + 1}
                  </div>
                  <div className="text-xs text-blue-600 mt-1 opacity-75">
                    🔍 Voir détail
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grille de planning */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 w-full">
        {viewMode === 'year' ? (
          // Vue annuelle avec composants optimisés
          <div className="h-full flex flex-col">
            {/* Vue chronologique */}
            <ChronologicalView
              weeks={weeks}
              slots={filteredSlots}
              selectedWeek={selectedWeek}
              onWeekClick={handleWeekClick}
              currentViewState={currentViewState}
              onViewStateChange={onViewStateChange}
            />
            
            {/* Vue détaillée de la semaine sélectionnée */}
            {selectedWeek && (
              <DetailedWeekView
                selectedWeek={selectedWeek}
                slots={filteredSlots}
                onSlotEdit={onSlotEdit}
                onSlotDelete={onSlotDelete}
                onSlotCreate={onSlotCreate}
                onSlotResize={handleSlotResizeWithDetail}
                onSlotMove={onSlotMove}
                onSlotCopy={onSlotCopy}
                onSlotPaste={onSlotPaste}
                copiedSlot={copiedSlot}
                currentViewState={currentViewState}
                onViewStateChange={onViewStateChange}
              />
            )}
          </div>
        ) : viewMode === 'month' ? (
          // Vue mensuelle avec séparation des semaines
          <div className="space-y-2 p-4">
                         {weeks.map((week, weekIndex) => {
               const isCurrentWeek = week.some(day => formatDate(day) === formatDate(new Date()));
               const weekSlotsCount = filteredSlots.filter(slot => {
                 const slotDate = slot.start_date ? slot.start_date.split('T')[0] : null;
                 return week.some(day => formatDate(day) === slotDate);
               }).length;
               
              return (
              <div key={weekIndex} className={`grid grid-cols-8 border-2 relative group ${
                isCurrentWeek
                  ? 'border-blue-400 bg-gradient-to-r from-blue-25 to-blue-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-25 hover:to-blue-50 shadow-md hover:shadow-lg'
              } rounded-xl overflow-hidden transition-all duration-300 cursor-pointer`}
                onClick={() => handleWeekClick(week)}
                title={`Cliquer pour voir la semaine ${getCivilWeekNumber(week[0])} en détail (${weekSlotsCount} créneaux)`}
              >
                {/* Badge indiquant le nombre de créneaux */}
                <div className="absolute top-3 right-3 z-10 bg-blue-500 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                  {weekSlotsCount} créneaux
                </div>
                {/* Colonne des heures pour cette semaine */}
                <div className="border-r bg-gray-50">
                  <div className="h-12 border-b flex flex-col items-center justify-center text-xs font-medium text-gray-700">
                    <div>{getCivilWeekNumber(week[0])}</div>
                    {weekSlotsCount > 0 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                  {timeSlots.filter((_, i) => i % 4 === 0).map((timeSlot, index) => (
                    <div
                      key={timeSlot.time}
                      className="h-6 border-b border-gray-200 flex items-center justify-center text-xs text-gray-600 bg-gray-50"
                    >
                      {timeSlot.time}
                    </div>
                  ))}
                </div>

                                 {/* Jours de la semaine */}
                 {week.map((date, dayIndex) => {
                   const dayInfo = formatDisplayDate(date);
                 const daySlots = filteredSlots.filter(slot => {
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
                    <div key={dayIndex} className={`border-r min-h-full ${
                      dayIndex === 6 ? 'border-r-0' : ''
                    } ${!dayInfo.isCurrentMonth ? 'opacity-60' : ''}`}>
                      {/* En-tête du jour */}
                      <div className={`h-16 border-b-2 border-gray-300 flex flex-col items-center justify-center transition-all duration-200 ${
                        !dayInfo.isCurrentMonth ? 'bg-gray-200 text-gray-400' : 
                        formatDate(date) === formatDate(new Date()) ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300 shadow-inner' : 
                        isWeekend ? 'bg-gradient-to-r from-gray-100 to-gray-150' : 'bg-gradient-to-r from-white to-gray-50'
                      }`}>
                        <div className="text-xs font-bold">{dayInfo.dayName}</div>
                        <div className={`text-lg font-bold transition-all duration-200 ${
                          formatDate(date) === formatDate(new Date()) ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md' : ''
                        }`}>
                          {dayInfo.dayNumber}
                        </div>
                      </div>

                      {/* Zone de créneaux condensée */}
                      <div className="relative h-24 p-1">
                        {daySlots.map((slot, slotIndex) => (
                          <div
                            key={`${slot.id}-${slotIndex}`}
                            className={`
                              absolute left-1 right-1 rounded-sm border-l-2 text-xs p-1 cursor-pointer
                              transition-all duration-200 hover:shadow-md
                              ${slot.phase === 1 ? 'bg-blue-400 border-blue-500' : 
                                slot.phase === 2 ? 'bg-orange-400 border-orange-500' : 
                                slot.phase === 3 ? 'bg-green-400 border-green-500' : 
                                'bg-gray-400 border-gray-500'}
                            `}
                            style={{
                              top: `${slotIndex * 16}px`,
                              height: '14px',
                              zIndex: 1
                            }}
                            onClick={() => onSlotEdit && onSlotEdit(slot)}
                            title={`${slot.first_name} ${slot.last_name} - Phase ${slot.phase} - ${slot.start_time || 'Toute la journée'}`}
                          >
                            <button
                              className="absolute -top-1 right-1 text-white/90 hover:text-white leading-none"
                              onClick={(e) => { e.stopPropagation(); onSlotDelete && onSlotDelete(slot.id); }}
                              title="Supprimer"
                            >
                              ×
                            </button>
                            <div className="truncate text-xs font-medium">
                              {slot.first_name} {slot.last_name} - P{slot.phase}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })}
          </div>
        ) : null}
        
        {/* Vue semaine détaillée - UNIQUEMENT quand on n'est pas en mode année */}
        {viewMode === 'week' && (
          <DetailedWeekView 
            selectedWeek={selectedWeek || planningEngine.getWeekDays(currentDate)}
            slots={filteredSlots}
            onSlotEdit={onSlotEdit}
            onSlotDelete={onSlotDelete}
            onSlotCreate={onSlotCreate}
            onSlotResize={onSlotResize}
            onSlotMove={onSlotMove}
            onSlotCopy={onSlotCopy}
            onSlotPaste={onSlotPaste}
            copiedSlot={copiedSlot}
            currentViewState={currentViewState}
            onViewStateChange={onViewStateChange}
          />
        )}
      </div>

      {/* Légende */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 border-l-4 border-blue-500 rounded-sm"></div>
            <span className="text-sm text-gray-600">Phase 1 - Planification</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-400 border-l-4 border-orange-500 rounded-sm"></div>
            <span className="text-sm text-gray-600">Phase 2 - Pilotage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 border-l-4 border-green-500 rounded-sm"></div>
            <span className="text-sm text-gray-600">Phase 3 - Soutenance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HyperPlanningView;