'use client';
import { useMemo } from 'react';
import { buildTooltipByLayer, buildKabVerts, buildPlanetDots, buildTantricNodes, buildTrianglePath } from '@/components/akasha/mandala-layers';
import { dominantElement, ELEMENT_GUIDANCE } from '@/components/akasha/mandala-elements';
import { LIFE_PATH_MEANINGS } from '@/components/akasha/mandala-meanings';
import type { MandalaData } from '@/components/akasha/MandalaChart';

export function useMandalaData(data: MandalaData) {
  const tooltipByLayer = useMemo(() => buildTooltipByLayer(data), [data]);
  const planetDots = useMemo(() => buildPlanetDots(data.astrology.planets), [data.astrology.planets]);
  const tantricNodes = useMemo(() => buildTantricNodes(data.tantra.bodies), [data.tantra.bodies]);
  const kabVerts = useMemo(() => buildKabVerts(data.kabala), [data.kabala]);
  const trianglePath = useMemo(() => buildTrianglePath(kabVerts), [kabVerts]);
  const elem = useMemo(() => dominantElement(data.astrology.elementalBalance), [data.astrology.elementalBalance]);
  const inactiveBodies = useMemo(() => tantricNodes.filter((n) => !n.active), [tantricNodes]);
  const lpMeaning = useMemo(() => LIFE_PATH_MEANINGS[data.kabala.lifePath ?? 0] ?? null, [data.kabala.lifePath]);
  const elemGuidance = useMemo(() => ELEMENT_GUIDANCE[elem] ?? null, [elem]);

  return { tooltipByLayer, planetDots, tantricNodes, kabVerts, trianglePath, elem, inactiveBodies, lpMeaning, elemGuidance };
}
