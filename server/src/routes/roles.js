const express = require('express');
const { getDatabase } = require('../database/init');
const { checkPermission } = require('./auth');

const router = express.Router();

// Récupérer tous les rôles
router.get('/', checkPermission('roles_view'), (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT r.id, r.name, r.description, r.created_at,
           COUNT(rp.permission_id) as permission_count
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    GROUP BY r.id, r.name, r.description, r.created_at
    ORDER BY r.name
  `;
  
  db.all(query, (err, roles) => {
    if (err) {
      console.error('Erreur lors de la récupération des rôles:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des rôles' 
      });
    }
    
    res.json({
      success: true,
      data: roles
    });
  });
});

// Récupérer un rôle par ID avec ses permissions
router.get('/:id', checkPermission('roles_view'), (req, res) => {
  const roleId = req.params.id;
  const db = getDatabase();
  
  // Récupérer les informations du rôle
  const roleQuery = 'SELECT id, name, description, created_at FROM roles WHERE id = ?';
  
  db.get(roleQuery, [roleId], (err, role) => {
    if (err) {
      console.error('Erreur lors de la récupération du rôle:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du rôle' 
      });
    }
    
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rôle non trouvé' 
      });
    }
    
    // Récupérer les permissions du rôle
    const permissionsQuery = `
      SELECT p.id, p.name, p.description, p.module, p.action
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.module, p.action
    `;
    
    db.all(permissionsQuery, [roleId], (err, permissions) => {
      if (err) {
        console.error('Erreur lors de la récupération des permissions:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la récupération des permissions' 
        });
      }
      
      res.json({
        success: true,
        data: {
          ...role,
          permissions: permissions || []
        }
      });
    });
  });
});

// Récupérer toutes les permissions disponibles
router.get('/permissions/all', checkPermission('roles_view'), (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT id, name, description, module, action
    FROM permissions
    ORDER BY module, action
  `;
  
  db.all(query, (err, permissions) => {
    if (err) {
      console.error('Erreur lors de la récupération des permissions:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des permissions' 
      });
    }
    
    // Grouper les permissions par module
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        permissions: permissions,
        grouped: groupedPermissions
      }
    });
  });
});

// Mettre à jour les permissions d'un rôle
router.put('/:id/permissions', checkPermission('roles_manage'), (req, res) => {
  const roleId = req.params.id;
  const { permissionIds } = req.body;
  
  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Liste des permissions requise' 
    });
  }
  
  const db = getDatabase();
  
  // Vérifier que le rôle existe
  db.get('SELECT id FROM roles WHERE id = ?', [roleId], (err, role) => {
    if (err) {
      console.error('Erreur lors de la vérification du rôle:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour des permissions' 
      });
    }
    
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rôle non trouvé' 
      });
    }
    
    // Commencer une transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Supprimer toutes les permissions actuelles du rôle
      db.run('DELETE FROM role_permissions WHERE role_id = ?', [roleId], (err) => {
        if (err) {
          console.error('Erreur lors de la suppression des permissions:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour des permissions' 
          });
        }
        
        // Ajouter les nouvelles permissions
        if (permissionIds.length > 0) {
          const placeholders = permissionIds.map(() => '(?, ?)').join(',');
          const values = permissionIds.flatMap(permissionId => [roleId, permissionId]);
          
          const insertQuery = `INSERT INTO role_permissions (role_id, permission_id) VALUES ${placeholders}`;
          
          db.run(insertQuery, values, function(err) {
            if (err) {
              console.error('Erreur lors de l\'ajout des permissions:', err);
              db.run('ROLLBACK');
              return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de la mise à jour des permissions' 
              });
            }
            
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Erreur lors de la validation de la transaction:', err);
                return res.status(500).json({ 
                  success: false, 
                  message: 'Erreur lors de la mise à jour des permissions' 
                });
              }
              
              res.json({
                success: true,
                message: 'Permissions mises à jour avec succès'
              });
            });
          });
        } else {
          // Aucune permission à ajouter, valider la transaction
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Erreur lors de la validation de la transaction:', err);
              return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de la mise à jour des permissions' 
              });
            }
            
            res.json({
              success: true,
              message: 'Permissions mises à jour avec succès'
            });
          });
        }
      });
    });
  });
});

// Récupérer les statistiques des rôles
router.get('/stats/overview', checkPermission('roles_view'), (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      r.name as role_name,
      COUNT(DISTINCT u.id) as user_count,
      COUNT(DISTINCT rp.permission_id) as permission_count
    FROM roles r
    LEFT JOIN users u ON r.name = u.role
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    GROUP BY r.id, r.name
    ORDER BY r.name
  `;
  
  db.all(query, (err, stats) => {
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
