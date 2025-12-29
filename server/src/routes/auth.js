const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const router = express.Router();
const JWT_SECRET = 'u52-secret-key-2024';

// Middleware pour vérifier les permissions
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token manquant' 
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const db = getDatabase();
      
      // Vérifier si l'utilisateur a la permission requise
      const hasPermission = await checkUserPermission(db, decoded.id, requiredPermission);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: 'Permission insuffisante' 
        });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Erreur de vérification des permissions:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
  };
};

// Fonction pour vérifier les permissions d'un utilisateur
const checkUserPermission = (db, userId, requiredPermission) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count
      FROM users u
      JOIN roles r ON r.name = u.role
      JOIN role_permissions rp ON rp.role_id = r.id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = ? AND p.name = ?
    `;
    
    db.get(query, [userId, requiredPermission], (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification des permissions:', err);
        reject(err);
      } else {
        resolve(row && row.count > 0);
      }
    });
  });
};

// Fonction pour récupérer toutes les permissions d'un utilisateur
const getUserPermissions = (db, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT p.name, p.description, p.module, p.action
      FROM users u
      JOIN roles r ON r.name = u.role
      JOIN role_permissions rp ON rp.role_id = r.id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = ?
    `;
    
    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des permissions:', err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// Route de connexion
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nom d\'utilisateur et mot de passe requis' 
    });
  }

  const db = getDatabase();
  
  db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username], async (err, user) => {
    if (err) {
      console.error('Erreur lors de la recherche utilisateur:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nom d\'utilisateur ou mot de passe incorrect' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nom d\'utilisateur ou mot de passe incorrect' 
      });
    }

    // Récupérer les permissions de l'utilisateur
    try {
      const permissions = await getUserPermissions(db, user.id);
      
      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          permissions: permissions.map(p => p.name)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des permissions' 
      });
    }
  });
});

// Route de vérification du token
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token manquant' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDatabase();
    
    // Récupérer les permissions de l'utilisateur
    const permissions = await getUserPermissions(db, decoded.id);
    
    res.json({
      success: true,
      user: {
        ...decoded,
        permissions: permissions.map(p => p.name)
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token invalide' 
    });
  }
});

// Route pour récupérer les permissions de l'utilisateur connecté
router.get('/permissions', checkPermission('dashboard_view'), async (req, res) => {
  try {
    const db = getDatabase();
    const permissions = await getUserPermissions(db, req.user.id);
    
    res.json({
      success: true,
      permissions: permissions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des permissions' 
    });
  }
});

// Route de déconnexion (côté client)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

module.exports = { router, checkPermission, getUserPermissions }; 