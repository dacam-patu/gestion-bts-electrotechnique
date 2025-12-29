const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database/u52.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Création d\'un utilisateur professeur de test...\n');

const createTeacherUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    
    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT * FROM users WHERE username = ?', ['teacher'], (err, existingUser) => {
      if (err) {
        console.error('❌ Erreur lors de la vérification:', err);
        return;
      }
      
      if (existingUser) {
        console.log('ℹ️ L\'utilisateur professeur existe déjà');
        console.log('📋 Détails:', {
          id: existingUser.id,
          username: existingUser.username,
          role: existingUser.role,
          email: existingUser.email
        });
      } else {
        // Créer l'utilisateur professeur
        db.run('INSERT INTO users (username, password, role, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)', 
          ['teacher', hashedPassword, 'teacher', 'teacher@u52.fr', 'Professeur', 'Test'], (err) => {
          if (err) {
            console.error('❌ Erreur lors de la création:', err);
          } else {
            console.log('✅ Utilisateur professeur créé avec succès');
            console.log('📋 Identifiants de connexion:');
            console.log('   Nom d\'utilisateur: teacher');
            console.log('   Mot de passe: teacher123');
          }
        });
      }
      
      // Vérifier les permissions du rôle teacher
      console.log('\n🔍 Vérification des permissions du rôle teacher:');
      const query = `
        SELECT DISTINCT p.name, p.description, p.module, p.action
        FROM roles r
        JOIN role_permissions rp ON rp.role_id = r.id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE r.name = 'teacher'
        ORDER BY p.module, p.action
      `;
      
      db.all(query, (err, permissions) => {
        if (err) {
          console.error('❌ Erreur lors de la récupération des permissions:', err);
        } else {
          console.log('✅ Permissions du rôle teacher:');
          permissions.forEach(permission => {
            console.log(`   - ${permission.name}: ${permission.description} (${permission.module}/${permission.action})`);
          });
          
          // Vérifier spécifiquement la permission students_view
          const hasStudentsView = permissions.some(p => p.name === 'students_view');
          console.log(`\n📊 Permission students_view: ${hasStudentsView ? '✅ OUI' : '❌ NON'}`);
        }
        
        db.close();
        console.log('\n🔧 Script terminé');
      });
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    db.close();
  }
};

createTeacherUser();
