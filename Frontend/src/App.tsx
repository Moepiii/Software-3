import { useState } from 'react';
import DisenoInicio from './vistas/inicio/DisenoInicio';
import { VistaInicio } from './vistas/inicio/VistaInicio';
import PanelPersona from './vistas/persona/PanelPersona';
import PanelEmpresa from './vistas/empresa/PanelEmpresa';
import PanelAdmin from './vistas/administrador/PanelAdmin';
import FlujoAutenticacion from './vistas/autenticacion/FlujoAutenticacion';
import DisenoPersona from './vistas/persona/DisenoPersona';
import DisenoEmpresa from './vistas/empresa/DisenoEmpresa';
import DisenoAdmin from './vistas/administrador/DisenoAdmin';
import { SettingsView as VistaConfiguracion } from './vistas/autenticacion/VistaConfiguracion';

import { clearToken, decodeSession, getToken, saveToken, type LoginUser } from './api';

type VistaActual = 'inicio' | 'login' | 'registro' | 'panel' | 'configuracion';

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
      return (
        <DisenoAdmin onLogout={handleLogout}>
          <PanelAdmin />
        </DisenoAdmin>
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

    if (user.userType === 'persona') {
      return (
        <DisenoPersona onLogout={handleLogout} onNavigateSettings={handleNavegarConfiguracion}>
          <PanelPersona onLogout={handleLogout} user={user} onUpdateUser={handleActualizarUsuario} />
        </DisenoPersona>
      );
    }

    if (user.userType === 'empresa') {
      return (
        <DisenoEmpresa onLogout={handleLogout} onNavigateSettings={handleNavegarConfiguracion}>
          <PanelEmpresa onLogout={handleLogout} />
        </DisenoEmpresa>
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