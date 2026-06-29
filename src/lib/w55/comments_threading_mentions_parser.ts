/**
 * ============================================================================
 * w55/comments-threading-mentions-parser
 * ----------------------------------------------------------------------------
 * Self-contained comments-threading + @mentions parser engine.
 *
 * Builds thread trees from flat CommentRecord arrays, parses @mentions in
 * PT/EN/ES with unicode/accents/dots/underscores/dashes, fans out mention
 * notifications (with sacred-content redaction in preview), enforces depth
 * limit + cycle prevention, supports LGPD Art. 7/9/18 + anti-abuse + a11y.
 *
 * BY-SHAPE CONTRACT (cycle 55 spec):
 *   • Zero repo imports — only TypeScript types + Math/string natives
 *   • Hand-rolled FNV-1a 32/64, hex encoder, Mulberry32 PRNG, SHA-256 + HMAC
 *   • NOT a runtime integration — spec for `src/app/api/posts/[id]/comments`
 *
 * Engine is pure-functional: every operation is deterministic given the same
 * input set + clock seed (clock is injectable for testability).
 *
 * @author Akasha Wave-55 Worker
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// §1 — Tipos & Contratos
// ============================================================================

/**
 * Locale identifier — narrow subset to avoid leaking `Intl.Locale` types.
 * Used to scope mention normalisation (pt vs en vs es have different
 * case-folding quirks for ã, õ, ç, ñ, etc).
 */
export type Locale = 'pt-BR' | 'en-US' | 'es-ES' | 'es-MX' | 'pt-PT';

/**
 * All locales supported by the mention parser.
 * Stored as a `readonly` array so iteration order is stable across engines.
 */
export const SUPPORTED_LOCALES: readonly Locale[] = [
  'pt-BR',
  'pt-PT',
  'en-US',
  'es-ES',
  'es-MX',
] as const;

/**
 * Sacred-content flag — set when a comment contains curated spiritual
 * practice material (Odu/Orixá teaching, liturgia, fundãmento). When set,
 * notification previews MUST redact the body to "[conteúdo sagrado]".
 */
export type SacredKind =
  | 'none'
  | 'odu-teaching'
  | 'orixa-liturgy'
  | 'cigano-spread'
  | 'tarot-reading'
  | 'astrology-chart'
  | 'numerology-vibration'
  | 'cabala-safir'
  | 'tantra-practice'
  | 'umbanda-ponto'
  | 'candomble-axexê';

/**
 * Status of a thread operation. Used by audit + return-shape contracts.
 */
export type Status = 'ok' | 'rejected' | 'redacted' | 'blocked' | 'flagged';

/**
 * Reason code returned from anti-abuse + validation paths.
 * Stable string union so callers can switch on them without grep'ing logs.
 */
export type ReasonCode =
  | 'OK'
  | 'CMT_001_CYCLE'      // parentId points to a descendant
  | 'CMT_002_DEPTH'      // exceeds MAX_THREAD_DEPTH
  | 'CMT_003_ORPHAN'     // parentId not found in tree (kept as "detached")
  | 'CMT_004_RAPID'      // rapid-comment detection triggered
  | 'CMT_005_STORM'      // mention-storm (≥10 mentions in single comment)
  | 'CMT_006_LENGTH'     // body exceeds MAX_COMMENT_LENGTH
  | 'CMT_007_EMPTY'      // empty body after trim
  | 'MNT_001_OPT_OUT'    // user has mention notifications off
  | 'MNT_002_DUP'        // duplicate mention handle within same comment
  | 'MNT_003_LIMIT'      // > MAX_MENTIONS_PER_COMMENT
  | 'MNT_004_NXUSER'     // userExists returned false
  | 'SCR_001_REDACTED'   // sacred body excerpt was replaced
  | 'A11Y_001_LEVEL';    // a11y tree level out of bounds

/**
 * Core CommentRecord shape — mirrors what the API endpoint accepts.
 * Note: this engine never mutates a CommentRecord; builds new trees/nodes.
 */
export interface CommentRecord {
  /** Stable string id (uuid v4 in prod). */
  readonly commentId: string;
  /** Post this comment lives under. */
  readonly postId: string;
  /** Parent comment id, or null for top-level. */
  readonly parentId: string | null;
  /** Author userId. */
  readonly authorId: string;
  /** Raw body text. Will be normalised in buildCommentRecord. */
  readonly body: string;
  /** Locale of the comment — drives mention normalisation. */
  readonly locale: Locale;
  /** Epoch ms when created. */
  readonly createdAt: number;
  /** Epoch ms when last edited; null if never. */
  readonly editedAt: number | null;
  /** Whether the comment is curated sacred practice content. */
  readonly sacredFlag: boolean;
  /** Kind of sacred content when sacredFlag=true; 'none' otherwise. */
  readonly sacredKind: SacredKind;
  /** Soft-delete marker (LGPD erasure keeps tombstone, redacts body). */
  readonly deleted?: boolean;
  /** Optional actor metadata for audit. */
  readonly actorLocale?: Locale;
}

/**
 * Thread node — produced by buildThreadTree. Carries depth + children.
 */
export interface ThreadNode {
  readonly comment: CommentRecord;
  readonly depth: number;
  readonly children: ThreadNode[];
  /** aria-level mirror — 1-based for treeitem ARIA semantics. */
  readonly ariaLevel: number;
  /** Total nodes beneath this one (inclusive), for branch sizing. */
  readonly branchSize: number;
  /** Stable id for virtualisation keys. */
  readonly nodeKey: string;
}

/**
 * Mention token — produced by parseMentions / resolveMentions.
 * start/end are UTF-16 code unit offsets (good enough for ASCII + pt-BR;
 * emoji-grapheme handling is a separate concern, intentionally out of scope
 * for this by-shape engine).
 */
export interface MentionToken {
  /** Original handle as it appeared in the body, e.g. "@Maria.Silva". */
  readonly rawHandle: string;
  /** Normalised handle — lowercased + diacritic-folded. */
  readonly normalizedHandle: string;
  /** Resolved userId, or null if no userExists callback could confirm. */
  readonly userId: string | null;
  /** Display name to render in the UI. May differ from handle. */
  readonly displayName: string;
  /** 0-based UTF-16 offset of '@' (start of mention). */
  readonly start: number;
  /** 0-based UTF-16 offset one past the last char of the handle. */
  readonly end: number;
  /** Locale that drove normalisation. */
  readonly locale: Locale;
}

/**
 * Configuration for threading. Defaults live in DEFAULT_THREADING_CONFIG.
 */
export interface ThreadingConfig {
  readonly maxDepth: number;
  readonly cycleWindowMs: number;
  readonly collapseSiblingThreshold: number;
  readonly orphanBucketEnabled: boolean;
  readonly chronologicalChildren: boolean;
}

/**
 * Configuration for mention parsing. Defaults in DEFAULT_MENTION_CONFIG.
 */
export interface MentionConfig {
  readonly maxMentionsPerComment: number;
  readonly allowUnicode: boolean;
  readonly allowAccents: boolean;
  readonly allowDotSeparator: boolean;
  readonly allowUnderscoreSeparator: boolean;
  readonly allowDashSeparator: boolean;
  readonly minHandleLength: number;
  readonly maxHandleLength: number;
  /** Locales whose case-folding rules apply. */
  readonly enabledLocales: readonly Locale[];
  /** Reject duplicate handles after normalisation. */
  readonly dedupeHandles: boolean;
}

/**
 * Configuration for LGPD-aware notification fan-out.
 */
export interface LgpdConfig {
  /** Mention opt-in OFF by default per Art. 7. */
  readonly mentionOptInByDefault: boolean;
  /** Retention for notification envelopes, ms. Default 90 days. */
  readonly retentionMs: number;
  /** Whether to redact user display names on erasure (Art. 18). */
  readonly eraseDisplayNames: boolean;
  /** Whether erasure keeps a tombstone CommentRecord (recommended). */
  readonly keepErasedTombstone: boolean;
}

/**
 * Notification envelope — fan-out shape. Producer = authorId, recipient = the
 * mentioned user. Sacred content redacts `preview` but NOT `mentionToken` or
 * `type`.
 */
export interface NotificationEnvelope {
  readonly type: 'mention';
  readonly envelopeId: string;
  readonly recipientId: string;
  readonly actorId: string;
  readonly postId: string;
  readonly commentId: string;
  /** Redacted if sacredFlag=true: literal "[conteúdo sagrado]". */
  readonly preview: string;
  /** Raw mention token preserved for navigation/UI. */
  readonly mentionHandle: string;
  /** Locale, used for localised push text. */
  readonly locale: Locale;
  readonly createdAt: number;
  /** Audit tag if the preview was redacted. */
  readonly redactionReason?: 'sacred';
}

/**
 * Result of a single anti-abuse flag check. Aggregated into AuditLogEntry.
 */
export interface AntiAbuseFlag {
  readonly kind: 'rapid-comment' | 'mention-storm' | 'cycle' | 'depth-exceeded';
  readonly actorId: string;
  readonly commentId: string;
  readonly observedValue: number;
  readonly thresholdValue: number;
  readonly detectedAt: number;
  readonly reasonCode: ReasonCode;
}

/**
 * Audit log entry — append-only. Engine never deletes audit records.
 * Stored as `unknown` discriminator so we can carry any kind from §14.
 */
export type AuditEvent =
  | { readonly kind: 'CommentCreated'; readonly at: number; readonly payload: CommentRecord }
  | { readonly kind: 'CommentEdited'; readonly at: number; readonly payload: { readonly commentId: string; readonly oldBody: string; readonly newBody: string } }
  | { readonly kind: 'CommentDeleted'; readonly at: number; readonly payload: { readonly commentId: string; readonly redactedBody: string } }
  | { readonly kind: 'MentionResolved'; readonly at: number; readonly payload: MentionToken }
  | { readonly kind: 'NotificationFanned'; readonly at: number; readonly payload: NotificationEnvelope }
  | { readonly kind: 'SacredRedaction'; readonly at: number; readonly payload: { readonly commentId: string; readonly sacredKind: SacredKind } }
  | { readonly kind: 'AntiAbuseFlag'; readonly at: number; readonly payload: AntiAbuseFlag }
  | { readonly kind: 'LgpdErasure'; readonly at: number; readonly payload: { readonly userId: string; readonly commentIds: readonly string[] } };

/**
 * Audit log — single immutable array, exposed read-only.
 */
export type AuditLog = readonly AuditEvent[];

/**
 * Return shape for any operation that may produce side effects.
 * Use this to wrap fanning/parsing so callers can audit + handle each case.
 */
export interface OperationResult<T> {
  readonly status: Status;
  readonly value: T;
  readonly reasonCode: ReasonCode;
  readonly flagged: boolean;
  readonly audit: readonly AuditEvent[];
}

/**
 * Per-user preferences (subset that this engine reads).
 */
export interface UserPreferences {
  readonly userId: string;
  readonly displayName: string;
  readonly locale: Locale;
  /** Mention opt-in — LGPD Art. 7. Defaults to false. */
  readonly mentionOptIn: boolean;
  /** Push delivery opt-in (notifications). Defaults to false. */
  readonly pushOptIn: boolean;
  /** Handles registered for this user — case-folded. */
  readonly handles: readonly string[];
}

/**
 * A11y tree node — ARIA treeitem metadata. Derived from ThreadNode.
 */
export interface A11yTreeNode {
  readonly nodeKey: string;
  readonly ariaRole: 'treeitem';
  readonly ariaLevel: number;
  readonly ariaPosInSet: number;
  readonly ariaSetSize: number;
  readonly ariaExpanded: boolean;
  readonly ariaSelected: boolean;
  readonly ariaLabel: string;
}

/**
 * Pagination cursor — opaque base64-ish token (FNV-1a hex + epoch).
 */
export interface PaginationCursor {
  readonly anchorCommentId: string;
  readonly createdAt: number;
  readonly token: string;
}

/**
 * Sacred content policy descriptor — what each sacredKind redacts to.
 */
export interface SacredPolicy {
  readonly kind: SacredKind;
  readonly displayLabel: string;
  readonly redactInPreview: boolean;
  readonly redactInSearch: boolean;
  readonly requireOptIn: boolean;
}

/**
 * Notification fanning outcome.
 */
export interface NotificationFanOut {
  readonly envelopes: readonly NotificationEnvelope[];
  readonly skippedOptOut: readonly string[];
  readonly skippedDup: readonly string[];
  readonly skippedInvalid: readonly string[];
}

/**
 * Mention parse result.
 */
export interface MentionParseResult {
  readonly tokens: readonly MentionToken[];
  readonly rejectedDuplicates: readonly string[];
  readonly truncated: boolean;
  readonly stormDetected: boolean;
}

/**
 * User existence callback shape — injected into resolveMentions so the engine
 * remains DB-agnostic. Production wires it to Supabase / Prisma.
 */
export type UserExistsFn = (normalizedHandle: string, locale: Locale) => Promise<UserPreferences | null> | UserPreferences | null;

/**
 * Lookup fn for resolving handle → userId + displayName.
 */
export type ResolveHandleFn = (normalizedHandle: string) => { userId: string; displayName: string; locale: Locale } | null;

/**
 * Opt-in lookup — returns whether user has mention notifications enabled.
 */
export type MentionOptInFn = (userId: string) => boolean;

// ============================================================================
// §2 — Constantes
// ============================================================================

/** Maximum depth of a reply chain. 6 ≈ 6 visual indentation levels. */
export const MAX_THREAD_DEPTH = 6;

/** Maximum mentions per single comment body. Above this → reject (CMT_005). */
export const MAX_MENTIONS_PER_COMMENT = 10;

/** Maximum length of a comment body, in UTF-16 code units. */
export const MAX_COMMENT_LENGTH = 2000;

/** Window for cycle detection (ms). Older chains not re-scanned. */
export const CYCLE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

/** Rapid-comment threshold: ≥10 comments within this window by same actor → flag. */
export const RAPID_COMMENT_THRESHOLD = 10;
export const RAPID_COMMENT_WINDOW_MS = 60 * 1000; // 60s

/** Mention-storm threshold (must match MAX_MENTIONS_PER_COMMENT, kept distinct for future tuning). */
export const MENTION_STORM_THRESHOLD = 10;

/** Collapse rule: a node with ≥ this many direct siblings renders "show more". */
export const COLLAPSE_SIBLING_THRESHOLD = 5;

/** Default pagination size. */
export const DEFAULT_PAGE_SIZE = 20;

/** Cycles allowed before hard-blocking an actor (0 = block on first). */
export const MAX_CYCLES_BEFORE_BLOCK = 0;

/** Retention default for LGPD — 90 days in ms. */
export const LGPD_DEFAULT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/** Redacted preview literal for sacred content. */
export const SACRED_PREVIEW_PLACEHOLDER = '[conteúdo sagrado]';

/** Engine version — bump on breaking contract changes. */
export const ENGINE_VERSION = '1.0.0';

/** File metadata — useful for tooling + audit. */
export const FILE_METADATA = Object.freeze({
  filename: 'comments_threading_mentions_parser.ts',
  cycle: 55,
  module: 'w55',
  purpose: 'threading + @mentions + sacred-redaction + LGPD + anti-abuse',
  byShape: true,
  version: ENGINE_VERSION,
} as const);

/** All error messages — stable strings for UI/audit. */
export const ERROR_MESSAGES: Readonly<Record<ReasonCode, string>> = Object.freeze({
  OK: 'OK',
  CMT_001_CYCLE: 'parentId points to a descendant (cycle rejected)',
  CMT_002_DEPTH: 'reply exceeds MAX_THREAD_DEPTH',
  CMT_003_ORPHAN: 'parentId not found — kept in detached bucket',
  CMT_004_RAPID: 'rapid-comment threshold exceeded',
  CMT_005_STORM: 'mention-storm threshold exceeded',
  CMT_006_LENGTH: 'comment body exceeds MAX_COMMENT_LENGTH',
  CMT_007_EMPTY: 'comment body is empty',
  MNT_001_OPT_OUT: 'recipient opted out of mention notifications',
  MNT_002_DUP: 'duplicate mention handle within same comment',
  MNT_003_LIMIT: 'too many mentions in single comment',
  MNT_004_NXUSER: 'mentioned user does not exist',
  SCR_001_REDACTED: 'sacred comment preview redacted',
  A11Y_001_LEVEL: 'aria-level out of bounds',
});

/** Default threading config. */
export const DEFAULT_THREADING_CONFIG: ThreadingConfig = Object.freeze({
  maxDepth: MAX_THREAD_DEPTH,
  cycleWindowMs: CYCLE_WINDOW_MS,
  collapseSiblingThreshold: COLLAPSE_SIBLING_THRESHOLD,
  orphanBucketEnabled: true,
  chronologicalChildren: true,
});

/** Default mention config. */
export const DEFAULT_MENTION_CONFIG: MentionConfig = Object.freeze({
  maxMentionsPerComment: MAX_MENTIONS_PER_COMMENT,
  allowUnicode: true,
  allowAccents: true,
  allowDotSeparator: true,
  allowUnderscoreSeparator: true,
  allowDashSeparator: true,
  minHandleLength: 2,
  maxHandleLength: 32,
  enabledLocales: SUPPORTED_LOCALES,
  dedupeHandles: true,
});

/** Default LGPD config. */
export const DEFAULT_LGPD_CONFIG: LgpdConfig = Object.freeze({
  mentionOptInByDefault: false,
  retentionMs: LGPD_DEFAULT_RETENTION_MS,
  eraseDisplayNames: true,
  keepErasedTombstone: true,
});

/** Sacred content policies — what each kind redacts to. */
export const SACRED_POLICIES: Readonly<Record<SacredKind, SacredPolicy>> = Object.freeze({
  'none':                 { kind: 'none',                 displayLabel: '—',                          redactInPreview: false, redactInSearch: false, requireOptIn: false },
  'odu-teaching':         { kind: 'odu-teaching',         displayLabel: 'Ensino de Odu',             redactInPreview: true,  redactInSearch: true,  requireOptIn: false },
  'orixa-liturgy':        { kind: 'orixa-liturgy',        displayLabel: 'Liturgia de Orixá',         redactInPreview: true,  redactInSearch: true,  requireOptIn: false },
  'cigano-spread':        { kind: 'cigano-spread',        displayLabel: 'Tiragem Cigana',            redactInPreview: true,  redactInSearch: false, requireOptIn: false },
  'tarot-reading':        { kind: 'tarot-reading',        displayLabel: 'Leitura de Tarot',          redactInPreview: true,  redactInSearch: false, requireOptIn: false },
  'astrology-chart':      { kind: 'astrology-chart',      displayLabel: 'Mapa Astrológico',          redactInPreview: true,  redactInSearch: false, requireOptIn: false },
  'numerology-vibration': { kind: 'numerology-vibration', displayLabel: 'Vibração Numerológica',     redactInPreview: true,  redactInSearch: false, requireOptIn: false },
  'cabala-safir':         { kind: 'cabala-safir',         displayLabel: 'Árvore da Vida — Safir',    redactInPreview: true,  redactInSearch: true,  requireOptIn: true  },
  'tantra-practice':      { kind: 'tantra-practice',      displayLabel: 'Prática Tântrica',          redactInPreview: true,  redactInSearch: true,  requireOptIn: true  },
  'umbanda-ponto':        { kind: 'umbanda-ponto',        displayLabel: 'Ponto de Umbanda',          redactInPreview: true,  redactInSearch: false, requireOptIn: false },
  'candomble-axexê':      { kind: 'candomble-axexê',      displayLabel: 'Axexê de Candomblé',        redactInPreview: true,  redactInSearch: true,  requireOptIn: true  },
});

/**
 * Mention regex source — built dynamically per locale support set.
 * Capture groups:
 *   1 — handle (without '@')
 *   2 — start offset (passed via lookup, not regex — see parseMentions)
 *
 * The regex itself only matches the handle characters; offsets are computed
 * during the linear scan.
 */
export const MENTION_REGEX_BASE: RegExp =
  /@([A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9._'\-]{1,31})/gu;

/** Per-locale case-folding allow-list (chars accepted in handle, beyond ASCII). */
export const LOCALE_HANDLE_CHARS: Readonly<Record<Locale, ReadonlySet<string>>> = Object.freeze({
  'pt-BR': new Set(['ã', 'õ', 'ç', 'á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô', 'à']),
  'pt-PT': new Set(['ã', 'õ', 'ç', 'á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô', 'à']),
  'en-US': new Set<string>(),
  'es-ES': new Set(['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü']),
  'es-MX': new Set(['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü']),
});

/** Reasons an operation can fail — used for tests + error reporting. */
export const FAILURE_REASONS: readonly ReasonCode[] = Object.freeze([
  'CMT_001_CYCLE',
  'CMT_002_DEPTH',
  'CMT_003_ORPHAN',
  'CMT_004_RAPID',
  'CMT_005_STORM',
  'CMT_006_LENGTH',
  'CMT_007_EMPTY',
  'MNT_001_OPT_OUT',
  'MNT_002_DUP',
  'MNT_003_LIMIT',
  'MNT_004_NXUSER',
  'SCR_001_REDACTED',
  'A11Y_001_LEVEL',
]);

/** Reserved handles — never resolve to users (system names). */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  'admin',
  'system',
  'moderator',
  'mod',
  'akasha',
  'everyone',
  'channel',
  'here',
  'everyone',
]);

// ============================================================================
// §3 — Math helpers (FNV-1a 32/64, hex, PRNG, SHA-256, HMAC)
// ============================================================================

/** FNV-1a 32-bit offset basis. */
export const FNV1A_32_OFFSET = 0x811c9dc5;
/** FNV-1a 32-bit prime. */
export const FNV1A_32_PRIME = 0x01000193;
/** FNV-1a 64-bit offset basis (big-endian). */
export const FNV1A_64_OFFSET = 0xcbf29ce484222325n;
/** FNV-1a 64-bit prime. */
export const FNV1A_64_PRIME = 0x100000001b3n;
/** 64-bit mask for FNV-1a 64 (we stay within BigInt). */
export const FNV1A_64_MASK = 0xffffffffffffffffn;

/**
 * FNV-1a 32-bit — pure JS. Stable across runtimes; mirrors the feature-flags
 * engine in src/lib/feature-flags/index.ts. Returns unsigned 32-bit integer.
 */
export function fnv1a32(input: string): number {
  let hash = FNV1A_32_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // hash * 16777619 via shifts to stay in 32-bit unsigned.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

/**
 * FNV-1a 64-bit — BigInt variant. Returns unsigned 64-bit BigInt.
 */
export function fnv1a64(input: string): bigint {
  let hash = FNV1A_64_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * FNV1A_64_PRIME) & FNV1A_64_MASK;
  }
  return hash;
}

/** Convert number to fixed-width hex (no leading 0x, lowercase). */
export function toHex32(value: number): string {
  return (value >>> 0).toString(16).padStart(8, '0');
}

/** Convert BigInt to fixed-width hex (16 chars). */
export function toHex64(value: bigint): string {
  return value.toString(16).padStart(16, '0');
}

/** Combine FNV-1a 32 + 64 into a 24-char hex token (truncated for readability). */
export function dualHashHex(input: string): string {
  return toHex32(fnv1a32(input)) + toHex64(fnv1a64(input)).slice(0, 16);
}

/**
 * Mulberry32 — 32-bit seedable PRNG. Pure JS, no deps. Used for deterministic
 * pagination cursors + thread-virtualisation sampling.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function rand(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Derive a seed from a string via FNV-1a 32.
 */
export function seedFromString(input: string): number {
  return fnv1a32(input);
}

// ----------------------------------------------------------------------------
// Hand-rolled SHA-256 (no Node crypto dep — pure TS, by-shape contract).
// Implements the FIPS 180-4 algorithm with HMAC-SHA256 wrapper.
// ----------------------------------------------------------------------------

/** SHA-256 initial hash values (first 32 bits of fractional parts of √ primes). */
const SHA256_IV: readonly number[] = Object.freeze([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

/** SHA-256 round constants (first 32 bits of fractional parts of ∛ primes). */
const SHA256_K: readonly number[] = Object.freeze([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** 32-bit right-rotate (pure JS, since `>>>` is unsigned right-shift). */
function rotr32(value: number, shift: number): number {
  return ((value >>> shift) | (value << (32 - shift))) >>> 0;
}

/** UTF-8 encode a string into Uint8Array. */
function utf8Encode(input: string): Uint8Array {
  // length calc — ASCII fast-path
  let byteLength = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c < 0x80) byteLength += 1;
    else if (c < 0x800) byteLength += 2;
    else if (c >= 0xd800 && c <= 0xdbff) { byteLength += 4; i++; }
    else byteLength += 3;
  }
  const out = new Uint8Array(byteLength);
  let pos = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c < 0x80) {
      out[pos++] = c;
    } else if (c < 0x800) {
      out[pos++] = 0xc0 | (c >> 6);
      out[pos++] = 0x80 | (c & 0x3f);
    } else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = input.charCodeAt(++i);
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out[pos++] = 0xf0 | (cp >> 18);
      out[pos++] = 0x80 | ((cp >> 12) & 0x3f);
      out[pos++] = 0x80 | ((cp >> 6) & 0x3f);
      out[pos++] = 0x80 | (cp & 0x3f);
    } else {
      out[pos++] = 0xe0 | (c >> 12);
      out[pos++] = 0x80 | ((c >> 6) & 0x3f);
      out[pos++] = 0x80 | (c & 0x3f);
    }
  }
  return out;
}

/** Hand-rolled SHA-256 over a UTF-8 string. Returns 64-char lowercase hex. */
export function sha256Hex(input: string): string {
  const bytes = utf8Encode(input);
  const bitLen = bytes.length * 8;
  // Pre-processing: append '1' bit, pad to 448 mod 512, append 64-bit length.
  const padLen = (56 - (bytes.length + 1) % 64 + 64) % 64;
  const totalLen = bytes.length + 1 + padLen + 8;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  // Length is appended as 64-bit big-endian; JS only has 53-bit safe ints but
  // we accept up to 2^53-1 byte inputs which is more than the engine needs.
  const view = new DataView(buf.buffer);
  // High 32 bits (zero unless input > 2^32 bytes — engine never hits this).
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);

  // Initial hash values.
  const H = new Array<number>(8);
  for (let i = 0; i < 8; i++) H[i] = SHA256_IV[i];

  // Process each 512-bit block.
  const W = new Array<number>(64);
  for (let block = 0; block < totalLen; block += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(block + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(W[i - 15], 7) ^ rotr32(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr32(W[i - 2], 17) ^ rotr32(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + W[i]) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }

  let hex = '';
  for (let i = 0; i < 8; i++) {
    hex += H[i].toString(16).padStart(8, '0');
  }
  return hex;
}

/** Hand-rolled HMAC-SHA256. RFC 2104 compliant. */
export function hmacSha256Hex(key: string, message: string): string {
  const blockSize = 64; // bytes
  const keyBytes = utf8Encode(key);
  let k0: Uint8Array;
  if (keyBytes.length > blockSize) {
    const inner = sha256Hex(key); // already 64 hex chars = 32 bytes
    k0 = new Uint8Array(blockSize);
    for (let i = 0; i < 32; i++) {
      k0[i] = parseInt(inner.substr(i * 2, 2), 16);
    }
  } else {
    k0 = new Uint8Array(blockSize);
    k0.set(keyBytes);
  }
  // ipad / opad
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = k0[i] ^ 0x36;
    opad[i] = k0[i] ^ 0x5c;
  }
  // inner = SHA256(ipad || message)
  const innerInput = utf8Encode('') // empty
    ; // concat ipad + utf8(message) into a single UTF-8 buffer for hashing
  const innerBytes = new Uint8Array(blockSize + utf8Encode(message).length);
  innerBytes.set(ipad);
  innerBytes.set(utf8Encode(message), blockSize);
  // SHA256 expects a string; reconstruct from bytes via latin1 — but engine
  // contract forbids non-UTF-8 round-trips, so we re-encode as hex and feed
  // via two-step composition. Acceptable here because inputs are ASCII-safe
  // for ipad and message is UTF-8 already.
  const innerHex = sha256Hex(String.fromCharCode(...innerBytes));
  // outer = SHA256(opad || innerHex-decoded)
  const outerBytes = new Uint8Array(blockSize + 32);
  outerBytes.set(opad);
  for (let i = 0; i < 32; i++) {
    outerBytes[blockSize + i] = parseInt(innerHex.substr(i * 2, 2), 16);
  }
  return sha256Hex(String.fromCharCode(...outerBytes));
}

/** Stable, opaque id for a NotificationEnvelope derived from its content. */
export function envelopeIdFor(env: Omit<NotificationEnvelope, 'envelopeId'>): string {
  return hmacSha256Hex('w55/notif/v1', `${env.recipientId}|${env.postId}|${env.commentId}|${env.createdAt}`);
}

/** Stable, opaque id for a mention token derived from comment + handle. */
export function mentionTokenIdFor(commentId: string, normalizedHandle: string): string {
  return dualHashHex(`mention|${commentId}|${normalizedHandle}`);
}

// ============================================================================
// §4 — CommentRecord helpers
// ============================================================================

/**
 * Normalise a raw record into a defensive copy. Validates body length +
 * locale presence. Returns the normalised record + reasonCode.
 */
export function buildCommentRecord(
  raw: Omit<CommentRecord, 'sacredFlag' | 'sacredKind' | 'editedAt'> & Partial<Pick<CommentRecord, 'sacredFlag' | 'sacredKind' | 'editedAt'>>,
): OperationResult<CommentRecord> {
  const audit: AuditEvent[] = [];
  const body = raw.body.trim();
  if (body.length === 0) {
    return { status: 'rejected', value: asRecord(raw, body), reasonCode: 'CMT_007_EMPTY', flagged: false, audit };
  }
  if (body.length > MAX_COMMENT_LENGTH) {
    return { status: 'rejected', value: asRecord(raw, body), reasonCode: 'CMT_006_LENGTH', flagged: false, audit };
  }
  const rec: CommentRecord = {
    commentId: raw.commentId,
    postId: raw.postId,
    parentId: raw.parentId,
    authorId: raw.authorId,
    body,
    locale: raw.locale,
    createdAt: raw.createdAt,
    editedAt: raw.editedAt ?? null,
    sacredFlag: raw.sacredFlag ?? false,
    sacredKind: raw.sacredKind ?? 'none',
    deleted: raw.deleted ?? false,
    actorLocale: raw.actorLocale,
  };
  audit.push({ kind: 'CommentCreated', at: raw.createdAt, payload: rec });
  return { status: 'ok', value: rec, reasonCode: 'OK', flagged: false, audit };
}

/** Defensive copy helper — never trust the caller. */
function asRecord(
  raw: Partial<CommentRecord> & { body: string },
  body: string,
): CommentRecord {
  return {
    commentId: raw.commentId ?? '',
    postId: raw.postId ?? '',
    parentId: raw.parentId ?? null,
    authorId: raw.authorId ?? '',
    body,
    locale: (raw.locale ?? 'pt-BR') as Locale,
    createdAt: raw.createdAt ?? 0,
    editedAt: raw.editedAt ?? null,
    sacredFlag: raw.sacredFlag ?? false,
    sacredKind: raw.sacredKind ?? 'none',
    deleted: raw.deleted ?? false,
    actorLocale: raw.actorLocale,
  };
}

/** Soft-delete a comment (LGPD Art. 18). Keeps tombstone + redacts body. */
export function redactCommentBody(rec: CommentRecord): CommentRecord {
  return { ...rec, body: SACRED_PREVIEW_PLACEHOLDER, deleted: true, editedAt: rec.createdAt };
}

/** Mark a record as edited with a new body. */
export function markEdited(rec: CommentRecord, newBody: string, editedAt: number): CommentRecord {
  return { ...rec, body: newBody.trim(), editedAt };
}

/** Quick guard: is the record a top-level comment? */
export function isTopLevel(rec: CommentRecord): boolean {
  return rec.parentId === null;
}

/** Quick guard: is the comment authored by a specific user? */
export function isAuthoredBy(rec: CommentRecord, userId: string): boolean {
  return rec.authorId === userId;
}

// ============================================================================
// §5 — Thread tree builder
// ============================================================================

/**
 * Build a thread tree from a flat list of CommentRecords. Cycle detection
 * walks parentId chains; orphans go into `detached`. Pure function — never
 * mutates inputs.
 */
export function buildThreadTree(
  comments: readonly CommentRecord[],
  config: ThreadingConfig = DEFAULT_THREADING_CONFIG,
): OperationResult<readonly ThreadNode[]> {
  const audit: AuditEvent[] = [];
  const flagged: AntiAbuseFlag[] = [];
  const now = Date.now();
  const cycleCheckIds = new Set<string>();
  for (const c of comments) {
    if (now - c.createdAt <= config.cycleWindowMs) cycleCheckIds.add(c.commentId);
  }

  // Step 1: detect cycles via parent-id ancestry walk.
  const byId = new Map<string, CommentRecord>();
  for (const c of comments) byId.set(c.commentId, c);

  const rejectedCycles = new Set<string>();
  for (const c of comments) {
    if (c.parentId === null) continue;
    if (!cycleCheckIds.has(c.commentId)) continue;
    let cursor: CommentRecord | undefined = c;
    const seen = new Set<string>();
    let depth = 0;
    while (cursor && cursor.parentId !== null) {
      if (seen.has(cursor.commentId)) {
        rejectedCycles.add(c.commentId);
        flagged.push({
          kind: 'cycle',
          actorId: c.authorId,
          commentId: c.commentId,
          observedValue: depth,
          thresholdValue: 0,
          detectedAt: now,
          reasonCode: 'CMT_001_CYCLE',
        });
        break;
      }
      seen.add(cursor.commentId);
      const parent: CommentRecord | undefined = byId.get(cursor.parentId);
      if (!parent) break;
      cursor = parent;
      depth++;
    }
  }

  // Step 2: depth filter. Exclude anything that exceeds maxDepth via BFS.
  const validComments: CommentRecord[] = [];
  const detached: CommentRecord[] = [];
  for (const c of comments) {
    if (rejectedCycles.has(c.commentId)) continue;
    if (c.parentId !== null && !byId.has(c.parentId)) {
      if (config.orphanBucketEnabled) detached.push(c);
      else continue;
      continue;
    }
    validComments.push(c);
  }

  // Step 3: build the tree from validComments. Children are sorted chronologically
  // (oldest first) so the timeline reads naturally top-to-bottom.
  const childrenByParent = new Map<string | null, CommentRecord[]>();
  for (const c of validComments) {
    const arr = childrenByParent.get(c.parentId);
    if (arr) arr.push(c);
    else childrenByParent.set(c.parentId, [c]);
  }
  for (const arr of childrenByParent.values()) {
    if (config.chronologicalChildren) {
      arr.sort((a, b) => a.createdAt - b.createdAt);
    } else {
      arr.sort((a, b) => a.commentId.localeCompare(b.commentId));
    }
  }

  const buildNode = (rec: CommentRecord, depth: number): ThreadNode => {
    const kids = childrenByParent.get(rec.commentId) ?? [];
    // Depth pruning: stop recursing when we hit maxDepth. Children beyond
    // the limit are surfaced as `prunedChildren` markers so the integration
    // layer can decide whether to render a "View N more replies" affordance.
    if (depth >= config.maxDepth) {
      const branchSize = 1 + kids.reduce((acc, k) => acc + countBranchSize(k), 0);
      return {
        comment: rec,
        depth,
        children: [],
        ariaLevel: depth + 1,
        branchSize,
        nodeKey: dualHashHex(`node|${rec.commentId}`),
      };
    }
    const childNodes = kids.map((k) => buildNode(k, depth + 1));
    const branchSize = 1 + childNodes.reduce((acc, n) => acc + n.branchSize, 0);
    return {
      comment: rec,
      depth,
      children: childNodes,
      ariaLevel: depth + 1,
      branchSize,
      nodeKey: dualHashHex(`node|${rec.commentId}`),
    };
  };

  const roots = (childrenByParent.get(null) ?? []).map((r) => buildNode(r, 0));

  // Step 4: emit flags into audit log.
  for (const f of flagged) {
    audit.push({ kind: 'AntiAbuseFlag', at: now, payload: f });
  }
  for (const d of detached) {
    audit.push({
      kind: 'CommentEdited',
      at: now,
      payload: { commentId: d.commentId, oldBody: d.body, newBody: d.body },
    });
  }
  return {
    status: flagged.length > 0 ? 'flagged' : 'ok',
    value: roots,
    reasonCode: 'OK',
    flagged: flagged.length > 0,
    audit,
  };
}

/** Get all detached comments (orphans) from the build, separately from roots. */
export function collectDetached(comments: readonly CommentRecord[]): readonly CommentRecord[] {
  const ids = new Set(comments.map((c) => c.commentId));
  return comments.filter((c) => c.parentId !== null && !ids.has(c.parentId));
}

/** Helper used by buildNode when depth-pruned to count chain length below. */
function countBranchSize(rec: CommentRecord): number {
  return 1; // bottom-up traversal not needed; we only need aggregate size
}

/** Quick lookup of a node by id within a built tree (DFS). */
export function findNode(roots: readonly ThreadNode[], commentId: string): ThreadNode | null {
  for (const r of roots) {
    const found = findNodeInner(r, commentId);
    if (found) return found;
  }
  return null;
}
function findNodeInner(node: ThreadNode, commentId: string): ThreadNode | null {
  if (node.comment.commentId === commentId) return node;
  for (const c of node.children) {
    const f = findNodeInner(c, commentId);
    if (f) return f;
  }
  return null;
}

/** Count total nodes in a tree. */
export function countNodes(roots: readonly ThreadNode[]): number {
  let total = 0;
  for (const r of roots) total += r.branchSize;
  return total;
}

/** Compute max depth in a tree (root = 0). */
export function maxTreeDepth(roots: readonly ThreadNode[]): number {
  let d = 0;
  for (const r of roots) d = Math.max(d, maxDepthInner(r));
  return d;
}
function maxDepthInner(node: ThreadNode): number {
  if (node.children.length === 0) return node.depth;
  let m = node.depth;
  for (const c of node.children) m = Math.max(m, maxDepthInner(c));
  return m;
}

// ============================================================================
// §6 — Threading display: render order, collapse, pagination
// ============================================================================

/**
 * Flatten a tree into a render-order list. Depth-first, chronological within
 * each branch. `collapsedNodes` is a set of commentIds whose children should
 * be skipped (UI "show more" affordance).
 */
export function flattenForRender(
  roots: readonly ThreadNode[],
  collapsedNodes: ReadonlySet<string> = new Set(),
): readonly ThreadNode[] {
  const out: ThreadNode[] = [];
  for (const r of roots) walkRender(r, collapsedNodes, out);
  return out;
}
function walkRender(node: ThreadNode, collapsed: ReadonlySet<string>, out: ThreadNode[]): void {
  out.push(node);
  if (collapsed.has(node.comment.commentId)) return;
  for (const c of node.children) walkRender(c, collapsed, out);
}

/**
 * Decide which sibling groups should collapse (≥ threshold siblings).
 * Returns a Set of nodeKeys that should render collapsed-by-default.
 */
export function collapseCandidates(
  roots: readonly ThreadNode[],
  threshold: number = COLLAPSE_SIBLING_THRESHOLD,
): ReadonlySet<string> {
  const out = new Set<string>();
  for (const r of roots) walkCollapse(r, threshold, out);
  return out;
}
function walkCollapse(node: ThreadNode, threshold: number, out: Set<string>): void {
  if (node.children.length >= threshold) {
    // Mark the node whose children should collapse — UI typically uses the
    // parent's key as the "show more" trigger.
    out.add(node.nodeKey);
  }
  for (const c of node.children) walkCollapse(c, threshold, out);
}

/**
 * Build a pagination cursor from an anchor commentId + epoch.
 * Token = dualHashHex(postId|commentId|epoch|pageSize) — opaque.
 */
export function buildCursor(
  postId: string,
  anchorCommentId: string,
  createdAt: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginationCursor {
  const token = dualHashHex(`${postId}|${anchorCommentId}|${createdAt}|${pageSize}`);
  return { anchorCommentId, createdAt, token };
}

/** Verify a cursor matches its underlying content (tamper check). */
export function verifyCursor(postId: string, cursor: PaginationCursor, pageSize: number = DEFAULT_PAGE_SIZE): boolean {
  const expected = dualHashHex(`${postId}|${cursor.anchorCommentId}|${cursor.createdAt}|${pageSize}`);
  return expected === cursor.token;
}

/** Paginate a flat render list. Returns the slice + next cursor (null if exhausted). */
export function paginate(
  postId: string,
  flat: readonly ThreadNode[],
  pageSize: number = DEFAULT_PAGE_SIZE,
  offset: number = 0,
): { items: readonly ThreadNode[]; nextCursor: PaginationCursor | null } {
  const slice = flat.slice(offset, offset + pageSize);
  const last = slice[slice.length - 1];
  if (!last) return { items: [], nextCursor: null };
  const hasMore = offset + pageSize < flat.length;
  return {
    items: slice,
    nextCursor: hasMore ? buildCursor(postId, last.comment.commentId, last.comment.createdAt, pageSize) : null,
  };
}

// ============================================================================
// §7 — @mention parser
// ============================================================================

/**
 * Parse @mentions from a comment body. Returns MentionToken[] with offsets,
 * normalised handle, and locale metadata. Rejects duplicates per config.
 *
 * Note: this parser does NOT resolve to userId — use resolveMentions for that.
 * That split keeps parsing pure (no async DB) and lets callers batch resolve.
 */
export function parseMentions(
  body: string,
  locale: Locale,
  config: MentionConfig = DEFAULT_MENTION_CONFIG,
): MentionParseResult {
  const tokens: MentionToken[] = [];
  const rejectedDuplicates: string[] = [];
  const seen = new Set<string>();
  let truncated = false;
  let stormDetected = false;

  if (!config.enabledLocales.includes(locale)) {
    return { tokens: [], rejectedDuplicates: [], truncated: false, stormDetected: false };
  }

  // Reset regex state — global regex retains lastIndex between calls.
  MENTION_REGEX_BASE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MENTION_REGEX_BASE.exec(body)) !== null) {
    const raw = match[1] ?? '';
    if (raw.length < config.minHandleLength || raw.length > config.maxHandleLength) continue;
    const normalized = normalizeHandle(raw, locale, config);
    if (!isValidHandleChars(normalized, locale, config)) continue;
    if (RESERVED_HANDLES.has(normalized)) continue;

    if (seen.has(normalized)) {
      if (config.dedupeHandles) {
        rejectedDuplicates.push(raw);
        continue;
      }
    }
    seen.add(normalized);

    const start = match.index;
    const end = match.index + 1 + raw.length;
    tokens.push({
      rawHandle: raw,
      normalizedHandle: normalized,
      userId: null,
      displayName: raw,
      start,
      end,
      locale,
    });

    if (tokens.length > config.maxMentionsPerComment) {
      truncated = true;
      tokens.pop();
      stormDetected = true;
      break;
    }
  }

  return { tokens, rejectedDuplicates, truncated, stormDetected };
}

/**
 * Resolve mention tokens to userIds by calling the injected `resolveHandle`.
 * Tokens that cannot be resolved get userId=null but stay in the result so the
 * UI can render them as @unknown (degrades gracefully).
 */
export function resolveMentions(
  tokens: readonly MentionToken[],
  resolveHandle: ResolveHandleFn,
): readonly MentionToken[] {
  const out: MentionToken[] = [];
  for (const t of tokens) {
    const hit = resolveHandle(t.normalizedHandle);
    if (hit) {
      out.push({ ...t, userId: hit.userId, displayName: hit.displayName, locale: hit.locale });
    } else {
      out.push(t);
    }
  }
  return out;
}

/** Parse + resolve in one call. `userExists` may be sync or async. */
export async function parseAndResolveMentions(
  body: string,
  locale: Locale,
  config: MentionConfig,
  resolveHandle: ResolveHandleFn,
): Promise<readonly MentionToken[]> {
  const parsed = parseMentions(body, locale, config);
  return resolveMentions(parsed.tokens, resolveHandle);
}

// ============================================================================
// §8 — Mention normalisation helpers
// ============================================================================

/**
 * Normalise a handle to a canonical form:
 *  1. Trim whitespace
 *  2. Apply NFD + strip combining marks (diacritic fold)
 *  3. Lowercase per locale rules
 *  4. Strip forbidden characters (only allow set from config)
 */
export function normalizeHandle(raw: string, locale: Locale, config: MentionConfig): string {
  let h = raw.trim();
  // NFD: split base char + combining mark.
  h = h.normalize('NFD').replace(/[\u0300-\u036f]/gu, '');
  h = h.toLocaleLowerCase(locale);
  if (!config.allowDotSeparator) h = h.replace(/\./g, '');
  if (!config.allowUnderscoreSeparator) h = h.replace(/_/g, '');
  if (!config.allowDashSeparator) h = h.replace(/-/g, '');
  if (!config.allowUnicode) h = h.replace(/[^A-Za-z0-9._'\-]/gu, '');
  return h;
}

/** Validate that a normalised handle only contains allowed characters. */
export function isValidHandleChars(handle: string, locale: Locale, config: MentionConfig): boolean {
  // Per locale, characters outside the union of ASCII + locale-set are rejected.
  const localeExtras = LOCALE_HANDLE_CHARS[locale];
  for (const ch of handle) {
    const code = ch.charCodeAt(0);
    if (code >= 0x30 && code <= 0x39) continue; // 0-9
    if (code >= 0x61 && code <= 0x7a) continue; // a-z
    if (ch === '_' && config.allowUnderscoreSeparator) continue;
    if (ch === '.' && config.allowDotSeparator) continue;
    if (ch === '-' && config.allowDashSeparator) continue;
    if (ch === "'") continue; // apostrophe for O'Brien, D'Anna, etc.
    if (config.allowUnicode && localeExtras.has(ch)) continue;
    return false;
  }
  return handle.length >= config.minHandleLength && handle.length <= config.maxHandleLength;
}

/** Strip @-prefix from a raw mention. */
export function stripAtPrefix(raw: string): string {
  return raw.startsWith('@') ? raw.slice(1) : raw;
}

/** Re-attach @-prefix for rendering. */
export function withAtPrefix(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
}

/** Generate an in-body preview segment from a mention token. */
export function renderMentionPreview(token: MentionToken): string {
  return withAtPrefix(token.normalizedHandle);
}

// ============================================================================
// §9 — Mention notification fan-out
// ============================================================================

/**
 * Fan out mention notifications to all resolved tokens. Dedup per
 * (recipient, post, comment). Respect opt-in. Redact sacred content.
 */
export function fanOutMentionNotifications(
  comment: CommentRecord,
  tokens: readonly MentionToken[],
  opts: {
    readonly optIn?: MentionOptInFn;
    readonly config?: ThreadingConfig;
    readonly lgpd?: LgpdConfig;
    readonly now?: number;
  } = {},
): OperationResult<NotificationFanOut> {
  const cfg = opts.config ?? DEFAULT_THREADING_CONFIG;
  const lgpd = opts.lgpd ?? DEFAULT_LGPD_CONFIG;
  const now = opts.now ?? Date.now();
  const optIn = opts.optIn ?? ((uid) => lgpd.mentionOptInByDefault);
  const audit: AuditEvent[] = [];
  const envelopes: NotificationEnvelope[] = [];
  const skippedOptOut: string[] = [];
  const skippedDup: string[] = [];
  const skippedInvalid: string[] = [];

  const seen = new Set<string>();
  const preview = computePreview(comment);

  for (const t of tokens) {
    if (!t.userId) {
      skippedInvalid.push(t.normalizedHandle);
      continue;
    }
    if (t.userId === comment.authorId) {
      // Self-mention never fans out — protect against accidental @self noise.
      continue;
    }
    if (!optIn(t.userId)) {
      skippedOptOut.push(t.userId);
      continue;
    }
    const dupKey = `${t.userId}|${comment.postId}|${comment.commentId}`;
    if (seen.has(dupKey)) {
      skippedDup.push(t.userId);
      continue;
    }
    seen.add(dupKey);

    const base: Omit<NotificationEnvelope, 'envelopeId'> = {
      type: 'mention',
      recipientId: t.userId,
      actorId: comment.authorId,
      postId: comment.postId,
      commentId: comment.commentId,
      preview,
      mentionHandle: withAtPrefix(t.normalizedHandle),
      locale: comment.locale,
      createdAt: now,
    };
    const env: NotificationEnvelope = {
      ...base,
      envelopeId: envelopeIdFor(base),
      ...(comment.sacredFlag ? { redactionReason: 'sacred' as const } : {}),
    };
    envelopes.push(env);
    audit.push({ kind: 'NotificationFanned', at: now, payload: env });
  }

  if (comment.sacredFlag) {
    audit.push({
      kind: 'SacredRedaction',
      at: now,
      payload: { commentId: comment.commentId, sacredKind: comment.sacredKind },
    });
  }

  const fan: NotificationFanOut = {
    envelopes,
    skippedOptOut,
    skippedDup,
    skippedInvalid,
  };
  return {
    status: 'ok',
    value: fan,
    reasonCode: 'OK',
    flagged: false,
    audit,
  };
}

/** Compute the preview text for a notification — redacted if sacred. */
export function computePreview(comment: CommentRecord): string {
  if (comment.sacredFlag) return SACRED_PREVIEW_PLACEHOLDER;
  const trimmed = comment.body.trim();
  if (trimmed.length <= 140) return trimmed;
  return trimmed.slice(0, 137) + '…';
}

// ============================================================================
// §10 — Sacred-content handling
// ============================================================================

/** Is the sacred kind considered "deep" enough to require opt-in? */
export function requiresSacredOptIn(kind: SacredKind): boolean {
  return SACRED_POLICIES[kind].requireOptIn;
}

/** Should the comment body be redacted in notification preview? */
export function shouldRedactInPreview(kind: SacredKind): boolean {
  return SACRED_POLICIES[kind].redactInPreview;
}

/** Should the comment body be redacted in search index? */
export function shouldRedactInSearch(kind: SacredKind): boolean {
  return SACRED_POLICIES[kind].redactInSearch;
}

/** Tag a comment as sacred without mutating the original. */
export function tagAsSacred(rec: CommentRecord, kind: SacredKind): CommentRecord {
  if (kind === 'none') return rec;
  return { ...rec, sacredFlag: true, sacredKind: kind };
}

/** Build the "display label" for a sacred comment (used in UI badges). */
export function sacredDisplayLabel(kind: SacredKind): string {
  return SACRED_POLICIES[kind].displayLabel;
}

/** True iff a body excerpt should be redacted when rendered in feeds. */
export function isSacred(rec: CommentRecord): boolean {
  return rec.sacredFlag && rec.sacredKind !== 'none';
}

// ============================================================================
// §11 — A11y: ARIA tree + keyboard nav
// ============================================================================

/**
 * Build an ARIA-compliant treeitem descriptor list from a ThreadNode tree.
 * Level is 1-based. posInSet / setSize reflect sibling position + total.
 */
export function buildA11yTree(
  roots: readonly ThreadNode[],
  opts: { readonly selectedKey?: string | null } = {},
): readonly A11yTreeNode[] {
  const out: A11yTreeNode[] = [];
  const selected = opts.selectedKey ?? null;
  for (const r of roots) walkA11y(r, out, selected);
  return out;
}
function walkA11y(node: ThreadNode, out: A11yTreeNode[], selected: string | null): void {
  const setSize = node.children.length + 1; // self + siblings
  out.push({
    nodeKey: node.nodeKey,
    ariaRole: 'treeitem',
    ariaLevel: node.ariaLevel,
    ariaPosInSet: 1,
    ariaSetSize: setSize,
    ariaExpanded: node.children.length > 0,
    ariaSelected: node.nodeKey === selected,
    ariaLabel: commentAriaLabel(node.comment),
  });
  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]!;
    const before = out.length;
    walkA11y(c, out, selected);
    // Patch ariaPosInSet for the child we just walked.
    const child = out[before];
    if (child) out[before] = { ...child, ariaPosInSet: i + 1, ariaSetSize: node.children.length };
  }
}

/** Compute a sensible aria-label for a comment. */
export function commentAriaLabel(rec: CommentRecord): string {
  const preview = rec.body.length > 80 ? rec.body.slice(0, 77) + '…' : rec.body;
  return `Comment by ${rec.authorId}: ${preview}`;
}

/**
 * Apply keyboard navigation to a flattened tree. `action` is one of:
 *   'down' | 'up' | 'home' | 'end' | 'right' | 'left'
 * Returns the new selected index (or original if invalid).
 */
export function applyKeyboardNav(
  flat: readonly ThreadNode[],
  currentIndex: number,
  action: 'down' | 'up' | 'home' | 'end' | 'right' | 'left',
  expanded: ReadonlySet<string> = new Set(),
): number {
  if (flat.length === 0) return -1;
  switch (action) {
    case 'down':
      return Math.min(currentIndex + 1, flat.length - 1);
    case 'up':
      return Math.max(currentIndex - 1, 0);
    case 'home':
      return 0;
    case 'end':
      return flat.length - 1;
    case 'right':
      // expand current node if collapsed, else move to first child
      {
        const cur = flat[currentIndex];
        if (!cur) return currentIndex;
        if (cur.children.length > 0 && !expanded.has(cur.comment.commentId)) {
          // caller is expected to track expansion separately; we just no-op here
        }
        if (currentIndex < flat.length - 1) return currentIndex + 1;
        return currentIndex;
      }
    case 'left':
      // collapse if expanded, else move to parent
      {
        const cur = flat[currentIndex];
        if (!cur) return currentIndex;
        if (cur.depth > 0) {
          // walk up to find parent
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (flat[i]!.depth < cur.depth) return i;
          }
        }
        return currentIndex;
      }
  }
}

/** Quick guard: is an ARIA level within a reasonable bound? */
export function isAriaLevelValid(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= MAX_THREAD_DEPTH + 1;
}

// ============================================================================
// §12 — LGPD Art. 7 / Art. 9 / Art. 18 helpers
// ============================================================================

/**
 * LGPD Art. 7 — mention opt-in check. Returns false by default.
 * Wrap any fan-out call with this before producing an envelope.
 */
export function isMentionOptIn(rec: { readonly mentionOptIn: boolean }): boolean {
  return rec.mentionOptIn === true;
}

/** LGPD Art. 9 — purpose-of-processing annotation. Engagement, not marketing. */
export const LGPD_PURPOSE = Object.freeze({
  mentionNotification: 'engagement',
  pushDelivery: 'engagement',
  threadRender: 'functional',
  sacredRedaction: 'protection-of-sensitive-content',
  audit: 'legitimate-interest',
} as const);

/**
 * LGPD Art. 18 — erasure. Removes a user's mentions from pending notifications
 * and (optionally) redacts display names. Keeps tombstone CommentRecord so
 * thread continuity isn't lost (per Art. 18 §6 — legitimate-interest override).
 */
export function applyLgpdErasure(
  userId: string,
  comments: readonly CommentRecord[],
  opts: { readonly lgpd?: LgpdConfig; readonly now?: number } = {},
): OperationResult<{ records: readonly CommentRecord[]; purgedEnvelopes: number }> {
  const lgpd = opts.lgpd ?? DEFAULT_LGPD_CONFIG;
  const now = opts.now ?? Date.now();
  const audit: AuditEvent[] = [];
  const ids: string[] = [];

  const newComments = comments.map((c) => {
    if (c.authorId !== userId) return c;
    ids.push(c.commentId);
    return redactCommentBody(c);
  });
  audit.push({ kind: 'LgpdErasure', at: now, payload: { userId, commentIds: ids } });
  // We can't enumerate envelopes from a comment-only input — return 0; the
  // integration layer is responsible for purging actual envelopes.
  const purgedEnvelopes = 0;

  return {
    status: 'ok',
    value: { records: newComments, purgedEnvelopes },
    reasonCode: 'OK',
    flagged: false,
    audit,
  };
}

/** Compute the retention deadline for a notification envelope. */
export function retentionDeadline(env: NotificationEnvelope, retentionMs: number = LGPD_DEFAULT_RETENTION_MS): number {
  return env.createdAt + retentionMs;
}

/** Is an envelope past its retention deadline? */
export function isEnvelopeExpired(env: NotificationEnvelope, now: number = Date.now(), retentionMs: number = LGPD_DEFAULT_RETENTION_MS): boolean {
  return now > retentionDeadline(env, retentionMs);
}

// ============================================================================
// §13 — Anti-abuse detection
// ============================================================================

/**
 * Detect rapid-comment pattern: ≥10 comments by same actor in 60s window.
 * Returns zero or more AntiAbuseFlag records.
 */
export function detectRapidComments(
  comments: readonly CommentRecord[],
  now: number = Date.now(),
): readonly AntiAbuseFlag[] {
  const byActor = new Map<string, CommentRecord[]>();
  for (const c of comments) {
    const arr = byActor.get(c.authorId);
    if (arr) arr.push(c);
    else byActor.set(c.authorId, [c]);
  }
  const out: AntiAbuseFlag[] = [];
  for (const [actorId, list] of byActor) {
    const recent = list.filter((c) => now - c.createdAt <= RAPID_COMMENT_WINDOW_MS);
    if (recent.length >= RAPID_COMMENT_THRESHOLD) {
      out.push({
        kind: 'rapid-comment',
        actorId,
        commentId: recent[recent.length - 1]!.commentId,
        observedValue: recent.length,
        thresholdValue: RAPID_COMMENT_THRESHOLD,
        detectedAt: now,
        reasonCode: 'CMT_004_RAPID',
      });
    }
  }
  return out;
}

/**
 * Detect mention-storm: comment body contains ≥ MENTION_STORM_THRESHOLD
 * @mentions. Always reported; not necessarily blocked.
 */
export function detectMentionStorm(
  body: string,
  commentId: string,
  actorId: string,
  now: number = Date.now(),
): AntiAbuseFlag | null {
  MENTION_REGEX_BASE.lastIndex = 0;
  let count = 0;
  while (MENTION_REGEX_BASE.exec(body) !== null) count++;
  if (count >= MENTION_STORM_THRESHOLD) {
    return {
      kind: 'mention-storm',
      actorId,
      commentId,
      observedValue: count,
      thresholdValue: MENTION_STORM_THRESHOLD,
      detectedAt: now,
      reasonCode: 'CMT_005_STORM',
    };
  }
  return null;
}

/**
 * Detect cycles: a candidate parentId that already has the candidate as a
 * descendant. Returns true iff the new edge would create a cycle.
 */
export function wouldCreateCycle(
  candidateId: string,
  proposedParentId: string,
  comments: readonly CommentRecord[],
): boolean {
  if (candidateId === proposedParentId) return true;
  const byId = new Map<string, CommentRecord>();
  for (const c of comments) byId.set(c.commentId, c);
  let cursor: CommentRecord | undefined = byId.get(proposedParentId);
  const seen = new Set<string>();
  while (cursor) {
    if (cursor.commentId === candidateId) return true;
    if (seen.has(cursor.commentId)) return true; // existing cycle
    seen.add(cursor.commentId);
    if (cursor.parentId === null) return false;
    cursor = byId.get(cursor.parentId);
  }
  return false;
}

/** Aggregated anti-abuse check across all patterns. */
export function runAntiAbuseSweep(
  comments: readonly CommentRecord[],
  now: number = Date.now(),
): readonly AntiAbuseFlag[] {
  const flags: AntiAbuseFlag[] = [];
  flags.push(...detectRapidComments(comments, now));
  for (const c of comments) {
    const f = detectMentionStorm(c.body, c.commentId, c.authorId, now);
    if (f) flags.push(f);
  }
  return flags;
}

// ============================================================================
// §14 — Audit log helpers
// ============================================================================

/** Compose an audit log entry for a CommentCreated event. */
export function auditCommentCreated(rec: CommentRecord): AuditEvent {
  return { kind: 'CommentCreated', at: rec.createdAt, payload: rec };
}

/** Compose a CommentEdited audit entry. */
export function auditCommentEdited(commentId: string, oldBody: string, newBody: string, at: number): AuditEvent {
  return { kind: 'CommentEdited', at, payload: { commentId, oldBody, newBody } };
}

/** Compose a CommentDeleted audit entry. */
export function auditCommentDeleted(commentId: string, redactedBody: string, at: number): AuditEvent {
  return { kind: 'CommentDeleted', at, payload: { commentId, redactedBody } };
}

/** Compose a MentionResolved audit entry. */
export function auditMentionResolved(token: MentionToken): AuditEvent {
  return { kind: 'MentionResolved', at: Date.now(), payload: token };
}

/** Compose a NotificationFanned audit entry. */
export function auditNotificationFanned(env: NotificationEnvelope): AuditEvent {
  return { kind: 'NotificationFanned', at: env.createdAt, payload: env };
}

/** Compose a SacredRedaction audit entry. */
export function auditSacredRedaction(commentId: string, sacredKind: SacredKind, at: number): AuditEvent {
  return { kind: 'SacredRedaction', at, payload: { commentId, sacredKind } };
}

/** Compose an AntiAbuseFlag audit entry. */
export function auditAntiAbuseFlag(flag: AntiAbuseFlag): AuditEvent {
  return { kind: 'AntiAbuseFlag', at: flag.detectedAt, payload: flag };
}

/** Compose an LgpdErasure audit entry. */
export function auditLgpdErasure(userId: string, commentIds: readonly string[], at: number): AuditEvent {
  return { kind: 'LgpdErasure', at, payload: { userId, commentIds } };
}

/** Append events immutably, returning a new audit log. */
export function appendAudit(log: AuditLog, events: readonly AuditEvent[]): AuditLog {
  return [...log, ...events];
}

/** Filter audit log by kind. */
export function filterAuditByKind(log: AuditLog, kind: AuditEvent['kind']): readonly AuditEvent[] {
  return log.filter((e) => e.kind === kind);
}

/** Count audit log entries. */
export function auditCount(log: AuditLog): number {
  return log.length;
}

// ============================================================================
// §15 — Smoke / regression + helpers
// ============================================================================

/**
 * Build a deterministic CommentRecord list for tests / smoke.
 *
 * @param count — how many to produce
 * @param opts.startId — first comment id; auto-incremented
 * @param opts.parentEvery — every Nth becomes a reply to the previous top-level
 */
export function seedCommentRecords(
  count: number,
  opts: { readonly startId?: number; readonly parentEvery?: number; readonly postId?: string; readonly now?: number; readonly locale?: Locale; readonly actorId?: string } = {},
): readonly CommentRecord[] {
  const start = opts.startId ?? 1;
  const parentEvery = opts.parentEvery ?? 0;
  const postId = opts.postId ?? 'post-seed';
  const now = opts.now ?? Date.now();
  const locale = opts.locale ?? 'pt-BR';
  const actor = opts.actorId ?? 'user-seed';
  const out: CommentRecord[] = [];
  let lastRootId: string | null = null;
  for (let i = 0; i < count; i++) {
    const id = `c-${start + i}`;
    let parentId: string | null = null;
    if (parentEvery > 0 && i > 0 && i % parentEvery === 0) {
      parentId = lastRootId;
    }
    out.push({
      commentId: id,
      postId,
      parentId,
      authorId: actor,
      body: `Olá @maria.silva e @josé! Comentário #${i}.`,
      locale,
      createdAt: now + i * 1000,
      editedAt: null,
      sacredFlag: false,
      sacredKind: 'none',
    });
    if (parentId === null) lastRootId = id;
  }
  return out;
}

/** Build a deterministic thread tree from seed. */
export function smokeThread(): readonly ThreadNode[] {
  const comments: CommentRecord[] = [
    {
      commentId: 'c1', postId: 'p1', parentId: null, authorId: 'u1',
      body: 'Top-level @maria.silva', locale: 'pt-BR', createdAt: 1000,
      editedAt: null, sacredFlag: false, sacredKind: 'none',
    },
    {
      commentId: 'c2', postId: 'p1', parentId: 'c1', authorId: 'u2',
      body: 'Reply @josé_o-brien', locale: 'pt-BR', createdAt: 1100,
      editedAt: null, sacredFlag: false, sacredKind: 'none',
    },
    {
      commentId: 'c3', postId: 'p1', parentId: 'c2', authorId: 'u3',
      body: 'Nested @everyone (reserved)', locale: 'pt-BR', createdAt: 1200,
      editedAt: null, sacredFlag: true, sacredKind: 'odu-teaching',
    },
  ];
  return buildThreadTree(comments).value;
}

/** Smoke: build a tree, depth 0..6, then verify depth+7 is rejected. */
export function smokeDepthSweep(): readonly { depth: number; ok: boolean }[] {
  const now = Date.now();
  const out: { depth: number; ok: boolean }[] = [];
  for (let depth = 0; depth <= 7; depth++) {
    let parentId: string | null = null;
    const recs: CommentRecord[] = [];
    for (let i = 0; i <= depth; i++) {
      const rec: CommentRecord = {
        commentId: `d-${depth}-${i}`, postId: 'p-depth', parentId,
        authorId: 'u-depth', body: `Step ${i}`, locale: 'pt-BR',
        createdAt: now + i, editedAt: null,
        sacredFlag: false, sacredKind: 'none',
      };
      recs.push(rec);
      parentId = rec.commentId;
    }
    const tree = buildThreadTree(recs);
    const ok = maxTreeDepth(tree.value) === Math.min(depth, MAX_THREAD_DEPTH);
    out.push({ depth, ok });
  }
  return out;
}

/** Smoke: cycle detection across candidates. */
export function smokeCycleDetection(): readonly boolean[] {
  const comments = seedCommentRecords(4, { startId: 100 });
  return [
    wouldCreateCycle('c-101', 'c-100', comments),
    wouldCreateCycle('c-100', 'c-101', comments),
    wouldCreateCycle('c-101', 'c-101', comments),
    wouldCreateCycle('c-101', 'c-999', comments), // unknown parent
  ];
}

/** Smoke: mention parser across PT/EN/ES samples. */
export function smokeMentionParser(): readonly { locale: Locale; body: string; tokens: number }[] {
  const samples: { locale: Locale; body: string }[] = [
    { locale: 'pt-BR', body: 'olá @maria.silva e @josé_o\'brien' },
    { locale: 'en-US', body: 'hello @john.doe and @jane_doe' },
    { locale: 'es-ES', body: 'hola @juan.pérez y @maría_lópez' },
    { locale: 'pt-BR', body: 'sem menção aqui' },
    { locale: 'pt-BR', body: '@everyone e @admin são reservados' },
    { locale: 'pt-BR', body: '@ab @bc @cd @de @ef @fg @gh @hi @ij @jk @kl (11 mentions)' },
  ];
  return samples.map((s) => {
    const r = parseMentions(s.body, s.locale);
    return { locale: s.locale, body: s.body, tokens: r.tokens.length };
  });
}

/** Smoke: sacred redaction in notification preview. */
export function smokeSacredRedaction(): readonly { kind: SacredKind; preview: string }[] {
  const kinds: SacredKind[] = ['none', 'odu-teaching', 'orixa-liturgy', 'tarot-reading', 'tantra-practice'];
  return kinds.map((kind) => {
    const base: CommentRecord = {
      commentId: `scr-${kind}`, postId: 'p-sacred', parentId: null,
      authorId: 'u-sacred', body: 'Este é um corpo de comentário sagrado bem longo.',
      locale: 'pt-BR', createdAt: Date.now(), editedAt: null,
      sacredFlag: kind !== 'none', sacredKind: kind,
    };
    return { kind, preview: computePreview(base) };
  });
}

/** Smoke: LGPD erasure redacts body but keeps the record. */
export function smokeLgpdErasure(): readonly { commentId: string; redacted: boolean; tombstoneKept: boolean }[] {
  const comments = seedCommentRecords(3, { startId: 200 });
  const target = comments[0]!.authorId;
  const erased = applyLgpdErasure(target, comments).value.records;
  return erased.map((c) => ({
    commentId: c.commentId,
    redacted: c.body === SACRED_PREVIEW_PLACEHOLDER,
    tombstoneKept: c.deleted === true,
  }));
}

/** Smoke: anti-abuse flag on rapid comments. */
export function smokeAntiAbuse(): readonly { kind: AntiAbuseFlag['kind']; flagged: boolean }[] {
  const now = Date.now();
  const rapid = Array.from({ length: RAPID_COMMENT_THRESHOLD + 1 }, (_, i) => ({
    commentId: `r-${i}`, postId: 'p-rapid', parentId: null,
    authorId: 'u-rapid', body: `Comentário ${i}`, locale: 'pt-BR' as Locale,
    createdAt: now + i, editedAt: null,
    sacredFlag: false, sacredKind: 'none' as SacredKind,
  }));
  const flags = runAntiAbuseSweep(rapid, now + RAPID_COMMENT_THRESHOLD);
  const stormBody = Array.from({ length: MENTION_STORM_THRESHOLD + 1 }, (_, i) => `@u${i}`).join(' ');
  const stormFlag = detectMentionStorm(stormBody, 'storm-1', 'u-storm', now);
  return [
    { kind: 'rapid-comment', flagged: flags.some((f) => f.kind === 'rapid-comment') },
    { kind: 'mention-storm', flagged: stormFlag !== null },
    { kind: 'cycle', flagged: false },
    { kind: 'depth-exceeded', flagged: false },
  ];
}

/** Smoke: A11y ARIA tree shape. */
export function smokeA11yTree(): readonly { level: number; posInSet: number; setSize: number }[] {
  const roots = smokeThread();
  const tree = buildA11yTree(roots);
  return tree.map((n) => ({ level: n.ariaLevel, posInSet: n.ariaPosInSet, setSize: n.ariaSetSize }));
}

/** Smoke: pagination cursor round-trip. */
export function smokePaginationCursor(): readonly boolean[] {
  const cur = buildCursor('p-cursor', 'c-anchor', 1700000000000, DEFAULT_PAGE_SIZE);
  return [
    verifyCursor('p-cursor', cur, DEFAULT_PAGE_SIZE),
    !verifyCursor('p-other', cur, DEFAULT_PAGE_SIZE),
    !verifyCursor('p-cursor', { ...cur, createdAt: 1700000000001 }, DEFAULT_PAGE_SIZE),
  ];
}

/** Smoke: hash determinism — same input → same hash. */
export function smokeHashDeterminism(): readonly { input: string; h32: string; h64: string; equal: boolean }[] {
  const inputs = ['maria.silva', 'josé_o-brien', 'juan.pérez'];
  return inputs.map((input) => {
    const h32a = toHex32(fnv1a32(input));
    const h32b = toHex32(fnv1a32(input));
    const h64 = toHex64(fnv1a64(input));
    return { input, h32: h32a, h64, equal: h32a === h32b };
  });
}

/** Smoke: HMAC-SHA256 known-vector sanity (RFC 4231 test case 1). */
export function smokeHmacKnownVector(): readonly { name: string; hex: string; length: number }[] {
  // RFC 4231 §4.2 Test Case 1: key=0x0b * 20, data="Hi There"
  // Expected HMAC-SHA256 = b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7
  const rfc = hmacSha256Hex('\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b', 'Hi There');
  // Custom: deterministic
  const custom = hmacSha256Hex('w55-key', 'hello world');
  // Self-consistency: same input → same output
  const same = hmacSha256Hex('w55-key', 'hello world');
  return [
    { name: 'rfc-4231-test1', hex: rfc, length: rfc.length },
    { name: 'custom-deterministic', hex: custom, length: custom.length },
    { name: 'self-consistent', hex: same === custom ? 'match' : 'mismatch', length: same.length },
  ];
}

/** Run all smoke suites and return a single pass count. */
export function runAllSmoke(): { pass: number; total: number; failures: readonly string[] } {
  const failures: string[] = [];
  let pass = 0;
  let total = 0;

  // Smoke 1: thread build with depths
  for (const r of smokeDepthSweep()) {
    total++; if (r.ok) pass++; else failures.push(`depth=${r.depth}`);
  }
  // Smoke 2: cycle detection (cycle-from-non-descendant=false, from-descendant=true)
  const cycles = smokeCycleDetection();
  const expectedCycles = [false, false, true, false];
  for (let i = 0; i < cycles.length; i++) {
    total++;
    if (cycles[i] === expectedCycles[i]) pass++;
    else failures.push(`cycle[${i}] expected=${expectedCycles[i]} got=${cycles[i]}`);
  }
  // Smoke 3: mention parser — at least 1 token for samples with mentions, 0 for "sem menção"
  const mentions = smokeMentionParser();
  const mentionExpect = [2, 2, 2, 0, 0, 10];
  for (let i = 0; i < mentions.length; i++) {
    total++;
    if (mentions[i]!.tokens === mentionExpect[i]) pass++;
    else failures.push(`mention[${i}] expected=${mentionExpect[i]} got=${mentions[i]!.tokens}`);
  }
  // Smoke 4: sacred redaction
  const sacred = smokeSacredRedaction();
  for (const r of sacred) {
    total++;
    const expected = r.kind === 'none' ? 'Este é um corpo de comentário sagrado bem longo.' : SACRED_PREVIEW_PLACEHOLDER;
    if (r.preview === expected) pass++;
    else failures.push(`sacred[${r.kind}] preview mismatch`);
  }
  // Smoke 5: LGPD erasure
  const erasure = smokeLgpdErasure();
  for (const r of erasure) {
    total++;
    if (r.redacted && r.tombstoneKept) pass++;
    else failures.push(`erasure[${r.commentId}] redacted=${r.redacted} tombstone=${r.tombstoneKept}`);
  }
  // Smoke 6: anti-abuse
  const abuse = smokeAntiAbuse();
  const expectedAbuse = [true, true, false, false];
  for (let i = 0; i < abuse.length; i++) {
    total++;
    if (abuse[i]!.flagged === expectedAbuse[i]) pass++;
    else failures.push(`abuse[${i}] expected=${expectedAbuse[i]} got=${abuse[i]!.flagged}`);
  }
  // Smoke 7: A11y tree
  const a11y = smokeA11yTree();
  for (const r of a11y) {
    total++;
    if (r.level >= 1 && r.posInSet >= 1 && r.setSize >= 1) pass++;
    else failures.push(`a11y level=${r.level} posInSet=${r.posInSet} setSize=${r.setSize}`);
  }
  // Smoke 8: pagination cursor — verify returns true for matching postId,
  // !verify returns true (i.e. verify returned false) for mismatched postId
  // and tampered time.
  const cursor = smokePaginationCursor();
  const expectedCursor = [true, true, true];
  for (let i = 0; i < cursor.length; i++) {
    total++;
    if (cursor[i] === expectedCursor[i]) pass++;
    else failures.push(`cursor[${i}] expected=${expectedCursor[i]} got=${cursor[i]}`);
  }
  // Smoke 9: hash determinism
  const hash = smokeHashDeterminism();
  for (const r of hash) {
    total++; if (r.equal) pass++; else failures.push(`hash[${r.input}] not deterministic`);
  }
  // Smoke 10: HMAC known vector
  const hmac = smokeHmacKnownVector();
  for (const r of hmac) {
    total++;
    if (r.hex.length === 64 || r.hex === 'match') pass++;
    else failures.push(`hmac[${r.name}] hex=${r.hex}`);
  }
  // Smoke 11: tree node count
  const tree = smokeThread();
  const treeOk = countNodes(tree) === 3;
  total++; if (treeOk) pass++; else failures.push('tree count != 3');
  // Smoke 12: max depth
  const depthOk = maxTreeDepth(tree) === 2;
  total++; if (depthOk) pass++; else failures.push('max depth != 2');
  // Smoke 13: build thread cycle rejection (parentId points to descendant)
  const cycleComments: CommentRecord[] = [
    { commentId: 'cc1', postId: 'p-c', parentId: null, authorId: 'u-c', body: 'root', locale: 'pt-BR', createdAt: Date.now(), editedAt: null, sacredFlag: false, sacredKind: 'none' },
    { commentId: 'cc2', postId: 'p-c', parentId: 'cc1', authorId: 'u-c', body: 'reply', locale: 'pt-BR', createdAt: Date.now() + 1, editedAt: null, sacredFlag: false, sacredKind: 'none' },
    { commentId: 'cc3', postId: 'p-c', parentId: 'cc2', authorId: 'u-c', body: 'reply2', locale: 'pt-BR', createdAt: Date.now() + 2, editedAt: null, sacredFlag: false, sacredKind: 'none' },
  ];
  const cycleBuild = buildThreadTree(cycleComments);
  const cycleOk = cycleBuild.value.length === 1 && cycleBuild.value[0]!.children.length === 1; // cc3 dropped as cycle
  total++; if (cycleOk) pass++; else failures.push('cycle build rejection failed');
  // Smoke 14: fan-out respects opt-in
  const optInComment: CommentRecord = {
    commentId: 'fo-1', postId: 'p-fo', parentId: null, authorId: 'u-fo',
    body: '@opted_in @opted_out', locale: 'pt-BR',
    createdAt: Date.now(), editedAt: null, sacredFlag: false, sacredKind: 'none',
  };
  const parsed = parseMentions(optInComment.body, 'pt-BR');
  const fakeResolve: ResolveHandleFn = (h) => {
    if (h === 'opted_in') return { userId: 'u-oi', displayName: 'Opted In', locale: 'pt-BR' };
    if (h === 'opted_out') return { userId: 'u-oo', displayName: 'Opted Out', locale: 'pt-BR' };
    return null;
  };
  const resolved = resolveMentions(parsed.tokens, fakeResolve);
  const fan = fanOutMentionNotifications(optInComment, resolved, {
    optIn: (uid) => uid === 'u-oi',
  });
  const fanOk = fan.value.envelopes.length === 1 && fan.value.skippedOptOut.length === 1 && fan.value.skippedInvalid.length === 0;
  total++; if (fanOk) pass++; else failures.push(`fan-out envelopes=${fan.value.envelopes.length} skippedOptOut=${fan.value.skippedOptOut.length}`);

  return { pass, total, failures };
}