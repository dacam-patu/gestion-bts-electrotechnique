const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Récupérer tous les projets
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT p.*, 
           COUNT(DISTINCT s.id) as student_count,
           COUNT(DISTINCT g.id) as group_count
    FROM projects p
    LEFT JOIN students s ON p.id = s.project_id
    LEFT JOIN groups g ON p.id = g.project_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, (err, projects) => {
    if (err) {
      console.error('Erreur lors de la récupération des projets:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des projets' 
      });
    }
    
    res.json({
      success: true,
      data: projects
    });
  });
});

// Récupérer un projet par ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      console.error('Erreur lors de la récupération du projet:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du projet' 
      });
    }
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  });
});

// Créer un nouveau projet
router.post('/', (req, res) => {
  const { title, description, start_date, end_date, executors, type } = req.body;
  
  if (!title) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le titre du projet est requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    INSERT INTO projects (title, description, start_date, end_date, executors, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [title, description, start_date, end_date, executors, type], function(err) {
    if (err) {
      console.error('Erreur lors de la création du projet:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création du projet' 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: {
        id: this.lastID,
        title,
        description,
        start_date,
        end_date,
        executors,
        type
      }
    });
  });
});

// Mettre à jour un projet
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, start_date, end_date, executors, type } = req.body;
  
  if (!title) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le titre du projet est requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    UPDATE projects 
    SET title = ?, description = ?, start_date = ?, end_date = ?, executors = ?, type = ?
    WHERE id = ?
  `, [title, description, start_date, end_date, executors, type, id], function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour du projet:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour du projet' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Projet mis à jour avec succès'
    });
  });
});

// Supprimer un projet
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du projet:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du projet' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  });
});

// Récupérer les statistiques des projets
router.get('/stats/overview', (req, res) => {
  const db = getDatabase();
  
  db.get(`
    SELECT 
      COUNT(*) as total_projects,
      COUNT(CASE WHEN start_date <= date('now') AND end_date >= date('now') THEN 1 END) as active_projects,
      COUNT(CASE WHEN end_date < date('now') THEN 1 END) as completed_projects
    FROM projects
  `, (err, stats) => {
    if (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des statistiques' 
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  });
});

module.exports = router; 