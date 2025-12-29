const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// Helper to get DB instance
const getDb = () => getDatabase();

// GET all classes or by school_year
router.get('/', (req, res) => {
  const db = getDb();
  const { school_year } = req.query;
  let query = 'SELECT * FROM classes';
  let params = [];

  if (school_year) {
    query += ' WHERE school_year = ?';
    params.push(school_year);
  }

  query += ' ORDER BY name';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching classes:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch classes', error: err.message });
    }

    // If no classes exist for the selected year, infer them from students and auto-create
    if ((!rows || rows.length === 0) && school_year) {
      console.log(`ℹ️ Aucune classe trouvée pour ${school_year}. Tentative de création à partir des étudiants...`);
      const distinctClassesQuery = `
        SELECT DISTINCT TRIM(class) AS name
        FROM students
        WHERE class IS NOT NULL AND TRIM(class) != '' AND school_year = ?
        ORDER BY name
      `;

      db.all(distinctClassesQuery, [school_year], (err2, studentClasses) => {
        if (err2) {
          console.error('Error fetching distinct student classes:', err2);
          return res.status(500).json({ success: false, message: 'Failed to infer classes from students', error: err2.message });
        }

        if (!studentClasses || studentClasses.length === 0) {
          console.log('ℹ️ Aucune classe détectée dans la table students.');
          return res.json({ success: true, data: [] });
        }

        // Insert missing classes, ignoring duplicates
        const insertStmt = db.prepare('INSERT OR IGNORE INTO classes (name, school_year, description) VALUES (?, ?, ?)');
        studentClasses.forEach(sc => {
          insertStmt.run(sc.name, school_year, 'Créée automatiquement depuis les étudiants');
        });
        insertStmt.finalize(() => {
          // Re-fetch classes after insertion
          db.all(query, params, (err3, refreshedRows) => {
            if (err3) {
              console.error('Error re-fetching classes after insert:', err3);
              return res.status(500).json({ success: false, message: 'Failed to fetch classes after insert', error: err3.message });
            }
            console.log('✅ Classes créées et récupérées:', refreshedRows.map(c => ({ id: c.id, name: c.name, school_year: c.school_year })));
            return res.json({ success: true, data: refreshedRows });
          });
        });
      });
      return; // stop here; response will be sent in callbacks
    }

    console.log('🔍 Classes trouvées:', rows.length, rows.map(c => ({ id: c.id, name: c.name, school_year: c.school_year })));
    return res.json({ success: true, data: rows });
  });
});

// GET students by class ID
router.get('/:id/students', (req, res) => {
  const db = getDb();
  const { id } = req.params;

  // First get the class name
  db.get('SELECT name FROM classes WHERE id = ?', [id], (err, classData) => {
    if (err) {
      console.error('Error fetching class name:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch class name', 
        error: err.message 
      });
    }

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const query = `
      SELECT s.*, p.title as project_title, g.name as group_name, g.id as group_id
      FROM students s
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN groups g ON s.group_id = g.id
      WHERE (s.class = ? OR s.class_id = ?)
      ORDER BY s.last_name, s.first_name
    `;

    db.all(query, [classData.name, id], (err, students) => {
      if (err) {
        console.error('Error fetching students for class:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch students for class', 
          error: err.message 
        });
      }
      res.json({ success: true, data: students });
    });
  });
});

// GET class by ID with students
router.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  // Get class info
  db.get('SELECT * FROM classes WHERE id = ?', [id], (err, classData) => {
    if (err) {
      console.error('Error fetching class:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch class', error: err.message });
    }
    
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Get students in this class - chercher par nom ET par class_id
    console.log('🔍 Recherche d\'étudiants pour la classe:', classData.name, 'ID:', classData.id);
    
    const query = `
      SELECT id, first_name, last_name, date_de_naissance, coloration, class, class_id 
      FROM students 
      WHERE (class = ? OR class_id = ?) 
      ORDER BY last_name, first_name
    `;
    
    db.all(query, [classData.name, classData.id], (err, students) => {
      if (err) {
        console.error('Error fetching class students:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch class students', error: err.message });
      }
      
      console.log(`🔍 Étudiants trouvés pour "${classData.name}" (ID: ${classData.id}):`, students.length, students);

        res.json({ 
          success: true, 
          data: {
            ...classData,
            students: students
          }
        });
      }
    );
  });
});

// POST a new class
router.post('/', (req, res) => {
  const db = getDb();
  const { name, school_year, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Missing required field: name' });
  }

  db.run(
    'INSERT INTO classes (name, school_year, description) VALUES (?, ?, ?)',
    [name, school_year || '2025-2026', description || ''],
    function (err) {
      if (err) {
        console.error('Error creating class:', err);
        return res.status(500).json({ success: false, message: 'Failed to create class', error: err.message });
      }
      res.status(201).json({ success: true, message: 'Class created successfully', id: this.lastID });
    }
  );
});

// PUT (update) a class
router.put('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { name, school_year, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Missing required field: name' });
  }

  db.run(
    'UPDATE classes SET name = ?, school_year = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, school_year || '2025-2026', description || '', id],
    function (err) {
      if (err) {
        console.error('Error updating class:', err);
        return res.status(500).json({ success: false, message: 'Failed to update class', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
      res.json({ success: true, message: 'Class updated successfully' });
    }
  );
});

// DELETE a class
router.delete('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  // First, remove students from this class
  db.run('UPDATE students SET class_id = NULL WHERE class_id = ?', [id], (err) => {
    if (err) {
      console.error('Error removing students from class:', err);
      return res.status(500).json({ success: false, message: 'Failed to remove students from class', error: err.message });
    }

    // Then delete the class
    db.run('DELETE FROM classes WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting class:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete class', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
      res.json({ success: true, message: 'Class deleted successfully' });
    });
  });
});

// POST assign students to class
router.post('/:id/students', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { student_ids } = req.body;

  if (!student_ids || !Array.isArray(student_ids)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid student_ids array' });
  }

  // Remove students from any class first
  const placeholders = student_ids.map(() => '?').join(',');
  db.run(
    `UPDATE students SET class_id = NULL WHERE id IN (${placeholders})`,
    student_ids,
    (err) => {
      if (err) {
        console.error('Error removing students from previous classes:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove students from previous classes', error: err.message });
      }

      // Assign students to the new class
      db.run(
        `UPDATE students SET class_id = ? WHERE id IN (${placeholders})`,
        [id, ...student_ids],
        function (err) {
          if (err) {
            console.error('Error assigning students to class:', err);
            return res.status(500).json({ success: false, message: 'Failed to assign students to class', error: err.message });
          }
          res.json({ success: true, message: `${this.changes} students assigned to class successfully` });
        }
      );
    }
  );
});

// DELETE remove students from class
router.delete('/:id/students', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { student_ids } = req.body;

  if (!student_ids || !Array.isArray(student_ids)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid student_ids array' });
  }

  const placeholders = student_ids.map(() => '?').join(',');
  db.run(
    `UPDATE students SET class_id = NULL WHERE id IN (${placeholders}) AND class_id = ?`,
    [...student_ids, id],
    function (err) {
      if (err) {
        console.error('Error removing students from class:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove students from class', error: err.message });
      }
      res.json({ success: true, message: `${this.changes} students removed from class successfully` });
    }
  );
});

// Route de debug pour synchroniser les classes des étudiants
router.get('/debug/sync-student-classes', (req, res) => {
  const db = getDb();
  
  console.log('🔧 Synchronisation des classes d\'étudiants...');
  
  // Récupérer tous les étudiants
  db.all('SELECT id, first_name, last_name, class, class_id FROM students', [], (err, students) => {
    if (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des étudiants' });
    }
    
    console.log('🔍 Étudiants trouvés:', students.length);
    students.forEach(student => {
      console.log(`- ${student.first_name} ${student.last_name}: class="${student.class}", class_id=${student.class_id}`);
    });
    
    // Récupérer toutes les classes
    db.all('SELECT id, name FROM classes', [], (err, classes) => {
      if (err) {
        console.error('Erreur lors de la récupération des classes:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des classes' });
      }
      
      console.log('🔍 Classes trouvées:', classes);
      
      res.json({ 
        success: true, 
        message: 'Données récupérées pour debug',
        data: { students, classes }
      });
    });
  });
});

module.exports = router;
