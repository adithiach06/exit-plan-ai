import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

/**
 * Editorial Modal component for alert dialogs, quick SOS details, and critical instructions.
 */
export const Modal = ({ isOpen, onClose, title, kicker, children, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(24, 61, 50, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            backgroundColor: 'var(--color-ivory-light)'
          }}
        >
          <div>
            {kicker && <div className="kicker">{kicker}</div>}
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', margin: 0 }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              padding: '0.4rem',
              color: 'var(--color-charcoal-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer'
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--color-ivory-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
