import type { CSSProperties } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  show: boolean;
  onToggle: () => void;
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  paddingRight: '44px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  color: '#ffffff',
  boxSizing: 'border-box',
  fontSize: '1rem',
};

const eyeButtonStyle: CSSProperties = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

export function PasswordInput({ value, onChange, placeholder, show, onToggle }: PasswordInputProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
      />
      <button
        type="button"
        onClick={onToggle}
        style={eyeButtonStyle}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.1-2.36 2.9-4.25 5.25-5.41" />
            <path d="M1 1l22 22" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
