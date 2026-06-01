import { cardStyle, titleStyle, subtitleStyle, buttonStyle } from './authStyles';

interface LandingViewProps {
  onRegister: () => void;
  onLogin: () => void;
}

export function LandingView({ onRegister, onLogin }: LandingViewProps) {
  return (
    <div style={cardStyle}>
      <h1 style={titleStyle}>
        <span style={{ color: '#10b981' }}>Eco</span>Logic
      </h1>
      <p style={subtitleStyle}>
        Transformando tus residuos en un futuro sostenible para nuestra ciudad.
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', width: '100%' }}>
        <button onClick={onRegister} style={buttonStyle('#10b981', '#ffffff', 'none')}>
          Registrarse
        </button>
        <button onClick={onLogin} style={buttonStyle('transparent', '#ffffff', '2px solid #ffffff')}>
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
