// src/App.tsx
import React, { useState, useEffect } from 'react';
import LobbyPersona from './components/LobbyPersona';
import LobbyEmpresa from './components/LobbyEmpresa';
import Admin from './components/Admin';

type FormStep = 'LANDING' | 'CHOICE' | 'FORM_PERSONA' | 'FORM_EMPRESA' | 'LOGIN';

type User = {
  nombres?: string;
  apellidos?: string;
  nombre_empresa?: string;
  userType: 'persona' | 'empresa';
  id: string;
  email: string;
} | null;

function App(): React.JSX.Element {
  const [step, setStep] = useState<FormStep>('LANDING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para formularios
  const [cedula, setCedula] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rif, setRif] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');

  // Mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fondo rotatorio
  const backgrounds = ['/bg1.png', '/bg2.png', '/bg3.png', '/bg4.png'];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev === backgrounds.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleBack = () => {
    setErrorMsg('');
    if (step === 'CHOICE' || step === 'LOGIN') setStep('LANDING');
    if (step === 'FORM_PERSONA' || step === 'FORM_EMPRESA') setStep('CHOICE');
  };

  const handleRegisterPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await fetch('/api/register/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, email, password, nombres, apellidos }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error en el registro');
        return;
      }
      setStep('LOGIN');
      setCedula(''); setNombres(''); setApellidos(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor');
    }
  };

  const handleRegisterEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await fetch('/api/register/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rif, email, password, nombre_empresa: nombreEmpresa }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error en el registro');
        return;
      }
      setStep('LOGIN');
      setRif(''); setNombreEmpresa(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Credenciales inválidas');
        return;
      }
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setStep('LANDING');
    setEmail('');
    setPassword('');
  };

  // --- MODIFICACIÓN DE PAGINA TOTALMENTE LIMPIA AL ENTRAR ---
  if (isAuthenticated && user) {
    if (user.email.endsWith('@admin.com')) {
      return <Admin onLogout={handleLogout} />;
    }
    if (user.userType === 'persona') {
      return <LobbyPersona onLogout={handleLogout} />;
    }
    return <LobbyEmpresa onLogout={handleLogout} />;
  }

  return (
    <main style={mainContainerStyle}>
      {backgrounds.map((bgUrl, index) => (
        <div key={bgUrl} style={{ ...bgBaseStyle, backgroundImage: `url('${bgUrl}')`, opacity: index === currentBgIndex ? 1 : 0 }} />
      ))}
      <div style={wrapperStyle}>
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

        {step === 'FORM_PERSONA' && (
          <div style={cardStyle}>
            <h2 style={h2Style}>Registro de Persona</h2>
            <form style={formGridStyle} onSubmit={handleRegisterPersona}>
              <input type="text" placeholder="Cédula" required value={cedula} onChange={e => setCedula(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Nombres" required value={nombres} onChange={e => setNombres(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Apellidos" required value={apellidos} onChange={e => setApellidos(e.target.value)} style={inputStyle} />
              <input type="email" placeholder="Correo Electrónico" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />

              <div style={{ position: 'relative', width: '100%' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyleWithIcon} />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={eyeButtonStyle} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? (
                    // eye with slash
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.1-2.36 2.9-4.25 5.25-5.41"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    // eye
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirmar Contraseña" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyleWithIcon} />
                <button type="button" onClick={() => setShowConfirmPassword(s => !s)} style={eyeButtonStyle} aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.1-2.36 2.9-4.25 5.25-5.41"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              {errorMsg && <p style={{ color: '#f87171', margin: '0' }}>{errorMsg}</p>}
              <button type="submit" style={buttonStyle('#10b981', '#ffffff', 'none', '100%')}>Completar Registro</button>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver</button>
          </div>
        )}

        {step === 'FORM_EMPRESA' && (
          <div style={cardStyle}>
            <h2 style={h2Style}>Registro de Empresa</h2>
            <form style={formGridStyle} onSubmit={handleRegisterEmpresa}>
              <input type="text" placeholder="RIF" required value={rif} onChange={e => setRif(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Nombre de la empresa" required value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} style={inputStyle} />
              <input type="email" placeholder="Correo Electrónico" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />

              <div style={{ position: 'relative', width: '100%' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyleWithIcon} />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={eyeButtonStyle} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.1-2.36 2.9-4.25 5.25-5.41"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirmar Contraseña" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyleWithIcon} />
                <button type="button" onClick={() => setShowConfirmPassword(s => !s)} style={eyeButtonStyle} aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.1-2.36 2.9-4.25 5.25-5.41"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              {errorMsg && <p style={{ color: '#f87171', margin: '0' }}>{errorMsg}</p>}
              <button type="submit" style={buttonStyle('#10b981', '#ffffff', 'none', '100%')}>Registrar Empresa</button>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver</button>
          </div>
        )}

        {step === 'LOGIN' && (
          <div style={cardStyle}>
            <h2 style={h2Style}>Iniciar Sesión</h2>
            <form style={formGridStyle} onSubmit={handleLogin}>
              <input type="email" placeholder="Correo Electrónico" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />

              <div style={{ position: 'relative', width: '100%' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyleWithIcon} />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={eyeButtonStyle} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7 1.1-2.36 2.9-4.25 5.25-5.41"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              {errorMsg && <p style={{ color: '#f87171', margin: '0' }}>{errorMsg}</p>}
              <button type="submit" style={buttonStyle('#10b981', '#ffffff', 'none', '100%')}>Entrar</button>
            </form>
            <button onClick={handleBack} style={backButtonStyle}>← Volver al Inicio</button>
          </div>
        )}
      </div>
    </main>
  );
}

const mainContainerStyle: React.CSSProperties = { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const bgBaseStyle: React.CSSProperties = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 0.8s ease-in-out' };
const wrapperStyle: React.CSSProperties = { position: 'relative', zIndex: 3, width: '100%', maxWidth: '520px', padding: '20px' };
const cardStyle: React.CSSProperties = { backgroundColor: 'rgba(30, 41, 59, 0.65)', padding: '40px', borderRadius: '28px', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', boxSizing: 'border-box' };
const h2Style: React.CSSProperties = { color: '#ffffff', marginBottom: '24px', fontSize: '1.8rem' };
const titleStyle: React.CSSProperties = { fontSize: '3.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '10px' };
const subtitleStyle: React.CSSProperties = { color: '#cbd5e1', marginBottom: '30px' };
const formGridStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.5)', color: '#ffffff', boxSizing: 'border-box', fontSize: '1rem' };
const inputStyleWithIcon: React.CSSProperties = { ...inputStyle, paddingRight: '44px' } as React.CSSProperties;
const eyeButtonStyle: React.CSSProperties = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 };
const buttonStyle = (bgColor: string, color: string, border: string, width = '220px') => ({ backgroundColor: bgColor, color: color, padding: '14px 0', width: width, borderRadius: '9999px', border: border, fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' as any });
const backButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', textDecoration: 'underline', cursor: 'pointer' };

export default App;