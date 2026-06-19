'use client';
import { useMemo } from 'react';
import { dominantElement } from '@/components/akasha/mandala-elements';
import { ELEMENT_GUIDANCE } from '@/components/akasha/mandala-elements';
import { LIFE_PATH_MEANINGS } from '@/components/akasha/mandala-meanings';
import {
  buildTooltipByLayer,
  buildPlanetDots,
  buildTantricNodes,
  buildKabVerts,
  buildTrianglePath,
  type PlanetDot,
  type TantricNode,
  type KabVert,
} from '@/components/akasha/mandala-layers';
import type { MandalaData } from '@/components/akasha/MandalaChart';

/** Phase 1 hook — all per-layer derived data.
 * Replaces 7 inline useMemo calls in MandalaChart.
 * Returns plain serialisable objects safe for props. */
export function useMandalaData(data: MandalaData) {
  const tooltipByLayer = useMemo(() => buildTooltipByLayer(data), [data]);

  // Mandala Fase 3: absoluteLongitude (0-360°) for planet positioning
  const planetDots = useMemo(
    () => buildPlanetDots(data.astrology.planets),
    [data.astrology.planets]
  );

  const tantricNodes = useMemo(
    () => buildTantricNodes(data.tantra.bodies),
    [data.tantra.bodies]
  );

  const kabVerts = useMemo(() => buildKabVerts(data.kabala), [data.kabala]);

  const trianglePath = useMemo(() => buildTrianglePath(kabVerts), [kabVerts]);

  const elem = useMemo(
    () => dominantElement(data.astrology.elementalBalance),
    [data.astrology.elementalBalance]
  );

  const inactiveBodies = useMemo(
    () => tantricNodes.filter((n: TantricNode) => !n.active),
    [tantricNodes]
  );

  const lpMeaning = useMemo(
    () => LIFE_PATH_MEANINGS[data.kabala.lifePath ?? 0] ?? null,
    [data.kabala.lifePath]
  );

  const elemGuidance = useMemo(() => ELEMENT_GUIDANCE[elem] ?? null, [elem]);

  return {
    tooltipByLayer,
    planetDots,
    tantricNodes,
    kabVerts,
    trianglePath,
    elem,
    inactiveBodies,
    lpMeaning,
    elemGuidance,
  };
}

export type { PlanetDot, TantricNode, KabVert };

export interface MandalaDerivedData {
  tooltipByLayer: Record<import('@/components/akasha/mandala-geometry').Layer, string>;
  planetDots: PlanetDot[];
  tantricNodes: TantricNode[];
  kabVerts: KabVert[];
  trianglePath: string;
  elem: string | null;
  inactiveBodies: TantricNode[];
  lpMeaning: string | null;
  /** { balance, ritual } — null when no element is dominant */
  elemGuidance: { balance: string; ritual: string } | null;
}
