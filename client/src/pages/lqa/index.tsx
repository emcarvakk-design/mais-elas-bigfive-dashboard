import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import LQALogin from './Login';
import LQADashboard from './Dashboard';
import LQAProfileDetail from './ProfileDetail';

function checkAuth(): boolean {
  return sessionStorage.getItem('lqa_auth') === 'true';
}

export function LQARoot() {
  const [authenticated, setAuthenticated] = useState(checkAuth);

  useEffect(() => {
    setAuthenticated(checkAuth());
  }, []);

  const handleLogin = () => setAuthenticated(true);
  const handleLogout = () => {
    sessionStorage.removeItem('lqa_auth');
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LQALogin onLogin={handleLogin} />;
  }

  return <LQADashboard onLogout={handleLogout} />;
}

export function LQAProfileRoute() {
  const [authenticated, setAuthenticated] = useState(checkAuth);

  if (!authenticated) {
    return <LQALogin onLogin={() => setAuthenticated(true)} />;
  }

  return <LQAProfileDetail />;
}
