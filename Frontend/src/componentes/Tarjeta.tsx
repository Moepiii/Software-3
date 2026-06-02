import React from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'highlight' | 'dark';
}

export default function Card({ children, title, className = '', style = {}, variant = 'default' }: CardProps) {
  let cardStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    ...style
  };

  if (variant === 'default') {
    cardStyle = { ...cardStyle, backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)' };
  } else if (variant === 'highlight') {
    cardStyle = { ...cardStyle, backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' };
  } else if (variant === 'dark') {
    cardStyle = { ...cardStyle, backgroundColor: 'var(--primary-900)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.08)' };
  }

  return (
    <div style={cardStyle} className={className}>
      {title && (
        <h3 style={{ 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          color: variant === 'dark' ? '#cbd5e1' : 'var(--text-muted)', 
          marginBottom: '1rem',
          fontWeight: 600
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
