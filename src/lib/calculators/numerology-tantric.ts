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
// fallow-ignore-next-line unused-export
export function calculateSoul(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 1;
  return reduceTantric(parseInt(match[3], 10));
}

// ============================================================================
// 2. NÚMERO DE KARMA (mês de nascimento)
// ============================================================================
// 08 → 8 (mês já é ≤ 11)
// fallow-ignore-next-line unused-export
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
// fallow-ignore-next-line unused-export
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
// fallow-ignore-next-line unused-export
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
// fallow-ignore-next-line unused-export
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
export function buildTantricMap(birthDate: string): TantricMap {
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
  };
}
