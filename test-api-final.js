const axios = require('axios');

async function testAPIFinal() {
  console.log('🧪 TEST API FINAL - Vérification complète');
  console.log('==========================================');
  
  try {
    // Test 1: Vérifier que le serveur répond
    console.log('\n📡 Test 1: Connexion au serveur...');
    const response = await axios.get('http://localhost:3001/api/students/groups/all');
    
    console.log('✅ Serveur accessible');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success && response.data.data) {
      const groups = response.data.data;
      console.log(`📊 ${groups.length} groupes récupérés`);
      
      groups.forEach(group => {
        console.log(`📁 ${group.name}: ${group.students?.length || 0} étudiants`);
      });
      
      // Test 2: Test d'affectation
      console.log('\n🧪 Test 2: Test d\'affectation...');
      
      // Récupérer tous les étudiants
      const studentsResponse = await axios.get('http://localhost:3001/api/students');
      const allStudents = studentsResponse.data.data || [];
      
      console.log(`📊 ${allStudents.length} étudiants disponibles`);
      
      // Trouver des étudiants sans groupe
      const studentsWithoutGroup = allStudents.filter(s => !s.group_id);
      console.log(`📊 ${studentsWithoutGroup.length} étudiants sans groupe`);
      
      if (studentsWithoutGroup.length > 0) {
        // Affecter 2 étudiants au GROUPE A
        const targetStudents = studentsWithoutGroup.slice(0, 2);
        console.log(`🎯 Affectation de ${targetStudents.length} étudiants au GROUPE A...`);
        
        const assignResponse = await axios.post('http://localhost:3001/api/students/bulk-assign-group', {
          student_ids: targetStudents.map(s => s.id),
          group_id: 11 // GROUPE A
        });
        
        console.log('✅ Affectation réussie:', assignResponse.data);
        
        // Vérifier l'affectation
        setTimeout(async () => {
          console.log('\n🔍 Vérification après affectation...');
          
          const verifyResponse = await axios.get('http://localhost:3001/api/students/groups/all');
          
          if (verifyResponse.data.success) {
            const updatedGroups = verifyResponse.data.data;
            const groupA = updatedGroups.find(g => g.id === 11);
            
            console.log(`📊 GROUPE A: ${groupA?.students?.length || 0} étudiants`);
            
            if (groupA && groupA.students && groupA.students.length > 0) {
              console.log('✅ SUCCÈS: Les étudiants sont maintenant visibles !');
              groupA.students.forEach((student, index) => {
                console.log(`   ${index + 1}. ${student.first_name} ${student.last_name}`);
              });
            } else {
              console.log('❌ PROBLÈME: Les étudiants ne sont toujours pas visibles');
            }
          }
        }, 1000);
        
      } else {
        console.log('⚠️ Tous les étudiants sont déjà assignés à des groupes');
      }
      
    } else {
      console.log('❌ Réponse API invalide:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Vérifiez que le serveur backend est démarré sur le port 3001');
      console.log('2. Lancez: cd server && npm start');
      console.log('3. Relancez ce test');
    } else if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testAPIFinal();

