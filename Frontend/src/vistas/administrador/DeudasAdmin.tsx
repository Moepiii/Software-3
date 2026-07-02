import { useState, useEffect } from 'react';
import { listUsuariosConDeuda, updateUserDebt, type UsuarioConDeuda } from '../../api';
import Card from '../../componentes/Tarjeta';
import Button from '../../componentes/Boton';

export default function DeudasAdmin({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const [usuarios, setUsuarios] = useState<UsuarioConDeuda[]>([]);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Estado para la edición
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioConDeuda | null>(null);
    const [nuevoMonto, setNuevoMonto] = useState<string>('');

    const cargarUsuarios = async () => {
        setCargando(true);
        setErrorMsg('');
        try {
            const data = await listUsuariosConDeuda();
            setUsuarios(data);
        } catch (err) {
            console.error("Error cargando usuarios:", err);
            setErrorMsg(err instanceof Error ? err.message : 'Error al obtener la lista de usuarios');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => {
            void cargarUsuarios();
        });
    }, []);

    const handleSelectUsuario = (u: UsuarioConDeuda) => {
        setUsuarioSeleccionado(u);
        setNuevoMonto(u.deuda_monto.toString());
        setSuccessMsg('');
        setErrorMsg('');
    };

    const handleSaveDebt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuarioSeleccionado) return;
        setErrorMsg('');
        setSuccessMsg('');

        const monto = parseFloat(nuevoMonto);
        if (isNaN(monto) || monto < 0) {
            setErrorMsg('El monto debe ser un número válido mayor o igual a 0');
            return;
        }

        try {
            await updateUserDebt(usuarioSeleccionado.id, monto);
            setSuccessMsg(`Deuda de ${usuarioSeleccionado.nombre} actualizada correctamente.`);
            setUsuarioSeleccionado(null);
            setNuevoMonto('');
            await cargarUsuarios();
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con el servidor');
        }
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(u => {
        const busqueda = filtro.toLowerCase();
        return (
            u.nombre.toLowerCase().includes(busqueda) ||
            u.email.toLowerCase().includes(busqueda) ||
            (u.identificacion && u.identificacion.toLowerCase().includes(busqueda))
        );
    });

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '20px'
        },
        headerSection: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
        },
        title: {
            margin: 0,
            fontSize: '2rem',
            color: isDarkMode ? '#f8fafc' : 'var(--primary-dark)'
        },
        subtitle: {
            margin: '5px 0 0 0',
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
        },
        grid: {
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap' as const,
            alignItems: 'start'
        },
        searchBox: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'var(--border-color)'}`,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
            color: isDarkMode ? '#f8fafc' : 'var(--text-main)',
            fontSize: '1rem',
            outline: 'none',
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
            marginBottom: '5px'
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'var(--border-color)'}`,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            fontSize: '1rem',
            color: isDarkMode ? '#f8fafc' : 'var(--text-main)',
            outline: 'none',
            boxSizing: 'border-box' as const
        },
        tableWrapper: {
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'}`,
            borderRadius: '12px',
            overflow: 'hidden' as const,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#ffffff'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            textAlign: 'left' as const,
            fontSize: '0.95rem'
        },
        cell: {
            padding: '14px 16px',
            color: isDarkMode ? '#f8fafc' : 'var(--text-main)'
        },
        headerCell: {
            padding: '14px 16px',
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
            fontWeight: 'bold'
        },
        badge: (tipo: string) => ({
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 'bold' as const,
            backgroundColor: tipo === 'NATURAL' 
                ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe')
                : (isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'),
            color: tipo === 'NATURAL' ? '#2563eb' : '#d97706'
        }),
        badgeDeuda: (vigente: boolean) => ({
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 'bold' as const,
            backgroundColor: vigente 
                ? (isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2')
                : (isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5'),
            color: vigente ? '#ef4444' : '#10b981'
        }),
        actionButton: {
            padding: '6px 12px',
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
            color: '#10b981',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            transition: 'background-color 0.2s'
        },
        cancelButton: {
            padding: '10px 16px',
            backgroundColor: 'transparent',
            color: isDarkMode ? '#f8fafc' : 'var(--text-main)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'var(--border-color)'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            marginRight: '10px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <div>
                    <h1 style={styles.title}>Control de Deudas de Usuarios</h1>
                    <p style={styles.subtitle}>Establece y modifica la deuda registrada de los clientes en la plataforma</p>
                </div>
            </div>

            {errorMsg && <p style={{ color: '#ef4444', margin: '5px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{errorMsg}</p>}
            {successMsg && <p style={{ color: '#10b981', margin: '5px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{successMsg}</p>}

            <div style={styles.grid}>
                {/* Listado de usuarios */}
                <div style={{ flex: '2', minWidth: '450px' }}>
                    <Card title="Clientes Registrados">
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre, email o identificación..." 
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                            style={styles.searchBox}
                        />

                        {cargando ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>Cargando usuarios...</p>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderBottom: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'}` }}>
                                            <th style={styles.headerCell}>Cliente</th>
                                            <th style={styles.headerCell}>Identificación</th>
                                            <th style={styles.headerCell}>Tipo</th>
                                            <th style={styles.headerCell}>Deuda</th>
                                            <th style={{ ...styles.headerCell, textAlign: 'center' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuariosFiltrados.map((u) => (
                                            <tr key={u.id} style={{ borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'}` }}>
                                                <td style={styles.cell}>
                                                    <div style={{ fontWeight: 'bold' }}>{u.nombre}</div>
                                                    <div style={{ fontSize: '0.8rem', color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>{u.email}</div>
                                                </td>
                                                <td style={styles.cell}>{u.identificacion || '-'}</td>
                                                <td style={styles.cell}>
                                                    <span style={styles.badge(u.tipo)}>{u.tipo}</span>
                                                </td>
                                                <td style={styles.cell}>
                                                    <div style={{ fontWeight: 'bold' }}>{u.deuda_monto.toFixed(2)} Bs</div>
                                                    <span style={styles.badgeDeuda(u.deuda_vigente)}>
                                                        {u.deuda_vigente ? 'Vigente' : 'Solvente'}
                                                    </span>
                                                </td>
                                                <td style={{ ...styles.cell, textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => handleSelectUsuario(u)}
                                                        style={styles.actionButton}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5'}
                                                    >
                                                        Modificar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {usuariosFiltrados.length === 0 && (
                                            <tr>
                                                <td colSpan={5} style={{ ...styles.cell, textAlign: 'center', color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>No se encontraron clientes.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Formulario de actualización de deuda */}
                {usuarioSeleccionado && (
                    <div style={{ flex: '1', minWidth: '320px' }}>
                        <Card title={`Modificar Deuda`}>
                            <div style={{ marginBottom: '15px', color: isDarkMode ? '#f8fafc' : 'var(--text-main)' }}>
                                <p style={{ margin: '0 0 5px 0' }}><strong>Usuario:</strong> {usuarioSeleccionado.nombre}</p>
                                <p style={{ margin: '0 0 5px 0' }}><strong>Identificación:</strong> {usuarioSeleccionado.identificacion || 'N/A'}</p>
                                <p style={{ margin: '0' }}><strong>Deuda Actual:</strong> {usuarioSeleccionado.deuda_monto.toFixed(2)} Bs</p>
                            </div>

                            <form onSubmit={handleSaveDebt} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={styles.label}>Nuevo Monto de Deuda (Bs)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        required 
                                        value={nuevoMonto} 
                                        onChange={e => setNuevoMonto(e.target.value)} 
                                        style={styles.input} 
                                        placeholder="0.00" 
                                    />
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>
                                        Establecer el monto en 0 marcará al usuario como solvente.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setUsuarioSeleccionado(null)} 
                                        style={styles.cancelButton}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Cancelar
                                    </button>
                                    <Button type="submit">
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
