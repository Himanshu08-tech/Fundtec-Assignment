require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./index');

(async function init() {
try {
console.log('🔄 Initializing database schema...');
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
await pool.query(schema);
console.log('✅ Database initialized (tables: trades, lots, realized_pnl)');
process.exit(0);
} catch (err) {
console.error('❌ DB init error:', err);
process.exit(1);
}
})();