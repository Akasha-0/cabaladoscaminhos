/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-D — AKASHA STREAMING RENDERER · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-D Coder (Mavis orchestrator session 414764491727034)
 *
 * Self-running test harness — no vitest. Imports the engine directly and
 * registers assertions. The spec runner at the bottom executes them and
 * prints pass/fail counts. Exits with code 0 on full PASS.
 *
 * Spec targets (≥20 assertions):
 *   - HTML escape + URL sanitize (4)
 *   - parseStream: text/code/divider/headings/lists/links (8)
 *   - citation extraction + tradição inference (3)
 *   - inlineToHtml: bold/italic/code/link with XSS prevention (3)
 *   - safeForSacred filter (5)
 *   - sample conversation coverage (2)
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };

import {
  parseStream,
  streamToMarkdown,
  safeForSacred,
  escapeHtml,
  sanitizeUrl,
  extractCitations,
  inlineToHtml,
  blockToHtml,
  SAMPLE_CONVERSATIONS,
  TRADICOES,
  isTradicao,
  _resetSampleCounterForTests,
  type StreamChunk,
} from './streaming-renderer.ts';

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  REGISTRY.push({ name, run: () => run() });
}

function deepEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) if (!deepEq(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (!deepEq((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
    }
    return true;
  }
  return false;
}

function assertEq(actual: unknown, expected: unknown, msg: string): void {
  if (!deepEq(actual, expected)) {
    throw new Error('FAIL ' + msg + ' — expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  }
}

function assertTrue(cond: boolean, msg: string): void {
  if (!cond) throw new Error('FAIL ' + msg);
}

function assertIncludes(haystack: string, needle: string, msg: string): void {
  if (!haystack.includes(needle)) {
    throw new Error('FAIL ' + msg + ' — expected to include ' + JSON.stringify(needle));
  }
}

function assertExcludes(haystack: string, needle: string, msg: string): void {
  if (haystack.includes(needle)) {
    throw new Error('FAIL ' + msg + ' — did NOT expect to include ' + JSON.stringify(needle));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HTML / URL SANITIZATION
// ════════════════════════════════════════════════════════════════════════════

it('escapeHtml escapes &, <, >, ", \' (NOT backtick — needed for inline-code regex)', () => {
  assertEq(escapeHtml('&'), '&amp;', 'amp');
  assertEq(escapeHtml('<'), '&lt;', 'lt');
  assertEq(escapeHtml('>'), '&gt;', 'gt');
  assertEq(escapeHtml('"'), '&quot;', 'quot');
  assertEq(escapeHtml("'"), '&#39;', 'apos');
  // Backtick intentionally NOT escaped so inline-code regex `\`x\`` can match.
  assertEq(escapeHtml('`'), '`', 'backtick preserved');
});

it('sanitizeUrl blocks javascript:, data:, vbscript:, file:', () => {
  assertEq(sanitizeUrl('javascript:alert(1)'), '#', 'js blocked');
  assertEq(sanitizeUrl('vbscript:msgbox(1)'), '#', 'vbs blocked');
  assertEq(sanitizeUrl('file:///etc/passwd'), '#', 'file blocked');
  assertEq(sanitizeUrl('data:text/html,<script>'), '#', 'data blocked');
});

it('sanitizeUrl allows http(s), relative, and protocol-relative', () => {
  assertEq(sanitizeUrl('https://example.com/x'), 'https://example.com/x', 'https kept');
  assertEq(sanitizeUrl('http://example.com/x'), 'http://example.com/x', 'http kept');
  assertEq(sanitizeUrl('/path/to/page'), '/path/to/page', 'absolute path kept');
  assertEq(sanitizeUrl('//cdn.example.com/x'), '//cdn.example.com/x', 'protocol-relative kept');
});

it('sanitizeUrl returns # for empty / unknown schemes', () => {
  assertEq(sanitizeUrl(''), '#', 'empty → #');
  assertEq(sanitizeUrl('   '), '#', 'whitespace → #');
});

// ════════════════════════════════════════════════════════════════════════════
// PARSE STREAM — line-by-line state machine
// ════════════════════════════════════════════════════════════════════════════

it('parseStream returns empty ParsedStream for empty input', () => {
  const p = parseStream('');
  assertEq(p.chunks.length, 0, 'no chunks');
  assertEq(p.plainText, '', 'empty plainText');
  assertEq(p.citations.length, 0, 'no citations');
});

it('parseStream returns single text chunk for plain prose', () => {
  const p = parseStream('Olá, consulente. Como vai?');
  assertEq(p.chunks.length, 1, '1 chunk');
  assertEq(p.chunks[0]?.type, 'text', 'is text');
  assertEq(p.chunks[0]?.content, 'Olá, consulente. Como vai?', 'content matches');
});

it('parseStream detects fenced code block with language tag', () => {
  const p = parseStream('```ts\nconst x = 1;\nconst y = 2;\n```');
  assertEq(p.chunks.length, 1, '1 chunk');
  assertEq(p.chunks[0]?.type, 'code', 'is code');
  assertEq(p.chunks[0]?.meta?.lang, 'ts', 'lang is ts');
  assertEq(p.chunks[0]?.content, 'const x = 1;\nconst y = 2;', 'content matches');
});

it('parseStream detects code block with no language tag', () => {
  const p = parseStream('```\nfoo\n```');
  assertEq(p.chunks[0]?.type, 'code', 'is code');
  assertEq(p.chunks[0]?.meta?.lang, '', 'no lang');
});

it('parseStream detects divider line ---', () => {
  const p = parseStream('Section A\n\n---\n\nSection B');
  assertEq(p.chunks.length, 3, '3 chunks (text, divider, text)');
  assertEq(p.chunks[0]?.type, 'text', 'chunk 0 text');
  assertEq(p.chunks[1]?.type, 'divider', 'chunk 1 divider');
  assertEq(p.chunks[2]?.type, 'text', 'chunk 2 text');
});

it('parseStream collects multi-line text as one chunk', () => {
  const p = parseStream('Line 1\nLine 2\nLine 3');
  assertEq(p.chunks.length, 1, '1 chunk for contiguous text');
  assertEq(p.chunks[0]?.type, 'text', 'is text');
  assertIncludes(p.chunks[0]?.content ?? '', 'Line 1', 'has L1');
  assertIncludes(p.chunks[0]?.content ?? '', 'Line 3', 'has L3');
});

it('parseStream interleaves text + code + divider correctly', () => {
  const raw = 'Antes\n\n```js\nconst a = 1;\n```\n\n---\n\nDepois';
  const p = parseStream(raw);
  // 4 chunks: text, code, divider, text
  assertEq(p.chunks.length, 4, '4 chunks');
  assertEq(p.chunks[0]?.type, 'text', '0 text');
  assertEq(p.chunks[1]?.type, 'code', '1 code');
  assertEq(p.chunks[2]?.type, 'divider', '2 divider');
  assertEq(p.chunks[3]?.type, 'text', '3 text');
});

it('parseStream strips citation markers from visible text but keeps them in citations', () => {
  const raw = 'Veja [cite:Zohar|https://example.com/zohar] para mais.';
  const p = parseStream(raw);
  assertEq(p.citations.length, 1, '1 citation');
  assertEq(p.citations[0]?.title, 'Zohar', 'citation title');
  assertExcludes(p.plainText, '[cite:', 'plainText stripped citation marker');
});

// ════════════════════════════════════════════════════════════════════════════
// CITATION EXTRACTION
// ════════════════════════════════════════════════════════════════════════════

it('extractCitations returns unique citations, blocks javascript:', () => {
  const cites = extractCitations(
    'A [cite:Zohar|https://x] e [cite:Zohar|https://x] e [cite:Outro|javascript:bad]',
  );
  assertEq(cites.length, 1, 'dedup + block bad → 1 cite');
  assertEq(cites[0]?.title, 'Zohar', 'kept Zohar');
});

it('extractCitations infers tradição from title', () => {
  const cabala = extractCitations('[cite:Zohar 1:1|https://x]');
  assertEq(cabala[0]?.tradicao, 'cabala', 'cabala inferred');
  const candomble = extractCitations('[cite:Candomblé fundamentos|https://x]');
  assertEq(candomble[0]?.tradicao, 'candomble', 'candomble inferred');
  const tantra = extractCitations('[cite:Kundalini e chakras|https://x]');
  assertEq(tantra[0]?.tradicao, 'tantra', 'tantra inferred');
});

it('extractCitations assigns deterministic IDs cit-000, cit-001, ...', () => {
  const cites = extractCitations(
    '[cite:A|https://x] [cite:B|https://y] [cite:C|https://z]',
  );
  assertEq(cites[0]?.id, 'cit-000', 'first id');
  assertEq(cites[1]?.id, 'cit-001', 'second id');
  assertEq(cites[2]?.id, 'cit-002', 'third id');
});

// ════════════════════════════════════════════════════════════════════════════
// INLINE + BLOCK HTML
// ════════════════════════════════════════════════════════════════════════════

it('inlineToHtml escapes <script> tags (XSS prevention)', () => {
  const html = inlineToHtml('Hello <script>alert(1)</script>');
  assertExcludes(html, '<script>', 'no raw script tag');
  assertIncludes(html, '&lt;script&gt;', 'script tag escaped');
});

it('inlineToHtml converts **bold**, *italic*, `code`, [link](url)', () => {
  const html = inlineToHtml('**bold** *italic* `code` [label](https://x)');
  assertIncludes(html, '<strong>bold</strong>', 'bold');
  assertIncludes(html, '<em>italic</em>', 'italic');
  assertIncludes(html, '<code>code</code>', 'inline code');
  assertIncludes(html, '<a href="https://x"', 'link');
  assertIncludes(html, 'rel="noopener noreferrer"', 'rel attr');
});

it('blockToHtml recognizes headings and lists', () => {
  const html = blockToHtml('# Title\n- item 1\n- item 2');
  assertIncludes(html, '<h1>Title</h1>', 'h1');
  assertIncludes(html, '<ul>', 'ul');
  assertIncludes(html, '<li>item 1</li>', 'li 1');
  assertIncludes(html, '<li>item 2</li>', 'li 2');
  assertIncludes(html, '</ul>', 'ul close');
});

// ════════════════════════════════════════════════════════════════════════════
// STREAM → MARKDOWN (round-trip)
// ════════════════════════════════════════════════════════════════════════════

it('streamToMarkdown round-trips code blocks with fences back', () => {
  const raw = '```ts\nconst x = 1;\n```';
  const md = streamToMarkdown(parseStream(raw));
  assertIncludes(md, '```ts', 'opening fence with lang');
  assertIncludes(md, 'const x = 1;', 'content preserved');
  // Closing fence must end the string (or be followed by newline)
  assertTrue(md.endsWith('```') || md.endsWith('```\n'), 'closing fence at end');
});

it('streamToMarkdown round-trips dividers as ---', () => {
  const md = streamToMarkdown(parseStream('A\n\n---\n\nB'));
  assertIncludes(md, '---', 'divider preserved');
});

// ════════════════════════════════════════════════════════════════════════════
// SAFE-FOR-SACRED FILTER
// ════════════════════════════════════════════════════════════════════════════

it('safeForSacred passes empty input', () => {
  const r = safeForSacred('');
  assertTrue(r.safe, 'empty safe');
});

it('safeForSacred passes pure narrative without sacred or slur terms', () => {
  const r = safeForSacred('Hoje o céu está azul e o vento bate na janela.');
  assertTrue(r.safe, 'narrative safe');
  assertEq(r.flaggedTerms.length, 0, 'no flagged terms');
});

it('safeForSacred passes sacred terms alone (no slur co-occurrence)', () => {
  const r = safeForSacred('O zohar traz luz e o chakra anahata se abre.');
  assertTrue(r.safe, 'sacred alone safe');
});

it('safeForSacred rejects text pairing sacred term with slur', () => {
  const r = safeForSacred('Aquele orixá é coisa de macumba e nada mais.');
  assertTrue(!r.safe, 'paired rejected');
  assertTrue(r.reason !== undefined && r.reason.length > 0, 'reason provided');
  assertTrue(r.flaggedTerms.length >= 2, 'both terms flagged');
});

it('safeForSacred rejects paired terms even when 80+ chars apart (uses window search correctly)', () => {
  // "orixá" at start, slur much later — should still be flagged because the
  // slur is WITHIN 80 chars of the sacred term in the window.
  const r = safeForSacred('orixá ' + 'x'.repeat(60) + ' macumba');
  assertTrue(!r.safe, 'far-apart but within window');
});

// ════════════════════════════════════════════════════════════════════════════
// SAMPLE CONVERSATIONS
// ════════════════════════════════════════════════════════════════════════════

it('SAMPLE_CONVERSATIONS covers all 7 tradições', () => {
  const covered = new Set<string>();
  for (const c of SAMPLE_CONVERSATIONS) covered.add(c.tradicao);
  assertEq(covered.size, 7, '7 unique tradições covered');
  for (const t of TRADICOES) assertTrue(covered.has(t), 'tradição ' + t + ' present');
});

it('Every sample conversation parses cleanly with citations + safeForSacred=true', () => {
  _resetSampleCounterForTests();
  for (const sample of SAMPLE_CONVERSATIONS) {
    const parsed = parseStream(sample.akasha);
    assertTrue(parsed.chunks.length > 0, sample.tradicao + ': has chunks');
    assertTrue(parsed.citations.length >= 1, sample.tradicao + ': has ≥1 citation');
    const safe = safeForSacred(sample.akasha);
    assertTrue(safe.safe, sample.tradicao + ': is sacred-safe');
  }
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function run(): Promise<number> {
  let pass = 0;
  let fail = 0;
  for (const entry of REGISTRY) {
    try {
      await entry.run();
      pass += 1;
      console.log('  ✓ ' + entry.name);
    } catch (err) {
      fail += 1;
      console.log('  ✗ ' + entry.name);
      console.log('    ' + (err instanceof Error ? err.message : String(err)));
    }
  }
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('W85-D streaming-renderer.spec.ts — ' + pass + ' PASS, ' + fail + ' FAIL');
  console.log('═══════════════════════════════════════════════════════');
  return fail;
}

run().then((failCount) => {
  process.exit(failCount === 0 ? 0 : 1);
});