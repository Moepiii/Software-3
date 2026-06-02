import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  fullWidth?: boolean;
}

export default function Button({ children, variant = 'primary', fullWidth = false, style, ...props }: ButtonProps) {
  
  let baseStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: 700,
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
    baseStyle = { ...baseStyle, backgroundColor: 'var(--primary-500)', color: '#052e1c', boxShadow: 'var(--shadow-sm)' };
  } else if (variant === 'dark') {
    baseStyle = { ...baseStyle, backgroundColor: 'var(--primary-900)', color: '#ffffff', boxShadow: 'var(--shadow-sm)' };
  } else if (variant === 'secondary') {
    baseStyle = { ...baseStyle, backgroundColor: 'var(--surface-2)', color: 'var(--text-main)', border: '1px solid var(--border-color)' };
  } else if (variant === 'outline') {
    baseStyle = { ...baseStyle, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' };
  }

  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  );
}
