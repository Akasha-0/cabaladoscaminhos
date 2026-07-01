// ============================================================================
// HELP SEARCH — Unified search (FAQ + KB + Wiki + Videos) (Wave 36)
// ============================================================================
// Server-side full-text search across all help content.
//
// Implementação: in-memory index (mock). Em produção real, faríamos:
//   SELECT id, type, title, body, ts_rank
//   FROM (
//     SELECT 'faq' as type, id, question as title, answer as body
//     FROM faq_entries
//     WHERE search_vector @@ plainto_tsquery('portuguese', $1)
//     UNION ALL
//     SELECT 'kb', slug, title, content
//     FROM kb_articles
//     WHERE ...
//     ...
//   ) results
//   ORDER BY ts_rank DESC
//   LIMIT 50;
//
// Aqui mockamos com busca substring case-insensitive para entregar
// UI + tipagem + estrutura sem precisar do schema Postgres.
// ============================================================================

import type { FaqEntry } from './faq-data';
import type { KbArticleFull } from './kb-data';
import type { WikiArticle } from './wiki-data';
import type { VideoEntry } from './videos-data';
import { FAQ_ENTRIES } from './faq-data';
import { KB_ARTICLES } from './kb-data';
import { WIKI_ARTICLES } from './wiki-data';
import { VIDEOS } from './videos-data';

export type HelpResultType = 'faq' | 'kb' | 'wiki' | 'video';

export interface HelpResult {
  type: HelpResultType;
  id: string;       // slug or unique id
  title: string;
  url: string;
  excerpt: string;     // snippet with highlighted match
  score: number;       // ranking (higher = better)
  category?: string;
}

export interface HelpSearchResults {
  query: string;
  total: number;
  took_ms: number;
  results: HelpResult[];
  facets: {
    by_type: Record<HelpResultType, number>;
    by_category: Record<string, number>;
  };
  relatedSearches: string[];
}

// ============================================================================
// SEARCH ALGORITHM
// ============================================================================

const STOP_WORDS = new Set([
  'o', 'a', 'de', 'para', 'com', 'em', 'no', 'na', 'do', 'da',
  'que', 'se', 'é', 'e', 'ou', 'por', 'como', 'mas',
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents for matching
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function scoreMatch(
  tokens: string[],
  ...fields: Array<{ text: string; weight: number }>
): number {
  let score = 0;
  for (const field of fields) {
    const lower = field.text.toLowerCase();
    for (const token of tokens) {
      const occurrences = (lower.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
      score += occurrences * field.weight;
    }
  }
  return score;
}

function generateSnippet(text: string, tokens: string[]): string {
  if (tokens.length === 0) return text.slice(0, 200);
  const lower = text.toLowerCase();
  let earliestIdx = -1;
  for (const t of tokens) {
    const idx = lower.indexOf(t);
    if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
      earliestIdx = idx;
    }
  }
  if (earliestIdx === -1) return text.slice(0, 200) + '…';
  const start = Math.max(0, earliestIdx - 80);
  const end = Math.min(text.length, earliestIdx + 200);
  const snippet = text.slice(start, end);
  return (start > 0 ? '…' : '') + snippet + (end < text.length ? '…' : '');
}

export function searchAllHelp(
  query: string,
  options?: { type?: HelpResultType; category?: string; limit?: number },
): HelpSearchResults {
  const start = performance.now();
  const tokens = tokenize(query);
  const limit = options?.limit ?? 30;
  const results: HelpResult[] = [];

  // FAQ
  if (!options?.type || options.type === 'faq') {
    for (const e of FAQ_ENTRIES) {
      const score = scoreMatch(
        tokens,
        { text: e.question, weight: 3 },
        { text: e.answer, weight: 1 },
        { text: e.tags.join(' '), weight: 2 },
      );
      if (score > 0) {
        results.push({
          type: 'faq',
          id: e.id,
          title: e.question,
          url: `/help/faq#entry-${e.id}`,
          excerpt: generateSnippet(e.answer, tokens),
          score,
          category: e.category,
        });
      }
    }
  }

  // KB
  if (!options?.type || options.type === 'kb') {
    for (const a of KB_ARTICLES) {
      const score = scoreMatch(
        tokens,
        { text: a.title, weight: 3 },
        { text: a.excerpt, weight: 2 },
        { text: a.body.map((b) => 'text' in b ? b.text : b.kind === 'list' ? b.items.join(' ') : '').join(' '), weight: 1 },
        { text: a.author, weight: 0.5 },
      );
      if (score > 0) {
        const cat = a.category.includes('/') ? a.category.split('/')[0] : a.category;
        if (options?.category && cat !== options.category) continue;
        results.push({
          type: 'kb',
          id: a.slug,
          title: a.title,
          url: `/help/kb/${cat}/${a.slug.split('/').pop()}`,
          excerpt: generateSnippet(a.excerpt, tokens),
          score,
          category: cat,
        });
      }
    }
  }

  // Wiki
  if (!options?.type || options.type === 'wiki') {
    for (const a of WIKI_ARTICLES) {
      if (a.status !== 'published') continue;
      const score = scoreMatch(
        tokens,
        { text: a.title, weight: 3 },
        { text: a.excerpt, weight: 2 },
        { text: a.contentMarkdown, weight: 1 },
        { text: a.tags.join(' '), weight: 2 },
      );
      if (score > 0) {
        results.push({
          type: 'wiki',
          id: a.slug,
          title: a.title,
          url: `/wiki/${a.slug}`,
          excerpt: generateSnippet(a.excerpt, tokens),
          score,
          category: a.category,
        });
      }
    }
  }

  // Videos
  if (!options?.type || options.type === 'video') {
    for (const v of VIDEOS) {
      const score = scoreMatch(
        tokens,
        { text: v.title, weight: 3 },
        { text: v.description, weight: 2 },
        { text: v.transcript, weight: 1 },
      );
      if (score > 0) {
        results.push({
          type: 'video',
          id: v.slug,
          title: v.title,
          url: `/help/videos/${v.slug}`,
          excerpt: generateSnippet(v.description, tokens),
          score,
          category: v.category,
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  const sliced = results.slice(0, limit);

  // Facets
  const by_type: Record<HelpResultType, number> = { faq: 0, kb: 0, wiki: 0, video: 0 };
  const by_category: Record<string, number> = {};
  for (const r of results) {
    by_type[r.type]++;
    if (r.category) by_category[r.category] = (by_category[r.category] ?? 0) + 1;
  }

  // Related searches (simples — pega tags frequentes dos resultados)
  const relatedSearches: string[] = [];
  const seen = new Set<string>();
  for (const r of sliced.slice(0, 5)) {
    // Lower-case excerpt first significant noun phrase
    const words = r.excerpt.split(/\s+/).filter((w) => w.length > 4);
    if (words.length > 0 && !seen.has(words[0])) {
      relatedSearches.push(words[0]);
      seen.add(words[0]);
      if (relatedSearches.length >= 5) break;
    }
  }

  return {
    query,
    total: results.length,
    took_ms: Math.round(performance.now() - start),
    results: sliced,
    facets: { by_type, by_category },
    relatedSearches,
  };
}
