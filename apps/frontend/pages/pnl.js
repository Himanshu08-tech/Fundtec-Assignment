// pages/pnl.js
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function PnL() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/pnl`)
      .then(r => r.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getTotalPnL = () => {
    if (!data?.realized) return 0;
    return data.realized.reduce((sum, item) => sum + (item.realized_pnl || 0), 0);
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Realized P&L</h2>
            <p style={styles.subtitle}>Track your closed positions and realized profits</p>
          </div>
          {data && (
            <div style={styles.totalCard}>
              <span style={styles.totalLabel}>Total P&L</span>
              <span style={{
                ...styles.totalValue,
                color: getTotalPnL() >= 0 ? '#10b981' : '#ef4444'
              }}>
                {formatCurrency(getTotalPnL())}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading...</p>
          </div>
        ) : !data || data.realized?.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📊</div>
            <h3 style={styles.emptyTitle}>No realized P&L yet</h3>
            <p style={styles.emptyText}>Your closed positions will appear here</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Symbol</th>
                  <th style={styles.th}>Realized Qty</th>
                  <th style={styles.th}>Realized P&L</th>
                  <th style={styles.th}>Last Sell</th>
                </tr>
              </thead>
              <tbody>
                {data.realized.map(r => (
                  <tr key={r.symbol} style={styles.row}>
                    <td style={styles.symbolCell}>
                      <span style={styles.symbolBadge}>{r.symbol}</span>
                    </td>
                    <td style={styles.qtyCell}>{r.realized_qty}</td>
                    <td style={{
                      ...styles.pnlCell,
                      color: r.realized_pnl >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatCurrency(r.realized_pnl)}
                    </td>
                    <td style={styles.dateCell}>
                      {r.last_sell_trade_time 
                        ? new Date(r.last_sell_trade_time).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        tr:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#64748b',
    margin: 0,
  },
  totalCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1.25rem 2rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '200px',
  },
  totalLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  totalValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'white',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    margin: '0 auto 1rem',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  row: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  symbolCell: {
    padding: '1rem 1.5rem',
  },
  symbolBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.875rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  qtyCell: {
    padding: '1rem 1.5rem',
    fontWeight: '500',
    color: '#1e293b',
  },
  pnlCell: {
    padding: '1rem 1.5rem',
    fontWeight: '700',
    fontSize: '1.05rem',
  },
  dateCell: {
    padding: '1rem 1.5rem',
    color: '#64748b',
    fontSize: '0.9rem',
  },
};