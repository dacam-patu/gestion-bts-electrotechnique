const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, DOC, DOCX, JPG, PNG et GIF sont autorisés'));
    }
  }
});

// Récupérer tous les documents d'un étudiant
router.get('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT d.*, s.first_name, s.last_name, p.phase_number
    FROM documents d
    JOIN students s ON d.student_id = s.id
    LEFT JOIN phases p ON d.phase_id = p.id
    WHERE d.student_id = ?
    ORDER BY d.uploaded_at DESC
  `, [studentId], (err, documents) => {
    if (err) {
      console.error('Erreur lors de la récupération des documents:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des documents' 
      });
    }
    
    res.json({
      success: true,
      data: documents
    });
  });
});

// Récupérer les documents par phase
router.get('/phase/:phaseId', (req, res) => {
  const { phaseId } = req.params;
  const db = getDatabase();
  
  db.all(`
    SELECT d.*, s.first_name, s.last_name
    FROM documents d
    JOIN students s ON d.student_id = s.id
    WHERE d.phase_id = ?
    ORDER BY d.uploaded_at DESC
  `, [phaseId], (err, documents) => {
    if (err) {
      console.error('Erreur lors de la récupération des documents:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des documents' 
      });
    }
    
    res.json({
      success: true,
      data: documents
    });
  });
});

// Upload d'un document
router.post('/upload', upload.single('document'), (req, res) => {
  const { student_id, phase_id, document_type } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'Aucun fichier fourni' 
    });
  }
  
  if (!student_id || !document_type) {
    return res.status(400).json({ 
      success: false, 
      message: 'student_id et document_type sont requis' 
    });
  }
  
  const db = getDatabase();
  
  db.run(`
    INSERT INTO documents (student_id, phase_id, document_type, filename, file_path)
    VALUES (?, ?, ?, ?, ?)
  `, [student_id, phase_id, document_type, req.file.originalname, req.file.filename], function(err) {
    if (err) {
      console.error('Erreur lors de l\'enregistrement du document:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'enregistrement du document' 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Document uploadé avec succès',
      data: {
        id: this.lastID,
        student_id,
        phase_id,
        document_type,
        filename: req.file.originalname,
        file_path: req.file.filename
      }
    });
  });
});

// Télécharger un document
router.get('/download/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, document) => {
    if (err) {
      console.error('Erreur lors de la récupération du document:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du document' 
      });
    }
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document non trouvé' 
      });
    }
    
    const filePath = path.join(__dirname, '../../uploads', document.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fichier non trouvé sur le serveur' 
      });
    }
    
    res.download(filePath, document.filename);
  });
});

// Supprimer un document
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, document) => {
    if (err) {
      console.error('Erreur lors de la récupération du document:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du document' 
      });
    }
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document non trouvé' 
      });
    }
    
    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../../uploads', document.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Supprimer l'enregistrement de la base de données
    db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression du document:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la suppression du document' 
        });
      }
      
      res.json({
        success: true,
        message: 'Document supprimé avec succès'
      });
    });
  });
});

// Récupérer les types de documents par phase
router.get('/types/phase/:phaseNumber', (req, res) => {
  const { phaseNumber } = req.params;
  
  // Définir les types de documents par phase
  const documentTypes = {
    1: [ // Phase 1: Planification
      'planning',
      'fiche_technique',
      'schema_electrique',
      'plan_securite',
      'cahier_charges',
      'analyse_contraintes'
    ],
    2: [ // Phase 2: Pilotage
      'suivi_heures',
      'observations',
      'remarques_enseignant',
      'modifications_planning',
      'rapport_intermediaire'
    ],
    3: [ // Phase 3: Soutenance
      'rapport_final',
      'presentation',
      'grille_evaluation',
      'commentaires_soutenance',
      'note_finale'
    ]
  };
  
  res.json({
    success: true,
    data: documentTypes[phaseNumber] || []
  });
});

module.exports = router;
