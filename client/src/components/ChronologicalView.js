import React, { useMemo, useCallback } from 'react';
import { planningEngine } from './PlanningEngine';

// Composant de vue chronologique professionnelle
const ChronologicalView = ({ 
  weeks, 
  slots, 
  selectedWeek, 
  onWeekClick, 
  currentViewState,
  onViewStateChange 
}) => {
  
  // Calcul optimisé des statistiques par semaine
  const weekStats = useMemo(() => {
    return weeks.map(week => {
      const weekSlots = planningEngine.filterSlotsForWeek(slots, week);
      const conflicts = weekSlots.reduce((acc, slot) => {
        const slotConflicts = planningEngine.detectConflicts(weekSlots, new Date(slot.start_date));
        return acc + slotConflicts.length;
      }, 0);
      
      return {
        week,
        slotCount: weekSlots.length,
        conflicts: conflicts / 2, // Diviser par 2 car chaque conflit est compté 2 fois
        weekNumber: planningEngine.getISOWeekNumber(week[0])
      };
    });
  }, [weeks, slots]);

  // Gestionnaire de clic optimisé
  const handleWeekClick = useCallback((week) => {
    onWeekClick(week);
    
    // Mettre à jour l'état de vue pour la synchronisation
    if (onViewStateChange) {
      onViewStateChange({
        selectedWeek: week,
        viewMode: 'year'
      });
    }
  }, [onWeekClick, onViewStateChange]);

  // Détermination des mois pour l'alignement
  const monthData = useMemo(() => {
    const months = [];
    let currentMonth = null;
    
    weeks.forEach((week, weekIndex) => {
      const weekStartDate = week[0];
      const month = weekStartDate.getMonth();
      const year = weekStartDate.getFullYear();
      const monthKey = `${year}-${month}`;
      
      if (monthKey !== currentMonth) {
        currentMonth = monthKey;
        months.push({
          weekIndex,
          month,
          year,
          monthName: weekStartDate.toLocaleDateString('fr-FR', { month: 'long' })
        });
      }
    });
    
    return months;
  }, [weeks]);

  return (
    <div className="bg-white border-b border-gray-200 w-full">
      <div className="mb-1">
        <h4 className="text-xs font-semibold text-gray-700 mb-0.5">Vue chronologique</h4>
      </div>
      
      {/* Ligne des numéros de semaine avec indicateurs */}
      <div className="flex border-b border-gray-300 mb-1 relative w-full">
        {weekStats.map((stat, weekIndex) => {
          const isSelected = selectedWeek && selectedWeek[0] && stat.week[0] && 
            selectedWeek[0].getTime() === stat.week[0].getTime();
          
          const isLastWeekOfMonth = weekIndex < weeks.length - 1 && 
            stat.week.some(day => {
              const nextDay = new Date(day);
              nextDay.setDate(nextDay.getDate() + 1);
              return day.getMonth() !== nextDay.getMonth();
            });
          
          return (
            <div
              key={`week-${stat.week[0].getTime()}-${weekIndex}`}
              className={`flex-1 min-w-0 h-4 border-r border-gray-300 flex items-center justify-center text-[8px] font-medium cursor-pointer transition-all duration-200 relative ${
                isSelected 
                  ? 'bg-blue-500 text-white' 
                  : stat.slotCount > 0 
                    ? stat.conflicts > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => handleWeekClick(stat.week)}
              title={`Semaine ${stat.weekNumber} - ${stat.slotCount} créneaux${stat.conflicts > 0 ? ` - ${stat.conflicts} conflits` : ''}`}
            >
              <span className="truncate px-0.5">{stat.weekNumber}</span>
              
              {/* Indicateur de conflit */}
              {stat.conflicts > 0 && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
              
              {/* Indicateur de créneaux */}
              {stat.slotCount > 0 && stat.conflicts === 0 && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              
              {/* Séparateur de mois */}
              {isLastWeekOfMonth && weekIndex < weeks.length - 1 && (
                <div 
                  className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-500"
                  style={{ right: '-1px' }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Ligne des noms de mois alignés */}
      <div className="flex relative w-full">
        {monthData.map((monthInfo, monthIndex) => {
          const isLastMonth = monthIndex === monthData.length - 1;
          const nextMonthIndex = monthData[monthIndex + 1]?.weekIndex || weeks.length;
          const spanWidth = nextMonthIndex - monthInfo.weekIndex;
          
          return (
            <div
              key={`month-${monthInfo.year}-${monthInfo.month}-${monthIndex}`}
              className="flex items-center justify-center text-[8px] font-medium text-gray-700 relative"
              style={{ 
                flex: spanWidth,
                minWidth: 0
              }}
            >
              <span className="truncate px-0.5 font-semibold text-gray-800">
                {monthInfo.monthName}
              </span>
              
              {/* Séparateur de mois */}
              {!isLastMonth && (
                <div 
                  className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-500"
                  style={{ right: '-1px' }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChronologicalView;
