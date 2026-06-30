// ============================================================================
// SPIRITUAL JOURNAL — journal.ts (Wave 70, 2026-06-30)
// ============================================================================
// Pure-logic CRUD engine for personal spiritual journal entries.
//
// This is the GENERAL JOURNAL LAYER that complements:
//   - daily-reflection (W62) — daily check-in style
//   - dream-journal-engine (W67) — dream-specific capture
//   - energy-mood-checkin (W69) — mood/energy numeric capture
//   - reading-history-analytics (W69) — readings history
//   - community-circles (W69) — social reflection layer
//
// Storage: in-memory Map<EntryId, JournalEntry> (caller persists externally).
//
// LGPD posture (cycle 60 + cycle 62 + cycle 67 lessons):
//   - Entries are SENSITIVE PERSONAL DATA (intimate spiritual reflection)
//     under LGPD Art. 5 II + Art. 11
//   - softDelete preserves audit trail (deletedAt = timestamp)
//   - eraseAll hard-deletes (Art. 18 right-to-be-forgotten)
//   - exportEntries supports Art. 18 V (data portability)
//   - HMAC chain via chainEntryHash for tamper detection (cycle 67 lesson)
//
// 7-tradition coverage (cycle 62 lesson 12):
//   Tradition taxonomy: Cigano, Orixás, Astrologia, Cabala, Numerologia,
//   Tantra, Tarot. Entries MAY carry `tradition` + `oduRef` for sacred linking.
// ============================================================================

// ============================================================================
// BRANDED TYPES — Type-safe identifiers
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type UserId = Brand<string, "UserId">;
export type EntryId = Brand<string, "EntryId">;
export type Timestamp = Brand<number, "Timestamp">;
export type DateKey = Brand<string, "DateKey">; // YYYY-MM-DD

export const asUserId = (s: string): UserId => s as UserId;
export const asEntryId = (s: string): EntryId => s as EntryId;
export const asTimestamp = (n: number): Timestamp => n as Timestamp;
export const asDateKey = (s: string): DateKey => s as DateKey;

// ============================================================================
// TRADITION TAXONOMY (7 traditions, cycle 62 lesson 12)
// ============================================================================

export type Tradition =
  | "Cigano"
  | "Orixás"
  | "Astrologia"
  | "Cabala"
  | "Numerologia"
  | "Tantra"
  | "Tarot";

export const TRADITIONS: readonly Tradition[] = [
  "Cigano",
  "Orixás",
  "Astrologia",
  "Cabala",
  "Numerologia",
  "Tantra",
  "Tarot",
] as const;

// ============================================================================
// ODU / ELEMENT / CHAKRA REFERENCES
// ============================================================================

export type OduRef = string & { readonly __brand: "OduRef" };
export const asOduRef = (s: string): OduRef => s as OduRef;

export type Element =
  | "fogo"
  | "agua"
  | "terra"
  | "ar"
  | "eter";

export const ELEMENTS: readonly Element[] = [
  "fogo",
  "agua",
  "terra",
  "ar",
  "eter",
] as const;

export type Chakra =
  | "root"
  | "sacral"
  | "solar"
  | "heart"
  | "throat"
  | "third-eye"
  | "crown";

export const CHAKRAS: readonly Chakra[] = [
  "root",
  "sacral",
  "solar",
  "heart",
  "throat",
  "third-eye",
  "crown",
] as const;

// ============================================================================
// TAG + LINK FORWARD REFS (defined in tags.ts / linking.ts but re-exported here)
// ============================================================================

export interface Tag {
  readonly id: string;
  readonly label: string;
  readonly tradition?: Tradition;
  readonly sacredRef?: string;
}

export type LinkTargetType = "reading" | "ritual" | "checkin";

// LinkId branded type — declared here to avoid circular import from linking.ts
declare const _linkBrand: unique symbol;
export type LinkId = Brand<string, "LinkId">;
export const asLinkId = (s: string): LinkId => s as LinkId;

export interface Link {
  readonly id: LinkId;
  readonly sourceEntryId: EntryId;
  readonly targetEntityId: string;
  readonly targetEntityType: LinkTargetType;
  readonly createdAt: Timestamp;
}

// ============================================================================
// JOURNAL ENTRY — Core domain object
// ============================================================================

export type Mood =
  | "radiant"
  | "joyful"
  | "calm"
  | "neutral"
  | "melancholic"
  | "anxious"
  | "heavy";

export const MOODS: readonly Mood[] = [
  "radiant",
  "joyful",
  "calm",
  "neutral",
  "melancholic",
  "anxious",
  "heavy",
] as const;

export interface JournalEntry {
  readonly id: EntryId;
  readonly userId: UserId;
  readonly content: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly mood?: Mood;
  readonly energy?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  readonly tags: readonly Tag[];
  readonly links: readonly Link[];
  readonly tradition?: Tradition;
  readonly oduRef?: OduRef;
  readonly element?: Element;
  readonly chakra?: Chakra;
  /** Set when soft-deleted (LGPD-friendly: preserves audit trail). */
  readonly deletedAt?: Timestamp;
  /** HMAC chain for tamper detection (cycle 67 lesson). */
  readonly contentHash?: string;
}

// ============================================================================
// FILTERS + PAGINATION
// ============================================================================

export interface DateRange {
  readonly from?: DateKey;
  readonly to?: DateKey;
}

export interface EntryFilters {
  readonly dateRange?: DateRange;
  readonly mood?: readonly Mood[];
  readonly energyMin?: number;
  readonly energyMax?: number;
  readonly tags?: readonly string[];
  readonly tradition?: Tradition;
  readonly includeDeleted?: boolean;
}

export interface PaginatedEntries {
  readonly entries: readonly JournalEntry[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly sanitized?: string;
}

// ============================================================================
// STORE — In-memory (caller persists)
// ============================================================================

const _entries = new Map<EntryId, JournalEntry>();
let _hmacSecret = "";
let _lastTimestamp = 0;

export const setHmacSecret = (secret: string): void => {
  _hmacSecret = secret;
};

export const clearHmacSecret = (): void => {
  _hmacSecret = "";
};

export const clearAllStores = (): void => {
  _entries.clear();
  _lastTimestamp = 0;
};

// ============================================================================
// HMAC CHAIN — Tamper detection (cycle 67 lesson: FNV-1a + secret)
// ============================================================================

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function chainEntryHash(
  userId: UserId,
  content: string,
  createdAt: Timestamp,
): string {
  if (!_hmacSecret) return "";
  const payload = `${userId}|${createdAt}|${content}`;
  return fnv1a(`${payload}|${_hmacSecret}`);
}

// ============================================================================
// VALIDATION
// ============================================================================

export const MAX_CONTENT_LENGTH = 50_000;

/**
 * Validate journal entry content. Returns sanitized version (trimmed) if valid.
 * PII auto-redaction is the caller's responsibility — engine does NOT
 * auto-redact to avoid losing user intent (cycle 67 lesson: redactPII explicit).
 */
export function validateEntryContent(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (typeof content !== "string") {
    return { valid: false, errors: ["content must be a string"], warnings };
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    errors.push("content cannot be empty");
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    errors.push(`content exceeds max length ${MAX_CONTENT_LENGTH}`);
  }
  if (trimmed.length < 5) {
    warnings.push("content is very short (<5 chars)");
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: trimmed,
  };
}

// ============================================================================
// CRUD — createEntry
// ============================================================================

export interface CreateEntryOptions {
  readonly mood?: Mood;
  readonly energy?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  readonly tags?: readonly Tag[];
  readonly links?: readonly Link[];
  readonly tradition?: Tradition;
  readonly oduRef?: OduRef;
  readonly element?: Element;
  readonly chakra?: Chakra;
  readonly idSeed?: string;
  readonly createdAt?: Timestamp;
}

export function createEntry(
  userId: UserId,
  content: string,
  options: CreateEntryOptions = {},
): JournalEntry {
  const validation = validateEntryContent(content);
  if (!validation.valid) {
    throw new JournalValidationError(validation.errors.join("; "));
  }
  let now = options.createdAt ?? asTimestamp(Date.now());
  // Monotonic guard: ensure new entries are always strictly after the last
  // (cycle 60 lesson: deterministic ordering for tests + UI list stability).
  const nowNum = now as number;
  if (nowNum <= _lastTimestamp) {
    now = asTimestamp(_lastTimestamp + 1);
  }
  _lastTimestamp = now as number;
  const id = asEntryId(
    options.idSeed ?? `entry_${now}_${_entries.size + 1}_${userId}`,
  );
  const finalContent = validation.sanitized ?? content.trim();
  const entry: JournalEntry = Object.freeze({
    id,
    userId,
    content: finalContent,
    createdAt: now,
    updatedAt: now,
    mood: options.mood,
    energy: options.energy,
    tags: Object.freeze([...(options.tags ?? [])]),
    links: Object.freeze([...(options.links ?? [])]),
    tradition: options.tradition,
    oduRef: options.oduRef,
    element: options.element,
    chakra: options.chakra,
    contentHash: chainEntryHash(userId, finalContent, now),
  });
  _entries.set(id, entry);
  return entry;
}

// ============================================================================
// CRUD — getEntry / listEntries / listEntriesPaginated
// ============================================================================

export function getEntry(entryId: EntryId): JournalEntry | null {
  return _entries.get(entryId) ?? null;
}

export function listEntries(
  userId: UserId,
  filters: EntryFilters = {},
): readonly JournalEntry[] {
  const all = Array.from(_entries.values()).filter((e) => e.userId === userId);
  const filtered = all.filter((e) => matchesFilters(e, filters));
  // Newest first
  return Object.freeze(filtered.sort((a, b) => b.createdAt - a.createdAt));
}

function matchesFilters(entry: JournalEntry, f: EntryFilters): boolean {
  if (!f.includeDeleted && entry.deletedAt !== undefined) return false;
  if (f.tradition && entry.tradition !== f.tradition) return false;
  if (f.mood && f.mood.length > 0 && (!entry.mood || !f.mood.includes(entry.mood))) {
    return false;
  }
  if (f.energyMin !== undefined && (entry.energy ?? 0) < f.energyMin) return false;
  if (f.energyMax !== undefined && (entry.energy ?? 11) > f.energyMax) return false;
  if (f.tags && f.tags.length > 0) {
    const tagIds = new Set(entry.tags.map((t) => t.id));
    const hasAny = f.tags.some((tid) => tagIds.has(tid));
    if (!hasAny) return false;
  }
  if (f.dateRange) {
    const createdDate = new Date(entry.createdAt).toISOString().slice(0, 10);
    if (f.dateRange.from && createdDate < f.dateRange.from) return false;
    if (f.dateRange.to && createdDate > f.dateRange.to) return false;
  }
  return true;
}

export function listEntriesPaginated(
  userId: UserId,
  page: number,
  pageSize: number,
  filters: EntryFilters = {},
): PaginatedEntries {
  const all = listEntries(userId, filters);
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.min(100, Math.floor(pageSize)));
  const start = (safePage - 1) * safeSize;
  const end = start + safeSize;
  const slice = all.slice(start, end);
  return {
    entries: Object.freeze(slice),
    totalCount: all.length,
    page: safePage,
    pageSize: safeSize,
    hasMore: end < all.length,
  };
}

// ============================================================================
// CRUD — updateEntry (immutable: returns new entry, keeps old frozen)
// ============================================================================

export interface UpdateEntryPatch {
  readonly content?: string;
  readonly mood?: Mood;
  readonly energy?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  readonly tags?: readonly Tag[];
  readonly links?: readonly Link[];
  readonly tradition?: Tradition;
  readonly oduRef?: OduRef;
  readonly element?: Element;
  readonly chakra?: Chakra;
}

export function updateEntry(
  entryId: EntryId,
  patch: UpdateEntryPatch,
): JournalEntry {
  const existing = _entries.get(entryId);
  if (!existing) throw new EntryNotFoundError(`Entry ${entryId} not found`);
  if (existing.deletedAt !== undefined) {
    throw new JournalValidationError("cannot update deleted entry");
  }
  let content = existing.content;
  if (patch.content !== undefined) {
    const v = validateEntryContent(patch.content);
    if (!v.valid) throw new JournalValidationError(v.errors.join("; "));
    content = v.sanitized ?? patch.content.trim();
  }
  let now = asTimestamp(Date.now());
  // Monotonic guard for updatedAt (same as createEntry)
  const nowNum = now as number;
  if (nowNum <= _lastTimestamp) {
    now = asTimestamp(_lastTimestamp + 1);
  }
  _lastTimestamp = now as number;
  const updated: JournalEntry = Object.freeze({
    id: existing.id,
    userId: existing.userId,
    content,
    createdAt: existing.createdAt,
    updatedAt: now,
    mood: patch.mood ?? existing.mood,
    energy: patch.energy ?? existing.energy,
    tags: Object.freeze([...(patch.tags ?? existing.tags)]),
    links: Object.freeze([...(patch.links ?? existing.links)]),
    tradition: patch.tradition ?? existing.tradition,
    oduRef: patch.oduRef ?? existing.oduRef,
    element: patch.element ?? existing.element,
    chakra: patch.chakra ?? existing.chakra,
    contentHash: chainEntryHash(existing.userId, content, existing.createdAt),
  });
  _entries.set(entryId, updated);
  return updated;
}

// ============================================================================
// CRUD — deleteEntry (soft) + eraseAllEntries (hard LGPD)
// ============================================================================

export function deleteEntry(entryId: EntryId): boolean {
  const existing = _entries.get(entryId);
  if (!existing) return false;
  if (existing.deletedAt !== undefined) return false; // already deleted
  const softDeleted: JournalEntry = Object.freeze({
    ...existing,
    deletedAt: asTimestamp(Date.now()),
  });
  _entries.set(entryId, softDeleted);
  return true;
}

/**
 * LGPD Art. 18 III — right to erasure. Hard delete all entries for user.
 * Returns number of entries erased.
 */
export function eraseAllEntries(userId: UserId): number {
  let count = 0;
  for (const [id, entry] of _entries.entries()) {
    if (entry.userId === userId) {
      _entries.delete(id);
      count += 1;
    }
  }
  return count;
}

// ============================================================================
// EXPORT — LGPD Art. 18 V data portability
// ============================================================================

export type ExportFormat = "json" | "markdown";

export function exportEntries(
  userId: UserId,
  format: ExportFormat = "json",
): string {
  const entries = listEntries(userId, { includeDeleted: false });
  if (format === "json") {
    return JSON.stringify(
      {
        userId,
        exportedAt: new Date().toISOString(),
        count: entries.length,
        entries,
      },
      null,
      2,
    );
  }
  // markdown
  const lines: string[] = [
    `# Spiritual Journal — Export`,
    ``,
    `User: ${userId}`,
    `Exported: ${new Date().toISOString()}`,
    `Entries: ${entries.length}`,
    ``,
    `---`,
    ``,
  ];
  for (const e of entries) {
    const date = new Date(e.createdAt).toISOString();
    lines.push(`## ${date}`);
    lines.push(``);
    if (e.tradition) lines.push(`**Tradição:** ${e.tradition}`);
    if (e.oduRef) lines.push(`**Odu:** ${e.oduRef}`);
    if (e.mood) lines.push(`**Humor:** ${e.mood}`);
    if (e.energy) lines.push(`**Energia:** ${e.energy}/10`);
    if (e.tags.length > 0) {
      lines.push(
        `**Tags:** ${e.tags.map((t) => t.label).join(", ")}`,
      );
    }
    lines.push(``);
    lines.push(e.content);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }
  return lines.join("\n");
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class JournalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JournalError";
  }
}

export class EntryNotFoundError extends JournalError {
  constructor(message: string) {
    super(message);
    this.name = "EntryNotFoundError";
  }
}

export class JournalValidationError extends JournalError {
  constructor(message: string) {
    super(message);
    this.name = "JournalValidationError";
  }
}

// ============================================================================
// AUDIT
// ============================================================================

export interface JournalAudit {
  readonly totalEntries: number;
  readonly activeEntries: number;
  readonly softDeletedEntries: number;
  readonly uniqueUsers: number;
  readonly byTradition: Readonly<Record<Tradition, number>>;
  readonly byMood: Readonly<Record<Mood, number>>;
  readonly avgContentLength: number;
  readonly avgEnergy: number;
  readonly hmacEnabled: boolean;
}

export function auditJournal(): JournalAudit {
  const all = Array.from(_entries.values());
  const active = all.filter((e) => e.deletedAt === undefined);
  const deleted = all.filter((e) => e.deletedAt !== undefined);
  const users = new Set(all.map((e) => e.userId));
  const byTradition = {} as Record<Tradition, number>;
  for (const t of TRADITIONS) byTradition[t] = 0;
  for (const e of active) {
    if (e.tradition) byTradition[e.tradition] += 1;
  }
  const byMood = {} as Record<Mood, number>;
  for (const m of MOODS) byMood[m] = 0;
  for (const e of active) {
    if (e.mood) byMood[e.mood] += 1;
  }
  const totalLen = active.reduce((s, e) => s + e.content.length, 0);
  const energySum = active.reduce((s, e) => s + (e.energy ?? 0), 0);
  const energyCount = active.filter((e) => e.energy !== undefined).length;
  return {
    totalEntries: all.length,
    activeEntries: active.length,
    softDeletedEntries: deleted.length,
    uniqueUsers: users.size,
    byTradition: Object.freeze(byTradition),
    byMood: Object.freeze(byMood),
    avgContentLength: active.length === 0 ? 0 : Math.round(totalLen / active.length),
    avgEnergy: energyCount === 0 ? 0 : Math.round((energySum / energyCount) * 10) / 10,
    hmacEnabled: _hmacSecret !== "",
  };
}