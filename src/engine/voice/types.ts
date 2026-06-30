// ============================================================================
// Voice Engine — Core Types (W86-A)
// ============================================================================
// Re-creates the W85-A voice-mode-akasha engine contract from the cycle-85
// interim 1 spec. Deterministic CueIds (FNV-1a + Math.imul), brand-typed
// error codes, append-only audit log. Engine is pure — no DOM, no TTS API.
// ============================================================================

// ---------- Branded primitives ----------

export type Brand<TBase, TBrand extends string> = TBase & {
  readonly __brand: TBrand;
};

export type CueId = Brand<string, 'CueId'>;
export type VoiceId = Brand<string, 'VoiceId'>;
export type TradicaoId =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

export const ALL_KNOWN_TRADICOES: ReadonlyArray<TradicaoId> = Object.freeze([
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
] as TradicaoId[]);

// ---------- Playback state machine ----------

export type PlaybackStatus =
  | 'queued'
  | 'playing'
  | 'paused'
  | 'done'
  | 'error'
  | 'canceled';

export interface PlaybackState {
  readonly cueId: CueId;
  readonly text: string;
  readonly renderedText: string;
  readonly voiceId: VoiceId;
  readonly status: PlaybackStatus;
  readonly enqueuedAt: number;
  readonly startedAt?: number;
  readonly endedAt?: number;
  readonly errorCode?: VoiceErrorCode;
  readonly errorMessage?: string;
}

// ---------- Voice preset ----------

export interface VoicePreset {
  readonly id: VoiceId;
  readonly label: string;
  readonly tradicao: TradicaoId;
  readonly rate: number;
  readonly pitch: number;
  readonly lang: string;
  readonly voiceStyle: string;
}

// ---------- Adapter contract ----------

export interface SpeakRequest {
  readonly text: string;
  readonly voice: VoicePreset;
  readonly onStart?: () => void;
  readonly onEnd?: () => void;
  readonly onError?: (code: VoiceErrorCode, message: string) => void;
}

export interface VoiceAdapter {
  readonly id: string;
  readonly label: string;
  speak(req: SpeakRequest): Promise<void>;
  cancel(): Promise<void>;
  isSupported(): boolean;
}

// ---------- Errors (brand-typed codes) ----------

export type VoiceErrorCode =
  | 'EMPTY_TEXT'
  | 'UNKNOWN_VOICE'
  | 'ADAPTER_UNSUPPORTED'
  | 'CANCELED'
  | 'NETWORK'
  | 'SYNTHESIS_FAILED'
  | 'QUEUE_FULL';

export interface VoiceError {
  readonly code: VoiceErrorCode;
  readonly message: string;
}

// ---------- Audit log ----------

export interface AuditEntry {
  readonly cueId: CueId;
  readonly voiceId: VoiceId;
  readonly status: PlaybackStatus;
  readonly at: number;
  readonly note?: string;
}

// ---------- Ifá coming-soon sentinel ----------

export const IFA_STATUS = 'coming-soon' as const;
