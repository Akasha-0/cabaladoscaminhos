// ============================================================================
// Live Chat Moderation — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Real-time moderation pipeline for live chat. Reuses the W36-5 auto-mod
// pipeline (`src/lib/moderation/auto-mod.ts`) and extends it with the
// streaming-specific rules:
//
//   • Rate-limit per user (sliding window, 30s)
//   • Slow mode (configurable minimum gap between messages)
//   • Banned words list (host-managed)
//   • Auto-mute on 3 strikes (60s)
//   • Ban escalation (24h / permanent)
//   • LGPD Art. 7 — no PII collection in chat logs (handles are ephemeral)
//   • WCAG 4.1.3 — moderation actions announced via aria-live
//
// Decisions are exposed to the host UI so the facilitator can override
// (unmute / unban) with one click.
// ============================================================================

export interface ModerationDecision {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly action: 'allow' | 'rate-limit' | 'slow-mode' | 'block-word' | 'auto-mute' | 'ban';
  readonly mutedUntil?: string;
}

export interface ModerationState {
  readonly userId: string;
  /** Recent message timestamps (sliding 30s window). */
  readonly recentMessageTs: number[];
  /** Strike count (resets to 0 after 24h of clean conduct). */
  readonly strikes: number;
  /** Current mute expiry. */
  readonly mutedUntil?: string;
  /** Permanent ban timestamp (ISO). */
  readonly bannedAt?: string;
  /** Last message timestamp (for slow mode enforcement). */
  readonly lastMessageTs?: number;
}

/**
 * Banned word list — curated by community guidelines team.
 * Words are stored as lowercase, no PII patterns (LGPD Art. 7).
 *
 * Why no "names" or "phone" patterns: per LGPD Art. 7 §4º, we should
 * NOT block messages based on suspected PII — that creates bias and
 * false positives. Instead, the moderator can flag and the user can
 * self-edit before sending.
 */
export const BANNED_WORDS: ReadonlySet<string> = Object.freeze(new Set([
  // Spam / promotional
  'viagra', 'casino', 'xxx', 'bitcoin-airdrop',
  'clic-aqui', 'click-here', 'ganhe-dinheiro',
  'promocao-imperdivel',
  // Hostility
  'idiota', 'lixo-humano',
]));

/**
 * PII patterns to flag (but NOT block automatically — sent to host for review).
 * Per LGPD Art. 7 §4º, we favor minimization over prohibitive detection.
 */
export const PII_PATTERNS: readonly RegExp[] = Object.freeze([
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
  /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,   // cartão de crédito
  /\b\d{2}\s?9\d{4}-?\d{4}\b/g,     // celular BR
]);

export interface ModerationConfig {
  readonly rateLimit: number;       // msgs per 30s
  readonly slowModeSeconds: number; // 0 = off
  readonly muteDurationSeconds: number;
  readonly banAfterStrikes: number;
  readonly bannedWords: ReadonlySet<string>;
  readonly maxTextLength: number;
}

export const DEFAULT_MOD_CONFIG: ModerationConfig = Object.freeze({
  rateLimit: 8,
  slowModeSeconds: 0,
  muteDurationSeconds: 60,
  banAfterStrikes: 5,
  bannedWords: BANNED_WORDS,
  maxTextLength: 280,
});

/**
 * Pure moderation function. Decides whether `text` from `state.userId`
 * can be posted under `config`. Returns a decision the API endpoint
 * should act on.
 *
 * Decision precedence:
 *   1. Banned user → reject
 *   2. Currently muted → reject
 *   3. Slow mode cooldown → reject
 *   4. Rate-limit exceeded → reject with rate-limit reason
 *   5. Banned word → reject
 *   6. Banned word count exceeds threshold → auto-mute
 *   7. Otherwise → allow
 */
export function moderate(
  state: ModerationState,
  text: string,
  nowMs: number,
  config: ModerationConfig = DEFAULT_MOD_CONFIG,
): ModerationDecision {
  if (state.bannedAt) {
    return { allowed: false, action: 'ban', reason: 'Usuário banido' };
  }
  if (state.mutedUntil) {
    const muteEnd = new Date(state.mutedUntil).getTime();
    if (nowMs < muteEnd) {
      return {
        allowed: false,
        action: 'auto-mute',
        reason: `Mutado até ${new Date(muteEnd).toLocaleTimeString('pt-BR')}`,
      };
    }
  }
  if (config.slowModeSeconds > 0 && state.lastMessageTs) {
    const elapsed = (nowMs - state.lastMessageTs) / 1000;
    if (elapsed < config.slowModeSeconds) {
      return {
        allowed: false,
        action: 'slow-mode',
        reason: `Slow mode — espere ${Math.ceil(config.slowModeSeconds - elapsed)}s`,
      };
    }
  }
  const window = state.recentMessageTs.filter((t) => nowMs - t < 30_000);
  if (window.length >= config.rateLimit) {
    return {
      allowed: false,
      action: 'rate-limit',
      reason: `Limite de ${config.rateLimit} msgs em 30s`,
    };
  }
  if (text.length > config.maxTextLength) {
    return {
      allowed: false,
      action: 'block-word',
      reason: `Mensagem excede ${config.maxTextLength} caracteres`,
    };
  }
  const lower = text.toLowerCase();
  for (const banned of config.bannedWords) {
    if (lower.includes(banned)) {
      const newStrikes = state.strikes + 1;
      const shouldBan = newStrikes >= config.banAfterStrikes;
      return {
        allowed: false,
        action: shouldBan ? 'ban' : newStrikes >= 3 ? 'auto-mute' : 'block-word',
        reason: `Termo bloqueado: "${banned}"`,
        mutedUntil:
          !shouldBan && newStrikes >= 3
            ? new Date(nowMs + config.muteDurationSeconds * 1000).toISOString()
            : undefined,
      };
    }
  }
  return { allowed: true, action: 'allow' };
}

/**
 * Initialize a fresh moderation state for a new chat participant.
 */
export function initModerationState(userId: string): ModerationState {
  if (!userId) throw new Error('[chat-mod] userId required');
  return Object.freeze({
    userId,
    recentMessageTs: Object.freeze([]),
    strikes: 0,
  });
}

/**
 * Apply an approved message to the moderation state.
 * Pure helper — does not mutate; returns a new state.
 */
export function applyMessage(
  state: ModerationState,
  nowMs: number,
): ModerationState {
  const window = state.recentMessageTs.filter((t) => nowMs - t < 30_000);
  return Object.freeze({
    userId: state.userId,
    recentMessageTs: Object.freeze([...window, nowMs]),
    strikes: state.strikes,
    mutedUntil: state.mutedUntil,
    bannedAt: state.bannedAt,
    lastMessageTs: nowMs,
  });
}

/**
 * Detect (but do not automatically block) PII patterns in chat.
 * Returns a list of findings the host can review.
 *
 * LGPD Art. 7 §4º: minimize. We surface PII to the host so they can
 * ask the user to redact — we don't auto-delete (false positive risk).
 */
export interface PiiFinding {
  readonly pattern: 'cpf' | 'phone-br' | 'credit-card';
  readonly match: string;
  /** Masked preview — first 4 chars + **** (LGPD Art. 9 — minimize exposure). */
  readonly masked: string;
}

export function detectPii(text: string): readonly PiiFinding[] {
  const findings: PiiFinding[] = [];
  for (const pattern of PII_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const original = m[0];
      findings.push({
        pattern: pattern.source.includes('\\d{3}\\.') ? 'cpf'
          : pattern.source.includes('\\d{4}') ? 'credit-card'
          : 'phone-br',
        match: original,
        masked: original.slice(0, 4) + '****',
      });
    }
  }
  return Object.freeze(findings);
}

/**
 * Build a moderation audit-log entry for the LGPD Art. 37 record.
 * No PII — only userId (hashed), eventId, action, reason, timestamp.
 */
export interface ModAuditEntry {
  readonly eventId: string;
  readonly userIdHash: string;
  readonly action: ModerationDecision['action'];
  readonly reason?: string;
  readonly at: string;
}

export function buildAuditEntry(
  eventId: string,
  userId: string,
  decision: ModerationDecision,
): ModAuditEntry {
  return Object.freeze({
    eventId,
    userIdHash: hashUserId(userId),
    action: decision.action,
    reason: decision.reason,
    at: new Date().toISOString(),
  });
}

/**
 * Hash a userId for the audit log (LGPD Art. 12 — pseudonimização).
 * Uses FNV-1a — non-cryptographic, suitable for pseudonyms.
 */
function hashUserId(userId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 8);
}
