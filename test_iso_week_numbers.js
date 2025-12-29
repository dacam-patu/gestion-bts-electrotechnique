// Test des numéros de semaine ISO-8601 et scolaires
// Norme ISO-8601 : semaine 1 = première semaine contenant le 4 janvier

// Fonction pour calculer le numéro de semaine ISO-8601
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

// Fonction utilitaire pour formater les dates
const formatDate = (date) => {
  const options = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('fr-FR', options);
};

// Tests des numéros de semaine
console.log('=== TEST DES NUMEROS DE SEMAINE ===');

// Test 1: Août 2025 - Première semaine
console.log('\n--- Test Aout 2025 ---');
const august1_2025 = new Date(2025, 7, 1); // 1er août 2025
const august4_2025 = new Date(2025, 7, 4); // 4 août 2025 (lundi)
const august11_2025 = new Date(2025, 7, 11); // 11 août 2025 (lundi)

console.log(formatDate(august1_2025) + ': ISO=' + getISOWeekNumber(august1_2025) + ', Scolaire=' + getSchoolWeekNumber(august1_2025));
console.log(formatDate(august4_2025) + ': ISO=' + getISOWeekNumber(august4_2025) + ', Scolaire=' + getSchoolWeekNumber(august4_2025));
console.log(formatDate(august11_2025) + ': ISO=' + getISOWeekNumber(august11_2025) + ', Scolaire=' + getSchoolWeekNumber(august11_2025));

// Test 2: Décembre 2025 - Dernière semaine
console.log('\n--- Test Decembre 2025 ---');
const dec29_2025 = new Date(2025, 11, 29); // 29 décembre 2025
const dec30_2025 = new Date(2025, 11, 30); // 30 décembre 2025

console.log(formatDate(dec29_2025) + ': ISO=' + getISOWeekNumber(dec29_2025) + ', Scolaire=' + getSchoolWeekNumber(dec29_2025));
console.log(formatDate(dec30_2025) + ': ISO=' + getISOWeekNumber(dec30_2025) + ', Scolaire=' + getSchoolWeekNumber(dec30_2025));

// Test 3: Janvier 2026 - Première semaine
console.log('\n--- Test Janvier 2026 ---');
const jan1_2026 = new Date(2026, 0, 1); // 1er janvier 2026
const jan5_2026 = new Date(2026, 0, 5); // 5 janvier 2026 (lundi)
const jan12_2026 = new Date(2026, 0, 12); // 12 janvier 2026 (lundi)

console.log(formatDate(jan1_2026) + ': ISO=' + getISOWeekNumber(jan1_2026) + ', Scolaire=' + getSchoolWeekNumber(jan1_2026));
console.log(formatDate(jan5_2026) + ': ISO=' + getISOWeekNumber(jan5_2026) + ', Scolaire=' + getSchoolWeekNumber(jan5_2026));
console.log(formatDate(jan12_2026) + ': ISO=' + getISOWeekNumber(jan12_2026) + ', Scolaire=' + getSchoolWeekNumber(jan12_2026));

// Test 4: Juillet 2026 - Dernière semaine
console.log('\n--- Test Juillet 2026 ---');
const jul28_2026 = new Date(2026, 6, 28); // 28 juillet 2026
const jul29_2026 = new Date(2026, 6, 29); // 29 juillet 2026

console.log(formatDate(jul28_2026) + ': ISO=' + getISOWeekNumber(jul28_2026) + ', Scolaire=' + getSchoolWeekNumber(jul28_2026));
console.log(formatDate(jul29_2026) + ': ISO=' + getISOWeekNumber(jul29_2026) + ', Scolaire=' + getSchoolWeekNumber(jul29_2026));

// Test 5: Transition août 2026
console.log('\n--- Test Transition Aout 2026 ---');
const aug3_2026 = new Date(2026, 7, 3); // 3 août 2026
const aug10_2026 = new Date(2026, 7, 10); // 10 août 2026 (lundi)

console.log(formatDate(aug3_2026) + ': ISO=' + getISOWeekNumber(aug3_2026) + ', Scolaire=' + getSchoolWeekNumber(aug3_2026));
console.log(formatDate(aug10_2026) + ': ISO=' + getISOWeekNumber(aug10_2026) + ', Scolaire=' + getSchoolWeekNumber(aug10_2026));

console.log('\n=== FIN DES TESTS ===');
