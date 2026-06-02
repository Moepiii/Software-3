import type { CSSProperties } from 'react';

export const mainContainerStyle: CSSProperties = {
  position: 'relative',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0f172a', // Mismo color que el modo oscuro
};

export const wrapperStyle: CSSProperties = {
  position: 'relative',
  zIndex: 3,
  width: '100%',
  maxWidth: '520px',
  padding: '20px',
};

export const cardStyle: CSSProperties = {
  backgroundColor: 'rgba(30, 41, 59, 0.95)', // Fondo de la tarjeta ligeramente más claro
  padding: '40px',
  borderRadius: '28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  boxSizing: 'border-box',
  boxShadow: '0 20px 35px rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export const h2Style: CSSProperties = {
  color: '#ffffff',
  marginBottom: '24px',
  fontSize: '1.8rem',
};

export const titleStyle: CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: '10px',
  fontFamily: 'var(--font-display)',
  letterSpacing: '0.02em',
};

export const subtitleStyle: CSSProperties = {
  color: '#94a3b8',
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
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  color: '#ffffff',
  boxSizing: 'border-box',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.2s',
};

export const backButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  marginTop: '20px',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'color 0.2s',
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
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    transition: 'all 0.2s',
  };
}