const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../database/u52.db');
let db;

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur lors de la connexion à la base de données:', err);
        reject(err);
        return;
      }
      console.log('✅ Connexion à la base de données SQLite établie');
      createTables(resolve, reject);
    });
  });
};

const createTables = (resolve, reject) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'teacher' CHECK(role IN ('admin', 'teacher', 'student')),
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS role_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
      UNIQUE(role_id, permission_id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS user_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      UNIQUE(user_id, role_id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      executors TEXT,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      project_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_de_naissance DATE,
      email TEXT,
      class TEXT,
      class_id INTEGER,
      group_id INTEGER,
      project_id INTEGER,
      role TEXT,
      coloration TEXT,
      photo TEXT,
      school_year TEXT DEFAULT '2025-2026',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (class_id) REFERENCES classes(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      school_year TEXT DEFAULT '2025-2026',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS tp_sheets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      context TEXT,
      objectives TEXT,
      documents TEXT,
      tasks TEXT,
      competencies TEXT,
      work_required TEXT,
      evaluation TEXT,
      equipment TEXT,
      images TEXT,
      duration TEXT,
      safety TEXT,
      control_questions TEXT,
      observations TEXT,
      image_zone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      project_id INTEGER,
      phase_number INTEGER,
      status TEXT DEFAULT 'pending',
      start_date DATE,
      end_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      project_id INTEGER,
      phase_id INTEGER,
      competence TEXT,
      indicator TEXT,
      score INTEGER,
      comments TEXT,
      global_comments TEXT,
      criteria TEXT,
      school_year TEXT DEFAULT '2025-2026',
      evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      activity_name TEXT,
      activity_type TEXT,
      type TEXT DEFAULT 'U52',
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (phase_id) REFERENCES phases(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS evaluation_grids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      project_id INTEGER,
      grid_data TEXT NOT NULL,
      global_score REAL,
      global_comments TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS planning_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      project_id INTEGER,
      phase INTEGER NOT NULL CHECK(phase IN (1, 2, 3)),
      phase_name TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      start_time TIME,
      end_time TIME,
      location TEXT,
      notes TEXT,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      phase_id INTEGER,
      document_type TEXT,
      filename TEXT,
      file_path TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (phase_id) REFERENCES phases(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      company_id INTEGER,
      company_name TEXT NOT NULL,
      company_address TEXT,
      company_phone TEXT,
      company_email TEXT,
      supervisor_name TEXT,
      supervisor_phone TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'terminated')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT DEFAULT 'technical' CHECK(type IN ('technical', 'administrative', 'formation')),
      hours REAL DEFAULT 0,
      observations TEXT,
      school_year TEXT DEFAULT '2025-2026',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS absences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date DATE NOT NULL,
      reason TEXT,
      type TEXT DEFAULT 'justified' CHECK(type IN ('justified', 'unjustified')),
      duration TEXT DEFAULT 'full_day' CHECK(duration IN ('full_day', 'half_day')),
      school_year TEXT DEFAULT '2025-2026',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    // Nouveau: table d'affectation des ouvriers par groupe
    `CREATE TABLE IF NOT EXISTS group_workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, student_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    )`
  ];

  let completed = 0;
  tables.forEach((table, index) => {
    db.run(table, (err) => {
      if (err) {
        console.error(`❌ Erreur lors de la création de la table ${index + 1}:`, err);
      } else {
        completed++;
        if (completed === tables.length) {
          console.log('✅ Toutes les tables ont été créées');
          migrateDatabase(resolve, reject);
        }
      }
    });
  });
};

const migrateDatabase = (resolve, reject) => {
  // Vérifier si la colonne date_de_naissance existe dans la table students
  db.get("PRAGMA table_info(students)", (err, rows) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification de la structure de la table students:', err);
      migrateUsersTable(resolve, reject);
      return;
    }
    
    // Vérifier si la colonne date_de_naissance existe
    db.all("PRAGMA table_info(students)", (err, columns) => {
      if (err) {
        console.error('❌ Erreur lors de la vérification des colonnes:', err);
        migrateUsersTable(resolve, reject);
        return;
      }
      
      const hasDateNaissance = columns.some(col => col.name === 'date_de_naissance');
      const hasEmail = columns.some(col => col.name === 'email');
      const hasColoration = columns.some(col => col.name === 'coloration');
      const hasPhoto = columns.some(col => col.name === 'photo');
      
      let migrationsNeeded = 0;
      let migrationsCompleted = 0;
      
      const checkMigrationsComplete = () => {
        migrationsCompleted++;
        if (migrationsCompleted === migrationsNeeded) {
          migrateUsersTable(resolve, reject);
        }
      };
      
      if (!hasDateNaissance) {
        migrationsNeeded++;
        console.log('🔄 Ajout de la colonne date_de_naissance à la table students...');
        db.run('ALTER TABLE students ADD COLUMN date_de_naissance DATE', (err) => {
          if (err) {
            console.error('❌ Erreur lors de l\'ajout de la colonne date_de_naissance:', err);
          } else {
            console.log('✅ Colonne date_de_naissance ajoutée avec succès');
          }
          checkMigrationsComplete();
        });
      } else {
        console.log('ℹ️ Colonne date_de_naissance existe déjà');
      }
      
      if (!hasEmail) {
        migrationsNeeded++;
        console.log('🔄 Ajout de la colonne email à la table students...');
        db.run('ALTER TABLE students ADD COLUMN email TEXT', (err) => {
          if (err) {
            console.error('❌ Erreur lors de l\'ajout de la colonne email:', err);
          } else {
            console.log('✅ Colonne email ajoutée avec succès');
          }
          checkMigrationsComplete();
        });
      } else {
        console.log('ℹ️ Colonne email existe déjà');
      }
      
      if (!hasColoration) {
        migrationsNeeded++;
        console.log('🔄 Ajout de la colonne coloration à la table students...');
        db.run('ALTER TABLE students ADD COLUMN coloration TEXT', (err) => {
          if (err) {
            console.error('❌ Erreur lors de l\'ajout de la colonne coloration:', err);
          } else {
            console.log('✅ Colonne coloration ajoutée avec succès');
          }
          checkMigrationsComplete();
        });
      } else {
        console.log('ℹ️ Colonne coloration existe déjà');
      }
      
      if (!hasPhoto) {
        migrationsNeeded++;
        console.log('🔄 Ajout de la colonne photo à la table students...');
        db.run('ALTER TABLE students ADD COLUMN photo TEXT', (err) => {
          if (err) {
            console.error('❌ Erreur lors de l\'ajout de la colonne photo:', err);
          } else {
            console.log('✅ Colonne photo ajoutée avec succès');
          }
          checkMigrationsComplete();
        });
      } else {
        console.log('ℹ️ Colonne photo existe déjà');
      }
      
      if (migrationsNeeded === 0) {
        migrateEvaluationsTable(resolve, reject);
      }
    });
  });
};

const migrateEvaluationsTable = (resolve, reject) => {
  // Vérifier les colonnes de la table evaluations
  db.all("PRAGMA table_info(evaluations)", (err, columns) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification des colonnes evaluations:', err);
      migrateUsersTable(resolve, reject);
      return;
    }
    
    const hasGlobalComments = columns.some(col => col.name === 'global_comments');
    const hasActivityName = columns.some(col => col.name === 'activity_name');
    const hasActivityType = columns.some(col => col.name === 'activity_type');
    const hasType = columns.some(col => col.name === 'type');
    
    let migrationsNeeded = 0;
    let migrationsCompleted = 0;
    
    const checkMigrationsComplete = () => {
      migrationsCompleted++;
      if (migrationsCompleted === migrationsNeeded) {
        console.log('✅ Migration de la table evaluations terminée');
        createDefaultUser(resolve, reject);
      }
    };
    
    if (!hasGlobalComments) {
      migrationsNeeded++;
      console.log('🔄 Ajout de la colonne global_comments à la table evaluations...');
      db.run('ALTER TABLE evaluations ADD COLUMN global_comments TEXT', (err) => {
        if (err) {
          console.error('❌ Erreur lors de l\'ajout de la colonne global_comments:', err);
        } else {
          console.log('✅ Colonne global_comments ajoutée avec succès');
        }
        checkMigrationsComplete();
      });
    } else {
      console.log('ℹ️ Colonne global_comments existe déjà');
      checkMigrationsComplete();
    }
    
    if (!hasActivityName) {
      migrationsNeeded++;
      console.log('🔄 Ajout de la colonne activity_name à la table evaluations...');
      db.run('ALTER TABLE evaluations ADD COLUMN activity_name TEXT', (err) => {
        if (err) {
          console.error('❌ Erreur lors de l\'ajout de la colonne activity_name:', err);
        } else {
          console.log('✅ Colonne activity_name ajoutée avec succès');
        }
        checkMigrationsComplete();
      });
    } else {
      console.log('ℹ️ Colonne activity_name existe déjà');
      checkMigrationsComplete();
    }
    
    if (!hasActivityType) {
      migrationsNeeded++;
      console.log('🔄 Ajout de la colonne activity_type à la table evaluations...');
      db.run('ALTER TABLE evaluations ADD COLUMN activity_type TEXT', (err) => {
        if (err) {
          console.error('❌ Erreur lors de l\'ajout de la colonne activity_type:', err);
        } else {
          console.log('✅ Colonne activity_type ajoutée avec succès');
        }
        checkMigrationsComplete();
      });
    } else {
      console.log('ℹ️ Colonne activity_type existe déjà');
      checkMigrationsComplete();
    }
    
    if (!hasType) {
      migrationsNeeded++;
      console.log('🔄 Ajout de la colonne type à la table evaluations...');
      db.run('ALTER TABLE evaluations ADD COLUMN type TEXT DEFAULT "U52"', (err) => {
        if (err) {
          console.error('❌ Erreur lors de l\'ajout de la colonne type:', err);
        } else {
          console.log('✅ Colonne type ajoutée avec succès');
        }
        checkMigrationsComplete();
      });
    } else {
      console.log('ℹ️ Colonne type existe déjà');
      checkMigrationsComplete();
    }
    
    if (migrationsNeeded === 0) {
      console.log('✅ Aucune migration nécessaire pour la table evaluations');
      createDefaultUser(resolve, reject);
    }
  });
};

const migrateUsersTable = (resolve, reject) => {
  // Vérifier et ajouter les colonnes manquantes à la table users
  db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification de la table users:', err);
      migrateEvaluationsTable(resolve, reject);
      return;
    }
    
    const columnNames = rows.map(col => col.name);
    const missingColumns = [];
    
    if (!columnNames.includes('email')) {
      missingColumns.push("ADD COLUMN email TEXT");
    }
    if (!columnNames.includes('first_name')) {
      missingColumns.push("ADD COLUMN first_name TEXT");
    }
    if (!columnNames.includes('last_name')) {
      missingColumns.push("ADD COLUMN last_name TEXT");
    }
    if (!columnNames.includes('is_active')) {
      missingColumns.push("ADD COLUMN is_active BOOLEAN DEFAULT 1");
    }
    if (!columnNames.includes('updated_at')) {
      missingColumns.push("ADD COLUMN updated_at DATETIME");
    }
    
    if (missingColumns.length > 0) {
      console.log('🔄 Ajout des colonnes manquantes à la table users...');
      
      // Ajouter les colonnes une par une pour éviter les erreurs
      let completedColumns = 0;
      const totalColumns = missingColumns.length;
      
      missingColumns.forEach((columnDef, index) => {
        const alterQuery = `ALTER TABLE users ${columnDef}`;
        db.run(alterQuery, (err) => {
          if (err) {
            console.error(`❌ Erreur lors de l'ajout de la colonne: ${columnDef}`, err);
          } else {
            console.log(`✅ Colonne ajoutée: ${columnDef}`);
          }
          
          completedColumns++;
          if (completedColumns === totalColumns) {
            console.log('✅ Migration de la table users terminée');
            migrateEvaluationsTable(resolve, reject);
          }
        });
      });
    } else {
      console.log('ℹ️ Toutes les colonnes de la table users existent déjà');
      migrateEvaluationsTable(resolve, reject);
    }
  });
};


const createDefaultUser = async (resolve, reject) => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const defaultUser = {
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    email: 'admin@u52.fr',
    first_name: 'Administrateur',
    last_name: 'Système'
  };

  db.get('SELECT * FROM users WHERE username = ?', [defaultUser.username], (err, row) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification de l\'utilisateur par défaut:', err);
      return;
    }
    
    if (!row) {
      db.run('INSERT INTO users (username, password, role, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)', 
        [defaultUser.username, defaultUser.password, defaultUser.role, defaultUser.email, defaultUser.first_name, defaultUser.last_name], (err) => {
        if (err) {
          console.error('❌ Erreur lors de la création de l\'utilisateur par défaut:', err);
          reject(err);
        } else {
          console.log('✅ Utilisateur par défaut créé (admin/admin123)');
          initializeRolesAndPermissions(resolve, reject);
        }
      });
    } else {
      console.log('ℹ️ Utilisateur par défaut existe déjà');
      initializeRolesAndPermissions(resolve, reject);
    }
  });
};

const initializeRolesAndPermissions = (resolve, reject) => {
  console.log('🔄 Initialisation des rôles et permissions...');
  
  // Créer les rôles par défaut
  const roles = [
    { name: 'admin', description: 'Administrateur système avec tous les droits' },
    { name: 'teacher', description: 'Professeur avec droits de gestion et évaluation' },
    { name: 'student', description: 'Étudiant avec droits limités de consultation' }
  ];

  // Créer les permissions par défaut
  const permissions = [
    // Permissions pour le tableau de bord
    { name: 'dashboard_view', description: 'Voir le tableau de bord', module: 'dashboard', action: 'view' },
    
    // Permissions pour les projets
    { name: 'projects_view', description: 'Voir les projets', module: 'projects', action: 'view' },
    { name: 'projects_create', description: 'Créer des projets', module: 'projects', action: 'create' },
    { name: 'projects_edit', description: 'Modifier des projets', module: 'projects', action: 'edit' },
    { name: 'projects_delete', description: 'Supprimer des projets', module: 'projects', action: 'delete' },
    
    // Permissions pour les étudiants
    { name: 'students_view', description: 'Voir les étudiants', module: 'students', action: 'view' },
    { name: 'students_create', description: 'Créer des étudiants', module: 'students', action: 'create' },
    { name: 'students_edit', description: 'Modifier des étudiants', module: 'students', action: 'edit' },
    { name: 'students_delete', description: 'Supprimer des étudiants', module: 'students', action: 'delete' },
    
    // Permissions pour la planification
    { name: 'planning_view', description: 'Voir la planification', module: 'planning', action: 'view' },
    { name: 'planning_create', description: 'Créer des créneaux', module: 'planning', action: 'create' },
    { name: 'planning_edit', description: 'Modifier des créneaux', module: 'planning', action: 'edit' },
    { name: 'planning_delete', description: 'Supprimer des créneaux', module: 'planning', action: 'delete' },
    
    // Permissions pour les évaluations
    { name: 'evaluations_view', description: 'Voir les évaluations', module: 'evaluations', action: 'view' },
    { name: 'evaluations_create', description: 'Créer des évaluations', module: 'evaluations', action: 'create' },
    { name: 'evaluations_edit', description: 'Modifier des évaluations', module: 'evaluations', action: 'edit' },
    { name: 'evaluations_delete', description: 'Supprimer des évaluations', module: 'evaluations', action: 'delete' },
    { name: 'evaluations_print', description: 'Imprimer les évaluations', module: 'evaluations', action: 'print' },
    
    // Permissions pour les documents
    { name: 'documents_view', description: 'Voir les documents', module: 'documents', action: 'view' },
    { name: 'documents_upload', description: 'Télécharger des documents', module: 'documents', action: 'upload' },
    { name: 'documents_delete', description: 'Supprimer des documents', module: 'documents', action: 'delete' },
    
    // Permissions pour la gestion des rôles
    { name: 'roles_view', description: 'Voir les rôles', module: 'roles', action: 'view' },
    { name: 'roles_manage', description: 'Gérer les rôles', module: 'roles', action: 'manage' },
    
    // Permissions pour la gestion des utilisateurs
    { name: 'users_view', description: 'Voir les utilisateurs', module: 'users', action: 'view' },
    { name: 'users_create', description: 'Créer des utilisateurs', module: 'users', action: 'create' },
    { name: 'users_edit', description: 'Modifier des utilisateurs', module: 'users', action: 'edit' },
    { name: 'users_delete', description: 'Supprimer des utilisateurs', module: 'users', action: 'delete' }
  ];

  // Mapper les permissions par rôle
  const rolePermissions = {
    admin: permissions.map(p => p.name), // Toutes les permissions
    teacher: [
      'dashboard_view',
      'projects_view', 'projects_create', 'projects_edit',
      'students_view', 'students_create', 'students_edit',
      'planning_view', 'planning_create', 'planning_edit',
      'evaluations_view', 'evaluations_create', 'evaluations_edit', 'evaluations_print',
      'documents_view', 'documents_upload'
    ],
    student: [
      'dashboard_view',
      'projects_view',
      'planning_view',
      'evaluations_view',
      'documents_view'
    ]
  };

  // Insérer les rôles
  let rolesCompleted = 0;
  roles.forEach(role => {
    db.run('INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)', 
      [role.name, role.description], (err) => {
      if (err) {
        console.error(`❌ Erreur lors de la création du rôle ${role.name}:`, err);
      } else {
        rolesCompleted++;
        if (rolesCompleted === roles.length) {
          insertPermissions(permissions, rolePermissions, resolve, reject);
        }
      }
    });
  });
};

const insertPermissions = (permissions, rolePermissions, resolve, reject) => {
  let permissionsCompleted = 0;
  permissions.forEach(permission => {
    db.run('INSERT OR IGNORE INTO permissions (name, description, module, action) VALUES (?, ?, ?, ?)', 
      [permission.name, permission.description, permission.module, permission.action], (err) => {
      if (err) {
        console.error(`❌ Erreur lors de la création de la permission ${permission.name}:`, err);
      } else {
        permissionsCompleted++;
        if (permissionsCompleted === permissions.length) {
          assignPermissionsToRoles(rolePermissions, resolve, reject);
        }
      }
    });
  });
};

const assignPermissionsToRoles = (rolePermissions, resolve, reject) => {
  console.log('🔄 Attribution des permissions aux rôles...');
  
  let assignmentsCompleted = 0;
  const totalAssignments = Object.keys(rolePermissions).length;
  
  Object.entries(rolePermissions).forEach(([roleName, permissionNames]) => {
    // Récupérer l'ID du rôle
    db.get('SELECT id FROM roles WHERE name = ?', [roleName], (err, role) => {
      if (err || !role) {
        console.error(`❌ Erreur lors de la récupération du rôle ${roleName}:`, err);
        assignmentsCompleted++;
        if (assignmentsCompleted === totalAssignments) {
          console.log('✅ Initialisation des rôles et permissions terminée');
          resolve();
        }
        return;
      }
      
      // Attribuer chaque permission au rôle
      let permissionAssignmentsCompleted = 0;
      permissionNames.forEach(permissionName => {
        db.get('SELECT id FROM permissions WHERE name = ?', [permissionName], (err, permission) => {
          if (err || !permission) {
            console.error(`❌ Erreur lors de la récupération de la permission ${permissionName}:`, err);
          } else {
            db.run('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', 
              [role.id, permission.id], (err) => {
              if (err) {
                console.error(`❌ Erreur lors de l'attribution de la permission ${permissionName} au rôle ${roleName}:`, err);
              }
            });
          }
          
          permissionAssignmentsCompleted++;
          if (permissionAssignmentsCompleted === permissionNames.length) {
            assignmentsCompleted++;
            if (assignmentsCompleted === totalAssignments) {
              console.log('✅ Attribution des permissions terminée');
              resolve();
            }
          }
        });
      });
    });
  });
};

const getDatabase = () => {
  return db;
};

module.exports = {
  initDatabase,
  getDatabase
}; 