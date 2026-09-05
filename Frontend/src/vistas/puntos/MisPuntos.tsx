import { useCallback, useEffect, useState } from 'react';
import {
  getResumenPuntos,
  type CursoPuntosResumen,
  type ResumenPuntosResponse,
} from '../../api/usuario';

type MisPuntosProps = {
  isDarkMode?: boolean;
};

export default function MisPuntos({ isDarkMode = false }: MisPuntosProps) {
  const [resumen, setResumen] = useState<ResumenPuntosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setResumen(await getResumenPuntos());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar tus puntos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void cargar(), 0);
    return () => window.clearTimeout(timer);
  }, [cargar]);

  const colors = {
    page: isDarkMode ? '#0f172a' : 'var(--bg-main)',
    card: isDarkMode ? '#1e293b' : 'var(--surface)',
    border: isDarkMode ? '#334155' : 'var(--border-color)',
    text: isDarkMode ? '#f8fafc' : 'var(--text-main)',
    muted: isDarkMode ? '#a5b4c6' : 'var(--text-muted)',
    accent: isDarkMode ? '#4ade80' : 'var(--primary-700)',
    soft: isDarkMode ? '#12372f' : '#ecf8f2',
  };

  const card: React.CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(16px, 2vw, 24px)',
    minWidth: 0,
    overflowWrap: 'anywhere',
    boxShadow: isDarkMode ? 'none' : 'var(--shadow-md)',
  };

  if (loading) {
    return (
      <section aria-live="polite" aria-busy="true" style={{ ...card, color: colors.muted }}>
        Cargando tu progreso ambiental…
      </section>
    );
  }

  if (error) {
    return (
      <section role="alert" style={{ ...card, textAlign: 'center', color: colors.text }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
        <h1 style={{ margin: '0 0 8px' }}>No pudimos consultar tus puntos</h1>
        <p style={{ color: colors.muted, margin: '0 0 18px' }}>{error}</p>
        <button onClick={() => void cargar()} style={buttonStyle}>Reintentar</button>
      </section>
    );
  }

  if (!resumen) return null;

  const sinPuntos = resumen.puntos_totales === 0;
  const cursosActivos = resumen.cursos_activos ?? [];
  const cursosCompletados = resumen.cursos_completados ?? [];
  const textoProgreso = resumen.nivel_maximo
    ? 'Ya alcanzaste el máximo beneficio disponible.'
    : `Te faltan ${resumen.puntos_faltantes} puntos para llegar a ${resumen.siguiente_nivel}.`;

  return (
    <section style={{ color: colors.text, background: colors.page, borderRadius: '22px', padding: 'clamp(16px, 3vw, 32px)' }}>
      <header style={{ marginBottom: '24px' }}>
        <span style={{ color: colors.accent, fontWeight: 800, letterSpacing: '.08em', fontSize: '.75rem' }}>
          RECOMPENSAS ECOLÓGICAS
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '6px 0 8px', lineHeight: 1.05 }}>Mis Puntos</h1>
        <p style={{ color: colors.muted, margin: 0, maxWidth: '650px' }}>
          Tu aprendizaje se transforma en beneficios para el impuesto de basura.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '16px', marginBottom: '16px' }}>
        <article style={{ ...card, background: 'linear-gradient(135deg, #075f49, #0f8a63)', color: '#fff' }}>
          <div style={{ opacity: .8, fontSize: '.8rem', fontWeight: 700 }}>PUNTOS ACUMULADOS</div>
          <strong style={{ display: 'block', fontSize: '3rem', lineHeight: 1.1, marginTop: '10px' }}>{resumen.puntos_totales}</strong>
          <span style={{ opacity: .85 }}>puntos totales</span>
        </article>

        <article style={card}>
          <div style={{ color: colors.muted, fontSize: '.8rem', fontWeight: 700 }}>NIVEL ACTUAL</div>
          <strong style={{ display: 'block', fontSize: '1.55rem', margin: '12px 0 8px' }}>{resumen.nivel_actual}</strong>
          <span style={{ color: colors.muted }}>{sinPuntos ? 'Tu recorrido comienza aquí.' : 'Sigue aprendiendo para avanzar.'}</span>
        </article>

        <article style={{ ...card, background: colors.soft }}>
          <div style={{ color: colors.muted, fontSize: '.8rem', fontWeight: 700 }}>DESCUENTO APLICABLE</div>
          <strong style={{ display: 'block', color: colors.accent, fontSize: '3rem', lineHeight: 1.1, marginTop: '10px' }}>
            {resumen.descuento_porcentaje}%
          </strong>
          <span style={{ color: colors.muted }}>en el impuesto de basura</span>
        </article>
      </div>

      <article style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{resumen.nivel_maximo ? 'Beneficio máximo' : 'Progreso al siguiente nivel'}</h2>
          <strong style={{ color: colors.accent }}>{resumen.progreso_porcentaje}%</strong>
        </div>
        <progress
          aria-label="Progreso hacia el siguiente nivel"
          value={resumen.progreso_porcentaje}
          max={100}
          style={{ width: '100%', height: '18px', margin: '18px 0 10px', accentColor: '#0f8a63' }}
        >
          {resumen.progreso_porcentaje}%
        </progress>
        <p style={{ margin: 0, color: colors.muted }}>{textoProgreso}</p>
        {sinPuntos && (
          <p style={{ margin: '16px 0 0', padding: '14px', borderRadius: '12px', background: colors.soft }}>
            Completa etapas de tus cursos para comenzar a acumular puntos y desbloquear descuentos.
          </p>
        )}
        <p style={{ margin: '16px 0 0', fontSize: '.85rem', color: colors.muted }}>{resumen.beneficio}</p>
      </article>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginTop: '16px' }}>
        <section style={card} aria-labelledby="cursos-activos-titulo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 id="cursos-activos-titulo" style={{ margin: 0, fontSize: '1.2rem' }}>Cursos activos</h2>
            <span style={countStyle}>{cursosActivos.length}</span>
          </div>
          {cursosActivos.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>No tienes cursos activos actualmente.</p>
          ) : cursosActivos.map((curso) => (
            <CursoProgreso key={curso.curso_id} curso={curso} mutedColor={colors.muted} softColor={colors.soft} accentColor={colors.accent} />
          ))}
        </section>

        <section style={card} aria-labelledby="cursos-completados-titulo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 id="cursos-completados-titulo" style={{ margin: 0, fontSize: '1.2rem' }}>Cursos completados</h2>
            <span style={countStyle}>{cursosCompletados.length}</span>
          </div>
          {cursosCompletados.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Cuando completes un curso aparecerá aquí.</p>
          ) : cursosCompletados.map((curso) => (
            <CursoProgreso key={curso.curso_id} curso={curso} mutedColor={colors.muted} softColor={colors.soft} accentColor={colors.accent} completado />
          ))}
        </section>
      </div>
    </section>
  );
}

function CursoProgreso({
  curso,
  mutedColor,
  softColor,
  accentColor,
  completado = false,
}: {
  curso: CursoPuntosResumen;
  mutedColor: string;
  softColor: string;
  accentColor: string;
  completado?: boolean;
}) {
  return (
    <article style={{ padding: '14px', borderRadius: '12px', background: softColor, marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <strong style={{ flex: '1 1 140px', minWidth: 0 }}>{curso.titulo}</strong>
        <span style={{ color: completado ? accentColor : mutedColor, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {completado ? 'Completado' : `${curso.progreso_pct}%`}
        </span>
      </div>
      <progress
        aria-label={`Progreso del curso ${curso.titulo}`}
        value={curso.progreso_pct}
        max={100}
        style={{ width: '100%', height: '12px', margin: '10px 0 6px', accentColor: '#0f8a63' }}
      />
      <small style={{ color: mutedColor }}>
        {curso.puntos_acreditados} de {curso.puntos_base} puntos acreditados
      </small>
    </article>
  );
}

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: '10px',
  padding: '11px 18px',
  background: 'var(--primary-700)',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

const countStyle: React.CSSProperties = {
  flexShrink: 0,
  minWidth: '28px',
  height: '28px',
  padding: '0 8px',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--primary-700)',
  color: '#fff',
  fontWeight: 800,
  fontSize: '.8rem',
};
