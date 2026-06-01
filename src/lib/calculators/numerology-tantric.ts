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
// 11 CORPOS TÂNTRICOS
// ============================================================================
const TANTRIC_BODIES: Record<number, string> = {
  1: 'Corpo Sutil — Essência primordial, conexão com o divino',
  2: 'Corpo Negativo — Mente protetora, defesas psíquicas',
  3: 'Corpo Físico — Vitalidade, presença material',
  4: 'Corpo Prânico — Energia vital, respiração',
  5: 'Corpo da Palavra — Dom da comunicação, expressão',
  6: 'Corpo da Luz — Cura, magnetismo, radiância',
  7: 'Corpo da Intuição — Visão interior, pressentimento',
  8: 'Corpo da Vontade — Determinação, poder pessoal',
  9: 'Corpo Espiritual — Conexão com planos superiores',
  10: 'Corpo Cósmico — Integração universal',
  11: 'Corpo Divino — Mestria, iluminação',
};

export function getTantricBody(n: number): string {
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
export function buildTantricMap(birthDate: string): TantricMap {
  const soul = calculateSoul(birthDate);
  const karma = calculateKarma(birthDate);
  const divineGift = calculateDivineGift(birthDate);
  const destiny = calculateDestiny(birthDate);
  const tantricPath = calculateTantricPath(birthDate);

  return {
    soul,
    soulDescription: getTantricBody(soul),
    karma,
    karmaDescription: getTantricBody(karma),
    divineGift,
    divineGiftDescription: getTantricBody(divineGift),
    destiny,
    tantricPath,
    tantricBodies: { ...TANTRIC_BODIES },
  };
}
