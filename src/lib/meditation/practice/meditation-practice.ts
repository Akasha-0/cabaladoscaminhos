// Meditation practice execution

import type { Meditation, MeditationPhase } from '../types';

export interface PracticeSession {
  meditationId: string;
  startedAt: Date;
  currentPhase: number;
  elapsedSeconds: number;
  isComplete: boolean;
}

export interface PracticeResult {
  meditationId: string;
  duration: number;
  phasesCompleted: number;
  completedAt: Date;
}

/**
 * Creates a new practice session for a meditation
 */
export function createPracticeSession(meditation: Meditation): PracticeSession {
  return {
    meditationId: meditation.id,
    startedAt: new Date(),
    currentPhase: 0,
    elapsedSeconds: 0,
    isComplete: false,
  };
}

/**
 * Advances practice to the next phase
 */
export function advancePhase(session: PracticeSession, meditation: Meditation): PracticeSession {
  const nextPhase = session.currentPhase + 1;
  return {
    ...session,
    currentPhase: nextPhase,
    isComplete: nextPhase >= meditation.phases.length,
  };
}

/**
 * Updates elapsed time for a practice session
 */
export function updateElapsed(session: PracticeSession, seconds: number): PracticeSession {
  return {
    ...session,
    elapsedSeconds: session.elapsedSeconds + seconds,
  };
}

/**
 * Gets the current phase of a meditation
 */
export function getCurrentPhase(session: PracticeSession, meditation: Meditation): MeditationPhase | null {
  if (session.currentPhase >= meditation.phases.length) {
    return null;
  }
  return meditation.phases[session.currentPhase];
}

/**
 * Completes a practice session and returns the result
 */
export function completePractice(session: PracticeSession, meditation: Meditation): PracticeResult {
  return {
    meditationId: session.meditationId,
    duration: session.elapsedSeconds,
    phasesCompleted: session.currentPhase + 1,
    completedAt: new Date(),
  };
}

/**
 * Performs a complete meditation practice session
 * This is the main entry point for executing a meditation practice
 */
export async function performPractice(meditation: Meditation): Promise<PracticeResult> {
  // Create initial session
  let session = createPracticeSession(meditation);
  
  // Iterate through all phases
  for (let phaseIndex = 0; phaseIndex < meditation.phases.length; phaseIndex++) {
    const phase = meditation.phases[phaseIndex];
    
    // Simulate phase duration (in practice this would be tied to actual time)
    const phaseDuration = phase.duration;
    
    // Update elapsed time
    session = updateElapsed(session, phaseDuration);
    
    // Move to next phase
    if (phaseIndex < meditation.phases.length - 1) {
      session = advancePhase(session, meditation);
    }
  }
  
  // Mark session as complete
  session = { ...session, isComplete: true };
  
  // Return the practice result
  return completePractice(session, meditation);
}