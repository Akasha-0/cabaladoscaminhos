// ============================================================================
// AuthShell — shared layout for the 5 auth pages
// ----------------------------------------------------------------------------
// Centered card with subtle gradient + sacred-pattern background. Pure
// presentation; no client logic, no state. Server-component safe.
//
// Mobile-first:
//   - Single column < 768px
//   - max-w-md on desktop
//   - min-h-screen flex items-center justify-center (matches layout.tsx)
//   - Touch targets ≥ 44px (enforced by form components)
//
// Spiritual aesthetic without proselytizing — small star/orb ornaments.
// ============================================================================

import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Small caption above the title (e.g. "Akasha Portal") */
  brand?: string;
}

export function AuthShell({ title, subtitle, children, footer, brand = 'Akasha Portal' }: AuthShellProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card */}
      <div
        className="
          relative overflow-hidden rounded-2xl
          border border-[var(--spiritual-gold,#C9A227)]/20
          bg-gradient-to-b from-[#0F172A]/95 via-[#1E293B]/90 to-[#020617]/95
          backdrop-blur-sm
          shadow-[0_0_40px_rgba(139,92,246,0.12),0_8px_32px_rgba(0,0,0,0.4)]
          p-6 sm:p-8
        "
      >
        {/* Sacred-pattern overlay (very subtle) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.4) 0%, transparent 50%)',
          }}
        />

        {/* Header */}
        <div className="relative flex flex-col items-center text-center mb-6">
          {/* Orb ornament */}
          <div
            className="
              w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4
              bg-gradient-to-br from-[var(--spiritual-gold,#D4AF37)]/20 to-[var(--spiritual-violet,#8B5CF6)]/20
              flex items-center justify-center
              shadow-[0_0_24px_rgba(212,175,55,0.25)]
            "
            aria-hidden="true"
          >
            <span className="text-2xl sm:text-3xl text-[var(--spiritual-gold,#D4AF37)]">✦</span>
          </div>

          <p className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[var(--spiritual-gold,#D4AF37)]/80 mb-1">
            {brand}
          </p>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-foreground tracking-wider">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 font-serif italic">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Form area */}
        <div className="relative">{children}</div>
      </div>

      {/* Footer (links, terms, etc.) */}
      {footer ? <div className="mt-4 text-center text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
