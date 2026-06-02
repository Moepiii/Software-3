import type { FormEvent } from 'react';
import { PasswordInput } from '../../shared/PasswordInput';
import { cardStyle, h2Style, formGridStyle, inputStyle, buttonStyle, backButtonStyle } from './authStyles';

interface LoginViewProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  errorMsg: string;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
}

export function LoginView({
  email, setEmail,
  password, setPassword,
  showPassword, onTogglePassword,
  errorMsg,
  onSubmit,
  onBack,
}: LoginViewProps) {
  return (
    <div style={cardStyle}>
      <h2 style={h2Style}>Iniciar Sesión</h2>
      <form style={formGridStyle} onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Correo Electrónico"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
          show={showPassword}
          onToggle={onTogglePassword}
        />
        {errorMsg && <p style={{ color: '#f87171', margin: '0' }}>{errorMsg}</p>}
        <button type="submit" style={buttonStyle('var(--primary-500)', '#052e1c', 'none', '100%')}>
          Entrar
        </button>
      </form>
      <button onClick={onBack} style={backButtonStyle}>← Volver al Inicio</button>
    </div>
  );
}
