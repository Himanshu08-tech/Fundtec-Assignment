import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { Pool } from 'pg';
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function buildKafka() {
  const brokers = (process.env.KAFKA_BROKERS || 'localhost:29092').split(',');
  const kafkaConfig = {
    clientId: process.env.KAFKA_CLIENT_ID || 'portfolio-backend',
    brokers
  };
  if (process.env.KAFKA_SSL === 'true') {
    kafkaConfig.ssl = true;
  }
  if (process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD) {
    kafkaConfig.sasl = {
      mechanism: process.env.KAFKA_SASL_MECHANISM || 'plain',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD
    };
  }
  return new Kafka(kafkaConfig);
}

const kafka = buildKafka();
const producer = kafka.producer();
const TOPIC = process.env.KAFKA_TOPIC || 'trades';

async function startKafka() {
  await producer.connect();
  console.log('Kafka producer connected');
}
startKafka().catch(console.error);

// Validation
const TradeSchema = z.object({
  symbol: z.string().min(1).transform(s => s.trim().toUpperCase()),
  qty: z.number().refine(v => v !== 0, 'qty cannot be 0'),
  price: z.number().positive(),
  timestamp: z.coerce.date().optional()
});

// Helper: compute available open qty for a symbol
async function getOpenQty(symbol) {
  const { rows } = await pool.query(
    `select coalesce(sum(qty_open), 0)::text as qty_open
     from lots where symbol = $1 and qty_open > 0`, [symbol]
  );
  return Number(rows[0].qty_open);
}

// POST /trades
app.post('/trades', async (req, res) => {
  try {
    const parsed = TradeSchema.parse(req.body);
    const { symbol, qty, price } = parsed;
    const trade_time = parsed.timestamp ? new Date(parsed.timestamp) : new Date();

    // Pre-validate sells: ensure enough open qty
    if (qty < 0) {
      const openQty = await getOpenQty(symbol);
      if (openQty + qty < 0) {
        return res.status(400).json({ error: `Insufficient quantity to sell. Open: ${openQty}, Sell: ${-qty}` });
      }
    }

    const id = uuidv4();
    await pool.query(
      `insert into trades (id, symbol, qty, price, trade_time)
       values ($1, $2, $3, $4, $5)`,
      [id, symbol, qty, price, trade_time]
    );

    await producer.send({
      topic: TOPIC,
      messages: [{
        key: symbol,  // ensures per-symbol ordering
        value: JSON.stringify({ id, symbol, qty, price, trade_time })
      }]
    });

    res.status(201).json({ id, symbol, qty, price, trade_time });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /positions -> open lots + avg cost
app.get('/positions', async (_req, res) => {
  try {
    const agg = await pool.query(`
      select
        symbol,
        sum(qty_open)::text as total_qty_open,
        case when sum(qty_open) = 0 then null
             else (sum(qty_open * price) / sum(qty_open))::text
        end as avg_cost
      from lots
      where qty_open > 0
      group by symbol
      order by symbol
    `);

    const details = await pool.query(`
      select symbol, id as lot_id, qty_open::text as qty_open, price::text as price
      from lots
      where qty_open > 0
      order by symbol, id
    `);

    const lotsBySymbol = details.rows.reduce((acc, r) => {
      acc[r.symbol] = acc[r.symbol] || [];
      acc[r.symbol].push({
        lot_id: r.lot_id,
        qty_open: Number(r.qty_open),
        price: Number(r.price)
      });
      return acc;
    }, {});

    const positions = agg.rows.map(r => ({
      symbol: r.symbol,
      total_qty_open: Number(r.total_qty_open),
      avg_cost: r.avg_cost ? Number(r.avg_cost) : null,
      open_lots: lotsBySymbol[r.symbol] || []
    }));

    res.json({ positions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /pnl -> realized P&L summary
app.get('/pnl', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      select
        symbol,
        realized_qty::text as realized_qty,
        realized_pnl::text as realized_pnl,
        last_sell_trade_time
      from realized_pnl_by_symbol
      order by symbol
    `);
    res.json({
      realized: rows.map(r => ({
        symbol: r.symbol,
        realized_qty: Number(r.realized_qty),
        realized_pnl: Number(r.realized_pnl),
        last_sell_trade_time: r.last_sell_trade_time
      }))
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));