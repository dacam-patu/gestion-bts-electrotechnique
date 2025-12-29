const axios = require('axios');

async function testBulkDelete() {
  try {
    console.log('🧪 Test de la suppression en masse...');
    
    // D'abord, récupérer la liste des étudiants
    const studentsResponse = await axios.get('http://localhost:3001/api/students');
    console.log('📊 Étudiants disponibles:', studentsResponse.data.data.length);
    
    if (studentsResponse.data.data.length === 0) {
      console.log('❌ Aucun étudiant disponible pour le test');
      return;
    }
    
    // Prendre les 2 premiers étudiants pour le test
    const testIds = studentsResponse.data.data.slice(0, 2).map(s => s.id);
    console.log('🎯 IDs à supprimer:', testIds);
    
    // Tester la suppression en masse
    const deleteResponse = await axios.delete('http://localhost:3001/api/students/bulk', {
      data: { student_ids: testIds }
    });
    
    console.log('✅ Réponse de suppression:', deleteResponse.data);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testBulkDelete();
