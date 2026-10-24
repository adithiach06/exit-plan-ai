import React from 'react';

/**
 * Editorial Badge component.
 * Variants: 'forest' | 'sage' | 'terracotta' | 'outline' | 'alert'
 */
export const Badge = ({
  children,
  variant = 'forest',
  icon: Icon,
  className = '',
  style,
  ...rest
}) => {
  return (
    <span
      className={`badge badge-${variant} ${className}`.trim()}
      style={style}
      {...rest}
    >
      {Icon && <Icon size={12} />}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </span>
  );
};
