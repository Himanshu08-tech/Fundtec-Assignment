// const express = require('express');
// const router = express.Router();
// const pool = require('../db');

// // GET /pnl → realized P&L summary by symbol
// router.get('/', async (_req, res) => {
// try {
// const result = await pool.query( SELECT symbol, SUM(pnl) AS total_pnl, COUNT(*) AS num_trades FROM realized_pnl GROUP BY symbol ORDER BY symbol ASC );



// res.json(result.rows);
// } catch (err) {
// console.error('Error fetching P&L:', err);
// res.status(500).json({ error: 'Internal server error' });
// }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /pnl → realized P&L summary by symbol
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        symbol, 
        SUM(pnl) AS total_pnl, 
        COUNT(*) AS num_trades 
      FROM realized_pnl 
      GROUP BY symbol 
      ORDER BY symbol ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching P&L:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
