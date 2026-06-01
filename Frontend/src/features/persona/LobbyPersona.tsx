import { useState } from 'react';  // ← IMPORTANTE: agregar esta línea
import Card from '../../shared/Card';
import Button from '../../shared/Button';

interface LobbyPersonaProps {
    onLogout?: () => void;
    isDarkMode?: boolean;
}

export default function LobbyPersona({ onLogout, isDarkMode = false }: LobbyPersonaProps) {
    const [estado, setEstado] = useState('caracas');
    const [porcentaje, setPorcentaje] = useState('5');
    const [descuento, setDescuento] = useState('10');

    const estadosVenezuela = [
        "amazonas", "anzóategui", "apure", "aragua", "barinas",
        "bolívar", "carabobo", "cojedes", "delta amacuro", "distrito capital",
        "falcón", "guárico", "lara", "mérida", "miranda",
        "monagas", "nueva esparta", "portuguesa", "sucre", "táchira",
        "trujillo", "la guaira", "yaracuy", "zulia", "caracas"
    ];

    const datosReciclaje = [
        { mes: "Enero", kg: 12 },
        { mes: "Febrero", kg: 18 },
        { mes: "Marzo", kg: 15 },
        { mes: "Abril", kg: 25 },
        { mes: "Mayo", kg: 30 },
        { mes: "Junio", kg: 28 }
    ];

    const cursosActuales = [
        { nombre: "Ally Sandbox", categoria: "F2F Simulations and Training" },
        { nombre: "Blade Runner 2049", categoria: "F2F Simulations and Training" },
        { nombre: "George Feeny Sandbox", categoria: "Sandboxes" },
        { nombre: "Zoom/Panopto Integration Test C...", categoria: "" },
        { nombre: "All Text (Course Reports Testing) S...", categoria: "" },
        { nombre: "Audrey Ally testing Sandbox", categoria: "Sandboxes" }
    ];

    const maxKg = 50;

    const totalBase = 10000;
    const totalConDescuento = totalBase * (1 - parseFloat(descuento) / 100);
    const totalFinal = totalConDescuento * (1 + parseFloat(porcentaje) / 100);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%'
        }}>
            {/* DOS COLUMNAS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                alignItems: 'start'
            }}>
                {/* COLUMNA IZQUIERDA */}
                <Card style={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#111827' }}>
                        Bienvenido
                    </h1>
                    <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                        Gracias por ayudar al planeta.
                    </p>

                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: isDarkMode ? '#94a3b8' : '#9ca3af', marginBottom: '16px', letterSpacing: '1px' }}>
                        CONFIGURATION
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '500', marginBottom: '4px', color: isDarkMode ? '#cbd5e1' : '#374151' }}>
                            Estado
                        </div>
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: `1px solid ${isDarkMode ? '#334155' : '#d1d5db'}`,
                                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                color: isDarkMode ? '#f8fafc' : '#111827',
                                fontSize: '0.9rem'
                            }}
                        >
                            {estadosVenezuela.map((est, idx) => (
                                <option key={idx} value={est}>{est}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '500', marginBottom: '4px', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                                Porcentaje
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#111827' }}>
                                {porcentaje}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '500', marginBottom: '4px', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                                Su descuento
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#111827' }}>
                                {descuento}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '500', marginBottom: '4px', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                                Total a pagar
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: isDarkMode ? '#34d399' : '#059669' }}>
                                {Math.round(totalFinal)}bs
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#6b7280', marginBottom: '20px', lineHeight: '1.4', textAlign: 'center' }}>
                        si desea saber como se realiza el calculo del porcentaje o los descuentos visite la pestaña información
                    </div>

                    <Button style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '0.9rem'
                    }}>
                        pagar
                    </Button>
                </Card>

                {/* COLUMNA DERECHA */}
                <Card style={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: isDarkMode ? '#94a3b8' : '#9ca3af', marginBottom: '20px', letterSpacing: '1px' }}>
                        ESTADÍSTICAS DE RECICLAJE
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        {datosReciclaje.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: isDarkMode ? '#f8fafc' : '#111827' }}>
                                        {item.mes}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                                        {item.kg} kg
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '28px',
                                    backgroundColor: isDarkMode ? '#0f172a' : '#e5e7eb',
                                    borderRadius: '14px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${(item.kg / maxKg) * 100}%`,
                                        height: '100%',
                                        backgroundColor: '#10b981',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        paddingRight: '12px',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.kg}kg
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: isDarkMode ? '#64748b' : '#9ca3af',
                                    marginTop: '2px',
                                    textAlign: 'right'
                                }}>
                                    {item.kg.toString().split('').join(' ')}kg
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Kg reciclados</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: isDarkMode ? '#334155' : '#d1d5db', borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Metas: {maxKg}kg</span>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '24px',
                        backgroundColor: isDarkMode ? '#064e3b' : '#d1fae5',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '500', color: isDarkMode ? '#34d399' : '#065f46' }}>
                            actualmente usted está entre las mejores 10 en términos de reciclaje
                        </span>
                    </div>
                </Card>
            </div>

            {/* TERCERA TARJETA */}
            <Card style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: isDarkMode ? '#94a3b8' : '#9ca3af', marginBottom: '20px', letterSpacing: '1px' }}>
                    CURSOS EN LOS QUE PARTICIPA ACTUALMENTE
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px'
                }}>
                    {cursosActuales.map((curso, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '8px', color: isDarkMode ? '#f8fafc' : '#111827' }}>
                                {curso.nombre}
                            </div>
                            {curso.categoria && (
                                <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                                    {curso.categoria}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}