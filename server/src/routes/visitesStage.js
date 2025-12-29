const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connexion à la base de données
const dbPath = path.join(__dirname, '../../database/u52.db');
const db = new sqlite3.Database(dbPath);

// Créer la table des visites si elle n'existe pas
db.run(`
  CREATE TABLE IF NOT EXISTS visites_stage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    heure TEXT,
    type TEXT NOT NULL CHECK(type IN ('premiere', 'suivi', 'finale')),
    professeur TEXT NOT NULL,
    tuteur TEXT NOT NULL,
    lieu TEXT,
    observations TEXT,
    statut TEXT NOT NULL DEFAULT 'planifiee' CHECK(statut IN ('planifiee', 'realisee', 'annulee')),
    date_realisation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) {
    console.error('Erreur lors de la création de la table visites_stage:', err);
  } else {
    console.log('✅ Table visites_stage créée ou existe déjà');
    
    // Ajouter la colonne lieu si elle n'existe pas
    db.run(`ALTER TABLE visites_stage ADD COLUMN lieu TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Erreur lors de l\'ajout de la colonne lieu:', err);
      } else {
        console.log('✅ Colonne lieu ajoutée ou existe déjà');
      }
    });
  }
});

// GET - Récupérer toutes les visites d'un étudiant
router.get('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  
  db.all(
    `SELECT * FROM visites_stage WHERE student_id = ? ORDER BY date DESC`,
    [studentId],
    (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des visites:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(rows);
    }
  );
});

// GET - Récupérer une visite spécifique
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT * FROM visites_stage WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération de la visite:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Visite non trouvée' });
      }
      res.json(row);
    }
  );
});

// POST - Créer une nouvelle visite
router.post('/', (req, res) => {
  const { student_id, date, heure, type, professeur, tuteur, lieu, observations, statut } = req.body;
  
  // Validation
  if (!student_id || !date || !type || !professeur || !tuteur) {
    return res.status(400).json({ 
      error: 'Champs requis manquants: student_id, date, type, professeur, tuteur' 
    });
  }

  const validTypes = ['premiere', 'suivi', 'finale'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Type invalide. Doit être: premiere, suivi, ou finale' 
    });
  }

  const validStatuts = ['planifiee', 'realisee', 'annulee'];
  const statutToUse = statut || 'planifiee';
  if (!validStatuts.includes(statutToUse)) {
    return res.status(400).json({ 
      error: 'Statut invalide. Doit être: planifiee, realisee, ou annulee' 
    });
  }

  db.run(
    `INSERT INTO visites_stage (student_id, date, heure, type, professeur, tuteur, lieu, observations, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [student_id, date, heure || '', type, professeur, tuteur, lieu || '', observations || '', statutToUse],
    function(err) {
      if (err) {
        console.error('Erreur lors de la création de la visite:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      // Récupérer la visite créée
      db.get(
        `SELECT * FROM visites_stage WHERE id = ?`,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Erreur lors de la récupération de la visite créée:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

// PUT - Mettre à jour une visite
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { date, heure, type, professeur, tuteur, lieu, observations, statut } = req.body;
  
  // Construire la requête dynamiquement
  const updates = [];
  const values = [];
  
  if (date !== undefined) {
    updates.push('date = ?');
    values.push(date);
  }
  if (heure !== undefined) {
    updates.push('heure = ?');
    values.push(heure);
  }
  if (type !== undefined) {
    const validTypes = ['premiere', 'suivi', 'finale'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Type invalide. Doit être: premiere, suivi, ou finale' 
      });
    }
    updates.push('type = ?');
    values.push(type);
  }
  if (professeur !== undefined) {
    updates.push('professeur = ?');
    values.push(professeur);
  }
  if (tuteur !== undefined) {
    updates.push('tuteur = ?');
    values.push(tuteur);
  }
  if (lieu !== undefined) {
    updates.push('lieu = ?');
    values.push(lieu);
  }
  if (observations !== undefined) {
    updates.push('observations = ?');
    values.push(observations);
  }
  if (statut !== undefined) {
    const validStatuts = ['planifiee', 'realisee', 'annulee'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ 
        error: 'Statut invalide. Doit être: planifiee, realisee, ou annulee' 
      });
    }
    updates.push('statut = ?');
    values.push(statut);
    
    // Si le statut devient 'realisee', mettre à jour date_realisation
    if (statut === 'realisee') {
      updates.push('date_realisation = ?');
      values.push(new Date().toISOString().split('T')[0]);
    }
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  if (updates.length === 1) { // Seulement updated_at
    return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  }
  
  const query = `UPDATE visites_stage SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de la visite:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Visite non trouvée' });
    }
    
    // Récupérer la visite mise à jour
    db.get(
      `SELECT * FROM visites_stage WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) {
          console.error('Erreur lors de la récupération de la visite mise à jour:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(row);
      }
    );
  });
});

// DELETE - Supprimer une visite
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run(
    `DELETE FROM visites_stage WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        console.error('Erreur lors de la suppression de la visite:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Visite non trouvée' });
      }
      
      res.json({ message: 'Visite supprimée avec succès' });
    }
  );
});

// GET - Statistiques des visites
router.get('/stats/overview', (req, res) => {
  db.all(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN statut = 'planifiee' THEN 1 ELSE 0 END) as planifiees,
      SUM(CASE WHEN statut = 'realisee' THEN 1 ELSE 0 END) as realisees,
      SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulees,
      SUM(CASE WHEN type = 'premiere' THEN 1 ELSE 0 END) as premieres,
      SUM(CASE WHEN type = 'suivi' THEN 1 ELSE 0 END) as suivis,
      SUM(CASE WHEN type = 'finale' THEN 1 ELSE 0 END) as finales
    FROM visites_stage`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(rows[0]);
    }
  );
});

// GET - Récupérer toutes les visites (pour le calendrier)
// IMPORTANT: Cette route doit être en DERNIER car c'est une route générique "/"
router.get('/', (req, res) => {
  db.all(`
    SELECT 
      vs.id,
      vs.student_id,
      vs.date as date_visite,
      vs.heure,
      vs.type,
      vs.professeur,
      vs.tuteur,
      vs.lieu,
      vs.observations,
      vs.statut,
      vs.date_realisation,
      vs.created_at,
      vs.updated_at,
      s.first_name || ' ' || s.last_name as nom_etudiant,
      s.class_name
    FROM visites_stage vs
    LEFT JOIN students s ON vs.student_id = s.id
    ORDER BY vs.date DESC
  `, (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des visites:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    } else {
      res.json({ success: true, data: rows });
    }
  });
});

module.exports = router;
