import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startTimer, type TimerOptions, type TimerControls, type TimerState } from '@/lib/meditation/meditation-timer';

describe('meditation-timer', () => {
  let mockOnTick: ReturnType<typeof vi.fn>;
  let mockOnComplete: ReturnType<typeof vi.fn>;
  let mockOnPhaseChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnTick = vi.fn();
    mockOnComplete = vi.fn();
    mockOnPhaseChange = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createOptions = (duration = 5): TimerOptions => ({
    duration,
    onTick: mockOnTick,
    onComplete: mockOnComplete,
    onPhaseChange: mockOnPhaseChange,
  });

  describe('startTimer', () => {
    it('starts timer and triggers initial tick', () => {
      const controls = startTimer(createOptions(5));
      expect(controls.getState()).toBe('running');
      expect(controls.getRemaining()).toBe(5);
      expect(mockOnTick).toHaveBeenCalledWith(5);
    });

    it('counts down every second', () => {
      const controls = startTimer(createOptions(3));
      // Initial tick: remaining = 3
      expect(mockOnTick).toHaveBeenCalledWith(3);
      vi.advanceTimersByTime(1000);
      // After 1s: remaining = 2
      expect(mockOnTick).toHaveBeenCalledWith(2);
      vi.advanceTimersByTime(1000);
      // After 2s: remaining = 1
      expect(mockOnTick).toHaveBeenCalledWith(1);
    });

    it('calls onComplete when countdown reaches 0', () => {
      startTimer(createOptions(2));
      vi.advanceTimersByTime(2000);
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('transitions to completed state when timer finishes', () => {
      const controls = startTimer(createOptions(1));
      vi.advanceTimersByTime(1000);
      expect(controls.getState()).toBe('completed');
      expect(controls.getRemaining()).toBe(0);
    });
  });

  describe('pause', () => {
    it('pauses the running timer', () => {
      const controls = startTimer(createOptions(10));
      vi.advanceTimersByTime(2000);
      controls.pause();
      expect(controls.getState()).toBe('paused');
    });

    it('stops countdown while paused', () => {
      const controls = startTimer(createOptions(5));
      vi.advanceTimersByTime(2000);
      const remaining = controls.getRemaining();
      controls.pause();
      vi.advanceTimersByTime(3000);
      expect(controls.getRemaining()).toBe(remaining);
    });

    it('has no effect when not running', () => {
      const controls = startTimer(createOptions(5));
      controls.pause();
      controls.pause();
      expect(controls.getState()).toBe('paused');
    });
  });

  describe('resume', () => {
    it('resumes a paused timer', () => {
      const controls = startTimer(createOptions(10));
      vi.advanceTimersByTime(3000);
      controls.pause();
      const remaining = controls.getRemaining();
      controls.resume();
      vi.advanceTimersByTime(1000);
      expect(controls.getRemaining()).toBe(remaining - 1);
    });

    it('has no effect when not paused', () => {
      const controls = startTimer(createOptions(10));
      controls.resume();
      expect(controls.getState()).toBe('running');
    });
  });

  describe('stop', () => {
    it('stops the timer and resets state', () => {
      const controls = startTimer(createOptions(10));
      vi.advanceTimersByTime(2000);
      controls.stop();
      expect(controls.getState()).toBe('idle');
      expect(controls.getRemaining()).toBe(0);
    });

    it('does not call onComplete when stopped', () => {
      const controls = startTimer(createOptions(10));
      controls.stop();
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('skip', () => {
    it('skips to completion immediately', () => {
      const controls = startTimer(createOptions(60));
      vi.advanceTimersByTime(5000);
      controls.skip();
      expect(controls.getState()).toBe('completed');
      expect(controls.getRemaining()).toBe(0);
    });

    it('calls onComplete when skipped', () => {
      const controls = startTimer(createOptions(60));
      controls.skip();
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('getState', () => {
    it('returns running when timer is started', () => {
      expect(startTimer(createOptions()).getState()).toBe('running');
    });
  });

  describe('getRemaining', () => {
    it('returns current remaining seconds', () => {
      const controls = startTimer(createOptions(15));
      vi.advanceTimersByTime(3000);
      expect(controls.getRemaining()).toBe(12);
    });
  });
});