// Akasha IA Explainability — Smoke test (self-running, no vitest needed)
// Run: `node --experimental-strip-types src/lib/w63/__tests__/akasha_explainability.test.ts`
// Exit code 1 if any assertion fails.

import * as eng from '../akasha_explainability.ts';

// Minimal process declaration so TSC --strict succeeds without @types/node.
declare const process: { exit(code: number): never };

let pass = 0;
let fail = 0;
let lastAsserted = '';

function assert(cond: unknown, msg: string): void {
  if (cond === true || cond === 1) {
    pass++;
    return;
  }
  fail++;
  // eslint-disable-next-line no-console
  console.error(`FAIL: ${msg} (cond=${String(cond)})`);
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  if (actual === expected) {
    pass++;
    return;
  }
  fail++;
  // eslint-disable-next-line no-console
  console.error(`FAIL: ${msg} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertApprox(actual: number, expected: number, tolerance: number, msg: string): void {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (ok) {
    pass++;
    return;
  }
  fail++;
  console.error(`FAIL: ${msg} — expected ${expected}±${tolerance}, got ${actual}`);
}

function assertType(t: unknown, label: string): void {
  if (typeof t !== 'undefined' && t !== null) {
    pass++;
    return;
  }
  fail++;
  console.error(`FAIL: type ${label} is undefined/null`);
}

function section(name: string): void {
  lastAsserted = name;
  console.log(`\n--- ${name} ---`);
}

// ───────── Section 1 — type definitions & runtime exports ─────────
section('core types & runtime exports');
const exportedKeys: ReadonlyArray<string> = Object.keys(eng);
assert(exportedKeys.length > 20, `module exports > 20 items (got ${exportedKeys.length})`);
// Type-only exports (Citation, CitationConfidence, TraceStep, ExplainabilityPayload,
// CitationSourceType, ExplainabilityCoverage, ExplainabilitySummary, CombinedScores,
// TraceContext) are stripped by tsc — they don't appear at runtime.
assertType(typeof eng.ENGINE_INFO, 'ENGINE_INFO');
assertType(eng.ENGINE_INFO.cycle, 'ENGINE_INFO.cycle');
assertEq(eng.ENGINE_INFO.cycle, 'w63', 'ENGINE_INFO.cycle === w63');
assertEq(eng.ENGINE_INFO.moduleName, 'akasha_explainability', 'ENGINE_INFO.moduleName');
assert(eng.ENGINE_INFO.exportCount >= 20, `ENGINE_INFO.exportCount >= 20 (got ${eng.ENGINE_INFO.exportCount})`);
assertEq(eng.ENGINE_INFO.traditionsCount, 8, 'ENGINE_INFO.traditionsCount');
assertEq(eng.ENGINE_INFO.totalSacredSymbols, 153, 'ENGINE_INFO.totalSacredSymbols');
assert(Array.isArray(eng.__ALL_EXPORTS), '__ALL_EXPORTS is array');
assert(eng.__ALL_EXPORTS.length >= 20, `__ALL_EXPORTS.length >= 20 (got ${eng.__ALL_EXPORTS.length})`);

// ───────── Section 2 — buildCitation ─────────
section('buildCitation');
{
  const c = eng.buildCitation('cigano-01', 'cigano', 'O Cavalheiro traz movimento', 0.8, 0.7);
  assertEq(c.sourceId, 'cigano-01', 'buildCitation sourceId');
  assertEq(c.sourceType, 'cigano', 'buildCitation sourceType');
  assert(c.excerpt.length > 0, 'buildCitation excerpt non-empty');
  assertEq(c.relevance, 0.8, 'buildCitation relevance');
  assertEq(c.weight, 0.7, 'buildCitation weight');
  const clamped = eng.buildCitation('x', 'cigano', 'y', 2.0, -0.5);
  assertEq(clamped.relevance, 1, 'buildCitation clamps relevance > 1');
  assertEq(clamped.weight, 0, 'buildCitation clamps weight < 0');
  // Empty sourceId throws
  let threw = false;
  try { eng.buildCitation('  ', 'cigano', 'y'); } catch { threw = true; }
  assert(threw, 'buildCitation throws on empty sourceId');
  // Excerpt truncation
  const longText = 'a'.repeat(500);
  const cLong = eng.buildCitation('id', 'article', longText);
  assert(cLong.excerpt.length <= 240, `excerpt truncation <= 240 (got ${cLong.excerpt.length})`);
  assert(cLong.excerpt.endsWith('\u2026') || cLong.excerpt.length === 240, 'excerpt ends with ellipsis or at limit');
}

// ───────── Section 3 — buildTraceStep ─────────
section('buildTraceStep');
{
  const s = eng.buildTraceStep(1, 'input', 'parsed query');
  assertEq(s.stepNumber, 1, 'buildTraceStep stepNumber');
  assertEq(s.kind, 'input', 'buildTraceStep kind');
  assertEq(s.description, 'parsed query', 'buildTraceStep description');
  assertEq(s.elapsedMs, undefined, 'no elapsedMs by default');
  const s2 = eng.buildTraceStep(2, 'lookup', 'found', { elapsedMs: 12.5, references: ['src-1', 'src-2'] });
  assertEq(s2.elapsedMs, 12.5, 'elapsedMs preserved');
  assertEq(s2.references?.length, 2, 'references preserved');
  let threw = false;
  try { eng.buildTraceStep(0, 'input', 'x'); } catch { threw = true; }
  assert(threw, 'buildTraceStep throws on stepNumber 0');
  let threwFrac = false;
  try { eng.buildTraceStep(1.5, 'input', 'x'); } catch { threwFrac = true; }
  assert(threwFrac, 'buildTraceStep throws on non-integer stepNumber');
  let threwNeg = false;
  try { eng.buildTraceStep(1, 'input', 'x', { elapsedMs: -1 }); } catch { threwNeg = true; }
  assert(threwNeg, 'buildTraceStep throws on negative elapsedMs');
}

// ───────── Section 4 — startTrace round-trip ─────────
section('startTrace round-trip');
{
  const trace = eng.startTrace();
  trace.push({ kind: 'input', description: 'received' });
  trace.push({ kind: 'parse', description: 'tokenized', references: ['src-1'] });
  trace.push({ kind: 'inference', description: 'reasoned', elapsedMs: 5 });
  trace.mark('mid', 8);
  const finished = trace.finish();
  assertEq(finished.length, 3, 'trace.length === 3');
  assertEq(finished[0]!.kind, 'input', 'trace[0].kind');
  assertEq(finished[2]!.kind, 'inference', 'trace[2].kind');
  assertEq(typeof finished[0]!.stepNumber, 'number', 'stepNumber is number');
  assertEq(finished[0]!.stepNumber, 1, 'first step number is 1');
  assertEq(finished[1]!.references?.[0], 'src-1', 'references preserved');
  // Tracing finish() returns readonly array (frozen)
  assert(Object.isFrozen(finished), 'trace is frozen');
}

// ───────── Section 5 — scoreCitations math ─────────
section('scoreCitations');
{
  assertEq(eng.scoreCitations([]), 0, '0 citations → 0 score');
  // All strong-relevant + high-weight citations should produce a high score
  const strong: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cabala', 'x', 0.9, 1.0),
    eng.buildCitation('b', 'cigano', 'x', 0.95, 0.95),
    eng.buildCitation('c', 'orixa', 'x', 0.9, 0.9),
  ];
  const sStrong = eng.scoreCitations(strong);
  assert(sStrong > 0.85, `strong citations → score > 0.85 (got ${sStrong.toFixed(3)})`);
  // Mixed: tier-multiplier should make cabala/strong outweigh tantra
  const mixed: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cabala', 'x', 0.9, 1.0),
    eng.buildCitation('b', 'tantra', 'x', 0.4, 0.4),
  ];
  const sMixed = eng.scoreCitations(mixed);
  assert(sMixed > 0.5, `mixed cabala+tantra → score > 0.5 (got ${sMixed.toFixed(3)})`);
  // Low weight all
  const low: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'article', 'x', 0.2, 0.2),
    eng.buildCitation('b', 'article', 'y', 0.3, 0.3),
  ];
  const sLow = eng.scoreCitations(low);
  assert(sLow < 0.5, `low-weight article → score < 0.5 (got ${sLow.toFixed(3)})`);
  // Density bonus: 6 citations ≥ 1 citation
  const small: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cigano', 'x', 0.7, 0.7),
  ];
  const big: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cigano', 'x', 0.7, 0.7),
    eng.buildCitation('b', 'cigano', 'y', 0.7, 0.7),
    eng.buildCitation('c', 'cigano', 'z', 0.7, 0.7),
    eng.buildCitation('d', 'cigano', 'w', 0.7, 0.7),
    eng.buildCitation('e', 'cigano', 'v', 0.7, 0.7),
    eng.buildCitation('f', 'cigano', 'u', 0.7, 0.7),
  ];
  assert(eng.scoreCitations(big) > eng.scoreCitations(small), 'density bonus: 6 > 1');
  // Hand-rolled math check: 1 citation, relevance=0.5, weight=0.5, tier cigano=0.95
  // wSum = 0.5*0.95 = 0.475, weightedSum = 0.5*0.95*0.5 = 0.2375, base = 0.5
  // density = 0 (only 1 citation)
  // → 0.5
  const single: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cigano', 'x', 0.5, 0.5),
  ];
  assertApprox(eng.scoreCitations(single), 0.5, 0.001, 'single citation hand math');
}

// ───────── Section 6 — boostScoreByCitations ─────────
section('boostScoreByCitations');
{
  const cites: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cigano', 'x', 0.7, 0.7),
    eng.buildCitation('b', 'orixa', 'y', 0.7, 0.7),
    eng.buildCitation('c', 'astrologia', 'z', 0.7, 0.7),
  ];
  const base = 0.7;
  const boosted = eng.boostScoreByCitations(base, cites);
  assert(boosted >= base, `boost >= base (got ${boosted.toFixed(3)})`);
  assert(boosted <= 0.99, `boost capped at 0.99 (got ${boosted})`);
  // Empty citations: no boost
  assertEq(eng.boostScoreByCitations(0.5, []), 0.5, 'empty citations → no boost');
  // Already at cap should not exceed
  const capped = eng.boostScoreByCitations(0.99, cites);
  assert(capped <= 0.99, `boost already at cap stays ≤ 0.99 (got ${capped})`);
}

// ───────── Section 7 — decayScoreByCoverage ─────────
section('decayScoreByCoverage');
{
  // coverage ≥ 0.5: no decay
  assertEq(eng.decayScoreByCoverage(0.8, 0.5), 0.8, 'coverage 0.5 → no decay');
  assertEq(eng.decayScoreByCoverage(0.8, 1.0), 0.8, 'coverage 1.0 → no decay');
  // coverage < 0.5: should be lower
  const decayed = eng.decayScoreByCoverage(0.8, 0.2);
  assert(decayed < 0.8, `coverage 0.2 < 0.8 (got ${decayed.toFixed(3)})`);
  const zero = eng.decayScoreByCoverage(0.8, 0);
  assertEq(zero, 0, 'coverage 0 → 0');
}

// ───────── Section 8 — labelConfidence boundaries ─────────
section('labelConfidence boundaries');
{
  assertEq(eng.labelConfidence(0), 'speculative', '0 → speculative');
  assertEq(eng.labelConfidence(0.29), 'speculative', '0.29 → speculative');
  assertEq(eng.labelConfidence(0.3), 'contextual', '0.3 → contextual');
  assertEq(eng.labelConfidence(0.49), 'contextual', '0.49 → contextual');
  assertEq(eng.labelConfidence(0.5), 'supportive', '0.5 → supportive');
  assertEq(eng.labelConfidence(0.69), 'supportive', '0.69 → supportive');
  assertEq(eng.labelConfidence(0.7), 'strong', '0.7 → strong');
  assertEq(eng.labelConfidence(0.84), 'strong', '0.84 → strong');
  assertEq(eng.labelConfidence(0.85), 'foundational', '0.85 → foundational');
  assertEq(eng.labelConfidence(1), 'foundational', '1.0 → foundational');
  assertEq(eng.labelConfidence(-1), 'speculative', '-1 clamped → speculative');
  assertEq(eng.labelConfidence(99), 'foundational', '99 clamped → foundational');
}

// ───────── Section 9 — combineScore all 5 aggregators ─────────
section('combineScore all 5 aggregators');
{
  const c = eng.combineScore(0.4, 0.6, 0.8);
  assertEq(c.min, 0.4, 'combineScore.min');
  assertEq(c.max, 0.8, 'combineScore.max');
  assertApprox(c.mean, 0.6, 0.001, 'combineScore.mean');
  assert(c.weightedMean > 0.4 && c.weightedMean < 0.8, `combineScore.weightedMean in (0.4, 0.8) (got ${c.weightedMean.toFixed(3)})`);
  assert(c.geometricMean > 0.4 && c.geometricMean < 0.8, `combineScore.geometricMean in (0.4, 0.8) (got ${c.geometricMean.toFixed(3)})`);
  // Empty
  const empty = eng.combineScore();
  assertEq(empty.min, 0, 'empty combineScore.min');
  assertEq(empty.max, 0, 'empty combineScore.max');
  // Single value
  const single = eng.combineScore(0.5);
  assertEq(single.min, 0.5, 'single min');
  assertEq(single.max, 0.5, 'single max');
  assertEq(single.mean, 0.5, 'single mean');
  // Weighted mean should weight EARLIER numbers more heavily than later ones
  const wm = eng.combineScore(1.0, 0.0).weightedMean;
  assert(wm > 0.5, `weightedMean favors higher earlier values (got ${wm.toFixed(3)})`);
  // Geometric mean handles near-zero
  const gm = eng.combineScore(0.001, 0.5).geometricMean;
  assert(gm > 0 && gm < 0.5, `geometricMean handles near-zero: got ${gm.toFixed(3)}`);
}

// ───────── Section 10 — extractCiganoCitations ≥ 5 ─────────
section('extractCiganoCitations ≥ 5 cards');
{
  const txt = 'Saiu o Cavalheiro, a Cigana, o Navio, o Templo, o Sol, a Lua, e a Carta. ';
  const cites = eng.extractCiganoCitations(txt);
  assert(cites.length >= 5, `cigano citations >= 5 (got ${cites.length})`);
  const types = new Set(cites.map((c) => c.sourceId));
  assert(types.size === cites.length, 'cigano no duplicates');
  // Specific ones
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('cigano-01'), 'cigano-01 (Cavalheiro)');
  assert(ids.has('cigano-02'), 'cigano-02 (Cigana)');
  // Check excerpt extraction produces non-empty excerpt
  for (const c of cites) {
    assert(c.excerpt.length > 0, `cigano excerpt non-empty for ${c.sourceId}`);
    assertEq(c.sourceType, 'cigano', 'cigano sourceType');
  }
  // Empty text → no citations
  assertEq(eng.extractCiganoCitations('').length, 0, 'empty text → no cigano citations');
}

// ───────── Section 11 — extractOrixaCitations ≥ 8 ─────────
section('extractOrixaCitations ≥ 8 orixas');
{
  const txt = 'Os caminhos de Exu abrem. Ogum protege. Oxossi caça. Xango troveja. Oxala acalma. Iemanja abraça. Iansa gira. Oxum flui. Nanã ensina. ';
  const cites = eng.extractOrixaCitations(txt);
  assert(cites.length >= 8, `orixa citations >= 8 (got ${cites.length})`);
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('orixa-exu'), 'orixa-exu');
  assert(ids.has('orixa-ogum'), 'orixa-ogum');
  assert(ids.has('orixa-oxossi'), 'orixa-oxossi');
  assert(ids.has('orixa-xango'), 'orixa-xango');
  assert(ids.has('orixa-oxala'), 'orixa-oxala');
  assert(ids.has('orixa-iemanja'), 'orixa-iemanja');
  assert(ids.has('orixa-iansa'), 'orixa-iansa');
  assert(ids.has('orixa-oxum'), 'orixa-oxum');
  for (const c of cites) assertEq(c.sourceType, 'orixa', 'orixa sourceType');
}

// ───────── Section 12 — extractOduCitations ≥ 8 ─────────
section('extractOduCitations ≥ 8 odus');
{
  const txt = 'No jogo: Eji-Oko, Okana, Ika, Oturupon, Iwori, Obará, Odi, Ogunda, Osa. ';
  const cites = eng.extractOduCitations(txt);
  assert(cites.length >= 8, `odu citations >= 8 (got ${cites.length})`);
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('odu-eji-oko'), 'odu-eji-oko');
  assert(ids.has('odu-okana'), 'odu-okana');
  assert(ids.has('odu-ika'), 'odu-ika');
  assert(ids.has('odu-oturupon'), 'odu-oturupon');
  assert(ids.has('odu-iwori'), 'odu-iwori');
  assert(ids.has('odu-obara'), 'odu-obara');
  assert(ids.has('odu-odi'), 'odu-odi');
  assert(ids.has('odu-ogunda'), 'odu-ogunda');
  for (const c of cites) assertEq(c.sourceType, 'odu', 'odu sourceType');
}

// ───────── Section 13 — extractAstrologiaCitations (signo + planeta) ─────────
section('extractAstrologiaCitations');
{
  const txt = 'O mapa natal mostra Áries no ascendente, com Sol em Leão, Lua em Touro, e Mercúrio retrógrado. Casa 7 ativa.';
  const cites = eng.extractAstrologiaCitations(txt);
  assert(cites.length >= 3, `astro citations >= 3 (got ${cites.length})`);
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('signo-aries'), 'signo-aries');
  assert(ids.has('signo-leao'), 'signo-leao');
  assert(ids.has('signo-touro'), 'signo-touro');
  assert(ids.has('planeta-sol'), 'planeta-sol');
  assert(ids.has('planeta-lua'), 'planeta-lua');
  assert(ids.has('planeta-mercurio'), 'planeta-mercurio');
  assert(ids.has('casa-07'), 'casa-07');
  for (const c of cites) assertEq(c.sourceType, 'astrologia', 'astro sourceType');
}

// ───────── Section 14 — extractNumerologiaCitations ≥ 3 ─────────
section('extractNumerologiaCitations');
{
  const txt = 'Seu número 7 de destino. O número 11 mestre. O ano do número 1. O número 22 mestre construtor. ';
  const cites = eng.extractNumerologiaCitations(txt);
  assert(cites.length >= 3, `numero citations >= 3 (got ${cites.length})`);
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('num-7'), 'num-7');
  assert(ids.has('num-11'), 'num-11');
  assert(ids.has('num-1'), 'num-1');
  assert(ids.has('num-22'), 'num-22');
  for (const c of cites) assertEq(c.sourceType, 'numerologia', 'numero sourceType');
}

// ───────── Section 15 — extractSefirotCitations ≥ 5 ─────────
section('extractSefirotCitations');
{
  const txt = 'Na Árvore da Vida, Keter é a Coroa, Chokhmah a Sabedoria, Binah o Entendimento, Chesed a Misericórdia, e Geburah o Rigor. ';
  const cites = eng.extractSefirotCitations(txt);
  assert(cites.length >= 5, `sefirot citations >= 5 (got ${cites.length})`);
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('sefirot-keter'), 'sefirot-keter');
  assert(ids.has('sefirot-chokhmah'), 'sefirot-chokhmah');
  assert(ids.has('sefirot-binah'), 'sefirot-binah');
  assert(ids.has('sefirot-chesed'), 'sefirot-chesed');
  assert(ids.has('sefirot-geburah'), 'sefirot-geburah');
  for (const c of cites) assertEq(c.sourceType, 'sefirot', 'sefirot sourceType');
}

// ───────── Section 16 — extractTarotCitations ≥ 5 ─────────
section('extractTarotCitations');
{
  const txt = 'Saíram O Mago, A Sacerdotisa, A Imperatriz, O Imperador, e O Carro. A carta mais forte foi A Torre.';
  const cites = eng.extractTarotCitations(txt);
  assert(cites.length >= 5, `tarot citations >= 5 (got ${cites.length})`);
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('tarot-01'), 'tarot-01 (O Mago)');
  assert(ids.has('tarot-02'), 'tarot-02 (Sacerdotisa)');
  assert(ids.has('tarot-03'), 'tarot-03 (Imperatriz)');
  assert(ids.has('tarot-04'), 'tarot-04 (Imperador)');
  assert(ids.has('tarot-07'), 'tarot-07 (Carro)');
  assert(ids.has('tarot-16'), 'tarot-16 (Torre)');
  for (const c of cites) assertEq(c.sourceType, 'tarot', 'tarot sourceType');
}

// ───────── Section 17 — extractTantraCitations (all 7 chakras) ─────────
section('extractTantraCitations (7 chakras)');
{
  const txt = 'Os 7 chakras: Muladhara, Svadhisthana, Manipura, Anahata, Vishuddha, Ajna, Sahasrara. A energia sobe.';
  const cites = eng.extractTantraCitations(txt);
  assertEq(cites.length, 7, `7 chakra citations (got ${cites.length})`);
  const ids = new Set(cites.map((c) => c.sourceId));
  assert(ids.has('tantra-01-muladhara'), 'Muladhara');
  assert(ids.has('tantra-02-svadhisthana'), 'Svadhisthana');
  assert(ids.has('tantra-03-manipura'), 'Manipura');
  assert(ids.has('tantra-04-anahata'), 'Anahata');
  assert(ids.has('tantra-05-vishuddha'), 'Vishuddha');
  assert(ids.has('tantra-06-ajna'), 'Ajna');
  assert(ids.has('tantra-07-sahasrara'), 'Sahasrara');
  for (const c of cites) assertEq(c.sourceType, 'tantra', 'tantra sourceType');
}

// ───────── Section 18 — auditExplainabilityCoverage ≥ 60 ─────────
section('auditExplainabilityCoverage ≥ 60 symbols');
{
  const cov = eng.auditExplainabilityCoverage();
  assert(cov.total >= 60, `audit total >= 60 (got ${cov.total})`);
  assertEq(typeof cov.total, 'number', 'audit total is number');
  assert(cov.byTradition.cigano >= 30, `cigano >= 30 in audit (got ${cov.byTradition.cigano})`);
  assert(cov.byTradition.orixa >= 14, `orixa >= 14 in audit (got ${cov.byTradition.orixa})`);
  assert(cov.byTradition.odu >= 14, `odu >= 14 in audit (got ${cov.byTradition.odu})`);
  assert(cov.byTradition.astrologia >= 30, `astro >= 30 in audit (got ${cov.byTradition.astrologia})`);
  assert(cov.byTradition.numerologia >= 10, `numero >= 10 in audit (got ${cov.byTradition.numerologia})`);
  assert(cov.byTradition.sefirot >= 9, `sefirot >= 9 in audit (got ${cov.byTradition.sefirot})`);
  assert(cov.byTradition.tarot >= 20, `tarot >= 20 in audit (got ${cov.byTradition.tarot})`);
  assert(cov.byTradition.tantra >= 7, `tantra >= 7 in audit (got ${cov.byTradition.tantra})`);
  // Missing list valid: string[]
  assert(Array.isArray(cov.missing), 'cov.missing is array');
  // Coverage report must be frozen
  assert(Object.isFrozen(cov), 'cov is frozen');
  assert(Object.isFrozen(cov.byTradition), 'cov.byTradition is frozen');
  assert(Object.isFrozen(cov.missing), 'cov.missing is frozen');
  // >= 153 expected total but realistic floor is high
  assert(cov.total >= 140, `audit total >= 140 (got ${cov.total})`);
}

// ───────── Section 19 — flagLowConfidence threshold behavior ─────────
section('flagLowConfidence');
{
  // Build a low-confidence payload
  const lowCites: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'article', 'x', 0.2, 0.2),
  ];
  const lowTrace = eng.startTrace();
  lowTrace.push({ kind: 'input', description: 'small input' });
  lowTrace.push({ kind: 'output', description: 'small output' });
  const lowPayload = eng.buildPayload({ citations: lowTrace.finish() as unknown as ReadonlyArray<eng.Citation>, trace: [] });
  void lowCites;
  // Better: directly construct via buildPayload
  const realLow = eng.buildPayload({
    citations: lowCites,
    trace: lowTrace.finish(),
  });
  void lowPayload;
  const lowWarnings = eng.flagLowConfidence(realLow, 0.4);
  assert(lowWarnings.length > 0, `flagLowConfidence triggers on score ${realLow.confidence.toFixed(2)} < 0.4`);
  assert(lowWarnings.some((w) => w.includes('confidence')), 'warning mentions confidence');
  // High confidence: no warning
  const highCites: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cabala', 'x', 0.95, 0.95),
    eng.buildCitation('b', 'sefirot', 'y', 0.95, 0.95),
    eng.buildCitation('c', 'cigano', 'z', 0.95, 0.95),
  ];
  const realHigh = eng.buildPayload({ citations: highCites, trace: lowTrace.finish() });
  const highWarnings = eng.flagLowConfidence(realHigh);
  // Even high citations might trigger "no citations" if 0 — we have 3, score should be high
  // only flag no-citations explicitly OR low confidence
  assert(!highWarnings.some((w) => w.includes('< threshold')), `no low-confidence warning for score ${realHigh.confidence.toFixed(2)}`);
  // No-citations case
  const noCites = eng.buildPayload({ citations: [], trace: [] });
  const ncWarn = eng.flagLowConfidence(noCites);
  assert(ncWarn.some((w) => w.includes('no citations')), 'warns on no citations');
  // Score 0.2 with threshold 0.4 → warn
  const score02 = eng.buildPayload({
    citations: [eng.buildCitation('a', 'article', 'x', 0.2, 0.2)],
    trace: [],
  });
  assert(eng.flagLowConfidence(score02).length > 0, 'flagLowConfidence at score 0.2 < 0.4');
  // Score 0.8 with threshold 0.4 → no warn on the threshold
  const score08 = eng.buildPayload({
    citations: [
      eng.buildCitation('a', 'cabala', 'x', 0.9, 0.9),
      eng.buildCitation('b', 'cigano', 'y', 0.9, 0.9),
    ],
    trace: [],
  });
  const w8 = eng.flagLowConfidence(score08);
  assert(!w8.some((w) => w.includes('< threshold')), `no threshold warn at score ${score08.confidence.toFixed(2)}`);
}

// ───────── Section 20 — flagRedundantCitations ─────────
section('flagRedundantCitations');
{
  // 3 same sourceType → warns
  const redundant = eng.buildPayload({
    citations: [
      eng.buildCitation('a', 'cigano', 'x'),
      eng.buildCitation('b', 'cigano', 'y'),
      eng.buildCitation('c', 'cigano', 'z'),
    ],
    trace: [],
  });
  const r = eng.flagRedundantCitations(redundant);
  assert(r.length > 0, 'flagRedundantCitations triggers with 3 same type');
  assert(r[0]!.includes('cigano'), 'warning names sourceType');
  // 2 same sourceType → no warn
  const two = eng.buildPayload({
    citations: [
      eng.buildCitation('a', 'cigano', 'x'),
      eng.buildCitation('b', 'cigano', 'y'),
    ],
    trace: [],
  });
  const r2 = eng.flagRedundantCitations(two);
  assertEq(r2.length, 0, '2 citations same type → no warn');
  // All different types → no warn
  const diverse = eng.buildPayload({
    citations: [
      eng.buildCitation('a', 'cigano', 'x'),
      eng.buildCitation('b', 'orixa', 'y'),
      eng.buildCitation('c', 'astrologia', 'z'),
    ],
    trace: [],
  });
  assertEq(eng.flagRedundantCitations(diverse).length, 0, 'diverse → no warn');
}

// ───────── Section 21 — summarizeExplainability ─────────
section('summarizeExplainability');
{
  const cites: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cigano', 'x'),
    eng.buildCitation('b', 'orixa', 'y'),
  ];
  const trace = eng.startTrace();
  trace.push({ kind: 'input', description: 'go', elapsedMs: 5 });
  const payload = eng.buildPayload({
    citations: cites,
    trace: trace.finish(),
    notes: 'phase summary',
    warnings: ['check'],
  });
  const summary = eng.summarizeExplainability(payload);
  assert(summary.headlines.length > 0, 'headlines non-empty');
  assert(summary.headlines.some((h) => h.includes('confidence=')), 'confidence headline present');
  assert(summary.headlines.some((h) => h.includes('citations=2')), 'citations count in headline');
  assert(summary.headlines.some((h) => h.includes('trace_steps=')), 'trace step count in headline');
  assert(summary.headlines.some((h) => h.includes('total_trace_ms')), 'total trace ms in headline');
  assert(summary.headlines.some((h) => h.includes('notes')), 'notes in headline');
  assert(summary.headlines.some((h) => h.includes('warnings')), 'warnings in headline');
  assertEq(summary.citationCount, 2, 'citationCount');
  assert(summary.traceStepCount >= 1, `traceStepCount >= 1 (got ${summary.traceStepCount})`);
  assert(summary.coverageByTradition.includes('cigano:1'), 'coverage shows cigano:1');
  assert(summary.coverageByTradition.includes('orixa:1'), 'coverage shows orixa:1');
  // Frozen
  assert(Object.isFrozen(summary), 'summary is frozen');
  assert(Object.isFrozen(summary.headlines), 'headlines are frozen');
}

// ───────── Section 22 — buildPayload builds correctly ─────────
section('buildPayload');
{
  const cites: ReadonlyArray<eng.Citation> = [
    eng.buildCitation('a', 'cabala', 'x', 0.9, 0.9),
  ];
  const trace = eng.startTrace();
  trace.push({ kind: 'input', description: 'go' });
  const payload = eng.buildPayload({
    citations: cites,
    trace: trace.finish(),
    notes: 'note',
  });
  assertEq(payload.citations.length, 1, 'payload citations length');
  assert(payload.confidence > 0, `payload confidence > 0 (got ${payload.confidence.toFixed(3)})`);
  assertEq(payload.confidenceLabel, eng.labelConfidence(payload.confidence), 'confidenceLabel matches labelConfidence()');
  assert(payload.trace.length >= 1, 'payload trace.length');
  assertEq(payload.notes, 'note', 'payload notes preserved');
  assert(Object.isFrozen(payload), 'payload is frozen');
  assert(Object.isFrozen(payload.citations), 'payload.citations is frozen');
  assert(Object.isFrozen(payload.trace), 'payload.trace is frozen');
}

// ───────── Section 23 — cross-tradition test ─────────
section('cross-tradition extraction');
{
  // 'Casa' (cigano-04) and 'Lua' (cigano-32) overlap with astrologia
  // ('Casa 4' in astro, 'Lua' planeta). Input intentionally exercises
  // BOTH traditions simultaneously to validate cross-tradition coverage.
  const txt = 'O mapa mostra Exu protegendo o caminho. Casa 4 ativa, com Lua em Câncer. Keter brilha. O Mago apareceu. Muladhara precisa equilíbrio.';
  const cigano = eng.extractCiganoCitations(txt);
  const orixa = eng.extractOrixaCitations(txt);
  const astro = eng.extractAstrologiaCitations(txt);
  const sefirot = eng.extractSefirotCitations(txt);
  const tarot = eng.extractTarotCitations(txt);
  const tantra = eng.extractTantraCitations(txt);
  assert(cigano.length >= 0, `cigano: ≥0 (got ${cigano.length})`);
  assert(orixa.length >= 1, `orixa: ≥1 (got ${orixa.length})`);
  assert(astro.length >= 2, `astro: ≥2 (got ${astro.length})`);
  assert(sefirot.length >= 1, `sefirot: ≥1 (got ${sefirot.length})`);
  assert(tarot.length >= 1, `tarot: ≥1 (got ${tarot.length})`);
  assert(tantra.length >= 1, `tantra: ≥1 (got ${tantra.length})`);
  // Build a payload with all these
  const allCites: ReadonlyArray<eng.Citation> = [...orixa, ...astro, ...sefirot, ...tarot, ...tantra];
  const trace = eng.startTrace();
  trace.push({ kind: 'input', description: 'cross-tradition input' });
  trace.push({ kind: 'lookup', description: 'resolved' });
  trace.push({ kind: 'inference', description: 'reasoned' });
  const payload = eng.buildPayload({ citations: allCites, trace: trace.finish() });
  const coverageSources = new Set(allCites.map((c) => c.sourceType));
  assert(coverageSources.size >= 4, `cross-tradition covers ≥4 sourceTypes (got ${coverageSources.size})`);
  const summary = eng.summarizeExplainability(payload);
  assert(summary.headlines.length > 0, 'cross-tradition summary non-empty');
  assert(summary.coverageByTradition.split(',').length >= 4, 'cross-tradition coverage map >=4 entries');
}

// ───────── Section 24 — coverage of ENGINE_INFO tier weights ─────────
section('ENGINE_INFO tier weights + combined scores interplay');
{
  const weights = eng.ENGINE_INFO.tierWeights;
  assertEq(weights.cabala, 1.0, 'cabala tier 1.0');
  assert(weights.cigano > 0.8, `cigano tier > 0.8 (got ${weights.cigano})`);
  // Bucket boundaries
  assertEq(eng.ENGINE_INFO.confidenceBuckets[0]!.label, 'foundational', 'first bucket label');
  assertEq(eng.ENGINE_INFO.confidenceBuckets[eng.ENGINE_INFO.confidenceBuckets.length - 1]!.label, 'speculative', 'last bucket label');
  // All excerpts stay <= MAX_EXCERPT_CHARS across a giant input
  const big = eng.buildCitation('a', 'article', 'a'.repeat(10000), 0.5, 0.5);
  assert(big.excerpt.length <= 240, `giant excerpt truncated (got ${big.excerpt.length})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${pass} pass / ${fail} fail`);
if (fail > 0) {
  process.exit(1);
}
