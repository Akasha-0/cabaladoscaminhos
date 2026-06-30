// ============================================================================
// DM PRESENCE — Heartbeat, staleness check, pub/sub subscription
// ============================================================================
// Rastreia presença online/away/dnd/offline com expiração de 5min sem heartbeat.
// ============================================================================
// CONTRATO PÚBLICO:
//   updatePresence(userId, status)
//   getUserPresence(userId)
//   getBulkPresence(userIds[])
//   subscribePresence(userId, callback) -> unsubscribe()
//   goAway(userId) / goDnd(userId) / goOnline(userId) / goOffline(userId)
//   pruneStalePresence()  // dev/test
// ============================================================================

import type { UserId } from './dm-shared.ts';

// ============================================================================
// CONSTANTES / TIPOS
// ============================================================================

export const PRESENCE_STATUSES = ['online', 'away', 'dnd', 'offline'] as const;
export type PresenceStatus = (typeof PRESENCE_STATUSES)[number];

const STALENESS_MS = 5 * 60 * 1000; // 5 minutos
const TTL_MS = 6 * 60 * 1000;        // 6 min: slack para prune
const AWAY_AUTO_MS = 10 * 60 * 1000; // 10 min sem heartbeat = auto-away

export interface PresenceRecord {
  userId: UserId;
  status: PresenceStatus;
  lastSeenAt: Date;
  expiresAt: Date;
}

export type PresenceCallback = (rec: PresenceRecord) => void;

// ============================================================================
// ERROS
// ============================================================================

export class DMPresenceError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DMPresenceError';
    this.code = code;
  }
}

export class InvalidStatusError extends DMPresenceError {
  constructor(s: string) {
    super('INVALID_STATUS', `Status inválido: ${s}`);
    this.name = 'InvalidStatusError';
  }
}

// ============================================================================
// STORES — presence + subscribers
// ============================================================================

let _presence: Map<UserId, PresenceRecord> | null = null;
function presenceStore(): Map<UserId, PresenceRecord> {
  if (!_presence) _presence = new Map();
  return _presence;
}

let _subscribers: Map<UserId, Set<PresenceCallback>> | null = null;
function subscriberStore(): Map<UserId, Set<PresenceCallback>> {
  if (!_subscribers) _subscribers = new Map();
  return _subscribers;
}

let _pruneTimer: ReturnType<typeof setInterval> | null = null;
function ensurePruneLoop(): void {
  if (_pruneTimer !== null) return;
  if (typeof setInterval === 'undefined') return; // SSR/edge guard
  _pruneTimer = setInterval(() => {
    pruneStalePresence();
  }, 60 * 1000);
  // não bloqueia processo
  if (typeof _pruneTimer === 'object' && _pruneTimer !== null && 'unref' in _pruneTimer) {
    (_pruneTimer as { unref: () => void }).unref();
  }
}

// ============================================================================
// HELPERS — validação + auto-estado
// ============================================================================

function isValidStatus(s: string): s is PresenceStatus {
  return (PRESENCE_STATUSES as readonly string[]).includes(s);
}

function deriveRecord(userId: UserId, status: PresenceStatus): PresenceRecord {
  const now = Date.now();
  return {
    userId,
    status,
    lastSeenAt: new Date(now),
    expiresAt: new Date(now + TTL_MS),
  };
}

function notifyChange(rec: PresenceRecord): void {
  const subs = subscriberStore().get(rec.userId);
  if (!subs || subs.size === 0) return;
  for (const cb of subs) {
    try {
      cb(rec);
    } catch {
      // callback crash não derruba o publisher
    }
  }
}

// ============================================================================
// updatePresence — heartbeat; muda status se permitido
// ============================================================================

export function updatePresence(userId: UserId, status: PresenceStatus): PresenceRecord {
  if (!isValidStatus(status)) throw new InvalidStatusError(status);
  const rec = deriveRecord(userId, status);
  presenceStore().set(userId, rec);
  ensurePruneLoop();
  notifyChange(rec);
  return rec;
}

// ============================================================================
// Helpers convenientes
// ============================================================================

export function goOnline(userId: UserId): PresenceRecord {
  return updatePresence(userId, 'online');
}
export function goAway(userId: UserId): PresenceRecord {
  return updatePresence(userId, 'away');
}
export function goDnd(userId: UserId): PresenceRecord {
  return updatePresence(userId, 'dnd');
}
export function goOffline(userId: UserId): PresenceRecord {
  return updatePresence(userId, 'offline');
  // remove imediatamente
}

// ============================================================================
// getUserPresence — com staleness check
// ============================================================================

export interface PresenceView {
  userId: UserId;
  status: PresenceStatus;
  lastSeenAt: Date;
  expired: boolean;
  away: boolean;
}

export function getUserPresence(userId: UserId): PresenceView {
  const rec = presenceStore().get(userId);
  if (!rec) {
    return {
      userId,
      status: 'offline',
      lastSeenAt: new Date(0),
      expired: true,
      away: false,
    };
  }
  const now = Date.now();
  const expired = rec.expiresAt.getTime() <= now;
  const autoAway = !expired &&
    rec.status === 'online' &&
    now - rec.lastSeenAt.getTime() > AWAY_AUTO_MS;

  if (expired || autoAway) {
    const newStatus: PresenceStatus = expired ? 'offline' : 'away';
    if (autoAway) {
      // auto-away atualiza silenciosamente
      const updated: PresenceRecord = {
        ...rec,
        status: 'away',
        lastSeenAt: new Date(now),
      };
      presenceStore().set(userId, updated);
    }
    return {
      userId,
      status: newStatus,
      lastSeenAt: autoAway ? rec.lastSeenAt : rec.lastSeenAt,
      expired,
      away: newStatus === 'away',
    };
  }
  return {
    userId,
    status: rec.status,
    lastSeenAt: rec.lastSeenAt,
    expired: false,
    away: rec.status === 'away',
  };
}

// ============================================================================
// getBulkPresence — batch lookup
// ============================================================================

export function getBulkPresence(userIds: UserId[]): PresenceView[] {
  return userIds.map((u) => getUserPresence(u));
}

// ============================================================================
// subscribePresence — pub/sub
// ============================================================================

export function subscribePresence(
  userId: UserId,
  callback: PresenceCallback
): () => void {
  const subs = subscriberStore();
  let set = subs.get(userId);
  if (!set) {
    set = new Set<PresenceCallback>();
    subs.set(userId, set);
  }
  set.add(callback);
  ensurePruneLoop();

  // Emite estado atual imediatamente
  const rec = presenceStore().get(userId);
  if (rec) {
    try {
      callback(rec);
    } catch {
      // ignora erros
    }
  }

  return () => {
    const s = subs.get(userId);
    if (s) s.delete(callback);
  };
}

export function hasSubscribers(userId: UserId): boolean {
  const set = subscriberStore().get(userId);
  return !!set && set.size > 0;
}

export function subscriberCount(userId: UserId): number {
  return subscriberStore().get(userId)?.size ?? 0;
}

// ============================================================================
// pruneStalePresence — remove records expirados
// ============================================================================

export interface PruneResult {
  pruned: UserId[];
  count: number;
}

export function pruneStalePresence(): PruneResult {
  const now = Date.now();
  const pruned: UserId[] = [];
  for (const [uid, rec] of presenceStore().entries()) {
    if (rec.expiresAt.getTime() <= now) {
      presenceStore().delete(uid);
      pruned.push(uid);
    }
  }
  return { pruned, count: pruned.length };
}

// ============================================================================
// __ALL_EXPORTS
// ============================================================================

export const DM_PRESENCE_EXPORTS = {
  functions: [
    'updatePresence',
    'getUserPresence',
    'getBulkPresence',
    'subscribePresence',
    'goOnline',
    'goAway',
    'goDnd',
    'goOffline',
    'pruneStalePresence',
    'hasSubscribers',
    'subscriberCount',
    '__resetPresenceStoreForTests',
  ],
  types: ['PresenceStatus', 'PresenceRecord', 'PresenceView', 'PresenceCallback', 'PruneResult'],
  errors: ['DMPresenceError', 'InvalidStatusError'],
  constants: ['PRESENCE_STATUSES', 'STALENESS_MS', 'TTL_MS', 'AWAY_AUTO_MS'],
  stores: ['_presence', '_subscribers', '_pruneTimer'],
} as const;

// ============================================================================
// RESET — para testes (NÃO chamar em produção)
// ============================================================================

export function __resetPresenceStoreForTests(): void {
  presenceStore().clear();
  subscriberStore().clear();
}