import React, { useState } from 'react';
import { ShieldIcon, PhoneIcon, WifiIcon, WifiOffIcon, MenuIcon, CloseIcon } from '../common/Icons';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const Header = ({ currentRoute, onRouteChange, onOpenSosModal }) => {
  const isOnline = useOnlineStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', path: '/' },
    { id: 'exit-plans', label: 'Exit Plans', path: '/exit-plans' },
    { id: 'map', label: 'Safe Havens', path: '/map' },
    { id: 'shield', label: 'Scam Shield', path: '/shield' },
    { id: 'vault', label: 'Safety Vault', path: '/vault' },
    { id: 'advisor', label: 'Travel Advisor', path: '/advisor' }
  ];

  const handleNavClick = (id) => {
    onRouteChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Top Utility Bar for India Solo Travel Context & Connectivity */}
      <div
        style={{
          backgroundColor: 'var(--color-forest)',
          color: 'var(--color-ivory)',
          fontSize: 'var(--text-xs)',
          padding: '0.45rem var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta)' }}></span>
          <span style={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 600 }}>
            India Solo Travel Safety Network
          </span>
          <span style={{ opacity: 0.5, margin: '0 0.25rem' }}>|</span>
          <span style={{ opacity: 0.85, fontSize: '0.72rem' }}>
            Emergency: Dial <strong>112</strong> / <strong>1091</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              color: isOnline ? 'var(--color-sage)' : 'var(--color-terracotta-light)'
            }}
          >
            {isOnline ? <WifiIcon size={14} /> : <WifiOffIcon size={14} />}
            <span>{isOnline ? 'Online Sync' : 'Offline Vault Mode'}</span>
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div
        style={{
          maxWidth: 'var(--max-width-page)',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Lockup */}
        <div
          onClick={() => onRouteChange('dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--color-forest)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ivory)'
            }}
          >
            <ShieldIcon size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--color-forest)',
                  lineHeight: 1
                }}
              >
                EXIT PLAN AI
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-terracotta)',
                  fontWeight: 700
                }}
              >
                v0.1
              </span>
            </div>
            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--color-charcoal-muted)',
                lineHeight: 1.2,
                marginTop: '0.15rem'
              }}
            >
              When Plan A Fails, You're Not Out of Options.
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.25rem'
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-forest)' : 'var(--color-charcoal-muted)',
                  padding: '0.5rem 0.25rem',
                  borderBottom: isActive ? '2px solid var(--color-forest)' : '2px solid transparent',
                  transition: 'all var(--transition-smooth)'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions Lockup: SOS Quick Button + Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onOpenSosModal}
            className="btn btn-emergency btn-sm"
            style={{ borderRadius: 'var(--radius-pill)' }}
            aria-label="Open Emergency SOS Hotline"
          >
            <PhoneIcon size={14} />
            <span>SOS Help</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle navigation"
            style={{
              padding: '0.4rem',
              color: 'var(--color-forest)',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: '#FFFFFF',
            padding: '1rem var(--space-6)'
          }}
          className="mobile-drawer"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem 0.5rem',
                    fontSize: 'var(--text-base)',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-forest)' : 'var(--color-charcoal)',
                    backgroundColor: isActive ? 'var(--color-forest-surface)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta)' }}></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsive media query styling */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
          .mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
