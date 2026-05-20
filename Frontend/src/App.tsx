// src/App.tsx
import React, { useState, useEffect } from 'react';

type FormStep = 'LANDING' | 'CHOICE' | 'FORM_PERSONA' | 'FORM_EMPRESA' | 'LOGIN';
type User = { nombres?: string; apellidos?: string; nombre_empresa?: string; userType: 'persona' | 'empresa'; id: string } | null;

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

  // Fondo rotatorio (sin cambios)
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
      // Registro exitoso -> ir a login
      setStep('LOGIN');
      // Limpiar campos
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
      // Registro exitoso -> ir a login
      setStep('LOGIN');
      // Limpiar campos
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
      // Guardar token en localStorage (o contexto)
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setStep('LANDING'); // opcional, pero mejor mostrar bienvenida directa
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

  // Si está autenticado, mostrar pantalla de bienvenida
  if (isAuthenticated && user) {
    let displayName = '';
    if (user.userType === 'persona') {
      displayName = `${user.nombres} ${user.apellidos}`;
    } else {
      displayName = user.nombre_empresa || 'Empresa';
    }
    return (
      <main style={mainContainerStyle}>
        {backgrounds.map((bgUrl, index) => (
          <div key={bgUrl} style={{ ...bgBaseStyle, backgroundImage: `url('${bgUrl}')`, opacity: index === currentBgIndex ? 1 : 0 }} />
        ))}
        <div style={wrapperStyle}>
          <div style={cardStyle}>
            <h1 style={titleStyle}>Bienvenido, {displayName}</h1>
            <p style={subtitleStyle}>Has iniciado sesión correctamente.</p>
            <button onClick={handleLogout} style={buttonStyle('#ef4444', '#ffffff', 'none')}>Cerrar sesión</button>
          </div>
        </div>
      </main>
    );
  }

  // Renderizado normal de los pasos (sin cambios, solo agregamos errorMsg en cada formulario)
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
              <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Confirmar Contraseña" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
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
              <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Confirmar Contraseña" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
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
              <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
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

// Estilos (igual que antes)
const mainContainerStyle: React.CSSProperties = { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const bgBaseStyle: React.CSSProperties = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 0.8s ease-in-out' };
const wrapperStyle: React.CSSProperties = { position: 'relative', zIndex: 3, width: '100%', maxWidth: '520px', padding: '20px' };
const cardStyle: React.CSSProperties = { backgroundColor: 'rgba(30, 41, 59, 0.65)', padding: '40px', borderRadius: '28px', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', boxSizing: 'border-box' };
const h2Style: React.CSSProperties = { color: '#ffffff', marginBottom: '24px', fontSize: '1.8rem' };
const titleStyle: React.CSSProperties = { fontSize: '3.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '10px' };
const subtitleStyle: React.CSSProperties = { color: '#cbd5e1', marginBottom: '30px' };
const formGridStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.5)', color: '#ffffff', boxSizing: 'border-box', fontSize: '1rem' };
const buttonStyle = (bgColor: string, color: string, border: string, width = '220px') => ({ backgroundColor: bgColor, color: color, padding: '14px 0', width: width, borderRadius: '9999px', border: border, fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' as any });
const backButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', textDecoration: 'underline', cursor: 'pointer' };

export default App;