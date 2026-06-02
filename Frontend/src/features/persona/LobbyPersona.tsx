import { useState, useEffect, useCallback, useMemo } from 'react';
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
    const [deuda, setDeuda] = useState<DeudaResponse | null>(null);
    const [estados, setEstados] = useState<EstadoResponse[]>([]);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>(user?.estado_id ?? '');
    const [loadingData, setLoadingData] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [statusKind, setStatusKind] = useState<Status>('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [showPortal, setShowPortal] = useState(false);

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
    if (loadingData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px' }}>
                <div style={{ textAlign: 'center', color: isDarkMode ? 'rgba(255,255,255,0.72)' : 'var(--text-muted)' }}>
                    Cargando...
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <Card style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>⚠️</div>
                <div style={{ color: '#ef4444', marginBottom: '12px' }}>{errorMsg}</div>
                <Button variant="secondary" onClick={() => void fetchData()}>
                    Reintentar
                </Button>
            </Card>
        );
    }

    return (
        <>
            <div style={containerStyle}>
                <div style={headerSectionStyle}>
                    <div>
                        <h1 style={{ ...titleStyle, color: isDarkMode ? '#f8fafc' : 'var(--primary-900)' }}>
                            Panel de Persona
                        </h1>
                        <p style={{ ...subtitleStyle, color: isDarkMode ? 'rgba(255,255,255,0.70)' : 'var(--text-muted)' }}>
                            Gestiona tu deuda ambiental, estado y pago en un solo lugar.
                        </p>
                    </div>
                    <div style={roleToggleStyle}>
                        <div style={roleActiveStyle}>Particular</div>
                        <div style={roleInactiveStyle}>Empresa</div>
                    </div>
                </div>

                <div style={gridStyle}>
                    <div style={columnStyle}>
                        <Card title="Datos de persona">
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Nombre</label>
                                <input type="text" value={`${user?.nombres ?? ''} ${user?.apellidos ?? ''}`.trim() || 'Usuario'} readOnly style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Estado (tasa aplicada)</label>
                                <select
                                    value={estadoSeleccionado}
                                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    {estados.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.nombre} · {Number(e.tasa_actual).toFixed(2)}%
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Button variant="secondary" fullWidth onClick={() => void fetchData()}>
                                    Actualizar
                                </Button>
                                <Button variant="primary" fullWidth onClick={() => void handleCambiarEstado()}>
                                    Guardar
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div style={columnStyle}>
                        <Card title="Resumen">
                            <div style={calcRowStyle}>
                                <span style={calcLabelStyle}>Deuda vigente</span>
                                <span style={calcValueStyle}>{montoDeuda.toFixed(2)} Bs</span>
                            </div>
                            <div style={calcRowStyle}>
                                <span style={calcLabelStyle}>Tasa del estado</span>
                                <span style={calcValueStyle}>{tasaActual.toFixed(2)}%</span>
                            </div>
                            <div style={{ ...calcRowStyle, borderBottom: 'none' }}>
                                <span style={{ ...calcLabelStyle, fontWeight: 700, color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>
                                    Total a pagar
                                </span>
                                <span style={{ ...calcValueStyle, color: 'var(--primary-700)' }}>{totalAPagar.toFixed(2)} Bs</span>
                            </div>
                        </Card>
                    </div>

                    <div style={columnStyle}>
                        <Card variant="highlight" title="Pago">
                            <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Registra el pago de tu deuda vigente.
                            </p>
                            <Button
                                fullWidth
                                variant="dark"
                                onClick={() => void setShowPortal(true)}
                                disabled={montoDeuda === 0 || statusKind === 'loading'}
                            >
                                {montoDeuda === 0 ? 'Sin deuda' : 'Pagar deuda'}
                            </Button>

                            {statusMsg && (
                                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: statusKind === 'error' ? '#ef4444' : 'var(--text-muted)' }}>
                                    {statusMsg}
                                </div>
                            )}
                        </Card>
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

const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
};

const headerSectionStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '2rem',
};

const subtitleStyle: React.CSSProperties = {
    margin: '5px 0 0 0',
};

const roleToggleStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: 'var(--surface-2)',
    borderRadius: '9999px',
    padding: '4px',
};

const roleActiveStyle: React.CSSProperties = {
    backgroundColor: 'var(--primary-900)',
    color: '#ffffff',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
};

const roleInactiveStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer',
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    alignItems: 'start',
};

const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
};

const inputGroupStyle: React.CSSProperties = {
    marginBottom: '15px',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
    marginBottom: '5px',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--surface-2)',
    fontSize: '1rem',
    color: 'var(--text-main)',
    outline: 'none',
};

const calcRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    borderBottom: '1px solid var(--border-color)',
};

const calcLabelStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: '1rem',
};

const calcValueStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1.1rem',
};