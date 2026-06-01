import { useState } from 'react';
import LobbyPersona from './features/persona/LobbyPersona';
import LobbyEmpresa from './features/empresa/LobbyEmpresa';
import AdminPanel from './features/admin/AdminPanel';
import AuthFlow from './features/auth/AuthFlow';
import LayoutPersona from './features/persona/LayoutPersona';
import LayoutEmpresa from './features/empresa/LayoutEmpresa';
import LayoutAdmin from './features/admin/AdminLayout';

import { clearToken, decodeSession, getToken, saveToken, type LoginUser } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginUser | null>(null);

  const handleLoginSuccess = (token: string, u: LoginUser) => {
    saveToken(token);
    setUser(u);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUser(null);
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

    if (user.userType === 'persona') {
      return (
        <LayoutPersona onLogout={handleLogout}>
          <LobbyPersona onLogout={handleLogout} />
        </LayoutPersona>
      );
    }

    if (user.userType === 'empresa') {
      return (
        <LayoutEmpresa onLogout={handleLogout}>
          <LobbyEmpresa onLogout={handleLogout} />
        </LayoutEmpresa>
      );
    }
  }

  return <AuthFlow onLoginSuccess={handleLoginSuccess} />;
}

export default App;