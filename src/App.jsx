import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { ExitPlan } from './pages/ExitPlan';
import { AssistanceMap } from './pages/AssistanceMap';
import { MessageScanner } from './pages/MessageScanner';
import { SafetyVault } from './pages/SafetyVault';
import { Assistant } from './pages/Assistant';

export function App() {
  // Simple, zero-dependency robust router matching hash or path
  const getInitialRoute = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash && ['exit-plans', 'map', 'shield', 'vault', 'advisor'].includes(hash)) {
      return hash;
    }
    return 'dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (['exit-plans', 'map', 'shield', 'vault', 'advisor'].includes(hash)) {
        setCurrentRoute(hash);
      } else {
        setCurrentRoute('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRouteChange = (routeId) => {
    setCurrentRoute(routeId);
    if (routeId === 'dashboard') {
      window.location.hash = '';
    } else {
      window.location.hash = `/${routeId}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    switch (currentRoute) {
      case 'exit-plans':
        return <ExitPlan />;
      case 'map':
        return <AssistanceMap />;
      case 'shield':
        return <MessageScanner />;
      case 'vault':
        return <SafetyVault />;
      case 'advisor':
        return <Assistant />;
      case 'dashboard':
      default:
        return <Home onRouteChange={handleRouteChange} />;
    }
  };

  return (
    <AppLayout currentRoute={currentRoute} onRouteChange={handleRouteChange}>
      {renderActivePage()}
    </AppLayout>
  );
}

export default App;
