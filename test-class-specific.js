// Test de l'API spécifique d'une classe pour vérifier les données de coloration des étudiants
const http = require('http');

// Test avec l'ID de la classe STS ELEC1 (ID = 1)
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/classes/1',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ API Class ID=1 Response Status:', res.statusCode);
      
      if (response.success && response.data) {
        const classData = response.data;
        console.log(`🏫 Classe: ${classData.name}`);
        console.log(`👥 Nombre d'étudiants: ${classData.students ? classData.students.length : 0}`);
        
        if (classData.students && classData.students.length > 0) {
          console.log('\n📝 Étudiants avec coloration:');
          classData.students.forEach(student => {
            console.log(`- ${student.first_name} ${student.last_name}: "${student.coloration || 'NULL'}"`);
          });
        } else {
          console.log('❌ Aucun étudiant trouvé dans cette classe');
        }
      } else {
        console.log('❌ Réponse API invalide:', response);
      }
    } catch (error) {
      console.error('❌ Erreur parsing JSON:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur requête:', error.message);
  console.log('💡 Assurez-vous que le serveur backend est démarré sur le port 3001');
});

req.end();
