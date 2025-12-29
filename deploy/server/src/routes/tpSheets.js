const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// GET /api/tp-sheets - Récupérer toutes les fiches TP
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const tpSheets = await new Promise((resolve, reject) => {
      db.all(`
      SELECT * FROM tp_sheets 
      ORDER BY created_at DESC
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
    
    res.json(tpSheets);
  } catch (error) {
    console.error('Erreur lors de la récupération des fiches TP:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/tp-sheets/:id - Récupérer une fiche TP par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const tpSheet = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM tp_sheets WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!tpSheet) {
      return res.status(404).json({ message: 'Fiche TP non trouvée' });
    }
    
    res.json(tpSheet);
  } catch (error) {
    console.error('Erreur lors de la récupération de la fiche TP:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/tp-sheets - Créer une nouvelle fiche TP
router.post('/', async (req, res) => {
  try {
    console.log('📥 Requête POST /api/tp-sheets reçue');
    console.log('📋 Body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      subtitle,
      context,
      objectives,
      documents,
      tasks,
      competencies,
      workRequired,
      evaluation,
      equipment,
      images,
      duration,
      safety,
      controlQuestions,
      observations,
      imageZone
    } = req.body;
    
    console.log('📝 Données extraites:', {
      title,
      subtitle,
      context,
      objectives,
      documents,
      tasks,
      competencies,
      workRequired,
      evaluation,
      equipment,
      images: typeof images,
      duration,
      safety,
      controlQuestions,
      observations,
      imageZone
    });

    const db = getDatabase();
    const result = await new Promise((resolve, reject) => {
      db.run(`
      INSERT INTO tp_sheets (
        title, subtitle, context, objectives, documents, 
        tasks, competencies, work_required, evaluation, 
        equipment, images, duration, safety, control_questions, 
        observations, image_zone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      title, subtitle, context, objectives, documents,
      tasks, competencies, workRequired, evaluation,
      equipment, images, duration, safety, 
      controlQuestions, observations, imageZone
    ], function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

    // Récupérer la fiche créée
    const newSheet = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM tp_sheets WHERE id = ?
      `, [result.lastID], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json(newSheet);
  } catch (error) {
    console.error('❌ Erreur lors de la création de la fiche TP:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Message:', error.message);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

// PUT /api/tp-sheets/:id - Mettre à jour une fiche TP
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 Requête PUT /api/tp-sheets/${id} reçue`);
    console.log('📋 Body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      subtitle,
      context,
      objectives,
      documents,
      tasks,
      competencies,
      workRequired,
      evaluation,
      equipment,
      images,
      duration,
      safety,
      controlQuestions,
      observations,
      imageZone
    } = req.body;

    const db = getDatabase();
    const result = await new Promise((resolve, reject) => {
      db.run(`
      UPDATE tp_sheets SET
        title = ?, subtitle = ?, context = ?, objectives = ?, 
        documents = ?, tasks = ?, competencies = ?, work_required = ?, 
        evaluation = ?, equipment = ?, images = ?, duration = ?,
        safety = ?, control_questions = ?, observations = ?, image_zone = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `, [
      title, subtitle, context, objectives, documents,
      tasks, competencies, workRequired, evaluation,
      equipment, images, duration, safety,
      controlQuestions, observations, imageZone, id
    ], function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Fiche TP non trouvée' });
    }

    // Récupérer la fiche mise à jour
    const updatedSheet = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM tp_sheets WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json(updatedSheet);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la fiche TP:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Message:', error.message);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

// DELETE /api/tp-sheets/:id - Supprimer une fiche TP
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM tp_sheets WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Fiche TP non trouvée' });
    }

    res.json({ message: 'Fiche TP supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la fiche TP:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
