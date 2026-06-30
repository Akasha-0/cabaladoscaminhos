// ============================================================================
// DM TYPING — Indicador "está digitando" com TTL de 5 segundos
// ============================================================================
// Auto-cleanup em memória; pub/sub opcional.
// ============================================================================
// CONTRATO PÚBLICO:
//   setTyping(conversationId, userId)
//   clearTyping(conversationId, userId)
//   getTypingUsers(conversationId)
//   getAllTyping()   // admin/debug
//   pruneTyping()    // dev/test
//   subscribeTyping(callback) -> unsubscribe()  // pub/sub por conversa
// ============================================================================

import type { ConversationId, UserId } from './dm-shared.ts';

// ============================================================================
// CONSTANTES / TIPOS
// ============================================================================

export const TYPING_TTL_MS = 5 * 1000; // 5s
const SWEEP_INTERVAL_MS = 1000; // 1s loop

export interface TypingIndicator {
  conversationId: ConversationId;
  userId: UserId;
  startedAt: Date;
  expiresAt: Date;
}

export type TypingCallback = (rec: TypingIndicator) => void;

// ============================================================================
// ERROS
// ============================================================================

export class DMTypingError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DMTypingError';
    this.code = code;
  }
}

// ============================================================================
// STORES
// ============================================================================

// composite key: convId|userId
let _typingStore: Map<string, TypingIndicator> | null = null;
function store(): Map<string, TypingIndicator> {
  if (!_typingStore) _typingStore = new Map();
  return _typingStore;
}

function compositeKey(convId: ConversationId, userId: UserId): string {
  return `${convId}|${userId}`;
}

// subscribers por conversa
let _subs: Map<ConversationId, Set<TypingCallback>> | null = null;
function subStore(): Map<ConversationId, Set<TypingCallback>> {
  if (!_subs) _subs = new Map();
  return _subs;
}

let _sweepTimer: ReturnType<typeof setInterval> | null = null;
function ensureSweep(): void {
  if (_sweepTimer !== null) return;
  if (typeof setInterval === 'undefined') return;
  _sweepTimer = setInterval(() => {
    pruneTyping();
  }, SWEEP_INTERVAL_MS);
  if (typeof _sweepTimer === 'object' && _sweepTimer !== null && 'unref' in _sweepTimer) {
    (_sweepTimer as { unref: () => void }).unref();
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function notifyTyping(rec: TypingIndicator, kind: 'set' | 'clear'): void {
  const subs = subStore().get(rec.conversationId);
  if (!subs || subs.size === 0) return;
  for (const cb of subs) {
    try {
      cb({ ...rec, _kind: kind } as TypingIndicator & { _kind: string });
    } catch {
      // nunca propaga erro de subscriber
    }
  }
}

// ============================================================================
// setTyping — cria ou renova o indicador (5s TTL)
// ============================================================================

export function setTyping(
  conversationId: ConversationId,
  userId: UserId
): TypingIndicator {
  const now = new Date();
  const rec: TypingIndicator = {
    conversationId,
    userId,
    startedAt: now,
    expiresAt: new Date(now.getTime() + TYPING_TTL_MS),
  };
  store().set(compositeKey(conversationId, userId), rec);
  ensureSweep();
  notifyTyping(rec, 'set');
  return rec;
}

// ============================================================================
// clearTyping — explícito
// ============================================================================

export function clearTyping(
  conversationId: ConversationId,
  userId: UserId
): boolean {
  const key = compositeKey(conversationId, userId);
  const existing = store().get(key);
  const removed = store().delete(key);
  if (existing && removed) {
    notifyTyping(existing, 'clear');
  }
  return removed;
}

// ============================================================================
// getTypingUsers — list ativos para uma conversa
// ============================================================================

export function getTypingUsers(
  conversationId: ConversationId
): TypingIndicator[] {
  const out: TypingIndicator[] = [];
  const now = Date.now();
  for (const rec of store().values()) {
    if (rec.conversationId !== conversationId) continue;
    if (rec.expiresAt.getTime() <= now) continue;
    out.push(rec);
  }
  // ordenar por startedAt asc
  out.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  return out;
}

export function isTyping(
  conversationId: ConversationId,
  userId: UserId
): boolean {
  const rec = store().get(compositeKey(conversationId, userId));
  if (!rec) return false;
  return rec.expiresAt.getTime() > Date.now();
}

// ============================================================================
// getAllTyping — debug/admin
// ============================================================================

export function getAllTyping(): TypingIndicator[] {
  const out: TypingIndicator[] = [];
  for (const rec of store().values()) {
    if (rec.expiresAt.getTime() > Date.now()) out.push(rec);
  }
  return out;
}

// ============================================================================
// pruneTyping — remove expirados
// ============================================================================

export interface TypingPruneResult {
  pruned: number;
  keys: string[];
}

export function pruneTyping(): TypingPruneResult {
  const now = Date.now();
  const prunedKeys: string[] = [];
  for (const [key, rec] of store().entries()) {
    if (rec.expiresAt.getTime() <= now) {
      store().delete(key);
      prunedKeys.push(key);
      notifyTyping(rec, 'clear');
    }
  }
  return { pruned: prunedKeys.length, keys: prunedKeys };
}

// ============================================================================
// subscribeTyping — pub/sub por conversa
// ============================================================================

export function subscribeTyping(
  conversationId: ConversationId,
  callback: TypingCallback
): () => void {
  const subs = subStore();
  let set = subs.get(conversationId);
  if (!set) {
    set = new Set<TypingCallback>();
    subs.set(conversationId, set);
  }
  set.add(callback);
  ensureSweep();

  // emite estado atual
  const current = getTypingUsers(conversationId);
  for (const c of current) {
    try {
      callback(c);
    } catch {
      // ignora
    }
  }

  return () => {
    const s = subs.get(conversationId);
    if (s) s.delete(callback);
  };
}

export function typingSubscriberCount(conversationId: ConversationId): number {
  return subStore().get(conversationId)?.size ?? 0;
}

// ============================================================================
// __ALL_EXPORTS
// ============================================================================

export const DM_TYPING_EXPORTS = {
  functions: [
    'setTyping',
    'clearTyping',
    'getTypingUsers',
    'isTyping',
    'getAllTyping',
    'pruneTyping',
    'subscribeTyping',
    'typingSubscriberCount',
    '__resetTypingStoreForTests',
  ],
  types: ['TypingIndicator', 'TypingCallback', 'TypingPruneResult'],
  errors: ['DMTypingError'],
  constants: ['TYPING_TTL_MS', 'SWEEP_INTERVAL_MS'],
  stores: ['_typingStore', '_subs', '_sweepTimer'],
} as const;

// ============================================================================
// RESET — para testes (NÃO chamar em produção)
// ============================================================================

export function __resetTypingStoreForTests(): void {
  store().clear();
  subStore().clear();
}