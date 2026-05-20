// Frontend/src/components/Admin.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';

interface AdminUser {
    id: string; // Representa la cédula en el backend
    nombres: string;
    apellidos: string;
    email: string;
}

export default function LobbyAdmin({ onLogout }: { onLogout: () => void }) {
    // Estado para almacenar los administradores reales traídos de la base de datos
    const [admins, setAdmins] = useState<AdminUser[]>([]);

    // Estados para controlar el formulario de creación
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoApellido, setNuevoApellido] = useState('');
    const [nuevoEmail, setNuevoEmail] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // 1. CARGAR ADMINISTRADORES EN TIEMPO REAL DESDE GO
    const cargarAdministradores = async () => {
        try {
            const res = await fetch('/api/admins');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Mapeamos los campos que nos envía el LoginUser de Go
                    const mapeados: AdminUser[] = data.map((u: any) => ({
                        id: u.id,
                        nombres: u.nombres || 'Admin',
                        apellidos: u.apellidos || '',
                        email: u.email
                    }));
                    setAdmins(mapeados);
                }
            }
        } catch (err) {
            console.error("Error conectando al endpoint /api/admins:", err);
        }
    };

    useEffect(() => {
        cargarAdministradores();
    }, []);

    // 2. CREAR ADMINISTRADOR REAL EN LA BASE DE DATOS
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
            const res = await fetch('/api/register/persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cedula: `ADM-${Date.now().toString().slice(-6)}`, // Cédula única aleatoria para el registro en Prisma
                    email: nuevoEmail,
                    password: nuevaPassword,
                    nombres: nuevoNombre,
                    apellidos: nuevoApellido
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'Error al guardar en la base de datos');
                return;
            }

            setSuccessMsg('¡Administrador creado con éxito en la BD!');

            // Limpiamos los campos del formulario
            setNuevoNombre('');
            setNuevoApellido('');
            setNuevoEmail('');
            setNuevaPassword('');

            // Refrescamos la lista llamando de nuevo al servidor para ver el cambio reflejado al instante
            await cargarAdministradores();
        } catch (err) {
            setErrorMsg('Error de conexión con el servidor');
        }
    };

    // 3. ELIMINAR ADMINISTRADOR REAL DE LA BASE DE DATOS
    const handleDeleteAdmin = async (admin: AdminUser) => {
        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${admin.nombres} de la base de datos?`)) {
            try {
                const res = await fetch(`/api/users/${admin.id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    // Lo removemos de la tabla visual filtrando la lista por id
                    setAdmins(prev => prev.filter(a => a.id !== admin.id));
                    alert("Administrador eliminado correctamente.");
                } else {
                    const data = await res.json();
                    alert(data.error || "No se pudo eliminar el usuario.");
                }
            } catch (err) {
                alert("Error de red al intentar conectar con el servidor.");
            }
        }
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#ffffff',
            color: '#000000',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px',
            boxSizing: 'border-box',
            fontFamily: 'sans-serif',
            overflowY: 'auto',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 999
        }}>
            {/* Cabecera superior del Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', width: '100%' }}>
                <div style={{ textAlign: 'left' }}>
                    <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#1e293b', fontWeight: 'bold' }}>Panel de Control Interno</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Gestión absoluta de cuentas administrativas</p>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', width: '100%' }}>

                {/* Bloque Izquierdo: Formulario */}
                <div style={{
                    flex: '1',
                    minWidth: '320px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    backgroundColor: '#f8fafc',
                    textAlign: 'left'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', fontWeight: 'bold' }}>Registrar Nuevo Admin</h3>
                    <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombres</label>
                            <input type="text" required value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} style={inputStyle} placeholder="Juan" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Apellidos</label>
                            <input type="text" required value={nuevoApellido} onChange={e => setNuevoApellido(e.target.value)} style={inputStyle} placeholder="Pérez" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Correo Electrónico (@admin.com)</label>
                            <input type="email" required value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} style={inputStyle} placeholder="usuario@admin.com" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Contraseña</label>
                            <input type="password" required value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} style={inputStyle} placeholder="Mínimo 6 caracteres" />
                        </div>

                        {errorMsg && <p style={{ color: '#ef4444', margin: '5px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</p>}
                        {successMsg && <p style={{ color: '#10b981', margin: '5px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{successMsg}</p>}

                        <button type="submit" style={{ padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
                            Crear Administrador
                        </button>
                    </form>
                </div>

                {/* Bloque Derecho: Tabla Dinámica */}
                <div style={{ flex: '2', minWidth: '450px' }}>
                    <div style={{
                        ...tabContainerStyle
                    }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e40af' }}>Total de Administradores Activos:</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>{admins.length}</span>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                    <th style={cellStyle}>Nombre Completo</th>
                                    <th style={cellStyle}>Correo Electrónico</th>
                                    <th style={{ ...cellStyle, textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
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
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '1rem',
    boxSizing: 'border-box'
};

const cellStyle: React.CSSProperties = {
    padding: '14px 16px',
    color: '#334155'
};

const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    padding: '12px 20px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '1px solid #bfdbfe'
};