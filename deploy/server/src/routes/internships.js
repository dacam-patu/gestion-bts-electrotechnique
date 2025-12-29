const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Récupérer tous les stages
router.get('/', (req, res) => {
  const db = getDatabase();
  
  console.log('📊 Récupération des stages...');
  
  db.all(`
    SELECT 
      i.*,
      s.first_name,
      s.last_name,
      s.class,
      g.name as group_name
    FROM internships i
    LEFT JOIN students s ON i.student_id = s.id
    LEFT JOIN groups g ON s.group_id = g.id
    ORDER BY i.created_at DESC
  `, [], (err, internships) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des stages:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des stages' 
      });
    }
    
    console.log(`✅ ${internships.length} stages trouvés`);
    
    res.json({
      success: true,
      data: internships
    });
  });
});

// Récupérer les stages d'un étudiant
router.get('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDatabase();
  
  console.log(`📊 Récupération des stages pour l'étudiant ${studentId}...`);
  
  db.all(`
    SELECT 
      i.*,
      s.first_name,
      s.last_name,
      s.class,
      g.name as group_name
    FROM internships i
    LEFT JOIN students s ON i.student_id = s.id
    LEFT JOIN groups g ON s.group_id = g.id
    WHERE i.student_id = ?
    ORDER BY i.created_at DESC
  `, [studentId], (err, internships) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des stages:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des stages' 
      });
    }
    
    console.log(`✅ ${internships.length} stages trouvés pour l'étudiant ${studentId}`);
    
    res.json({
      success: true,
      data: internships
    });
  });
});

// Créer un nouveau stage
router.post('/', (req, res) => {
  console.log('📥 Requête reçue pour créer un stage:', req.body);
  
  const { 
    student_id, 
    company_id, 
    company_name, 
    company_address, 
    company_phone, 
    company_email, 
    supervisor_name, 
    supervisor_phone, 
    start_date, 
    end_date, 
    status 
  } = req.body;
  
  // Validation des données
  if (!student_id || !company_name || !start_date || !end_date) {
    console.error('❌ Données manquantes:', { student_id, company_name, start_date, end_date });
    return res.status(400).json({ 
      success: false, 
      message: 'student_id, company_name, start_date et end_date sont requis' 
    });
  }
  
  const db = getDatabase();
  
  console.log('💾 Insertion du stage en base:', {
    student_id,
    company_id,
    company_name,
    company_address,
    company_phone,
    company_email,
    supervisor_name,
    supervisor_phone,
    start_date,
    end_date,
    status
  });
  
  db.run(`
    INSERT INTO internships 
    (student_id, company_id, company_name, company_address, company_phone, company_email, supervisor_name, supervisor_phone, start_date, end_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `, [
    student_id,
    company_id || null,
    company_name,
    company_address || '',
    company_phone || '',
    company_email || '',
    supervisor_name || '',
    supervisor_phone || '',
    start_date,
    end_date,
    status || 'active'
  ], function(err) {
    if (err) {
      console.error('❌ Erreur lors de l\'insertion du stage:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création du stage' 
      });
    }
    
    console.log(`✅ Stage créé avec l'ID: ${this.lastID}`);
    
    res.json({
      success: true,
      data: {
        id: this.lastID,
        student_id,
        company_id,
        company_name,
        company_address,
        company_phone,
        company_email,
        supervisor_name,
        supervisor_phone,
        start_date,
        end_date,
        status
      }
    });
  });
});

// Mettre à jour un stage
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    company_id, 
    company_name, 
    company_address, 
    company_phone, 
    company_email, 
    supervisor_name, 
    supervisor_phone, 
    start_date, 
    end_date, 
    status 
  } = req.body;
  
  console.log(`📥 Mise à jour du stage ${id}:`, req.body);
  
  const db = getDatabase();
  
  db.run(`
    UPDATE internships 
    SET company_id = ?, company_name = ?, company_address = ?, company_phone = ?, 
        company_email = ?, supervisor_name = ?, supervisor_phone = ?, 
        start_date = ?, end_date = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [
    company_id || null,
    company_name,
    company_address || '',
    company_phone || '',
    company_email || '',
    supervisor_name || '',
    supervisor_phone || '',
    start_date,
    end_date,
    status || 'active',
    id
  ], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la mise à jour du stage:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour du stage' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stage non trouvé' 
      });
    }
    
    console.log(`✅ Stage ${id} mis à jour`);
    
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        company_id,
        company_name,
        company_address,
        company_phone,
        company_email,
        supervisor_name,
        supervisor_phone,
        start_date,
        end_date,
        status
      }
    });
  });
});

// Supprimer un stage
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  console.log(`🗑️ Suppression du stage ${id}...`);
  
  db.run('DELETE FROM internships WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la suppression du stage:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du stage' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stage non trouvé' 
      });
    }
    
    console.log(`✅ Stage ${id} supprimé`);
    
    res.json({
      success: true,
      message: 'Stage supprimé avec succès'
    });
  });
});

module.exports = router;
