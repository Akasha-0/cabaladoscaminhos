// index.ts — public exports for the dm component package

// Types
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
} from '../../lib/engines/dm-ui/types.ts';

export {
  TRADICOES,
  toUsuarioId,
  toConversaId,
  toMensagemId,
} from '../../lib/engines/dm-ui/types.ts';

// Engine
export {
  SAMPLE_USUARIOS,
  SAMPLE_CONVERSAS,
  SAMPLE_MENSAGENS,
  SACRED_CATALOG_DM,
  DEFAULT_CURRENT_USER_ID,
  detectSacredTermsInMessage,
  extractMentions,
  createInMemoryDmAdapter,
} from '../../lib/engines/dm-ui/InMemoryDmAdapter.ts';

export type {
  DetectedSacredHit,
  DmAdapter,
} from '../../lib/engines/dm-ui/InMemoryDmAdapter.ts';

export {
  initialChatState,
  chatReducer,
  isComposingState,
  canSendMessage,
  hasUnsavedDraft,
} from '../../lib/engines/dm-ui/chatReducer.ts';

export type {
  ChatState,
  ChatEvent,
} from '../../lib/engines/dm-ui/chatReducer.ts';

// UI components (note: .ts files)
export { ConversationsListPage } from './ui/ConversationsListPage.ts';
export type { ConversationsListPageProps } from './ui/ConversationsListPage.ts';

export { ChatThreadPage } from './ui/ChatThreadPage.ts';
export type { ChatThreadPageProps } from './ui/ChatThreadPage.ts';

export { ConversationListItem } from './ui/ConversationListItem.ts';
export type { ConversationListItemProps } from './ui/ConversationListItem.ts';

export { MessageBubble } from './ui/MessageBubble.ts';
export type { MessageBubbleProps } from './ui/MessageBubble.ts';

export { MessageComposer } from './ui/MessageComposer.ts';
export type { MessageComposerProps } from './ui/MessageComposer.ts';

export { ConsentGate } from './ui/ConsentGate.ts';
export type { ConsentGateProps } from './ui/ConsentGate.ts';