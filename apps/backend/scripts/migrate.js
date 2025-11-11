import fs from 'fs';
import { Pool } from 'pg';
import 'dotenv/config';

const sql = fs.readFileSync(new URL('../migrations.sql', import.meta.url), 'utf8');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    console.log('Migrations applied');
  } catch (e) {
    await client.query('rollback');
    console.error('Migration failed:', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();