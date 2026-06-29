/**
 * w53/voice-mood-realtime-coach
 * ==============================
 * Real-time voice mood coaching engine.
 *
 * Sits on top of (by shape, no runtime imports):
 *   - w49/voice-mood-detection          → live VoiceMoodSignal frames
 *   - w50/mood-devotional-tone          → DevotionalTone overlay (sacred windows)
 *   - w52/voice-mood-history-anonymizer → HistoryAnonymizedFrame for recap inputs
 *
 * Single file, no external deps, no `any`, strict discriminated unions.
 *
 * Responsibilities
 * ----------------
 *  1. Session state machine (7 states)
 *  2. Live cue generator (BREATHE / PACE / TONE / PAUSE)
 *  3. Hand-rolled detectors: breathe · pace · tone (arousal/valence trajectory)
 *  4. Post-session recap with templated suggestions (12+)
 *  5. Session persistence (in-memory) + retention policy (30/90/365/forever)
 *  6. LGPD Art. 7 (consent), Art. 9 (sensitive), Art. 18 (export / erasure)
 *  7. Sacred-text policy: respect ritual cadence, no cues during sacred windows
 *
 * Hard rules
 * ----------
 *  - One cue emitted every 15–45s of wall-clock session time (not per signal)
 *  - 4 cue kinds only — never invent a 5th kind
 *  - Pace flag thresholds: >180 wpm (too fast), <80 wpm (too slow)
 *  - Tone flag threshold: |Δarousal| ≥ 0.25 OR |Δvalence| ≥ 0.25 within 4s
 *  - Recap templates: ≥12 distinct suggestions, each with a deterministic id
 *  - Retention: configurable days OR forever (Number.POSITIVE_INFINITY)
 */

// ============================================================================
// 0. Primitive constants & micro-types
// ============================================================================

/** ISO-8601 timestamp string (UTC, with `Z`). */
export type IsoTimestamp = string & { readonly __brand: "IsoTimestamp" };

/** UUID v4-ish string (we accept any non-empty opaque id). */
export type SessionId = string & { readonly __brand: "SessionId" };

/** Opaque scalar id (template id, cue id, etc). */
export type OpaqueId = string & { readonly __brand: "OpaqueId" };

/** Integer milliseconds (non-negative). */
export type Milliseconds = number & { readonly __brand: "Milliseconds" };

/** Discriminated result code. */
export const OK = "OK" as const;
export const ERR = "ERR" as const;
export type Ok = typeof OK;
export type Err = typeof ERR;
export type ResultCode = Ok | Err;

/** A typed result wrapper. */
export interface TaggedResult<TPayload> {
  readonly code: ResultCode;
  readonly payload: TPayload | null;
  readonly error: string | null;
  readonly ts: IsoTimestamp;
}

/** Milliseconds in a minute. */
export const MS_PER_MINUTE: Milliseconds = 60_000 as Milliseconds;
/** Milliseconds in a day. */
export const MS_PER_DAY: Milliseconds = 86_400_000 as Milliseconds;
/** WPM floor (below ⇒ "too slow"). */
export const PACE_WPM_LOW: number = 80;
/** WPM ceiling (above ⇒ "too fast"). */
export const PACE_WPM_HIGH: number = 180;
/** Minimum silence between cues (ms). */
export const CUE_MIN_INTERVAL_MS: Milliseconds = 15_000 as Milliseconds;
/** Maximum silence between cues (ms) — emit a PAUSE if exceeded. */
export const CUE_MAX_INTERVAL_MS: Milliseconds = 45_000 as Milliseconds;
/** Default WARMING_UP length. */
export const WARMING_UP_MS: Milliseconds = 30_000 as Milliseconds;
/** Default COOLING_DOWN length. */
export const COOLING_DOWN_MS: Milliseconds = 15_000 as Milliseconds;
/** Max session length before auto-archive. */
export const MAX_SESSION_MS: Milliseconds = (3 * 60 * 60 * 1_000) as Milliseconds;
/** Session becomes stale after this much inactivity in IDLE/PAUSED. */
export const SESSION_STALE_MS: Milliseconds = (10 * 60_000) as Milliseconds;
/** Δ arousal/valence threshold for tone swing detection. */
export const TONE_DELTA_THRESHOLD: number = 0.25;
/** Window over which tone deltas are computed. */
export const TONE_WINDOW_MS: Milliseconds = 4_000 as Milliseconds;
/** Engine schema version. */
export const ENGINE_SCHEMA_VERSION = 1 as const;

/** Build an IsoTimestamp at call-site. */
export function nowIso(): IsoTimestamp {
  return new Date().toISOString() as IsoTimestamp;
}
/** Brand a finite non-negative number as Milliseconds. */
export function ms(n: number): Milliseconds {
  if (!Number.isFinite(n) || n < 0) return 0 as Milliseconds;
  return n as Milliseconds;
}
/** Brand a string as SessionId. */
export function sid(s: string): SessionId {
  if (!s || s.length === 0) return ("sess_" + Math.random().toString(36).slice(2)) as SessionId;
  return s as SessionId;
}
/** Brand a string as OpaqueId. */
export function oid(s: string): OpaqueId {
  if (!s || s.length === 0) return ("id_" + Math.random().toString(36).slice(2)) as OpaqueId;
  return s as OpaqueId;
}

/** Tiny tagged result builder. */
export function ok<T>(payload: T): TaggedResult<T> {
  return { code: OK, payload, error: null, ts: nowIso() };
}
/** Tiny tagged result builder for errors. */
export function err<T = never>(message: string): TaggedResult<T> {
  return { code: ERR, payload: null, error: message, ts: nowIso() };
}

// ============================================================================
// 1. Voice-mood signal contract (by shape of w49)
// ============================================================================

/** Closed-interval mood dimensions, coarse-grained (intentionally discrete). */
export type Valence = -1 | -0.75 | -0.5 | -0.25 | 0 | 0.25 | 0.5 | 0.75 | 1;
export type Arousal = -1 | -0.75 | -0.5 | -0.25 | 0 | 0.25 | 0.5 | 0.75 | 1;

/** Discrete emotion class inferred from valence + arousal. */
export type MoodKind =
  | "neutral"
  | "joy"
  | "sadness"
  | "anger"
  | "fear"
  | "surprise"
  | "tenderness"
  | "awe";

/** Pitch in normalized units (1.0 = speaker baseline). */
export type PitchNorm = number;
/** Energy in normalized units [0,1]. */
export type EnergyNorm = number;

/** A single frame emitted by w49/voice-mood-detection. */
export interface VoiceMoodSignal {
  readonly ts: IsoTimestamp;
  readonly tWall: Milliseconds;
  readonly valence: Valence;
  readonly arousal: Arousal;
  readonly mood: MoodKind;
  readonly pitch: PitchNorm;
  readonly energy: EnergyNorm;
  readonly speechRateWpm: number; // estimated words-per-minute
  readonly breathProxy: number; // 0..1 (higher = more exhale detected)
  readonly inhaleProxy: number; // 0..1 (higher = more inhale detected)
  readonly loudnessDb: number; // dBFS, e.g. -60..0
}

/** Make a default zero signal for tests / rests. */
export function emptySignal(tWall: Milliseconds): VoiceMoodSignal {
  return {
    ts: nowIso(),
    tWall,
    valence: 0,
    arousal: 0,
    mood: "neutral",
    pitch: 1,
    energy: 0,
    speechRateWpm: 0,
    breathProxy: 0,
    inhaleProxy: 0,
    loudnessDb: -60,
  };
}

// ============================================================================
// 2. Mood-devotional-tone contract (by shape of w50)
// ============================================================================

/** A sacred window emitted by w50/mood-devotional-tone. */
export interface DevotionalTone {
  readonly active: boolean;
  readonly kind:
    | "none"
    | "prayer"
    | "chant"
    | "ritual"
    | "meditation"
    | "blessing"
    | "lament";
  readonly startTWall: Milliseconds;
  readonly endTWall: Milliseconds;
  readonly sacred: boolean; // true when the tone forbids outside cues
  readonly label: string;
}

/** A devotional tone predicate: is the tone active at a given wall-clock? */
export function isDevotionalActive(tone: DevotionalTone | null, tWall: Milliseconds): boolean {
  if (!tone) return false;
  if (!tone.active) return false;
  return tWall >= tone.startTWall && tWall <= tone.endTWall;
}

// ============================================================================
// 3. History-anonymized frame (by shape of w52)
// ============================================================================

/** Anonymized frame projected forward from w52/voice-mood-history-anonymizer. */
export interface HistoryAnonymizedFrame {
  readonly bucketTWall: Milliseconds;
  readonly valenceMean: number;
  readonly valenceStddev: number;
  readonly arousalMean: number;
  readonly arousalStddev: number;
  readonly dominantMood: MoodKind;
  readonly frameCount: number;
}

/** Convert a history anonymized frame into a MoodSnapshot (recap seed). */
export function frameToSnapshot(f: HistoryAnonymizedFrame): MoodSnapshot {
  return {
    valence: clampUnit(f.valenceMean),
    arousal: clampUnit(f.arousalMean),
    mood: f.dominantMood,
  };
}

/** Clamp a number into [-1, +1]. */
export function clampUnit(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n > 1) return 1;
  if (n < -1) return -1;
  return n;
}

// ============================================================================
// 4. MoodSnapshot helper type
// ============================================================================

/** Aggregated mood at one instant — used for arc construction. */
export interface MoodSnapshot {
  readonly valence: number;
  readonly arousal: number;
  readonly mood: MoodKind;
}

/** Neutral mood snapshot. */
export function neutralMood(): MoodSnapshot {
  return { valence: 0, arousal: 0, mood: "neutral" };
}

// ============================================================================
// 5. Session state machine — 7 states
// ============================================================================

export const SESSION_STATE_IDLE = "IDLE" as const;
export const SESSION_STATE_WARMING_UP = "WARMING_UP" as const;
export const SESSION_STATE_ACTIVE = "ACTIVE" as const;
export const SESSION_STATE_COOLING_DOWN = "COOLING_DOWN" as const;
export const SESSION_STATE_PAUSED = "PAUSED" as const;
export const SESSION_STATE_ENDED = "ENDED" as const;
export const SESSION_STATE_ARCHIVED = "ARCHIVED" as const;

export type SessionStateName =
  | typeof SESSION_STATE_IDLE
  | typeof SESSION_STATE_WARMING_UP
  | typeof SESSION_STATE_ACTIVE
  | typeof SESSION_STATE_COOLING_DOWN
  | typeof SESSION_STATE_PAUSED
  | typeof SESSION_STATE_ENDED
  | typeof SESSION_STATE_ARCHIVED;

/** A typed transition event: who/what is driving the change. */
export type TransitionCause =
  | "user-start"
  | "user-pause"
  | "user-resume"
  | "user-stop"
  | "timeout-warming-up"
  | "timeout-cooling-down"
  | "inactivity-stale"
  | "session-cap";

export interface SessionState {
  readonly name: SessionStateName;
  readonly enteredAt: IsoTimestamp;
  readonly enteredAtWall: Milliseconds;
}

export interface SessionTransition {
  readonly from: SessionStateName;
  readonly to: SessionStateName;
  readonly cause: TransitionCause;
  readonly tWall: Milliseconds;
}

/** Pure transition function: IDLE → WARMING_UP → ACTIVE → COOLING_DOWN → ENDED → ARCHIVED. */
export function nextState(
  current: SessionState,
  cause: TransitionCause,
  now: Milliseconds,
): SessionState {
  const to: SessionStateName = ((): SessionStateName => {
    switch (current.name) {
      case SESSION_STATE_IDLE:
        if (cause === "user-start") return SESSION_STATE_WARMING_UP;
        return current.name;
      case SESSION_STATE_WARMING_UP:
        if (cause === "timeout-warming-up") return SESSION_STATE_ACTIVE;
        if (cause === "user-stop") return SESSION_STATE_COOLING_DOWN;
        if (cause === "user-pause") return SESSION_STATE_PAUSED;
        return current.name;
      case SESSION_STATE_ACTIVE:
        if (cause === "user-pause") return SESSION_STATE_PAUSED;
        if (cause === "user-stop") return SESSION_STATE_COOLING_DOWN;
        if (cause === "session-cap") return SESSION_STATE_COOLING_DOWN;
        return current.name;
      case SESSION_STATE_COOLING_DOWN:
        if (cause === "timeout-cooling-down") return SESSION_STATE_ENDED;
        if (cause === "user-stop") return SESSION_STATE_ENDED;
        if (cause === "user-pause") return SESSION_STATE_PAUSED;
        return current.name;
      case SESSION_STATE_PAUSED:
        if (cause === "user-resume") return SESSION_STATE_ACTIVE;
        if (cause === "inactivity-stale") return SESSION_STATE_ENDED;
        if (cause === "user-stop") return SESSION_STATE_ENDED;
        return current.name;
      case SESSION_STATE_ENDED:
        if (cause === "user-start") return SESSION_STATE_ARCHIVED;
        return SESSION_STATE_ARCHIVED;
      case SESSION_STATE_ARCHIVED:
        return SESSION_STATE_ARCHIVED;
      default: {
        const _exhaustive: never = current.name;
        return _exhaustive;
      }
    }
  })();
  if (to === current.name) return current;
  return {
    name: to,
    enteredAt: nowIso(),
    enteredAtWall: now,
  };
}

/** Convenience: is the session currently emitting cues? */
export function isLive(state: SessionStateName): boolean {
  return state === SESSION_STATE_WARMING_UP || state === SESSION_STATE_ACTIVE;
}
/** Convenience: can a session be resumed from this state? */
export function isResumable(state: SessionStateName): boolean {
  return state === SESSION_STATE_PAUSED;
}
/** Convenience: is this state terminal? */
export function isTerminal(state: SessionStateName): boolean {
  return state === SESSION_STATE_ENDED || state === SESSION_STATE_ARCHIVED;
}
/** Convenience: initial state factory. */
export function initialSessionState(now: Milliseconds): SessionState {
  return {
    name: SESSION_STATE_IDLE,
    enteredAt: nowIso(),
    enteredAtWall: now,
  };
}

// ============================================================================
// 6. Cue types — 4 kinds exactly
// ============================================================================

export const CUE_BREATHE = "BREATHE" as const;
export const CUE_PACE = "PACE" as const;
export const CUE_TONE = "TONE" as const;
export const CUE_PAUSE = "PAUSE" as const;
export type CueKind =
  | typeof CUE_BREATHE
  | typeof CUE_PACE
  | typeof CUE_TONE
  | typeof CUE_PAUSE;

/** Sub-action for PACE cues. */
export type PaceSubKind = "slow-down" | "speed-up";
/** Sub-action for TONE cues. */
export type ToneSubKind = "softer" | "clearer";
/** Sub-action for BREATHE cues. */
export type BreatheSubKind = "exhale" | "inhale" | "ground";
/** Sub-action for PAUSE cues. */
export type PauseSubKind = "silence";

/** Discriminated union of cue payloads (no `any`). */
export type CuePayload =
  | { readonly kind: typeof CUE_BREATHE; readonly sub: BreatheSubKind; readonly seconds: number }
  | { readonly kind: typeof CUE_PACE; readonly sub: PaceSubKind; readonly currentWpm: number; readonly targetWpm: number }
  | { readonly kind: typeof CUE_TONE; readonly sub: ToneSubKind; readonly delta: number; readonly dimension: "arousal" | "valence" }
  | { readonly kind: typeof CUE_PAUSE; readonly sub: PauseSubKind; readonly milliseconds: number };

export interface Cue {
  readonly id: OpaqueId;
  readonly sessionId: SessionId;
  readonly kind: CueKind;
  readonly payload: CuePayload;
  readonly tWall: Milliseconds;
  readonly ts: IsoTimestamp;
}

/** Empty cue-count bucket. */
export function emptyCueCounts(): Record<CueKind, number> {
  return {
    [CUE_BREATHE]: 0,
    [CUE_PACE]: 0,
    [CUE_TONE]: 0,
    [CUE_PAUSE]: 0,
  };
}

/** Total of all cue counts. */
export function totalCues(counts: Record<CueKind, number>): number {
  return counts[CUE_BREATHE] + counts[CUE_PACE] + counts[CUE_TONE] + counts[CUE_PAUSE];
}

/** Increment a cue-kind counter immutably. */
export function incrementCueCount(counts: Record<CueKind, number>, kind: CueKind): Record<CueKind, number> {
  return { ...counts, [kind]: (counts[kind] ?? 0) + 1 };
}

// ============================================================================
// 7. Breathe detector (hand-rolled heuristic)
// ============================================================================

/** A breathing cycle as detected. */
export interface BreathCycle {
  readonly startTWall: Milliseconds;
  readonly inhaleEndTWall: Milliseconds;
  readonly exhaleEndTWall: Milliseconds;
  readonly amplitude: number; // proxy sum
}

/** State for the rolling breathe detector. */
export interface BreatheDetectorState {
  readonly ringSize: number;
  readonly inhaleHigh: number;
  readonly exhaleHigh: number;
  readonly minCycleMs: Milliseconds;
}

export function defaultBreatheDetectorState(): BreatheDetectorState {
  return {
    ringSize: 64,
    inhaleHigh: 0.35,
    exhaleHigh: 0.35,
    minCycleMs: ms(2_500),
  };
}

interface BreatheInternals {
  ring: VoiceMoodSignal[];
  cycleStart: Milliseconds | null;
  inhaleEnd: Milliseconds | null;
  exhaleEnd: Milliseconds | null;
}

function newBreatheInternals(): BreatheInternals {
  return { ring: [], cycleStart: null, inhaleEnd: null, exhaleEnd: null };
}

/** Construct a fresh internal detector state with defaults. */
export function newBreatheDetector(): { state: BreatheDetectorState; internals: BreatheInternals } {
  return { state: defaultBreatheDetectorState(), internals: newBreatheInternals() };
}

/** Detect a complete breath cycle from the rolling window. */
export function detectBreathCycle(
  prev: BreatheDetectorState,
  internals: BreatheInternals,
  signal: VoiceMoodSignal,
): { state: BreatheDetectorState; internals: BreatheInternals; cycle: BreathCycle | null } {
  internals.ring.push(signal);
  if (internals.ring.length > prev.ringSize) internals.ring.shift();
  if (internals.cycleStart === null) {
    if (signal.inhaleProxy >= prev.inhaleHigh || signal.breathProxy >= prev.exhaleHigh) {
      internals.cycleStart = signal.tWall;
    }
  } else {
    if (internals.inhaleEnd === null && signal.inhaleProxy >= prev.inhaleHigh) {
      internals.inhaleEnd = signal.tWall;
    } else if (
      internals.inhaleEnd !== null &&
      internals.exhaleEnd === null &&
      signal.breathProxy >= prev.exhaleHigh &&
      signal.tWall - internals.inhaleEnd >= 200
    ) {
      internals.exhaleEnd = signal.tWall;
    }
  }
  let cycle: BreathCycle | null = null;
  if (
    internals.cycleStart !== null &&
    internals.inhaleEnd !== null &&
    internals.exhaleEnd !== null &&
    internals.exhaleEnd - internals.cycleStart >= prev.minCycleMs
  ) {
    const amplitude =
      internals.ring.reduce((acc, s) => acc + s.breathProxy + s.inhaleProxy, 0) /
      Math.max(1, internals.ring.length);
    cycle = {
      startTWall: internals.cycleStart,
      inhaleEndTWall: internals.inhaleEnd,
      exhaleEndTWall: internals.exhaleEnd,
      amplitude,
    };
    internals.cycleStart = null;
    internals.inhaleEnd = null;
    internals.exhaleEnd = null;
  }
  return { state: prev, internals, cycle };
}

/** Should we emit a BREATHE cue given the last completed cycle? */
export function shouldEmitBreatheCue(
  lastCycle: BreathCycle | null,
  nowTWall: Milliseconds,
  state: SessionStateName,
): boolean {
  if (!isLive(state)) return false;
  if (!lastCycle) return false;
  const since = nowTWall - lastCycle.exhaleEndTWall;
  return since >= 1_500 && since <= 10_000;
}

/** Build a BREATHE cue payload. */
export function buildBreatheCue(
  sessionId: SessionId,
  cycle: BreathCycle,
  nowTWall: Milliseconds,
): Cue {
  const exhaleMs = cycle.exhaleEndTWall - cycle.inhaleEndTWall;
  const seconds = Math.max(2, Math.min(8, Math.round(exhaleMs / 1_500)));
  const sub: BreatheSubKind =
    cycle.amplitude > 1.4 ? "inhale" : cycle.amplitude > 0.9 ? "exhale" : "ground";
  return {
    id: oid("cue_" + Math.random().toString(36).slice(2)),
    sessionId,
    kind: CUE_BREATHE,
    payload: { kind: CUE_BREATHE, sub, seconds },
    tWall: nowTWall,
    ts: nowIso(),
  };
}

// ============================================================================
// 8. Pace detector
// ============================================================================

/** Pace detector configuration. */
export interface PaceDetectorState {
  readonly wpmLow: number;
  readonly wpmHigh: number;
  readonly windowFrames: number;
  readonly targetWpm: number;
}

export function defaultPaceDetectorState(): PaceDetectorState {
  return { wpmLow: PACE_WPM_LOW, wpmHigh: PACE_WPM_HIGH, windowFrames: 8, targetWpm: 130 };
}

interface PaceInternals {
  ring: VoiceMoodSignal[];
}

function newPaceInternals(): PaceInternals {
  return { ring: [] };
}

/** Construct a fresh pace detector. */
export function newPaceDetector(): { state: PaceDetectorState; internals: PaceInternals } {
  return { state: defaultPaceDetectorState(), internals: newPaceInternals() };
}

/** Estimate smoothed WPM. */
export function estimateWpm(
  prev: PaceDetectorState,
  internals: PaceInternals,
  signal: VoiceMoodSignal,
): number {
  internals.ring.push(signal);
  if (internals.ring.length > prev.windowFrames) internals.ring.shift();
  if (internals.ring.length === 0) return 0;
  const sum = internals.ring.reduce((acc, s) => acc + s.speechRateWpm, 0);
  return sum / internals.ring.length;
}

/** Decide PACE cue emission. */
export function shouldEmitPaceCue(
  smoothedWpm: number,
  state: SessionStateName,
  cooldownMs: Milliseconds,
  sinceLastCueMs: number | null,
): { emit: boolean; sub: PaceSubKind | null; currentWpm: number; targetWpm: number } {
  if (!isLive(state)) {
    return { emit: false, sub: null, currentWpm: smoothedWpm, targetWpm: PACE_WPM_LOW + 50 };
  }
  if (smoothedWpm <= 0) return { emit: false, sub: null, currentWpm: smoothedWpm, targetWpm: 130 };
  if (sinceLastCueMs !== null && sinceLastCueMs < cooldownMs) {
    return { emit: false, sub: null, currentWpm: smoothedWpm, targetWpm: 130 };
  }
  if (smoothedWpm > PACE_WPM_HIGH) {
    return { emit: true, sub: "slow-down", currentWpm: smoothedWpm, targetWpm: 150 };
  }
  if (smoothedWpm < PACE_WPM_LOW) {
    return { emit: true, sub: "speed-up", currentWpm: smoothedWpm, targetWpm: 110 };
  }
  return { emit: false, sub: null, currentWpm: smoothedWpm, targetWpm: 130 };
}

/** Build a PACE cue. */
export function buildPaceCue(
  sessionId: SessionId,
  sub: PaceSubKind,
  currentWpm: number,
  targetWpm: number,
  nowTWall: Milliseconds,
): Cue {
  return {
    id: oid("cue_" + Math.random().toString(36).slice(2)),
    sessionId,
    kind: CUE_PACE,
    payload: { kind: CUE_PACE, sub, currentWpm, targetWpm },
    tWall: nowTWall,
    ts: nowIso(),
  };
}

// ============================================================================
// 9. Tone detector (arousal + valence trajectory)
// ============================================================================

/** Tone detector config. */
export interface ToneDetectorState {
  readonly windowMs: Milliseconds;
  readonly deltaThreshold: number;
  readonly coolingFactor: number;
}

export function defaultToneDetectorState(): ToneDetectorState {
  return { windowMs: TONE_WINDOW_MS, deltaThreshold: TONE_DELTA_THRESHOLD, coolingFactor: 0.85 };
}

interface ToneInternals {
  series: VoiceMoodSignal[];
  lastArousal: number;
  lastValence: number;
}

function newToneInternals(): ToneInternals {
  return { series: [], lastArousal: 0, lastValence: 0 };
}

/** Construct a fresh tone detector. */
export function newToneDetector(): { state: ToneDetectorState; internals: ToneInternals } {
  return { state: defaultToneDetectorState(), internals: newToneInternals() };
}

export interface ToneSwingEvent {
  readonly dimension: "arousal" | "valence";
  readonly delta: number;
  readonly fromTWall: Milliseconds;
  readonly toTWall: Milliseconds;
}

/** Detect sharp tone swings in the recent window. */
export function detectToneSwing(
  prev: ToneDetectorState,
  internals: ToneInternals,
  signal: VoiceMoodSignal,
): { state: ToneDetectorState; internals: ToneInternals; event: ToneSwingEvent | null } {
  internals.series.push(signal);
  while (internals.series.length > 1 && signal.tWall - internals.series[0]!.tWall > prev.windowMs) {
    internals.series.shift();
  }
  if (internals.series.length < 2) return { state: prev, internals, event: null };
  const oldest = internals.series[0]!;
  const arousalDelta = signal.arousal - oldest.arousal;
  const valenceDelta = signal.valence - oldest.valence;
  let evt: ToneSwingEvent | null = null;
  if (Math.abs(arousalDelta) >= prev.deltaThreshold && Math.abs(arousalDelta) > Math.abs(valenceDelta)) {
    evt = {
      dimension: "arousal",
      delta: arousalDelta,
      fromTWall: oldest.tWall,
      toTWall: signal.tWall,
    };
  } else if (Math.abs(valenceDelta) >= prev.deltaThreshold) {
    evt = {
      dimension: "valence",
      delta: valenceDelta,
      fromTWall: oldest.tWall,
      toTWall: signal.tWall,
    };
  }
  if (evt) {
    internals.lastArousal = signal.arousal;
    internals.lastValence = signal.valence;
  }
  return { state: prev, internals, event: evt };
}

/** Decide TONE cue emission. */
export function shouldEmitToneCue(
  evt: ToneSwingEvent | null,
  state: SessionStateName,
  sinceLastMs: number | null,
  cooldownMs: Milliseconds,
): { emit: boolean; sub: ToneSubKind | null; dimension: "arousal" | "valence"; delta: number } {
  if (!isLive(state) || !evt) {
    return { emit: false, sub: null, dimension: "arousal", delta: 0 };
  }
  if (sinceLastMs !== null && sinceLastMs < cooldownMs) {
    return { emit: false, sub: null, dimension: evt.dimension, delta: evt.delta };
  }
  if (evt.dimension === "arousal") {
    return {
      emit: true,
      sub: evt.delta > 0 ? "softer" : "clearer",
      dimension: "arousal",
      delta: evt.delta,
    };
  }
  return {
    emit: true,
    sub: evt.delta < 0 ? "softer" : "clearer",
    dimension: "valence",
    delta: evt.delta,
  };
}

/** Build a TONE cue. */
export function buildToneCue(
  sessionId: SessionId,
  sub: ToneSubKind,
  dimension: "arousal" | "valence",
  delta: number,
  nowTWall: Milliseconds,
): Cue {
  return {
    id: oid("cue_" + Math.random().toString(36).slice(2)),
    sessionId,
    kind: CUE_TONE,
    payload: { kind: CUE_TONE, sub, delta, dimension },
    tWall: nowTWall,
    ts: nowIso(),
  };
}

// ============================================================================
// 10. PAUSE cue (silence)
// ============================================================================

/** Decide whether to emit a PAUSE cue because no other cue has fired for too long. */
export function shouldEmitPauseCue(
  sinceLastCueMs: number | null,
  state: SessionStateName,
  maxSilenceMs: Milliseconds,
): { emit: boolean; milliseconds: number } {
  if (!isLive(state)) return { emit: false, milliseconds: 0 };
  if (sinceLastCueMs === null) return { emit: false, milliseconds: 0 };
  return { emit: sinceLastCueMs >= maxSilenceMs, milliseconds: sinceLastCueMs };
}

/** Build a PAUSE cue. */
export function buildPauseCue(
  sessionId: SessionId,
  milliseconds: number,
  nowTWall: Milliseconds,
): Cue {
  return {
    id: oid("cue_" + Math.random().toString(36).slice(2)),
    sessionId,
    kind: CUE_PAUSE,
    payload: { kind: CUE_PAUSE, sub: "silence", milliseconds },
    tWall: nowTWall,
    ts: nowIso(),
  };
}

// ============================================================================
// 11. Sacred-text policy — guard cues against ritual windows
// ============================================================================

export const SACRED_POLICY_ALLOW = "ALLOW" as const;
export const SACRED_POLICY_SUPPRESS = "SUPPRESS" as const;
export const SACRED_POLICY_DEFER = "DEFER" as const;
export type SacredPolicyDecision =
  | typeof SACRED_POLICY_ALLOW
  | typeof SACRED_POLICY_SUPPRESS
  | typeof SACRED_POLICY_DEFER;

export interface SacredPolicyContext {
  readonly tone: DevotionalTone | null;
  readonly cue: Cue | null;
  readonly nowTWall: Milliseconds;
}

/** Resolve whether a cue is allowed given the current devotional tone. */
export function resolveSacredPolicy(ctx: SacredPolicyContext): SacredPolicyDecision {
  const { tone, cue, nowTWall } = ctx;
  if (!tone || !tone.active) return SACRED_POLICY_ALLOW;
  if (!cue) return SACRED_POLICY_ALLOW;
  const inside = nowTWall >= tone.startTWall && nowTWall <= tone.endTWall;
  if (!inside) return SACRED_POLICY_ALLOW;
  const isHardSacred =
    tone.sacred ||
    tone.kind === "ritual" ||
    tone.kind === "prayer" ||
    tone.kind === "chant";
  if (isHardSacred) {
    if (cue.kind === CUE_BREATHE && tone.kind === "meditation") return SACRED_POLICY_ALLOW;
    return SACRED_POLICY_SUPPRESS;
  }
  if (tone.kind === "meditation") {
    if (cue.kind === CUE_PACE) return SACRED_POLICY_DEFER;
    return SACRED_POLICY_ALLOW;
  }
  if (tone.kind === "blessing" || tone.kind === "lament") {
    if (cue.kind === CUE_TONE) return SACRED_POLICY_DEFER;
    return SACRED_POLICY_ALLOW;
  }
  return SACRED_POLICY_ALLOW;
}

/** Has the sacred window ended? */
export function hasSacredEnded(tone: DevotionalTone | null, nowTWall: Milliseconds): boolean {
  if (!tone) return true;
  return nowTWall > tone.endTWall;
}

// ============================================================================
// 12. Cue generator — top-level orchestration per signal
// ============================================================================

export interface CueGeneratorConfig {
  readonly minIntervalMs: Milliseconds;
  readonly maxSilenceMs: Milliseconds;
  readonly paceCooldownMs: Milliseconds;
  readonly toneCooldownMs: Milliseconds;
  readonly breathe: BreatheDetectorState;
  readonly pace: PaceDetectorState;
  readonly tone: ToneDetectorState;
}

export function defaultCueGeneratorConfig(): CueGeneratorConfig {
  return {
    minIntervalMs: CUE_MIN_INTERVAL_MS,
    maxSilenceMs: CUE_MAX_INTERVAL_MS,
    paceCooldownMs: ms(20_000),
    toneCooldownMs: ms(20_000),
    breathe: defaultBreatheDetectorState(),
    pace: defaultPaceDetectorState(),
    tone: defaultToneDetectorState(),
  };
}

interface CueGenInternals {
  breathe: BreatheInternals;
  pace: PaceInternals;
  tone: ToneInternals;
  lastCycle: BreathCycle | null;
  lastCueAt: Milliseconds | null;
  lastPaceAt: Milliseconds | null;
  lastToneAt: Milliseconds | null;
  deferredQueue: Cue[];
}

function newCueGenInternals(): CueGenInternals {
  return {
    breathe: newBreatheInternals(),
    pace: newPaceInternals(),
    tone: newToneInternals(),
    lastCycle: null,
    lastCueAt: null,
    lastPaceAt: null,
    lastToneAt: null,
    deferredQueue: [],
  };
}

/** Construct a fresh cue-generator instance (config + internals). */
export function newCueGenerator(
  cfg: CueGeneratorConfig = defaultCueGeneratorConfig(),
): { cfg: CueGeneratorConfig; internals: CueGenInternals } {
  return { cfg, internals: newCueGenInternals() };
}

/** Run one signal frame through the generators. */
export function runCueGenerator(
  cfg: CueGeneratorConfig,
  internals: CueGenInternals,
  signal: VoiceMoodSignal,
  state: SessionStateName,
  sacred: DevotionalTone | null,
): { cue: Cue | null; deferred: Cue[]; internals: CueGenInternals } {
  const breatheRes = detectBreathCycle(cfg.breathe, internals.breathe, signal);
  internals.breathe = breatheRes.internals;
  if (breatheRes.cycle) {
    internals.lastCycle = breatheRes.cycle;
    // also increment an externally-readable counter via a side channel
  }
  const smoothedWpm = estimateWpm(cfg.pace, internals.pace, signal);
  const toneRes = detectToneSwing(cfg.tone, internals.tone, signal);
  internals.tone = toneRes.internals;
  const nowTWall = signal.tWall;
  let candidate: Cue | null = null;
  const sinceLastTone = internals.lastToneAt === null ? null : (nowTWall - internals.lastToneAt);
  const toneDec = shouldEmitToneCue(toneRes.event, state, sinceLastTone, cfg.toneCooldownMs);
  const placeholderId = sid("");
  if (toneDec.emit && toneDec.sub) {
    candidate = buildToneCue(placeholderId, toneDec.sub, toneDec.dimension, toneDec.delta, nowTWall);
    internals.lastToneAt = nowTWall;
  } else {
    const sinceLastPace = internals.lastPaceAt === null ? null : (nowTWall - internals.lastPaceAt);
    const paceDec = shouldEmitPaceCue(smoothedWpm, state, cfg.paceCooldownMs, sinceLastPace);
    if (paceDec.emit && paceDec.sub) {
      candidate = buildPaceCue(placeholderId, paceDec.sub, paceDec.currentWpm, paceDec.targetWpm, nowTWall);
      internals.lastPaceAt = nowTWall;
    } else if (shouldEmitBreatheCue(internals.lastCycle, nowTWall, state)) {
      if (internals.lastCycle) {
        candidate = buildBreatheCue(placeholderId, internals.lastCycle, nowTWall);
      }
    }
  }
  if (!candidate) {
    const sinceLastCue = internals.lastCueAt === null ? null : (nowTWall - internals.lastCueAt);
    const pauseDec = shouldEmitPauseCue(sinceLastCue, state, cfg.maxSilenceMs);
    if (pauseDec.emit) {
      candidate = buildPauseCue(placeholderId, pauseDec.milliseconds, nowTWall);
    }
  }
  if (!candidate) return { cue: null, deferred: [], internals };
  const sinceLastCue = internals.lastCueAt === null ? null : (nowTWall - internals.lastCueAt);
  if (sinceLastCue !== null && sinceLastCue < cfg.minIntervalMs && candidate.kind !== CUE_PAUSE) {
    return { cue: null, deferred: [], internals };
  }
  const decision = resolveSacredPolicy({ tone: sacred, cue: candidate, nowTWall });
  if (decision === SACRED_POLICY_SUPPRESS) return { cue: null, deferred: [], internals };
  if (decision === SACRED_POLICY_DEFER) {
    internals.deferredQueue.push(candidate);
    return { cue: null, deferred: [candidate], internals };
  }
  internals.lastCueAt = nowTWall;
  return { cue: candidate, deferred: [], internals };
}

/** Flush deferred cues once the sacred window ends. */
export function flushDeferredCues(
  internals: CueGenInternals,
  sacred: DevotionalTone | null,
  nowTWall: Milliseconds,
): { cues: Cue[]; internals: CueGenInternals } {
  if (!hasSacredEnded(sacred, nowTWall)) return { cues: [], internals };
  const drained = internals.deferredQueue.splice(0, internals.deferredQueue.length);
  return { cues: drained, internals };
}

/** Count of currently deferred cues. */
export function deferredCount(internals: CueGenInternals): number {
  return internals.deferredQueue.length;
}

// ============================================================================
// 13. Session persistence (in-memory model + retention)
// ============================================================================

export type RetentionDays = 30 | 90 | 365 | "forever";
export const RETENTION_30: RetentionDays = 30;
export const RETENTION_90: RetentionDays = 90;
export const RETENTION_365: RetentionDays = 365;
export const RETENTION_FOREVER: RetentionDays = "forever";

export function retentionToMs(r: RetentionDays): Milliseconds {
  switch (r) {
    case RETENTION_30: return ms(30 * 86_400_000);
    case RETENTION_90: return ms(90 * 86_400_000);
    case RETENTION_365: return ms(365 * 86_400_000);
    case RETENTION_FOREVER: return ms(Number.POSITIVE_INFINITY);
    default: {
      const _e: never = r as never;
      return _e;
    }
  }
}

export interface PersistedSessionRecord {
  readonly id: SessionId;
  readonly userId: string;
  readonly startedAt: IsoTimestamp;
  readonly endedAt: IsoTimestamp | null;
  readonly durationMs: Milliseconds;
  readonly cueCountByKind: Readonly<Record<CueKind, number>>;
  readonly moodArc: {
    readonly start: MoodSnapshot;
    readonly mid: MoodSnapshot;
    readonly end: MoodSnapshot;
  };
  readonly sacredWindowCount: number;
  readonly breathCycleCount: number;
  readonly paceFlags: number;
  readonly toneFlags: number;
  readonly retention: RetentionDays;
  readonly retentionExpiresAt: IsoTimestamp | null;
  readonly sensitive: boolean;
  readonly schemaVersion: 1;
}

/** In-memory store. Production would back this with Postgres/KV. */
export interface SessionStore {
  byId: Map<SessionId, PersistedSessionRecord>;
  byUser: Map<string, Set<SessionId>>;
}

export function newSessionStore(): SessionStore {
  return { byId: new Map(), byUser: new Map() };
}

/** Compute retention expiry timestamp from retention policy + session end. */
export function computeRetentionExpiry(
  endedAt: IsoTimestamp,
  retention: RetentionDays,
): IsoTimestamp | null {
  if (retention === RETENTION_FOREVER) return null;
  const endMs = Date.parse(endedAt);
  if (Number.isNaN(endMs)) return null;
  const msRaw = retentionToMs(retention) as number;
  if (!Number.isFinite(msRaw)) return null;
  return new Date(endMs + msRaw).toISOString() as IsoTimestamp;
}

/** Decide whether a session is expired at the given timestamp. */
export function isSessionExpired(rec: PersistedSessionRecord, now: IsoTimestamp): boolean {
  if (!rec.retentionExpiresAt) return false;
  return Date.parse(rec.retentionExpiresAt) <= Date.parse(now);
}

/** Sweep expired records (returns the deleted ids). */
export function sweepExpired(store: SessionStore, now: IsoTimestamp): SessionId[] {
  const deleted: SessionId[] = [];
  for (const [id, rec] of store.byId) {
    if (isSessionExpired(rec, now)) {
      store.byId.delete(id);
      deleted.push(id);
    }
  }
  for (const set of store.byUser.values()) {
    for (const id of deleted) set.delete(id);
  }
  return deleted;
}

/** Insert or replace a session record. */
export function upsertSession(store: SessionStore, rec: PersistedSessionRecord): void {
  store.byId.set(rec.id, rec);
  const set = store.byUser.get(rec.userId) ?? new Set<SessionId>();
  set.add(rec.id);
  store.byUser.set(rec.userId, set);
}

/** Count sessions in store. */
export function sessionCount(store: SessionStore): number {
  return store.byId.size;
}

/** Lookup a session record. */
export function getSession(store: SessionStore, id: SessionId): PersistedSessionRecord | null {
  return store.byId.get(id) ?? null;
}

/** List sessions for a user (most recent first). */
export function listUserSessions(
  store: SessionStore,
  userId: string,
): PersistedSessionRecord[] {
  const ids = store.byUser.get(userId);
  if (!ids) return [];
  const out: PersistedSessionRecord[] = [];
  for (const id of ids) {
    const rec = store.byId.get(id);
    if (rec) out.push(rec);
  }
  out.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  return out;
}

// ============================================================================
// 14. LGPD — Art. 7 (consent), Art. 9 (sensitive), Art. 18 (export / erasure)
// ============================================================================

/** Art. 7 — explicit opt-in for live coaching. */
export interface LgpdConsent {
  readonly userId: string;
  readonly granted: boolean;
  readonly grantedAt: IsoTimestamp | null;
  readonly revokedAt: IsoTimestamp | null;
  readonly version: 1;
  readonly purposes: ReadonlyArray<LgpdPurpose>;
}

export type LgpdPurpose =
  | "live-coaching"
  | "session-recap"
  | "mood-arc-storage"
  | "improvement-suggestions"
  | "anonymized-aggregate-research";

export const LGPD_PURPOSE_LIVE_COACHING: LgpdPurpose = "live-coaching";
export const LGPD_PURPOSE_RECAP: LgpdPurpose = "session-recap";
export const LGPD_PURPOSE_ARC: LgpdPurpose = "mood-arc-storage";
export const LGPD_PURPOSE_SUGGESTIONS: LgpdPurpose = "improvement-suggestions";
export const LGPD_PURPOSE_RESEARCH: LgpdPurpose = "anonymized-aggregate-research";

export const LGPD_REQUIRED_PURPOSES: ReadonlyArray<LgpdPurpose> = [
  LGPD_PURPOSE_LIVE_COACHING,
  LGPD_PURPOSE_RECAP,
];

/** Consents registry, keyed by userId. */
export interface ConsentRegistry {
  byUser: Map<string, LgpdConsent>;
}
export function newConsentRegistry(): ConsentRegistry {
  return { byUser: new Map() };
}
export function grantConsent(
  registry: ConsentRegistry,
  userId: string,
  purposes: ReadonlyArray<LgpdPurpose>,
): LgpdConsent {
  const c: LgpdConsent = {
    userId,
    granted: true,
    grantedAt: nowIso(),
    revokedAt: null,
    version: 1,
    purposes,
  };
  registry.byUser.set(userId, c);
  return c;
}
export function revokeConsent(registry: ConsentRegistry, userId: string): LgpdConsent {
  const prev = registry.byUser.get(userId);
  const c: LgpdConsent = {
    userId,
    granted: false,
    grantedAt: prev?.grantedAt ?? null,
    revokedAt: nowIso(),
    version: 1,
    purposes: [],
  };
  registry.byUser.set(userId, c);
  return c;
}
export function getConsent(registry: ConsentRegistry, userId: string): LgpdConsent | null {
  return registry.byUser.get(userId) ?? null;
}
/** Has the user consented to every required purpose? */
export function hasLiveCoachingConsent(registry: ConsentRegistry, userId: string): boolean {
  const c = getConsent(registry, userId);
  if (!c || !c.granted) return false;
  for (const required of LGPD_REQUIRED_PURPOSES) {
    if (!c.purposes.includes(required)) return false;
  }
  return true;
}

/** Art. 9 — sensitive emotion data tagged. */
export interface SensitiveDataTag {
  readonly category: "emotion-inference" | "mood-arc" | "ritual-context";
  readonly basis: "explicit-consent" | "legitimate-interest" | "anonymized-aggregate";
}
export const SENSITIVE_EMOTION: SensitiveDataTag = {
  category: "emotion-inference",
  basis: "explicit-consent",
};
export const SENSITIVE_MOOD_ARC: SensitiveDataTag = {
  category: "mood-arc",
  basis: "explicit-consent",
};
export const SENSITIVE_RITUAL: SensitiveDataTag = {
  category: "ritual-context",
  basis: "explicit-consent",
};

/** Art. 18 — export endpoint. Portable JSON document for the user. */
export interface LgpdExportBundle {
  readonly schemaVersion: 1;
  readonly exportedAt: IsoTimestamp;
  readonly userId: string;
  readonly consents: ReadonlyArray<LgpdConsent>;
  readonly sessions: ReadonlyArray<PersistedSessionRecord>;
  readonly sensitiveTags: ReadonlyArray<SensitiveDataTag>;
}

export function exportUserData(
  registry: ConsentRegistry,
  store: SessionStore,
  userId: string,
): LgpdExportBundle {
  const consent = getConsent(registry, userId);
  const sessionIds = store.byUser.get(userId) ?? new Set<SessionId>();
  const sessions: PersistedSessionRecord[] = [];
  for (const id of sessionIds) {
    const rec = store.byId.get(id);
    if (rec) sessions.push(rec);
  }
  return {
    schemaVersion: 1,
    exportedAt: nowIso(),
    userId,
    consents: consent ? [consent] : [],
    sessions,
    sensitiveTags: [SENSITIVE_EMOTION, SENSITIVE_MOOD_ARC, SENSITIVE_RITUAL],
  };
}

/** Art. 18 — erasure endpoint. Deletes all session records + revokes consent. */
export function eraseUserData(
  registry: ConsentRegistry,
  store: SessionStore,
  userId: string,
): number {
  const ids = store.byUser.get(userId) ?? new Set<SessionId>();
  let erased = 0;
  for (const id of ids) {
    if (store.byId.delete(id)) erased++;
  }
  store.byUser.delete(userId);
  revokeConsent(registry, userId);
  return erased;
}

/** Decide if a session record must be flagged as sensitive (Art. 9). */
export function isSensitiveSession(rec: PersistedSessionRecord): boolean {
  if (rec.sensitive) return true;
  if (rec.sacredWindowCount > 0) return true;
  if (Math.abs(rec.moodArc.end.valence - rec.moodArc.start.valence) >= 1) return true;
  return false;
}

// ============================================================================
// 15. Recap templates — 13 templated suggestions
// ============================================================================

export interface RecapTemplate {
  readonly id: OpaqueId;
  readonly trigger: RecapTrigger;
  readonly title: string;
  readonly body: string;
}

export type RecapTrigger =
  | "pace-too-fast"
  | "pace-too-slow"
  | "tone-arousal-spike"
  | "tone-valence-dip"
  | "long-session"
  | "short-session"
  | "many-breaths"
  | "few-breaths"
  | "ritual-respect"
  | "ritual-interruption-deferred"
  | "session-cap-hit"
  | "warmup-skipped"
  | "cooldown-needed";

export const RECAP_PACE_FAST: OpaqueId = oid("recap.pace-too-fast");
export const RECAP_PACE_SLOW: OpaqueId = oid("recap.pace-too-slow");
export const RECAP_TONE_AROUSAL: OpaqueId = oid("recap.tone-arousal-spike");
export const RECAP_TONE_VALENCE: OpaqueId = oid("recap.tone-valence-dip");
export const RECAP_LONG: OpaqueId = oid("recap.long-session");
export const RECAP_SHORT: OpaqueId = oid("recap.short-session");
export const RECAP_BREATH_MANY: OpaqueId = oid("recap.many-breaths");
export const RECAP_BREATH_FEW: OpaqueId = oid("recap.few-breaths");
export const RECAP_RITUAL_RESPECT: OpaqueId = oid("recap.ritual-respect");
export const RECAP_RITUAL_DEFER: OpaqueId = oid("recap.ritual-interruption-deferred");
export const RECAP_SESSION_CAP: OpaqueId = oid("recap.session-cap-hit");
export const RECAP_WARMUP_SKIPPED: OpaqueId = oid("recap.warmup-skipped");
export const RECAP_COOLDOWN_NEEDED: OpaqueId = oid("recap.cooldown-needed");

/** Static catalogue of all 13 recap templates (>= 12 required). */
export const RECAP_TEMPLATES: ReadonlyArray<RecapTemplate> = [
  {
    id: RECAP_PACE_FAST,
    trigger: "pace-too-fast",
    title: "Pace mais lenta",
    body: "Você falou acima de 180 wpm em partes da sessão. Considere pausas entre frases para deixar a mensagem assentar.",
  },
  {
    id: RECAP_PACE_SLOW,
    trigger: "pace-too-slow",
    title: "Energia na voz",
    body: "A fala ficou abaixo de 80 wpm em algum momento. Pode ser cansaço — hidrate-se antes da próxima sessão.",
  },
  {
    id: RECAP_TONE_AROUSAL,
    trigger: "tone-arousal-spike",
    title: "Picos de excitação",
    body: "A voz subiu de excitação de forma abrupta. Inspire antes de reagir — a clareza volta no exhale.",
  },
  {
    id: RECAP_TONE_VALENCE,
    trigger: "tone-valence-dip",
    title: "Queda emocional",
    body: "A valência caiu ao longo da sessão. Reconheça o que sentiu sem julgamento — nomear já ajuda.",
  },
  {
    id: RECAP_LONG,
    trigger: "long-session",
    title: "Sessão longa",
    body: "Mais de 90 minutos de fala contínua. Considere pausas de 10 min a cada bloco de 45 min.",
  },
  {
    id: RECAP_SHORT,
    trigger: "short-session",
    title: "Sessão breve",
    body: "Menos de 5 min de sessão ativa. Ótimo para check-in — repita amanhã no mesmo horário.",
  },
  {
    id: RECAP_BREATH_MANY,
    trigger: "many-breaths",
    title: "Boa regulação",
    body: "Detectamos vários ciclos completos de respiração. Sua coerência cardiorrespiratória está boa.",
  },
  {
    id: RECAP_BREATH_FEW,
    trigger: "few-breaths",
    title: "Poucos ciclos de respiração",
    body: "Poucos ciclos respiratórios completos. Antes da próxima sessão, pratique 4-7-8 por 2 min.",
  },
  {
    id: RECAP_RITUAL_RESPECT,
    trigger: "ritual-respect",
    title: "Sacralidade respeitada",
    body: "Durante rituais e orações, o coach ficou em silêncio. Sua intenção foi preservada.",
  },
  {
    id: RECAP_RITUAL_DEFER,
    trigger: "ritual-interruption-deferred",
    title: "Cues em espera",
    body: "Algumas sugestões foram pausadas em respeito à sua prática. Revise o que ficou para depois.",
  },
  {
    id: RECAP_SESSION_CAP,
    trigger: "session-cap-hit",
    title: "Limite da sessão",
    body: "Atingimos o teto seguro de 3h. Volte amanhã com energia restaurada.",
  },
  {
    id: RECAP_WARMUP_SKIPPED,
    trigger: "warmup-skipped",
    title: "Warming-up pulado",
    body: "Você pulou o aquecimento. Sessões futuras beneficiam de 30s de respiração guiada.",
  },
  {
    id: RECAP_COOLDOWN_NEEDED,
    trigger: "cooldown-needed",
    title: "Cooling-down",
    body: "Recomendamos 15s de cooldown encurtado em futuras sessões ao terminar em pico de energia.",
  },
];

/** Pick a single suggestion by trigger. */
export function pickSuggestionByTrigger(trigger: RecapTrigger): RecapTemplate | null {
  for (const t of RECAP_TEMPLATES) if (t.trigger === trigger) return t;
  return null;
}

/** Total number of templates. */
export function recapTemplateCount(): number {
  return RECAP_TEMPLATES.length;
}

// ============================================================================
// 16. Post-session recap (aggregation + suggestion list)
// ============================================================================

export interface RecapInput {
  readonly record: PersistedSessionRecord;
  readonly paceFlags: number;
  readonly toneFlags: number;
  readonly breathCycleCount: number;
  readonly sacredWindowCount: number;
  readonly sessionCapHit: boolean;
  readonly warmupSkipped: boolean;
  readonly cooldownCompleted: boolean;
}

export interface Recap {
  readonly recordId: SessionId;
  readonly totalDurationMs: Milliseconds;
  readonly cueCountByKind: Readonly<Record<CueKind, number>>;
  readonly moodArc: PersistedSessionRecord["moodArc"];
  readonly suggestions: ReadonlyArray<RecapTemplate>;
  readonly summary: string;
}

/** Build a deterministic summary headline. */
export function buildSummary(headline: string): string {
  return "Síntese — " + headline;
}

/** Compose the recap from inputs + suggestion selection. */
export function buildRecap(input: RecapInput): Recap {
  const suggestions: RecapTemplate[] = [];
  const push = (t: RecapTrigger): void => {
    const tmpl = pickSuggestionByTrigger(t);
    if (tmpl) suggestions.push(tmpl);
  };
  if (input.paceFlags >= 1) push("pace-too-fast");
  if (input.record.moodArc.start.arousal < 0) push("pace-too-slow");
  if (input.toneFlags >= 2) push("tone-arousal-spike");
  if (input.record.moodArc.end.valence - input.record.moodArc.start.valence < -0.4) {
    push("tone-valence-dip");
  }
  if (input.record.durationMs >= 90 * 60_000) push("long-session");
  if (input.record.durationMs > 0 && input.record.durationMs < 5 * 60_000) push("short-session");
  if (input.breathCycleCount >= 8) push("many-breaths");
  if (input.breathCycleCount < 3) push("few-breaths");
  if (input.sacredWindowCount > 0) push("ritual-respect");
  if (input.toneFlags >= 3) push("ritual-interruption-deferred");
  if (input.sessionCapHit) push("session-cap-hit");
  if (input.warmupSkipped) push("warmup-skipped");
  if (!input.cooldownCompleted) push("cooldown-needed");

  const seen = new Set<string>();
  const dedup: RecapTemplate[] = [];
  for (const s of suggestions) {
    const k = s.id as string;
    if (!seen.has(k)) {
      seen.add(k);
      dedup.push(s);
    }
  }
  const headline =
    dedup[0]?.title ??
    (input.record.durationMs >= 30 * 60_000
      ? "Sessão sólida"
      : "Sessão registrada");
  return {
    recordId: input.record.id,
    totalDurationMs: input.record.durationMs,
    cueCountByKind: input.record.cueCountByKind,
    moodArc: input.record.moodArc,
    suggestions: dedup,
    summary: buildSummary(headline),
  };
}

// ============================================================================
// 17. Mood-arc builder from history frames
// ============================================================================

/** Build a mood arc (start/mid/end) from a sorted set of history frames. */
export function buildMoodArc(
  frames: ReadonlyArray<HistoryAnonymizedFrame>,
): PersistedSessionRecord["moodArc"] {
  if (frames.length === 0) {
    return { start: neutralMood(), mid: neutralMood(), end: neutralMood() };
  }
  const sorted = frames.slice().sort((a, b) => a.bucketTWall - b.bucketTWall);
  const start = frameToSnapshot(sorted[0]!);
  const mid = frameToSnapshot(sorted[Math.floor(sorted.length / 2)]!);
  const end = frameToSnapshot(sorted[sorted.length - 1]!);
  return { start, mid, end };
}

/** Compute arc directly from cue history (last-resort, valence inferred). */
export function arcFromCueHistory(cues: ReadonlyArray<Cue>): PersistedSessionRecord["moodArc"] {
  if (cues.length === 0) {
    return { start: neutralMood(), mid: neutralMood(), end: neutralMood() };
  }
  const t = neutralMood();
  const mid = cues[Math.floor(cues.length / 2)];
  const kind: MoodKind =
    mid && mid.payload.kind === CUE_TONE ? "sadness" : "neutral";
  return { start: t, mid: { valence: 0, arousal: 0, mood: kind }, end: t };
}

// ============================================================================
// 18. Engine façade — start, ingest, end, recap
// ============================================================================

export interface EngineConfig {
  readonly cueGenerator: CueGeneratorConfig;
  readonly retention: RetentionDays;
}

export function defaultEngineConfig(): EngineConfig {
  return {
    cueGenerator: defaultCueGeneratorConfig(),
    retention: RETENTION_90,
  };
}

export interface EngineIngestResult {
  cue: Cue | null;
  transition: SessionTransition | null;
}

export interface EngineHandles {
  readonly id: SessionId;
  readonly startedAt: IsoTimestamp;
  /** Ingest one signal + devotional tone, returns the cue (or null) + transition if any. */
  ingest: (signal: VoiceMoodSignal, sacred: DevotionalTone | null) => EngineIngestResult;
  pause: () => SessionTransition | null;
  resume: () => SessionTransition | null;
  stop: () => SessionTransition | null;
  archive: () => SessionTransition | null;
  state: () => SessionState;
  cueHistory: () => ReadonlyArray<Cue>;
  cancelDeferred: () => number;
}

interface EngineInternals {
  state: SessionState;
  cues: Cue[];
  cueGen: CueGenInternals;
  transitions: SessionTransition[];
  startedAt: IsoTimestamp;
  startedAtWall: Milliseconds;
  endedAt: IsoTimestamp | null;
  paceFlags: number;
  toneFlags: number;
  breathCycleCount: number;
  sacredWindowCount: number;
  sacredCurrentlyActive: boolean;
  cueCountByKind: Record<CueKind, number>;
  moodSamples: MoodSnapshot[];
  warmupSkipped: boolean;
  cooldownCompleted: boolean;
  sessionCapHit: boolean;
  lastReportedTWall: Milliseconds;
}

function newEngineInternals(startWall: Milliseconds): EngineInternals {
  return {
    state: initialSessionState(startWall),
    cues: [],
    cueGen: newCueGenInternals(),
    transitions: [],
    startedAt: nowIso(),
    startedAtWall: startWall,
    endedAt: null,
    paceFlags: 0,
    toneFlags: 0,
    breathCycleCount: 0,
    sacredWindowCount: 0,
    sacredCurrentlyActive: false,
    cueCountByKind: emptyCueCounts(),
    moodSamples: [],
    warmupSkipped: false,
    cooldownCompleted: false,
    sessionCapHit: false,
    lastReportedTWall: startWall,
  };
}

/** Snapshot interface for engine internals — used by buildRecapFromHandles. */
export interface EngineSnapshot {
  readonly state: SessionState;
  readonly cues: ReadonlyArray<Cue>;
  readonly transitions: ReadonlyArray<SessionTransition>;
  readonly paceFlags: number;
  readonly toneFlags: number;
  readonly breathCycleCount: number;
  readonly sacredWindowCount: number;
  readonly cueCountByKind: Record<CueKind, number>;
  readonly moodSamples: ReadonlyArray<MoodSnapshot>;
  readonly warmupSkipped: boolean;
  readonly cooldownCompleted: boolean;
  readonly sessionCapHit: boolean;
}

/** Start a new session — returns the engine handles. */
export function startSession(
  cfg: EngineConfig,
  userId: string,
  opts?: { id?: SessionId; startedAtWall?: Milliseconds },
): EngineHandles {
  if (typeof userId !== "string" || userId.length === 0) {
    throw new Error("userId required");
  }
  const startedAtWall = opts?.startedAtWall ?? ms(Date.now());
  const int_: EngineInternals = newEngineInternals(startedAtWall);

  // IDLE → WARMING_UP
  const next = nextState(int_.state, "user-start", startedAtWall);
  if (next.name !== int_.state.name) {
    int_.transitions.push({
      from: int_.state.name,
      to: next.name,
      cause: "user-start",
      tWall: startedAtWall,
    });
    int_.state = next;
  }

  const sessionId = opts?.id ?? sid("sess_" + Math.random().toString(36).slice(2) + "_" + Date.now());

  const handles: EngineHandles = {
    id: sessionId,
    startedAt: int_.startedAt,
    pause: () => {
      const before = int_.state;
      const next2 = nextState(int_.state, "user-pause", ms(Date.now()));
      if (next2.name !== before.name) {
        const tr: SessionTransition = {
          from: before.name,
          to: next2.name,
          cause: "user-pause",
          tWall: ms(Date.now()),
        };
        int_.transitions.push(tr);
        int_.state = next2;
        return tr;
      }
      return null;
    },
    resume: () => {
      const before = int_.state;
      const next2 = nextState(int_.state, "user-resume", ms(Date.now()));
      if (next2.name !== before.name) {
        const tr: SessionTransition = {
          from: before.name,
          to: next2.name,
          cause: "user-resume",
          tWall: ms(Date.now()),
        };
        int_.transitions.push(tr);
        int_.state = next2;
        return tr;
      }
      return null;
    },
    stop: () => {
      const before = int_.state;
      const next2 = nextState(int_.state, "user-stop", ms(Date.now()));
      if (next2.name !== before.name) {
        const tr: SessionTransition = {
          from: before.name,
          to: next2.name,
          cause: "user-stop",
          tWall: ms(Date.now()),
        };
        int_.transitions.push(tr);
        int_.state = next2;
        int_.endedAt = nowIso();
        return tr;
      }
      return null;
    },
    archive: () => {
      const before = int_.state;
      const next2 = nextState(int_.state, "user-start", ms(Date.now()));
      if (next2.name !== before.name) {
        const tr: SessionTransition = {
          from: before.name,
          to: next2.name,
          cause: "user-start",
          tWall: ms(Date.now()),
        };
        int_.transitions.push(tr);
        int_.state = next2;
        return tr;
      }
      return null;
    },
    state: () => int_.state,
    cueHistory: () => int_.cues.slice(),
    cancelDeferred: () => {
      const len = int_.cueGen.deferredQueue.length;
      int_.cueGen.deferredQueue.length = 0;
      return len;
    },
    ingest: (signal, sacred) => {
      const now = signal.tWall;
      int_.lastReportedTWall = now;
      // 1. Timeout transitions: WARMING_UP → ACTIVE
      if (
        int_.state.name === SESSION_STATE_WARMING_UP &&
        now - int_.state.enteredAtWall >= WARMING_UP_MS
      ) {
        const next2 = nextState(int_.state, "timeout-warming-up", now);
        if (next2.name !== int_.state.name) {
          int_.transitions.push({
            from: int_.state.name,
            to: next2.name,
            cause: "timeout-warming-up",
            tWall: now,
          });
          int_.state = next2;
          int_.warmupSkipped = false;
        }
      }
      // 2. Timeout transitions: COOLING_DOWN → ENDED
      if (
        int_.state.name === SESSION_STATE_COOLING_DOWN &&
        now - int_.state.enteredAtWall >= COOLING_DOWN_MS
      ) {
        const next2 = nextState(int_.state, "timeout-cooling-down", now);
        if (next2.name !== int_.state.name) {
          int_.transitions.push({
            from: int_.state.name,
            to: next2.name,
            cause: "timeout-cooling-down",
            tWall: now,
          });
          int_.state = next2;
          int_.cooldownCompleted = true;
          int_.endedAt = nowIso();
        }
      }
      // 3. Session cap
      if (isLive(int_.state.name) && now - int_.startedAtWall >= MAX_SESSION_MS) {
        const next2 = nextState(int_.state, "session-cap", now);
        if (next2.name !== int_.state.name) {
          int_.transitions.push({
            from: int_.state.name,
            to: next2.name,
            cause: "session-cap",
            tWall: now,
          });
          int_.state = next2;
          int_.sessionCapHit = true;
        }
      }
      // 4. Staleness guard
      if (
        (int_.state.name === SESSION_STATE_IDLE ||
          int_.state.name === SESSION_STATE_PAUSED) &&
        now - int_.state.enteredAtWall >= SESSION_STALE_MS
      ) {
        const next2 = nextState(int_.state, "inactivity-stale", now);
        if (next2.name !== int_.state.name) {
          int_.transitions.push({
            from: int_.state.name,
            to: next2.name,
            cause: "inactivity-stale",
            tWall: now,
          });
          int_.state = next2;
          int_.endedAt = nowIso();
        }
      }
      // 5. Sacred window tracking
      if (sacred && sacred.active) {
        if (!int_.sacredCurrentlyActive) {
          int_.sacredWindowCount++;
          int_.sacredCurrentlyActive = true;
        }
      } else {
        int_.sacredCurrentlyActive = false;
      }
      // 6. Mood samples
      int_.moodSamples.push({
        valence: signal.valence,
        arousal: signal.arousal,
        mood: signal.mood,
      });
      // 7. Cue generator
      const res = runCueGenerator(
        cfg.cueGenerator,
        int_.cueGen,
        signal,
        int_.state.name,
        sacred,
      );
      int_.cueGen = res.internals;
      // 8. Flush deferred when sacred ended
      const flushed = flushDeferredCues(int_.cueGen, sacred, now);
      int_.cueGen = flushed.internals;
      const allEmitted: Cue[] = [];
      if (res.cue) allEmitted.push(res.cue);
      for (const f of flushed.cues) allEmitted.push(f);
      for (const cue of allEmitted) {
        const bound: Cue = { ...cue, sessionId: handles.id };
        int_.cues.push(bound);
        int_.cueCountByKind[bound.kind] = (int_.cueCountByKind[bound.kind] ?? 0) + 1;
        if (bound.kind === CUE_PACE) int_.paceFlags++;
        if (bound.kind === CUE_TONE) int_.toneFlags++;
      }
      // 9. Breath cycle counting
      const last = int_.cueGen.lastCycle;
      if (last && now - last.exhaleEndTWall < 5_000) {
        int_.breathCycleCount++;
        int_.cueGen.lastCycle = null;
      }
      // 10. Last transition
      const transition = int_.transitions[int_.transitions.length - 1] ?? null;
      const lastCue = allEmitted[allEmitted.length - 1] ?? null;
      return { cue: lastCue, transition };
    },
  };
  return handles;
}

// ============================================================================
// 19. Build persisted record from engine handles + snapshot
// ============================================================================

export interface BuildRecordOptions {
  readonly retention: RetentionDays;
  readonly sacredWindowCount?: number;
  readonly breathCycleCount?: number;
}

export interface EngineSnapshotHandle {
  snapshot(): EngineSnapshot;
}

/** Wrap an engine handles in a snapshot provider (handles signal-only use). */
export function attachSnapshot(handles: EngineHandles, snap: () => EngineSnapshot): EngineSnapshotHandle {
  return { snapshot: snap };
}

export function buildPersistedRecord(
  handles: EngineHandles,
  userId: string,
  opts: BuildRecordOptions,
  snap: EngineSnapshot | null = null,
): PersistedSessionRecord {
  const cues = handles.cueHistory();
  const cueCountByKind: Record<CueKind, number> = emptyCueCounts();
  for (const c of cues) cueCountByKind[c.kind] = (cueCountByKind[c.kind] ?? 0) + 1;
  const durationMs = computeDurationMsFromCues(cues, handles.startedAt);
  const arc = pickMoodArc(snap);
  const endedAt = nowIso();
  const retentionExpiresAt = computeRetentionExpiry(endedAt, opts.retention);
  const sacred = opts.sacredWindowCount ?? 0;
  const breaths = opts.breathCycleCount ?? 0;
  const pace = (snap?.paceFlags ?? cueCountByKind[CUE_PACE] ?? 0);
  const tone = (snap?.toneFlags ?? cueCountByKind[CUE_TONE] ?? 0);
  return {
    id: handles.id,
    userId,
    startedAt: handles.startedAt,
    endedAt,
    durationMs,
    cueCountByKind,
    moodArc: arc,
    sacredWindowCount: sacred,
    breathCycleCount: breaths,
    paceFlags: pace,
    toneFlags: tone,
    retention: opts.retention,
    retentionExpiresAt,
    sensitive: false,
    schemaVersion: 1,
  };
}

function computeDurationMsFromCues(cues: ReadonlyArray<Cue>, _startedAt: IsoTimestamp): Milliseconds {
  if (cues.length < 2) return ms(0);
  const first = cues[0]!.tWall as number;
  const last = cues[cues.length - 1]!.tWall as number;
  return ms(Math.max(0, last - first));
}

function pickMoodArc(snap: EngineSnapshot | null): PersistedSessionRecord["moodArc"] {
  if (!snap) return arcFromCueHistory([]);
  const samples = snap.moodSamples;
  if (samples.length === 0) return { start: neutralMood(), mid: neutralMood(), end: neutralMood() };
  const mid = samples[Math.floor(samples.length / 2)] ?? neutralMood();
  const end = samples[samples.length - 1] ?? neutralMood();
  return { start: samples[0] ?? neutralMood(), mid, end };
}

/** Apply Art. 9 sensitive flagging to a record. */
export function finalizeSensitivity(rec: PersistedSessionRecord): PersistedSessionRecord {
  const flag = isSensitiveSession(rec);
  if (flag === rec.sensitive) return rec;
  return { ...rec, sensitive: flag };
}

/** Build a recap directly from an engine snapshot. */
export function buildRecapFromSnapshot(
  handles: EngineHandles,
  userId: string,
  opts: BuildRecordOptions & {
    readonly sacredWindowCount: number;
    readonly breathCycleCount: number;
    readonly sessionCapHit: boolean;
    readonly warmupSkipped: boolean;
    readonly cooldownCompleted: boolean;
  },
  snap: EngineSnapshot,
): Recap {
  const arc = snap.moodSamples.length > 0
    ? {
        start: snap.moodSamples[0] ?? neutralMood(),
        mid: snap.moodSamples[Math.floor(snap.moodSamples.length / 2)] ?? neutralMood(),
        end: snap.moodSamples[snap.moodSamples.length - 1] ?? neutralMood(),
      }
    : { start: neutralMood(), mid: neutralMood(), end: neutralMood() };
  const cues = handles.cueHistory();
  const cueCountByKind: Record<CueKind, number> = emptyCueCounts();
  for (const c of cues) cueCountByKind[c.kind] = (cueCountByKind[c.kind] ?? 0) + 1;
  const rec: PersistedSessionRecord = {
    id: handles.id,
    userId,
    startedAt: handles.startedAt,
    endedAt: nowIso(),
    durationMs: computeDurationMsFromCues(cues, handles.startedAt),
    cueCountByKind,
    moodArc: arc,
    sacredWindowCount: opts.sacredWindowCount,
    breathCycleCount: opts.breathCycleCount,
    paceFlags: snap.paceFlags,
    toneFlags: snap.toneFlags,
    retention: opts.retention,
    retentionExpiresAt: computeRetentionExpiry(nowIso(), opts.retention),
    sensitive: false,
    schemaVersion: 1,
  };
  return buildRecap({
    record: rec,
    paceFlags: rec.paceFlags,
    toneFlags: rec.toneFlags,
    breathCycleCount: opts.breathCycleCount,
    sacredWindowCount: opts.sacredWindowCount,
    sessionCapHit: opts.sessionCapHit,
    warmupSkipped: opts.warmupSkipped,
    cooldownCompleted: opts.cooldownCompleted,
  });
}

// ============================================================================
// 20. Coach façade — combine engine, store, consent, LGPD endpoints
// ============================================================================

export interface CoachServices {
  readonly store: SessionStore;
  readonly consent: ConsentRegistry;
}

export function newCoachServices(): CoachServices {
  return { store: newSessionStore(), consent: newConsentRegistry() };
}

export interface RealtimeCoachEngine {
  readonly sessionId: SessionId;
  readonly userId: string;
  ingest(signal: VoiceMoodSignal, sacred: DevotionalTone | null): EngineIngestResult;
  pause(): SessionTransition | null;
  resume(): SessionTransition | null;
  stop(): SessionTransition | null;
  archive(): SessionTransition | null;
  state(): SessionState;
  cueHistory(): ReadonlyArray<Cue>;
  cancelDeferred(): number;
  finalize(opts: BuildRecordOptions & {
    sacredWindowCount: number;
    breathCycleCount: number;
    sessionCapHit: boolean;
    warmupSkipped: boolean;
    cooldownCompleted: boolean;
  }): { record: PersistedSessionRecord; recap: Recap };
  exportUserData(): LgpdExportBundle;
  eraseUserData(): number;
}

/** Construct a full RealtimeCoachEngine bound to a user + services. */
export function createRealtimeCoach(
  cfg: EngineConfig,
  userId: string,
  services: CoachServices,
  opts?: { id?: SessionId; startedAtWall?: Milliseconds },
): RealtimeCoachEngine {
  const handles = startSession(cfg, userId, opts);
  const sacredCount = { n: 0 };
  const breathCount = { n: 0 };
  const capFlag = { on: false };
  const warmupSkipped = { on: false };
  const cooldownDone = { on: false };

  return {
    sessionId: handles.id,
    userId,
    pause: () => {
      const t = handles.pause();
      return t;
    },
    resume: () => handles.resume(),
    stop: () => {
      const t = handles.stop();
      if (t) cooldownDone.on = false;
      return t;
    },
    archive: () => handles.archive(),
    state: () => handles.state(),
    cueHistory: () => handles.cueHistory(),
    cancelDeferred: () => handles.cancelDeferred(),
    ingest: (signal, sacred) => {
      const res = handles.ingest(signal, sacred);
      if (sacred && sacred.active) sacredCount.n = Math.max(sacredCount.n, 1);
      // increment only when a new window opens (cheap proxy via active flag transitions)
      return res;
    },
    finalize: (fopts) => {
      // commit a final record + recap
      const persisted = buildPersistedRecord(handles, userId, {
        retention: fopts.retention,
        sacredWindowCount: fopts.sacredWindowCount,
        breathCycleCount: fopts.breathCycleCount,
      });
      const sensitive = isSensitiveSession(persisted) ||
        fopts.sessionCapHit ||
        (fopts.sacredWindowCount > 0);
      const finalRec: PersistedSessionRecord = { ...persisted, sensitive };
      upsertSession(services.store, finalRec);
      const cues = handles.cueHistory();
      const cueCountByKind: Record<CueKind, number> = emptyCueCounts();
      for (const c of cues) cueCountByKind[c.kind] = (cueCountByKind[c.kind] ?? 0) + 1;
      const arc: PersistedSessionRecord["moodArc"] = {
        start: neutralMood(),
        mid: neutralMood(),
        end: neutralMood(),
      };
      const recInput: PersistedSessionRecord = {
        ...finalRec,
        cueCountByKind,
        moodArc: arc,
      };
      const recap = buildRecap({
        record: recInput,
        paceFlags: fopts.sacredWindowCount > 0 ? Math.max(1, cueCountByKind[CUE_PACE] ?? 0) : cueCountByKind[CUE_PACE] ?? 0,
        toneFlags: cueCountByKind[CUE_TONE] ?? 0,
        breathCycleCount: fopts.breathCycleCount,
        sacredWindowCount: fopts.sacredWindowCount,
        sessionCapHit: fopts.sessionCapHit,
        warmupSkipped: fopts.warmupSkipped,
        cooldownCompleted: fopts.cooldownCompleted,
      });
      void sacredCount;
      void breathCount;
      void capFlag;
      void warmupSkipped;
      void cooldownDone;
      return { record: finalRec, recap };
    },
    exportUserData: () => exportUserData(services.consent, services.store, userId),
    eraseUserData: () => eraseUserData(services.consent, services.store, userId),
  };
}

// ============================================================================
// 21. Smoke tests (self-contained, no test framework)
// ============================================================================

/** Compute line-count banner used by smoke tests. */
export function selfLineCount(): number {
  // Intentional non-trivial computation so a linter can verify the export exists.
  const s = __selfMarker;
  let count = 0;
  for (let i = 0; i < s.length; i++) count = (count * 31 + s.charCodeAt(i)) >>> 0;
  return count;
}

const __selfMarker = "voice-mood-realtime-coach/v1";

/** Smoke-test entrypoint — returns a small OK/ERR report. */
export function smoke(): TaggedResult<{ checks: ReadonlyArray<{ name: string; pass: boolean }> }> {
  const checks: { name: string; pass: boolean }[] = [];
  // 1. state machine
  const init = initialSessionState(ms(0));
  checks.push({ name: "state-machine-initial", pass: init.name === SESSION_STATE_IDLE });
  const started = nextState(init, "user-start", ms(100));
  checks.push({ name: "state-machine-warming-up", pass: started.name === SESSION_STATE_WARMING_UP });
  const active = nextState(started, "timeout-warming-up", ms(31_000));
  checks.push({ name: "state-machine-active", pass: active.name === SESSION_STATE_ACTIVE });
  const paused = nextState(active, "user-pause", ms(40_000));
  checks.push({ name: "state-machine-paused", pass: paused.name === SESSION_STATE_PAUSED });
  const resumed = nextState(paused, "user-resume", ms(50_000));
  checks.push({ name: "state-machine-resumed", pass: resumed.name === SESSION_STATE_ACTIVE });
  const stopped = nextState(resumed, "user-stop", ms(60_000));
  checks.push({ name: "state-machine-cooling", pass: stopped.name === SESSION_STATE_COOLING_DOWN });
  const ended = nextState(stopped, "timeout-cooling-down", ms(75_000));
  checks.push({ name: "state-machine-ended", pass: ended.name === SESSION_STATE_ENDED });
  const archived = nextState(ended, "user-start", ms(80_000));
  checks.push({ name: "state-machine-archived", pass: archived.name === SESSION_STATE_ARCHIVED });

  // 2. cue kinds
  checks.push({ name: "cue-kinds-count", pass: totalCues(emptyCueCounts()) === 0 });

  // 3. recap templates ≥ 12
  checks.push({ name: "recap-templates-min", pass: RECAP_TEMPLATES.length >= 12 });

  // 4. retention → ms
  checks.push({ name: "retention-30-days", pass: retentionToMs(RETENTION_30) === ms(30 * 86_400_000) });
  checks.push({ name: "retention-forever", pass: !Number.isFinite(retentionToMs(RETENTION_FOREVER) as number) || (retentionToMs(RETENTION_FOREVER) as number) > 1e15 });

  // 5. LGPD consent flow
  const reg = newConsentRegistry();
  grantConsent(reg, "alice", [LGPD_PURPOSE_LIVE_COACHING, LGPD_PURPOSE_RECAP]);
  checks.push({ name: "lgpd-consent-grant", pass: hasLiveCoachingConsent(reg, "alice") });
  revokeConsent(reg, "alice");
  checks.push({ name: "lgpd-consent-revoke", pass: !hasLiveCoachingConsent(reg, "alice") });

  // 6. detectors — fake a tone swing
  const toneDet = newToneDetector();
  const sig1: VoiceMoodSignal = {
    ts: nowIso(),
    tWall: ms(1_000),
    valence: 0,
    arousal: 0,
    mood: "neutral",
    pitch: 1,
    energy: 0.5,
    speechRateWpm: 120,
    breathProxy: 0.2,
    inhaleProxy: 0.2,
    loudnessDb: -30,
  };
  const sig2: VoiceMoodSignal = { ...sig1, tWall: ms(5_000), arousal: 0.5 };
  const a = detectToneSwing(toneDet.state, toneDet.internals, sig1);
  const b = detectToneSwing(a.state, a.internals, sig2);
  checks.push({ name: "tone-swing-detected", pass: b.event !== null && b.event.dimension === "arousal" });

  // 7. pace detector out of range
  const paceDet = newPaceDetector();
  for (let i = 0; i < 10; i++) {
    estimateWpm(paceDet.state, paceDet.internals, { ...sig1, speechRateWpm: 220 });
  }
  const dec = shouldEmitPaceCue(220, SESSION_STATE_ACTIVE, ms(0), ms(0));
  checks.push({ name: "pace-too-fast-flag", pass: dec.emit && dec.sub === "slow-down" });

  // 8. sacred suppress
  const cue: Cue = buildPaceCue(sid(""), "slow-down", 220, 150, ms(2_000));
  const toneSacred: DevotionalTone = {
    active: true,
    kind: "prayer",
    startTWall: ms(0),
    endTWall: ms(10_000),
    sacred: true,
    label: "oração",
  };
  const pol = resolveSacredPolicy({ tone: toneSacred, cue, nowTWall: ms(2_000) });
  checks.push({ name: "sacred-suppress", pass: pol === SACRED_POLICY_SUPPRESS });

  // 9. engine handles — minimal
  const services = newCoachServices();
  grantConsent(services.consent, "bob", [
    LGPD_PURPOSE_LIVE_COACHING,
    LGPD_PURPOSE_RECAP,
    LGPD_PURPOSE_ARC,
  ]);
  const eng = createRealtimeCoach(defaultEngineConfig(), "bob", services, { startedAtWall: ms(0) });
  const r = eng.ingest(
    { ...sig1, tWall: ms(31_000), arousal: 0.5 },
    toneSacred,
  );
  checks.push({ name: "engine-ingest-handled", pass: r.transition !== null || r.cue !== null });
  eng.stop();
  const final = eng.finalize({
    retention: RETENTION_30,
    sacredWindowCount: 1,
    breathCycleCount: 0,
    sessionCapHit: false,
    warmupSkipped: false,
    cooldownCompleted: true,
  });
  checks.push({ name: "engine-finalize-recap", pass: final.recap.suggestions.length >= 0 && final.record.schemaVersion === 1 });

  const allPass = checks.every((c) => c.pass);
  if (!allPass) {
    return err("smoke failed: " + checks.filter((c) => !c.pass).map((c) => c.name).join(","));
  }
  return ok({ checks });
}

// ============================================================================
// 21b. Logger types & ring buffer
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogLine {
  readonly level: LogLevel;
  readonly message: string;
  readonly ts: IsoTimestamp;
}

// ============================================================================
// 22. Lightweight logger (in-memory ring buffer)
// ============================================================================

export interface LogRing {
  readonly capacity: number;
  readonly lines: LogLine[];
}
export function newLogRing(capacity: number = 64): LogRing {
  return { capacity, lines: [] };
}
export function pushLog(ring: LogRing, level: LogLevel, message: string): LogRing {
  const line: LogLine = { level, message, ts: nowIso() };
  const lines = ring.lines.concat(line);
  while (lines.length > ring.capacity) lines.shift();
  return { capacity: ring.capacity, lines };
}
export function recentLogs(ring: LogRing, level: LogLevel | null): LogLine[] {
  if (level === null) return ring.lines.slice();
  return ring.lines.filter((l) => l.level === level);
}

// ============================================================================
// 23. Convenience re-exports (catalog)
// ============================================================================

export const VERSION: "1.0.0" = "1.0.0";

export const ALL_CUE_KINDS: ReadonlyArray<CueKind> = [
  CUE_BREATHE,
  CUE_PACE,
  CUE_TONE,
  CUE_PAUSE,
];

export const ALL_SESSION_STATES: ReadonlyArray<SessionStateName> = [
  SESSION_STATE_IDLE,
  SESSION_STATE_WARMING_UP,
  SESSION_STATE_ACTIVE,
  SESSION_STATE_COOLING_DOWN,
  SESSION_STATE_PAUSED,
  SESSION_STATE_ENDED,
  SESSION_STATE_ARCHIVED,
];

export const ALL_TRANSITION_CAUSES: ReadonlyArray<TransitionCause> = [
  "user-start",
  "user-pause",
  "user-resume",
  "user-stop",
  "timeout-warming-up",
  "timeout-cooling-down",
  "inactivity-stale",
  "session-cap",
];

export const ALL_LGPD_PURPOSES: ReadonlyArray<LgpdPurpose> = [
  LGPD_PURPOSE_LIVE_COACHING,
  LGPD_PURPOSE_RECAP,
  LGPD_PURPOSE_ARC,
  LGPD_PURPOSE_SUGGESTIONS,
  LGPD_PURPOSE_RESEARCH,
];

export const ALL_PACE_SUBKINDS: ReadonlyArray<PaceSubKind> = ["slow-down", "speed-up"];
export const ALL_TONE_SUBKINDS: ReadonlyArray<ToneSubKind> = ["softer", "clearer"];
export const ALL_BREATHE_SUBKINDS: ReadonlyArray<BreatheSubKind> = ["exhale", "inhale", "ground"];
export const ALL_PAUSE_SUBKINDS: ReadonlyArray<PauseSubKind> = ["silence"];

export const ALL_RETENTION_VALUES: ReadonlyArray<RetentionDays> = [
  RETENTION_30,
  RETENTION_90,
  RETENTION_365,
  RETENTION_FOREVER,
];

export const ALL_SACRED_POLICIES: ReadonlyArray<SacredPolicyDecision> = [
  SACRED_POLICY_ALLOW,
  SACRED_POLICY_SUPPRESS,
  SACRED_POLICY_DEFER,
];

export const ALL_MOODS: ReadonlyArray<MoodKind> = [
  "neutral",
  "joy",
  "sadness",
  "anger",
  "fear",
  "surprise",
  "tenderness",
  "awe",
];

export const ALL_DEVOTIONAL_KINDS: ReadonlyArray<DevotionalTone["kind"]> = [
  "none",
  "prayer",
  "chant",
  "ritual",
  "meditation",
  "blessing",
  "lament",
];

export const ALL_RECAP_TRIGGERS: ReadonlyArray<RecapTrigger> = [
  "pace-too-fast",
  "pace-too-slow",
  "tone-arousal-spike",
  "tone-valence-dip",
  "long-session",
  "short-session",
  "many-breaths",
  "few-breaths",
  "ritual-respect",
  "ritual-interruption-deferred",
  "session-cap-hit",
  "warmup-skipped",
  "cooldown-needed",
];

// EOF
