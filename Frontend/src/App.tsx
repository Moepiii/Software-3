import { useState } from 'react';
import LobbyPersona from './features/persona/LobbyPersona';
import LobbyEmpresa from './features/empresa/LobbyEmpresa';
import AdminPanel from './features/admin/AdminPanel';
import AuthFlow from './features/auth/AuthFlow';
import Layout from './shared/Layout';
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
    return (
      <Layout onLogout={handleLogout}>
        {isAdmin && <AdminPanel />}
        {!isAdmin && user.userType === 'persona' && <LobbyPersona />}
        {!isAdmin && user.userType === 'empresa' && <LobbyEmpresa />}
      </Layout>
    );
  }

  return <AuthFlow onLoginSuccess={handleLoginSuccess} />;
}

export default App;
