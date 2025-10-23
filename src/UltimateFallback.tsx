import React from 'react';

// ULTIMATE FALLBACK - Questo componente GARANTISCE che non ci sarà mai una schermata bianca
const UltimateFallback: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white',
          fontWeight: 'bold'
        }}>
          TC
        </div>
        
        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '16px',
          margin: '0 0 16px 0'
        }}>
          TourCompanion
        </h1>
        
        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          marginBottom: '32px',
          lineHeight: '1.5',
          margin: '0 0 32px 0'
        }}>
          Professional Virtual Tour Dashboard
        </p>
        
        {/* Loading indicator */}
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px'
        }}></div>
        
        {/* Status message */}
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '24px',
          margin: '0 0 24px 0'
        }}>
          Loading your dashboard...
        </p>
        
        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            Refresh Page
          </button>
          
          <button
            onClick={() => window.location.href = '/auth'}
            style={{
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#3b82f6';
            }}
          >
            Go to Login
          </button>
        </div>
        
        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details style={{
            marginTop: '24px',
            textAlign: 'left',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
              Debug Info
            </summary>
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '12px',
              borderRadius: '6px',
              fontFamily: 'monospace'
            }}>
              <div>URL: {window.location.href}</div>
              <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
              <div>Timestamp: {new Date().toISOString()}</div>
              <div>React Version: {React.version}</div>
            </div>
          </details>
        )}
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UltimateFallback;
