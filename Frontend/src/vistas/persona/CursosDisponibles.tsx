import { useState, useEffect, useCallback } from 'react';
import { listarCursos, reservarCurso, listarMisReservas, type Curso } from '../../api/cursos';

interface CursosDisponiblesProps {
    isDarkMode?: boolean;
}

// Función para formatear fechas
function formatFecha(fechaStr: string): string {
    if (!fechaStr) return 'Fecha no disponible';

    // Intentar parsear como DD/MM/YYYY
    const partsDDMMYYYY = fechaStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (partsDDMMYYYY) {
        const [, day, month, year] = partsDDMMYYYY;
        return `${day}/${month}/${year}`;
    }

    // Intentar parsear como YYYY-MM-DD
    const partsYYYYMMDD = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (partsYYYYMMDD) {
        const [, year, month, day] = partsYYYYMMDD;
        return `${day}/${month}/${year}`;
    }

    // Intentar con Date nativo
    const date = new Date(fechaStr);
    if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    return fechaStr;
}

const importarImagenes = () => {
    const imagenes: { nombre: string; url: string }[] = [];
    const modules = import.meta.glob('../administrador/imagenescursos/*.{jpg,jpeg,png,gif,webp}', { eager: true });

    for (const path in modules) {
        const nombre = path.split('/').pop() || '';
        const url = (modules[path] as { default: string }).default;
        imagenes.push({ nombre, url });
    }

    return imagenes;
};

export default function CursosDisponibles({ isDarkMode = false }: CursosDisponiblesProps) {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [imagenesDisponibles, setImagenesDisponibles] = useState<{ nombre: string; url: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [reservingId, setReservingId] = useState<string | null>(null);
    const [reservedIds, setReservedIds] = useState<string[]>([]);
    const [successMsg, setSuccessMsg] = useState('');

    const colors = {
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        cardBorder: isDarkMode ? '#334155' : '#e5e7eb',
        textPrimary: isDarkMode ? '#f8fafc' : '#111827',
        textSecondary: isDarkMode ? '#94a3b8' : '#6b7280',
        textMuted: isDarkMode ? '#64748b' : '#9ca3af',
        buttonPrimary: '#10b981',
        buttonPrimaryHover: '#059669',
        buttonDisabled: isDarkMode ? '#475569' : '#d1d5db',
        success: '#10b981',
        error: '#ef4444',
    };

    const fetchCursos = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const imagenes = importarImagenes();
            setImagenesDisponibles(imagenes);
            const [data, reservasData] = await Promise.all([
                listarCursos(),
                listarMisReservas().catch(() => [])
            ]);
            setCursos(Array.isArray(data) ? data : []);
            setReservedIds(Array.isArray(reservasData) ? reservasData : []);
        } catch (error: unknown) {
            setErrorMsg(error instanceof Error ? error.message : 'Error al cargar los cursos disponibles.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void fetchCursos(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [fetchCursos]);

    const getImagenUrl = (nombre?: string) => {
        if (!nombre) return undefined;
        const img = imagenesDisponibles.find(i => i.nombre === nombre);
        return img ? img.url : nombre;
    };

    const handleReservar = async (cursoId: string) => {
        setReservingId(cursoId);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await reservarCurso(cursoId);
            setSuccessMsg('¡Curso reservado con éxito!');
            setReservedIds(prev => [...prev, cursoId]);
        } catch (error: unknown) {
            setErrorMsg(error instanceof Error ? error.message : 'No se pudo reservar el curso.');
        } finally {
            setReservingId(null);
            setTimeout(() => setSuccessMsg(''), 5000);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div style={{ color: colors.textSecondary, fontSize: '1.2rem' }}>Cargando cursos disponibles...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-out' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '2rem', color: colors.textPrimary, fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Cursos Disponibles
                </h1>
                <p style={{ margin: '8px 0 0 0', color: colors.textSecondary, fontSize: '1.05rem' }}>
                    Explora y reserva los cursos para impulsar tu participación en la comunidad ecológica.
                </p>
            </div>

            {errorMsg && (
                <div style={{ padding: '16px', backgroundColor: `${colors.error}15`, borderLeft: `4px solid ${colors.error}`, color: colors.error, borderRadius: '4px' }}>
                    {errorMsg}
                </div>
            )}

            {successMsg && (
                <div style={{ padding: '16px', backgroundColor: `${colors.success}15`, borderLeft: `4px solid ${colors.success}`, color: colors.success, borderRadius: '4px' }}>
                    {successMsg}
                </div>
            )}

            {cursos.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: colors.cardBg, border: `1px dashed ${colors.cardBorder}`, borderRadius: '16px' }}>
                    <p style={{ color: colors.textMuted, fontSize: '1.1rem' }}>No hay cursos disponibles en este momento.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {cursos.map((curso) => {
                        const isReserved = reservedIds.includes(curso.id);
                        const disableButton = reservingId === curso.id || curso.estado === 'finalizado' || isReserved;

                        return (
                            <div
                                key={curso.id}
                                style={{
                                    backgroundColor: colors.cardBg,
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    border: `1px solid ${colors.cardBorder}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = isDarkMode ? '0 12px 24px rgba(0,0,0,0.4)' : '0 12px 24px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    height: '180px',
                                    backgroundColor: curso.categoria === 'Avanzado' ? '#8b5cf6' : (curso.categoria === 'Intermedio' ? '#3b82f6' : '#10b981'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {!curso.imagen && (
                                        <div style={{ position: 'absolute', width: '150%', height: '150%', background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)', transform: 'rotate(30deg)' }} />
                                    )}

                                    {curso.imagen && (
                                        <img
                                            src={getImagenUrl(curso.imagen)}
                                            alt={curso.titulo}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                zIndex: 1
                                            }}
                                        />
                                    )}
                                </div>

                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: colors.textPrimary, fontWeight: 700, lineHeight: 1.3 }}>
                                            {curso.titulo}
                                        </h3>
                                        {curso.categoria && (
                                            <span style={{
                                                backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
                                                color: colors.textSecondary,
                                                padding: '4px 8px',
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                marginLeft: '12px'
                                            }}>
                                                {curso.categoria}
                                            </span>
                                        )}
                                    </div>

                                    <p style={{ color: colors.textSecondary, fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                                        {curso.descripcion}
                                    </p>

                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '0.85rem', color: colors.textMuted }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>📅</span>
                                            <span>Inicio: {formatFecha(curso.fechaInicio)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>🏁</span>
                                            <span>Fin: {formatFecha(curso.fechaFin)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleReservar(curso.id)}
                                        disabled={disableButton}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            backgroundColor: disableButton ? colors.buttonDisabled : colors.buttonPrimary,
                                            color: disableButton ? (isDarkMode ? '#94a3b8' : '#9ca3af') : '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            cursor: disableButton ? 'not-allowed' : 'pointer',
                                            transition: 'background-color 0.2s, transform 0.1s',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseDown={(e) => {
                                            if (!disableButton) {
                                                e.currentTarget.style.transform = 'scale(0.98)';
                                            }
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!disableButton) {
                                                e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!disableButton) {
                                                e.currentTarget.style.backgroundColor = colors.buttonPrimary;
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }
                                        }}
                                    >
                                        {reservingId === curso.id ? (
                                            <>
                                                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                                                Reservando...
                                            </>
                                        ) : isReserved ? 'Curso Reservado' : curso.estado === 'finalizado' ? 'Finalizado' : 'Reservar Curso'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
