interface VistaInicioProps {
  isDarkMode?: boolean;
}

export function VistaInicio({ isDarkMode = false }: VistaInicioProps) {
  // Estilos base para el contenedor principal
  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    minHeight: '100%',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        padding: '4rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          {/* Columna izquierda - Texto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
              color: isDarkMode ? '#34d399' : '#065a46',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              width: 'fit-content'
            }}>
              🌍 PROGRAMA FISCAL VENEZUELA 2026
            </div>

            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#065a46',
              margin: 0,
              lineHeight: 1.2
            }}>
              Menos residuos,
              <br />
              <span style={{ color: isDarkMode ? '#34d399' : '#059669' }}>menos impuestos.</span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: isDarkMode ? '#cbd5e1' : '#4b5563',
              maxWidth: '500px',
              lineHeight: 1.6
            }}>
              EcoTax convierte tus acciones de reciclaje en beneficios fiscales medibles en bolívares.
              Simple, transparente y adaptado a tu estado.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              maxWidth: '400px'
            }}>
              <div style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderRadius: '1rem',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                padding: '1rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Ahorro anual promedio</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isDarkMode ? '#34d399' : '#065a46' }}>Bs. 12.000</p>
              </div>
              <div style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderRadius: '1rem',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                padding: '1rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Impacto mensual</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isDarkMode ? '#34d399' : '#065a46' }}>Bs. 1.350</p>
              </div>
            </div>
          </div>

          {/* Columna derecha - Mapa */}
          <div style={{ position: 'relative' }}>
            <div style={{
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderRadius: '1.5rem',
              border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#065a46' }}>Cobertura nacional</h2>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                  color: isDarkMode ? '#34d399' : '#065a46',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  Venezuela
                </span>
              </div>

              <div style={{
                borderRadius: '1rem',
                overflow: 'hidden',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                padding: '0.75rem'
              }}>
                <img
                  src="/src/assets/mapa_venezuela.png"
                  alt="Mapa de Venezuela"
                  style={{ width: '100%', height: '260px', objectFit: 'contain' }}
                />
              </div>

              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{
                  borderRadius: '0.75rem',
                  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                  padding: '0.75rem'
                }}>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Estados con mayor adopción</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: isDarkMode ? '#34d399' : '#065a46' }}>Miranda, Carabobo, Distrito Capital</p>
                </div>
                <div style={{
                  borderRadius: '0.75rem',
                  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                  padding: '0.75rem'
                }}>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Meta 2026</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: isDarkMode ? '#34d399' : '#065a46' }}>+40.000 hogares afiliados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1.5rem',
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            borderRadius: '1rem',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>♻️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: isDarkMode ? '#ffffff' : '#065a46' }}>Registra tu reciclaje</h3>
            <p style={{ fontSize: '0.9rem', color: isDarkMode ? '#cbd5e1' : '#6b7280', lineHeight: 1.5 }}>Sube tus datos mensuales y obtén métricas de impacto en tiempo real.</p>
          </div>

          <div style={{
            borderRadius: '1rem',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: isDarkMode ? '#ffffff' : '#065a46' }}>Calcula tu beneficio</h3>
            <p style={{ fontSize: '0.9rem', color: isDarkMode ? '#cbd5e1' : '#6b7280', lineHeight: 1.5 }}>Visualiza tu reducción fiscal estimada en Bs. según tu estado.</p>
          </div>

          <div style={{
            borderRadius: '1rem',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: isDarkMode ? '#ffffff' : '#065a46' }}>Cumple con normativa</h3>
            <p style={{ fontSize: '0.9rem', color: isDarkMode ? '#cbd5e1' : '#6b7280', lineHeight: 1.5 }}>Mantén trazabilidad y respaldo para tus reportes municipales.</p>
          </div>
        </div>
      </section>
    </div>
  );
}