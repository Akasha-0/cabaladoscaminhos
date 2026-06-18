import type { ReactNode } from 'react';

export function InfoPanel({
  color,
  title,
  subtitle,
  children,
}: {
  color: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: 'rgba(11,14,28,0.88)',
        border: `1px solid ${color}33`,
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '1.25rem',
        width: '100%',
        maxWidth: 400,
      }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          color,
          letterSpacing: '0.08em',
          marginBottom: '0.25rem',
          textTransform: 'uppercase',
        }}
      >
        {subtitle}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-cinzel), serif',
          fontSize: '0.9375rem',
          color: '#F4F5FF',
          fontWeight: 600,
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>{children}</div>
    </div>
  );
}

export function Row({
  label,
  value,
  master,
}: {
  label: string;
  value: string | number | null | undefined;
  master?: boolean;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div
      style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}
      aria-label={`${label}: ${String(value)}`}
    >
      <span style={{ fontSize: '0.75rem', color: '#5C6691', minWidth: '120px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.8125rem', color: '#F4F5FF' }}>
        {String(value)}
        {master && (
          <span style={{ color: '#9D86FF', fontSize: '0.6875rem', marginLeft: 4 }}>★ Mestre</span>
        )}
      </span>
    </div>
  );
}

export function Insight({ color, children }: { color: string; children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.8125rem',
        color: '#A7AECF',
        lineHeight: 1.6,
        borderLeft: `2px solid ${color}55`,
        paddingLeft: '0.75rem',
        marginTop: '0.25rem',
      }}
    >
      {children}
    </p>
  );
}

export function Divider() {
  return (
    <hr style={{ border: 'none', borderTop: '1px solid rgba(38,48,79,0.6)', margin: '0.5rem 0' }} />
  );
}
