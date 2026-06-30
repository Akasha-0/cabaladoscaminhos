// ============================================================================
// SPIRITUAL JOURNAL — index.ts (Wave 70, 2026-06-30)
// ============================================================================
// Public barrel for the spiritual-journal engine family.
//
// 4 engines, ~1,800 LOC:
//   - journal.ts    — CRUD, filters, LGPD, export
//   - prompts.ts    — 58 prompts across 7 traditions + universal
//   - tags.ts       — sacred extraction, tag cloud, catalog coverage
//   - linking.ts    — bidirectional linking (entry ↔ reading/ritual/checkin)
// ============================================================================

// ============================================================================
// JOURNAL — CRUD + LGPD + export
// ============================================================================

export {
  // Branded types
  asUserId,
  asEntryId,
  asTimestamp,
  asDateKey,
  asOduRef,
  // Enums / constants
  TRADITIONS,
  ELEMENTS,
  CHAKRAS,
  MOODS,
  MAX_CONTENT_LENGTH,
  // Domain types
  type Tradition,
  type Element,
  type Chakra,
  type OduRef,
  type Mood,
  type Tag,
  type Link,
  type LinkTargetType,
  type JournalEntry,
  type DateRange,
  type EntryFilters,
  type PaginatedEntries,
  type ValidationResult,
  type CreateEntryOptions,
  type UpdateEntryPatch,
  type ExportFormat,
  type JournalAudit,
  // CRUD
  createEntry,
  getEntry,
  listEntries,
  listEntriesPaginated,
  updateEntry,
  deleteEntry,
  eraseAllEntries,
  exportEntries,
  validateEntryContent,
  auditJournal,
  // HMAC store
  setHmacSecret,
  clearHmacSecret,
  clearAllStores as clearJournalStores,
  // Errors
  JournalError,
  EntryNotFoundError,
  JournalValidationError,
} from "./journal.ts";

// ============================================================================
// PROMPTS — 58 prompts across 7 traditions + universal
// ============================================================================

export {
  asPromptId,
  LOCALES,
  PROMPT_CATEGORIES,
  PROMPTS,
  type PromptId,
  type Locale,
  type PromptCategory,
  type Prompt,
  type UserState,
  type PromptAudit,
  getDailyPrompt,
  getPromptsByCategory,
  getPromptsByTradition,
  getRandomPrompt,
  localizePrompt,
  auditPromptCatalog,
  PromptCatalogError,
  PromptNotFoundError,
} from "./prompts.ts";

// ============================================================================
// TAGS — Sacred extraction + tag cloud + catalog coverage
// ============================================================================

export {
  asTagId,
  SACRED_CATALOG,
  REQUIRED_COVERAGE_FLOORS,
  TOTAL_CATALOG_FLOOR,
  validateTag,
  normalizeTag,
  extractTags,
  extractTagLabels,
  assertCatalogCoverage,
  catalogCoverage,
  getEntriesByTag,
  getTagCloud,
  mergeTags,
  TagCatalogError,
  type TagId,
  type SacredEntry,
  type ExtractedTag,
  type CatalogCoverage,
  type TagFrequency,
} from "./tags.ts";

// ============================================================================
// LINKING — Bidirectional entry ↔ reading/ritual/checkin
// ============================================================================

export {
  asReadingId,
  asRitualId,
  asCheckinId,
  setHmacSecret as setLinkingHmacSecret,
  clearHmacSecret as clearLinkingHmacSecret,
  clearAllStores as clearLinkingStores,
  linkToReading,
  linkToRitual,
  linkToCheckin,
  getLinkedEntries,
  getLinkedEntities,
  getLinksByEntity,
  getLinksByEntry,
  unlink,
  assertLinkIntegrity,
  LinkError,
  LinkValidationError,
  type ReadingId,
  type RitualId,
  type CheckinId,
  type EntityId,
  type LinkedEntity,
  type IntegrityReport,
} from "./linking.ts";

// LinkId is declared in journal.ts (canonical) — re-export for convenience
export { asLinkId, type LinkId } from "./journal.ts";