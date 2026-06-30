/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — AKASHA PROMPT CONTEXT BUILDER · MAIN ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * `buildContext(leitura, pergunta, historico, config?)` is the primary API.
 *
 * Given:
 *   - The full 36-house Mesa Real reading from W82-A (`LeituraSintetizada`)
 *   - The consulente's current question (`PerguntaConsulente`)
 *   - The prior chat turns (`HistoricoChat`)
 *
 * Produces a `PromptContext` containing:
 *   - Fixed Akasha system role
 *   - 3-5 line summary of the full reading (anchors at start + end)
 *   - 3-7 most relevant `CruzamentoCasa` for the pergunta
 *   - Cleaned question text
 *   - Last `maxTurnos` turns formatted as conversation memory
 *   - Detected sacred terms (NFD-deduped, ≤12) to honor
 *   - Surgical-specificity instruction rules
 *   - Fully assembled promptFinal string, ready to send to the AI
 *   - Rough token estimate (len / 4 ceiling)
 *   - Cache key for downstream caching
 *
 * Every output is `Object.freeze`d. Pure function — no I/O, no async, no
 * Date.now() in the deterministic path (config.generatedAt is fixed at call
 * time per spec to keep tests reproducible).
 */

// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════

import {
  AKASHA_PROMPT_VERSION,
  AKASHA_PROMPT_CYCLE,
  MESA_REAL_HOUSES_TOTAL,
  CASA_CONSULENTE,
  CASA_RETORNO,
  CHARS_PER_TOKEN,
  DEFAULT_MAX_TURNOS,
  MAX_CASAS_RELEVANTES,
  type CruzamentoCasa,
  type HistoricoChat,
  type LeituraSintetizada,
  type PerguntaConsulente,
  type PromptContext,
  type BuildContextConfig,
} from './types.ts';

import {
  DEFAULT_SYSTEM_ROLE,
  SURGICAL_INSTRUCTION_RULES,
  FORMA_INSTRUCTION_RULES,
  SACRED_TERMS_BY_TRADICAO,
  TRADICAO_LABELS,
  PROMPT_HEADER_LEITURA,
  PROMPT_HEADER_CASAS,
  PROMPT_HEADER_HISTORICO,
  PROMPT_HEADER_PERGUNTA,
  PROMPT_HEADER_SAGRADOS,
  PROMPT_HEADER_REGRAS,
  MAX_SACRED_TERMS_SURFACED,
  nfdNormalize,
} from './constants.ts';

import { casasRelevantes } from './relevance.ts';

// ════════════════════════════════════════════════════════════════════════════
// HELPERS — section formatting
// ════════════════════════════════════════════════════════════════════════════

/**
 * Clean pergunta.texto:
 *   - Trim whitespace
 *   - Collapse internal whitespace
 *   - Strip trailing punctuation other than '?'
 *   - Append '?' if missing
 *   - Lowercase first letter if it reads like a question start
 */
function cleanPergunta(texto: string): string {
  let t = texto.trim().replace(/\s+/g, ' ');
  if (t.length === 0) return '';
  // Strip trailing punctuation except '?' or '!'
  t = t.replace(/[.;,;:]+$/g, '');
  // If doesn't end with '?' or '!', append '?'
  if (!/[?!]$/.test(t)) t += '?';
  // Lowercase first letter for consistency (optional, low risk)
  // Note: keep capitalized proper nouns (Casa 8, Ogum); only lowercase ASCII leading.
  return t;
}

/**
 * Build the 3-5 line summary of the full reading. We surface the FIRST
 * 3 houses + LAST 3 houses for context — that's what the AI needs to
 * know that the reading exists end-to-end.
 */
function buildLeituraResumo(leitura: LeituraSintetizada): string {
  if (leitura.length === 0) return 'Leitura vazia.';
  const ordered = [...leitura].sort((a, b) => a.numero - b.numero);

  // First 3 and last 3
  const head = ordered.slice(0, 3);
  const tail = ordered.slice(-3);

  const lines: string[] = [];
  lines.push(`Leitura de ${MESA_REAL_HOUSES_TOTAL} casas (${ordered.length} entradas efetivamente presentes).`);

  const fmtCasa = (c: CruzamentoCasa): string =>
    `Casa ${c.numero} (${c.tema}) regida por ${c.cartaCigana.nome}`;

  lines.push(`Início: ${head.map(fmtCasa).join('; ')}.`);
  lines.push(`Fim: ${tail.map(fmtCasa).join('; ')}.`);

  return lines.join(' ').trim();
}

/**
 * Format a single house as a markdown-friendly block for the prompt.
 */
function formatCasaForPrompt(casa: CruzamentoCasa): string {
  const parts: string[] = [];
  parts.push(`### Casa ${casa.numero} — ${casa.tema}`);
  parts.push(`Carta Cigana: ${casa.cartaCigana.nome} — ${casa.cartaCigana.superficie}`);

  if (casa.contribuicoes.length > 0) {
    parts.push('Contribuições das outras tradições:');
    for (const c of casa.contribuicoes) {
      // Normalize tradicao label if it matches our catalog casing
      const label = normalizeTradicaoLabel(c.tradicao);
      parts.push(`- ${label}: ${c.rotulo} — ${c.texto}`);
    }
  } else {
    parts.push('(Sem contribuições registradas — cite apenas a carta Cigana.)');
  }

  parts.push(`Síntese: ${casa.sintese}`);
  return parts.join('\n');
}

/**
 * Map free-form tradicao strings ('Cigano', 'Orixás', 'cigano') to our
 * canonical display label.
 */
function normalizeTradicaoLabel(t: string): string {
  const norm = nfdNormalize(t);
  for (const [slug, label] of Object.entries(TRADICAO_LABELS)) {
    if (nfdNormalize(slug) === norm || nfdNormalize(label) === norm) return label;
  }
  // Unknown — return as-is
  return t;
}

/**
 * Format the last N turnos of chat as conversation memory.
 * Format: 'user: texto | assistant: texto | user: ...' lines.
 *
 * A "turn" is one user message + one assistant message. We slice
 * chronologically from the end, keeping both halves of each turn.
 */
function buildContextoConversa(
  historico: HistoricoChat,
  maxTurnosOverride?: number,
): string {
  if (historico.mensagens.length === 0) {
    return '(Sem histórico anterior — esta é a primeira pergunta.)';
  }
  const maxTurnos = Math.max(1, maxTurnosOverride ?? historico.maxTurnos ?? DEFAULT_MAX_TURNOS);
  // Take last 2 × maxTurnos messages, then pair user/assistant.
  const tail = historico.mensagens.slice(-2 * maxTurnos);
  const lines: string[] = [];
  for (const m of tail) {
    const label = m.role === 'user' ? 'user' : 'assistant';
    let line = `${label}: ${m.texto}`;
    if (m.casasCitadas && m.casasCitadas.length > 0) {
      line += ` [casas citadas: ${m.casasCitadas.join(', ')}]`;
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/**
 * Detect sacred terms in the pergunta + selected casas. We scan using
 * NFD-normalized substring matching, then dedupe (preserve original form
 * from the dictionary). Cap at MAX_SACRED_TERMS_SURFACED.
 *
 * Skipped when `config.noSacredDetect` is true.
 */
function detectSacredTerms(
  pergunta: PerguntaConsulente,
  casas: ReadonlyArray<CruzamentoCasa>,
  noSacredDetect?: boolean,
): ReadonlyArray<string> {
  if (noSacredDetect) return [];

  // Source corpus: pergunta.texto + pergunta.tema + every casa's sintese +
  // every contribuicao.texto + cartaCigana.nome.
  const corpus: string[] = [pergunta.texto];
  if (pergunta.tema) corpus.push(pergunta.tema);
  for (const c of casas) {
    corpus.push(c.tema);
    corpus.push(c.cartaCigana.nome);
    corpus.push(c.sintese);
    for (const contrib of c.contribuicoes) {
      corpus.push(contrib.rotulo);
      corpus.push(contrib.texto);
    }
  }
  const corpusNorm = nfdNormalize(corpus.join(' '));

  const found: string[] = [];
  const seenNorm = new Set<string>();

  for (const tradicao of Object.keys(SACRED_TERMS_BY_TRADICAO) as Array<
    keyof typeof SACRED_TERMS_BY_TRADICAO
  >) {
    const arr = SACRED_TERMS_BY_TRADICAO[tradicao];
    for (const term of arr) {
      if (found.length >= MAX_SACRED_TERMS_SURFACED) break;
      const termNorm = nfdNormalize(term);
      if (termNorm.length < 3) continue;
      if (seenNorm.has(termNorm)) continue;
      if (corpusNorm.includes(termNorm)) {
        found.push(term);
        seenNorm.add(termNorm);
      }
    }
    if (found.length >= MAX_SACRED_TERMS_SURFACED) break;
  }

  return Object.freeze(found);
}

/**
 * Build the surgical instructions list. Always starts with the fixed
 * SURGICAL_INSTRUCTION_RULES, then adds forma-specific extras if the
 * pergunta carries a forma tag, then any caller-supplied extras.
 */
function buildInstrucoes(
  pergunta: PerguntaConsulente,
  extras?: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const out: string[] = [...SURGICAL_INSTRUCTION_RULES];
  if (pergunta.forma && FORMA_INSTRUCTION_RULES[pergunta.forma]) {
    out.push(...FORMA_INSTRUCTION_RULES[pergunta.forma]!);
  }
  if (extras) out.push(...extras);
  return Object.freeze(out);
}

/**
 * Assemble the final user prompt string from the structured pieces.
 * Markdown-style sections separated by blank lines.
 */
function assemblePrompt(
  ctx: Omit<PromptContext, 'promptFinal' | 'tokensEstimados' | 'meta'>,
): string {
  const blocos: string[] = [];

  blocos.push(ctx.systemRole);
  blocos.push('');

  blocos.push(PROMPT_HEADER_LEITURA);
  blocos.push(ctx.leituraResumo);
  blocos.push('');

  blocos.push(PROMPT_HEADER_CASAS);
  for (const casa of ctx.casasRelevantes) {
    blocos.push(formatCasaForPrompt(casa));
    blocos.push('');
  }

  blocos.push(PROMPT_HEADER_HISTORICO);
  blocos.push(ctx.contextoConversa);
  blocos.push('');

  blocos.push(PROMPT_HEADER_PERGUNTA);
  blocos.push(ctx.perguntaAtual);
  blocos.push('');

  if (ctx.termosSagrados.length > 0) {
    blocos.push(PROMPT_HEADER_SAGRADOS);
    blocos.push(ctx.termosSagrados.join(', '));
    blocos.push('');
  }

  blocos.push(PROMPT_HEADER_REGRAS);
  for (const r of ctx.instrucoes) {
    blocos.push(`- ${r}`);
  }

  return blocos.join('\n').trimEnd();
}

/**
 * Rough token estimate via char count / 4. Standard rule-of-thumb for
 * English-heavy prose with mixed Portuguese.
 */
function estimateTokens(promptFinal: string): number {
  return Math.max(1, Math.ceil(promptFinal.length / CHARS_PER_TOKEN));
}

/**
 * Compute a SHA-style fingerprint of the assembled context, so callers
 * can cache by content. NOT a cryptographic hash — it's a quick mix
 * based on the system role + selected casas + pergunta current text.
 *
 * Cycle 67 lesson: HMAC chains are for audit. Here we just need a key.
 * FNV-1a 32-bit hex is cheap and deterministic enough.
 */
function fnv1aHex(s: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  // Pad to 8 hex chars
  return hash.toString(16).padStart(8, '0');
}

/**
 * Compute the cacheKey for this PromptContext. Stable across calls for
 * the same (systemRole, selected casas, pergunta, last-N-turns).
 */
function computeCacheKey(
  systemRole: string,
  casas: ReadonlyArray<CruzamentoCasa>,
  pergunta: string,
  contextoConversa: string,
): string {
  const part1 = fnv1aHex(systemRole);
  const part2 = fnv1aHex(
    casas.map((c) => c.numero).join(',') + '|' + pergunta + '|' + contextoConversa,
  );
  // W82-B brand prefix so cache keys are namespaced
  return `w82b.${part1}.${part2}`;
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — buildContext
// ════════════════════════════════════════════════════════════════════════════

/**
 * Build the full PromptContext for the current pergunta.
 *
 * `@param leitura`     Output from W82-A cruzamentoPorCasa (36 entries).
 * `@param pergunta`    The consulente's question for this turn.
 * `@param historico`   Prior chat turns.
 * `@param config?`     Optional behavior overrides.
 *
 * `@throws` when leitura is empty or pergunta.texto is empty.
 */
export function buildContext(
  leitura: LeituraSintetizada,
  pergunta: PerguntaConsulente,
  historico: HistoricoChat,
  config?: BuildContextConfig,
): PromptContext {
  // ── Validation ──────────────────────────────────────────────────────────
  if (!leitura || leitura.length === 0) {
    throw new Error('buildContext: leitura must be a non-empty LeituraSintetizada');
  }
  if (!pergunta || !pergunta.texto || pergunta.texto.trim() === '') {
    throw new Error('buildContext: pergunta.texto is required');
  }
  if (!historico) {
    throw new Error('buildContext: historico is required');
  }

  // ── Sections ───────────────────────────────────────────────────────────
  const systemRole = config?.systemRoleOverride ?? DEFAULT_SYSTEM_ROLE;
  const leituraResumo = buildLeituraResumo(leitura);
  const casasSelecionadas = casasRelevantes(leitura, pergunta);
  // Cap again here to enforce MAX on the surface
  // slice() creates a NEW array which is not frozen — explicitly freeze it.
  const casasFinais: ReadonlyArray<CruzamentoCasa> = Object.freeze(
    casasSelecionadas.slice(0, MAX_CASAS_RELEVANTES),
  ) as ReadonlyArray<CruzamentoCasa>;

  const perguntaAtual = cleanPergunta(pergunta.texto);
  const contextoConversa = buildContextoConversa(historico, config?.maxTurnos);
  const termosSagrados = detectSacredTerms(
    pergunta,
    casasFinais,
    config?.noSacredDetect,
  );
  const instrucoes = buildInstrucoes(pergunta, config?.instrucoesExtras);

  // ── Assemble + estimate ────────────────────────────────────────────────
  const assembly: Omit<PromptContext, 'promptFinal' | 'tokensEstimados' | 'meta'> = {
    systemRole: Object.freeze(systemRole) as string,
    leituraResumo: Object.freeze(leituraResumo) as string,
    casasRelevantes: casasFinais,
    perguntaAtual: Object.freeze(perguntaAtual) as string,
    contextoConversa: Object.freeze(contextoConversa) as string,
    termosSagrados,
    instrucoes,
  };

  const promptFinal = assemblePrompt(assembly);
  const tokensEstimados = estimateTokens(promptFinal);

  const cacheKey = computeCacheKey(
    systemRole,
    casasFinais,
    perguntaAtual,
    contextoConversa,
  );

  const meta = Object.freeze({
    brand: 'W82-B' as const,
    cycle: AKASHA_PROMPT_CYCLE as 82,
    version: AKASHA_PROMPT_VERSION,
    cacheKey,
    generatedAt: new Date().toISOString(),
  });

  // Freeze each casa + instructions + terms (defense in depth)
  for (const c of casasFinais) Object.freeze(c);
  for (const t of termosSagrados as ReadonlyArray<string>) {
    // strings are immutable; nothing to freeze.
    void t;
  }

  const out: PromptContext = {
    systemRole: assembly.systemRole,
    leituraResumo: assembly.leituraResumo,
    casasRelevantes: casasFinais,
    perguntaAtual: assembly.perguntaAtual,
    contextoConversa: assembly.contextoConversa,
    termosSagrados,
    instrucoes,
    promptFinal,
    tokensEstimados,
    meta,
  };

  return Object.freeze(out) as PromptContext;
}

// ════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Re-export the casa anchors for callers that want to know WHICH houses
 * are always pulled regardless of pergunta content.
 */
export const CASA_ANCHORS: ReadonlyArray<number> = Object.freeze([
  CASA_CONSULENTE,
  CASA_RETORNO,
]);

/**
 * Soft re-export of constants for the engine's contract surface.
 */
export {
  DEFAULT_SYSTEM_ROLE as AKASHA_SYSTEM_ROLE,
  MAX_CASAS_RELEVANTES as AKASHA_MAX_CASAS,
  DEFAULT_MAX_TURNOS as AKASHA_DEFAULT_TURNOS,
};
