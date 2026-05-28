// ============================================================
// SEARCH INDEXING - CABALA DOS CAMINHOS
// ============================================================
// Search indexing and index management
// ============================================================

export interface IndexEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  score?: number;
  indexedAt: number;
}

export interface IndexStats {
  totalEntries: number;
  lastRebuilt: number | null;
  entryCountByType: Record<string, number>;
}

export interface IndexOptions {
  type?: string;
  limit?: number;
  minScore?: number;
}

// In-memory index storage (replace with database or search engine in production)
const indexStore: Map<string, IndexEntry> = new Map();
let lastRebuiltAt: number | null = null;

const MAX_ENTRIES_PER_TYPE = 10000;

function generateId(type: string, title: string): string {
  const normalized = `${type}:${title.toLowerCase().replace(/\s+/g, '-')}`;
  const hash = normalized.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return `${normalized}-${Math.abs(hash).toString(36)}`;
}

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function calculateScore(entry: IndexEntry, query: string): number {
  const terms = tokenize(query);
  const content = entry.content.toLowerCase();
  const title = entry.title.toLowerCase();
  let score = 0;

  for (const term of terms) {
    const contentMatches = (content.match(new RegExp(term, 'g')) || []).length;
    const titleMatches = (title.match(new RegExp(term, 'g')) || []).length;
    score += contentMatches * 1 + titleMatches * 3;
  }

  return score;
}

export function addToIndex(
  id: string,
  type: string,
  title: string,
  content: string,
  metadata?: Record<string, unknown>
): void {
  if (!id || !type || !title || !content) return;

  const entry: IndexEntry = {
    id,
    type,
    title,
    content,
    metadata,
    indexedAt: Date.now(),
  };

  indexStore.set(id, entry);
}

export function removeFromIndex(id: string): boolean {
  return indexStore.delete(id);
}

export function searchIndex(query: string, options: IndexOptions = {}): IndexEntry[] {
  if (!query || query.trim().length === 0) return [];

  const { type, limit = 50, minScore = 1 } = options;

  let results: IndexEntry[];

  if (type) {
    results = Array.from(indexStore.values()).filter((entry) => entry.type === type);
  } else {
    results = Array.from(indexStore.values());
  }

  results = results
    .map((entry) => ({
      ...entry,
      score: calculateScore(entry, query),
    }))
    .filter((entry) => entry.score >= minScore)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);

  return results;
}

export function getIndexStats(): IndexStats {
  const entries = Array.from(indexStore.values());
  const entryCountByType: Record<string, number> = {};

  for (const entry of entries) {
    entryCountByType[entry.type] = (entryCountByType[entry.type] || 0) + 1;
  }

  return {
    totalEntries: entries.length,
    lastRebuilt: lastRebuiltAt,
    entryCountByType,
  };
}

export function clearIndex(): void {
  indexStore.clear();
  lastRebuiltAt = null;
}

export function rebuildIndex(entries: Array<{
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}>): void {
  clearIndex();

  for (const entry of entries.slice(0, MAX_ENTRIES_PER_TYPE)) {
    addToIndex(entry.id, entry.type, entry.title, entry.content, entry.metadata);
  }

  lastRebuiltAt = Date.now();
}

export function getIndexEntry(id: string): IndexEntry | undefined {
  return indexStore.get(id);
}

export function getEntriesByType(type: string): IndexEntry[] {
  return Array.from(indexStore.values()).filter((entry) => entry.type === type);
}

export function updateIndexEntry(
  id: string,
  updates: Partial<Pick<IndexEntry, 'title' | 'content' | 'metadata'>>
): boolean {
  const entry = indexStore.get(id);
  if (!entry) return false;

  const updated: IndexEntry = {
    ...entry,
    ...updates,
  };

  indexStore.set(id, updated);
  return true;
}

export function createIndex(): {
  add: typeof addToIndex;
  remove: typeof removeFromIndex;
  search: typeof searchIndex;
  stats: typeof getIndexStats;
  clear: typeof clearIndex;
  rebuild: typeof rebuildIndex;
  get: typeof getIndexEntry;
  getByType: typeof getEntriesByType;
  update: typeof updateIndexEntry;
} {
  return {
    add: addToIndex,
    remove: removeFromIndex,
    search: searchIndex,
    stats: getIndexStats,
    clear: clearIndex,
    rebuild: rebuildIndex,
    get: getIndexEntry,
    getByType: getEntriesByType,
    update: updateIndexEntry,
  };
}
