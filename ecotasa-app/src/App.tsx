// src/App.tsx
import React, { useState, useEffect } from 'react';

type FormStep = 'LANDING' | 'CHOICE' | 'FORM_PERSONA' | 'FORM_EMPRESA' | 'LOGIN';

function App(): React.JSX.Element {
  const [step, setStep] = useState<FormStep>('LANDING');

  // 1. LISTA DE IMÁGENES DE FONDO
  const backgrounds = [
    '/bg1.png',
    '/bg2.png',
    '/bg3.png',
    '/bg4.png'
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // 2. EFECTO DE CARRUSEL (2 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) =>
        prevIndex === backgrounds.length - 1 ? 0 : prevIndex + 1
      );
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
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        margin: 0,
        padding: 0
      }}
    >

      {/* 3. IMÁGENES DE FONDO NÍTIDAS */}
      {backgrounds.map((bgUrl, index) => (
        <div
          key={bgUrl}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${bgUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1,
            opacity: index === currentBgIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out'
          }}
        />
      ))}

      {/* 4. CONTENEDOR PRINCIPAL */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >

        {/* =========================================================
            PANTALLA A: LANDING PAGE (Ahora con botones paralelos)
           ========================================================= */}
        {step === 'LANDING' && (
          // Le aplicamos un maxWidth un poco más ancho (650px) para que entren holgados los dos botones en horizontal
          <div style={{ ...cardStyle, maxWidth: '650px' }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              color: '#ffffff',
              letterSpacing: '0.025em'
            }}>
              EcoTasa RSU
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#cbd5e1',
              maxWidth: '500px',
              lineHeight: 1.5,
              margin: '0 0 40px 0'
            }}>
              Transformando tus residuos en un futuro sostenible para nuestra ciudad.
            </p>

            {/* Contenedor de botones cambiado a fila ('row') para ponerlos lado a lado */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '20px',
              justifyContent: 'center',
              width: '100%'
            }}>
              <button
                type="button"
                onClick={() => setStep('CHOICE')}
                style={buttonStyle('#4cdcc6', '#ffffff', 'none', '240px')}
              >
                Registrarse
              </button>
              <button
                type="button"
                onClick={() => setStep('LOGIN')}
                style={buttonStyle('transparent', '#ffffff', '2px solid #ffffff', '240px')}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA B: ELECCIÓN */}
        {step === 'CHOICE' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: '#ffffff' }}>¿Cómo deseas registrarte?</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '32px' }}>Selecciona el tipo de usuario que mejor te describa.</p>
            <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', width: '100%' }}>
              <button type="button" onClick={() => setStep('FORM_PERSONA')} style={buttonStyle('#4cdcc6', '#ffffff', 'none', '100%')}>
                Soy una Persona
              </button>
              <button type="button" onClick={() => setStep('FORM_EMPRESA')} style={buttonStyle('#3bc4af', '#ffffff', 'none', '100%')}>
                Soy una Empresa
              </button>
            </div>
            <button onClick={handleBack} style={backButtonStyle}>← Volver</button>
          </div>
        )}

        {/* PANTALLA C: FORMULARIO PERSONA */}
        {step === 'FORM_PERSONA' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#ffffff' }}>Registro de Persona</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>Ingresa tus datos personales.</p>
            <form style={formGridStyle} onSubmit={handleRegisterSubmit}>
              <input type="text" placeholder="Nombres" required style={inputStyle} />
              <input type="text" placeholder="Apellidos" required style={inputStyle} />
              <input type="text" placeholder="Cédula de Identidad" required style={inputStyle} />
              <input type="email" placeholder="Correo Electrónico" required style={inputStyle} />
              <input type="password" placeholder="Contraseña" required style={inputStyle} />
              <input type="password" placeholder="Confirmar Contraseña" required style={inputStyle} />
              <div style={{ marginTop: '16px' }}>
                <button type="submit" style={buttonStyle('#4cdcc6', '#ffffff', 'none', '100%')}>
                  Completar Registro
                </button>
              </div>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver</button>
          </div>
        )}

        {/* PANTALLA D: FORMULARIO EMPRESA */}
        {step === 'FORM_EMPRESA' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#ffffff' }}>Registro de Empresa</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>Información de la entidad fiscal.</p>
            <form style={formGridStyle} onSubmit={handleRegisterSubmit}>
              <input type="text" placeholder="Nombre de la empresa" required style={inputStyle} />
              <input type="text" placeholder="RIF Jurídico" required style={inputStyle} />
              <input type="email" placeholder="Correo Corporativo" required style={inputStyle} />
              <input type="password" placeholder="Contraseña" required style={inputStyle} />
              <input type="password" placeholder="Confirmar Contraseña" required style={inputStyle} />
              <div style={{ marginTop: '16px' }}>
                <button type="submit" style={buttonStyle('#3bc4af', '#ffffff', 'none', '100%')}>
                  Registrar Empresa
                </button>
              </div>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver</button>
          </div>
        )}

        {/* PANTALLA E: LOGIN */}
        {step === 'LOGIN' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#ffffff' }}>Iniciar Sesión</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>Accede al sistema con tus credenciales.</p>
            <form style={formGridStyle} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Correo Electrónico" required style={inputStyle} />
              <input type="password" placeholder="Contraseña" required style={inputStyle} />
              <div style={{ marginTop: '16px' }}>
                <button type="submit" style={buttonStyle('#4cdcc6', '#ffffff', 'none', '100%')}>
                  Entrar
                </button>
              </div>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver al Inicio</button>
          </div>
        )}

      </div>
    </main>
  );
}

// =========================================================
// OBJETOS DE ESTILOS ACTUALIZADOS
// =========================================================

const cardStyle: React.CSSProperties = {
  // Ajustamos el canal alfa a 0.65 para que sea un poco más transparente
  backgroundColor: 'rgba(30, 41, 59, 0.65)',
  padding: '50px 40px',
  borderRadius: '28px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(12px)',
  width: '100%',
  maxWidth: '520px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
};

const formGridStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', fontSize: '1rem', outline: 'none' };
const buttonStyle = (bgColor: string, color: string, border: string, width = '240px') => ({ backgroundColor: bgColor, color: color, fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase' as any, letterSpacing: '0.05em', padding: '16px 0', width: width, borderRadius: '9999px', border: border, cursor: 'pointer', transition: 'transform 0.2s' });
const backButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', marginTop: '24px', textDecoration: 'underline' };

export default App;