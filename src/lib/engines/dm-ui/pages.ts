// pages.ts — pure renderThreadPage() and renderConversationsPage().
// W83-A dm-messages-ui engine-adapter layer.

import { h } from '../../../components/react-stubs.js';
import type {
  Conversa,
  ConversaId,
  Mensagem,
  MensagemId,
  QuoteReply,
  Usuario,
  UsuarioId,
} from './types.ts';
import type { ChatState } from './chatReducer.ts';
import type { DmAdapter } from './InMemoryDmAdapter.ts';
import { extractMentions, detectSacredTermsInMessage } from './InMemoryDmAdapter.ts';
import { chatReducer, initialChatState } from './chatReducer.ts';

import { ConversationsListPage } from '../../../components/dm/ui/ConversationsListPage.ts';
import type { ConversationsListPageProps } from '../../../components/dm/ui/ConversationsListPage.ts';
import { ChatThreadPage } from '../../../components/dm/ui/ChatThreadPage.ts';
import type { ChatThreadPageProps } from '../../../components/dm/ui/ChatThreadPage.ts';

export type DmRouteName = 'list' | 'thread';

export interface ListRouteState {
  readonly name: 'list';
  readonly searchQuery: string;
  readonly incluirArquivadas: boolean;
}

export interface ThreadRouteState {
  readonly name: 'thread';
  readonly conversaId: ConversaId;
}

export type DmRouteState = ListRouteState | ThreadRouteState;

export interface PageActions {
  readonly onSelectConversa: (id: ConversaId) => void;
  readonly onBackToList: () => void;
  readonly onChangeSearchQuery: (q: string) => void;
  readonly onToggleArquivadas: () => void;
  readonly onSendMessage: () => void;
  readonly onChangeDraft: (texto: string) => void;
  readonly onAcceptMentionSuggestion: (usuarioId: UsuarioId, handle: string) => void;
  readonly onClearReply: () => void;
  readonly onReplyTo: (mensagemId: MensagemId) => void;
  readonly onToggleMute: () => void;
  readonly onArchive: () => void;
  readonly onAcceptConsent: (scopes: ReadonlyArray<'message_read' | 'message_send' | 'presence'>) => void;
  readonly onDeclineConsent: () => void;
}

export interface ThreadContext {
  readonly conversa: Conversa;
  readonly mensagens: ReadonlyArray<Mensagem>;
  readonly outros: ReadonlyArray<Usuario>;
  readonly autoresByMensagemId: Readonly<Record<UsuarioId, Usuario>>;
  readonly onlineUsers: ReadonlyArray<UsuarioId>;
  readonly chatState: ChatState;
  readonly errorMessage: string | null;
  readonly consentOpen: boolean;
}

export interface ListContext {
  readonly conversas: ReadonlyArray<Conversa>;
  readonly outrosByConversa: Readonly<Record<ConversaId, ReadonlyArray<Usuario>>>;
  readonly onlineUsers: ReadonlyArray<UsuarioId>;
  readonly unreadTotal: number;
  readonly currentUserNome: string;
}

export function buildReplyTo(
  mensagemId: MensagemId,
  mensagens: ReadonlyArray<Mensagem>,
  autoresById: Readonly<Record<UsuarioId, Usuario>>
): QuoteReply | null {
  const target = mensagens.find((m) => m.id === mensagemId);
  if (!target) return null;
  const autor = autoresById[target.remetenteId];
  if (!autor) return null;
  return {
    mensagemId: target.id,
    autorNome: autor.nome,
    preview: target.conteudo.slice(0, 60),
  };
}

export function applyUpdateDraft(
  state: ChatState,
  texto: string,
  usuariosParaMencao: ReadonlyArray<Usuario>
): ChatState {
  const mentions = extractMentions(texto, usuariosParaMencao);
  const sacredHits = detectSacredTermsInMessage(texto);
  return chatReducer(state, {
    type: 'UPDATE_DRAFT',
    texto,
    mentions,
    sacredHits,
  });
}

export function computeChatStateAfterSend(
  state: ChatState,
  conversaId: ConversaId,
  remetenteId: UsuarioId,
  outros: ReadonlyArray<Usuario>,
  sendFn: (args: { conversaId: ConversaId; remetenteId: UsuarioId; conteudo: string; mentions?: ReadonlyArray<UsuarioId>; replyToId?: MensagemId | null }) => Mensagem
): { nextState: ChatState; mensagem: Mensagem | null; consentOpen: boolean } {
  if (state.name !== 'composing' && state.name !== 'idle' && state.name !== 'error') {
    return { nextState: state, mensagem: null, consentOpen: state.name === 'awaiting-consent' };
  }
  const texto = state.draft.texto.trim();
  if (texto.length === 0) {
    return { nextState: state, mensagem: null, consentOpen: false };
  }
  const replyToId = state.draft.replyTo ? state.draft.replyTo.mensagemId : null;
  const mentions = state.draft.mentions;
  const mensagem = sendFn({
    conversaId,
    remetenteId,
    conteudo: texto,
    mentions,
    replyToId,
  });
  return {
    nextState: initialChatState(),
    mensagem,
    consentOpen: false,
  };
}

export interface RenderPageArgs {
  readonly route: DmRouteState;
  readonly adapter: DmAdapter;
  readonly currentUserId: UsuarioId;
  readonly listCtx: ListContext;
  readonly threadCtx: ThreadContext | null;
  readonly actions: PageActions;
}

export function renderPage(args: RenderPageArgs): JSX.Element {
  const { route, listCtx, actions } = args;
  if (route.name === 'list') {
    const props: ConversationsListPageProps = {
      conversas: listCtx.conversas,
      outrosByConversa: listCtx.outrosByConversa,
      onlineUsers: listCtx.onlineUsers,
      selectedConversaId: null,
      unreadTotal: listCtx.unreadTotal,
      searchQuery: route.searchQuery,
      incluirArquivadas: route.incluirArquivadas,
      onSelectConversa: actions.onSelectConversa,
      onChangeSearchQuery: actions.onChangeSearchQuery,
      onToggleArquivadas: actions.onToggleArquivadas,
      currentUserNome: listCtx.currentUserNome,
    };
    return h(ConversationsListPage, props);
  }
  // route.name === 'thread'
  if (!args.threadCtx) {
    return h(ConversationsListPage, {
      conversas: listCtx.conversas,
      outrosByConversa: listCtx.outrosByConversa,
      onlineUsers: listCtx.onlineUsers,
      selectedConversaId: null,
      unreadTotal: listCtx.unreadTotal,
      searchQuery: '',
      incluirArquivadas: false,
      onSelectConversa: actions.onSelectConversa,
      onChangeSearchQuery: actions.onChangeSearchQuery,
      onToggleArquivadas: actions.onToggleArquivadas,
      currentUserNome: listCtx.currentUserNome,
    });
  }
  const t = args.threadCtx;
  const props: ChatThreadPageProps = {
    conversa: t.conversa,
    mensagens: t.mensagens,
    currentUserId: args.currentUserId,
    outros: t.outros,
    autoresByMensagemId: t.autoresByMensagemId,
    state: t.chatState,
    errorMessage: t.errorMessage,
    onChangeDraft: actions.onChangeDraft,
    onAcceptMentionSuggestion: actions.onAcceptMentionSuggestion,
    onClearReply: actions.onClearReply,
    onReplyTo: actions.onReplyTo,
    onSend: actions.onSendMessage,
    onBack: actions.onBackToList,
    onToggleMute: actions.onToggleMute,
    onArchive: actions.onArchive,
    consentOpen: t.consentOpen,
    onAcceptConsent: actions.onAcceptConsent,
    onDeclineConsent: actions.onDeclineConsent,
  };
  return h(ChatThreadPage, props);
}