const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5588,
  JWT_SECRET: process.env.JWT_SECRET || 'studyfind_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '7d',
  UPLOADS_DIR: path.join(__dirname, '..', 'uploads'),
  DATA_FILE: path.join(__dirname, '..', 'data', 'studyfind_db.json'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
