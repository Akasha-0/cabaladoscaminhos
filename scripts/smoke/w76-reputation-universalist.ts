/**
 * ════════════════════════════════════════════════════════════════════════════
 * W76-B — REPUTATION UNIVERSALIST · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ≥20 inline assertions covering:
 *   - branded factories + format enforcement
 *   - 7 traditions + ≥30 sacred terms
 *   - decay math (slower lambda ⇒ higher score)
 *   - awardReputation anti-gating paths (self, rate, weight, opt-out)
 *   - universalism gates (no global ranking, per-domain, per-tradition)
 *   - tradition-elder veto (two-elders rule, audited)
 *   - audit log immutability
 */

declare const process: { exit(code: number): never };
import {
  awardReputation,
  decideRemoval,
  decayWeight,
  decaysSlowerThan,
  elderCount,
  exportAudit,
  getReputation,
  isElder,
  isOptedOut,
  listElders,
  listTopContributors,
  listTopContributorsGlobal,
  optOut,
  registerElder,
  requestRemoval,
  userId,
  DOMAIN_METADATA,
  REPUTATION_DOMAINS,
  SACRED_TRADITIONS,
  SACRED_TERM_WHITELIST,
} from '../../src/lib/w76/reputation-universalist.ts';

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
function expectThrow(label: string, fn: () => unknown, pattern: RegExp): void {
  try {
    fn();
    fails++;
    console.log(`  ✗ ${label} (no throw)`);
  } catch (e) {
    const m = (e as Error).message + ' ' + String((e as { code?: string }).code ?? '');
    if (pattern.test(m)) {
      passes++;
      console.log(`  ✓ ${label}`);
    } else {
      fails++;
      console.log(`  ✗ ${label} (message="${m}" didn't match ${pattern})`);
    }
  }
}

console.log('W76-B Reputation Universalist — Smoke Harness\n');

// Section 1 — branded factories
check('userId("u_alice") works', userId('u_alice') === 'u_alice');
expectThrow('userId("alice") throws', () => userId('alice'), /invalid/);

// Section 2 — sacred coverage
check('SACRED_TRADITIONS.length === 7', SACRED_TRADITIONS.length === 7);
for (const t of ['Candomblé', 'Umbanda', 'Ifá', 'Cabala', 'Astrologia', 'Tantra', 'Cigano']) {
  check(`SACRED_TRADITIONS includes ${t}`, SACRED_TRADITIONS.includes(t as any));
}
check('SACRED_TERM_WHITELIST.length ≥ 30', SACRED_TERM_WHITELIST.length >= 30);
check('Whitelist has Orixá', SACRED_TERM_WHITELIST.includes('Orixá'));
check('Whitelist has Caboclo', SACRED_TERM_WHITELIST.includes('Caboclo'));
check('Whitelist has Ifá', SACRED_TERM_WHITELIST.includes('Ifá'));
check('Whitelist has Sephirot', SACRED_TERM_WHITELIST.includes('Sephirot'));
check('Whitelist has Ascendente', SACRED_TERM_WHITELIST.includes('Ascendente'));
check('Whitelist has Bodhisattva', SACRED_TERM_WHITELIST.includes('Bodhisattva'));
check('Whitelist has Cigano', SACRED_TERM_WHITELIST.includes('Cigano'));
check('Whitelist has Tarô', SACRED_TERM_WHITELIST.includes('Tarô'));

// Section 3 — domain tuning
check('REPUTATION_DOMAINS.length === 5', REPUTATION_DOMAINS.length === 5);
const rk = DOMAIN_METADATA.find((m) => m.domain === 'ritual-knowledge')!;
const ph = DOMAIN_METADATA.find((m) => m.domain === 'peer-help')!;
check('ritual-knowledge lambda < peer-help lambda', decaysSlowerThan(rk.lambda, ph.lambda));
check('ritual-knowledge maxWeight > peer-help maxWeight', rk.maxWeight > ph.maxWeight);

// Section 4 — decay math
check('decayWeight(10,0,λ)=10', Math.abs(decayWeight(10, 0, 0.003) - 10) < 1e-9);
check('decayWeight smaller λ ⇒ higher score', decayWeight(10, 100, 0.001) > decayWeight(10, 100, 0.005));
expectThrow('decayWeight negative weight throws', () => decayWeight(-1, 0, 0.001), /INVALID_WEIGHT/);

// Section 5 — awardReputation happy path + anti-gating
const alice = userId('u_smoke_alice');
const bob = userId('u_smoke_bob');
const carol = userId('u_smoke_carol');
const dan = userId('u_smoke_dan');

const ok1 = awardReputation({ recipient: alice, fromPeer: bob, domain: 'contributions', tradition: 'Candomblé', weight: 5, occurredAt: '2026-06-29T12:00:00.000Z' });
check('awardReputation applies happy path', ok1.applied === true);
expectThrow('self-award throws SELF_AWARD', () => awardReputation({ recipient: alice, fromPeer: alice, domain: 'contributions', tradition: 'Candomblé', weight: 5 }), /SELF_AWARD/);
expectThrow('unknown tradition throws UNKNOWN_TRADITION', () => awardReputation({ recipient: alice, fromPeer: bob, domain: 'contributions', tradition: 'Wicca' as any, weight: 5 }), /UNKNOWN_TRADITION/);
expectThrow('over-max weight throws INVALID_WEIGHT', () => awardReputation({ recipient: alice, fromPeer: carol, domain: 'peer-help', tradition: 'Cabala', weight: 999 }), /INVALID_WEIGHT/);

// Section 6 — rate limit
for (let i = 0; i < 5; i++) {
  awardReputation({ recipient: alice, fromPeer: dan, domain: 'peer-help', tradition: 'Cabala', weight: 1, occurredAt: '2026-06-30T08:00:00.000Z' });
}
expectThrow('6th award from same peer same day throws RATE_LIMIT',
  () => awardReputation({ recipient: alice, fromPeer: dan, domain: 'peer-help', tradition: 'Cabala', weight: 1, occurredAt: '2026-06-30T15:00:00.000Z' }),
  /RATE_LIMIT/);

// Section 7 — opt-out
optOut(alice, 'sacred-content-quality');
const blocked = awardReputation({ recipient: alice, fromPeer: bob, domain: 'sacred-content-quality', tradition: 'Cigano', weight: 10 });
check('opt-out returns applied=false', blocked.applied === false);
check('opt-out reason=OPT_OUT', blocked.reason === 'OPT_OUT');

// Section 8 — universalism: no global ranking
expectThrow('listTopContributorsGlobal forbidden', () => listTopContributorsGlobal(), /Global ranking forbidden/);

// Section 9 — per-tradition leaderboards
awardReputation({ recipient: alice, fromPeer: bob, domain: 'contributions', tradition: 'Astrologia', weight: 8, occurredAt: '2026-06-29T12:00:00.000Z' });
awardReputation({ recipient: carol, fromPeer: bob, domain: 'contributions', tradition: 'Astrologia', weight: 12, occurredAt: '2026-06-29T12:00:00.000Z' });
awardReputation({ recipient: carol, fromPeer: dan, domain: 'contributions', tradition: 'Candomblé', weight: 5, occurredAt: '2026-06-29T12:00:00.000Z' });
const astroList = listTopContributors('Astrologia', 'contributions', 10, new Date('2026-06-30T12:00:00.000Z'));
check('Astrologia leaderboard has 2 entries', astroList.length === 2);
check('Astrologia top is carol (higher weight)', astroList[0]?.userId === carol);
const candList = listTopContributors('Candomblé', 'contributions', 10, new Date('2026-06-30T12:00:00.000Z'));
check('Candomblé leaderboard has 2 entries', candList.length === 2);

// Section 10 — tradition-elder veto
const elder1 = userId('u_smoke_elder1');
const elder2 = userId('u_smoke_elder2');
const target = userId('u_smoke_target');
registerElder(elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
registerElder(elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
check('elderCount(Candomblé) === 2', elderCount('Candomblé') === 2);
check('isElder(elder1, Candomblé)', isElder(elder1, 'Candomblé'));
expectThrow('requestRemoval without cosigner throws VETO_REQUIRES_TWO_ELDERS',
  () => requestRemoval({ targetUserId: target, tradition: 'Candomblé', reason: 'mock', requestedBy: elder1 }),
  /VETO_REQUIRES_TWO_ELDERS/);
const req = requestRemoval({ targetUserId: target, tradition: 'Candomblé', reason: 'mock', requestedBy: elder1, cosignedBy: elder2 });
check('requestRemoval returns pending', req.status === 'pending');
const decided = decideRemoval(req.requestId, 'approved', elder1, '2026-06-30T11:00:00.000Z');
check('decideRemoval status=approved', decided.status === 'approved');
check('decideRemoval decidedAt set', decided.decidedAt === '2026-06-30T11:00:00.000Z');

// Section 11 — audit log immutability
const audit = exportAudit();
check('audit has ≥ 5 entries', audit.length >= 5);
let threw = false;
try { (audit as unknown as Array<unknown>).push({ fake: true }); } catch { threw = true; }
check('audit array frozen', threw);

console.log(`\nW76-B Reputation Universalist — Smoke Summary: ${passes} passed, ${fails} failed`);
if (fails > 0) process.exit(1);
process.exit(0);
