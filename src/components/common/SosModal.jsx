import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { PhoneIcon, CheckIcon, AlertIcon } from './Icons';
import { DEFAULT_INDIA_HOTLINES } from '../../services/storage';

export const SosModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyDistress = () => {
    const text = 'EMERGENCY: I am a solo traveller in need of urgent assistance. Please contact emergency services and check my location.';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      kicker="Immediate Emergency Protocol"
      title="India Safety & Distress Helplines"
      footer={
        <Button variant="secondary" onClick={onClose} size="sm">
          Close Directory
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: 'var(--color-alert-bg)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <div style={{ color: 'var(--color-terracotta)', marginTop: '2px' }}>
            <AlertIcon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--color-terracotta-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Standard Direct Lines
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', marginTop: '0.15rem' }}>
              These numbers operate 24/7 across all states and Union Territories in India and do not require internet access.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
          {DEFAULT_INDIA_HOTLINES.map((hotline) => (
            <div
              key={hotline.number}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-ivory-light)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-forest)' }}>
                  {hotline.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
                  {hotline.purpose}
                </div>
              </div>
              <a
                href={`tel:${hotline.number}`}
                className="btn btn-emergency btn-sm"
                style={{ textDecoration: 'none', minWidth: '85px', textAlign: 'center' }}
              >
                <PhoneIcon size={13} />
                <span>{hotline.number}</span>
              </a>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleCopyDistress}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {copied ? <CheckIcon size={14} /> : <AlertIcon size={14} />}
            <span>{copied ? 'Distress Message Copied to Clipboard' : 'Copy Emergency SOS SMS Template'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
