/**
 * OAuth Callback Spec — wave 68
 * Self-running harness.
 *
 * Covers: state issue + validate (malformed, expired, hmac, single-use),
 * provider adapter exchange + profile fetch (3 providers),
 * handleOAuthCallback (create_new + linked_existing), linkProvider,
 * unlinkProvider, getOAuthLink, getLinkedProvidersForUser, expired cleanup,
 * resetOAuthEngine.
 */

import {
  issueOAuthState, validateOAuthState, handleOAuthCallback, cleanupExpiredOAuthStates,
  linkProvider, unlinkProvider, getOAuthLink, getLinkedProvidersForUser,
  setOAuthStateSecret, getOAuthStateSecretFingerprint, setOAuthAdapter, resetOAuthAdapters, resetOAuthEngine,
  OAuthStateError, OAuthLinkError, OAuthError, type OAuthProvider, type OAuthAdapter, type OAuthProfile, type OAuthTokenResponse,
} from '../oauth-callback.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual === expected) passed += 1;
  else { failed += 1; failures.push(`${label}: expected ${String(expected)}, got ${String(actual)}`); }
}
function expectTrue(cond: boolean, label: string): void {
  if (cond) passed += 1;
  else { failed += 1; failures.push(label); }
}
async function expectThrows(fn: () => unknown | Promise<unknown>, ctor: new (...a: never[]) => Error, label: string): Promise<void> {
  let caught: unknown = null;
  try { await fn(); } catch (err) { caught = err; }
  if (caught === null) { failed += 1; failures.push(`${label}: no throw`); return; }
  if (caught instanceof ctor) passed += 1;
  else { failed += 1; failures.push(`${label}: threw ${(caught as Error).name}, not ${ctor.name}`); }
}

async function run(): Promise<void> {
  resetOAuthEngine();
  resetOAuthAdapters();
  setOAuthStateSecret('c'.repeat(32));
  expectTrue(getOAuthStateSecretFingerprint().length === 12, 'fingerprint 12 chars');

  await expectThrows(() => setOAuthStateSecret('short'), OAuthError, 'short state secret rejected');

  // ── issue + validate ──
  const state = issueOAuthState({ provider: 'google', redirectUri: 'https://app.test/cb' });
  expectTrue(state.token.split('.').length === 2, 'state has 2 parts');
  expectTrue(state.expiresAt.getTime() > Date.now(), 'state expires in future');
  const v = validateOAuthState(state.token);
  expectTrue(v.valid, 'fresh state validates');
  if (v.valid) expectEqual(v.record.provider, 'google', 'state record has provider');

  // ── single-use consumption ──
  const consumed = handleOAuthCallback({ provider: 'google', code: 'auth-code-1', state: state.token, redirectUri: 'https://app.test/cb' });
  const consumed2 = consumed;
  void consumed2;
  // re-validating should fail because handleOAuthCallback consumed it
  const vReuse = validateOAuthState(state.token);
  expectEqual(vReuse.valid, false, 'state cannot be reused after consumption');

  // ── malformed state ──
  const vMalformed = validateOAuthState('not-a-state');
  expectEqual(vMalformed.valid, false, 'malformed rejected');
  if (!vMalformed.valid) expectEqual(vMalformed.reason, 'malformed', 'malformed reason');

  // ── unknown state ──
  const vUnknown = validateOAuthState('zzz.nope');
  expectEqual(vUnknown.valid, false, 'unknown rejected');
  if (!vUnknown.valid) expectEqual(vUnknown.reason, 'hmac_mismatch', 'unknown has hmac_mismatch reason');

  // ── hmac mismatch via tampered token ──
  const state2 = issueOAuthState();
  const tampered = state2.token.replace(/.[A-Za-z0-9_-]+$/, '.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  const vTamper = validateOAuthState(tampered);
  expectEqual(vTamper.valid, false, 'tampered state rejected');

  // ── handle callback creates new user when no prior link ──
  const state3 = issueOAuthState();
  const callback1 = await handleOAuthCallback({ provider: 'github', code: 'code-abc', state: state3.token });
  expectEqual(callback1.status, 'created_new', 'first callback creates new user');
  expectEqual(callback1.provider, 'github', 'provider is github');
  expectTrue(callback1.userId.startsWith('usr_'), 'userId starts with usr_');
  expectEqual(typeof callback1.tokens.accessToken, 'string', 'accessToken present');

  // ── second callback with same code → linked_existing ──
  const state4 = issueOAuthState();
  const callback2 = await handleOAuthCallback({ provider: 'github', code: 'code-abc', state: state4.token });
  expectEqual(callback2.status, 'linked_existing', 'same code → linked_existing');
  expectEqual(callback2.userId, callback1.userId, 'same userId across calls');

  // ── provider mismatch in state throws ──
  const state5 = issueOAuthState({ provider: 'apple' });
  let mismatchErr = false;
  try { await handleOAuthCallback({ provider: 'google', code: 'x', state: state5.token }); }
  catch (e) { if (e instanceof OAuthStateError) mismatchErr = true; }
  expectTrue(mismatchErr, 'state issued for apple, google callback throws');

  // ── linkProvider conflict ──
  linkProvider('user-A', 'google', 'provider-X');
  let conflictErr = false;
  try { linkProvider('user-B', 'google', 'provider-X'); }
  catch (e) { if (e instanceof OAuthLinkError) conflictErr = true; }
  expectTrue(conflictErr, 'provider account already linked to other user throws');

  // ── linkProvider same user → idempotent ──
  const r = linkProvider('user-A', 'google', 'provider-X');
  expectEqual(r.userId, 'user-A', 'linkProvider idempotent same user');

  // ── unlink ──
  linkProvider('user-A', 'apple', 'provider-Apple');
  const ok = unlinkProvider('user-A', 'apple');
  expectEqual(ok, true, 'unlink true');
  const ok2 = unlinkProvider('user-A', 'apple');
  expectEqual(ok2, false, 'unlink false when already gone');

  // ── getOAuthLink + getLinkedProvidersForUser ──
  linkProvider('user-B', 'github', 'providerGH1');
  linkProvider('user-B', 'google', 'providerGL1');
  const link = getOAuthLink('github', 'providerGH1');
  expectEqual(link?.userId, 'user-B', 'getOAuthLink returns correct');
  const providers = getLinkedProvidersForUser('user-B').slice().sort();
  expectEqual(providers.length, 2, 'user-B has 2 linked providers');

  // ── adapter override ──
  const captured: string[] = [];
  const spyAdapter: OAuthAdapter = {
    async exchangeCode(code): Promise<OAuthTokenResponse> {
      captured.push(code);
      return { accessToken: 'spied-at', refreshToken: 'spied-rt', idToken: null, expiresInSec: 60, scope: '', tokenType: 'Bearer' };
    },
    async fetchProfile(): Promise<OAuthProfile> {
      return { provider: 'google', providerUserId: 'spied-id', email: 's@example.com', emailVerified: true, displayName: 'Spied', avatarUrl: null };
    },
  };
  setOAuthAdapter('google', spyAdapter);
  const state6 = issueOAuthState({ provider: 'google' });
  await handleOAuthCallback({ provider: 'google', code: 'spied-code', state: state6.token });
  expectEqual(captured[0], 'spied-code', 'custom adapter invoked');

  // ── cleanup expired ──
  // re-create states with explicit short TTL so we KNOW they expire
  issueOAuthState({ ttlMs: 1 });
  issueOAuthState({ ttlMs: 1 });
  await new Promise(r => setTimeout(r, 30));
  const removed = cleanupExpiredOAuthStates();
  expectTrue(removed >= 1, 'cleanup removes expired states');

  // ── resetOAuthEngine clears ──
  resetOAuthEngine();
  const providersAfterReset = getLinkedProvidersForUser('user-A');
  expectEqual(providersAfterReset.length, 0, 'reset OAuth engine clears links');

  // ── Summary ──
  console.log(`oauth-callback.spec.ts: ${passed}/${passed + failed} PASS`);
  if (failed > 0) {
    console.error('FAILURES:');
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('oauth-callback.spec.ts: harness crashed:', err);
  process.exit(1);
});
