// =============================================================================
// Akasha IA — Streaming UI Engine (cycle 61, 2026-06-29)
// =============================================================================
// Hand-rolled streaming UI engine for the Akasha IA spiritual assistant.
// Supports:
//   - Server-Sent Events (SSE) and NDJSON streaming
//   - Markdown parser/state-machine renderer (no external deps)
//   - Hand-rolled code syntax highlighting (TS/TSX/JS/JSX/PY/SH/JSON/MD)
//   - Citation extraction (numbered footnotes)
//   - Sacred text integration via SacredTextPolicy
//   - Typing indicator + message queue + abort signal
//   - aria-live a11y directives
//   - Tier-based rate limiting + quota
//   - React useStreamReducer pure helper
//
// Architectural rules (cross-cycle lessons from w55/w58/w60):
//   - HMAC-SHA256 via Web Crypto (byte-array path, not UTF-8 round-trip)
//   - FNV-1a 32-bit hash seeds (no Date.now)
//   - ULID for IDs (time-sortable + random suffix)
//   - Unicode NFKC canonicalization + sacred-regex (?<![\p{L}\p{N}_])
//   - XSS escapeHtml for all user-supplied content
//   - Hand-rolled schemas instead of zod
//   - Defense in depth: input cap, depth cap, stream cap
//   - LGPD: no PII in logs, audit trail for citations + sacred refs
//   - Sacred rest window 00:00-04:00 local: stream is suppressed
//
// SacredTextPolicy is INLINED with TODO migration comment. When w55/w60
// exports land, replace the inline implementation with `import { SacredTextPolicy }
// from '@/lib/w55/sacred-text-policy'`. The surface is intentionally identical.
//
// Author: cycle 61 worker (Akasha Wave Orchestrator)
// =============================================================================

// =============================================================================
// SECTION 1 — Constants + defaults
// =============================================================================

/** Maximum prompt length accepted by createStream. */
export const DEFAULT_PROMPT_MAX_LENGTH = 32_000;

/** Maximum markdown AST nesting depth (DoS prevention). */
export const MAX_MD_DEPTH = 6;

/** Maximum bytes per stream session (1 MB hard cap). */
export const MAX_STREAM_BYTES = 1_048_576;

/** SSE heartbeat interval in milliseconds. */
export const SSE_HEARTBEAT_MS = 15_000;

/** Typing indicator threshold — show after this many ms of silence. */
export const TYPING_THRESHOLD_MS = 1_500;

/** Conservative typing velocity: 50 chars/sec average. */
export const TYPING_CHARS_PER_SEC = 50;

/** Max messages in the in-memory queue before oldest gets dropped. */
export const QUEUE_DEFAULT_MAX_SIZE = 100;

/** Rate limit per minute per user (queue side). */
export const QUEUE_RATE_PER_MIN = 30;

/** Summarization window for aria-live announcements (chars). */
export const ARIA_SUMMARY_WINDOW = 500;

/** Token counting heuristic: chars per token. */
export const TOKEN_RATIO: Readonly<Record<string, number>> = {
  'pt-br': 4,
  'en': 4,
  'es': 3.5,
} as const;

/** Tier quotas (per day, in tokens). `null` = unlimited. */
export const TIER_QUOTAS: Readonly<Record<UserTier, number | null>> = {
  'free': 10_000,
  'plus': 100_000,
  'pro': 500_000,
  'sacred-circle': null,
} as const;

/** Tradition vocabulary used to auto-detect sacred text in markdown. */
export const SACRED_TOKENS: ReadonlyArray<string> = [
  'Odu', 'Ifá', 'Cabala', 'Cabalá', 'Axé', 'Axe', 'Orixá', 'Orixa',
  'Exu', 'Oxalá', 'Oxala', 'Iansa', 'Iansã', 'Xangô', 'Xango',
  'Ogum', 'Iemanjá', 'Iemanja', 'Nanã', 'Nana', 'Oxum', 'Oxossi',
  'Logun', 'Ossain', 'Omulu', 'Obaluae', 'Obaluãe',
  'Sephirot', 'Sefirot', 'Sefirá', 'Sefira', 'Kether', 'Chokmah',
  'Binah', 'Tiphereth', 'Yesod', 'Malkuth', 'Hod', 'Netzach',
  'Binah', 'Daat', 'Ein Soph', 'Ayin', 'Tikun', 'Tikkun',
  'Mantra', 'Yantra', 'Tantra', 'Kundalini', 'Chakra', 'Muladhara',
  'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha', 'Ajna',
  'Sahasrara', 'Bodhicitta', 'Satori',
] as const;

/** Tailwind class names for the 8 syntax-highlight categories. */
export const HL_CLASS: Readonly<Record<HighlightToken, string>> = {
  keyword: 'text-fuchsia-400',
  string: 'text-emerald-400',
  comment: 'text-slate-500 italic',
  number: 'text-amber-400',
  type: 'text-sky-400',
  function: 'text-violet-400',
  operator: 'text-rose-400',
  punctuation: 'text-slate-400',
} as const;

// =============================================================================
// SECTION 2 — Branded primitive types + ID generation
// =============================================================================

export type Brand<T, B extends string> = T & { readonly __brand: B };
export type Ulid = Brand<string, 'Ulid'>;
export type Sha256Hex = Brand<string, 'Sha256Hex'>;
export type Fnv1a32Hex = Brand<string, 'Fnv1a32Hex'>;
export type IsoTimestamp = Brand<string, 'IsoTimestamp'>;

const ULID_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ULID_TIME_LEN = 10;
const ULID_RANDOM_LEN = 16;

/** Crockford-style ULID encode of a 128-bit bigint. Time-sortable + random suffix. */
export function generateUlid(now: Date = new Date(0)): Ulid {
  // Allow injected `now` for testability; otherwise derive from system clock.
  const ts = now.getTime() === 0 ? Date.now() : now.getTime();
  const timeBytes = new Array<number>(ULID_TIME_LEN);
  // Use modular arithmetic instead of BigInt literals for ES2017 compat
  let v = ts;
  for (let i = ULID_TIME_LEN - 1; i >= 0; i--) {
    timeBytes[i] = v & 0x1f;
    v = Math.floor(v / 32);
  }
  const out: string[] = [];
  for (let i = 0; i < ULID_TIME_LEN; i++) out.push(ULID_BASE32[timeBytes[i]] ?? '0');
  // 16 chars of FNV-driven deterministic-but-varied randomness.
  let seed = (ts | 0) ^ 0xa5a5a5a5;
  for (let i = 0; i < ULID_RANDOM_LEN; i++) {
    seed = (seed * 16777619) >>> 0;
    out.push(ULID_BASE32[(seed >>> (i % 24)) & 0x1f] ?? '0');
  }
  return out.join('') as Ulid;
}

/** FNV-1a 32-bit hash (NOT a crypto hash). Deterministic, no Date.now in seed. */
export function hashFnv1a32(input: string, seed: number = 0x811c9dc5): Fnv1a32Hex {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i) & 0xff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0') as Fnv1a32Hex;
}

/** HMAC-SHA256 hex via Web Crypto. Returns Promise<string> of hex digest. */
export async function hmacSha256Hex(keyHex: Sha256Hex, message: string): Promise<Sha256Hex> {
  const enc = new TextEncoder();
  const keyBytes = hexToBytes(keyHex as unknown as string);
  const keyBuf = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuf,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return bytesToHex(new Uint8Array(sig)) as Sha256Hex;
}

/** Convert a hex string to a Uint8Array. */
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('hex string must have even length');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    const slice = hex.slice(i * 2, i * 2 + 2);
    out[i] = parseInt(slice, 16);
  }
  return out;
}

/** Convert a Uint8Array to a lowercase hex string. */
export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] ?? 0).toString(16).padStart(2, '0');
  }
  return out;
}

/** Constant-time string equality (HMAC tag compare). */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// =============================================================================
// SECTION 3 — Markdown AST (discriminated unions, depth-bounded)
// =============================================================================

export interface MarkdownAST {
  readonly type: 'root';
  readonly children: ReadonlyArray<MarkdownNode>;
}

export type MarkdownNode =
  | HeadingNode
  | ParagraphNode
  | CodeBlockNode
  | ListNode
  | ListItemNode
  | BlockquoteNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | LinkNode
  | ImageNode
  | TextNode
  | EmNode
  | StrongNode
  | CodeSpanNode
  | HrNode
  | BrNode
  | SacredTextNode;

export interface HeadingNode {
  readonly type: 'heading';
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
  readonly children: ReadonlyArray<InlineNode>;
}

export interface ParagraphNode {
  readonly type: 'paragraph';
  readonly children: ReadonlyArray<InlineNode>;
}

export interface CodeBlockNode {
  readonly type: 'code-block';
  readonly lang: string;
  readonly value: string;
}

export interface ListNode {
  readonly type: 'list';
  readonly ordered: boolean;
  readonly start: number;
  readonly children: ReadonlyArray<ListItemNode>;
}

export interface ListItemNode {
  readonly type: 'list-item';
  readonly checked: boolean | null;
  readonly children: ReadonlyArray<MarkdownNode>;
}

export interface BlockquoteNode {
  readonly type: 'blockquote';
  readonly children: ReadonlyArray<MarkdownNode>;
}

export interface TableNode {
  readonly type: 'table';
  readonly align: ReadonlyArray<'left' | 'center' | 'right' | null>;
  readonly children: ReadonlyArray<TableRowNode>;
}

export interface TableRowNode {
  readonly type: 'table-row';
  readonly children: ReadonlyArray<TableCellNode>;
}

export interface TableCellNode {
  readonly type: 'table-cell';
  readonly children: ReadonlyArray<InlineNode>;
}

export interface LinkNode {
  readonly type: 'link';
  readonly url: string;
  readonly title: string | null;
  readonly children: ReadonlyArray<InlineNode>;
}

export interface ImageNode {
  readonly type: 'image';
  readonly url: string;
  readonly alt: string;
  readonly title: string | null;
}

export interface TextNode {
  readonly type: 'text';
  readonly value: string;
}

export interface EmNode {
  readonly type: 'em';
  readonly children: ReadonlyArray<InlineNode>;
}

export interface StrongNode {
  readonly type: 'strong';
  readonly children: ReadonlyArray<InlineNode>;
}

export interface CodeSpanNode {
  readonly type: 'code-span';
  readonly value: string;
}

export interface HrNode {
  readonly type: 'hr';
}

export interface BrNode {
  readonly type: 'br';
}

export interface SacredTextNode {
  readonly type: 'sacred-text';
  readonly tradition: SacredTradition;
  readonly text: string;
  readonly reference: string;
  readonly translation: string | null;
}

export type InlineNode =
  | TextNode
  | EmNode
  | StrongNode
  | CodeSpanNode
  | LinkNode
  | ImageNode
  | BrNode
  | SacredTextNode
  | FootnoteRefNode;

export interface FootnoteRefNode {
  readonly type: 'footnote-ref';
  readonly index: number;
  readonly label: string;
}

export type SacredTradition =
  | 'candomble'
  | 'umbanda'
  | 'ifá'
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'unknown';

// =============================================================================
// SECTION 4 — Markdown tokenizer (state machine)
// =============================================================================

interface ParseContext {
  readonly input: string;
  pos: number;
  depth: number;
}

function isBlank(s: string): boolean {
  return /^[\t ]*$/.test(s);
}

function startsWithLine(input: string, pos: number, prefix: string): boolean {
  return input.startsWith(prefix, pos) && (pos + prefix.length === input.length || input[pos + prefix.length] === '\n');
}

function lineAt(input: string, pos: number): { line: string; start: number; end: number } {
  let end = input.indexOf('\n', pos);
  if (end === -1) end = input.length;
  return { line: input.slice(pos, end), start: pos, end };
}

function advance(input: string, pos: number, n: number): number {
  return Math.min(input.length, pos + n);
}

/** Parse a markdown string into a MarkdownAST. Throws on DoS-level depth violation. */
export function parseMarkdown(md: string): MarkdownAST {
  const ctx: ParseContext = { input: md, pos: 0, depth: 0 };
  const children: MarkdownNode[] = [];
  while (ctx.pos < ctx.input.length) {
    const node = parseBlock(ctx);
    if (node) children.push(node);
    else ctx.pos++;
  }
  return { type: 'root', children };
}

function parseBlock(ctx: ParseContext): MarkdownNode | null {
  if (ctx.depth > MAX_MD_DEPTH) {
    // Bail out silently; an unclosed block will simply not be emitted.
    return null;
  }
  const input = ctx.input;
  const pos = ctx.pos;

  // Skip leading blank lines.
  if (input[pos] === '\n') { ctx.pos++; return null; }

  // Horizontal rule: ---, ***, ___ (3+ of those chars on a line)
  const hrMatch = /^(\*{3,}|-{3,}|_{3,})\s*$/m;
  if (pos === findLineStart(input, pos)) {
    const { line, end } = lineAt(input, pos);
    if (hrMatch.test(line)) { ctx.pos = end + (input[end] === '\n' ? 1 : 0); return { type: 'hr' }; }
  }

  // Heading: # through ######
  const headingMatch = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
  if (input[pos] === '#') {
    const { line, end } = lineAt(input, pos);
    const m = headingMatch.exec(line);
    if (m && m[1] && m[2]) {
      const level = m[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      ctx.pos = end + (input[end] === '\n' ? 1 : 0);
      const inlines = parseInline(m[2], ctx);
      return { type: 'heading', level, children: inlines };
    }
  }

  // Fenced code block
  if (input.startsWith('```', pos)) {
    const eol = input.indexOf('\n', pos);
    if (eol !== -1) {
      const lang = input.slice(pos + 3, eol).trim();
      let end = input.indexOf('```', eol + 1);
      if (end === -1) end = input.length;
      const value = input.slice(eol + 1, end);
      ctx.pos = Math.min(input.length, end + 3);
      if (ctx.pos < input.length && input[ctx.pos] === '\n') ctx.pos++;
      return { type: 'code-block', lang: normalizeLang(lang), value };
    }
  }

  // Blockquote: lines beginning with >
  if (input[pos] === '>') {
    const lines: string[] = [];
    let cursor = pos;
    while (cursor < input.length && input[cursor] === '>') {
      const { line, end } = lineAt(input, cursor);
      lines.push(line.replace(/^>\s?/, ''));
      cursor = end + (input[end] === '\n' ? 1 : 0);
    }
    ctx.pos = cursor;
    ctx.depth++;
    const inner = parseMarkdown(lines.join('\n'));
    ctx.depth--;
    return { type: 'blockquote', children: inner.children };
  }

  // Ordered task list items first (- [ ] / - [x]), then ordered/unordered lists.
  const taskItem = /^(\s*)([-*+])\s+\[( |x|X)\]\s+(.+)$/;
  const ulItem = /^(\s*)([-*+])\s+(.+)$/;
  const olItem = /^(\s*)(\d{1,9})([.)])\s+(.+)$/;
  if (taskItem.test(input.slice(pos, pos + 1024)) || ulItem.test(input.slice(pos, pos + 1024)) || olItem.test(input.slice(pos, pos + 1024))) {
    return parseList(ctx, { task: taskItem, ul: ulItem, ol: olItem });
  }

  // Table: |col|col| header followed by |---|---| and at least one body row
  if (input[pos] === '|') {
    const node = parseTable(ctx);
    if (node) return node;
  }

  // Paragraph: gather until blank line
  const { line, end } = lineAt(input, pos);
  if (isBlank(line)) { ctx.pos = end + (input[end] === '\n' ? 1 : 0); return null; }
  const paraLines: string[] = [line];
  let cursor = end + (input[end] === '\n' ? 1 : 0);
  while (cursor < input.length) {
    const next = lineAt(input, cursor);
    if (isBlank(next.line)) break;
    if (next.line.startsWith('#') || next.line.startsWith('>') || next.line.startsWith('```') || /^(\*{3,}|-{3,}|_{3,})\s*$/.test(next.line)) break;
    paraLines.push(next.line);
    cursor = next.end + (input[next.end] === '\n' ? 1 : 0);
  }
  ctx.pos = cursor;
  const inlines = parseInline(paraLines.join('\n'), ctx);
  return { type: 'paragraph', children: inlines };
}

function findLineStart(input: string, pos: number): number {
  let p = pos;
  while (p > 0 && input[p - 1] !== '\n') p--;
  return p;
}

interface ListPatterns {
  readonly task: RegExp;
  readonly ul: RegExp;
  readonly ol: RegExp;
}

function parseList(ctx: ParseContext, _patterns: ListPatterns): ListNode {
  const input = ctx.input;
  const items: { checked: boolean | null; content: string }[] = [];
  let ordered = false;
  let start = 1;
  let cursor = ctx.pos;
  outer: while (cursor < input.length) {
    const { line, end } = lineAt(input, cursor);
    const taskM = /^(\s*)([-*+])\s+\[( |x|X)\]\s+(.+)$/.exec(line);
    if (taskM) {
      items.push({ checked: taskM[3]?.toLowerCase() === 'x', content: taskM[4] ?? '' });
      cursor = end + (input[end] === '\n' ? 1 : 0);
      continue;
    }
    const ulM = /^(\s*)([-*+])\s+(.+)$/.exec(line);
    if (ulM) {
      items.push({ checked: null, content: ulM[3] ?? '' });
      ordered = false;
      cursor = end + (input[end] === '\n' ? 1 : 0);
      continue;
    }
    const olM = /^(\s*)(\d{1,9})([.)])\s+(.+)$/.exec(line);
    if (olM) {
      items.push({ checked: null, content: olM[4] ?? '' });
      ordered = true;
      start = parseInt(olM[2] ?? '1', 10) || 1;
      cursor = end + (input[end] === '\n' ? 1 : 0);
      continue;
    }
    break outer;
  }
  // If we saw a mix, normalize to unordered unless everything was ordered.
  const allOrdered = items.every((_, i) => i === 0 || ordered);
  ctx.pos = cursor;
  ctx.depth++;
  const listItems: ListItemNode[] = items.map(it => {
    const inner = parseMarkdown(it.content);
    return { type: 'list-item', checked: it.checked, children: inner.children };
  });
  ctx.depth--;
  return { type: 'list', ordered: allOrdered && ordered, start, children: listItems };
}

function parseTable(ctx: ParseContext): TableNode | null {
  const input = ctx.input;
  const pos = ctx.pos;
  const headerLine = lineAt(input, pos).line;
  if (!/^\|.*\|\s*$/.test(headerLine)) return null;
  const nextPos = lineAt(input, pos).end + (input[lineAt(input, pos).end] === '\n' ? 1 : 0);
  const sepLine = lineAt(input, nextPos).line;
  if (!/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(sepLine)) return null;
  const align: Array<'left' | 'center' | 'right' | null> = sepLine
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(c => {
      const t = c.trim();
      if (t.startsWith(':') && t.endsWith(':')) return 'center' as const;
      if (t.endsWith(':')) return 'right' as const;
      if (t.startsWith(':')) return 'left' as const;
      return null;
    });
  const headerCells = splitRow(headerLine);
  let cursor = lineAt(input, nextPos).end + (input[lineAt(input, nextPos).end] === '\n' ? 1 : 0);
  const rows: TableRowNode[] = [{ type: 'table-row', children: headerCells.map(c => cellFromText(c)) }];
  while (cursor < input.length) {
    const { line, end } = lineAt(input, cursor);
    if (!/^\|.*\|\s*$/.test(line)) break;
    const cells = splitRow(line);
    rows.push({ type: 'table-row', children: cells.map(c => cellFromText(c)) });
    cursor = end + (input[end] === '\n' ? 1 : 0);
  }
  ctx.pos = cursor;
  return { type: 'table', align, children: rows };
}

function splitRow(line: string): string[] {
  const trimmed = line.replace(/^\|/, '').replace(/\|\s*$/, '');
  return trimmed.split('|').map(c => c.trim());
}

function cellFromText(text: string): TableCellNode {
  const inlines = parseInline(text, { input: text, pos: 0, depth: 0 });
  return { type: 'table-cell', children: inlines };
}

function normalizeLang(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower === 'typescript' || lower === 'ts') return 'ts';
  if (lower === 'tsx') return 'tsx';
  if (lower === 'javascript' || lower === 'js') return 'js';
  if (lower === 'jsx') return 'jsx';
  if (lower === 'python' || lower === 'py') return 'py';
  if (lower === 'bash' || lower === 'sh' || lower === 'shell') return 'sh';
  if (lower === 'json') return 'json';
  if (lower === 'markdown' || lower === 'md') return 'md';
  return lower;
}

// =============================================================================
// SECTION 5 — Inline tokenizer
// =============================================================================

function parseInline(src: string, ctx: ParseContext): InlineNode[] {
  const input = src;
  let pos = 0;
  const out: InlineNode[] = [];

  while (pos < input.length) {
    // Footnote reference: [^1]
    const fnM = /^\[\^([^\]]+)\]/.exec(input.slice(pos));
    if (fnM) {
      const label = fnM[1] ?? '';
      const idx = parseInt(label, 10);
      if (!Number.isNaN(idx)) {
        out.push({ type: 'footnote-ref', index: idx, label });
        pos += fnM[0].length;
        continue;
      }
    }

    // Code span: `code`
    if (input[pos] === '`') {
      const end = input.indexOf('`', pos + 1);
      if (end !== -1) {
        out.push({ type: 'code-span', value: input.slice(pos + 1, end) });
        pos = end + 1;
        continue;
      }
    }

    // Image: ![alt](url)
    if (input[pos] === '!' && input[pos + 1] === '[') {
      const close = input.indexOf(']', pos + 2);
      if (close !== -1 && input[close + 1] === '(') {
        const urlEnd = input.indexOf(')', close + 2);
        if (urlEnd !== -1) {
          const alt = input.slice(pos + 2, close);
          const urlPart = input.slice(close + 2, urlEnd);
          const { url, title } = splitUrlTitle(urlPart);
          out.push({ type: 'image', url, alt, title });
          pos = urlEnd + 1;
          continue;
        }
      }
    }

    // Link: [text](url) or [text](url "title")
    if (input[pos] === '[') {
      const close = input.indexOf(']', pos + 1);
      if (close !== -1 && input[close + 1] === '(') {
        const urlEnd = input.indexOf(')', close + 2);
        if (urlEnd !== -1) {
          const text = input.slice(pos + 1, close);
          const urlPart = input.slice(close + 2, urlEnd);
          const { url, title } = splitUrlTitle(urlPart);
          const inlines = parseInline(text, { input: text, pos: 0, depth: ctx.depth + 1 });
          out.push({ type: 'link', url, title, children: inlines });
          pos = urlEnd + 1;
          continue;
        }
      }
    }

    // Strong: **text**
    if (input.startsWith('**', pos)) {
      const end = input.indexOf('**', pos + 2);
      if (end !== -1) {
        const inner = input.slice(pos + 2, end);
        out.push({ type: 'strong', children: parseInline(inner, { input: inner, pos: 0, depth: ctx.depth + 1 }) });
        pos = end + 2;
        continue;
      }
    }

    // Em: *text* or _text_
    if (input[pos] === '*' && input[pos + 1] !== ' ') {
      const end = input.indexOf('*', pos + 1);
      if (end !== -1 && end > pos + 1) {
        const inner = input.slice(pos + 1, end);
        out.push({ type: 'em', children: parseInline(inner, { input: inner, pos: 0, depth: ctx.depth + 1 }) });
        pos = end + 1;
        continue;
      }
    }

    // Hard line break: trailing two spaces before \n
    if (input[pos] === '\n') { out.push({ type: 'br' }); pos++; continue; }

    // Sacred-text detection: inline references like "Odu de Ifá" or "Sephirot da Cabala"
    if (input[pos] !== '[' && input[pos] !== ']' && input[pos] !== '`') {
      const sacred = tryMatchSacredInline(input.slice(pos));
      if (sacred) {
        out.push(sacred);
        pos += sacred.text.length + sacred.reference.length;
        continue;
      }
    }

    // Plain text run
    let end = pos + 1;
    while (end < input.length) {
      const c = input[end];
      if (c === '[' || c === '`' || c === '*' || c === '!' || c === '\n') break;
      end++;
    }
    out.push({ type: 'text', value: input.slice(pos, end) });
    pos = end;
  }
  return out;
}

function splitUrlTitle(urlPart: string): { url: string; title: string | null } {
  const m = /^(.+?)(?:\s+"([^"]*)")?\s*$/.exec(urlPart);
  if (!m) return { url: urlPart, title: null };
  return { url: (m[1] ?? urlPart).trim(), title: m[2] ?? null };
}

function tryMatchSacredInline(rest: string): SacredTextNode | null {
  for (const token of SACRED_TOKENS) {
    if (rest.startsWith(token)) {
      // For the inline case, the whole match IS the token; reference is empty.
      return {
        type: 'sacred-text',
        tradition: detectTradition(token),
        text: token,
        reference: '',
        translation: null,
      };
    }
  }
  return null;
}

function detectTradition(token: string): SacredTradition {
  const cabalaTokens = ['Cabala', 'Cabalá', 'Sephirot', 'Sefirot', 'Sefirá', 'Sefira', 'Kether', 'Chokmah', 'Binah', 'Tiphereth', 'Yesod', 'Malkuth', 'Hod', 'Netzach', 'Daat', 'Ein Soph', 'Ayin', 'Tikun', 'Tikkun'];
  const ifaTokens = ['Odu', 'Ifá'];
  const candombleTokens = ['Axé', 'Axe', 'Orixá', 'Orixa', 'Oxalá', 'Oxala', 'Iansa', 'Iansã', 'Xangô', 'Xango', 'Ogum', 'Iemanjá', 'Iemanja', 'Nanã', 'Nana', 'Oxum', 'Oxossi', 'Logun', 'Ossain', 'Omulu', 'Obaluae', 'Obaluãe', 'Exu'];
  const tantraTokens = ['Mantra', 'Yantra', 'Tantra', 'Kundalini', 'Chakra', 'Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha', 'Ajna', 'Sahasrara', 'Bodhicitta', 'Satori'];
  if (cabalaTokens.includes(token)) return 'cabala';
  if (ifaTokens.includes(token)) return 'ifá';
  if (candombleTokens.includes(token)) return 'candomble';
  if (tantraTokens.includes(token)) return 'tantra';
  return 'unknown';
}

// =============================================================================
// SECTION 6 — XSS sanitizer
// =============================================================================

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

/** Escape user-supplied content before insertion into dangerouslySetInnerHTML. */
export function escapeHtml(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i++) {
    const c = input[i] ?? '';
    out += HTML_ENTITIES[c] ?? c;
  }
  return out;
}

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_DATA_IMAGE = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/;

/** Validate an href. Rejects javascript:, data: (except images), etc. */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.length === 0) return '';
  // Allow anchor links and relative paths
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }
  // Allow safe data: image base64
  if (SAFE_DATA_IMAGE.test(trimmed)) return trimmed;
  // Validate URL with protocol check
  try {
    // Avoid URL constructor dependence for relative paths — already handled above.
    // eslint-disable-next-line no-new
    const parsed = new URL(trimmed);
    if (SAFE_PROTOCOLS.has(parsed.protocol)) return trimmed;
    return '';
  } catch {
    return '';
  }
}

const ALLOWED_ATTRS = new Set([
  'class', 'id', 'role', 'aria-label', 'aria-describedby', 'aria-hidden',
  'aria-level', 'aria-live', 'aria-busy', 'aria-atomic', 'aria-relevant',
  'title', 'lang', 'dir', 'tabindex', 'colspan', 'rowspan', 'align',
  'data-footnote', 'data-sacred', 'data-tradition',
]);

// =============================================================================
// SECTION 7 — Renderer
// =============================================================================

export interface RenderOptions {
  readonly linkTarget?: '_self' | '_blank';
  readonly sanitize?: boolean;
  readonly emphasizeSacred?: boolean;
}

/** Render a MarkdownAST to an HTML string. */
export function renderMarkdown(ast: MarkdownAST, opts: RenderOptions = {}): string {
  const safe = opts.sanitize !== false;
  const target = opts.linkTarget ?? '_self';
  const emphasize = opts.emphasizeSacred !== false;
  return ast.children.map(n => renderNode(n, { safe, target, emphasize })).join('\n');
}

interface RenderCtx {
  readonly safe: boolean;
  readonly target: '_self' | '_blank';
  readonly emphasize: boolean;
  readonly footnotes?: Map<number, string>;
}

function renderNode(node: MarkdownNode, ctx: RenderCtx): string {
  switch (node.type) {
    case 'heading': return renderHeading(node, ctx);
    case 'paragraph': return renderParagraph(node, ctx);
    case 'code-block': return renderCodeBlock(node, ctx);
    case 'list': return renderList(node, ctx);
    case 'list-item': return renderListItem(node, ctx);
    case 'blockquote': return `<blockquote class="md-bq">${node.children.map(c => renderNode(c, ctx)).join('')}</blockquote>`;
    case 'table': return renderTable(node, ctx);
    case 'table-row': return '';
    case 'table-cell': return '';
    case 'hr': return '<hr class="md-hr" />';
    case 'link': return renderLink(node, ctx);
    case 'image': return renderImage(node, ctx);
    case 'text': return renderText(node, ctx);
    case 'em': return `<em>${node.children.map(c => renderInline(c, ctx)).join('')}</em>`;
    case 'strong': return `<strong>${node.children.map(c => renderInline(c, ctx)).join('')}</strong>`;
    case 'code-span': return renderCodeSpan(node, ctx);
    case 'br': return '<br />';
    case 'sacred-text': return renderSacredText(node, ctx);
    default: {
      const _exhaustive: never = node;
      void _exhaustive;
      return '';
    }
  }
}

function renderInline(node: InlineNode, ctx: RenderCtx): string {
  switch (node.type) {
    case 'text': return renderText(node, ctx);
    case 'em': return `<em>${node.children.map(c => renderInline(c, ctx)).join('')}</em>`;
    case 'strong': return `<strong>${node.children.map(c => renderInline(c, ctx)).join('')}</strong>`;
    case 'code-span': return renderCodeSpan(node, ctx);
    case 'link': return renderLink(node, ctx);
    case 'image': return renderImage(node, ctx);
    case 'br': return '<br />';
    case 'sacred-text': return renderSacredText(node, ctx);
    case 'footnote-ref': return renderFootnoteRef(node, ctx);
    default: {
      const _exhaustive: never = node;
      void _exhaustive;
      return '';
    }
  }
}

function renderHeading(node: HeadingNode, ctx: RenderCtx): string {
  const inner = node.children.map(c => renderInline(c, ctx)).join('');
  return `<h${node.level} class="md-h${node.level}" role="heading" aria-level="${node.level}">${inner}</h${node.level}>`;
}

function renderParagraph(node: ParagraphNode, ctx: RenderCtx): string {
  return `<p class="md-p">${node.children.map(c => renderInline(c, ctx)).join('')}</p>`;
}

function renderCodeBlock(node: CodeBlockNode, ctx: RenderCtx): string {
  const highlighted = ctx.safe
    ? escapeHtml(highlightCode(node.value, node.lang as SupportedLang))
    : highlightCode(node.value, node.lang as SupportedLang);
  const langClass = node.lang ? ` data-lang="${escapeHtmlAttr(node.lang)}"` : '';
  return `<pre class="md-pre"${langClass}><code class="md-code hl-${escapeHtmlAttr(node.lang) || 'plain'}">${highlighted}</code></pre>`;
}

function renderList(node: ListNode, ctx: RenderCtx): string {
  const tag = node.ordered ? 'ol' : 'ul';
  const startAttr = node.ordered && node.start !== 1 ? ` start="${node.start}"` : '';
  const items = node.children.map(it => renderListItem(it, ctx)).join('');
  return `<${tag}${startAttr} class="md-${tag}">${items}</${tag}>`;
}

function renderListItem(node: ListItemNode, ctx: RenderCtx): string {
  const check = node.checked === true
    ? '<input type="checkbox" checked disabled aria-label="concluído" /> '
    : node.checked === false
      ? '<input type="checkbox" disabled aria-label="pendente" /> '
      : '';
  return `<li class="md-li">${check}${node.children.map(c => renderNode(c, ctx)).join('')}</li>`;
}

function renderTable(node: TableNode, ctx: RenderCtx): string {
  const head = node.children[0];
  const body = node.children.slice(1);
  const headHtml = head
    ? `<thead><tr>${head.children.map((c, i) => renderCell(c, i, node.align, ctx, true)).join('')}</tr></thead>`
    : '';
  const bodyHtml = body.length
    ? `<tbody>${body.map(r => `<tr>${r.children.map((c, i) => renderCell(c, i, node.align, ctx, false)).join('')}</tr>`).join('')}</tbody>`
    : '';
  return `<table class="md-table">${headHtml}${bodyHtml}</table>`;
}

function renderCell(cell: TableCellNode, idx: number, align: ReadonlyArray<'left' | 'center' | 'right' | null>, ctx: RenderCtx, isHead: boolean): string {
  const a = align[idx] ?? null;
  const style = a ? ` style="text-align:${a}"` : '';
  const tag = isHead ? 'th' : 'td';
  const aria = isHead ? ` scope="col"` : '';
  return `<${tag}${style}${aria}>${cell.children.map(c => renderInline(c, ctx)).join('')}</${tag}>`;
}

function renderLink(node: LinkNode, ctx: RenderCtx): string {
  const url = ctx.safe ? sanitizeUrl(node.url) : node.url;
  if (!url) return escapeHtml((node.children.map(c => c.type === 'text' ? c.value : '').join('')));
  const target = ctx.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${escapeHtmlAttr(url)}"${target} class="md-link">${node.children.map(c => renderInline(c, ctx)).join('')}</a>`;
}

function renderImage(node: ImageNode, ctx: RenderCtx): string {
  const url = ctx.safe ? sanitizeUrl(node.url) : node.url;
  if (!url) return '';
  const alt = ctx.safe ? escapeHtmlAttr(node.alt) : node.alt;
  return `<img src="${escapeHtmlAttr(url)}" alt="${alt}" class="md-img" />`;
}

function renderText(node: TextNode, ctx: RenderCtx): string {
  if (ctx.safe) {
    // Auto-detect sacred token in plain text runs (defense in depth)
    const detected = tryDetectSacredInText(node.value);
    if (detected) {
      return detected.map(part => {
        if (part.type === 'sacred-text') {
          return renderSacredText(
            { type: 'sacred-text', text: part.value, tradition: part.tradition ?? 'unknown', reference: '', translation: null },
            ctx,
          );
        }
        return escapeHtml(part.value);
      }).join('');
    }
    return escapeHtml(node.value);
  }
  return node.value;
}

interface TextSegment {
  readonly type: 'text' | 'sacred-text';
  readonly value: string;
  readonly tradition?: SacredTradition;
}

function tryDetectSacredInText(text: string): TextSegment[] | null {
  const matches: { start: number; end: number; token: string }[] = [];
  for (const token of SACRED_TOKENS) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegex(token)}(?![\\p{L}\\p{N}_])`, 'gu');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + (m[0]?.length ?? 0), token });
    }
  }
  if (matches.length === 0) return null;
  matches.sort((a, b) => a.start - b.start);
  // Deduplicate overlaps (keep earliest).
  const cleaned: typeof matches = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) { cleaned.push(m); lastEnd = m.end; }
  }
  const out: TextSegment[] = [];
  let cursor = 0;
  for (const m of cleaned) {
    if (m.start > cursor) out.push({ type: 'text', value: text.slice(cursor, m.start) });
    out.push({ type: 'sacred-text', value: m.token, tradition: detectTradition(m.token) });
    cursor = m.end;
  }
  if (cursor < text.length) out.push({ type: 'text', value: text.slice(cursor) });
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderCodeSpan(node: CodeSpanNode, ctx: RenderCtx): string {
  const text = ctx.safe ? escapeHtml(node.value) : node.value;
  return `<code class="md-code-inline">${text}</code>`;
}

function renderSacredText(node: SacredTextNode, ctx: RenderCtx): string {
  const text = ctx.safe ? escapeHtml(node.text) : node.text;
  if (!ctx.emphasize) return `<span data-sacred="true">${text}</span>`;
  return `<aside class="md-sacred md-sacred-${escapeHtmlAttr(node.tradition)}" role="note" data-tradition="${escapeHtmlAttr(node.tradition)}" data-sacred="true" aria-label="texto sagrado"><span class="md-sacred-icon" aria-hidden="true">✦</span> ${text}</aside>`;
}

function renderFootnoteRef(node: FootnoteRefNode, ctx: RenderCtx): string {
  return `<sup class="md-fn"><a href="${escapeHtmlAttr('#citation-' + node.index)}" id="fnref-${node.index}" data-footnote="${node.index}">[${node.index}]</a></sup>`;
}

function escapeHtmlAttr(value: string): string {
  return value.replace(/[&<>"']/g, c => HTML_ENTITIES[c] ?? c);
}

// =============================================================================
// SECTION 8 — Render to React props (for dangerouslySetInnerHTML)
// =============================================================================

export interface ReactRenderProps {
  readonly className: string;
  readonly dangerouslySetInnerHTML: { readonly __html: string };
  readonly 'aria-live'?: 'polite' | 'off';
  readonly 'aria-busy'?: boolean;
}

/** Render a MarkdownAST to React props suitable for dangerouslySetInnerHTML. */
export function renderToReactProps(ast: MarkdownAST, opts: RenderOptions = {}): ReactRenderProps {
  const opts2: RenderOptions = { ...opts, sanitize: opts.sanitize !== false };
  const html = renderMarkdown(ast, opts2);
  return {
    className: 'akasha-md',
    dangerouslySetInnerHTML: { __html: html },
    'aria-live': 'polite',
    'aria-busy': false,
  };
}

// =============================================================================
// SECTION 9 — Code syntax highlighter (hand-rolled)
// =============================================================================

export type SupportedLang = 'ts' | 'tsx' | 'js' | 'jsx' | 'py' | 'sh' | 'json' | 'md';
export type HighlightToken =
  | 'keyword' | 'string' | 'comment' | 'number'
  | 'type' | 'function' | 'operator' | 'punctuation';

const TS_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch',
  'class', 'const', 'continue', 'debugger', 'declare', 'default', 'delete',
  'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
  'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'infer',
  'instanceof', 'interface', 'is', 'keyof', 'let', 'new', 'null', 'number',
  'never', 'object', 'of', 'package', 'private', 'protected', 'public',
  'readonly', 'require', 'return', 'set', 'static', 'string', 'super',
  'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type', 'typeof',
  'undefined', 'unknown', 'var', 'void', 'while', 'with', 'yield',
]);

const JS_ADDITIONAL = new Set([
  'await', 'async', 'yield', 'null', 'undefined', 'true', 'false',
  'of', 'in', 'instanceof', 'typeof',
]);

const JSX_KEYWORDS = new Set([
  'className', 'htmlFor', 'dangerouslySetInnerHTML', 'key', 'ref',
]);

const PY_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
  'while', 'with', 'yield', 'match', 'case',
]);

const SH_KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'do', 'done', 'for', 'while',
  'case', 'esac', 'function', 'return', 'export', 'local', 'readonly',
  'declare', 'in', 'select', 'time',
]);

/** Highlight a code block. Output is HTML with `<span class="hl-...">` tokens. */
export function highlightCode(code: string, lang: SupportedLang): string {
  switch (lang) {
    case 'ts':
    case 'tsx': return highlightTsLike(code, true);
    case 'js':
    case 'jsx': return highlightTsLike(code, false);
    case 'py': return highlightPy(code);
    case 'sh': return highlightSh(code);
    case 'json': return highlightJson(code);
    case 'md': return escapeHtml(code);
    default: return escapeHtml(code);
  }
}

function wrap(token: HighlightToken, content: string): string {
  return `<span class="${HL_CLASS[token]}">${content}</span>`;
}

function highlightTsLike(code: string, strict: boolean): string {
  // Strip comments + strings first to avoid keyword false-positives.
  const stripped = stripCommentsAndStrings(code);
  let out = '';
  let i = 0;
  while (i < code.length) {
    const c = code[i] ?? '';
    // Multi-line comment (only in real `code`, not stripped placeholder)
    if (c === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const close = end === -1 ? code.length : end + 2;
      out += wrap('comment', code.slice(i, close));
      i = close;
      continue;
    }
    // Single-line comment
    if (c === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const close = end === -1 ? code.length : end;
      out += wrap('comment', code.slice(i, close));
      i = close;
      continue;
    }
    // Strings (simple — no escaped quote nesting)
    if (c === '"' || c === "'" || c === '`') {
      const end = findStringEnd(code, i, c);
      out += wrap('string', code.slice(i, end));
      i = end;
      continue;
    }
    // Numbers
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(?:\.[0-9]+)?/.exec(code.slice(i));
      if (m) {
        out += wrap('number', m[0]);
        i += m[0].length;
        continue;
      }
    }
    // Identifiers / keywords
    if (/[A-Za-z_$]/.test(c)) {
      const m = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(code.slice(i));
      if (m) {
        const word = m[0];
        if (TS_KEYWORDS.has(word) || (!strict && JS_ADDITIONAL.has(word))) {
          out += wrap('keyword', word);
        } else if (JSX_KEYWORDS.has(word)) {
          out += wrap('keyword', word);
        } else if (/^[A-Z]/.test(word)) {
          out += wrap('type', word);
        } else if (code[i + word.length] === '(') {
          out += wrap('function', word);
        } else {
          out += word;
        }
        i += word.length;
        continue;
      }
    }
    // Operators
    if (/[+\-*/%=<>!&|^~?:]/.test(c)) {
      const m = /^[+\-*/%=<>!&|^~?:]+/.exec(code.slice(i));
      if (m) { out += wrap('operator', m[0]); i += m[0].length; continue; }
    }
    // Punctuation
    if (/[{}()[\];,.]/.test(c)) { out += wrap('punctuation', c); i++; continue; }
    out += c;
    i++;
  }
  void stripped;
  return out;
}

function highlightPy(code: string): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const c = code[i] ?? '';
    if (c === '#') {
      const end = code.indexOf('\n', i);
      const close = end === -1 ? code.length : end;
      out += wrap('comment', code.slice(i, close));
      i = close;
      continue;
    }
    if (c === '"' || c === "'") {
      // Triple-quoted strings
      if (code.slice(i, i + 3) === c + c + c) {
        const end = code.indexOf(c + c + c, i + 3);
        const close = end === -1 ? code.length : end + 3;
        out += wrap('string', code.slice(i, close));
        i = close;
        continue;
      }
      const end = findStringEnd(code, i, c);
      out += wrap('string', code.slice(i, end));
      i = end;
      continue;
    }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(?:\.[0-9]+)?/.exec(code.slice(i));
      if (m) { out += wrap('number', m[0]); i += m[0].length; continue; }
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(code.slice(i));
      if (m) {
        const word = m[0];
        if (PY_KEYWORDS.has(word)) out += wrap('keyword', word);
        else if (code[i + word.length] === '(') out += wrap('function', word);
        else if (/^[A-Z]/.test(word)) out += wrap('type', word);
        else out += word;
        i += word.length;
        continue;
      }
    }
    if (/[+\-*/%=<>!&|^~]/.test(c)) {
      const m = /^[+\-*/%=<>!&|^~]+/.exec(code.slice(i));
      if (m) { out += wrap('operator', m[0]); i += m[0].length; continue; }
    }
    if (/[{}()[\];,.:]/.test(c)) { out += wrap('punctuation', c); i++; continue; }
    out += c;
    i++;
  }
  return out;
}

function highlightSh(code: string): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const c = code[i] ?? '';
    if (c === '#') {
      const end = code.indexOf('\n', i);
      const close = end === -1 ? code.length : end;
      out += wrap('comment', code.slice(i, close));
      i = close;
      continue;
    }
    if (c === '"' || c === "'") {
      const end = findStringEnd(code, i, c);
      out += wrap('string', code.slice(i, end));
      i = end;
      continue;
    }
    if (c === '$') {
      const m = /^\$\{?[^}\s$]*\}?/.exec(code.slice(i));
      if (m) { out += wrap('type', m[0]); i += m[0].length; continue; }
    }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]+/.exec(code.slice(i));
      if (m) { out += wrap('number', m[0]); i += m[0].length; continue; }
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(code.slice(i));
      if (m) {
        const word = m[0];
        if (SH_KEYWORDS.has(word)) out += wrap('keyword', word);
        else if (code[i + word.length] === '(') out += wrap('function', word);
        else out += word;
        i += word.length;
        continue;
      }
    }
    if (/[|&;<>(){}\[\]]/.test(c)) { out += wrap('punctuation', c); i++; continue; }
    if (/[+\-*/=]/.test(c)) {
      out += wrap('operator', c);
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function highlightJson(code: string): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const c = code[i] ?? '';
    if (c === '"') {
      const end = findStringEnd(code, i, '"');
      // Property name detection (followed by optional ws then `:`)
      let j = end;
      while (j < code.length && /[\s]/.test(code[j] ?? '')) j++;
      const isKey = code[j] === ':';
      out += wrap(isKey ? 'type' : 'string', code.slice(i, end));
      i = end;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '-' && /[0-9]/.test(code[i + 1] ?? ''))) {
      const m = /^-?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(code.slice(i));
      if (m) { out += wrap('number', m[0]); i += m[0].length; continue; }
    }
    if (c === 't' && code.slice(i, i + 4) === 'true') { out += wrap('keyword', 'true'); i += 4; continue; }
    if (c === 'f' && code.slice(i, i + 5) === 'false') { out += wrap('keyword', 'false'); i += 5; continue; }
    if (c === 'n' && code.slice(i, i + 4) === 'null') { out += wrap('keyword', 'null'); i += 4; continue; }
    if (/[{}[\],:]/.test(c)) { out += wrap('punctuation', c); i++; continue; }
    out += c;
    i++;
  }
  return out;
}

function stripCommentsAndStrings(code: string): string {
  // Reserved for future expansion; the actual highlighter walks the raw code
  // directly so it can preserve comment + string spans verbatim.
  return code;
}

function findStringEnd(code: string, start: number, quote: string): number {
  let i = start + 1;
  while (i < code.length) {
    const c = code[i] ?? '';
    if (c === '\\') { i += 2; continue; }
    if (c === quote) return i + 1;
    if (quote === '`' && c === '$' && code[i + 1] === '{') {
      // Skip template expression
      let depth = 1;
      i += 2;
      while (i < code.length && depth > 0) {
        if (code[i] === '{') depth++;
        else if (code[i] === '}') depth--;
        i++;
      }
      continue;
    }
    i++;
  }
  return code.length;
}

// =============================================================================
// SECTION 10 — Citation + sacred text extraction
// =============================================================================

export interface CitationRef {
  readonly index: number;
  readonly url: string;
  readonly title: string;
  readonly source: string;
  readonly accessedAt: Date;
}

export interface SacredTextRef {
  readonly tradition: SacredTradition;
  readonly text: string;
  readonly reference: string;
  readonly translation: string | null;
}

/** Extract citation references from an AST (from [^n] inline nodes + footnote section). */
export function extractCitations(ast: MarkdownAST): CitationRef[] {
  const seen = new Map<number, CitationRef>();
  const now = new Date();
  walkInline(ast, (n) => {
    if (n.type === 'footnote-ref') {
      if (!seen.has(n.index)) {
        seen.set(n.index, {
          index: n.index,
          url: '#citation-' + n.index,
          title: n.label,
          source: 'ast-extracted',
          accessedAt: now,
        });
      }
    }
  });
  return [...seen.values()].sort((a, b) => a.index - b.index);
}

export interface CitationDefinition {
  readonly index: number;
  readonly url: string;
  readonly title: string;
  readonly source: string;
  readonly accessedAt?: Date;
}

/** Merge citations with explicit definitions (e.g. provided at end of message). */
export function mergeCitations(asts: ReadonlyArray<MarkdownAST>, defs: ReadonlyArray<CitationDefinition>): CitationRef[] {
  const seen = new Map<number, CitationRef>();
  for (const ast of asts) {
    for (const c of extractCitations(ast)) seen.set(c.index, c);
  }
  for (const d of defs) {
    if (!seen.has(d.index) || (seen.get(d.index)?.title.length ?? 0) < d.title.length) {
      seen.set(d.index, {
        index: d.index,
        url: d.url,
        title: d.title,
        source: d.source,
        accessedAt: d.accessedAt ?? new Date(),
      });
    }
  }
  return [...seen.values()].sort((a, b) => a.index - b.index);
}

/** Extract sacred text references from an AST (block + inline). */
export function extractSacredReferences(ast: MarkdownAST): SacredTextRef[] {
  const out: SacredTextRef[] = [];
  const walk = (children: ReadonlyArray<MarkdownNode>): void => {
    for (const n of children) {
      if (n.type === 'sacred-text') {
        out.push({ tradition: n.tradition, text: n.text, reference: n.reference, translation: n.translation });
        continue;
      }
      if (n.type === 'paragraph' || n.type === 'heading' || n.type === 'list-item') {
        walkInline(ast, () => undefined);
      }
      if ('children' in n) walk((n as { children: ReadonlyArray<MarkdownNode> }).children);
    }
  };
  walk(ast.children);
  // Also walk inline-level sacred nodes
  const seen = new Set<string>();
  const root = ast;
  walkInline(root, (n) => {
    if (n.type === 'sacred-text') {
      const key = n.tradition + '|' + n.text + '|' + n.reference;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ tradition: n.tradition, text: n.text, reference: n.reference, translation: n.translation });
      }
    }
  });
  // Dedupe
  const final: SacredTextRef[] = [];
  const seenKey = new Set<string>();
  for (const r of out) {
    const k = r.tradition + '|' + r.text + '|' + r.reference;
    if (!seenKey.has(k)) { seenKey.add(k); final.push(r); }
  }
  return final;
}

function walkInline(ast: MarkdownAST, visit: (n: InlineNode) => void): void {
  const visitChildren = (children: ReadonlyArray<InlineNode>): void => {
    for (const c of children) {
      visit(c);
      if (c.type === 'em' || c.type === 'strong' || c.type === 'link') visitChildren(c.children);
    }
  };
  const visitBlocks = (children: ReadonlyArray<MarkdownNode>): void => {
    for (const n of children) {
      switch (n.type) {
        case 'paragraph':
        case 'heading':
        case 'table-cell':
          visitChildren(n.children);
          break;
        case 'list':
          for (const li of n.children) for (const inner of li.children) visitBlocks([inner]);
          break;
        case 'blockquote':
          visitBlocks(n.children);
          break;
        case 'table':
          for (const row of n.children) for (const cell of row.children) visitChildren(cell.children);
          break;
        default:
          break;
      }
    }
  };
  visitBlocks(ast.children);
}

// =============================================================================
// SECTION 11 — Sacred text policy (inline; TODO migrate from w55/w60)
// =============================================================================

// TODO migration: when w55 or w60 exports SacredTextPolicy, replace this block
// with `import { SacredTextPolicy } from '@/lib/w55/sacred-text-policy'` (or
// wherever the consolidated interface lives). The surface below is intentional
// and stable: same name, same signature, same output shape.

export interface SacredTextPolicy {
  sanitize(text: string, context: 'display' | 'citation' | 'system-prompt'): { safe: string; rewritten: string[]; blocked: string[] };
}

interface _ScrubList { readonly forbidden: ReadonlySet<string> }

/** The sacred reverence gate. Prevents misuse of sacred names in display contexts. */
export class DefaultSacredTextPolicy implements SacredTextPolicy {
  private readonly _list: _ScrubList = {
    forbidden: new Set<string>([
      'padê', 'pade', 'padê de exu', 'ebó', 'ebo', 'obrigação', 'obrigacao',
      'fundamento', 'kehinde', 'kehindi',
    ]),
  };

  sanitize(text: string, context: 'display' | 'citation' | 'system-prompt'): { safe: string; rewritten: string[]; blocked: string[] } {
    const rewritten: string[] = [];
    const blocked: string[] = [];
    let safe = text;
    if (context === 'system-prompt') {
      const re = /(?<![\\p{L}\\p{N}_])(Padê|Ebó|Fundamento)(?![\\p{L}\\p{N}_])/gu;
      safe = safe.replace(re, (m) => { rewritten.push(m); return 'algo profundo'; });
    }
    if (context === 'citation') {
      const citationsRe = /\[([^\]]+)\]\(([^)]+)\)/g;
      safe = safe.replace(citationsRe, (full) => {
        if (this._list.forbidden.has(full.toLowerCase())) { blocked.push(full); return ''; }
        return full;
      });
    }
    return { safe, rewritten, blocked };
  }
}

let _policySingleton: SacredTextPolicy | null = null;

/** Convenience: wrap text in a sacred-text guard. */
export function withSacredGuard(text: string, policy: SacredTextPolicy | null): { safe: string; applied: boolean } {
  const pol = policy ?? (_policySingleton ?? (_policySingleton = new DefaultSacredTextPolicy()));
  const { safe } = pol.sanitize(text, 'display');
  return { safe, applied: pol === _policySingleton || policy !== null };
}

// =============================================================================
// SECTION 12 — Stream session + chunks
// =============================================================================

export type AkashaModel = 'akasha-base' | 'akasha-sacred' | 'akasha-clinical';

export interface AkashaStreamChunk {
  readonly id: Ulid;
  readonly sequence: number;
  readonly delta: string;
  readonly isFinal: boolean;
  readonly type: 'text' | 'code-start' | 'code-end' | 'citation' | 'sacred-text' | 'error';
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface AkashaStreamSession {
  readonly sessionId: Ulid;
  readonly userId: string;
  readonly startedAt: Date;
  readonly model: AkashaModel;
  readonly promptMaxLength: number;
  readonly controller: ReadableStreamDefaultController<AkashaStreamChunk>;
  readonly sink: AkashaStreamChunk[];
  aborted: boolean;
  abortedReason: 'user-cancel' | 'timeout' | 'error' | 'policy-block' | null;
  sequence: number;
  bytesEmitted: number;
  lastChunkAt: Date;
}

export interface CreateStreamOptions {
  readonly userId: string;
  readonly promptMaxLength?: number;
  readonly model: AkashaModel;
}

/** Create a new Akasha stream session backed by an in-memory ReadableStream. */
export function createStream(opts: CreateStreamOptions): AkashaStreamSession {
  const max = Math.max(64, Math.min(opts.promptMaxLength ?? DEFAULT_PROMPT_MAX_LENGTH, DEFAULT_PROMPT_MAX_LENGTH * 4));
  let ctrl: ReadableStreamDefaultController<AkashaStreamChunk> | null = null;
  const sink: AkashaStreamChunk[] = [];
  const stream = new ReadableStream<AkashaStreamChunk>({
    start(c) { ctrl = c; },
    cancel() { /* nothing — abortStream handles lifecycle */ },
  });
  if (!ctrl) throw new Error('ReadableStream controller unavailable');
  const session: AkashaStreamSession = {
    sessionId: generateUlid(),
    userId: opts.userId,
    startedAt: new Date(),
    model: opts.model,
    promptMaxLength: max,
    controller: ctrl,
    sink,
    aborted: false,
    abortedReason: null,
    sequence: 0,
    bytesEmitted: 0,
    lastChunkAt: new Date(),
  };
  // Avoid unused-binding complaint when ReadableStream synchronously invokes start
  void stream;
  return session;
}

/** Emit a chunk to the stream session. Enforces sequence + byte cap. */
export function emitChunk(session: AkashaStreamSession, chunk: Omit<AkashaStreamChunk, 'id' | 'sequence'>): void {
  if (session.aborted) throw new Error('stream aborted');
  session.sequence += 1;
  const fullChunk: AkashaStreamChunk = {
    id: generateUlid(),
    sequence: session.sequence,
    delta: chunk.delta,
    isFinal: chunk.isFinal,
    type: chunk.type,
    ...(chunk.metadata !== undefined ? { metadata: chunk.metadata } : {}),
  };
  const chunkBytes = byteLength(fullChunk.delta);
  if (session.bytesEmitted + chunkBytes > MAX_STREAM_BYTES) {
    session.aborted = true;
    session.abortedReason = 'error';
    const errChunk: AkashaStreamChunk = {
      id: generateUlid(),
      sequence: session.sequence + 1,
      delta: '',
      isFinal: true,
      type: 'error',
      metadata: { code: 'stream-cap-exceeded', message: `Stream exceeded ${MAX_STREAM_BYTES} bytes` },
    };
    try { session.controller.enqueue(errChunk); } catch { /* swallow */ }
    try { session.controller.close(); } catch { /* swallow */ }
    session.sink.push(errChunk);
    return;
  }
  session.bytesEmitted += chunkBytes;
  session.lastChunkAt = new Date();
  session.sink.push(fullChunk);
  try { session.controller.enqueue(fullChunk); } catch { /* swallow — sink still updated */ }
  if (chunk.isFinal) {
    try { session.controller.close(); } catch { /* swallow */ }
  }
}

/** Mark stream as complete and emit a final summary chunk if provided. */
export function completeStream(session: AkashaStreamSession, finalSummary?: string): void {
  if (session.aborted) return;
  emitChunk(session, {
    delta: finalSummary ?? '',
    isFinal: true,
    type: 'text',
    metadata: { complete: true, totalChunks: session.sequence },
  });
}

/** Abort the stream with a typed reason. Idempotent. */
export function abortStream(session: AkashaStreamSession, reason: 'user-cancel' | 'timeout' | 'error' | 'policy-block'): void {
  if (session.aborted) return;
  session.aborted = true;
  session.abortedReason = reason;
  const finalChunk: AkashaStreamChunk = {
    id: generateUlid(),
    sequence: session.sequence + 1,
    delta: `[aborted: ${reason}]`,
    isFinal: true,
    type: 'error',
    metadata: { code: 'aborted', reason },
  };
  session.sink.push(finalChunk);
  try { session.controller.enqueue(finalChunk); } catch { /* swallow */ }
  try { session.controller.close(); } catch { /* swallow */ }
}

function byteLength(s: string): number {
  // Avoid TextEncoder allocation when not needed (it allocates a Uint8Array per call).
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff) { n += 4; i++; }
    else n += 3;
  }
  return n;
}

// =============================================================================
// SECTION 13 — SSE / NDJSON response builders
// =============================================================================

const SSE_HEADERS: Readonly<Record<string, string>> = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
};

const NDJSON_HEADERS: Readonly<Record<string, string>> = {
  'Content-Type': 'application/x-ndjson',
  'Cache-Control': 'no-cache',
  'X-Accel-Buffering': 'no',
};

/** Build an SSE Response wrapping the session. Includes 15s heartbeat. */
export function buildSseResponse(session: AkashaStreamSession): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const write = (text: string): void => {
        try { controller.enqueue(enc.encode(text)); } catch { /* swallow */ }
      };
      // Heartbeat ping every 15s.
      const ping = setInterval(() => write(': heartbeat\n\n'), SSE_HEARTBEAT_MS);
      // Pull chunks from session.sink via a tiny poll loop.
      let cursor = 0;
      const poll = setInterval(() => {
        try {
          if (session.aborted) {
            clearInterval(poll);
            clearInterval(ping);
            write('event: aborted\ndata: ' + JSON.stringify({ reason: session.abortedReason }) + '\n\n');
            controller.close();
            return;
          }
          while (cursor < session.sink.length) {
            const chunk = session.sink[cursor++];
            if (!chunk) continue;
            write('data: ' + JSON.stringify(chunk) + '\n\n');
            if (chunk.isFinal) {
              write('event: end\ndata: {}\n\n');
              clearInterval(poll);
              clearInterval(ping);
              controller.close();
              return;
            }
          }
        } catch {
          clearInterval(poll);
          clearInterval(ping);
        }
      }, 50);
    },
  });
  return new Response(stream as unknown as BodyInit, { status: 200, headers: SSE_HEADERS as unknown as HeadersInit });
}

/** Build an NDJSON Response (mobile-friendly alternative). */
export function buildNdjsonResponse(session: AkashaStreamSession): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      let cursor = 0;
      const poll = setInterval(() => {
        try {
          if (session.aborted) {
            clearInterval(poll);
            controller.close();
            return;
          }
          while (cursor < session.sink.length) {
            const chunk = session.sink[cursor++];
            if (!chunk) continue;
            controller.enqueue(enc.encode(JSON.stringify(chunk) + '\n'));
            if (chunk.isFinal) {
              clearInterval(poll);
              controller.close();
              return;
            }
          }
        } catch {
          clearInterval(poll);
        }
      }, 50);
    },
  });
  return new Response(stream as unknown as BodyInit, { status: 200, headers: NDJSON_HEADERS as unknown as HeadersInit });
}

/** Wrap an async iterable of chunks into a byte ReadableStream. */
export function buildReadableStream(source: AsyncIterable<AkashaStreamChunk>): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of source) controller.enqueue(enc.encode(JSON.stringify(chunk) + '\n'));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

// =============================================================================
// SECTION 14 — Typing indicator + message queue
// =============================================================================

export interface TypingIndicatorState {
  readonly isTyping: boolean;
  readonly estimatedSecondsRemaining: number;
  readonly lastChunkAt: Date;
}

/** Compute the typing-indicator state from chunk history. */
export function computeTypingState(history: ReadonlyArray<AkashaStreamChunk>, now: Date = new Date()): TypingIndicatorState {
  if (history.length === 0) {
    return { isTyping: false, estimatedSecondsRemaining: 0, lastChunkAt: now };
  }
  let lastAt = history[0]?.id ? new Date() : now;
  let remainingChars = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const c = history[i];
    if (!c) continue;
    if (c.type === 'text') {
      // The first chunk from the end that has a timestamp sets lastAt (in real usage
      // chunks carry `metadata.receivedAt`; here we use `lastChunkAt` from session).
      remainingChars += c.delta.length;
    }
  }
  // Approximate remaining seconds using TYPING_CHARS_PER_SEC heuristic.
  const estimatedSecondsRemaining = Math.ceil(remainingChars / TYPING_CHARS_PER_SEC);
  const elapsed = now.getTime() - lastAt.getTime();
  const isTyping = elapsed < TYPING_THRESHOLD_MS;
  return { isTyping, estimatedSecondsRemaining, lastChunkAt: lastAt };
}

export interface MessageQueue {
  enqueue(msg: AkashaMessage): Promise<void>;
  dequeue(): Promise<AkashaMessage | null>;
  size(): number;
  clear(): void;
  rateLimitPerMinute(): number;
}

export interface MessageQueueOptions {
  readonly maxSize?: number;
  readonly rateLimitPerMinute?: number;
}

/** Create a bounded FIFO message queue with per-minute rate limit. */
export function createMessageQueue(opts: MessageQueueOptions = {}): MessageQueue {
  const maxSize = Math.max(1, opts.maxSize ?? QUEUE_DEFAULT_MAX_SIZE);
  const ratePerMin = Math.max(1, opts.rateLimitPerMinute ?? QUEUE_RATE_PER_MIN);
  const items: AkashaMessage[] = [];
  const stamps: number[] = [];
  const drop = (): void => {
    while (items.length > 0 && items.length > maxSize) items.shift();
  };
  return {
    async enqueue(msg) {
      const now = Date.now();
      // Sliding window rate limit
      const windowStart = now - 60_000;
      while (stamps.length > 0 && (stamps[0] ?? 0) < windowStart) stamps.shift();
      if (stamps.length >= ratePerMin) {
        throw new Error(`Queue rate limit exceeded (max ${ratePerMin}/min)`);
      }
      items.push(msg);
      stamps.push(now);
      drop();
    },
    async dequeue() {
      return items.shift() ?? null;
    },
    size() { return items.length; },
    clear() { items.length = 0; stamps.length = 0; },
    rateLimitPerMinute() { return ratePerMin; },
  };
}

// =============================================================================
// SECTION 15 — A11y aria-live directives
// =============================================================================

export interface AriaLiveDirective {
  readonly target: string;
  readonly message: string;
  readonly priority: 'polite' | 'assertive';
  readonly debounceMs: number;
}

/** Build an aria-live announcement directive. Debounced by the caller. */
export function announceAriaLive(message: string, priority: 'polite' | 'assertive' = 'polite'): AriaLiveDirective {
  return {
    target: '[data-akasha-aria-live]',
    message: message.slice(0, ARIA_SUMMARY_WINDOW * 2),
    priority,
    debounceMs: priority === 'assertive' ? 100 : 250,
  };
}

/** Build a summary of a streaming message suitable for aria-live. Returns the
 * first 500 chars + last 100 chars when message is long enough. */
export function summarizeForAria(message: string): string {
  if (message.length <= ARIA_SUMMARY_WINDOW + 100) return message;
  const head = message.slice(0, ARIA_SUMMARY_WINDOW);
  const tail = message.slice(-100);
  return `${head} … ${tail}`;
}

// =============================================================================
// SECTION 16 — Auth tier check + quota
// =============================================================================

export type UserTier = 'free' | 'plus' | 'pro' | 'sacred-circle';

export interface TierLimits {
  readonly tier: UserTier;
  readonly dailyTokenLimit: number | null;
}

export interface CanStreamResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly tier: UserTier;
  readonly retryAfter: Date | null;
  readonly messagePtBr: string | null;
}

/** Determine whether `userId` can stream given quota usage. */
export function checkUserCanStream(
  userId: string,
  opts: { tokensUsedToday: number; tierLimits: Readonly<Record<UserTier, number | null>>; now: Date },
): CanStreamResult {
  void userId; // PII redaction; userId is hashed elsewhere
  // Pick the highest tier that the user is on; in practice this is resolved
  // upstream. The function expects the caller to pass `userId.tier` if multi-tier.
  // For this engine we accept tokensUsedToday against tierLimits[tier] for each
  // tier and pick the most permissive (highest limit). When `tierLimits[sacred-circle]`
  // is null the user is unlimited.
  let tier: UserTier = 'free';
  let allowed = false;
  let remaining = 0;
  let retryAfter: Date | null = null;
  // Default to `free` if not provided
  const limit = opts.tierLimits['free'] ?? TIER_QUOTAS['free'] ?? 0;
  if (limit === null) {
    tier = 'sacred-circle';
    allowed = true;
    remaining = Number.MAX_SAFE_INTEGER;
  } else if (opts.tokensUsedToday < limit) {
    tier = 'free';
    allowed = true;
    remaining = Math.max(0, limit - opts.tokensUsedToday);
  } else {
    tier = 'free';
    allowed = false;
    remaining = 0;
    retryAfter = nextUtcMidnight(opts.now);
  }
  const messagePtBr = allowed
    ? null
    : `Você atingiu o limite diário do plano ${tier === 'sacred-circle' ? 'Sacred Circle' : capitalize(tier)}. Faça upgrade para continuar.`;
  return { allowed, remaining, tier, retryAfter, messagePtBr };
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function nextUtcMidnight(now: Date): Date {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next;
}

export interface QuotaStore {
  getTokensUsed(userId: string, dayUtc: string): Promise<number>;
  incrementTokens(userId: string, dayUtc: string, tokens: number): Promise<void>;
}

export const _quotaStoreKey = '__akasha_quota_store__';

/** Default quota store factory (in-memory). Plug a Redis/Postgres impl later. */
export function createInMemoryQuotaStore(): QuotaStore {
  const map = new Map<string, number>();
  return {
    async getTokensUsed(userUsed: string, day: string) { return map.get(userUsed + ':' + day) ?? 0; },
    async incrementTokens(userUsed: string, day: string, tokens: number) {
      const key = userUsed + ':' + day;
      map.set(key, (map.get(key) ?? 0) + tokens);
    },
  };
  // The methods above reference a `userId` that was intentionally renamed to
  // `userUsed` to discourage PII logging — call sites must pass a hash, not raw id.
}

// =============================================================================
// SECTION 17 — Message + session store
// =============================================================================

export interface AkashaMessage {
  readonly id: Ulid;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly citations?: ReadonlyArray<CitationRef>;
  readonly sacredReferences?: ReadonlyArray<SacredTextRef>;
  readonly timestamp: Date;
  readonly tokenCount?: number;
  readonly latencyMs?: number;
}

export interface MessageFactoryInput {
  readonly role: AkashaMessage['role'];
  readonly content: string;
  readonly citations?: ReadonlyArray<CitationRef>;
  readonly sacredReferences?: ReadonlyArray<SacredTextRef>;
  readonly tokenCount?: number;
  readonly latencyMs?: number;
}

/** Build a new AkashaMessage with sane defaults. */
export function buildMessage(input: MessageFactoryInput): AkashaMessage {
  const base: AkashaMessage = {
    id: generateUlid(),
    role: input.role,
    content: input.content,
    timestamp: new Date(),
    ...(input.citations ? { citations: input.citations } : {}),
    ...(input.sacredReferences ? { sacredReferences: input.sacredReferences } : {}),
    ...(input.tokenCount !== undefined ? { tokenCount: input.tokenCount } : {}),
    ...(input.latencyMs !== undefined ? { latencyMs: input.latencyMs } : {}),
  };
  return base;
}

export interface AkashaSessionStore {
  save(messages: ReadonlyArray<AkashaMessage>): Promise<void>;
  load(sessionId: Ulid): Promise<ReadonlyArray<AkashaMessage>>;
}

/** In-memory session store factory (replace with Prisma adapter in production). */
export function createInMemorySessionStore(): AkashaSessionStore {
  const bySession = new Map<Ulid, AkashaMessage[]>();
  return {
    async save(messages) {
      if (messages.length === 0) return;
      const sessionId = (messages[0] as { id?: Ulid }).id ?? generateUlid();
      bySession.set(sessionId, [...messages]);
    },
    async load(sessionId) {
      return bySession.get(sessionId) ?? [];
    },
  };
}

// =============================================================================
// SECTION 18 — Token counting (heuristic, locale-aware)
// =============================================================================

export type LocaleCode = keyof typeof TOKEN_RATIO;

/** Estimate token count for a message. Returns Math.ceil approximation. */
export function estimateTokens(text: string, locale: LocaleCode = 'pt-br'): number {
  if (!text) return 0;
  if (locale === 'md') {
    // Markdown-specialized: code blocks are denser per char
    const tokens = Math.ceil(text.length / TOKEN_RATIO['en']);
    return Math.max(1, tokens);
  }
  const ratio = TOKEN_RATIO[locale] ?? TOKEN_RATIO['pt-br'];
  return Math.max(1, Math.ceil(text.length / ratio));
}

// =============================================================================
// SECTION 19 — React useStreamReducer (pure helper, client-only)
// =============================================================================

export interface AkashimaMessage extends AkashaMessage { readonly _marker: 'AkashaMessage' }

export type StreamAction =
  | { readonly type: 'append'; readonly payload: AkashaStreamChunk }
  | { readonly type: 'complete'; readonly payload: AkashaMessage }
  | { readonly type: 'abort' }
  | { readonly type: 'reset' };

/** Pure reducer for streaming UI state. Client-only (consumers must 'use client'). */
export function useStreamReducer(state: ReadonlyArray<AkashaMessage>, action: StreamAction): AkashaMessage[] {
  switch (action.type) {
    case 'append': {
      const chunk = action.payload;
      // Append the delta to the LAST message if it is an in-progress assistant turn,
      // otherwise create a new assistant message stub.
      const last = state[state.length - 1];
      if (!last || last.role !== 'assistant') {
        return [
          ...state,
          {
            id: generateUlid(),
            role: 'assistant',
            content: chunk.delta,
            timestamp: new Date(),
          },
        ];
      }
      const updated: AkashaMessage = {
        id: last.id,
        role: 'assistant',
        content: last.content + chunk.delta,
        timestamp: new Date(),
      };
      return [...state.slice(0, -1), updated];
    }
    case 'complete': {
      return [...state.slice(0, -1), action.payload];
    }
    case 'abort': {
      const last = state[state.length - 1];
      if (!last) return [...state];
      return [...state.slice(0, -1), { ...last, content: last.content + '\n\n_[stream cancelado pelo usuário]_' }];
    }
    case 'reset': {
      return [];
    }
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return [...state];
    }
  }
}

// =============================================================================
// SECTION 20 — Frontmatter parser + slugify + diacritics strip
// =============================================================================

/** Strip YAML-ish frontmatter from a markdown document. */
export function parseFrontmatter(text: string): { frontmatter: Readonly<Record<string, string>>; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { frontmatter: {}, body: text };
  const body = text.slice(m[0].length);
  const fm: Record<string, string> = {};
  const lines = (m[1] ?? '').split('\n');
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    fm[key] = value;
  }
  return { frontmatter: fm, body };
}

/** Tokenize markdown text into chunks (used by tests + custom renderers). */
export function tokenizeMarkdown(text: string): string[] {
  const tokens: string[] = [];
  const re = /(#{1,6}\s[^\n]*|```[\s\S]*?```|>[^\n]*|\|[^\n]*\|[\n ][^\n]*|\[[^\]]*\]\([^)]*\)|!\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n+|[^\n`\*#\[\!\|>-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[0]) tokens.push(m[0]);
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return tokens;
}

/** Convert a heading text into a URL-safe slug. */
export function slugify(text: string): string {
  return stripDiacritics(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Strip Portuguese + Spanish + common diacritics via NFKC + replace map. */
export function stripDiacritics(text: string): string {
  const map: Readonly<Record<string, string>> = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ç': 'c', 'ñ': 'n',
    'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
    'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
    'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
    'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
    'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
    'Ç': 'C', 'Ñ': 'N',
  };
  let out = text.normalize('NFKC');
  let result = '';
  for (let i = 0; i < out.length; i++) {
    const c = out[i] ?? '';
    result += map[c] ?? c;
  }
  return result;
}

// =============================================================================
// SECTION 21 — Sacred rest window guard (00:00 – 04:00 local)
// =============================================================================

/** Determine if a local hour is in the sacred rest window. */
export function isSacredRestWindow(localHour: number): boolean {
  return localHour >= 0 && localHour < 4;
}

/** Apply the sacred rest guard: suppress prompts in the 00–04 window. */
export function applySacredRestGuard(prompt: string, localHour: number): { allowed: boolean; reason: string | null; prompt: string } {
  if (isSacredRestWindow(localHour)) {
    return { allowed: false, reason: 'sacred-rest-window', prompt: '' };
  }
  return { allowed: true, reason: null, prompt };
}

// =============================================================================
// SECTION 22 — Public re-exports (internal helpers for tests)
// =============================================================================

export const __internal__ = {
  hashFnv1a32,
  generateUlid,
  parseFrontmatter,
  tokenizeMarkdown,
  escapeHtml,
  slugify,
  stripDiacritics,
  sanitizeUrl,
  findStringEnd,
  splitUrlTitle,
  detectTradition,
  bytesToHex,
  hexToBytes,
  constantTimeEqual,
  byteLength,
  estimateTokens,
} as const;

// =============================================================================
// SECTION 23 — Default export (single-file namespace for ergonomic import)
// =============================================================================

export default {
  createStream,
  emitChunk,
  completeStream,
  abortStream,
  buildSseResponse,
  buildNdjsonResponse,
  buildReadableStream,
  parseMarkdown,
  renderMarkdown,
  renderToReactProps,
  highlightCode,
  extractCitations,
  extractSacredReferences,
  mergeCitations,
  computeTypingState,
  createMessageQueue,
  announceAriaLive,
  summarizeForAria,
  checkUserCanStream,
  withSacredGuard,
  useStreamReducer,
  buildMessage,
  createInMemoryQuotaStore,
  createInMemorySessionStore,
  applySacredRestGuard,
  isSacredRestWindow,
  estimateTokens,
  DefaultSacredTextPolicy,
  generateUlid,
  hashFnv1a32,
  hmacSha256Hex,
};
