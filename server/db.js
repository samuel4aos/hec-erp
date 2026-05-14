const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.NEON_DATABASE_URL);

module.exports = { sql };
