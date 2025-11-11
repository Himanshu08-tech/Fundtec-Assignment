export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Lotwise Portfolio Tracker</h1>
      <ul>
        <li><a href="/trade">Trade input</a></li>
        <li><a href="/positions">Positions</a></li>
        <li><a href="/pnl">Realized P&amp;L</a></li>
      </ul>
    </main>
  );
}