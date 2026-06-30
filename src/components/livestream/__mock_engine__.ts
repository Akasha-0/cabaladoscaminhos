// W80-D mock engine — used by the spec harness to satisfy @/lib/livestream
// while the real W71-D engine is not merged. Implements the same contract
// the UI expects. Not shipped to runtime — only included in the spec tsconfig.

import {
  type StreamChannel,
  type StreamState,
  type ChatMessage,
  type SacredContentFlag,
  type ViewerCount,
  type ChatSendResult,
  type ViewerId,
  type ChatId,
  type StreamId,
  type ChatMsgState,
  type StreamKind,
  type LivestreamSession,
} from './engine-types.ts';

export type { StreamKind, StreamChannel, StreamState, ChatMessage, ViewerCount, ChatSendResult, ViewerId, ChatId, StreamId, ChatMsgState, SacredContentFlag, LivestreamSession };

// ---- Branded factories ----
let _streamIdCounter = 0;
let _chatIdCounter = 0;
let _viewerIdCounter = 0;

export function makeStreamId(s: string): StreamChannel['id'] {
  if (!/^ls_[a-z0-9_]{3,40}$/.test(s)) {
    throw new Error(`makeStreamId: invalid ${s}`);
  }
  return s as StreamChannel['id'];
}

export function makeChatId(s: string): ChatId {
  if (!/^ch_[a-z0-9_]{3,40}$/.test(s)) {
    throw new Error(`makeChatId: invalid ${s}`);
  }
  return s as ChatId;
}

export function makeViewerId(s: string): ViewerId {
  if (!/^vw_[a-z0-9_]{3,40}$/.test(s)) {
    throw new Error(`makeViewerId: invalid ${s}`);
  }
  return s as ViewerId;
}

// ---- Tradition catalog ----
export const TRADITION_KIND_LABELS: Readonly<Record<StreamKind, string>> = {
  CIGANO: 'Leitura de Cigano',
  CANDOMBLE: 'Gira de Candomblé',
  UMBANDA: 'Sessão de Umbanda',
  IFA: 'Jogo de Ifá',
  CABALA: 'Estudo Cabalístico',
  ASTROLOGIA: 'Sessão Astrológica',
  TANTRA: 'Meditação Tantra',
};

export const TRADITION_KIND_ICONS: Readonly<Record<StreamKind, string>> = {
  CIGANO: '✦',
  CANDOMBLE: '⚡',
  UMBANDA: '☄',
  IFA: '✶',
  CABALA: '☸',
  ASTROLOGIA: '☽',
  TANTRA: '卐',
};

export const STREAM_CATEGORIES: ReadonlyArray<{
  kind: StreamKind;
  labelPtBr: string;
  example: string;
}> = [
  { kind: 'CIGANO', labelPtBr: 'Cigano', example: 'Leitura de 36 cartas' },
  { kind: 'CANDOMBLE', labelPtBr: 'Candomblé', example: 'Gira com orixás' },
  { kind: 'UMBANDA', labelPtBr: 'Umbanda', example: 'Sessão com entidades' },
  { kind: 'IFA', labelPtBr: 'Ifá', example: 'Jogo de búzios + opón' },
  { kind: 'CABALA', labelPtBr: 'Cabala', example: 'Estudo da Árvore da Vida' },
  { kind: 'ASTROLOGIA', labelPtBr: 'Astrologia', example: 'Leitura do mapa natal' },
  { kind: 'TANTRA', labelPtBr: 'Tantra', example: 'Meditação dos chakras' },
];

export function listStreamKinds(): readonly StreamKind[] {
  return ['CIGANO', 'CANDOMBLE', 'UMBANDA', 'IFA', 'CABALA', 'ASTROLOGIA', 'TANTRA'];
}

// ---- Sacred-term detection (per-stream-kind heuristic) ----
const SACRED_TERMS: Readonly<Record<StreamKind, readonly string[]>> = {
  CIGANO: ['tarot', 'baralho', 'cartas ciganas'],
  CANDOMBLE: ['orixá', 'orixa', 'axé', 'axe', 'ogum', 'oxalá', 'oxala', 'xangô', 'xango', 'iansã', 'iansa'],
  UMBANDA: ['caboclo', 'preto-velho', 'preto velho', 'pomba-gira', 'pomba gira'],
  IFA: ['ifá', 'ifa', 'odum', 'odu', 'búzio', 'buzio', 'opón', 'opon', 'orunmila'],
  CABALA: ['kabbalah', 'qabalá', 'sefirot', 'sefirá', 'tetragrammaton'],
  ASTROLOGIA: ['saturno', 'netuno', 'plutão', 'plutao', 'ascendente', 'meio-do-céu'],
  TANTRA: ['chakra', 'kundalini', 'muladhara'],
};

function detectSacredFromBody(kind: StreamKind, detected: string[]): { terms: string[]; requires: boolean } {
  const lower = detected.join(' ').toLowerCase();
  const hits: string[] = [];
  let requires = false;
  const terms = SACRED_TERMS[kind] ?? [];
  for (const t of terms) {
    const norm = t.toLowerCase();
    if (lower.includes(norm)) {
      hits.push(t);
      // TANTRA / CANDOMBLÉ / IFA explicitly require consent by tradition.
      if (kind === 'TANTRA' || kind === 'CANDOMBLE' || kind === 'IFA') requires = true;
    }
  }
  return { terms: hits, requires };
}

// ---- LGPD consent gates ----
const _consentMap = new Map<string, boolean>();

export function isAudioConsentApproved(viewerId: ViewerId): boolean {
  return _consentMap.get(viewerId as string) === true;
}
export function approveAudioConsent(viewerId: ViewerId): void {
  _consentMap.set(viewerId as string, true);
}
export function revokeAudioConsent(viewerId: ViewerId): void {
  _consentMap.set(viewerId as string, false);
}

// ---- Sessions ----
interface MockSession extends LivestreamSession {
  _setState(s: StreamState): void;
  _setViewers(v: ViewerCount): void;
  _pushChat(m: ChatMessage): void;
  _flush(): void;
}

const _sessions = new Set<MockSession>();

export function createLivestreamSession(channel: StreamChannel): LivestreamSession {
  let _state: StreamState = 'CONNECTING';
  let _viewers: ViewerCount = { current: 0, peak: 0, updatedAt: Date.now() };
  const _chatBacklog: ChatMessage[] = [];
  const _stateSubs = new Set<(s: StreamState) => void>();
  const _viewerSubs = new Set<(v: ViewerCount) => void>();
  const _chatSubs = new Set<(m: ChatMessage) => void>();

  const sacredTerms: string[] = [];
  let sacredRequires = false;
  // Seed sacred detection based on channel title + description.
  const probe = `${channel.title} ${channel.descriptionPtBr}`;
  const det = detectSacredFromBody(channel.kind, [probe]);
  sacredTerms.push(...det.terms);
  sacredRequires = det.requires;

  const mockSession: MockSession = {
    getState: () => _state,
    subscribe: (cb) => {
      _stateSubs.add(cb);
      return () => _stateSubs.delete(cb);
    },
    getStreamUrl: () => channel.hlsUrl,
    getSacredFlag: () => ({
      streamKind: channel.kind,
      containsSacredTerms: sacredTerms.length > 0,
      detectedTerms: Object.freeze([...sacredTerms]),
      requiresAudioConsent: sacredRequires,
    }),
    getViewerCount: () => _viewers,
    subscribeViewerCount: (cb) => {
      _viewerSubs.add(cb);
      return () => _viewerSubs.delete(cb);
    },
    loadChatPage: (_before?: number, limit?: number) => {
      const cap = limit ?? 30;
      return Object.freeze([..._chatBacklog].slice(-cap)) as readonly ChatMessage[];
    },
    sendChat: (body) => {
      const trimmed = body.trim();
      if (trimmed.length === 0) {
        return { ok: false, tempId: makeChatId('ch_empty_xxx'), errorCode: 'EMPTY' };
      }
      if (trimmed.length > 280) {
        return { ok: false, tempId: makeChatId('ch_toolong_xx'), errorCode: 'TOO_LONG' };
      }
      return { ok: true, tempId: makeChatId(`ch_tmp_${Date.now()}_${_chatIdCounter++}`) };
    },
    subscribeChat: (cb) => {
      _chatSubs.add(cb);
      return () => _chatSubs.delete(cb);
    },
    pause: () => {
      if (_state === 'LIVE') _state = 'PAUSED';
    },
    resume: () => {
      if (_state === 'PAUSED' || _state === 'PENDING') _state = 'LIVE';
    },
    leave: () => {
      _stateSubs.clear();
      _viewerSubs.clear();
      _chatSubs.clear();
      _sessions.delete(mockSession);
    },
    _setState(s) {
      _state = s;
      for (const cb of _stateSubs) cb(s);
    },
    _setViewers(v) {
      _viewers = v;
      for (const cb of _viewerSubs) cb(v);
    },
    _pushChat(m) {
      _chatBacklog.push(m);
      for (const cb of _chatSubs) cb(m);
    },
    _flush() {
      _stateSubs.clear();
      _viewerSubs.clear();
      _chatSubs.clear();
    },
  };

  _sessions.add(mockSession);
  // Transition to LIVE after a tick (mirrors real flow).
  Promise.resolve().then(() => {
    if (mockSession.getState() === 'CONNECTING') {
      mockSession._setState('LIVE');
    }
  });

  return mockSession;
}

export function _resetLivestreamForTests(): void {
  _consentMap.clear();
  _streamIdCounter = 0;
  _chatIdCounter = 0;
  _viewerIdCounter = 0;
  for (const s of _sessions) {
    try { s.leave(); } catch { /* noop */ }
  }
  _sessions.clear();
}

// ---- Sentinel exports for unused counters (clear lint complaints) ----
export const __sentinel = {
  incStream: () => { _streamIdCounter += 1; return _streamIdCounter; },
  incChat: () => { _chatIdCounter += 1; return _chatIdCounter; },
  incViewer: () => { _viewerIdCounter += 1; return _viewerIdCounter; },
};

// Re-export helper types so consumers (spec, UI) can import them directly
// from this mock without needing the original @/lib/livestream stub.

