// Configuration de l'application U52 BTS Électrotechnique

module.exports = {
  // Ports
  PORT: process.env.PORT || 5000,
  CLIENT_PORT: process.env.CLIENT_PORT || 3000,
  
  // Base de données
  DB_PATH: './server/database/u52.db',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'u52-secret-key-2024',
  JWT_EXPIRES_IN: '24h',
  
  // Upload
  UPLOAD_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: './server/uploads',
  
  // Logs
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // API
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
}; 