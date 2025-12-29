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
    res.json({ success: true, data: rows });
  });
});

// GET students by class ID
router.get('/:id/students', (req, res) => {
  const db = getDb();
  const { id } = req.params;

  const query = `
    SELECT s.*, p.title as project_title, g.name as group_name, g.id as group_id
    FROM students s
    LEFT JOIN projects p ON s.project_id = p.id
    LEFT JOIN groups g ON s.group_id = g.id
    WHERE s.class_id = ?
    ORDER BY s.last_name, s.first_name
  `;

  db.all(query, [id], (err, students) => {
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

    // Get students in this class
    db.all(
      'SELECT id, first_name, last_name, date_de_naissance FROM students WHERE class_id = ? ORDER BY last_name, first_name',
      [id],
      (err, students) => {
        if (err) {
          console.error('Error fetching class students:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch class students', error: err.message });
        }

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

module.exports = router;
