// ============================================================================
// DM ENGINE — Direct Messages core (send/get/archive/mute/delete)
// ============================================================================
// Camada pura em memória. Sem dependência de Prisma/Redis para manter
// testabilidade e isolar a lógica de domínio.
// ============================================================================
// CONTRATO PÚBLICO:
//   sendDirectMessage(conversationId, senderId, content, options?)
//   getConversation(conversationId, viewerId)
//   getUserConversations(userId, options?)
//   archiveConversation / unarchiveConversation
//   muteConversation / unmuteConversation
//   deleteConversation
//   searchUserConversations(userId, query)
//   DM_EXPORT (objeto agregado)
// ============================================================================

import {
  getConversationStore,
  getMessageStore,
  getUserMutes,
  getUserArchives,
  getUserSoftDeletes,
  ensureSacredIndex,
  SACRED_CATALOG,
  // tipagens re-exportadas
  type ConversationId,
  type UserId,
  type MessageId,
  type Conversation,
  type DirectMessage,
  type DMSendOptions,
} from './dm-shared.ts';

// ============================================================================
// HELPERS — Tipos e constantes
// ============================================================================

const PREVIEW_MAX = 80;
const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;
const HOURS_24_MS = 24 * 60 * 60 * 1000;
const MUTE_MAX_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

// ============================================================================
// ERROS — explícitos por falha de domínio
// ============================================================================

export class DMError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DMError';
    this.code = code;
  }
}

export class ConversationNotFoundError extends DMError {
  constructor(conversationId: ConversationId) {
    super('CONVERSATION_NOT_FOUND', `Conversa ${conversationId} não encontrada`);
    this.name = 'ConversationNotFoundError';
  }
}

export class NotParticipantError extends DMError {
  constructor(conversationId: ConversationId, userId: UserId) {
    super('NOT_PARTICIPANT', `Usuário ${userId} não é participante de ${conversationId}`);
    this.name = 'NotParticipantError';
  }
}

export class EmptyMessageError extends DMError {
  constructor() {
    super('EMPTY_MESSAGE', 'Conteúdo da mensagem vazio ou só espaços');
    this.name = 'EmptyMessageError';
  }
}

export class MessageTooLongError extends DMError {
  constructor(max: number) {
    super('MESSAGE_TOO_LONG', `Mensagem excede o máximo de ${max} caracteres`);
    this.name = 'MessageTooLongError';
  }
}

export class SenderNotParticipantError extends DMError {
  constructor() {
    super('SENDER_NOT_PARTICIPANT', 'Remetente não participa da conversa');
    this.name = 'SenderNotParticipantError';
  }
}

// ============================================================================
// CONSTANTES — exports
// ============================================================================

export const DM_CONSTANTS = {
  PREVIEW_MAX,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  MUTE_MAX_MS,
  HOURS_24_MS,
} as const;

// ============================================================================
// UUID-LIKE ID GENERATORS — monotonic counters para evitar colisão
// ============================================================================

let _msgCounter = 0;
function nextMessageId(): MessageId {
  _msgCounter += 1;
  return `msg_${Date.now().toString(36)}_${_msgCounter.toString(36)}` as MessageId;
}

function previewOf(content: string): string {
  if (content.length <= PREVIEW_MAX) return content;
  return content.slice(0, PREVIEW_MAX - 1) + '…';
}

// ============================================================================
// FUNÇÕES PURAS — numeração de anexos/menções (sem side-effects)
// ============================================================================

export interface SacredHit {
  term: string;
  slug: string;
  tradition: string;
  matched: string;
  position: number;
}

export function detectSacredTerms(
  content: string,
  catalog: ReadonlyArray<{ term: string; slug: string; tradition: string }>
): SacredHit[] {
  if (!content) return [];
  const hits: SacredHit[] = [];
  const seen = new Set<string>();
  for (const entry of catalog) {
    // Lookaround: (?:^|\W) previne match parcial; (?:$|\W) cobre fim de linha.
    // Para PT-BR, diacríticos exigem unicode; usamos 'iu' flag.
    const escaped = entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|\\W)(${escaped})(?:$|\\W)`, 'giu');
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const key = `${entry.slug}@${m.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        term: m[1],
        slug: entry.slug,
        tradition: entry.tradition,
        matched: m[0],
        position: m.index + (m[0].length - m[1].length),
      });
    }
  }
  return hits;
}

// ============================================================================
// sendDirectMessage — criar + persistir + atualizar conversa
// ============================================================================

export function sendDirectMessage(
  conversationId: ConversationId,
  senderId: UserId,
  content: string,
  options: DMSendOptions = {}
): DirectMessage {
  const trimmed = content.trim();
  if (trimmed.length === 0) throw new EmptyMessageError();
  if (trimmed.length > 4000) throw new MessageTooLongError(4000);

  const conversations = getConversationStore();
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new ConversationNotFoundError(conversationId);
  if (!conversation.participantIds.includes(senderId)) {
    throw new SenderNotParticipantError();
  }
  // conversa deletada (soft delete) precisa ser restaurada por quem envia
  if (conversation.deletedBy.includes(senderId)) {
    conversation.deletedBy = conversation.deletedBy.filter((u) => u !== senderId);
  }

  const now = new Date();
  const id = nextMessageId();
  const mentions = options.mentions ?? [];
  const replyToId = options.replyTo ?? null;

  // receptores = participantes - remetente
  const recipients = conversation.participantIds.filter((u) => u !== senderId);

  const msg: DirectMessage = {
    id,
    conversationId,
    senderId,
    content: trimmed,
    createdAt: now,
    readBy: [senderId], // remetente "leu" ao enviar
    deliveredTo: recipients.slice(), // entregado imediatamente
    mentions,
    attachments: options.attachments ?? [],
    replyToId,
    sacredHits: [],
  };

  // Detectar termos sagrados via catálogo global
  const idx = ensureSacredIndex(conversationId);
  const hits = detectSacredTerms(trimmed, SACRED_CATALOG);
  msg.sacredHits = hits;
  if (hits.length > 0) {
    for (const h of hits) idx.add(h.slug);
  }

  // Persistir mensagem
  const messages = getMessageStore();
  const convMessages = messages.get(conversationId) ?? [];
  convMessages.push(msg);
  messages.set(conversationId, convMessages);

  // Atualizar metadados da conversa
  conversation.lastMessageAt = now;
  conversation.lastMessagePreview = previewOf(trimmed);
  // unread: incrementa para todos exceto remetente E quem arquivou
  for (const uid of recipients) {
    if (
      !getUserArchives().get(uid)?.has(conversationId) &&
      !getUserMutes().get(uid)?.has(conversationId)
    ) {
      conversation.unreadCount = (conversation.unreadCount ?? 0) + 1;
    }
  }

  conversations.set(conversationId, conversation);
  return msg;
}

// ============================================================================
// getConversation — busca com authz + marca como lida
// ============================================================================

export function getConversation(
  conversationId: ConversationId,
  viewerId: UserId,
  options: { markAsRead?: boolean } = {}
): Conversation {
  const conversations = getConversationStore();
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new ConversationNotFoundError(conversationId);
  if (!conversation.participantIds.includes(viewerId)) {
    throw new NotParticipantError(conversationId, viewerId);
  }
  if (conversation.deletedBy.includes(viewerId)) {
    throw new ConversationNotFoundError(conversationId);
  }

  // marca como lida se flag setada
  if (options.markAsRead !== false) {
    markConversationRead(conversationId, viewerId);
  }
  return conversation;
}

function markConversationRead(conversationId: ConversationId, userId: UserId) {
  const conversations = getConversationStore();
  const conversation = conversations.get(conversationId);
  if (!conversation) return;
  const messages = getMessageStore();
  const convMsgs = messages.get(conversationId) ?? [];
  for (const m of convMsgs) {
    if (!m.readBy.includes(userId)) m.readBy.push(userId);
  }
  conversation.unreadCount = 0;
  conversations.set(conversationId, conversation);
}

// ============================================================================
// getUserConversations — inbox paginada
// ============================================================================

export interface InboxOptions {
  limit?: number;
  cursor?: ConversationId | null;
  includeArchived?: boolean;
}

export interface InboxPage {
  conversations: Conversation[];
  nextCursor: ConversationId | null;
  total: number;
}

export function getUserConversations(
  userId: UserId,
  options: InboxOptions = {}
): InboxPage {
  const limit = Math.min(
    options.limit ?? DEFAULT_PAGE_LIMIT,
    MAX_PAGE_LIMIT
  );
  const includeArchived = options.includeArchived ?? false;

  const conversations = getConversationStore();
  const archives = getUserArchives().get(userId);

  // filtra
  const all = Array.from(conversations.values()).filter((c) => {
    if (!c.participantIds.includes(userId)) return false;
    if (c.deletedBy.includes(userId)) return false;
    if (!includeArchived && archives?.has(c.id)) return false;
    return true;
  });

  // ordena por lastMessageAt desc
  all.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

  let startIdx = 0;
  if (options.cursor) {
    const idx = all.findIndex((c) => c.id === options.cursor);
    startIdx = idx >= 0 ? idx + 1 : 0;
  }
  const slice = all.slice(startIdx, startIdx + limit);
  const nextCursor = slice.length === limit && startIdx + limit < all.length
    ? slice[slice.length - 1].id
    : null;

  return {
    conversations: slice,
    nextCursor,
    total: all.length,
  };
}

// ============================================================================
// archiveConversation / unarchiveConversation
// ============================================================================

export function archiveConversation(conversationId: ConversationId, userId: UserId): void {
  const conversations = getConversationStore();
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new ConversationNotFoundError(conversationId);
  if (!conversation.participantIds.includes(userId)) {
    throw new NotParticipantError(conversationId, userId);
  }
  const archives = getUserArchives();
  const set = archives.get(userId) ?? new Set<ConversationId>();
  set.add(conversationId);
  archives.set(userId, set);
}

export function unarchiveConversation(conversationId: ConversationId, userId: UserId): void {
  const archives = getUserArchives();
  const set = archives.get(userId);
  if (set) set.delete(conversationId);
}

// ============================================================================
// muteConversation / unmuteConversation — TTL em ms desde agora
// ============================================================================

export interface MuteRecord {
  conversationId: ConversationId;
  userId: UserId;
  mutedAt: Date;
  expiresAt: Date | null; // null = permanente
}

const USER_MUTE_RECORDS = new Map<string, MuteRecord[]>(); // composite key: userId|convId

function muteKey(uid: UserId, cid: ConversationId): string {
  return `${uid}|${cid}`;
}

export function muteConversation(
  conversationId: ConversationId,
  userId: UserId,
  durationMs: number | null = HOURS_24_MS
): MuteRecord {
  const conversations = getConversationStore();
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new ConversationNotFoundError(conversationId);
  if (!conversation.participantIds.includes(userId)) {
    throw new NotParticipantError(conversationId, userId);
  }

  if (durationMs !== null) {
    if (durationMs <= 0) throw new DMError('INVALID_DURATION', 'Duração deve ser > 0 ms');
    if (durationMs > MUTE_MAX_MS) {
      throw new DMError('DURATION_TOO_LONG', `Duração máxima é ${MUTE_MAX_MS} ms`);
    }
  }

  const mutes = getUserMutes();
  const set = mutes.get(userId) ?? new Set<ConversationId>();
  set.add(conversationId);
  mutes.set(userId, set);

  const now = new Date();
  const expiresAt = durationMs === null ? null : new Date(now.getTime() + durationMs);
  const record: MuteRecord = {
    conversationId,
    userId,
    mutedAt: now,
    expiresAt,
  };

  const key = muteKey(userId, conversationId);
  const existing = USER_MUTE_RECORDS.get(key) ?? [];
  existing.push(record);
  USER_MUTE_RECORDS.set(key, existing);

  return record;
}

export function unmuteConversation(conversationId: ConversationId, userId: UserId): void {
  const mutes = getUserMutes();
  const set = mutes.get(userId);
  if (set) set.delete(conversationId);
  USER_MUTE_RECORDS.delete(muteKey(userId, conversationId));
}

export function isMuted(conversationId: ConversationId, userId: UserId): boolean {
  const mutes = getUserMutes();
  const set = mutes.get(userId);
  if (!set?.has(conversationId)) return false;

  // checar expiração do MUTE_RECORD mais recente
  const key = muteKey(userId, conversationId);
  const records = USER_MUTE_RECORDS.get(key);
  if (!records || records.length === 0) return false;
  const latest = records[records.length - 1];
  if (latest.expiresAt && latest.expiresAt.getTime() <= Date.now()) {
    // expirou: limpar
    set.delete(conversationId);
    return false;
  }
  return true;
}

export function getMuteHistory(userId: UserId): MuteRecord[] {
  const out: MuteRecord[] = [];
  for (const records of USER_MUTE_RECORDS.values()) {
    for (const r of records) if (r.userId === userId) out.push(r);
  }
  return out;
}

// ============================================================================
// deleteConversation — soft delete por usuário
// ============================================================================

export function deleteConversation(conversationId: ConversationId, userId: UserId): void {
  const conversations = getConversationStore();
  const conversation = conversations.get(conversationId);
  if (!conversation) throw new ConversationNotFoundError(conversationId);
  if (!conversation.participantIds.includes(userId)) {
    throw new NotParticipantError(conversationId, userId);
  }
  const deletes = getUserSoftDeletes();
  const set = deletes.get(userId) ?? new Set<ConversationId>();
  set.add(conversationId);
  deletes.set(userId, set);

  // também marca na conversa
  if (!conversation.deletedBy.includes(userId)) {
    conversation.deletedBy.push(userId);
    conversations.set(conversationId, conversation);
  }
}

// ============================================================================
// searchUserConversations — full-text scan nas mensagens do usuário
// ============================================================================

export interface ConversationSearchOptions {
  limit?: number;
  caseSensitive?: boolean;
}

export interface ConversationSearchHit {
  conversationId: ConversationId;
  messageId: MessageId;
  snippet: string;
  position: number;
}

export function searchUserConversations(
  userId: UserId,
  query: string,
  options: ConversationSearchOptions = {}
): ConversationSearchHit[] {
  if (!query || query.trim().length === 0) return [];
  const q = options.caseSensitive ? query : query.toLowerCase();
  const limit = Math.min(options.limit ?? 50, MAX_PAGE_LIMIT);

  const conversations = getConversationStore();
  const messages = getMessageStore();
  const out: ConversationSearchHit[] = [];

  for (const c of conversations.values()) {
    if (!c.participantIds.includes(userId)) continue;
    if (c.deletedBy.includes(userId)) continue;
    const convMsgs = messages.get(c.id) ?? [];
    for (const m of convMsgs) {
      const haystack = options.caseSensitive ? m.content : m.content.toLowerCase();
      const idx = haystack.indexOf(q);
      if (idx < 0) continue;
      const start = Math.max(0, idx - 20);
      const end = Math.min(m.content.length, idx + q.length + 20);
      const snippet = (start > 0 ? '…' : '') + m.content.slice(start, end) + (end < m.content.length ? '…' : '');
      out.push({
        conversationId: c.id,
        messageId: m.id,
        snippet,
        position: idx,
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

// ============================================================================
// EXPORTS — re-exporta para consumidores que importam deste arquivo
// ============================================================================

export type {
  Conversation,
  DirectMessage,
  DMSendOptions,
  ConversationId,
  UserId,
  MessageId,
} from './dm-shared.ts';

// ============================================================================
// __ALL_EXPORTS — agregador para auditoria
// ============================================================================

export const DM_ENGINE_EXPORTS = {
  functions: [
    'sendDirectMessage',
    'getConversation',
    'getUserConversations',
    'archiveConversation',
    'unarchiveConversation',
    'muteConversation',
    'unmuteConversation',
    'isMuted',
    'getMuteHistory',
    'deleteConversation',
    'searchUserConversations',
    'detectSacredTerms',
  ],
  types: [
    'Conversation',
    'DirectMessage',
    'DMSendOptions',
    'InboxOptions',
    'InboxPage',
    'MuteRecord',
    'ConversationSearchOptions',
    'ConversationSearchHit',
    'SacredHit',
    'ConversationId',
    'UserId',
    'MessageId',
  ],
  errors: [
    'DMError',
    'ConversationNotFoundError',
    'NotParticipantError',
    'EmptyMessageError',
    'MessageTooLongError',
    'SenderNotParticipantError',
  ],
  constants: ['DM_CONSTANTS'],
  stores: ['USER_MUTE_RECORDS'],
} as const;
