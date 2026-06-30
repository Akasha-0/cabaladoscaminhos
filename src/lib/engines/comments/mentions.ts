// mentions.ts — extract @username from text, build autocomplete matcher.
// Cycle 79 W79-D lesson: NFD-normalize both dictionary and search corpus
// to handle PT-BR diacritics (e.g. "Oxóssi" vs "Oxossi").
// Cycle W82: also HTML-escape handles to prevent injection in render.

import {
  asMentionHandle,
  type MentionHandle,
  type Usuario,
} from './types.ts';

/**
 * Strip combining diacritics, lowercase, trim. Used for
 * case- AND diacritic-insensitive matching.
 */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * HTML-escape a string for safe rendering in vnode children.
 * Stops < > & " ' from breaking the DOM.
 */
export function htmlEscape(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Pattern that matches an @handle on the NFD-stripped version of the text:
 *   - starts with @
 *   - followed by 2..24 chars of [A-Za-z0-9_]
 *
 * Diacritics in the source text are stripped BEFORE applying the regex
 * (cycle 79 W79-D lesson). The original index is recovered by remapping
 * NFD positions to original positions.
 */
const MENTION_RE = /(^|[^\w@])(@)([A-Za-z0-9_]{2,24})(?!\w)/g;

export interface ExtractedMention {
  readonly handle: MentionHandle;
  readonly index: number;
  readonly raw: string;
}

/**
 * Build a mapping from each position in the NFD-stripped text back to
 * the original text. Handles combining marks (one char → 2 in NFD form).
 */
function buildNfdIndexMap(text: string): number[] {
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    const nfd = ch.normalize('NFD');
    for (let j = 0; j < nfd.length; j++) {
      map.push(i);
    }
  }
  return map;
}

/**
 * Extract all @mentions from a body of text.
 * Returns handles WITHOUT the leading '@'.
 *
 * Example:
 *   extractMentions("Oi @cigano_ramiro tudo bem? @mãe_iyá") →
 *     [
 *       { handle: "cigano_ramiro", index: 3, raw: "@cigano_ramiro" },
 *       { handle: "mae_iya", ... }   // diacritics stripped via NFD
 *     ]
 */
export function extractMentions(text: string): ReadonlyArray<ExtractedMention> {
  const stripped = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const map = buildNfdIndexMap(text);
  const found: ExtractedMention[] = [];
  MENTION_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MENTION_RE.exec(stripped)) !== null) {
    // m[0] is the prefix + '@' + handle; we want the '@' position.
    const atPos = m.index + m[1]!.length;
    const handleRaw = m[3]!;
    const originalAtIndex = map[atPos] ?? atPos;
    const originalHandleEnd = map[atPos + 1 + handleRaw.length] ?? (originalAtIndex + 1 + handleRaw.length);
    const rawOriginal = text.slice(originalAtIndex, originalHandleEnd);
    try {
      const handle = asMentionHandle(handleRaw);
      found.push({ handle, index: originalAtIndex, raw: rawOriginal });
    } catch {
      // Invalid handle format — skip
    }
  }
  return Object.freeze(found);
}

/**
 * Resolve mentions to Usuario records. Skips handles that don't match
 * any active user. Returns deduped + frozen list.
 */
export function resolveMentions(
  text: string,
  users: ReadonlyArray<Usuario>,
): ReadonlyArray<Usuario> {
  const extracted = extractMentions(text);
  const seen = new Set<MentionHandle>();
  const out: Usuario[] = [];
  for (const { handle } of extracted) {
    if (seen.has(handle)) continue;
    const norm = normalize(handle);
    const match = users.find((u) => normalize(u.handle) === norm);
    if (match) {
      seen.add(match.handle);
      out.push(match);
    }
  }
  return Object.freeze(out);
}

/**
 * Detect an active @-mention token being typed at the cursor.
 * Returns the prefix (without @) or null.
 *
 * Heuristic: scan backwards from cursor until whitespace / start-of-string.
 */
export function detectActiveMentionPrefix(
  text: string,
  cursor: number,
): { readonly prefix: string; readonly startIndex: number } | null {
  if (cursor <= 0 || cursor > text.length) return null;
  const before = text.slice(0, cursor);
  // Walk back until whitespace
  let i = before.length;
  while (i > 0) {
    const ch = before.charAt(i - 1);
    if (ch === ' ' || ch === '\n' || ch === '\t') break;
    i--;
  }
  const token = before.slice(i);
  if (!token.startsWith('@')) return null;
  const prefix = token.slice(1);
  // Reject if contains chars that can't appear in a handle
  if (!/^[A-Za-z0-9_]*$/.test(prefix)) return null;
  return { prefix, startIndex: i };
}

export interface SuggestionMatch {
  readonly usuario: Usuario;
  readonly matchScore: number;
  readonly displayHandle: string; // with leading '@'
}

/**
 * Build suggestion list given a typed prefix.
 *   - exact prefix match (highest score)
 *   - prefix anywhere in handle (medium)
 *   - prefix in nome (lowest)
 *
 * Sorted by score desc, then alphabetically by handle.
 * Limited to `limit` results.
 */
export function matchSuggestions(
  prefix: string,
  users: ReadonlyArray<Usuario>,
  limit: number = 6,
): ReadonlyArray<SuggestionMatch> {
  const norm = normalize(prefix);
  if (norm.length === 0) return Object.freeze([]);

  const scored: SuggestionMatch[] = [];
  for (const u of users) {
    const hNorm = normalize(u.handle);
    const nNorm = normalize(u.nome);
    let score = 0;
    if (hNorm === norm) score = 100;
    else if (hNorm.startsWith(norm)) score = 80;
    else if (hNorm.includes(norm)) score = 60;
    else if (nNorm.startsWith(norm)) score = 40;
    else if (nNorm.includes(norm)) score = 20;
    if (score > 0) {
      scored.push({
        usuario: u,
        matchScore: score,
        displayHandle: '@' + u.handle,
      });
    }
  }
  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.usuario.handle.localeCompare(b.usuario.handle);
  });
  return Object.freeze(scored.slice(0, Math.max(0, limit)));
}

/**
 * Replace the active mention token at `startIndex` with the picked user.
 * Returns the new text + new cursor position.
 */
export function applyMentionPick(
  text: string,
  startIndex: number,
  user: Usuario,
  cursor: number,
): { readonly text: string; readonly cursor: number } {
  const before = text.slice(0, startIndex);
  const after = text.slice(cursor);
  const inserted = '@' + user.handle + ' ';
  return { text: before + inserted + after, cursor: before.length + inserted.length };
}

/**
 * Render body text with @mentions wrapped in <strong class="mention">,
 * HTML-escaping everything else. Used by CommentNode to render corpo.
 */
export function renderBodyWithMentions(
  raw: string,
  knownHandles: ReadonlyArray<MentionHandle>,
): string {
  const escaped = htmlEscape(raw);
  const knownNorm = new Set(knownHandles.map((h) => normalize(h)));
  // Replace @handle with strong tag, but only if the handle is known.
  return escaped.replace(
    /@([A-Za-z0-9_]{2,24})/g,
    (full, handleRaw: string) => {
      if (knownNorm.has(normalize(handleRaw))) {
        return `<strong class="mention">@${handleRaw}</strong>`;
      }
      return full;
    },
  );
}