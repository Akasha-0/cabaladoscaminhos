// index.ts — public exports for the dm-ui engine package
// W83-A dm-messages-ui.

export type {
  UsuarioId,
  ConversaId,
  MensagemId,
  Tradicao,
  TipoConversa,
  StatusMensagem,
  Usuario,
  Mensagem,
  Conversa,
  SacredHit,
  ConsentRecord,
  ConsentStatus,
  QuoteReply,
  ComposerDraft,
} from './types.ts';

export {
  TRADICOES,
  toUsuarioId,
  toConversaId,
  toMensagemId,
} from './types.ts';

export {
  SAMPLE_USUARIOS,
  SAMPLE_CONVERSAS,
  SAMPLE_MENSAGENS,
  SACRED_CATALOG_DM,
  DEFAULT_CURRENT_USER_ID,
  detectSacredTermsInMessage,
  extractMentions,
  createInMemoryDmAdapter,
} from './InMemoryDmAdapter.ts';

export type {
  DetectedSacredHit,
  DmAdapter,
} from './InMemoryDmAdapter.ts';

export {
  initialChatState,
  chatReducer,
  isComposingState,
  canSendMessage,
  hasUnsavedDraft,
  errorMessage,
  currentDraftText,
  replyTo,
  detectedSacredHits,
} from './chatReducer.ts';

export type {
  ChatState,
  ChatStateIdle,
  ChatStateComposing,
  ChatStateSending,
  ChatStateAwaitingConsent,
  ChatStateError,
  ChatEvent,
} from './chatReducer.ts';