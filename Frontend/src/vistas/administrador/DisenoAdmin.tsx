import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import logo from '../../assets/logo.png';
import instagramIcon from '../../assets/instagram.png';
import facebookIcon from '../../assets/facebook.png';
import whatsappIcon from '../../assets/whatsapp.png';
import AdminPanel from './PanelAdmin';
import CursosAdmin from './CursosAdmin';

interface LayoutAdminProps {
    children?: ReactNode;
    onLogout?: () => void;
}

export default function DisenoAdmin({ children, onLogout }: LayoutAdminProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [vistaActual, setVistaActual] = useState<'admins' | 'cursos'>('admins');

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

    // Determinar qué contenido mostrar
    const renderContent = () => {
        if (children) {
            return children;
        }
        return vistaActual === 'admins' ? (
            <AdminPanel isDarkMode={isDarkMode} />
        ) : (
            <CursosAdmin isDarkMode={isDarkMode} />
        );
    };

    // HEADER - Verde oscuro fijo (igual que DisenoPersona)
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

    const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
        color: isActive ? '#ffffff' : '#e5e7eb',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: isActive ? 700 : 500,
        padding: '8px 0',
        borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
        transition: 'all 0.2s',
        cursor: 'pointer'
    });

    // Botón modo oscuro
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

    // FOOTER - Verde oscuro con redes sociales
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

    // Estilos del menú lateral
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 998
    };

    const menuStyle = {
        position: 'fixed' as const,
        top: 0,
        right: isMenuOpen ? '0' : '-300px',
        width: '280px',
        height: '100vh',
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
        zIndex: 999,
        transition: 'right 0.3s ease',
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '24px 16px',
        gap: '20px'
    };

    const menuHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
    };

    const closeButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: isDarkMode ? '#f8fafc' : '#111827'
    };

    const userInfoStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6',
        borderRadius: '12px'
    };

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

    const menuOptionStyle = {
        width: '100%',
        padding: '12px',
        textAlign: 'left' as const,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: isDarkMode ? '#f8fafc' : '#111827',
        transition: 'background 0.2s'
    };

    const versionStyle = {
        fontSize: '0.6rem',
        textAlign: 'center' as const,
        color: isDarkMode ? '#64748b' : '#9ca3af',
        paddingTop: '16px',
        borderTop: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
            {/* HEADER VERDE OSCURO */}
            <header style={headerStyle}>
                <div style={headerContentStyle}>
                    <div style={logoContainerStyle}>
                        <img src={logo} alt="Logo" style={logoImgStyle} />
                        <div style={logoTipoStyle}>EcoLogic</div>
                    </div>

                    <nav style={navStyle}>
                        <a
                            style={navLinkStyle(vistaActual === 'admins')}
                            onClick={() => setVistaActual('admins')}
                            onMouseEnter={(e) => { if (vistaActual !== 'admins') e.currentTarget.style.color = '#ffffff'; }}
                            onMouseLeave={(e) => { if (vistaActual !== 'admins') e.currentTarget.style.color = '#e5e7eb'; }}
                        >
                            Administradores
                        </a>
                        <a
                            style={navLinkStyle(vistaActual === 'cursos')}
                            onClick={() => setVistaActual('cursos')}
                            onMouseEnter={(e) => { if (vistaActual !== 'cursos') e.currentTarget.style.color = '#ffffff'; }}
                            onMouseLeave={(e) => { if (vistaActual !== 'cursos') e.currentTarget.style.color = '#e5e7eb'; }}
                        >
                            Cursos
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
            <div id="user-menu" style={menuStyle}>
                <div style={menuHeaderStyle}>
                    <span style={{ fontWeight: 'bold' }}>Mi Cuenta</span>
                    <button onClick={() => setIsMenuOpen(false)} style={closeButtonStyle}>✕</button>
                </div>
                <div style={userInfoStyle}>
                    <div style={avatarStyle}>A</div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Administrador</div>
                        <div style={{ fontSize: '0.7rem' }}>admin@ecologic.com</div>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            setVistaActual('admins');
                        }}
                        style={menuOptionStyle}
                    >
                        👥 Administradores
                    </button>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            setVistaActual('cursos');
                        }}
                        style={menuOptionStyle}
                    >
                        📚 Cursos
                    </button>
                    <button style={menuOptionStyle}>📊 Estadísticas</button>
                    <button style={menuOptionStyle}>⚙️ Configuración</button>
                    <button onClick={handleLogoutClick} style={{ ...menuOptionStyle, color: '#ef4444' }}>
                        🚪 Cerrar sesión
                    </button>
                </div>
                <div style={versionStyle}>Admin · v1.0.0</div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{ flex: 1, padding: '2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    {renderContent()}
                </div>
            </main>

            {/* FOOTER VERDE OSCURO CON REDES SOCIALES */}
            <footer style={footerStyle}>
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
            </footer>
        </div>
    );
}