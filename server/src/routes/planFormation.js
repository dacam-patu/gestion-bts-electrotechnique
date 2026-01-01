const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// GET /api/plan-formation - Récupérer tous les plans de formation
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT school_year, updated_at FROM plan_formation ORDER BY updated_at DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('❌ Erreur lors de la récupération des plans de formation:', err);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des plans de formation'
        });
      }
      
      res.json({
        success: true,
        data: rows
      });
    }
  );
});

// GET /api/plan-formation/:schoolYear - Récupérer le plan de formation pour une année scolaire
router.get('/:schoolYear', (req, res) => {
  const { schoolYear } = req.params;
  const db = getDatabase();
  
  db.get(
    'SELECT * FROM plan_formation WHERE school_year = ?',
    [schoolYear],
    (err, row) => {
      if (err) {
        console.error('❌ Erreur lors de la récupération du plan de formation:', err);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du plan de formation'
        });
      }
      
      if (!row) {
        return res.json({
          success: true,
          data: null
        });
      }
      
      try {
        const data = JSON.parse(row.data);
        res.json({
          success: true,
          data: data
        });
      } catch (parseErr) {
        console.error('❌ Erreur lors du parsing des données:', parseErr);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors du parsing des données'
        });
      }
    }
  );
});

// POST /api/plan-formation - Sauvegarder le plan de formation
router.post('/', (req, res) => {
  const { schoolYear, data } = req.body;
  
  if (!schoolYear || !data) {
    return res.status(400).json({
      success: false,
      message: 'schoolYear et data sont requis'
    });
  }
  
  const db = getDatabase();
  const dataJson = JSON.stringify(data);
  
  // Utiliser INSERT OR REPLACE pour mettre à jour si l'année existe déjà
  db.run(
    `INSERT OR REPLACE INTO plan_formation (school_year, data, updated_at)
     VALUES (?, ?, datetime('now'))`,
    [schoolYear, dataJson],
    function(err) {
      if (err) {
        console.error('❌ Erreur lors de la sauvegarde du plan de formation:', err);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la sauvegarde du plan de formation'
        });
      }
      
      console.log('✅ Plan de formation sauvegardé avec succès pour:', schoolYear);
      res.json({
        success: true,
        message: 'Plan de formation sauvegardé avec succès',
        data: { id: this.lastID }
      });
    }
  );
});

module.exports = router;
