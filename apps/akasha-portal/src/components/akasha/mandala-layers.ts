/**
 * Mandala — Per-layer derivations
 *
 * Pure helpers that transform a MandalaData snapshot into the
 * visual data structures consumed by MandalaChart (per-layer
 * tooltips, planet dots, tantric nodes, kabala vertices, zodiac
 * segments). Extracted from MandalaChart.tsx to keep the visual
 * component focused on rendering concerns and to allow unit-testing
 * the derivations in isolation.
 */

import {
  ZODIAC_NAMES,
  ZODIAC_SIGNS,
  toXY,
  type Layer,
} from '@/components/akasha/mandala-geometry';
import {
  formatDegreeToZodiac,
  GLYPHS_BY_PLANET,
  longitudeToSvgAngle,
  PLANET_COLORS,
} from '@/lib/shared/zodiac';
import { resolveSig, TANTRIC_BODY_WISDOM } from '@/components/akasha/mandala-meanings';

// ---------- Minimal types (mirror of MandalaData fields consumed here) ----------

export interface AstroPlanetInput {
  name: string;
  sign: string;
  degree: number;
  absoluteLongitude: number | null;
  retrograde?: boolean;
  house: number;
}

export interface TantricBodyInput {
  index: number;
  name: string;
  active: boolean;
}

export interface KabalaCoreInput {
  lifePath: number | null;
  lifePathMaster: boolean;
  expression: number | null;
  expressionMaster: boolean;
  motivation: number | null;
}

export interface IchingCoreInput {
  hexagramNumber: number | null;
  hexagramName: string | null;
  available: boolean;
}

export interface MandalaLayerData {
  odus: { oduName: string };
  kabala: KabalaCoreInput;
  tantra: { soul: number | null; bodies: TantricBodyInput[] };
  astrology: { ascendant: string | null; planets: AstroPlanetInput[] };
  iching: IchingCoreInput;
}

// ---------- Derived visual structures ----------

export interface AstroSegment {
  sym: string;
  name: string;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  labelPos: { x: number; y: number };
}

export interface PlanetDot {
  name: string;
  sign: string;
  degree: number;
  absoluteLongitude: number | null;
  retrograde?: boolean;
  house: number;
  pos: { x: number; y: number };
  glyph: string;
  color: string;
}

export interface TantricNode {
  i: number;
  angleDeg: number;
  pos: { x: number; y: number };
  active: boolean;
  label: number;
  name: string;
}

export interface KabVert {
  angleDeg: number;
  value: number | null;
  master: boolean;
  label: string;
  pos: { x: number; y: number };
}

// ---------- Helpers ----------

/**
 * Per-layer curated tooltip text (F-206) — maps visual layer to a short
 * essence string suitable for native <title> hover. Each layer resolves
 * a meaning from the grimoire via resolveSig().
 */
export function buildTooltipByLayer(data: MandalaLayerData): Record<Layer, string> {
  const tooltipFor1 = (() => {
    const sig = resolveSig('odu', data.odus.oduName);
    return `Camada 1 · Ancestralidade (${data.odus.oduName}) — ${sig.essencia}`;
  })();
  const tooltipFor2 = (() => {
    const sig = resolveSig('cabala', data.kabala.lifePath);
    return `Camada 2 · Número de Vida (Vida ${data.kabala.lifePath ?? '?'}) — ${sig.essencia}`;
  })();
  const tooltipFor3 = (() => {
    const sig = resolveSig('tantrica', data.tantra.soul);
    return `Camada 3 · Corpo e Energia (Alma ${data.tantra.soul ?? '?'}) — ${sig.essencia}`;
  })();
  const tooltipFor4 = (() => {
    const sig = resolveSig('astrologia', data.astrology.ascendant);
    const formattedAsc = formatDegreeToZodiac(data.astrology.ascendant);
    return `Camada 4 · Movimento Celeste (Ascendente: ${formattedAsc || '?'}) — ${sig.essencia}`;
  })();
  const tooltipFor5 = (() => {
    const sig = resolveSig('iching', data.iching.hexagramNumber);
    const hex = data.iching.available
      ? `Hex ${data.iching.hexagramNumber} · ${data.iching.hexagramName}`
      : 'Hex do dia (requer Mutação do Caminho)';
    return `Camada 5 · Mutação do Caminho (${hex}) — ${sig.essencia}`;
  })();

  return {
    1: tooltipFor1,
    2: tooltipFor2,
    3: tooltipFor3,
    4: tooltipFor4,
    5: tooltipFor5,
  };
}

/**
 * Twelve zodiac segments with mid-radius label positions for the outer ring.
 * No data dependency — derived from constant zodiac tables.
 */
export function buildAstroSegments(): AstroSegment[] {
  return ZODIAC_SIGNS.map((sym, i) => {
    const startDeg = i * 30;
    const endDeg = (i + 1) * 30;
    const midDeg = startDeg + 15;
    const labelPos = toXY(midDeg, 190);
    return { sym, name: ZODIAC_NAMES[i], startDeg, endDeg, midDeg, labelPos };
  });
}

/**
 * Planet dots positioned on the ecliptic ring (r=178). Uses
 * absoluteLongitude (0-360°) when available, falling back to degree
 * for backwards compatibility (Mandala Fase 3).
 */
export function buildPlanetDots(planets: AstroPlanetInput[]): PlanetDot[] {
  return planets.map((p) => {
    const lon = p.absoluteLongitude;
    const angle =
      lon != null && Number.isFinite(lon)
        ? longitudeToSvgAngle(lon)
        : longitudeToSvgAngle(p.degree); // fallback: degree tratado como longitude
    return {
      name: p.name,
      sign: p.sign,
      degree: p.degree,
      absoluteLongitude: p.absoluteLongitude,
      retrograde: p.retrograde,
      house: p.house,
      pos: toXY(angle, 178),
      glyph: GLYPHS_BY_PLANET[p.name] ?? '?',
      color: PLANET_COLORS[p.name] ?? '#FFFFFF',
    };
  });
}

/**
 * Eleven tantric body nodes distributed evenly on r=138.
 * Marks each node as active/inactive based on the user's body data.
 */
export function buildTantricNodes(bodies: TantricBodyInput[]): TantricNode[] {
  return Array.from({ length: 11 }, (_, i) => {
    const angleDeg = i * (360 / 11);
    const pos = toXY(angleDeg, 138);
    const body = bodies.find((b) => b.index === i + 1);
    const wisdom = TANTRIC_BODY_WISDOM[i + 1];
    return {
      i,
      angleDeg,
      pos,
      active: body?.active ?? true,
      label: i + 1,
      name: wisdom?.desc ?? `Corpo ${i + 1}`,
    };
  });
}

/**
 * Three kabala triangle vertices (Vida/Expressão/Motivação) at r=80.
 * Master numbers get a special outer ring rendered at the call site.
 */
export function buildKabVerts(kabala: KabalaCoreInput): KabVert[] {
  return [
    {
      angleDeg: 0,
      value: kabala.lifePath,
      master: kabala.lifePathMaster,
      label: 'VP',
    },
    {
      angleDeg: 120,
      value: kabala.expression,
      master: kabala.expressionMaster,
      label: 'EX',
    },
    { angleDeg: 240, value: kabala.motivation, master: false, label: 'MO' },
  ].map((v) => ({ ...v, pos: toXY(v.angleDeg, 80) }));
}

/**
 * Build a closed SVG path for the kabala triangle from 3 vertices.
 */
export function buildTrianglePath(verts: KabVert[]): string {
  return `M ${verts[0].pos.x} ${verts[0].pos.y} L ${verts[1].pos.x} ${verts[1].pos.y} L ${verts[2].pos.x} ${verts[2].pos.y} Z`;
}
