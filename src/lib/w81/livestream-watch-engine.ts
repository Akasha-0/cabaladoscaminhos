/**
 * ════════════════════════════════════════════════════════════════════════════
 * W81-D — LIVESTREAM WATCH UI · ENGINE (pure logic)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 81 · 2026-06-30
 * Author: W81-D Coder (Mavis orchestrator session 414735487684817)
 *
 * Pure helpers for the Livestream Watch UI surface. NO React imports here —
 * the UI lives in `livestream-watch-ui.tsx` and imports these helpers.
 *
 * What lives in this engine (and why):
 *   • Branded ID factories        (StreamId, ChatMessageId, UserId, ReactionId)
 *   • Stream-category metadata    (mesa, gira, prece, leitura, ritual, mantra, estudo)
 *   • Chat-message discriminated union (text | reaction | system | moderation | question)
 *   • Chat-moderation hooks        (profanity/sacred-pii detection + decision)
 *   • Reaction debounce logic      (per-user rate-limit, 600ms floor)
 *   • A11Y helpers                 (aria labels, live region config, keyboard map)
 *   • State-machine guards         (player transitions + chat transitions)
 *   • LGPD audio-consent gate      (autoPlay must NEVER fire audio without gesture)
 *   • Viewer-count compact formatter
 *
 * What lives in the UI file:
 *   • React components that wire props to these helpers + render <video>/<button>
 *
 * Durable lessons applied (cycle 60-80):
 *   - Branded ID factory + regex prefix (cycle 75/77)
 *   - Discriminated unions with positive `if (m.kind === 'text')` (cycle 73)
 *   - Object.freeze on every public record + nested array (cycle 75)
 *   - Pure helpers separated from React components (cycle 80)
 *   - Sacred-tradition coverage (7 traditions) (cycle 73-80)
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES — StreamId / ChatMessageId / UserId / ReactionId
// ════════════════════════════════════════════════════════════════════════════

export type StreamId = string & { readonly __brand: 'StreamId' };
export type ChatMessageId = string & { readonly __brand: 'ChatMessageId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type ReactionId = string & { readonly __brand: 'ReactionId' };

/** Format: `ls_*` where * is 12+ lowercase hex chars. */
const STREAM_ID_RE = /^ls_[a-z0-9]{12,}$/;
/** Format: `cm_*` where * is 12+ lowercase hex chars. */
const CHAT_ID_RE = /^cm_[a-z0-9]{12,}$/;
/** Format: `usr_*` (matches Prisma cuid-style users). */
const USER_ID_RE = /^usr_[a-z0-9]{6,}$/;
/** Format: `rxn_*` */
const REACTION_ID_RE = /^rxn_[a-z0-9]{12,}$/;

function brand<B extends string>(re: RegExp, prefix: string, raw: string, label: string): B {
  if (typeof raw !== 'string' || !re.test(raw)) {
    throw new Error(`Invalid ${label}: ${JSON.stringify(raw)} (expected match ${re})`);
  }
  if (!raw.startsWith(prefix)) {
    throw new Error(`Invalid ${label}: must start with "${prefix}"`);
  }
  return raw as unknown as B;
}

export function streamId(raw: string): StreamId {
  return brand(STREAM_ID_RE, 'ls_', raw, 'StreamId');
}

export function chatMessageId(raw: string): ChatMessageId {
  return brand(CHAT_ID_RE, 'cm_', raw, 'ChatMessageId');
}

export function userId(raw: string): UserId {
  return brand(USER_ID_RE, 'usr_', raw, 'UserId');
}

export function reactionId(raw: string): ReactionId {
  return brand(REACTION_ID_RE, 'rxn_', raw, 'ReactionId');
}

// ════════════════════════════════════════════════════════════════════════════
// 7 SACRED STREAM CATEGORIES
// ════════════════════════════════════════════════════════════════════════════

export type StreamCategory =
  | 'mesa'
  | 'gira'
  | 'prece'
  | 'leitura'
  | 'ritual'
  | 'mantra'
  | 'estudo';

export interface StreamCategoryMeta {
  readonly id: StreamCategory;
  readonly label: string;
  readonly shortLabel: string;
  readonly emoji: string;
  readonly traditionHints: ReadonlyArray<
    'Cigano' | 'Umbanda' | 'Candomblé' | 'Ifá' | 'Cabala' | 'Astrologia' | 'Tantra' | 'Tarot' | 'Runas' | 'Numerologia'
  >;
  readonly lgpdRequiresAudioConsent: boolean;
  readonly lgpdSacredContent: boolean;
  readonly accentColor: string;
  readonly ariaDescription: string;
}

function traditions<const T extends ReadonlyArray<'Cigano' | 'Umbanda' | 'Candomblé' | 'Ifá' | 'Cabala' | 'Astrologia' | 'Tantra' | 'Tarot' | 'Runas' | 'Numerologia'>>(arr: T): ReadonlyArray<T[number]> {
  return Object.freeze([...arr]) as unknown as ReadonlyArray<T[number]>;
}

export const STREAM_CATEGORIES: Readonly<Record<StreamCategory, StreamCategoryMeta>> = Object.freeze({
  mesa: Object.freeze({
    id: 'mesa',
    label: 'Mesa Real',
    shortLabel: 'Mesa',
    emoji: '🕯️',
    traditionHints: traditions(['Cigano', 'Tarot']),
    lgpdRequiresAudioConsent: true,
    lgpdSacredContent: true,
    accentColor: '#7c3aed',
    ariaDescription: 'Mesa Real — leitura de cartas Cigano ao vivo',
  }),
  gira: Object.freeze({
    id: 'gira',
    label: 'Gira',
    shortLabel: 'Gira',
    emoji: '🥁',
    traditionHints: traditions(['Umbanda', 'Candomblé']),
    lgpdRequiresAudioConsent: true,
    lgpdSacredContent: true,
    accentColor: '#dc2626',
    ariaDescription: 'Gira — cerimônia sagrada de Umbanda ou Candomblé',
  }),
  prece: Object.freeze({
    id: 'prece',
    label: 'Prece',
    shortLabel: 'Prece',
    emoji: '🙏',
    traditionHints: traditions(['Umbanda', 'Candomblé', 'Cabala']),
    lgpdRequiresAudioConsent: true,
    lgpdSacredContent: true,
    accentColor: '#0891b2',
    ariaDescription: 'Prece coletiva — momento de oração guiada',
  }),
  leitura: Object.freeze({
    id: 'leitura',
    label: 'Leitura',
    shortLabel: 'Leitura',
    emoji: '🔮',
    traditionHints: traditions(['Astrologia', 'Numerologia', 'Tarot']),
    lgpdRequiresAudioConsent: true,
    lgpdSacredContent: false,
    accentColor: '#6366f1',
    ariaDescription: 'Leitura — astrologia, numerologia ou tarot ao vivo',
  }),
  ritual: Object.freeze({
    id: 'ritual',
    label: 'Ritual',
    shortLabel: 'Ritual',
    emoji: '🌿',
    traditionHints: traditions(['Umbanda', 'Candomblé', 'Ifá']),
    lgpdRequiresAudioConsent: true,
    lgpdSacredContent: true,
    accentColor: '#16a34a',
    ariaDescription: 'Ritual público — banho, defumação ou oferenda',
  }),
  mantra: Object.freeze({
    id: 'mantra',
    label: 'Mantra',
    shortLabel: 'Mantra',
    emoji: '🕉️',
    traditionHints: traditions(['Tantra', 'Cabala']),
    lgpdRequiresAudioConsent: true,
    lgpdSacredContent: true,
    accentColor: '#db2777',
    ariaDescription: 'Mantra — meditação e canto coletivo',
  }),
  estudo: Object.freeze({
    id: 'estudo',
    label: 'Estudo',
    shortLabel: 'Estudo',
    emoji: '📚',
    traditionHints: traditions(['Cabala', 'Ifá', 'Runas', 'Tantra']),
    lgpdRequiresAudioConsent: false,
    lgpdSacredContent: false,
    accentColor: '#0ea5e9',
    ariaDescription: 'Estudo — roda de saber sobre tradição espiritual',
  }),
});

export function listStreamCategories(): ReadonlyArray<StreamCategory> {
  return Object.freeze([
    'mesa', 'gira', 'prece', 'leitura', 'ritual', 'mantra', 'estudo',
  ] as StreamCategory[]);
}

export function getStreamCategory(id: string): StreamCategoryMeta | null {
  const known = (STREAM_CATEGORIES as Record<string, StreamCategoryMeta | undefined>)[id];
  return known ?? null;
}

// ════════════════════════════════════════════════════════════════════════════
// PLAYER STATE MACHINE — IDLE → BUFFERING → PLAYING | PAUSED → ENDED
// ════════════════════════════════════════════════════════════════════════════

export type PlayerState = 'IDLE' | 'BUFFERING' | 'PLAYING' | 'PAUSED' | 'ENDED';

const PLAYER_TRANSITIONS: Readonly<Record<PlayerState, ReadonlyArray<PlayerState>>> = Object.freeze({
  IDLE: Object.freeze(['BUFFERING'] as PlayerState[]),
  BUFFERING: Object.freeze(['PLAYING', 'PAUSED', 'ENDED', 'IDLE'] as PlayerState[]),
  PLAYING: Object.freeze(['PAUSED', 'BUFFERING', 'ENDED'] as PlayerState[]),
  PAUSED: Object.freeze(['PLAYING', 'BUFFERING', 'ENDED'] as PlayerState[]),
  ENDED: Object.freeze(['IDLE', 'BUFFERING'] as PlayerState[]),
});

export function canTransitionPlayer(from: PlayerState, to: PlayerState): boolean {
  const allowed = PLAYER_TRANSITIONS[from];
  return allowed.includes(to);
}

export function transitionPlayer(from: PlayerState, to: PlayerState): PlayerState {
  if (!canTransitionPlayer(from, to)) {
    throw new Error(`Invalid player transition ${from} -> ${to}`);
  }
  return to;
}

// ════════════════════════════════════════════════════════════════════════════
// CHAT STATE MACHINE — IDLE → LOADING → CONNECTED | DISCONNECTED → IDLE
// ════════════════════════════════════════════════════════════════════════════

export type ChatState = 'IDLE' | 'LOADING' | 'CONNECTED' | 'DISCONNECTED';

const CHAT_TRANSITIONS: Readonly<Record<ChatState, ReadonlyArray<ChatState>>> = Object.freeze({
  IDLE: Object.freeze(['LOADING'] as ChatState[]),
  LOADING: Object.freeze(['CONNECTED', 'DISCONNECTED', 'IDLE'] as ChatState[]),
  CONNECTED: Object.freeze(['DISCONNECTED', 'LOADING'] as ChatState[]),
  DISCONNECTED: Object.freeze(['LOADING', 'IDLE'] as ChatState[]),
});

export function canTransitionChat(from: ChatState, to: ChatState): boolean {
  const allowed = CHAT_TRANSITIONS[from];
  return allowed.includes(to);
}

export function transitionChat(from: ChatState, to: ChatState): ChatState {
  if (!canTransitionChat(from, to)) {
    throw new Error(`Invalid chat transition ${from} -> ${to}`);
  }
  return to;
}

// ════════════════════════════════════════════════════════════════════════════
// CHAT MESSAGE DISCRIMINATED UNION
// ════════════════════════════════════════════════════════════════════════════

export type ChatMessage =
  | { readonly kind: 'text'; readonly id: ChatMessageId; readonly userId: UserId; readonly displayName: string; readonly body: string; readonly ts: number }
  | { readonly kind: 'reaction'; readonly id: ChatMessageId; readonly userId: UserId; readonly emoji: string; readonly ts: number }
  | { readonly kind: 'system'; readonly id: ChatMessageId; readonly body: string; readonly ts: number }
  | { readonly kind: 'moderation'; readonly id: ChatMessageId; readonly targetUserId: UserId; readonly reason: string; readonly ts: number }
  | { readonly kind: 'question'; readonly id: ChatMessageId; readonly userId: UserId; readonly displayName: string; readonly body: string; readonly ts: number; readonly pinned: boolean };

export type ChatMessageKind = ChatMessage['kind'];

export function isChatMessageKind(k: string): k is ChatMessageKind {
  return k === 'text' || k === 'reaction' || k === 'system' || k === 'moderation' || k === 'question';
}

export function chatMessageKind(m: ChatMessage): ChatMessageKind {
  return m.kind;
}

// ════════════════════════════════════════════════════════════════════════════
// CHAT MODERATION HOOKS
// ════════════════════════════════════════════════════════════════════════════

export type ModerationDecision =
  | { readonly action: 'allow'; readonly reason: string }
  | { readonly action: 'soft-warn'; readonly reason: string; readonly redactedBody: string }
  | { readonly action: 'redact'; readonly reason: string; readonly redactedBody: string }
  | { readonly action: 'block'; readonly reason: string };

export interface ModerationRule {
  readonly id: string;
  readonly pattern: RegExp;
  readonly label: string;
  readonly action: 'soft-warn' | 'redact' | 'block';
}

export const PROFANITY_PATTERNS: ReadonlyArray<ModerationRule> = Object.freeze([
  Object.freeze({ id: 'profanity-1', pattern: /\b(idiota|lixo|porcaria)\b/iu, label: 'palavrão leve', action: 'soft-warn' as const }),
  Object.freeze({ id: 'profanity-2', pattern: /(\bfilho\s*da\s*puta\b|\bcu\b)/iu, label: 'palavrão forte', action: 'redact' as const }),
  Object.freeze({ id: 'spam-url', pattern: /(https?:\/\/[^\s]{6,})/iu, label: 'link externo', action: 'soft-warn' as const }),
  Object.freeze({ id: 'caps-lock', pattern: /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s!?]{12,}$/u, label: 'caps-lock excessivo', action: 'soft-warn' as const }),
]);

const SAFE_RULES: ReadonlyArray<ModerationRule> = Object.freeze([
  Object.freeze({ id: 'sacred-pii-email', pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/u, label: 'e-mail exposto', action: 'redact' as const }),
  Object.freeze({ id: 'sacred-pii-phone', pattern: /\b(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/u, label: 'telefone exposto', action: 'redact' as const }),
]);

export function defaultModerationRules(): ReadonlyArray<ModerationRule> {
  return Object.freeze([...PROFANITY_PATTERNS, ...SAFE_RULES]);
}

export function moderateChatBody(body: string, rules: ReadonlyArray<ModerationRule> = defaultModerationRules()): ModerationDecision {
  if (typeof body !== 'string') {
    return { action: 'block', reason: 'body inválido' };
  }
  if (body.length === 0) {
    return { action: 'block', reason: 'mensagem vazia' };
  }
  if (body.length > 500) {
    return { action: 'block', reason: 'mensagem > 500 chars' };
  }
  for (const rule of rules) {
    if (rule.action === 'block' && rule.pattern.test(body)) {
      return { action: 'block', reason: rule.label };
    }
  }
  let redacted = body;
  let redactionReason: string | null = null;
  for (const rule of rules) {
    if (rule.action === 'redact' && rule.pattern.test(body)) {
      redacted = redacted.replace(rule.pattern, '[REMOVIDO]');
      redactionReason = rule.label;
      break;
    }
  }
  if (redactionReason) {
    return { action: 'redact', reason: redactionReason, redactedBody: redacted };
  }
  for (const rule of rules) {
    if (rule.action === 'soft-warn' && rule.pattern.test(body)) {
      return { action: 'soft-warn', reason: rule.label, redactedBody: redacted };
    }
  }
  return { action: 'allow', reason: 'ok' };
}

export function buildModerationMessage(targetUserId: UserId, decision: ModerationDecision, idFactory: () => ChatMessageId): ChatMessage {
  return Object.freeze({
    kind: 'moderation',
    id: idFactory(),
    targetUserId,
    reason: decision.reason,
    ts: Date.now(),
  });
}

// ════════════════════════════════════════════════════════════════════════════
// REACTION DEBOUNCE (per-user rate limit)
// ════════════════════════════════════════════════════════════════════════════

export interface ReactionDebounceConfig {
  readonly minIntervalMs: number;
  readonly maxReactionsPerMinute: number;
}

export const DEFAULT_REACTION_DEBOUNCE: ReactionDebounceConfig = Object.freeze({
  minIntervalMs: 600,
  maxReactionsPerMinute: 60,
});

export interface ReactionAttempt {
  readonly userId: UserId;
  readonly emoji: string;
  readonly ts: number;
}

export interface ReactionDebounceResult {
  readonly allowed: boolean;
  readonly waitMs: number;
  readonly reason: string;
  readonly countInLastMinute: number;
}

export function shouldAllowReaction(
  history: ReadonlyArray<ReactionAttempt>,
  attempt: ReactionAttempt,
  config: ReactionDebounceConfig = DEFAULT_REACTION_DEBOUNCE,
): ReactionDebounceResult {
  if (typeof attempt.emoji !== 'string' || attempt.emoji.length === 0) {
    return { allowed: false, waitMs: 0, reason: 'emoji vazio', countInLastMinute: 0 };
  }
  if (attempt.emoji.length > 8) {
    return { allowed: false, waitMs: 0, reason: 'emoji > 8 chars', countInLastMinute: 0 };
  }
  const userHistory = history.filter((h) => h.userId === attempt.userId);
  const last = userHistory[userHistory.length - 1];
  if (last !== undefined) {
    const delta = attempt.ts - last.ts;
    if (delta < config.minIntervalMs) {
      return {
        allowed: false,
        waitMs: config.minIntervalMs - delta,
        reason: `intervalo < ${config.minIntervalMs}ms`,
        countInLastMinute: countInLastMinute(history, attempt.ts),
      };
    }
  }
  const recentCount = countInLastMinute(history, attempt.ts);
  if (recentCount >= config.maxReactionsPerMinute) {
    return {
      allowed: false,
      waitMs: 0,
      reason: `> ${config.maxReactionsPerMinute}/min`,
      countInLastMinute: recentCount,
    };
  }
  return {
    allowed: true,
    waitMs: 0,
    reason: 'ok',
    countInLastMinute: recentCount + 1,
  };
}

function countInLastMinute(history: ReadonlyArray<ReactionAttempt>, now: number): number {
  const cutoff = now - 60_000;
  let count = 0;
  for (const h of history) if (h.ts >= cutoff) count++;
  return count;
}

// ════════════════════════════════════════════════════════════════════════════
// LGPD AUDIO CONSENT GATE
// ════════════════════════════════════════════════════════════════════════════

export interface AudioConsentConfig {
  readonly sacredCategory: StreamCategory | null;
  readonly userGesture: boolean;
  readonly explicitAudioOptIn: boolean;
}

export function canAutoPlayWithAudio(cfg: AudioConsentConfig): boolean {
  if (!cfg.userGesture) return false;
  if (cfg.sacredCategory !== null) {
    const meta = STREAM_CATEGORIES[cfg.sacredCategory];
    if (meta.lgpdRequiresAudioConsent && !cfg.explicitAudioOptIn) return false;
  }
  return true;
}

export function audioConsentCta(category: StreamCategory | null): string {
  const meta = category !== null ? STREAM_CATEGORIES[category] : null;
  if (meta && meta.lgpdSacredContent) {
    return `Toque para assistir com som — ${meta.label} é conteúdo sagrado`;
  }
  return 'Toque para assistir com som';
}

// ════════════════════════════════════════════════════════════════════════════
// VIEWER COUNT FORMATTER
// ════════════════════════════════════════════════════════════════════════════

export function formatViewerCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1_000) return String(Math.floor(n));
  if (n < 10_000) return `${(n / 1_000).toFixed(1)}k`;
  if (n < 1_000_000) return `${Math.floor(n / 1_000)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

// ════════════════════════════════════════════════════════════════════════════
// A11Y HELPERS
// ════════════════════════════════════════════════════════════════════════════

export type A11yShortcut = 'playPause' | 'mute' | 'seekBack' | 'seekForward' | 'fullscreen';

export interface A11yShortcutSpec {
  readonly key: string;
  readonly label: string;
  readonly ariaKeyShortcuts: string;
}

export const A11Y_SHORTCUTS: Readonly<Record<A11yShortcut, A11yShortcutSpec>> = Object.freeze({
  playPause: Object.freeze({ key: ' ', label: 'Espaço — play/pausa', ariaKeyShortcuts: 'Space' }),
  mute: Object.freeze({ key: 'm', label: 'M — mudo', ariaKeyShortcuts: 'M' }),
  seekBack: Object.freeze({ key: 'ArrowLeft', label: '← — voltar 10s', ariaKeyShortcuts: 'ArrowLeft' }),
  seekForward: Object.freeze({ key: 'ArrowRight', label: '→ — avançar 10s', ariaKeyShortcuts: 'ArrowRight' }),
  fullscreen: Object.freeze({ key: 'f', label: 'F — tela cheia', ariaKeyShortcuts: 'F' }),
});

export function resolveShortcut(key: string): A11yShortcut | null {
  const k = key === ' ' ? ' ' : key.length === 1 ? key.toLowerCase() : key;
  for (const [shortcut, spec] of Object.entries(A11Y_SHORTCUTS)) {
    if (spec.key === k) return shortcut as A11yShortcut;
  }
  return null;
}

export const CHAT_LIVE_REGION_POLITENESS = 'polite';
export const PLAYER_LIVE_REGION_POLITENESS = 'assertive';
export const TOUCH_TARGET_MIN_PX = 44;

export function viewerCountAriaLabel(n: number): string {
  const formatted = formatViewerCount(n);
  return `${formatted} ${n === 1 ? 'pessoa assistindo' : 'pessoas assistindo'}`;
}

// ════════════════════════════════════════════════════════════════════════════
// REACTION AGGREGATION
// ════════════════════════════════════════════════════════════════════════════

export interface ReactionAggregate {
  readonly emoji: string;
  readonly count: number;
}

export function aggregateReactions(attempts: ReadonlyArray<ReactionAttempt>): ReadonlyArray<ReactionAggregate> {
  const counts = new Map<string, number>();
  for (const a of attempts) {
    counts.set(a.emoji, (counts.get(a.emoji) ?? 0) + 1);
  }
  return Object.freeze(
    Array.from(counts.entries())
      .map(([emoji, count]) => Object.freeze({ emoji, count }))
      .sort((a, b) => b.count - a.count),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCHEDULE BANNER — relative time helper
// ════════════════════════════════════════════════════════════════════════════

export function formatStartsIn(targetTs: number, nowTs: number): string {
  const delta = targetTs - nowTs;
  if (delta <= 0) return 'ao vivo agora';
  const mins = Math.floor(delta / 60_000);
  if (mins < 1) return 'começa em instantes';
  if (mins < 60) return `começa em ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `começa em ${hours}h${mins % 60 === 0 ? '' : ` ${mins % 60}min`}`;
  const days = Math.floor(hours / 24);
  return `começa em ${days}d`;
}

export interface ScheduleNotice {
  readonly tone: 'info' | 'warn' | 'sacred';
  readonly message: string;
}

export function buildScheduleNotice(category: StreamCategory, startsInMs: number): ScheduleNotice {
  const meta = STREAM_CATEGORIES[category];
  if (meta.lgpdSacredContent && startsInMs < 5 * 60_000) {
    return { tone: 'sacred', message: `${meta.label} — conteúdo sagrado, áudio sob consentimento` };
  }
  if (startsInMs < 0) {
    return { tone: 'info', message: `${meta.label} em andamento` };
  }
  if (startsInMs < 60 * 60_000) {
    return { tone: 'warn', message: `${meta.label} começa em ${Math.floor(startsInMs / 60_000)} min` };
  }
  return { tone: 'info', message: `${meta.label} em breve` };
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const W81_D_VERSION = '1.0.0';
export const W81_D_CYCLE = 81;
export const W81_D_SHIPPED_COMPONENTS = 6;
export const W81_D_SHIPPED_TRADITIONS = 7;
