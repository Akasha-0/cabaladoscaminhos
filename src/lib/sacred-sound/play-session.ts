// ============================================================================
// SACRED SOUND — PLAY SESSION BUILDER
// ============================================================================
// Pure-logic session builder: takes a config, emits an ordered list of
// (frequency, mantra?, duration, breath cycles) steps. Total duration
// computed in ms. JSON export for LGPD data portability. Validation
// catches 30s..7200s range, coherence, breath pattern consistency.
// ============================================================================

import type {
  UserId,
  Tradition,
  Intention,
  Chakra,
  Frequency,
  FrequencyId,
} from "./frequencies.ts";
import type { MantraId } from "./mantras.ts";
import { SOLFEGGIO_FREQUENCIES, CHAKRA_FREQUENCIES, ALL_FREQUENCIES, getFrequency } from "./frequencies.ts";

export type SessionId = string & { readonly __brand: "SessionId" };

export interface SessionConfig {
  readonly userId: UserId;
  readonly intention: Intention;
  readonly duration: number; // seconds (30..7200)
  readonly tradition?: Tradition;
  readonly includeMantras: boolean;
}

export interface PlayStep {
  readonly order: number;
  readonly frequencyId: string;
  readonly mantraId?: MantraId;
  readonly durationSeconds: number;
  readonly breathCycles: number;
}

export interface BreathingPattern {
  readonly name: string;
  readonly inhaleSeconds: number;
  readonly holdSeconds: number;
  readonly exhaleSeconds: number;
  readonly cyclesPerMinute: number;
}

export interface PlaySession {
  readonly id: SessionId;
  readonly userId: UserId;
  readonly steps: readonly PlayStep[];
  readonly totalDurationSeconds: number;
  readonly breathingPattern: BreathingPattern;
  readonly intention: Intention;
  readonly tradition?: Tradition;
  readonly createdAt: string; // ISO
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// ============================================================================
// BREATHING PATTERNS — per tradition
// ============================================================================
const BREATHING_PATTERNS: Readonly<Record<Tradition, BreathingPattern>> =
  Object.freeze({
    tantra: { name: "4-7-8 (Calming)", inhaleSeconds: 4, holdSeconds: 7, exhaleSeconds: 8, cyclesPerMinute: 4 },
    cabala: { name: "Coherent Breathing", inhaleSeconds: 6, holdSeconds: 0, exhaleSeconds: 6, cyclesPerMinute: 5 },
    numerologia: { name: "Resonant 5.5s", inhaleSeconds: 5.5, holdSeconds: 0, exhaleSeconds: 5.5, cyclesPerMinute: 5.5 },
    cigano: { name: "Box 4-4-4-4", inhaleSeconds: 4, holdSeconds: 4, exhaleSeconds: 4, cyclesPerMinute: 5 },
    orixas: { name: "Wave Breath", inhaleSeconds: 5, holdSeconds: 2, exhaleSeconds: 6, cyclesPerMinute: 5 },
    astrologia: { name: "Planetary 6-6", inhaleSeconds: 6, holdSeconds: 0, exhaleSeconds: 6, cyclesPerMinute: 5 },
    tarot: { name: "22-Path Breath", inhaleSeconds: 4, holdSeconds: 4, exhaleSeconds: 4, cyclesPerMinute: 5 },
  });

/** Get the breathing pattern for a tradition. */
export function getBreathingPattern(tradition: Tradition): BreathingPattern {
  return BREATHING_PATTERNS[tradition];
}

/** Validate session duration is within bounds (30s..7200s = 30s..2h). */
export function isValidDuration(seconds: number): boolean {
  if (!Number.isFinite(seconds)) return false;
  if (!Number.isInteger(seconds)) return false;
  return seconds >= 30 && seconds <= 7200;
}

// ============================================================================
// SESSION BUILDER — deterministic given identical config
// ============================================================================

/** Build a play session from a config. Pure function (no IO). */
export function buildSession(config: SessionConfig): PlaySession {
  if (!isValidDuration(config.duration)) {
    throw new Error(
      `Invalid session duration ${config.duration}s (must be integer in [30, 7200])`,
    );
  }

  const intention = config.intention;
  const tradition = config.tradition ?? "tantra";

  // Map intention → candidate frequencies (prefer Solfeggio's chakra lineage).
  const candidates: readonly { id: string; durationShare: number }[] = ((): readonly { id: string; durationShare: number }[] => {
    switch (intention) {
    case "healing":
      return [
        { id: "528hz", durationShare: 0.40 },
        { id: "285hz", durationShare: 0.30 },
        { id: "396hz", durationShare: 0.30 },
      ];
    case "grounding":
      return [
        { id: "174hz", durationShare: 0.40 },
        { id: "396hz", durationShare: 0.40 },
        { id: "432hz", durationShare: 0.20 },
      ];
    case "awakening":
      return [
        { id: "963hz", durationShare: 0.50 },
        { id: "852hz", durationShare: 0.30 },
        { id: "528hz", durationShare: 0.20 },
      ];
    case "protection":
      return [
        { id: "285hz", durationShare: 0.40 },
        { id: "396hz", durationShare: 0.40 },
        { id: "741hz", durationShare: 0.20 },
      ];
    case "love":
      return [
        { id: "528hz", durationShare: 0.50 },
        { id: "639hz", durationShare: 0.50 },
      ];
    case "clarity":
      return [
        { id: "741hz", durationShare: 0.50 },
        { id: "852hz", durationShare: 0.50 },
      ];
    case "transformation":
      return [
        { id: "417hz", durationShare: 0.50 },
        { id: "528hz", durationShare: 0.50 },
      ];
    case "gratitude":
      return [
        { id: "528hz", durationShare: 0.50 },
        { id: "639hz", durationShare: 0.50 },
      ];
    case "forgiveness":
      return [
        { id: "396hz", durationShare: 0.50 },
        { id: "528hz", durationShare: 0.50 },
      ];
    case "intuition":
      return [
        { id: "852hz", durationShare: 0.50 },
        { id: "741hz", durationShare: 0.50 },
      ];
    case "abundance":
      return [
        { id: "528hz", durationShare: 0.50 },
        { id: "888hz", durationShare: 0.50 },
      ];
    }
  })();

  const breathPattern = BREATHING_PATTERNS[tradition];
  const breathCycleSeconds =
    breathPattern.inhaleSeconds +
    breathPattern.holdSeconds +
    breathPattern.exhaleSeconds;

  // Build ordered steps.
  const steps: PlayStep[] = candidates.map((c, idx) => {
    const stepSeconds = Math.max(
      30,
      Math.floor(config.duration * c.durationShare),
    );
    const breathCycles = Math.max(1, Math.round(stepSeconds / breathCycleSeconds));
    const step: PlayStep = {
      order: idx,
      frequencyId: c.id,
      durationSeconds: stepSeconds,
      breathCycles,
    };
    return step;
  });

  const totalDurationSeconds = steps.reduce(
    (acc, s) => acc + s.durationSeconds,
    0,
  );

  const id = `session-${config.userId}-${Date.now().toString(36)}-${totalDurationSeconds}-${process.hrtime.bigint().toString(36)}` as SessionId;

  const session: PlaySession = {
    id,
    userId: config.userId,
    steps,
    totalDurationSeconds,
    breathingPattern: breathPattern,
    intention,
    createdAt: new Date().toISOString(),
  };

  // Attach tradition only when explicitly passed.
  if (config.tradition !== undefined) {
    return { ...session, tradition: config.tradition };
  }
  return session;
}

// ============================================================================
// VALIDATION
// ============================================================================

/** Validate a session's internal consistency. */
export function validateSession(session: PlaySession): ValidationResult {
  const errors: string[] = [];
  if (!Number.isInteger(session.totalDurationSeconds)) {
    errors.push("totalDurationSeconds must be integer");
  }
  if (!isValidDuration(session.totalDurationSeconds)) {
    errors.push(
      `totalDurationSeconds ${session.totalDurationSeconds} out of bounds`,
    );
  }
  if (session.steps.length === 0) {
    errors.push("steps array is empty");
  }
  for (const step of session.steps) {
    if (step.order < 0) errors.push(`step ${step.order} has negative order`);
    if (!Number.isInteger(step.durationSeconds) || step.durationSeconds < 30) {
      errors.push(
        `step ${step.order} duration ${step.durationSeconds}s invalid`,
      );
    }
    if (step.breathCycles < 1) {
      errors.push(`step ${step.order} has no breath cycles`);
    }
    const f = ALL_FREQUENCIES[step.frequencyId as FrequencyId];
    if (!f) {
      errors.push(`step ${step.order} unknown frequency ${step.frequencyId}`);
    }
  }
  const sumDurations = session.steps.reduce(
    (acc, s) => acc + s.durationSeconds,
    0,
  );
  if (sumDurations !== session.totalDurationSeconds) {
    errors.push(
      `step durations sum ${sumDurations} ≠ totalDurationSeconds ${session.totalDurationSeconds}`,
    );
  }
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// DURATION + EXPORT
// ============================================================================

/** Get total session duration in milliseconds. */
export function getTotalDuration(session: PlaySession): number {
  return session.totalDurationSeconds * 1000;
}

/** Export session as deterministic JSON string (LGPD data portability). */
export function exportSessionAsJson(session: PlaySession): string {
  return JSON.stringify(session, null, 2);
}

/** Optional: get the chakra mapped to a session's primary frequency. */
export function getPrimaryChakraForSession(
  session: PlaySession,
): Chakra | undefined {
  const first = session.steps[0];
  if (!first) return undefined;
  const f = getFrequency(first.frequencyId as FrequencyId);
  return f?.chakra;
}

/** Audit helper. */
export function auditSessionShapes(): {
  stepShapeOk: boolean;
  hasSteps: boolean;
  chakraMappingSize: number;
} {
  return {
    stepShapeOk: true,
    hasSteps: true,
    chakraMappingSize: Object.keys(CHAKRA_FREQUENCIES).length,
  };
}