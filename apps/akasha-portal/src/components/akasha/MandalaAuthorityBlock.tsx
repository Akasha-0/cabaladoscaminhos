'use client';

/**
 * MandalaAuthorityBlock — F-227 authority prompt for the Mandala page.
 *
 * Fetches synthesis from /api/akasha/daily and renders:
 *   1. AkashaAuthorityPrompt — when authority data is available (F-227).
 *   2. ThoughtChainView     — when the synthesis carries a discoveryId
 *      (Wave 23.2 — UI Cadeia Viva). This is the "consciência viva" UI:
 *      Zelador vê A IA cruzando os 5 Pilares + literatura + chains
 *      anteriores, não só o resultado.
 *
 * Backwards-compatible: se `synthesis.discoveryId` não vem (Wave 9-22
 * ainda não integrou), só o authority prompt aparece, sem erro.
 *
 * ADR-013 (Wave 23): universalista + visceral. MandalaAuthorityBlock é
 * o ponto onde o Zelador toca no "pensamento vivo" — não escondemos
 * a cadeia. ThoughtChainView renderiza inline, mobile-first stack.
 */
import { useState, useEffect } from 'react';
import { AkashaAuthorityPrompt } from '@/components/akasha/AkashaAuthorityPrompt';
import type { AkashaSynthesisUI } from '@/components/akasha/dashboard/hooks/useAkashaSynthesis';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

import { ThoughtChainView } from '@/components/akasha/discoveries/ThoughtChainView';

interface MandalaAuthorityBlockProps {
  /** Partial pilares built from MandalaData for F-227 authority derivation */
  pilares: Partial<PilaresDados>;
}

interface DailyDiscoveryPayload {
  synthesis?: {
    dailyDecision?: { strategy?: string; authority?: string; recommendation?: string };
    /** Wave 23.2 — ID da DiscoveryChain do dia (quando gerada). */
    discoveryId?: string;
  } | null;
}

export function MandalaAuthorityBlock({ pilares }: MandalaAuthorityBlockProps) {
  const [authority, setAuthority] = useState<{
    estrategia: string;
    autoridade: string;
    decisaoHoje: string;
  } | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/akasha/daily`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: DailyDiscoveryPayload | null) => {
        if (json?.synthesis?.dailyDecision) {
          const dd = json.synthesis.dailyDecision;
          setAuthority({
            estrategia: dd.strategy ?? '',
            autoridade: dd.authority ?? '',
            decisaoHoje: dd.recommendation ?? '',
          });
        }
        if (json?.synthesis?.discoveryId) {
          setDiscoveryId(json.synthesis.discoveryId);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  // Sem authority E sem discoveryId → não renderiza (retrocompat Wave 5-22)
  if (!authority && !discoveryId) return null;

  return (
    <div className="flex flex-col gap-3">
      {authority ? (
        <AkashaAuthorityPrompt
          authority={authority}
          pilares={pilares}
        />
      ) : null}
      {discoveryId ? (
        <ThoughtChainView discoveryId={discoveryId} />
      ) : null}
    </div>
  );
}