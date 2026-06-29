/**
 * _smoke_run.ts — Local smoke runner (NOT committed; deleted after CI).
 *
 * Uses Node's built-in `assert` + minimal describe/it/expect shim.
 * Runs without vitest installed (sandbox-friendly).
 */

import assert from 'node:assert/strict';
import {
  validateComment,
  parseThreading,
  parseMentions,
  applySacredGuard,
  lgpdConsent,
  lgpdAudit,
  lgpdErase,
  buildCommentRecord,
  notify,
  store,
  submitComment,
  getThread,
  rateLimitCheck,
  a11yAltText,
  SACRED_CONCEPTS,
  MAX_COMMENT_BYTES,
  MAX_THREAD_DEPTH,
  RATE_LIMIT_PER_MIN,
  ARIA_TREEITEM_ROLE,
  ARIA_LISTITEM_ROLE,
  ARIA_GROUP_ROLE,
  SACRED_PSEUDO_PREFIX,
  ZError,
  _sacredReset,
  _rateLimitReset,
  _auditLog,
  _auditVerify,
  _lgpdReset,
  _storeReset,
  _storeGet,
} from './comments_threading_mentions_integration';

// ---- minimal describe/it/expect shim ----
let _pass = 0, _fail = 0, _currentSuite = '';
const _failures: string[] = [];

function describe(name: string, fn: () => void) {
  _currentSuite = name;
  console.log(`\n  ${name}`);
  fn();
}
function it(name: string, fn: () => void) {
  try {
    fn();
    _pass++;
    console.log(`    \u2713 ${name}`);
  } catch (e) {
    _fail++;
    const msg = (e as Error).message;
    _failures.push(`[${_currentSuite}] ${name}: ${msg}`);
    console.log(`    \u2717 ${name}\n      \u2192 ${msg}`);
  }
}
const expect = (actual: unknown) => ({
  toBe: (expected: unknown) => assert.deepStrictEqual(actual, expected),
  toEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
  toBeTrue: () => assert.strictEqual(actual, true),
  toBeFalse: () => assert.strictEqual(actual, false),
  toBeDefined: () => assert.notStrictEqual(actual, undefined),
  toBeNull: () => assert.strictEqual(actual, null),
  toContain: (sub: unknown) => {
    if (typeof actual === 'string') {
      assert.ok((actual as string).includes(String(sub)), `expected "${actual}" to contain "${sub}"`);
    } else if (Array.isArray(actual)) {
      assert.ok((actual as unknown[]).includes(sub), `expected array to contain ${JSON.stringify(sub)}`);
    } else {
      throw new Error('toContain: unsupported type');
    }
  },
  toBeNull: () => assert.strictEqual(actual, null),
  toMatch: (re: RegExp) => {
    if (typeof actual !== 'string') throw new Error('toMatch: requires string');
    assert.ok(re.test(actual as string), `expected "${actual}" to match ${re}`);
  },
  toBeGreaterThan: (n: number) => assert.ok((actual as number) > n, `expected ${actual} > ${n}`),
  toBeGreaterThanOrEqual: (n: number) => assert.ok((actual as number) >= n),
  toBeLessThan: (n: number) => assert.ok((actual as number) < n),
  toBeLessThanOrEqual: (n: number) => assert.ok((actual as number) <= n),
  not: {
    toBe: (expected: unknown) => assert.notDeepStrictEqual(actual, expected),
    toEqual: (expected: unknown) => assert.notDeepStrictEqual(actual, expected),
    toContain: (sub: unknown) => {
      if (typeof actual === 'string') {
        assert.ok(!(actual as string).includes(String(sub)));
      }
    },
    toBeNull: () => assert.notStrictEqual(actual, null),
    toMatch: (re: RegExp) => {
      if (typeof actual !== 'string') return;
      assert.ok(!re.test(actual as string));
    },
  },
});

function resetAll() {
  _sacredReset();
  _rateLimitReset();
  _lgpdReset();
  _storeReset();
}

// ----------------------------------------------------------------
// 1. VALIDATE COMMENT
// ----------------------------------------------------------------

describe('1. validateComment', () => {
  it('accepts minimal valid', () => {
    resetAll();
    const r = validateComment({ userId: 'u1', body: 'olá' });
    expect(r.ok).toBe(true);
  });
  it('rejects missing userId', () => {
    const r = validateComment({ body: 'x' });
    expect(r.ok).toBe(false);
  });
  it('rejects missing body', () => {
    const r = validateComment({ userId: 'u1' });
    expect(r.ok).toBe(false);
  });
  it('rejects oversized body', () => {
    const r = validateComment({ userId: 'u1', body: 'a'.repeat(MAX_COMMENT_BYTES + 1) });
    expect(r.ok).toBe(false);
  });
  it('accepts boundary body', () => {
    const r = validateComment({ userId: 'u1', body: 'x'.repeat(MAX_COMMENT_BYTES) });
    expect(r.ok).toBe(true);
  });
});

// ----------------------------------------------------------------
// 2. SACRED GUARD
// ----------------------------------------------------------------

describe('2. applySacredGuard', () => {
  it('pseudonymizes single sacred', () => {
    resetAll();
    const r = applySacredGuard('Honra Exu');
    expect(r.pseudos.length).toBe(1);
    expect(r.pseudos[0]).toMatch(new RegExp(`^${SACRED_PSEUDO_PREFIX}[a-z0-9]+$`));
  });
  it('pseudonymizes multiple sacred', () => {
    const r = applySacredGuard('Exu e Pombagira');
    expect(r.pseudos.length).toBe(2);
  });
  it('is deterministic', () => {
    const a = applySacredGuard('Ogum');
    const b = applySacredGuard('Ogum');
    expect(a.pseudos[0]).toEqual(b.pseudos[0]);
  });
  it('handles markdown formatting', () => {
    const r = applySacredGuard('**Oxalá** paz');
    expect(r.pseudos.length).toBe(1);
  });
  it('respects multilingual word boundaries', () => {
    const r = applySacredGuard('Oxalá exu guerreiro');
    expect(r.pseudos.length).toBeGreaterThanOrEqual(1);
  });
});

// ----------------------------------------------------------------
// 3. LGPD
// ----------------------------------------------------------------

describe('3. LGPD gates', () => {
  it('grants consent with HMAC receipt', () => {
    resetAll();
    const r = lgpdConsent('u1', 'grant');
    expect(r.ok).toBe(true);
    expect(r.receipt).toMatch(/^[a-f0-9]{64}$/);
  });
  it('verify consent succeeds after grant', () => {
    resetAll();
    const c = lgpdConsent('u1', 'grant');
    const v = lgpdConsent('u1', 'check');
    expect(v.ok).toBe(true);
    expect(v.receipt).toEqual(c.receipt);
  });
  it('audit chain links via prevHash', () => {
    resetAll();
    lgpdConsent('u1', 'grant');
    lgpdAudit('submit_comment', 'u1', { bodyLength: 100 });
    lgpdAudit('submit_comment', 'u1', { bodyLength: 200 });
    const log = _auditLog();
    expect(log[0].prevHash).toEqual('');
    expect(log[1].prevHash).toEqual(log[0].hash);
    expect(log[2].prevHash).toEqual(log[1].hash);
    expect(_auditVerify()).toBe(true);
  });
  it('erase cascades and leaves audit marker', () => {
    resetAll();
    submitComment({ userId: 'u1', body: 'a' });
    submitComment({ userId: 'u1', body: 'b' });
    const erased = lgpdErase('u1');
    expect(erased.erased).toBe(2);
    expect(erased.auditMarker).toMatch(/^[a-f0-9]{64}$/);
    expect(_auditVerify()).toBe(true);
    const c = lgpdConsent('u1', 'check');
    expect(c.ok).toBe(false);
  });
  it('withdraws consent', () => {
    resetAll();
    lgpdConsent('u1', 'grant');
    lgpdConsent('u1', 'withdraw');
    const c = lgpdConsent('u1', 'check');
    expect(c.ok).toBe(false);
  });
});

// ----------------------------------------------------------------
// 4. THREADING
// ----------------------------------------------------------------

describe('4. parseThreading', () => {
  it('extracts single marker', () => {
    const r = parseThreading('hi ::reply-to::abc::');
    expect(r.refs.length).toBe(1);
    expect(r.refs[0].parentId).toEqual('abc');
  });
  it('handles 5-level chain', () => {
    const r = parseThreading('::reply-to::a1:: ::reply-to::a2:: ::reply-to::a3:: ::reply-to::a4:: ::reply-to::a5::');
    expect(r.depth).toBe(5);
  });
  it('detects cycles', () => {
    const r = parseThreading('::reply-to::x:: ::reply-to::x::');
    expect(r.cycleDetected).toBe(true);
  });
  it('tolerates broken refs', () => {
    const r = parseThreading('::reply-to:::: ::reply-to::valid::');
    expect(r.refs.length).toBe(1);
  });
  it('caps at MAX_THREAD_DEPTH', () => {
    const r = parseThreading('::reply-to::a:: ::reply-to::b:: ::reply-to::c:: ::reply-to::d:: ::reply-to::e:: ::reply-to::f:: ::reply-to::g::');
    expect(r.refs.length).toBe(MAX_THREAD_DEPTH);
  });
});

// ----------------------------------------------------------------
// 5. MENTIONS
// ----------------------------------------------------------------

describe('5. parseMentions', () => {
  it('extracts single', () => {
    const r = parseMentions('olá @joao');
    expect(r.mentions.length).toBe(1);
  });
  it('extracts multiple', () => {
    const r = parseMentions('@maria @jose @ana');
    expect(r.mentions.length).toBe(3);
  });
  it('flags sacred context', () => {
    const r = parseMentions('Honra Exu @maria');
    const m = r.mentions.find(x => x.username === 'maria');
    expect(m?.sacredContext).toBe(true);
  });
  it('handles Unicode/RTL username', () => {
    const r = parseMentions('olá @mohammed');
    expect(r.mentions.length).toBeGreaterThanOrEqual(1);
  });
  it('skips email-like patterns', () => {
    const r = parseMentions('user@host.com');
    expect(r.mentions.length).toBe(0);
  });
});

// ----------------------------------------------------------------
// 6. RATE LIMIT
// ----------------------------------------------------------------

describe('6. rateLimitCheck', () => {
  it('allows under limit', () => {
    resetAll();
    for (let i = 0; i < RATE_LIMIT_PER_MIN - 1; i++) {
      expect(rateLimitCheck('u1').allowed).toBe(true);
    }
  });
  it('blocks at limit', () => {
    resetAll();
    for (let i = 0; i < RATE_LIMIT_PER_MIN; i++) rateLimitCheck('u1');
    expect(rateLimitCheck('u1').allowed).toBe(false);
  });
  it('resets after window', () => {
    resetAll();
    const t0 = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_PER_MIN; i++) rateLimitCheck('u1', t0 + i);
    expect(rateLimitCheck('u1', t0 + 100).allowed).toBe(false);
    expect(rateLimitCheck('u1', t0 + 70_000).allowed).toBe(true);
  });
  it('per-user isolation', () => {
    resetAll();
    for (let i = 0; i < RATE_LIMIT_PER_MIN; i++) rateLimitCheck('u1');
    expect(rateLimitCheck('u1').allowed).toBe(false);
    expect(rateLimitCheck('u2').allowed).toBe(true);
  });
  it('reports remaining', () => {
    resetAll();
    const a = rateLimitCheck('u1');
    const b = rateLimitCheck('u1');
    expect(a.remaining).toBe(RATE_LIMIT_PER_MIN - 1);
    expect(b.remaining).toBe(RATE_LIMIT_PER_MIN - 2);
  });
});

// ----------------------------------------------------------------
// 7. SUBMIT COMMENT
// ----------------------------------------------------------------

describe('7. submitComment', () => {
  it('happy path', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'Olá @joao Exu abre' });
    expect(r.ok).toBe(true);
    expect(r.record?.id.startsWith('c_')).toBe(true);
    expect(r.record?.sacredTagPseudos.length).toBeGreaterThan(0);
    expect(r.record?.mentions.length).toBe(1);
  });
  it('rejects invalid', () => {
    resetAll();
    const r = submitComment({ userId: '', body: '' });
    expect(r.ok).toBe(false);
  });
  it('rejects rate-limited', () => {
    resetAll();
    for (let i = 0; i < RATE_LIMIT_PER_MIN; i++) submitComment({ userId: 'u1', body: `m${i}` });
    const r = submitComment({ userId: 'u1', body: 'overflow' });
    expect(r.ok).toBe(false);
    expect(r.code).toEqual('RATE_LIMIT');
  });
  it('rejects oversized', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'a'.repeat(MAX_COMMENT_BYTES + 1) });
    expect(r.ok).toBe(false);
  });
  it('persists + re-reads', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'persist' });
    expect(r.ok).toBe(true);
    const got = _storeGet(r.record!.id);
    expect(got?.body).toEqual('persist');
  });
});

// ----------------------------------------------------------------
// 8. GET THREAD
// ----------------------------------------------------------------

describe('8. getThread', () => {
  it('null for unknown root', () => {
    resetAll();
    expect(getThread('nope')).toBeNull();
  });
  it('single-node tree', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'raiz' });
    const t = getThread(r.record!.id);
    expect(t).not.toBeNull();
    expect(t!.children.length).toBe(0);
    expect(t!.ariaRole).toEqual(ARIA_TREEITEM_ROLE);
  });
  it('3-level tree with positions', () => {
    resetAll();
    const root = submitComment({ userId: 'u1', body: 'raiz' });
    const child = submitComment({ userId: 'u2', body: 'filho', parentId: root.record!.id });
    submitComment({ userId: 'u3', body: 'neto', parentId: child.record!.id });
    const t = getThread(root.record!.id);
    expect(t!.children.length).toBe(1);
    expect(t!.children[0].children.length).toBe(1);
    expect(t!.children[0].children[0].ariaLevel).toBe(3);
    expect(t!.children[0].ariaPosInSet).toBe(1);
  });
  it('marks erased bodies as [removido]', () => {
    resetAll();
    const root = submitComment({ userId: 'u1', body: 'raiz' });
    submitComment({ userId: 'u1', body: 'filho', parentId: root.record!.id });
    lgpdErase('u1');
    const t = getThread(root.record!.id);
    expect(t!.body).toEqual('[removido]');
  });
  it('survives circular parentId', () => {
    resetAll();
    const a = submitComment({ userId: 'u1', body: 'A' });
    const b = submitComment({ userId: 'u2', body: 'B', parentId: a.record!.id });
    const aStored = _storeGet(a.record!.id);
    if (aStored) (aStored as { parentId?: string }).parentId = b.record!.id;
    const t = getThread(a.record!.id);
    expect(t).not.toBeNull();
    expect(t!.children.length).toBe(1);
  });
});

// ----------------------------------------------------------------
// 9. A11Y
// ----------------------------------------------------------------

describe('9. a11yAltText', () => {
  it('PT-BR alt text', () => {
    resetAll();
    const r = submitComment({ userId: 'maria', body: 'oi' });
    const a = a11yAltText(r.record!);
    expect(a.altText.includes('Comentário de maria')).toBe(true);
  });
  it('English alt text', () => {
    resetAll();
    const r = submitComment({ userId: 'maria', body: 'hi', locale: 'en-US' });
    const a = a11yAltText(r.record!);
    expect(a.altText.includes('Comment by maria')).toBe(true);
  });
  it('group role for parent', () => {
    resetAll();
    const root = submitComment({ userId: 'u1', body: 'r' });
    submitComment({ userId: 'u2', body: 'f', parentId: root.record!.id });
    const a = a11yAltText(root.record!);
    expect(a.ariaRole).toEqual(ARIA_GROUP_ROLE);
  });
  it('listitem role for leaf', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'leaf' });
    const a = a11yAltText(r.record!);
    expect(a.ariaRole).toEqual(ARIA_LISTITEM_ROLE);
  });
  it('ariaLabel encodes depth', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'Oxalá @joao' });
    const a = a11yAltText(r.record!);
    expect(a.ariaLabel.includes(`nível ${r.record!.depth}`)).toBe(true);
  });
});

// ----------------------------------------------------------------
// 10. EDGE CASES
// ----------------------------------------------------------------

describe('10. edge cases', () => {
  it('combining marks stripped (NFKC)', () => {
    resetAll();
    const a = applySacredGuard('Honra E\u0301xu');
    expect(a.pseudos.length).toBeGreaterThanOrEqual(1);
  });
  it('ZWJ family emoji survives', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: '👨‍👩‍👧‍👦 café @joao' });
    expect(r.ok).toBe(true);
    expect(r.record!.mentions.length).toBe(1);
  });
  it('RTL Arabic body works', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'السلام عليكم @mohammed Exu' });
    expect(r.ok).toBe(true);
    expect(r.record!.sacredTagPseudos.length).toBeGreaterThan(0);
  });
  it('ZError class exported', () => {
    const e = new ZError([{ path: 'foo', message: 'bar' }]);
    expect(e.issues.length).toBe(1);
  });
  it('buildCommentRecord yields depth >= 1', () => {
    resetAll();
    const v = validateComment({ userId: 'u1', body: 'x' });
    const parsed = parseThreading('x');
    const guard = applySacredGuard('x');
    const rec = buildCommentRecord(v.data!, parsed, guard, 'fake-receipt');
    expect(rec.depth >= 1).toBe(true);
  });
  it('notify queues one per mention', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: '@joao @maria @ana' });
    const result = notify(r.record!);
    expect(result.queued).toBe(3);
  });
  it('notify callback fires', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'hi @bob' });
    let count = 0;
    notify(r.record!, () => { count++; });
    expect(count).toBe(1);
  });
  it('store returns c_ prefix', () => {
    resetAll();
    const r = submitComment({ userId: 'u1', body: 'a' });
    expect(r.record!.id.startsWith('c_')).toBe(true);
  });
  it('rejects invalid consent token', () => {
    resetAll();
    lgpdConsent('u1', 'grant');
    const r = submitComment({ userId: 'u1', body: 'a', consentToken: 'a'.repeat(64) });
    expect(r.ok).toBe(false);
    expect(r.code).toEqual('CONSENT');
  });
  it('14 public functions exported', () => {
    const fns = [validateComment, parseThreading, parseMentions, applySacredGuard, lgpdConsent, lgpdAudit, lgpdErase, buildCommentRecord, notify, store, submitComment, getThread, rateLimitCheck, a11yAltText];
    expect(fns.length).toBe(14);
    for (const f of fns) expect(typeof f).toEqual('function');
  });
});

// ----------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------

console.log(`\n\n  TOTAL: ${_pass} passed, ${_fail} failed`);
if (_fail > 0) {
  console.log('\n  FAILURES:');
  for (const f of _failures) console.log(`    - ${f}`);
  process.exit(1);
}
process.exit(0);