// ════════════════════════════════════════════════════════════════════════════
// NUMEROLOGIA CALDEIA (Chaldean / Ancient Babylonian)
// ════════════════════════════════════════════════════════════════════════════
//
// Sistema antigo da Mesopotâmia (Babilônia, ~3000 BCE).
// Domínio público milenar.
//
// Regra canônica distintiva:
//   - O número 9 é considerado SAGRADO e NÃO é atribuído a nenhuma letra.
//   - Valores possíveis: 1–8 apenas (NÃO 9).
//   - Tabela própria, diferente da Pitagórica:
//       A=1, B=2, C=3, D=4, E=5, F=8, G=3, H=5, I=1, J=1, K=2, L=3,
//       M=4, N=5, O=7, P=8, Q=1, R=2, S=3, T=4, U=6, V=6, W=6, X=5,
//       Y=1, Z=7
//
// IP: domínio público, sem derivação de obra moderna registrada.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Tabela Caldeia canônica — 1–8, SEM atribuição de 9.
 * Atenção: tabela DIFERENTE da Pitagórica (e.g., F=8 aqui, F=6 na Pitagórica).
 */
export const CHALDEAN_TABLE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
};

/**
 * Valor Caldeu de uma letra. Retorna 0 se a letra não está na tabela.
 * Por convenção Caldeia, NENHUMA letra recebe valor 9.
 */
export function letterValue(c: string): number {
  const upper = c.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return CHALDEAN_TABLE[upper] ?? 0;
}

/** Indica se uma letra tem valor Caldeu atribuído. */
export function hasLetterValue(c: string): boolean {
  return letterValue(c) > 0 || CHALDEAN_TABLE[c.toUpperCase()] !== undefined;
}

/** Normaliza string: remove acentos, uppercase, mantém só letras A–Z. */
function normalizeLetters(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

/**
 * Número Caldeu do nome (Name Number).
 * Soma todos os valores Caldeus das letras; reduz por soma de dígitos.
 * NÃO preserva master numbers (11/22/33) — sistema Caldeu reduz até 1–8.
 *
 * @example
 *   nameNumber("JOHN")  // J=1, O=7, H=5, N=5 → 18 → 1+8 = 9
 *   nameNumber("MARY")  // M=4, A=1, R=2, Y=1 → 8
 */
export function nameNumber(name: string): number {
  const cleaned = normalizeLetters(name);
  let sum = 0;
  for (const ch of cleaned) {
    sum += CHALDEAN_TABLE[ch] ?? 0;
  }
  // Caldeia: redução simples por soma de dígitos até 1–9 (sem master numbers).
  // Embora 9 "não seja atribuído" às letras, o RESULTADO final pode ser 9
  // (vindo da soma, e.g., 1+8 = 9). Isso é compatível com a tradição.
  while (sum > 9) {
    sum = String(sum)
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum;
}

/** Soma bruta (sem redução) dos valores Caldeus por letra. */
export function letterSum(name: string): number {
  const cleaned = normalizeLetters(name);
  let sum = 0;
  for (const ch of cleaned) {
    sum += CHALDEAN_TABLE[ch] ?? 0;
  }
  return sum;
}

/**
 * Constante simbólica da tradição Caldeia.
 * O número 9 é considerado sagrado (NUNCA atribuído às letras).
 */
export const SACRED_NINE = 9 as const;