// src/App.tsx
import React, { useState, useEffect } from 'react';

type FormStep = 'LANDING' | 'CHOICE' | 'FORM_PERSONA' | 'FORM_EMPRESA' | 'LOGIN';

function App(): React.JSX.Element {
  const [step, setStep] = useState<FormStep>('LANDING');

  const backgrounds = ['/bg1.png', '/bg2.png', '/bg3.png', '/bg4.png'];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev === backgrounds.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('LOGIN');
  };

  const handleBack = () => {
    if (step === 'CHOICE' || step === 'LOGIN') setStep('LANDING');
    if (step === 'FORM_PERSONA' || step === 'FORM_EMPRESA') setStep('CHOICE');
  };

  return (
    <main style={mainContainerStyle}>
      {backgrounds.map((bgUrl, index) => (
        <div key={bgUrl} style={{
          ...bgBaseStyle,
          backgroundImage: `url('${bgUrl}')`,
          opacity: index === currentBgIndex ? 1 : 0
        }} />
      ))}

      <div style={wrapperStyle}>

        {/* LANDING */}
        {step === 'LANDING' && (
          <div style={cardStyle}>
            <h1 style={titleStyle}><span style={{ color: '#10b981' }}>Eco</span>Logic</h1>
            <p style={subtitleStyle}>Transformando tus residuos en un futuro sostenible para nuestra ciudad.</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', width: '100%' }}>
              <button onClick={() => setStep('CHOICE')} style={buttonStyle('#10b981', '#ffffff', 'none')}>Registrarse</button>
              <button onClick={() => setStep('LOGIN')} style={buttonStyle('transparent', '#ffffff', '2px solid #ffffff')}>Iniciar Sesión</button>
            </div>
          </div>
        )}

        {/* CHOICE */}
        {step === 'CHOICE' && (
          <div style={cardStyle}>
            <h2 style={h2Style}>¿Cómo deseas registrarte?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <button onClick={() => setStep('FORM_PERSONA')} style={buttonStyle('#10b981', '#ffffff', 'none', '100%')}>Soy una Persona</button>
              <button onClick={() => setStep('FORM_EMPRESA')} style={buttonStyle('#10b981', '#ffffff', 'none', '100%')}>Soy una Empresa</button>
            </div>
            <button onClick={handleBack} style={backButtonStyle}>← Volver</button>
          </div>
        )}

        {/* FORMULARIOS (Persona y Empresa) */}
        {(step === 'FORM_PERSONA' || step === 'FORM_EMPRESA') && (
          <div style={cardStyle}>
            <h2 style={h2Style}>{step === 'FORM_PERSONA' ? 'Registro de Persona' : 'Registro de Empresa'}</h2>
            <form style={formGridStyle} onSubmit={handleRegisterSubmit}>
              <input type="text" placeholder={step === 'FORM_PERSONA' ? "Nombres" : "Nombre de la empresa"} required style={inputStyle} />
              <input type="text" placeholder={step === 'FORM_PERSONA' ? "Apellidos" : "RIF Jurídico"} required style={inputStyle} />
              <input type="email" placeholder="Correo Electrónico" required style={inputStyle} />
              <input type="password" placeholder="Contraseña" required style={inputStyle} />
              <input type="password" placeholder="Confirmar Contraseña" required style={inputStyle} />
              <button type="submit" style={buttonStyle('#10b981', '#ffffff', 'none', '100%')}>
                {step === 'FORM_PERSONA' ? 'Completar Registro' : 'Registrar Empresa'}
              </button>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver</button>
          </div>
        )}

        {/* LOGIN */}
        {step === 'LOGIN' && (
          <div style={cardStyle}>
            <h2 style={h2Style}>Iniciar Sesión</h2>
            <form style={formGridStyle} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Correo Electrónico" required style={inputStyle} />
              <input type="password" placeholder="Contraseña" required style={inputStyle} />
              <button type="submit" style={buttonStyle('#10b981', '#ffffff', 'none', '100%')}>Entrar</button>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver al Inicio</button>
          </div>
        )}
      </div>
    </main>
  );
}

// --- ESTILOS OPTIMIZADOS ---

const mainContainerStyle: React.CSSProperties = { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const bgBaseStyle: React.CSSProperties = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 0.8s ease-in-out' };
const wrapperStyle: React.CSSProperties = { position: 'relative', zIndex: 3, width: '100%', maxWidth: '520px', padding: '20px' };

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(30, 41, 59, 0.65)',
  padding: '40px',
  borderRadius: '28px',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  boxSizing: 'border-box' // Esto es clave para la simetría
};

const h2Style: React.CSSProperties = { color: '#ffffff', marginBottom: '24px', fontSize: '1.8rem' };
const titleStyle: React.CSSProperties = { fontSize: '3.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '10px' };
const subtitleStyle: React.CSSProperties = { color: '#cbd5e1', marginBottom: '30px' };

const formGridStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' };
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  color: '#ffffff',
  boxSizing: 'border-box', // Mantiene los inputs simétricos
  fontSize: '1rem'
};

const buttonStyle = (bgColor: string, color: string, border: string, width = '220px') => ({
  backgroundColor: bgColor,
  color: color,
  padding: '14px 0',
  width: width,
  borderRadius: '9999px',
  border: border,
  fontWeight: 'bold',
  cursor: 'pointer',
  textTransform: 'uppercase' as any
});

const backButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', textDecoration: 'underline', cursor: 'pointer' };

export default App;