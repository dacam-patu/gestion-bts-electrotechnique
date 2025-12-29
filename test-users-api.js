// Script de test pour vérifier l'API users
const axios = require('axios');

const testUsersAPI = async () => {
  try {
    console.log('🔄 Test de l\'API /api/users...');
    
    const response = await axios.get('http://localhost:3001/api/users');
    
    console.log('✅ API répond avec succès !');
    console.log('📊 Nombre d\'utilisateurs:', response.data.length);
    
    // Afficher tous les utilisateurs
    console.log('\n👥 Tous les utilisateurs:');
    response.data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.username}) - Rôle: "${user.role}"`);
    });
    
    // Filtrer les professeurs
    const professeurs = response.data.filter(user => 
      user.role === 'teacher' || 
      user.role === 'professeur' ||
      user.role === 'Teacher' ||
      user.role === 'Professeur'
    );
    
    console.log('\n👨‍🏫 Professeurs trouvés:');
    if (professeurs.length === 0) {
      console.log('❌ Aucun professeur trouvé !');
      
      // Afficher tous les rôles uniques
      const roles = [...new Set(response.data.map(u => u.role))];
      console.log('\n🔍 Rôles disponibles:', roles);
      
      // Suggestions
      console.log('\n💡 Suggestions:');
      console.log('1. Vérifiez que des utilisateurs avec le rôle "teacher" existent');
      console.log('2. Créez un professeur avec: POST /api/users');
      console.log('3. Ou utilisez: POST /api/users/create-test-users');
    } else {
      professeurs.forEach((prof, index) => {
        console.log(`${index + 1}. ${prof.first_name} ${prof.last_name} - Rôle: "${prof.role}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

// Fonction pour créer un professeur de test
const createTestTeacher = async () => {
  try {
    console.log('\n🔄 Création d\'un professeur de test...');
    
    const teacherData = {
      username: 'prof.test',
      password: 'password123',
      email: 'prof.test@example.com',
      first_name: 'Jean',
      last_name: 'Dupont',
      role: 'teacher'
    };
    
    const response = await axios.post('http://localhost:3001/api/users', teacherData);
    console.log('✅ Professeur créé:', response.data);
  } catch (error) {
    console.error('❌ Erreur création professeur:', error.response?.data || error.message);
  }
};

// Exécuter les tests
const runTests = async () => {
  console.log('🚀 Début des tests API Users\n');
  
  await testUsersAPI();
  
  // Demander si on veut créer un professeur de test
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n❓ Voulez-vous créer un professeur de test ? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await createTestTeacher();
      console.log('\n🔄 Retest après création...');
      await testUsersAPI();
    }
    rl.close();
  });
};

runTests();
