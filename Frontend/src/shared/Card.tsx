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
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    ...style
  };

  if (variant === 'default') {
    cardStyle = { ...cardStyle, backgroundColor: '#ffffff', border: '1px solid var(--border-color)' };
  } else if (variant === 'highlight') {
    cardStyle = { ...cardStyle, backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' };
  } else if (variant === 'dark') {
    cardStyle = { ...cardStyle, backgroundColor: 'var(--primary-dark)', color: '#ffffff' };
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
