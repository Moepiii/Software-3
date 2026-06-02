import React from 'react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={logoStyle}>EcoTax</div>
          <nav style={navStyle}>
            <a href="#" style={navLinkStyle}>How It Works</a>
            <a href="#" style={navLinkStyle}>Impact</a>
            <a href="#" style={navLinkStyle}>Regulations</a>
            <a href="#" style={navLinkStyle}>Contact</a>
          </nav>
          {onLogout ? (
            <button onClick={onLogout} style={logoutBtnStyle}>
              Logout
            </button>
          ) : (
             <div style={{ width: '80px' }}></div>
          )}
        </div>
      </header>

      <main style={mainStyle}>
        <div style={mainContentStyle}>
          {children}
        </div>
      </main>

      <footer style={footerStyle}>
        <div style={footerContentStyle}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EcoTax</div>
          <div style={footerLinksStyle}>
            <a href="#" style={footerLinkStyle}>Privacy Policy</a>
            <a href="#" style={footerLinkStyle}>Terms of Service</a>
            <a href="#" style={footerLinkStyle}>Annual Reports</a>
            <a href="#" style={footerLinkStyle}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100vw',
  overflowX: 'hidden'
};

const headerStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  borderBottom: '1px solid var(--border-color)',
  padding: '1rem 2rem',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backdropFilter: 'blur(10px)',
};

const headerContentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'var(--primary-900)',
  fontFamily: 'var(--font-display)',
  letterSpacing: '0.02em',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '2rem',
};

const navLinkStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  transition: 'color 0.2s',
};

const logoutBtnStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary-900)',
  color: '#ffffff',
  border: 'none',
  padding: '0.5rem 1.5rem',
  borderRadius: '9999px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  boxShadow: 'var(--shadow-sm)',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: '2rem',
};

const mainContentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%'
};

const footerStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary-900)',
  color: '#ffffff',
  padding: '2rem',
  marginTop: 'auto'
};

const footerContentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end'
};

const footerLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
};

const footerLinkStyle: React.CSSProperties = {
  color: '#d1d5db',
  textDecoration: 'none',
  fontSize: '0.9rem',
};
