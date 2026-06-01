import React from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';

interface LobbyEmpresaProps {
    onLogout?: () => void;
    isDarkMode?: boolean;
}

export default function LobbyEmpresa({ onLogout, isDarkMode = false }: LobbyEmpresaProps) {
    return (
        <div style={containerStyle}>
            <div style={headerSectionStyle}>
                <div>
                    <h1 style={{ ...titleStyle, color: isDarkMode ? '#f8fafc' : 'var(--primary-dark)' }}>Corporate Tax Dashboard</h1>
                    <p style={{ ...subtitleStyle, color: isDarkMode ? '#94a3b8' : 'var(--text-muted)' }}>Manage your organization's environmental contributions and waste tracking.</p>
                </div>

                <div style={roleToggleStyle}>
                    <div style={roleInactiveStyle}>Particular</div>
                    <div style={roleActiveStyle}>Empresa</div>
                </div>
            </div>

            <div style={gridStyle}>
                <div style={columnStyle}>
                    <Card title="🏢 Enterprise Info">
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Razón Social</label>
                            <input type="text" value="EcoCorp Solutions S.L." readOnly style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Sede Principal</label>
                            <input type="text" value="Barcelona" readOnly style={inputStyle} />
                        </div>
                        <div style={infoBoxStyle}>
                            El cálculo industrial considera factores de riesgo ambiental y volumen de residuos especiales.
                        </div>
                    </Card>
                </div>

                <div style={columnStyle}>
                    <Card title="Monthly Production">
                        <div style={calcRowStyle}>
                            <span style={calcLabelStyle}>Plástico Industrial</span>
                            <span style={calcValueStyle}>1,200 kg</span>
                        </div>
                        <div style={{ ...calcRowStyle, borderBottom: 'none', marginBottom: '20px' }}>
                            <span style={calcLabelStyle}>Desechos Orgánicos</span>
                            <span style={calcValueStyle}>450 kg</span>
                        </div>
                        <Button fullWidth variant="primary">
                            <span style={{ fontSize: '1.2rem' }}>📄</span> Generar Reporte
                        </Button>
                    </Card>
                </div>

                <div style={columnStyle}>
                    <Card variant="highlight" title="ESTADO DE CUENTA">
                        <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Impuesto Corporativo Mensual</p>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '3.5rem', color: 'var(--primary-dark)' }}>4,250.00€</h2>

                        <div style={priceBoxStyle}>
                            <div style={iconBoxStyle}>🏭</div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Tasa Industrial</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>2.50€/kg</div>
                            </div>
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
    fontSize: '2rem'
};

const subtitleStyle: React.CSSProperties = {
    margin: '5px 0 0 0'
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

const roleInactiveStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    padding: '8px 20px',
    borderRadius: '9999px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    alignItems: 'start'
};

const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const inputGroupStyle: React.CSSProperties = {
    marginBottom: '15px'
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
    outline: 'none'
};

const infoBoxStyle: React.CSSProperties = {
    backgroundColor: '#f0fdf4',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: 'var(--primary-dark)',
    marginTop: '5px'
};

const calcRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    borderBottom: '1px solid var(--border-color)'
};

const calcLabelStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: '1rem'
};

const calcValueStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1.1rem'
};

const priceBoxStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    marginBottom: '20px'
};

const iconBoxStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem'
};