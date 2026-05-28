/**
 * Meditation timer implementation
 * Provides countdown timer with phase management and controls
 */

export type TimerState = "idle" | "running" | "paused" | "completed";

export interface TimerOptions {
  duration: number; // total duration in seconds
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
  onPhaseChange?: (phaseIndex: number, phaseName: string) => void;
}

export interface TimerControls {
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;
  getState: () => TimerState;
  getRemaining: () => number;
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let currentState: TimerState = "idle";
let remainingSeconds = 0;
let timerOptions: TimerOptions | null = null;

function clearTimer(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function tick(): void {
  if (remainingSeconds > 0) {
    remainingSeconds--;
    timerOptions?.onTick?.(remainingSeconds);

    if (remainingSeconds === 0) {
      clearTimer();
      currentState = "completed";
      timerOptions?.onComplete?.();
    }
  }
}

/**
 * Start a meditation timer with the specified options.
 * Returns controls for pause, resume, stop, skip, and state queries.
 */
export function startTimer(options: TimerOptions): TimerControls {
  clearTimer();

  timerOptions = options;
  remainingSeconds = options.duration;
  currentState = "running";

  intervalId = setInterval(tick, 1000);

  // Trigger initial tick for immediate feedback
  options.onTick?.(remainingSeconds);

  return {
    pause: () => {
      if (currentState === "running") {
        clearTimer();
        currentState = "paused";
      }
    },
    resume: () => {
      if (currentState === "paused") {
        currentState = "running";
        intervalId = setInterval(tick, 1000);
      }
    },
    stop: () => {
      clearTimer();
      remainingSeconds = 0;
      currentState = "idle";
    },
    skip: () => {
      clearTimer();
      remainingSeconds = 0;
      currentState = "completed";
      options.onComplete?.();
    },
    getState: () => currentState,
    getRemaining: () => remainingSeconds,
  };
}