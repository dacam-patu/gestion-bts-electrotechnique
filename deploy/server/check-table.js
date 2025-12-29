const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database/u52.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Vérification de la structure de la table students...');

db.all("PRAGMA table_info(students)", (err, columns) => {
  if (err) {
    console.error('❌ Erreur:', err);
    return;
  }
  
  console.log('📊 Colonnes de la table students:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  
  // Vérifier si la colonne email existe
  const hasEmail = columns.some(col => col.name === 'email');
  console.log(`\n📧 Colonne email existe: ${hasEmail ? '✅ OUI' : '❌ NON'}`);
  
  if (!hasEmail) {
    console.log('🔄 Ajout de la colonne email...');
    db.run('ALTER TABLE students ADD COLUMN email TEXT', (err) => {
      if (err) {
        console.error('❌ Erreur lors de l\'ajout de la colonne email:', err);
      } else {
        console.log('✅ Colonne email ajoutée avec succès');
      }
      db.close();
    });
  } else {
    db.close();
  }
});
