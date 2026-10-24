import React from 'react';

/**
 * Editorial Card component with subtle hairline borders and optional editorial accent trims.
 */
export const Card = ({
  children,
  kicker,
  title,
  subtitle,
  variant = 'default', // 'default' | 'editorial' | 'terracotta'
  headerAction,
  footer,
  className = '',
  onClick,
  ...rest
}) => {
  const variantClass = variant === 'editorial' ? 'card-editorial' : variant === 'terracotta' ? 'card-terracotta' : '';

  return (
    <div
      className={`card ${variantClass} ${className}`.trim()}
      onClick={onClick}
      {...rest}
    >
      {(kicker || title || subtitle || headerAction) && (
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {kicker && <span className="kicker">{kicker}</span>}
            {title && (
              <h3 style={{ margin: '0.15rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-forest)' }}>
                {title}
              </h3>
            )}
            {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal-muted)', marginTop: '0.25rem' }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && (
        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          {footer}
        </div>
      )}
    </div>
  );
};
