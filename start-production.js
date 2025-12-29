const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 Démarrage de l\'application U52 en mode production...');

const app = express();

// Configuration de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques React depuis le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Routes API basiques
app.get('/api/test', (req, res) => {
  res.json({ message: 'API U52 fonctionne !', timestamp: new Date().toISOString() });
});

// Route pour vérifier la santé de l'application
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Application U52 BTS Électrotechnique', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route catch-all pour React Router (doit être en dernier)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuration du port
const PORT = process.env.PORT || 3001;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur U52 démarré sur le port ${PORT}`);
  console.log(`🌐 Application accessible à: http://localhost:${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non gérée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});