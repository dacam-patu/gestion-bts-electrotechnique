const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// Helper to get DB instance
const getDb = () => getDatabase();

// GET all absences or by student_id
router.get('/', (req, res) => {
  const db = getDb();
  const { student_id, school_year } = req.query;
  let query = 'SELECT * FROM absences';
  let params = [];
  let conditions = [];

  if (student_id) {
    conditions.push('student_id = ?');
    params.push(student_id);
  }

  if (school_year) {
    conditions.push('school_year = ?');
    params.push(school_year);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching absences:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch absences', error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// GET absence by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  db.get('SELECT * FROM absences WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching absence:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch absence', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Absence not found' });
    }
    res.json({ success: true, data: row });
  });
});

// POST a new absence
router.post('/', (req, res) => {
  const db = getDb();
  const { student_id, date, reason, type, duration, school_year } = req.body;

  if (!student_id || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields: student_id, date' });
  }

  db.run(
    'INSERT INTO absences (student_id, date, reason, type, duration, school_year) VALUES (?, ?, ?, ?, ?, ?)',
    [student_id, date, reason || '', type || 'justified', duration || 'full_day', school_year || '2025-2026'],
    function (err) {
      if (err) {
        console.error('Error creating absence:', err);
        return res.status(500).json({ success: false, message: 'Failed to create absence', error: err.message });
      }
      res.status(201).json({ success: true, message: 'Absence created successfully', id: this.lastID });
    }
  );
});

// PUT (update) an absence
router.put('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { student_id, date, reason, type, duration } = req.body;

  if (!student_id || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields: student_id, date' });
  }

  db.run(
    'UPDATE absences SET student_id = ?, date = ?, reason = ?, type = ?, duration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [student_id, date, reason || '', type || 'justified', duration || 'full_day', id],
    function (err) {
      if (err) {
        console.error('Error updating absence:', err);
        return res.status(500).json({ success: false, message: 'Failed to update absence', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Absence not found' });
      }
      res.json({ success: true, message: 'Absence updated successfully' });
    }
  );
});

// DELETE an absence
router.delete('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  db.run('DELETE FROM absences WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting absence:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete absence', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Absence not found' });
    }
    res.json({ success: true, message: 'Absence deleted successfully' });
  });
});

module.exports = router;