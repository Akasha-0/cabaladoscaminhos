'use client';

// ============================================================================
// LandingTracker — Tracking automático de pageview + cta click (Wave 20)
// ============================================================================
// Renderiza invisível. Dispará `landing_view` no mount e expõe `useCTATracker()`
// para instrumentar botões.
// ============================================================================

import { useEffect } from 'react';
import { funnelEvents } from '@/lib/analytics/funnel';
import { useFlag } from '@/hooks/use-flag';

interface Props {
  variant: 'A' | 'B' | 'C' | 'D';
  userId?: string;
}

/**
 * Componente invisível que dispara `landing_view` no mount da página.
 */
export function LandingTracker({ variant, userId }: Props) {
  const { enabled: landingVariantFlag } = useFlag('landing-variant');

  useEffect(() => {
    funnelEvents.landingView({ variant, source: userId });
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[LandingTracker] variant=', variant, 'flag=', landingVariantFlag);
    }
  }, [variant, userId, landingVariantFlag]);

  return null;
}

/**
 * Hook utilitário para instrumentar CTAs.
 * Uso:
 *   const trackCTA = useCTATracker('A');
 *   <button onClick={() => { trackCTA('hero-cta'); ... }}>...</button>
 */
export function useCTATracker(variant: 'A' | 'B' | 'C' | 'D') {
  return (ctaId: string) => {
    funnelEvents.ctaClick({ variant, ctaId });
  };
}
