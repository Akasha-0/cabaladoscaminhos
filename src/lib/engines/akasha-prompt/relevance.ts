/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — AKASHA PROMPT CONTEXT BUILDER · RELEVANCE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * `casasRelevantes(leitura, pergunta)` picks the 3-7 most relevant
 * CruzamentoCasa entries for the consulente's question.
 *
 * Three strategies (priority order):
 *   1. Explicit casasCitadas in pergunta  → use those (capped to MAX)
 *   2. Tema match                       → substring match of pergunta.tema
 *                                          against casa.tema
 *   3. Keyword overlap scoring          → top N by token-overlap score
 *                                          across sintese + rotulos
 * Then ALWAYS prepend Casa 1 + Casa 36 as anchors.
 *
 * Pure helpers, no side effects. `Object.freeze` on every return.
 */

// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════

import {
  MESA_REAL_HOUSES_TOTAL,
  CASA_CONSULENTE,
  CASA_RETORNO,
  MAX_CASAS_RELEVANTES,
  MIN_CASAS_RELEVANTES,
  type CasaNumber,
  type CruzamentoCasa,
  type LeituraSintetizada,
  type PerguntaConsulente,
} from './types.ts';

import {
  KEYWORD_TOP_N,
  KEYWORD_BOOST_SINTESE,
  KEYWORD_BOOST_ROTULO,
  nfdNormalize,
  shortHex,
} from './constants.ts';

// ════════════════════════════════════════════════════════════════════════════
// BRANDED FACTORY
// ════════════════════════════════════════════════════════════════════════════

function casaNumberFactory(n: number): CasaNumber {
  if (!Number.isInteger(n) || n < 1 || n > MESA_REAL_HOUSES_TOTAL) {
    throw new Error(`Invalid CasaNumber: ${n} (expected 1..${MESA_REAL_HOUSES_TOTAL})`);
  }
  return n as CasaNumber;
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPED HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Sanitize a perguntas.casasCitadas list: dedupe, filter to valid range,
 * cap at MAX_CASAS_RELEVANTES.
 */
function sanitizeCasasCitadas(
  raw: ReadonlyArray<number> | undefined,
): ReadonlyArray<number> {
  if (!raw || raw.length === 0) return [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const n of raw) {
    if (!Number.isInteger(n)) continue;
    if (n < 1 || n > MESA_REAL_HOUSES_TOTAL) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= MAX_CASAS_RELEVANTES) break;
  }
  return out;
}

/**
 * Find the CruzamentoCasa entry for a specific house number. Returns null
 * if the leitura doesn't include that house.
 */
function findByNumero(
  leitura: LeituraSintetizada,
  n: number,
): CruzamentoCasa | null {
  const target = casaNumberFactory(n);
  for (const c of leitura) {
    if (c.numero === target) return c;
  }
  return null;
}

/**
 * Anchor houses — always included unless leitura lacks them.
 */
function anchorCasas(leitura: LeituraSintetizada): ReadonlyArray<CruzamentoCasa> {
  const out: CruzamentoCasa[] = [];
  const c1 = findByNumero(leitura, CASA_CONSULENTE);
  if (c1) out.push(c1);
  if (CASA_RETORNO !== CASA_CONSULENTE) {
    const cN = findByNumero(leitura, CASA_RETORNO);
    if (cN) out.push(cN);
  }
  return out;
}

/**
 * Tokenize a question into lowercase meaningful tokens (drops diacritics,
 * short words, pure numbers).
 */
function tokenize(s: string): ReadonlyArray<string> {
  const norm = nfdNormalize(s);
  const tokens: string[] = [];
  const re = /[\p{L}\p{N}_]+/gu;
  for (const m of norm.matchAll(re)) {
    const t = m[0] ?? '';
    if (t.length < 3) continue;
    tokens.push(t);
  }
  return tokens;
}

/**
 * Score a single CruzamentoCasa against question tokens.
 * Higher = more relevant.
 */
function scoreCasa(
  casa: CruzamentoCasa,
  tokens: ReadonlyArray<string>,
): number {
  if (tokens.length === 0) return 0;
  const sintese = nfdNormalize(casa.sintese);
  const tema = nfdNormalize(casa.tema);
  const rotulos = casa.contribuicoes
    .map((c) => nfdNormalize(`${c.rotulo} ${c.texto}`))
    .join(' | ');
  const cartaNome = nfdNormalize(casa.cartaCigana.nome);

  let score = 0;
  for (const t of tokens) {
    if (sintese.includes(t)) score += KEYWORD_BOOST_SINTESE;
    if (rotulos.includes(t)) score += KEYWORD_BOOST_ROTULO;
    if (tema.includes(t)) score += KEYWORD_BOOST_SINTESE;
    if (cartaNome.includes(t)) score += KEYWORD_BOOST_ROTULO;
  }
  return score;
}

/**
 * Score-and-rank by keyword overlap. Top KEYWORD_TOP_N entries returned
 * with score > 0.
 */
function pickByKeywords(
  leitura: LeituraSintetizada,
  pergunta: PerguntaConsulente,
): ReadonlyArray<CruzamentoCasa> {
  const tokens = tokenize(pergunta.texto);
  if (tokens.length === 0) return [];
  const scored: { casa: CruzamentoCasa; score: number }[] = [];
  for (const c of leitura) {
    const s = scoreCasa(c, tokens);
    if (s > 0) scored.push({ casa: c, score: s });
  }
  if (scored.length === 0) return [];
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable: lower numero wins ties
    return a.casa.numero - b.casa.numero;
  });
  return scored.slice(0, KEYWORD_TOP_N).map((s) => s.casa);
}

/**
 * Pick by explicit tema tag — substring match between pergunta.tema and
 * casa.tema. Returns up to KEYWORD_TOP_N entries, sorted by numero.
 */
function pickByTema(
  leitura: LeituraSintetizada,
  tema: string,
): ReadonlyArray<CruzamentoCasa> {
  const temaNorm = nfdNormalize(tema);
  const matches: CruzamentoCasa[] = [];
  for (const c of leitura) {
    if (nfdNormalize(c.tema).includes(temaNorm)) {
      matches.push(c);
    }
    if (matches.length >= KEYWORD_TOP_N) break;
  }
  matches.sort((a, b) => a.numero - b.numero);
  return matches;
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — casasRelevantes
// ════════════════════════════════════════════════════════════════════════════

/**
 * Returns the 3-7 most relevant CruzamentoCasa for the pergunta.
 *
 * Behavior:
 *   1. If pergunta.casasCitadas present → use those (sanitized + deduped).
 *   2. Else if pergunta.tema present → substring-match against casa.tema.
 *   3. Else → keyword-overlap scoring across sintese/rotulos/cartaNome.
 *
 * After selection, ANCHORS (Casa 1 + Casa 36) are added unless already
 * present. The final list is deduped, capped at MAX_CASAS_RELEVANTES, and
 * sorted ascending by numero.
 *
 * `@throws` if leitura is empty.
 */
export function casasRelevantes(
  leitura: LeituraSintetizada,
  pergunta: PerguntaConsulente,
): ReadonlyArray<CruzamentoCasa> {
  if (leitura.length === 0) {
    throw new Error('casasRelevantes: leitura is empty');
  }
  if (!pergunta || typeof pergunta.texto !== 'string' || pergunta.texto.trim() === '') {
    throw new Error('casasRelevantes: pergunta.texto is empty or missing');
  }

  // ── Strategy 1: explicit casasCitadas ───────────────────────────────────
  const cited = sanitizeCasasCitadas(pergunta.casasCitadas);
  let candidates: ReadonlyArray<CruzamentoCasa>;
  if (cited.length > 0) {
    const mapped: CruzamentoCasa[] = [];
    for (const n of cited) {
      const c = findByNumero(leitura, n);
      if (c) mapped.push(c);
    }
    candidates = mapped;
  } else if (pergunta.tema) {
    // ── Strategy 2: tema tag substring match ─────────────────────────────
    candidates = pickByTema(leitura, pergunta.tema);
    // If tema keyword match found nothing, fall through to strategy 3.
    if (candidates.length === 0) {
      candidates = pickByKeywords(leitura, pergunta);
    }
  } else {
    // ── Strategy 3: keyword-overlap scoring ─────────────────────────────
    candidates = pickByKeywords(leitura, pergunta);
  }

  // ── Mix in anchor houses (unless already present) ──────────────────────
  const anchors = anchorCasas(leitura);
  const seen = new Set<number>();
  const merged: CruzamentoCasa[] = [];
  for (const c of [...candidates, ...anchors]) {
    if (seen.has(c.numero)) continue;
    seen.add(c.numero);
    merged.push(c);
    if (merged.length >= MAX_CASAS_RELEVANTES) break;
  }

  // ── Enforce MIN_CASAS_RELEVANTES when leitura allows ───────────────────
  if (merged.length < MIN_CASAS_RELEVANTES && leitura.length >= MIN_CASAS_RELEVANTES) {
    // Pad with low-numero houses in order
    for (const c of leitura) {
      if (seen.has(c.numero)) continue;
      merged.push(c);
      seen.add(c.numero);
      if (merged.length >= MIN_CASAS_RELEVANTES) break;
    }
  }

  // Cap at MAX_CASAS_RELEVANTES (in case anchors + candidates exceeded)
  const capped = merged.slice(0, MAX_CASAS_RELEVANTES);

  // Sort ascending by numero for deterministic prompts
  capped.sort((a, b) => a.numero - b.numero);

  // Freeze every element + the outer array
  for (const c of capped) Object.freeze(c);
  return Object.freeze(capped) as ReadonlyArray<CruzamentoCasa>;
}

// ════════════════════════════════════════════════════════════════════════════
// SCORING DIAGNOSTICS (used by spec to assert scoring behavior)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Diagnostic-only helper exposed for tests. Returns the numeric score of
 * `casa` against `tokens` WITHOUT inserting it into a relevance ranking.
 */
export function scoreCasaForTokens(
  casa: CruzamentoCasa,
  tokens: ReadonlyArray<string>,
): number {
  return scoreCasa(casa, tokens);
}

/**
 * Diagnostic-only helper exposed for tests. Tokenize a string the same way
 * `casasRelevantes` does internally.
 */
export function tokenizeForRelevance(s: string): ReadonlyArray<string> {
  return tokenize(s);
}

/**
 * Diagnostic-only helper. Returns a fingerprint (5-char hex) of the ranking
 * the engine would produce — used by tests to assert determinism.
 */
export function relevanceFingerprint(
  leitura: LeituraSintetizada,
  pergunta: PerguntaConsulente,
): string {
  const ranked = casasRelevantes(leitura, pergunta);
  let sum = 0;
  for (const c of ranked) sum += c.numero;
  return `${ranked.length}.${shortHex(sum)}`;
}
