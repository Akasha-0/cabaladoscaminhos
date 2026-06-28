// ============================================================================
// SYNC QUEUE — IndexedDB-backed offline mutations queue
// ============================================================================
// Wave 20 — PWA Evolution
//
// Why: Permite que o usuário curta/comente/poste mesmo offline. Mutations são
//      serializadas em IndexedDB e reproduzidas quando a conexão volta.
//
// Schema (DB: 'akasha-pwa', Store: 'sync-queue'):
//   {
//     id: number (auto-increment),
//     url: string,
//     method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
//     body: any,                    // serializável
//     headers: Record<string,string>,
//     createdAt: number,
//     retries: number,
//     lastError?: string,
//     // Tipos semânticos para UI:
//     intent: 'like' | 'comment' | 'post' | 'bookmark' | 'follow',
//     summary: string,              // "Curtir post de @maria"
//   }
//
// Compatibilidade:
//   - IndexedDB ✅ em todos browsers modernos (Next.js client-only)
//   - Background Sync API: Chrome/Edge ✅, Firefox ⚠️, Safari ❌
//   - Fallback: detecta 'online' event e faz flush
// ============================================================================

const DB_NAME = 'akasha-pwa';
const DB_VERSION = 1;
const STORE = 'sync-queue';

export type SyncIntent = 'like' | 'comment' | 'post' | 'bookmark' | 'follow';

export interface QueuedMutation {
  id?: number;
  url: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  createdAt: number;
  retries: number;
  lastError?: string;
  intent: SyncIntent;
  summary: string;
}

export interface SyncResult {
  synced: number;
  failed: number;
  failures: QueuedMutation[];
}

// ============================================================================
// DB CONNECTION — lazy + cached
// ============================================================================

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not available'));
  }
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        // Index por intent (para UI mostrar "X pendentes por tipo")
        store.createIndex('intent', 'intent', { unique: false });
        // Index por createdAt (para ordenação FIFO)
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () =>
      reject(new Error('IndexedDB blocked — close other tabs'));
  });
  return dbPromise;
}

async function txStore(
  mode: IDBTransactionMode
): Promise<IDBObjectStore> {
  const db = await openDB();
  return db.transaction(STORE, mode).objectStore(STORE);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/** Enfileira uma mutation para ser reproduzida quando voltar online. */
export async function enqueueMutation(
  mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'retries'>
): Promise<number> {
  const store = await txStore('readwrite');
  return new Promise((resolve, reject) => {
    const record: QueuedMutation = {
      ...mutation,
      createdAt: Date.now(),
      retries: 0,
    };
    const req = store.add(record);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

/** Lista todas as mutations pendentes (FIFO). */
export async function listPending(): Promise<QueuedMutation[]> {
  const store = await txStore('readonly');
  return new Promise((resolve, reject) => {
    const req = store.index('createdAt').getAll();
    req.onsuccess = () => resolve((req.result as QueuedMutation[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

/** Conta pendentes (rápido — só count, não puxa payload). */
export async function countPending(): Promise<number> {
  const store = await txStore('readonly');
  return new Promise((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result ?? 0);
    req.onerror = () => reject(req.error);
  });
}

/** Lista agrupada por intent (para UI tipo "3 likes pendentes"). */
export async function pendingByIntent(): Promise<Record<SyncIntent, number>> {
  const all = await listPending();
  const out: Record<string, number> = {};
  for (const m of all) {
    out[m.intent] = (out[m.intent] ?? 0) + 1;
  }
  return out as Record<SyncIntent, number>;
}

/** Remove uma mutation após sucesso. */
async function removeMutation(id: number): Promise<void> {
  const store = await txStore('readwrite');
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Marca falha e incrementa retry. */
async function markFailure(id: number, err: string): Promise<void> {
  const store = await txStore('readwrite');
  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const m = getReq.result as QueuedMutation | undefined;
      if (!m) return resolve();
      m.retries += 1;
      m.lastError = err;
      const putReq = store.put(m);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// ============================================================================
// FLUSH — reproduz queue com a rede
// ============================================================================

/**
 * Processa a queue inteira em ordem FIFO.
 *
 * @param maxRetries Limite de retries por item antes de descartar (default 3)
 * @returns SyncResult com synced/failed/failures
 */
export async function flushQueue(
  maxRetries = 3,
  signal?: AbortSignal
): Promise<SyncResult> {
  const pending = await listPending();
  const result: SyncResult = { synced: 0, failed: 0, failures: [] };

  for (const m of pending) {
    if (signal?.aborted) break;
    if (typeof m.id !== 'number') continue;

    // Descarta se excedeu retries
    if (m.retries >= maxRetries) {
      await removeMutation(m.id);
      result.failed += 1;
      result.failures.push(m);
      console.warn(`[sync-queue] Dropped after ${m.retries} retries: ${m.summary}`);
      continue;
    }

    try {
      const res = await fetch(m.url, {
        method: m.method,
        headers: {
          'Content-Type': 'application/json',
          ...(m.headers ?? {}),
        },
        body: m.body !== undefined ? JSON.stringify(m.body) : undefined,
        signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      await removeMutation(m.id);
      result.synced += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await markFailure(m.id, msg);
      result.failed += 1;
      result.failures.push({ ...m, lastError: msg });
      console.warn(`[sync-queue] Failed: ${m.summary} — ${msg}`);
    }
  }

  return result;
}

// ============================================================================
// SW INTEGRATION
// ============================================================================

/**
 * Tenta registrar Background Sync com o SW. Se a API não existir (Safari/Firefox
 * antigo), retorna false e o caller deve usar o fallback do event 'online'.
 */
export async function registerBackgroundSync(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    // Type assertion: SyncManager ainda não está nos types default
    const sync = (reg as ServiceWorkerRegistration & {
      sync?: { register: (tag: string) => Promise<void> };
    }).sync;
    if (!sync) return false;
    await sync.register('sync-mutations');
    return true;
  } catch (err) {
    console.warn('[sync-queue] Background Sync registration failed:', err);
    return false;
  }
}

// ============================================================================
// HELPERS — construtor de mutations
// ============================================================================

export const mutations = {
  like(postId: string, liked: boolean) {
    return enqueueMutation({
      url: `/api/feed/${postId}/like`,
      method: 'POST',
      body: { liked },
      intent: 'like',
      summary: liked ? `Curtir post ${postId}` : `Descurtir post ${postId}`,
    });
  },
  comment(postId: string, content: string, parentId?: string | null) {
    return enqueueMutation({
      url: `/api/feed/${postId}/comments`,
      method: 'POST',
      body: { content, parentId: parentId ?? null },
      intent: 'comment',
      summary: `Comentar em ${postId}`,
    });
  },
  post(payload: {
    content: string;
    tradition?: string;
    topic?: string;
    groupSlug?: string;
  }) {
    return enqueueMutation({
      url: '/api/posts',
      method: 'POST',
      body: payload,
      intent: 'post',
      summary: `Post: "${payload.content.slice(0, 40)}..."`,
    });
  },
  bookmark(postId: string, collection = 'default') {
    return enqueueMutation({
      url: `/api/feed/${postId}/bookmark`,
      method: 'POST',
      body: { collection },
      intent: 'bookmark',
      summary: `Salvar ${postId} em ${collection}`,
    });
  },
  follow(userId: string, follow: boolean) {
    return enqueueMutation({
      url: `/api/users/${userId}/follow`,
      method: 'POST',
      body: { follow },
      intent: 'follow',
      summary: follow ? `Seguir ${userId}` : `Deixar de seguir ${userId}`,
    });
  },
};
