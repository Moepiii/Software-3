import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { ApiError, createAdmin, deleteUser, listAdmins, type AdminUser } from '../../api';
import Card from '../../componentes/Tarjeta';
import Button from '../../componentes/Boton';

export default function AdminPanel({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoApellido, setNuevoApellido] = useState('');
    const [nuevoEmail, setNuevoEmail] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const cargarAdministradores = async () => {
        try {
            const data = await listAdmins();
            setAdmins(data);
        } catch (err) {
            console.error("Error conectando al endpoint /api/admins:", err);
            setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con el servidor');
        }
    };

    useEffect(() => {
        queueMicrotask(() => {
            void cargarAdministradores();
        });
    }, []);

    const handleCreateAdmin = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!nuevoEmail.endsWith('@admin.com')) {
            setErrorMsg('El correo del administrador debe terminar en @admin.com');
            return;
        }

        if (nuevaPassword.length < 6) {
            setErrorMsg('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            await createAdmin({
                cedula: `ADM-${Date.now().toString().slice(-6)}`,
                email: nuevoEmail,
                password: nuevaPassword,
                nombres: nuevoNombre,
                apellidos: nuevoApellido
            });

            setSuccessMsg('¡Administrador creado con éxito en la BD!');
            setNuevoNombre('');
            setNuevoApellido('');
            setNuevoEmail('');
            setNuevaPassword('');
            await cargarAdministradores();
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con el servidor');
        }
    };

    const handleDeleteAdmin = async (admin: AdminUser) => {
        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${admin.nombre} de la base de datos?`)) {
            try {
                await deleteUser(admin.id);
                setAdmins(prev => prev.filter(a => a.id !== admin.id));
                alert("Administrador eliminado correctamente.");
            } catch (err) {
                const message = err instanceof ApiError || err instanceof Error
                    ? err.message
                    : "Error de red al intentar conectar con el servidor.";
                alert(message);
            }
        }
    };

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
        roleToggle: {
            display: 'flex',
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            borderRadius: '9999px',
            padding: '4px'
        },
        roleActive: {
            backgroundColor: 'var(--primary-dark)',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: '9999px',
            fontWeight: 'bold',
            fontSize: '0.9rem'
        },
        grid: {
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap' as const,
            alignItems: 'start'
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
        cell: {
            padding: '14px 16px',
            color: isDarkMode ? '#f8fafc' : 'var(--text-main)'
        },
        tabContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px',
            padding: '12px 20px',
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
            borderRadius: '12px',
            border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7'}`
        },
        tableWrapper: {
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'}`,
            borderRadius: '12px',
            overflow: 'hidden' as const
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            textAlign: 'left' as const,
            fontSize: '0.95rem'
        },
        deleteButton: {
            padding: '6px 12px',
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
            color: '#ef4444',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.85rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <div>
                    <h1 style={styles.title}>Panel de Control Interno</h1>
                    <p style={styles.subtitle}>Gestión absoluta de cuentas administrativas</p>
                </div>

                <div style={styles.roleToggle}>
                    <div style={styles.roleActive}>Admin</div>
                </div>
            </div>

            <div style={styles.grid}>
                <div style={{ flex: '1', minWidth: '320px' }}>
                    <Card title="Registrar Nuevo Admin">
                        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={styles.label}>Nombres</label>
                                <input type="text" required value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} style={styles.input} placeholder="Juan" />
                            </div>
                            <div>
                                <label style={styles.label}>Apellidos</label>
                                <input type="text" required value={nuevoApellido} onChange={e => setNuevoApellido(e.target.value)} style={styles.input} placeholder="Pérez" />
                            </div>
                            <div>
                                <label style={styles.label}>Correo Electrónico (@admin.com)</label>
                                <input type="email" required value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} style={styles.input} placeholder="usuario@admin.com" />
                            </div>
                            <div>
                                <label style={styles.label}>Contraseña</label>
                                <input type="password" required value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} style={styles.input} placeholder="Mínimo 6 caracteres" />
                            </div>

                            {errorMsg && <p style={{ color: '#ef4444', margin: '5px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</p>}
                            {successMsg && <p style={{ color: '#10b981', margin: '5px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{successMsg}</p>}

                            <Button type="submit" fullWidth style={{ marginTop: '10px' }}>
                                Crear Administrador
                            </Button>
                        </form>
                    </Card>
                </div>

                <div style={{ flex: '2', minWidth: '450px' }}>
                    <Card title="Administradores Activos">
                        <div style={styles.tabContainer}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isDarkMode ? '#34d399' : 'var(--primary-dark)' }}>Total de Administradores:</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDarkMode ? '#34d399' : 'var(--primary-dark)' }}>{admins.length}</span>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderBottom: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'}` }}>
                                        <th style={styles.cell}>Nombre Completo</th>
                                        <th style={styles.cell}>Correo Electrónico</th>
                                        <th style={{ ...styles.cell, textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr key={admin.id} style={{ borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'}` }}>
                                            <td style={styles.cell}>{admin.nombre}</td>
                                            <td style={styles.cell}>{admin.email}</td>
                                            <td style={{ ...styles.cell, textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin)}
                                                    style={styles.deleteButton}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan={3} style={{ ...styles.cell, textAlign: 'center', color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>No hay administradores registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}