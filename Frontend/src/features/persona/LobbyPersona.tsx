import React, { useState } from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';

export default function LobbyPersona() {
    const [estado, setEstado] = useState('Madrid');
    const [kgBasura, setKgBasura] = useState('120');

    const estadosVenezuela = [
        "1. Amazonas", "2. Anzoátegui", "3. Apure", "4. Aragua", "5. Barinas",
        "6. Bolívar", "7. Carabobo", "8. Cojedes", "9. Delta Amacuro", "10. Distrito Capital",
        "11. Falcón", "12. Guárico", "13. Lara", "14. Mérida", "15. Miranda",
        "16. Monagas", "17. Nueva Esparta", "18. Portuguesa", "19. Sucre", "20. Táchira",
        "21. Trujillo", "22. La Guaira", "23. Yaracuy", "24. Zulia", "25. Zona en Reclamación", "Madrid"
    ];

    return (
        <div style={containerStyle}>
            <div style={headerSectionStyle}>
                <div>
                    <h1 style={titleStyle}>General Tax Dashboard</h1>
                    <p style={subtitleStyle}>Simulate your environmental contribution based on regional regulations.</p>
                </div>
                
                <div style={roleToggleStyle}>
                    <div style={roleActiveStyle}>Particular</div>
                    <div style={roleInactiveStyle}>Empresa</div>
                </div>
            </div>

            <div style={gridStyle}>
                <div style={columnStyle}>
                    <Card title="⚙ Configuration">
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Estado/Comunidad</label>
                            <select value={estado} onChange={(e) => setEstado(e.target.value)} style={inputStyle}>
                                {estadosVenezuela.map((est, idx) => (
                                    <option key={idx} value={est}>{est}</option>
                                ))}
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Kg de basura producidos (Mensual)</label>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', paddingRight: '12px' }}>
                                <input 
                                    type="number" 
                                    value={kgBasura} 
                                    onChange={(e) => setKgBasura(e.target.value)} 
                                    style={{ ...inputStyle, border: 'none', backgroundColor: 'transparent' }} 
                                />
                                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>kg</span>
                            </div>
                        </div>
                        <div style={infoBoxStyle}>
                            En {estado || 'su región'}, el cálculo incluye vinculación con la referencia catastral para el tramo fijo.
                        </div>
                    </Card>

                    <Card variant="dark">
                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px 0', color: '#fff' }}>Your Impact</h3>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Based on your current waste production, you are in the top 15% of sustainable users in your area.
                        </p>
                        <div style={progressBarContainerStyle}>
                            <div style={progressBarStyle}></div>
                        </div>
                    </Card>
                </div>

                <div style={columnStyle}>
                    <Card title="Calculation Logic">
                        <div style={calcRowStyle}>
                            <span style={calcLabelStyle}>Tasa Base</span>
                            <span style={calcValueStyle}>15.00€</span>
                        </div>
                        <div style={{ ...calcRowStyle, borderBottom: 'none', marginBottom: '20px' }}>
                            <span style={calcLabelStyle}>Coste Variable (kg)</span>
                            <span style={calcValueStyle}>48.00€</span>
                        </div>
                        <Button fullWidth>
                            <span style={{ fontSize: '1.2rem' }}>👤</span> Ir a mi Perfil
                        </Button>
                    </Card>
                </div>

                <div style={columnStyle}>
                    <Card variant="highlight" title="RESULTADOS ESTIMADOS">
                        <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Coste Total Estimado</p>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '3.5rem', color: 'var(--primary-dark)' }}>63.00€</h2>
                        
                        <div style={priceBoxStyle}>
                            <div style={iconBoxStyle}>📊</div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Precio por Kilo</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>0.40€/kg</div>
                            </div>
                        </div>
                        
                        <div style={blueBoxStyle}>
                            Valores actualizados según BOCM/DOGC 2024
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Evolución Estimada" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:'8px',height:'8px',backgroundColor:'var(--primary-dark)',borderRadius:'50%'}}></div> Tu Tasa</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:'8px',height:'8px',backgroundColor:'#cbd5e1',borderRadius:'50%'}}></div> Media Regional</span>
                </div>
                <div style={chartContainerStyle}>
                    {/* Mocked Chart Bars */}
                    <div style={barWrapperStyle}>
                        <div style={{ ...barStyle, height: '40%', backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ ...barStyle, height: '30%', backgroundColor: '#bfdbfe' }}></div>
                    </div>
                    <div style={barWrapperStyle}>
                        <div style={{ ...barStyle, height: '60%', backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ ...barStyle, height: '80%', backgroundColor: 'var(--primary-dark)' }}></div>
                    </div>
                    <div style={barWrapperStyle}>
                        <div style={{ ...barStyle, height: '50%', backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ ...barStyle, height: '40%', backgroundColor: '#bfdbfe' }}></div>
                    </div>
                    <div style={barWrapperStyle}>
                        <div style={{ ...barStyle, height: '70%', backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ ...barStyle, height: '60%', backgroundColor: '#bfdbfe' }}></div>
                    </div>
                    <div style={barWrapperStyle}>
                        <div style={{ ...barStyle, height: '40%', backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ ...barStyle, height: '90%', backgroundColor: '#a7f3d0' }}></div>
                    </div>
                    <div style={barWrapperStyle}>
                        <div style={{ ...barStyle, height: '55%', backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ ...barStyle, height: '100%', backgroundColor: 'var(--primary-dark)' }}></div>
                    </div>
                </div>
            </Card>
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

const progressBarContainerStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden'
};

const progressBarStyle: React.CSSProperties = {
    width: '85%',
    backgroundColor: 'var(--primary-light)',
    height: '100%',
    borderRadius: '5px'
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

const blueBoxStyle: React.CSSProperties = {
    backgroundColor: '#eff6ff',
    color: '#1e3a8a',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    textAlign: 'center',
    fontWeight: 500
};

const chartContainerStyle: React.CSSProperties = {
    height: '200px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: '20px',
    borderBottom: '1px solid var(--border-color)'
};

const barWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    height: '100%',
    gap: '5px',
    width: '40px'
};

const barStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    minWidth: '15px'
};
