const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./src/database/init');
const { router: authRoutes } = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const roleRoutes = require('./src/routes/roles');
const projectRoutes = require('./src/routes/projects');
const studentRoutes = require('./src/routes/students');
const evaluationRoutes = require('./src/routes/evaluations');
const planningRoutes = require('./src/routes/planning');
const internshipRoutes = require('./src/routes/internships');
const activityRoutes = require('./src/routes/activities');
const absenceRoutes = require('./src/routes/absences');
const classRoutes = require('./src/routes/classes');
const tpSheetRoutes = require('./src/routes/tpSheets');
const visitesStageRoutes = require('./src/routes/visitesStage');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques du dossier public
app.use('/public', express.static(path.join(__dirname, '../client/public')));
app.use(express.static(path.join(__dirname, '../client/public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/tp-sheets', tpSheetRoutes);
app.use('/api/visites-stage', visitesStageRoutes);

// Route pour servir le fichier Excel des entreprises
app.get('/entreprise.csv', (req, res) => {
  const xlsxPath = path.join(__dirname, '../entreprise.xlsx');
  const fs = require('fs');
  const XLSX = require('xlsx');
  
  try {
    // Vérifier si le fichier Excel existe
    if (!fs.existsSync(xlsxPath)) {
      console.log('❌ Fichier entreprise.xlsx non trouvé, tentative avec entreprise.csv');
      // Fallback vers le fichier CSV si Excel n'existe pas
      const csvPath = path.join(__dirname, '../entreprise.csv');
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'latin1');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.send(csvContent);
        return;
      } else {
        throw new Error('Aucun fichier entreprise trouvé');
      }
    }
    
    // Lire le fichier Excel
    const workbook = XLSX.readFile(xlsxPath);
    const sheetName = workbook.SheetNames[0]; // Prendre la première feuille
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir en CSV
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    console.log('✅ Fichier entreprise.xlsx lu et converti en CSV');
    
    // Définir les headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="entreprise.csv"');
    
    // Envoyer le contenu
    res.send(csvContent);
    console.log('📤 Fichier entreprise.xlsx envoyé comme CSV');
    
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier Excel:', err);
    res.status(404).json({ error: 'Fichier Excel non trouvé ou erreur de lecture' });
  }
});

// Serve static files from React app (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Catch all handler: send back React's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 Application U52 BTS Électrotechnique`);
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 Mode production - Fichiers statiques servis');
    } else {
      console.log('🔧 Mode développement - Utilisez le serveur React séparé');
    }
  });
}).catch(err => {
  console.error('❌ Erreur lors de l\'initialisation de la base de données:', err);
}); 