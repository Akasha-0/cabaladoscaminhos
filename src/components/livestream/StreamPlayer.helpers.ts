// W80-D StreamPlayer.helpers — pure functions (no React dependency).
// Split out so the spec harness can test them at runtime without React.
// The main StreamPlayer.tsx re-exports these so consumers see one surface area.

import type {
  StreamState,
  ChatMessage,
  SacredContentFlag,
  StreamChannel,
  StreamKind,
  ViewerCount,
} from './engine-types.ts';
export type {
  StreamState, ChatMessage, SacredContentFlag, StreamChannel, StreamKind, ViewerCount,
} from './engine-types.ts';

import { TRADITION_KIND_LABELS } from './__mock_engine__.ts';

// ---------- Constants ----------
export const MIN_TOUCH_TARGET_PX = 44;
export const MAX_CHAT_LEN = 280;
export const CHAT_PAGE_SIZE = 30;

// ---------- Type definitions for state machine ----------

export type MachineState = {
  streamState: StreamState;
  viewers: ViewerCount;
  chat: readonly ChatMessage[];
  paused: boolean;
  muted: boolean;
  audioConsentApproved: boolean;
  draft: string;
  pendingChat: number;
  failedChat: number;
};

export type MachineAction =
  | { type: 'STREAM_STATE'; payload: StreamState }
  | { type: 'VIEWERS'; payload: ViewerCount }
  | { type: 'CHAT_INCOMING'; payload: ChatMessage }
  | { type: 'CHAT_PAGE'; payload: readonly ChatMessage[] }
  | { type: 'CHAT_SEND_PENDING' }
  | { type: 'CHAT_SEND_RESOLVED'; payload: { tempId: string; ok: boolean } }
  | { type: 'DRAFT'; payload: string }
  | { type: 'CONSENT_APPROVED' }
  | { type: 'CONSENT_REVOKED' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'TOGGLE_MUTE' };

// ---------- Pure helpers ----------

/** Compact viewer count: 1.2k, 12k, 1.5M */
export function formatViewerCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** PT-BR label for a tradition kind. */
export function genreLabel(kind: StreamKind): string {
  return TRADITION_KIND_LABELS[kind] ?? kind;
}

/** Format viewer count for screen readers (PT-BR). */
export function formatViewerSr(current: number, peak: number): string {
  const cur = current === 1 ? '1 espectador' : `${current} espectadores`;
  const pk = peak === 1 ? '1 pico' : `${peak} de pico`;
  return `${cur} assistindo, ${pk} registrado`;
}

/** HH:MM UTC. */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** locale-relative from-now in PT-BR ("há 3 min"). */
export function timeAgoPtBr(ts: number, now: number): string {
  const sec = Math.max(0, Math.floor((now - ts) / 1000));
  if (sec < 60) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `há ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `há ${hr} h`;
  const day = Math.floor(hr / 24);
  return `há ${day} d`;
}

/** Pure reducer for StreamPlayer machine state. */
export function reduceStreamPlayer(state: MachineState, action: MachineAction): MachineState {
  switch (action.type) {
    case 'STREAM_STATE':
      return { ...state, streamState: action.payload };
    case 'VIEWERS':
      return { ...state, viewers: action.payload };
    case 'CHAT_INCOMING':
      return { ...state, chat: [...state.chat, action.payload] };
    case 'CHAT_PAGE':
      return { ...state, chat: [...action.payload, ...state.chat] };
    case 'CHAT_SEND_PENDING':
      return { ...state, pendingChat: state.pendingChat + 1 };
    case 'CHAT_SEND_RESOLVED': {
      const ok = action.payload.ok;
      return {
        ...state,
        pendingChat: Math.max(0, state.pendingChat - 1),
        failedChat: state.failedChat + (ok ? 0 : 1),
      };
    }
    case 'DRAFT':
      return { ...state, draft: action.payload };
    case 'CONSENT_APPROVED':
      return { ...state, audioConsentApproved: true };
    case 'CONSENT_REVOKED':
      return { ...state, audioConsentApproved: false, muted: true };
    case 'TOGGLE_PLAY':
      return { ...state, paused: !state.paused };
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };
  }
}

/** Initial state factory for a viewer. */
export function initMachineState(audioApproved: boolean): MachineState {
  return {
    streamState: 'PENDING',
    viewers: { current: 0, peak: 0, updatedAt: Date.now() },
    chat: [],
    paused: true,
    muted: true,
    audioConsentApproved: audioApproved,
    draft: '',
    pendingChat: 0,
    failedChat: 0,
  };
}

/** Permission gate: can we unmute right now given sacred flag? */
export function canUnmuteAudio(state: MachineState, sacred: SacredContentFlag): boolean {
  if (!sacred.requiresAudioConsent) return true;
  return state.audioConsentApproved;
}

/** Count chat messages per state. */
export function summarizeChatState(messages: readonly ChatMessage[]): {
  pending: number;
  sent: number;
  failed: number;
  moderated: number;
} {
  const acc = { pending: 0, sent: 0, failed: 0, moderated: 0 };
  for (const m of messages) {
    if (m.state === 'PENDING') acc.pending += 1;
    else if (m.state === 'SENT') acc.sent += 1;
    else if (m.state === 'FAILED') acc.failed += 1;
    else if (m.state === 'MODERATED') acc.moderated += 1;
  }
  return acc;
}

/** Submit-disable rules for chat draft. */
export function isChatSubmitDisabled(draft: string, streamState: StreamState): boolean {
  if (draft.trim().length === 0) return true;
  if (streamState === 'ENDED' || streamState === 'ERROR') return true;
  return false;
}

/** Compact list of sacred-term display text. */
export function renderSacredTermsList(terms: readonly string[]): string {
  if (terms.length === 0) return 'termos sagrados';
  return terms.join(', ');
}
