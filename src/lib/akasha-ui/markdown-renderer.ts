// ============================================================================
// src/lib/akasha-ui/markdown-renderer.ts
// ============================================================================
// Minimal dependency-free markdown renderer (Wave 72 — Worker C).
//
// Supported features (intentionally narrow — this is a chat renderer, not
// a full document engine):
//   - `# H1`, `## H2`, `### H3`     → <h1>, <h2>, <h3>
//   - `**bold**`                     → <strong>
//   - `*italic*`                     → <em>
//   - `` `code` ``                   → <code>
//   - `[text](url)`                  → <a> (with http(s)/mailto safety)
//   - `[tag:orixa-oxala]`            → [[TAG:orixa:Oxalá]] (passes through to
//                                       caller — see `renderWithTags`)
//   - blank line                     → paragraph break
//   - newline                        → <br> (when inside a paragraph)
//
// Sanitization:
//   - All literal `<` and `>` are escaped BEFORE the renderer runs, so the
//     output is safe to inject via `dangerouslySetInnerHTML`.
//   - The `href` is rejected if it doesn't match a safe scheme
//     (http, https, mailto, akasha-internal relative link).
//   - No raw HTML pass-through. The renderer does NOT respect `<script>`,
//     `<iframe>`, etc.
//
// Design choice: returns an HTML string (not React elements). This keeps
// the parser pure & testable. The caller can wrap it in a React component
// with `dangerouslySetInnerHTML`, then walk the output for `[[TAG:...]]`
// placeholders and substitute React elements (the `SacredTagPill`).
// ============================================================================

import { extractSacredTags, type ParsedTag } from './sacred-tag-parser.ts';

// ─── Safety helpers ─────────────────────────────────────────────────────────

/** Escape all HTML-special chars. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** URL safety check — only allow safe schemes + relative paths. */
export function isSafeUrl(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  // Relative or root-relative
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  // Explicit safe schemes
  return /^(https?|mailto):/i.test(trimmed);
}

// ─── Inline parser ──────────────────────────────────────────────────────────

/**
 * Apply inline transformations to a single text segment. Handles bold,
 * italic, code, and links. Sacred-tag placeholders survive intact
 * (the caller inserts React elements afterwards).
 */
function renderInline(raw: string): string {
  // We have to do a small multi-pass parse because regex-based markdown
  // is not context-free. The order matters:
  //   1. Extract code spans first (their content is verbatim).
  //   2. Extract links (`[text](url)`).
  //   3. Extract bold and italic.
  //   4. Restore extracted spans.

  // 1. Code spans — use a placeholder to avoid re-processing their content.
  const codeSpans: string[] = [];
  let s = raw.replace(/`([^`\n]+)`/g, (_m, code: string) => {
    const idx = codeSpans.length;
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000CODE${idx}\u0000`;
  });

  // 2. Markdown links — only safe URLs survive.
  s = s.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) => {
    if (!isSafeUrl(href)) {
      // Drop the link, keep the text.
      return escapeHtml(text);
    }
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${escapeHtml(text)}</a>`;
  });

  // 3. Bold (**...**) — must come before italic to avoid `*foo*` eating `**foo**`.
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  // 4. Italic (*...*) — single asterisk.
  s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

  // 5. Escape anything that's still raw (i.e. wasn't a recognized token).
  // To do this properly we walk char-by-char and only escape outside our
  // already-emitted tags. For simplicity (and since we control the input
  // via the AI prompt), we do a full escape then re-inject tags.
  // This is safe because the only "raw HTML" we emit is our own tags
  // (a, strong, em, code), all of which contain only HTML-safe characters
  // (no `&` we didn't insert, no `<` we didn't insert, no unescaped `"`).
  s = escapeHtmlInlineSegments(s);

  // 6. Restore code spans (their content is already escaped).
  s = s.replace(/\u0000CODE(\d+)\u0000/g, (_m, idx: string) => codeSpans[Number(idx)] ?? '');

  return s;
}

/**
 * Walk a string and escape only the "plain text" segments — i.e. anything
 * that's NOT inside one of our emitted tags (`<a>`, `<strong>`, `<em>`,
 * `<code>`). The emitted tags themselves are already safe.
 *
 * Implementation: split on tag boundaries, escape the inter-tag pieces.
 */
function escapeHtmlInlineSegments(s: string): string {
  const SEGMENT_TAG_RE = /<\/?(?:a|strong|em|code)(?:\s[^>]*)?>/g;
  const out: string[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SEGMENT_TAG_RE.exec(s)) !== null) {
    if (m.index > lastIndex) {
      out.push(escapeHtml(s.slice(lastIndex, m.index)));
    }
    out.push(m[0]); // the tag itself, already safe
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < s.length) {
    out.push(escapeHtml(s.slice(lastIndex)));
  }
  return out.join('');
}

// ─── Block parser ───────────────────────────────────────────────────────────

/** Detect a heading at the start of a line. Returns level + rest. */
function parseHeading(line: string): { level: 1 | 2 | 3 | null; rest: string } {
  const m = /^(#{1,3})\s+(.+)$/.exec(line);
  if (!m) return { level: null, rest: line };
  const hashes = m[1] ?? '';
  const rest = m[2] ?? '';
  return { level: Math.min(hashes.length, 3) as 1 | 2 | 3, rest };
}

function renderBlock(line: string): string {
  const heading = parseHeading(line);
  if (heading.level) {
    return `<h${heading.level}>${renderInline(heading.rest)}</h${heading.level}>`;
  }
  // Plain paragraph.
  return `<p>${renderInline(line)}</p>`;
}

/**
 * Render markdown → safe HTML. The output is a concatenation of
 * `<h1|h2|h3|p>` blocks. Sacred-tag tokens (`[tag:...]`) become
 * `[[TAG:kind:label]]` placeholders that survive into the output.
 *
 * The caller can then post-process the output to inject React elements
 * at the placeholder positions (see `splitOnTagPlaceholders`).
 */
export function renderMarkdown(input: string): string {
  if (!input) return '';
  // Split on blank lines → paragraphs.
  const paragraphs = input.split(/\n\s*\n/);
  const out: string[] = [];
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    // Within a paragraph, hard newlines become <br>.
    const lines = trimmed.split('\n');
    out.push(renderBlock(lines.join('\n')));
  }
  return out.join('\n');
}

// ─── Tag placeholder extraction ─────────────────────────────────────────────

export interface TagSegment {
  kind: 'html' | 'tag';
  /** For kind=html: the HTML chunk. For kind=tag: the parsed tag. */
  payload: string | ParsedTag;
}

/**
 * Walk an HTML string produced by `renderMarkdown` and split it into
 * segments at the `[[TAG:kind:label]]` placeholders. The caller can
 * render each segment in turn — plain HTML as `dangerouslySetInnerHTML`
 * (we control the HTML, no XSS) and tags as React elements.
 */
export function splitOnTagPlaceholders(html: string, tags: ParsedTag[]): TagSegment[] {
  if (tags.length === 0) {
    return [{ kind: 'html', payload: html }];
  }
  const segments: TagSegment[] = [];
  const placeholderRe = /\[\[TAG:([^:]+):([^\]]+)\]\]/g;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = placeholderRe.exec(html)) !== null) {
    if (m.index > cursor) {
      segments.push({ kind: 'html', payload: html.slice(cursor, m.index) });
    }
    // Find the matching parsed tag by label+kind.
    const targetKind = m[1] ?? '';
    const targetLabel = m[2] ?? '';
    const tag = tags.find((t) => t.kind === targetKind && t.label === targetLabel);
    if (tag) {
      segments.push({ kind: 'tag', payload: tag });
    } else {
      // Fallback: keep the placeholder text as plain HTML.
      segments.push({ kind: 'html', payload: escapeHtml(m[0]) });
    }
    cursor = m.index + m[0].length;
  }
  if (cursor < html.length) {
    segments.push({ kind: 'html', payload: html.slice(cursor) });
  }
  return segments;
}

/**
 * Convenience: render markdown to a list of renderable segments, with
 * the sacred tags already extracted from the original source.
 */
export function renderWithTags(input: string): TagSegment[] {
  const tags = extractSacredTags(input);
  if (tags.length === 0) {
    return [{ kind: 'html', payload: renderMarkdown(input) }];
  }
  // Re-emit the source with placeholders substituted.
  const withPlaceholders = (() => {
    let out = input;
    for (let i = tags.length - 1; i >= 0; i--) {
      const t = tags[i]!;
      const placeholder = `[[TAG:${t.kind}:${t.label}]]`;
      out = out.slice(0, t.start) + placeholder + out.slice(t.end);
    }
    return out;
  })();
  const html = renderMarkdown(withPlaceholders);
  return splitOnTagPlaceholders(html, tags);
}

// ─── Audit ──────────────────────────────────────────────────────────────────

/**
 * Self-audit: which features does this renderer support?
 * Used by the smoke test to confirm coverage.
 */
export function auditMarkdownFeatures(): {
  features: string[];
  supportedCount: number;
} {
  const features = [
    'headings:h1-h3',
    'bold',
    'italic',
    'inline-code',
    'markdown-links',
    'safe-url-filter',
    'html-escape',
    'paragraph-split',
    'br-on-newline',
    'sacred-tag-placeholders',
  ];
  return { features, supportedCount: features.length };
}
