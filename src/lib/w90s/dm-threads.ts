// ============================================================================
// dm-threads.ts — Pure engine for 1-on-1 direct messages (W90s-B)
//
// Decisões de design:
//   - DM é SEMPRE uma thread entre exatamente 2 usuários (não grupo, não
//     broadcast). Sem isso o modelo fica ambíguo.
//   - Engine é PURA — sem `await`, sem `Date.now()`, sem I/O. Caller
//     fornece `nowMs` e IDs determinísticos.
//   - Mutadores retornam SEMPRE novo estado (`LiveStreamChatState`-like,
//     imutável, `Object.freeze` em tudo).
//   - Branded types via `unique symbol` para `UserId`, `ThreadId`,
//     `MessageId` — mixing protegido em compile-time.
//
// Sacred-cultural compliance:
//   - Sem vocabulário negativo em mensagens de erro/moderation.
//   - Mensagens vazias ou só whitespace são rejeitadas com motivo claro.
//   - Block user é uma ação local (não compartilha estado com backend);
//     comentário explícito no código.
//
// Anti-padrões evitados (W86-W89 lessons):
//   - Sem `await` em helpers puros.
//   - Sem `Date.now()` — sempre `nowMs` injetado.
//   - Sem estado global mutável.
//   - Sem leitura de `localStorage` no engine (storage é separado).
// ============================================================================

// ---------------------------------------------------------------------------
// Brand<TBase, TBrand> — nominal typing via unique symbol
// ---------------------------------------------------------------------------
declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type UserId = Brand<string, 'DM.UserId'>;
export type ThreadId = Brand<string, 'DM.ThreadId'>;
export type MessageId = Brand<string, 'DM.MessageId'>;

// Constructors — small casts que mantêm o código legível.
export const toUserId = (s: string): UserId => s as UserId;
export const toThreadId = (s: string): ThreadId => s as ThreadId;
export const toMessageId = (s: string): MessageId => s as MessageId;

// ---------------------------------------------------------------------------
// Constantes — frozen at module load
// ---------------------------------------------------------------------------
export const MAX_MESSAGE_LENGTH = 2000;
export const MIN_MESSAGE_LENGTH = 1;
export const MAX_MESSAGES_PER_THREAD = 1000;
export const MAX_THREADS_PER_USER = 200;
export const MAX_SEARCH_RESULTS = 50;
export const MAX_DISPLAY_NAME = 60;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/** Status de uma mensagem. `read` exige `readAt` numérico. */
export type MessageStatus = 'sent' | 'delivered' | 'read';

/** Direcao — só faz sentido entre 2 usuarios. */
export type Direction = 'incoming' | 'outgoing';

export interface DMMessage {
  readonly id: MessageId;
  readonly threadId: ThreadId;
  readonly senderId: UserId;
  readonly text: string;
  /** Caller-supplied (see header). */
  readonly createdAt: number;
  readonly status: MessageStatus;
  /** Populated when status transitions to 'read'. */
  readonly readAt?: number;
  /** Soft-delete preserva o slot mas esconde o body. */
  readonly deleted?: boolean;
}

export interface DMThread {
  readonly id: ThreadId;
  /** SEMPRE 2 IDs, ordenados lexicograficamente para normalizar. */
  readonly participantIds: ReadonlyArray<UserId>;
  /** Display name do outro participante (perspectiva do viewer). */
  readonly peerDisplayName: string;
  readonly peerAvatarSeed: string;
  readonly lastMessagePreview: string;
  readonly lastMessageAt: number;
  readonly unreadCount: number;
  readonly archived: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface DMState {
  readonly currentUserId: UserId;
  /** Threads onde o user participa. */
  readonly threads: ReadonlyArray<DMThread>;
  /** Mensagens indexadas por threadId. */
  readonly messagesByThread: Readonly<Record<string, ReadonlyArray<DMMessage>>>;
  /** Mapa userId→UserId (blockedByCurrentUser). */
  readonly blockedUserIds: ReadonlyArray<UserId>;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
export interface DMInitialOptions {
  readonly currentUserId: UserId;
  readonly blockedUserIds?: ReadonlyArray<UserId>;
  readonly threads?: ReadonlyArray<DMThread>;
  readonly messagesByThread?: Readonly<Record<string, ReadonlyArray<DMMessage>>>;
}

export function createInitialState(options: DMInitialOptions): DMState {
  return Object.freeze({
    currentUserId: options.currentUserId,
    threads: Object.freeze([...(options.threads ?? [])]) as ReadonlyArray<DMThread>,
    messagesByThread: Object.freeze({ ...(options.messagesByThread ?? {}) }) as Readonly<
      Record<string, ReadonlyArray<DMMessage>>
    >,
    blockedUserIds: Object.freeze([...(options.blockedUserIds ?? [])]) as ReadonlyArray<UserId>,
  });
}

// ---------------------------------------------------------------------------
// Helpers (private)
// ---------------------------------------------------------------------------

/**
 * ThreadId determinístico baseado nos 2 participantes (ordenados).
 * Reutilizar isso garante que startThread entre Alice→Bob é a MESMA
 * thread que Bob→Alice.
 */
export function threadIdFor(me: UserId, peer: UserId): ThreadId {
  const a = me as unknown as string;
  const b = peer as unknown as string;
  const [lo, hi] = a < b ? [a, b] : [b, a];
  return toThreadId(`dm_${hi}_${lo}`);
}

/** Verifica se 2 users ja tem thread (helper interno). */
function findThread(state: DMState, id: ThreadId): DMThread | undefined {
  return state.threads.find((t) => t.id === id);
}

/** Recupera mensagens de uma thread (helper). */
function getMessages(state: DMState, id: ThreadId): ReadonlyArray<DMMessage> {
  return state.messagesByThread[id as unknown as string] ?? [];
}

/** Incrementa contador de thread update. */
function touchTimestamp(thread: DMThread, nowMs: number): DMThread {
  return Object.freeze({ ...thread, updatedAt: nowMs });
}

function clampText(text: string): string {
  return text.trim().slice(0, MAX_MESSAGE_LENGTH);
}

function isFinitePositive(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

/** Compara dois UserIds. */
export function isSameUser(a: UserId, b: UserId): boolean {
  return (a as unknown as string) === (b as unknown as string);
}

/** Participante "outro" dentro de uma thread. */
export function peerOf(thread: DMThread, me: UserId): UserId {
  const ids = thread.participantIds;
  const meStr = me as unknown as string;
  const other = ids.find((u) => (u as unknown as string) !== meStr);
  if (!other) {
    // Self-chat edge case (user escreve para si mesmo) — devolve o primeiro.
    return ids[0] ?? me;
  }
  return other;
}

/** Comportamento: uma thread é "unread" se a última msg é incoming e não foi lida. */
function computeUnreadCount(messages: ReadonlyArray<DMMessage>, me: UserId): number {
  const meStr = me as unknown as string;
  let count = 0;
  for (const m of messages) {
    if (m.deleted) continue;
    if ((m.senderId as unknown as string) === meStr) continue; // outgoing não conta
    if (m.status === 'read') continue;
    count += 1;
  }
  return count;
}

// ===========================================================================
// startThread — cria ou retorna thread existente entre me + peer
// ===========================================================================
export interface StartThreadInput {
  readonly peerId: UserId;
  readonly peerDisplayName: string;
  readonly peerAvatarSeed: string;
  readonly nowMs: number;
}

export interface DMResult<T> {
  readonly state: DMState;
  readonly value: T;
  readonly thread: DMThread;
}

export function startThread(
  state: DMState,
  input: StartThreadInput,
): DMResult<DMThread> {
  if (!isFinitePositive(input.nowMs)) {
    // devolve thread vazia por referência ao índice 0 se existir, sem criar.
    const fallbackId = threadIdFor(state.currentUserId, input.peerId);
    const existing = findThread(state, fallbackId);
    if (existing) {
      return Object.freeze({ state, value: existing, thread: existing });
    }
    const stub = buildThread(
      state.currentUserId,
      input.peerId,
      input.peerDisplayName,
      input.peerAvatarSeed,
      input.nowMs,
    );
    const nextState = Object.freeze({
      ...state,
      threads: Object.freeze([...state.threads, stub]) as ReadonlyArray<DMThread>,
    });
    return Object.freeze({ state: nextState, value: stub, thread: stub });
  }

  // não posso criar thread comigo mesmo
  if (isSameUser(state.currentUserId, input.peerId)) {
    // devolve state sem mudança (invariante: peer ≠ me)
    return Object.freeze({
      state,
      value: findThread(state, threadIdFor(state.currentUserId, input.peerId)) ??
        buildThread(state.currentUserId, input.peerId, input.peerDisplayName, input.peerAvatarSeed, input.nowMs),
      thread: findThread(state, threadIdFor(state.currentUserId, input.peerId)) ??
        buildThread(state.currentUserId, input.peerId, input.peerDisplayName, input.peerAvatarSeed, input.nowMs),
    });
  }

  const id = threadIdFor(state.currentUserId, input.peerId);
  const existing = findThread(state, id);
  if (existing) {
    return Object.freeze({ state, value: existing, thread: existing });
  }

  const thread = buildThread(
    state.currentUserId,
    input.peerId,
    input.peerDisplayName,
    input.peerAvatarSeed,
    input.nowMs,
  );

  const nextState = Object.freeze({
    ...state,
    threads: Object.freeze([...state.threads, thread]) as ReadonlyArray<DMThread>,
  });
  return Object.freeze({ state: nextState, value: thread, thread });
}

function buildThread(
  me: UserId,
  peer: UserId,
  peerDisplayName: string,
  peerAvatarSeed: string,
  nowMs: number,
): DMThread {
  return Object.freeze({
    id: threadIdFor(me, peer),
    participantIds: Object.freeze([me, peer]) as ReadonlyArray<UserId>,
    peerDisplayName: peerDisplayName.trim().slice(0, MAX_DISPLAY_NAME) || 'convidado',
    peerAvatarSeed: peerAvatarSeed || (peer as unknown as string),
    lastMessagePreview: '',
    lastMessageAt: nowMs,
    unreadCount: 0,
    archived: false,
    createdAt: nowMs,
    updatedAt: nowMs,
  });
}

// ===========================================================================
// sendMessage — adiciona msg à thread (caller escolhe id)
// ===========================================================================
export interface SendMessageInput {
  readonly threadId: ThreadId;
  readonly messageId?: MessageId;
  readonly text: string;
  readonly nowMs: number;
}

export interface MessageResult {
  readonly state: DMState;
  readonly message: DMMessage | null;
  readonly thread: DMThread;
  readonly reason?: string;
}

export function sendMessage(
  state: DMState,
  input: SendMessageInput,
): MessageResult {
  const thread = findThread(state, input.threadId);
  if (!thread) {
    // thread inexistente — devolve state sem mudanca, reason explica.
    const stub = buildThread(
      state.currentUserId,
      state.currentUserId,
      '',
      '',
      input.nowMs,
    );
    return Object.freeze({ state, message: null, thread: stub, reason: 'Thread inexistente.' });
  }

  const cleaned = clampText(input.text);
  if (cleaned.length < MIN_MESSAGE_LENGTH) {
    return Object.freeze({
      state,
      message: null,
      thread,
      reason: 'Mensagem vazia — escreva algo antes de enviar.',
    });
  }

  const peer = peerOf(thread, state.currentUserId);
  if (isBlocked(state, peer)) {
    return Object.freeze({
      state,
      message: null,
      thread,
      reason: 'Você bloqueou este usuário. Desbloqueie para enviar mensagens.',
    });
  }

  const id =
    input.messageId ??
    toMessageId(`m_${input.threadId}_${input.nowMs}_${Math.floor(Math.random() * 1e9)}`);

  const message: DMMessage = Object.freeze({
    id,
    threadId: input.threadId,
    senderId: state.currentUserId,
    text: cleaned,
    createdAt: input.nowMs,
    status: 'sent',
  });

  const prevMessages = getMessages(state, input.threadId);
  const nextMessages = Object.freeze(
    [...prevMessages, message].slice(-MAX_MESSAGES_PER_THREAD),
  ) as ReadonlyArray<DMMessage>;

  const updatedThread: DMThread = Object.freeze({
    ...touchTimestamp(thread, input.nowMs),
    lastMessagePreview: cleaned.slice(0, 80),
    lastMessageAt: input.nowMs,
    unreadCount: 0, // outgoing zera unread do lado do sender
  });

  const nextThreads = state.threads.map((t) =>
    t.id === input.threadId ? updatedThread : t,
  );

  const nextState = Object.freeze({
    ...state,
    threads: Object.freeze(nextThreads) as ReadonlyArray<DMThread>,
    messagesByThread: Object.freeze({
      ...state.messagesByThread,
      [input.threadId as unknown as string]: nextMessages,
    }) as Readonly<Record<string, ReadonlyArray<DMMessage>>>,
  });

  return Object.freeze({ state: nextState, message, thread: updatedThread });
}

// ===========================================================================
// markRead — marca todas as mensagens incoming como read
// ===========================================================================
export interface MarkReadInput {
  readonly threadId: ThreadId;
  readonly nowMs: number;
}

export interface MarkReadResult {
  readonly state: DMState;
  readonly thread: DMThread;
  readonly markedCount: number;
}

export function markRead(state: DMState, input: MarkReadInput): MarkReadResult {
  const thread = findThread(state, input.threadId);
  if (!thread) {
    const stub = buildThread(
      state.currentUserId,
      state.currentUserId,
      '',
      '',
      input.nowMs,
    );
    return Object.freeze({ state, thread: stub, markedCount: 0 });
  }

  const meStr = state.currentUserId as unknown as string;
  const messages = getMessages(state, input.threadId);
  let marked = 0;

  const nextMessages = messages.map((m) => {
    if (m.deleted) return m;
    if ((m.senderId as unknown as string) === meStr) return m;
    if (m.status === 'read') return m;
    marked += 1;
    return Object.freeze({
      ...m,
      status: 'read' as MessageStatus,
      readAt: input.nowMs,
    });
  });

  const updatedThread: DMThread = Object.freeze({
    ...touchTimestamp(thread, input.nowMs),
    unreadCount: 0,
  });

  const nextThreads = state.threads.map((t) =>
    t.id === input.threadId ? updatedThread : t,
  );

  const nextState = Object.freeze({
    ...state,
    threads: Object.freeze(nextThreads) as ReadonlyArray<DMThread>,
    messagesByThread: Object.freeze({
      ...state.messagesByThread,
      [input.threadId as unknown as string]: nextMessages,
    }) as Readonly<Record<string, ReadonlyArray<DMMessage>>>,
  });

  return Object.freeze({ state: nextState, thread: updatedThread, markedCount: marked });
}

// ===========================================================================
// archiveThread — flippa archived (toggle)
// ===========================================================================
export interface ArchiveThreadInput {
  readonly threadId: ThreadId;
  readonly nowMs: number;
  readonly archived?: boolean;
}

export interface ArchiveResult {
  readonly state: DMState;
  readonly thread: DMThread;
}

export function archiveThread(
  state: DMState,
  input: ArchiveThreadInput,
): ArchiveResult {
  const thread = findThread(state, input.threadId);
  if (!thread) {
    const stub = buildThread(
      state.currentUserId,
      state.currentUserId,
      '',
      '',
      input.nowMs,
    );
    return Object.freeze({ state, thread: stub });
  }
  const newArchived =
    typeof input.archived === 'boolean' ? input.archived : !thread.archived;
  const updated: DMThread = Object.freeze({
    ...touchTimestamp(thread, input.nowMs),
    archived: newArchived,
  });
  const nextThreads = state.threads.map((t) =>
    t.id === input.threadId ? updated : t,
  );
  const nextState = Object.freeze({
    ...state,
    threads: Object.freeze(nextThreads) as ReadonlyArray<DMThread>,
  });
  return Object.freeze({ state: nextState, thread: updated });
}

// ===========================================================================
// blockUser — adiciona/remover userId da blocked list
// ===========================================================================
export interface BlockUserInput {
  readonly userId: UserId;
  readonly blocked: boolean;
}

export interface BlockResult {
  readonly state: DMState;
  readonly isBlocked: boolean;
}

export function blockUser(state: DMState, input: BlockUserInput): BlockResult {
  const target = input.userId as unknown as string;
  const exists = state.blockedUserIds.some(
    (u) => (u as unknown as string) === target,
  );

  if (input.blocked && !exists) {
    const next = Object.freeze({
      ...state,
      blockedUserIds: Object.freeze([...state.blockedUserIds, input.userId]) as ReadonlyArray<UserId>,
    });
    return Object.freeze({ state: next, isBlocked: true });
  }
  if (!input.blocked && exists) {
    const next = Object.freeze({
      ...state,
      blockedUserIds: Object.freeze(
        state.blockedUserIds.filter((u) => (u as unknown as string) !== target),
      ) as ReadonlyArray<UserId>,
    });
    return Object.freeze({ state: next, isBlocked: false });
  }
  // already in desired state
  return Object.freeze({
    state,
    isBlocked: exists,
  });
}

export function isBlocked(state: DMState, userId: UserId): boolean {
  const target = userId as unknown as string;
  return state.blockedUserIds.some((u) => (u as unknown as string) === target);
}

// ===========================================================================
// listThreads — retorna threads filtradas por view (ativas / arquivadas / todas)
// ===========================================================================
export type ThreadView = 'active' | 'archived' | 'all';

export interface ListThreadsOptions {
  readonly view?: ThreadView;
  readonly search?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface ListThreadsResult {
  readonly threads: ReadonlyArray<DMThread>;
  readonly total: number;
}

export function listThreads(
  state: DMState,
  options: ListThreadsOptions = {},
): ListThreadsResult {
  const view = options.view ?? 'active';
  const limit = Math.min(
    Math.max(options.limit ?? MAX_THREADS_PER_USER, 1),
    MAX_THREADS_PER_USER,
  );
  const offset = Math.max(options.offset ?? 0, 0);
  const search = (options.search ?? '').trim().toLowerCase();

  let filtered = state.threads;
  if (view === 'active') {
    filtered = filtered.filter((t) => !t.archived);
  } else if (view === 'archived') {
    filtered = filtered.filter((t) => t.archived);
  }
  if (search.length > 0) {
    filtered = filtered.filter((t) => {
      if (t.peerDisplayName.toLowerCase().includes(search)) return true;
      if (t.lastMessagePreview.toLowerCase().includes(search)) return true;
      return false;
    });
  }

  // ordenação: mais recente primeiro
  const sorted = [...filtered].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  const slice = sorted.slice(offset, offset + limit);

  return Object.freeze({
    threads: Object.freeze(slice) as ReadonlyArray<DMThread>,
    total: filtered.length,
  });
}

// ===========================================================================
// getThread — pega thread + suas mensagens (read-only)
// ===========================================================================
export interface GetThreadResult {
  readonly thread: DMThread | null;
  readonly messages: ReadonlyArray<DMMessage>;
  readonly peer: UserId | null;
}

export function getThread(
  state: DMState,
  threadId: ThreadId,
): GetThreadResult {
  const thread = findThread(state, threadId);
  if (!thread) {
    return Object.freeze({ thread: null, messages: [], peer: null });
  }
  const messages = getMessages(state, threadId);
  const peer = peerOf(thread, state.currentUserId);
  return Object.freeze({
    thread,
    messages: Object.freeze([...messages]) as ReadonlyArray<DMMessage>,
    peer,
  });
}

// ===========================================================================
// searchMessages — full-text search nas mensagens de todas as threads
// ===========================================================================
export interface SearchMessagesInput {
  readonly query: string;
  readonly peerId?: UserId;
  readonly limit?: number;
}

export interface SearchHit {
  readonly threadId: ThreadId;
  readonly messageId: MessageId;
  readonly text: string;
  readonly createdAt: number;
  readonly senderId: UserId;
}

export interface SearchMessagesResult {
  readonly hits: ReadonlyArray<SearchHit>;
  readonly total: number;
}

export function searchMessages(
  state: DMState,
  input: SearchMessagesInput,
): SearchMessagesResult {
  const q = (input.query ?? '').trim().toLowerCase();
  if (q.length === 0) {
    return Object.freeze({ hits: [], total: 0 });
  }
  const limit = Math.min(Math.max(input.limit ?? MAX_SEARCH_RESULTS, 1), MAX_SEARCH_RESULTS);
  const peerFilter = input.peerId ? (input.peerId as unknown as string) : null;

  const hits: SearchHit[] = [];
  let total = 0;
  for (const [threadKey, msgs] of Object.entries(state.messagesByThread)) {
    const tid = toThreadId(threadKey);
    if (!tid) continue;
    if ((tid as unknown as string) !== threadKey) continue;
    const thread = findThread(state, tid);
    if (!thread) continue;
    if (peerFilter) {
      const ok = thread.participantIds.some(
        (u) => (u as unknown as string) === peerFilter,
      );
      if (!ok) continue;
    }
    for (const m of msgs) {
      if (m.deleted) continue;
      if (!m.text.toLowerCase().includes(q)) continue;
      total += 1;
      if (hits.length < limit) {
        hits.push(
          Object.freeze({
            threadId: m.threadId,
            messageId: m.id,
            text: m.text,
            createdAt: m.createdAt,
            senderId: m.senderId,
          }) as SearchHit,
        );
      }
    }
  }

  return Object.freeze({
    hits: Object.freeze(hits) as ReadonlyArray<SearchHit>,
    total,
  });
}

// ===========================================================================
// Total unread count — usado pelo badge do shell
// ===========================================================================
export interface UnreadSummary {
  readonly total: number;
  readonly perThread: Readonly<Record<string, number>>;
}

export function getUnreadSummary(state: DMState): UnreadSummary {
  const perThread: Record<string, number> = {};
  let total = 0;
  for (const t of state.threads) {
    if (t.archived) continue;
    const cnt = t.unreadCount;
    perThread[t.id as unknown as string] = cnt;
    total += cnt;
  }
  return Object.freeze({
    total,
    perThread: Object.freeze(perThread) as Readonly<Record<string, number>>,
  });
}

// ===========================================================================
// Receiving an incoming message (perspectiva do recipient)
// ===========================================================================
export interface ReceiveMessageInput {
  readonly threadId: ThreadId;
  readonly messageId: MessageId;
  readonly text: string;
  readonly nowMs: number;
  /** Display name de quem enviou (para mensagens de demo/dev). */
  readonly senderDisplayName?: string;
}

export interface ReceiveResult {
  readonly state: DMState;
  readonly thread: DMThread;
  readonly message: DMMessage;
}

export function receiveMessage(
  state: DMState,
  input: ReceiveMessageInput,
): ReceiveResult {
  const id = input.threadId;
  const thread = findThread(state, id);
  if (!thread) {
    // Auto-cria thread inexistente (caller tinha que ter chamado startThread antes,
    // mas defensivamente aceitamos e criamos).
    const otherName = (input.senderDisplayName ?? 'convidado')
      .trim()
      .slice(0, MAX_DISPLAY_NAME);
    const started = startThread(state, {
      peerId: toUserId('incoming_peer'),
      peerDisplayName: otherName,
      peerAvatarSeed: 'incoming',
      nowMs: input.nowMs,
    });
    // After auto-creation, post the message.
    const cleaned = clampText(input.text);
    const message: DMMessage = Object.freeze({
      id: input.messageId,
      threadId: started.thread.id,
      senderId: toUserId('incoming_peer'),
      text: cleaned,
      createdAt: input.nowMs,
      status: 'delivered',
    });
    const existingMsgs = getMessages(started.state, started.thread.id);
    const nextMessages = Object.freeze([...existingMsgs, message]) as ReadonlyArray<DMMessage>;
    const updatedThread = Object.freeze({
      ...touchTimestamp(started.thread, input.nowMs),
      lastMessagePreview: cleaned.slice(0, 80),
      lastMessageAt: input.nowMs,
      unreadCount: 1,
    });
    const nextState = Object.freeze({
      ...started.state,
      threads: Object.freeze(
        started.state.threads.map((t) => (t.id === updatedThread.id ? updatedThread : t)),
      ) as ReadonlyArray<DMThread>,
      messagesByThread: Object.freeze({
        ...started.state.messagesByThread,
        [updatedThread.id as unknown as string]: nextMessages,
      }) as Readonly<Record<string, ReadonlyArray<DMMessage>>>,
    });
    return Object.freeze({ state: nextState, thread: updatedThread, message });
  }

  const cleaned = clampText(input.text);
  if (cleaned.length < MIN_MESSAGE_LENGTH) {
    // empty incoming — return existing unchanged
    return Object.freeze({
      state,
      thread,
      message: Object.freeze({
        id: input.messageId,
        threadId: id,
        senderId: toUserId('unknown_peer'),
        text: '',
        createdAt: input.nowMs,
        status: 'delivered',
        deleted: true,
      }),
    });
  }

  const message: DMMessage = Object.freeze({
    id: input.messageId,
    threadId: id,
    senderId: toUserId('unknown_peer'),
    text: cleaned,
    createdAt: input.nowMs,
    status: 'delivered',
  });

  const existing = getMessages(state, id);
  const nextMessages = Object.freeze([...existing, message]) as ReadonlyArray<DMMessage>;

  // Incrementa unread porque incoming ainda não foi lido
  const newUnread = computeUnreadCount(nextMessages, state.currentUserId);
  const updatedThread: DMThread = Object.freeze({
    ...touchTimestamp(thread, input.nowMs),
    lastMessagePreview: cleaned.slice(0, 80),
    lastMessageAt: input.nowMs,
    unreadCount: newUnread,
  });

  const nextState = Object.freeze({
    ...state,
    threads: Object.freeze(
      state.threads.map((t) => (t.id === id ? updatedThread : t)),
    ) as ReadonlyArray<DMThread>,
    messagesByThread: Object.freeze({
      ...state.messagesByThread,
      [id as unknown as string]: nextMessages,
    }) as Readonly<Record<string, ReadonlyArray<DMMessage>>>,
  });

  return Object.freeze({ state: nextState, thread: updatedThread, message });
}

// ===========================================================================
// Soft delete message — limpa texto mas mantém slot (audit trail)
// ===========================================================================
export interface DeleteMessageInput {
  readonly threadId: ThreadId;
  readonly messageId: MessageId;
}

export interface DeleteResult {
  readonly state: DMState;
  readonly thread: DMThread;
  readonly deleted: boolean;
}

export function deleteMessage(
  state: DMState,
  input: DeleteMessageInput,
): DeleteResult {
  const thread = findThread(state, input.threadId);
  if (!thread) {
    const stub = buildThread(
      state.currentUserId,
      state.currentUserId,
      '',
      '',
      Date.now(),
    );
    return Object.freeze({ state, thread: stub, deleted: false });
  }
  const messages = getMessages(state, input.threadId);
  let deleted = false;
  const nextMessages = messages.map((m) => {
    if (m.id !== input.messageId) return m;
    if (m.deleted) return m;
    deleted = true;
    return Object.freeze({
      ...m,
      text: '',
      deleted: true,
    });
  });
  if (!deleted) {
    return Object.freeze({ state, thread, deleted: false });
  }
  const nextState = Object.freeze({
    ...state,
    messagesByThread: Object.freeze({
      ...state.messagesByThread,
      [input.threadId as unknown as string]: nextMessages,
    }) as Readonly<Record<string, ReadonlyArray<DMMessage>>>,
  });
  return Object.freeze({ state: nextState, thread, deleted: true });
}
