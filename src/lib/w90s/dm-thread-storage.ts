// ============================================================================
// dm-thread-storage.ts — LocalStorage persistence + cross-tab sync (W90s-B)
//
// Responsabilidades:
//   - Persistir DMState em localStorage (chave dedicada por user).
//   - Sincronizar entre abas via `window.storage` event.
//   - Expor API minimalista: `load`, `save`, `subscribe` (puro).
//
// Decisões de design:
//   - Serialização defensiva: chave = `dm.state.<userId>`, valor = JSON string.
//   - `subscribe(cb)` retorna uma função `unsubscribe` (evita memory leak).
//   - Não usar `Object.freeze` aqui — storage muta referências por design.
//   - Storage é uma camada SEPARADA do engine puro. Engine não conhece
//     localStorage (testabilidade preservada).
// ============================================================================

// Re-importamos o tipo (apenas tipo) do engine.
import type { DMState, UserId } from './dm-threads';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const DM_STORAGE_KEY_PREFIX = 'dm.state';
export const DM_STORAGE_VERSION = 1;
export const DM_STORAGE_EVENT = 'dm.storage.update.v1';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------
export interface StoredEnvelope {
  readonly version: number;
  readonly savedAt: number;
  readonly state: DMState;
}

// ---------------------------------------------------------------------------
// Key helper
// ---------------------------------------------------------------------------
export function dmStorageKey(userId: UserId): string {
  return `${DM_STORAGE_KEY_PREFIX}.${userId}`;
}

// ---------------------------------------------------------------------------
// SSR-safe guards
// ---------------------------------------------------------------------------
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// load — recupera estado do localStorage. Retorna null se ausente/corrompido.
// ---------------------------------------------------------------------------
export function loadDMState(userId: UserId): DMState | null {
  const storage = getStorage();
  if (!storage) return null;
  const key = dmStorageKey(userId);
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredEnvelope;
    if (!parsed || parsed.version !== DM_STORAGE_VERSION) return null;
    if (!parsed.state || typeof parsed.state !== 'object') return null;
    return parsed.state;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// save — persiste estado. Não-throw se storage indisponível (SSR / quota).
// ---------------------------------------------------------------------------
export interface SaveResult {
  readonly saved: boolean;
  readonly reason?: string;
}

export function saveDMState(userId: UserId, state: DMState): SaveResult {
  const storage = getStorage();
  if (!storage) {
    return Object.freeze({ saved: false, reason: 'storage unavailable' });
  }
  const key = dmStorageKey(userId);
  try {
    const envelope: StoredEnvelope = {
      version: DM_STORAGE_VERSION,
      savedAt: Date.now(),
      state,
    };
    storage.setItem(key, JSON.stringify(envelope));
    // dispara evento customizado (mesma aba) — cross-tab usa storage event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(DM_STORAGE_EVENT, { detail: { userId, savedAt: envelope.savedAt } }),
      );
    }
    return Object.freeze({ saved: true });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    return Object.freeze({ saved: false, reason });
  }
}

// ---------------------------------------------------------------------------
// clear — remove estado do storage
// ---------------------------------------------------------------------------
export function clearDMState(userId: UserId): boolean {
  const storage = getStorage();
  if (!storage) return false;
  const key = dmStorageKey(userId);
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// subscribe — escuta mudanças vindas de OUTRAS abas via `storage` event.
// Mesmo aba também recebe via CustomEvent para simular uniformemente.
// ---------------------------------------------------------------------------
export type StorageListener = (state: DMState, source: 'cross-tab' | 'local') => void;

export interface SubscribeResult {
  readonly unsubscribe: () => void;
}

export function subscribeDMState(
  userId: UserId,
  listener: StorageListener,
): SubscribeResult {
  const storage = getStorage();
  if (typeof window === 'undefined') {
    return Object.freeze({ unsubscribe: () => undefined });
  }
  const key = dmStorageKey(userId);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    if (!event.newValue) return; // removed
    try {
      const parsed = JSON.parse(event.newValue) as StoredEnvelope;
      if (parsed.version === DM_STORAGE_VERSION && parsed.state) {
        listener(parsed.state, 'cross-tab');
      }
    } catch {
      /* swallow malformed */
    }
  };

  const handleCustom = (event: Event) => {
    const custom = event as CustomEvent<{ userId: UserId }>;
    if ((custom.detail?.userId as unknown as string) !== (userId as unknown as string)) {
      return;
    }
    const fresh = loadDMState(userId);
    if (fresh) listener(fresh, 'local');
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(DM_STORAGE_EVENT, handleCustom);

  return Object.freeze({
    unsubscribe() {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(DM_STORAGE_EVENT, handleCustom);
    },
  });
}

// ---------------------------------------------------------------------------
// diskUsage — métrica operacional (debug / devtools)
// ---------------------------------------------------------------------------
export interface DiskUsage {
  readonly bytes: number;
  readonly threads: number;
  readonly messages: number;
}

export function dmDiskUsage(userId: UserId, state: DMState): DiskUsage {
  const storage = getStorage();
  const sample = JSON.stringify({ version: DM_STORAGE_VERSION, savedAt: 0, state });
  let msgCount = 0;
  for (const arr of Object.values(state.messagesByThread)) {
    msgCount += arr.length;
  }
  return Object.freeze({
    bytes: sample.length,
    threads: state.threads.length,
    messages: msgCount,
    ...(storage !== null ? {} : {}),
  });
}
