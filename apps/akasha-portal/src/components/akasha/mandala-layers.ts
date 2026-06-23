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
import { ZODIAC_NAMES, ZODIAC_SIGNS, toXY, type Layer } from '@/components/akasha/mandala-geometry';
import { resolveSig, TANTRIC_BODY_WISDOM } from '@/components/akasha/mandala-meanings';
import {
  formatDegreeToZodiac,
  GLYPHS_BY_PLANET,
  longitudeToSvgAngle,
  PLANET_COLORS,
} from '@/lib/shared/zodiac';

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

/** i18n key + params pair for per-layer tooltips (F-206) */
export interface TooltipKey {
  key: string;
  params: Record<string, string>;
}

// ---------- Helpers ----------

/**
 * Per-layer curated tooltip text (F-206) — returns an i18n key + grimoire
 * params so the caller (a layer component with useTranslation) can call
 * t(key, params) to get the full translated tooltip string.
 *
 * i18n param names must match those defined in src/i18n/pt-BR.json:
 *   layer1: { name, essencia }
 *   layer2: { n, essencia }
 *   layer3: { n, essencia }
 *   layer4: { formatted, essencia }
 *   layer5: { hex, essencia }
 */
export function buildTooltipByLayer(data: MandalaLayerData): Record<Layer, TooltipKey> {
  const tooltipFor1 = (() => {
    const sig = resolveSig('odu', data.odus.oduName);
    return { key: 'mandala.tooltips.layer1', params: { name: data.odus.oduName, essencia: sig.essencia } };
  })();
  const tooltipFor2 = (() => {
    const sig = resolveSig('cabala', data.kabala.lifePath);
    return { key: 'mandala.tooltips.layer2', params: { n: String(data.kabala.lifePath ?? '?'), essencia: sig.essencia } };
  })();
  const tooltipFor3 = (() => {
    const sig = resolveSig('tantrica', data.tantra.soul);
    return { key: 'mandala.tooltips.layer3', params: { n: String(data.tantra.soul ?? '?'), essencia: sig.essencia } };
  })();
  const tooltipFor4 = (() => {
    const sig = resolveSig('astrologia', data.astrology.ascendant);
    const formattedAsc = formatDegreeToZodiac(data.astrology.ascendant);
    return { key: 'mandala.tooltips.layer4', params: { formatted: formattedAsc || '?', essencia: sig.essencia } };
  })();
  const tooltipFor5 = (() => {
    const sig = resolveSig('iching', data.iching.hexagramNumber);
    const hex = data.iching.available
      ? `Hex ${data.iching.hexagramNumber} · ${data.iching.hexagramName}`
      : 'Hex do dia (requer Mutação do Caminho)';
    return { key: 'mandala.tooltips.layer5', params: { hex, essencia: sig.essencia } };
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
// ---------- Sefirot Tree of Life (Layer 2) ----------

/** Maps lifePath (1-10) to the corresponding sefira name */
export type SefiraName = 'Keter' | 'Chokhmah' | 'Binah' | 'Chesed' | 'Gevurah' | 'Tiferet' | 'Netzach' | 'Hod' | 'Yesod' | 'Malkuth';
export type Pillar = 'right' | 'left' | 'center';

export interface SefiraNode {
  name: SefiraName;
  pillar: Pillar;
  pos: { x: number; y: number };
  /** true when this sefira corresponds to lifePath / expression / motivation */
  active: boolean;
  /** the number mapped to this sefira */
  number: number | null;
  shortLabel: string;
  hebrewLetter: string | null;
}

export interface SefiraPath {
  pathNumber: number;
  sefiraA: SefiraName;
  sefiraB: SefiraName;
  svgPathData: string;
  active: boolean;
}

export interface SefiraTree {
  nodes: SefiraNode[]; // always 10
  paths: SefiraPath[]; // always 22
}

// Standard Kabala Tree coordinates (viewBox 400x400, cx=200 cy=200)
const SEFIRA_POSITIONS: Record<SefiraName, { x: number; y: number }> = {
  Keter:    { x: 200, y: 35  },
  Chokhmah: { x: 245, y: 110 },
  Binah:    { x: 155, y: 110 },
  Chesed:   { x: 245, y: 155 },
  Gevurah:  { x: 155, y: 155 },
  Tiferet:  { x: 200, y: 180 },
  Netzach:  { x: 245, y: 240 },
  Hod:      { x: 155, y: 240 },
  Yesod:    { x: 200, y: 275 },
  Malkuth:  { x: 200, y: 320 },
};

const SEFIRA_PILLAR: Record<SefiraName, Pillar> = {
  Keter:    'center',
  Chokhmah: 'right',
  Binah:    'left',
  Chesed:   'right',
  Gevurah:  'left',
  Tiferet:  'center',
  Netzach:  'right',
  Hod:      'left',
  Yesod:    'center',
  Malkuth:  'center',
};

const SEFIRA_SHORTLABEL: Record<SefiraName, string> = {
  Keter:    'Ke',
  Chokhmah: 'Ch',
  Binah:    'Bi',
  Chesed:   'Ch',
  Gevurah:  'Ge',
  Tiferet:  'Ti',
  Netzach:  'Ne',
  Hod:      'Ho',
  Yesod:    'Ye',
  Malkuth:  'Ma',
};

const SEFIRA_HEBREW: Record<SefiraName, string> = {
  Keter:    'כתר',
  Chokhmah: 'חכמה',
  Binah:    'בינה',
  Chesed:   'חסד',
  Gevurah:  'גבורה',
  Tiferet:  'תפארת',
  Netzach:  'נצח',
  Hod:      'הוד',
  Yesod:    'יסוד',
  Malkuth:  'מלכות',
};

/** 22 paths of the Kabala Tree of Life */
const SEFIRA_PATH_PAIRS: [SefiraName, SefiraName][] = [
  ['Keter',    'Chokhmah'],
  ['Keter',    'Binah'   ],
  ['Chokhmah', 'Binah'   ],
  ['Chokhmah', 'Chesed'  ],
  ['Chokhmah', 'Tiferet' ],
  ['Binah',    'Gevurah' ],
  ['Binah',    'Tiferet' ],
  ['Chesed',   'Gevurah' ],
  ['Chesed',   'Tiferet' ],
  ['Gevurah',  'Tiferet' ],
  ['Chesed',   'Netzach' ],
  ['Chesed',   'Yesod'   ],
  ['Gevurah',  'Hod'     ],
  ['Gevurah',  'Yesod'   ],
  ['Tiferet',  'Netzach' ],
  ['Tiferet',  'Hod'     ],
  ['Tiferet',  'Yesod'   ],
  ['Netzach',  'Hod'     ],
  ['Netzach',  'Yesod'   ],
  ['Hod',      'Yesod'   ],
  ['Netzach',  'Malkuth' ],
  ['Hod',      'Malkuth' ],
  ['Yesod',    'Malkuth' ],
];

/**
 * Build the complete Sefirot Tree for Layer 2.
 * A path is active when both endpoint sefira are active.
 */
export function buildSefiraTree(kabala: KabalaCoreInput): SefiraTree {
  const sefiraNames: SefiraName[] = [
    'Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
    'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
  ];

  const numMap: Record<number, SefiraName> = {
    1: 'Keter', 2: 'Chokhmah', 3: 'Binah', 4: 'Chesed', 5: 'Gevurah',
    6: 'Tiferet', 7: 'Netzach', 8: 'Hod', 9: 'Yesod', 10: 'Malkuth',
  };

  const activeSefiraSet = new Set<SefiraName>(
    ([kabala.lifePath, kabala.expression, kabala.motivation] as (number | null)[])
      .map((n) => (n != null ? numMap[n] ?? null : null))
      .filter((s): s is SefiraName => s !== null)
  );

  const nodes: SefiraNode[] = sefiraNames.map((name) => {
    const number = sefiraNames.indexOf(name) + 1;
    return {
      name,
      pillar: SEFIRA_PILLAR[name],
      pos: SEFIRA_POSITIONS[name],
      active: activeSefiraSet.has(name),
      number,
      shortLabel: SEFIRA_SHORTLABEL[name],
      hebrewLetter: SEFIRA_HEBREW[name],
    };
  });

  const paths: SefiraPath[] = SEFIRA_PATH_PAIRS.map(([a, b], i) => {
    const posA = SEFIRA_POSITIONS[a];
    const posB = SEFIRA_POSITIONS[b];
    return {
      pathNumber: i + 1,
      sefiraA: a,
      sefiraB: b,
      svgPathData: `M ${posA.x} ${posA.y} L ${posB.x} ${posB.y}`,
      active: activeSefiraSet.has(a) && activeSefiraSet.has(b),
    };
  });

  return { nodes, paths };
}
