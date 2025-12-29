const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Suppression en masse d'étudiants
router.delete('/bulk', (req, res) => {
  const db = getDatabase();
  const { student_ids } = req.body;

  console.log('🔍 Suppression en masse - IDs reçus:', student_ids);

  if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Liste d\'IDs d\'étudiants requise'
    });
  }

  // Construire la requête de suppression avec des placeholders
  const placeholders = student_ids.map(() => '?').join(',');
  const query = `DELETE FROM students WHERE id IN (${placeholders})`;

  console.log('🔍 Requête SQL:', query);
  console.log('🔍 Paramètres:', student_ids);

  db.run(query, student_ids, function(err) {
    if (err) {
      console.error('❌ Erreur lors de la suppression en masse:', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression en masse des étudiants'
      });
    }

    console.log('✅ Suppression réussie - Nombre de lignes supprimées:', this.changes);

    res.json({
      success: true,
      message: `${this.changes} étudiant(s) supprimé(s) avec succès`,
      deleted_count: this.changes
    });
  });
});

// Récupérer tous les étudiants
router.get('/', (req, res) => {
  const db = getDatabase();
  const { school_year } = req.query;
  
  let query = `
    SELECT s.*, p.title as project_title, g.name as group_name, g.id as group_id
    FROM students s
    LEFT JOIN projects p ON s.project_id = p.id
    LEFT JOIN groups g ON s.group_id = g.id
  `;
  
  let params = [];
  if (school_year) {
    query += ' WHERE s.school_year = ?';
    params.push(school_year);
  }
  
  query += ' ORDER BY s.last_name, s.first_name';
  
  db.all(query, params, (err, students) => {
    if (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des étudiants' 
      });
    }
    
    console.log('Étudiants récupérés:', students);
    console.log('Étudiants avec groupe:', students.filter(s => s.group_id));
    console.log('Étudiants sans groupe:', students.filter(s => !s.group_id));
    
    // Vérifier les groupes existants
    db.all('SELECT * FROM groups', (err, groups) => {
      if (err) {
        console.error('Erreur lors de la récupération des groupes:', err);
      } else {
        console.log('Groupes existants dans la base:', groups);
      }
    });
    
    res.json({
      success: true,
      data: students
    });
  });
});

// Récupérer un étudiant par ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get(`
    SELECT s.*, p.title as project_title, g.name as group_name, g.id as group_id
    FROM students s
    LEFT JOIN projects p ON s.project_id = p.id
    LEFT JOIN groups g ON s.group_id = g.id
    WHERE s.id = ?
  `, [id], (err, student) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'étudiant:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération de l\'étudiant' 
      });
    }
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  });
});

// Créer un nouvel étudiant
router.post('/', (req, res) => {
  const { first_name, last_name, date_de_naissance, email, class: className, group_id, project_id, role } = req.body;
  
  if (!first_name || !last_name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le prénom et le nom sont requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    INSERT INTO students (first_name, last_name, date_de_naissance, email, class, group_id, project_id, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [first_name, last_name, date_de_naissance, email, className, group_id, project_id, role], function(err) {
    if (err) {
      console.error('Erreur lors de la création de l\'étudiant:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création de l\'étudiant' 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Étudiant créé avec succès',
      data: {
        id: this.lastID,
        first_name,
        last_name,
        date_de_naissance,
        class: className,
        group_id,
        project_id,
        role
      }
    });
  });
});

// Mettre à jour un étudiant
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, date_de_naissance, email, class: className, group_id, project_id, role } = req.body;
  
  if (!first_name || !last_name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le prénom et le nom sont requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    UPDATE students 
    SET first_name = ?, last_name = ?, date_de_naissance = ?, email = ?, class = ?, group_id = ?, project_id = ?, role = ?
    WHERE id = ?
  `, [first_name, last_name, date_de_naissance, email, className, group_id, project_id, role, id], function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'étudiant:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour de l\'étudiant' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Étudiant mis à jour avec succès'
    });
  });
});

// Supprimer un étudiant
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'étudiant:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de l\'étudiant' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Étudiant supprimé avec succès'
    });
  });
});

// Route de diagnostic pour vérifier les groupes et étudiants
router.get('/debug-groups', (req, res) => {
  const db = getDatabase();
  
  console.log('🔍 DIAGNOSTIC: Vérification des groupes et étudiants...');
  
  // 1. Compter les groupes
  db.get('SELECT COUNT(*) as count FROM groups', [], (err, groupCount) => {
    if (err) {
      console.error('❌ Erreur groupe count:', err);
      return res.status(500).json({ success: false, message: 'Erreur diagnostic' });
    }
    
    // 2. Compter les étudiants avec et sans groupe
    db.get('SELECT COUNT(*) as count FROM students WHERE group_id IS NOT NULL', [], (err, studentsWithGroup) => {
      if (err) {
        console.error('❌ Erreur students with group:', err);
        return res.status(500).json({ success: false, message: 'Erreur diagnostic' });
      }
      
      db.get('SELECT COUNT(*) as count FROM students WHERE group_id IS NULL', [], (err, studentsWithoutGroup) => {
        if (err) {
          console.error('❌ Erreur students without group:', err);
          return res.status(500).json({ success: false, message: 'Erreur diagnostic' });
        }
        
        // 3. Lister tous les groupes avec leurs étudiants
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
            s.role,
            s.group_id as student_group_id
          FROM groups g
          LEFT JOIN projects p ON g.project_id = p.id
          LEFT JOIN students s ON s.group_id = g.id
          ORDER BY g.name, s.last_name, s.first_name
        `, [], (err, rows) => {
          if (err) {
            console.error('❌ Erreur query join:', err);
            return res.status(500).json({ success: false, message: 'Erreur diagnostic' });
          }
          
          // Transformer les résultats
          const groupsMap = new Map();
          
          rows.forEach(row => {
            const groupId = row.group_id;
            
            if (!groupsMap.has(groupId)) {
              groupsMap.set(groupId, {
                id: groupId,
                name: row.group_name,
                project_title: row.project_title,
                students: []
              });
            }
            
            if (row.student_id) {
              groupsMap.get(groupId).students.push({
                id: row.student_id,
                first_name: row.first_name,
                last_name: row.last_name,
                class: row.class,
                role: row.role
              });
            }
          });
          
          const groupsWithStudents = Array.from(groupsMap.values());
          
          console.log('📊 RÉSULTATS DIAGNOSTIC:');
          console.log(`- Groupes: ${groupCount.count}`);
          console.log(`- Étudiants avec groupe: ${studentsWithGroup.count}`);
          console.log(`- Étudiants sans groupe: ${studentsWithoutGroup.count}`);
          console.log(`- Lignes JOIN: ${rows.length}`);
          console.log(`- Groupes avec étudiants: ${groupsWithStudents.length}`);
          
          groupsWithStudents.forEach(group => {
            console.log(`  📁 ${group.name}: ${group.students.length} étudiant(s)`);
            group.students.forEach(student => {
              console.log(`    👤 ${student.first_name} ${student.last_name}`);
            });
          });
          
          res.json({
            success: true,
            data: {
              group_count: groupCount.count,
              students_with_group: studentsWithGroup.count,
              students_without_group: studentsWithoutGroup.count,
              join_rows: rows.length,
              groups_with_students: groupsWithStudents.length,
              groups: groupsWithStudents
            }
          });
        });
      });
    });
  });
});

// Récupérer tous les groupes avec leurs étudiants (VERSION CORRIGÉE)
router.get('/groups/all', async (req, res) => {
  const db = getDatabase();
  
  try {
    // Récupérer tous les groupes avec un JOIN direct sur les étudiants
    const query = `
      SELECT 
        g.id as group_id,
        g.name as group_name,
        g.project_id,
        g.created_at as group_created_at,
        p.title as project_title,
        s.id as student_id,
        s.first_name,
        s.last_name,
        s.class,
        s.role,
        s.email,
        s.group_id as student_group_id
      FROM groups g
      LEFT JOIN projects p ON g.project_id = p.id
      LEFT JOIN students s ON s.group_id = g.id
      ORDER BY g.name, s.last_name, s.first_name
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('❌ Erreur lors de la récupération des groupes:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la récupération des groupes' 
        });
      }
      
      // Transformer les résultats en groupes avec leurs étudiants
      const groupsMap = new Map();
      
      rows.forEach(row => {
        const groupId = row.group_id;
        
        // Créer le groupe s'il n'existe pas encore dans la map
        if (!groupsMap.has(groupId)) {
          groupsMap.set(groupId, {
            id: groupId,
            name: row.group_name,
            project_id: row.project_id,
            project_title: row.project_title,
            created_at: row.group_created_at,
            students: [],
            student_count: 0
          });
        }
        
        // Ajouter l'étudiant au groupe si l'étudiant existe
        if (row.student_id) {
          const group = groupsMap.get(groupId);
          group.students.push({
            id: row.student_id,
            first_name: row.first_name,
            last_name: row.last_name,
            class: row.class,
            role: row.role,
            email: row.email,
            group_id: row.student_group_id
          });
          group.student_count = group.students.length;
        }
      });
      
      // Convertir la map en tableau
      const groupsWithStudents = Array.from(groupsMap.values());
      
      // Charger aussi les ouvriers
      db.all(`
        SELECT gw.group_id, s.id, s.first_name, s.last_name, s.class, s.role, s.email 
        FROM group_workers gw 
        JOIN students s ON s.id = gw.student_id
        ORDER BY s.last_name, s.first_name
      `, [], (err2, workerRows) => {
        if (err2) {
          console.error('❌ Erreur lors de la récupération des ouvriers:', err2);
          return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des ouvriers' });
        }
        const byGroup = new Map();
        for (const w of workerRows) {
          if (!byGroup.has(w.group_id)) byGroup.set(w.group_id, []);
          byGroup.get(w.group_id).push({
            id: w.id,
            first_name: w.first_name,
            last_name: w.last_name,
            class: w.class,
            role: w.role,
            email: w.email
          });
        }
        groupsWithStudents.forEach(g => {
          g.workers = byGroup.get(g.id) || [];
        });
        
        console.log('✅ Groupes avec étudiants récupérés:', groupsWithStudents.length, 'groupes');
        groupsWithStudents.forEach(group => {
          console.log(`  📁 ${group.name}: ${group.students.length} étudiants, ${group.workers.length} ouvriers`);
        });
        
        res.json({ 
          success: true, 
          data: groupsWithStudents 
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des groupes' 
    });
  }
});

// Créer un nouveau groupe
router.post('/groups', (req, res) => {
  const { name, project_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le nom du groupe est requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    INSERT INTO groups (name, project_id)
    VALUES (?, ?)
  `, [name, project_id], function(err) {
    if (err) {
      console.error('Erreur lors de la création du groupe:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création du groupe' 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Groupe créé avec succès',
      data: {
        id: this.lastID,
        name,
        project_id
      }
    });
  });
});

// Modifier un groupe
router.put('/groups/:id', (req, res) => {
  const { id } = req.params;
  const { name, project_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le nom du groupe est requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    UPDATE groups 
    SET name = ?, project_id = ?
    WHERE id = ?
  `, [name, project_id, id], function(err) {
    if (err) {
      console.error('Erreur lors de la modification du groupe:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la modification du groupe' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Groupe modifié avec succès'
    });
  });
});

// Récupérer les ouvriers d'un groupe
router.get('/groups/:id/workers', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  db.all(`
    SELECT s.* 
    FROM group_workers gw
    JOIN students s ON s.id = gw.student_id
    WHERE gw.group_id = ?
    ORDER BY s.last_name, s.first_name
  `, [id], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des ouvriers:', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des ouvriers' });
    }
    res.json({ success: true, data: rows });
  });
});

// Définir les ouvriers d'un groupe (remplace la liste)
router.post('/groups/:id/workers', (req, res) => {
  const { id } = req.params;
  const { student_ids } = req.body;
  const db = getDatabase();
  
  if (!Array.isArray(student_ids)) {
    return res.status(400).json({ success: false, message: 'student_ids doit être un tableau' });
  }
  
  // Empêcher d'ajouter des élèves déjà en Pilotage (phase 2) pour ce groupe
  const placeholders = student_ids.length ? student_ids.map(() => '?').join(',') : '';
  const checkConflicts = student_ids.length
    ? `
      SELECT DISTINCT s.id
      FROM students s
      JOIN planning_slots ps ON ps.student_id = s.id
      WHERE s.group_id = ? AND ps.phase = 2 AND s.id IN (${placeholders})
    `
    : null;

  const proceedSave = () => {
    db.run('DELETE FROM group_workers WHERE group_id = ?', [id], (delErr) => {
      if (delErr) {
        console.error('Erreur lors du nettoyage des ouvriers:', delErr);
        return res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde des ouvriers' });
      }
      if (student_ids.length === 0) {
        return res.json({ success: true, message: 'Ouvriers effacés' });
      }
      const stmt = db.prepare('INSERT OR IGNORE INTO group_workers (group_id, student_id) VALUES (?, ?)');
      let hadErr = false;
      for (const sid of student_ids) {
        stmt.run([id, sid], (e) => {
          if (e) hadErr = true;
        });
      }
      stmt.finalize((e) => {
        if (e || hadErr) {
          console.error('Erreur lors de l\'insertion des ouvriers:', e);
          return res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde des ouvriers' });
        }
        return res.json({ success: true, message: 'Ouvriers enregistrés' });
      });
    });
  };

  if (!checkConflicts) {
    return proceedSave();
  }
  db.all(checkConflicts, [id, ...student_ids], (err, conflicts) => {
    if (err) {
      console.error('Erreur de vérification des conflits ouvriers/pilotage:', err);
      return res.status(500).json({ success: false, message: 'Erreur de vérification des conflits' });
    }
    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Certains étudiants sont déjà utilisés en Pilotage pour ce groupe',
        conflict_ids: conflicts.map(c => c.id)
      });
    }
    proceedSave();
  });
});

// Supprimer un groupe
router.delete('/groups/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  // D'abord, retirer tous les étudiants du groupe
  db.run(`
    UPDATE students 
    SET group_id = NULL 
    WHERE group_id = ?
  `, [id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression des étudiants du groupe:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du groupe' 
      });
    }
    
    // Ensuite, supprimer le groupe
    db.run(`
      DELETE FROM groups 
      WHERE id = ?
    `, [id], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression du groupe:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la suppression du groupe' 
        });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Groupe non trouvé' 
        });
      }
      
      res.json({
        success: true,
        message: `Groupe supprimé avec succès. ${this.changes} étudiant(s) retiré(s) du groupe.`
      });
    });
  });
});

// Réinitialiser tous les étudiants (retirer de tous les groupes)
router.post('/reset-all-groups', (req, res) => {
  const db = getDatabase();
  
  db.run(`
    UPDATE students 
    SET group_id = NULL 
    WHERE group_id IS NOT NULL
  `, function(err) {
    if (err) {
      console.error('Erreur lors de la réinitialisation des groupes:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la réinitialisation des groupes' 
      });
    }
    
    res.json({
      success: true,
      message: `${this.changes} étudiant(s) retiré(s) de leurs groupes avec succès`
    });
  });
});

// Retirer un étudiant de son groupe
router.post('/remove-from-group', (req, res) => {
  const { student_id } = req.body;
  
  if (!student_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID étudiant requis' 
    });
  }
  
  const db = getDatabase();
  
  // Vérifier que l'étudiant existe et a un groupe
  db.get('SELECT id, first_name, last_name, group_id FROM students WHERE id = ?', [student_id], (err, student) => {
    if (err) {
      console.error('❌ Erreur recherche étudiant:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la recherche de l\'étudiant' 
      });
    }
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }
    
    if (!student.group_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet étudiant n\'est pas dans un groupe' 
      });
    }
    
    // Retirer l'étudiant du groupe
    db.run('UPDATE students SET group_id = NULL WHERE id = ?', [student_id], function(err) {
      if (err) {
        console.error('❌ Erreur retrait groupe:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors du retrait du groupe' 
        });
      }
      
      console.log(`✅ Étudiant ${student.first_name} ${student.last_name} retiré du groupe`);
      
      res.json({
        success: true,
        message: `${student.first_name} ${student.last_name} retiré du groupe avec succès`,
        student: {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name
        }
      });
    });
  });
});

// Affecter automatiquement les premiers étudiants disponibles à un groupe
router.post('/auto-assign-to-group', (req, res) => {
  const { group_id, max_students = 5 } = req.body;
  
  if (!group_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID du groupe requis' 
    });
  }
  
  const db = getDatabase();
  
  // Vérifier que le groupe existe
  db.get('SELECT id, name FROM groups WHERE id = ?', [group_id], (err, group) => {
    if (err) {
      console.error('❌ Erreur recherche groupe:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la recherche du groupe' 
      });
    }
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé' 
      });
    }
    
    // Trouver les étudiants sans groupe
    db.all('SELECT id, first_name, last_name FROM students WHERE group_id IS NULL LIMIT ?', [max_students], (err, students) => {
      if (err) {
        console.error('❌ Erreur recherche étudiants:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la recherche des étudiants' 
        });
      }
      
      if (students.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Aucun étudiant sans groupe disponible' 
        });
      }
      
      // Affecter les étudiants au groupe
      const studentIds = students.map(s => s.id);
      const placeholders = studentIds.map(() => '?').join(',');
      
      db.run(`
        UPDATE students 
        SET group_id = ? 
        WHERE id IN (${placeholders})
      `, [group_id, ...studentIds], function(err) {
        if (err) {
          console.error('❌ Erreur assignation:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'assignation' 
          });
        }
        
        console.log(`✅ ${this.changes} étudiant(s) affecté(s) au groupe "${group.name}"`);
        
        res.json({
          success: true,
          message: `${this.changes} étudiant(s) affecté(s) au groupe "${group.name}" avec succès`,
          assigned_count: this.changes,
          group_name: group.name,
          students: students
        });
      });
    });
  });
});

// Affecter des étudiants à un groupe en masse
router.post('/bulk-assign-group', (req, res) => {
  const { student_ids, group_id } = req.body;
  
  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Aucun étudiant sélectionné' 
    });
  }
  
  if (!group_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Groupe non spécifié' 
    });
  }
  
  const db = getDatabase();
  
  // Vérifier que le groupe existe
  db.get('SELECT id FROM groups WHERE id = ?', [group_id], (err, group) => {
    if (err) {
      console.error('Erreur lors de la vérification du groupe:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'affectation' 
      });
    }
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé' 
      });
    }
    
    // Affecter les étudiants au groupe
    const placeholders = student_ids.map(() => '?').join(',');
    const params = [...student_ids, group_id];
    
    db.run(`
      UPDATE students 
      SET group_id = ? 
      WHERE id IN (${placeholders})
    `, params, function(err) {
      if (err) {
        console.error('Erreur lors de l\'affectation des étudiants:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de l\'affectation des étudiants' 
        });
      }
      
      res.json({
        success: true,
        message: `${this.changes} étudiant(s) affecté(s) au groupe avec succès`
      });
    });
  });
});

// Récupérer les étudiants par projet
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT s.*, g.name as group_name
    FROM students s
    LEFT JOIN groups g ON s.group_id = g.id
    WHERE s.project_id = ?
    ORDER BY s.last_name, s.first_name
  `, [projectId], (err, students) => {
    if (err) {
      console.error('Erreur lors de la récupération des étudiants du projet:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des étudiants' 
      });
    }
    
    res.json({
      success: true,
      data: students
    });
  });
});

// Import students in bulk
router.post('/bulk', async (req, res) => {
  const { students } = req.body;
  const db = getDatabase();
  
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ success: false, message: 'Données invalides' });
  }

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const studentData of students) {
    try {
      // Vérifier si l'étudiant existe déjà
      const existingStudent = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM students WHERE first_name = ? AND last_name = ?',
          [studentData.first_name, studentData.last_name],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingStudent) {
        results.push({
          student: studentData,
          status: 'skipped',
          message: 'Étudiant déjà existant'
        });
        continue;
      }

      // Gérer le groupe si spécifié
      let groupId = null;
      if (studentData.group_name) {
        // Chercher ou créer le groupe
        const existingGroup = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM groups WHERE name = ?', [studentData.group_name], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          const groupResult = await new Promise((resolve, reject) => {
            db.run('INSERT INTO groups (name) VALUES (?)', [studentData.group_name], function(err) {
              if (err) reject(err);
              else resolve({ id: this.lastID });
            });
          });
          groupId = groupResult.id;
        }
      }

      // Gérer le projet si spécifié
      let projectId = null;
      if (studentData.project_title) {
        // Chercher le projet existant
        const existingProject = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM projects WHERE title = ?', [studentData.project_title], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (existingProject) {
          projectId = existingProject.id;
        }
      }

      // Insérer l'étudiant
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO students (first_name, last_name, date_de_naissance, email, class, group_id, project_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            studentData.first_name, 
            studentData.last_name, 
            studentData.date_de_naissance || null,
            studentData.email || null,
            studentData.class || null, 
            groupId,
            projectId,
            studentData.role || null
          ],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      results.push({
        student: studentData,
        status: 'success',
        id: result.id
      });
      successCount++;
    } catch (error) {
      results.push({
        student: studentData,
        status: 'error',
        message: error.message
      });
      errorCount++;
    }
  }

  res.json({
    success: true,
    message: `Import terminé: ${successCount} succès, ${errorCount} erreurs`,
    results,
    summary: {
      total: students.length,
      success: successCount,
      error: errorCount,
      skipped: results.filter(r => r.status === 'skipped').length
    }
  });
});


module.exports = router; 