// ============================================================================
// src/lib/akasha-ui/types.ts
// ============================================================================
// Shared types for the Akasha streaming chat UI (Wave 72 — Worker C).
//
// Akasha IA is a *curadora* (knowledge curator), never a *prescritora* —
// this module's type surface is intentionally minimal. The streaming
// protocol emits four event kinds: token, citation, tag, done.
//
// The protocol is independent of the existing `/api/akashic/chat/stream`
// (Wave 26) — it uses a *single* JSON line per event with a `type`
// discriminator, NOT the multi-event SSE format. This keeps the parser
// simple and the contract human-readable in `curl` / `logs`.
// ============================================================================

/**
 * The seven traditions honored by the Akasha IA. Order = render order
 * in the tradition filter pill bar (most foundational first).
 */
export const TRADITIONS = [
  'Cigano',
  'Orixás',
  'Astrologia',
  'Cabala',
  'Numerologia',
  'Tantra',
  'Tarot',
] as const;

export type Tradition = typeof TRADITIONS[number];

/** Tradition slug used on the wire (matches the API enum, kebab-case). */
export function traditionToSlug(t: Tradition): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** A citation emitted by the model. UI renders these as inline chips. */
export interface Citation {
  /** Stable id from the RAG store. */
  id: string;
  /** Human-readable title (paper name, book chapter, etc.). */
  title: string;
  /** URL slug — used to deep-link to the source. */
  slug: string;
  /** Cosine similarity [0,1] — used for sort order and color shading. */
  similarity: number;
  /** Optional short excerpt surfaced in the chip tooltip. */
  excerpt?: string;
  /** Tradition this citation belongs to (e.g. 'cabala', 'cigano'). */
  tradition?: string;
  /** DOI / external link. */
  doi?: string;
}

/**
 * Sacred tag kinds. The model emits tokens like `[tag:orixa-oxala]`,
 * `[tag:arcano-0-the-fool]`, `[tag:chakra-4]`, `[tag:sephirah-3]`,
 * `[tag:odu-2]`, `[tag:numero-7]`, `[tag:arcano-cigano-13]`. The parser
 * normalizes the raw token into one of these kinds.
 */
export type SacredTagKind =
  | 'orixa'
  | 'arcano'
  | 'chakra'
  | 'sephirah'
  | 'odu'
  | 'numero'
  | 'cigano';

/**
 * A parsed sacred tag. The `meta` shape depends on the kind:
 *   - orixa:    { regente?, energia?: 'fria'|'quente'|'morna' }
 *   - arcano:   { number: 0-21, name: string }
 *   - chakra:   { number: 1-7, name: string }
 *   - sephirah: { number: 1-10, name: string }
 *   - odu:      { number: 1-16, name: string }
 *   - numero:   { value: number, isMaster?: boolean }
 *   - cigano:   { number: 1-36, name: string }
 */
export interface SacredTag {
  kind: SacredTagKind;
  /** The original token text without the `[tag:...]` wrapper. */
  raw: string;
  /** Canonical display label, e.g. "Oxalá" or "The Fool". */
  label: string;
  meta: Record<string, string | number | boolean | undefined>;
}

/**
 * SSE-style streaming protocol event (single-line JSON).
 * Discriminated union on `type`.
 */
export type StreamEvent =
  | { type: 'token'; payload: { content: string } }
  | { type: 'citation'; payload: Citation }
  | { type: 'tag'; payload: { raw: string; tag: SacredTag } }
  | { type: 'done'; payload: { tokens: number; took_ms: number } }
  | { type: 'error'; payload: { code: string; message: string } };

/**
 * A single chat turn as rendered by the UI. Mirrors the state in
 * `useAkashaStream` (the hook that lives in `src/hooks/use-akasha-stream.ts`).
 */
export interface AkashaMessage {
  id: string;
  role: 'user' | 'assistant';
  /** Raw streamed content. The renderer is responsible for markdown + tags. */
  content: string;
  citations?: Citation[];
  /** Tags accumulated during streaming (in arrival order). */
  tags?: SacredTag[];
  error?: boolean;
  /** Per-message metadata (model, took_ms, etc.). */
  meta?: {
    model: string;
    took_ms: number;
    rag_degraded?: boolean;
    deep_mode?: boolean;
  };
}
