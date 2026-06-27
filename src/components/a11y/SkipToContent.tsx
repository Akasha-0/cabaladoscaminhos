'use client';

// ============================================================================
// SKIP TO CONTENT — Link de pulo para acessibilidade
// ============================================================================
// WCAG 2.4.1 - Bypass Blocks
// Aparece em focus, some em blur. Tab order correto.
// ============================================================================

import { useState, useEffect } from 'react';

export function SkipToContent() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return (
    <a
      href="#main-content"
      className={`
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[100]
        focus:outline-none focus:ring-2 focus:ring-amber-500
        px-4 py-3 rounded-lg
        bg-gradient-to-r from-amber-500 to-violet-500
        text-white font-semibold text-sm
        shadow-2xl
        ${reducedMotion ? '' : 'transition-transform duration-200'}
        focus:translate-y-0 focus:scale-100
      `}
      style={{
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0))',
      }}
    >
      Pular para conteúdo principal
    </a>
  );
}

export default SkipToContent;