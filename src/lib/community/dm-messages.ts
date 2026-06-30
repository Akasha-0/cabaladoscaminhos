// ============================================================================
// DM MESSAGES — Message-level state (read receipts, delivery, search)
// ============================================================================
// Gerencia readBy/deliveredTo, contagens de não-lidas, full-text search.
// ============================================================================
// CONTRATO PÚBLICO:
//   markAsRead(messageId, userId)
//   markAsDelivered(messageId, userId)
//   markAllAsRead(conversationId, userId)
//   getUnreadCount(conversationId, userId)
//   getTotalUnreadCount(userId)
//   getMessage(messageId)
//   getConversationMessages(conversationId, options?)
//   searchMessages(userId, query, options?)
//   getMessageStatus(messageId, viewerId)
// ============================================================================

import {
  getConversationStore,
  getMessageStore,
  type ConversationId,
  type UserId,
  type MessageId,
  type DirectMessage,
  type MessageSearchOptions,
} from './dm-shared.ts';
import { ConversationNotFoundError, NotParticipantError } from './dm-engine.ts';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_MSG_PAGE = 50;
const MAX_MSG_PAGE = 200;
export const MESSAGE_STATUSES = ['sent', 'delivered', 'read'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

// ============================================================================
// ERROS
// ============================================================================

export class DMMessageError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DMMessageError';
    this.code = code;
  }
}

export class MessageNotFoundError extends DMMessageError {
  constructor(id: MessageId) {
    super('MESSAGE_NOT_FOUND', `Mensagem ${id} não encontrada`);
    this.name = 'MessageNotFoundError';
  }
}

export class InvalidQueryError extends DMMessageError {
  constructor() {
    super('INVALID_QUERY', 'Query vazia ou inválida');
    this.name = 'InvalidQueryError';
  }
}

// ============================================================================
// HELPERS — invariants
// ============================================================================

function findMessage(messageId: MessageId): DirectMessage | null {
  for (const arr of getMessageStore().values()) {
    for (const m of arr) {
      if (m.id === messageId) return m;
    }
  }
  return null;
}

function isParticipant(conversationId: ConversationId, userId: UserId): boolean {
  const c = getConversationStore().get(conversationId);
  return c !== undefined && c.participantIds.includes(userId);
}

// ============================================================================
// markAsRead / markAsDelivered
// ============================================================================

export function markAsRead(messageId: MessageId, userId: UserId): DirectMessage {
  const msg = findMessage(messageId);
  if (!msg) throw new MessageNotFoundError(messageId);
  if (!isParticipant(msg.conversationId, userId)) {
    throw new NotParticipantError(msg.conversationId, userId);
  }
  if (!msg.readBy.includes(userId)) msg.readBy.push(userId);

  // ao marcar última mensagem como lida, zera unreadCount do viewer
  const conv = getConversationStore().get(msg.conversationId);
  if (conv) {
    const convMsgs = getMessageStore().get(conv.id) ?? [];
    const allRead = convMsgs.every((m) => m.readBy.includes(userId));
    if (allRead || msg === convMsgs[convMsgs.length - 1]) {
      conv.unreadCount = 0;
      getConversationStore().set(conv.id, conv);
    } else {
      // recount
      let n = 0;
      for (const m of convMsgs) {
        if (m.senderId !== userId && !m.readBy.includes(userId)) n += 1;
      }
      conv.unreadCount = n;
      getConversationStore().set(conv.id, conv);
    }
  }
  return msg;
}

export function markAsDelivered(messageId: MessageId, userId: UserId): DirectMessage {
  const msg = findMessage(messageId);
  if (!msg) throw new MessageNotFoundError(messageId);
  if (!isParticipant(msg.conversationId, userId)) {
    throw new NotParticipantError(msg.conversationId, userId);
  }
  if (!msg.deliveredTo.includes(userId)) msg.deliveredTo.push(userId);
  return msg;
}

// ============================================================================
// markAllAsRead — conveniência para inbox
// ============================================================================

export interface MarkAllReadResult {
  marked: MessageId[];
  unreadBefore: number;
  unreadAfter: number;
}

export function markAllAsRead(
  conversationId: ConversationId,
  userId: UserId
): MarkAllReadResult {
  const conv = getConversationStore().get(conversationId);
  if (!conv) throw new ConversationNotFoundError(conversationId);
  if (!conv.participantIds.includes(userId)) {
    throw new NotParticipantError(conversationId, userId);
  }
  const convMsgs = getMessageStore().get(conversationId) ?? [];
  const marked: MessageId[] = [];
  const unreadBefore = conv.unreadCount;
  for (const m of convMsgs) {
    if (!m.readBy.includes(userId)) {
      m.readBy.push(userId);
      marked.push(m.id);
    }
  }
  conv.unreadCount = 0;
  getConversationStore().set(conversationId, conv);

  return {
    marked,
    unreadBefore,
    unreadAfter: 0,
  };
}

// ============================================================================
// getUnreadCount / getTotalUnreadCount
// ============================================================================

export function getUnreadCount(
  conversationId: ConversationId,
  userId: UserId
): number {
  const conv = getConversationStore().get(conversationId);
  if (!conv) return 0;
  if (!conv.participantIds.includes(userId)) return 0;

  // recount: por mensagens
  const msgs = getMessageStore().get(conversationId) ?? [];
  let n = 0;
  for (const m of msgs) {
    if (m.senderId !== userId && !m.readBy.includes(userId)) n += 1;
  }
  // se unreadCount do conv diverge, retorna o recount (fonte da verdade)
  return n;
}

export interface UnreadTotalByConversation {
  conversationId: ConversationId;
  unread: number;
}

export interface UnreadTotal {
  total: number;
  byConversation: UnreadTotalByConversation[];
}

export function getTotalUnreadCount(userId: UserId): UnreadTotal {
  const byConversation: UnreadTotalByConversation[] = [];
  let total = 0;
  for (const c of getConversationStore().values()) {
    if (!c.participantIds.includes(userId)) continue;
    if (c.deletedBy.includes(userId)) continue;
    const n = getUnreadCount(c.id, userId);
    if (n > 0) {
      byConversation.push({ conversationId: c.id, unread: n });
      total += n;
    }
  }
  byConversation.sort((a, b) => b.unread - a.unread);
  return { total, byConversation };
}

// ============================================================================
// getMessage / getConversationMessages
// ============================================================================

export function getMessage(messageId: MessageId): DirectMessage {
  const msg = findMessage(messageId);
  if (!msg) throw new MessageNotFoundError(messageId);
  return msg;
}

export interface ConversationMessagesOptions {
  limit?: number;
  cursor?: MessageId | null;
  ascending?: boolean;
}

export interface ConversationMessagesPage {
  messages: DirectMessage[];
  nextCursor: MessageId | null;
  prevCursor: MessageId | null;
  total: number;
}

export function getConversationMessages(
  conversationId: ConversationId,
  options: ConversationMessagesOptions = {}
): ConversationMessagesPage {
  const conv = getConversationStore().get(conversationId);
  if (!conv) throw new ConversationNotFoundError(conversationId);
  const limit = Math.min(options.limit ?? DEFAULT_MSG_PAGE, MAX_MSG_PAGE);
  const msgs = (getMessageStore().get(conversationId) ?? []).slice();
  // ordenar por createdAt
  msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let startIdx = 0;
  if (options.cursor) {
    const idx = msgs.findIndex((m) => m.id === options.cursor);
    startIdx = idx >= 0 ? idx : 0;
  }
  const slice = options.ascending
    ? msgs.slice(startIdx, startIdx + limit)
    : msgs.slice(Math.max(0, msgs.length - startIdx - limit), msgs.length - startIdx);

  let nextCursor: MessageId | null = null;
  let prevCursor: MessageId | null = null;
  if (slice.length > 0) {
    if (options.ascending && startIdx + limit < msgs.length) {
      nextCursor = slice[slice.length - 1].id;
    }
    if (!options.ascending && startIdx > 0) {
      prevCursor = slice[0].id;
    }
  }

  return {
    messages: slice,
    nextCursor,
    prevCursor,
    total: msgs.length,
  };
}

// ============================================================================
// searchMessages — full-text sobre mensagens do usuário
// ============================================================================

export interface MessageSearchHit {
  messageId: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  content: string;
  createdAt: Date;
  snippet: string;
  position: number;
}

export function searchMessages(
  userId: UserId,
  query: string,
  options: MessageSearchOptions = {}
): MessageSearchHit[] {
  if (!query || query.trim().length === 0) throw new InvalidQueryError();
  const q = options.caseSensitive ? query : query.toLowerCase();
  const limit = Math.min(options.limit ?? 100, 500);

  const out: MessageSearchHit[] = [];
  for (const [convId, msgs] of getMessageStore().entries()) {
    const conv = getConversationStore().get(convId);
    if (!conv) continue;
    if (!conv.participantIds.includes(userId)) continue;
    if (conv.deletedBy.includes(userId)) continue;
    if (options.conversationId && options.conversationId !== convId) continue;

    for (const m of msgs) {
      if (options.fromDate && m.createdAt < options.fromDate) continue;
      if (options.toDate && m.createdAt > options.toDate) continue;
      const haystack = options.caseSensitive ? m.content : m.content.toLowerCase();
      const idx = haystack.indexOf(q);
      if (idx < 0) continue;
      const start = Math.max(0, idx - 25);
      const end = Math.min(m.content.length, idx + q.length + 25);
      const snippet = (start > 0 ? '…' : '') + m.content.slice(start, end) + (end < m.content.length ? '…' : '');
      out.push({
        messageId: m.id,
        conversationId: convId,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt,
        snippet,
        position: idx,
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

// ============================================================================
// getMessageStatus — calcula status agregado do ponto de vista do viewer
// ============================================================================

export function getMessageStatus(
  messageId: MessageId,
  viewerId: UserId
): MessageStatus {
  const msg = findMessage(messageId);
  if (!msg) throw new MessageNotFoundError(messageId);
  // Se viewer é o remetente, status vem do "outro lado": entregue ou lido
  if (msg.senderId === viewerId) {
    const others = getOtherParticipants(msg.conversationId, viewerId);
    if (others.length === 0) return 'sent';
    const allRead = others.every((u) => msg.readBy.includes(u));
    if (allRead) return 'read';
    const anyDelivered = others.some((u) => msg.deliveredTo.includes(u));
    if (anyDelivered) return 'delivered';
    return 'sent';
  }
  // viewer é destinatário: status reflete se ele entregou/leu
  if (msg.readBy.includes(viewerId)) return 'read';
  if (msg.deliveredTo.includes(viewerId)) return 'delivered';
  return 'sent';
}

function getOtherParticipants(
  conversationId: ConversationId,
  viewerId: UserId
): UserId[] {
  const conv = getConversationStore().get(conversationId);
  if (!conv) return [];
  return conv.participantIds.filter((u) => u !== viewerId);
}

// ============================================================================
// __ALL_EXPORTS
// ============================================================================

export const DM_MESSAGES_EXPORTS = {
  functions: [
    'markAsRead',
    'markAsDelivered',
    'markAllAsRead',
    'getUnreadCount',
    'getTotalUnreadCount',
    'getMessage',
    'getConversationMessages',
    'searchMessages',
    'getMessageStatus',
  ],
  types: [
    'MessageStatus',
    'MessageNotFoundError',
    'ConversationNotFoundError',
    'NotParticipantError',
    'MarkAllReadResult',
    'UnreadTotal',
    'UnreadTotalByConversation',
    'ConversationMessagesPage',
    'ConversationMessagesOptions',
    'MessageSearchHit',
  ],
  constants: ['MESSAGE_STATUSES', 'DEFAULT_MSG_PAGE', 'MAX_MSG_PAGE'],
} as const;
