// ============================================================================
// DM CONVERSATIONS — Conversation lifecycle (1-on-1 / group)
// ============================================================================
// Cria/encontra/expulsa conversas, gerencia participants, idempotência 1-on-1.
// ============================================================================
// CONTRATO PÚBLICO:
//   createConversation(participantIds, options?)
//   findOrCreateConversation(participantIds)
//   getConversationParticipants(conversationId)
//   addParticipant / removeParticipant / leaveConversation
//   isParticipant(conversationId, userId)
//   countParticipants / listUserConversations
// ============================================================================

import {
  getConversationStore,
  toConversationId,
  toUserId,
  type ConversationId,
  type UserId,
  type Conversation,
  type ConversationType,
  type CreateConversationOptions,
} from './dm-shared.ts';
import { NotParticipantError } from './dm-engine.ts';

// ============================================================================
// CONSTANTES
// ============================================================================

const MAX_PARTICIPANTS_GROUP = 32;
const MIN_PARTICIPANTS_DIRECT = 2;
const MAX_TITLE_LENGTH = 80;

let _convCounter = 0;
function nextConvId(): ConversationId {
  _convCounter += 1;
  return `conv_${Date.now().toString(36)}_${_convCounter.toString(36)}` as ConversationId;
}

// ============================================================================
// ERROS
// ============================================================================

export class DMConversationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DMConversationError';
    this.code = code;
  }
}

export class EmptyParticipantsError extends DMConversationError {
  constructor() {
    super('EMPTY_PARTICIPANTS', 'É necessário ao menos 1 participante');
    this.name = 'EmptyParticipantsError';
  }
}

export class DuplicateParticipantsError extends DMConversationError {
  constructor() {
    super('DUPLICATE_PARTICIPANTS', 'Lista de participantes contém duplicados');
    this.name = 'DuplicateParticipantsError';
  }
}

export class TooManyParticipantsError extends DMConversationError {
  constructor(max: number) {
    super('TOO_MANY_PARTICIPANTS', `Máximo de ${max} participantes`);
    this.name = 'TooManyParticipantsError';
  }
}

export class NotGroupError extends DMConversationError {
  constructor() {
    super('NOT_GROUP', 'Operação só permitida em grupos');
    this.name = 'NotGroupError';
  }
}

export class CannotAddToDirectError extends DMConversationError {
  constructor() {
    super('CANNOT_ADD_TO_DIRECT', 'Não é possível adicionar participantes a conversa direta');
    this.name = 'CannotAddToDirectError';
  }
}

export class AlreadyParticipantError extends DMConversationError {
  constructor(userId: UserId) {
    super('ALREADY_PARTICIPANT', `Usuário ${userId} já é participante`);
    this.name = 'AlreadyParticipantError';
  }
}

export class NotAParticipantError extends DMConversationError {
  constructor(userId: UserId) {
    super('NOT_A_PARTICIPANT', `Usuário ${userId} não é participante`);
    this.name = 'NotAParticipantError';
  }
}

export class CannotRemoveLastError extends DMConversationError {
  constructor() {
    super('CANNOT_REMOVE_LAST', 'Não é possível remover o último participante de conversa direta');
    this.name = 'CannotRemoveLastError';
  }
}

export class TitleTooLongError extends DMConversationError {
  constructor(max: number) {
    super('TITLE_TOO_LONG', `Título excede ${max} caracteres`);
    this.name = 'TitleTooLongError';
  }
}

// ============================================================================
// HELPERS — ordenação canônica para idempotência 1-on-1
// ============================================================================

function canonicalizeParticipants(ids: UserId[]): UserId[] {
  const sorted = ids.slice().sort();
  return Array.from(new Set(sorted));
}

function participantsKey(ids: UserId[]): string {
  return canonicalizeParticipants(ids).join('|');
}

// ============================================================================
// createConversation — 1-on-1 ou grupo
// ============================================================================

export function createConversation(
  participantIds: UserId[],
  options: CreateConversationOptions = {}
): Conversation {
  if (participantIds.length === 0) throw new EmptyParticipantsError();
  const unique = Array.from(new Set(participantIds));
  if (unique.length !== participantIds.length) {
    throw new DuplicateParticipantsError();
  }

  const isGroup = options.isGroup ?? (unique.length > MIN_PARTICIPANTS_DIRECT);
  const type: ConversationType = isGroup ? 'group' : 'direct';

  if (type === 'group' && unique.length > MAX_PARTICIPANTS_GROUP) {
    throw new TooManyParticipantsError(MAX_PARTICIPANTS_GROUP);
  }
  if (type === 'direct' && unique.length !== MIN_PARTICIPANTS_DIRECT) {
    throw new TooManyParticipantsError(MIN_PARTICIPANTS_DIRECT);
  }

  let title: string | null = options.title ?? null;
  if (title && title.length > MAX_TITLE_LENGTH) {
    throw new TitleTooLongError(MAX_TITLE_LENGTH);
  }
  // group sem título vira "Grupo (4)" etc.
  if (type === 'group' && title === null) {
    title = `Grupo (${unique.length})`;
  }

  const now = new Date();
  const id = nextConvId();
  const createdBy = unique[0]; // primeiro da lista = "criador"

  const conversation: Conversation = {
    id,
    type,
    title,
    participantIds: unique,
    createdAt: now,
    lastMessageAt: now,
    lastMessagePreview: '',
    unreadCount: 0,
    createdBy,
    deletedBy: [],
    metadata: options.metadata ?? {},
  };

  getConversationStore().set(id, conversation);

  // popula DIRECT_LOOKUP para 1-on-1 (idempotência via findOrCreate)
  if (type === 'direct') {
    const key = participantsKey(unique);
    DIRECT_LOOKUP.set(key, id);
  }

  return conversation;
}

// ============================================================================
// findOrCreateConversation — idempotente para 1-on-1 (match por par ordenado)
// ============================================================================

// mapa de chave canônica -> ConversationId para lookup O(1)
const DIRECT_LOOKUP = new Map<string, ConversationId>();

export function findOrCreateConversation(
  participantIds: UserId[]
): Conversation {
  if (participantIds.length !== 2) {
    return createConversation(participantIds, { isGroup: true });
  }
  const key = participantsKey(participantIds);
  const existingId = DIRECT_LOOKUP.get(key);
  if (existingId) {
    const conv = getConversationStore().get(existingId);
    if (conv) return conv;
    DIRECT_LOOKUP.delete(key); // limpo dangling
  }
  const created = createConversation(participantIds, { isGroup: false });
  DIRECT_LOOKUP.set(key, created.id);
  return created;
}

// ============================================================================
// getConversationParticipants — lista simples com tipo e título
// ============================================================================

export interface ParticipantsInfo {
  conversationId: ConversationId;
  type: ConversationType;
  title: string | null;
  participants: UserId[];
  createdBy: UserId;
}

export function getConversationParticipants(
  conversationId: ConversationId
): ParticipantsInfo {
  const conv = getConversationStore().get(conversationId);
  if (!conv) {
    throw new NotParticipantError(conversationId, 'unknown' as UserId);
  }
  return {
    conversationId,
    type: conv.type,
    title: conv.title,
    participants: conv.participantIds.slice(),
    createdBy: conv.createdBy,
  };
}

// ============================================================================
// addParticipant — só grupos
// ============================================================================

export function addParticipant(
  conversationId: ConversationId,
  userId: UserId,
  addedBy: UserId
): Conversation {
  const conv = getConversationStore().get(conversationId);
  if (!conv) throw new NotParticipantError(conversationId, addedBy);
  if (conv.type !== 'group') throw new CannotAddToDirectError();
  if (!conv.participantIds.includes(addedBy)) {
    throw new NotParticipantError(conversationId, addedBy);
  }
  if (conv.participantIds.includes(userId)) {
    throw new AlreadyParticipantError(userId);
  }
  if (conv.participantIds.length + 1 > MAX_PARTICIPANTS_GROUP) {
    throw new TooManyParticipantsError(MAX_PARTICIPANTS_GROUP);
  }
  conv.participantIds.push(userId);
  if (conv.title?.startsWith('Grupo (')) {
    conv.title = `Grupo (${conv.participantIds.length})`;
  }
  getConversationStore().set(conversationId, conv);
  return conv;
}

// ============================================================================
// removeParticipant — só grupos; criador pode remover outros
// ============================================================================

export interface RemoveParticipantResult {
  conversation: Conversation;
  emptied: boolean;
}

export function removeParticipant(
  conversationId: ConversationId,
  userId: UserId,
  removedBy: UserId
): RemoveParticipantResult {
  const conv = getConversationStore().get(conversationId);
  if (!conv) throw new NotParticipantError(conversationId, removedBy);
  if (conv.type !== 'group') {
    throw new CannotRemoveLastError(); // em direto, "sair" deixa a conversa vazia
  }
  if (!conv.participantIds.includes(removedBy)) {
    throw new NotParticipantError(conversationId, removedBy);
  }
  if (!conv.participantIds.includes(userId)) {
    throw new NotAParticipantError(userId);
  }
  const idx = conv.participantIds.indexOf(userId);
  conv.participantIds.splice(idx, 1);

  if (conv.title?.startsWith('Grupo (')) {
    conv.title = `Grupo (${conv.participantIds.length})`;
  }

  let emptied = false;
  if (conv.participantIds.length === 0) {
    // grupo vazio: marcar para remoção lógica
    getConversationStore().delete(conversationId);
    emptied = true;
  } else {
    getConversationStore().set(conversationId, conv);
  }
  return { conversation: conv, emptied };
}

// ============================================================================
// leaveConversation — voluntário
// ============================================================================

export function leaveConversation(
  conversationId: ConversationId,
  userId: UserId
): Conversation | null {
  const conv = getConversationStore().get(conversationId);
  if (!conv) return null;
  if (!conv.participantIds.includes(userId)) {
    throw new NotParticipantError(conversationId, userId);
  }
  // Em conversa direta: sair = remover a conversa
  if (conv.type === 'direct') {
    if (conv.participantIds.length === 2) {
      const other = conv.participantIds.find((u) => u !== userId);
      const canonical = canonicalizeParticipants(conv.participantIds);
      DIRECT_LOOKUP.delete(canonical.join('|'));
      if (other) DIRECT_LOOKUP.delete(participantsKey([other]));
      getConversationStore().delete(conversationId);
      return null;
    }
    // conversa direta com < 2 participantes não deveria existir, mas defensiva
  }
  // grupo: remove via removeParticipant com removedBy=userId
  return removeParticipant(conversationId, userId, userId).conversation;
}

// ============================================================================
// isParticipant — authz helper
// ============================================================================

export function isParticipant(
  conversationId: ConversationId,
  userId: UserId
): boolean {
  const conv = getConversationStore().get(conversationId);
  if (!conv) return false;
  return conv.participantIds.includes(userId);
}

// ============================================================================
// countParticipants / listUserConversations
// ============================================================================

export function countParticipants(conversationId: ConversationId): number {
  const conv = getConversationStore().get(conversationId);
  if (!conv) return 0;
  return conv.participantIds.length;
}

export interface ConversationSummary {
  id: ConversationId;
  type: ConversationType;
  title: string | null;
  participantCount: number;
  lastMessageAt: Date;
  lastMessagePreview: string;
}

export function listUserConversations(userId: UserId): ConversationSummary[] {
  const out: ConversationSummary[] = [];
  for (const c of getConversationStore().values()) {
    if (!c.participantIds.includes(userId)) continue;
    if (c.deletedBy.includes(userId)) continue;
    out.push({
      id: c.id,
      type: c.type,
      title: c.title,
      participantCount: c.participantIds.length,
      lastMessageAt: c.lastMessageAt,
      lastMessagePreview: c.lastMessagePreview,
    });
  }
  out.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  return out;
}

// ============================================================================
// __ALL_EXPORTS
// ============================================================================

export const DM_CONVERSATIONS_EXPORTS = {
  functions: [
    'createConversation',
    'findOrCreateConversation',
    'getConversationParticipants',
    'addParticipant',
    'removeParticipant',
    'leaveConversation',
    'isParticipant',
    'countParticipants',
    'listUserConversations',
  ],
  types: [
    'ConversationId',
    'UserId',
    'Conversation',
    'ConversationType',
    'CreateConversationOptions',
    'ParticipantsInfo',
    'RemoveParticipantResult',
    'ConversationSummary',
  ],
  errors: [
    'DMConversationError',
    'EmptyParticipantsError',
    'DuplicateParticipantsError',
    'TooManyParticipantsError',
    'NotGroupError',
    'CannotAddToDirectError',
    'AlreadyParticipantError',
    'NotAParticipantError',
    'CannotRemoveLastError',
    'TitleTooLongError',
  ],
  constants: ['MAX_PARTICIPANTS_GROUP', 'MIN_PARTICIPANTS_DIRECT', 'MAX_TITLE_LENGTH'],
  stores: ['DIRECT_LOOKUP'],
} as const;
