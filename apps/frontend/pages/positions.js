import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Positions() {
  const [data, setData] = useState();

  useEffect(() => {
    fetch(`${API}/positions`).then(r => r.json()).then(setData);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h2>Open Positions</h2>
      {!data ? <p>Loading...</p> : data.positions.length === 0 ? <p>No open positions.</p> :
        data.positions.map(p => (
          <div key={p.symbol} style={{ marginBottom: 16 }}>
            <h3>{p.symbol}</h3>
            <p>Total qty open: {p.total_qty_open} | Avg cost: {p.avg_cost?.toFixed(6)}</p>
            <table border="1" cellPadding="6">
              <thead><tr><th>Lot ID</th><th>Qty Open</th><th>Price</th></tr></thead>
              <tbody>
                {p.open_lots.map(l => (
                  <tr key={l.lot_id}>
                    <td>{l.lot_id}</td>
                    <td>{l.qty_open}</td>
                    <td>{l.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      }
    </main>
  );
}