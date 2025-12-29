/**
 * Script de test pour vérifier que la correction de suppression d'évaluations fonctionne
 * Ce script teste que seule une grille spécifique est supprimée, pas toutes les évaluations
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testDeleteFix() {
  console.log('🧪 Test de la correction de suppression d\'évaluations');
  console.log('=' .repeat(60));
  
  try {
    // 1. Récupérer toutes les grilles d'évaluation
    console.log('📋 1. Récupération des grilles d\'évaluation...');
    const gridsResponse = await axios.get(`${BASE_URL}/evaluations/grids/all`);
    
    if (!gridsResponse.data.success) {
      console.error('❌ Erreur lors de la récupération des grilles');
      return;
    }
    
    const grids = gridsResponse.data.data;
    console.log(`✅ ${grids.length} grilles trouvées`);
    
    if (grids.length === 0) {
      console.log('⚠️ Aucune grille trouvée pour le test');
      return;
    }
    
    // 2. Récupérer toutes les évaluations avant suppression
    console.log('\n📊 2. Récupération des évaluations avant suppression...');
    const evaluationsBeforeResponse = await axios.get(`${BASE_URL}/evaluations`);
    
    if (!evaluationsBeforeResponse.data.success) {
      console.error('❌ Erreur lors de la récupération des évaluations');
      return;
    }
    
    const evaluationsBefore = evaluationsBeforeResponse.data.data;
    console.log(`✅ ${evaluationsBefore.length} évaluations trouvées avant suppression`);
    
    // 3. Sélectionner une grille pour le test
    const testGrid = grids[0];
    console.log(`\n🎯 3. Test avec la grille ID: ${testGrid.id} (Étudiant: ${testGrid.student_id})`);
    
    // 4. Compter les évaluations de cet étudiant avant suppression
    const studentEvaluationsBefore = evaluationsBefore.filter(e => e.student_id === testGrid.student_id);
    console.log(`📈 Évaluations de l'étudiant avant suppression: ${studentEvaluationsBefore.length}`);
    
    // 5. Supprimer la grille spécifique
    console.log(`\n🗑️ 4. Suppression de la grille ID: ${testGrid.id}...`);
    const deleteResponse = await axios.delete(`${BASE_URL}/evaluations/grid/${testGrid.id}`);
    
    if (!deleteResponse.data.success) {
      console.error('❌ Erreur lors de la suppression de la grille');
      return;
    }
    
    console.log(`✅ Grille supprimée: ${deleteResponse.data.message}`);
    
    // 6. Récupérer les évaluations après suppression
    console.log('\n📊 5. Récupération des évaluations après suppression...');
    const evaluationsAfterResponse = await axios.get(`${BASE_URL}/evaluations`);
    
    if (!evaluationsAfterResponse.data.success) {
      console.error('❌ Erreur lors de la récupération des évaluations après suppression');
      return;
    }
    
    const evaluationsAfter = evaluationsAfterResponse.data.data;
    console.log(`✅ ${evaluationsAfter.length} évaluations trouvées après suppression`);
    
    // 7. Compter les évaluations de cet étudiant après suppression
    const studentEvaluationsAfter = evaluationsAfter.filter(e => e.student_id === testGrid.student_id);
    console.log(`📉 Évaluations de l'étudiant après suppression: ${studentEvaluationsAfter.length}`);
    
    // 8. Vérifier les résultats
    console.log('\n🔍 6. Analyse des résultats:');
    const totalEvaluationsDeleted = evaluationsBefore.length - evaluationsAfter.length;
    const studentEvaluationsDeleted = studentEvaluationsBefore.length - studentEvaluationsAfter.length;
    
    console.log(`   • Évaluations totales supprimées: ${totalEvaluationsDeleted}`);
    console.log(`   • Évaluations de l'étudiant supprimées: ${studentEvaluationsDeleted}`);
    
    // 9. Vérifier que la grille a été supprimée
    const remainingGridsResponse = await axios.get(`${BASE_URL}/evaluations/grids/all`);
    const remainingGrids = remainingGridsResponse.data.data;
    const gridStillExists = remainingGrids.some(g => g.id === testGrid.id);
    
    console.log(`   • Grille encore présente: ${gridStillExists ? '❌ OUI (problème!)' : '✅ NON (correct)'}`);
    
    // 10. Conclusion
    console.log('\n📋 7. Conclusion:');
    if (!gridStillExists && studentEvaluationsDeleted > 0 && totalEvaluationsDeleted === studentEvaluationsDeleted) {
      console.log('✅ SUCCÈS: La suppression a fonctionné correctement');
      console.log('   • Seule la grille spécifique a été supprimée');
      console.log('   • Seules les évaluations de cette grille ont été supprimées');
      console.log('   • Les autres évaluations ont été préservées');
    } else if (gridStillExists) {
      console.log('❌ ÉCHEC: La grille n\'a pas été supprimée');
    } else if (totalEvaluationsDeleted > studentEvaluationsDeleted) {
      console.log('❌ ÉCHEC: Plus d\'évaluations supprimées que prévu');
      console.log('   • Des évaluations d\'autres étudiants ont été supprimées');
    } else {
      console.log('⚠️ RÉSULTAT INATTENDU: Vérifiez manuellement');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testDeleteFix().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
