import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface LayoutEmpresaProps {
    children: ReactNode;
    onLogout?: () => void;
}

export default function LayoutEmpresa({ children, onLogout }: LayoutEmpresaProps) {
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

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { isDarkMode: isDarkMode } as any);
        }
        return child;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#1e3a5f',
                padding: '1rem 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                        Ecologic Business 📊
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{
                            padding: '8px',
                            borderRadius: '50%',
                            border: '1px solid white',
                            background: 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            width: '36px',
                            height: '36px'
                        }}>
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            id="user-menu-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                padding: '8px',
                                borderRadius: '50%',
                                border: '1px solid white',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                width: '36px',
                                height: '36px'
                            }}
                        >
                            🏢
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
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
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
                    borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
                }}>
                    <span style={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#111827' }}>Mi Empresa</span>
                    <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6',
                    borderRadius: '12px'
                }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏢</div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isDarkMode ? '#f8fafc' : '#111827' }}>Nombre Empresa</div>
                        <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>empresa@email.com</div>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <button style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' }}>📈 Estadísticas</button>
                    <button style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' }}>💰 Facturación</button>
                    <button style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' }}>👥 Empleados</button>
                    <button onClick={handleLogoutClick} style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', color: '#ef4444' }}>🚪 Cerrar sesión</button>
                </div>
                <div style={{ fontSize: '0.6rem', textAlign: 'center', color: isDarkMode ? '#64748b' : '#9ca3af', paddingTop: '16px', borderTop: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}` }}>Versión Empresarial 1.0.0</div>
            </div>

            <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {childrenWithProps}
            </main>
        </div>
    );
}