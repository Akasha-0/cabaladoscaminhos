/**
 * Sleep sounds generator using Web Audio API
 * Provides white and brown noise for sleep aid
 */

export type SleepSoundType = 'white' | 'brown';

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentGain: GainNode | null = null;
let stopTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Create an AudioBuffer filled with noise
 */
function createNoiseBuffer(type: SleepSoundType): AudioBuffer | null {
  if (!audioContext) return null;

  const duration = 8; // seconds
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);

    if (type === 'white') {
      // White noise: random samples between -1 and 1
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      // Brown noise: integrate white noise (cumulative sum with mean reversion)
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5; // normalize output
      }
    }
  }

  return buffer;
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

let isPlaying = false;

/**
 * Play a sleep sound (white or brown noise)
 * @param type - 'white' or 'brown' noise
 * @param volume - Volume level (0.0 to 1.0), default 0.5
 * @param duration - Auto-stop duration in seconds, default 0 (no auto-stop)
 */
export function playSleepSound(
  type: SleepSoundType = 'white',
  volume: number = 0.5,
  duration: number = 0
): void {
  const ctx = getAudioContext();

  // Resume context if suspended
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // Stop any currently playing sleep sound
  stopSleepSound();

  const buffer = createNoiseBuffer(type);
  if (!buffer) return;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  source.start();

  currentSource = source;
  currentGain = gain;
  isPlaying = true;

  // Auto-stop timer
  if (duration > 0) {
    stopTimeout = setTimeout(() => {
      stopSleepSound();
    }, duration * 1000);
  }
}

/**
 * Stop the currently playing sleep sound
 */
export function stopSleepSound(): void {
  if (stopTimeout) {
    clearTimeout(stopTimeout);
    stopTimeout = null;
  }

  if (currentSource) {
    currentSource.stop();
    currentSource.disconnect();
    currentSource = null;
  }

  if (currentGain) {
    currentGain.disconnect();
    currentGain = null;
  }

  isPlaying = false;
}

/**
 * Check if a sleep sound is currently playing
 */
export function isSleepSoundPlaying(): boolean {
  return isPlaying;
}

/**
 * Set the volume of the current sleep sound
 * @param volume - Volume level (0.0 to 1.0)
 */
export function setSleepVolume(volume: number): void {
  if (currentGain && audioContext) {
    currentGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext.currentTime);
  }
}
