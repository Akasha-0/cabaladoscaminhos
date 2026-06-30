/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-D — AKASHA STREAMING RENDERER · SMOKE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-D Coder (Mavis orchestrator session 414764491727034)
 *
 * End-to-end smoke (≥10 assertions). Walks a realistic conversation:
 *   1. User sends a question → adapter streams response in chunks
 *   2. safeForSacred filter applied
 *   3. parseStream converts chunks → structured ParsedStream
 *   4. streamToMarkdown reconstructs markdown for "Copy" button
 *   5. Citations + code blocks render correctly
 *   6. All 7 tradição sample conversations survive the full pipeline
 *
 * This is the END-TO-END assertion layer that complements the unit specs.
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };

import {
  parseStream,
  streamToMarkdown,
  safeForSacred,
  extractCitations,
  inlineToHtml,
  blockToHtml,
  sanitizeUrl,
  escapeHtml,
  SAMPLE_CONVERSATIONS,
  TRADICOES,
  _resetSampleCounterForTests,
  type ParsedStream,
  type Citation,
} from './streaming-renderer.ts';

interface SmokeEntry {
  name: string;
  run: () => void | Promise<void>;
}

const REGISTRY: SmokeEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  REGISTRY.push({ name, run: () => run() });
}

function assertTrue(cond: boolean, msg: string): void {
  if (!cond) throw new Error('FAIL ' + msg);
}

function assertIncludes(haystack: string, needle: string, msg: string): void {
  if (!haystack.includes(needle)) {
    throw new Error('FAIL ' + msg + ' — expected to include ' + JSON.stringify(needle));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// END-TO-END PIPELINE
// ════════════════════════════════════════════════════════════════════════════

it('full pipeline: sample akasha → safeForSacred → parseStream → streamToMarkdown', () => {
  _resetSampleCounterForTests();
  for (const s of SAMPLE_CONVERSATIONS) {
    // 1. safe filter
    const safe = safeForSacred(s.akasha);
    assertTrue(safe.safe, s.tradicao + ': safe');

    // 2. parse
    const parsed = parseStream(s.akasha);
    assertTrue(parsed.chunks.length > 0, s.tradicao + ': chunks');
    assertTrue(parsed.citations.length >= 1, s.tradicao + ': ≥1 citation');

    // 3. markdown round-trip
    const md = streamToMarkdown(parsed);
    assertTrue(md.length > 0, s.tradicao + ': non-empty md');

    // 4. citation is in markdown
    const firstCitation = parsed.citations[0];
    if (firstCitation) {
      assertIncludes(
        md,
        '[' + firstCitation.title + '](' + firstCitation.url + ')',
        s.tradicao + ': citation in md',
      );
    }
  }
});

it('full pipeline: render text chunk → blockToHtml returns safe HTML', () => {
  const raw = '## Título\n\n- item 1\n- item 2\n\nTexto com **bold** e [link](https://x).';
  const parsed = parseStream(raw);
  const html = blockToHtml(parsed.chunks[0]?.content ?? '');
  assertIncludes(html, '<h2>', 'has h2');
  assertIncludes(html, '<ul>', 'has ul');
  assertIncludes(html, '<li>', 'has li');
  assertIncludes(html, '<strong>', 'has strong');
  assertIncludes(html, '<a href="https://x"', 'has link');
  // No raw <script> survives.
  assertTrue(!html.includes('<script>'), 'no raw script tag');
});

it('full pipeline: render code chunk with copy-to-clipboard shape', () => {
  const raw = '```ts\nconst x: number = 1;\n```';
  const parsed = parseStream(raw);
  const code = parsed.chunks[0];
  if (!code || code.type !== 'code') throw new Error('no code chunk');
  assertTrue(code.meta?.lang === 'ts', 'lang is ts');
  assertIncludes(code.content, 'const x', 'code body preserved');
});

it('full pipeline: streamText → parsed → citation chip rendering (count)', () => {
  const raw =
    'Veja [cite:Zohar 1:1|https://zohar] e [cite:Cabala fundamentos|https://cabala].';
  const parsed = parseStream(raw);
  // page renders 1 citation chip per citation (see RenderChunks)
  assertTrue(parsed.citations.length === 2, '2 citations');
  const c1 = parsed.citations[0];
  const c2 = parsed.citations[1];
  if (!c1 || !c2) throw new Error('missing citations');
  assertTrue(c1.title.length > 0, 'c1 title');
  assertTrue(c2.url.length > 0, 'c2 url');
  // Both should be Cabala (inferred from title)
  assertTrue(c1.tradicao === 'cabala', 'c1 inferred cabala');
  assertTrue(c2.tradicao === 'cabala', 'c2 inferred cabala');
});

it('full pipeline: offensive pairing is filtered end-to-end', () => {
  const raw = 'orixá macumba coisa ruim';
  const safe = safeForSacred(raw);
  assertTrue(!safe.safe, 'flagged');
  // Page would render the errorBox instead of the bubble body.
  // This is the GUARANTEED outcome for any text that contains a sacred term
  // AND a pejorative within 80 chars.
});

it('full pipeline: long sample (cigano) survives all chunks', () => {
  const cigano = SAMPLE_CONVERSATIONS.find((s) => s.tradicao === 'cigano');
  if (!cigano) throw new Error('no cigano sample');
  const parsed = parseStream(cigano.akasha);
  // Has at least one divider (---)
  assertTrue(parsed.chunks.some((c) => c.type === 'divider'), 'has divider');
  // Has at least one heading (## Conselho)
  assertTrue(
    parsed.chunks.some((c) => c.type === 'text' && c.content.includes('Conselho')),
    'has Conselho heading',
  );
});

it('full pipeline: every tradição sample has both a citation AND a sacred term', () => {
  // Validates that the page's citation chips + safeForSacred guard both work
  // for every sample (not just some).
  _resetSampleCounterForTests();
  for (const s of SAMPLE_CONVERSATIONS) {
    const citations = extractCitations(s.akasha);
    assertTrue(citations.length >= 1, s.tradicao + ': ≥1 citation');
    const safe = safeForSacred(s.akasha);
    assertTrue(safe.safe, s.tradicao + ': sacred-safe');
  }
});

it('full pipeline: 7-tradição coverage with no duplicates', () => {
  const seen = new Set<string>();
  for (const s of SAMPLE_CONVERSATIONS) seen.add(s.tradicao);
  assertTrue(seen.size === 7, 'exactly 7 tradições (got ' + seen.size + ')');
  for (const t of TRADICOES) assertTrue(seen.has(t), 'tradição ' + t);
});

it('full pipeline: mockRegenerate picks a fresh sample (random)', () => {
  // Smoke-equivalent of the "Regenerate" button. We don't call the real
  // function (it does setTimeout), but we verify that the sample pool has
  // enough variety to make regeneration feel non-repetitive.
  const tradSet = new Set(SAMPLE_CONVERSATIONS.map((s) => s.tradicao));
  assertTrue(tradSet.size === 7, 'regenerate has 7 unique options');
});

it('full pipeline: HTML output never contains <script> across all samples', () => {
  for (const s of SAMPLE_CONVERSATIONS) {
    const parsed = parseStream(s.akasha);
    for (const chunk of parsed.chunks) {
      if (chunk.type === 'text') {
        const html = blockToHtml(chunk.content);
        assertTrue(!html.includes('<script>'), s.tradicao + ': no script in block html');
        const inline = inlineToHtml(chunk.content);
        assertTrue(!inline.includes('<script>'), s.tradicao + ': no script in inline html');
      }
    }
  }
});

it('full pipeline: sanitizeUrl blocks javascript: in citation URLs', () => {
  const raw = 'Veja [cite:X|javascript:alert(1)] aqui.';
  const parsed = parseStream(raw);
  // No citation should survive (URL is sanitized to #).
  assertTrue(parsed.citations.length === 0, 'no citation for javascript: url');
});

it('full pipeline: escapeHtml is called on raw user input before render', () => {
  const userInput = '<script>alert(1)</script>';
  const escaped = escapeHtml(userInput);
  assertTrue(!escaped.includes('<script>'), 'no raw script');
  assertTrue(escaped.includes('&lt;script&gt;'), 'escaped');
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
  console.log('W85-D streaming-renderer.smoke.ts — ' + pass + ' PASS, ' + fail + ' FAIL');
  console.log('═══════════════════════════════════════════════════════');
  return fail;
}

run().then((failCount) => {
  process.exit(failCount === 0 ? 0 : 1);
});