import { useState } from 'react';
import DisenoInicio from './vistas/inicio/DisenoInicio';
import { VistaInicio } from './vistas/inicio/VistaInicio';
import PanelPersona from './vistas/persona/PanelPersona';
import PanelEmpresa from './vistas/empresa/PanelEmpresa';
import FlujoAutenticacion from './vistas/autenticacion/FlujoAutenticacion';
import DisenoPersona from './vistas/persona/DisenoPersona';
import DisenoEmpresa from './vistas/empresa/DisenoEmpresa';
import DisenoAdmin from './vistas/administrador/DisenoAdmin';
import Estadisticas from './vistas/estadisticas/estadisticas';
import { SettingsView as VistaConfiguracion } from './vistas/autenticacion/VistaConfiguracion';
import CursosDisponibles from './vistas/persona/CursosDisponibles';
import MisPuntos from './vistas/puntos/MisPuntos';

import { clearToken, decodeSession, getToken, saveToken, type LoginUser } from './api';

type VistaActual = 'inicio' | 'login' | 'registro' | 'panel' | 'configuracion' | 'estadisticas' | 'cursos' | 'puntos';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginUser | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaActual>('inicio');

  const handleLoginSuccess = (token: string, u: LoginUser) => {
    saveToken(token);
    setUser(u);
    setIsAuthenticated(true);
    setVistaActual('panel');
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUser(null);
    setVistaActual('inicio');
  };

  const handleNavegarConfiguracion = () => setVistaActual('configuracion');
  const handleNavegarPanel = () => setVistaActual('panel');
  const handleNavegarLogin = () => setVistaActual('login');
  const handleNavegarRegistro = () => setVistaActual('registro');
  const handleNavegarEstadisticas = () => setVistaActual('estadisticas');
  const handleNavegarCursos = () => setVistaActual('cursos');
  const handleNavegarPuntos = () => setVistaActual('puntos');

  const handleActualizarUsuario = (usuarioActualizado: LoginUser) => {
    setUser(usuarioActualizado);
  };

  // ============================================
  // VISTA DE INICIO (Landing Page) - CON header y footer
  // ============================================
  if (!isAuthenticated && vistaActual === 'inicio') {
    return (
      <DisenoInicio
        onRegister={handleNavegarRegistro}
        onLogin={handleNavegarLogin}
      >
        <VistaInicio />
      </DisenoInicio>
    );
  }

  // ============================================
  // LOGIN / REGISTRO - SIN header y footer
  // ============================================
  if (!isAuthenticated) {
    return (
      <FlujoAutenticacion
        onLoginSuccess={handleLoginSuccess}
        initialView={vistaActual === 'registro' ? 'register' : 'login'}
      />
    );
  }

  // ============================================
  // USUARIO AUTENTICADO - CON header y footer (cada uno con su diseño)
  // ============================================
  if (isAuthenticated && user) {
    const esAdmin = decodeSession(getToken())?.role === 'admin';

    if (esAdmin) {
      // Admin: No pasamos children, la navegación interna de DisenoAdmin manejará las vistas
      return (
        <DisenoAdmin onLogout={handleLogout} />
      );
    }

    if (vistaActual === 'configuracion') {
      return (
        <VistaConfiguracion
          user={user}
          onSave={handleActualizarUsuario}
          onCancel={handleNavegarPanel}
          onLogout={handleLogout}
        />
      );
    }

    // 🔧 Corregido: user.tipo en lugar de user.userType
    if (user.tipo === 'NATURAL' || user.tipo === 'JURIDICO') {
      const esEmpresa = user.tipo === 'JURIDICO';
      const Layout = esEmpresa ? DisenoEmpresa : DisenoPersona;
      return (
        <Layout
          onLogout={handleLogout} 
          onNavigateSettings={handleNavegarConfiguracion}
          onNavigateStats={handleNavegarEstadisticas}
          onNavigateCursos={handleNavegarCursos}
          onNavigatePanel={handleNavegarPanel}
          onNavigatePuntos={handleNavegarPuntos}
        >
          {/* 2. El padre decide qué hijo interno mostrar según el estado */}
          {vistaActual === 'estadisticas' ? (
            <Estadisticas user={user} onBack={handleNavegarPanel} />
          ) : vistaActual === 'cursos' ? (
            <CursosDisponibles />
          ) : vistaActual === 'puntos' ? (
            <MisPuntos />
          ) : esEmpresa ? (
            <PanelEmpresa user={user} onUpdateUser={handleActualizarUsuario} />
          ) : (
            <PanelPersona onLogout={handleLogout} user={user} onUpdateUser={handleActualizarUsuario} tipo={user.tipo} />
          )}
        </Layout>
      );
    }
  }

  // Fallback
  return (
    <DisenoInicio
      onRegister={handleNavegarRegistro}
      onLogin={handleNavegarLogin}
    >
      <VistaInicio />
    </DisenoInicio>
  );
}

export default App;
