// const express = require('express');
// const router = express.Router();
// const pool = require('../db');
// const { publishTrade } = require('../kafka/producer');

// // Basic validation
// function validateTrade(body) {
// const errors = [];
// const symbol = (body.symbol || '').toString().trim().toUpperCase();
// const quantity = Number(body.quantity);
// const price = Number(body.price);
// const timestamp = body.timestamp;

// if (!symbol) errors.push('symbol is required');
// if (!Number.isFinite(quantity) || quantity === 0) errors.push('quantity must be a non-zero number');
// if (!Number.isFinite(price) || price <= 0) errors.push('price must be a positive number');
// if (!timestamp || isNaN(Date.parse(timestamp))) errors.push('timestamp must be a valid ISO date string');

// return { symbol, quantity, price, timestamp, errors };
// }

// // POST /trades → add trade and publish to Kafka
// router.post('/', async (req, res) => {
// const { symbol, quantity, price, timestamp, errors } = validateTrade(req.body);
// if (errors.length) {
// return res.status(400).json({ error: 'Invalid trade', details: errors });
// }

// try {
// // Insert the trade
// const result = await pool.query(
// INSERT INTO trades (symbol, quantity, price, timestamp) VALUES ($1, $2, $3, $4) RETURNING *[symbol, quantity, price, timestamp]
// );



// const trade = result.rows[0];

// // Publish asynchronously; if it fails, we still return 201 (simple approach)
// publishTrade(trade).catch(err => {
//   console.error('Kafka publish failed:', err.message);
// });

// return res.status(201).json({ success: true, trade });
// } catch (err) {
// console.error('Error inserting trade:', err);
// return res.status(500).json({ error: 'Internal server error' });
// }
// });

// // OPTIONAL: GET /trades (debug)
// router.get('/', async (_req, res) => {
// try {
// const result = await pool.query(SELECT * FROM trades ORDER BY timestamp DESC LIMIT 200);
// res.json(result.rows);
// } catch (err) {
// console.error('Error reading trades:', err);
// res.status(500).json({ error: 'Internal server error' });
// }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { publishTrade } = require('../kafka/producer');

// --- Basic validation function ---
function validateTrade(body) {
  const errors = [];
  const symbol = (body.symbol || '').toString().trim().toUpperCase();
  const quantity = Number(body.quantity);
  const price = Number(body.price);
  const timestamp = body.timestamp;

  if (!symbol) errors.push('symbol is required');
  if (!Number.isFinite(quantity) || quantity === 0) errors.push('quantity must be a non-zero number');
  if (!Number.isFinite(price) || price <= 0) errors.push('price must be a positive number');
  if (!timestamp || isNaN(Date.parse(timestamp))) errors.push('timestamp must be a valid ISO date string');

  return { symbol, quantity, price, timestamp, errors };
}

// --- POST /trades → add trade and publish to Kafka ---
router.post('/', async (req, res) => {
  const { symbol, quantity, price, timestamp, errors } = validateTrade(req.body);

  if (errors.length) {
    return res.status(400).json({ error: 'Invalid trade', details: errors });
  }

  try {
    // Insert the trade
    const result = await pool.query(
      `INSERT INTO trades (symbol, quantity, price, timestamp)
       VALUES ($1, $2, $3, $4)
       RETURNING symbol, quantity, price, timestamp`,
      [symbol, quantity, price, timestamp]
    );

    const trade = result.rows[0];

    // Publish asynchronously (non-blocking)
    publishTrade(trade).catch(err => {
      console.error('Kafka publish failed:', err.message);
    });

    return res.status(201).json({ success: true, trade });
  } catch (err) {
    console.error('Error inserting trade:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- OPTIONAL: GET /trades → debug list ---
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM trades ORDER BY timestamp DESC LIMIT 200`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error reading trades:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

