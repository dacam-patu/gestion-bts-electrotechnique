const axios = require('axios');

const testStudentsApi = async () => {
  try {
    console.log('🔍 Test de l\'API /api/students...');
    const response = await axios.get('http://localhost:3001/api/students');
    console.log('✅ API Response Status:', response.status);
    
    if (response.data.success && response.data.data) {
      const students = response.data.data;
      console.log(`📊 Nombre d'étudiants: ${students.length}`);
      
      // Vérifier les premiers étudiants avec coloration
      const studentsWithColoration = students.filter(student => student.coloration);
      console.log(`🎨 Étudiants avec coloration: ${studentsWithColoration.length}`);
      
      if (studentsWithColoration.length > 0) {
        console.log('\n👥 Premiers étudiants avec coloration:');
        studentsWithColoration.slice(0, 5).forEach(student => {
          console.log(`- ${student.first_name} ${student.last_name}: "${student.coloration}"`);
        });
      } else {
        console.log('\n⚠️ Aucun étudiant n\'a de coloration dans l\'API');
        console.log('\n📝 Premiers étudiants de l\'API:');
        students.slice(0, 5).forEach(student => {
          console.log(`- ${student.first_name} ${student.last_name} (coloration: "${student.coloration || 'NULL'}")`);
        });
      }
    } else {
      console.error('❌ API response did not contain expected data structure');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Error testing /api/students API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

testStudentsApi();
