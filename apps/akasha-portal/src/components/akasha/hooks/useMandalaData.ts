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
  buildSefiraTree,
  type PlanetDot,
  type TantricNode,
  type KabVert,
  type SefiraTree,
  type TooltipKey,
} from '@/components/akasha/mandala-layers';
import type { Layer } from '@/components/akasha/mandala-geometry';
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
  const sefiraTree = useMemo(() => buildSefiraTree(data.kabala), [data.kabala]);

  const elem = useMemo(
    () => dominantElement(data.astrology.elementalBalance),
    [data.astrology.elementalBalance]
  );

  const elemGuidance = useMemo(() => ELEMENT_GUIDANCE[elem] ?? null, [elem]);

  const inactiveBodies = useMemo(
    () => tantricNodes.filter((n: TantricNode) => !n.active),
    [tantricNodes]
  );

  const lpMeaning = useMemo(
    () => LIFE_PATH_MEANINGS[data.kabala.lifePath ?? 0] ?? null,
    [data.kabala.lifePath]
  );

  return {
    tooltipByLayer,
    planetDots,
    tantricNodes,
    kabVerts,
    trianglePath,
    sefiraTree,
    elem,
    inactiveBodies,
    lpMeaning,
    elemGuidance,
  };
}

export type { PlanetDot, TantricNode, KabVert, SefiraTree, TooltipKey };

export interface MandalaDerivedData {
  tooltipByLayer: Record<Layer, TooltipKey>;
  planetDots: PlanetDot[];
  tantricNodes: TantricNode[];
  kabVerts: KabVert[];
  trianglePath: string;
  sefiraTree: SefiraTree;
  elem: string | null;
  inactiveBodies: TantricNode[];
  lpMeaning: string | null;
  /** { balance, ritual } — null when no element is dominant */
  elemGuidance: { balance: string; ritual: string } | null;
}
