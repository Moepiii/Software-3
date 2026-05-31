import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  fullWidth?: boolean;
}

export default function Button({ children, variant = 'primary', fullWidth = false, style, ...props }: ButtonProps) {
  
  let baseStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: fullWidth ? '100%' : 'auto',
    ...style
  };

  if (variant === 'primary') {
    baseStyle = { ...baseStyle, backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)' };
  } else if (variant === 'dark') {
    baseStyle = { ...baseStyle, backgroundColor: 'var(--primary-dark)', color: '#ffffff' };
  } else if (variant === 'secondary') {
    baseStyle = { ...baseStyle, backgroundColor: '#e2e8f0', color: 'var(--text-main)' };
  } else if (variant === 'outline') {
    baseStyle = { ...baseStyle, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' };
  }

  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  );
}
