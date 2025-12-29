// Test de la nouvelle fonction getCivilWeekNumber
const getCivilWeekNumber = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 1;
  }
  
  const month = date.getMonth(); // 0-11 (janvier = 0, août = 7)
  const year = date.getFullYear();
  
  // Créer une copie de la date pour ne pas modifier l'original
  const d = new Date(date.getTime());
  
  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = d.getDay();
  
  // Ajuster pour que lundi soit le premier jour de la semaine (1 = lundi, 7 = dimanche)
  const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  
  // Aller au lundi de la semaine courante
  d.setDate(d.getDate() - adjustedDayOfWeek + 1);
  
  // Logique scolaire : août (7) à décembre (11) = semaines 31-52
  // janvier (0) à juillet (6) = semaines 1-30
  if (month >= 7) { // Août à décembre
    // Calculer depuis le 1er août de l'année courante
    const augustStart = new Date(year, 7, 1); // 1er août
    
    // Obtenir le jour de la semaine du 1er août
    const augustStartDayOfWeek = augustStart.getDay();
    const adjustedAugustStartDayOfWeek = augustStartDayOfWeek === 0 ? 7 : augustStartDayOfWeek;
    
    // Calculer le numéro de semaine depuis le 1er août
    const daysDiff = Math.floor((d.getTime() - augustStart.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.floor((daysDiff + adjustedAugustStartDayOfWeek - 1) / 7) + 31; // Commencer à 31
    
    return Math.max(31, Math.min(52, weekNumber)); // Limiter entre 31 et 52
  } else { // Janvier à juillet
    // Calculer depuis le 1er janvier de l'année courante
    const januaryStart = new Date(year, 0, 1); // 1er janvier
    
    // Obtenir le jour de la semaine du 1er janvier
    const januaryStartDayOfWeek = januaryStart.getDay();
    const adjustedJanuaryStartDayOfWeek = januaryStartDayOfWeek === 0 ? 7 : januaryStartDayOfWeek;
    
    // Calculer le numéro de semaine depuis le 1er janvier
    const daysDiff = Math.floor((d.getTime() - januaryStart.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.floor((daysDiff + adjustedJanuaryStartDayOfWeek - 1) / 7) + 1; // Commencer à 1
    
    return Math.max(1, Math.min(30, weekNumber)); // Limiter entre 1 et 30
  }
};

// Test des dates importantes pour 2025-2026
console.log('=== TEST DE LA NOUVELLE FONCTION getCivilWeekNumber ===\n');

// Tests pour août 2025 (semaines 31-35)
console.log('--- Août 2025 (semaines 31-35) ---');
const august1_2025 = new Date(2025, 7, 1); // 1er août 2025
const august4_2025 = new Date(2025, 7, 4); // 4 août 2025 (lundi)
const august11_2025 = new Date(2025, 7, 11); // 11 août 2025 (lundi)
const august18_2025 = new Date(2025, 7, 18); // 18 août 2025 (lundi)
const august25_2025 = new Date(2025, 7, 25); // 25 août 2025 (lundi)

console.log(`1er août 2025 (${august1_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august1_2025)}`);
console.log(`4 août 2025 (${august4_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august4_2025)}`);
console.log(`11 août 2025 (${august11_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august11_2025)}`);
console.log(`18 août 2025 (${august18_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august18_2025)}`);
console.log(`25 août 2025 (${august25_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(august25_2025)}`);

// Tests pour décembre 2025 (semaines 48-52)
console.log('\n--- Décembre 2025 (semaines 48-52) ---');
const dec1_2025 = new Date(2025, 11, 1); // 1er décembre 2025
const dec8_2025 = new Date(2025, 11, 8); // 8 décembre 2025 (lundi)
const dec15_2025 = new Date(2025, 11, 15); // 15 décembre 2025 (lundi)
const dec22_2025 = new Date(2025, 11, 22); // 22 décembre 2025 (lundi)
const dec29_2025 = new Date(2025, 11, 29); // 29 décembre 2025 (lundi)

console.log(`1er décembre 2025 (${dec1_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(dec1_2025)}`);
console.log(`8 décembre 2025 (${dec8_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(dec8_2025)}`);
console.log(`15 décembre 2025 (${dec15_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(dec15_2025)}`);
console.log(`22 décembre 2025 (${dec22_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(dec22_2025)}`);
console.log(`29 décembre 2025 (${dec29_2025.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(dec29_2025)}`);

// Tests pour janvier 2026 (semaines 1-5)
console.log('\n--- Janvier 2026 (semaines 1-5) ---');
const jan1_2026 = new Date(2026, 0, 1); // 1er janvier 2026
const jan5_2026 = new Date(2026, 0, 5); // 5 janvier 2026 (lundi)
const jan12_2026 = new Date(2026, 0, 12); // 12 janvier 2026 (lundi)
const jan19_2026 = new Date(2026, 0, 19); // 19 janvier 2026 (lundi)
const jan26_2026 = new Date(2026, 0, 26); // 26 janvier 2026 (lundi)

console.log(`1er janvier 2026 (${jan1_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan1_2026)}`);
console.log(`5 janvier 2026 (${jan5_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan5_2026)}`);
console.log(`12 janvier 2026 (${jan12_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan12_2026)}`);
console.log(`19 janvier 2026 (${jan19_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan19_2026)}`);
console.log(`26 janvier 2026 (${jan26_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(jan26_2026)}`);

// Tests pour juillet 2026 (semaines 26-30)
console.log('\n--- Juillet 2026 (semaines 26-30) ---');
const july1_2026 = new Date(2026, 6, 1); // 1er juillet 2026
const july7_2026 = new Date(2026, 6, 7); // 7 juillet 2026 (mardi)
const july14_2026 = new Date(2026, 6, 14); // 14 juillet 2026 (mardi)
const july21_2026 = new Date(2026, 6, 21); // 21 juillet 2026 (mardi)
const july28_2026 = new Date(2026, 6, 28); // 28 juillet 2026 (mardi)

console.log(`1er juillet 2026 (${july1_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july1_2026)}`);
console.log(`7 juillet 2026 (${july7_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july7_2026)}`);
console.log(`14 juillet 2026 (${july14_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july14_2026)}`);
console.log(`21 juillet 2026 (${july21_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july21_2026)}`);
console.log(`28 juillet 2026 (${july28_2026.toLocaleDateString('fr-FR')}): Semaine ${getCivilWeekNumber(july28_2026)}`);

console.log('\n=== FIN DES TESTS ===');
