// pages/trade.js
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function Trade() {
  const [symbol, setSymbol] = useState('AAPL');
  const [side, setSide] = useState('BUY');
  const [qty, setQty] = useState(100);
  const [price, setPrice] = useState(150);
  const [time, setTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

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
      if (!res.ok) throw new Error(data.error || 'Error submitting trade');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSymbol('AAPL');
    setSide('BUY');
    setQty(100);
    setPrice(150);
    setTime(new Date().toISOString().slice(0, 16));
    setResult(null);
    setError(null);
  };

  const calculateTotal = () => {
    return (Number(qty) * Number(price)).toFixed(2);
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Trade Execution</h2>
            <p style={styles.subtitle}>Execute buy or sell orders</p>
          </div>
          <div style={styles.tradeSummary}>
            <span style={styles.summaryLabel}>Estimated Total</span>
            <span style={styles.summaryValue}>${calculateTotal()}</span>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.formCard}>
            <form onSubmit={submit} style={styles.form}>
              {/* Symbol Input */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Symbol
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  style={styles.input}
                  placeholder="e.g., AAPL, TSLA"
                  required
                />
              </div>

              {/* Side Selection */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Side
                  <span style={styles.required}>*</span>
                </label>
                <div style={styles.sideButtons}>
                  <button
                    type="button"
                    onClick={() => setSide('BUY')}
                    style={{
                      ...styles.sideButton,
                      ...(side === 'BUY' ? styles.sideButtonBuyActive : styles.sideButtonInactive)
                    }}
                  >
                    🟢 BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('SELL')}
                    style={{
                      ...styles.sideButton,
                      ...(side === 'SELL' ? styles.sideButtonSellActive : styles.sideButtonInactive)
                    }}
                  >
                    🔴 SELL
                  </button>
                </div>
              </div>

              {/* Quantity & Price Row */}
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>
                    Quantity
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    style={styles.input}
                    min="1"
                    required
                  />
                </div>

                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>
                    Price ($)
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    style={styles.input}
                    min="0.000001"
                    required
                  />
                </div>
              </div>

              {/* Time Input */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Execution Time
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.submitButton,
                    ...(loading ? styles.submitButtonDisabled : {}),
                    background: side === 'BUY'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  }}
                >
                  {loading ? (
                    <>
                      <span style={styles.buttonSpinner}></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {side === 'BUY' ? '📈' : '📉'} Execute {side} Order
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.resetButton}
                  disabled={loading}
                >
                  🔄 Reset
                </button>
              </div>
            </form>
          </div>

          {/* Result/Error Display */}
          {result && (
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.resultIcon}>✅</span>
                <h3 style={styles.resultTitle}>Trade Executed Successfully</h3>
              </div>
              <div style={styles.resultContent}>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Trade ID:</span>
                  <span style={styles.resultValue}>{result.trade_id || 'N/A'}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Symbol:</span>
                  <span style={styles.resultValue}>{symbol}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Quantity:</span>
                  <span style={styles.resultValue}>{qty} shares</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Price:</span>
                  <span style={styles.resultValue}>${price}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Total:</span>
                  <span style={styles.resultValueBold}>${calculateTotal()}</span>
                </div>
              </div>
              <details style={styles.detailsSection}>
                <summary style={styles.detailsSummary}>View Raw Response</summary>
                <pre style={styles.jsonPre}>{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          )}

          {error && (
            <div style={styles.errorCard}>
              <div style={styles.errorHeader}>
                <span style={styles.errorIcon}>⚠️</span>
                <h3 style={styles.errorTitle}>Error</h3>
              </div>
              <p style={styles.errorMessage}>{error}</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
    maxWidth: '800px',
    margin: '0 auto',
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
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 0.5rem 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  tradeSummary: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem',
  },
  summaryValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'white',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  required: {
    color: '#ef4444',
    marginLeft: '0.25rem',
  },
  input: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  sideButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  sideButton: {
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    border: '2px solid',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sideButtonBuyActive: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderColor: '#059669',
    color: 'white',
  },
  sideButtonSellActive: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    borderColor: '#dc2626',
    color: 'white',
  },
  sideButtonInactive: {
    background: 'white',
    borderColor: '#e2e8f0',
    color: '#64748b',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  submitButton: {
    flex: 1,
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  resetButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  resultCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '2px solid #10b981',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  resultIcon: {
    fontSize: '2rem',
  },
  resultTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  resultContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  resultLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: '0.9rem',
    color: '#1e293b',
    fontWeight: '600',
  },
  resultValueBold: {
    fontSize: '1.1rem',
    color: '#10b981',
    fontWeight: '700',
  },
  detailsSection: {
    marginTop: '1rem',
  },
  detailsSummary: {
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  jsonPre: {
    background: '#1e293b',
    color: '#10b981',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    overflow: 'auto',
    maxHeight: '300px',
  },
  errorCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '2px solid #ef4444',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  errorIcon: {
    fontSize: '2rem',
  },
  errorTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ef4444',
    margin: 0,
  },
  errorMessage: {
    color: '#64748b',
    fontSize: '1rem',
    margin: 0,
  },
};