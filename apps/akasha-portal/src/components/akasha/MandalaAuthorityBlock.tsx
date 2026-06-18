'use client';

/**
 * MandalaAuthorityBlock — F-227 authority prompt for the Mandala page.
 *
 * Fetches synthesis from /api/akasha/daily and renders AkashaAuthorityPrompt
 * when authority data is available (F-227 conditions met).
 * Mirrors the pattern from MyDayScreen (F-224) but for the mandala context.
 */
import { useState, useEffect } from 'react';
import { AkashaAuthorityPrompt } from '@/components/akasha/AkashaAuthorityPrompt';
import type { AkashaSynthesisUI } from '@/components/akasha/dashboard/hooks/useAkashaSynthesis';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

interface MandalaAuthorityBlockProps {
  /** Partial pilares built from MandalaData for F-227 authority derivation */
  pilares: Partial<PilaresDados>;
}

export function MandalaAuthorityBlock({ pilares }: MandalaAuthorityBlockProps) {
  const [authority, setAuthority] = useState<{
    estrategia: string;
    autoridade: string;
    decisaoHoje: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/akasha/daily`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.synthesis?.dailyDecision) {
          const dd = json.synthesis.dailyDecision;
          setAuthority({
            estrategia: dd.strategy,
            autoridade: dd.authority,
            decisaoHoje: dd.recommendation,
          });
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !authority) return null;

  return (
    <AkashaAuthorityPrompt
      authority={authority}
      pilares={pilares}
    />
  );
}
