import { describe, it, expect } from 'vitest';
import { isSleepSoundPlaying, stopSleepSound } from '@/lib/audio/sleep';

describe('sleep', () => {
  it('sleep sound is not playing initially', () => {
    stopSleepSound();
    expect(isSleepSoundPlaying()).toBe(false);
  });

  it('stopSleepSound does not throw', () => {
    expect(() => stopSleepSound()).not.toThrow();
  });
});
