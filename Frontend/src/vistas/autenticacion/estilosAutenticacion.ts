import type { CSSProperties } from 'react';

export const mainContainerStyle: CSSProperties = {
  position: 'relative',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const bgFixedStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    `radial-gradient(900px 500px at 20% 0%, rgba(34, 197, 94, 0.18), transparent 55%),
     radial-gradient(700px 420px at 100% 10%, rgba(15, 81, 54, 0.18), transparent 55%),
     linear-gradient(180deg, var(--bg-main), #ffffff)`,
};

export const bgBaseStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'opacity 0.8s ease-in-out',
};

export const wrapperStyle: CSSProperties = {
  position: 'relative',
  zIndex: 3,
  width: '100%',
  maxWidth: '520px',
  padding: '20px',
};

export const cardStyle: CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.62)',
  padding: '40px',
  borderRadius: '28px',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  boxSizing: 'border-box',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid rgba(255,255,255,0.10)',
};

export const h2Style: CSSProperties = {
  color: '#ffffff',
  marginBottom: '24px',
  fontSize: '1.8rem',
};

export const titleStyle: CSSProperties = {
  fontSize: '3.5rem',
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: '10px',
  fontFamily: 'var(--font-display)',
  letterSpacing: '0.02em',
};

export const subtitleStyle: CSSProperties = {
  color: '#cbd5e1',
  marginBottom: '30px',
};

export const formGridStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  width: '100%',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  backgroundColor: 'rgba(2, 6, 23, 0.35)',
  color: '#ffffff',
  boxSizing: 'border-box',
  fontSize: '1rem',
};

export const backButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  marginTop: '20px',
  textDecoration: 'underline',
  cursor: 'pointer',
};

export function buttonStyle(
  bgColor: string,
  color: string,
  border: string,
  width = '220px',
): CSSProperties {
  return {
    backgroundColor: bgColor,
    color,
    padding: '14px 0',
    width,
    borderRadius: '9999px',
    border,
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    boxShadow: 'var(--shadow-sm)',
  };
}
