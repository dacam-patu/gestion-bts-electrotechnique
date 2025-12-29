const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Démarrage de l\'application U52 en mode production...');

// Vérifier que le dossier server existe
const serverPath = path.join(__dirname, 'server');
if (!fs.existsSync(serverPath)) {
  console.error('❌ Erreur: Le dossier server n\'existe pas');
  process.exit(1);
}

// Vérifier que server.js existe
const serverFile = path.join(serverPath, 'server.js');
if (!fs.existsSync(serverFile)) {
  console.error('❌ Erreur: Le fichier server.js n\'existe pas');
  process.exit(1);
}

// Créer le dossier logs s'il n'existe pas
const logsPath = path.join(__dirname, 'logs');
if (!fs.existsSync(logsPath)) {
  fs.mkdirSync(logsPath, { recursive: true });
  console.log('📁 Dossier logs créé');
}

// Démarrer le serveur
console.log('🔄 Démarrage du serveur Node.js...');
const server = spawn('node', ['server.js'], {
  cwd: serverPath,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

server.on('close', (code) => {
  console.log(`🛑 Serveur fermé avec le code ${code}`);
  if (code !== 0) {
    console.error('❌ Le serveur s\'est arrêté avec une erreur');
    process.exit(code);
  }
});

server.on('error', (err) => {
  console.error('❌ Erreur lors du démarrage du serveur:', err);
  process.exit(1);
});

// Gestion des signaux pour arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt de l\'application...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt de l\'application...');
  server.kill('SIGTERM');
});

console.log('✅ Application démarrée avec succès');
console.log('📊 Consultez les logs pour plus d\'informations');
