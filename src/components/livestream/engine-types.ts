// engine-types — pure type definitions shared between the mock engine and
// the StreamPlayer/helpers layer. Standalone file (no React dependency)
// so it can be imported from any context (TS, node strip-types, etc).

export type StreamId = string & { readonly __brand: 'StreamId' };
export type ChatId = string & { readonly __brand: 'ChatId' };
export type ViewerId = string & { readonly __brand: 'ViewerId' };

export type StreamKind =
  | 'CIGANO' | 'CANDOMBLE' | 'UMBANDA' | 'IFA'
  | 'CABALA' | 'ASTROLOGIA' | 'TANTRA';

export type StreamState =
  | 'PENDING' | 'CONNECTING' | 'LIVE' | 'PAUSED' | 'ENDED' | 'ERROR';

export type ChatMsgState = 'PENDING' | 'SENT' | 'FAILED' | 'MODERATED';

export interface StreamChannel {
  readonly id: StreamId;
  readonly title: string;
  readonly kind: StreamKind;
  readonly presenterHandle: string;
  readonly presenterTradition: string;
  readonly startsAt: number;
  readonly endsAt?: number;
  readonly hlsUrl: string;
  readonly posterUrl?: string;
  readonly descriptionPtBr: string;
}

export interface ViewerCount {
  readonly current: number;
  readonly peak: number;
  readonly updatedAt: number;
}

export interface ChatMessage {
  readonly id: ChatId;
  readonly authorHandle: string;
  readonly authorTradition?: string;
  readonly body: string;
  readonly createdAt: number;
  readonly state: ChatMsgState;
}

export interface SacredContentFlag {
  readonly streamKind: StreamKind;
  readonly containsSacredTerms: boolean;
  readonly detectedTerms: readonly string[];
  readonly requiresAudioConsent: boolean;
}

export interface ChatSendResult {
  readonly ok: boolean;
  readonly tempId: ChatId;
  readonly errorCode?: string;
}

export interface LivestreamSession {
  getState(): StreamState;
  subscribe(cb: (s: StreamState) => void): () => void;
  getStreamUrl(): string;
  getSacredFlag(): SacredContentFlag;
  getViewerCount(): ViewerCount;
  subscribeViewerCount(cb: (v: ViewerCount) => void): () => void;
  loadChatPage(before?: number, limit?: number): readonly ChatMessage[];
  sendChat(body: string): ChatSendResult;
  subscribeChat(cb: (msg: ChatMessage) => void): () => void;
  pause(): void;
  resume(): void;
  leave(): void;
}
