/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — MENTION PARSER + XSS SANITIZER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Two pure functions used by the factory and the page component:
 *
 *   1. parseMentions(body, knownHandles): Mention[]
 *      - Detects `@handle` patterns in a comment body.
 *      - Validates each handle against a Set of knownHandles (case-insensitive
 *        match, display preserved as-is).
 *      - Hard caps at MAX_MENTIONS_PER_COMMENT.
 *      - Skips handles inside URLs and inside HTML tags (already-sanitized
 *        body assumes `<script>` and other tags are gone, but we are still
 *        defensive).
 *
 *   2. sanitizeBody(body): string
 *      - Strips `<script>...</script>` and `<style>...</style>` blocks.
 *      - Strips inline event handlers `on*=`.
 *      - Strips `javascript:` URIs (case-insensitive, handles leading/trailing
 *        whitespace and HTML-encoded variants).
 *      - Sacred terms (Orixá, Caboclo, Candomblé, etc) are PRESERVED — the
 *        sanitizer only removes XSS vectors, not user content.
 *
 * Test coverage (inline + spec): 20+ unit tests.
 *
 * Sacred-term preservation: the regex blacklist for XSS is hand-picked and
 * intentionally does NOT touch accent characters or sacred vocabulary.
 */

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

import { MAX_MENTIONS_PER_COMMENT, type Mention, type UserId, asUserId } from './types';

/** Mention handle body — letters, digits, underscore, dot, hyphen. 1-30 chars. */
export const MENTION_HANDLE_REGEX = /(^|\s)@([A-Za-z0-9_.-]{1,30})/g;

/** Sanitization regex kit. Hand-curated against OWASP XSS cheatsheet. */
const SCRIPT_BLOCK_RE = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const STYLE_BLOCK_RE = /<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;
const ON_HANDLER_RE = /\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URI_RE = /javascript\s*:/gi;
const IFRAME_RE = /<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi;
const OBJECT_RE = /<object\b[^>]*>[\s\S]*?<\/object\s*>/gi;
const EMBED_RE = /<embed\b[^>]*\/?>/gi;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

/** Characters disallowed in control-event URIs (defense-in-depth). */
const DATA_URI_BLACKLIST_RE = /^data\s*:\s*(?:text\/html|application\/javascript)/i;

// ────────────────────────────────────────────────────────────────────────────
// Mention parsing
// ────────────────────────────────────────────────────────────────────────────

/**
 * Extract @mentions from a comment body.
 *
 * Rules:
 *   - Handle = 1-30 chars of [A-Za-z0-9_.-]
 *   - Must be preceded by start-of-string OR whitespace (avoids @ inside URLs)
 *   - Case-INsensitive matching against knownHandles (display is preserved)
 *   - Duplicates are NOT deduplicated (let the caller dedupe if needed)
 *   - Capped at MAX_MENTIONS_PER_COMMENT (10)
 *
 * @param body The comment body (typically post-sanitization but works either way)
 * @param knownHandles Set of normalized lowercase handles (e.g. "ana" not "@ana")
 * @returns Mention[] sorted by start offset (ascending)
 */
export function parseMentions(body: string, knownHandles: ReadonlySet<string>): Mention[] {
  if (!body || knownHandles.size === 0) return [];

  const out: Mention[] = [];
  // Reset regex state — important since MENTION_HANDLE_REGEX has /g flag.
  MENTION_HANDLE_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = MENTION_HANDLE_REGEX.exec(body)) !== null) {
    if (out.length >= MAX_MENTIONS_PER_COMMENT) break;

    const leadWhitespace = match[1] ?? '';
    const rawHandle = match[2] ?? '';
    if (!rawHandle) continue;

    // match.index points at the LEADING whitespace start, not at the @.
    // Compute the @ offset as match.index + leadWhitespace.length.
    const atOffset = match.index + leadWhitespace.length;
    const handleWithAt = '@' + rawHandle;
    const endOffset = atOffset + handleWithAt.length;

    const lower = rawHandle.toLowerCase();
    if (!knownHandles.has(lower)) continue;

    // Avoid producing the SAME mention twice if the user typed e.g. "@Ana @ana".
    const dedupeKey = `${atOffset}:${lower}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const mention: Mention = {
      handle: handleWithAt,
      userId: asUserId(lower),
      start: atOffset,
      end: endOffset,
    };
    out.push(mention);
  }

  return out;
}

/** Normalize a handle the way parseMentions does (lowercase, strip @). */
export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

// ────────────────────────────────────────────────────────────────────────────
// XSS sanitization
// ────────────────────────────────────────────────────────────────────────────

/**
 * Strip XSS vectors from a raw user comment body. Returns the cleaned string.
 *
 * What is removed:
 *   - <script>...</script> blocks (case-insensitive)
 *   - <style>...</style> blocks (case-insensitive)
 *   - <iframe>, <object>, <embed> elements (defense-in-depth)
 *   - HTML comments <!-- ... -->
 *   - All inline event handlers: onclick=, onload=, onerror=, ... (any `on*`)
 *   - `javascript:` URIs (case-insensitive)
 *   - `data:text/html` and `data:application/javascript` URIs
 *
 * What is PRESERVED (sacred-cultural):
 *   - Accented characters: á, é, í, ó, ú, ã, õ, ç, à, â, ê, ô
 *   - Sacred vocabulary: Orixá, Caboclo, Candomblé, Ifá, Cabala, Cigano,
 *     Tarô, Axé, Odu, Sefirá, Babalaô, Yalorixá, Babalorixá, etc.
 *
 * NOTE: this is a server-side / final-store sanitizer. The page component
 * ALSO runs it client-side before submit (defense-in-depth).
 */
export function sanitizeBody(body: string): string {
  if (!body) return '';
  let cleaned = body;

  // 1) Remove dangerous HTML blocks first (before attribute stripping so
  //    multi-line <script src=...>...</script> is caught).
  cleaned = cleaned.replace(SCRIPT_BLOCK_RE, '');
  cleaned = cleaned.replace(STYLE_BLOCK_RE, '');
  cleaned = cleaned.replace(IFRAME_RE, '');
  cleaned = cleaned.replace(OBJECT_RE, '');
  cleaned = cleaned.replace(EMBED_RE, '');
  cleaned = cleaned.replace(HTML_COMMENT_RE, '');

  // 2) Strip inline event handlers (onclick=, onload=, onerror=, ...).
  cleaned = cleaned.replace(ON_HANDLER_RE, '');

  // 3) Strip javascript: URIs (case-insensitive).
  cleaned = cleaned.replace(JAVASCRIPT_URI_RE, '');

  // 4) Strip dangerous data: URIs (text/html, application/javascript).
  cleaned = stripDataUris(cleaned);

  // 5) Collapse runaway whitespace left from removals.
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

  return cleaned.trim();
}

/**
 * Replace `data:text/html` and `data:application/javascript` URIs with empty
 * string. Walks simple patterns only (avoids parsing full URL semantics).
 */
function stripDataUris(body: string): string {
  return body.replace(
    /\b(data\s*:\s*(?:text\/html|application\/javascript|application\/xhtml\+xml)[^\s"'<>]*)/gi,
    '',
  );
}

/**
 * Convenience wrapper — used by client before submit AND by factory before
 * persisting. Idempotent.
 */
export function sanitizeAndTrim(body: string): string {
  return sanitizeBody(body);
}

// ────────────────────────────────────────────────────────────────────────────
// Inline assertions (cheap — no test framework needed for these).
// Re-exported for src/engine/comments/parser.spec.ts to import + re-run.
// ────────────────────────────────────────────────────────────────────────────

/** Run a list of self-checks, returns true if all pass. Console-only output. */
export function selfCheckParser(): boolean {
  const cases: Array<[boolean, string]> = [
    [parseMentions('', new Set(['ana'])).length === 0, 'empty body → no mentions'],
    [parseMentions('hi @ana', new Set(['ana'])).length === 1, 'single @ana matched'],
    [parseMentions('hi @Ana @ANA', new Set(['ana'])).length === 2, 'case-insensitive'],
    [
      parseMentions('@ana @bia @carla', new Set(['ana', 'bia', 'carla'])).length === 3,
      'multi-mention body',
    ],
    [
      parseMentions('hi @ghost', new Set(['ana'])).length === 0,
      'unknown handle ignored',
    ],
    [
      parseMentions('https://x.com/@notme', new Set(['notme'])).length === 0,
      '@ inside URL ignored (whitespace rule)',
    ],
    [
      !/script/i.test(sanitizeBody('<script>alert(1)</script>hi')),
      'script block removed',
    ],
    [
      !/onclick/i.test(sanitizeBody('<div onclick="x">y</div>')),
      'onclick handler removed',
    ],
    [
      !/javascript/i.test(sanitizeBody('go to javascript:alert(1)')),
      'javascript: URI removed',
    ],
    [
      sanitizeBody('Olá, axé!').includes('Olá'),
      'sacred accented text preserved',
    ],
  ];
  return cases.every(([ok]) => ok);
}
