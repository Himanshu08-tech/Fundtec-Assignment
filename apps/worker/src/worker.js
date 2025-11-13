import 'dotenv/config';
import { Kafka, logLevel } from 'kafkajs';
import { pool } from './db.js';
import { processBuy, processSell } from '../../shared/fifo.mjs'; // named imports from your ESM fifo

// 1) Kafka optional switch
const KAFKA_ENABLED = process.env.KAFKA_ENABLED !== 'false';
if (!KAFKA_ENABLED) {
  console.log('KAFKA_ENABLED=false → Worker exiting (Kafka optional mode).');
  process.exit(0); // clean exit; backend runs direct mode safely
}

// 2) Build Kafka client config from env
function buildKafka() {
  const brokers = (process.env.KAFKA_BROKERS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (brokers.length === 0) {
    console.warn('KAFKA_BROKERS not provided → Worker exiting.');
    process.exit(0);
  }

  const sasl =
    process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD
      ? {
          mechanism: process.env.KAFKA_SASL_MECHANISM || 'scram-sha-256',
          username: process.env.KAFKA_USERNAME,
          password: process.env.KAFKA_PASSWORD
        }
      : undefined;

  const ssl = process.env.KAFKA_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'portfolio-worker',
    brokers,
    ssl,
    sasl,
    logLevel: logLevel.WARN
  });
}

const kafka = buildKafka();
const topic = process.env.KAFKA_TRADES_TOPIC || process.env.KAFKA_TOPIC || 'trades';
const groupId = process.env.KAFKA_GROUP_ID || 'portfolio-consumers';

(async () => {
  const consumer = kafka.consumer({ groupId });
  try {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    console.log(`Worker connected to Kafka. Consuming topic "${topic}"...`);

    await consumer.run({
      eachMessage: async ({ message }) => {
        const value = message.value?.toString();
        if (!value) return;

        const trade = JSON.parse(value); // { id, symbol, qty, price, ts }

        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          if (Number(trade.qty) > 0) {
            await processBuy(client, trade);
          } else if (Number(trade.qty) < 0) {
            await processSell(client, trade);
          }
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.error('Worker FIFO error:', err.message);
        } finally {
          client.release();
        }
      }
    });
  } catch (e) {
    // If Kafka is unreachable in cloud and you don’t want restarts, exit(0)
    console.error('Worker failed to connect to Kafka:', e.message);
    process.exit(0);
  }
})();