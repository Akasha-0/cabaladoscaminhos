// ============================================================================
// SPIRITUAL JOURNAL — linking.ts (Wave 70, 2026-06-30)
// ============================================================================
// Bidirectional linking between journal entries and other entities:
//   - Readings (from w69 reading-history + mesa-real)
//   - Rituals (from w67 dream-journal rituals + w68)
//   - Check-ins (from w69 energy-mood-checkin)
//
// Design:
//   - Link is bidirectional (entry ↔ entity). Single source of truth:
//     _linksById (linkId -> Link). Reverse index: _linksByEntity.
//   - getLinkedEntities(entryId) reads from _linksById via sourceEntryId scan.
//   - getLinkedEntries(entityId) reads from _linksByEntity index.
//   - When link is created, entry.links is NOT mutated (cross-store coupling).
//     The journal entry's `links` field is informational; the link registry
//     is authoritative for cross-entity queries. (Cycle 60 lesson: one source
//     of truth, explicit propagation.)
//
// Cross-cycle lessons applied:
//   - Branded types (cycle 65)
//   - HMAC + canonical JSON (cycle 67 lesson 5)
//   - In-memory Maps with explicit clearAllStores (cycle 60+)
// ============================================================================

import type {
  JournalEntry,
  Link,
  LinkTargetType,
  EntryId,
  UserId,
  Tag,
  Timestamp,
  LinkId,
} from "./journal.ts";
import {
  listEntries,
  getEntry,
  asEntryId,
  asUserId,
  asTimestamp,
  asLinkId,
} from "./journal.ts";

// ============================================================================
// BRANDED TYPES — Distinct IDs for each entity type
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type ReadingId = Brand<string, "ReadingId">;
export type RitualId = Brand<string, "RitualId">;
export type CheckinId = Brand<string, "CheckinId">;
export type EntityId = ReadingId | RitualId | CheckinId;

export const asReadingId = (s: string): ReadingId => s as ReadingId;
export const asRitualId = (s: string): RitualId => s as RitualId;
export const asCheckinId = (s: string): CheckinId => s as CheckinId;

// ============================================================================
// LINKED ENTITY (output of getLinkedEntities)
// ============================================================================

export interface LinkedEntity {
  readonly id: string;
  readonly type: LinkTargetType;
  readonly entryId: EntryId;
  readonly linkId: LinkId;
  readonly createdAt: number;
}

// ============================================================================
// HMAC + STORAGE
// ============================================================================

let _hmacSecret = "";

export const setHmacSecret = (secret: string): void => {
  _hmacSecret = secret;
};

export const clearHmacSecret = (): void => {
  _hmacSecret = "";
};

// linkId -> Link (canonical)
const _linksById = new Map<LinkId, Link>();
// entityId -> Set<linkId> (reverse index for entity → entries)
const _linksByEntity = new Map<string, Set<LinkId>>();
// entryId -> Set<linkId> (forward index for entry → entities)
const _linksByEntry = new Map<EntryId, Set<LinkId>>();

export const clearAllStores = (): void => {
  _linksById.clear();
  _linksByEntity.clear();
  _linksByEntry.clear();
};

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function makeLinkId(
  entryId: EntryId,
  entityId: string,
  type: LinkTargetType,
): LinkId {
  const payload = `${entryId}|${entityId}|${type}|${_hmacSecret}|${Date.now()}`;
  return asLinkId(
    `lnk_${fnv1a(payload)}_${Math.floor(Math.random() * 1e9).toString(36)}`,
  );
}

function indexEntityAdd(key: string, linkId: LinkId): void {
  const set = _linksByEntity.get(key);
  if (set) set.add(linkId);
  else _linksByEntity.set(key, new Set([linkId]));
}

function indexEntryAdd(key: EntryId, linkId: LinkId): void {
  const set = _linksByEntry.get(key);
  if (set) set.add(linkId);
  else _linksByEntry.set(key, new Set([linkId]));
}

function indexEntityRemove(key: string, linkId: LinkId): void {
  const set = _linksByEntity.get(key);
  if (set) {
    set.delete(linkId);
    if (set.size === 0) _linksByEntity.delete(key);
  }
}

function indexEntryRemove(key: EntryId, linkId: LinkId): void {
  const set = _linksByEntry.get(key);
  if (set) {
    set.delete(linkId);
    if (set.size === 0) _linksByEntry.delete(key);
  }
}

// ============================================================================
// LINK CREATION — Single source of truth in _linksById
// ============================================================================

function createLink(
  entryId: EntryId,
  targetEntityId: string,
  targetEntityType: LinkTargetType,
): Link {
  const entry = getEntry(entryId);
  if (!entry) throw new LinkValidationError(`Entry ${entryId} not found`);
  if (entry.deletedAt !== undefined) {
    throw new LinkValidationError(`Entry ${entryId} is deleted`);
  }
  if (!targetEntityId || typeof targetEntityId !== "string") {
    throw new LinkValidationError("targetEntityId required");
  }

  // Duplicate-link guard (cycle 60 lesson: idempotency)
  const existingIds = _linksByEntry.get(entryId);
  if (existingIds) {
    for (const lid of existingIds) {
      const l = _linksById.get(lid);
      if (l && l.targetEntityId === targetEntityId && l.targetEntityType === targetEntityType) {
        return l; // idempotent
      }
    }
  }

  const linkId = makeLinkId(entryId, targetEntityId, targetEntityType);
  const link: Link = Object.freeze({
    id: linkId,
    sourceEntryId: entryId,
    targetEntityId,
    targetEntityType,
    createdAt: asTimestamp(Date.now()),
  });
  _linksById.set(linkId, link);
  indexEntityAdd(targetEntityId, linkId);
  indexEntryAdd(entryId, linkId);
  return link;
}

export function linkToReading(
  entryId: EntryId,
  readingId: ReadingId,
): Link {
  return createLink(entryId, readingId, "reading");
}

export function linkToRitual(
  entryId: EntryId,
  ritualId: RitualId,
): Link {
  return createLink(entryId, ritualId, "ritual");
}

export function linkToCheckin(
  entryId: EntryId,
  checkinId: CheckinId,
): Link {
  return createLink(entryId, checkinId, "checkin");
}

// ============================================================================
// GET LINKED ENTRIES — Reverse: entity → journal entries
// ============================================================================

export function getLinkedEntries(
  entityId: string,
  entityType: LinkTargetType,
): readonly JournalEntry[] {
  const linkIds = _linksByEntity.get(entityId);
  if (!linkIds || linkIds.size === 0) return Object.freeze([]);
  const result: JournalEntry[] = [];
  for (const linkId of linkIds) {
    const link = _linksById.get(linkId);
    if (!link) continue;
    if (link.targetEntityType !== entityType) continue;
    const entry = getEntry(link.sourceEntryId);
    if (!entry || entry.deletedAt !== undefined) continue;
    result.push(entry);
  }
  return Object.freeze(result.sort((a, b) => b.createdAt - a.createdAt));
}

// ============================================================================
// GET LINKED ENTITIES — Forward: entry → linked entities
// ============================================================================

export function getLinkedEntities(entryId: EntryId): readonly LinkedEntity[] {
  const entry = getEntry(entryId);
  if (!entry) return Object.freeze([]);
  const linkIds = _linksByEntry.get(entryId);
  if (!linkIds || linkIds.size === 0) return Object.freeze([]);
  const result: LinkedEntity[] = [];
  for (const linkId of linkIds) {
    const link = _linksById.get(linkId);
    if (!link) continue;
    result.push({
      id: link.targetEntityId,
      type: link.targetEntityType,
      entryId: link.sourceEntryId,
      linkId: link.id,
      createdAt: link.createdAt as unknown as number,
    });
  }
  return Object.freeze(
    result.sort((a, b) => a.createdAt - b.createdAt),
  );
}

// ============================================================================
// UNLINK — Remove link by ID
// ============================================================================

export function unlink(linkId: LinkId): boolean {
  const link = _linksById.get(linkId);
  if (!link) return false;
  _linksById.delete(linkId);
  indexEntityRemove(link.targetEntityId, linkId);
  indexEntryRemove(link.sourceEntryId, linkId);
  return true;
}

// ============================================================================
// GET LINKS BY ENTITY
// ============================================================================

export function getLinksByEntity(
  entityId: string,
  entityType?: LinkTargetType,
): readonly Link[] {
  const linkIds = _linksByEntity.get(entityId);
  if (!linkIds) return Object.freeze([]);
  const out: Link[] = [];
  for (const lid of linkIds) {
    const l = _linksById.get(lid);
    if (!l) continue;
    if (entityType && l.targetEntityType !== entityType) continue;
    out.push(l);
  }
  return Object.freeze(out);
}

export function getLinksByEntry(entryId: EntryId): readonly Link[] {
  const linkIds = _linksByEntry.get(entryId);
  if (!linkIds) return Object.freeze([]);
  const out: Link[] = [];
  for (const lid of linkIds) {
    const l = _linksById.get(lid);
    if (l) out.push(l);
  }
  return Object.freeze(out);
}

// ============================================================================
// INTEGRITY CHECK — Detect orphan links (cycle 60+ lesson)
// ============================================================================

export interface IntegrityReport {
  readonly userId: UserId;
  readonly totalEntries: number;
  readonly totalLinks: number;
  readonly orphanLinkIds: readonly LinkId[];
  readonly byEntityType: Readonly<Record<LinkTargetType, number>>;
  readonly integrityOk: boolean;
}

export function assertLinkIntegrity(userId: UserId): IntegrityReport {
  const entries = listEntries(userId, { includeDeleted: true });
  const validEntryIds = new Set(entries.map((e) => e.id));
  const orphanLinkIds: LinkId[] = [];
  const byEntityType: Record<LinkTargetType, number> = {
    reading: 0,
    ritual: 0,
    checkin: 0,
  };

  let totalLinks = 0;
  for (const [, linkIds] of _linksByEntry) {
    for (const lid of linkIds) {
      const l = _linksById.get(lid);
      if (!l) {
        orphanLinkIds.push(lid);
        continue;
      }
      totalLinks += 1;
      byEntityType[l.targetEntityType] += 1;
      // Orphan = entry deleted or not in user's entries
      if (!validEntryIds.has(l.sourceEntryId)) {
        orphanLinkIds.push(lid);
      } else {
        const entry = getEntry(l.sourceEntryId);
        if (!entry || entry.deletedAt !== undefined) {
          orphanLinkIds.push(lid);
        }
      }
    }
  }

  return {
    userId,
    totalEntries: entries.length,
    totalLinks,
    orphanLinkIds: Object.freeze(orphanLinkIds),
    byEntityType: Object.freeze(byEntityType),
    integrityOk: orphanLinkIds.length === 0,
  };
}

// ============================================================================
// ERRORS
// ============================================================================

export class LinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LinkError";
  }
}

export class LinkValidationError extends LinkError {
  constructor(message: string) {
    super(message);
    this.name = "LinkValidationError";
  }
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type { JournalEntry, Link, EntryId, UserId, Tag };