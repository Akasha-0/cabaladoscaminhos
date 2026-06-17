// Mandala visual geometry helpers and visual layer constants.
// Extracted from MandalaChart.tsx to keep the chart component focused on
// rendering concerns. All exports here are pure and depend only on
// deterministic inputs.

export type Layer = 1 | 2 | 3 | 4 | 5;

// round to N significant figures to eliminate floating-point divergence between
// Node.js (server) and V8/browser (client) that causes React hydration mismatches
const round = (v: number, sig = 10) => {
  if (v === 0) return 0;
  const mag = Math.pow(10, sig - Math.ceil(Math.log10(Math.abs(v))));
  return Math.round(v * mag) / mag;
};

export const toXY = (angleDeg: number, r: number, cx = 200, cy = 200) => ({
  x: round(cx + r * Math.cos(((angleDeg - 90) * Math.PI) / 180)),
  y: round(cy + r * Math.sin(((angleDeg - 90) * Math.PI) / 180)),
});

export const ZODIAC_SIGNS = [
  '♈',
  '♉',
  '♊',
  '♋',
  '♌',
  '♍',
  '♎',
  '♏',
  '♐',
  '♑',
  '♒',
  '♓',
];

export const ZODIAC_NAMES = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
];

// Layer colors — keyed by VISUAL LAYER (1..5 inside-out).
// Layer 1 = Ancestralidade | Layer 2 = Número de Vida
// Layer 3 = Corpo e Energia | Layer 4 = Movimento Celeste
// Layer 5 = Mutação do Caminho
// Número de Vida usa indigo para distinguir-se de Movimento Celeste (roxo/ar).
export const PILAR_COLORS: Record<Layer, string> = {
  1: '#F0B429',
  2: '#5C7CFF',
  3: '#2DD4BF',
  4: '#7C5CFF',
  5: '#A0763A',
};

export const PILAR_LABEL_BY_LAYER: Record<Layer, string> = {
  1: 'Ancestralidade',
  2: 'Número de Vida',
  3: 'Corpo e Energia',
  4: 'Movimento Celeste',
  5: 'Mutação do Caminho',
};

export const ASPECT_SYMBOLS: Record<string, string> = {
  conjunção: '☌',
  oposição: '☍',
  trino: '△',
  quadratura: '□',
  sextil: '✶',
};

// Stars data: fixed positions seeded deterministically (golden angle).
export const STARS = Array.from({ length: 30 }, (_, i) => {
  const angle = (i * 137.508) % 360; // golden angle spacing
  const radius = 60 + ((i * 47) % 130);
  const pos = toXY(angle, radius);
  const opacity = 0.08 + (i % 5) * 0.03;
  const delay = (i * 0.37) % 3;
  return { x: pos.x, y: pos.y, opacity, delay };
});

// Particle dots distributed on outer edge of the mandala.
export const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = i * 30;
  const pos = toXY(angle, 198);
  const delay = (i * 0.4) % 4;
  return { x: pos.x, y: pos.y, delay };
});

export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = toXY(startDeg, r, cx, cy);
  const end = toXY(endDeg, r, cx, cy);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}
