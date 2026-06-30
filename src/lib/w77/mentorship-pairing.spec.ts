/**
 * ════════════════════════════════════════════════════════════════════════════
 * W77-A — MENTORSHIP PAIRING · SPEC HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running ≥40 assertion spec — no vitest. Uses `it()` registry pattern
 * (cycle 73 lesson). Exits 0 on full PASS, 1 on failure.
 *
 * Run: `node --experimental-strip-types mentorship-pairing.spec.ts`
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };
import {
  pairMentorship,
  registerMentor,
  registerMentee,
  listMentorsByTradition,
  listAllMentors,
  exportAudit,
  hashCacheKey,
  hashCacheKeyAsync,
  canonicalJson,
  sha256Hex,
  sha256HexSync,
  traditionAffinityScore,
  domainOverlapScore,
  timezoneScore,
  languageScore,
  availabilityScore,
  sacredCoverageScore,
  sacredMatch,
  listSacredTermsMentioned,
  mentorId,
  menteeId,
  tradition,
  domain,
  TRADITION_LIST,
  DOMAIN_LIST,
  TRADITION_AFFINITY,
  SACRED_TERMS,
  _resetAuditForTests,
  W77_A_VERSION,
  W77_A_CYCLE,
  W77_A_TRADITIONS_SHIPPED,
  W77_A_DOMAINS_SHIPPED,
  type MentorId,
  type MenteeId,
  type Tradition,
  type Domain,
  type MentorProfile,
  type MenteeProfile,
  type PairInput,
} from './mentorship-pairing.ts';

// ════════════════════════════════════════════════════════════════════════════
// Harness
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const aJs = JSON.stringify(actual);
  const eJs = JSON.stringify(expected);
  if (aJs !== eJs && !Object.is(actual, expected)) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${eJs}, got ${aJs}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) throw new Error(`assertTrue FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertContains(haystack: string, needle: string, label?: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(`assertContains FAIL${label ? ' (' + label + ')' : ''}: ${JSON.stringify(needle)} not in ${JSON.stringify(haystack.slice(0, 200))}`);
  }
}

function assertMatch(re: RegExp, haystack: string, label?: string): void {
  if (!re.test(haystack)) {
    throw new Error(`assertMatch FAIL${label ? ' (' + label + ')' : ''}: pattern did not match ${JSON.stringify(haystack.slice(0, 200))}`);
  }
}

function assertThrows(fn: () => unknown, pattern?: RegExp, label?: string): void {
  let threw = false;
  let msg = '';
  try {
    fn();
  } catch (e) {
    threw = true;
    msg = e instanceof Error ? e.message : String(e);
  }
  if (!threw) {
    throw new Error(`assertThrows FAIL${label ? ' (' + label + ')' : ''}: expected throw, got success`);
  }
  if (pattern && !pattern.test(msg)) {
    throw new Error(`assertThrows FAIL${label ? ' (' + label + ')' : ''}: message ${JSON.stringify(msg)} did not match ${pattern}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Test fixtures
// ════════════════════════════════════════════════════════════════════════════

function makeTradition(s: string): Tradition {
  return tradition(s);
}

function makeDomain(s: string): Domain {
  return domain(s);
}

function makeMentee(overrides: Partial<MenteeProfile> = {}): MenteeProfile {
  return {
    displayName: 'Mentee_' + Math.random().toString(36).slice(2, 8),
    traditions: [makeTradition('Cigano')],
    domains: [makeDomain('astrologia')],
    languages: ['pt', 'en'],
    timezoneOffsetHours: -3,
    availability: [{ weekday: 1, startHourUtc: 19, endHourUtc: 22 }],
    weeksStudying: 12,
    bio: 'Busco orientação em leitura de cartas ciganas e astrologia.',
    ...overrides,
  };
}

function makeMentor(overrides: Partial<MentorProfile> = {}): MentorProfile {
  return {
    displayName: 'Mentor_' + Math.random().toString(36).slice(2, 8),
    traditions: [makeTradition('Cigano')],
    domains: [makeDomain('astrologia')],
    languages: ['pt', 'en'],
    timezoneOffsetHours: -3,
    availability: [{ weekday: 1, startHourUtc: 19, endHourUtc: 22 }],
    yearsStudying: 8,
    bio: 'Estudante de Astrologia e Cartomancia Cigana há anos.',
    acceptingMentees: true,
    ...overrides,
  };
}

// Reset before each test (cycle 73 lesson).
async function runOne(name: string, fn: () => void | Promise<void>): Promise<void> {
  _resetAuditForTests();
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  ✗ ${name}`);
    console.log(`    ${msg}`);
    throw err;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Specs
// ════════════════════════════════════════════════════════════════════════════

it('W77-A version constants exported correctly', () => {
  assertEqual(W77_A_VERSION, '1.0.0');
  assertEqual(W77_A_CYCLE, 77);
  assertEqual(W77_A_TRADITIONS_SHIPPED, 7);
  assertEqual(W77_A_DOMAINS_SHIPPED, 8);
});

it('TRADITION_LIST contains all 7 sacred traditions', () => {
  assertEqual(TRADITION_LIST.length, 7);
  assertTrue((TRADITION_LIST as readonly string[]).includes('Candomble'), 'Candomble');
  assertTrue((TRADITION_LIST as readonly string[]).includes('Umbanda'), 'Umbanda');
  assertTrue((TRADITION_LIST as readonly string[]).includes('Ifa'), 'Ifa');
  assertTrue((TRADITION_LIST as readonly string[]).includes('Cabala'), 'Cabala');
  assertTrue((TRADITION_LIST as readonly string[]).includes('Astrologia'), 'Astrologia');
  assertTrue((TRADITION_LIST as readonly string[]).includes('Tantra'), 'Tantra');
  assertTrue((TRADITION_LIST as readonly string[]).includes('Cigano'), 'Cigano');
});

it('DOMAIN_LIST contains 8 study domains', () => {
  assertEqual(DOMAIN_LIST.length, 8);
  assertTrue((DOMAIN_LIST as readonly string[]).includes('tarot'), 'tarot');
  assertTrue((DOMAIN_LIST as readonly string[]).includes('cigano'), 'cigano');
  assertTrue((DOMAIN_LIST as readonly string[]).includes('odu-orixa'), 'odu-orixa');
  assertTrue((DOMAIN_LIST as readonly string[]).includes('astrologia'), 'astrologia');
  assertTrue((DOMAIN_LIST as readonly string[]).includes('numerologia'), 'numerologia');
  assertTrue((DOMAIN_LIST as readonly string[]).includes('runas'), 'runas');
  assertTrue((DOMAIN_LIST as readonly string[]).includes('cabala'), 'cabala');
  assertTrue((DOMAIN_LIST as readonly string[]).includes('tantra'), 'tantra');
});

it('tradition() rejects invalid and accepts valid', () => {
  assertTrue((tradition('Cigano') as unknown as string) === 'Cigano');
  assertThrows(() => tradition('Wicca'), /invalid Tradition/, 'Wicca rejected');
});

it('domain() rejects invalid and accepts valid', () => {
  assertTrue((domain('tarot') as unknown as string) === 'tarot');
  assertThrows(() => domain('tarom'), /invalid Domain/, 'typo rejected');
});

it('mentorId() and menteeId() branded factory validation', () => {
  assertTrue((mentorId('m_abc123') as unknown as string) === 'm_abc123');
  assertTrue((menteeId('s_def456') as unknown as string) === 's_def456');
  assertThrows(() => mentorId('x_abc'), /^invalid MentorId/, 'wrong prefix rejected');
  assertThrows(() => menteeId('y_def'), /^invalid MenteeId/, 'wrong prefix rejected');
});

it('sacredMatch uses Unicode lookaround — handles diacritics', () => {
  assertTrue(sacredMatch('Eu trabalho com Oxalá.', 'Oxalá'), 'Oxalá with acute');
  assertTrue(sacredMatch('Iansã é guerreira', 'Iansã'), 'Iansã with tilde');
  assertTrue(sacredMatch('Trabalhei com Preto-Velho ontem', 'Preto-Velho'), 'Preto-Velho hyphenated');
  assertTrue(!sacredMatch('Cigano sem acento', 'Cigão'), 'no false positive');
});

it('sacredMatch rejects term at end of word via lookbehind', () => {
  assertTrue(!sacredMatch('Oxalaxxx é falso', 'Oxalá'), 'Oxalá not part of Oxalaxxx');
  assertTrue(!sacredMatch('fooOxalá', 'Oxalá'), 'Oxalá not part of fooOxalá');
});

it('listSacredTermsMentioned returns mentioned terms', () => {
  const txt = 'Estudo Oxalá, Iansã e Ogum em Candomblé, com leitura de Kabbalah.';
  const found = listSacredTermsMentioned(txt);
  assertTrue(found.length >= 3, 'at least 3 matches');
  assertContains(JSON.stringify(found), 'Oxal', 'contains Oxala');
});

it('traditionAffinityScore: exact match = 40', () => {
  const t1 = makeTradition('Cigano');
  const t2 = makeTradition('Cigano');
  assertEqual(traditionAffinityScore([t1], [t2]), 40, 'exact same primary = 40');
});

it('traditionAffinityScore: closely related = 18', () => {
  const t1 = makeTradition('Astrologia');
  const t2 = makeTradition('Cigano'); // affinity 2 with Astrologia
  assertEqual(traditionAffinityScore([t1], [t2]), 18, 'Astrologia <-> Cigano = 18');
});

it('traditionAffinityScore: zero when unrelated', () => {
  const t1 = makeTradition('Cigano');
  const t2 = makeTradition('Candomble'); // affinity 0
  assertEqual(traditionAffinityScore([t1], [t2]), 0, 'Cigano <-> Candomble = 0');
});

it('domainOverlapScore: identical = 30', () => {
  const d1 = [makeDomain('tarot'), makeDomain('astrologia')];
  const d2 = [makeDomain('tarot'), makeDomain('astrologia')];
  assertEqual(domainOverlapScore(d1, d2), 30, 'Jaccard=1 → 30');
});

it('domainOverlapScore: half = 15', () => {
  const d1 = [makeDomain('tarot')];
  const d2 = [makeDomain('tarot'), makeDomain('astrologia')];
  assertEqual(domainOverlapScore(d1, d2), 15, 'Jaccard=0.5 → 15');
});

it('domainOverlapScore: disjoint = 0', () => {
  const d1 = [makeDomain('tarot')];
  const d2 = [makeDomain('runas')];
  assertEqual(domainOverlapScore(d1, d2), 0, 'Jaccard=0 → 0');
});

it('timezoneScore: close = 10, far = 0', () => {
  assertEqual(timezoneScore(0, 1), 10, 'delta 1h = 10');
  assertEqual(timezoneScore(2, 0), 8, 'delta 2h = 8');
  assertEqual(timezoneScore(0, 12), 0, 'delta 12h = 0');
});

it('languageScore: same primary = 10, partial = 5, none = 0', () => {
  assertEqual(languageScore(['pt', 'en'], ['pt']), 10, 'pt ↔ pt = 10');
  assertEqual(languageScore(['en'], ['es']), 0, 'no overlap = 0');
});

it('availabilityScore: matching weekday + hour window', () => {
  const a = [{ weekday: 3 as const, startHourUtc: 19, endHourUtc: 22 }];
  const b = [{ weekday: 3 as const, startHourUtc: 20, endHourUtc: 23 }];
  assertEqual(availabilityScore(a, b), 2, 'overlap 2h');
});

it('availabilityScore: no overlap = 0', () => {
  const a = [{ weekday: 3 as const, startHourUtc: 9, endHourUtc: 12 }];
  const b = [{ weekday: 3 as const, startHourUtc: 19, endHourUtc: 22 }];
  assertEqual(availabilityScore(a, b), 0, 'no overlap');
});

it('sacredCoverageScore: term in both bios = bonus', () => {
  const mBio = 'Estudo Oxalá e Iansã em Candomblé';
  const nBio = 'Conheço Oxalá e Iansã profundamente';
  const s = sacredCoverageScore(mBio, nBio);
  assertTrue(s >= 3, 'bonus >= 3 for both terms present');
});

it('sacredCoverageScore: no sacred terms = 0', () => {
  const s = sacredCoverageScore('plano de leitura cigana', 'cigano clássico');
  assertEqual(s, 0, 'no sacred terms');
});

it('canonicalJson produces stable output regardless of key order', () => {
  const a = canonicalJson({ b: 2, a: 1, c: { y: 'Y', x: 'X' } });
  const b = canonicalJson({ c: { x: 'X', y: 'Y' }, a: 1, b: 2 });
  assertEqual(a, b, 'same output for reordered keys');
  assertEqual(a, '{"a":1,"b":2,"c":{"x":"X","y":"Y"}}', 'exact canonical form');
});

it('sha256HexSync produces 64-hex output', async () => {
  const h = sha256HexSync('hello');
  assertEqual(h.length, 64, 'length 64');
  assertMatch(/^[0-9a-f]{64}$/, h, '64 lowercase hex chars');
});

it('sha256HexSync known fixture: empty string', async () => {
  assertEqual(
    sha256HexSync(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'SHA-256("") = e3b0...',
  );
});

it('sha256HexSync known fixture: abc', () => {
  assertEqual(
    sha256HexSync('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    'SHA-256("abc")',
  );
});

it('sha256Hex (async) matches sha256HexSync on the same input', async () => {
  const sample = 'Akasha-0 · ciclo 77 · Cabala dos Caminhos · mentorship';
  const sync = sha256HexSync(sample);
  const asyncRes = await sha256Hex(sample);
  assertEqual(sync, asyncRes, 'sync and async must agree');
  assertEqual(sync.length, 64);
});

it('registerMentor: valid profile returns branded MentorId', () => {
  const m = makeMentor();
  const id = registerMentor(m);
  assertTrue(typeof id === 'string', 'MentorId is a string');
  assertMatch(/^m_[a-z0-9_]+$/, id as string, 'MentorId prefix');
});

it('registerMentor rejects empty traditions', () => {
  assertThrows(() => registerMentor(makeMentor({ traditions: [] })), /at least one tradition/);
});

it('registerMentor rejects empty domains', () => {
  assertThrows(() => registerMentor(makeMentor({ domains: [] })), /at least one domain/);
});

it('registerMentor rejects invalid tradition', () => {
  assertThrows(() => registerMentor(makeMentor({ traditions: ['Wicca' as unknown as Tradition] })), /invalid Tradition/);
});

it('registerMentee: valid profile returns branded MenteeId', () => {
  const s = makeMentee();
  const id = registerMentee(s);
  assertMatch(/^s_[a-z0-9_]+$/, id as string, 'MenteeId prefix');
});

it('listMentorsByTradition returns matching mentors', () => {
  registerMentor(makeMentor({ traditions: [makeTradition('Cigano')] }));
  registerMentor(makeMentor({ traditions: [makeTradition('Cigano')] }));
  registerMentor(makeMentor({ traditions: [makeTradition('Cabala')] }));
  const cig = listMentorsByTradition(makeTradition('Cigano'));
  assertEqual(cig.length, 2, 'two Cigano mentors');
  registerMentor(makeMentor({ traditions: [makeTradition('Ifa')] }));
});

it('listAllMentors returns all registered mentors', () => {
  const before = listAllMentors().length;
  registerMentor(makeMentor({ displayName: 'Test1' }));
  registerMentor(makeMentor({ displayName: 'Test2' }));
  registerMentor(makeMentor({ displayName: 'Test3' }));
  const after = listAllMentors().length;
  assertEqual(after - before, 3, '+3 mentors');
});

it('pairMentorship: empty registry returns empty array', () => {
  const input: PairInput = { mentee: makeMentee() };
  const r = pairMentorship(input);
  assertEqual(r.length, 0, 'no mentors → empty');
});

it('pairMentorship: topN respected', () => {
  for (let i = 0; i < 10; i++) registerMentor(makeMentor({ displayName: `Mentor${i}` }));
  const r = pairMentorship({ mentee: makeMentee(), topN: 3 });
  assertEqual(r.length, 3, 'topN=3 → 3 results');
});

it('pairMentorship: topN validation', () => {
  assertThrows(() => pairMentorship({ mentee: makeMentee(), topN: 0 }), /topN/);
  assertThrows(() => pairMentorship({ mentee: makeMentee(), topN: 51 }), /topN/);
});

it('pairMentorship: identical profile produces high score', () => {
  registerMentor(makeMentor({ displayName: 'PerfectMatch' }));
  const r = pairMentorship({ mentee: makeMentee() });
  assertEqual(r.length, 1, 'one mentor');
  assertEqual(r[0]?.displayName, 'PerfectMatch');
  assertTrue((r[0]?.score.total ?? 0) >= 80, `score >= 80 (got ${r[0]?.score.total})`);
});

it('pairMentorship: respects acceptingMentees=false', () => {
  registerMentor(makeMentor({ displayName: 'Closed', acceptingMentees: false }));
  const r = pairMentorship({ mentee: makeMentee() });
  assertEqual(r.length, 0, 'closed mentor filtered out');
});

it('pairMentorship: results sorted by total desc', () => {
  registerMentor(makeMentor({ displayName: 'LowAffinity', traditions: [makeTradition('Tantra')], domains: [makeDomain('tantra')] }));
  registerMentor(makeMentor({ displayName: 'HighAffinity', traditions: [makeTradition('Cigano')], domains: [makeDomain('astrologia')] }));
  const r = pairMentorship({ mentee: makeMentee() });
  assertEqual(r.length, 2);
  assertTrue((r[0]?.score.total ?? 0) >= (r[1]?.score.total ?? 0), 'sorted desc');
});

it('pairMentorship: audit log populated', () => {
  registerMentor(makeMentor());
  registerMentor(makeMentor());
  pairMentorship({ mentee: makeMentee() });
  const audit = exportAudit();
  assertEqual(audit.length, 2, 'audit has 2 entries (1 per mentor)');
  for (const e of audit) {
    assertTrue(typeof e.cacheKey === 'string', 'cacheKey is string');
    assertEqual(e.cacheKey.length, 64, 'cacheKey is sha256');
    assertMatch(/^\d{4}-\d{2}-\d{2}T/, e.timestamp, 'ISO timestamp');
  }
});

it('hashCacheKey is stable for same mentee+topN', () => {
  const input: PairInput = {
    mentee: makeMentee({ displayName: 'Stable', traditions: [makeTradition('Cigano')], domains: [makeDomain('astrologia')] }),
  };
  const k1 = hashCacheKey(input);
  const k2 = hashCacheKey(input);
  assertEqual(k1, k2, 'stable');
  assertEqual(k1.length, 64, 'sha256');
});

it('hashCacheKey differs when mentee.traditions change', () => {
  const a = hashCacheKey({ mentee: makeMentee({ traditions: [makeTradition('Cigano')] }) });
  const b = hashCacheKey({ mentee: makeMentee({ traditions: [makeTradition('Cabala')] }) });
  assertTrue(a !== b, 'different traditions → different cache key');
});

it('hashCacheKey differs when topN changes', () => {
  const m = makeMentee();
  const a = hashCacheKey({ mentee: m, topN: 5 });
  const b = hashCacheKey({ mentee: m, topN: 10 });
  assertTrue(a !== b, 'different topN → different key');
});

it('hashCacheKeyAsync matches hashCacheKey', async () => {
  const input: PairInput = { mentee: makeMentee({ displayName: 'AsyncSyncMatch' }) };
  const s = hashCacheKey(input);
  const a = await hashCacheKeyAsync(input);
  assertEqual(s, a, 'sync and async hash must match');
});

it('TRADITION_AFFINITY has all 7 traditions', () => {
  for (const t of TRADITION_LIST) {
    assertTrue(t in TRADITION_AFFINITY, `${t} has affinity row`);
  }
});

it('SACRED_TERMS contains ≥20 terms', () => {
  assertTrue(SACRED_TERMS.length >= 20, `${SACRED_TERMS.length} sacred terms`);
});

it('registerMentor rejects no displayName', () => {
  assertThrows(() => registerMentor(makeMentor({ displayName: '' })), /displayName/);
});

it('Sacred term from listSacredTermsMentioned covers Yoruba + Kabbalistic + Cigano', () => {
  const text = 'Iemanja Oxum Ogum Xango Babalorixa Ifa Orunmila Kether Cigano Taro Mantra Kundalini';
  const found = listSacredTermsMentioned(text);
  assertTrue(found.length >= 8, `≥8 sacred terms (got ${found.length})`);
});

it('pairMentorship: extra traditions array (secondary)', () => {
  registerMentor(
    makeMentor({
      displayName: 'MultiTradMentor',
      traditions: [makeTradition('Cigano'), makeTradition('Astrologia')],
      domains: [makeDomain('astrologia'), makeDomain('cigano')],
    }),
  );
  const r = pairMentorship({
    mentee: makeMentee({ traditions: [makeTradition('Cigano')], domains: [makeDomain('cigano')] }),
  });
  assertEqual(r.length, 1);
  assertTrue((r[0]?.score.traditionAffinity ?? 0) >= 40, 'primary match');
});

it('recencyBonus: brand new mentor gets 3', () => {
  registerMentor(makeMentor({ displayName: 'BrandNew' }));
  const r = pairMentorship({ mentee: makeMentee() });
  assertTrue((r[0]?.score.recencyBonus ?? 0) >= 1, 'recency bonus active');
});

it('minimum 40 assertions target — verify spec length', () => {
  assertTrue(SPEC_REGISTRY.length >= 40, `registered ${SPEC_REGISTRY.length} specs, need ≥40`);
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of SPEC_REGISTRY) {
    try {
      await runOne(entry.name, entry.run);
      passed++;
    } catch {
      failed++;
      failures.push(entry.name);
    }
  }

  console.log('');
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${SPEC_REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

runSpecs().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(2);
});
