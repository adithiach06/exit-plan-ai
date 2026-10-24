import React from 'react';
import { ShieldIcon, PhoneIcon } from '../common/Icons';

export const Footer = ({ onOpenSosModal }) => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'var(--space-12)'
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-width-page)',
          margin: '0 auto',
          padding: 'var(--space-10) var(--space-6) var(--space-6)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-8)'
          }}
        >
          {/* Column 1: Purpose & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: 'var(--color-forest)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-ivory)'
                }}
              >
                <ShieldIcon size={16} />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-forest)' }}>
                EXIT PLAN AI
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal-muted)', lineHeight: 1.55 }}>
              Dedicated travel safety and cybersecurity companion designed for solo female travellers navigating India.
              Building actionable Plan B options, verifying suspicious messages, and ensuring peace of mind.
            </p>
          </div>

          {/* Column 2: Essential India Emergency Lines */}
          <div>
            <div className="kicker" style={{ marginBottom: '0.5rem' }}>Immediate Support</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '0.75rem' }}>
              India Helpline Directory
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
                <strong style={{ color: 'var(--color-forest)' }}>112</strong> &mdash; National Emergency (Police / Fire / Med)
              </li>
              <li style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
                <strong style={{ color: 'var(--color-forest)' }}>1091</strong> &mdash; Women Helpline (All India)
              </li>
              <li style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
                <strong style={{ color: 'var(--color-forest)' }}>181</strong> &mdash; Women in Distress (National Commission)
              </li>
              <li style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
                <strong style={{ color: 'var(--color-forest)' }}>139</strong> &mdash; Railway Protection Force (Train Security)
              </li>
              <li style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
                <strong style={{ color: 'var(--color-forest)' }}>1930</strong> &mdash; National Cyber Crime Reporting
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Offline Resilience */}
          <div>
            <div className="kicker" style={{ marginBottom: '0.5rem' }}>Reliability</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '0.75rem' }}>
              Offline First Architecture
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', lineHeight: 1.55 }}>
              Saved exit plans and emergency contacts are securely retained on your device using encrypted LocalStorage and PWA caching. You can access critical details even in remote areas without internet coverage.
            </p>
            <button
              onClick={onOpenSosModal}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.75rem' }}
            >
              <PhoneIcon size={13} />
              <span>View Emergency Card</span>
            </button>
          </div>
        </div>

        {/* Hairline Divider & Disclaimer */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-6)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-charcoal-subtle)'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} EXIT PLAN AI. Built for safety, resilience, and independent travel.
          </div>
          <div style={{ fontStyle: 'italic' }}>
            In life-threatening situations, always dial 112 directly.
          </div>
        </div>
      </div>
    </footer>
  );
};
