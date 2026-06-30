// ============================================================================
// Voice Adapter — interface + WebSpeechVoiceAdapter (browser) + InMemory (test)
// ============================================================================
// Adapter pattern (cycle-85-A voice-mode): engine never touches DOM, only
// speaks through a swappable adapter. InMemory for tests, WebSpeech for prod.
// ============================================================================

import {
  SpeakRequest,
  VoiceAdapter,
  VoiceErrorCode,
} from './types';

// ---------- In-memory adapter (deterministic, peekable for tests) ----------

export interface InMemorySpeakRecord {
  readonly text: string;
  readonly voiceId: string;
  readonly startedAt: number;
  readonly endedAt?: number;
  readonly canceled: boolean;
}

export class InMemoryVoiceAdapter implements VoiceAdapter {
  readonly id = 'in-memory';
  readonly label = 'In-Memory (test/deterministic)';

  private readonly records: InMemorySpeakRecord[] = [];
  private currentRecord: InMemorySpeakRecord | null = null;
  private canceled = false;

  speak(req: SpeakRequest): Promise<void> {
    return new Promise<void>((resolve) => {
      const startedAt = Date.now();
      const rec: InMemorySpeakRecord = {
        text: req.text,
        voiceId: String(req.voice.id),
        startedAt,
        canceled: false,
      };
      this.currentRecord = rec;
      this.records.push(rec);
      this.canceled = false;

      // Fire onStart synchronously then onEnd async (next tick).
      Promise.resolve().then(() => {
        if (req.onStart) req.onStart();
        if (this.canceled) {
          if (req.onError) req.onError('CANCELED', 'canceled before speak');
          resolve();
          return;
        }
        rec as { endedAt?: number };
        (rec as { endedAt?: number }).endedAt = Date.now();
        if (req.onEnd) req.onEnd();
        this.currentRecord = null;
        resolve();
      });
    });
  }

  cancel(): Promise<void> {
    this.canceled = true;
    if (this.currentRecord) {
      (this.currentRecord as { canceled: boolean }).canceled = true;
      (this.currentRecord as { endedAt?: number }).endedAt = Date.now();
      this.currentRecord = null;
    }
    return Promise.resolve();
  }

  isSupported(): boolean {
    return true; // always supported in tests
  }

  // ---------- Test peek API ----------

  getRecords(): ReadonlyArray<InMemorySpeakRecord> {
    return Object.freeze([...this.records]);
  }

  getRecordCount(): number {
    return this.records.length;
  }

  clear(): void {
    this.records.length = 0;
    this.currentRecord = null;
    this.canceled = false;
  }
}

// ---------- Web Speech API adapter (browser-only stub) ----------

export class WebSpeechVoiceAdapter implements VoiceAdapter {
  readonly id = 'web-speech';
  readonly label = 'Web Speech API (browser nativo)';

  private currentUtterance: unknown = null;
  private supported: boolean;

  constructor() {
    this.supported =
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as { speechSynthesis?: unknown }).speechSynthesis !==
        'undefined';
  }

  speak(req: SpeakRequest): Promise<void> {
    if (!this.supported) {
      return Promise.reject(
        new Error('Web Speech API not available in this runtime'),
      );
    }
    return new Promise<void>((resolve, reject) => {
      const synth = (globalThis as {
        speechSynthesis: {
          cancel: () => void;
          speak: (u: unknown) => void;
        };
        SpeechSynthesisUtterance: new (text: string) => unknown;
      }).speechSynthesis;
      const UtteranceCtor = (globalThis as {
        SpeechSynthesisUtterance: new (text: string) => unknown;
      }).SpeechSynthesisUtterance;

      synth.cancel();
      const utterance = new UtteranceCtor(req.text) as {
        lang: string;
        rate: number;
        pitch: number;
        onstart: (() => void) | null;
        onend: (() => void) | null;
        onerror: ((e: { error?: string }) => void) | null;
      };
      utterance.lang = req.voice.lang;
      utterance.rate = req.voice.rate;
      utterance.pitch = req.voice.pitch;

      utterance.onstart = () => {
        if (req.onStart) req.onStart();
      };
      utterance.onend = () => {
        if (req.onEnd) req.onEnd();
        this.currentUtterance = null;
        resolve();
      };
      utterance.onerror = (e: { error?: string }) => {
        const code: VoiceErrorCode =
          e.error === 'canceled' ? 'CANCELED' : 'SYNTHESIS_FAILED';
        const msg = e.error ?? 'unknown error';
        if (req.onError) req.onError(code, msg);
        this.currentUtterance = null;
        reject(new Error(`WebSpeech error: ${msg}`));
      };

      this.currentUtterance = utterance;
      synth.speak(utterance);
    });
  }

  cancel(): Promise<void> {
    if (!this.supported) return Promise.resolve();
    const synth = (globalThis as { speechSynthesis?: { cancel: () => void } })
      .speechSynthesis;
    if (synth) synth.cancel();
    this.currentUtterance = null;
    return Promise.resolve();
  }

  isSupported(): boolean {
    return this.supported;
  }
}
