const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database/u52.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Diagnostic de la base de données...\n');

// 1. Vérifier l'utilisateur admin
console.log('1. Vérification de l\'utilisateur admin:');
db.get('SELECT id, username, role, email, first_name, last_name FROM users WHERE username = ?', ['admin'], (err, user) => {
  if (err) {
    console.error('❌ Erreur:', err);
  } else if (user) {
    console.log('✅ Utilisateur admin trouvé:', user);
  } else {
    console.log('❌ Utilisateur admin non trouvé');
  }

  // 2. Vérifier les rôles
  console.log('\n2. Vérification des rôles:');
  db.all('SELECT * FROM roles', (err, roles) => {
    if (err) {
      console.error('❌ Erreur:', err);
    } else {
      console.log('✅ Rôles trouvés:', roles);
    }

    // 3. Vérifier les permissions
    console.log('\n3. Vérification des permissions:');
    db.all('SELECT * FROM permissions LIMIT 10', (err, permissions) => {
      if (err) {
        console.error('❌ Erreur:', err);
      } else {
        console.log('✅ Permissions trouvées (premières 10):', permissions);
      }

      // 4. Vérifier les attributions de permissions
      console.log('\n4. Vérification des attributions de permissions:');
      const query = `
        SELECT r.name as role_name, p.name as permission_name, p.description
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE r.name = 'admin'
        LIMIT 10
      `;
      
      db.all(query, (err, assignments) => {
        if (err) {
          console.error('❌ Erreur:', err);
        } else {
          console.log('✅ Permissions attribuées au rôle admin (premières 10):', assignments);
        }

        // 5. Test de la requête de login corrigée
        console.log('\n5. Test de la requête de login pour admin:');
        const loginQuery = `
          SELECT DISTINCT p.name, p.description, p.module, p.action
          FROM users u
          JOIN roles r ON r.name = u.role
          JOIN role_permissions rp ON rp.role_id = r.id
          JOIN permissions p ON p.id = rp.permission_id
          WHERE u.id = ?
        `;
        
        db.all(loginQuery, [1], (err, userPermissions) => {
          if (err) {
            console.error('❌ Erreur lors de la requête de login:', err);
          } else {
            console.log('✅ Permissions récupérées pour admin (ID 1):', userPermissions);
            console.log('📊 Nombre de permissions:', userPermissions.length);
          }

          // 6. Vérifier la structure de la table users
          console.log('\n6. Structure de la table users:');
          db.all('PRAGMA table_info(users)', (err, columns) => {
            if (err) {
              console.error('❌ Erreur:', err);
            } else {
              console.log('✅ Colonnes de la table users:', columns);
            }

            db.close();
            console.log('\n🔍 Diagnostic terminé');
          });
        });
      });
    });
  });
});
