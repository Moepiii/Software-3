// Frontend/src/vistas/administrador/CursosAdmin.tsx
import { useCallback, useEffect, useState } from 'react';
import Button from '../../componentes/Boton';
import type { Curso } from '../../api/cursos';
import { listarCursos, crearCurso, actualizarCurso, eliminarCurso, finalizarCurso } from '../../api/cursos';

// Función para obtener todas las imágenes de la carpeta
const importarImagenes = () => {
    const imagenes: { nombre: string; url: string }[] = [];
    const modules = import.meta.glob('./imagenescursos/*.{jpg,jpeg,png,gif,webp}', { eager: true });

    for (const path in modules) {
        const nombre = path.split('/').pop() || '';
        const url = (modules[path] as { default: string }).default;
        imagenes.push({ nombre, url });
    }

    return imagenes;
};

const imagenesIniciales = importarImagenes();

export default function CursosAdmin({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const [imagenesDisponibles] = useState(imagenesIniciales);
    const [cursos, setCursos] = useState<Curso[]>([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: '',
        categoria: '',
        imagen: imagenesIniciales[0]?.nombre ?? ''
    });
    const [imagenPreview, setImagenPreview] = useState(imagenesIniciales[0]?.url ?? '');

    const cargarCursos = useCallback(async () => {
        try {
            const data = await listarCursos();
            setCursos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void cargarCursos(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [cargarCursos]);

    const resetFormulario = () => {
        setMostrarFormulario(false);
        setCursoEditando(null);
        setFormData({
            titulo: '',
            descripcion: '',
            fechaInicio: '',
            fechaFin: '',
            categoria: '',
            imagen: imagenesDisponibles[0]?.nombre || ''
        });
        setImagenPreview(imagenesDisponibles[0]?.url || '');
    };

    const handleCrearCurso = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await crearCurso({
                ...formData,
                estado: 'planificado'
            });
            await cargarCursos();
            resetFormulario();
            alert('¡Curso creado exitosamente! Aparecerá en "Planificado"');
        } catch (error) {
            console.error(error);
            alert('Hubo un error al crear el curso');
        }
    };

    const handleActualizarCurso = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cursoEditando) return;

        try {
            await actualizarCurso(cursoEditando.id, formData);
            await cargarCursos();
            resetFormulario();
            alert('¡Curso actualizado exitosamente!');
        } catch (error) {
            console.error(error);
            alert('Hubo un error al actualizar el curso');
        }
    };

    const handleEliminarCurso = async (curso: Curso) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el curso "${curso.titulo}"?`)) {
            try {
                await eliminarCurso(curso.id);
                await cargarCursos();
                alert('¡Curso eliminado exitosamente!');
            } catch (error) {
                console.error(error);
                alert('Hubo un error al eliminar el curso');
            }
        }
    };

    const handleOficializarCurso = async (curso: Curso) => {
        if (confirm(`¿Oficializar el curso "${curso.titulo}"? Pasará a estar activo y visible para los usuarios.`)) {
            try {
                await actualizarCurso(curso.id, { estado: 'activo' });
                await cargarCursos();
                alert('¡Curso oficializado! Ahora aparece en "Cursos Activos"');
            } catch (error) {
                console.error(error);
                alert('Hubo un error al oficializar el curso');
            }
        }
    };

    // 🆕 Función para finalizar curso (botón amarillo)
    const handleFinalizarCurso = async (curso: Curso) => {
        if (confirm(`¿Finalizar el curso "${curso.titulo}"? Se darán 100 EXP a todos los usuarios inscritos.`)) {
            try {
                const resultado = await finalizarCurso(curso.id);
                await cargarCursos();
                alert(`✅ ¡Curso finalizado!\n\n📊 Usuarios afectados: ${resultado.usuarios_afectados}\n⭐ Experiencia ganada: ${resultado.experiencia_ganada} EXP por usuario`);
            } catch (error) {
                console.error(error);
                alert('Hubo un error al finalizar el curso');
            }
        }
    };

    const handleEditarClick = (curso: Curso) => {
        setCursoEditando(curso);
        const imagenExistente = imagenesDisponibles.find(img => img.nombre === curso.imagen);
        setFormData({
            titulo: curso.titulo,
            descripcion: curso.descripcion,
            fechaInicio: curso.fechaInicio,
            fechaFin: curso.fechaFin,
            categoria: curso.categoria || '',
            imagen: curso.imagen || ''
        });
        setImagenPreview(imagenExistente?.url || '');
        setMostrarFormulario(true);
    };

    const getImagenUrl = (nombreImagen: string) => {
        const img = imagenesDisponibles.find(i => i.nombre === nombreImagen);
        return img?.url || '';
    };

    const cursosActivos = cursos.filter(c => c.estado === 'activo');
    const cursosPlanificados = cursos.filter(c => c.estado === 'planificado');
    const cursosFinalizados = cursos.filter(c => c.estado === 'finalizado');

    const styles = {
        container: {
            padding: '20px'
        },
        header: {
            marginBottom: '30px',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
            paddingBottom: '20px'
        },
        title: {
            fontSize: '2rem',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            marginBottom: '8px'
        },
        subtitle: {
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b'
        },
        formCard: {
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
            padding: '24px',
            marginBottom: '40px'
        },
        formTitulo: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            marginBottom: '20px'
        },
        formGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#475569',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            fontSize: '0.95rem'
        },
        textarea: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            fontSize: '0.95rem',
            minHeight: '80px'
        },
        select: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            fontSize: '0.95rem',
            cursor: 'pointer'
        },
        imagenPreview: {
            marginTop: '10px',
            width: '100%',
            height: '150px',
            borderRadius: '8px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
        },
        cursoCard: {
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        },
        cardImage: {
            width: '100%',
            height: '200px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative' as const
        },
        cardOverlay: {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            color: '#ffffff'
        },
        badge: {
            position: 'absolute' as const,
            top: '12px',
            right: '12px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            zIndex: 2
        },
        badgeActivo: {
            backgroundColor: '#10b981',
            color: '#ffffff'
        },
        badgePlanificado: {
            backgroundColor: '#f59e0b',
            color: '#ffffff'
        },
        badgeFinalizado: {
            backgroundColor: '#6b7280',
            color: '#ffffff'
        },
        cardContent: {
            padding: '20px'
        },
        cursoTitulo: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            marginBottom: '8px'
        },
        cursoDescripcion: {
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
            fontSize: '0.85rem',
            lineHeight: '1.5',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden'
        },
        cursoFecha: {
            color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#94a3b8',
            fontSize: '0.8rem',
            marginBottom: '8px'
        },
        cursoCategoria: {
            display: 'inline-block',
            padding: '2px 8px',
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            borderRadius: '12px',
            fontSize: '0.7rem',
            color: isDarkMode ? '#f8fafc' : '#475569',
            marginBottom: '16px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px',
            marginTop: '16px',
            flexWrap: 'wrap' as const
        },
        botonEditar: {
            flex: 1,
            padding: '8px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
        },
        botonEliminar: {
            flex: 1,
            padding: '8px',
            backgroundColor: '#ef4444',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
        },
        botonOficializar: {
            flex: 1,
            padding: '8px',
            backgroundColor: '#8b5cf6',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
        },
        // 🆕 Botón Finalizar - AMARILLO
        botonFinalizar: {
            flex: 1,
            padding: '8px',
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
        },
        seccionTitulo: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            marginBottom: '20px',
            marginTop: '20px'
        },
        vacio: {
            textAlign: 'center' as const,
            padding: '60px',
            color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#94a3b8',
            border: `2px dashed ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
            borderRadius: '12px'
        }
    };

    if (imagenesDisponibles.length === 0) {
        return <div style={styles.vacio}>Cargando imágenes...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Panel de Administración</h1>
                <p style={styles.subtitle}>Gestión estratégica de programas de capacitación ecológica.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <Button onClick={() => {
                    resetFormulario();
                    setMostrarFormulario(!mostrarFormulario);
                }}>
                    {mostrarFormulario ? 'Cancelar' : '+ Nuevo Curso'}
                </Button>
            </div>

            {mostrarFormulario && (
                <div style={styles.formCard}>
                    <h2 style={styles.formTitulo}>
                        {cursoEditando ? 'Editar Curso' : 'Nuevo Curso'}
                    </h2>
                    <form onSubmit={cursoEditando ? handleActualizarCurso : handleCrearCurso}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Título del Curso</label>
                            <input
                                type="text"
                                required
                                style={styles.input}
                                placeholder="Ej: Gestión de Residuos Industriales"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Descripción</label>
                            <textarea
                                required
                                style={styles.textarea}
                                placeholder="Detalles del programa educativo..."
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Inicio</label>
                                <input
                                    type="text"
                                    required
                                    style={styles.input}
                                    placeholder="dd/mm/aaaa"
                                    value={formData.fechaInicio}
                                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Fin</label>
                                <input
                                    type="text"
                                    required
                                    style={styles.input}
                                    placeholder="dd/mm/aaaa"
                                    value={formData.fechaFin}
                                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Categoría</label>
                            <input
                                type="text"
                                style={styles.input}
                                placeholder="Ej: Reciclaje, Energía, Agua"
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Imagen de fondo</label>
                            <select
                                style={styles.select}
                                value={formData.imagen}
                                onChange={(e) => {
                                    const nombre = e.target.value;
                                    const img = imagenesDisponibles.find(i => i.nombre === nombre);
                                    setFormData({ ...formData, imagen: nombre });
                                    setImagenPreview(img?.url || '');
                                }}
                            >
                                {imagenesDisponibles.map(img => (
                                    <option key={img.nombre} value={img.nombre}>
                                        {img.nombre}
                                    </option>
                                ))}
                            </select>
                            {imagenPreview && (
                                <div style={{
                                    ...styles.imagenPreview,
                                    backgroundImage: `url(${imagenPreview})`
                                }} />
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <Button type="submit" fullWidth>
                                {cursoEditando ? 'Actualizar Curso' : 'Publicar Curso'}
                            </Button>
                            {cursoEditando && (
                                <Button type="button" onClick={resetFormulario} fullWidth>
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Cursos Activos */}
            <h2 style={styles.seccionTitulo}>Cursos Activos</h2>
            <div style={styles.grid}>
                {cursosActivos.length === 0 ? (
                    <div style={styles.vacio}>No hay cursos activos</div>
                ) : (
                    cursosActivos.map(curso => (
                        <div key={curso.id} style={styles.cursoCard}>
                            <div style={{
                                ...styles.cardImage,
                                backgroundImage: `url(${getImagenUrl(curso.imagen || '')})`
                            }}>
                                <div style={{ ...styles.badge, ...styles.badgeActivo }}>
                                    ACTIVO
                                </div>
                                <div style={styles.cardOverlay}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Curso Destacado</div>
                                </div>
                            </div>
                            <div style={styles.cardContent}>
                                <h3 style={styles.cursoTitulo}>{curso.titulo}</h3>
                                <p style={styles.cursoDescripcion}>{curso.descripcion}</p>
                                <p style={styles.cursoFecha}>📅 {curso.fechaInicio} - {curso.fechaFin}</p>
                                {curso.categoria && (
                                    <span style={styles.cursoCategoria}>{curso.categoria}</span>
                                )}
                                <div style={styles.buttonGroup}>
                                    <button style={styles.botonEditar} onClick={() => handleEditarClick(curso)}>
                                        Editar
                                    </button>
                                    {/* 🆕 Botón Finalizar (amarillo) SOLO para cursos activos */}
                                    <button style={styles.botonFinalizar} onClick={() => handleFinalizarCurso(curso)}>
                                        Finalizar
                                    </button>
                                    <button style={styles.botonEliminar} onClick={() => handleEliminarCurso(curso)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Cursos Planificados */}
            <h2 style={styles.seccionTitulo}>Planificado</h2>
            <div style={styles.grid}>
                {cursosPlanificados.length === 0 ? (
                    <div style={styles.vacio}>No hay cursos planificados</div>
                ) : (
                    cursosPlanificados.map(curso => (
                        <div key={curso.id} style={styles.cursoCard}>
                            <div style={{
                                ...styles.cardImage,
                                backgroundImage: `url(${getImagenUrl(curso.imagen || '')})`
                            }}>
                                <div style={{ ...styles.badge, ...styles.badgePlanificado }}>
                                    PLANIFICADO
                                </div>
                                <div style={styles.cardOverlay}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Próximamente</div>
                                </div>
                            </div>
                            <div style={styles.cardContent}>
                                <h3 style={styles.cursoTitulo}>{curso.titulo}</h3>
                                <p style={styles.cursoDescripcion}>{curso.descripcion}</p>
                                <p style={styles.cursoFecha}>📅 {curso.fechaInicio} - {curso.fechaFin}</p>
                                {curso.categoria && (
                                    <span style={styles.cursoCategoria}>{curso.categoria}</span>
                                )}
                                <div style={styles.buttonGroup}>
                                    <button style={styles.botonEditar} onClick={() => handleEditarClick(curso)}>
                                        Editar
                                    </button>
                                    <button style={styles.botonOficializar} onClick={() => handleOficializarCurso(curso)}>
                                        Oficializar
                                    </button>
                                    <button style={styles.botonEliminar} onClick={() => handleEliminarCurso(curso)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 🆕 Cursos Finalizados */}
            <h2 style={styles.seccionTitulo}>Finalizados</h2>
            <div style={styles.grid}>
                {cursosFinalizados.length === 0 ? (
                    <div style={styles.vacio}>No hay cursos finalizados</div>
                ) : (
                    cursosFinalizados.map(curso => (
                        <div key={curso.id} style={styles.cursoCard}>
                            <div style={{
                                ...styles.cardImage,
                                backgroundImage: `url(${getImagenUrl(curso.imagen || '')})`
                            }}>
                                <div style={{ ...styles.badge, ...styles.badgeFinalizado }}>
                                    FINALIZADO
                                </div>
                                <div style={styles.cardOverlay}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Curso Completado</div>
                                </div>
                            </div>
                            <div style={styles.cardContent}>
                                <h3 style={styles.cursoTitulo}>{curso.titulo}</h3>
                                <p style={styles.cursoDescripcion}>{curso.descripcion}</p>
                                <p style={styles.cursoFecha}>📅 {curso.fechaInicio} - {curso.fechaFin}</p>
                                {curso.categoria && (
                                    <span style={styles.cursoCategoria}>{curso.categoria}</span>
                                )}
                                <div style={styles.buttonGroup}>
                                    <button style={styles.botonEliminar} onClick={() => handleEliminarCurso(curso)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
