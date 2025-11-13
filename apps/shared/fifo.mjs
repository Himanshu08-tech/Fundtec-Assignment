// // apps/shared/fifo.js
// export async function processBuy(client, trade) {
//   const { id: tradeId, symbol, qty, price, ts } = trade;
//   const q = Number(qty);
//   if (q <= 0) throw new Error('Buy qty must be > 0');

//   await client.query(
//     `INSERT INTO lots (symbol, buy_trade_id, price, original_qty, remaining_qty, ts)
//      VALUES ($1, $2, $3, $4, $4, $5)`,
//     [symbol, tradeId, price, q, ts]
//   );
// }

// export async function processSell(client, trade) {
//   const { id: sellTradeId, symbol, qty, price: sellPrice, ts } = trade;
//   const toSell = -Number(qty);
//   if (toSell <= 0) throw new Error('Sell qty must be negative');

//   const lotsRes = await client.query(
//     `SELECT id, price, remaining_qty
//        FROM lots
//       WHERE symbol = $1 AND remaining_qty > 0
//       ORDER BY ts ASC, id ASC
//       FOR UPDATE`,
//     [symbol]
//   );

//   let remaining = toSell;
//   let realized = 0;

//   for (const lot of lotsRes.rows) {
//     if (remaining <= 0) break;
//     const lotRemaining = Number(lot.remaining_qty);
//     if (lotRemaining <= 0) continue;

//     const matched = Math.min(lotRemaining, remaining);
//     const buyPrice = Number(lot.price);
//     const pnl = matched * (Number(sellPrice) - buyPrice);
//     realized += pnl;

//     await client.query(
//       `UPDATE lots SET remaining_qty = remaining_qty - $1 WHERE id = $2`,
//       [matched, lot.id]
//     );

//     await client.query(
//       `INSERT INTO allocations (symbol, sell_trade_id, buy_lot_id, qty, buy_price, sell_price, realized_pnl, ts)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//       [symbol, sellTradeId, lot.id, matched, buyPrice, sellPrice, pnl, ts]
//     );

//     remaining -= matched;
//   }

//   if (remaining > 0) throw new Error(`Insufficient holdings for sell: missing ${remaining}`);

//   await client.query(
//     `INSERT INTO realized_pnl_summary (symbol, realized_pnl)
//      VALUES ($1, $2)
//      ON CONFLICT (symbol) DO UPDATE SET
//        realized_pnl = realized_pnl_summary.realized_pnl + EXCLUDED.realized_pnl,
//        last_updated = now()`,
//     [symbol, realized]
//   );
// }

export async function processBuy(client, trade) {
  const { id: tradeId, symbol, qty, price, ts } = trade;
  const q = Number(qty);
  if (q <= 0) throw new Error('Buy qty must be > 0');

  await client.query(
    `INSERT INTO lots (symbol, buy_trade_id, price, original_qty, remaining_qty, ts)
     VALUES ($1, $2, $3, $4, $4, $5)`,
    [symbol, tradeId, price, q, ts]
  );
}

export async function processSell(client, trade) {
  const { id: sellTradeId, symbol, qty, price: sellPrice, ts } = trade;
  const toSell = -Number(qty);
  if (toSell <= 0) throw new Error('Sell qty must be negative');

  const lotsRes = await client.query(
    `SELECT id, price, remaining_qty
       FROM lots
      WHERE symbol = $1 AND remaining_qty > 0
      ORDER BY ts ASC, id ASC
      FOR UPDATE`,
    [symbol]
  );

  let remaining = toSell;
  let realized = 0;

  for (const lot of lotsRes.rows) {
    if (remaining <= 0) break;
    const matched = Math.min(Number(lot.remaining_qty), remaining);
    const buyPrice = Number(lot.price);
    const pnl = matched * (Number(sellPrice) - buyPrice);
    realized += pnl;

    await client.query(`UPDATE lots SET remaining_qty = remaining_qty - $1 WHERE id = $2`, [matched, lot.id]);

    await client.query(
      `INSERT INTO allocations (symbol, sell_trade_id, buy_lot_id, qty, buy_price, sell_price, realized_pnl, ts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [symbol, sellTradeId, lot.id, matched, buyPrice, sellPrice, pnl, ts]
    );

    remaining -= matched;
  }

  if (remaining > 0) throw new Error(`Insufficient holdings for sell: missing ${remaining}`);

  await client.query(
    `INSERT INTO realized_pnl_summary (symbol, realized_pnl)
     VALUES ($1, $2)
     ON CONFLICT (symbol) DO UPDATE SET
       realized_pnl = realized_pnl_summary.realized_pnl + EXCLUDED.realized_pnl,
       last_updated = now()`,
    [symbol, realized]
  );
}