import { Pool } from 'pg';
import { Kafka } from 'kafkajs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function buildKafka() {
  const brokers = (process.env.KAFKA_BROKERS || 'localhost:29092').split(',');
  const config = {
    clientId: process.env.KAFKA_CLIENT_ID || 'portfolio-worker',
    brokers
  };
  if (process.env.KAFKA_SSL === 'true') config.ssl = true;
  if (process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD) {
    config.sasl = {
      mechanism: process.env.KAFKA_SASL_MECHANISM || 'plain',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD
    };
  }
  return new Kafka(config);
}

const kafka = buildKafka();
const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'portfolio-consumers' });
const TOPIC = process.env.KAFKA_TOPIC || 'trades';

async function processTrade(client, trade) {
  // Idempotency
  const { rows } = await client.query('select processed_at, symbol, qty, price, trade_time from trades where id = $1 for update', [trade.id]);
  if (rows.length === 0) throw new Error(`Trade not found: ${trade.id}`);
  if (rows[0].processed_at) return; // already processed

  const symbol = rows[0].symbol;
  const qty = Number(rows[0].qty);
  const price = Number(rows[0].price);
  const tradeTime = rows[0].trade_time;

  if (qty > 0) {
    // BUY -> create lot
    await client.query(`
      insert into lots (symbol, buy_trade_id, qty_initial, qty_open, price, created_at)
      values ($1, $2, $3, $3, $4, $5)
    `, [symbol, trade.id, qty, price, tradeTime]);
  } else {
    // SELL -> close lots FIFO
    let remaining = -qty; // positive number to close
    // Lock open lots for this symbol in FIFO order
    const lotsRes = await client.query(`
      select id, qty_open::numeric, price::numeric
      from lots
      where symbol = $1 and qty_open > 0
      order by id asc
      for update
    `, [symbol]);

    let totalPnl = 0;
    for (const lot of lotsRes.rows) {
      if (remaining <= 0) break;
      const lotOpen = Number(lot.qty_open);
      if (lotOpen <= 0) continue;

      const matchQty = Math.min(lotOpen, remaining);
      const pnl = (price - Number(lot.price)) * matchQty;

      await client.query(`
        insert into lot_fills (lot_id, sell_trade_id, symbol, qty, buy_price, sell_price, pnl)
        values ($1, $2, $3, $4, $5, $6, $7)
      `, [lot.id, trade.id, symbol, matchQty, Number(lot.price), price, pnl]);

      await client.query(`
        update lots set qty_open = qty_open - $1 where id = $2
      `, [matchQty, lot.id]);

      totalPnl += pnl;
      remaining -= matchQty;
    }

    if (remaining > 0) {
      // Not enough to sell -> reject this trade processing
      throw new Error(`Insufficient open quantity for ${symbol}. Remaining: ${remaining}`);
    }

    // Upsert realized PnL
    await client.query(`
      insert into realized_pnl_by_symbol (symbol, realized_qty, realized_pnl, last_sell_trade_time)
      values ($1, $2, $3, $4)
      on conflict (symbol) do update set
        realized_qty = realized_pnl_by_symbol.realized_qty + EXCLUDED.realized_qty,
        realized_pnl = realized_pnl_by_symbol.realized_pnl + EXCLUDED.realized_pnl,
        last_sell_trade_time = greatest(realized_pnl_by_symbol.last_sell_trade_time, EXCLUDED.last_sell_trade_time)
    `, [symbol, -qty, totalPnl, tradeTime]);
  }

  await client.query('update trades set processed_at = now() where id = $1', [trade.id]);
}

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log('Worker consuming from topic:', TOPIC);

  await consumer.run({
    // Each message processed in-order within a partition (keyed by symbol)
    eachMessage: async ({ message }) => {
      const value = message.value?.toString();
      if (!value) return;
      const trade = JSON.parse(value);

      const client = await pool.connect();
      try {
        await client.query('begin');
        await processTrade(client, trade);
        await client.query('commit');
      } catch (e) {
        await client.query('rollback');
        console.error('Trade processing failed:', e.message);
        // In case of failure, the trade remains unprocessed; adjust strategy as needed (DLQ etc.)
      } finally {
        client.release();
      }
    }
  });
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});