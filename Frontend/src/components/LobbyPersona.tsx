// Frontend/src/components/LobbyPersona.tsx
import React, { useState } from 'react';

// 1. IMPORTAMOS LAS IMÁGENES
import mapaImg from '../assets/mapa_venezuela.png';
import fondoImg from '../assets/fondo_lobby.png';

interface LobbyPersonaProps {
    onLogout: () => void;
}

export default function LobbyPersona({ onLogout }: LobbyPersonaProps) {
    const [seccionActiva, setSeccionActiva] = useState<'inicio' | 'historial' | 'puntos'>('inicio');
    const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);

    const estadosVenezuela = [
        "1. Amazonas", "2. Anzoátegui", "3. Apure", "4. Aragua", "5. Barinas",
        "6. Bolívar", "7. Carabobo", "8. Cojedes", "9. Delta Amacuro", "10. Distrito Capital",
        "11. Falcón", "12. Guárico", "13. Lara", "14. Mérida", "15. Miranda",
        "16. Monagas", "17. Nueva Esparta", "18. Portuguesa", "19. Sucre", "20. Táchira",
        "21. Trujillo", "22. La Guaira", "23. Yaracuy", "24. Zulia", "25. Zona en Reclamación"
    ];

    // 2. APLICAMOS LA IMAGEN LIMPIA DIRECTAMENTE SIN FILTROS NI OPACIDAD
    const containerConFondo: React.CSSProperties = {
        ...containerStyle,
        backgroundImage: `url(${fondoImg})`,
    };

    return (
        <div style={containerConFondo}>
            {/* ================= HEADER EDITADO (MISMO COLOR QUE SIDEBAR) ================= */}
            <header style={headerStyle}>
                <div style={headerContentStyle}>
                    <h1 style={logoStyle}>
                        <span style={{ color: '#10b981' }}>Eco</span>Logic {/* Resaltamos Eco en verde para que resalte en el fondo oscuro */}
                    </h1>

                    <nav style={navStyle}>
                        <button onClick={() => setSeccionActiva('inicio')} style={navButtonStyle(seccionActiva === 'inicio')}>
                            Inicio
                        </button>
                        <button onClick={() => setSeccionActiva('historial')} style={navButtonStyle(seccionActiva === 'historial')}>
                            Mis Reciclajes
                        </button>
                        <button onClick={() => setSeccionActiva('puntos')} style={navButtonStyle(seccionActiva === 'puntos')}>
                            Eco-Puntos
                        </button>
                    </nav>

                    <button onClick={() => setMenuLateralAbierto(!menuLateralAbierto)} style={avatarButtonStyle} aria-label="Abrir menú">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* ================= SIDEBAR DERECHO ================= */}
            {menuLateralAbierto && <div style={overlayStyle} onClick={() => setMenuLateralAbierto(false)} />}

            <div style={sidebarStyle(menuLateralAbierto)}>
                <button onClick={() => setMenuLateralAbierto(false)} style={closeSidebarButtonStyle}>✕</button>
                <div style={menuOptionsContainerStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <button onClick={() => setMenuLateralAbierto(false)} style={sidebarOptionStyle}>Perfil</button>
                        <button onClick={() => setMenuLateralAbierto(false)} style={sidebarOptionStyle}>Métodos de Reciclaje</button>
                        <button onClick={() => setMenuLateralAbierto(false)} style={sidebarOptionStyle}>Configuración</button>
                    </div>
                    <button onClick={onLogout} style={sidebarLogoutOptionStyle}>Cerrar Sesión</button>
                </div>
            </div>

            {/* ================= CUERPO PRINCIPAL ================= */}
            <main style={mainBodyStyle}>
                <div style={wrapperStyle}>

                    {seccionActiva === 'inicio' && (
                        <section style={sectionCardStyle}>

                            {/* BLOQUE BIENVENIDO ! */}
                            <div style={welcomeContainerStyle}>
                                <h2 style={welcomeTitleStyle}>
                                    ¡Bienvenido <span style={giantExclamationStyle}>!</span>
                                </h2>
                                <p style={subtitleStyle}>
                                    ayuda con la preservacion de la humanidad en este territorio, seleccione el estado donde vive
                                </p>
                            </div>

                            {/* CONTENEDOR EN PARALELO (LEYENDA IZQUIERDA | MAPA DERECHA) */}
                            <div style={mapFlexContainerStyle}>

                                <div style={legendBoxStyle}>
                                    {estadosVenezuela.map((estado, idx) => (
                                        <span key={idx} style={legendItemStyle}>{estado}</span>
                                    ))}
                                </div>

                                <div style={mapImageBoxStyle}>
                                    <img
                                        src={mapaImg}
                                        alt="Mapa de Venezuela"
                                        style={mapImageStyle}
                                    />
                                </div>

                            </div>
                        </section>
                    )}

                    {/* OTRAS PESTAÑAS PRESERVADAS */}
                    {seccionActiva === 'historial' && (
                        <section style={sectionCardStyleOld}>
                            <h2 style={sectionTitleStyle}>Historial de Reciclaje</h2>
                            <div style={tableWrapperStyle}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr style={tableHeaderRowStyle}>
                                            <th style={thStyle}>Fecha</th>
                                            <th style={thStyle}>Material</th>
                                            <th style={thStyle}>Peso</th>
                                            <th style={thStyle}>Puntos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={tableRowStyle}>
                                            <td style={tdStyle}>20/05/2026</td>
                                            <td style={tdStyle}>Plástico PET</td>
                                            <td style={tdStyle}>3.2 Kg</td>
                                            <td style={tdStyle}>+64</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {seccionActiva === 'puntos' && (
                        <section style={sectionCardStyleOld}>
                            <h2 style={sectionTitleStyle}>Tus Eco-Puntos</h2>
                            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#1e293b', borderRadius: '16px' }}>
                                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1.2rem', marginBottom: '0' }}>
                                    Balance Actual: <strong style={{ color: '#10b981', fontSize: '1.5rem' }}>320 Puntos</strong>
                                </p>
                            </div>
                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}

// ================= ESTILOS EN LÍNEA BASE =================

const containerStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0f172a',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    position: 'relative'
};

// MODIFICADO: Cambiado de verde (#10b981) a azul profundo oscuro (#090d16) con borde sutil inferior
const headerStyle: React.CSSProperties = {
    backgroundColor: '#090d16',
    padding: '0 40px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)', // Una pequeña línea de separación sutil
    position: 'sticky',
    top: 0,
    zIndex: 100
};

const headerContentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const logoStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    letterSpacing: '1px'
};

const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px'
};

// MODIFICADO: El fondo activo ahora usa un tono verde sutil que armoniza genial con el nuevo fondo del header
const navButtonStyle = (activa: boolean): React.CSSProperties => ({
    backgroundColor: activa ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
    color: activa ? '#10b981' : '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: activa ? 'bold' : 'normal',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
});

const avatarButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 150
};

const sidebarStyle = (abierto: boolean): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    width: '320px',
    height: '100vh',
    backgroundColor: '#090d16', // Color base original de tu barra lateral
    boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.5)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 24px',
    boxSizing: 'border-box',
    transform: abierto ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out'
});

const closeSidebarButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.4rem',
    cursor: 'pointer',
    marginBottom: '40px'
};

const menuOptionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1
};

const sidebarOptionStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '1.25rem',
    textAlign: 'left',
    padding: '12px 10px',
    cursor: 'pointer',
};

const sidebarLogoutOptionStyle: React.CSSProperties = {
    ...sidebarOptionStyle,
    color: '#f87171',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '20px',
};

const mainBodyStyle: React.CSSProperties = {
    flex: 1,
    padding: '40px 20px',
    overflowY: 'auto'
};

const wrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto'
};

const sectionCardStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    padding: '10px',
    textAlign: 'center'
};

const sectionCardStyleOld: React.CSSProperties = {
    backgroundColor: 'rgba(9, 13, 22, 0.75)', // Modificado para heredar el mismo tono oscuro y que las tablas se unifiquen
    backdropFilter: 'blur(12px)',
    padding: '40px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    textAlign: 'left'
};

const welcomeContainerStyle: React.CSSProperties = {
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const welcomeTitleStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
};

const giantExclamationStyle: React.CSSProperties = {
    fontSize: '4.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: '0.8',
    display: 'inline-block',
};

const subtitleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '1.6rem',
    maxWidth: '850px',
    margin: '0 auto',
    lineHeight: '1.4',
    fontWeight: 'normal'
};

const mapFlexContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '50px',
    flexWrap: 'wrap-reverse',
    marginTop: '20px'
};

const legendBoxStyle: React.CSSProperties = {
    flex: '1',
    minWidth: '300px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px 25px',
    padding: '35px',
    backgroundColor: 'rgba(9, 13, 22, 0.65)', // Ajustado al mismo color de la barra lateral para total uniformidad
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
};

const legendItemStyle: React.CSSProperties = {
    color: '#cbd5e1',
    fontSize: '1.1rem',
    textAlign: 'left',
    fontWeight: '500'
};

const mapImageBoxStyle: React.CSSProperties = {
    flex: '1.2',
    minWidth: '350px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const mapImageStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: 'auto',
};

const sectionTitleStyle: React.CSSProperties = { fontSize: '1.8rem', color: '#10b981' };
const tableWrapperStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle: React.CSSProperties = { backgroundColor: 'rgba(16, 185, 129, 0.15)' };
const thStyle: React.CSSProperties = { padding: '16px', color: '#10b981' };
const tableRowStyle: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,0.05)' };
const tdStyle: React.CSSProperties = { padding: '16px', color: '#cbd5e1' };