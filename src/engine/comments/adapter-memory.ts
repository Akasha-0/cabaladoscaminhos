/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — IN-MEMORY COMMENTS ADAPTER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Process-local adapter backed by a Map<CommentId, Comment>. Used by the
 * factory's default wiring (and by the demo page during local dev).
 *
 * Seed data (canonical, used by smoke-comments.mjs + factory.spec.ts):
 *   - 6 comments across 2 threads (T1 has 4 = root + 3 replies; T2 has 2)
 *   - 5 known handles: @ana, @bia, @carla, @dora, @ester
 *
 * Cycle 86 lesson: adapter functions are async even for in-memory — keeps
 * the contract forward-compatible with a future Prisma/Supabase adapter.
 */

import {
  asPostId,
  asUserId,
  type Comment,
  type CommentId,
  type CommentsAdapter,
  type PostId,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Canonical known handles (case-normalized lowercase, no leading @)
// ────────────────────────────────────────────────────────────────────────────

export const KNOWN_HANDLES: ReadonlyArray<string> = Object.freeze([
  'ana',
  'bia',
  'carla',
  'dora',
  'ester',
]);

export function getKnownHandlesSet(): ReadonlySet<string> {
  return new Set<string>(KNOWN_HANDLES);
}

// ────────────────────────────────────────────────────────────────────────────
// Sample thread data
// ────────────────────────────────────────────────────────────────────────────

const POST_T1 = asPostId('p_sample_thread_1');
const POST_T2 = asPostId('p_sample_thread_2');

const c1RootId = 'c_seed_t1_root' as CommentId;
const c1R1Id = 'c_seed_t1_r1' as CommentId;
const c1R2Id = 'c_seed_t1_r2' as CommentId;
const c1R3Id = 'c_seed_t1_r3' as CommentId;
const c2RootId = 'c_seed_t2_root' as CommentId;
const c2R1Id = 'c_seed_t2_r1' as CommentId;

const T0 = '2026-05-30T10:00:00.000Z';
const T1 = '2026-05-30T10:05:00.000Z';
const T2 = '2026-05-30T10:08:00.000Z';
const T3 = '2026-05-30T10:15:00.000Z';
const T4 = '2026-05-30T11:00:00.000Z';
const T5 = '2026-05-30T11:30:00.000Z';

const SAMPLE_DATA: ReadonlyArray<Comment> = [
  {
    id: c1RootId,
    postId: POST_T1,
    authorId: asUserId('u_ana'),
    parentId: null,
    body: 'Acabei de visitar o terreiro e o axé do Caboclo da Praia estava fortíssimo hoje. Gratidão, @bia.',
    mentions: [],
    createdAt: T0,
    status: 'visible',
  },
  {
    id: c1R1Id,
    postId: POST_T1,
    authorId: asUserId('u_bia'),
    parentId: c1RootId,
    body: '@ana a corrente estava leve — confirmei a Sefirá de Keter essa manhã.',
    mentions: [],
    createdAt: T1,
    status: 'visible',
  },
  {
    id: c1R2Id,
    postId: POST_T1,
    authorId: asUserId('u_carla'),
    parentId: c1RootId,
    body: 'Posso participar da próxima gira, @dora? Quero entender melhor a linha de Orixá.',
    mentions: [],
    createdAt: T2,
    status: 'visible',
  },
  {
    id: c1R3Id,
    postId: POST_T1,
    authorId: asUserId('u_dora'),
    parentId: c1RootId,
    body: '@carla sim, quarta-feira às 19h. Leva um branco pra oferenda.',
    mentions: [],
    createdAt: T3,
    status: 'visible',
  },
  {
    id: c2RootId,
    postId: POST_T2,
    authorId: asUserId('u_ester'),
    parentId: null,
    body: 'Tirei O Louco hoje na Mesa Real. Sinais de início de ciclo — @ana o que acha?',
    mentions: [],
    createdAt: T4,
    status: 'visible',
  },
  {
    id: c2R1Id,
    postId: POST_T2,
    authorId: asUserId('u_ana'),
    parentId: c2RootId,
    body: '@ester O Louco + Keter na Cabala apontam o mesmo: sair da toca. Confia.',
    mentions: [],
    createdAt: T5,
    status: 'visible',
  },
];

export interface InMemoryCommentsAdapter extends CommentsAdapter {
  __peekAll(): ReadonlyArray<Comment>;
  __reset(): void;
}

export function createInMemoryCommentsAdapter(): InMemoryCommentsAdapter {
  const store = new Map<CommentId, Comment>();

  for (const c of SAMPLE_DATA) store.set(c.id, { ...c });

  function snapshot(): ReadonlyArray<Comment> {
    return Array.from(store.values()).map((c) => ({ ...c }));
  }

  const adapter: InMemoryCommentsAdapter = {
    async insert(
      c: Omit<Comment, 'id' | 'createdAt' | 'status'>,
    ): Promise<Comment> {
      const id = makeFreshId(store);
      const persisted: Comment = Object.freeze({
        ...c,
        id,
        status: 'visible',
        createdAt: new Date().toISOString(),
      });
      store.set(id, persisted);
      return persisted;
    },

    async update(
      id: CommentId,
      patch: Pick<Comment, 'body' | 'mentions'> & { editedAt: string },
    ): Promise<Comment> {
      const existing = store.get(id);
      if (!existing) {
        throw new Error(`CommentsAdapter.update: comment ${id} not found`);
      }
      const updated: Comment = Object.freeze({
        ...existing,
        body: patch.body,
        mentions: patch.mentions,
        editedAt: patch.editedAt,
      });
      store.set(id, updated);
      return updated;
    },

    async softDelete(id: CommentId): Promise<Comment> {
      const existing = store.get(id);
      if (!existing) {
        throw new Error(`CommentsAdapter.softDelete: comment ${id} not found`);
      }
      const updated: Comment = Object.freeze({
        ...existing,
        body: '',
        status: 'deleted',
      });
      store.set(id, updated);
      return updated;
    },

    async listByPost(postId: PostId): Promise<ReadonlyArray<Comment>> {
      return snapshot()
        .filter((c) => c.postId === postId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async findById(id: CommentId): Promise<Comment | null> {
      const c = store.get(id);
      return c ? { ...c } : null;
    },

    __peekAll(): ReadonlyArray<Comment> {
      return snapshot();
    },

    __reset(): void {
      store.clear();
      for (const c of SAMPLE_DATA) store.set(c.id, { ...c });
    },
  };

  return Object.freeze(adapter);
}

let __memIdSeq = 1000;
function makeFreshId(store: Map<CommentId, Comment>): CommentId {
  for (let i = 0; i < 100; i++) {
    __memIdSeq += 1;
    const candidate = `c_mem_${__memIdSeq.toString(36)}` as CommentId;
    if (!store.has(candidate)) return candidate;
  }
  return `c_mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}` as CommentId;
}

export const SAMPLE_POST_ID_1 = POST_T1;
export const SAMPLE_POST_ID_2 = POST_T2;
