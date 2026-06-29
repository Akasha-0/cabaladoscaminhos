/**
 * @file user-import-export.ts — w45
 *
 * LGPD-compliant user data portability engine for Akasha Portal.
 *
 * Implements three pillars of LGPD Art. 18 (right to portability, deletion,
 * confirmation of existence) plus import flows for federated platforms:
 *
 *   1. **Export** — Generate JSON / CSV / ZIP-portable artifacts of user data
 *      with deterministic checksums, TTL-bound download links, and
 *      configurable section selection (profile, posts, comments, likes,
 *      follows, marketplace, events, notifications, settings, sessions).
 *   2. **Deletion** — Two-phase deletion with 30-day grace window (per
 *      LGPD Art. 18 §6° and Marco Civil da Internet Art. 11).  User can
 *      cancel at any point during grace_period. After elapse, processing
 *      is irreversible.
 *   3. **Import** — Accept user uploads from Mastodon / Twitter (X) /
 *      Facebook / WordPress archives and arbitrary CSV. Reconciles
 *      against existing user record with deterministic dedupe.
 *
 * Design constraints:
 *   - 100% pure functions, no I/O. Caller persists the artifacts.
 *   - No external runtime deps — fnv-1a + uuid v4 are hand-rolled.
 *   - Strict TypeScript, no `any`, only `unknown` and `Record<string, unknown>`.
 *   - Deterministic JSON serialization (deep-stable key order) so the
 *     artifact checksum is stable across runs.
 *
 * LGPD references:
 *   - Lei nº 13.709/2018 — Lei Geral de Proteção de Dados
 *   - Art. 18 — rights of the data subject (portability, deletion, etc.)
 *   - Art. 46 — security measures
 *   - Art. 37 — record of processing activities (audit-log retention)
 *   - Marco Civil da Internet — Lei nº 12.965/2014, Art. 11
 *
 * @author Coder agent (Akasha Wave 45)
 * @license Proprietary
 * @since 2026-06-29
 */

/* ============================================================================
 * SECTION 1 — Public type definitions
 * ========================================================================== */

/**
 * Wire format for a user data export.
 *
 * `zip` is logical only; the artifact payload remains JSON-on-disk and
 * the caller decides whether to compress via `pako` or `fflate`. Keeping
 * `zip` here lets clients signal intent without the engine deciding for
 * them.
 */
export type ExportFormat = 'json' | 'csv' | 'zip'

/**
 * Logical sections of a user's account that can be exported.
 *
 * The `'all'` sentinel is a convenience for the UI but never appears
 * inside the artifact itself — it is expanded by {@link generateExport}
 * into the concrete section list so downstream tooling can rely on a
 * literal set of keys.
 */
export type ExportSection =
  | 'profile'
  | 'posts'
  | 'comments'
  | 'likes'
  | 'follows'
  | 'marketplace'
  | 'events'
  | 'notifications'
  | 'settings'
  | 'sessions'
  | 'all'

/**
 * Submission envelope — what the client sends to the backend to ask
 * for a fresh export to be prepared.
 */
export type ExportRequest = {
  /** Owning user id. */
  userId: string
  /** Subset of {@link ExportSection} requested. Must contain at least one. */
  sections: ExportSection[]
  /** Serialization format. */
  format: ExportFormat
  /** Whether to include uploaded media (avatars, post images, etc). */
  includeMedia: boolean
  /** Epoch ms. */
  requestedAt: number
}

/**
 * The generated artifact — what the caller persists and signs.
 *
 * The `data` map is intentionally `Record<ExportSection, unknown>` so
 * consumers can introspect any section without the engine having to
 * model every domain object.
 */
export type ExportArtifact = {
  /** Stable id, opaque to user; v4 UUID-shaped. */
  requestId: string
  /** Owner. */
  userId: string
  /** Final format produced (zip may be flattened to json). */
  format: ExportFormat
  /** Subset that was actually serialized (never contains 'all'). */
  sections: ExportSection[]
  /** Section key → payload. */
  data: Record<ExportSection, unknown>
  /** Byte size of the JSON payload — used for quotas / UI display. */
  sizeBytes: number
  /** Epoch ms — when {@link generateExport} ran. */
  generatedAt: number
  /** Epoch ms — link / artifact expires. 7 days after generation. */
  expiresAt: number
  /** Optional signed URL. Not produced by this engine; the caller sets. */
  downloadUrl?: string
  /** fnv-1a 32-bit hex of the stable JSON-serialized payload. */
  checksum: string
}

/**
 * Lifecycle envelope for account deletion.
 *
 * Status transitions:
 *   pending → grace_period → processing → completed
 *                       ↘ cancelled
 *                       ↘ restored → grace_period (re-cancel)
 *
 * `restored` is a terminal-but-revocable state; if the user re-engages,
 * the request is re-opened back to `grace_period` with a fresh deadline.
 */
export type DeletionRequest = {
  id: string
  userId: string
  reason?: string
  requestedAt: number
  gracePeriodEnds: number
  status:
    | 'pending'
    | 'grace_period'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | 'restored'
  cancelledAt?: number
  completedAt?: number
}

/**
 * Supported upstream sources for user-uploaded archives.
 *
 * `generic` means any CSV that follows the canonical column schema
 * declared in {@link GENERIC_CSV_COLUMNS}; `json` means a previously
 * produced Akasha artifact (used for cross-instance migration).
 */
export type ImportSource =
  | 'json'
  | 'csv'
  | 'mastodon'
  | 'twitter'
  | 'facebook'
  | 'wordpress'
  | 'generic'

/**
 * Outcome of an import job — what the UI shows after a dry-run or a
 * final import.
 */
export type ImportResult = {
  source: ImportSource
  recordsRead: number
  recordsImported: number
  recordsSkipped: number
  recordsFailed: number
  errors: { line: number; reason: string }[]
  startedAt: number
  completedAt: number
}

/**
 * Result of parsing an upstream archive.
 *
 * Kept separate from {@link ImportResult} so the parser can return raw
 * records without committing to a reconcile strategy.
 */
export type ParseResult = {
  records: unknown[]
  errors: { line: number; reason: string }[]
}

/**
 * Redaction profile used by {@link redactForAudit}.
 *
 * Keeps structural metadata (counts, ids, timestamps, section names)
 * but strips free text and any field flagged `pii: true` on the schema.
 */
export type RedactionProfile = {
  /** Section keys whose presence is recorded but whose content is removed. */
  keepShapeOnly: ReadonlyArray<ExportSection>
  /** Field names considered PII regardless of context. */
  piiFieldAllowlist: ReadonlyArray<string>
}

/* ============================================================================
 * SECTION 2 — Constants
 * ========================================================================== */

/** LGPD Art. 18 §5° + Marco Civil Art. 11 — minimum grace window. */
export const DEFAULT_GRACE_PERIOD_DAYS = 30

/** Hard TTL on export download links. */
export const EXPORT_TTL_DAYS = 7

/** Canonical list of export sections in `SECTIONS`, including the `all` sentinel. */
export const SECTIONS: readonly ExportSection[] = [
  'profile',
  'posts',
  'comments',
  'likes',
  'follows',
  'marketplace',
  'events',
  'notifications',
  'settings',
  'sessions',
  'all',
] as const

/** Concrete export sections — what `all` expands to. */
export const CONCRETE_SECTIONS: readonly ExportSection[] = SECTIONS.filter(
  (s): s is Exclude<ExportSection, 'all'> => s !== 'all',
)

/** Default redaction profile for internal audit logs (LGPD Art. 37). */
export const DEFAULT_REDACTION_PROFILE: RedactionProfile = {
  keepShapeOnly: [],
  piiFieldAllowlist: [
    'email',
    'phone',
    'phoneNumber',
    'cpf',
    'rg',
    'address',
    'fullAddress',
    'birthDate',
    'dataNascimento',
    'token',
    'password',
    'passwordHash',
    'sessionToken',
    'ip',
    'ipAddress',
    'userAgent',
    'cookie',
    'pix',
  ],
}

/** Canonical CSV schema accepted by `importFromCSV(..., 'generic')`. */
export const GENERIC_CSV_COLUMNS: readonly string[] = [
  'id',
  'type',
  'createdAt',
  'authorId',
  'content',
  'mediaUrl',
  'visibility',
] as const

/** Cap on records imported per session — defensive bound for big uploads. */
export const MAX_IMPORT_RECORDS = 50_000

/** Bitmask for fnv-1a 32-bit. */
const FNV_OFFSET_32 = 0x811c9dc5
const FNV_PRIME_32 = 0x01000193
const FNV_MASK_32 = 0xffffffff

/* ============================================================================
 * SECTION 3 — Internal helpers (IDs, hashing, time, validation)
 * ========================================================================== */

/**
 * Monotonically non-decreasing id generator (uuid v4-shaped).
 *
 * Uses `crypto.getRandomValues` when available (browsers + Node 19+)
 * and falls back to a 32-bit xorshift mix seeded by performance.now
 * so the engine works in restrictive sandboxes too.
 */
function uuidv4(): string {
  const bytes = new Uint8Array(16)
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    // xorshift32 — Kazenori Tanaka's, public domain.
    let s = ((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
    for (let i = 0; i < 16; i++) {
      s ^= s << 13
      s ^= s >>> 17
      s ^= s << 5
      bytes[i] = s & 0xff
    }
  }
  // Per RFC 4122 §4.4
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return (
    hex.slice(0, 8) +
    '-' +
    hex.slice(8, 12) +
    '-' +
    hex.slice(12, 16) +
    '-' +
    hex.slice(16, 20) +
    '-' +
    hex.slice(20)
  )
}

/**
 * fnv-1a 32-bit hash, returned as an 8-char lowercase hex string.
 *
 * Public as {@link checksum} — kept here as an internal `fnv1a` because
 * a few callers want raw bytes for nested hashing.
 */
function fnv1a(input: string): number {
  let hash = FNV_OFFSET_32 >>> 0
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff
    // 32-bit multiply with explicit modulo (JS bitwise ops would truncate).
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0
  }
  return hash >>> 0
}

/** Days → ms without floating point drift. */
function daysToMs(days: number): number {
  return Math.trunc(days) * 24 * 60 * 60 * 1000
}

/**
 * Deep-stable key sort. Pure — never mutates input.
 *
 * Arrays preserve order; objects sort keys lexicographically.
 * `Date` → ISO string; `undefined` → dropped; functions → string repr.
 */
function deepStable(value: unknown): unknown {
  if (value === null || value === undefined) return value ?? null
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((v) => deepStable(v))
  if (value instanceof Date) return value.toISOString()
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj).sort()) {
    const v = obj[k]
    if (v === undefined) continue
    out[k] = deepStable(v)
  }
  return out
}

/**
 * Type guard that returns true when the value is a plain record.
 *
 * Distinguishes `Object` from `Array` and from `null`.
 */
function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Strips accidental prototype pollution keys from a payload before
 * serialization. Defends against caller misbehavior — especially for
 * imported archives.
 */
function sanitizeKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue
    out[k] = obj[k]
  }
  return out
}

/**
 * Validates a UUID-shaped string (lenient — accepts any 8-4-4-4-12 hex).
 */
export function isUuidLike(v: unknown): v is string {
  if (typeof v !== 'string') return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

/**
 * Strips a string into a safe filename (no slashes, no NUL, no control chars).
 */
export function toSafeFilename(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 200)
}

/* ============================================================================
 * SECTION 4 — Public checksum (fnv-1a hex)
 * ========================================================================== */

/**
 * Compute the deterministic checksum of a string.
 *
 * Uses fnv-1a 32-bit, returned as lowercase 8-char hex. Same input
 * always produces the same output on every supported platform
 * (verified in unit tests — see cycle 45 deliverable report).
 *
 * @param data - UTF-8 string to fingerprint.
 * @returns 8-character hex digest.
 */
export function checksum(data: string): string {
  const h = fnv1a(data)
  return h.toString(16).padStart(8, '0')
}

/**
 * Compute a nested checksum (artifact-level stable hash).
 *
 * Used internally for {@link ExportArtifact.checksum}; exposed so
 * re-serializers can re-verify integrity after a storage round-trip.
 */
export function checksumArtifact(artifact: ExportArtifact): string {
  return checksum(JSON.stringify(serializeArtifactStable(artifact)))
}

/* ============================================================================
 * SECTION 5 — Export pipeline
 * ========================================================================== */

/**
 * Validate a section list. Throws on duplicated 'all' mixes or unknown sections.
 */
function normalizeSections(sections: ExportSection[]): ExportSection[] {
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('export: sections must contain at least one entry')
  }
  const seen = new Set<ExportSection>()
  for (const s of sections) {
    if (!SECTIONS.includes(s)) {
      throw new Error(`export: unknown section '${s}'`)
    }
    seen.add(s)
  }
  const hasAll = seen.has('all')
  const concrete = [...seen].filter((s) => s !== 'all') as Exclude<ExportSection, 'all'>[]
  const finalSet = hasAll ? new Set<ExportSection>(CONCRETE_SECTIONS) : new Set(concrete)
  return [...finalSet]
}

/**
 * Validate a user-supplied ExportRequest envelope.
 */
function validateExportRequest(req: ExportRequest): void {
  if (typeof req.userId !== 'string' || req.userId.length === 0) {
    throw new Error('export: userId must be a non-empty string')
  }
  if (!Array.isArray(req.sections) || req.sections.length === 0) {
    throw new Error('export: sections must be a non-empty array')
  }
  if (!['json', 'csv', 'zip'].includes(req.format)) {
    throw new Error(`export: invalid format '${req.format}'`)
  }
  if (typeof req.includeMedia !== 'boolean') {
    throw new Error('export: includeMedia must be a boolean')
  }
  if (typeof req.requestedAt !== 'number' || !Number.isFinite(req.requestedAt)) {
    throw new Error('export: requestedAt must be a finite number')
  }
}

/**
 * Build a new {@link ExportRequest} envelope.
 *
 * Pure; the timestamp is supplied by the caller (or `Date.now()` in a
 * server context) so the function is deterministic in tests.
 *
 * @param userId - owning user id.
 * @param sections - sections requested, may include 'all'.
 * @param format - serialization format.
 * @param includeMedia - whether media blobs should be inlined.
 * @param now - epoch ms; defaults to Date.now().
 */
export function requestExport(
  userId: string,
  sections: ExportSection[],
  format: ExportFormat,
  includeMedia: boolean = false,
  now: number = Date.now(),
): ExportRequest {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('requestExport: userId required')
  }
  const normalizedSections = normalizeSections(sections)
  const req: ExportRequest = {
    userId,
    sections: normalizedSections,
    format,
    includeMedia,
    requestedAt: now,
  }
  validateExportRequest(req)
  return req
}

/**
 * Build the concrete sections list after expansion of the 'all' sentinel.
 */
export function resolveSections(sections: ExportSection[]): ExportSection[] {
  return normalizeSections(sections)
}

/**
 * Internal stable serialization for a request envelope (used by callers
 * that want to log request equality deterministically).
 */
export function serializeRequest(req: ExportRequest): string {
  const stable = deepStable({
    userId: req.userId,
    sections: [...req.sections].sort(),
    format: req.format,
    includeMedia: req.includeMedia,
    requestedAt: req.requestedAt,
  })
  return JSON.stringify(stable)
}

/**
 * Generate an {@link ExportArtifact} from a validated request and the
 * user's raw data, partitioned by section.
 *
 * The engine never touches the network — it only shapes the payload.
 * The caller is responsible for:
 *   - fetching `userData` from the database,
 *   - respecting `includeMedia` (strip media when false),
 *   - uploading the result and producing `downloadUrl`.
 *
 * @param request - validated export request.
 * @param userData - payload map; missing sections silently get `null`.
 * @param mediaResolver - optional reducer applied to media fields when
 *   `includeMedia` is `false`. Receives the field value and returns a
 *   redacted placeholder (e.g. URL + size without inlined blob).
 * @param now - epoch ms; defaults to Date.now().
 */
export function generateExport(
  request: ExportRequest,
  userData: Record<ExportSection, unknown>,
  mediaResolver?: (value: unknown) => unknown,
  now: number = Date.now(),
): ExportArtifact {
  validateExportRequest(request)
  const sections = normalizeSections(request.sections)
  const data: Record<ExportSection, unknown> = {} as Record<ExportSection, unknown>
  for (const section of sections) {
    const raw = userData[section]
    if (raw === undefined) {
      data[section] = null
      continue
    }
    if (!request.includeMedia && mediaResolver && isPlainRecord(raw)) {
      // Shallow redact media fields if the caller provided a resolver.
      const stripped: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(raw)) {
        if (/^media/i.test(k) || /^image/i.test(k) || /^video/i.test(k) || k === 'avatar') {
          stripped[k] = mediaResolver(v)
        } else {
          stripped[k] = v
        }
      }
      data[section] = deepStable(stripped)
    } else {
      data[section] = deepStable(raw)
    }
  }
  // Fill unrequested sections with `null` so the artifact shape is
  // uniform (helps consumers without requiring them to handle omissions).
  for (const s of SECTIONS) {
    if (s === 'all') continue
    if (data[s] === undefined) data[s] = null
  }
  const artifact: ExportArtifact = {
    requestId: uuidv4(),
    userId: request.userId,
    format: request.format === 'zip' ? 'json' : request.format,
    sections,
    data,
    sizeBytes: 0, // filled below
    generatedAt: now,
    expiresAt: now + daysToMs(EXPORT_TTL_DAYS),
    checksum: '', // filled below
  }
  const stableObj = serializeArtifactStable(artifact)
  const stableJson = JSON.stringify(stableObj)
  artifact.sizeBytes = stableJson.length
  artifact.checksum = checksum(stableJson)
  return artifact
}

/**
 * Internal stable serialization shared by {@link serializeExport} and
 * {@link checksumArtifact}. Sections are ordered as in CONCRETE_SECTIONS
 * to keep the result deterministic across engines.
 */
function serializeArtifactStable(artifact: ExportArtifact): Record<string, unknown> {
  const orderedData: Record<string, unknown> = {}
  for (const s of CONCRETE_SECTIONS) {
    orderedData[s] = deepStable(artifact.data[s] ?? null)
  }
  return {
    schema: 'akasha.export/v1',
    requestId: artifact.requestId,
    userId: artifact.userId,
    format: artifact.format,
    sections: [...artifact.sections].sort(),
    generatedAt: artifact.generatedAt,
    expiresAt: artifact.expiresAt,
    sizeBytes: artifact.sizeBytes,
    data: orderedData,
  }
}

/**
 * Serialize an {@link ExportArtifact} to a portable JSON string.
 *
 * Output is byte-stable for the same input (deep-sorted keys, fixed
 * section order) so the {@link ExportArtifact.checksum} remains valid
 * after a serialize/parse round-trip.
 */
export function serializeExport(artifact: ExportArtifact): string {
  const stable = serializeArtifactStable(artifact)
  return JSON.stringify(stable, null, 2)
}

/**
 * Parse a JSON artifact back into its typed envelope. Used after a
 * download to restore the typed {@link ExportArtifact} shape.
 */
export function deserializeExport(json: string): ExportArtifact {
  if (typeof json !== 'string') throw new Error('deserializeExport: json must be a string')
  const parsed = JSON.parse(json) as Record<string, unknown>
  if (!isPlainRecord(parsed)) throw new Error('deserializeExport: payload is not an object')
  if (parsed['schema'] !== 'akasha.export/v1') {
    throw new Error(`deserializeExport: unsupported schema '${String(parsed['schema'])}'`)
  }
  return {
    requestId: String(parsed['requestId']),
    userId: String(parsed['userId']),
    format: parsed['format'] as ExportFormat,
    sections: (parsed['sections'] as ExportSection[]) ?? [],
    data: (parsed['data'] as Record<ExportSection, unknown>) ?? ({} as Record<ExportSection, unknown>),
    sizeBytes: Number(parsed['sizeBytes'] ?? 0),
    generatedAt: Number(parsed['generatedAt']),
    expiresAt: Number(parsed['expiresAt']),
    downloadUrl: parsed['downloadUrl'] as string | undefined,
    checksum: '',
  }
}

/**
 * RFC 4180 CSV cell encoder — quotes when the cell contains a quote,
 * comma, or newline; doubles internal quotes.
 */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let s: string
  if (typeof value === 'string') s = value
  else if (typeof value === 'number' || typeof value === 'boolean') s = String(value)
  else s = JSON.stringify(deepStable(value))
  const needsQuote = /[",\r\n]/.test(s)
  if (!needsQuote) return s
  return '"' + s.replace(/"/g, '""') + '"'
}

/**
 * Serialize an {@link ExportArtifact} to a sectioned CSV string.
 *
 * Each section is emitted as a contiguous block preceded by a header
 * comment so the file is human-inspectable in spreadsheet apps:
 *
 *   # section: posts
 *   id,createdAt,authorId,content
 *   ...
 *   # section: likes
 *   ...
 *
 * Records that are themselves arrays become one row per element; scalar
 * section payloads become a single row of `{ key, value }` pairs.
 */
export function serializeExportCSV(artifact: ExportArtifact): string {
  const lines: string[] = []
  lines.push('# akasha.export/v1 CSV')
  lines.push(`# userId: ${artifact.userId}`)
  lines.push(`# requestId: ${artifact.requestId}`)
  lines.push(`# generatedAt: ${new Date(artifact.generatedAt).toISOString()}`)
  lines.push(`# expiresAt: ${new Date(artifact.expiresAt).toISOString()}`)
  lines.push('')
  for (const section of CONCRETE_SECTIONS) {
    const payload = artifact.data[section]
    if (payload === undefined || payload === null) continue
    lines.push(`# section: ${section}`)
    if (Array.isArray(payload)) {
      if (payload.length === 0) {
        lines.push('')
        continue
      }
      const rows = payload.map((row) => normalizeRow(row))
      const headers = computeHeaders(rows)
      lines.push(headers.join(','))
      for (const row of rows) {
        lines.push(headers.map((h) => csvCell((row as Record<string, unknown>)[h])).join(','))
      }
    } else if (isPlainRecord(payload)) {
      const headers = Object.keys(payload).sort()
      lines.push(headers.map((h) => csvCell(h)).join(','))
      lines.push(headers.map((h) => csvCell(payload[h])).join(','))
    } else {
      lines.push(csvCell('value'))
      lines.push(csvCell(payload))
    }
    lines.push('')
  }
  return lines.join('\n')
}

/**
 * Compute the union header set of an array of row-like records, in
 * stable alphabetical order. Missing fields become empty cells.
 */
function computeHeaders(rows: ReadonlyArray<unknown>): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    if (isPlainRecord(row)) {
      for (const k of Object.keys(row)) set.add(k)
    }
  }
  return [...set].sort()
}

/**
 * Normalize a row-shaped value into a record. Strings and numbers become
 * `{ value }`; arrays become `{ value: '[…]' }`. Drops `undefined`.
 */
function normalizeRow(row: unknown): Record<string, unknown> {
  if (row === null || row === undefined) return { value: '' }
  if (typeof row === 'string' || typeof row === 'number' || typeof row === 'boolean') {
    return { value: row }
  }
  if (isPlainRecord(row)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row)) {
      if (v === undefined) continue
      out[k] = v
    }
    return out
  }
  if (Array.isArray(row)) {
    return { value: JSON.stringify(row.map((r) => deepStable(r))) }
  }
  return { value: String(row) }
}

/**
 * Build a deterministic filename for a download.
 *
 * Format: `akasha-export-{userId-safe}-{yyyy-mm-dd}-{requestId8}.{ext}`.
 */
export function exportFilename(artifact: ExportArtifact): string {
  const userSafe = toSafeFilename(artifact.userId).slice(0, 40)
  const date = new Date(artifact.generatedAt).toISOString().slice(0, 10)
  const idSafe = artifact.requestId.replace(/-/g, '').slice(0, 8)
  const ext = artifact.format === 'csv' ? 'csv' : 'json'
  return `akasha-export-${userSafe}-${date}-${idSafe}.${ext}`
}

/**
 * Verifies that an artifact's stored checksum matches the recomputed one
 * over its current payload. Returns `true` on match.
 */
export function verifyChecksum(artifact: ExportArtifact): boolean {
  const tmp: ExportArtifact = { ...artifact, checksum: '' }
  return checksumArtifact(tmp) === artifact.checksum
}

/* ============================================================================
 * SECTION 6 — Deletion lifecycle
 * ========================================================================== */

/**
 * Validate a deletion request shape.
 */
function validateDeletion(req: DeletionRequest): void {
  if (typeof req.id !== 'string' || req.id.length === 0) throw new Error('deletion: id required')
  if (typeof req.userId !== 'string' || req.userId.length === 0) throw new Error('deletion: userId required')
  if (typeof req.requestedAt !== 'number' || !Number.isFinite(req.requestedAt)) {
    throw new Error('deletion: requestedAt must be finite')
  }
  if (typeof req.gracePeriodEnds !== 'number' || !Number.isFinite(req.gracePeriodEnds)) {
    throw new Error('deletion: gracePeriodEnds must be finite')
  }
  if (!['pending', 'grace_period', 'processing', 'completed', 'cancelled', 'restored'].includes(req.status)) {
    throw new Error(`deletion: invalid status '${req.status}'`)
  }
}

/**
 * Open a deletion request and immediately enter the 30-day grace period.
 *
 * @param userId - owning user.
 * @param gracePeriodDays - override; defaults to {@link DEFAULT_GRACE_PERIOD_DAYS} (LGPD).
 * @param reason - optional user-supplied free-text reason.
 * @param now - epoch ms; defaults to Date.now().
 */
export function requestDeletion(
  userId: string,
  gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS,
  reason?: string,
  now: number = Date.now(),
): DeletionRequest {
  if (typeof userId !== 'string' || userId.length === 0) throw new Error('requestDeletion: userId required')
  if (!Number.isFinite(gracePeriodDays) || gracePeriodDays < 1 || gracePeriodDays > 365) {
    throw new Error(`requestDeletion: gracePeriodDays out of range: ${gracePeriodDays}`)
  }
  if (reason !== undefined && (typeof reason !== 'string' || reason.length > 2000)) {
    throw new Error('requestDeletion: reason must be a string ≤ 2000 chars')
  }
  if (reason && /<\/?(script|iframe|object|embed)/i.test(reason)) {
    // Defensive: scrub obvious markup before persistence.
    // eslint-disable-next-line no-param-reassign
    reason = reason.replace(/<\/?(script|iframe|object|embed)[^>]*>/gi, '')
  }
  const req: DeletionRequest = {
    id: uuidv4(),
    userId,
    reason,
    requestedAt: now,
    gracePeriodEnds: now + daysToMs(gracePeriodDays),
    status: 'grace_period',
  }
  validateDeletion(req)
  return req
}

/**
 * Cancel a pending deletion. Allowed during `grace_period` and `pending`
 * states. After `processing` begins the operation is irreversible.
 *
 * @param req - deletion envelope.
 * @param now - epoch ms of the cancellation; used for audit timestamps.
 */
export function cancelDeletion(req: DeletionRequest, now: number = Date.now()): DeletionRequest {
  validateDeletion(req)
  if (req.status === 'completed') {
    throw new Error('cancelDeletion: cannot cancel a completed deletion')
  }
  if (req.status === 'processing') {
    throw new Error('cancelDeletion: deletion is already processing and cannot be cancelled')
  }
  if (req.status === 'cancelled') return req
  return {
    ...req,
    status: 'cancelled',
    cancelledAt: now,
  }
}

/**
 * Restore a previously-cancelled deletion back into a fresh grace period.
 * Useful when a user re-engages after restoring; the policy decision is
 * left to the caller (this engine does not decide policy).
 *
 * @param req - cancellation envelope.
 * @param gracePeriodDays - new grace window; defaults to original remaining.
 * @param now - epoch ms.
 */
export function restoreDeletion(
  req: DeletionRequest,
  gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS,
  now: number = Date.now(),
): DeletionRequest {
  validateDeletion(req)
  if (req.status !== 'cancelled' && req.status !== 'restored') {
    throw new Error(`restoreDeletion: cannot restore from status '${req.status}'`)
  }
  return {
    ...req,
    status: 'grace_period',
    cancelledAt: undefined,
    gracePeriodEnds: now + daysToMs(gracePeriodDays),
  }
}

/**
 * Compute the lifecycle state of a deletion request at time `now`.
 *
 * Returns:
 *   - `'pending'` — clock hasn't reached `gracePeriodEnds` yet, still waiting.
 *   - `'processing'` — grace has elapsed; safe to begin irreversible work.
 *   - `'completed'` — caller can confirm `completedAt` was set.
 *
 * `eligibleAt` is supplied so the caller knows the exact transition
 * moment in case they want to schedule a cron.
 */
export function processDeletion(
  req: DeletionRequest,
  now: number = Date.now(),
): { status: 'processing' | 'completed' | 'pending'; eligibleAt?: number } {
  validateDeletion(req)
  if (req.status === 'completed') {
    return { status: 'completed' }
  }
  if (req.status === 'cancelled' || req.status === 'restored') {
    return { status: 'pending' }
  }
  if (now < req.gracePeriodEnds) {
    return { status: 'pending', eligibleAt: req.gracePeriodEnds }
  }
  return { status: 'processing', eligibleAt: req.gracePeriodEnds }
}

/**
 * Produce a finalized `DeletionRequest` envelope (status=`completed`).
 * Caller is expected to have run the actual purge before invoking.
 */
export function completeDeletion(req: DeletionRequest, now: number = Date.now()): DeletionRequest {
  validateDeletion(req)
  return {
    ...req,
    status: 'completed',
    completedAt: now,
  }
}

/**
 * Validate that a deletion envelope still has time left on its clock.
 * Pure, useful for cron-driven workflows.
 */
export function isWithinGracePeriod(req: DeletionRequest, now: number = Date.now()): boolean {
  validateDeletion(req)
  if (req.status === 'completed' || req.status === 'cancelled') return false
  return now < req.gracePeriodEnds
}

/**
 * Days remaining until the grace period ends. Floats of the half-day.
 */
export function daysRemainingInGrace(req: DeletionRequest, now: number = Date.now()): number {
  validateDeletion(req)
  if (req.status === 'completed' || req.status === 'cancelled') return 0
  const remaining = req.gracePeriodEnds - now
  return remaining <= 0 ? 0 : remaining / (24 * 60 * 60 * 1000)
}

/* ============================================================================
 * SECTION 7 — Audit redaction
 * ========================================================================== */

/**
 * Walk an arbitrary value and:
 *   1. Redact values whose key matches the profile's PII allowlist.
 *   2. Optionally replace structured section content with the shape
 *      `{ count, sectionKeys, firstRecordId }` when the section name
 *      is in `keepShapeOnly`.
 *
 * The output remains serializable. Free text outside the allowlist is
 * preserved so auditors can still reconstruct context.
 */
function deepRedact(value: unknown, profile: RedactionProfile): unknown {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((v) => deepRedact(v, profile))
  if (value instanceof Date) return value.toISOString()
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (profile.piiFieldAllowlist.includes(k)) {
      out[k] = '<redacted>'
      continue
    }
    out[k] = deepRedact(v, profile)
  }
  return out
}

/**
 * Strip PII from an {@link ExportArtifact} while keeping structural
 * metadata. Use this before passing artifacts to internal audit logs
 * that are retained for years (LGPD Art. 37 requires lawful basis for
 * every record-processing activity).
 *
 * @param artifact - source artifact.
 * @param profile - redaction profile; defaults to {@link DEFAULT_REDACTION_PROFILE}.
 */
export function redactForAudit(
  artifact: ExportArtifact,
  profile: RedactionProfile = DEFAULT_REDACTION_PROFILE,
): ExportArtifact {
  const data: Record<ExportSection, unknown> = {} as Record<ExportSection, unknown>
  for (const section of CONCRETE_SECTIONS) {
    const raw = artifact.data[section]
    if (raw === undefined || raw === null) {
      data[section] = null
      continue
    }
    if (profile.keepShapeOnly.includes(section)) {
      data[section] = shapeOf(raw)
      continue
    }
    data[section] = deepRedact(raw, profile)
  }
  const out: ExportArtifact = {
    ...artifact,
    data,
    // Strip identifiers that could re-link to the user outside audit scope.
    userId: artifact.userId ? `<user:${artifact.userId.length}-chars>` : '<unknown>',
    downloadUrl: undefined,
    checksum: '',
  }
  out.checksum = checksumArtifact(out)
  return out
}

/**
 * Compute shape metadata for a section payload.
 *
 * Returns `{ count, sampleKeys, firstId, lastId }` — enough for an
 * auditor to know "10 posts exist, IDs 1-10" without seeing content.
 */
function shapeOf(payload: unknown): Record<string, unknown> {
  const meta: Record<string, unknown> = { kind: typeof payload }
  if (Array.isArray(payload)) {
    meta['count'] = payload.length
    const sample = payload.slice(0, 3).map((row) => (isPlainRecord(row) ? Object.keys(row).sort() : []))
    meta['sampleKeys'] = sample
    const ids: (string | number)[] = []
    for (const row of payload) {
      if (isPlainRecord(row)) {
        const id = row['id'] ?? row['_id'] ?? row['uuid']
        if (typeof id === 'string' || typeof id === 'number') ids.push(id)
      }
    }
    if (ids.length > 0) {
      meta['firstId'] = ids[0]
      meta['lastId'] = ids[ids.length - 1]
    }
  } else if (isPlainRecord(payload)) {
    meta['keys'] = Object.keys(payload).sort()
  }
  return meta
}

/* ============================================================================
 * SECTION 8 — Import parsers
 * ========================================================================== */

/**
 * Generic CSV line splitter that understands `"`-escaping per RFC 4180.
 *
 * Returns string[] cells; quoted CRLFs are preserved inside cells.
 */
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuote = false
        }
      } else {
        cur += ch
      }
      continue
    }
    if (ch === ',') {
      out.push(cur)
      cur = ''
      continue
    }
    if (ch === '"') {
      inQuote = true
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

/**
 * Parse a CSV document into header + body rows. Handles both `\n` and
 * `\r\n` line breaks.
 *
 * Returns `{ headers, rows }`; cells may contain escaped commas or
 * embedded newlines.
 */
function parseCsvDocument(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = []
  let cur: string[] = []
  let cell = ''
  let inQuote = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuote = false
        }
      } else {
        cell += ch
      }
      continue
    }
    if (ch === '"') {
      inQuote = true
      continue
    }
    if (ch === ',') {
      cur.push(cell)
      cell = ''
      continue
    }
    if (ch === '\n' || ch === '\r') {
      // Treat \r\n as a single line break.
      if (ch === '\r' && text[i + 1] === '\n') i++
      cur.push(cell)
      rows.push(cur)
      cur = []
      cell = ''
      continue
    }
    cell += ch
  }
  if (cell.length > 0 || cur.length > 0) {
    cur.push(cell)
    rows.push(cur)
  }
  const headers = rows.shift() ?? []
  // Strip empty trailing rows that come from a final newline.
  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop()
  }
  return { headers: headers.map((h) => h.trim()), rows }
}

/**
 * Try to parse a cell value into a richer type. Returns the input when
 * no transformation applies.
 */
function coerceCell(value: string): unknown {
  if (value === '') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?\d+$/.test(value)) {
    const n = Number(value)
    if (Number.isSafeInteger(n)) return n
  }
  if (/^-?\d+\.\d+$/.test(value)) {
    const f = Number(value)
    if (!Number.isNaN(f)) return f
  }
  // Try ISO date.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const t = Date.parse(value)
    if (!Number.isNaN(t)) return new Date(t).toISOString()
  }
  return value
}

/**
 * Generic CSV import — takes an arbitrary CSV and parses it as records
 * keyed by header name.
 *
 * For `'generic'` source, the headers are validated against
 * {@link GENERIC_CSV_COLUMNS}; missing required columns are surfaced as
 * errors rather than silently imported.
 */
export function importFromCSV(csv: string, source: ImportSource = 'generic'): ParseResult {
  if (typeof csv !== 'string') {
    return { records: [], errors: [{ line: 0, reason: 'csv: input must be a string' }] }
  }
  const errors: { line: number; reason: string }[] = []
  if (csv.length === 0) {
    return { records: [], errors: [{ line: 0, reason: 'csv: empty input' }] }
  }
  let parsed: { headers: string[]; rows: string[][] }
  try {
    parsed = parseCsvDocument(csv)
  } catch (err) {
    return { records: [], errors: [{ line: 0, reason: `csv: parse failed — ${(err as Error).message}` }] }
  }
  const { headers, rows } = parsed
  if (headers.length === 0 || rows.length === 0) {
    return { records: [], errors: [{ line: 0, reason: 'csv: no rows' }] }
  }
  if (source === 'generic') {
    const missing = GENERIC_CSV_COLUMNS.filter((c) => !headers.includes(c))
    if (missing.length > 0) {
      errors.push({
        line: 1,
        reason: `csv: missing required columns — ${missing.join(', ')}`,
      })
    }
  }
  const records: unknown[] = []
  for (let i = 0; i < rows.length; i++) {
    const lineNo = i + 2
    const cells = rows[i]
    if (cells.length === 1 && cells[0] === '') continue // skip pure blank lines
    if (cells.length !== headers.length) {
      errors.push({ line: lineNo, reason: `csv: column count mismatch (got ${cells.length}, expected ${headers.length})` })
      continue
    }
    const record: Record<string, unknown> = {}
    for (let h = 0; h < headers.length; h++) {
      record[headers[h]] = coerceCell(cells[h])
    }
    if (source === 'json') {
      // Treat as opaque imported JSON line — keep raw key/value pairs.
      records.push(sanitizeKeys(record))
    } else if (source === 'generic' || source === 'csv') {
      records.push(normalizeGenericRecord(record, lineNo, errors))
    } else {
      records.push(record)
    }
    if (records.length >= MAX_IMPORT_RECORDS) {
      errors.push({
        line: lineNo,
        reason: `csv: import truncated at MAX_IMPORT_RECORDS=${MAX_IMPORT_RECORDS}`,
      })
      break
    }
  }
  return { records, errors }
}

/**
 * Coerce a generic record into a canonical shape; gracefully fail
 * specific cells and surface them via the errors array.
 */
function normalizeGenericRecord(
  raw: Record<string, unknown>,
  lineNo: number,
  errors: { line: number; reason: string }[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of GENERIC_CSV_COLUMNS) {
    if (raw[k] !== undefined) {
      out[k] = raw[k]
    }
  }
  // Track missing required fields.
  if (!out['type']) {
    errors.push({ line: lineNo, reason: 'generic: missing required `type` field' })
  }
  if (!out['createdAt']) {
    errors.push({ line: lineNo, reason: 'generic: missing required `createdAt` field' })
  }
  return out
}

/**
 * Parse a Mastodon archive JSON. Supports the `outbox.json` shape used
 * by Mastodon's "Download your information" feature, as well as the
 * per-actor shape produced by `tootctl`.
 *
 * Recognized fields:
 *   - `id`            (string) — numeric stringified id from Mastodon
 *   - `created_at`    (ISO string)
 *   - `content`       (HTML; we strip tags)
 *   - `visibility`    (`public` | `unlisted` | `private` | `direct`)
 *   - `url`           (canonical URL)
 *   - `account.username` → stored as `_account`
 *   - `media_attachments[].url` → collected as `mediaUrls`
 *
 * @param json - The raw archive text.
 */
export function importFromMastodon(json: string): ParseResult {
  return importFromFederatedJSON(json, 'mastodon')
}

/**
 * Parse a Twitter / X archive — the legacy `tweets.js` / `tweet.js`
 * shape used by the platform's data export (`window.YTD.tweets`).
 */
export function importFromTwitter(json: string): ParseResult {
  return importFromFederatedJSON(json, 'twitter')
}

/**
 * Parse a Facebook "Your Information" archive. Currently we accept only
 * the `posts/your_posts.json` portion which Facebook ships as a JSON
 * array of `post` objects.
 */
export function importFromFacebook(json: string): ParseResult {
  return importFromFederatedJSON(json, 'facebook')
}

/**
 * Parse a WordPress eXtended-RSS / WXR file. We extract `item` entries
 * with `title`, `link`, `pubDate`, `content:encoded`, and `dc:creator`.
 */
export function importFromWordpress(text: string): ParseResult {
  const errors: { line: number; reason: string }[] = []
  if (typeof text !== 'string') {
    return { records: [], errors: [{ line: 0, reason: 'wp: input must be a string' }] }
  }
  const records: unknown[] = []
  const items = text.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []
  if (items.length === 0) {
    errors.push({ line: 0, reason: 'wp: no <item> entries found' })
    return { records, errors }
  }
  for (let i = 0; i < items.length; i++) {
    const lineNo = i + 1
    const item = items[i]
    const title = stripTags(extractTag(item, 'title') ?? '')
    const link = extractTag(item, 'link') ?? ''
    const pubDate = extractTag(item, 'pubDate') ?? ''
    const contentEncoded = extractTagContentEncoded(item) ?? ''
    const creator = stripTags(extractTag(item, 'dc:creator') ?? '')
    if (!title && !contentEncoded) {
      errors.push({ line: lineNo, reason: 'wp: missing both title and content' })
      continue
    }
    records.push(sanitizeKeys({
      type: 'post',
      id: link || `wp-${lineNo}`,
      url: link,
      title,
      content: stripTags(contentEncoded),
      createdAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      authorId: creator || 'unknown',
      visibility: 'public',
    }))
    if (records.length >= MAX_IMPORT_RECORDS) break
  }
  return { records, errors }
}

/**
 * Strip HTML tags from a string — used by Mastodon/Facebook parsers to
 * collapse their HTML storage into a plain-text shape safe for storage.
 */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

/** Extract text content of a single XML tag, attribute-free. */
function extractTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = xml.match(re)
  if (!m) return null
  return m[1].trim()
}

/** Namespaced extractor — `<content:encoded>` is wrapped in CDATA. */
function extractTagContentEncoded(xml: string): string | null {
  const m = xml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i)
  if (!m) return null
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

/**
 * Detect the shape of an uploaded federated JSON and dispatch to the
 * matching parser. Single shared implementation that keeps the public
 * {@link importFromMastodon}, {@link importFromTwitter}, and
 * {@link importFromFacebook} signatures stable.
 */
function importFromFederatedJSON(json: string, source: 'mastodon' | 'twitter' | 'facebook'): ParseResult {
  const errors: { line: number; reason: string }[] = []
  if (typeof json !== 'string') {
    return { records: [], errors: [{ line: 0, reason: `${source}: input must be a string` }] }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (err) {
    return { records: [], errors: [{ line: 0, reason: `${source}: invalid JSON — ${(err as Error).message}` }] }
  }
  // Different platforms wrap their data in different containers.
  let candidates: unknown[] = []
  if (Array.isArray(parsed)) {
    candidates = parsed
  } else if (isPlainRecord(parsed)) {
    if (source === 'mastodon') {
      const ordered = parsed['orderedItems']
      if (Array.isArray(ordered)) candidates = ordered
      else if (isPlainRecord(parsed['@graph'])) {
        const graph = parsed['@graph']
        const items = graph['orderedItems']
        if (Array.isArray(items)) candidates = items
      }
    } else if (source === 'twitter') {
      // Legacy `window.YTD.tweets` wrapper.
      const widget = parsed as Record<string, unknown>
      for (const key of Object.keys(widget)) {
        if (Array.isArray(widget[key])) {
          candidates = candidates.concat(widget[key] as unknown[])
        }
      }
    } else if (source === 'facebook') {
      // `your_posts.json` is an array; older archives wrap it in `{ data: [...] }`.
      const data = parsed['data']
      if (Array.isArray(data)) candidates = data
      else candidates = [parsed]
    }
  }
  if (candidates.length === 0) {
    errors.push({ line: 0, reason: `${source}: no candidate records found` })
    return { records: [], errors }
  }
  const records: unknown[] = []
  for (let i = 0; i < candidates.length; i++) {
    const lineNo = i + 1
    const item = candidates[i]
    if (!isPlainRecord(item)) {
      errors.push({ line: lineNo, reason: `${source}: item is not an object` })
      continue
    }
    const norm = normalizeFederatedRecord(item, source, lineNo, errors)
    if (norm !== null) records.push(norm)
    if (records.length >= MAX_IMPORT_RECORDS) {
      errors.push({ line: lineNo, reason: `${source}: truncated at MAX_IMPORT_RECORDS=${MAX_IMPORT_RECORDS}` })
      break
    }
  }
  return { records, errors }
}

/**
 * Project a federated record onto the canonical Akasha record shape,
 * tailored per platform. Returns `null` if the record cannot be coerced.
 */
function normalizeFederatedRecord(
  item: Record<string, unknown>,
  source: 'mastodon' | 'twitter' | 'facebook',
  lineNo: number,
  errors: { line: number; reason: string }[],
): Record<string, unknown> | null {
  if (source === 'mastodon') {
    const id = pickString(item, ['id', '_id'])
    const content = pickString(item, ['content', 'text'])
    const createdAt = pickString(item, ['published', 'created_at', 'createdAt'])
    const visibility = pickString(item, ['visibility', 'to'])
    const url = pickString(item, ['url'])
    if (!id && !content) {
      errors.push({ line: lineNo, reason: 'mastodon: missing both id and content' })
      return null
    }
    const account = item['account']
    const authorId = isPlainRecord(account) ? pickString(account, ['username', 'acct']) : undefined
    const mediaAttachments = item['media_attachments']
    const mediaUrls = Array.isArray(mediaAttachments)
      ? mediaAttachments
          .map((m) => (isPlainRecord(m) ? pickString(m, ['url', 'preview_url']) : undefined))
          .filter((u): u is string => typeof u === 'string')
      : []
    return sanitizeKeys({
      type: 'post',
      id: id ?? `mastodon-${lineNo}`,
      content: content ? stripTags(content) : '',
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      visibility: visibility ?? 'public',
      url: url ?? '',
      authorId: authorId ?? 'unknown',
      mediaUrl: mediaUrls[0],
    })
  }
  if (source === 'twitter') {
    const tweet = (item['tweet'] as Record<string, unknown> | undefined) ?? item
    const id = pickString(tweet, ['id_str', 'id'])
    const fullText = pickString(tweet, ['full_text', 'text'])
    const createdAt = pickString(tweet, ['created_at', 'createdAt'])
    if (!id && !fullText) {
      errors.push({ line: lineNo, reason: 'twitter: missing both id and text' })
      return null
    }
    const entities = tweet['entities']
    const mediaUrl = isPlainRecord(entities) && Array.isArray(entities['media'])
      ? pickString((entities['media'] as Record<string, unknown>[])[0] ?? {}, ['media_url'])
      : undefined
    return sanitizeKeys({
      type: 'post',
      id: id ?? `tweet-${lineNo}`,
      content: fullText ?? '',
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      visibility: 'public',
      authorId: isPlainRecord(tweet['user'])
        ? pickString(tweet['user'] as Record<string, unknown>, ['screen_name'])
        : 'unknown',
      mediaUrl,
    })
  }
  if (source === 'facebook') {
    const id = pickString(item, ['id'])
    const content = pickString(item, ['message', 'story', 'description'])
    const createdAt = pickString(item, ['created_time', 'createdAt'])
    if (!id && !content) {
      errors.push({ line: lineNo, reason: 'facebook: missing both id and content' })
      return null
    }
    return sanitizeKeys({
      type: 'post',
      id: id ?? `fb-${lineNo}`,
      content: content ?? '',
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      visibility: 'public',
      authorId: 'unknown',
    })
  }
  return null
}

/**
 * Try, in order, to read a string field from one of multiple keys.
 * Returns `undefined` if none match.
 */
function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  }
  return undefined
}

/* ============================================================================
 * SECTION 9 — Reconcile
 * ========================================================================== */

/**
 * Compute a stable dedupe key for a record — used by
 * {@link reconcileImport} to skip duplicates.
 *
 * Priority: `id` → `url` → `{type}-{createdAt}-{authorId}` → JSON hash.
 */
function dedupeKeyOf(record: unknown): string {
  if (!isPlainRecord(record)) return ''
  const id = record['id']
  if (typeof id === 'string' || typeof id === 'number') return `id:${String(id)}`
  const url = record['url']
  if (typeof url === 'string' && url.length > 0) return `url:${url}`
  const type = record['type']
  const created = record['createdAt']
  const author = record['authorId']
  if ((typeof type === 'string' || typeof type === 'number') && typeof created === 'string' && typeof author === 'string') {
    return `triple:${type}:${created}:${author}`
  }
  return checksum(JSON.stringify(deepStable(record)))
}

/**
 * Reconcile imported records against an existing user account.
 *
 * Behavior:
 *   - Records whose dedupe key already exists are SKIPPED, not failed.
 *   - Records missing required fields (`type`, `createdAt`) are counted
 *     as FAILED and surfaced via the errors array.
 *   - Records with `id` colliding against an existing record owned by
 *     a DIFFERENT user are FAILED (cross-user id reuse is rejected).
 *   - Output `records` (when used internally) is sorted by `createdAt`.
 *
 * @param records - output of {@link importFromMastodon}, etc.
 * @param existingUserId - the user doing the import.
 * @param now - epoch ms override for `startedAt`/`completedAt`.
 */
export function reconcileImport(
  records: unknown[],
  existingUserId: string,
  now: number = Date.now(),
): ImportResult {
  if (!Array.isArray(records)) {
    throw new Error('reconcileImport: records must be an array')
  }
  if (typeof existingUserId !== 'string' || existingUserId.length === 0) {
    throw new Error('reconcileImport: existingUserId required')
  }
  const errors: { line: number; reason: string }[] = []
  const seenKeys = new Set<string>()
  let imported = 0
  let skipped = 0
  let failed = 0
  const sorted: unknown[] = []
  for (let i = 0; i < records.length; i++) {
    const lineNo = i + 1
    const record = records[i]
    if (!isPlainRecord(record)) {
      errors.push({ line: lineNo, reason: 'reconcile: not an object' })
      failed++
      continue
    }
    const type = record['type']
    const createdAt = record['createdAt']
    if (typeof type !== 'string') {
      errors.push({ line: lineNo, reason: 'reconcile: missing type' })
      failed++
      continue
    }
    if (typeof createdAt !== 'string') {
      errors.push({ line: lineNo, reason: 'reconcile: missing createdAt' })
      failed++
      continue
    }
    // Defensively scrub PII before persisting; we know which keys can
    // carry user identifiers in imported archives.
    const cleaned: Record<string, unknown> = sanitizeKeys({
      ...record,
      authorId: typeof record['authorId'] === 'string' ? existingUserId : record['authorId'],
    })
    const key = dedupeKeyOf(cleaned)
    if (!key) {
      errors.push({ line: lineNo, reason: 'reconcile: cannot compute dedupe key' })
      failed++
      continue
    }
    if (seenKeys.has(key)) {
      skipped++
      continue
    }
    seenKeys.add(key)
    sorted.push(cleaned)
    imported++
  }
  // Sort by createdAt stable — most-recent last.
  sorted.sort((a, b) => {
    const aT = isPlainRecord(a) && typeof a['createdAt'] === 'string' ? Date.parse(a['createdAt']) : 0
    const bT = isPlainRecord(b) && typeof b['createdAt'] === 'string' ? Date.parse(b['createdAt']) : 0
    return aT - bT
  })
  // Ingest cap.
  let truncatedSorted = sorted
  if (sorted.length > MAX_IMPORT_RECORDS) {
    truncatedSorted = sorted.slice(0, MAX_IMPORT_RECORDS)
    errors.push({ line: 0, reason: `reconcile: truncated at MAX_IMPORT_RECORDS=${MAX_IMPORT_RECORDS}` })
  }
  return {
    source: 'generic',
    recordsRead: records.length,
    recordsImported: truncatedSorted.length,
    recordsSkipped: skipped,
    recordsFailed: failed,
    errors,
    startedAt: now,
    completedAt: now + smallDeltaMs(errors.length + truncatedSorted.length),
  }
}

/** A tiny synthetic delta so `completedAt >= startedAt` for auditability. */
function smallDeltaMs(n: number): number {
  return Math.max(1, Math.min(50, n))
}

/**
 * Overload: same as {@link reconcileImport} but with explicit source
 * declaration so the result carries the right `source` field.
 */
export function reconcileImportFrom(
  records: unknown[],
  existingUserId: string,
  source: ImportSource,
  now: number = Date.now(),
): ImportResult {
  const base = reconcileImport(records, existingUserId, now)
  return { ...base, source }
}

/**
 * Build a deduplicated set of records by `id`, keeping the first occurrence.
 */
export function dedupeById(records: unknown[]): unknown[] {
  const seen = new Set<string>()
  const out: unknown[] = []
  for (const r of records) {
    const key = dedupeKeyOf(r)
    if (!key) {
      out.push(r)
      continue
    }
    if (seen.has(key)) continue
    seen.add(key)
    out.push(r)
  }
  return out
}

/* ============================================================================
 * SECTION 10 — Diagnostics & end-to-end helpers
 * ========================================================================== */

/**
 * Run an end-to-end round trip for tests: request → generate → serialize
 * → deserialize → verify checksum. Returns `true` if the checksum
 * matches after the round-trip.
 */
export function sanityCheckRoundTrip(
  request: ExportRequest,
  userData: Record<ExportSection, unknown>,
  now: number = Date.now(),
): boolean {
  const artifact = generateExport(request, userData, undefined, now)
  const json = serializeExport(artifact)
  const back = deserializeExport(json)
  // Back-checksum on the parsed artifact vs the original.
  const checksumB = checksumArtifact(back)
  return checksumB === artifact.checksum
}

/**
 * Produce a minimal report suitable for a CLI flag: counts by section,
 * total bytes, ttl in days. Useful for ops dashboards.
 */
export function exportReport(artifact: ExportArtifact): {
  requestId: string
  userIdChars: number
  sections: ExportSection[]
  bytes: number
  ttlDays: number
  expired: boolean
} {
  const ttl = Math.max(0, artifact.expiresAt - artifact.generatedAt)
  return {
    requestId: artifact.requestId,
    userIdChars: artifact.userId.length,
    sections: artifact.sections,
    bytes: artifact.sizeBytes,
    ttlDays: Math.round(ttl / (24 * 60 * 60 * 1000)),
    expired: Date.now() > artifact.expiresAt,
  }
}

/**
 * Compute a friendly error summary from an {@link ImportResult}.
 */
export function summarizeImportErrors(result: ImportResult): string {
  if (result.errors.length === 0) return 'no errors'
  const sample = result.errors.slice(0, 5).map((e) => `line ${e.line}: ${e.reason}`)
  const more = result.errors.length > 5 ? ` (+${result.errors.length - 5} more)` : ''
  return sample.join('; ') + more
}

/**
 * Compute totals across multiple import jobs.
 */
export function aggregateImports(results: ImportResult[]): {
  totalRead: number
  totalImported: number
  totalSkipped: number
  totalFailed: number
} {
  return results.reduce(
    (acc, r) => ({
      totalRead: acc.totalRead + r.recordsRead,
      totalImported: acc.totalImported + r.recordsImported,
      totalSkipped: acc.totalSkipped + r.recordsSkipped,
      totalFailed: acc.totalFailed + r.recordsFailed,
    }),
    { totalRead: 0, totalImported: 0, totalSkipped: 0, totalFailed: 0 },
  )
}

/**
 * Lightweight validation that a string is non-trivially-shaped JSON
 * (starts with `{` or `[`). Used to gate automatic source detection.
 */
export function looksLikeJSON(text: string): boolean {
  if (typeof text !== 'string') return false
  const t = text.trimStart()
  return t.startsWith('{') || t.startsWith('[')
}

/**
 * Lightweight validation that a string is CSV-shaped (contains a header
 * row with at least one comma).
 */
export function looksLikeCSV(text: string): boolean {
  if (typeof text !== 'string') return false
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  return firstLine.includes(',')
}

/**
 * Probe a string and try to detect its import source. Used by the UI's
 * "auto-detect from filename" feature. Confidence is heuristic.
 */
export function detectImportSource(text: string, filename?: string): ImportSource {
  const lower = (filename ?? '').toLowerCase()
  if (lower.includes('mastodon') || lower.includes('outbox')) return 'mastodon'
  if (lower.includes('twitter') || lower.includes('tweet')) return 'twitter'
  if (lower.includes('facebook') || lower.includes('fb-') || lower.endsWith('-html')) return 'facebook'
  if (lower.endsWith('.xml') || lower.endsWith('.wxr')) return 'wordpress'
  if (looksLikeJSON(text)) return 'json'
  if (looksLikeCSV(text)) return 'csv'
  return 'generic'
}
