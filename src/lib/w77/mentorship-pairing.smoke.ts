/**
 * ════════════════════════════════════════════════════════════════════════════
 * W77-A — MENTORSHIP PAIRING · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Inline checks mirroring the engine. Sync `check(label, cond)` pattern.
 * ≥20 checks. Exits 0 on full PASS.
 *
 * Run: `node --experimental-strip-types mentorship-pairing.smoke.ts`
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
  canonicalJson,
  sha256HexSync,
  sacredMatch,
  listSacredTermsMentioned,
  mentorId,
  menteeId,
  tradition,
  domain,
  TRADITION_LIST,
  DOMAIN_LIST,
  _resetAuditForTests,
  type MentorProfile,
  type MenteeProfile,
  type Tradition,
  type Domain,
} from './mentorship-pairing.ts';

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}`);
  }
}

function expectThrow(label: string, fn: () => unknown, pattern?: RegExp): void {
  let threw = false;
  let msg = '';
  try { fn(); } catch (e) { threw = true; msg = e instanceof Error ? e.message : String(e); }
  if (!threw) {
    fails++;
    console.log(`  ✗ ${label} (did not throw)`);
  } else if (pattern && !pattern.test(msg)) {
    fails++;
    console.log(`  ✗ ${label} (threw wrong message: ${JSON.stringify(msg)})`);
  } else {
    passes++;
    console.log(`  ✓ ${label}`);
  }
}

console.log('W77-A Mentorship Pairing — Smoke Harness\n');

// ════════════════════════════════════════════════════════════════════════════
// INLINE CHECKS
// ════════════════════════════════════════════════════════════════════════════

_resetAuditForTests();

check('TRADITION_LIST has 7 traditions', TRADITION_LIST.length === 7);
check('DOMAIN_LIST has 8 domains', DOMAIN_LIST.length === 8);
check('all 7 traditions are correctly named',
  (TRADITION_LIST as readonly string[]).includes('Candomble') &&
  (TRADITION_LIST as readonly string[]).includes('Umbanda') &&
  (TRADITION_LIST as readonly string[]).includes('Ifa') &&
  (TRADITION_LIST as readonly string[]).includes('Cabala') &&
  (TRADITION_LIST as readonly string[]).includes('Astrologia') &&
  (TRADITION_LIST as readonly string[]).includes('Tantra') &&
  (TRADITION_LIST as readonly string[]).includes('Cigano'),
);

check('all 8 domains are correctly named',
  (DOMAIN_LIST as readonly string[]).includes('tarot') &&
  (DOMAIN_LIST as readonly string[]).includes('cigano') &&
  (DOMAIN_LIST as readonly string[]).includes('odu-orixa') &&
  (DOMAIN_LIST as readonly string[]).includes('astrologia') &&
  (DOMAIN_LIST as readonly string[]).includes('numerologia') &&
  (DOMAIN_LIST as readonly string[]).includes('runas') &&
  (DOMAIN_LIST as readonly string[]).includes('cabala') &&
  (DOMAIN_LIST as readonly string[]).includes('tantra'),
);

check('canonicalJson sorts keys deeply', canonicalJson({ b: 2, a: 1, c: { y: 'Y', x: 'X' } }) === canonicalJson({ c: { x: 'X', y: 'Y' }, a: 1, b: 2 }));

check('sha256HexSync("") = e3b0...',
  sha256HexSync('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

check('sha256HexSync("abc") = ba78...',
  sha256HexSync('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

check('sha256HexSync output is 64 hex chars',
  /^[0-9a-f]{64}$/.test(sha256HexSync('The quick brown fox jumps over the lazy dog')));

check('sacredMatch handles acute accent in Oxalá', sacredMatch('Oxalá é maior', 'Oxalá'));
check('sacredMatch handles tilde in Iansã', sacredMatch('Iansã guerreira', 'Iansã'));
check('sacredMatch rejects false positive (Oxalaxxx)', !sacredMatch('Oxalaxxx', 'Oxalá'));
check('sacredMatch rejects interior match (fooOxalá)', !sacredMatch('fooOxalá', 'Oxalá'));
check('listSacredTermsMentioned finds ≥3 in mixed text',
  listSacredTermsMentioned('Oxalá Iansã Ogum Candomblé').length >= 3);

check('mentorId accepts m_xxx', (mentorId('m_abc') as unknown as string) === 'm_abc');
check('menteeId accepts s_xxx', (menteeId('s_def') as unknown as string) === 's_def');
check('tradition accepts Cigano', (tradition('Cigano') as unknown as string) === 'Cigano');
check('domain accepts tarot', (domain('tarot') as unknown as string) === 'tarot');
check('hashCacheKey length is 64', hashCacheKey({ mentee: { displayName: 'x', traditions: [tradition('Cigano')], domains: [domain('tarot')], languages: ['pt'], timezoneOffsetHours: 0, availability: [{ weekday: 1, startHourUtc: 0, endHourUtc: 1 }], weeksStudying: 1, bio: '' } }).length === 64);

expectThrow('tradition rejects Wicca', () => tradition('Wicca'), /invalid Tradition/);
expectThrow('domain rejects tyop', () => domain('tyop'), /invalid Domain/);
expectThrow('mentorId rejects wrong prefix', () => mentorId('x_abc'), /^invalid MentorId/);
expectThrow('menteeId rejects wrong prefix', () => menteeId('y_def'), /^invalid MenteeId/);

// Now test the registration + pairing flow end-to-end (sync flow check).
_resetAuditForTests();

const mentor: MentorProfile = {
  displayName: 'SmokeMentor',
  traditions: [tradition('Cigano')],
  domains: [domain('astrologia')],
  languages: ['pt', 'en'],
  timezoneOffsetHours: -3,
  availability: [{ weekday: 1, startHourUtc: 19, endHourUtc: 22 }],
  yearsStudying: 8,
  bio: 'Estudo Oxalá e Iansã e Cigano há 8 anos.',
  acceptingMentees: true,
};
const mentee: MenteeProfile = {
  displayName: 'SmokeMentee',
  traditions: [tradition('Cigano')],
  domains: [domain('astrologia')],
  languages: ['pt'],
  timezoneOffsetHours: -3,
  availability: [{ weekday: 1, startHourUtc: 19, endHourUtc: 22 }],
  weeksStudying: 12,
  bio: 'Busco orientação em Oxalá e Iansã e Cigano.',
};

const mentorId_ = registerMentor(mentor);
const menteeId_ = registerMentee(mentee);
const results = pairMentorship({ mentee, topN: 5 });

check('registerMentor returns string', typeof mentorId_ === 'string');
check('registerMentee returns string', typeof menteeId_ === 'string');
check('pairMentorship returns readonly array', Array.isArray(results));
check('pairMentorship finds the mentor', results.length === 1);
check('pairMentorship score total >= 50', (results[0]?.score.total ?? 0) >= 50);
check('pairMentorship mentor name matches', results[0]?.displayName === 'SmokeMentor');
check('pairMentorship tradition score >= 40', (results[0]?.score.traditionAffinity ?? 0) >= 40);
check('pairMentorship domain score = 30', (results[0]?.score.domainOverlap ?? 0) === 30);
check('pairMentorship timezone score = 10', (results[0]?.score.timezoneOverlap ?? 0) === 10);
check('pairMentorship language score = 10 (pt-pt)', (results[0]?.score.languageOverlap ?? 0) === 10);
check('pairMentorship availability score = 3', (results[0]?.score.availabilityOverlap ?? 0) >= 3);
check('pairMentorship sacred coverage >= 3', (results[0]?.score.sacredCoverage ?? 0) >= 3);
check('pairMentorship produces audit entries', exportAudit().length === 1);
check('audit entry has menteeId', exportAudit()[0]?.menteeId !== undefined);
check('audit entry has 64-char cacheKey', (exportAudit()[0]?.cacheKey.length ?? 0) === 64);
check('listMentorsByTradition(Cigano).length >= 1', listMentorsByTradition(tradition('Cigano')).length >= 1);
check('listAllMentors().length >= 1', listAllMentors().length >= 1);

console.log('');
console.log(`  RESULT: ${passes} PASS · ${fails} FAIL`);

if (fails > 0) {
  process.exit(1);
}
