/**
 * akasha-conversation-memory.ts
 *
 * Conversation context persistence for Akasha IA.
 *
 * Extends:
 * - w33/akasha-streaming (streaming answer delivery)
 * - w39/comments-deep-thread-viz (deep thread visualization)
 *
 * Responsibilities:
 * - Manage a per-user conversation context window
 * - Track the active persona (5 personas) and allow persona switching
 *   while preserving turn history
 * - Cap total tokens / turns / insights to keep prompts bounded
 * - Recall recent turns and turns filtered by persona
 * - Extract lightweight "insight" sentences from the assistant's replies
 *   (those that carry guidance keywords and are within [20, 280] chars)
 * - Prune / summarize the context when it overflows the token budget
 * - Snapshot the context for audit / rehydration
 * - Compute a TokenBudget that the streaming engine can consume
 *
 * This module is **standalone**: no imports from other w3x modules.
 * All types, constants, and helpers live inside this file.
 *
 * Side-effect free. Pure functions only.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default token budget for a single user conversation. */
export const DEFAULT_TOKEN_BUDGET = 8000

/** Hard cap on the number of turns retained in the live window. */
export const MAX_TURNS_IN_WINDOW = 50

/** Hard cap on the number of insight strings retained. */
export const MAX_INSIGHTS_RETAINED = 20

/**
 * When the context overflows, drop the oldest (1 - ratio) of the turns.
 * 0.7 means: keep 70% of the existing turns (drop the oldest 30%).
 */
export const CONTEXT_OVERFLOW_TRIM_RATIO = 0.7

/** Minimum character length for a sentence to be considered an insight. */
export const INSIGHT_MIN_LENGTH = 20

/** Maximum character length for a sentence to be considered an insight. */
export const INSIGHT_MAX_LENGTH = 280

/**
 * Guidance keywords that mark a sentence as a "practical insight" worth
 * retaining across the conversation. Cached at module load to avoid
 * re-creating the array on every call.
 */
export const INSIGHT_KEYWORDS: ReadonlyArray<string> = [
  "prática",
  "pratica",
  "ritual",
  "rituais",
  "meditação",
  "meditacao",
  "meditação",
  "estudo",
  "cuidado",
  "axé",
  "axe",
  "orixá",
  "orixa",
  "energia",
  "fé",
  "fe",
  "coragem",
  "ancestral",
  "oferenda",
  "terreiro",
  "guia",
]

/** Default persona when none is provided. */
export const DEFAULT_PERSONA: Persona = "conselheiro"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** All personas that Akasha IA can adopt in a conversation. */
export type Persona =
  | "conselheiro"
  | "mentor"
  | "guia_ritual"
  | "par"
  | "curador"

/** Role of a single turn in the conversation. */
export type ConversationRole = "user" | "assistant" | "system"

/**
 * One turn in the conversation. Immutable from the caller's perspective —
 * `appendTurn` always mints a fresh `turnId`.
 */
export interface ConversationTurn {
  /** Stable, monotonically unique id within the context. */
  turnId: string
  /** Speaker role. */
  role: ConversationRole
  /** Raw content (Markdown allowed, never trimmed). */
  content: string
  /** Token estimate for this turn (caller-supplied or default). */
  tokens: number
  /** Unix epoch millis when the turn was emitted. */
  timestamp: number
  /** Persona that was active when the turn was created. */
  persona: Persona
}

/**
 * Per-user live context window. The streaming engine reads from this
 * structure to build the prompt for the next assistant reply.
 */
export interface ConversationContext {
  /** Stable user identifier (Supabase auth.uid). */
  userId: string
  /** Persona currently driving the assistant replies. */
  persona: Persona
  /** Chronologically ordered turns (oldest first). */
  turns: ConversationTurn[]
  /** Distilled insight strings extracted from past assistant turns. */
  insights: string[]
  /** Sum of all `turn.tokens` in `turns`. */
  totalTokens: number
  /** Timestamp of the oldest turn still in the window. */
  windowStart: number
  /** Timestamp of the newest turn still in the window. */
  windowEnd: number
}

/**
 * Audit record emitted every time the user changes persona mid-conversation.
 * The full switch event history is not stored here — only the latest one
 * is returned by `switchPersona`. Snapshots retain the *list* of personas
 * used across the window.
 */
export interface PersonaSwitchEvent {
  /** Persona that was active before the switch. */
  fromPersona: Persona
  /** Persona the user moved to. */
  toPersona: Persona
  /** Free-text reason for the switch ("need ritual guidance", etc). */
  reason: string
  /** Unix epoch millis when the switch happened. */
  switchedAt: number
  /** Number of turns preserved across the switch (always equals ctx.turns.length). */
  preservedTurns: number
}

/**
 * Point-in-time frozen view of a context, used for audit, debugging
 * and rehydration after a crash. Cheap to build — no content duplication.
 */
export interface MemorySnapshot {
  /** Stable id for this snapshot ("snap_<userId>_<capturedAt>"). */
  snapshotId: string
  /** User the snapshot belongs to. */
  userId: string
  /** Unix epoch millis when the snapshot was captured. */
  capturedAt: number
  /** Number of turns in the context at snapshot time. */
  turnsCount: number
  /** Number of insights retained at snapshot time. */
  insightsCount: number
  /** Distinct personas that appear in the window. */
  personasUsed: Persona[]
  /** Timestamp of the oldest turn in the window (0 if empty). */
  oldestTurnAt: number
  /** Timestamp of the newest turn in the window (0 if empty). */
  newestTurnAt: number
}

/**
 * Token accounting for the active context. `available` is what the
 * streaming engine can still spend on the next reply.
 */
export interface TokenBudget {
  /** Total cap for this conversation (e.g. 8000). */
  max: number
  /** Tokens already consumed by reserved / system content. */
  reserved: number
  /** `max - reserved - ctx.totalTokens`, never negative. */
  available: number
  /** Mean tokens per turn in the current window (0 if empty). */
  perTurnAvg: number
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build a deterministic-ish turn id. Uses timestamp + monotonic counter
 * scoped to this module — collisions are vanishingly unlikely inside a
 * single context, which is all we need.
 */
let __turnCounter = 0
function mintTurnId(): string {
  __turnCounter += 1
  return `turn_${Date.now().toString(36)}_${__turnCounter.toString(36)}`
}

/**
 * Split text into "sentences" using a deliberately simple heuristic:
 * split on `.`, `!`, `?`, `;` and line breaks, then trim.
 * Good enough for insight extraction; we are not implementing a NLP parser.
 */
function splitSentences(text: string): string[] {
  if (!text) return []
  const raw = text.split(/[.!?;\n]+/g)
  const out: string[] = []
  for (const piece of raw) {
    const trimmed = piece.trim()
    if (trimmed.length > 0) out.push(trimmed)
  }
  return out
}

/**
 * Returns true if the given sentence contains any of the INSIGHT_KEYWORDS.
 * Case-insensitive substring match.
 */
function hasGuidanceKeyword(sentence: string): boolean {
  const lower = sentence.toLowerCase()
  for (const kw of INSIGHT_KEYWORDS) {
    if (lower.includes(kw)) return true
  }
  return false
}

/**
 * Trim an array to a maximum length, keeping the most recent entries
 * (right side of the array). Returns a fresh array — never mutates input.
 */
function trimTail<T>(arr: ReadonlyArray<T>, max: number): T[] {
  if (max <= 0) return []
  if (arr.length <= max) return arr.slice()
  return arr.slice(arr.length - max)
}

/**
 * Coalesce insights by appending only those not already present.
 * Keeps the original ordering of the existing insights and appends
 * the new ones at the end. Caps to MAX_INSIGHTS_RETAINED.
 */
function mergeInsightsPreservingOrder(
  existing: ReadonlyArray<string>,
  incoming: ReadonlyArray<string>,
  max: number,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of existing) {
    if (!seen.has(s)) {
      seen.add(s)
      out.push(s)
    }
  }
  for (const s of incoming) {
    if (!seen.has(s)) {
      seen.add(s)
      out.push(s)
    }
    if (out.length >= max) break
  }
  return trimTail(out, max)
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

/**
 * Build an empty `ConversationContext` for a fresh user session.
 * The window timestamps are set to `now` so that an empty context still
 * has a non-degenerate range.
 *
 * @param userId  Stable user identifier.
 * @param persona Persona to start with (defaults to `DEFAULT_PERSONA`).
 * @param now     Optional timestamp override (defaults to Date.now()).
 */
export function buildEmptyContext(
  userId: string,
  persona: Persona = DEFAULT_PERSONA,
  now: number = Date.now(),
): ConversationContext {
  return {
    userId,
    persona,
    turns: [],
    insights: [],
    totalTokens: 0,
    windowStart: now,
    windowEnd: now,
  }
}

// ---------------------------------------------------------------------------
// Mutators (pure: always return a new context)
// ---------------------------------------------------------------------------

/**
 * Append a turn to the context. Mints a fresh `turnId`, updates the
 * window timestamps, the `totalTokens` counter, and re-extracts insights
 * from any assistant turn that was just added.
 *
 * If the resulting context exceeds `MAX_TURNS_IN_WINDOW` it is trimmed
 * (oldest entries dropped) but `totalTokens` is **not** auto-pruned —
 * call `pruneContext` for that.
 */
export function appendTurn(
  ctx: ConversationContext,
  turn: Omit<ConversationTurn, "turnId">,
): ConversationContext {
  const fullTurn: ConversationTurn = {
    turnId: mintTurnId(),
    role: turn.role,
    content: turn.content,
    tokens: Math.max(0, Math.floor(turn.tokens)),
    timestamp: turn.timestamp,
    persona: turn.persona,
  }

  const turns = ctx.turns.concat(fullTurn)
  const trimmedTurns =
    turns.length > MAX_TURNS_IN_WINDOW
      ? turns.slice(turns.length - MAX_TURNS_IN_WINDOW)
      : turns

  // Recompute total tokens from scratch — cheap, deterministic, and
  // immune to drift if a caller mutated a turn in place.
  let totalTokens = 0
  for (const t of trimmedTurns) totalTokens += t.tokens

  const windowStart = trimmedTurns.length > 0 ? trimmedTurns[0]!.timestamp : ctx.windowStart
  const windowEnd = trimmedTurns.length > 0 ? trimmedTurns[trimmedTurns.length - 1]!.timestamp : ctx.windowEnd

  // Re-extract insights only when the new turn is from the assistant.
  let insights = ctx.insights
  if (fullTurn.role === "assistant") {
    const newOnes = extractInsights([fullTurn])
    insights = mergeInsightsPreservingOrder(
      ctx.insights,
      newOnes,
      MAX_INSIGHTS_RETAINED,
    )
  }

  return {
    userId: ctx.userId,
    persona: ctx.persona,
    turns: trimmedTurns,
    insights,
    totalTokens,
    windowStart,
    windowEnd,
  }
}

/**
 * Switch the active persona and return the new context + an event record.
 * History is fully preserved — this is a logical persona change, not a
 * context reset. Insights are kept as-is; their persona attribution is
 * recoverable via each turn's `persona` field.
 */
export function switchPersona(
  ctx: ConversationContext,
  toPersona: Persona,
  reason: string,
  now: number,
): { ctx: ConversationContext; event: PersonaSwitchEvent } {
  const fromPersona = ctx.persona
  const nextCtx: ConversationContext = {
    ...ctx,
    persona: toPersona,
  }
  const event: PersonaSwitchEvent = {
    fromPersona,
    toPersona,
    reason,
    switchedAt: now,
    preservedTurns: ctx.turns.length,
  }
  return { ctx: nextCtx, event }
}

// ---------------------------------------------------------------------------
// Recall helpers
// ---------------------------------------------------------------------------

/**
 * Return the most recent `limit` turns, oldest first. If `limit` is
 * larger than the available turns, returns everything.
 */
export function recallRecent(
  ctx: ConversationContext,
  limit: number,
): ConversationTurn[] {
  if (limit <= 0) return []
  const all = ctx.turns
  if (all.length <= limit) return all.slice()
  return all.slice(all.length - limit)
}

/**
 * Return the most recent `limit` turns that were emitted under the
 * given persona. Useful for "what did the guia_ritual say last time?".
 */
export function recallByPersona(
  ctx: ConversationContext,
  persona: Persona,
  limit: number,
): ConversationTurn[] {
  if (limit <= 0) return []
  const filtered: ConversationTurn[] = []
  // Walk newest → oldest to keep "most recent" semantics consistent.
  for (let i = ctx.turns.length - 1; i >= 0; i -= 1) {
    const t = ctx.turns[i]
    if (t && t.persona === persona) {
      filtered.push(t)
      if (filtered.length >= limit) break
    }
  }
  return filtered.reverse()
}

// ---------------------------------------------------------------------------
// Insight extraction
// ---------------------------------------------------------------------------

/**
 * Extract insight sentences from the given assistant turns.
 * A sentence is kept if:
 *  - length is in [INSIGHT_MIN_LENGTH, INSIGHT_MAX_LENGTH] characters
 *  - it contains at least one INSIGHT_KEYWORD
 *
 * Order of output: same order as the turns, oldest sentence first.
 * Duplicates (case-insensitive exact match) are dropped.
 */
export function extractInsights(turns: ConversationTurn[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const turn of turns) {
    if (turn.role !== "assistant") continue
    for (const sentence of splitSentences(turn.content)) {
      if (sentence.length < INSIGHT_MIN_LENGTH) continue
      if (sentence.length > INSIGHT_MAX_LENGTH) continue
      if (!hasGuidanceKeyword(sentence)) continue
      const key = sentence.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(sentence)
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Pruning & summarization
// ---------------------------------------------------------------------------

/**
 * Drop oldest turns until the context fits within `maxTokens` (or is
 * empty). Uses `CONTEXT_OVERFLOW_TRIM_RATIO` to avoid pruning one turn
 * at a time: when overflow is detected, the oldest 30% of the window
 * is removed in one pass, then a second pass trims to the exact limit.
 *
 * Returns the new context and the number of turns that were dropped.
 */
export function pruneContext(
  ctx: ConversationContext,
  maxTokens: number,
): { ctx: ConversationContext; droppedTurns: number } {
  if (maxTokens <= 0) {
    return {
      ctx: { ...ctx, turns: [], totalTokens: 0 },
      droppedTurns: ctx.turns.length,
    }
  }

  let turns = ctx.turns.slice()
  const originalCount = turns.length

  if (turns.length === 0) {
    return {
      ctx: { ...ctx, turns: [], totalTokens: 0 },
      droppedTurns: 0,
    }
  }

  // Coarse pass: drop the oldest (1 - ratio) of the window.
  if (turns.length > MAX_TURNS_IN_WINDOW) {
    const keep = Math.max(1, Math.floor(MAX_TURNS_IN_WINDOW * CONTEXT_OVERFLOW_TRIM_RATIO))
    turns = turns.slice(turns.length - keep)
  }

  // Fine pass: keep dropping the oldest turn until totalTokens <= max.
  let total = 0
  for (const t of turns) total += t.tokens
  while (turns.length > 0 && total > maxTokens) {
    const dropped = turns.shift()!
    total -= dropped.tokens
  }

  const windowStart = turns.length > 0 ? turns[0]!.timestamp : ctx.windowStart
  const windowEnd = turns.length > 0 ? turns[turns.length - 1]!.timestamp : ctx.windowEnd

  return {
    ctx: {
      userId: ctx.userId,
      persona: ctx.persona,
      turns,
      insights: ctx.insights,
      totalTokens: total,
      windowStart,
      windowEnd,
    },
    droppedTurns: originalCount - turns.length,
  }
}

/**
 * Build a short summary string that fits within `targetTokens` tokens
 * (approximated as 1 token ≈ 4 characters). The summary stitches:
 *  - the persona currently active
 *  - up to 5 most recent insight strings
 *  - the last 3 turn contents (truncated per-turn to the remaining budget)
 *
 * If the budget is too small to fit anything, returns an empty string.
 */
export function summarizeForContext(
  ctx: ConversationContext,
  targetTokens: number,
): string {
  if (targetTokens <= 0) return ""

  const charBudget = Math.max(0, Math.floor(targetTokens * 4))
  if (charBudget === 0) return ""

  const parts: string[] = []
  let remaining = charBudget

  const personaLine = `[persona=${ctx.persona}, turns=${ctx.turns.length}, insights=${ctx.insights.length}]`
  if (personaLine.length <= remaining) {
    parts.push(personaLine)
    remaining -= personaLine.length
  } else {
    return personaLine.slice(0, remaining)
  }

  // Insights (most recent first, up to 5).
  const recentInsights = ctx.insights.slice(-5).reverse()
  for (const ins of recentInsights) {
    const line = `• ${ins}`
    if (line.length + 1 > remaining) break
    parts.push(line)
    remaining -= line.length + 1
  }

  // Last 3 turns, newest first.
  const tail = ctx.turns.slice(-3).reverse()
  for (const turn of tail) {
    const snippet = turn.content.length > 160 ? `${turn.content.slice(0, 157)}…` : turn.content
    const line = `[${turn.role}/${turn.persona}] ${snippet}`
    if (line.length + 1 > remaining) break
    parts.push(line)
    remaining -= line.length + 1
  }

  return parts.join("\n")
}

// ---------------------------------------------------------------------------
// Snapshots
// ---------------------------------------------------------------------------

/**
 * Capture a `MemorySnapshot` of the current context. The snapshot id
 * embeds the user id and the capture timestamp so it is naturally
 * sortable and unique enough for audit use.
 */
export function buildSnapshot(
  ctx: ConversationContext,
  now: number = Date.now(),
): MemorySnapshot {
  const personas = listPersonasUsed(ctx)
  return {
    snapshotId: `snap_${ctx.userId}_${now.toString(36)}`,
    userId: ctx.userId,
    capturedAt: now,
    turnsCount: ctx.turns.length,
    insightsCount: ctx.insights.length,
    personasUsed: personas,
    oldestTurnAt: ctx.turns.length > 0 ? ctx.turns[0]!.timestamp : 0,
    newestTurnAt:
      ctx.turns.length > 0 ? ctx.turns[ctx.turns.length - 1]!.timestamp : 0,
  }
}

/**
 * Return the distinct set of personas that appear in the current window,
 * in the order they were first observed (oldest first).
 */
export function listPersonasUsed(ctx: ConversationContext): Persona[] {
  const seen = new Set<Persona>()
  const ordered: Persona[] = []
  for (const turn of ctx.turns) {
    if (!seen.has(turn.persona)) {
      seen.add(turn.persona)
      ordered.push(turn.persona)
    }
  }
  // Always include the currently active persona, even if it never
  // produced a turn yet (e.g. right after `switchPersona`).
  if (!seen.has(ctx.persona)) ordered.push(ctx.persona)
  return ordered
}

// ---------------------------------------------------------------------------
// Token accounting
// ---------------------------------------------------------------------------

/**
 * Compute a `TokenBudget` for the current context. `available` is
 * clamped to a non-negative value. `perTurnAvg` is rounded to the
 * nearest integer.
 */
export function tokenBudgetFor(
  ctx: ConversationContext,
  max: number,
  reserved: number,
): TokenBudget {
  const safeMax = Math.max(0, Math.floor(max))
  const safeReserved = Math.max(0, Math.floor(reserved))
  const rawAvailable = safeMax - safeReserved - ctx.totalTokens
  const available = Math.max(0, rawAvailable)

  let perTurnAvg = 0
  if (ctx.turns.length > 0) {
    perTurnAvg = Math.round(ctx.totalTokens / ctx.turns.length)
  }

  return {
    max: safeMax,
    reserved: safeReserved,
    available,
    perTurnAvg,
  }
}
