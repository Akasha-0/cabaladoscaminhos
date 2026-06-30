/**
 * Session Engine Spec — wave 68
 * Self-running harness (no vitest needed) — same shape as cycle 66/67.
 *
 * Covers:
 *   ✓ secret validation
 *   ✓ createSession + token shape
 *   ✓ validateSession: valid / expired / revoked / invalid-hmac / not-found
 *   ✓ refreshSession extends expiry; rejects invalid + revoked
 *   ✓ revokeSession sets revokedAt + idempotent
 *   ✓ getActiveSessions filters revoked + expired
 *   ✓ getAllSessions includes expired/revoked
 *   ✓ getSessionById + null
 *   ✓ cleanupExpiredSessions counts
 *   ✓ custom store injection
 *   ✓ resetSessionEngine clears state
 */

import {
  createSession, validateSession, refreshSession, revokeSession,
  getActiveSessions, getAllSessions, getSessionById, cleanupExpiredSessions,
  setSessionHmacSecret, getSessionHmacSecretFingerprint, setSessionStore, resetSessionEngine,
  buildTokenPayload, toSessionToken, isSessionToken,
  SessionExpiredError, InvalidSessionTokenError, SessionRevokedError, SessionEngineError,
  type Session, type SessionStore,
} from '../session-engine.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual === expected) {
    passed += 1;
  } else {
    failed += 1;
    failures.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function expectTrue(cond: boolean, label: string): void {
  if (cond) passed += 1;
  else { failed += 1; failures.push(label); }
}

async function expectThrows<E extends Error>(fn: () => unknown | Promise<unknown>, ctor: new (m: string) => E, label: string): Promise<void> {
  let caught: unknown = null;
  try {
    await fn();
  } catch (err) {
    caught = err;
  }
  if (caught === null) {
    failed += 1; failures.push(`${label}: no throw`);
    return;
  }
  if (caught instanceof ctor) passed += 1;
  else { failed += 1; failures.push(`${label}: threw ${(caught as Error).name}, not ${ctor.name}`); }
}

async function run(): Promise<void> {
  resetSessionEngine();
  setSessionHmacSecret('a'.repeat(32));

  // ── secret / setup ──
  expectTrue(getSessionHmacSecretFingerprint().length === 12, 'fingerprint length 12');
  await expectThrows(() => setSessionHmacSecret('short'), SessionEngineError, 'short secret rejected');
  expectEqual(buildTokenPayload('abc', 'u1', 100), 'abc.u1.100', 'buildTokenPayload shape');

  // ── create + token shape ──
  const s1 = await createSession('user-1', { metadata: { ip: '1.2.3.4', userAgent: 'Mozilla', deviceFingerprint: 'fp-1' } });
  expectTrue(typeof s1.id === 'string' && s1.id.length > 0, 'session.id is non-empty');
  expectEqual(s1.userId, 'user-1', 'userId matches');
  expectTrue(isSessionToken(s1.token), 'token is branded');
  expectTrue(s1.token.split('.').length === 4, 'token has 4 parts');
  expectTrue(s1.revokedAt === null, 'revokedAt is null initially');
  expectEqual(s1.metadata.ip, '1.2.3.4', 'metadata.ip persisted');
  expectTrue(s1.expiresAt.getTime() > Date.now(), 'expires in future');

  // ── validate valid session ──
  const v1 = await validateSession(s1.token);
  expectEqual(v1.status, 'valid', 'validate valid session');
  if (v1.status === 'valid') expectEqual(v1.session.id, s1.id, 'validate returns same session');

  // ── validate wrong hmac ──
  const tampered = s1.token.replace(/.[A-Za-z0-9_-]+$/, '.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') as ReturnType<typeof toSessionToken>;
  const vTamper = await validateSession(tampered);
  expectEqual(vTamper.status, 'invalid', 'tampered token invalid');

  // ── validate unknown ──
  const fakeToken = toSessionToken('zzz.user-1.' + (Date.now() + 60_000) + '.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  const vUnknown = await validateSession(fakeToken);
  expectEqual(vUnknown.status, 'invalid', 'unknown session rejected');

  // ── validate malformed token ──
  const vMalformed = await validateSession('nope');
  expectEqual(vMalformed.status, 'invalid', 'malformed token invalid');
  if (vMalformed.status === 'invalid') expectTrue(vMalformed.reason.length > 0, 'invalid has reason');

  // ── revoke then revalidate ──
  const revoked = await revokeSession(s1.token, { reason: 'user_logout' });
  expectTrue(revoked.revokedAt !== null, 'revokedAt set after revoke');
  const vRevoked = await validateSession(s1.token);
  expectEqual(vRevoked.status, 'revoked', 'revoked session reports revoked');

  // ── revoke idempotent ──
  const revoked2 = await revokeSession(s1.token);
  expectEqual(revoked2.id, revoked.id, 'revoke idempotent');

  // ── refresh on revoked throws ──
  let refreshErr = false;
  try { await refreshSession(s1.token); } catch (e) { if (e instanceof SessionRevokedError) refreshErr = true; }
  expectTrue(refreshErr, 'refresh on revoked throws');

  // ── refresh on invalid throws ──
  await expectThrows(() => refreshSession('nope'), InvalidSessionTokenError, 'refresh on invalid throws');

  // ── TTL expiry ──
  const s2 = await createSession('user-2', { ttlMs: 50 });
  await new Promise(r => setTimeout(r, 100));
  const v2 = await validateSession(s2.token);
  expectEqual(v2.status, 'expired', 'expired session reports expired');

  // ── refresh extends expiry ──
  const refreshed = await refreshSession(s2.token, { ttlMs: 5_000 });
  expectTrue(refreshed.refreshed, 'refresh reports refreshed');
  const v3 = await validateSession(refreshed.session.token);
  expectEqual(v3.status, 'valid', 'refreshed token validates');

  // ── getActiveSessions filters revoked+expired ──
  const s3 = await createSession('user-3');
  const s4 = await createSession('user-3', { ttlMs: 50 });
  await new Promise(r => setTimeout(r, 80));
  const active = await getActiveSessions('user-3');
  expectTrue(active.length === 1 && active[0]!.id === s3.id, 'active returns only non-expired');
  const all = await getAllSessions('user-3');
  expectTrue(all.length === 2, 'all returns both sessions');

  // ── getSessionById + null ──
  const found = await getSessionById(s3.id);
  expectEqual(found?.userId, 'user-3', 'getSessionById returns correct');
  const notFound = await getSessionById('nonexistent');
  expectEqual(notFound, null, 'getSessionById null for unknown');

  // ── cleanupExpiredSessions removes expired+revoked ──
  await createSession('user-cleanup', { ttlMs: 30 });
  await new Promise(r => setTimeout(r, 60));
  const cleaned = await cleanupExpiredSessions();
  expectTrue(cleaned.removed >= 1, 'cleanup removed at least 1');
  expectTrue(cleaned.scanned >= 1, 'cleanup scanned >= 1');

  // ── invalid userId rejection ──
  await expectThrows(() => createSession(''), SessionEngineError, 'empty userId rejected');
  await expectThrows(() => createSession('u', { ttlMs: -1 }), SessionEngineError, 'negative ttl rejected');

  // ── custom store injection ──
  class CountingStore implements SessionStore {
    inserted: Session[] = [];
    updates: Session[] = [];
    private map = new Map<string, Session>();
    private byUser = new Map<string, Set<string>>();
    async insert(s: Session) {
      this.inserted.push(s);
      this.map.set(s.id, s);
      const set = this.byUser.get(s.userId) ?? new Set();
      set.add(s.id);
      this.byUser.set(s.userId, set);
    }
    async update(s: Session) {
      this.updates.push(s);
      this.map.set(s.id, s);
    }
    async findById(id: string) { return this.map.get(id) ?? null; }
    async findByUserId(userId: string) {
      const ids = this.byUser.get(userId);
      if (!ids) return [];
      return [...ids].map(id => this.map.get(id)!).filter(Boolean);
    }
  }
  const customStore = new CountingStore();
  setSessionStore(customStore);
  const sCustom = await createSession('user-custom');
  expectTrue(customStore.inserted.length === 1, 'custom store received insert');
  expectEqual((await getSessionById(sCustom.id))?.userId, 'user-custom', 'custom store retrievable');

  // ── resetSessionEngine clears state ──
  resetSessionEngine();
  setSessionHmacSecret('b'.repeat(32));
  const sPostReset = await createSession('user-post-reset');
  expectTrue(sPostReset.id !== sCustom.id, 'post-reset new session id');

  // ── Summary ──
  console.log(`session-engine.spec.ts: ${passed}/${passed + failed} PASS`);
  if (failed > 0) {
    console.error('FAILURES:');
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('session-engine.spec.ts: harness crashed:', err);
  process.exit(1);
});
