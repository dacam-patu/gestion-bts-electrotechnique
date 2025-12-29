const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'database', 'u52.db');

// Ouvrir la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err);
    return;
  }
  console.log('✅ Base de données connectée');
});

// Vérifier la structure de la table students
console.log('🔍 Vérification de la structure de la table students...');
db.all("PRAGMA table_info(students)", (err, columns) => {
  if (err) {
    console.error('❌ Erreur lors de la vérification de la structure:', err);
    return;
  }
  
  console.log('\n📋 Colonnes de la table students:');
  columns.forEach(col => {
    console.log(`- ${col.name}: ${col.type}`);
  });
  
  // Vérifier si la colonne coloration existe
  const hasColoration = columns.some(col => col.name === 'coloration');
  console.log(`\n🎨 Colonne 'coloration' présente: ${hasColoration ? '✅ OUI' : '❌ NON'}`);
  
  if (hasColoration) {
    // Afficher quelques étudiants avec leur coloration
    console.log('\n👥 Exemples d\'étudiants avec coloration:');
    db.all(`
      SELECT first_name, last_name, coloration 
      FROM students 
      WHERE coloration IS NOT NULL AND coloration != '' 
      LIMIT 5
    `, (err, rows) => {
      if (err) {
        console.error('❌ Erreur lors de la récupération des étudiants:', err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('⚠️ Aucun étudiant n\'a de coloration définie');
        
        // Afficher tous les étudiants pour voir s'ils existent
        db.all(`
          SELECT first_name, last_name, coloration 
          FROM students 
          LIMIT 5
        `, (err, allRows) => {
          if (err) {
            console.error('❌ Erreur:', err);
            return;
          }
          
          console.log('\n📝 Premiers étudiants de la base:');
          allRows.forEach(student => {
            console.log(`- ${student.first_name} ${student.last_name} (coloration: "${student.coloration || 'NULL'}")`);
          });
        });
      } else {
        rows.forEach(student => {
          console.log(`- ${student.first_name} ${student.last_name}: ${student.coloration}`);
        });
      }
    });
  }
});

// Fermer la base de données après 3 secondes
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Erreur lors de la fermeture:', err);
    } else {
      console.log('\n✅ Base de données fermée');
    }
  });
}, 3000);
