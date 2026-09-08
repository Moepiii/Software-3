interface VistaInicioProps {
  isDarkMode?: boolean;
}

export function VistaInicio({ isDarkMode = false }: VistaInicioProps) {
  const colors = isDarkMode ? {
    page: '#0f172a',
    surface: '#1e293b',
    mutedSurface: '#0f172a',
    border: '#334155',
    heading: '#ffffff',
    text: '#cbd5e1',
    accent: '#34d399',
    soft: 'rgba(16, 185, 129, 0.15)',
  } : {
    page: '#f8fafc',
    surface: 'var(--welcome-surface)',
    mutedSurface: 'var(--welcome-surface-muted)',
    border: 'var(--welcome-border)',
    heading: 'var(--welcome-text)',
    text: 'var(--welcome-text-muted)',
    accent: 'var(--welcome-accent)',
    soft: 'var(--welcome-accent-soft)',
  };

  return (
    <div style={{ backgroundColor: colors.page, minHeight: '100%', width: '100%', overflowX: 'hidden' }}>
      <section style={{ backgroundColor: colors.page, padding: '4rem 0' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          minWidth: 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: colors.soft,
              color: colors.heading,
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              width: 'fit-content',
              maxWidth: '100%',
            }}>
              🌍 PROGRAMA FISCAL VENEZUELA 2026
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: colors.heading, margin: 0, lineHeight: 1.2 }}>
              Menos residuos,
              <br />
              <span style={{ color: colors.accent }}>menos impuestos.</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: colors.text, maxWidth: '500px', lineHeight: 1.6 }}>
              EcoLogic convierte tus acciones de reciclaje en beneficios fiscales medibles en bolívares.
              Simple, transparente y adaptado a tu estado.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: '1rem', maxWidth: '400px' }}>
              <div style={{ backgroundColor: colors.surface, borderRadius: '1rem', border: `1px solid ${colors.border}`, padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>Ahorro anual promedio</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.heading }}>Bs. 12.000</p>
              </div>
              <div style={{ backgroundColor: colors.surface, borderRadius: '1rem', border: `1px solid ${colors.border}`, padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>Impacto mensual</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.heading }}>Bs. 1.350</p>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', minWidth: 0 }}>
            <div style={{ backgroundColor: colors.surface, borderRadius: '1.5rem', border: `1px solid ${colors.border}`, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: colors.heading }}>Cobertura nacional</h2>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: colors.soft, color: colors.heading, fontSize: '0.7rem', fontWeight: 'bold' }}>Venezuela</span>
              </div>

              <div style={{ borderRadius: '1rem', overflow: 'hidden', border: `1px solid ${colors.border}`, backgroundColor: colors.mutedSurface, padding: '0.75rem' }}>
                <img src="/src/assets/mapa_venezuela.png" alt="Mapa de Venezuela" style={{ display: 'block', width: '100%', height: '260px', objectFit: 'contain' }} />
              </div>

              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '0.75rem' }}>
                <div style={{ borderRadius: '0.75rem', backgroundColor: colors.mutedSurface, border: `1px solid ${colors.border}`, padding: '0.75rem' }}>
                  <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>Estados con mayor adopción</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: colors.heading }}>Miranda, Carabobo, Distrito Capital</p>
                </div>
                <div style={{ borderRadius: '0.75rem', backgroundColor: colors.mutedSurface, border: `1px solid ${colors.border}`, padding: '0.75rem' }}>
                  <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>Meta 2026</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: colors.heading }}>+40.000 hogares afiliados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', backgroundColor: colors.page }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', minWidth: 0 }}>
          {[
            ['♻️', 'Registra tu reciclaje', 'Sube tus datos mensuales y obtén métricas de impacto en tiempo real.'],
            ['📊', 'Calcula tu beneficio', 'Visualiza tu reducción fiscal estimada en Bs. según tu estado.'],
            ['✅', 'Cumple con normativa', 'Mantén trazabilidad y respaldo para tus reportes municipales.'],
          ].map(([icon, title, description]) => (
            <div key={title} style={{ borderRadius: '1rem', border: `1px solid ${colors.border}`, backgroundColor: colors.surface, padding: '1.5rem', minWidth: 0 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: colors.heading }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: colors.text, lineHeight: 1.5 }}>{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
