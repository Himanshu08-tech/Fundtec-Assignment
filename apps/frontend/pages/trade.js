import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Trade() {
  const [symbol, setSymbol] = useState('AAPL');
  const [side, setSide] = useState('BUY');
  const [qty, setQty] = useState(100);
  const [price, setPrice] = useState(150);
  const [time, setTime] = useState(() => new Date().toISOString().slice(0,16)); // yyyy-MM-ddTHH:mm

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null);
    const sign = side === 'SELL' ? -1 : 1;

    try {
      const res = await fetch(`${API}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          qty: sign * Number(qty),
          price: Number(price),
          timestamp: new Date(time).toISOString()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h2>Trade input</h2>
      <form onSubmit={submit}>
        <div style={{ margin: '8px 0' }}>
          <label>Symbol: </label>
          <input value={symbol} onChange={e => setSymbol(e.target.value)} required />
        </div>
        <div style={{ margin: '8px 0' }}>
          <label>Side: </label>
          <select value={side} onChange={e => setSide(e.target.value)}>
            <option>BUY</option>
            <option>SELL</option>
          </select>
        </div>
        <div style={{ margin: '8px 0' }}>
          <label>Qty: </label>
          <input type="number" value={qty} onChange={e => setQty(e.target.value)} required />
        </div>
        <div style={{ margin: '8px 0' }}>
          <label>Price: </label>
          <input type="number" step="0.000001" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div style={{ margin: '8px 0' }}>
          <label>Time: </label>
          <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
      {result && <pre style={{ background: '#eee', padding: 12, marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </main>
  );
}