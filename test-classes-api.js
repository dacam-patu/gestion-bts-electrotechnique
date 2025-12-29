// Test de l'API classes pour vérifier les données de coloration des étudiants
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/classes',
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
      console.log('✅ API Classes Response Status:', res.statusCode);
      
      if (response.success && response.data) {
        const classes = response.data;
        console.log(`📊 Nombre de classes: ${classes.length}`);
        
        // Vérifier les étudiants de la première classe
        if (classes.length > 0) {
          const firstClass = classes[0];
          console.log(`\n🏫 Première classe: ${firstClass.name}`);
          console.log(`👥 Nombre d'étudiants: ${firstClass.students ? firstClass.students.length : 0}`);
          
          if (firstClass.students && firstClass.students.length > 0) {
            console.log('\n📝 Premiers étudiants avec coloration:');
            firstClass.students.slice(0, 5).forEach(student => {
              console.log(`- ${student.first_name} ${student.last_name}: "${student.coloration || 'NULL'}"`);
            });
          }
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
