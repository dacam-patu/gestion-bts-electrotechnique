// Script de test pour vérifier le calcul des numéros de semaine civile
// Version corrigée selon la norme ISO 8601
const getCivilWeekNumber = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 1;
  }
  
  // Créer une copie de la date pour ne pas modifier l'original
  const d = new Date(date.getTime());
  
  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = d.getDay();
  
  // Ajuster pour que lundi soit le premier jour de la semaine (1 = lundi, 7 = dimanche)
  const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  
  // Aller au lundi de la semaine courante
  d.setDate(d.getDate() - adjustedDayOfWeek + 1);
  
  // Obtenir le 1er janvier de l'année
  const yearStart = new Date(d.getFullYear(), 0, 1);
  
  // Obtenir le jour de la semaine du 1er janvier
  const yearStartDayOfWeek = yearStart.getDay();
  const adjustedYearStartDayOfWeek = yearStartDayOfWeek === 0 ? 7 : yearStartDayOfWeek;
  
  // Calculer le numéro de semaine selon la norme ISO 8601
  let weekNumber;
  
  // Si le 1er janvier est un lundi, mardi, mercredi ou jeudi (1-4), il est dans la semaine 1
  // Sinon, il est dans la semaine 52 ou 53 de l'année précédente
  if (adjustedYearStartDayOfWeek <= 4) {
    // Le 1er janvier est dans la semaine 1
    const daysDiff = Math.floor((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
    weekNumber = Math.floor((daysDiff + adjustedYearStartDayOfWeek - 1) / 7) + 1;
  } else {
    // Le 1er janvier est dans la semaine 52 ou 53 de l'année précédente
    // Aller au lundi de la semaine 1
    const daysToMonday = 8 - adjustedYearStartDayOfWeek;
    const mondayOfWeek1 = new Date(yearStart.getTime() + daysToMonday * 24 * 60 * 60 * 1000);
    
    if (d < mondayOfWeek1) {
      // Nous sommes encore dans l'année précédente
      const prevYearStart = new Date(d.getFullYear() - 1, 0, 1);
      const prevYearStartDayOfWeek = prevYearStart.getDay();
      const adjustedPrevYearStartDayOfWeek = prevYearStartDayOfWeek === 0 ? 7 : prevYearStartDayOfWeek;
      
      if (adjustedPrevYearStartDayOfWeek <= 4) {
        const daysDiff = Math.floor((d.getTime() - prevYearStart.getTime()) / (24 * 60 * 60 * 1000));
        weekNumber = Math.floor((daysDiff + adjustedPrevYearStartDayOfWeek - 1) / 7) + 1;
      } else {
        weekNumber = 1;
      }
    } else {
      const daysDiff = Math.floor((d.getTime() - mondayOfWeek1.getTime()) / (24 * 60 * 60 * 1000));
      weekNumber = Math.floor(daysDiff / 7) + 1;
    }
  }
  
  return weekNumber;
};

// Version alternative plus simple
const getCivilWeekNumberSimple = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 1;
  }
  
  // Créer une copie de la date pour ne pas modifier l'original
  const d = new Date(date.getTime());
  
  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = d.getDay();
  
  // Ajuster pour que lundi soit le premier jour de la semaine (1 = lundi, 7 = dimanche)
  const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  
  // Aller au lundi de la semaine courante
  d.setDate(d.getDate() - adjustedDayOfWeek + 1);
  
  // Obtenir le 1er janvier de l'année
  const yearStart = new Date(d.getFullYear(), 0, 1);
  
  // Calculer le nombre de jours depuis le début de l'année
  const daysDiff = Math.floor((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
  
  // Calculer le numéro de semaine
  const weekNumber = Math.floor(daysDiff / 7) + 1;
  
  return weekNumber;
};

// Test pour août 2025
console.log('=== Test des numéros de semaine pour août 2025 ===');
const august1_2025 = new Date(2025, 7, 1); // 1er août 2025 (mois 7 = août)
const august2_2025 = new Date(2025, 7, 2); // 2 août 2025
const august3_2025 = new Date(2025, 7, 3); // 3 août 2025
const august4_2025 = new Date(2025, 7, 4); // 4 août 2025
const august5_2025 = new Date(2025, 7, 5); // 5 août 2025

console.log(`1er août 2025 (${august1_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august1_2025)} (ISO) / ${getCivilWeekNumberSimple(august1_2025)} (Simple)`);
console.log(`2 août 2025 (${august2_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august2_2025)} (ISO) / ${getCivilWeekNumberSimple(august2_2025)} (Simple)`);
console.log(`3 août 2025 (${august3_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august3_2025)} (ISO) / ${getCivilWeekNumberSimple(august3_2025)} (Simple)`);
console.log(`4 août 2025 (${august4_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august4_2025)} (ISO) / ${getCivilWeekNumberSimple(august4_2025)} (Simple)`);
console.log(`5 août 2025 (${august5_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august5_2025)} (ISO) / ${getCivilWeekNumberSimple(august5_2025)} (Simple)`);

// Test pour quelques dates de référence
console.log('\n=== Test des dates de référence ===');
const jan1_2025 = new Date(2025, 0, 1);
const jan6_2025 = new Date(2025, 0, 6);
const jan13_2025 = new Date(2025, 0, 13);

console.log(`1er janvier 2025 (${jan1_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan1_2025)} (ISO) / ${getCivilWeekNumberSimple(jan1_2025)} (Simple)`);
console.log(`6 janvier 2025 (${jan6_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan6_2025)} (ISO) / ${getCivilWeekNumberSimple(jan6_2025)} (Simple)`);
console.log(`13 janvier 2025 (${jan13_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan13_2025)} (ISO) / ${getCivilWeekNumberSimple(jan13_2025)} (Simple)`);

// Test pour juillet 2025 (fin de l'année scolaire)
console.log('\n=== Test pour juillet 2025 ===');
const july1_2025 = new Date(2025, 6, 1);
const july7_2025 = new Date(2025, 6, 7);
const july14_2025 = new Date(2025, 6, 14);

console.log(`1er juillet 2025 (${july1_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july1_2025)} (ISO) / ${getCivilWeekNumberSimple(july1_2025)} (Simple)`);
console.log(`7 juillet 2025 (${july7_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july7_2025)} (ISO) / ${getCivilWeekNumberSimple(july7_2025)} (Simple)`);
console.log(`14 juillet 2025 (${july14_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july14_2025)} (ISO) / ${getCivilWeekNumberSimple(july14_2025)} (Simple)`);

// Test pour janvier 2026 (début de l'année civile)
console.log('\n=== Test pour janvier 2026 ===');
const jan1_2026 = new Date(2026, 0, 1);
const jan5_2026 = new Date(2026, 0, 5);
const jan12_2026 = new Date(2026, 0, 12);

console.log(`1er janvier 2026 (${jan1_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan1_2026)} (ISO) / ${getCivilWeekNumberSimple(jan1_2026)} (Simple)`);
console.log(`5 janvier 2026 (${jan5_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan5_2026)} (ISO) / ${getCivilWeekNumberSimple(jan5_2026)} (Simple)`);
console.log(`12 janvier 2026 (${jan12_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan12_2026)} (ISO) / ${getCivilWeekNumberSimple(jan12_2026)} (Simple)`); 