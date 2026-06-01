import { useEffect, useState } from 'react';

interface LandingViewProps {
  onRegister: () => void;
  onLogin: () => void;
}

export function LandingView({ onRegister, onLogin }: LandingViewProps) {
  // Simple scroll reveal for header
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll && currentScroll > 80) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-background selection:bg-tertiary-fixed selection:text-on-tertiary-fixed font-sans min-h-screen">
      {/* TopNavBar */}
      <header
        className="w-full h-20 bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 transition-transform duration-300"
        style={{
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <nav className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full">
          <div className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span>EcoTax</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label-bold hover:opacity-90 transition-active cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-stack-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-caps">
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                INCENTIVOS FISCALES 2026
              </div>
              <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-primary leading-tight">
                Recicla más,<br />
                <span className="text-tertiary-container">paga menos.</span>
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-lg">
                Transformamos tu compromiso ambiental en beneficios reales. Descubre cómo tus hábitos de reciclaje pueden reducir tus impuestos municipales hasta en un 30%.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={onRegister}
                  className="bg-tertiary-fixed text-on-tertiary-fixed px-8 py-4 rounded-xl font-label-bold hover:opacity-90 transition-active flex items-center gap-2 cursor-pointer"
                >
                  Regístrate
                  <span className="material-symbols-outlined">trending_down</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden tonal-elevation-1 border border-outline-variant aspect-square bg-white p-4">
                <img
                  alt="Gestión de residuos moderna"
                  className="w-full h-full object-cover rounded-2xl"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo3z2Uv4DpNr8_qiencGb3ZtNbJHI6xb482RPCc-I2SaQFJuwmNQagC8qbp8TNxoNne-8TZb-5NPX7XfR9_9NudXR4lSRoaWDKsfb2_gFqdZGeBuO4QRYSOfLe1VXvNlXTBAemFpHXGdLHbMwUjKFK6smwe-u5JtFm0XgIuYOqFGO9NJSAD8EIp8vlFYBgmahDGQQ7UN0t1pGlShcq2ZKu66oB1hUr-9GO1xOLIFAdV3CBKFcOwhyZxHvw3mesCg7TROB8N6NvAw8f"
                />
              </div>
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl tonal-elevation-1 border border-outline-variant max-w-[240px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-secondary-fixed rounded-lg">
                    <span className="material-symbols-outlined text-on-secondary-fixed">payments</span>
                  </div>
                  <span className="text-label-bold text-primary">Ahorro Promedio</span>
                </div>
                <div className="text-headline-sm font-headline-sm text-tertiary-container">€240 / año</div>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Por hogar participante en 2025.</p>
              </div>
            </div>
          </div>
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary-fixed opacity-10 rounded-l-[100px] pointer-events-none"></div>
        </section>




      </main>

      {/* Footer */}
      <footer className="w-full bg-primary mt-stack-lg">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-headline-sm font-headline-sm text-on-primary flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span>EcoTax</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="text-on-primary opacity-80 hover:opacity-100 text-body-sm font-body-sm transition-colors hover:text-tertiary-fixed"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </a>
            <a
              className="text-on-primary opacity-80 hover:opacity-100 text-body-sm font-body-sm transition-colors hover:text-tertiary-fixed"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Terms of Service
            </a>
            <a
              className="text-on-primary opacity-80 hover:opacity-100 text-body-sm font-body-sm transition-colors hover:text-tertiary-fixed"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Annual Reports
            </a>
            <a
              className="text-on-primary opacity-80 hover:opacity-100 text-body-sm font-body-sm transition-colors hover:text-tertiary-fixed"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Contact Us
            </a>
          </div>
          <div className="text-body-sm font-body-sm text-on-primary opacity-80 text-center md:text-right">
            © 2026 EcoTax. Stewardship through fiscal responsibility.
          </div>
        </div>
      </footer>
    </div>
  );
}
