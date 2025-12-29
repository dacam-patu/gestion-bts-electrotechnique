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
  console.log('\n🔍 Vérification des étudiants de la classe STS ELEC1...');
  
  // Vérifier les étudiants avec class_id = 1
  db.all("SELECT first_name, last_name, coloration, class_id, class FROM students WHERE class_id = 1", (err, rows) => {
    if (err) {
      console.error('❌ Erreur:', err.message);
      return;
    }
    console.log(`\n📊 Étudiants avec class_id = 1: ${rows.length}`);
    rows.slice(0, 5).forEach(row => {
      console.log(`- ${row.first_name} ${row.last_name}: coloration="${row.coloration}", class_id=${row.class_id}, class="${row.class}"`);
    });
  });

  // Vérifier les étudiants avec class = 'STS ELEC1'
  db.all("SELECT first_name, last_name, coloration, class_id, class FROM students WHERE class = 'STS ELEC1'", (err, rows) => {
    if (err) {
      console.error('❌ Erreur:', err.message);
      return;
    }
    console.log(`\n📊 Étudiants avec class = 'STS ELEC1': ${rows.length}`);
    rows.slice(0, 5).forEach(row => {
      console.log(`- ${row.first_name} ${row.last_name}: coloration="${row.coloration}", class_id=${row.class_id}, class="${row.class}"`);
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
