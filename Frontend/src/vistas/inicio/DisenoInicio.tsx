import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import logo from '../../assets/logo.png';
// Importa tus imágenes de redes sociales
import Footer from '../../componentes/Footer';

interface DisenoInicioProps {
  children: ReactNode;
  onRegister?: () => void;
  onLogin?: () => void;
}

type WithDarkModeProp = { isDarkMode?: boolean };

export default function DisenoInicio({ children, onRegister, onLogin }: DisenoInicioProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = '#050b16';
      document.body.style.color = '#f8fafc';
    } else {
      document.body.style.backgroundColor = '#f3f4f6';
      document.body.style.color = '#111827';
    }
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [isDarkMode]);

  // Estilos del header (verde oscuro fijo)
  const headerStyle: React.CSSProperties = {
    backgroundColor: '#065a46',
    padding: '1rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const headerContentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const logoImgStyle: React.CSSProperties = {
    height: '45px',
    width: 'auto',
    borderRadius: '12px',
    filter: 'brightness(0) invert(1)'
  };

  const logoTipoStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 800,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.02em',
    color: '#ffffff'
  };

  // Botón modo oscuro - solo ícono
  const btnModoOscuroStyle: React.CSSProperties = {
    padding: '8px',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '1.2rem',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  };

  const btnRegistroStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    padding: '8px 20px',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  };

  const btnLoginStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#065a46',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  };

  // Pasar isDarkMode a los hijos
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement<WithDarkModeProp>(child)) {
      return React.cloneElement(child, { isDarkMode });
    }
    return child;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* HEADER VERDE OSCURO */}
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={logoContainerStyle}>
            <img src={logo} alt="Logo" style={logoImgStyle} />
            <div style={logoTipoStyle}>EcoLogic</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={btnModoOscuroStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onRegister}
              style={btnRegistroStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Crear cuenta
            </button>
            <button
              onClick={onLogin}
              style={btnLoginStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1 }}>
        {childrenWithProps}
      </main>

      <Footer />
    </div>
  );
}
