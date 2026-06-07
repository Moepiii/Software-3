import { useState, useEffect, useCallback, useMemo } from 'react';
import PaymentPortal from './PortalPago';
import {
    getDeudaActual,
    getEstados,
    updateEstado,
    type DeudaResponse,
    type EstadoResponse,
} from '../../api/usuario';
import type { LoginUser } from '../../api/auth';

// Importar imágenes de cursos (solo 3)
import allySandboxImg from '../../assets/cursos/ally-sandbox.png';
import bladeRunnerImg from '../../assets/cursos/blade-runner.png';
import georgeFeenyImg from '../../assets/cursos/george-feeny.png';

interface LobbyPersonaProps {
    onLogout?: () => void;
    isDarkMode?: boolean;
    user?: LoginUser | null;
    onUpdateUser?: (u: LoginUser) => void;
}

type Status = 'idle' | 'loading' | 'error' | 'success';

// Datos de cursos actuales con imágenes (solo 3)
const cursosActuales = [
    {
        nombre: "Recoger Basura",
        categoria: "Culmina 02/09/2026",
        imagen: allySandboxImg,
        color: "#3b82f6"
    },
    {
        nombre: "Reciclaje",
        categoria: "Culmina 02/09/2026",
        imagen: bladeRunnerImg,
        color: "#8b5cf6"
    },
    {
        nombre: "Elaboración De Sillas De Cartón",
        categoria: "Culmina 02/09/2026",
        imagen: georgeFeenyImg,
        color: "#10b981"
    }
];

export default function LobbyPersona({
    isDarkMode = false,
    user,
    onUpdateUser,
}: LobbyPersonaProps) {
    const [deuda, setDeuda] = useState<DeudaResponse | null>(null);
    const [estados, setEstados] = useState<EstadoResponse[]>([]);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>(user?.estado_id ?? '');
    const [loadingData, setLoadingData] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [statusKind, setStatusKind] = useState<Status>('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [showPortal, setShowPortal] = useState(false);

    // Colores según modo oscuro
    const colors = {
        bgPage: isDarkMode ? '#0f172a' : '#f3f4f6',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        cardBorder: isDarkMode ? '#334155' : '#e5e7eb',
        textPrimary: isDarkMode ? '#f8fafc' : '#111827',
        textSecondary: isDarkMode ? '#94a3b8' : '#6b7280',
        textMuted: isDarkMode ? '#94a3b8' : '#6b7280',
        inputBg: isDarkMode ? '#0f172a' : '#ffffff',
        inputBorder: isDarkMode ? '#475569' : '#d1d5db',
        inputText: isDarkMode ? '#f8fafc' : '#111827',
        highlightBg: isDarkMode ? '#064e3b' : '#f0fdf4',
        highlightBorder: isDarkMode ? '#065f46' : '#bbf7d0',
        success: '#10b981',
        error: '#ef4444',
        buttonPrimary: '#10b981',
        buttonPrimaryHover: '#059669',
        buttonSecondaryBg: isDarkMode ? '#334155' : '#f3f4f6',
        buttonSecondaryText: isDarkMode ? '#f8fafc' : '#374151',
        buttonSecondaryBorder: isDarkMode ? '#475569' : '#d1d5db',
    };

    const fetchData = useCallback(async () => {
        setLoadingData(true);
        setErrorMsg('');
        try {
            const [deudaData, estadosData] = await Promise.all([
                getDeudaActual(),
                getEstados(),
            ]);
            setDeuda(deudaData);
            setEstados(estadosData);
            if (user?.estado_id) {
                setEstadoSeleccionado(user.estado_id);
            } else if (estadosData.length > 0) {
                setEstadoSeleccionado(estadosData[0].id);
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error al cargar datos';
            setErrorMsg(msg);
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    useEffect(() => {
        const t = setTimeout(() => {
            void fetchData();
        }, 0);
        return () => clearTimeout(t);
    }, [fetchData]);

    const estadoActual = useMemo(
        () => estados.find((e) => e.id === estadoSeleccionado),
        [estados, estadoSeleccionado],
    );
    const tasaActual = Number(estadoActual?.tasa_actual ?? 0);
    const montoDeuda = Number(deuda?.monto ?? 0);
    const totalAPagar = isNaN(montoDeuda) || isNaN(tasaActual) ? 0 : montoDeuda * (1 + tasaActual / 100);

    const handleCambiarEstado = async () => {
        if (!estadoSeleccionado) return;
        setStatusKind('loading');
        setStatusMsg('');
        try {
            await updateEstado({ estado_id: estadoSeleccionado });
            setStatusKind('success');
            setStatusMsg('Estado actualizado correctamente.');
            if (onUpdateUser && user) {
                const nombreEstado = estadoActual?.nombre ?? '';
                onUpdateUser({ ...user, estado_id: estadoSeleccionado, estado_nombre: nombreEstado });
            }
        } catch (e: unknown) {
            setStatusKind('error');
            setStatusMsg(e instanceof Error ? e.message : 'Error al actualizar estado');
        }
    };

    const handlePaymentSuccess = (nuevaDeuda: DeudaResponse) => {
        setDeuda(nuevaDeuda);
        setStatusKind('success');
        setStatusMsg(`Pago exitoso. Deuda restante: ${Number(nuevaDeuda.monto).toFixed(2)} Bs.`);
        setShowPortal(false);
    };

    // Estilos reutilizables
    const cardStyle: React.CSSProperties = {
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${colors.inputBorder}`,
        backgroundColor: colors.inputBg,
        color: colors.inputText,
        fontSize: '0.95rem',
        outline: 'none',
        boxSizing: 'border-box' as const
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: '6px'
    };

    const buttonPrimaryStyle: React.CSSProperties = {
        backgroundColor: colors.buttonPrimary,
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'background-color 0.2s',
        flex: 1,
        textAlign: 'center' as const
    };

    const buttonSecondaryStyle: React.CSSProperties = {
        backgroundColor: colors.buttonSecondaryBg,
        color: colors.buttonSecondaryText,
        border: `1px solid ${colors.buttonSecondaryBorder}`,
        padding: '10px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'all 0.2s',
        flex: 1,
        textAlign: 'center' as const
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='${isDarkMode ? '%2394a3b8' : '%236b7280'}' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundPosition: 'right 10px center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '20px'
    };

    if (loadingData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px' }}>
                <div style={{ textAlign: 'center', color: colors.textSecondary }}>Cargando...</div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>⚠️</div>
                <div style={{ color: colors.error, marginBottom: '12px' }}>{errorMsg}</div>
                <button onClick={() => void fetchData()} style={buttonPrimaryStyle}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* TÍTULO */}
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: colors.textPrimary }}>Panel de Persona</h1>
                    <p style={{ margin: '5px 0 0 0', color: colors.textSecondary }}>Gestiona tu deuda ambiental, estado y pago en un solo lugar.</p>
                </div>

                {/* GRID DE 3 COLUMNAS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>

                    {/* Tarjeta 1 - Datos de persona */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: colors.textPrimary }}>Datos de persona</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>Nombre</label>
                            <input
                                type="text"
                                value={user?.nombre || 'Usuario'}
                                readOnly
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>Estado (tasa aplicada)</label>
                            <select
                                value={estadoSeleccionado}
                                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                                style={selectStyle}
                            >
                                {estados.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.nombre} · {Number(e.tasa_actual).toFixed(2)}%
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => void fetchData()} style={buttonSecondaryStyle}>
                                Actualizar
                            </button>
                            <button onClick={() => void handleCambiarEstado()} style={buttonPrimaryStyle}>
                                Guardar
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta 2 - Resumen */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: colors.textPrimary }}>Resumen</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.cardBorder}` }}>
                            <span style={{ color: colors.textMuted }}>Deuda vigente</span>
                            <span style={{ fontWeight: 'bold', color: colors.textPrimary }}>{montoDeuda.toFixed(2)} Bs</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.cardBorder}` }}>
                            <span style={{ color: colors.textMuted }}>Tasa del estado</span>
                            <span style={{ fontWeight: 'bold', color: colors.textPrimary }}>{tasaActual.toFixed(2)}%</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                            <span style={{ fontWeight: 700, color: colors.textPrimary }}>Total a pagar</span>
                            <span style={{ fontWeight: 'bold', color: colors.success }}>{totalAPagar.toFixed(2)} Bs</span>
                        </div>
                    </div>

                    {/* Tarjeta 3 - Pago */}
                    <div style={{ ...cardStyle, backgroundColor: colors.highlightBg, borderColor: colors.highlightBorder }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: colors.success }}>Pago</h3>
                        <p style={{ margin: '0 0 12px 0', color: colors.textSecondary, fontSize: '0.85rem' }}>
                            Registra el pago de tu deuda vigente.
                        </p>
                        <button
                            onClick={() => void setShowPortal(true)}
                            disabled={montoDeuda === 0 || statusKind === 'loading'}
                            style={{
                                ...buttonPrimaryStyle,
                                width: '100%',
                                opacity: (montoDeuda === 0 || statusKind === 'loading') ? 0.6 : 1,
                                cursor: (montoDeuda === 0 || statusKind === 'loading') ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {montoDeuda === 0 ? 'Sin deuda' : 'Pagar deuda'}
                        </button>

                        {statusMsg && (
                            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: statusKind === 'error' ? colors.error : colors.success }}>
                                {statusMsg}
                            </div>
                        )}
                    </div>
                </div>

                {/* TARJETA DE CURSOS CON IMÁGENES LOCALES (solo 3) */}
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: colors.textPrimary }}>Cursos en los que participa actualmente</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {cursosActuales.map((curso, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                                    border: `1px solid ${colors.cardBorder}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Imagen del curso */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: `${curso.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={curso.imagen}
                                        alt={curso.nombre}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>

                                {/* Información del curso */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px', color: colors.textPrimary }}>
                                        {curso.nombre}
                                    </div>
                                    {curso.categoria && (
                                        <div style={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                                            {curso.categoria}
                                        </div>
                                    )}
                                </div>

                                {/* Flecha indicadora */}
                                <div style={{ color: colors.textMuted, fontSize: '1rem' }}>→</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showPortal && (
                <PaymentPortal
                    totalAPagar={totalAPagar}
                    montoDeuda={montoDeuda}
                    estadoNombre={estadoActual?.nombre ?? ''}
                    isDarkMode={isDarkMode}
                    onClose={() => setShowPortal(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
}