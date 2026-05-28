// @ts-nocheck
// eslint-disable @typescript-eslint/no-explicit-any

import { BreathExercise, getData } from './breath-data';

export interface BreathworkSession {
  exerciseId: string;
  startedAt: Date;
  completedAt?: Date;
  cyclesCompleted: number;
  totalCycles: number;
  phases: BreathPhase[];
}

export interface BreathPhase {
  type: 'inhale' | 'hold1' | 'exhale' | 'hold2';
  durationSeconds: number;
  startedAt: Date;
}

export interface BreathworkResult {
  session: BreathworkSession;
  success: boolean;
  message: string;
}

function createSession(exercise: BreathExercise): BreathworkSession {
  return {
    exerciseId: exercise.id,
    startedAt: new Date(),
    cyclesCompleted: 0,
    totalCycles: exercise.cycles,
    phases: [],
  };
}

function recordPhase(
  session: BreathworkSession,
  type: BreathPhase['type'],
  durationSeconds: number
): void {
  session.phases.push({
    type,
    durationSeconds,
    startedAt: new Date(),
  });
}

function getExerciseById(id: string): BreathExercise | undefined {
  return getData().find((e) => e.id === id);
}

export function performBreathwork(
  exerciseId: string,
  options?: { cycles?: number }
): BreathworkResult {
  const exercise = getExerciseById(exerciseId);

  if (!exercise) {
    return {
      session: {
        exerciseId,
        startedAt: new Date(),
        cyclesCompleted: 0,
        totalCycles: 0,
        phases: [],
      },
      success: false,
      message: `Exercise '${exerciseId}' not found`,
    };
  }

  const session = createSession(exercise);
  const cyclesToPerform = options?.cycles ?? exercise.cycles;

  // Simulate breath phases
  const phases: Array<{ type: BreathPhase['type']; duration: number }> = [
    { type: 'inhale', duration: exercise.inhale },
    { type: 'hold1', duration: exercise.hold1 },
    { type: 'exhale', duration: exercise.exhale },
    { type: 'hold2', duration: exercise.hold2 },
  ].filter((p) => p.duration > 0);

  for (let cycle = 0; cycle < cyclesToPerform; cycle++) {
    for (const phase of phases) {
      recordPhase(session, phase.type, phase.duration);
    }
    session.cyclesCompleted = cycle + 1;
  }

  session.completedAt = new Date();

  return {
    session,
    success: true,
    message: `Completed ${session.cyclesCompleted} cycles of ${exercise.name}`,
  };
}

export function getBreathworkStats(session: BreathworkSession): {
  totalDurationSeconds: number;
  averagePhaseDuration: number;
  inhaleTotal: number;
  exhaleTotal: number;
  holdTotal: number;
} {
  const inhaleTotal = session.phases
    .filter((p) => p.type === 'inhale')
    .reduce((sum, p) => sum + p.durationSeconds, 0);

  const exhaleTotal = session.phases
    .filter((p) => p.type === 'exhale')
    .reduce((sum, p) => sum + p.durationSeconds, 0);

  const holdTotal = session.phases
    .filter((p) => p.type === 'hold1' || p.type === 'hold2')
    .reduce((sum, p) => sum + p.durationSeconds, 0);

  const totalDurationSeconds = inhaleTotal + exhaleTotal + holdTotal;
  const phaseCount = session.phases.length;

  return {
    totalDurationSeconds,
    averagePhaseDuration: phaseCount > 0 ? totalDurationSeconds / phaseCount : 0,
    inhaleTotal,
    exhaleTotal,
    holdTotal,
  };
}
