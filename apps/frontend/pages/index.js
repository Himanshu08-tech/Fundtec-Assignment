// pages/index.js
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  const features = [
    {
      title: 'Trade Execution',
      description: 'Execute buy and sell orders with real-time processing',
      icon: '📈',
      href: '/trade',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stats: 'Execute Orders',
    },
    {
      title: 'Open Positions',
      description: 'View and manage your active portfolio positions',
      icon: '💼',
      href: '/positions',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      stats: 'Track Holdings',
    },
    {
      title: 'Realized P&L',
      description: 'Monitor your closed positions and profit/loss history',
      icon: '📊',
      href: '/pnl',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      stats: 'View Performance',
    },
  ];

  const quickStats = [
    { label: 'Portfolio Tracking', value: 'Lot-wise', icon: '🎯' },
    { label: 'Real-time Updates', value: 'Live', icon: '⚡' },
    { label: 'FIFO Matching', value: 'Automated', icon: '🔄' },
  ];

  return (
    <>
      <Head>
        <title>Lotwise Portfolio Tracker - Professional Trading Dashboard</title>
        <meta name="description" content="Track your portfolio with lot-wise precision and real-time P&L calculations" />
      </Head>

      <main style={styles.main}>
        <div style={styles.container}>
          {/* Hero Section */}
          <div style={styles.hero}>
            <div style={styles.heroContent}>
              <h1 style={styles.title}>
                <span style={styles.titleIcon}>📊</span>
                Lotwise Portfolio Tracker
              </h1>
              <p style={styles.subtitle}>
                Professional lot-wise position tracking with real-time P&L calculations and FIFO matching
              </p>
            </div>
            
            {/* Quick Stats */}
            <div style={styles.quickStats}>
              {quickStats.map((stat, idx) => (
                <div key={idx} style={styles.statCard}>
                  <span style={styles.statIcon}>{stat.icon}</span>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>{stat.label}</span>
                    <span style={styles.statValue}>{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Feature Cards */}
          <div style={styles.featuresGrid}>
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href} style={{ textDecoration: 'none' }}>
                <div style={styles.featureCard}>
                  <div style={{
                    ...styles.featureIconWrapper,
                    background: feature.gradient,
                  }}>
                    <span style={styles.featureIcon}>{feature.icon}</span>
                  </div>
                  
                  <div style={styles.featureContent}>
                    <h3 style={styles.featureTitle}>{feature.title}</h3>
                    <p style={styles.featureDescription}>{feature.description}</p>
                    
                    <div style={styles.featureFooter}>
                      <span style={{
                        ...styles.featureBadge,
                        background: feature.gradient,
                      }}>
                        {feature.stats}
                      </span>
                      <span style={styles.featureArrow}>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <div style={styles.infoSection}>
            <h2 style={styles.infoTitle}>How It Works</h2>
            <div style={styles.stepsGrid}>
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>1</div>
                <h4 style={styles.stepTitle}>Execute Trades</h4>
                <p style={styles.stepDescription}>
                  Submit buy and sell orders with timestamp precision
                </p>
              </div>
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>2</div>
                <h4 style={styles.stepTitle}>Track Positions</h4>
                <p style={styles.stepDescription}>
                  Monitor lot-wise positions with real-time updates
                </p>
              </div>
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>3</div>
                <h4 style={styles.stepTitle}>Analyze P&L</h4>
                <p style={styles.stepDescription}>
                  View realized profits using FIFO matching algorithm
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Built with precision for professional portfolio management
            </p>
          </div>
        </div>

        <style jsx>{`
          a:hover > div {
            transform: translateY(-8px);
            box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.2);
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </main>
    </>
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
  hero: {
    marginBottom: '3rem',
  },
  heroContent: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 1rem 0',
    textShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  titleIcon: {
    fontSize: '3rem',
    animation: 'float 3s ease-in-out infinite',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.95)',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statIcon: {
    fontSize: '2.5rem',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'white',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  featureCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  featureIconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  featureIcon: {
    fontSize: '2.5rem',
  },
  featureContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.75rem 0',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.6',
    margin: '0 0 1.5rem 0',
    flex: 1,
  },
  featureFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  featureArrow: {
    fontSize: '1.5rem',
    color: '#cbd5e1',
    fontWeight: '700',
  },
  infoSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '3rem 2rem',
    marginBottom: '2rem',
  },
  infoTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  stepCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
  },
  stepNumber: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto',
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.75rem 0',
  },
  stepDescription: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    padding: '2rem 0',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.95rem',
    margin: 0,
  },
};