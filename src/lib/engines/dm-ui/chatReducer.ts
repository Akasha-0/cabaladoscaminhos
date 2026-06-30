// chatReducer.ts — state machine for the chat thread
// W83-A dm-messages-ui.
// States: idle | composing | sending | awaiting-consent | error
// Discriminated union (cycle 82 lesson).

import type {
  ComposerDraft,
  ConversaId,
  Mensagem,
  MensagemId,
  QuoteReply,
  SacredHit,
  UsuarioId,
} from './types.ts';
import type { DetectedSacredHit } from './InMemoryDmAdapter.ts';

// ============================================================================
// STATE — discriminated union
// ============================================================================

export interface ChatStateIdle {
  readonly name: 'idle';
  readonly draft: ComposerDraft;
  readonly errorMessage: string | null;
}

export interface ChatStateComposing {
  readonly name: 'composing';
  readonly draft: ComposerDraft;
  readonly cursorPos: number;
  readonly isDirty: boolean;
}

export interface ChatStateSending {
  readonly name: 'sending';
  readonly draft: ComposerDraft;
  readonly pendenteConteudo: string;
}

export interface ChatStateAwaitingConsent {
  readonly name: 'awaiting-consent';
  readonly draft: ComposerDraft;
  readonly pendenteConteudo: string;
  readonly consentScope: 'message_send';
}

export interface ChatStateError {
  readonly name: 'error';
  readonly draft: ComposerDraft;
  readonly errorMessage: string;
  readonly recoverable: boolean;
}

export type ChatState =
  | ChatStateIdle
  | ChatStateComposing
  | ChatStateSending
  | ChatStateAwaitingConsent
  | ChatStateError;

// ============================================================================
// EVENTS — discriminated union
// ============================================================================

export type ChatEvent =
  | { type: 'START_COMPOSING'; initialDraft?: ComposerDraft }
  | { type: 'UPDATE_DRAFT'; texto: string; mentions: ReadonlyArray<UsuarioId>; sacredHits: ReadonlyArray<DetectedSacredHit> }
  | { type: 'SET_REPLY_TO'; replyTo: QuoteReply | null }
  | { type: 'SEND_MESSAGE'; conversaId: ConversaId; remetenteId: UsuarioId }
  | { type: 'SEND_SUCCESS'; mensagem: Mensagem }
  | { type: 'SEND_FAILURE'; errorMessage: string }
  | { type: 'REQUEST_CONSENT' }
  | { type: 'CONSENT_GRANTED'; scopes: ReadonlyArray<'message_read' | 'message_send' | 'presence'> }
  | { type: 'CONSENT_DECLINED' }
  | { type: 'CLEAR_REPLY' }
  | { type: 'RESET' };

// ============================================================================
// HELPERS — pure constructors
// ============================================================================

function emptyDraft(): ComposerDraft {
  return Object.freeze({
    texto: '',
    mentions: Object.freeze([]),
    replyTo: null,
    sacredHits: Object.freeze([]),
  });
}

export function initialChatState(): ChatState {
  return Object.freeze({
    name: 'idle',
    draft: emptyDraft(),
    errorMessage: null,
  });
}

export function isComposingState(s: ChatState): s is ChatStateComposing | ChatStateSending | ChatStateAwaitingConsent {
  return s.name === 'composing' || s.name === 'sending' || s.name === 'awaiting-consent';
}

export function canSendMessage(s: ChatState): boolean {
  if (s.name === 'sending') return false;
  if (s.name === 'awaiting-consent') return false;
  if (s.name === 'idle' || s.name === 'composing' || s.name === 'error') {
    return s.draft.texto.trim().length > 0 && s.draft.texto.length <= 4000;
  }
  return false;
}

// ============================================================================
// REDUCER — pure function
// ============================================================================

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case 'START_COMPOSING': {
      const draft = event.initialDraft ?? emptyDraft();
      return Object.freeze({
        name: 'composing',
        draft,
        cursorPos: draft.texto.length,
        isDirty: false,
      });
    }

    case 'UPDATE_DRAFT': {
      if (state.name !== 'composing' && state.name !== 'idle' && state.name !== 'error') {
        return state;
      }
      const draft: ComposerDraft = Object.freeze({
        texto: event.texto,
        mentions: Object.freeze(event.mentions.slice()),
        replyTo: state.draft.replyTo,
        sacredHits: Object.freeze(event.sacredHits.slice()),
      });
      if (state.name === 'composing') {
        return Object.freeze({
          ...state,
          draft,
          cursorPos: event.texto.length,
          isDirty: true,
        });
      }
      if (state.name === 'idle' || state.name === 'error') {
        return Object.freeze({
          name: 'composing',
          draft,
          cursorPos: event.texto.length,
          isDirty: true,
        });
      }
      return state;
    }

    case 'SET_REPLY_TO': {
      if (state.name === 'sending' || state.name === 'awaiting-consent') {
        return state;
      }
      const draft: ComposerDraft = Object.freeze({
        ...state.draft,
        replyTo: event.replyTo,
      });
      if (state.name === 'composing') {
        return Object.freeze({ ...state, draft });
      }
      return Object.freeze({ ...state, draft });
    }

    case 'CLEAR_REPLY': {
      const draft: ComposerDraft = Object.freeze({
        ...state.draft,
        replyTo: null,
      });
      return Object.freeze({ ...state, draft });
    }

    case 'SEND_MESSAGE': {
      if (state.name !== 'composing' && state.name !== 'idle' && state.name !== 'error') {
        return state;
      }
      const texto = state.draft.texto.trim();
      if (texto.length === 0) {
        return Object.freeze({
          name: 'error',
          draft: state.draft,
          errorMessage: 'Mensagem vazia',
          recoverable: true,
        });
      }
      // If error state and not recoverable, ignore send
      if (state.name === 'error' && !state.recoverable) {
        return state;
      }
      return Object.freeze({
        name: 'sending',
        draft: state.draft,
        pendenteConteudo: texto,
      });
    }

    case 'SEND_SUCCESS': {
      return Object.freeze({
        name: 'idle',
        draft: emptyDraft(),
        errorMessage: null,
      });
    }

    case 'SEND_FAILURE': {
      return Object.freeze({
        name: 'error',
        draft: state.draft,
        errorMessage: event.errorMessage,
        recoverable: true,
      });
    }

    case 'REQUEST_CONSENT': {
      if (state.name !== 'sending') {
        return state;
      }
      return Object.freeze({
        name: 'awaiting-consent',
        draft: state.draft,
        pendenteConteudo: state.pendenteConteudo,
        consentScope: 'message_send',
      });
    }

    case 'CONSENT_GRANTED': {
      if (state.name !== 'awaiting-consent') {
        return state;
      }
      // Re-enter sending after consent granted.
      return Object.freeze({
        name: 'sending',
        draft: state.draft,
        pendenteConteudo: state.pendenteConteudo,
      });
    }

    case 'CONSENT_DECLINED': {
      if (state.name !== 'awaiting-consent') {
        return state;
      }
      return Object.freeze({
        name: 'error',
        draft: state.draft,
        errorMessage: 'Consentimento LGPD recusado. Nao e possivel enviar mensagens.',
        recoverable: false,
      });
    }

    case 'RESET': {
      return initialChatState();
    }

    default: {
      return state;
    }
  }
}

// ============================================================================
// DERIVED HELPERS — for UI consumers
// ============================================================================

export function hasUnsavedDraft(state: ChatState): boolean {
  return (state.name === 'composing' && state.isDirty) || state.name === 'sending' || state.name === 'awaiting-consent';
}

export function errorMessage(state: ChatState): string | null {
  return state.name === 'error' ? state.errorMessage : null;
}

export function currentDraftText(state: ChatState): string {
  return state.draft.texto;
}

export function replyTo(state: ChatState): QuoteReply | null {
  return state.draft.replyTo;
}

export function detectedSacredHits(state: ChatState): ReadonlyArray<SacredHit> {
  return state.draft.sacredHits;
}