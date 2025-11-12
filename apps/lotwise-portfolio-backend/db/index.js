require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
user: process.env.DB_USER || 'postgres',
host: process.env.DB_HOST || 'localhost',
database: process.env.DB_NAME || 'portfolio',
password: process.env.DB_PASSWORD || 'postgres',
port: Number(process.env.DB_PORT) || 5432,
max: 20,
idleTimeoutMillis: 30000
});

pool.on('connect', () => {
console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
console.error('❌ PostgreSQL client error:', err);
});

module.exports = pool;