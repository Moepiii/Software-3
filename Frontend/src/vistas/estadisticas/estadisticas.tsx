import { useState, useEffect } from 'react';
import type { LoginUser } from '../../api'; // Ajusta la ruta según tu arquitectura
import { getEstadisticas, type EstadisticasResponse } from '../../api/usuario';

interface EstadisticasProps {
  user: LoginUser;
  onBack: () => void;
}

export function Estadisticas({ onBack }: EstadisticasProps) {
  const [data, setData] = useState<EstadisticasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEstadisticas()
      .then(setData)
      .catch((err: Error) => setError(err.message || 'Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">⚠️ {error}</div>
        <button onClick={onBack} className="bg-primary-container px-6 py-2 rounded-full text-on-primary-container font-label-bold">
          Volver al Lobby
        </button>
      </div>
    );
  }

  const statsData = data || {
    total_abonado: 0,
    maximo_abono: 0,
    deuda_pendiente: 0,
    historial: []
  };

  const formatearMonto = (m: number) => `${m.toFixed(2).replace('.', ',')} Bs.`;

  const stats = {
    totalPaid: formatearMonto(statsData.total_abonado),
    monthlyMax: formatearMonto(statsData.maximo_abono),
    maxMonthLabel: 'MÁXIMO HISTÓRICO',
    debt: formatearMonto(statsData.deuda_pendiente),
  };

  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  const tableRows = statsData.historial.map((abono) => {
    // Si abono.fecha es string (ej. "2024-06-12T...") o un objeto Date, ajustamos:
    // Asegurarse de lidiar con un string que podría venir del backend
    const fecha = new Date(abono.fecha);
    // Verificar si la fecha es inválida
    const isInvalid = isNaN(fecha.getTime());
    const dateStr = isInvalid ? abono.fecha : `${fecha.getDate().toString().padStart(2, '0')} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    return {
      date: dateStr,
      category: 'Abono a Deuda',
      metric: 'Pago Registrado',
      status: 'COMPLETADO',
      amount: formatearMonto(abono.monto)
    };
  });

  const pagosPorMes: Record<string, number> = {};
  let maxPagoMes = 0;
  
  statsData.historial.forEach(a => {
    const d = new Date(a.fecha);
    if (!isNaN(d.getTime())) {
      const mStr = meses[d.getMonth()];
      pagosPorMes[mStr] = (pagosPorMes[mStr] || 0) + a.monto;
      if (pagosPorMes[mStr] > maxPagoMes) maxPagoMes = pagosPorMes[mStr];
    }
  });

  const paymentsHistory = [];
  const hoy = new Date();
  for (let i = 6; i >= 0; i--) {
    let d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mesNom = meses[d.getMonth()];
    const val = pagosPorMes[mesNom] || 0;
    const height = maxPagoMes > 0 ? Math.max((val / maxPagoMes) * 100, 5) + '%' : '5%';
    paymentsHistory.push({
      month: mesNom,
      height,
      isHighlight: i === 0 || (val === maxPagoMes && maxPagoMes > 0)
    });
  }

  return (
    <div className="bg-background text-on-background selection:bg-tertiary-fixed selection:text-on-tertiary-fixed font-sans min-h-screen flex flex-col">
      
      {/* TopNavBar - Idéntico a tu layout global */}
      <header className="bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline w-full h-20 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full">
          <div className="text-headline-sm font-headline-sm text-primary dark:text-primary-fixed flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span>EcoLogic</span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-bold hover:opacity-90 active:scale-95 duration-100 transition-all cursor-pointer" onClick={onBack}>
              Volver al Lobby
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-stack-lg">
        
        {/* Title & Breadcrumbs */}
        <div className="mb-stack-lg">
          <div className="flex items-center gap-2 text-on-surface-variant mb-unit">
            <span className="font-label-bold text-label-bold">EcoLogic</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-label-bold text-label-bold">Finanzas</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary dark:text-primary-fixed-dim">Estadísticas Financieras</h1>
        </div>

        {/* Summary Section: Bento Style Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
          {/* Total Pagado */}
          <div className="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline tonal-elevation-1 rounded-xl p-stack-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-stack-sm text-on-surface-variant">
                <span className="material-symbols-outlined">payments</span>
                <h2 className="font-label-bold text-label-bold">TOTAL PAGADO</h2>
              </div>
              <p className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">{stats.totalPaid}</p>
            </div>
            <div className="mt-stack-md flex items-center text-on-tertiary-container gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="font-body-sm text-body-sm">Abonos realizados</span>
            </div>
          </div>

          {/* Máximo Mensual */}
          <div className="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline tonal-elevation-1 rounded-xl p-stack-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-stack-sm text-on-surface-variant">
                <span className="material-symbols-outlined">event_upcoming</span>
                <h2 className="font-label-bold text-label-bold">MÁXIMO ABONO</h2>
              </div>
              <p className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">{stats.monthlyMax}</p>
            </div>
            <div className="mt-stack-md">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-bold text-[12px]">
                {stats.maxMonthLabel}
              </span>
            </div>
          </div>

          {/* Deuda Acumulada */}
          <div className="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline tonal-elevation-1 rounded-xl p-stack-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-stack-sm text-on-surface-variant">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <h2 className="font-label-bold text-label-bold">DEUDA ACUMULADA</h2>
              </div>
              <p className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">{stats.debt}</p>
            </div>
            <div className="mt-stack-md flex items-center text-primary-container dark:text-primary-fixed gap-1">
              {statsData.deuda_pendiente === 0 ? (
                <>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-secondary-container">Al día con sus pagos</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <span className="font-body-sm text-body-sm text-on-secondary-container">Tiene deuda pendiente</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-gutter">
          {/* Historial de Pagos */}
          <div className="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline tonal-elevation-1 rounded-xl p-stack-lg">
            <div className="flex justify-between items-center mb-stack-lg">
              <div className="flex items-baseline">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Historial de Pagos (Últimos 7 meses)</h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant ml-2">(Importe en Bs.)</span>
              </div>
              <div className="flex gap-2">
                <button className="material-symbols-outlined p-1 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">download</button>
                <button className="material-symbols-outlined p-1 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">more_vert</button>
              </div>
            </div>
            
            {/* Chart Container */}
            <div className="relative h-64 flex pt-4">
              <div className="flex flex-col justify-between h-full pr-4 pb-8 text-right select-none">
                <span className="font-label-caps text-label-caps text-on-surface-variant">{maxPagoMes.toFixed(0)} Bs.</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">{(maxPagoMes * 0.66).toFixed(0)} Bs.</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">{(maxPagoMes * 0.33).toFixed(0)} Bs.</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">0 Bs.</span>
              </div>
              <div className="relative flex-grow h-full flex items-end justify-between gap-2">
                <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
                  <div className="border-b border-outline-variant/20 w-full h-0"></div>
                  <div className="border-b border-outline-variant/20 w-full h-0"></div>
                  <div className="border-b border-outline-variant/20 w-full h-0"></div>
                  <div className="border-b border-outline-variant w-full h-0"></div>
                </div>
                
                {paymentsHistory.map((bar, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 h-full z-10">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-200 hover:scale-y-105 origin-bottom cursor-pointer ${
                        bar.isHighlight ? 'bg-tertiary-fixed-dim' : 'bg-primary-container dark:bg-primary-fixed-dim'
                      }`}
                      style={{ height: bar.height }}
                    ></div>
                    <span className="font-label-caps text-label-caps mt-4 text-on-surface-variant">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Information Table */}
        <section className="mt-stack-lg bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline tonal-elevation-1 rounded-xl overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Desglose de Últimos Pagos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low dark:bg-surface-variant/50 border-b border-outline-variant">
                <tr>
                  <th className="px-stack-md py-4 font-label-bold text-label-bold text-on-surface-variant">FECHA</th>
                  <th className="px-stack-md py-4 font-label-bold text-label-bold text-on-surface-variant">CATEGORÍA</th>
                  <th className="px-stack-md py-4 font-label-bold text-label-bold text-on-surface-variant">METRICAS DE EMISIÓN</th>
                  <th className="px-stack-md py-4 font-label-bold text-label-bold text-on-surface-variant">ESTADO</th>
                  <th className="px-stack-md py-4 font-label-bold text-label-bold text-on-surface-variant text-right">IMPORTE (Bs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tableRows.length > 0 ? (
                  tableRows.map((row, index) => (
                    <tr key={index} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-variant/20 transition-colors">
                      <td className="px-stack-md py-4 font-body-md text-body-md">{row.date}</td>
                      <td className="px-stack-md py-4 font-body-md text-body-md">{row.category}</td>
                      <td className="px-stack-md py-4 font-body-sm text-body-sm text-on-surface-variant">{row.metric}</td>
                      <td className="px-stack-md py-4">
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-lg font-label-bold text-[12px]">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-stack-md py-4 font-label-bold text-label-bold text-right">{row.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-stack-md py-4 text-center font-body-md text-body-md text-on-surface-variant">
                      No hay abonos registrados en el historial
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-stack-md bg-surface-container-low/30 text-center">
            <button className="text-primary dark:text-primary-fixed font-label-bold text-label-bold hover:underline cursor-pointer">
              Ver todo el historial
            </button>
          </div>
        </section>
      </main>

      {/* Footer - Sincronizado exactamente con el tuyo */}
      <footer className="bg-primary dark:bg-primary-container w-full mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="text-headline-sm font-headline-sm text-on-primary dark:text-on-primary-container">EcoLogic</div>
            <p className="text-body-sm font-body-sm text-on-primary dark:text-on-primary-container opacity-80 mt-2">
              © 2026 EcoLogic. Stewardship through fiscal responsibility.
            </p>
          </div>
          <div className="flex space-x-8">
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Annual Reports</a>
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Estadisticas;
