// ============================================================================
// ai/voice/quality — Voice quality monitoring (Wave 39 — 2026-07-01)
// ============================================================================
// Production-grade voice quality layer complementing src/lib/ai/voice/chat.ts
// (W38-5). Adds:
//
//   1. **PT-BR voice consistency** — score = how consistently the rendered
//      voice matches the tradición-selected voice profile. Drift detection
//      across sessions.
//   2. **Whisper accuracy (WER)** — Word Error Rate against a hand-labeled
//      PT-BR test set (dev only); rolling WER recorded per surface run.
//   3. **Background-noise pre-check** — RMS threshold on the captured
//      audio; if SNR is too low, prompt user to retry from quieter space.
//      (Browser-side; this module exports a pure scoring function.)
//   4. **Voice cloning opt-in flag** — explicit toggle per user; never
//      implicit. Carries LGPD consent receipt.
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §6 (voice production).
// ============================================================================

import type { VoiceId } from "./chat";

// ---------------------------------------------------------------------------
// Voice profile (per VoiceId)
// ---------------------------------------------------------------------------

export interface VoiceProfile {
  /** TTS engine (openai | elevenlabs). */
  engine: "openai" | "elevenlabs";
  /** Expected baseline pitch (Hz). */
  pitchHz: number;
  /** Speech rate (syllables / second). */
  syllablesPerSecond: number;
  /** Formant centre frequency — used for consistency check. */
  formantHz: number;
}

export const VOICE_PROFILES: Record<VoiceId, VoiceProfile> = Object.freeze({
  onyx:           { engine: "openai", pitchHz: 110, syllablesPerSecond: 4.0, formantHz: 1700 },
  shimmer:        { engine: "openai", pitchHz: 220, syllablesPerSecond: 4.5, formantHz: 2400 },
  alloy:          { engine: "openai", pitchHz: 180, syllablesPerSecond: 4.2, formantHz: 2100 },
  nova:           { engine: "openai", pitchHz: 200, syllablesPerSecond: 4.1, formantHz: 2200 },
  echo:           { engine: "openai", pitchHz: 130, syllablesPerSecond: 3.8, formantHz: 1800 },
  fable:          { engine: "openai", pitchHz: 170, syllablesPerSecond: 4.0, formantHz: 2050 },
  sage:           { engine: "openai", pitchHz: 150, syllablesPerSecond: 3.7, formantHz: 1900 },
  ash:            { engine: "openai", pitchHz: 140, syllablesPerSecond: 3.9, formantHz: 1950 },
  coral:          { engine: "openai", pitchHz: 230, syllablesPerSecond: 4.4, formantHz: 2350 },
  alloy_neutral:  { engine: "openai", pitchHz: 175, syllablesPerSecond: 4.0, formantHz: 2100 },
});

// ---------------------------------------------------------------------------
// Voice consistency score
// ---------------------------------------------------------------------------

export interface VoiceMeasurement {
  detectedPitchHz: number;
  estimatedSyllablesPerSecond: number;
  detectedFormantHz: number;
}

export interface VoiceConsistencyResult {
  voiceId: VoiceId;
  score: number;       // 0..1; 1 = perfect match
  drift: "none" | "mild" | "severe";
  recommendations: string[];
}

/**
 * Pure consistency check. Caller supplies detected acoustic features; the
 * function compares against the canonical profile and returns a normalised
 * 0..1 score plus drift classification.
 */
export function evaluateVoiceConsistency(
  voiceId: VoiceId,
  measured: VoiceMeasurement,
): VoiceConsistencyResult {
  const profile = VOICE_PROFILES[voiceId];
  const pitchErr = Math.abs(profile.pitchHz - measured.detectedPitchHz) / profile.pitchHz;
  const rateErr = Math.abs(profile.syllablesPerSecond - measured.estimatedSyllablesPerSecond) /
    profile.syllablesPerSecond;
  const formantErr = Math.abs(profile.formantHz - measured.detectedFormantHz) / profile.formantHz;
  const avgErr = (pitchErr + rateErr + formantErr) / 3;
  const score = Math.max(0, Math.min(1, 1 - avgErr));
  const drift: VoiceConsistencyResult["drift"] =
    score >= 0.90 ? "none" :
    score >= 0.75 ? "mild" :
    "severe";
  const recs: string[] = [];
  if (pitchErr > 0.15) recs.push(`Pitch drift ${(pitchErr * 100).toFixed(0)}% — consider re-recording.`);
  if (rateErr > 0.20) recs.push(`Speech rate drift ${(rateErr * 100).toFixed(0)}%.`);
  if (formantErr > 0.15) recs.push(`Voice timbre drift ${(formantErr * 100).toFixed(0)}%.`);
  if (drift === "severe") recs.push("Severe drift — switch voice profile or contact support.");
  return { voiceId, score, drift, recommendations: recs };
}

// ---------------------------------------------------------------------------
// WER (Word Error Rate) for Whisper
// ---------------------------------------------------------------------------

export interface WERResult {
  wer: number;          // 0..1; lower = better
  substitutions: number;
  deletions: number;
  insertions: number;
  referenceTokens: number;
}

/**
 * Pure Levenshtein-based WER. Reference + hypothesis are tokenised on
 * whitespace + lowercase. Caller ensures both arrays are non-empty.
 */
export function computeWER(reference: string, hypothesis: string): WERResult {
  const ref = reference.toLowerCase().split(/\s+/).filter(Boolean);
  const hyp = hypothesis.toLowerCase().split(/\s+/).filter(Boolean);
  if (ref.length === 0) {
    return { wer: hyp.length === 0 ? 0 : 1, substitutions: 0, deletions: 0, insertions: hyp.length, referenceTokens: 0 };
  }
  // DP table.
  const dp: number[][] = Array.from({ length: ref.length + 1 }, () => new Array(hyp.length + 1).fill(0));
  for (let i = 0; i <= ref.length; i++) dp[i]![0] = i;
  for (let j = 0; j <= hyp.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= ref.length; i++) {
    for (let j = 1; j <= hyp.length; j++) {
      const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,           // deletion
        dp[i]![j - 1]! + 1,           // insertion
        dp[i - 1]![j - 1]! + cost,    // substitution
      );
    }
  }
  // Backtrace for substitution / deletion / insertion.
  let sub = 0, del = 0, ins = 0;
  let i = ref.length, j = hyp.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ref[i - 1] === hyp[j - 1]) {
      i--; j--;
    } else if (i > 0 && j > 0 && dp[i]![j]! === dp[i - 1]![j - 1]! + 1) {
      sub++; i--; j--;
    } else if (i > 0 && dp[i]![j]! === dp[i - 1]![j]! + 1) {
      del++; i--;
    } else {
      ins++; j--;
    }
  }
  const edits = dp[ref.length]![hyp.length]!;
  return {
    wer: edits / ref.length,
    substitutions: sub,
    deletions: del,
    insertions: ins,
    referenceTokens: ref.length,
  };
}

// ---------------------------------------------------------------------------
// Audio SNR estimate (browser-side helper; pure)
// ---------------------------------------------------------------------------

export interface SNRResult {
  snrDb: number;
  rms: number;
  /** True when caller should prompt for quieter re-record. */
  requiresRetake: boolean;
}

/**
 * Compute SNR (signal-to-noise ratio) from an audio buffer. Caller
 * supplies an int16 PCM buffer (16 kHz mono, browser-captured).
 *
 * Algorithm: split into 25 ms frames; quietest 10% frames = noise floor;
 * loudest 50% frames = signal; SNR dB = 20 * log10(signalRMS / noiseRMS).
 *
 * Browser integration is in `use-voice-recorder.ts` (W38-5). This module
 * is pure, dependency-free.
 */
export function estimateSNR(pcmBuffer: Int16Array): SNRResult {
  if (pcmBuffer.length === 0) {
    return { snrDb: 0, rms: 0, requiresRetake: false };
  }
  const frameSize = 400; // 25ms @ 16kHz
  const frames: number[] = [];
  for (let i = 0; i < pcmBuffer.length; i += frameSize) {
    let sum = 0;
    const end = Math.min(i + frameSize, pcmBuffer.length);
    for (let k = i; k < end; k++) {
      const sample = pcmBuffer[k] ?? 0;
      sum += sample * sample;
    }
    const frameRms = Math.sqrt(sum / (end - i)) / 32768;
    frames.push(frameRms);
  }
  if (frames.length === 0) {
    return { snrDb: 0, rms: 0, requiresRetake: false };
  }
  frames.sort((a, b) => a - b);
  // Noise floor = quietest 10% of frames.
  const noiseCount = Math.max(1, Math.floor(frames.length * 0.10));
  const signalCount = Math.max(1, Math.floor(frames.length * 0.50));
  const noiseSum = frames.slice(0, noiseCount).reduce((a, b) => a + b, 0);
  const signalSum = frames.slice(-signalCount).reduce((a, b) => a + b, 0);
  const noiseRms = noiseSum / noiseCount;
  const signalRms = signalSum / signalCount;
  const snrDb = noiseRms > 0 ? 20 * Math.log10(signalRms / noiseRms) : 60;
  // 12 dB is the empirical floor for "intelligible speech in quiet room".
  const requiresRetake = snrDb < 12 || signalRms < 0.01;
  return { snrDb, rms: signalRms, requiresRetake };
}

// ---------------------------------------------------------------------------
// Voice cloning opt-in (LGPD Art. 7)
// ---------------------------------------------------------------------------

export interface VoiceCloneConsent {
  userId: string;
  /** ISO timestamp when opt-in recorded. */
  consentedAt: string;
  /** Optional — sample audio ID previously uploaded. */
  sourceAudioId?: string;
  /** Whether user can revoke. */
  revocable: true;
  /** Explicit text the user agreed to (must be human-readable pt-BR). */
  consentText: string;
}

export const VOICE_CLONE_CONSENT_TEXT =
  "Eu autorizo o uso da minha voz para síntese personalizada da Akasha. " +
  "Posso revogar este consentimento a qualquer momento em Configurações > Privacidade.";

export function recordVoiceCloneConsent(
  userId: string,
  sourceAudioId?: string,
  now: Date = new Date(),
): VoiceCloneConsent {
  return {
    userId,
    consentedAt: now.toISOString(),
    sourceAudioId,
    revocable: true,
    consentText: VOICE_CLONE_CONSENT_TEXT,
  };
}

// ---------------------------------------------------------------------------
// Aggregate quality report (admin-only)
// ---------------------------------------------------------------------------

export interface VoiceQualityReport {
  voiceId: VoiceId;
  totalSessions: number;
  avgConsistencyScore: number;
  avgWer: number;
  retakeRate: number;
  driftCounts: { none: number; mild: number; severe: number };
}

export function emptyQualityReport(voiceId: VoiceId): VoiceQualityReport {
  return {
    voiceId,
    totalSessions: 0,
    avgConsistencyScore: 0,
    avgWer: 0,
    retakeRate: 0,
    driftCounts: { none: 0, mild: 0, severe: 0 },
  };
}
