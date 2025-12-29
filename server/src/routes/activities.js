const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// Helper to get DB instance
const getDb = () => getDatabase();

// GET all activities or by student_id
router.get('/', (req, res) => {
  const db = getDb();
  const { student_id, school_year } = req.query;
  let query = 'SELECT * FROM activities';
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
      console.error('Error fetching activities:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch activities', error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// GET activity by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  db.get('SELECT * FROM activities WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching activity:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch activity', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, data: row });
  });
});

// POST a new activity
router.post('/', (req, res) => {
  const db = getDb();
  const { student_id, date, title, description, type, hours, observations, school_year } = req.body;

  if (!student_id || !date || !title || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields: student_id, date, title, description' });
  }

  db.run(
    'INSERT INTO activities (student_id, date, title, description, type, hours, observations, school_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [student_id, date, title, description, type || 'technical', hours || 0, observations || '', school_year || '2025-2026'],
    function (err) {
      if (err) {
        console.error('Error creating activity:', err);
        return res.status(500).json({ success: false, message: 'Failed to create activity', error: err.message });
      }
      res.status(201).json({ success: true, message: 'Activity created successfully', id: this.lastID });
    }
  );
});

// PUT (update) an activity
router.put('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { student_id, date, title, description, type, hours, observations } = req.body;

  if (!student_id || !date || !title || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields: student_id, date, title, description' });
  }

  db.run(
    'UPDATE activities SET student_id = ?, date = ?, title = ?, description = ?, type = ?, hours = ?, observations = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [student_id, date, title, description, type || 'technical', hours || 0, observations || '', id],
    function (err) {
      if (err) {
        console.error('Error updating activity:', err);
        return res.status(500).json({ success: false, message: 'Failed to update activity', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Activity not found' });
      }
      res.json({ success: true, message: 'Activity updated successfully' });
    }
  );
});

// DELETE an activity
router.delete('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  db.run('DELETE FROM activities WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting activity:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete activity', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, message: 'Activity deleted successfully' });
  });
});

module.exports = router;