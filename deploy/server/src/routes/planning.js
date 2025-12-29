const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Récupérer tous les créneaux de planification
router.get('/', (req, res) => {
  const db = getDatabase();
  
  console.log('📊 Récupération des créneaux de planification...');
  
  db.all(`
    SELECT 
      ps.*,
      s.first_name,
      s.last_name,
      s.group_id as group_id,
      s.class,
      g.name as group_name,
      p.title as project_title
    FROM planning_slots ps
    LEFT JOIN students s ON ps.student_id = s.id
    LEFT JOIN groups g ON s.group_id = g.id
    LEFT JOIN projects p ON ps.project_id = p.id
    ORDER BY ps.start_date, ps.start_time
  `, [], (err, slots) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des créneaux:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des créneaux' 
      });
    }
    
    console.log(`✅ ${slots.length} créneaux trouvés:`, slots);
    
    res.json({
      success: true,
      data: slots
    });
  });
});

// Récupérer les créneaux par phase
router.get('/phase/:phaseNumber', (req, res) => {
  const { phaseNumber } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT 
      ps.*,
      s.first_name,
      s.last_name,
      s.class,
      g.name as group_name,
      p.title as project_title
    FROM planning_slots ps
    LEFT JOIN students s ON ps.student_id = s.id
    LEFT JOIN groups g ON s.group_id = g.id
    LEFT JOIN projects p ON ps.project_id = p.id
    WHERE ps.phase = ?
    ORDER BY ps.start_date, ps.start_time
  `, [phaseNumber], (err, slots) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des créneaux:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des créneaux' 
      });
    }
    
    res.json({
      success: true,
      data: slots
    });
  });
});

// Créer un nouveau créneau de planification
router.post('/', (req, res) => {
  console.log('📥 Requête reçue pour créer un créneau:', req.body);
  
  const { 
    student_id, 
    project_id, 
    phase, 
    phase_name, 
    start_date, 
    end_date, 
    start_time, 
    end_time, 
    location, 
    notes, 
    color 
  } = req.body;
  
  // Validation des données
  if (!student_id || !phase || !phase_name || !start_date || !end_date) {
    console.error('❌ Données manquantes:', { student_id, phase, phase_name, start_date, end_date });
    return res.status(400).json({ 
      success: false, 
      message: 'student_id, phase, phase_name, start_date et end_date sont requis' 
    });
  }
  
  // Validation de la phase
  if (![1, 2, 3].includes(parseInt(phase))) {
    return res.status(400).json({ 
      success: false, 
      message: 'La phase doit être 1, 2 ou 3' 
    });
  }
  
  const db = getDatabase();
  const finalProjectId = project_id || null;
  const finalColor = color || getDefaultColorForPhase(phase);
  
  console.log('💾 Insertion du créneau en base:', {
    student_id,
    project_id: finalProjectId,
    phase,
    phase_name,
    start_date,
    end_date,
    start_time,
    end_time,
    location,
    notes,
    color: finalColor
  });
  
  db.run(`
    INSERT INTO planning_slots 
    (student_id, project_id, phase, phase_name, start_date, end_date, start_time, end_time, location, notes, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    student_id, 
    finalProjectId, 
    phase, 
    phase_name, 
    start_date, 
    end_date, 
    start_time, 
    end_time, 
    location, 
    notes, 
    finalColor
  ], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la création du créneau:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création du créneau' 
      });
    }
    
    console.log('✅ Créneau créé avec succès, ID:', this.lastID);
    
    res.status(201).json({
      success: true,
      message: 'Créneau créé avec succès',
      data: { id: this.lastID }
    });
  });
});

// Mettre à jour un créneau de planification
router.put('/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`📝 Requête PUT reçue pour le créneau ${id}:`, {
    params: req.params,
    body: req.body,
    headers: req.headers
  });
  
  // Validation de l'ID
  if (!id || id === 'undefined' || id === 'null') {
    console.error('❌ ID de créneau invalide:', id);
    return res.status(400).json({
      success: false,
      message: 'ID de créneau invalide pour la mise à jour'
    });
  }
  
  const { 
    student_id, 
    project_id, 
    phase, 
    phase_name, 
    start_date, 
    end_date, 
    start_time, 
    end_time, 
    location, 
    notes, 
    status, 
    color 
  } = req.body;
  
  console.log(`📝 Mise à jour du créneau ${id}:`, req.body);
  
  const db = getDatabase();
  const finalProjectId = project_id || null;
  
  db.run(`
    UPDATE planning_slots 
    SET student_id = ?, project_id = ?, phase = ?, phase_name = ?, 
        start_date = ?, end_date = ?, start_time = ?, end_time = ?, 
        location = ?, notes = ?, status = ?, color = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [
    student_id, 
    finalProjectId, 
    phase, 
    phase_name, 
    start_date, 
    end_date, 
    start_time, 
    end_time, 
    location, 
    notes, 
    status, 
    color, 
    id
  ], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la mise à jour du créneau:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour du créneau' 
      });
    }
    
    if (this.changes === 0) {
      console.log('❌ Aucun créneau mis à jour (ID non trouvé):', id);
      return res.status(404).json({
        success: false,
        message: 'Créneau non trouvé'
      });
    }
    
    console.log('✅ Créneau mis à jour avec succès, lignes modifiées:', this.changes);
    
    res.json({
      success: true,
      message: 'Créneau mis à jour avec succès'
    });
  });
});

// Supprimer un créneau de planification
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  console.log(`🗑️ Suppression du créneau: ${id}`);
  
  db.run('DELETE FROM planning_slots WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la suppression du créneau:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du créneau' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Créneau non trouvé'
      });
    }
    
    console.log('✅ Créneau supprimé avec succès');
    
    res.json({
      success: true,
      message: 'Créneau supprimé avec succès'
    });
  });
});

// Supprimer tous les créneaux de planification
router.delete('/', (req, res) => {
  const db = getDatabase();
  
  console.log('🗑️ Suppression de tous les créneaux de planification...');
  
  db.run('DELETE FROM planning_slots', [], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la suppression de tous les créneaux:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de tous les créneaux' 
      });
    }
    
    console.log(`✅ ${this.changes} créneaux supprimés avec succès`);
    
    res.json({
      success: true,
      message: `Tous les créneaux ont été supprimés (${this.changes} créneaux)`
    });
  });
});

// Obtenir les statistiques de planification
router.get('/stats', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      phase,
      phase_name,
      COUNT(*) as total_slots,
      COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
    FROM planning_slots
    GROUP BY phase, phase_name
    ORDER BY phase
  `, [], (err, stats) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des statistiques:', err);
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

// Fonction utilitaire pour obtenir la couleur par défaut selon la phase
function getDefaultColorForPhase(phase) {
  const colors = {
    1: '#3B82F6', // Bleu pour Planification
    2: '#F59E0B', // Orange pour Pilotage
    3: '#10B981'  // Vert pour Soutenance
  };
  return colors[phase] || '#6B7280';
}

module.exports = router;