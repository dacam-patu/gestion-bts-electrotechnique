const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Récupérer toutes les évaluations
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT e.*, s.first_name, s.last_name, s.class
    FROM evaluations e
    JOIN students s ON e.student_id = s.id
    ORDER BY s.last_name, s.first_name
  `, (err, evaluations) => {
    if (err) {
      console.error('Erreur lors de la récupération des évaluations:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des évaluations' 
      });
    }
    
    res.json({
      success: true,
      data: evaluations
    });
  });
});

// Récupérer toutes les évaluations U51
router.get('/u51', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT e.*, s.first_name, s.last_name, s.class
    FROM evaluations e
    JOIN students s ON e.student_id = s.id
    WHERE e.type = 'U51'
    ORDER BY s.last_name, s.first_name, e.evaluated_at DESC
  `, (err, evaluations) => {
    if (err) {
      console.error('Erreur lors de la récupération des évaluations U51:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des évaluations U51' 
      });
    }
    
    console.log(`📊 ${evaluations.length} évaluations U51 récupérées`);
    res.json({
      success: true,
      data: evaluations
    });
  });
});

// Récupérer les évaluations d'un étudiant
router.get('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT e.*, s.first_name, s.last_name, s.class
    FROM evaluations e
    JOIN students s ON e.student_id = s.id
    WHERE e.student_id = ?
    ORDER BY e.competence
  `, [studentId], (err, evaluations) => {
    if (err) {
      console.error('Erreur lors de la récupération des évaluations:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des évaluations' 
      });
    }
    
    res.json({
      success: true,
      data: evaluations
    });
  });
});

// Récupérer toutes les phases d'un étudiant
router.get('/phases/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT p.*, s.first_name, s.last_name, pr.title as project_title
    FROM phases p
    JOIN students s ON p.student_id = s.id
    JOIN projects pr ON p.project_id = pr.id
    WHERE p.student_id = ?
    ORDER BY p.phase_number
  `, [studentId], (err, phases) => {
    if (err) {
      console.error('Erreur lors de la récupération des phases:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des phases' 
      });
    }
    
    res.json({
      success: true,
      data: phases
    });
  });
});

// Créer ou mettre à jour une phase
router.post('/phases', (req, res) => {
  const { student_id, project_id, phase_number, status, start_date, end_date, notes } = req.body;
  
  if (!student_id || !project_id || !phase_number) {
    return res.status(400).json({ 
      success: false, 
      message: 'student_id, project_id et phase_number sont requis' 
    });
  }
  
  const db = getDatabase();
  
  // Vérifier si la phase existe déjà
  db.get('SELECT * FROM phases WHERE student_id = ? AND project_id = ? AND phase_number = ?', 
    [student_id, project_id, phase_number], (err, existingPhase) => {
    if (err) {
      console.error('Erreur lors de la vérification de la phase:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création de la phase' 
      });
    }
    
    if (existingPhase) {
      // Mettre à jour la phase existante
      db.run(`
        UPDATE phases 
        SET status = ?, start_date = ?, end_date = ?, notes = ?
        WHERE student_id = ? AND project_id = ? AND phase_number = ?
      `, [status, start_date, end_date, notes, student_id, project_id, phase_number], function(err) {
        if (err) {
          console.error('Erreur lors de la mise à jour de la phase:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour de la phase' 
          });
        }
        
        res.json({
          success: true,
          message: 'Phase mise à jour avec succès'
        });
      });
    } else {
      // Créer une nouvelle phase
      db.run(`
        INSERT INTO phases (student_id, project_id, phase_number, status, start_date, end_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [student_id, project_id, phase_number, status, start_date, end_date, notes], function(err) {
        if (err) {
          console.error('Erreur lors de la création de la phase:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création de la phase' 
          });
        }
        
        res.status(201).json({
          success: true,
          message: 'Phase créée avec succès',
          data: {
            id: this.lastID,
            student_id,
            project_id,
            phase_number,
            status,
            start_date,
            end_date,
            notes
          }
        });
      });
    }
  });
});



// Récupérer les évaluations d'un étudiant
router.get('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT e.*, s.first_name, s.last_name, p.title as project_title
    FROM evaluations e
    JOIN students s ON e.student_id = s.id
    LEFT JOIN projects p ON e.project_id = p.id
    WHERE e.student_id = ?
    ORDER BY e.evaluated_at DESC
  `, [studentId], (err, evaluations) => {
    if (err) {
      console.error('Erreur lors de la récupération des évaluations:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des évaluations' 
      });
    }
    
    res.json({
      success: true,
      data: evaluations
    });
  });
});

// Mettre à jour une évaluation
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { competence, indicator, score, comments, criteria } = req.body;
  
  if (!competence || !score) {
    return res.status(400).json({ 
      success: false, 
      message: 'competence et score sont requis' 
    });
  }
  
  const db = getDatabase();
  
  // Préparer les critères si fournis
  const criteriaJson = criteria ? JSON.stringify(criteria) : null;
  
  db.run(`
    UPDATE evaluations 
    SET competence = ?, indicator = ?, score = ?, comments = ?, criteria = ?
    WHERE id = ?
  `, [competence, indicator, score, comments, criteriaJson, id], function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour de l\'évaluation' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Évaluation non trouvée' 
      });
    }
    
    res.json({
      success: true,
      message: 'Évaluation mise à jour avec succès'
    });
  });
});

// Supprimer une évaluation
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  console.log(`🗑️ Demande de suppression de l'évaluation ID: ${id}`);
  
  db.run('DELETE FROM evaluations WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'évaluation:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de l\'évaluation' 
      });
    }
    
    if (this.changes === 0) {
      console.log(`❌ Évaluation ID ${id} non trouvée`);
      return res.status(404).json({ 
        success: false, 
        message: 'Évaluation non trouvée' 
      });
    }
    
    console.log(`✅ Évaluation ID ${id} supprimée avec succès`);
    res.json({
      success: true,
      message: 'Évaluation supprimée avec succès'
    });
  });
});

// Récupérer les statistiques d'évaluation par projet
router.get('/stats/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT 
      s.first_name,
      s.last_name,
      e.competence,
      AVG(e.score) as average_score,
      COUNT(e.id) as evaluation_count
    FROM evaluations e
    JOIN students s ON e.student_id = s.id
    WHERE e.project_id = ?
    GROUP BY s.id, e.competence
    ORDER BY s.last_name, s.first_name, e.competence
  `, [projectId], (err, stats) => {
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

// Récupérer les indicateurs d'évaluation par compétence
router.get('/indicators/:competence', (req, res) => {
  const { competence } = req.params;
  
  // Définir les indicateurs par compétence avec les nouvelles spécifications
  const indicators = {
    'C1': [
      'Les contraintes et ressources normatives et règlementaires dont celles liées à la qualité, la sécurité, la santé et l\'environnement sont prises en compte tout au long du projet/chantier',
      'Les tâches sont réparties en fonction des habilitations, des certifications des équipiers en tenant compte du planning des autres intervenants (monteur-câbleurs, autres corps d\'état, sous-traitants)',
      'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement applicable dans le cadre du projet/chantier',
      'La bonne utilisation des dispositifs de protection des personnes et des biens est contrôlée'
    ],
    'C3': [
      'Les différentes étapes de l\'activité sont adaptées pour tenir compte des nouvelles solutions retenues et des circonstances',
      'Des solutions pour pallier les aléas sont proposées à la hiérarchie',
      'La mise en œuvre des mesures de prévention est prévue',
      'La présence des dispositifs de protection des personnes et des biens est contrôlée',
      'Les dispositifs de protection des personnes et des biens sont utilisés',
      'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement, applicables dans le cadre du projet/chantier',
      'Toutes les règles de santé, de sécurité et d\'environnement sont respectées tout au long du projet/chantier',
      'Les risques liés à l\'activité sont identifiés et recensés',
      'Des solutions pour prévenir les risques sont proposées et validées',
      'Les aléas sont gérés'
    ],
    'C12': [
      'Les informations écrites et orales relatives au projet/chantier sont collectées',
      'La liste et la disponibilité des matériels, équipements, outillages et outils numériques nécessaires sont vérifiées',
      'L\'intervention est planifiée',
      'La durée du projet/chantier est évaluée',
      'Les approvisionnements sont planifiés',
      'Le projet/chantier est organisé pour qu\'il soit mené de manière éco-responsable',
      'Les tâches sont réparties en fonction des habilitations, des certifications des équipiers en tenant compte du planning des autres intervenants',
      'Les revues de projet sont effectuées',
      'Les situations imprévues, délicates, conflictuelles sont gérées en lien avec la hiérarchie',
      'Les arbitrages nécessaires en fonction des contraintes rencontrées sont pris',
      'Les différentes étapes du planning sont respectées ou adaptées',
      'La qualité et la conformité des travaux réalisés, y compris par la sous-traitance, sont contrôlées',
      'Les indicateurs (coûts, délais, qualité) de suivi du projet/chantier sont renseignés',
      'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement, applicables dans le cadre du projet/chantier',
      'Les dispositifs de protection des personnes et des biens sont présents et bien utilisés',
      'Les règles de santé, de sécurité et environnementales sont respectées tout au long du projet/chantier',
      'L\'équipe est animée pour mener à bien le projet/chantier'
    ]
  };
  
  res.json({
    success: true,
    data: indicators[competence] || []
  });
});

// Sauvegarder une grille d'évaluation complète
router.post('/grid', (req, res) => {
  console.log('📥 Requête reçue pour sauvegarder une grille d\'évaluation:');
  console.log('📋 Body complet:', JSON.stringify(req.body, null, 2));
  console.log('🔍 Headers:', req.headers['content-type']);
  
  const { student_id, project_id, grid_data, global_score, global_comments, status = 'draft' } = req.body;
  
  // Validation détaillée
  if (!student_id) {
    console.error('❌ student_id manquant:', student_id);
    return res.status(400).json({ 
      success: false, 
      message: 'student_id est requis' 
    });
  }
  
  if (!grid_data) {
    console.error('❌ grid_data manquant:', grid_data);
    return res.status(400).json({ 
      success: false, 
      message: 'grid_data est requis' 
    });
  }
  
  if (typeof grid_data !== 'object') {
    console.error('❌ grid_data n\'est pas un objet:', typeof grid_data, grid_data);
    return res.status(400).json({ 
      success: false, 
      message: 'grid_data doit être un objet' 
    });
  }

  // Validation du student_id (doit être un nombre)
  const studentIdNum = parseInt(student_id);
  if (isNaN(studentIdNum)) {
    console.error('❌ student_id invalide:', student_id);
    return res.status(400).json({ 
      success: false, 
      message: 'student_id doit être un nombre valide' 
    });
  }

  // project_id peut être null pour les étudiants sans projet assigné
  const finalProjectId = project_id ? parseInt(project_id) : null;
  
  console.log('✅ Validation passée:');
  console.log('- student_id:', studentIdNum);
  console.log('- project_id:', finalProjectId);
  console.log('- grid_data type:', typeof grid_data);
  console.log('- global_score:', global_score);
  console.log('- status:', status);
  
  const db = getDatabase();
  
  // Vérifier si une grille existe déjà pour cet étudiant
  const queryCondition = finalProjectId 
    ? 'SELECT id FROM evaluation_grids WHERE student_id = ? AND project_id = ?'
    : 'SELECT id FROM evaluation_grids WHERE student_id = ? AND project_id IS NULL';
  
  const queryParams = finalProjectId ? [studentIdNum, finalProjectId] : [studentIdNum];
  
  db.get(queryCondition, queryParams, (err, existingGrid) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification de la grille existante:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la sauvegarde de la grille' 
      });
    }
    
    const gridDataJSON = JSON.stringify(grid_data);
    
    if (existingGrid) {
      // Mettre à jour la grille existante
      const updateCondition = finalProjectId
        ? 'UPDATE evaluation_grids SET grid_data = ?, global_score = ?, global_comments = ?, status = ?, updated_at = datetime(\'now\') WHERE student_id = ? AND project_id = ?'
        : 'UPDATE evaluation_grids SET grid_data = ?, global_score = ?, global_comments = ?, status = ?, updated_at = datetime(\'now\') WHERE student_id = ? AND project_id IS NULL';
      
      const updateParams = finalProjectId 
        ? [gridDataJSON, global_score, global_comments, status, studentIdNum, finalProjectId]
        : [gridDataJSON, global_score, global_comments, status, studentIdNum];
      
      db.run(updateCondition, updateParams, function(err) {
        if (err) {
          console.error('❌ Erreur lors de la mise à jour de la grille:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour de la grille' 
          });
        }
        
        console.log('✅ Grille d\'évaluation mise à jour avec succès');
        
        res.json({
          success: true,
          message: 'Grille d\'évaluation mise à jour avec succès',
          data: {
            id: existingGrid.id,
            student_id,
            project_id,
            status
          }
        });
      });
    } else {
      // Créer une nouvelle grille
      db.run(`
        INSERT INTO evaluation_grids (student_id, project_id, grid_data, global_score, global_comments, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [studentIdNum, finalProjectId, gridDataJSON, global_score, global_comments, status], function(err) {
        if (err) {
          console.error('❌ Erreur lors de la création de la grille:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création de la grille' 
          });
        }
        
        console.log('✅ Grille d\'évaluation créée avec succès, ID:', this.lastID);
        
        res.status(201).json({
          success: true,
          message: 'Grille d\'évaluation créée avec succès',
          data: {
            id: this.lastID,
            student_id,
            project_id,
            status
          }
        });
      });
    }
  });
});

// Récupérer une grille d'évaluation pour un étudiant
router.get('/grid/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDatabase();
  
  // D'abord, récupérer la grille d'évaluation complète
  db.get(`
    SELECT * FROM evaluation_grids 
    WHERE student_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `, [studentId], (err, grid) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération de la grille:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération de la grille' 
      });
    }
    
    // Récupérer toutes les évaluations U52 de l'étudiant
    db.all(`
      SELECT e.*, s.first_name, s.last_name, p.title as project_title
      FROM evaluations e
      JOIN students s ON e.student_id = s.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.student_id = ? 
      AND e.type = 'U52'
      ORDER BY e.evaluated_at DESC
    `, [studentId], (err, evaluations) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des évaluations:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des évaluations' 
      });
    }
    
    if (!evaluations || evaluations.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Aucune évaluation trouvée'
      });
    }
    
         try {
       // Utiliser les données de la grille sauvegardée si disponible
       let gridData = {};
       let globalScore = 0;
       let globalComments = '';
       
       if (grid && grid.grid_data) {
         try {
           const parsedGridData = JSON.parse(grid.grid_data);
           gridData = parsedGridData;
           globalScore = grid.global_score || 0;
           globalComments = grid.global_comments || '';
           console.log('📋 Grille récupérée depuis la base de données:', { gridData, globalScore, globalComments });
         } catch (parseError) {
           console.log('⚠️ Impossible de parser les données de la grille:', parseError);
         }
       }
       
       // Si pas de grille ou grille vide, utiliser les évaluations individuelles
       if (!grid || Object.keys(gridData).length === 0) {
         console.log('🔍 Aucune grille trouvée, utilisation des évaluations individuelles');
         console.log('🔍 Évaluations trouvées:', evaluations.length);
         
         evaluations.forEach(evaluation => {
           console.log(`📊 Évaluation: ${evaluation.competence} - ${evaluation.score} - ${evaluation.indicator}`);
           
           if (evaluation.competence === 'GLOBAL') {
             globalScore = evaluation.score;
             globalComments = evaluation.comments || '';
           } else {
             // Pour les compétences individuelles, on récupère les vraies données des critères
             let criteria = {};
             
             // Essayer de parser les critères sauvegardés
             try {
               if (evaluation.criteria && typeof evaluation.criteria === 'string') {
                 criteria = JSON.parse(evaluation.criteria);
               } else if (evaluation.criteria && typeof evaluation.criteria === 'object') {
                 criteria = evaluation.criteria;
               }
             } catch (parseError) {
               console.log(`⚠️ Impossible de parser les critères pour ${evaluation.competence}:`, parseError);
               // Si on ne peut pas parser, on crée une structure vide
               criteria = {};
             }
             
             gridData[evaluation.competence] = {
               score: evaluation.score,
               comments: evaluation.comments || '',
               criteria: criteria
             };
           }
         });
         
         console.log('📋 Grille reconstituée depuis les évaluations:', { gridData, globalScore, globalComments });
       }
       
       const firstEvaluation = evaluations[0];
       res.json({
         success: true,
         data: {
           id: firstEvaluation.id,
           student_id: firstEvaluation.student_id,
           project_id: firstEvaluation.project_id,
           first_name: firstEvaluation.first_name,
           last_name: firstEvaluation.last_name,
           project_title: firstEvaluation.project_title,
           grid_data: gridData,
           global_score: globalScore,
           global_comments: globalComments,
           activity_name: firstEvaluation.activity_name || '',
           activity_type: firstEvaluation.activity_type || '',
           status: 'completed',
           created_at: firstEvaluation.evaluated_at,
           updated_at: firstEvaluation.evaluated_at
         }
       });
    } catch (parseError) {
      console.error('❌ Erreur lors de la reconstruction de la grille:', parseError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la reconstruction de la grille' 
      });
    }
  });
  });
});

// Récupérer toutes les grilles d'évaluation avec résumé
router.get('/grids/all', async (req, res) => {
  const db = getDatabase();
  
  // Récupérer tous les étudiants avec leurs évaluations (U51 et U52)
  db.all(`
    SELECT DISTINCT
      s.id as student_id,
      s.first_name,
      s.last_name,
      s.class,
      g.name as group_name,
      p.title as project_title,
      p.id as project_id
    FROM students s
    LEFT JOIN groups g ON s.group_id = g.id
    LEFT JOIN projects p ON s.project_id = p.id
    WHERE EXISTS (
      SELECT 1 FROM evaluations e 
      WHERE e.student_id = s.id 
      AND (e.type = 'U51' OR e.type = 'U52')
    )
    ORDER BY s.last_name, s.first_name
  `, [], async (err, students) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des grilles:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des grilles' 
      });
    }
    
    try {
      // Pour chaque étudiant, récupérer ses évaluations et reconstituer la grille
      const processedGrids = await Promise.all(students.map(async (student) => {
        return new Promise((resolve) => {
          db.all(`
            SELECT competence, score, comments, global_comments, evaluated_at, activity_name, activity_type, type
            FROM evaluations 
            WHERE student_id = ? 
            AND (type = 'U51' OR type = 'U52')
            ORDER BY evaluated_at DESC
          `, [student.student_id], (evalErr, evaluations) => {
            if (evalErr) {
              console.error('Erreur lors de la récupération des évaluations pour étudiant:', student.student_id, evalErr);
              resolve(null);
              return;
            }
            
            if (!evaluations || evaluations.length === 0) {
              resolve(null);
              return;
            }
            
            let competenceScores = {};
            let globalScore = 0;
            let globalComments = '';
            let latestDate = null;
            let activityName = '';
            let activityType = '';
            let evaluationType = '';
            
            evaluations.forEach(evaluation => {
              console.log(`🔍 Évaluation trouvée: ${evaluation.competence} = ${evaluation.score} (type: ${evaluation.type})`);
              evaluationType = evaluation.type; // Stocker le type d'évaluation
              
              if (evaluation.competence === 'GLOBAL') {
                globalScore = evaluation.score;
                globalComments = evaluation.global_comments || '';
              } else {
                competenceScores[evaluation.competence] = evaluation.score;
                // Récupérer les commentaires globaux depuis n'importe quelle évaluation
                if (evaluation.global_comments && !globalComments) {
                  globalComments = evaluation.global_comments;
                }
              }
              
              if (!latestDate || evaluation.evaluated_at > latestDate) {
                latestDate = evaluation.evaluated_at;
              }
              
              if (evaluation.activity_name) {
                activityName = evaluation.activity_name;
              }
              if (evaluation.activity_type) {
                activityType = evaluation.activity_type;
              }
            });
            
            // TOUJOURS recalculer la note globale à partir des compétences individuelles
            const validScores = [];
            
            if (evaluationType === 'U52') {
              // U52: C1: sur 5, C3: sur 5, C12: sur 10
              // On les normalise tous sur 20 pour la note globale
              if (competenceScores.C1 > 0) {
                validScores.push((competenceScores.C1 / 5) * 20); // C1 sur 5 → normaliser sur 20
                console.log(`📊 C1: ${competenceScores.C1}/5 → ${(competenceScores.C1 / 5) * 20}/20`);
              }
              if (competenceScores.C3 > 0) {
                validScores.push((competenceScores.C3 / 5) * 20); // C3 sur 5 → normaliser sur 20
                console.log(`📊 C3: ${competenceScores.C3}/5 → ${(competenceScores.C3 / 5) * 20}/20`);
              }
              if (competenceScores.C12 > 0) {
                validScores.push((competenceScores.C12 / 10) * 20); // C12 sur 10 → normaliser sur 20
                console.log(`📊 C12: ${competenceScores.C12}/10 → ${(competenceScores.C12 / 10) * 20}/20`);
              }
            } else if (evaluationType === 'U51') {
              // U51: Toutes les compétences sont sur 5
              // On les normalise tous sur 20 pour la note globale
              Object.keys(competenceScores).forEach(competence => {
                if (competenceScores[competence] > 0) {
                  validScores.push((competenceScores[competence] / 5) * 20); // Toutes sur 5 → normaliser sur 20
                  console.log(`📊 ${competence}: ${competenceScores[competence]}/5 → ${(competenceScores[competence] / 5) * 20}/20`);
                }
              });
            }
            
            if (validScores.length > 0) {
              // TOUJOURS utiliser la note calculée à partir des compétences individuelles
              const calculatedGlobalScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
              globalScore = Math.round(calculatedGlobalScore * 100) / 100; // Arrondir à 2 décimales
              globalComments = 'Note globale calculée automatiquement';
              
              console.log(`📊 Note globale recalculée pour étudiant ${student.student_id}: ${globalScore}/20 (moyenne de ${validScores.length} compétences)`);
              
              // Mettre à jour la note globale dans la base de données pour synchronisation
              db.run(`
                UPDATE evaluations 
                SET score = ?, comments = ?
                WHERE student_id = ? AND competence = 'GLOBAL' AND type = ?
              `, [globalScore, globalComments, student.student_id, evaluationType], (updateErr) => {
                if (updateErr) {
                  console.error('❌ Erreur lors de la mise à jour de la note globale:', updateErr);
                } else {
                  console.log(`✅ Note globale mise à jour dans la base de données pour étudiant ${student.student_id} (type: ${evaluationType})`);
                }
              });
            }
            
            resolve({
              id: student.student_id, // Utiliser l'ID étudiant comme ID de grille
              student_id: student.student_id,
              project_id: student.project_id,
              student_name: `${student.first_name} ${student.last_name}`,
              first_name: student.first_name,
              last_name: student.last_name,
              class: student.class,
              group_name: student.group_name,
              project_title: student.project_title,
              global_score: globalScore,
              global_comments: globalComments,
              activity_name: activityName,
              activity_type: activityType,
              type: evaluationType,
              status: 'completed',
              created_at: latestDate,
              updated_at: latestDate,
              competence_scores: competenceScores
            });
          });
        });
      }));
      
      // Filtrer les grilles null et trier par nom d'étudiant
      const validGrids = processedGrids.filter(grid => grid !== null);
      const sortedGrids = validGrids.sort((a, b) => {
        const nameA = a.student_name.toLowerCase();
        const nameB = b.student_name.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      console.log(`✅ ${sortedGrids.length} grilles d'évaluation récupérées`);
      res.json({
        success: true,
        data: sortedGrids
      });
    } catch (error) {
      console.error('❌ Erreur lors du traitement des grilles:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors du traitement des données' 
      });
    }
  });
});

// Mettre à jour le statut d'une grille d'évaluation
router.put('/grid/:gridId/status', (req, res) => {
  const { gridId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le statut est requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    UPDATE evaluation_grids 
    SET status = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [status, gridId], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la mise à jour du statut:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour du statut' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grille d\'évaluation non trouvée' 
      });
    }
    
    res.json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  });
});

// Créer une nouvelle évaluation
router.post('/', (req, res) => {
  const { student_id, project_id, competence, score, comments, global_comments, criteria, type, evaluated_at, activity_name, activity_type } = req.body;
  const db = getDatabase();
  
  console.log('📥 Requête reçue pour créer une évaluation:', req.body);
  console.log('🔍 Global comments reçus:', global_comments);
  console.log('🔍 Type de global_comments:', typeof global_comments);
  
  if (!student_id || !competence) {
    return res.status(400).json({ 
      success: false, 
      message: 'student_id et competence sont requis' 
    });
  }
  
  // Convertir score null en 0
  const finalScore = score === null || score === undefined ? 0 : score;
  
  console.log('💾 Insertion en base de données:', {
    student_id,
    project_id,
    competence,
    score: finalScore,
    comments,
    criteria: criteria ? `"${JSON.stringify(criteria)}"` : null,
    type,
    evaluated_at: evaluated_at || 'maintenant'
  });
  
  // Utiliser la date fournie ou la date actuelle
  const evaluationDateTime = evaluated_at || new Date().toISOString();
  
  db.run(`
    INSERT INTO evaluations (student_id, project_id, competence, score, comments, global_comments, criteria, type, evaluated_at, activity_name, activity_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [student_id, project_id, competence, finalScore, comments, global_comments, criteria, type, evaluationDateTime, activity_name, activity_type], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la création de l\'évaluation:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création de l\'évaluation' 
      });
    }
    
    console.log(`✅ Évaluation créée avec l'ID: ${this.lastID}`);
    
    res.status(201).json({
      success: true,
      message: 'Évaluation créée avec succès',
      data: {
        id: this.lastID,
        student_id,
        competence,
        score,
        type
      }
    });
  });
});

// Supprimer les évaluations individuelles d'un étudiant (pour modification)
router.delete('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { type, evaluated_at } = req.query; // Paramètres optionnels pour le type et la date d'évaluation
  const db = getDatabase();
  
  console.log(`🗑️ Demande de suppression des évaluations pour l'étudiant: ${studentId}, type: ${type}, evaluated_at: ${evaluated_at}`);
  
  let deleteQuery;
  let params;
  
  if (type && evaluated_at) {
    // Supprimer seulement les évaluations de la session spécifique (type + date)
    console.log(`🎯 Suppression ciblée: session ${evaluated_at} de type ${type}`);
    deleteQuery = `DELETE FROM evaluations WHERE student_id = ? AND type = ? AND evaluated_at = ?`;
    params = [studentId, type, evaluated_at];
  } else if (type) {
    // ATTENTION: Supprimer toutes les évaluations du type spécifié - UTILISER AVEC PRÉCAUTION
    console.log(`⚠️ ATTENTION: Suppression de TOUTES les évaluations de type ${type} pour l'étudiant ${studentId}`);
    console.log(`⚠️ Cette action supprime toutes les sessions d'évaluation de ce type !`);
    deleteQuery = `DELETE FROM evaluations WHERE student_id = ? AND type = ?`;
    params = [studentId, type];
  } else {
    // Ancienne logique pour U52 (rétrocompatibilité)
    console.log(`🗑️ Suppression des évaluations par grille (rétrocompatibilité)`);
    deleteQuery = `DELETE FROM evaluations WHERE student_id = ? AND indicator IN ('Évaluation par grille', 'Note globale')`;
    params = [studentId];
  }
  
  db.run(deleteQuery, params, function(err) {
    if (err) {
      console.error('❌ Erreur lors de la suppression des évaluations:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression des évaluations' 
      });
    }
    
    console.log(`✅ ${this.changes} évaluations supprimées pour l'étudiant ${studentId}`);
    
    res.json({
      success: true,
      message: `${this.changes} évaluations supprimées avec succès`
    });
  });
});

// Supprimer une grille d'évaluation spécifique par son ID
router.delete('/grid/:gridId', (req, res) => {
  const { gridId } = req.params;
  const db = getDatabase();
  
  console.log(`🗑️ Demande de suppression de la grille d'évaluation ID: ${gridId}`);
  
  // D'abord récupérer les informations de la grille pour obtenir student_id et type
  db.get('SELECT student_id, type, evaluated_at FROM evaluation_grids WHERE id = ?', [gridId], (err, grid) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération de la grille:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération de la grille' 
      });
    }
    
    if (!grid) {
      return res.status(404).json({ 
        success: false, 
        message: 'Grille d\'évaluation non trouvée' 
      });
    }
    
    // Supprimer les évaluations associées à cette grille spécifique
    const deleteEvaluationsQuery = `
      DELETE FROM evaluations 
      WHERE student_id = ? AND type = ? AND evaluated_at = ?
    `;
    
    db.run(deleteEvaluationsQuery, [grid.student_id, grid.type, grid.evaluated_at], function(err) {
      if (err) {
        console.error('❌ Erreur lors de la suppression des évaluations:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la suppression des évaluations' 
        });
      }
      
      console.log(`✅ ${this.changes} évaluations supprimées pour la grille ${gridId}`);
      
      // Supprimer la grille elle-même
      db.run('DELETE FROM evaluation_grids WHERE id = ?', [gridId], function(err) {
        if (err) {
          console.error('❌ Erreur lors de la suppression de la grille:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la suppression de la grille' 
          });
        }
        
        console.log(`✅ Grille d'évaluation ${gridId} supprimée avec succès`);
        res.json({
          success: true,
          message: `Grille d'évaluation supprimée avec succès (${this.changes} évaluations supprimées)`
        });
      });
    });
  });
});

// Supprimer une grille d'évaluation et ses évaluations associées (ancienne route pour compatibilité)
// Route pour supprimer une session d'évaluations U51 spécifique
router.delete('/session/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { type, evaluated_at } = req.body;
  const db = getDatabase();
  
  console.log(`🗑️ Demande de suppression de session pour l'étudiant: ${studentId}, type: ${type}, date: ${evaluated_at}`);
  
  if (!type || !evaluated_at) {
    return res.status(400).json({ 
      success: false, 
      message: 'Type et evaluated_at sont requis' 
    });
  }
  
  // Supprimer toutes les évaluations de cette session spécifique
  db.run(`
    DELETE FROM evaluations 
    WHERE student_id = ? AND type = ? AND evaluated_at = ?
  `, [studentId, type, evaluated_at], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la suppression des évaluations:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression des évaluations' 
      });
    }
    
    console.log(`✅ ${this.changes} évaluations ${type} supprimées pour la session ${evaluated_at}`);
    
    res.json({
      success: true,
      message: `Session d'évaluation supprimée avec succès (${this.changes} évaluations supprimées)`
    });
  });
});

router.delete('/grid/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDatabase();
  
  console.log(`🗑️ Demande de suppression de la grille pour l'étudiant: ${studentId}`);
  
  // Démarrer une transaction pour supprimer la grille et les évaluations associées
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Supprimer toutes les évaluations U52 de l'étudiant
    db.run(`
      DELETE FROM evaluations 
      WHERE student_id = ? AND type = 'U52'
    `, [studentId], function(evalErr) {
      if (evalErr) {
        console.error('❌ Erreur lors de la suppression des évaluations:', evalErr);
        db.run('ROLLBACK');
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la suppression des évaluations' 
        });
      }
      
      console.log(`✅ ${this.changes} évaluations U52 supprimées`);
      
      // Confirmer la transaction directement (pas de table evaluation_grids)
      db.run('COMMIT', (commitErr) => {
        if (commitErr) {
          console.error('❌ Erreur lors du commit:', commitErr);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la finalisation de la suppression' 
          });
        }
        
        res.json({
          success: true,
          message: 'Grille d\'évaluation et évaluations associées supprimées avec succès'
        });
      });
    });
  });
});

module.exports = router; 