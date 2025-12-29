const axios = require('axios');

async function testGroupsAPI() {
  try {
    console.log('🔍 Test de l\'API /api/students/groups/all...');
    
    const response = await axios.get('http://localhost:3001/api/students/groups/all');
    
    console.log('✅ Statut:', response.status);
    console.log('📊 Données reçues:', response.data);
    
    if (response.data.success && response.data.data) {
      console.log('\n📁 Groupes trouvés:', response.data.data.length);
      
      response.data.data.forEach((group, index) => {
        console.log(`\n🏷️ Groupe ${index + 1}: ${group.name}`);
        console.log(`📋 Projet: ${group.project_title || 'Aucun'}`);
        console.log(`👥 Étudiants (${group.students ? group.students.length : 0}):`);
        
        if (group.students && group.students.length > 0) {
          group.students.forEach(student => {
            console.log(`  👤 ${student.first_name} ${student.last_name} (Classe: ${student.class})`);
          });
        } else {
          console.log('  ⚠️ Aucun étudiant assigné');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('📊 Statut:', error.response.status);
      console.error('📊 Données:', error.response.data);
    }
  }
}

testGroupsAPI();

