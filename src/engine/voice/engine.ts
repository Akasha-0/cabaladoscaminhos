// ============================================================================
// Voice Engine — queue state machine (W86-A)
// ============================================================================
// State transitions:
//   queued ──play──► playing ──end──► done
//      │                │
//      │                ├──pause──► paused ──resume──► playing
//      │                │
//      │                └──error──► error
//      └──cancel──► canceled
// ============================================================================

import {
  AuditEntry,
  CueId,
  PlaybackState,
  PlaybackStatus,
  TradicaoId,
  VoiceAdapter,
  VoiceErrorCode,
  VoiceId,
  VoicePreset,
} from './types';
import { getVoiceById, getDefaultVoice } from './voices';
import { makeCueId } from './cueId';
import { markdownToPlain } from './markdown';

const MAX_QUEUE = 32;

export interface PlayInput {
  readonly text: string;
  readonly voiceId?: VoiceId;
  readonly tradicao?: TradicaoId;
}

export class VoiceEngineError extends Error {
  readonly code: VoiceErrorCode;
  constructor(code: VoiceErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'VoiceEngineError';
  }
}

export class VoiceEngine {
  private readonly adapter: VoiceAdapter;
  private readonly queue: PlaybackState[] = [];
  // History: every cue ever created + its terminal state, so callers can
  // introspect after the fact even if the item already left the queue.
  private readonly history: Map<CueId, PlaybackState> = new Map();
  private readonly audit: AuditEntry[] = [];
  private current: PlaybackState | null = null;

  constructor(adapter: VoiceAdapter) {
    this.adapter = adapter;
  }

  // ---------- Public API ----------

  async play(input: PlayInput): Promise<PlaybackState> {
    const text = (input.text ?? '').trim();
    if (text.length === 0) {
      throw new VoiceEngineError('EMPTY_TEXT', 'text cannot be empty');
    }
    if (this.queue.length + (this.current ? 1 : 0) >= MAX_QUEUE) {
      throw new VoiceEngineError(
        'QUEUE_FULL',
        `queue is full (max ${MAX_QUEUE})`,
      );
    }
    const voice = this.resolveVoice(input.voiceId);
    const cueId = makeCueId(text) as CueId;
    const now = Date.now();

    const state: PlaybackState = {
      cueId,
      text,
      renderedText: markdownToPlain(text),
      voiceId: voice.id,
      status: 'queued',
      enqueuedAt: now,
    };

    this.queue.push(state);
    this.history.set(cueId, state);
    this.logAudit(state, 'queued', 'enqueued');

    // If nothing playing, kick off.
    if (!this.current) {
      await this.advance();
    }
    // After advance (which may have completed synchronously), return the
    // current snapshot of this cue's state from history.
    const final = this.history.get(cueId);
    return final ?? state;
  }

  async pause(): Promise<void> {
    if (this.current?.status === 'playing') {
      const next: PlaybackState = {
        ...this.current,
        status: 'paused',
        endedAt: Date.now(),
      };
      this.current = next;
      this.history.set(next.cueId, next);
      this.logAudit(next, 'paused', 'paused by user');
      await this.adapter.cancel();
    }
  }

  async resume(): Promise<void> {
    if (this.current?.status === 'paused') {
      // Re-enqueue the current item by restoring it to the front of the queue.
      const restored: PlaybackState = {
        ...this.current,
        status: 'queued',
      };
      this.queue.unshift(restored);
      this.history.set(restored.cueId, restored);
      this.current = null;
      this.logAudit(restored, 'queued', 'resumed by user');
      await this.advance();
    }
  }

  async cancel(cueId?: CueId): Promise<void> {
    if (cueId) {
      const idx = this.queue.findIndex((s) => s.cueId === cueId);
      if (idx === -1) return;
      const removed = this.queue.splice(idx, 1)[0];
      const canceled: PlaybackState = {
        ...removed,
        status: 'canceled',
        endedAt: Date.now(),
      };
      this.history.set(canceled.cueId, canceled);
      this.logAudit(canceled, 'canceled', 'canceled by user');
      return;
    }
    await this.adapter.cancel();
    if (this.current) {
      const canceled: PlaybackState = {
        ...this.current,
        status: 'canceled',
        endedAt: Date.now(),
      };
      this.history.set(canceled.cueId, canceled);
      this.logAudit(canceled, 'canceled', 'canceled by user');
      this.current = null;
    }
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        const canceled: PlaybackState = {
          ...item,
          status: 'canceled',
          endedAt: Date.now(),
        };
        this.history.set(canceled.cueId, canceled);
        this.logAudit(canceled, 'canceled', 'canceled by user (queue flush)');
      }
    }
  }

  getQueue(): ReadonlyArray<PlaybackState> {
    return Object.freeze(
      this.queue.filter(
        (s) => s.status !== 'done' && s.status !== 'error' && s.status !== 'canceled',
      ),
    );
  }

  getCurrent(): PlaybackState | null {
    return this.current;
  }

  getHistory(): ReadonlyArray<PlaybackState> {
    return Object.freeze([...this.history.values()]);
  }

  exportAudit(): ReadonlyArray<AuditEntry> {
    return Object.freeze([...this.audit]);
  }

  getAdapter(): VoiceAdapter {
    return this.adapter;
  }

  // ---------- Internals ----------

  private resolveVoice(voiceId?: VoiceId): VoicePreset {
    if (!voiceId) return getDefaultVoice();
    const found = getVoiceById(voiceId);
    if (!found) {
      throw new VoiceEngineError(
        'UNKNOWN_VOICE',
        `voice not found: ${String(voiceId)}`,
      );
    }
    return found;
  }

  private async advance(): Promise<void> {
    const next = this.queue.shift();
    if (!next) return;

    const playing: PlaybackState = {
      ...next,
      status: 'playing',
      startedAt: Date.now(),
    };
    this.current = playing;
    this.history.set(playing.cueId, playing);
    this.logAudit(playing, 'playing', 'started');

    try {
      await this.adapter.speak({
        text: playing.renderedText,
        voice: this.resolveVoice(playing.voiceId),
        onStart: () => {
          /* already in 'playing' state */
        },
        onEnd: () => {
          if (this.current?.cueId === playing.cueId) {
            const done: PlaybackState = {
              ...this.current,
              status: 'done',
              endedAt: Date.now(),
            };
            this.history.set(done.cueId, done);
            this.current = null;
            this.logAudit(done, 'done', 'completed');
          }
        },
        onError: (code, message) => {
          if (this.current?.cueId === playing.cueId) {
            const errored: PlaybackState = {
              ...this.current,
              status: 'error',
              endedAt: Date.now(),
              errorCode: code,
              errorMessage: message,
            };
            this.history.set(errored.cueId, errored);
            this.current = null;
            this.logAudit(errored, 'error', `${code}: ${message}`);
          }
        },
      });
      // After speak resolves, try the next item in queue.
      await this.advance();
    } catch (err) {
      if (this.current?.cueId === playing.cueId) {
        const errored: PlaybackState = {
          ...this.current,
          status: 'error',
          endedAt: Date.now(),
          errorCode: 'SYNTHESIS_FAILED',
          errorMessage: err instanceof Error ? err.message : String(err),
        };
        this.history.set(errored.cueId, errored);
        this.current = null;
        this.logAudit(errored, 'error', errored.errorMessage ?? 'unknown');
      }
    }
  }

  private logAudit(
    state: PlaybackState,
    status: PlaybackStatus,
    note: string,
  ): void {
    this.audit.push({
      cueId: state.cueId,
      voiceId: state.voiceId,
      status,
      at: Date.now(),
      note,
    });
  }
}
