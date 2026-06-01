import React, { useState, useEffect } from 'react';
import type { FormEvent, CSSProperties } from 'react';
import { ApiError, createAdmin, deleteUser, listAdmins, type AdminUser } from '../../api';
import Card from '../../shared/Card';
import Button from '../../shared/Button';

export default function AdminPanel() {
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
        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${admin.nombres} de la base de datos?`)) {
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

    return (
        <div style={containerStyle}>
            <div style={headerSectionStyle}>
                <div>
                    <h1 style={titleStyle}>Panel de Control Interno</h1>
                    <p style={subtitleStyle}>Gestión absoluta de cuentas administrativas</p>
                </div>
                
                <div style={roleToggleStyle}>
                    <div style={roleActiveStyle}>Admin</div>
                </div>
            </div>

            <div style={gridStyle}>
                <div style={{ flex: '1', minWidth: '320px' }}>
                    <Card title="Registrar Nuevo Admin">
                        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Nombres</label>
                                <input type="text" required value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} style={inputStyle} placeholder="Juan" />
                            </div>
                            <div>
                                <label style={labelStyle}>Apellidos</label>
                                <input type="text" required value={nuevoApellido} onChange={e => setNuevoApellido(e.target.value)} style={inputStyle} placeholder="Pérez" />
                            </div>
                            <div>
                                <label style={labelStyle}>Correo Electrónico (@admin.com)</label>
                                <input type="email" required value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} style={inputStyle} placeholder="usuario@admin.com" />
                            </div>
                            <div>
                                <label style={labelStyle}>Contraseña</label>
                                <input type="password" required value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} style={inputStyle} placeholder="Mínimo 6 caracteres" />
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
                        <div style={tabContainerStyle}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>Total de Administradores:</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{admins.length}</span>
                        </div>

                        <div style={tableWrapperStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={cellStyle}>Nombre Completo</th>
                                        <th style={cellStyle}>Correo Electrónico</th>
                                        <th style={{ ...cellStyle, textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={cellStyle}>{admin.nombres} {admin.apellidos}</td>
                                            <td style={cellStyle}>{admin.email}</td>
                                            <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#fee2e2',
                                                        color: '#ef4444',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan={3} style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No hay administradores registrados.</td>
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

const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const headerSectionStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '2rem',
    color: 'var(--primary-dark)'
};

const subtitleStyle: React.CSSProperties = {
    margin: '5px 0 0 0',
    color: 'var(--text-muted)'
};

const roleToggleStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    padding: '4px'
};

const roleActiveStyle: React.CSSProperties = {
    backgroundColor: 'var(--primary-dark)',
    color: '#ffffff',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontWeight: 'bold',
    fontSize: '0.9rem'
};

const gridStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'start'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
    marginBottom: '5px'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#f1f5f9',
    fontSize: '1rem',
    color: 'var(--text-main)',
    outline: 'none',
    boxSizing: 'border-box'
};

const cellStyle: CSSProperties = {
    padding: '14px 16px',
    color: 'var(--text-main)'
};

const tabContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    padding: '12px 20px',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    border: '1px solid #dcfce7'
};

const tableWrapperStyle: CSSProperties = {
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    overflow: 'hidden'
};

const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.95rem'
};
