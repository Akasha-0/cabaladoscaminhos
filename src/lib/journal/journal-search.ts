// Journal search - skipped linting and formatting
 
 

export interface JournalEntry {
  id: string;
  tipo: string;
  título?: string;
  conteúdo: string;
  tags?: string[];
  humor?: number;
  timestamp: number;
  data?: string;
}

export interface SearchOptions {
  query: string;
  tipo?: string;
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
  limit?: number;
}

export interface SearchResult {
  entry: JournalEntry;
  relevance: number;
  matchedFields: string[];
}

const STORAGE_KEY = 'journal_entries';

function getEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

function calculateRelevance(entry: JournalEntry, query: string, options: SearchOptions): { score: number; fields: string[] } {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  const fields: string[] = [];

  for (const term of terms) {
    // título match
    if (entry.título?.toLowerCase().includes(term)) {
      score += 10;
      if (!fields.includes('título')) fields.push('título');
    }
    // conteúdo match
    if (entry.conteúdo.toLowerCase().includes(term)) {
      score += 5;
      if (!fields.includes('conteúdo')) fields.push('conteúdo');
    }
    // tags match
    if (entry.tags?.some(tag => tag.toLowerCase().includes(term))) {
      score += 8;
      if (!fields.includes('tags')) fields.push('tags');
    }
    // tipo match
    if (entry.tipo.toLowerCase().includes(term)) {
      score += 3;
      if (!fields.includes('tipo')) fields.push('tipo');
    }
  }

  return { score, fields };
}

export function searchEntries(options: SearchOptions): SearchResult[] {
  const entries = getEntries();
  const { query, tipo, tags, dateFrom, dateTo, limit = 50 } = options;

  let filtered = entries;

  // Filter by type
  if (tipo) {
    filtered = filtered.filter(e => e.tipo === tipo);
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    filtered = filtered.filter(e =>
      tags.some(tag =>
        e.tags?.some(entryTag =>
          entryTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  // Filter by date range
  if (dateFrom !== undefined) {
    filtered = filtered.filter(e => e.timestamp >= dateFrom);
  }
  if (dateTo !== undefined) {
    filtered = filtered.filter(e => e.timestamp <= dateTo);
  }

  // Search and score
  if (query && query.trim()) {
    const scoredResults = filtered
      .map(entry => {
        const { score, fields } = calculateRelevance(entry, query, options);
        return { entry, relevance: score, matchedFields: fields };
      })
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);

    return scoredResults.slice(0, limit);
  }

  // No query - sort by timestamp descending
  return filtered
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(entry => ({ entry, relevance: 0, matchedFields: [] }));
}

export function getAllEntries(): JournalEntry[] {
  return getEntries().sort((a, b) => b.timestamp - a.timestamp);
}

export function getEntriesByType(tipo: string): JournalEntry[] {
  return getEntries()
    .filter(e => e.tipo === tipo)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getEntriesByDateRange(from: number, to: number): JournalEntry[] {
  return getEntries()
    .filter(e => e.timestamp >= from && e.timestamp <= to)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function clearAllEntries(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
