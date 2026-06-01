import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import logo from '../../assets/logo.png'; // ← Ajusta la ruta

interface LayoutPersonaProps {
    children: ReactNode;
    onLogout?: () => void;
    onNavigateSettings?: () => void;
}

export default function LayoutPersona({ children, onLogout, onNavigateSettings }: LayoutPersonaProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.body.style.backgroundColor = '#0f172a';
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

    const headerStyle: React.CSSProperties = {
        backgroundColor: isDarkMode ? '#1e293b' : '#065a46',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background-color 0.3s ease'
    };

    const footerStyle: React.CSSProperties = {
        backgroundColor: isDarkMode ? '#1e293b' : '#065a46',
        color: '#ffffff',
        padding: '2rem',
        marginTop: 'auto',
        transition: 'background-color 0.3s ease'
    };

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { isDarkMode: isDarkMode } as any);
        }
        return child;
    });

    return (
        <div style={layoutStyle}>
            <header style={headerStyle}>
                <div style={headerContentStyle}>
                    {/* LOGO + NOMBRE */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                            src={logo}
                            alt="Ecologic Logo"
                            style={{
                                height: '40px',
                                width: 'auto',
                                borderRadius: '8px'
                            }}
                        />
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            <span style={{ color: '#10b981' }}>Eco</span>
                            <span style={{ color: '#ffffff' }}>logic</span>
                            
                        </div>
                    </div>

                    <nav style={navStyle}>
                        <a href="#" style={navLinkStyle}>Cursos</a>
                        <a href="#" style={navLinkStyle}>Información</a>
                        <a href="#" style={navLinkStyle}>Contáctanos</a>
                    </nav>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => setIsDarkMode(!isDarkMode)} style={iconButtonStyle(isDarkMode)}>
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button id="user-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} style={iconButtonStyle(isDarkMode)}>
                            👤
                        </button>
                    </div>
                </div>
            </header>

            {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={overlayStyle} />}
            <div id="user-menu" style={{ ...menuStyle(isDarkMode), right: isMenuOpen ? '0' : '-300px' }}>
                <div style={menuHeaderStyle(isDarkMode)}>
                    <span style={{ fontWeight: 'bold' }}>Mi Cuenta</span>
                    <button onClick={() => setIsMenuOpen(false)} style={closeButtonStyle}>✕</button>
                </div>
                <div style={userInfoStyle(isDarkMode)}>
                    <div style={avatarStyle}>👤</div>
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
                    <button style={menuOptionStyle(isDarkMode)}>📊 Mis estadísticas</button>
                    <button onClick={handleLogoutClick} style={{ ...menuOptionStyle(isDarkMode), color: '#ef4444' }}>
                        🚪 Cerrar sesión
                    </button>
                </div>
                <div style={versionStyle(isDarkMode)}>Versión 1.0.0</div>
            </div>

            <main style={mainStyle}>
                <div style={mainContentStyle}>{childrenWithProps}</div>
            </main>

            <footer style={footerStyle}>
                <div style={footerContentStyle}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ecologic</div>
                    <div style={footerLinksStyle}>
                        <a href="#" style={footerLinkStyle}>Privacy Policy</a>
                        <a href="#" style={footerLinkStyle}>Terms of Service</a>
                        <a href="#" style={footerLinkStyle}>Annual Reports</a>
                        <a href="#" style={footerLinkStyle}>Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ========== ESTILOS ==========
const layoutStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' };
const headerContentStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' };
const navStyle: React.CSSProperties = { display: 'flex', gap: '2rem' };
const navLinkStyle: React.CSSProperties = { color: '#d1d5db', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 };
const mainStyle: React.CSSProperties = { flex: 1, padding: '2rem' };
const mainContentStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', width: '100%' };
const footerContentStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' };
const footerLinksStyle: React.CSSProperties = { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' };
const footerLinkStyle: React.CSSProperties = { color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' };

const iconButtonStyle = (isDark: boolean): React.CSSProperties => ({
    padding: '8px', borderRadius: '50%', border: `1px solid ${isDark ? '#475569' : '#ffffff80'}`, backgroundColor: 'transparent',
    color: '#ffffff', cursor: 'pointer', fontSize: '1.1rem', width: '36px', height: '36px'
});
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 };
const menuStyle = (isDark: boolean): React.CSSProperties => ({
    position: 'fixed', top: 0, width: '280px', height: '100vh', backgroundColor: isDark ? '#1e293b' : '#ffffff',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', zIndex: 999, transition: 'right 0.3s ease',
    display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: '20px'
});
const menuHeaderStyle = (isDark: boolean): React.CSSProperties => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` });
const closeButtonStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' };
const userInfoStyle = (isDark: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: isDark ? '#0f172a' : '#f3f4f6', borderRadius: '12px' });
const avatarStyle: React.CSSProperties = { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' };
const menuOptionStyle = (_isDark: boolean): React.CSSProperties => ({ width: '100%', padding: '12px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' });
const versionStyle = (isDark: boolean): React.CSSProperties => ({ fontSize: '0.6rem', textAlign: 'center', color: isDark ? '#64748b' : '#9ca3af', paddingTop: '16px', borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` });