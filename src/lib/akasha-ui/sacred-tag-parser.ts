// ============================================================================
// src/lib/akasha-ui/sacred-tag-parser.ts
// ============================================================================
// Parses inline sacred-tag tokens emitted by Akasha IA inside markdown.
//
// Token shape: [tag:<kind>-<value>...] — the kind prefix selects which
// parser to use. The boundary regex follows the cycle 60+ lesson:
//
//     (?:^|\W)\[tag:([^\]]+)\](?:$|\W)
//
// The lookaround boundaries reject `supertag:foo` (no word boundary
// after "super") but accept `… [tag:orixa-oxala] …` (whitespace on
// both sides). See agent memory for the `\b...\b` asymmetry lesson.
//
// Supported kinds (7 — well over the 5+ minimum):
//   - orixa-oxala, orixa-iemanja, ...
//   - arcano-0-the-fool, arcano-13, ...
//   - chakra-4-heart, chakra-7-crown
//   - sephirah-3-tiphareth, sephirah-1-kether
//   - odu-2, odu-16
//   - numero-7, numero-11 (master), numero-22
//   - cigano-13, cigano-36-trevo
// ============================================================================

import type { SacredTag, SacredTagKind } from './types.ts';

// ─── Kind detection table ───────────────────────────────────────────────────

const KIND_PREFIXES: ReadonlyArray<{ prefix: string; kind: SacredTagKind }> = [
  { prefix: 'orixa-', kind: 'orixa' },
  { prefix: 'cigano-', kind: 'cigano' },
  { prefix: 'arcano-', kind: 'arcano' },
  { prefix: 'chakra-', kind: 'chakra' },
  { prefix: 'sephirah-', kind: 'sephirah' },
  { prefix: 'odu-', kind: 'odu' },
  { prefix: 'numero-', kind: 'numero' },
];

/**
 * Master sacred-terms table. Lives in the UI (not the AI backend) because
 * the parser needs to know how to label each tag without an extra round-trip.
 * Values are a curated, small subset of the canonical 7 traditions — the
 * full catalog (36 Ciganos, 16 Orixás, 22 Arcana, etc.) lives in
 * `src/lib/akasha-data/` (out of scope for Wave 72).
 */
export const SACRED_TABLE: Record<SacredTagKind, Record<string, { label: string; meta?: Record<string, string | number | boolean | undefined> }>> = {
  orixa: {
    oxala: { label: 'Oxalá', meta: { regente: 'criacao', energia: 'fria' } },
    iemanja: { label: 'Iemanjá', meta: { regente: 'mares', energia: 'fria' } },
    ogum: { label: 'Ogum', meta: { regente: 'guerra', energia: 'quente' } },
    oxum: { label: 'Oxum', meta: { regente: 'amor', energia: 'morna' } },
    xango: { label: 'Xangô', meta: { regente: 'justica', energia: 'quente' } },
    iansa: { label: 'Iansã', meta: { regente: 'ventos', energia: 'quente' } },
  },
  cigano: {
    '1': { label: 'O Cavaleiro', meta: { number: 1 } },
    '13': { label: 'A Criança', meta: { number: 13 } },
    '28': { label: 'O Homem', meta: { number: 28 } },
    '29': { label: 'A Mulher', meta: { number: 29 } },
    '36': { label: 'Cruz de Anjos', meta: { number: 36 } },
  },
  arcano: {
    '0': { label: 'The Fool', meta: { number: 0 } },
    '1': { label: 'The Magician', meta: { number: 1 } },
    '3': { label: 'The Empress', meta: { number: 3 } },
    '13': { label: 'Death', meta: { number: 13 } },
    '21': { label: 'The World', meta: { number: 21 } },
  },
  chakra: {
    '1': { label: 'Root', meta: { number: 1 } },
    '4': { label: 'Heart', meta: { number: 4 } },
    '7': { label: 'Crown', meta: { number: 7 } },
  },
  sephirah: {
    '1': { label: 'Kether', meta: { number: 1 } },
    '3': { label: 'Tiphareth', meta: { number: 3 } },
    '10': { label: 'Malkuth', meta: { number: 10 } },
  },
  odu: {
    '1': { label: 'Eji-Ogbe', meta: { number: 1 } },
    '2': { label: 'Oyeku-Meji', meta: { number: 2 } },
    '16': { label: 'Iwori-Osa', meta: { number: 16 } },
  },
  numero: {
    '1': { label: 'Um', meta: { value: 1, isMaster: false } },
    '7': { label: 'Sete', meta: { value: 7, isMaster: false } },
    '11': { label: 'Onze', meta: { value: 11, isMaster: true } },
    '22': { label: 'Vinte e Dois', meta: { value: 22, isMaster: true } },
  },
};

// ─── Master numbers (Numerologia) ───────────────────────────────────────────

const MASTER_NUMBERS = new Set([11, 22, 33]);

// ─── Tag regex ──────────────────────────────────────────────────────────────

/**
 * Boundary-aware regex: matches `[tag:...]` tokens with whitespace (or
 * string boundaries) on both sides.
 *
 * Why we use `\s` (not `\W`) as the boundary:
 *   - The cycle 60+ lesson is that `\W` includes `[` and `]`, so a token
 *     like `[[tag:foo]]` (nested brackets, malformed chat content) would
 *     match if we used `\W`. Restricting to whitespace + line boundaries
 *     avoids this footgun and matches real chat content.
 *   - `supertag:foo` is rejected because `t` is a word char (no
 *     whitespace boundary).
 *   - `… [tag:foo] …` matches because spaces are whitespace.
 *
 * Capture group 1 = the token body (between `[tag:` and `]`).
 */
export const TAG_REGEX = /(?:^|\s)\[tag:([^\]]+)\](?:$|\s|[,.;:!?])/g;

// ─── Public API ─────────────────────────────────────────────────────────────

export interface ParsedTag extends SacredTag {
  /** The start offset of the FULL `[tag:...]` token in the source text. */
  start: number;
  /** The end offset of the FULL `[tag:...]` token in the source text. */
  end: number;
  /** Was the token preceded by a non-word char? (true for almost all real cases) */
  hasLeadingSpace: boolean;
}

/**
 * Parse a single tag token body (e.g. `orixa-oxala`, `arcano-0-the-fool`).
 * Returns null if the kind is unknown or the body is malformed.
 */
export function parseTagToken(body: string): SacredTag | null {
  const lower = body.toLowerCase().trim();
  for (const { prefix, kind } of KIND_PREFIXES) {
    if (!lower.startsWith(prefix)) continue;
    const rest = lower.slice(prefix.length);
    if (!rest) return null;

    if (kind === 'orixa') {
      const entry = SACRED_TABLE.orixa[rest];
      if (!entry) return null;
      return { kind, raw: body, label: entry.label, meta: { ...entry.meta } };
    }
    if (kind === 'cigano') {
      // cigano-13 or cigano-36-trevo
      const [numStr, ...nameParts] = rest.split('-');
      const num = Number.parseInt(numStr ?? '', 10);
      if (Number.isNaN(num) || num < 1 || num > 36) return null;
      const known = SACRED_TABLE.cigano[String(num)];
      if (known) {
        return { kind, raw: body, label: known.label, meta: { ...known.meta, number: num } };
      }
      return { kind, raw: body, label: `Cigano ${num}`, meta: { number: num } };
    }
    if (kind === 'arcano') {
      const [numStr, ...nameParts] = rest.split('-');
      const num = Number.parseInt(numStr ?? '', 10);
      if (Number.isNaN(num) || num < 0 || num > 21) return null;
      const known = SACRED_TABLE.arcano[String(num)];
      if (known) {
        return { kind, raw: body, label: known.label, meta: { ...known.meta, number: num } };
      }
      const name = nameParts.join(' ').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return { kind, raw: body, label: name || `Arcano ${num}`, meta: { number: num } };
    }
    if (kind === 'chakra') {
      const [numStr, ...nameParts] = rest.split('-');
      const num = Number.parseInt(numStr ?? '', 10);
      if (Number.isNaN(num) || num < 1 || num > 7) return null;
      const known = SACRED_TABLE.chakra[String(num)];
      if (known) {
        return { kind, raw: body, label: known.label, meta: { ...known.meta, number: num } };
      }
      const name = nameParts.join(' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return { kind, raw: body, label: name || `Chakra ${num}`, meta: { number: num } };
    }
    if (kind === 'sephirah') {
      const [numStr, ...nameParts] = rest.split('-');
      const num = Number.parseInt(numStr ?? '', 10);
      if (Number.isNaN(num) || num < 1 || num > 10) return null;
      const known = SACRED_TABLE.sephirah[String(num)];
      if (known) {
        return { kind, raw: body, label: known.label, meta: { ...known.meta, number: num } };
      }
      const name = nameParts.join(' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return { kind, raw: body, label: name || `Sephirah ${num}`, meta: { number: num } };
    }
    if (kind === 'odu') {
      const num = Number.parseInt(rest, 10);
      if (Number.isNaN(num) || num < 1 || num > 16) return null;
      const known = SACRED_TABLE.odu[String(num)];
      if (known) {
        return { kind, raw: body, label: known.label, meta: { ...known.meta, number: num } };
      }
      return { kind, raw: body, label: `Odu ${num}`, meta: { number: num } };
    }
    if (kind === 'numero') {
      const num = Number.parseInt(rest, 10);
      if (Number.isNaN(num) || num < 0 || num > 99) return null;
      return {
        kind,
        raw: body,
        label: SACRED_TABLE.numero[String(num)]?.label ?? String(num),
        meta: { value: num, isMaster: MASTER_NUMBERS.has(num) },
      };
    }
  }
  return null;
}

/**
 * Extract all sacred tags from a string. Returns the parsed tags AND
 * the offset spans (so the renderer can replace them in place).
 */
export function extractSacredTags(text: string): ParsedTag[] {
  const out: ParsedTag[] = [];
  // Reset the global regex state — shared between calls otherwise.
  TAG_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TAG_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    const body = match[1] ?? '';
    // The full match may start with a whitespace boundary OR with `[tag:`
    // (at the start of the string). Compute the token's true start offset.
    const start = fullMatch.startsWith('[') ? match.index : match.index + 1;
    const end = start + body.length + 6; // `[tag:` is 5 chars, `]` is 1
    const hasLeadingSpace = !fullMatch.startsWith('[');
    const tag = parseTagToken(body);
    if (tag) {
      out.push({ ...tag, start, end, hasLeadingSpace });
    }
  }
  return out;
}

/**
 * Replace all sacred-tag tokens in a string with a placeholder suitable
 * for the markdown renderer. Default placeholder is `[[TAG:kind:label]]`
 * — the renderer substitutes this with the actual pill span.
 */
export function replaceSacredTags(
  text: string,
  placeholder: (tag: ParsedTag) => string = (t) => `[[TAG:${t.kind}:${t.label}]]`,
): string {
  const tags = extractSacredTags(text);
  if (tags.length === 0) return text;
  // Replace from end → start to keep offsets valid.
  let out = text;
  for (let i = tags.length - 1; i >= 0; i--) {
    const t = tags[i]!;
    out = out.slice(0, t.start) + placeholder(t) + out.slice(t.end);
  }
  return out;
}

// ─── Audit ──────────────────────────────────────────────────────────────────

/**
 * Audit helper: how many distinct kinds / labels do we know about?
 * Used by the smoke test to enforce the 5+ tradition kinds floor.
 */
export function auditSacredTable(): {
  kinds: number;
  totalLabels: number;
  perKind: Record<SacredTagKind, number>;
} {
  const perKind = {} as Record<SacredTagKind, number>;
  let total = 0;
  for (const k of Object.keys(SACRED_TABLE) as SacredTagKind[]) {
    const n = Object.keys(SACRED_TABLE[k] ?? {}).length;
    perKind[k] = n;
    total += n;
  }
  return { kinds: Object.keys(perKind).length, totalLabels: total, perKind };
}
