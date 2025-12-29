// Test simple de l'API students pour vérifier les données de coloration
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/students',
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
      console.log('✅ API Response Status:', res.statusCode);
      
      if (response.success && response.data) {
        const students = response.data;
        console.log(`📊 Nombre d'étudiants: ${students.length}`);
        
        // Afficher les premiers étudiants avec leur coloration
        console.log('\n👥 Premiers étudiants avec coloration:');
        students.slice(0, 10).forEach(student => {
          console.log(`- ${student.first_name} ${student.last_name}: "${student.coloration || 'Aucune'}"`);
        });
        
        // Compter les colorations
        const colorations = {};
        students.forEach(student => {
          const coloration = student.coloration || 'Aucune';
          colorations[coloration] = (colorations[coloration] || 0) + 1;
        });
        
        console.log('\n📈 Répartition des colorations:');
        Object.entries(colorations).forEach(([coloration, count]) => {
          console.log(`- ${coloration}: ${count} étudiant(s)`);
        });
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
