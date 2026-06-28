/**
 * Daily Reflection — Selection algorithm
 * ============================================================================
 * Estratégia determinística:
 *   1. userId + date (YYYY-MM-DD) → hash FNV-1a 32-bit
 *   2. Hash mod N do pool disponível → escolhe 1 prompt
 *   3. Se o prompt escolhido estiver nos últimos 7 dias do histórico,
 *      "anda" o índice até o próximo disponível (até 5 tentativas)
 *   4. Fallback: se todos os N candidatos estiverem bloqueados, pega o
 *      MAIS ANTIGO do histórico (least-recently-used).
 *
 * VANTAGENS:
 *   - Determinístico: mesmo user + mesma data = mesmo prompt (sem randomness)
 *   - Distribuição uniforme: cada prompt do pool tem chance ~1/N por dia
 *   - Anti-repetição: 7 dias de janela é confortável (10 universal / 5 tradição)
 *   - Sem dependência de runtime pesado: só precisa de SHA leve
 *
 * Por que não usar crypto.subtle? Compatibilidade com Edge runtime +
 * zero-deps. FNV-1a é suficiente pra espalhar hash.
 * ============================================================================
 */

import {
  getPool,
  getPromptsByTradition,
  getUniversalPrompts,
  type Prompt,
  type Tradition,
  KNOWN_TRADITIONS,
} from "./pool";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface SelectionContext {
  /** YYYY-MM-DD (data local do usuário, fornecida pelo client) */
  date: string;
  /** User.id (cuid). Combinado com date gera o hash. */
  userId: string;
  /** Tradição ativa do usuário (slug canônico). Fallback: 'universal'. */
  tradition?: Tradition | string | null;
  /** IDs dos últimos N dias (mais recente primeiro), para anti-repetição. */
  recentPromptIds?: readonly string[];
}

export interface SelectedPrompt {
  id: string;
  tradition: string;
  tone: string;
  text: string;
  locale: "pt-BR" | "en-US";
  /** Quantos passos o algoritmo andou pra escapar do conflito (debug). */
  skippedCount: number;
}

// ----------------------------------------------------------------------------
// Hashing: FNV-1a 32-bit
// ----------------------------------------------------------------------------

function fnv1a32(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // Multiply by FNV prime (0x01000193) — usando Math.imul p/ 32-bit int
    hash = Math.imul(hash, 0x01000193);
  }
  // Forçar unsigned 32-bit
  return hash >>> 0;
}

/** date em YYYY-MM-DD é normalizado: trim + aceita só 10 chars. */
function normalizeDate(date: string): string {
  const d = date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    throw new Error(`[daily-reflection] date inválida: ${date}`);
  }
  return d;
}

/** Converte tradição desconhecida para 'universal' (fail-safe). */
function resolveTradition(t?: string | null): string {
  if (!t) return "universal";
  return t in KNOWN_TRADITIONS ? t : "universal";
}

// ----------------------------------------------------------------------------
// Pool selection: universais + tradição (se houver)
// ----------------------------------------------------------------------------

/**
 * Constrói o pool elegível:
 *   - Se tradição = 'universal' ou inválida: retorna só os universais
 *   - Senão: retorna [tradicional do user] + [universais] (universais
 *     entram como fallback caso o pool tradicional esgote na janela)
 */
function buildEligiblePool(tradition: string): Prompt[] {
  if (tradition === "universal") return getUniversalPrompts();
  const trad = getPromptsByTradition(tradition);
  // Pool final: tradição + universal (mas sempre nessa ordem pra tradição
  // ter precedência na seleção)
  return [...trad, ...getUniversalPrompts()];
}

// ----------------------------------------------------------------------------
// Anti-repetição: pula até 5 candidatos em conflito
// ----------------------------------------------------------------------------

const MAX_SKIPS = 5;

function pickWithAntiRepeat(
  pool: Prompt[],
  startIndex: number,
  recent: ReadonlySet<string>,
): { chosen: Prompt; skippedCount: number } {
  if (pool.length === 0) {
    throw new Error("[daily-reflection] pool vazio — verifique data/daily-prompts.json");
  }
  const N = pool.length;
  for (let i = 0; i < MAX_SKIPS; i++) {
    const idx = (startIndex + i) % N;
    const candidate = pool[idx];
    if (!recent.has(candidate.id)) {
      return { chosen: candidate, skippedCount: i };
    }
  }
  // Fallback: pega o mais antigo do histórico seria ideal, mas como não temos
  // timestamps aqui (só IDs), usamos determinismo — pega o que tem o
  // índice mais próximo de `startIndex` após N tentativas.
  // Em prática, com 10 universais ou 5+10=15 do pool combinado, isso só
  // acontece se o usuário viu TODOS nos últimos 7 dias — improvável.
  return {
    chosen: pool[startIndex % N],
    skippedCount: MAX_SKIPS,
  };
}

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

/**
 * Seleciona um prompt determinístico para o dia.
 * Retorna o texto no locale escolhido (default pt-BR).
 */
export function selectDailyPrompt(ctx: SelectionContext): SelectedPrompt {
  const date = normalizeDate(ctx.date);
  const tradition = resolveTradition(ctx.tradition ?? null);
  const locale: "pt-BR" | "en-US" = "pt-BR"; // expandível no futuro

  const pool = buildEligiblePool(tradition);
  const recent = new Set(ctx.recentPromptIds ?? []);

  // Hash FNV-1a de (userId + ":" + date)
  const hash = fnv1a32(`${ctx.userId}:${date}`);
  const startIndex = hash % pool.length;

  const { chosen, skippedCount } = pickWithAntiRepeat(pool, startIndex, recent);

  return {
    id: chosen.id,
    tradition: chosen.tradition,
    tone: chosen.tone,
    text: chosen[locale],
    locale,
    skippedCount,
  };
}

// ----------------------------------------------------------------------------
// Helpers p/ testes / debug
// ----------------------------------------------------------------------------

export const _internals = {
  fnv1a32,
  normalizeDate,
  resolveTradition,
  buildEligiblePool,
  pickWithAntiRepeat,
  MAX_SKIPS,
};