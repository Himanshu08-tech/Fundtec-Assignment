// pages/positions.js
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function Positions() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/positions`)
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
      maximumFractionDigits: 6,
    }).format(value);
  };

  const getTotalPositions = () => {
    if (!data?.positions) return 0;
    return data.positions.reduce((sum, p) => sum + p.total_qty_open, 0);
  };

  const getTotalValue = () => {
    if (!data?.positions) return 0;
    return data.positions.reduce((sum, p) => sum + (p.total_qty_open * (p.avg_cost || 0)), 0);
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Open Positions</h2>
            <p style={styles.subtitle}>Manage and track your active positions</p>
          </div>
          {data && data.positions?.length > 0 && (
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Positions</span>
                <span style={styles.statValue}>{data.positions.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Quantity</span>
                <span style={styles.statValue}>{getTotalPositions()}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Value</span>
                <span style={styles.statValue}>{formatCurrency(getTotalValue())}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading positions...</p>
          </div>
        ) : !data || data.positions?.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💼</div>
            <h3 style={styles.emptyTitle}>No open positions</h3>
            <p style={styles.emptyText}>Start trading to see your positions here</p>
          </div>
        ) : (
          <div style={styles.positionsGrid}>
            {data.positions.map(p => (
              <div key={p.symbol} style={styles.positionCard}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.symbolContainer}>
                    <span style={styles.symbolBadge}>{p.symbol}</span>
                    <span style={styles.symbolPrice}>{formatCurrency(p.avg_cost)}</span>
                  </div>
                  <div style={styles.quantityBadge}>
                    {p.total_qty_open} shares
                  </div>
                </div>

                {/* Card Stats */}
                <div style={styles.cardStats}>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Avg Cost</span>
                    <span style={styles.statItemValue}>{formatCurrency(p.avg_cost)}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Total Value</span>
                    <span style={styles.statItemValue}>
                      {formatCurrency(p.total_qty_open * (p.avg_cost || 0))}
                    </span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Open Lots</span>
                    <span style={styles.statItemValue}>{p.open_lots.length}</span>
                  </div>
                </div>

                {/* Lots Table */}
                <div style={styles.lotsSection}>
                  <h4 style={styles.lotsSectionTitle}>Lot Details</h4>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.th}>Lot ID</th>
                          <th style={styles.th}>Qty Open</th>
                          <th style={styles.th}>Price</th>
                          <th style={styles.th}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.open_lots.map(l => (
                          <tr key={l.lot_id} style={styles.tableRow}>
                            <td style={styles.lotIdCell}>
                              <span style={styles.lotIdBadge}>#{l.lot_id}</span>
                            </td>
                            <td style={styles.td}>{l.qty_open}</td>
                            <td style={styles.priceCell}>{formatCurrency(l.price)}</td>
                            <td style={styles.valueCell}>
                              {formatCurrency(l.qty_open * l.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
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
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 0.5rem 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '0 0 1.5rem 0',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'white',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '16px',
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
    background: 'white',
    borderRadius: '16px',
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
  positionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
    gap: '1.5rem',
  },
  positionCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f1f5f9',
  },
  symbolContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  symbolBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1.25rem',
    letterSpacing: '0.5px',
  },
  symbolPrice: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500',
  },
  quantityBadge: {
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    color: '#475569',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  cardStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statItemLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statItemValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  lotsSection: {
    marginTop: '1rem',
  },
  lotsSectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    color: '#475569',
    fontWeight: '500',
  },
  lotIdCell: {
    padding: '0.75rem 1rem',
  },
  lotIdBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: '#e0e7ff',
    color: '#4f46e5',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  priceCell: {
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  valueCell: {
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#10b981',
  },
};