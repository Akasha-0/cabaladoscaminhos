// @vitest-environment jsdom
/**
 * @akasha/portal — BreathOrb animation tests
 *
 * Wave 9.1. Tests the data-phase transitions and the reduced-motion path.
 * Each tick is wrapped in act() to flush React state + effects because
 * vitest's fake timers + React 19 commit scheduling need that.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { BreathOrb } from './BreathOrb';

describe('BreathOrb', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in idle phase when paused=true', () => {
    render(<BreathOrb paused cycles={3} size={200} />);
    const orb = screen.getByTestId('breath-orb');
    expect(orb.getAttribute('data-phase')).toBe('idle');
  });

  it('starts in inhale phase when not paused', () => {
    render(<BreathOrb paused={false} cycles={3} size={200} />);
    const orb = screen.getByTestId('breath-orb');
    expect(orb.getAttribute('data-phase')).toBe('inhale');
  });

  it('advances inhale → hold after 4s', () => {
    render(<BreathOrb paused={false} cycles={3} size={200} />);
    act(() => {
      vi.advanceTimersByTime(4001);
    });
    expect(screen.getByTestId('breath-orb').getAttribute('data-phase')).toBe('hold');
  });

  it('advances hold → exhale after 7s', () => {
    render(<BreathOrb paused={false} cycles={3} size={200} />);
    act(() => {
      // First transition: inhale → hold (after 4s)
      vi.advanceTimersByTime(4001);
    });
    // After this commit, a fresh setTimeout is registered for 7s.
    act(() => {
      vi.advanceTimersByTime(7001);
    });
    expect(screen.getByTestId('breath-orb').getAttribute('data-phase')).toBe('exhale');
  });

  it('counts completed cycles after a full 4+7+8 cycle', () => {
    render(<BreathOrb paused={false} cycles={3} size={200} />);
    act(() => {
      vi.advanceTimersByTime(4001); // → hold
    });
    act(() => {
      vi.advanceTimersByTime(7001); // → exhale
    });
    act(() => {
      vi.advanceTimersByTime(8001); // → completed++ → inhale again
    });
    expect(screen.getByTestId('breath-orb').getAttribute('data-completed')).toBe('1');
  });
});