import { useState, useEffect, useCallback, useMemo } from 'react';
import PaymentPortal from './PortalPago';
import {
    getDeudaActual,
    getEstados,
    updateEstado,
    type DeudaResponse,
    type EstadoResponse,
} from '../../api/usuario';
import type { AccountType } from '../../api/usuario';
import type { LoginUser } from '../../api/auth';
import { useMisCursos } from '../../hooks/useMisCursos';
import { useExperiencia } from '../../hooks/useExperiencia';

// Importar imágenes de cursos (para fallback)
import allySandboxImg from '../../assets/cursos/ally-sandbox.png';
import bladeRunnerImg from '../../assets/cursos/blade-runner.png';
import georgeFeenyImg from '../../assets/cursos/george-feeny.png';

interface LobbyPersonaProps {
    onLogout?: () => void;
    isDarkMode?: boolean;
    user?: LoginUser | null;
    onUpdateUser?: (u: LoginUser) => void;
    tipo?: AccountType;
}

type Status = 'idle' | 'loading' | 'error' | 'success';

// Datos de cursos hardcodeados para fallback (si la API falla)
const cursosFallback = [
    {
        id: 'fallback-1',
        titulo: "Recoger Basura",
        descripcion: "Aprende sobre recolección de residuos",
        fechaFin: "02/09/2026",
        estado: "activo",
        categoria: "Básico",
        imagen: allySandboxImg,
    },
    {
        id: 'fallback-2',
        titulo: "Reciclaje",
        descripcion: "Técnicas de reciclaje",
        fechaFin: "02/09/2026",
        estado: "activo",
        categoria: "Intermedio",
        imagen: bladeRunnerImg,
    },
    {
        id: 'fallback-3',
        titulo: "Elaboración De Sillas De Cartón",
        descripcion: "Crea muebles con cartón reciclado",
        fechaFin: "02/09/2026",
        estado: "activo",
        categoria: "Avanzado",
        imagen: georgeFeenyImg,
    }
];

// Función para parsear fechas en formato DD/MM/YYYY o YYYY-MM-DD
function parseFecha(fechaStr: string): Date | null {
    if (!fechaStr) return null;

    const partsDDMMYYYY = fechaStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (partsDDMMYYYY) {
        const [_, day, month, year] = partsDDMMYYYY;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    const partsYYYYMMDD = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (partsYYYYMMDD) {
        const [_, year, month, day] = partsYYYYMMDD;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    const date = new Date(fechaStr);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return null;
}

function formatFecha(fechaStr: string): string {
    const date = parseFecha(fechaStr);
    if (!date) return fechaStr || 'Fecha no disponible';
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Función para obtener la URL de la imagen del curso
function getImagenUrl(imagen?: string): string | undefined {
    if (!imagen) return undefined;
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
        return imagen;
    }
    try {
        const modules = import.meta.glob('../administrador/imagenescursos/*.{jpg,jpeg,png,gif,webp}', { eager: true });
        for (const path in modules) {
            const nombre = path.split('/').pop() || '';
            if (nombre === imagen) {
                return (modules[path] as { default: string }).default;
            }
        }
    } catch (e) {
        console.error('Error cargando imagen:', e);
    }
    return undefined;
}

// ============ COMPONENTE DE CARRUSEL ============
interface CursoCarruselProps {
    cursos: any[];
    isDarkMode: boolean;
    colors: any;
}

function CursoCarrusel({ cursos, isDarkMode, colors }: CursoCarruselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const totalCursos = cursos.length;

    const nextSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % totalCursos);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const prevSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + totalCursos) % totalCursos);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const goToSlide = (index: number) => {
        if (isTransitioning || index === currentIndex) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const cursoActual = cursos[currentIndex];
    const colorsList = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const color = colorsList[currentIndex % colorsList.length];
    const imagenUrl = getImagenUrl(cursoActual.imagen);
    const fechaFinFormateada = formatFecha(cursoActual.fechaFin);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
        }}>
            <div style={{
                position: 'relative',
                backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                borderRadius: '12px',
                padding: '16px 40px',
                border: `1px solid ${colors.cardBorder}`,
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {totalCursos > 1 && (
                    <button
                        onClick={prevSlide}
                        style={{
                            position: 'absolute',
                            left: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${colors.cardBorder}`,
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: colors.textPrimary,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#ffffff';
                        }}
                    >
                        ◀
                    </button>
                )}

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    justifyContent: 'center',
                    animation: isTransitioning ? 'slideIn 0.3s ease' : 'none',
                    padding: '4px 0'
                }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {imagenUrl ? (
                            <img
                                src={imagenUrl}
                                alt={cursoActual.titulo}
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '1.6rem', color: color }}>
                                {cursoActual.categoria === 'Avanzado' ? '⭐' :
                                    cursoActual.categoria === 'Intermedio' ? '📘' :
                                        '🌱'}
                            </span>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            marginBottom: '4px',
                            color: colors.textPrimary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {cursoActual.titulo || 'Curso'}
                        </div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: colors.textSecondary,
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}>
                            <span>📅 Culmina {fechaFinFormateada}</span>
                            {cursoActual.estado && (
                                <>
                                    <span>•</span>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        fontSize: '0.6rem',
                                        fontWeight: '600',
                                        backgroundColor: cursoActual.estado === 'activo' || cursoActual.estado === 'activa' ? '#d3f9d8' : '#fff3bf',
                                        color: cursoActual.estado === 'activo' || cursoActual.estado === 'activa' ? '#2b8a3e' : '#e67700'
                                    }}>
                                        {cursoActual.estado || 'Activo'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ color: colors.textMuted, fontSize: '1rem', flexShrink: 0 }}>→</div>
                </div>

                {totalCursos > 1 && (
                    <button
                        onClick={nextSlide}
                        style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${colors.cardBorder}`,
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: colors.textPrimary,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#ffffff';
                        }}
                    >
                        ▶
                    </button>
                )}
            </div>

            {totalCursos > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    {cursos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            style={{
                                width: index === currentIndex ? '20px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: index === currentIndex ? colors.buttonPrimary : colors.cardBorder,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============ COMPONENTE DE EXPERIENCIA ============
interface ExperienceBarProps {
    isDarkMode: boolean;
    colors: any;
    nivel?: number;
    experiencia?: number;
    experienciaMaxima?: number;
    loading?: boolean;
}

function ExperienceBar({ isDarkMode, colors, nivel = 0, experiencia = 0, experienciaMaxima = 1000, loading = false }: ExperienceBarProps) {
    const porcentaje = Math.min((experiencia / experienciaMaxima) * 100, 100);

    if (loading) {
        return (
            <div style={{
                backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                borderRadius: '12px',
                padding: '16px 20px',
                border: `1px solid ${colors.cardBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minWidth: '180px',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>Cargando experiencia...</div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
            borderRadius: '12px',
            padding: '16px 20px',
            border: `1px solid ${colors.cardBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '180px',
            height: '100%',
            justifyContent: 'center'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Experiencia
                </span>
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: colors.textPrimary
                }}>
                    Nv. {nivel}
                </span>
            </div>

            <div style={{
                position: 'relative',
                width: '100%',
                height: '8px',
                backgroundColor: isDarkMode ? '#1e293b' : '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${porcentaje}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #059669, #0284c7, #8b5cf6)',
                    borderRadius: '4px',
                    transition: 'width 0.6s ease'
                }} />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: colors.textMuted
            }}>
                <span>{experiencia} EXP</span>
                <span>{experienciaMaxima} EXP</span>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '4px'
            }}>
                <span style={{
                    fontSize: '0.55rem',
                    color: colors.textMuted,
                    fontWeight: '500'
                }}>
                    {porcentaje.toFixed(0)}% completado
                </span>
            </div>
        </div>
    );
}

export default function LobbyPersona({
    isDarkMode = false,
    user,
    onUpdateUser,
    tipo = 'NATURAL',
}: LobbyPersonaProps) {
    const [deuda, setDeuda] = useState<DeudaResponse | null>(null);
    const [estados, setEstados] = useState<EstadoResponse[]>([]);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>(user?.estado_id ?? '');
    const [loadingData, setLoadingData] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [statusKind, setStatusKind] = useState<Status>('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [showPortal, setShowPortal] = useState(false);

    // Hook para obtener cursos del usuario
    const { cursos: misCursos, loading: loadingCursos, error: errorCursos } = useMisCursos();
    // 🆕 Hook para obtener experiencia (errorExp eliminado porque no se usa)
    const { nivel, experiencia, maximoNivel, loading: loadingExp } = useExperiencia();

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
                getDeudaActual(tipo),
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
    }, [user, tipo]);

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
            await updateEstado({ estado_id: estadoSeleccionado }, tipo);
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

    const cursosParaMostrar = misCursos.length > 0 ? misCursos : cursosFallback;

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: colors.textPrimary }}>{tipo === 'JURIDICO' ? 'Panel de Empresa' : 'Panel de Persona'}</h1>
                    <p style={{ margin: '5px 0 0 0', color: colors.textSecondary }}>Gestiona tu deuda ambiental, estado y pago en un solo lugar.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: colors.textPrimary }}>Datos de {tipo === 'JURIDICO' ? 'empresa' : 'persona'}</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>Nombre</label>
                            <input
                                type="text"
                                value={user?.nombre || (tipo === 'JURIDICO' ? 'Empresa' : 'Usuario')}
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

                <div style={cardStyle}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '20px',
                        alignItems: 'stretch'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: colors.textPrimary }}>
                                Cursos en los que participa actualmente
                            </h3>

                            {loadingCursos ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.textSecondary }}>
                                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</div>
                                    <div style={{ marginTop: '8px' }}>Cargando tus cursos...</div>
                                </div>
                            ) : errorCursos ? (
                                <div style={{ textAlign: 'center', padding: '16px', color: colors.error, fontSize: '0.9rem' }}>
                                    {errorCursos}
                                </div>
                            ) : cursosParaMostrar.length > 0 ? (
                                <CursoCarrusel
                                    cursos={cursosParaMostrar}
                                    isDarkMode={isDarkMode}
                                    colors={colors}
                                />
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '30px 20px',
                                    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                                    borderRadius: '12px',
                                    border: `2px dashed ${colors.cardBorder}`
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📚</div>
                                    <div style={{ fontSize: '0.9rem', color: colors.textSecondary }}>
                                        No seleccionaste cursos este mes
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: '180px',
                            maxWidth: '220px'
                        }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: colors.textPrimary }}>
                                Progreso
                            </h3>
                            <ExperienceBar
                                isDarkMode={isDarkMode}
                                colors={colors}
                                nivel={nivel}
                                experiencia={experiencia}
                                experienciaMaxima={maximoNivel}
                                loading={loadingExp}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showPortal && (
                <PaymentPortal
                    totalAPagar={totalAPagar}
                    montoDeuda={montoDeuda}
                    estadoNombre={estadoActual?.nombre ?? ''}
                    isDarkMode={isDarkMode}
                    tipo={tipo}
                    onClose={() => setShowPortal(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0.5; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}