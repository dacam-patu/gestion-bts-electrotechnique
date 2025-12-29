module.exports = {
  // Configuration serveur
  PORT: process.env.PORT || 3001,
  NODE_ENV: 'production',
  
  // Base de données
  DATABASE_PATH: './database/database.sqlite',
  
  // CORS pour production - REMPLACER par votre domaine
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://votre-domaine.com',
  
  // JWT - CHANGER en production
  JWT_SECRET: process.env.JWT_SECRET || 'votre-secret-jwt-production-tres-securise',
  
  // Uploads
  UPLOAD_PATH: './uploads',
  
  // Configuration SSL (optionnel)
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || null,
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || null,
  
  // Logs
  LOG_LEVEL: 'info',
  LOG_FILE: './logs/app.log'
};
