const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'server', 'database', 'u52.db');

console.log('🔍 Test des groupes et étudiants...');
console.log('📁 Chemin de la base:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur ouverture base:', err.message);
    return;
  }
  console.log('✅ Connexion réussie');
});

// Test de la requête exacte utilisée par l'API
console.log('\n🔍 Test de la requête API...');
db.all(`
  SELECT 
    g.id as group_id,
    g.name as group_name,
    g.project_id,
    p.title as project_title,
    s.id as student_id,
    s.first_name,
    s.last_name,
    s.class,
    s.group_id as student_group_id
  FROM groups g
  LEFT JOIN projects p ON g.project_id = p.id
  LEFT JOIN students s ON g.id = s.group_id
  ORDER BY g.name, s.last_name, s.first_name
`, [], (err, results) => {
  if (err) {
    console.error('❌ Erreur requête:', err);
    return;
  }
  
  console.log('📊 Résultats bruts:', results.length);
  
  // Grouper par groupe
  const groupedResults = {};
  results.forEach(row => {
    if (!groupedResults[row.group_id]) {
      groupedResults[row.group_id] = {
        id: row.group_id,
        name: row.group_name,
        project_id: row.project_id,
        project_title: row.project_title,
        students: []
      };
    }
    if (row.student_id) {
      groupedResults[row.group_id].students.push({
        id: row.student_id,
        first_name: row.first_name,
        last_name: row.last_name,
        class: row.class,
        group_id: row.student_group_id
      });
    }
  });
  
  console.log('\n📁 Groupes avec étudiants:');
  Object.keys(groupedResults).forEach(groupId => {
    const group = groupedResults[groupId];
    console.log(`\n🏷️ Groupe: ${group.name} (ID: ${group.id})`);
    console.log(`📋 Projet: ${group.project_title || 'Aucun'}`);
    console.log(`👥 Étudiants (${group.students.length}):`);
    
    if (group.students.length === 0) {
      console.log('  ⚠️ Aucun étudiant assigné');
    } else {
      group.students.forEach(student => {
        console.log(`  👤 ${student.first_name} ${student.last_name} (Classe: ${student.class})`);
      });
    }
  });
  
  db.close();
});

