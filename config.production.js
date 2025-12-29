module.exports = {
  // Configuration serveur
  PORT: process.env.PORT || 3001,
  NODE_ENV: 'production',
  
  // Base de données - Chemin corrigé pour LWS
  DATABASE_PATH: './server/database/u52.db',
  
  // CORS pour production - Votre vrai domaine
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://mypatuelec.fr',
  
  // JWT - Secret sécurisé
  JWT_SECRET: process.env.JWT_SECRET || 'Dalexa06!?#',
  
  // Uploads - Dossier dans la racine
  UPLOAD_PATH: './uploads',
  
  // Configuration SSL (optionnel)
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || null,
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || null,
  
  // Logs - Dossier dans la racine
  LOG_LEVEL: 'info',
  LOG_FILE: './logs/app.log',
  
  // Configuration spécifique LWS
  PUBLIC_PATH: './public',
  SERVER_PATH: './server',
  
  // Configuration de sécurité
  SESSION_SECRET: process.env.JWT_SECRET || 'Dalexa06!?#',
  
  // Configuration des uploads
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Configuration CORS étendue
  CORS_OPTIONS: {
    origin: process.env.CORS_ORIGIN || 'http://mypatuelec.fr',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
};