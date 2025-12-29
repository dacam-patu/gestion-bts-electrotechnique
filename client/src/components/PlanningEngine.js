
 // Moteur de planning professionnel
// Gestion centralisée de la logique d'affichage et de synchronisation

export class PlanningEngine {
  constructor() {
    this.timeSlots = this.generateTimeSlots();
    this.weekCache = new Map();
    this.slotCache = new Map();
  }

  // Génération des créneaux horaires professionnels
  generateTimeSlots() {
    return [
      { start: '07:30', end: '08:30', isPause: false, index: 0 },
      { start: '08:30', end: '09:30', isPause: false, index: 1 },
      { start: '09:30', end: '10:30', isPause: false, index: 2 },
      { start: '10:30', end: '11:30', isPause: false, index: 3 },
      { start: '11:30', end: '12:30', isPause: false, index: 4 },
      { start: '12:30', end: '13:30', isPause: true, pauseType: 'meridienne', index: 5 },
      { start: '13:30', end: '14:30', isPause: false, index: 6 },
      { start: '14:30', end: '15:30', isPause: false, index: 7 },
      { start: '15:30', end: '16:30', isPause: false, index: 8 },
      { start: '16:30', end: '17:30', isPause: false, index: 9 }
    ];
  }

  // Calcul professionnel des positions des créneaux
  calculateSlotPosition(slot, date) {
    const cacheKey = `${slot.id}-${date.toISOString().split('T')[0]}`;
    
    if (this.slotCache.has(cacheKey)) {
      return this.slotCache.get(cacheKey);
    }

    // Normaliser le format de date pour la comparaison
    const slotDate = slot.start_date ? slot.start_date.split('T')[0] : null;
    const cellDate = date.toISOString().split('T')[0];
    
    console.log('🔍 Calcul position:', { slotDate, cellDate, slotId: slot.id });
    
    if (slotDate !== cellDate) {
      this.slotCache.set(cacheKey, null);
      return null;
    }
    
    // Si pas d'heure, c'est un créneau toute la journée
    if (!slot.start_time) {
      const result = { top: 0, height: 100, isMultiDay: true };
      this.slotCache.set(cacheKey, result);
      return result;
    }
    
    const startTime = this.parseTime(slot.start_time);
    const endTime = this.parseTime(slot.end_time || slot.start_time);
    
    // Calculer la position relative dans la journée (7h30 à 17h30 = 10 heures)
    const dayStart = 7 * 60 + 30; // 7h30
    const dayEnd = 17 * 60 + 30;  // 17h30
    const totalMinutes = dayEnd - dayStart; // 10 heures = 600 minutes
    
    const startOffset = Math.max(0, startTime - dayStart);
    const endOffset = Math.min(totalMinutes, endTime - dayStart);
    
    const top = (startOffset / totalMinutes) * 100;
    const height = ((endOffset - startOffset) / totalMinutes) * 100;
    
    console.log('📊 Position calculée:', {
      startTime: slot.start_time,
      endTime: slot.end_time,
      startOffset,
      endOffset,
      top: `${top}%`,
      height: `${height}%`
    });
    
    const result = {
      top: Math.max(0, Math.min(100, top)),
      height: Math.max(3, Math.min(100, height)),
      startSlotIndex: Math.floor(startOffset / 60),
      endSlotIndex: Math.floor(endOffset / 60),
      duration: (endTime - startTime) / 60,
      isMultiDay: false
    };
    
    this.slotCache.set(cacheKey, result);
    return result;
  }

  // Parsing professionnel des heures
  parseTime(timeString) {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Calcul des numéros de semaine ISO-8601
  getISOWeekNumber(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 1;
    }
    
    const d = new Date(date.getTime());
    const dayOfWeek = d.getDay();
    const thursdayOffset = dayOfWeek >= 4 ? 4 - dayOfWeek : -3 - dayOfWeek;
    d.setDate(d.getDate() + thursdayOffset);
    
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const jan4DayOfWeek = jan4.getDay();
    const jan4ThursdayOffset = jan4DayOfWeek >= 4 ? 4 - jan4DayOfWeek : -3 - jan4DayOfWeek;
    jan4.setDate(jan4.getDate() + jan4ThursdayOffset);
    
    const timeDiff = d.getTime() - jan4.getTime();
    const weekDiff = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
    
    return weekDiff + 1;
  }

  // Génération des semaines de l'année scolaire
  generateYearWeeks(date) {
    const cacheKey = date.getFullYear();
    
    if (this.weekCache.has(cacheKey)) {
      return this.weekCache.get(cacheKey);
    }

    const year = date.getFullYear();
    const weeks = [];
    
    let schoolYearStart, schoolYearEnd;
    const currentMonth = date.getMonth();
    
    if (currentMonth >= 7) {
      schoolYearStart = new Date(year, 7, 1);
      schoolYearEnd = new Date(year + 1, 6, 31);
    } else {
      schoolYearStart = new Date(year - 1, 7, 1);
      schoolYearEnd = new Date(year, 6, 31);
    }
    
    let currentWeek = this.getWeekDays(schoolYearStart);
    
    while (currentWeek[0] <= schoolYearEnd) {
      if (currentWeek[6] >= schoolYearStart && currentWeek[0] <= schoolYearEnd) {
        weeks.push([...currentWeek]);
      }
      
      const nextWeek = new Date(currentWeek[0]);
      nextWeek.setDate(nextWeek.getDate() + 7);
      currentWeek = this.getWeekDays(nextWeek);
      
      if (currentWeek[0] > schoolYearEnd) break;
    }
    
    this.weekCache.set(cacheKey, weeks);
    return weeks;
  }

  // Génération des jours de la semaine
  getWeekDays(date) {
    const monday = new Date(date);
    const dayOfWeek = monday.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(monday.getDate() - daysToSubtract);
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  }

  // Filtrage intelligent des créneaux par semaine
  filterSlotsForWeek(slots, week) {
    return slots.filter(slot => {
      const slotDate = slot.start_date.split('T')[0];
      return week.some(day => day.toISOString().split('T')[0] === slotDate);
    });
  }

  // Détection des conflits de créneaux
  detectConflicts(slots, date) {
    const dateStr = date.toISOString().split('T')[0];
    const daySlots = slots.filter(slot => slot.start_date.split('T')[0] === dateStr);
    
    const conflicts = [];
    
    for (let i = 0; i < daySlots.length; i++) {
      for (let j = i + 1; j < daySlots.length; j++) {
        const slot1 = daySlots[i];
        const slot2 = daySlots[j];
        
        if (this.slotsOverlap(slot1, slot2)) {
          conflicts.push([slot1, slot2]);
        }
      }
    }
    
    return conflicts;
  }

  // Vérification du chevauchement des créneaux
  slotsOverlap(slot1, slot2) {
    if (!slot1.start_time || !slot2.start_time) return false;
    
    const start1 = this.parseTime(slot1.start_time);
    const end1 = this.parseTime(slot1.end_time || slot1.start_time);
    const start2 = this.parseTime(slot2.start_time);
    const end2 = this.parseTime(slot2.end_time || slot2.start_time);
    
    return start1 < end2 && end1 > start2;
  }

  // Calcul de la position de drop pour le drag & drop
  calculateDropPosition(event, timeSlots) {
    const dropY = event.clientY;
    const container = event.currentTarget.querySelector('.time-slot-container');
    
    if (!container) return null;
    
    const containerRect = container.getBoundingClientRect();
    const relativeY = dropY - containerRect.top;
    const timeSlotHeight = containerRect.height / timeSlots.length;
    const slotIndex = Math.floor(relativeY / timeSlotHeight);
    
    const clampedIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
    const targetSlot = timeSlots[clampedIndex];
    
    const slotRelativeY = relativeY - (clampedIndex * timeSlotHeight);
    const slotPercentage = slotRelativeY / timeSlotHeight;
    
    return {
      timeSlot: targetSlot,
      time: slotPercentage <= 0.5 ? targetSlot.start : targetSlot.end,
      index: clampedIndex
    };
  }

  // Validation des données de créneau
  validateSlot(slot) {
    const errors = [];
    
    if (!slot.start_date) {
      errors.push('Date de début requise');
    }
    
    if (slot.start_time && slot.end_time) {
      const start = this.parseTime(slot.start_time);
      const end = this.parseTime(slot.end_time);
      
      if (end <= start) {
        errors.push('L\'heure de fin doit être après l\'heure de début');
      }
    }
    
    if (!slot.student_id) {
      errors.push('Étudiant requis');
    }
    
    return errors;
  }

  // Nettoyage du cache
  clearCache() {
    this.weekCache.clear();
    this.slotCache.clear();
  }

  // Invalider le cache d'un créneau spécifique
  invalidateSlotCache(slotId) {
    const keysToDelete = [];
    for (const [key, value] of this.slotCache.entries()) {
      if (key.includes(`-${slotId}-`) || key.startsWith(`${slotId}-`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.slotCache.delete(key));
    console.log(`🗑️ Cache invalidé pour le créneau ${slotId}`);
  }

  // Formatage des dates
  formatDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  // Formatage des dates d'affichage
  formatDisplayDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }

  // Vérification si c'est un weekend
  isWeekend(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    const day = date.getDay();
    return day === 0 || day === 6;
  }
}

// Instance singleton du moteur de planning
export const planningEngine = new PlanningEngine();
