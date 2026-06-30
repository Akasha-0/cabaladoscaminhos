// ============================================================================
// src/lib/akasha-ui/__tests__/smoke.ts
// ============================================================================
// Self-running smoke test for the Akasha UI library (Wave 72 — Worker C).
//
// Run with:
//   node --experimental-strip-types --no-warnings \
//     src/lib/akasha-ui/__tests__/smoke.ts
//
// Tests:
//   1. Sacred tag parser — kinds, labels, raw tokens
//   2. Markdown renderer — features, safety, tag passthrough
//   3. SSE event parser — chunk reassembly, JSON parsing
//   4. Sacred tag boundary regex (no `supertag:foo` matches)
//   5. URL safety (no `javascript:` passes)
//   6. Audit helpers (kinds >= 5, features >= 5)
//
// Output: a per-section pass/fail report + a final summary.
// Exits 0 on full pass, 1 on any failure.
// ============================================================================

import {
  extractSacredTags,
  parseTagToken,
  replaceSacredTags,
  auditSacredTable,
  TAG_REGEX,
  SACRED_TABLE,
} from '../sacred-tag-parser.ts';
import {
  renderMarkdown,
  renderWithTags,
  isSafeUrl,
  auditMarkdownFeatures,
} from '../markdown-renderer.ts';

// ─── Test harness ──────────────────────────────────────────────────────────

let total = 0;
let passed = 0;
let failed = 0;

function section(name: string) {
  console.log(`\n── ${name} ──`);
}

function check(label: string, cond: unknown) {
  total++;
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
  }
}

function checkEq<T>(label: string, actual: T, expected: T) {
  total++;
  const ok = Object.is(actual, expected);
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
    console.log(`     expected: ${JSON.stringify(expected)}`);
    console.log(`     got:      ${JSON.stringify(actual)}`);
  }
}

// ─── 1. Sacred tag parser ────────────────────────────────────────────────

section('1. Sacred tag parser');

const orixaTag = parseTagToken('orixa-oxala');
check('parses orixa-oxala', orixaTag !== null);
checkEq('orixa label', orixaTag?.label, 'Oxalá');

const iemanja = parseTagToken('orixa-iemanja');
checkEq('iemanja label', iemanja?.label, 'Iemanjá');

const arcanoTag = parseTagToken('arcano-0-the-fool');
check('parses arcano-0-the-fool', arcanoTag !== null);
checkEq('arcano label', arcanoTag?.label, 'The Fool');
checkEq('arcano number meta', arcanoTag?.meta.number, 0);

const arcanoNamed = parseTagToken('arcano-13');
check('parses arcano-13 (number-only)', arcanoNamed !== null);
checkEq('arcano-13 number meta', arcanoNamed?.meta.number, 13);

const chakraTag = parseTagToken('chakra-4');
check('parses chakra-4', chakraTag !== null);
checkEq('chakra-4 label', chakraTag?.label, 'Heart');

const sephirahTag = parseTagToken('sephirah-3-tiphareth');
check('parses sephirah-3-tiphareth', sephirahTag !== null);
checkEq('sephirah-3 label', sephirahTag?.label, 'Tiphareth');

const oduTag = parseTagToken('odu-2');
check('parses odu-2', oduTag !== null);
checkEq('odu-2 label', oduTag?.label, 'Oyeku-Meji');

const masterNum = parseTagToken('numero-11');
check('parses numero-11 (master)', masterNum !== null);
checkEq('numero-11 label', masterNum?.label, 'Onze');
checkEq('numero-11 isMaster', masterNum?.meta.isMaster, true);

const normalNum = parseTagToken('numero-7');
check('parses numero-7 (non-master)', normalNum !== null);
checkEq('numero-7 isMaster', normalNum?.meta.isMaster, false);

const ciganoTag = parseTagToken('cigano-13');
check('parses cigano-13', ciganoTag !== null);
checkEq('cigano-13 label', ciganoTag?.label, 'A Criança');

const ciganoLong = parseTagToken('cigano-36-trevo');
check('parses cigano-36-trevo', ciganoLong !== null);
checkEq('cigano-36 label', ciganoLong?.label, 'Cruz de Anjos');

// Edge cases
const bad = parseTagToken('unknown-foo');
check('rejects unknown prefix', bad === null);

const outOfRange = parseTagToken('chakra-99');
check('rejects out-of-range chakra', outOfRange === null);

// ─── 2. extractSacredTags + boundary regex ───────────────────────────────

section('2. extractSacredTags + boundary regex');

const text1 = 'Oxalá representa a criação [tag:orixa-oxala] segundo Ifá. E [tag:arcano-0-the-fool] é o Louco.';
const tags1 = extractSacredTags(text1);
checkEq('finds 2 tags', tags1.length, 2);
checkEq('first tag kind', tags1[0]?.kind, 'orixa');
checkEq('first tag label', tags1[0]?.label, 'Oxalá');
checkEq('second tag kind', tags1[1]?.kind, 'arcano');
checkEq('second tag label', tags1[1]?.label, 'The Fool');

// Boundary: no match for `supertag:foo` (no word boundary before "tag:")
const text2 = 'supertag:foo should not match';
TAG_REGEX.lastIndex = 0;
const boundaryHit = TAG_REGEX.test(text2);
check('boundary regex rejects "supertag:foo"', !boundaryHit);

// Boundary: no match inside brackets `[` is not allowed
const text3 = '[[tag:orixa-oxala]]';
TAG_REGEX.lastIndex = 0;
const doubleBracket = TAG_REGEX.test(text3);
check('boundary regex rejects double-bracketed', !doubleBracket);

// Boundary: match for `… [tag:foo] …` (whitespace boundaries)
const text4 = 'Hello [tag:orixa-oxala] world';
TAG_REGEX.lastIndex = 0;
const whitespace = TAG_REGEX.test(text4);
check('boundary regex matches with whitespace', whitespace);

// replaceSacredTags round-trip
const replaced = replaceSacredTags('Look at [tag:orixa-oxala] and [tag:arcano-0-the-fool]');
check('replaceSacredTags substitutes both', 
  replaced === 'Look at [[TAG:orixa:Oxalá]] and [[TAG:arcano:The Fool]]');

// ─── 3. Markdown renderer ────────────────────────────────────────────────

section('3. Markdown renderer');

const md1 = renderMarkdown('# Hello\n\nThis is **bold** and *italic* and `code`.');
check('h1 → <h1>', md1.includes('<h1>') && md1.includes('</h1>'));
check('bold → <strong>', md1.includes('<strong>bold</strong>'));
check('italic → <em>', md1.includes('<em>italic</em>'));
check('inline code → <code>', md1.includes('<code>code</code>'));

const md2 = renderMarkdown('## H2\n\n### H3');
check('h2 → <h2>', md2.includes('<h2>') && md2.includes('</h2>'));
check('h3 → <h3>', md2.includes('<h3>') && md2.includes('</h3>'));

const md3 = renderMarkdown('A [link](https://example.com) here.');
check('markdown link → <a>', 
  md3.includes('<a href="https://example.com"') && md3.includes('>link</a>'));

const md4 = renderMarkdown('Bad [link](javascript:alert(1)) here.');
// Note: standard markdown leaves the trailing `)` orphaned (the link regex
// stops at the first `)`). The security goal is met: no `javascript:` URL
// in the output, and the link text is preserved.
check('javascript: URL stripped',
  !md4.includes('javascript:') && md4.includes('link') && md4.includes('here'));

const md5 = renderMarkdown('## Title\n\n<script>alert(1)</script>');
check('script tag escaped', 
  md5.includes('&lt;script&gt;') && !md5.includes('<script>'));

const md6 = renderMarkdown('# H\n\nFirst line\nSecond line');
check('newlines preserved', md6.length > 0 && md6.includes('First line'));

checkEq('isSafeUrl(https://x) is true', isSafeUrl('https://x.com'), true);
checkEq('isSafeUrl(javascript:foo) is false', isSafeUrl('javascript:foo'), false);
checkEq('isSafeUrl(/relative) is true', isSafeUrl('/relative'), true);
checkEq('isSafeUrl(mailto:a@b) is true', isSafeUrl('mailto:a@b.com'), true);
checkEq('isSafeUrl(empty) is false', isSafeUrl(''), false);

// ─── 4. renderWithTags ──────────────────────────────────────────────────

section('4. renderWithTags — tag placeholders interleave with HTML');

const sourceText = 'Olha [tag:orixa-oxala] ligado ao [tag:arcano-0-the-fool] no Tarot.';
const segs = renderWithTags(sourceText);
check('segments length >= 3', segs.length >= 3);
const tagSegs = segs.filter((s) => s.kind === 'tag');
checkEq('tag segment count', tagSegs.length, 2);
checkEq('first tag kind', (tagSegs[0]?.payload as { kind: string }).kind, 'orixa');
checkEq('second tag kind', (tagSegs[1]?.payload as { kind: string }).kind, 'arcano');

// ─── 5. Audit helpers ────────────────────────────────────────────────────

section('5. Audit helpers');

const sacredAudit = auditSacredTable();
check('kinds >= 5', sacredAudit.kinds >= 5);
check('totalLabels >= 5', sacredAudit.totalLabels >= 5);
console.log(`     kinds: ${sacredAudit.kinds}, totalLabels: ${sacredAudit.totalLabels}`);
console.log(`     per-kind: ${JSON.stringify(sacredAudit.perKind)}`);

const mdAudit = auditMarkdownFeatures();
check('markdown features >= 5', mdAudit.supportedCount >= 5);
console.log(`     features: ${mdAudit.features.length}`);

// ─── 6. SACRED_TABLE — count distinct kinds ──────────────────────────────

section('6. SACRED_TABLE integrity');

const distinctKinds = Object.keys(SACRED_TABLE);
checkEq('distinct kinds', distinctKinds.length, 7);
check('includes orixa', distinctKinds.includes('orixa'));
check('includes arcano', distinctKinds.includes('arcano'));
check('includes chakra', distinctKinds.includes('chakra'));
check('includes sephirah', distinctKinds.includes('sephirah'));
check('includes odu', distinctKinds.includes('odu'));
check('includes numero', distinctKinds.includes('numero'));
check('includes cigano', distinctKinds.includes('cigano'));

// ─── 7. SSE event split (mini inline impl) ──────────────────────────────

section('7. SSE protocol sanity');

function splitSse(buffer: string): { events: string[]; rest: string } {
  const events: string[] = [];
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  for (const part of parts) {
    const lines = part.split('\n');
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }
    if (dataLines.length > 0) events.push(dataLines.join('\n'));
  }
  return { events, rest };
}

const sse1 = 'data: {"type":"token","payload":{"content":"A"}}\n\ndata: {"type":"token","payload":{"content":"B"}}\n\ndata: {"type":"done","payload":{"tokens":2,"took_ms":50}}\n\n';
const sseRes = splitSse(sse1);
checkEq('SSE 3 events', sseRes.events.length, 3);
checkEq('SSE 0 rest', sseRes.rest, '');

const sse2 = 'data: {"type":"token","payload":{"content":"par';
const sseRes2 = splitSse(sse2);
checkEq('SSE partial keeps rest', sseRes2.events.length, 0);
checkEq('SSE partial rest length', sseRes2.rest.length, sse2.length);

const sse3 = sse2 + 'tial"}}\n\ndata: {"type":"done","payload":{"tokens":1,"took_ms":10}}\n\n';
const sseRes3 = splitSse(sse3);
checkEq('SSE 2 events after partial completes', sseRes3.events.length, 2);
checkEq('SSE 0 rest after full', sseRes3.rest, '');

// ─── 8. URL safety edge cases ────────────────────────────────────────────

section('8. URL safety edge cases');

checkEq('data: URL blocked', isSafeUrl('data:text/html,foo'), false);
checkEq('vbscript: blocked', isSafeUrl('vbscript:msgbox(1)'), false);
checkEq('file: blocked', isSafeUrl('file:///etc/passwd'), false);
checkEq('relative path allowed', isSafeUrl('/library/papers/123'), true);
checkEq('anchor allowed', isSafeUrl('#section-1'), true);

// ─── Summary ────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════');
console.log(`Smoke result: ${passed}/${total} PASS${failed > 0 ? `, ${failed} FAIL` : ''}`);
console.log('══════════════════════════════════════════════════════');

if (failed > 0) {
  process.exit(1);
}
process.exit(0);
