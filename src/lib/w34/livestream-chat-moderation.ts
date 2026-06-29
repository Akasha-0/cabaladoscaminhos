// ============================================================================
// LIVE STREAM CHAT MODERATION — Pure-TS engine (no runtime deps)
// ============================================================================
// Funções puras para moderadores chamarem em server actions / route handlers.
// Escopo: slow mode, banidos (word-boundary case-insensitive), ações de mod
// (delete / timeout / ban / shadow / pin / slow_mode_*), autorização por
// role, e validação anti-ReDoS dos patterns enviados por moderadores.
// ============================================================================

// ============================================================================
// TIPOS & CONSTANTES
// ============================================================================

export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  body: string;
  sentAt: number;
  deletedAt?: number;
  deletedBy?: string;
}

export type ModerationAction =
  | "delete" | "timeout" | "ban" | "shadow" | "pin"
  | "slow_mode_on" | "slow_mode_off";
export type SlowModeInterval = 5 | 10 | 30 | 60;
export type SlowModeAppliesTo = "all" | "subscriber" | "moderator";
export type UserRole = "subscriber" | "moderator" | "admin" | "owner";
export type BannedSeverity = "low" | "medium" | "high";

export interface SlowModeConfig {
  enabled: boolean;
  intervalSeconds: SlowModeInterval;
  appliesToRole?: SlowModeAppliesTo;
}
export interface BannedWord {
  pattern: string;
  severity: BannedSeverity;
  action: ModerationAction;
}
export interface ModerationLog {
  id: string;
  messageId: string;
  action: ModerationAction;
  performedBy: string;
  performedAt: number;
  reason: string;
}
export interface SlowModeDecision {
  allowed: boolean;
  nextAllowedAt: number; // ms epoch; cliente usa pra exibir countdown
}
export interface FilterResult {
  allowed: boolean;
  filteredBody: string;
  matches: BannedWord[];
}
export interface ModerationSummary {
  deletes: number;
  timeouts: number;
  bans: number;
  shadows: number;
  pins: number;
}



export const CHAT_MAX_LENGTH = 500;
export const TIMEOUT_DURATIONS_SECONDS: readonly number[] = [60, 300, 900, 3600, 86400];
export const SLOW_MODE_INTERVALS: readonly SlowModeInterval[] = [5, 10, 30, 60] as const;

const MOD_ROLES: ReadonlySet<UserRole> = new Set(["moderator", "admin", "owner"]);

// ============================================================================
// SLOW MODE
// ============================================================================

/** Decide se o usuário pode enviar agora. `lastSent=0` libera como primeira msg. */
export function applySlowMode(
  userLastMessageAt: number,
  now: number,
  slowMode: SlowModeConfig
): SlowModeDecision {
  if (!slowMode.enabled || userLastMessageAt <= 0) {
    return { allowed: true, nextAllowedAt: now };
  }
  const elapsedSec = (now - userLastMessageAt) / 1000;
  if (elapsedSec >= slowMode.intervalSeconds) {
    return { allowed: true, nextAllowedAt: now };
  }
  return {
    allowed: false,
    nextAllowedAt: userLastMessageAt + slowMode.intervalSeconds * 1000,
  };
}

export function buildSlowModeConfig(
  intervalSeconds: SlowModeInterval,
  role: SlowModeAppliesTo = "all"
): SlowModeConfig {
  return { enabled: true, intervalSeconds, appliesToRole: role };
}

/** Cicla o intervalo no set canônico [5,10,30,60]. */
export function rotateSlowModeInterval(
  current: SlowModeInterval,
  direction: "up" | "down"
): SlowModeInterval {
  const idx = SLOW_MODE_INTERVALS.indexOf(current);
  const safeIdx = idx === -1 ? 0 : idx;
  const nextIdx =
    direction === "up"
      ? Math.min(safeIdx + 1, SLOW_MODE_INTERVALS.length - 1)
      : Math.max(safeIdx - 1, 0);
  return SLOW_MODE_INTERVALS[nextIdx]!;
}

// ============================================================================
// PALAVRAS BANIDAS — detecção + filtro
// ============================================================================

const patternCache = new Map<string, RegExp>();

function compileWordBoundary(pattern: string): RegExp {
  const cached = patternCache.get(pattern);
  if (cached) return cached;
  // Escape manual + \b nas pontas: caller não precisa preocupar com meta-chars
  // e bloqueamos match parcial ("abc" dentro de "abcd").
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "i");
  patternCache.set(pattern, re);
  return re;
}

/** Detecta todos os patterns banidos no corpo (case-insensitive, word-boundary). */
export function detectBannedWords(
  body: string,
  bannedWords: readonly BannedWord[]
): BannedWord[] {
  if (!body || bannedWords.length === 0) return [];
  const matches: BannedWord[] = [];
  for (const bw of bannedWords) {
    if (compileWordBoundary(bw.pattern).test(body)) matches.push(bw);
  }
  return matches;
}

/**
 * Censura o body substituindo cada match por asteriscos do mesmo comprimento.
 * `allowed=false` apenas se algum match for `high` severity.
 */
export function filterChatMessage(
  body: string,
  bannedWords: readonly BannedWord[]
): FilterResult {
  if (!body) return { allowed: false, filteredBody: "", matches: [] };
  const matches = detectBannedWords(body, bannedWords);
  if (matches.length === 0) return { allowed: true, filteredBody: body, matches: [] };
  let filtered = body;
  for (const bw of matches) {
    const regex = compileWordBoundary(bw.pattern);
    filtered = filtered.replace(regex, (m) => "*".repeat(m.length));
  }
  const allowed = !matches.some((m) => m.severity === "high");
  return { allowed, filteredBody: filtered, matches };
}

/** Severidade alta → delete sempre. Média/baixa ficam a critério da UI. */
export function shouldDeleteMessage(
  _message: ChatMessage,
  bannedMatches: readonly BannedWord[]
): boolean {
  return bannedMatches.some((m) => m.severity === "high");
}

// ============================================================================
// AÇÕES DE MODERAÇÃO
// ============================================================================

let logSeq = 0;

/**
 * Aplica ação e devolve log pronto pra persistir. Muta `message` quando for
 * `delete` (atribui `deletedAt`/`deletedBy`); demais ações só geram log.
 */
export function executeModAction(
  message: ChatMessage,
  action: ModerationAction,
  moderatorId: string,
  now: number,
  reason = ""
): ModerationLog {
  if (action === "delete" && message.deletedAt === undefined) {
    message.deletedAt = now;
    message.deletedBy = moderatorId;
  }
  return {
    id: `mod_${Date.now().toString(36)}_${(logSeq++).toString(36)}`,
    messageId: message.id,
    action,
    performedBy: moderatorId,
    performedAt: now,
    reason: reason || defaultReasonFor(action),
  };
}

function defaultReasonFor(action: ModerationAction): string {
  switch (action) {
    case "delete": return "mensagem removida por moderador";
    case "timeout": return "usuário silenciado temporariamente";
    case "ban": return "usuário banido do canal";
    case "shadow": return "mensagem em shadow (apenas autor vê)";
    case "pin": return "mensagem fixada no topo do chat";
    case "slow_mode_on": return "slow mode ativado";
    case "slow_mode_off": return "slow mode desativado";
  }
}

export function summarizeModerationActions(
  logs: readonly ModerationLog[]
): ModerationSummary {
  const summary: ModerationSummary = {
    deletes: 0, timeouts: 0, bans: 0, shadows: 0, pins: 0,
  };
  for (const log of logs) {
    if (log.action === "delete") summary.deletes++;
    else if (log.action === "timeout") summary.timeouts++;
    else if (log.action === "ban") summary.bans++;
    else if (log.action === "shadow") summary.shadows++;
    else if (log.action === "pin") summary.pins++;
    // slow_mode_* não entra no summary (são toggles, não ações sobre mensagens)
  }
  return summary;
}

// ============================================================================
// AUTORIZAÇÃO
// ============================================================================

/** Mods podem tudo (inclusive outros mods — decisão de admin). Subs só agem em si mesmos. */
export function canModerate(userRole: UserRole, targetUserRole: UserRole): boolean {
  return MOD_ROLES.has(userRole) || userRole === targetUserRole;
}

// ============================================================================
// VALIDAÇÃO DE PATTERN (anti-ReDoS)
// ============================================================================

/** Heurística conservadora que bloqueia `(a+)+`, `(|a)`, `++`, chars de controle. */
export function validateBannedWordPattern(pattern: string): boolean {
  if (typeof pattern !== "string" || pattern.length === 0 || pattern.length > 64) {
    return false;
  }
  if (/[\u0000-\u001f\u007f]/.test(pattern)) return false;
  if (/\(\s*\|/.test(pattern)) return false;                              // ramo vazio
  if (/\((?:\?:)?(?:[^()]*[+*]\+?)\)[+*]/.test(pattern)) return false;   // nested quantifier
  if (/[+*]\s*[+*]/.test(pattern)) return false;                         // quantifier adjacente
  return true;
}
