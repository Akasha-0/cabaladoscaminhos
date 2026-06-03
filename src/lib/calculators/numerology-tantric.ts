// ============================================================
// MOTOR DE NUMEROLOGIA TÂNTRICA
// ============================================================
// Implementação conforme Doc 04 §2.3.
//
// Teste oficial (Doc 09 §8):
//   20/08/1986
//   → soul = 2 (dia 20 → 2+0 = 2)
//   → karma = 8 (mês 08)
//   → divineGift = 5 (1986 → 8+6=14 → 1+4=5)
//   → destiny = 6 (1+9+8+6=24 → 2+4=6)

import type { TantricMap } from '@/types';

// ============================================================================
// OS 11 CORPOS TÂNTRICOS — tabela canônica (Doc 11 §3.2)
// ============================================================================
const TANTRIC_BODIES_DATA: ReadonlyArray<{ id: number; name: string; essence: string }> = [
  { id: 1, name: 'Corpo da Alma', essence: 'Núcleo, pureza, origem' },
  { id: 2, name: 'Corpo Negativo / Mente Protetora', essence: 'Cautela, discernimento, proteção' },
  { id: 3, name: 'Corpo Positivo / Mente Projetiva', essence: 'Expansão, otimismo, ação' },
  { id: 4, name: 'Corpo Neutro / Mente Meditativa', essence: 'Equilíbrio, julgamento sereno' },
  { id: 5, name: 'Corpo Físico', essence: 'Manifestação, a palavra, o dom material' },
  { id: 6, name: 'Arco da Linha', essence: 'Integridade, projeção, intuição' },
  { id: 7, name: 'Aura', essence: 'Campo de proteção, presença' },
  { id: 8, name: 'Corpo Prânico', essence: 'Energia vital, respiração, força' },
  { id: 9, name: 'Corpo Sutil', essence: 'Maestria, sabedoria refinada' },
  { id: 10, name: 'Corpo Radiante', essence: 'Realeza, coragem, brilho' },
  { id: 11, name: 'Corpo do Infinito', essence: 'Transcendência, totalidade' },
] as const;

const TANTRIC_BODIES: Record<number, string> = Object.fromEntries(
  TANTRIC_BODIES_DATA.map((b) => [b.id, `${b.name} — ${b.essence}`])
);

function getTantricBody(n: number): string {
  return TANTRIC_BODIES[n] ?? `Corpo Tântrico ${n}`;
}
// ============================================================================
// CHAKRA DATA — canonical 11-chakra system
// ============================================================================
const CHAKRA_DATA: Record<number, { name: string; element: string; frequency: number; affirmation: string }> = {
  1:  { name: 'Raiz / Muladhara',      element: 'Terra',      frequency: 396, affirmation: 'Eu sou seguro e protegido' },
  2:  { name: 'Sacro / Svadhisthana',  element: 'Água',      frequency: 417, affirmation: 'Eu flua com as mudanças da vida' },
  3:  { name: 'Solar / Manipura',       element: 'Fogo',      frequency: 528, affirmation: 'Eu afirmo meu poder pessoal' },
  4:  { name: 'Coração / Anahata',     element: 'Ar',        frequency: 639, affirmation: 'Eu sou amor e compaixão' },
  5:  { name: 'Garganta / Vishuddha',   element: 'Éter',      frequency: 741, affirmation: 'Eu expresso minha verdade' },
  6:  { name: 'Terceiro Olho / Ajna',   element: 'Luz',       frequency: 852, affirmation: 'Eu vejo com clareza interior' },
  7:  { name: 'Coroa / Sahasrara',      element: 'Cosmos',    frequency: 963, affirmation: 'Eu sou conectado ao divino' },
  8:  { name: 'Estrela da Alma',        element: 'Estelar',   frequency: 174, affirmation: 'Eu honro minha jornada estelar' },
  9:  { name: 'Estrela da Terra',       element: 'Cristal',   frequency: 285, affirmation: 'Eu manifesto na matéria' },
  10: { name: 'Universal',              element: 'Prana',     frequency: 396, affirmation: 'Eu sou um com o universo' },
  11: { name: 'Divino',                element: 'Transcend', frequency: 111, affirmation: 'Eu transcendo toda forma' },
};
// ============================================================================
// SACRED GEOMETRY — derived from soul + karma + destiny
// ============================================================================
function deriveSacredGeometry(soul: number, karma: number, destiny: number) {
  const sum = soul + karma + destiny;
  const merkabaActive = sum >= 9;
  const torusActive = sum >= 12;
  const merkabaForms: Record<string, string[]> = {
    triangle: ['Estrela de Davi', 'Metatron', 'Triângulo de Wealth'],
    square:   ['Cubo de Metatron', 'Quadrado de Duty', 'Octaedro'],
    pentagon: ['Pentagrama', 'Fibonacci', 'Proporção Áurea'],
    hexagon:  ['Hexagrama', 'Flor da Vida', 'Padrão Floral'],
    default:  ['Cubo de Metatron', 'Semente da Vida', 'Ovo da Vida'],
  };
  let formGroup: string[];
  const key = Object.keys(merkabaForms).find((k) => {
    if (k === 'default') return false;
    const count = parseInt(k.replace(/\D/g, '')) || 3;
    return sum % count === 0;
  });
  formGroup = key ? merkabaForms[key] : merkabaForms.default;
  const merkabaFields = merkabaActive
    ? ['Luz', 'Rotação', 'Respiro', 'Inversão', 'Expansão', 'Contração']
    : ['Luz', 'Rotação'];
  const torusFrequency = torusActive ? Math.round(sum * 7.83) : 0;
  return {
    merkabaActive,
    merkabahFields: merkabaFields,
    flowerOfLife: formGroup,
    torusEnergy: {
      active: torusActive,
      frequency: torusFrequency,
      intensity: Math.min(10, Math.round(sum / 3)),
    },
  };
}
// ============================================================================
// CHAKRA STATES — primary chakra from soul number
// ============================================================================
function mapSoulToChakraStates(soul: number) {
  const primary = CHAKRA_DATA[soul] ?? CHAKRA_DATA[1];
  const otherChakras = Object.entries(CHAKRA_DATA)
    .filter(([k]) => parseInt(k) !== soul)
    .map(([k, v]) => ({
      chakra: k,
      name: v.name,
      element: v.element,
      frequency: v.frequency,
      state: 'balanced' as const,
      affirmation: v.affirmation,
    }));
  const states = [
    { ...primary, chakra: String(soul), state: 'balanced' as const },
    ...otherChakras,
  ];
  return states;
}
// ============================================================================
// ENERGY MATRIX — derived from karma number
// ============================================================================
function mapKarmaToEnergyMatrix(karma: number) {
  const matrix: Record<number, { physicalBody: number; emotionalBody: number; mentalBody: number; spiritualBody: number }> = {
    1:  { physicalBody: 9, emotionalBody: 1, mentalBody: 3, spiritualBody: 2 },
    2:  { physicalBody: 2, emotionalBody: 9, mentalBody: 1, spiritualBody: 3 },
    3:  { physicalBody: 3, emotionalBody: 2, mentalBody: 9, spiritualBody: 1 },
    4:  { physicalBody: 9, emotionalBody: 4, mentalBody: 2, spiritualBody: 4 },
    5:  { physicalBody: 5, emotionalBody: 5, mentalBody: 5, spiritualBody: 5 },
    6:  { physicalBody: 6, emotionalBody: 6, mentalBody: 3, spiritualBody: 6 },
    7:  { physicalBody: 7, emotionalBody: 3, mentalBody: 7, spiritualBody: 7 },
    8:  { physicalBody: 8, emotionalBody: 8, mentalBody: 4, spiritualBody: 8 },
    9:  { physicalBody: 9, emotionalBody: 9, mentalBody: 9, spiritualBody: 9 },
    10: { physicalBody: 1, emotionalBody: 1, mentalBody: 1, spiritualBody: 10 },
    11: { physicalBody: 2, emotionalBody: 2, mentalBody: 11, spiritualBody: 11 },
  };
  return matrix[karma] ?? { physicalBody: karma, emotionalBody: karma, mentalBody: karma, spiritualBody: karma };
}
// ============================================================================
// ELEMENT BALANCES — fire/earth/air/water derived from soul+karma+destiny
// ============================================================================
function deriveElementBalances(soul: number, karma: number, destiny: number) {
  const sum = soul + karma + destiny;
  const fire   = ((sum * 1) % 9) + 1;
  const water  = ((sum * 2) % 9) + 1;
  const earth  = ((sum * 3) % 9) + 1;
  const air    = ((sum * 4) % 9) + 1;
  const ether  = ((sum * 5) % 9) + 1;
  return { fire, water, earth, air, ether };
}
// ============================================================================
// KUNDALINI STATE — dormant/awakening/active based on divineGift
// ============================================================================
function mapDivineGiftToKundaliniState(divineGift: number) {
  const primaryMap: Record<number, { primaryChakra: string; secondaryChakras: string[]; kundaliniMessage: string }> = {
    1:  { primaryChakra: '1', secondaryChakras: ['2', '3'],    kundaliniMessage: 'A energia kundalini está despertando na Raiz — firmeza e sobrevivência.' },
    2:  { primaryChakra: '2', secondaryChakras: ['1', '3'],    kundaliniMessage: 'A energia flui do Sacro — criatividade e emoções em movimento.' },
    3:  { primaryChakra: '3', secondaryChakras: ['2', '4'],    kundaliniMessage: 'O poder pessoal do Solar está ativando a kundalini.' },
    4:  { primaryChakra: '4', secondaryChakras: ['3', '5'],    kundaliniMessage: 'O coração é o portal de ativação — amor como força ascendente.' },
    5:  { primaryChakra: '5', secondaryChakras: ['4', '6'],    kundaliniMessage: 'A garganta abre o canal de expressão — a kundalini se manifesta na voz.' },
    6:  { primaryChakra: '6', secondaryChakras: ['5', '7'],    kundaliniMessage: 'O terceiro olho vê o caminho — a kundalini guia com visão clara.' },
    7:  { primaryChakra: '7', secondaryChakras: ['6', '8'],    kundaliniMessage: 'A coroa se abre — a kundalini se funde com o divino.' },
    8:  { primaryChakra: '8', secondaryChakras: ['7', '9'],    kundaliniMessage: 'A estrela da alma acelera a kundalini — expansão multidimensional.' },
    9:  { primaryChakra: '9', secondaryChakras: ['8', '10'],   kundaliniMessage: 'A estrela da terra ancora a kundalini — manifestação pura.' },
    10: { primaryChakra: '10', secondaryChakras: ['9', '11'],   kundaliniMessage: 'O estado universal ativa a kundalini — unicidade cósmica.' },
    11: { primaryChakra: '11', secondaryChakras: ['10', '7'],   kundaliniMessage: 'O divino opera a kundalini — transcendência total.' },
  };
  const entry = primaryMap[divineGift] ?? primaryMap[1]!;
  const active = divineGift >= 4;
  return {
    active,
    primaryChakra: entry.primaryChakra,
    secondaryChakras: entry.secondaryChakras,
    kundaliniMessage: entry.kundaliniMessage,
  };
}

// ============================================================================
// REDUÇÃO TÂNTRICA (limite: 1-11)
// ============================================================================
function reduceTantric(n: number): number {
  if (n <= 0) return 1;
  if (n <= 11) return n;
  const reduced = String(n)
    .split('')
    .reduce((s, d) => s + parseInt(d, 10), 0);
  return reduceTantric(reduced);
}

// ============================================================================
// 1. NÚMERO DE ALMA (dia de nascimento, reduzido)
// ============================================================================
// 20 → 2+0 = 2
export function calculateSoul(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 1;
  return reduceTantric(parseInt(match[3], 10));
}

// ============================================================================
// 2. NÚMERO DE KARMA (mês de nascimento)
// ============================================================================
// 08 → 8 (mês já é ≤ 11)
export function calculateKarma(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 1;
  return reduceTantric(parseInt(match[2], 10));
}

// ============================================================================
// 3. NÚMERO DE DOM DIVINO (ano, reduzido em 2 passos a partir do ano
//    de 2 dígitos = últimos 2 dígitos do ano)
// ============================================================================
// 1986 → 86 → 8+6=14 → 1+4=5
// Doc 04 §2.3: "1986 → 8+6=14 → 1+4=5"
export function calculateDivineGift(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 1;
  const yearLastTwo = parseInt(match[1].slice(-2), 10);
  return reduceTantric(yearLastTwo);
}

// ============================================================================
// 4. NÚMERO DE DESTINO (soma do ano completo de 4 dígitos, reduzido)
// ============================================================================
// 1986 → 1+9+8+6=24 → 2+4=6
export function calculateDestiny(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 1;
  const year = parseInt(match[1], 10);
  const sum = String(year).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  return reduceTantric(sum);
}

// ============================================================================
// 5. NÚMERO DE CAMINHO TÂNTRICO (soma total de dia+mês+ano)
// ============================================================================
// 20+8+1986=2014 → 2+0+1+4=7
export function calculateTantricPath(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 1;
  const [, y, m, d] = match;
  const total = parseInt(d, 10) + parseInt(m, 10) + parseInt(y, 10);
  return reduceTantric(total);
}

// ============================================================================
// AGREGADOR — Constrói o mapa tântrico completo
// ============================================================================
export function buildTantricMap(birthDate: string): Partial<TantricMap> {
  const soul = calculateSoul(birthDate);
  const karma = calculateKarma(birthDate);
  const divineGift = calculateDivineGift(birthDate);
  const destiny = calculateDestiny(birthDate);
  const tantricPath = calculateTantricPath(birthDate);

  return {
    soul,
    soulBody: soul,
    soulDescription: getTantricBody(soul),
    karma,
    karmaBody: karma,
    karmaDescription: getTantricBody(karma),
    divineGift,
    divineGiftBody: divineGift,
    divineGiftDescription: getTantricBody(divineGift),
    destiny,
    tantricPath,
    tantricBodies: { ...TANTRIC_BODIES },
    bodies: TANTRIC_BODIES_DATA,
    sacredGeometry: deriveSacredGeometry(soul, karma, destiny),
    chakraStates: mapSoulToChakraStates(soul),
    energyMatrix: mapKarmaToEnergyMatrix(karma),
    elementBalances: deriveElementBalances(soul, karma, destiny),
    kundaliniState: mapDivineGiftToKundaliniState(divineGift),
  };
}
