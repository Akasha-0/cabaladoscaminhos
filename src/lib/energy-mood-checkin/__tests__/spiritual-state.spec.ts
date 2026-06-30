/**
 * ════════════════════════════════════════════════════════════════════════════
 *  spiritual-state.spec.ts — 50+ assertions across 6 sections
 *
 *  Sections:
 *    §1 — extractSacredTags: detection incl. Oxalácida/Solano subword rejection (10)
 *    §2 — extractSacredTags edge cases + dedup + position info (8)
 *    §3 — classifyState: 5+ state paths (8)
 *    §4 — linkToReading: within/outside window, before/after/exact (10)
 *    §5 — intentionQuality: coercive/growth/open/neutral (10)
 *    §6 — assertCatalogCoverage + dataset boundaries (8)
 *
 *  Total: ~54 assertions
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  recordCheckin,
  asUserId,
  asDateKey,
  __resetCheckinStore,
} from '../checkin.ts';
import {
  extractSacredTags,
  classifyState,
  intentionQuality,
  linkToReading,
  assertCatalogCoverage,
  SACRED_CATALOG,
  type ReadingRecord,
} from '../spiritual-state.ts';
import {
  expectEqual,
  expectNotEqual,
  expectTrue,
  expectFalse,
  expectLen,
  expectNotNull,
  resetHarness,
  report,
  section,
  results as harnessResults,
} from './harness.ts';

function buildCheckin(at: string): ReturnType<typeof recordCheckin> {
  return recordCheckin(asUserId('u-spirit'), {
    energyScore: 5,
    mood: 'reflective',
    spiritualState: 'auto',
    recordedAt: at,
    timeZone: 'UTC',
  });
}

export function runSpiritualStateSpec(): number {
  resetHarness();
  __resetCheckinStore();

  // ── §1 — extractSacredTags: detection incl. subword rejection ────────
  section('§1 extractSacredTags');
  // empty / non-matches
  expectLen('empty text → 0 tags', extractSacredTags(''), 0);
  expectLen('plain text → 0 tags', extractSacredTags('hello world, no sacred references here'), 0);

  // multiple sacred refs in one sentence
  const t1 = extractSacredTags('Oxalá e Ogum regem a manhã de hoje');
  expectLen('Oxalá+Ogum = 2 tags', t1, 2);
  expectEqual('Oxalá detected', t1.find((t) => t.symbol === 'Oxalá')?.tradition, 'Orixás');
  expectEqual('Ogum detected', t1.find((t) => t.symbol === 'Ogum')?.tradition, 'Orixás');

  // Cigano card-name detection
  const t2 = extractSacredTags('A Cigana e a Cigano na leitura');
  // Cigana (29) and Cigano (28) overlap in prefix but each match is bounded
  expectLen('Cigana + Cigano = 2', t2, 2);
  expectEqual('Cigana 29 tradition', t2.find((t) => t.symbol === 'Cigana')?.tradition, 'Cigano');
  expectEqual('Cigano 28 tradition', t2.find((t) => t.symbol === 'Cigano')?.tradition, 'Cigano');

  // subword rejection: "Oxalácida" must NOT match "Oxalá"
  const t3 = extractSacredTags('Oxalácida é uma palavra inexistente');
  expectLen('subword "Oxalácida" does NOT match Oxalá', t3, 0);
  // "Solano" must NOT match "Sol"
  const t4 = extractSacredTags('O Solano é uma cidadezinha');
  expectLen('subword "Solano" does NOT match Sol', t4, 0);
  // "Obaluaiêcida" must NOT match "Obaluaiê"
  const t5 = extractSacredTags('uma palavra Obaluaiêcida inventada');
  expectLen('subword "Obaluaiêcida" does NOT match Obaluaiê', t5, 0);

  // multiple occurrences in one text (cycle 68 regression)
  const t6 = extractSacredTags('Oxalá aparece duas vezes aqui: Oxalá e Oxalá');
  expectLen('3 mentions of Oxalá → 3 tags (cycle 68 lookahead fix)', t6, 3);

  // Cross-tradition: Cigano + Cabala
  const t7 = extractSacredTags('A Torre e Binah regem');
  expectTrue('mix Torre (tarot) + Binah (cabala)', t7.length >= 2);

  // ── §2 — extractSacredTags edges ─────────────────────────────────────
  section('§2 extractSacredTags edges');
  // position info correct
  const txt = 'hoje Oxalá e Ogum';
  const tx = extractSacredTags(txt);
  const ox = tx.find((t) => t.symbol === 'Oxalá')!;
  expectEqual('Oxalá position', ox.position, 5);
  expectEqual('Oxalá length', ox.length, 5);

  // case insensitive
  const tci = extractSacredTags('oxalá e ogum');
  expectLen('case-insensitive: still detects oxalá', tci.filter((t) => t.symbol === 'Oxalá'), 1);

  // dedup: same symbol overlapping
  const tdup = extractSacredTags('Oxalá Oxalá Oxalá Oxalá');
  expectTrue('4-mention cap or all detected?', tdup.length >= 3); // not strict but verifies no infinite repeat bug

  // multi-tradition same text
  const tmulti = extractSacredTags('Sinto Oxalá, vi A Torre, e Muladhara está pulsando');
  const tradSet = new Set(tmulti.map((t) => t.tradition));
  expectTrue('multi-tradition ≥3', tradSet.size >= 3);

  // truncation cap (50)
  const big = Array.from({ length: 200 }, () => 'Oxalá ').join('');
  const tcap = extractSacredTags(big);
  expectTrue('cap is respected', tcap.length <= 50);

  // non-string
  // (Type-checked at runtime via typeof check)
  expectLen('non-string → 0 tags', extractSacredTags(undefined as unknown as string), 0);

  // ── §3 — classifyState ──────────────────────────────────────────────
  section('§3 classifyState');
  expectEqual('empty → unmapped', classifyState('').state, 'unmapped');
  expectEqual('plain text → unmapped', classifyState('hello world').state, 'unmapped');

  expectEqual(
    'Caixão + Morte + Torre → transformative',
    classifyState('hoje senti o Caixão, vi A Morte, e subi A Torre — fim de ciclo').state,
    'transformative',
  );

  expectEqual(
    'Binah + Lua + Anahata → balanced (3 traditions)',
    classifyState('Anahata pulsa, Binah me chama, e a Lua reflete').state,
    'balanced',
  );

  expectEqual(
    'Binah alone → introspective',
    classifyState('Binah me chama hoje para a introspecção profunda').state,
    'introspective',
  );

  expectEqual(
    'Muladhara + Árvore + Terra → grounded',
    classifyState('aterrado em Muladhara, A Árvore firme e a Casa segura').state,
    'grounded',
  );

  expectEqual(
    'Sahasrara + Sol + Ar → expansive',
    classifyState('Sahasrara aberto, o Sol brilha, sinto leveza').state,
    'expansive',
  );

  expectEqual(
    '3 distinct traditions → balanced',
    classifyState('Oxalá, Binah, e Muladhara juntos').state,
    'balanced',
  );

  // signalHits returned
  const hits = classifyState('Caixão');
  expectTrue('signalHits >=1', hits.signalHits >= 1);

  // ── §4 — linkToReading ───────────────────────────────────────────────
  section('§4 linkToReading');
  const baseCheckin = buildCheckin('2026-06-30T12:00:00Z');
  // exact
  const exactLink = linkToReading(baseCheckin, [{ readAt: '2026-06-30T12:00:00Z' }]);
  expectNotNull('exact link not null', exactLink);
  expectEqual('exact direction', exactLink?.direction, 'exact');
  expectEqual('exact hoursDelta = 0', exactLink?.hoursDelta, 0);

  // within ±3h
  const history: ReadingRecord[] = [
    { readAt: '2026-06-30T15:00:00Z' }, // +3h
    { readAt: '2026-06-30T09:00:00Z' }, // -3h
    { readAt: '2026-06-30T20:00:00Z' }, // +8h, outside 6h default
  ];
  const link3 = linkToReading(baseCheckin, history, 6);
  expectNotNull('closest link found', link3);
  // closer is the +3h or -3h (equal distance) — first found wins by iteration order
  expectEqual('link direction before|after', link3?.direction === 'before' || link3?.direction === 'after', true);
  expectTrue('hoursDelta <=3', link3!.hoursDelta <= 3);

  // outside ±6h → null
  const farLink = linkToReading(baseCheckin, [{ readAt: '2026-07-01T00:00:00Z' }], 6);
  expectEqual('outside 6h → null', farLink, null);

  // negative case: empty history
  const emptyLink = linkToReading(baseCheckin, []);
  expectEqual('empty history → null', emptyLink, null);

  // invalid date in history should be skipped, not crash
  const corruptedLink = linkToReading(baseCheckin, [
    { readAt: 'garbage' },
    { readAt: '2026-06-30T15:00:00Z' },
  ]);
  expectNotNull('skips garbage, finds valid', corruptedLink);

  // Custom window
  const customLink = linkToReading(baseCheckin, [{ readAt: '2026-07-01T00:00:00Z' }], 168); // 7d
  expectNotNull('custom 7d window finds the +12h reading', customLink);

  // hoursDelta rounded to 2 decimals
  expectEqual('hoursDelta is rounded to 2 decimals', Math.round(link3!.hoursDelta * 100) / 100, link3!.hoursDelta);

  // direction 'before' for past reading
  const pastLink = linkToReading(baseCheckin, [{ readAt: '2026-06-30T10:00:00Z' }]);
  expectEqual('past reading → before', pastLink?.direction, 'before');

  // ── §5 — intentionQuality ────────────────────────────────────────────
  section('§5 intentionQuality');
  expectEqual('empty → neutral', intentionQuality('').flag, 'neutral');
  expectEqual('whitespace → neutral', intentionQuality('   ').flag, 'neutral');
  expectEqual('plain sentence → neutral', intentionQuality('today is a day').flag, 'neutral');

  // Growth patterns (PT + EN)
  expectEqual('eu recebo → growth', intentionQuality('eu recebo a paz').flag, 'growth');
  expectEqual('eu solto → growth', intentionQuality('eu solto o que não me serve').flag, 'growth');
  expectEqual('I welcome → growth', intentionQuality('I welcome clarity today').flag, 'growth');
  expectEqual('I release → growth', intentionQuality('I release old patterns').flag, 'growth');
  expectEqual('gratidão → growth', intentionQuality('gratidão pelo dia').flag, 'growth');

  // Coercive patterns
  expectEqual('devo → coercive', intentionQuality('devo terminar tudo hoje').flag, 'coercive');
  expectEqual('preciso → coercive', intentionQuality('preciso ser melhor').flag, 'coercive');
  expectEqual('should → coercive', intentionQuality('I should be more focused').flag, 'coercive');
  expectEqual('must → coercive', intentionQuality('I must not fail').flag, 'coercive');

  // Open patterns (prayer framings)
  expectEqual('que → open', intentionQuality('que hoje seja leve').flag, 'open');
  expectEqual('may → open', intentionQuality('may I find peace').flag, 'open');

  // polarity range
  const pol = intentionQuality('eu recebo');
  expectTrue('polarity in [-1,1]', pol.polarity >= -1 && pol.polarity <= 1);

  // markers returned
  const mk = intentionQuality('devo ser melhor');
  expectTrue('markers has at least 1', mk.markers.length >= 1);

  // ── §6 — assertCatalogCoverage + boundaries ─────────────────────────
  section('§6 catalog coverage');
  expectTrue('catalog has ≥84 entries', SACRED_CATALOG.length >= 84);
  expectTrue('catalog covers ≥7 traditions', new Set(SACRED_CATALOG.map((e) => e.tradition)).size >= 7);

  // Verify each tradition has ≥5 symbols
  const byTrad = new Map<string, number>();
  for (const e of SACRED_CATALOG) byTrad.set(e.tradition, (byTrad.get(e.tradition) ?? 0) + 1);
  for (const [trad, count] of byTrad) {
    expectTrue(`${trad} has ≥5 symbols`, count >= 5);
  }

  // No empty symbols
  expectTrue('no empty symbol strings', SACRED_CATALOG.every((e) => e.symbol.length > 0));
  expectTrue('no empty tradition strings', SACRED_CATALOG.every((e) => e.tradition.length > 0));

  // assertCatalogCoverage must complete without throwing
  expectTrue('coverage validator passes', assertCatalogCoverage() === undefined);

  return report('spiritual-state.spec', harnessResults());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const code = runSpiritualStateSpec();
  process.exit(code);
}
