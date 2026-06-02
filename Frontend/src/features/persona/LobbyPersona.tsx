import { useState, useEffect, useCallback } from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';
import PaymentPortal from './PaymentPortal';
import {
    getDeudaActual,
    getEstados,
    updateEstado,
    type DeudaResponse,
    type EstadoResponse,
} from '../../api/persona';
import type { LoginUser } from '../../api/auth';

interface LobbyPersonaProps {
    onLogout?: () => void;
    isDarkMode?: boolean;
    user?: LoginUser | null;
    onUpdateUser?: (u: LoginUser) => void;
}

type Status = 'idle' | 'loading' | 'error' | 'success';

export default function LobbyPersona({
    isDarkMode = false,
    user,
    onUpdateUser,
}: LobbyPersonaProps) {
    // ─── Estado de datos del backend ─────────────────────────────────────────
    const [deuda, setDeuda] = useState<DeudaResponse | null>(null);
    const [estados, setEstados] = useState<EstadoResponse[]>([]);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>(
        user?.estado_id ?? ''
    );
    const [loadingData, setLoadingData] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // ─── Estado de pago ───────────────────────────────────────────────────────
    const [pagoStatus, setPagoStatus] = useState<Status>('idle');
    const [pagoMsg, setPagoMsg] = useState('');
    const [showPortal, setShowPortal] = useState(false);

    // ─── Estado de cambio de estado ───────────────────────────────────────────
    const [estadoStatus, setEstadoStatus] = useState<Status>('idle');
    const [estadoMsg, setEstadoMsg] = useState('');

    // ─── Datos estáticos (reciclaje y cursos) ─────────────────────────────────
    const datosReciclaje = [
        { mes: 'Enero', kg: 12 },
        { mes: 'Febrero', kg: 18 },
        { mes: 'Marzo', kg: 15 },
        { mes: 'Abril', kg: 25 },
        { mes: 'Mayo', kg: 30 },
        { mes: 'Junio', kg: 28 },
    ];

    const cursosActuales = [
        { nombre: 'Ally Sandbox', categoria: 'F2F Simulations and Training' },
        { nombre: 'Blade Runner 2049', categoria: 'F2F Simulations and Training' },
        { nombre: 'George Feeny Sandbox', categoria: 'Sandboxes' },
        { nombre: 'Zoom/Panopto Integration Test', categoria: '' },
        { nombre: 'All Text (Course Reports Testing)', categoria: '' },
        { nombre: 'Audrey Ally testing Sandbox', categoria: 'Sandboxes' },
    ];

    const maxKg = 50;

    // ─── Carga inicial ────────────────────────────────────────────────────────
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
    }, [user?.estado_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── Tasa del estado seleccionado ─────────────────────────────────────────
    const estadoActual = estados.find((e) => e.id === estadoSeleccionado);
    const tasaActual = Number(estadoActual?.tasa_actual ?? 0);
    const montoDeuda = Number(deuda?.monto ?? 0);
    const totalAPagar = isNaN(montoDeuda) || isNaN(tasaActual)
        ? 0
        : montoDeuda * (1 + tasaActual / 100);

    // ─── Handler: cambiar estado ──────────────────────────────────────────────
    const handleCambiarEstado = async () => {
        if (!estadoSeleccionado) return;
        setEstadoStatus('loading');
        setEstadoMsg('');
        try {
            await updateEstado({ estado_id: estadoSeleccionado });
            setEstadoStatus('success');
            setEstadoMsg('Estado actualizado correctamente.');
            if (onUpdateUser && user) {
                const nombreEstado = estadoActual?.nombre ?? '';
                onUpdateUser({ ...user, estado_id: estadoSeleccionado, estado_nombre: nombreEstado });
            }
        } catch (e: unknown) {
            setEstadoStatus('error');
            setEstadoMsg(e instanceof Error ? e.message : 'Error al actualizar estado');
        }
    };

    // ─── Handler: pago completado desde el portal ─────────────────────────────
    const handlePaymentSuccess = (nuevaDeuda: DeudaResponse) => {
        setDeuda(nuevaDeuda);
        setPagoStatus('success');
        setPagoMsg(`Pago exitoso. Deuda restante: ${Number(nuevaDeuda.monto).toFixed(2)} Bs.`);
        setShowPortal(false);
    };

    // ─── Estilos dinámicos ────────────────────────────────────────────────────
    const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
    const cardShadow = isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.1)';
    const textPrimary = isDarkMode ? '#f8fafc' : '#111827';
    const textSecondary = isDarkMode ? '#94a3b8' : '#6b7280';
    const inputBorder = isDarkMode ? '#334155' : '#d1d5db';
    const inputBg = isDarkMode ? '#0f172a' : '#ffffff';
    const labelColor = isDarkMode ? '#94a3b8' : '#9ca3af';
    const subtleBg = isDarkMode ? '#0f172a' : '#f9fafb';
    const dividerColor = isDarkMode ? '#334155' : '#e5e7eb';

    // ─── Loading / Error global ───────────────────────────────────────────────
    if (loadingData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px', height: '48px', border: '4px solid #10b981',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                    }} />
                    <p style={{ color: textSecondary, fontSize: '0.9rem' }}>Cargando tu información...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <Card style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
                <p style={{ color: '#ef4444', marginBottom: '16px' }}>{errorMsg}</p>
                <Button
                    onClick={fetchData}
                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Reintentar
                </Button>
            </Card>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                {/* PRIMER CARD: bienvenida y configuración de pago */}
                <Card style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 'bold', color: textPrimary }}>
                        Bienvenido{user?.nombres ? `, ${user.nombres}` : ''}
                    </h1>
                    <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: textSecondary }}>
                        Gracias por ayudar al planeta.
                    </p>

                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: labelColor, marginBottom: '16px', letterSpacing: '1px' }}>
                        CONFIGURACIÓN DE PAGO
                    </div>

                    {/* Selector de estado */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '500', marginBottom: '4px', color: isDarkMode ? '#cbd5e1' : '#374151' }}>
                            Estado / Provincia
                        </div>
                        <select
                            id="select-estado"
                            value={estadoSeleccionado}
                            onChange={(e) => {
                                setEstadoSeleccionado(e.target.value);
                                setEstadoStatus('idle');
                                setEstadoMsg('');
                            }}
                            style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
                                color: textPrimary, fontSize: '0.9rem', marginBottom: '8px'
                            }}
                        >
                            {estados.map((est) => (
                                <option key={est.id} value={est.id}>{est.nombre}</option>
                            ))}
                        </select>
                        <Button
                            id="btn-actualizar-estado"
                            onClick={handleCambiarEstado}
                            disabled={estadoStatus === 'loading'}
                            style={{
                                backgroundColor: '#3b82f6', color: 'white', border: 'none',
                                padding: '7px 16px', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '0.8rem', width: '100%',
                                opacity: estadoStatus === 'loading' ? 0.6 : 1
                            }}
                        >
                            {estadoStatus === 'loading' ? 'Actualizando...' : 'Actualizar estado'}
                        </Button>
                        {estadoMsg && (
                            <div style={{
                                marginTop: '6px', fontSize: '0.75rem', padding: '6px 10px', borderRadius: '6px',
                                backgroundColor: estadoStatus === 'success' ? (isDarkMode ? '#064e3b' : '#d1fae5') : (isDarkMode ? '#450a0a' : '#fee2e2'),
                                color: estadoStatus === 'success' ? '#10b981' : '#ef4444'
                            }}>
                                {estadoMsg}
                            </div>
                        )}
                    </div>

                    {/* Resumen financiero */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '16px', marginBottom: '24px',
                        padding: '16px', backgroundColor: subtleBg,
                        borderRadius: '12px', border: `1px solid ${dividerColor}`
                    }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '500', marginBottom: '4px', color: textSecondary }}>Deuda actual</div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#ef4444' }}>
                                {montoDeuda.toFixed(2)} Bs
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '500', marginBottom: '4px', color: textSecondary }}>Tasa ({estadoActual?.nombre ?? '—'})</div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: textPrimary }}>
                                {tasaActual.toFixed(2)}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '500', marginBottom: '4px', color: textSecondary }}>Total a pagar</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: isDarkMode ? '#34d399' : '#059669' }}>
                                {totalAPagar.toFixed(2)} Bs
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: textSecondary, marginBottom: '16px', lineHeight: '1.4', textAlign: 'center' }}>
                        La tasa varía según tu estado registrado. Para más detalles visita la pestaña Información.
                    </div>

                    <Button
                        id="btn-pagar"
                        onClick={() => {
                            setPagoStatus('idle');
                            setPagoMsg('');
                            setShowPortal(true);
                        }}
                        disabled={montoDeuda === 0}
                        style={{
                            backgroundColor: montoDeuda === 0 ? '#6b7280' : '#10b981',
                            color: 'white', border: 'none', padding: '10px 20px',
                            borderRadius: '8px', fontWeight: 'bold', cursor: montoDeuda === 0 ? 'not-allowed' : 'pointer',
                            width: '100%', fontSize: '0.9rem',
                        }}
                    >
                        {montoDeuda === 0 ? 'Sin deuda pendiente ✓' : '💳 Ir al portal de pago'}
                    </Button>

                    {pagoMsg && (
                        <div style={{
                            marginTop: '10px', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px',
                            backgroundColor: pagoStatus === 'success' ? (isDarkMode ? '#064e3b' : '#d1fae5') : (isDarkMode ? '#450a0a' : '#fee2e2'),
                            color: pagoStatus === 'success' ? '#10b981' : '#ef4444'
                        }}>
                            {pagoMsg}
                        </div>
                    )}
                </Card>

                {/* SEGUNDO CARD: estadísticas de reciclaje */}
                <Card style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '24px', boxShadow: cardShadow }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: labelColor, marginBottom: '20px', letterSpacing: '1px' }}>
                        ESTADÍSTICAS DE RECICLAJE
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        {datosReciclaje.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: textPrimary }}>{item.mes}</span>
                                    <span style={{ fontSize: '0.75rem', color: textSecondary }}>{item.kg} kg</span>
                                </div>
                                <div style={{
                                    width: '100%', height: '28px',
                                    backgroundColor: isDarkMode ? '#0f172a' : '#e5e7eb',
                                    borderRadius: '14px', overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${(item.kg / maxKg) * 100}%`, height: '100%',
                                        backgroundColor: '#10b981', borderRadius: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        paddingRight: '12px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        {item.kg}kg
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: '20px',
                        marginTop: '16px', paddingTop: '16px',
                        borderTop: `1px solid ${dividerColor}`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }} />
                            <span style={{ fontSize: '0.7rem', color: textSecondary }}>Kg reciclados</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: isDarkMode ? '#334155' : '#d1d5db', borderRadius: '3px' }} />
                            <span style={{ fontSize: '0.7rem', color: textSecondary }}>Meta: {maxKg}kg</span>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '24px', backgroundColor: isDarkMode ? '#064e3b' : '#d1fae5',
                        borderRadius: '12px', padding: '16px', textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '500', color: isDarkMode ? '#34d399' : '#065f46' }}>
                            ¡Actualmente estás entre los mejores 10 en términos de reciclaje!
                        </span>
                    </div>
                </Card>

                {/* TERCER CARD: cursos */}
                <Card style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '24px', boxShadow: cardShadow }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: labelColor, marginBottom: '20px', letterSpacing: '1px' }}>
                        CURSOS EN LOS QUE PARTICIPA ACTUALMENTE
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {cursosActuales.map((curso, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '16px', borderRadius: '12px',
                                    backgroundColor: subtleBg,
                                    border: `1px solid ${dividerColor}`,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '8px', color: textPrimary }}>
                                    {curso.nombre}
                                </div>
                                {curso.categoria && (
                                    <div style={{ fontSize: '0.7rem', color: textSecondary }}>{curso.categoria}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Portal de pago */}
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