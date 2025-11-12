// const express = require('express');
// const router = express.Router();
// const pool = require('../db');

// // GET /positions → open lots aggregated with avg cost
// router.get('/', async (_req, res) => {
// try {
// const result = await pool.query( SELECT symbol, SUM(remaining_quantity) AS total_quantity, CASE WHEN SUM(remaining_quantity) = 0 THEN 0 ELSE SUM(remaining_quantity * price) / NULLIF(SUM(remaining_quantity), 0) END AS avg_price FROM lots WHERE remaining_quantity > 0 GROUP BY symbol HAVING SUM(remaining_quantity) > 0 ORDER BY symbol ASC );



// res.json(result.rows);
// } catch (err) {
// console.error('Error fetching positions:', err);
// res.status(500).json({ error: 'Internal server error' });
// }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /positions → open lots aggregated with avg cost
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        symbol, 
        SUM(remaining_quantity) AS total_quantity, 
        CASE 
          WHEN SUM(remaining_quantity) = 0 THEN 0 
          ELSE SUM(remaining_quantity * price) / NULLIF(SUM(remaining_quantity), 0) 
        END AS avg_price 
      FROM lots 
      WHERE remaining_quantity > 0 
      GROUP BY symbol 
      HAVING SUM(remaining_quantity) > 0 
      ORDER BY symbol ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching positions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
