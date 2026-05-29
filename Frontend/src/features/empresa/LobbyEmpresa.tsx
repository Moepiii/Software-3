export default function LobbyEmpresa({ onLogout }: { onLogout: () => void }) {
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 100
        }}>
            <h1>Portal de Empresa</h1>
            <p style={{ color: '#475569' }}>Gestiona los residuos de tu organización aquí.</p>

            <button
                onClick={onLogout}
                style={{
                    marginTop: '20px',
                    padding: '10px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                Cerrar Sesión
            </button>
        </div>
    );
}
