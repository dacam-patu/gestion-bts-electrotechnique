const http = require('http');

console.log('🧪 TEST SIMPLE - Vérification du serveur');
console.log('=========================================');

// Test de connexion au serveur
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/students/groups/all',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📡 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('📊 Réponse API:');
      console.log('Success:', jsonData.success);
      
      if (jsonData.success && jsonData.data) {
        const groups = jsonData.data;
        console.log(`📁 ${groups.length} groupes récupérés`);
        
        groups.forEach(group => {
          console.log(`  ${group.name}: ${group.students?.length || 0} étudiants`);
        });
        
        console.log('\n✅ SERVEUR FONCTIONNE CORRECTEMENT !');
        console.log('🚀 Vous pouvez maintenant utiliser l\'application');
      } else {
        console.log('❌ Réponse API invalide:', jsonData);
      }
    } catch (error) {
      console.log('❌ Erreur parsing JSON:', error.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n🔧 SOLUTION:');
    console.log('1. Le serveur backend n\'est pas démarré');
    console.log('2. Lancez: npm start dans le dossier server');
    console.log('3. Attendez que le serveur démarre');
    console.log('4. Relancez ce test');
  }
});

req.end();

