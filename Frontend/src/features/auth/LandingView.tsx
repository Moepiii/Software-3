interface LandingViewProps {
  onRegister: () => void;
  onLogin: () => void;
}

export function LandingView({ onRegister, onLogin }: LandingViewProps) {
  return (
    <div className="bg-background text-on-background selection:bg-tertiary-fixed selection:text-on-tertiary-fixed font-sans min-h-screen">
      <header className="w-full h-20 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
        <nav className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full">
          <div className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
            <span>EcoTax</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegister}
              className="bg-surface-container-low text-primary border border-outline-variant px-5 py-2 rounded-xl font-label-bold hover:bg-surface-container transition-active cursor-pointer"
            >
              Crear cuenta
            </button>
            <button
              onClick={onLogin}
              className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-bold hover:opacity-90 transition-active cursor-pointer"
            >
              Iniciar sesion
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-surface-container-low">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-secondary-fixed opacity-15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-tertiary-fixed opacity-10 blur-2xl pointer-events-none" />

          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-label-caps">
                <span className="material-symbols-outlined text-[16px]">public</span>
                PROGRAMA FISCAL VENEZUELA 2026
              </div>

              <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-primary leading-tight">
                Menos residuos,
                <br />
                <span className="text-tertiary-container">menos impuestos.</span>
              </h1>

              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
                EcoTax convierte tus acciones de reciclaje en beneficios fiscales medibles en bolivares.
                Simple, transparente y adaptado a tu estado.
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-md">
                <div className="bg-white rounded-xl border border-outline-variant p-4">
                  <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Ahorro anual promedio</p>
                  <p className="text-headline-sm text-primary font-headline-sm">Bs. 12.000</p>
                </div>
                <div className="bg-white rounded-xl border border-outline-variant p-4">
                  <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Impacto mensual</p>
                  <p className="text-headline-sm text-tertiary-container font-headline-sm">Bs. 1.350</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl border border-outline-variant tonal-elevation-1 p-6 md:p-7">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-title-lg text-primary font-bold">Cobertura nacional</h2>
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] uppercase tracking-wide">
                    Venezuela
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-low p-3">
                  <img
                    src=".\.\assets\mapa_venezuela.png"
                    alt="Mapa de Venezuela"
                    className="w-full h-[260px] md:h-[300px] object-contain"
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface-container-low border border-outline-variant p-3">
                    <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Estados con mayor adopcion</p>
                    <p className="text-body-md font-semibold text-primary">Miranda, Carabobo, Distrito Capital</p>
                  </div>
                  <div className="rounded-xl bg-surface-container-low border border-outline-variant p-3">
                    <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Meta 2026</p>
                    <p className="text-body-md font-semibold text-primary">+40.000 hogares afiliados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-outline-variant bg-white p-5">
              <span className="material-symbols-outlined text-primary mb-2">recycling</span>
              <h3 className="text-title-md text-primary font-semibold mb-1">Registra tu reciclaje</h3>
              <p className="text-body-sm text-on-surface-variant">Sube tus datos mensuales y obten metricas de impacto en tiempo real.</p>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-white p-5">
              <span className="material-symbols-outlined text-primary mb-2">monitoring</span>
              <h3 className="text-title-md text-primary font-semibold mb-1">Calcula tu beneficio</h3>
              <p className="text-body-sm text-on-surface-variant">Visualiza tu reduccion fiscal estimada en Bs. segun tu estado.</p>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-white p-5">
              <span className="material-symbols-outlined text-primary mb-2">verified</span>
              <h3 className="text-title-md text-primary font-semibold mb-1">Cumple con normativa</h3>
              <p className="text-body-sm text-on-surface-variant">Manten trazabilidad y respaldo para tus reportes municipales.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-primary mt-stack-lg">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-headline-sm font-headline-sm text-on-primary flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
            <span>EcoTax</span>
          </div>
          <div className="text-body-sm font-body-sm text-on-primary opacity-80 text-center md:text-right">
            © 2026 EcoTax. Plataforma fiscal ambiental para Venezuela.
          </div>
        </div>
      </footer>
    </div>
  );
}

