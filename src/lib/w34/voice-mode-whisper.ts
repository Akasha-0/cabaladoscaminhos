/**
 * voice-mode-whisper.ts
 *
 * Cycle 34 — Voice Mode (whisper layer) for the Cabala dos Caminhos reader.
 *
 * Composes with:
 *   - src/lib/w27/voice-mode.ts        (TTS playback core)
 *   - src/lib/w28/voice-mode-player.ts (audio engine wiring)
 *   - src/lib/w32/voice-clone-ui.ts    (cloned voice selection)
 *
 * Pure TypeScript: no runtime imports from app code, no I/O, no DOM. Every
 * state transition returns a fresh WhisperState (referentially transparent,
 * trivially testable). All timestamps are caller-supplied (`now`) so the
 * module is deterministic under test.
 *
 * Responsibilities:
 *   1. Whisper layer — soft, low-volume voice playback with fade-in/out and
 *      clarity preservation (gentle low-pass + de-esser so consonants stay
 *      legible while harshness drops).
 *   2. Sleep timer — caps a session at 5/10/15/30/60/90 min, optionally
 *      fading out at expiry instead of cutting audio.
 *   3. Ambient mode — non-verbal background scene (rain/forest/ocean/fire/
 *      wind/silence) mixed under the whisper.
 *   4. Low-power mode — battery < 20% AND whisper active → caller should
 *      reduce visual effects, polling, and haptics.
 *   5. Presets & cycling — three whisper presets (soft/gentle/lullaby) and
 *      a deterministic cycle through sleep timer durations.
 */

// ---------- TYPES ----------------------------------------------------------

export type WhisperVolume = 0.1 | 0.2 | 0.3;
export type WhisperFadeInMs = 1000 | 2000 | 3000;
export type WhisperFadeOutMs = 500 | 1000 | 2000;

export interface WhisperConfig {
  enabled: boolean;
  /** Output gain. Whisper is intentionally quiet; clamp 0..1 elsewhere. */
  volume: WhisperVolume;
  /** Linear-ramp from silence to `volume` when the session begins. */
  fadeInMs: WhisperFadeInMs;
  /** Linear-ramp from `volume` to silence at session end. */
  fadeOutMs: WhisperFadeOutMs;
  /** Low-pass + de-esser so consonants stay intelligible at low volume. */
  preserveClarity: boolean;
}

export type SleepTimerDurationMinutes = 5 | 10 | 15 | 30 | 60 | 90;

export interface SleepTimerConfig {
  durationMinutes: SleepTimerDurationMinutes;
  /** Unix-ms when the timer was armed. */
  startedAt: number;
  /** Unix-ms when the timer should fire (`startedAt + durationMinutes * 60_000`). */
  expiresAt: number;
  /** If true, fade out over `WhisperConfig.fadeOutMs` instead of hard cut. */
  fadeOut: boolean;
}

export type AmbientScene = "rain" | "forest" | "ocean" | "fire" | "wind" | "silence";
export type AmbientVolume = 0 | 0.1 | 0.2 | 0.3;

export interface AmbientMode {
  enabled: boolean;
  scene: AmbientScene;
  /** Mix level for the ambient bed; 0 = muted even if enabled. */
  volume: AmbientVolume;
  /** If true, loops the scene track indefinitely until stopAmbient(). */
  loopsInfinitely: boolean;
}

export interface WhisperState {
  isActive: boolean;
  currentConfig: WhisperConfig;
  currentSleepTimer: SleepTimerConfig | null;
  currentAmbient: AmbientMode;
  /** Unix-ms of the last transition into this state. */
  lastUpdated: number;
  /** Count of applyVolume() transitions — used by summarizeWhisperSession. */
  volumeChangeCount: number;
}

export interface WhisperValidationResult { valid: boolean; errors: string[]; }
export interface WhisperSessionSummary {
  durationMs: number;
  volumeChanges: number;
  sleepTimerUsed: boolean;
  ambientUsed: boolean;
}
export type WhisperPresetName = "soft" | "gentle" | "lullaby";
export interface SleepTimerCheck {
  expired: boolean;
  /** True iff the timer has expired AND was armed with a soft fade-out. */
  shouldFadeOut: boolean;
}

// ---------- CONSTANTS ------------------------------------------------------

export const WHISPER_PRESETS: readonly WhisperConfig[] = [
  { enabled: true, volume: 0.1, fadeInMs: 1000, fadeOutMs: 1000, preserveClarity: true  }, // soft
  { enabled: true, volume: 0.2, fadeInMs: 2000, fadeOutMs: 1000, preserveClarity: true  }, // gentle
  { enabled: true, volume: 0.3, fadeInMs: 3000, fadeOutMs: 2000, preserveClarity: false }, // lullaby
] as const;

export const SLEEP_TIMER_PRESETS = [5, 10, 15, 30, 60, 90] as const satisfies readonly SleepTimerDurationMinutes[];

export const AMBIENT_SCENES: readonly AmbientScene[] = ["rain", "forest", "ocean", "fire", "wind", "silence"] as const;

export const LOW_POWER_BATTERY_THRESHOLD = 0.2;

const VALID_VOLUMES: readonly number[] = [0.1, 0.2, 0.3];
const VALID_FADE_INS: readonly number[] = [1000, 2000, 3000];
const VALID_FADE_OUTS: readonly number[] = [500, 1000, 2000];
const VALID_AMBIENT_VOLUMES: readonly number[] = [0, 0.1, 0.2, 0.3];
const SILENT_AMBIENT: AmbientMode = { enabled: false, scene: "silence", volume: 0, loopsInfinitely: false };

// ---------- PURE HELPERS ---------------------------------------------------

/** Snap to nearest valid volume literal so the type stays exact. */
function clampToSet(value: number, set: readonly number[]): number {
  const clamped = Math.max(0, Math.min(1, value));
  return set.reduce((best, candidate) =>
    Math.abs(candidate - clamped) < Math.abs(best - clamped) ? candidate : best,
  );
}
const round1 = (v: number): number => Math.round(v * 10) / 10;
const isAmbientScene = (v: string): v is AmbientScene => (AMBIENT_SCENES as readonly string[]).includes(v);

// ---------- CORE STATE TRANSITIONS -----------------------------------------

export function startWhisper(config: WhisperConfig, now: number): WhisperState {
  return {
    isActive: true,
    currentConfig: { ...config, enabled: true },
    currentSleepTimer: null,
    currentAmbient: { ...SILENT_AMBIENT },
    lastUpdated: now,
    volumeChangeCount: 0,
  };
}

export function stopWhisper(state: WhisperState, now: number): WhisperState {
  // Caller schedules the actual fade-out audio ramp using `fadeOutMs`; this
  // transition only marks the state inactive and timestamps it.
  return {
    ...state,
    isActive: false,
    currentConfig: { ...state.currentConfig, enabled: false },
    currentSleepTimer: null,
    lastUpdated: now,
  };
}

export function applyVolume(state: WhisperState, newVolume: number): WhisperState {
  const clamped = round1(clampToSet(newVolume, VALID_VOLUMES)) as WhisperVolume;
  // preserveClarity = true caps per-step delta at 0.1 so ears don't track a
  // sudden jump; preserveClarity = false snaps immediately.
  let stepped: WhisperVolume = clamped;
  if (state.currentConfig.preserveClarity) {
    const delta = clamped - state.currentConfig.volume;
    if (delta > 0.1) stepped = round1(state.currentConfig.volume + 0.1) as WhisperVolume;
    else if (delta < -0.1) stepped = round1(state.currentConfig.volume - 0.1) as WhisperVolume;
  }
  return {
    ...state,
    currentConfig: { ...state.currentConfig, volume: stepped },
    volumeChangeCount: state.volumeChangeCount + 1,
  };
}

export function setSleepTimer(
  state: WhisperState,
  durationMinutes: SleepTimerDurationMinutes,
  now: number,
): WhisperState {
  return {
    ...state,
    currentSleepTimer: {
      durationMinutes,
      startedAt: now,
      expiresAt: now + durationMinutes * 60_000,
      fadeOut: true,
    },
    lastUpdated: now,
  };
}

export function cancelSleepTimer(state: WhisperState): WhisperState {
  if (state.currentSleepTimer === null) return state;
  return { ...state, currentSleepTimer: null };
}

export function checkSleepTimerExpired(state: WhisperState, now: number): SleepTimerCheck {
  const timer = state.currentSleepTimer;
  if (timer === null) return { expired: false, shouldFadeOut: false };
  const expired = now >= timer.expiresAt;
  return { expired, shouldFadeOut: expired && timer.fadeOut };
}

export function startAmbient(
  state: WhisperState,
  scene: AmbientScene,
  volume: number,
  now: number,
): WhisperState {
  if (!isAmbientScene(scene)) throw new Error(`voice-mode-whisper: unknown ambient scene "${scene}"`);
  const ambientVolume = round1(clampToSet(volume, VALID_AMBIENT_VOLUMES)) as AmbientVolume;
  return {
    ...state,
    currentAmbient: {
      enabled: scene !== "silence" && ambientVolume > 0,
      scene,
      volume: ambientVolume,
      loopsInfinitely: scene !== "silence",
    },
    lastUpdated: now,
  };
}

export function stopAmbient(state: WhisperState): WhisperState {
  if (!state.currentAmbient.enabled) return state;
  return { ...state, currentAmbient: { ...SILENT_AMBIENT } };
}

export function shouldEnterLowPowerMode(state: WhisperState, batteryLevel: number): boolean {
  if (!state.isActive) return false;
  if (!Number.isFinite(batteryLevel)) return false;
  if (batteryLevel < 0 || batteryLevel > 1) return false;
  return batteryLevel < LOW_POWER_BATTERY_THRESHOLD;
}

// ---------- VALIDATION & PRESETS ------------------------------------------

export function validateWhisperConfig(config: WhisperConfig): WhisperValidationResult {
  const errors: string[] = [];
  if (!VALID_VOLUMES.includes(config.volume)) {
    errors.push(`volume must be one of ${VALID_VOLUMES.join(", ")}, got ${config.volume}`);
  }
  if (!VALID_FADE_INS.includes(config.fadeInMs)) {
    errors.push(`fadeInMs must be one of ${VALID_FADE_INS.join(", ")}, got ${config.fadeInMs}`);
  }
  if (!VALID_FADE_OUTS.includes(config.fadeOutMs)) {
    errors.push(`fadeOutMs must be one of ${VALID_FADE_OUTS.join(", ")}, got ${config.fadeOutMs}`);
  }
  if (config.fadeInMs < config.fadeOutMs * 2) {
    errors.push(`fadeInMs (${config.fadeInMs}) should be ≥ 2× fadeOutMs (${config.fadeOutMs})`);
  }
  if (typeof config.enabled !== "boolean") errors.push("enabled must be a boolean");
  if (typeof config.preserveClarity !== "boolean") errors.push("preserveClarity must be a boolean");
  return { valid: errors.length === 0, errors };
}

export function getWhisperPreset(presetName: WhisperPresetName): WhisperConfig {
  switch (presetName) {
    case "soft":    return { ...WHISPER_PRESETS[0] };
    case "gentle":  return { ...WHISPER_PRESETS[1] };
    case "lullaby": return { ...WHISPER_PRESETS[2] };
  }
  throw new Error(`voice-mode-whisper: unknown preset "${presetName}"`);
}

export function cycleSleepTimerPreset(
  current: SleepTimerDurationMinutes,
  direction: "up" | "down",
): SleepTimerDurationMinutes {
  const idx = (SLEEP_TIMER_PRESETS as readonly number[]).indexOf(current);
  if (idx === -1) return direction === "up" ? 30 : 15; // unknown → middle of cycle
  const step = direction === "up" ? 1 : -1;
  const next = (idx + step + SLEEP_TIMER_PRESETS.length) % SLEEP_TIMER_PRESETS.length;
  return SLEEP_TIMER_PRESETS[next] as SleepTimerDurationMinutes;
}

// ---------- SESSION SUMMARY -----------------------------------------------

export function summarizeWhisperSession(
  state: WhisperState,
  sessionStartedAt: number,
  now: number,
): WhisperSessionSummary {
  return {
    durationMs: Math.max(now - sessionStartedAt, 0),
    volumeChanges: state.volumeChangeCount,
    sleepTimerUsed: state.currentSleepTimer !== null,
    ambientUsed: state.currentAmbient.enabled,
  };
}

// ---------- DEFAULT EXPORT ------------------------------------------------

export const DEFAULT_WHISPER_STATE: WhisperState = {
  isActive: false,
  currentConfig: { ...WHISPER_PRESETS[0], enabled: false },
  currentSleepTimer: null,
  currentAmbient: { ...SILENT_AMBIENT },
  lastUpdated: 0,
  volumeChangeCount: 0,
};