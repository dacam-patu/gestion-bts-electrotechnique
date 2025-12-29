const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/init');
const { checkPermission } = require('./auth');

const router = express.Router();

// Récupérer tous les utilisateurs
router.get('/', checkPermission('users_view'), (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at
    FROM users u
    ORDER BY u.created_at DESC
  `;
  
  db.all(query, (err, users) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des utilisateurs' 
      });
    }
    
    res.json({
      success: true,
      data: users
    });
  });
});

// Récupérer un utilisateur par ID
router.get('/:id', checkPermission('users_view'), (req, res) => {
  const db = getDatabase();
  const userId = req.params.id;
  
  const query = `
    SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at
    FROM users u
    WHERE u.id = ?
  `;
  
  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération de l\'utilisateur' 
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  });
});

// Créer un nouvel utilisateur
router.post('/', checkPermission('users_create'), async (req, res) => {
  const { username, password, email, first_name, last_name, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nom d\'utilisateur, mot de passe et rôle requis' 
    });
  }
  
  // Vérifier que le rôle est valide
  const validRoles = ['admin', 'teacher', 'student'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Rôle invalide' 
    });
  }
  
  const db = getDatabase();
  
  try {
    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existingUser) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la création de l\'utilisateur' 
        });
      }
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Un utilisateur avec ce nom existe déjà' 
        });
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Créer l'utilisateur
      const query = `
        INSERT INTO users (username, password, email, first_name, last_name, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [username, hashedPassword, email || null, first_name || null, last_name || null, role], function(err) {
        if (err) {
          console.error('Erreur lors de la création de l\'utilisateur:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création de l\'utilisateur' 
          });
        }
        
        res.json({
          success: true,
          message: 'Utilisateur créé avec succès',
          data: { id: this.lastID }
        });
      });
    });
  } catch (error) {
    console.error('Erreur lors du hashage du mot de passe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de l\'utilisateur' 
    });
  }
});

// Créer des utilisateurs de test
router.post('/create-test-users', checkPermission('users_create'), async (req, res) => {
  const db = getDatabase();
  
  const testUsers = [
    {
      username: 'prof1',
      password: 'prof123',
      email: 'prof1@u52.fr',
      first_name: 'Jean',
      last_name: 'Dupont',
      role: 'teacher'
    },
    {
      username: 'prof2',
      password: 'prof123',
      email: 'prof2@u52.fr',
      first_name: 'Marie',
      last_name: 'Martin',
      role: 'teacher'
    },
    {
      username: 'etudiant1',
      password: 'etudiant123',
      email: 'etudiant1@u52.fr',
      first_name: 'Pierre',
      last_name: 'Durand',
      role: 'student'
    },
    {
      username: 'etudiant2',
      password: 'etudiant123',
      email: 'etudiant2@u52.fr',
      first_name: 'Sophie',
      last_name: 'Leroy',
      role: 'student'
    }
  ];

  try {
    let createdCount = 0;
    
    for (const userData of testUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE username = ?', [userData.username], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!existingUser) {
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Créer l'utilisateur
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO users (username, password, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)', 
            [userData.username, hashedPassword, userData.email, userData.first_name, userData.last_name, userData.role], 
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
        
        createdCount++;
      }
    }
    
    res.json({
      success: true,
      message: `${createdCount} utilisateurs de test créés avec succès`,
      data: { createdCount }
    });
  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs de test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création des utilisateurs de test' 
    });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', checkPermission('users_edit'), async (req, res) => {
  const userId = req.params.id;
  const { username, email, first_name, last_name, role, is_active } = req.body;
  
  if (!username || !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nom d\'utilisateur et rôle requis' 
    });
  }
  
  // Vérifier que le rôle est valide
  const validRoles = ['admin', 'teacher', 'student'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Rôle invalide' 
    });
  }
  
  const db = getDatabase();
  
  // Vérifier si l'utilisateur existe
  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour de l\'utilisateur' 
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Vérifier si le nom d'utilisateur existe déjà (sauf pour cet utilisateur)
    db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId], (err, existingUser) => {
      if (err) {
        console.error('Erreur lors de la vérification du nom d\'utilisateur:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la mise à jour de l\'utilisateur' 
        });
      }
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Un utilisateur avec ce nom existe déjà' 
        });
      }
      
      // Mettre à jour l'utilisateur
      const query = `
        UPDATE users 
        SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [username, email || null, first_name || null, last_name || null, role, is_active !== undefined ? is_active : 1, userId], function(err) {
        if (err) {
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour de l\'utilisateur' 
          });
        }
        
        res.json({
          success: true,
          message: 'Utilisateur mis à jour avec succès'
        });
      });
    });
  });
});

// Changer le mot de passe d'un utilisateur
router.put('/:id/password', checkPermission('users_edit'), async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nouveau mot de passe requis' 
    });
  }
  
  const db = getDatabase();
  
  try {
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Mettre à jour le mot de passe
    db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, userId], function(err) {
      if (err) {
        console.error('Erreur lors du changement de mot de passe:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors du changement de mot de passe' 
        });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        });
      }
      
      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès'
      });
    });
  } catch (error) {
    console.error('Erreur lors du hashage du mot de passe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du changement de mot de passe' 
    });
  }
});

// Supprimer un utilisateur
router.delete('/:id', checkPermission('users_delete'), (req, res) => {
  const userId = req.params.id;
  const db = getDatabase();
  
  // Vérifier que l'utilisateur n'est pas l'administrateur principal
  if (userId == 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Impossible de supprimer l\'administrateur principal' 
    });
  }
  
  // Supprimer l'utilisateur
  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression de l\'utilisateur' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  });
});

module.exports = router;
