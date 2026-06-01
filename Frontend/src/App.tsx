import { useState } from 'react';
import LobbyPersona from './features/persona/LobbyPersona';
import LobbyEmpresa from './features/empresa/LobbyEmpresa';
import AdminPanel from './features/admin/AdminPanel';
import AuthFlow from './features/auth/AuthFlow';
import LayoutPersona from './features/persona/LayoutPersona';
import LayoutEmpresa from './features/empresa/LayoutEmpresa';
import LayoutAdmin from './features/admin/AdminLayout';
import { SettingsView } from './features/auth/SettingsView';

import { clearToken, decodeSession, getToken, saveToken, type LoginUser } from './api';

type CurrentView = 'lobby' | 'settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginUser | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>('lobby');

  const handleLoginSuccess = (token: string, u: LoginUser) => {
    saveToken(token);
    setUser(u);
    setIsAuthenticated(true);
    setCurrentView('lobby');
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('lobby');
  };

  const handleNavigateSettings = () => setCurrentView('settings');
  const handleNavigateLobby = () => setCurrentView('lobby');

  const handleUpdateUser = (updatedUser: LoginUser) => {
    setUser(updatedUser);
  };

  if (isAuthenticated && user) {
    const isAdmin = decodeSession(getToken())?.role === 'admin';

    if (isAdmin) {
      return (
        <LayoutAdmin onLogout={handleLogout}>
          <AdminPanel />
        </LayoutAdmin>
      );
    }

    // Settings view is shared between persona and empresa
    if (currentView === 'settings') {
      return (
        <SettingsView
          user={user}
          onSave={handleUpdateUser}
          onCancel={handleNavigateLobby}
          onLogout={handleLogout}
        />
      );
    }

    if (user.userType === 'persona') {
      return (
        <LayoutPersona onLogout={handleLogout} onNavigateSettings={handleNavigateSettings}>
          <LobbyPersona onLogout={handleLogout} />
        </LayoutPersona>
      );
    }

    if (user.userType === 'empresa') {
      return (
        <LayoutEmpresa onLogout={handleLogout} onNavigateSettings={handleNavigateSettings}>
          <LobbyEmpresa onLogout={handleLogout} />
        </LayoutEmpresa>
      );
    }
  }

  return <AuthFlow onLoginSuccess={handleLoginSuccess} />;
}

export default App;