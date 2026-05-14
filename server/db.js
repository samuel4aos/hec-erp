const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.NEON_DATABASE_URL;
let sql;
try {
  sql = connectionString ? neon(connectionString) : null;
} catch (e) {
  console.error('DB init error:', e.message);
  sql = null;
}

module.exports = { sql };
