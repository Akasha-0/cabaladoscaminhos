// ════════════════════════════════════════════════════════════════════════════
// NUMEROLOGIA PITAGÓRICA (Western / Pythagorean)
// ════════════════════════════════════════════════════════════════════════════
//
// Sistema ocidental padrão derivado de Pitágoras (~530 BCE).
// Domínio público milenar.
//
// Regras canônicas:
//   - Letras A–Z mapeadas 1–9 em ciclo (A=1, J=1, S=1; B=2, K=2, T=2; etc.)
//   - Redução numérica preserva Master Numbers 11/22/33 (NÃO reduz para 2/4/6)
//   - 1–9 são dígitos básicos; demais valores > 9 são reduzidos por soma de
//     dígitos, EXCETO 11, 22, 33 que são preservados.
//
// IP: domínio público, sem derivação de obra moderna registrada.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Tabela Pitagórica canônica — alfabeto latino A–Z em ciclo de 9.
 * Regra: A=1, I=9 (primeiro bloco), J=1, R=9 (segundo bloco),
 *        S=1 (terceiro bloco) até Z=8.
 */
export const PYTHAGOREAN_TABLE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

/** Master Numbers canônicos do sistema Pitagórico. */
const MASTER_NUMBERS: ReadonlySet<number> = new Set([11, 22, 33]);

/**
 * Reduz um número para 1–9 OU preserva Master Numbers 11/22/33.
 * Algoritmo: soma dígitos enquanto > 9 E não for master number.
 *
 * @example
 *   reduceNumber(34)       // 3+4 = 7
 *   reduceNumber(29)       // 2+9 = 11 → 11 (master, preservado)
 *   reduceNumber(1986)     // 1+9+8+6 = 24 → 2+4 = 6
 */
export function reduceNumber(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  let current = Math.abs(Math.trunc(n));
  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = String(current)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return current;
}

/** Indica se n é um Master Number (11/22/33). */
export function isMasterNumber(n: number): boolean {
  return MASTER_NUMBERS.has(n);
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
 * Caminho de Vida (Life Path) Pitagórico.
 * Soma todos os dígitos da data de nascimento (formato livre, só dígitos).
 *
 * @example
 *   lifePath("1986-08-20")  // 2+0+0+8+1+9+8+6 = 34 → 7
 *   lifePath("20/08/1986")  // mesmo resultado
 */
export function lifePath(birthDate: string): number {
  const digits = birthDate.replace(/\D/g, '');
  const sum = digits
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceNumber(sum);
}

/**
 * Número de Expressão (Expression / Destiny) Pitagórico.
 * Soma de TODAS as letras do nome, conforme tabela Pitagórica.
 *
 * @example
 *   expression("JOHN")  // J=1, O=6, H=8, N=5 → 20 → 2
 */
export function expression(name: string): number {
  const cleaned = normalizeLetters(name);
  let sum = 0;
  for (const ch of cleaned) {
    sum += PYTHAGOREAN_TABLE[ch] ?? 0;
  }
  return reduceNumber(sum);
}

/** Soma bruta dos valores Pitagóricos por letra (sem redução). Útil para debug/inspeção. */
export function letterSum(name: string): number {
  const cleaned = normalizeLetters(name);
  let sum = 0;
  for (const ch of cleaned) {
    sum += PYTHAGOREAN_TABLE[ch] ?? 0;
  }
  return sum;
}