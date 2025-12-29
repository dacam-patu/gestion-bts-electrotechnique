const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'u52.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('✅ Base de données connectée');
  }
});

db.serialize(() => {
  console.log('\n🔍 Test direct SQL pour la classe STS ELEC1...');
  
  // Test direct de la requête SQL
  const query = 'SELECT id, first_name, last_name, date_de_naissance, coloration FROM students WHERE class = ? ORDER BY last_name, first_name';
  const params = ['STS ELEC1'];
  
  console.log('📝 Requête SQL:', query);
  console.log('📝 Paramètres:', params);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('❌ Erreur SQL:', err.message);
      return;
    }
    
    console.log(`\n📊 Résultats: ${rows.length} étudiants trouvés`);
    rows.forEach(row => {
      console.log(`- ${row.first_name} ${row.last_name}: coloration="${row.coloration}"`);
    });
  });

  db.close((err) => {
    if (err) {
      console.error('❌ Erreur lors de la fermeture:', err.message);
    } else {
      console.log('\n✅ Base de données fermée');
    }
  });
});