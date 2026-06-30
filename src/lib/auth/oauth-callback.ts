// Auth OAuth Callback Engine — wave 68
// OAuth 2.0 authorization-code callback for Google, GitHub, Apple.
// State token: `<nonce>.<hmac>` where hmac = HMAC-SHA256(secret, nonce)
// Provider profile: upsert pattern keyed by (provider, providerUserId).
//
// Sections:
//  1. Types
//  2. Errors
//  3. Constants
//  4. State token helpers
//  5. Provider adapter interface
//  6. In-memory stores (state nonces, user upsert, OAuth links)
//  7. Public API: validateOAuthState, handleOAuthCallback, linkProvider, unlinkProvider
//  8. Default export audit

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/* ───────────────────────── 1. Types ───────────────────────── */

export type OAuthProvider = 'google' | 'github' | 'apple';

export interface OAuthProfile {
  readonly provider: OAuthProvider;
  readonly providerUserId: string;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
}

export interface OAuthTokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly idToken: string | null;
  readonly expiresInSec: number;
  readonly scope: string;
  readonly tokenType: 'Bearer';
}

export interface OAuthCallbackInput {
  readonly provider: OAuthProvider;
  readonly code: string;
  readonly state: string;
  readonly redirectUri?: string;
  readonly codeVerifier?: string;
}

export interface OAuthCallbackSuccess {
  readonly status: 'linked_existing' | 'created_new';
  readonly provider: OAuthProvider;
  readonly userId: string;
  readonly profile: OAuthProfile;
  readonly tokens: OAuthTokenResponse;
  readonly linkedAt: Date;
}

export interface OAuthLinkRecord {
  readonly userId: string;
  readonly provider: OAuthProvider;
  readonly providerUserId: string;
  readonly linkedAt: Date;
}

export interface OAuthAdapter {
  exchangeCode(
    code: string,
    redirectUri: string | undefined,
    codeVerifier: string | undefined,
  ): Promise<OAuthTokenResponse>;
  fetchProfile(accessToken: string): Promise<OAuthProfile>;
}

/* ───────────────────────── 2. Errors ───────────────────────── */

export class OAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OAuthError';
  }
}

export class OAuthStateError extends OAuthError {
  constructor(message = 'Invalid OAuth state') {
    super(message);
    this.name = 'OAuthStateError';
  }
}

export class OAuthExchangeError extends OAuthError {
  constructor(message = 'OAuth code exchange failed') {
    super(message);
    this.name = 'OAuthExchangeError';
  }
}

export class OAuthProviderError extends OAuthError {
  constructor(message = 'OAuth provider error') {
    super(message);
    this.name = 'OAuthProviderError';
  }
}

export class OAuthLinkError extends OAuthError {
  constructor(message = 'OAuth link conflict') {
    super(message);
    this.name = 'OAuthLinkError';
  }
}

/* ───────────────────────── 3. Constants ───────────────────────── */

export const OAUTH_STATE_TTL_MS = 1000 * 60 * 10; // 10 min
export const OAUTH_NONCE_BYTES = 24;

const HMAC_ALGO = 'sha256';
let _stateSecret = '';
let _stateCounter = 0;

function nextNonce(): string {
  _stateCounter = (_stateCounter + 1) >>> 0;
  return `${Date.now().toString(36)}${_stateCounter.toString(36)}${randomBytes(8).toString('hex')}`;
}

export function setOAuthStateSecret(secret: string): void {
  if (typeof secret !== 'string' || secret.length < 16) {
    throw new OAuthError('OAuth state secret must be at least 16 chars');
  }
  _stateSecret = secret;
}

export function getOAuthStateSecretFingerprint(): string {
  return createHmac(HMAC_ALGO, 'cabala-oauth-fingerprint').update(_stateSecret).digest('base64url').slice(0, 12);
}

export function resetOAuthEngine(): void {
  _stateSecret = '';
  _stateCounter = 0;
  _stateStore.clear();
  _linkIndex.clear();
  _providerLinkIndex.clear();
  _userIndex.clear();
}

/* ───────────────────────── 4. State token helpers ───────────────────────── */

interface StateRecord {
  readonly nonce: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly provider: OAuthProvider | null;
  readonly redirectUri: string | null;
  readonly userId: string | null; // null = not-yet-bound
  singleUse: boolean;
}

const _stateStore = new Map<string, StateRecord>();

export interface IssueOAuthStateOptions {
  readonly provider?: OAuthProvider;
  readonly redirectUri?: string;
  readonly userId?: string;
  readonly ttlMs?: number;
  readonly singleUse?: boolean;
}

export interface OAuthStateToken {
  readonly token: string;
  readonly expiresAt: Date;
  readonly nonce: string;
}

export function issueOAuthState(options: IssueOAuthStateOptions = {}): OAuthStateToken {
  if (_stateSecret.length === 0) {
    throw new OAuthError('OAuth state secret not configured — call setOAuthStateSecret first');
  }
  const nonce = nextNonce();
  const ttlMs = options.ttlMs ?? OAUTH_STATE_TTL_MS;
  const expiresAt = new Date(Date.now() + ttlMs);
  const hmac = createHmac(HMAC_ALGO, _stateSecret).update(nonce).digest('base64url');
  const token = `${nonce}.${hmac}`;
  const record: StateRecord = {
    nonce,
    createdAt: new Date(),
    expiresAt,
    provider: options.provider ?? null,
    redirectUri: options.redirectUri ?? null,
    userId: options.userId ?? null,
    singleUse: options.singleUse ?? true,
  };
  _stateStore.set(token, record);
  return { token, expiresAt, nonce };
}

export function validateOAuthState(token: string): {
  valid: true;
  record: StateRecord;
} | {
  valid: false;
  reason: 'malformed' | 'expired' | 'not_found' | 'hmac_mismatch' | 'already_used';
} {
  if (typeof token !== 'string' || token.split('.').length !== 2) {
    return { valid: false, reason: 'malformed' };
  }
  const [nonce, hmac] = token.split('.');
  if (!nonce || !hmac) return { valid: false, reason: 'malformed' };
  const expected = createHmac(HMAC_ALGO, _stateSecret).update(nonce).digest('base64url');
  const ab = Buffer.from(expected);
  const bb = Buffer.from(hmac);
  if (ab.length !== bb.length || !timingSafeEqual(ab, bb)) {
    return { valid: false, reason: 'hmac_mismatch' };
  }
  const record = _stateStore.get(token);
  if (!record) return { valid: false, reason: 'not_found' };
  if (record.expiresAt.getTime() <= Date.now()) return { valid: false, reason: 'expired' };
  if (record.singleUse && record.nonce !== nonce) {
    return { valid: false, reason: 'already_used' };
  }
  return { valid: true, record };
}

function consumeState(token: string): StateRecord {
  const v = validateOAuthState(token);
  if (!v.valid) {
    throw new OAuthStateError(`State invalid: ${v.reason}`);
  }
  _stateStore.delete(token);
  return v.record;
}

export function _peekOAuthState(token: string): StateRecord | null {
  return _stateStore.get(token) ?? null;
}

export function _oauthStateStoreSize(): number {
  return _stateStore.size;
}

export function cleanupExpiredOAuthStates(now: number = Date.now()): number {
  let removed = 0;
  for (const [k, r] of _stateStore) {
    if (r.expiresAt.getTime() <= now) {
      _stateStore.delete(k);
      removed += 1;
    }
  }
  return removed;
}

/* ───────────────────────── 5. Provider adapters (deterministic test double) ───────────────────────── */

const _adapters: Record<OAuthProvider, OAuthAdapter> = {
  google: makeFakeAdapter('google'),
  github: makeFakeAdapter('github'),
  apple: makeFakeAdapter('apple'),
};

function makeFakeAdapter(provider: OAuthProvider): OAuthAdapter {
  return {
    async exchangeCode(code, redirectUri, codeVerifier): Promise<OAuthTokenResponse> {
      // Deterministic derivation so tests are reproducible.
      const seed = createHmac(HMAC_ALGO, 'cabala-oauth-tokens').update(`${provider}:${code}:${redirectUri ?? ''}:${codeVerifier ?? ''}`).digest('base64url');
      return {
        accessToken: `at_${seed.slice(0, 24)}`,
        refreshToken: `rt_${seed.slice(24, 48)}`,
        idToken: `idt_${seed.slice(0, 32)}`,
        expiresInSec: 3600,
        scope: 'email profile',
        tokenType: 'Bearer',
      };
    },
    async fetchProfile(accessToken): Promise<OAuthProfile> {
      const digest = createHmac(HMAC_ALGO, 'cabala-oauth-profile').update(`${provider}:${accessToken}`).digest('hex');
      return {
        provider,
        providerUserId: digest.slice(0, 16),
        email: `${provider}.${digest.slice(0, 6)}@example.com`,
        emailVerified: true,
        displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User ${digest.slice(0, 4)}`,
        avatarUrl: `https://avatars.example.com/${provider}/${digest.slice(0, 8)}.png`,
      };
    },
  };
}

export function setOAuthAdapter(provider: OAuthProvider, adapter: OAuthAdapter): void {
  if (!adapter) throw new OAuthError('Adapter cannot be null');
  _adapters[provider] = adapter;
}

export function getOAuthAdapter(provider: OAuthProvider): OAuthAdapter {
  return _adapters[provider];
}

export function resetOAuthAdapters(): void {
  _adapters.google = makeFakeAdapter('google');
  _adapters.github = makeFakeAdapter('github');
  _adapters.apple = makeFakeAdapter('apple');
}

/* ───────────────────────── 6. Link / user upsert indexes ───────────────────────── */

const _linkIndex = new Map<string, OAuthLinkRecord>(); // key = `${provider}:${providerUserId}`
const _providerLinkIndex = new Map<OAuthProvider, Set<string>>();
const _userIndex = new Map<string, ReadonlyMap<OAuthProvider, OAuthLinkRecord>>();

function linkKey(provider: OAuthProvider, providerUserId: string): string {
  return `${provider}:${providerUserId}`;
}

export async function handleOAuthCallback(input: OAuthCallbackInput): Promise<OAuthCallbackSuccess> {
  const { provider, code, state } = input;
  if (!provider || !code || !state) {
    throw new OAuthStateError('Missing provider, code, or state');
  }
  const stateRecord = consumeState(state);
  if (stateRecord.provider !== null && stateRecord.provider !== provider) {
    throw new OAuthStateError(`State issued for ${stateRecord.provider}, got ${provider}`);
  }
  let adapter: OAuthAdapter;
  try {
    adapter = _adapters[provider];
  } catch {
    throw new OAuthProviderError(`No adapter registered for provider: ${provider}`);
  }
  let tokens: OAuthTokenResponse;
  try {
    tokens = await adapter.exchangeCode(code, input.redirectUri, input.codeVerifier);
  } catch (err) {
    throw new OAuthExchangeError(err instanceof Error ? err.message : 'code exchange failed');
  }
  const profile = await adapter.fetchProfile(tokens.accessToken);
  const key = linkKey(provider, profile.providerUserId);
  const existing = _linkIndex.get(key);
  const linkedAt = new Date();
  if (existing) {
    return { status: 'linked_existing', provider, userId: existing.userId, profile, tokens, linkedAt: existing.linkedAt };
  }
  // New user link: derive userId deterministically from providerUserId (or pre-bound via state)
  const userId = stateRecord.userId ?? `usr_${profile.providerUserId}`;
  const link: OAuthLinkRecord = { userId, provider, providerUserId: profile.providerUserId, linkedAt };
  _linkIndex.set(key, link);
  const providerSet = _providerLinkIndex.get(provider) ?? new Set<string>();
  providerSet.add(key);
  _providerLinkIndex.set(provider, providerSet);
  const userMap = new Map(_userIndex.get(userId) ?? []);
  userMap.set(provider, link);
  _userIndex.set(userId, userMap);
  return { status: 'created_new', provider, userId, profile, tokens, linkedAt };
}

export function linkProvider(
  userId: string,
  provider: OAuthProvider,
  providerUserId: string,
): OAuthLinkRecord {
  if (!userId || !provider || !providerUserId) {
    throw new OAuthLinkError('userId, provider, providerUserId must be non-empty');
  }
  const key = linkKey(provider, providerUserId);
  const prior = _linkIndex.get(key);
  if (prior && prior.userId !== userId) {
    throw new OAuthLinkError(`Provider ${provider} account already linked to userId ${prior.userId}`);
  }
  const link: OAuthLinkRecord = { userId, provider, providerUserId, linkedAt: new Date() };
  _linkIndex.set(key, link);
  const providerSet = _providerLinkIndex.get(provider) ?? new Set<string>();
  providerSet.add(key);
  _providerLinkIndex.set(provider, providerSet);
  const userMap = new Map(_userIndex.get(userId) ?? []);
  userMap.set(provider, link);
  _userIndex.set(userId, userMap);
  return link;
}

export function unlinkProvider(userId: string, provider: OAuthProvider): boolean {
  if (!userId || !provider) throw new OAuthLinkError('userId and provider must be non-empty');
  const userMap = _userIndex.get(userId);
  if (!userMap) return false;
  const link = userMap.get(provider);
  if (!link) return false;
  const key = linkKey(provider, link.providerUserId);
  _linkIndex.delete(key);
  _providerLinkIndex.get(provider)?.delete(key);
  const newMap = new Map(userMap);
  newMap.delete(provider);
  if (newMap.size === 0) {
    _userIndex.delete(userId);
  } else {
    _userIndex.set(userId, newMap);
  }
  return true;
}

export function getOAuthLink(provider: OAuthProvider, providerUserId: string): OAuthLinkRecord | null {
  return _linkIndex.get(linkKey(provider, providerUserId)) ?? null;
}

export function getLinkedProvidersForUser(userId: string): ReadonlyArray<OAuthProvider> {
  const map = _userIndex.get(userId);
  if (!map) return [];
  return Array.from(map.keys());
}

/* ───────────────────────── 7. Default export audit ───────────────────────── */

export const __ALL_EXPORTS = {
  types: ['OAuthProvider', 'OAuthProfile', 'OAuthTokenResponse', 'OAuthCallbackInput', 'OAuthCallbackSuccess', 'OAuthLinkRecord', 'OAuthAdapter', 'OAuthStateToken', 'IssueOAuthStateOptions'],
  functions: [
    'setOAuthStateSecret', 'getOAuthStateSecretFingerprint', 'resetOAuthEngine',
    'issueOAuthState', 'validateOAuthState', 'cleanupExpiredOAuthStates', '_peekOAuthState', '_oauthStateStoreSize',
    'setOAuthAdapter', 'getOAuthAdapter', 'resetOAuthAdapters',
    'handleOAuthCallback', 'linkProvider', 'unlinkProvider', 'getOAuthLink', 'getLinkedProvidersForUser',
  ],
  constants: ['OAUTH_STATE_TTL_MS', 'OAUTH_NONCE_BYTES'],
  errors: ['OAuthError', 'OAuthStateError', 'OAuthExchangeError', 'OAuthProviderError', 'OAuthLinkError'],
} as const;
