import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const useSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined
});