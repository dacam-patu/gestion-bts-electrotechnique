const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'database', 'u52.db');

// Connexion à la base de données
const db = new sqlite3.Database(dbPath);

console.log('🔍 Test de la table evaluations...');

// Vérifier la structure de la table
db.all("PRAGMA table_info(evaluations)", (err, columns) => {
  if (err) {
    console.error('❌ Erreur lors de la vérification de la structure:', err);
    return;
  }
  
  console.log('📋 Structure de la table evaluations:');
  columns.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}`);
  });
  
  // Vérifier les données existantes
  db.all("SELECT id, competence, criteria FROM evaluations ORDER BY id DESC LIMIT 5", (err, rows) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des données:', err);
      return;
    }
    
    console.log('\n📊 Données récentes dans la table evaluations:');
    rows.forEach(row => {
      console.log(`  ID: ${row.id}, Compétence: ${row.competence}`);
      console.log(`  Critères: ${row.criteria || 'NULL'}`);
      if (row.criteria) {
        try {
          const parsed = JSON.parse(row.criteria);
          console.log(`  Critères parsés:`, parsed);
        } catch (e) {
          console.log(`  ❌ Impossible de parser les critères: ${e.message}`);
        }
      }
      console.log('');
    });
    
    db.close();
  });
});
