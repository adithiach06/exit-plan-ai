import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  PhoneIcon,
  CheckIcon,
  AlertIcon,
  UserIcon,
  ShieldIcon,
  ArrowRightIcon
} from './Icons';
import { DEFAULT_INDIA_HOTLINES, getPersonalContacts } from '../../services/storage';

const DISTRESS_SMS_TEXT =
  'EMERGENCY: I am a solo traveller in need of urgent assistance. Please contact emergency services and check my location.';

/**
 * Safely parse and sanitize a phone number for one-tap calling
 */
const sanitizePhone = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, dialNumber: '', displayNumber: 'No phone number provided' };
  }

  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return { isValid: false, dialNumber: '', displayNumber: 'No phone number provided' };
  }

  // Count digit characters (standard telephone numbers have between 5 and 16 digits)
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 5 || digitsOnly.length > 16) {
    return {
      isValid: false,
      dialNumber: '',
      displayNumber: trimmed
    };
  }

  // Preserve leading plus sign if formatted for international calling
  const hasPlus = trimmed.startsWith('+');
  const dialNumber = hasPlus ? `+${digitsOnly}` : digitsOnly;

  return {
    isValid: true,
    dialNumber,
    displayNumber: trimmed
  };
};

export const SosModal = ({ isOpen, onClose, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showFallbackManualCopy, setShowFallbackManualCopy] = useState(false);
  const [personalContacts, setPersonalContacts] = useState([]);

  // Refresh personal emergency contacts whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const contacts = getPersonalContacts();
      setPersonalContacts(Array.isArray(contacts) ? contacts : []);
      setCopied(false);
      setCopyError(false);
      setShowFallbackManualCopy(false);
    }
  }, [isOpen]);

  const handleNavigateToVault = () => {
    onClose();
    if (typeof onNavigate === 'function') {
      onNavigate('vault');
    } else {
      window.location.hash = '/vault';
    }
  };

  const handleCopyDistress = async () => {
    let success = false;

    // 1. Try modern navigator.clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(DISTRESS_SMS_TEXT);
        success = true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText failed, attempting execCommand fallback:', err);
      }
    }

    // 2. Try document.execCommand fallback if modern clipboard API was blocked/unavailable
    if (!success && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = DISTRESS_SMS_TEXT;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, DISTRESS_SMS_TEXT.length);
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.warn('execCommand fallback failed:', err);
      }
    }

    if (success) {
      setCopied(true);
      setCopyError(false);
      setShowFallbackManualCopy(false);
      setTimeout(() => setCopied(false), 2500);
    } else {
      // Both automated clipboard mechanisms failed - present selectable fallback
      setCopyError(true);
      setShowFallbackManualCopy(true);
    }
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxHeight: 'min(620px, 72vh)',
          overflowY: 'auto',
          paddingRight: '0.25rem'
        }}
      >
        {/* Top Emergency Advisory Notice */}
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
          <div style={{ color: 'var(--color-terracotta)', marginTop: '2px', flexShrink: 0 }}>
            <AlertIcon size={18} />
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                color: 'var(--color-terracotta-dark)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Standard Direct Lines
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', marginTop: '0.15rem', marginBottom: 0 }}>
              These numbers operate 24/7 across all states and Union Territories in India and do not require internet access.
            </p>
          </div>
        </div>

        {/* SECTION 1: Your Emergency Contacts */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: 'var(--color-forest)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <UserIcon size={16} />
              <span>Your Emergency Contacts</span>
            </div>

            {personalContacts.length > 0 && (
              <button
                type="button"
                onClick={handleNavigateToVault}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-forest-muted)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Manage in Vault &rarr;
              </button>
            )}
          </div>

          {personalContacts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {personalContacts.map((contact) => {
                const { isValid, dialNumber, displayNumber } = sanitizePhone(contact.phone);
                return (
                  <div
                    key={contact.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--color-ivory-light)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-forest)' }}>
                          {contact.name || 'Emergency Contact'}
                        </span>
                        {contact.relationship && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.1rem 0.45rem',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'rgba(82, 110, 89, 0.12)',
                              color: 'var(--color-forest)',
                              border: '1px solid rgba(82, 110, 89, 0.25)'
                            }}
                          >
                            {contact.relationship}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-charcoal-muted)',
                          marginTop: '0.2rem',
                          wordBreak: 'break-word'
                        }}
                      >
                        <span style={{ fontFamily: isValid ? 'var(--font-mono, monospace)' : 'inherit', fontWeight: isValid ? 500 : 400 }}>
                          {displayNumber}
                        </span>
                        {!isValid && (
                          <span style={{ color: 'var(--color-terracotta)', marginLeft: '0.35rem', fontStyle: 'italic' }}>
                            (Unlisted / Invalid)
                          </span>
                        )}
                        {contact.notes && <span> &bull; {contact.notes}</span>}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {isValid ? (
                        <a
                          href={`tel:${dialNumber}`}
                          className="btn btn-emergency btn-sm"
                          style={{
                            textDecoration: 'none',
                            minWidth: '80px',
                            textAlign: 'center',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem'
                          }}
                          aria-label={`Call ${contact.name || 'contact'} at ${displayNumber}`}
                        >
                          <PhoneIcon size={13} />
                          <span>Call</span>
                        </a>
                      ) : (
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-charcoal-muted)',
                            padding: '0.35rem 0.6rem',
                            backgroundColor: 'var(--color-ivory)',
                            border: '1px dashed var(--border-medium)',
                            borderRadius: 'var(--radius-xs)',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          No number
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '0.9rem 1rem',
                backgroundColor: 'var(--color-ivory-light)',
                border: '1px dashed var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(82, 110, 89, 0.1)',
                    border: '1px solid rgba(82, 110, 89, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-forest)',
                    flexShrink: 0
                  }}
                >
                  <UserIcon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-forest)' }}>
                    No personal emergency contacts saved yet
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', margin: '0.15rem 0 0 0' }}>
                    Add trusted family or hosts to reach them directly in an emergency.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNavigateToVault}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap',
                  padding: '0.4rem 0.75rem'
                }}
              >
                <span>Add in Safety Vault</span>
                <ArrowRightIcon size={13} />
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: National Emergency Helplines (India) */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--color-forest)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem'
            }}
          >
            <ShieldIcon size={16} />
            <span>National Emergency Helplines (India)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                  borderRadius: 'var(--radius-sm)',
                  gap: '0.75rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-forest)' }}>
                    {hotline.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.15rem' }}>
                    {hotline.purpose}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <a
                    href={`tel:${hotline.number}`}
                    className="btn btn-emergency btn-sm"
                    style={{
                      textDecoration: 'none',
                      minWidth: '80px',
                      textAlign: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                    aria-label={`Call ${hotline.name} at ${hotline.number}`}
                  >
                    <PhoneIcon size={13} />
                    <span>{hotline.number}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Emergency Distress SMS Template */}
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--color-forest)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem'
            }}
          >
            <AlertIcon size={16} />
            <span>Emergency SOS SMS Template</span>
          </div>

          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-ivory-light)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-charcoal)',
              fontStyle: 'italic',
              marginBottom: '0.6rem'
            }}
          >
            &ldquo;{DISTRESS_SMS_TEXT}&rdquo;
          </div>

          <button
            type="button"
            onClick={handleCopyDistress}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem'
            }}
          >
            {copied ? <CheckIcon size={14} /> : <AlertIcon size={14} />}
            <span>
              {copied
                ? 'Distress Message Copied to Clipboard!'
                : copyError
                ? 'Clipboard Blocked – Tap to Reveal Template'
                : 'Copy Emergency SOS SMS Template'}
            </span>
          </button>

          {showFallbackManualCopy && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-alert-bg)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-terracotta-dark)',
                  marginBottom: '0.4rem'
                }}
              >
                Clipboard access was restricted by your browser. Tap below to select and copy:
              </div>
              <textarea
                readOnly
                value={DISTRESS_SMS_TEXT}
                onClick={(e) => e.target.select()}
                rows={3}
                style={{
                  width: '100%',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-sans)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-charcoal)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
