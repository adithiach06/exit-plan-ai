import React, { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SosModal } from '../common/SosModal';

export const AppLayout = ({ currentRoute, onRouteChange, children }) => {
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-ivory)' }}>
      <Header
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        onOpenSosModal={() => setIsSosOpen(true)}
      />

      <main style={{ flex: 1 }}>
        <div className="page-container">{children}</div>
      </main>

      <Footer onOpenSosModal={() => setIsSosOpen(true)} />

      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
};
