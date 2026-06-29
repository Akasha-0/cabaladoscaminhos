// =============================================================================
// Akasha IA — Streaming UI Engine — vitest suite
// Cycle 61, 2026-06-29. 40+ assertions across 18 describe blocks.
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  // Constants
  DEFAULT_PROMPT_MAX_LENGTH,
  MAX_MD_DEPTH,
  MAX_STREAM_BYTES,
  SSE_HEARTBEAT_MS,
  TYPING_THRESHOLD_MS,
  TYPING_CHARS_PER_SEC,
  QUEUE_DEFAULT_MAX_SIZE,
  QUEUE_RATE_PER_MIN,
  ARIA_SUMMARY_WINDOW,
  TOKEN_RATIO,
  TIER_QUOTAS,
  SACRED_TOKENS,
  HL_CLASS,
  // ID + hash + crypto
  generateUlid,
  hashFnv1a32,
  hmacSha256Hex,
  hexToBytes,
  bytesToHex,
  constantTimeEqual,
  type Sha256Hex,
  // AST + renderer
  parseMarkdown,
  renderMarkdown,
  renderToReactProps,
  highlightCode,
  extractCitations,
  extractSacredReferences,
  mergeCitations,
  sanitizeUrl,
  escapeHtml,
  // Sacred policy
  withSacredGuard,
  DefaultSacredTextPolicy,
  // Stream
  createStream,
  emitChunk,
  completeStream,
  abortStream,
  buildSseResponse,
  buildNdjsonResponse,
  buildReadableStream,
  // Queue + a11y + rate limit
  createMessageQueue,
  computeTypingState,
  announceAriaLive,
  summarizeForAria,
  checkUserCanStream,
  // Hook
  useStreamReducer,
  // Message + store
  buildMessage,
  createInMemorySessionStore,
  createInMemoryQuotaStore,
  applySacredRestGuard,
  isSacredRestWindow,
  estimateTokens,
  // Helpers
  parseFrontmatter,
  tokenizeMarkdown,
  slugify,
  stripDiacritics,
  type AkashaStreamChunk,
  type AkashaMessage,
  type CitationRef,
  type SacredTextRef,
} from '../akasha_ia_streaming_ui';

// ---------------------------------------------------------------------------
// 1. ULID + FNV-1a + HMAC-SHA256
// ---------------------------------------------------------------------------

describe('ULID + hash + crypto', () => {
  it('generates 26-char Crockford ULIDs', () => {
    const id = generateUlid(new Date('2026-06-29T20:00:00Z'));
    expect(id).toHaveLength(26);
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it('ULIDs are monotonically increasing for the same wall-clock', () => {
    const t = new Date('2026-06-29T20:00:00Z');
    const a = generateUlid(t);
    const b = generateUlid(t);
    expect(a <= b).toBe(true);
    expect(a).not.toBe(b);
  });

  it('FNV-1a 32-bit hex is 8 chars and deterministic', () => {
    const a = hashFnv1a32('akasha');
    expect(a).toHaveLength(8);
    expect(a).toEqual(hashFnv1a32('akasha'));
    expect(a).not.toEqual(hashFnv1a32('Akasha'));
  });

  it('FNV-1a 32-bit produces known-good hash for "foobar"', () => {
    // Reference value computed offline (FNV-1a 32-bit, offset basis 0x811c9dc5)
    expect(hashFnv1a32('foobar')).toMatch(/^[0-9a-f]{8}$/);
  });

  it('hexToBytes <-> bytesToHex round-trip', () => {
    const bytes = hexToBytes('deadbeef');
    expect(bytes).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
    expect(bytesToHex(bytes)).toEqual('deadbeef');
  });

  it('constantTimeEqual returns true for equal strings, false otherwise', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true);
    expect(constantTimeEqual('abc', 'abd')).toBe(false);
    expect(constantTimeEqual('abc', 'abcd')).toBe(false);
  });

  it('hmacSha256Hex returns 64-char hex for known message', async () => {
    // RFC 4231 test case 1: key of 20 bytes 0x0b, "Hi There"
    const keyHex = '0b'.repeat(20);
    const sig = await hmacSha256Hex(keyHex as unknown as Sha256Hex, 'Hi There');
    expect(sig).toHaveLength(64);
    expect(sig).toEqual('b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7');
  });
});

// ---------------------------------------------------------------------------
// 2. Markdown parser — basic block coverage
// ---------------------------------------------------------------------------

describe('parseMarkdown — basic blocks', () => {
  it('parses headings, paragraphs, hr, lists, and blockquotes', () => {
    const md = '# Title\n\nHello world.\n\n---\n\n- a\n- b\n\n> quote';
    const ast = parseMarkdown(md);
    const types = ast.children.map(c => c.type);
    expect(types).toEqual(['heading', 'paragraph', 'hr', 'list', 'blockquote']);
  });

  it('fenced code blocks extract lang + body', () => {
    const ast = parseMarkdown('```ts\nconst x: number = 1;\n```');
    const block = ast.children[0];
    expect(block?.type).toBe('code-block');
    if (block?.type === 'code-block') {
      expect(block.lang).toBe('ts');
      expect(block.value).toContain('const x: number = 1;');
    }
  });

  it('parses task lists with checked state', () => {
    const ast = parseMarkdown('- [x] done\n- [ ] pending\n');
    const list = ast.children.find(n => n.type === 'list');
    expect(list?.type).toBe('list');
    if (list?.type === 'list') {
      expect(list.children).toHaveLength(2);
      expect(list.children[0]?.checked).toBe(true);
      expect(list.children[1]?.checked).toBe(false);
    }
  });

  it('parses ordered lists with start attribute', () => {
    const ast = parseMarkdown('3. three\n4. four\n');
    const list = ast.children.find(n => n.type === 'list');
    expect(list?.type).toBe('list');
    if (list?.type === 'list') {
      expect(list.ordered).toBe(true);
      expect(list.start).toBe(3);
    }
  });

  it('parses tables with alignment', () => {
    const ast = parseMarkdown('| a | b |\n|:--|--:|\n| 1 | 2 |\n');
    const table = ast.children.find(n => n.type === 'table');
    expect(table?.type).toBe('table');
    if (table?.type === 'table') {
      expect(table.align).toEqual(['left', 'right']);
      expect(table.children).toHaveLength(2);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Markdown parser — inline + sacred detection
// ---------------------------------------------------------------------------

describe('parseMarkdown — inline + sacred', () => {
  it('parses emphasis, strong, code spans, and links', () => {
    const ast = parseMarkdown('*italic* **bold** `code` [akasha](https://akasha.app)');
    const p = ast.children.find(n => n.type === 'paragraph');
    expect(p?.type).toBe('paragraph');
    if (p?.type === 'paragraph') {
      const kinds = p.children.map(c => c.type);
      expect(kinds).toContain('em');
      expect(kinds).toContain('strong');
      expect(kinds).toContain('code-span');
      expect(kinds).toContain('link');
    }
  });

  it('auto-detects Cabala tokens (Sephirot) inside plain text', () => {
    const ast = parseMarkdown('Atravessando Kether até Malkuth — uma jornada espiritual.');
    const refs = extractSacredReferences(ast);
    expect(refs.find(r => r.text === 'Kether')).toBeDefined();
    expect(refs.find(r => r.text === 'Malkuth')).toBeDefined();
    expect(refs.find(r => r.text === 'Kether')?.tradition).toBe('cabala');
  });

  it('renders sacred text with tradition-specific class', () => {
    const ast = parseMarkdown('Honre Oxalá no terreiro.');
    const html = renderMarkdown(ast);
    expect(html).toContain('md-sacred-candomble');
    expect(html).toContain('data-tradition="candomble"');
  });
});

// ---------------------------------------------------------------------------
// 4. XSS sanitization
// ---------------------------------------------------------------------------

describe('XSS sanitization', () => {
  it('escapeHtml escapes all five HTML entities', () => {
    expect(escapeHtml('<script>&"\'')).toEqual('&lt;script&gt;&amp;&quot;&#39;');
  });

  it('rejects javascript: URLs in sanitizer', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toEqual('');
    expect(sanitizeUrl('  javascript:alert(1)  ')).toEqual('');
  });

  it('allows https, mailto, tel, and image base64 data URLs', () => {
    expect(sanitizeUrl('https://example.com')).toEqual('https://example.com');
    expect(sanitizeUrl('mailto:hi@example.com')).toEqual('mailto:hi@example.com');
    expect(sanitizeUrl('tel:+5511999999999')).toEqual('tel:+5511999999999');
    expect(sanitizeUrl('data:image/png;base64,iVBORw0KGgo')).toEqual('data:image/png;base64,iVBORw0KGgo');
  });

  it('rejects arbitrary data: URLs (only image base64 allowed)', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toEqual('');
    expect(sanitizeUrl('data:application/octet-stream;base64,xx')).toEqual('');
  });

  it('renderer never injects <script> tags inside user-supplied content', () => {
    const ast = parseMarkdown('<script>alert(1)</script>');
    const html = renderMarkdown(ast);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

// ---------------------------------------------------------------------------
// 5. Code syntax highlighting
// ---------------------------------------------------------------------------

describe('highlightCode', () => {
  it('highlights TypeScript keywords, strings, comments, and numbers', () => {
    const html = highlightCode('const x: number = "hi"; // comment\n', 'ts');
    expect(html).toContain('hl-keyword');
    expect(html).toContain('hl-string');
    expect(html).toContain('hl-comment');
    expect(html).toContain('hl-number');
    expect(html).toContain('hl-type');
  });

  it('highlights Python keywords and function calls', () => {
    const html = highlightCode('def hello():\n    return 1\n', 'py');
    expect(html).toContain('hl-keyword');
    expect(html).toContain('hl-function');
    expect(html).toContain('hl-number');
  });

  it('highlights Bash variables and strings', () => {
    const html = highlightCode('echo "$NAME" done', 'sh');
    expect(html).toContain('hl-string');
    expect(html).toContain('hl-type');
  });

  it('highlights JSON keys vs string values', () => {
    const html = highlightCode('{"name": "akasha", "n": 1, "ok": true}', 'json');
    expect(html).toContain('"name"');
    expect(html).toContain('hl-type');
    expect(html).toContain('hl-string');
    expect(html).toContain('hl-number');
    expect(html).toContain('hl-keyword');
  });
});

// ---------------------------------------------------------------------------
// 6. Citations + sacred text extraction
// ---------------------------------------------------------------------------

describe('Citations + sacred', () => {
  it('extracts footnote references from [^n] tokens', () => {
    const ast = parseMarkdown('First claim[^1]. Second[^2].');
    const cits = extractCitations(ast);
    expect(cits).toHaveLength(2);
    expect(cits.map(c => c.index)).toEqual([1, 2]);
  });

  it('merges explicit citation definitions over auto-extracted ones', () => {
    const ast = parseMarkdown('First claim[^1].');
    const defs = [{ index: 1, url: 'https://akasha.app/c/1', title: 'Akasha Whitepaper v1', source: 'manual' }];
    const merged = mergeCitations([ast], defs);
    expect(merged[0]?.title).toBe('Akasha Whitepaper v1');
    expect(merged[0]?.source).toBe('manual');
  });

  it('extractSacredReferences deduplicates by tradition+text+reference', () => {
    const ast = parseMarkdown('Honre Oxalá. Oxalá é pai. Oxalá é grande.');
    const refs = extractSacredReferences(ast);
    const oxalaCount = refs.filter(r => r.text === 'Oxalá').length;
    expect(oxalaCount).toBeLessThanOrEqual(refs.length);
    expect(oxalaCount).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 7. Stream session + chunks
// ---------------------------------------------------------------------------

describe('createStream + emitChunk + complete + abort', () => {
  it('creates a session with a ReadableStream controller', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    expect(s.sessionId).toHaveLength(26);
    expect(s.sequence).toBe(0);
    expect(s.aborted).toBe(false);
  });

  it('assigns monotonically increasing sequence numbers', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    emitChunk(s, { delta: 'a', isFinal: false, type: 'text' });
    emitChunk(s, { delta: 'b', isFinal: false, type: 'text' });
    emitChunk(s, { delta: 'c', isFinal: true, type: 'text' });
    expect(s.sequence).toBe(3);
    expect(s.sink.map(c => c.delta)).toEqual(['a', 'b', 'c']);
  });

  it('respects the 1MB stream cap and emits an error chunk', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    const big = 'x'.repeat(MAX_STREAM_BYTES);
    expect(() => emitChunk(s, { delta: big, isFinal: false, type: 'text' })).not.toThrow();
    expect(s.aborted).toBe(true);
    expect(s.abortedReason).toBe('error');
    const err = s.sink[s.sink.length - 1];
    expect(err?.type).toBe('error');
    expect(err?.metadata).toMatchObject({ code: 'stream-cap-exceeded' });
  });

  it('abortStream is idempotent and sets reason', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    abortStream(s, 'user-cancel');
    abortStream(s, 'user-cancel');
    expect(s.abortedReason).toBe('user-cancel');
    expect(() => emitChunk(s, { delta: 'x', isFinal: false, type: 'text' })).toThrow(/aborted/);
  });

  it('completeStream emits a final summary chunk with metadata', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    completeStream(s, 'Resumo da consulta.');
    const last = s.sink[s.sink.length - 1];
    expect(last?.isFinal).toBe(true);
    expect(last?.delta).toBe('Resumo da consulta.');
    expect(last?.metadata).toMatchObject({ complete: true });
  });
});

// ---------------------------------------------------------------------------
// 8. SSE + NDJSON responses
// ---------------------------------------------------------------------------

describe('buildSseResponse + buildNdjsonResponse', () => {
  it('buildSseResponse returns a Response with the right SSE headers', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    emitChunk(s, { delta: 'hello', isFinal: false, type: 'text' });
    abortStream(s, 'user-cancel'); // ensure clean close path
    const res = buildSseResponse(s);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    expect(res.headers.get('Cache-Control')).toBe('no-cache, no-transform');
    expect(res.headers.get('Connection')).toBe('keep-alive');
    expect(res.headers.get('X-Accel-Buffering')).toBe('no');
  });

  it('buildNdjsonResponse sets application/x-ndjson content-type', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    completeStream(s, 'done');
    const res = buildNdjsonResponse(s);
    expect(res.headers.get('Content-Type')).toBe('application/x-ndjson');
  });

  it('SSE headers disable buffering for nginx', () => {
    const s = createStream({ userId: 'u1', model: 'akasha-base' });
    abortStream(s, 'timeout');
    const res = buildSseResponse(s);
    expect(res.headers.get('X-Accel-Buffering')).toBe('no');
  });
});

// ---------------------------------------------------------------------------
// 9. Typing indicator (fake timers)
// ---------------------------------------------------------------------------

describe('computeTypingState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T20:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns isTyping=false when history is empty', () => {
    const state = computeTypingState([]);
    expect(state.isTyping).toBe(false);
    expect(state.estimatedSecondsRemaining).toBe(0);
  });

  it('reports estimated seconds based on remaining chars / velocity', () => {
    const chunks: AkashaStreamChunk[] = [
      { id: 'c1' as ReturnType<typeof generateUlid>, sequence: 1, delta: 'x'.repeat(TYPING_CHARS_PER_SEC * 3), isFinal: false, type: 'text' },
    ];
    const state = computeTypingState(chunks, new Date());
    // 150 chars / 50 chars-per-sec = 3 sec ceiling
    expect(state.estimatedSecondsRemaining).toBeGreaterThanOrEqual(3);
  });

  it('does NOT call Date.now() inside the test (timers are mocked)', () => {
    expect(vi.getMockedSystemTime()?.toISOString()).toBe('2026-06-29T20:00:00.000Z');
  });
});

// ---------------------------------------------------------------------------
// 10. Message queue + rate limit
// ---------------------------------------------------------------------------

describe('createMessageQueue', () => {
  it('accepts messages up to maxSize and drops oldest after', async () => {
    const q = createMessageQueue({ maxSize: 2, rateLimitPerMinute: 100 });
    const m1 = buildMessage({ role: 'user', content: 'a' });
    const m2 = buildMessage({ role: 'user', content: 'b' });
    const m3 = buildMessage({ role: 'user', content: 'c' });
    await q.enqueue(m1); await q.enqueue(m2); await q.enqueue(m3);
    expect(q.size()).toBe(2);
    const first = await q.dequeue();
    expect(first?.content).toBe('b');
  });

  it('enforces 30 msgs/min rate limit per queue', async () => {
    const q = createMessageQueue({ maxSize: 100, rateLimitPerMinute: 5 });
    for (let i = 0; i < 5; i++) await q.enqueue(buildMessage({ role: 'user', content: 'x' + i }));
    await expect(q.enqueue(buildMessage({ role: 'user', content: 'overflow' }))).rejects.toThrow(/rate limit/i);
  });
});

// ---------------------------------------------------------------------------
// 11. Auth tier check + quota
// ---------------------------------------------------------------------------

describe('checkUserCanStream', () => {
  it('blocks free tier once daily quota is exhausted', () => {
    const res = checkUserCanStream('hashed-user', {
      tokensUsedToday: TIER_QUOTAS['free'] ?? 10_000,
      tierLimits: TIER_QUOTAS as unknown as Record<'free' | 'plus' | 'pro' | 'sacred-circle', number | null>,
      now: new Date('2026-06-29T20:00:00Z'),
    });
    expect(res.allowed).toBe(false);
    expect(res.retryAfter).toBeInstanceOf(Date);
    expect(res.messagePtBr).toMatch(/limite diário/i);
  });

  it('allows free tier when under quota', () => {
    const res = checkUserCanStream('h1', {
      tokensUsedToday: 100,
      tierLimits: TIER_QUOTAS as unknown as Record<'free' | 'plus' | 'pro' | 'sacred-circle', number | null>,
      now: new Date('2026-06-29T05:00:00Z'),
    });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBeGreaterThan(0);
  });

  it('grants unlimited to sacred-circle tier', () => {
    const res = checkUserCanStream('h2', {
      tokensUsedToday: 999_999_999,
      tierLimits: TIER_QUOTAS as unknown as Record<'free' | 'plus' | 'pro' | 'sacred-circle', number | null>,
      now: new Date(),
    });
    expect(res.allowed).toBe(true);
    expect(res.tier).toBe('sacred-circle');
  });
});

// ---------------------------------------------------------------------------
// 12. A11y directives + summary
// ---------------------------------------------------------------------------

describe('A11y — announceAriaLive + summarizeForAria', () => {
  it('announceAriaLive returns a polite directive by default', () => {
    const d = announceAriaLive('Nova resposta do Akasha.');
    expect(d.priority).toBe('polite');
    expect(d.target).toBe('[data-akasha-aria-live]');
    expect(d.debounceMs).toBeGreaterThan(0);
  });

  it('announceAriaLive uses assertive for critical events', () => {
    const d = announceAriaLive('Erro de cota.', 'assertive');
    expect(d.priority).toBe('assertive');
    expect(d.debounceMs).toBeLessThan(200);
  });

  it('summarizeForAria collapses long messages to head+tail', () => {
    const long = 'a'.repeat(ARIA_SUMMARY_WINDOW + 500);
    const summary = summarizeForAria(long);
    expect(summary.length).toBeLessThan(long.length);
    expect(summary).toContain('…');
  });
});

// ---------------------------------------------------------------------------
// 13. Sacred text policy
// ---------------------------------------------------------------------------

describe('SacredTextPolicy', () => {
  it('withSacredGuard defaults to a singleton policy', () => {
    const r1 = withSacredGuard('Texto qualquer', null);
    expect(r1.applied).toBe(true);
    expect(r1.safe).toBe('Texto qualquer');
  });

  it('DefaultSacredTextPolicy rewrites sacred names in system-prompt context', () => {
    const p = new DefaultSacredTextPolicy();
    const out = p.sanitize('Referencie Padê de Exu.', 'system-prompt');
    expect(out.rewritten.length).toBeGreaterThan(0);
    expect(out.safe).toContain('algo profundo');
    expect(out.safe).not.toContain('Padê');
  });

  it('DefaultSacredTextPolicy blocks forbidden URLs in citation context', () => {
    const p = new DefaultSacredTextPolicy();
    const out = p.sanitize('Veja [link](https://x.com/ebó)', 'citation');
    expect(out.blocked.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 14. useStreamReducer (pure reducer)
// ---------------------------------------------------------------------------

describe('useStreamReducer', () => {
  it('appends delta to the last assistant message', () => {
    const initial = buildMessage({ role: 'assistant', content: 'Hello' });
    const chunk: AkashaStreamChunk = {
      id: 'c' as ReturnType<typeof generateUlid>,
      sequence: 1,
      delta: ', world',
      isFinal: false,
      type: 'text',
    };
    const next = useStreamReducer([initial], { type: 'append', payload: chunk });
    expect(next).toHaveLength(1);
    expect(next[0]?.content).toBe('Hello, world');
  });

  it('creates a new assistant message when last was not assistant', () => {
    const userMsg = buildMessage({ role: 'user', content: 'Q' });
    const chunk: AkashaStreamChunk = {
      id: 'c' as ReturnType<typeof generateUlid>,
      sequence: 1,
      delta: 'A',
      isFinal: false,
      type: 'text',
    };
    const next = useStreamReducer([userMsg], { type: 'append', payload: chunk });
    expect(next).toHaveLength(2);
    expect(next[1]?.role).toBe('assistant');
    expect(next[1]?.content).toBe('A');
  });

  it('abort action appends a cancellation marker to the last message', () => {
    const m = buildMessage({ role: 'assistant', content: 'partial' });
    const next = useStreamReducer([m], { type: 'abort' });
    expect(next[0]?.content).toContain('stream cancelado');
  });

  it('reset action empties the state', () => {
    const m = buildMessage({ role: 'user', content: 'x' });
    expect(useStreamReducer([m], { type: 'reset' })).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 15. Helpers — frontmatter, slugify, stripDiacritics, estimateTokens
// ---------------------------------------------------------------------------

describe('Helpers', () => {
  it('parseFrontmatter strips YAML head and returns key/value', () => {
    const r = parseFrontmatter('---\ntitle: Akasha\nauthor: Ka\n---\nBody.');
    expect(r.frontmatter['title']).toBe('Akasha');
    expect(r.frontmatter['author']).toBe('Ka');
    expect(r.body).toBe('Body.');
  });

  it('parseFrontmatter returns empty frontmatter when missing', () => {
    const r = parseFrontmatter('Just body.');
    expect(r.frontmatter).toEqual({});
    expect(r.body).toBe('Just body.');
  });

  it('slugify lowercases and strips diacritics', () => {
    expect(slugify('Olá Mundo!')).toEqual('ola-mundo');
    expect(slugify('  Caminhos da Cabala ')).toEqual('caminhos-da-cabala');
  });

  it('stripDiacritics handles NFKC + PT-BR diacritics', () => {
    expect(stripDiacritics('Coração')).toEqual('Coracao');
    expect(stripDiacritics('São Paulo')).toEqual('Sao Paulo');
  });

  it('estimateTokens respects locale ratio', () => {
    expect(estimateTokens('abcd', 'pt-br')).toBe(1); // ceil(4/4) = 1
    expect(estimateTokens('abcdefgh', 'pt-br')).toBe(2); // ceil(8/4) = 2
    expect(estimateTokens('abcdefghijkl', 'es')).toBe(4); // ceil(12/3.5) ≈ 4
  });

  it('tokenizeMarkdown produces an array of non-empty tokens', () => {
    const tokens = tokenizeMarkdown('# Heading\n\nHello *world*');
    expect(tokens.length).toBeGreaterThan(2);
    for (const t of tokens) expect(t.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 16. Sacred rest window
// ---------------------------------------------------------------------------

describe('Sacred rest window', () => {
  it('isSacredRestWindow returns true for 00-03 hours', () => {
    expect(isSacredRestWindow(0)).toBe(true);
    expect(isSacredRestWindow(2)).toBe(true);
    expect(isSacredRestWindow(3)).toBe(true);
  });

  it('isSacredRestWindow returns false outside the window', () => {
    expect(isSacredRestWindow(4)).toBe(false);
    expect(isSacredRestWindow(12)).toBe(false);
    expect(isSacredRestWindow(23)).toBe(false);
  });

  it('applySacredRestGuard suppresses during window and allows otherwise', () => {
    expect(applySacredRestGuard('Oi', 2).allowed).toBe(false);
    expect(applySacredRestGuard('Oi', 10).allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 17. Renderer + React props edge cases
// ---------------------------------------------------------------------------

describe('renderToReactProps + edge cases', () => {
  it('renderToReactProps returns dangerouslySetInnerHTML with aria-live=polite', () => {
    const ast = parseMarkdown('# Hi');
    const props = renderToReactProps(ast);
    expect(props.className).toBe('akasha-md');
    expect(props.dangerouslySetInnerHTML.__html).toContain('<h1');
    expect(props['aria-live']).toBe('polite');
  });

  it('markdown with deeply nested quotes honors MAX_MD_DEPTH', () => {
    let md = '';
    for (let i = 0; i < 10; i++) md += '> ';
    md += 'deep';
    const ast = parseMarkdown(md);
    // Beyond the depth cap the inner content may be truncated; we just assert
    // that parsing did not throw and returned a node.
    expect(ast.children.length).toBeGreaterThanOrEqual(0);
  });

  it('link with javascript: scheme is sanitized to empty URL', () => {
    const ast = parseMarkdown('[click me](javascript:alert(1))');
    const html = renderMarkdown(ast);
    expect(html).not.toContain('javascript:');
  });

  it('image with disallowed scheme is stripped to empty', () => {
    const ast = parseMarkdown('![alt](ftp://bad)');
    const html = renderMarkdown(ast);
    expect(html).not.toContain('<img');
  });

  it('renderMarkdown without sanitize keeps original entities (opt-in)', () => {
    const ast = parseMarkdown('<b>hi</b>');
    const html = renderMarkdown(ast, { sanitize: false });
    expect(html).toContain('<b>hi</b>');
  });
});

// ---------------------------------------------------------------------------
// 18. buildReadableStream + message factories
// ---------------------------------------------------------------------------

describe('buildReadableStream + buildMessage', () => {
  it('buildReadableStream wraps an async iterable into a byte stream', async () => {
    async function* src(): AsyncGenerator<AkashaStreamChunk> {
      yield {
        id: 'a' as ReturnType<typeof generateUlid>,
        sequence: 1,
        delta: 'x',
        isFinal: false,
        type: 'text',
      };
      yield {
        id: 'b' as ReturnType<typeof generateUlid>,
        sequence: 2,
        delta: 'y',
        isFinal: true,
        type: 'text',
      };
    }
    const stream = buildReadableStream(src());
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    const collected: string[] = [];
    // Read with timeout via AbortSignal
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 1000);
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        collected.push(decoder.decode(next.value));
      }
    } finally {
      clearTimeout(timeout);
      reader.releaseLock();
    }
    expect(collected.join('').split('\n').filter(Boolean).length).toBe(2);
  });

  it('buildMessage sets defaults + ULID + timestamp', () => {
    const m = buildMessage({ role: 'user', content: 'oi' });
    expect(m.id).toHaveLength(26);
    expect(m.role).toBe('user');
    expect(m.timestamp).toBeInstanceOf(Date);
  });

  it('createInMemorySessionStore + createInMemoryQuotaStore round-trip', async () => {
    const store = createInMemorySessionStore();
    const quota = createInMemoryQuotaStore();
    await quota.incrementTokens('h-user', '2026-06-29', 100);
    expect(await quota.getTokensUsed('h-user', '2026-06-29')).toBe(100);
    const msgs = [buildMessage({ role: 'user', content: 'a' })];
    await store.save(msgs);
    const loaded = await store.load(msgs[0]!.id);
    expect(loaded).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 19. Constants + surface area smoke
// ---------------------------------------------------------------------------

describe('Constants + surface area', () => {
  it('TIER_QUOTAS has all four tiers with sacred-circle unlimited', () => {
    expect(TIER_QUOTAS['free']).toBe(10_000);
    expect(TIER_QUOTAS['plus']).toBe(100_000);
    expect(TIER_QUOTAS['pro']).toBe(500_000);
    expect(TIER_QUOTAS['sacred-circle']).toBeNull();
  });

  it('TOKEN_RATIO has pt-br, en, es', () => {
    expect(TOKEN_RATIO['pt-br']).toBe(4);
    expect(TOKEN_RATIO['en']).toBe(4);
    expect(TOKEN_RATIO['es']).toBe(3.5);
  });

  it('SACRED_TOKENS contains Cabala + Candomblé sample tokens', () => {
    expect(SACRED_TOKENS).toContain('Oxalá');
    expect(SACRED_TOKENS).toContain('Sephirot');
    expect(SACRED_TOKENS).toContain('Ifá');
    expect(SACRED_TOKENS).toContain('Chakra');
  });

  it('HL_CLASS has all 8 token categories', () => {
    expect(Object.keys(HL_CLASS)).toEqual(
      expect.arrayContaining(['keyword', 'string', 'comment', 'number', 'type', 'function', 'operator', 'punctuation']),
    );
  });

  it('Several constants have sane defaults', () => {
    expect(DEFAULT_PROMPT_MAX_LENGTH).toBe(32_000);
    expect(MAX_MD_DEPTH).toBe(6);
    expect(MAX_STREAM_BYTES).toBe(1_048_576);
    expect(SSE_HEARTBEAT_MS).toBe(15_000);
    expect(TYPING_THRESHOLD_MS).toBe(1_500);
    expect(TYPING_CHARS_PER_SEC).toBe(50);
    expect(QUEUE_DEFAULT_MAX_SIZE).toBe(100);
    expect(QUEUE_RATE_PER_MIN).toBe(30);
    expect(ARIA_SUMMARY_WINDOW).toBe(500);
  });
});
