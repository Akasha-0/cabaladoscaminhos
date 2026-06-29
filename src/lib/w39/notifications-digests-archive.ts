/**
 * notifications-digests-archive.ts
 *
 * Cycle 39 — Notifications Digests Archive.
 *
 * Searchable, time-aware archive of past notification digests. Operators
 * (or end users via a future "history" tab) can find digests by recipient,
 * topic, date, status, or free-text content; cross-reference back to the
 * original raw notifications; compute aggregate stats; export subsets as
 * JSON or CSV; and find similar digests.
 *
 * Composes with:
 *   - w35/notifications-digest-mode        (DigestItem source)
 *   - w36/w36-notifications-escalation-v2  (time-aware stale/reason logic)
 *   - w38/notifications-digest-preview     (DigestItem preview metadata)
 *
 * Pure TypeScript. No runtime imports. No I/O. No throws on bad input —
 * every public helper degrades gracefully to a safe default.
 */

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

export type ArchiveStatus = "sent" | "read" | "archived" | "bounced";
export type ArchiveSortBy = "date" | "relevance" | "itemCount";
export type ArchiveFacetField = "topic" | "date" | "status" | "recipientId";
export type DigestLinkRelation = "primary" | "reference" | "followup";

export interface ArchiveEntry {
  digestId: string;
  sentAt: number;
  recipientId: string;
  topicTags: string[];
  itemCount: number;
  status: ArchiveStatus;
  originalNotificationIds: string[];
  title?: string;
  body?: string;
}

export interface ArchiveDateRange { from?: number; to?: number; }

export interface ArchiveQuery {
  recipientId?: string;
  topicTags?: string[];
  dateRange?: ArchiveDateRange;
  status?: ArchiveStatus;
  searchText?: string;
  limit: number;
  offset: number;
  sortBy: ArchiveSortBy;
}

export interface FacetValue { value: string; count: number; }
export interface FacetBucket { topic: Record<string, number>; date: Record<string, number>; }

export interface ArchiveSearchResult {
  entries: ArchiveEntry[];
  totalCount: number;
  hasMore: boolean;
  facets: FacetBucket;
}

export interface ArchiveFacet {
  field: ArchiveFacetField;
  values: FacetValue[];
  totalCount: number;
}

export interface ArchiveStats {
  totalDigests: number;
  totalRecipients: number;
  avgItemsPerDigest: number;
  topTopics: { topic: string; count: number }[];
  oldestDigest: number | null;
  newestDigest: number | null;
  growthRate: number;
}

export interface DigestLink {
  digestId: string;
  originalNotificationId: string;
  relation: DigestLinkRelation;
  confidence: number;
}

export interface ArchiveSearchNotification {
  notificationId: string;
  topicTags?: string[];
  title?: string;
  body?: string;
}

export interface SimilarityScore {
  total: number;
  topic: number;
  recipient: number;
  items: number;
}

export const MAX_ARCHIVE_SIZE = 50_000;
export const MAX_TOPICS_PER_ENTRY = 32;
export const MAX_NOTIFICATIONS_PER_ENTRY = 200;
export const MAX_TOPIC_LENGTH = 64;
export const MAX_SEARCH_TEXT_LENGTH = 500;
export const DEFAULT_QUERY_LIMIT = 25;
export const MAX_QUERY_LIMIT = 200;
export const MIN_QUERY_LIMIT = 1;
export const DEFAULT_WINDOW_DAYS = 30;
export const MIN_WINDOW_DAYS = 1;
export const MAX_WINDOW_DAYS = 365;
export const TOP_TOPICS_LIMIT = 10;
export const DATE_BUCKET_MS = 24 * 60 * 60 * 1000;
export const STALE_LINK_AGE_MS = 7 * DATE_BUCKET_MS;
export const REFERENCE_CONFIDENCE = 0.5;
export const FOLLOWUP_CONFIDENCE = 0.75;
export const PRIMARY_CONFIDENCE = 1.0;

export const ALL_STATUSES: ArchiveStatus[] = ["sent", "read", "archived", "bounced"];
export const ALL_FACET_FIELDS: ArchiveFacetField[] = ["topic", "date", "status", "recipientId"];
export const ALL_SORT_OPTIONS: ArchiveSortBy[] = ["date", "relevance", "itemCount"];

const CSV_HEADER = "digestId,sentAt,recipientId,topicTags,itemCount,status,originalNotificationIds,title,body";

// =============================================================================
// INPUT GUARDS
// =============================================================================

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function normalizeString(v: unknown, max: number = MAX_TOPIC_LENGTH): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}
function normalizeStringArray(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (let i = 0; i < v.length && out.length < maxItems; i++) {
    const s = normalizeString(v[i], maxLen);
    if (s !== null) out.push(s);
  }
  return out;
}
function isStatus(v: unknown): v is ArchiveStatus {
  return typeof v === "string" && (ALL_STATUSES as string[]).includes(v);
}
function isSortBy(v: unknown): v is ArchiveSortBy {
  return typeof v === "string" && (ALL_SORT_OPTIONS as string[]).includes(v);
}
function isFacetField(v: unknown): v is ArchiveFacetField {
  return typeof v === "string" && (ALL_FACET_FIELDS as string[]).includes(v);
}

// =============================================================================
// ARCHIVE MUTATION
// =============================================================================

/** Normalize an incoming archive entry into a canonical form. */
export function normalizeArchiveEntry(input: unknown): ArchiveEntry | null {
  if (!isRecord(input)) return null;
  const digestId = normalizeString(input.digestId, 128);
  const recipientId = normalizeString(input.recipientId, 128);
  if (digestId === null || recipientId === null) return null;
  const sentAt = isFiniteNumber(input.sentAt) ? input.sentAt : 0;
  const topicTags = normalizeStringArray(input.topicTags, MAX_TOPICS_PER_ENTRY, MAX_TOPIC_LENGTH);
  const originalNotificationIds = normalizeStringArray(input.originalNotificationIds, MAX_NOTIFICATIONS_PER_ENTRY, 128);
  const status = isStatus(input.status) ? input.status : "sent";
  const itemCount = isFiniteNumber(input.itemCount)
    ? Math.max(0, Math.floor(input.itemCount))
    : originalNotificationIds.length;
  const title = normalizeString(input.title, 256) ?? undefined;
  const body = normalizeString(input.body, 1024) ?? undefined;
  const out: ArchiveEntry = { digestId, sentAt, recipientId, topicTags, itemCount, status, originalNotificationIds };
  if (title !== undefined) out.title = title;
  if (body !== undefined) out.body = body;
  return out;
}

/**
 * Append a digest to the archive. Pure: returns a new archive array.
 * Replaces any existing entry with the same `digestId` so callers can
 * amend history. Caps total size at MAX_ARCHIVE_SIZE.
 */
export function archiveDigest(
  entry: ArchiveEntry,
  archive: readonly ArchiveEntry[] = [],
): ArchiveEntry[] {
  const normalized = normalizeArchiveEntry(entry);
  if (normalized === null) return archive.slice();
  const filtered = archive.filter((e) => e.digestId !== normalized.digestId);
  filtered.push(normalized);
  filtered.sort((a, b) => a.sentAt - b.sentAt);
  if (filtered.length > MAX_ARCHIVE_SIZE) filtered.splice(0, filtered.length - MAX_ARCHIVE_SIZE);
  return filtered;
}

/** Remove a digest by id; returns a new archive array. */
export function removeArchivedDigest(
  digestId: string,
  archive: readonly ArchiveEntry[],
): ArchiveEntry[] {
  if (typeof digestId !== "string" || digestId.length === 0) return archive.slice();
  return archive.filter((e) => e.digestId !== digestId);
}

// =============================================================================
// SEARCH
// =============================================================================

function entryMatchesQuery(entry: ArchiveEntry, q: ArchiveQuery): boolean {
  if (typeof q.recipientId === "string" && q.recipientId.length > 0 && entry.recipientId !== q.recipientId) return false;
  if (typeof q.status === "string" && q.status.length > 0 && entry.status !== q.status) return false;
  if (q.dateRange !== undefined) {
    const from = isFiniteNumber(q.dateRange.from) ? q.dateRange.from : null;
    const to = isFiniteNumber(q.dateRange.to) ? q.dateRange.to : null;
    if (from !== null && entry.sentAt < from) return false;
    if (to !== null && entry.sentAt > to) return false;
  }
  if (Array.isArray(q.topicTags) && q.topicTags.length > 0) {
    let anyMatch = false;
    for (const t of q.topicTags) if (entry.topicTags.includes(t)) { anyMatch = true; break; }
    if (!anyMatch) return false;
  }
  if (typeof q.searchText === "string" && q.searchText.length > 0) {
    const needle = q.searchText.toLowerCase().slice(0, MAX_SEARCH_TEXT_LENGTH);
    const hay = `${entry.title ?? ""} ${entry.body ?? ""} ${entry.digestId} ${entry.recipientId} ${entry.topicTags.join(" ")}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

function computeRelevance(entry: ArchiveEntry, q: ArchiveQuery): number {
  if (q.sortBy !== "relevance") return 0;
  const text = (q.searchText ?? "").toLowerCase();
  let score = 0;
  if (text.length > 0) {
    const title = (entry.title ?? "").toLowerCase();
    const body = (entry.body ?? "").toLowerCase();
    if (title.includes(text)) score += 5;
    if (body.includes(text)) score += 2;
    for (const t of entry.topicTags) if (t.toLowerCase() === text) score += 8;
  }
  if (Array.isArray(q.topicTags)) {
    for (const qt of q.topicTags) if (entry.topicTags.includes(qt)) score += 3;
  }
  if (typeof q.recipientId === "string" && entry.recipientId === q.recipientId) score += 2;
  const recency = entry.sentAt > 0 ? Math.log10(Math.max(1, entry.sentAt / 1e9)) : 0;
  return score + recency;
}

function normalizeQuery(query: Partial<ArchiveQuery>): ArchiveQuery {
  const limit = isFiniteNumber(query.limit)
    ? Math.max(MIN_QUERY_LIMIT, Math.min(MAX_QUERY_LIMIT, Math.floor(query.limit)))
    : DEFAULT_QUERY_LIMIT;
  const offset = isFiniteNumber(query.offset) ? Math.max(0, Math.floor(query.offset)) : 0;
  const sortBy = isSortBy(query.sortBy) ? query.sortBy : "date";
  const out: ArchiveQuery = { limit, offset, sortBy };
  if (typeof query.recipientId === "string" && query.recipientId.length > 0) out.recipientId = query.recipientId;
  if (isStatus(query.status)) out.status = query.status;
  if (Array.isArray(query.topicTags)) {
    const filtered = query.topicTags.filter((t): t is string => typeof t === "string");
    if (filtered.length > 0) out.topicTags = filtered;
  }
  if (typeof query.searchText === "string" && query.searchText.length > 0) {
    out.searchText = query.searchText.slice(0, MAX_SEARCH_TEXT_LENGTH);
  }
  if (isRecord(query.dateRange)) {
    const range: ArchiveDateRange = {};
    if (isFiniteNumber(query.dateRange.from)) range.from = query.dateRange.from;
    if (isFiniteNumber(query.dateRange.to)) range.to = query.dateRange.to;
    if (range.from !== undefined || range.to !== undefined) out.dateRange = range;
  }
  return out;
}

function dateBucketKey(sentAt: number): string {
  if (!isFiniteNumber(sentAt) || sentAt <= 0) return "unknown";
  return `d${Math.floor(sentAt / DATE_BUCKET_MS)}`;
}

function bucketFacets(entries: readonly ArchiveEntry[]): FacetBucket {
  const topic: Record<string, number> = {};
  const date: Record<string, number> = {};
  for (const e of entries) {
    for (const t of e.topicTags) topic[t] = (topic[t] ?? 0) + 1;
    const k = dateBucketKey(e.sentAt);
    date[k] = (date[k] ?? 0) + 1;
  }
  return { topic, date };
}

/**
 * Search the archive. Pure: never mutates `archive`. Facets are computed
 * across the *filtered* result so users can refine without surprises.
 */
export function searchArchive(
  query: Partial<ArchiveQuery>,
  archive: readonly ArchiveEntry[],
): ArchiveSearchResult {
  const q = normalizeQuery(query);
  const filtered: ArchiveEntry[] = [];
  for (const e of archive) if (entryMatchesQuery(e, q)) filtered.push(e);
  if (q.sortBy === "date") {
    filtered.sort((a, b) => b.sentAt - a.sentAt);
  } else if (q.sortBy === "itemCount") {
    filtered.sort((a, b) => b.itemCount - a.itemCount || b.sentAt - a.sentAt);
  } else {
    filtered.sort((a, b) => {
      const rb = computeRelevance(b, q);
      const ra = computeRelevance(a, q);
      return rb - ra || b.sentAt - a.sentAt;
    });
  }
  const totalCount = filtered.length;
  const start = Math.min(q.offset, totalCount);
  const end = Math.min(start + q.limit, totalCount);
  return {
    entries: filtered.slice(start, end),
    totalCount,
    hasMore: end < totalCount,
    facets: bucketFacets(filtered),
  };
}

// =============================================================================
// FACETS
// =============================================================================

/** Build a single ArchiveFacet for `field` across the supplied entries. */
export function buildFacets(
  entries: readonly ArchiveEntry[],
  field: ArchiveFacetField,
): ArchiveFacet {
  const valueCounts = new Map<string, number>();
  for (const e of entries) {
    if (field === "topic") {
      for (const t of e.topicTags) valueCounts.set(t, (valueCounts.get(t) ?? 0) + 1);
    } else if (field === "date") {
      const k = dateBucketKey(e.sentAt);
      valueCounts.set(k, (valueCounts.get(k) ?? 0) + 1);
    } else if (field === "status") {
      valueCounts.set(e.status, (valueCounts.get(e.status) ?? 0) + 1);
    } else if (field === "recipientId" && typeof e.recipientId === "string") {
      valueCounts.set(e.recipientId, (valueCounts.get(e.recipientId) ?? 0) + 1);
    }
  }
  const values: FacetValue[] = [];
  valueCounts.forEach((count, value) => values.push({ value, count }));
  values.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  return { field, values, totalCount: values.length };
}

// =============================================================================
// STATS
// =============================================================================

function uniqueRecipients(entries: readonly ArchiveEntry[]): number {
  const seen = new Set<string>();
  for (const e of entries) seen.add(e.recipientId);
  return seen.size;
}

function computeGrowthRate(entries: readonly ArchiveEntry[], windowDays: number): number {
  const safeWindow = Math.max(MIN_WINDOW_DAYS, Math.min(MAX_WINDOW_DAYS, Math.floor(windowDays)));
  const now = Date.now();
  const halfMs = (safeWindow * DATE_BUCKET_MS) / 2;
  let recent = 0;
  let prior = 0;
  for (const e of entries) {
    if (!isFiniteNumber(e.sentAt)) continue;
    if (e.sentAt >= now - halfMs) recent += 1;
    else prior += 1;
  }
  if (prior === 0) return recent > 0 ? 100 : 0;
  if (recent === 0) return prior > 0 ? -100 : 0;
  return Math.round(((recent - prior) / prior) * 10000) / 100;
}

/**
 * Aggregate statistics over the last `windowDays` days (clamped to
 * [1, 365]). Used by ops dashboards and dashboard tiles.
 */
export function computeArchiveStats(
  archive: readonly ArchiveEntry[],
  windowDays: number = DEFAULT_WINDOW_DAYS,
): ArchiveStats {
  const safeWindow = Math.max(MIN_WINDOW_DAYS, Math.min(MAX_WINDOW_DAYS, Math.floor(windowDays)));
  const now = Date.now();
  const cutoff = now - safeWindow * DATE_BUCKET_MS;
  const recent: ArchiveEntry[] = [];
  for (const e of archive) {
    if (isFiniteNumber(e.sentAt) && e.sentAt >= cutoff) recent.push(e);
  }
  const totalDigests = recent.length;
  const totalItems = recent.reduce((acc, e) => acc + e.itemCount, 0);
  const avgItemsPerDigest = totalDigests > 0
    ? Math.round((totalItems / totalDigests) * 100) / 100
    : 0;
  const topicCounts = new Map<string, number>();
  for (const e of recent) for (const t of e.topicTags) topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
  const topTopics: { topic: string; count: number }[] = [];
  topicCounts.forEach((count, topic) => topTopics.push({ topic, count }));
  topTopics.sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
  if (topTopics.length > TOP_TOPICS_LIMIT) topTopics.length = TOP_TOPICS_LIMIT;
  let oldest: number | null = null;
  let newest: number | null = null;
  for (const e of recent) {
    if (oldest === null || e.sentAt < oldest) oldest = e.sentAt;
    if (newest === null || e.sentAt > newest) newest = e.sentAt;
  }
  return {
    totalDigests,
    totalRecipients: uniqueRecipients(recent),
    avgItemsPerDigest,
    topTopics,
    oldestDigest: oldest,
    newestDigest: newest,
    growthRate: computeGrowthRate(recent, safeWindow),
  };
}

// =============================================================================
// LINKING DIGESTS <-> NOTIFICATIONS
// =============================================================================

function inferRelation(
  digest: ArchiveEntry,
  notification: ArchiveSearchNotification,
): { relation: DigestLinkRelation; confidence: number } {
  if (digest.originalNotificationIds.includes(notification.notificationId)) {
    return { relation: "primary", confidence: PRIMARY_CONFIDENCE };
  }
  if (Array.isArray(notification.topicTags) && notification.topicTags.length > 0) {
    let overlap = 0;
    for (const t of notification.topicTags) if (digest.topicTags.includes(t)) overlap += 1;
    if (overlap > 0) {
      const ratio = overlap / notification.topicTags.length;
      return { relation: "reference", confidence: ratio * REFERENCE_CONFIDENCE };
    }
  }
  const ageOk = isFiniteNumber(digest.sentAt) && Date.now() - digest.sentAt <= STALE_LINK_AGE_MS;
  if (ageOk && digest.status === "sent") {
    return { relation: "followup", confidence: FOLLOWUP_CONFIDENCE * 0.5 };
  }
  return { relation: "reference", confidence: 0 };
}

/**
 * Cross-reference archived digests with their underlying notifications.
 * Returns at most one DigestLink per (digestId, notificationId) pair with
 * the highest-confidence relationship when several apply.
 */
export function linkDigestsToNotifications(
  archive: readonly ArchiveEntry[],
  notifications: readonly ArchiveSearchNotification[],
): DigestLink[] {
  const out: DigestLink[] = [];
  for (const digest of archive) {
    for (const n of notifications) {
      const inferred = inferRelation(digest, n);
      if (inferred.confidence <= 0) continue;
      out.push({
        digestId: digest.digestId,
        originalNotificationId: n.notificationId,
        relation: inferred.relation,
        confidence: Math.round(inferred.confidence * 1000) / 1000,
      });
    }
  }
  out.sort((a, b) => b.confidence - a.confidence || a.digestId.localeCompare(b.digestId));
  return out;
}

/** All primary links for a single digest id. */
export function primaryLinksForDigest(
  digestId: string,
  links: readonly DigestLink[],
): DigestLink[] {
  if (typeof digestId !== "string") return [];
  return links.filter((l) => l.digestId === digestId && l.relation === "primary");
}

// =============================================================================
// RELATED DIGESTS
// =============================================================================

function jaccard<T>(a: readonly T[], b: readonly T[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach((v) => { if (setB.has(v)) intersection += 1; });
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function setOverlap(a: readonly string[], b: readonly string[]): number {
  const setA = new Set(a);
  let hits = 0;
  for (const v of b) if (setA.has(v)) hits += 1;
  return hits;
}

/**
 * Similarity between two archive entries. Combines:
 *   - topic Jaccard  (weight 0.5)
 *   - recipient equality bonus (weight 0.2)
 *   - original-notification overlap (weight 0.3)
 */
export function digestSimilarity(a: ArchiveEntry, b: ArchiveEntry): SimilarityScore {
  const topic = jaccard(a.topicTags, b.topicTags);
  const recipient = a.recipientId === b.recipientId ? 1 : 0;
  const overlap = setOverlap(a.originalNotificationIds, b.originalNotificationIds);
  const denom = Math.max(a.originalNotificationIds.length, b.originalNotificationIds.length);
  const items = denom === 0 ? 0 : overlap / denom;
  const total = topic * 0.5 + recipient * 0.2 + items * 0.3;
  return {
    total: Math.round(total * 1000) / 1000,
    topic: Math.round(topic * 1000) / 1000,
    recipient,
    items: Math.round(items * 1000) / 1000,
  };
}

/**
 * Top-k related digests for a given id, sorted by similarity desc.
 * Returns [] if the digest is missing.
 */
export function getRelatedDigests(
  digestId: string,
  archive: readonly ArchiveEntry[],
  k: number = 5,
): { digestId: string; score: SimilarityScore }[] {
  if (typeof digestId !== "string" || digestId.length === 0) return [];
  const source = archive.find((e) => e.digestId === digestId);
  if (source === undefined) return [];
  const safeK = Math.max(1, Math.min(50, Math.floor(k)));
  const scored: { digestId: string; score: SimilarityScore }[] = [];
  for (const candidate of archive) {
    if (candidate.digestId === digestId) continue;
    const sim = digestSimilarity(source, candidate);
    if (sim.total <= 0) continue;
    scored.push({ digestId: candidate.digestId, score: sim });
  }
  scored.sort((a, b) => b.score.total - a.score.total || a.digestId.localeCompare(b.digestId));
  if (scored.length > safeK) scored.length = safeK;
  return scored;
}

// =============================================================================
// EXPORT
// =============================================================================

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function entryToCsvRow(e: ArchiveEntry): string {
  const cols = [
    e.digestId,
    new Date(e.sentAt).toISOString(),
    e.recipientId,
    e.topicTags.join("|"),
    String(e.itemCount),
    e.status,
    e.originalNotificationIds.join("|"),
    e.title ?? "",
    e.body ?? "",
  ];
  return cols.map(csvEscape).join(",");
}

/**
 * Serialize a search against the archive as a string. Query runs first so
 * exported data respects filters. Returns `null` on unrecognized format so
 * callers can fall back gracefully.
 */
export function exportArchiveSubset(
  query: Partial<ArchiveQuery>,
  archive: readonly ArchiveEntry[],
  format: "json" | "csv",
): string | null {
  const result = searchArchive(query, archive);
  if (format === "json") {
    try { return JSON.stringify(result, null, 2); } catch { return null; }
  }
  if (format === "csv") {
    const lines = [CSV_HEADER];
    for (const e of result.entries) lines.push(entryToCsvRow(e));
    return lines.join("\n");
  }
  return null;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Count archive entries by status — used by deliverability dashboards. */
export function countByStatus(
  archive: readonly ArchiveEntry[],
): Record<ArchiveStatus, number> {
  const out: Record<ArchiveStatus, number> = { sent: 0, read: 0, archived: 0, bounced: 0 };
  for (const e of archive) if (isStatus(e.status)) out[e.status] += 1;
  return out;
}

/**
 * Mark entries as `archived` if a predicate returns true. Used by
 * "move to archive" UI actions that batch-update status safely.
 */
export function markArchived(
  archive: readonly ArchiveEntry[],
  predicate: (entry: ArchiveEntry) => boolean,
): ArchiveEntry[] {
  if (typeof predicate !== "function") return archive.slice();
  const out: ArchiveEntry[] = [];
  for (const e of archive) {
    try {
      if (predicate(e) && e.status === "sent") out.push({ ...e, status: "archived" });
      else out.push(e);
    } catch {
      out.push(e);
    }
  }
  return out;
}
