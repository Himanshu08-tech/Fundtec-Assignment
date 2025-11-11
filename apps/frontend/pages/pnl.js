import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function PnL() {
  const [data, setData] = useState();

  useEffect(() => {
    fetch(`${API}/pnl`).then(r => r.json()).then(setData);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h2>Realized P&amp;L</h2>
      {!data ? <p>Loading...</p> :
        data.realized.length === 0 ? <p>No realized P&amp;L yet.</p> :
        <table border="1" cellPadding="6">
          <thead><tr><th>Symbol</th><th>Realized Qty</th><th>Realized P&amp;L</th><th>Last Sell</th></tr></thead>
          <tbody>
            {data.realized.map(r => (
              <tr key={r.symbol}>
                <td>{r.symbol}</td>
                <td>{r.realized_qty}</td>
                <td>{r.realized_pnl}</td>
                <td>{r.last_sell_trade_time ? new Date(r.last_sell_trade_time).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </main>
  );
}