import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface LayoutEmpresaProps {
    children: ReactNode;
    onLogout?: () => void;
    onNavigateSettings?: () => void;
}

type WithDarkModeProp = { isDarkMode?: boolean };

export default function LayoutEmpresa({ children, onLogout, onNavigateSettings }: LayoutEmpresaProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.body.style.backgroundColor = '#050b16';
            document.body.style.color = '#f8fafc';
        } else {
            document.body.style.backgroundColor = 'var(--bg-main)';
            document.body.style.color = 'var(--text-main)';
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

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement<WithDarkModeProp>(child)) {
            return React.cloneElement(child, { isDarkMode });
        }
        return child;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{
                backgroundColor: isDarkMode ? 'rgba(2, 6, 23, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                padding: '1rem 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'var(--border-color)'}`,
                backdropFilter: 'blur(10px)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isDarkMode ? '#ffffff' : 'var(--primary-900)', fontFamily: 'var(--font-display)' }}>
                            EcoTax
                        </div>
                        <div style={{ fontSize: '0.8rem', color: isDarkMode ? 'rgba(255,255,255,0.72)' : 'var(--text-muted)' }}>
                            Empresa
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{
                            padding: '8px 12px',
                            borderRadius: '9999px',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.18)' : 'var(--border-color)'}`,
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'var(--surface)',
                            color: isDarkMode ? '#ffffff' : 'var(--text-main)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            height: '36px',
                            boxShadow: isDarkMode ? 'none' : 'var(--shadow-sm)',
                        }}>
                            {isDarkMode ? 'Light' : 'Dark'}
                        </button>
                        <button
                            id="user-menu-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '9999px',
                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.18)' : 'var(--border-color)'}`,
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'var(--surface)',
                                color: isDarkMode ? '#ffffff' : 'var(--text-main)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                height: '36px',
                                boxShadow: isDarkMode ? 'none' : 'var(--shadow-sm)',
                            }}
                        >
                            Menu
                        </button>
                    </div>
                </div>
            </header>

            {/* MENÚ LATERAL EMPRESA */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998
                    }}
                />
            )}
            <div
                id="user-menu"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: isMenuOpen ? '0' : '-300px',
                    width: '280px',
                    height: '100vh',
                    backgroundColor: isDarkMode ? 'rgba(2, 6, 23, 0.92)' : 'var(--surface)',
                    boxShadow: '-10px 0 30px rgba(2, 6, 23, 0.18)',
                    zIndex: 999,
                    transition: 'right 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                    gap: '20px'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '16px',
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.10)' : 'var(--border-color)'}`
                }}>
                    <span style={{ fontWeight: 800, color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>Mi empresa</span>
                    <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.0rem', cursor: 'pointer', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>✕</button>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'var(--surface-2)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'var(--border-color)'}`
                }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '9999px', backgroundColor: 'var(--primary-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#ffffff', fontWeight: 800 }}>E</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>Empresa</div>
                        <div style={{ fontSize: '0.75rem', color: isDarkMode ? 'rgba(255,255,255,0.70)' : 'var(--text-muted)' }}>empresa@ecotax.local</div>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <button style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>Estadísticas</button>
                    <button style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>Facturación</button>
                    <button style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>Empleados</button>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            if (onNavigateSettings) onNavigateSettings();
                        }}
                        style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}
                    >Configuración</button>
                    <button onClick={handleLogoutClick} style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', color: '#ef4444' }}>Cerrar sesión</button>
                </div>
                <div style={{ fontSize: '0.7rem', textAlign: 'center', color: isDarkMode ? 'rgba(255,255,255,0.60)' : 'var(--text-muted)', paddingTop: '16px', borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.10)' : 'var(--border-color)'}` }}>Empresa · v1.0.0</div>
            </div>

            <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {childrenWithProps}
            </main>
        </div>
    );
}