/**
 * Ambient sound generator
 * Provides looped atmospheric audio for meditation and visualization
 */

export type AmbientType = 'chuva' | 'floresta' | 'oceano' | 'templos';

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)() : null;

let currentSource: AudioBufferSourceNode | null = null;
let currentGain: GainNode | null = null;

function createNoiseBuffer(type: AmbientType): AudioBuffer {
  const ctx = audioContext!;
  const duration = 4;
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'chuva':
          // Brown noise with droplet-like amplitude modulation
          sample = (Math.random() * 2 - 1) * 0.3;
          sample *= 0.7 + 0.3 * Math.sin(t * 15) * Math.sin(t * 7);
          break;
        case 'floresta':
          // Layered filtered noise for wind through leaves
          sample = (Math.random() * 2 - 1) * 0.2;
          sample *= 0.5 + 0.5 * Math.sin(t * 0.5) * Math.sin(t * 2.3);
          // Add subtle chirp-like modulation
          sample += Math.sin(t * 800 + Math.sin(t * 3) * 200) * 0.02 * (Math.random() > 0.97 ? 1 : 0);
          break;
        case 'oceano':
          // Low-frequency oscillation simulating waves
          sample = (Math.random() * 2 - 1) * 0.25;
          const waveAmp = 0.3 + 0.7 * Math.sin(t * 0.15) * Math.sin(t * 0.4);
          sample *= waveAmp;
          // Add deeper rumble
          sample += Math.sin(t * 40) * 0.1 * waveAmp;
          break;
        case 'templos':
          // Soft sustained tones with slow modulation
          sample = Math.sin(t * 220) * 0.15;
          sample += Math.sin(t * 330) * 0.1;
          sample += Math.sin(t * 440) * 0.05;
          // Add gentle bloom/decay envelope
          sample *= 0.7 + 0.3 * Math.sin(t * 0.3);
          // Add filtered noise for atmosphere
          sample += (Math.random() * 2 - 1) * 0.03;
          break;
      }

      data[i] = Math.max(-1, Math.min(1, sample));
    }
  }

  return buffer;
}

export function playAmbient(type: AmbientType, volume: number = 0.5): void {
  if (!audioContext) return;

  // Stop current ambient if playing
  stopAmbient();

  const buffer = createNoiseBuffer(type);
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);

  source.start();

  currentSource = source;
  currentGain = gain;
}

export function stopAmbient(): void {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // Already stopped
    }
    currentSource = null;
  }
  currentGain = null;
}

export function setVolume(volume: number): void {
  if (currentGain && audioContext) {
    currentGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, volume)),
      audioContext.currentTime,
      0.1
    );
  }
}