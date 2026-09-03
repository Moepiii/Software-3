import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import logo from '../../assets/logo.png';
import instagramIcon from '../../assets/instagram.png';
import facebookIcon from '../../assets/facebook.png';
import whatsappIcon from '../../assets/whatsapp.png';
import Footer from '../../componentes/Footer';

interface LayoutPersonaProps {
    children: ReactNode;
    onLogout?: () => void;
    onNavigateSettings?: () => void;
    onNavigateStats?: () => void;
    onNavigateCursos?: () => void;
    onNavigatePanel?: () => void;
}

type WithDarkModeProp = { isDarkMode?: boolean };

export default function DisenoPersona({ children, onLogout, onNavigateSettings, onNavigateStats, onNavigateCursos, onNavigatePanel }: LayoutPersonaProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const menu = document.getElementById('user-menu');
            const button = document.getElementById('user-menu-button');
            if (menu && button && !menu.contains(event.target as Node) && !button.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setIsMenuOpen(false);
        if (onLogout) onLogout();
    };

    // HEADER - Verde oscuro fijo (igual que DisenoInicio)
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

    const navStyle: React.CSSProperties = {
        display: 'flex',
        gap: '2rem'
    };

    const navLinkStyle: React.CSSProperties = {
        color: '#e5e7eb',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: 500,
        transition: 'color 0.2s'
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

    const btnMenuStyle: React.CSSProperties = {
        padding: '8px 12px',
        borderRadius: '9999px',
        border: '1px solid rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '0.85rem',
        height: '36px',
        transition: 'all 0.2s'
    };

    // FOOTER - Verde oscuro con redes sociales (igual que DisenoInicio)
    const footerStyle: React.CSSProperties = {
        backgroundColor: '#065a46',
        color: '#ffffff',
        padding: '2rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)'
    };

    const footerContentStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem'
    };

    const socialIconStyle: React.CSSProperties = {
        width: '32px',
        height: '32px',
        objectFit: 'contain',
        transition: 'all 0.2s',
        cursor: 'pointer',
        filter: 'brightness(0) invert(1)'
    };

    const footerLinksStyle: React.CSSProperties = {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap'
    };

    const footerLinkStyle: React.CSSProperties = {
        color: '#d1d5db',
        textDecoration: 'none',
        fontSize: '0.85rem',
        transition: 'color 0.2s'
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
                    <div 
                        style={{...logoContainerStyle, cursor: 'pointer'}} 
                        onClick={() => { if (onNavigatePanel) onNavigatePanel(); }}
                    >
                        <img src={logo} alt="Logo" style={logoImgStyle} />
                        <div style={logoTipoStyle}>EcoLogic</div>
                    </div>

                    <nav style={navStyle}>
                        <a
                            href="#"
                            style={navLinkStyle}
                            onClick={(e) => {
                                e.preventDefault();
                                if (onNavigatePanel) onNavigatePanel();
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#e5e7eb'}
                        >
                            Inicio
                        </a>
                        <a
                            href="#"
                            style={navLinkStyle}
                            onClick={(e) => {
                                e.preventDefault();
                                if (onNavigateCursos) onNavigateCursos();
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#e5e7eb'}
                        >
                            Cursos
                        </a>
                        <a
                            href="#"
                            style={navLinkStyle}
                            onClick={(e) => {
                                e.preventDefault();
                                if (onNavigateStats) onNavigateStats();
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#e5e7eb'}
                        >
                            Estadísticas
                        </a>
                    </nav>

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
                            id="user-menu-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={btnMenuStyle}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        >
                            Menu
                        </button>
                    </div>
                </div>
            </header>

            {/* MENÚ LATERAL */}
            {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={overlayStyle} />}
            <div id="user-menu" style={{ ...menuStyle(isDarkMode), right: isMenuOpen ? '0' : '-300px' }}>
                <div style={menuHeaderStyle(isDarkMode)}>
                    <span style={{ fontWeight: 'bold' }}>Mi Cuenta</span>
                    <button onClick={() => setIsMenuOpen(false)} style={closeButtonStyle}>✕</button>
                </div>
                <div style={userInfoStyle(isDarkMode)}>
                    <div style={avatarStyle}>U</div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Usuario</div>
                        <div style={{ fontSize: '0.7rem' }}>usuario@email.com</div>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            if (onNavigateSettings) onNavigateSettings();
                        }}
                        style={menuOptionStyle(isDarkMode)}
                    >
                        ⚙️ Configuración
                    </button>
                    <button onClick={handleLogoutClick} style={{ ...menuOptionStyle(isDarkMode), color: '#ef4444' }}>
                        🚪 Cerrar sesión
                    </button>
                </div>
                <div style={versionStyle(isDarkMode)}>Versión 1.0.0</div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{ flex: 1, padding: '2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    {childrenWithProps}
                </div>
            </main>

            {/* FOOTER VERDE OSCURO CON REDES SOCIALES */}
            {false ? <footer style={footerStyle}>
                <div style={footerContentStyle}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex' }}
                            title="Instagram"
                        >
                            <img
                                src={instagramIcon}
                                alt="Instagram"
                                style={socialIconStyle}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex' }}
                            title="Facebook"
                        >
                            <img
                                src={facebookIcon}
                                alt="Facebook"
                                style={socialIconStyle}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </a>
                        <a
                            href="https://whatsapp.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex' }}
                            title="WhatsApp"
                        >
                            <img
                                src={whatsappIcon}
                                alt="WhatsApp"
                                style={socialIconStyle}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </a>
                    </div>

                    <div style={footerLinksStyle}>
                        <a
                            href="#"
                            style={footerLinkStyle}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                        >
                            Política de Privacidad
                        </a>
                        <a
                            href="#"
                            style={footerLinkStyle}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                        >
                            Términos de Servicio
                        </a>
                        <a
                            href="#"
                            style={footerLinkStyle}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                        >
                            Reportes Anuales
                        </a>
                        <a
                            href="#"
                            style={footerLinkStyle}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                        >
                            Contáctanos
                        </a>
                    </div>
                </div>
            </footer> : <Footer />}
        </div>
    );
}

// ========== ESTILOS DEL MENÚ LATERAL ==========
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998
};

const menuStyle = (isDark: boolean): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
    zIndex: 999,
    transition: 'right 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    gap: '20px'
});

const menuHeaderStyle = (isDark: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`
});

const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer'
};

const userInfoStyle = (isDark: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: isDark ? '#0f172a' : '#f3f4f6',
    borderRadius: '12px'
});

const avatarStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#065a46',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    color: '#ffffff',
    fontWeight: 'bold'
};

const menuOptionStyle = (isDark: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: isDark ? '#f8fafc' : '#111827',
    transition: 'background 0.2s'
});

const versionStyle = (isDark: boolean): React.CSSProperties => ({
    fontSize: '0.8rem',
    textAlign: 'center',
    color: isDark ? '#64748b' : '#9ca3af',
    paddingTop: '16px',
    borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`
});
