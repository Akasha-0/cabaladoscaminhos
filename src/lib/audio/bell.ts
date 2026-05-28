/**
 * Bell sound generator using Web Audio API
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Bell type configurations
 */
const bellTypes = {
  temple: { frequency: 528, decay: 2.5, overtones: [0.5, 0.25, 0.125] },
  meditation: { frequency: 432, decay: 3.0, overtones: [0.6, 0.3, 0.15, 0.075] },
  singing: { frequency: 396, decay: 2.0, overtones: [0.4, 0.2, 0.1] },
  chime: { frequency: 639, decay: 1.5, overtones: [0.3, 0.15] },
} as const;

export type BellType = keyof typeof bellTypes;

/**
 * Plays a bell sound with specified type
 */
export function playBell(type: BellType = 'temple'): void {
  const ctx = getAudioContext();
  const config = bellTypes[type];
  
  // Resume context if suspended
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const now = ctx.currentTime;
  
  // Create master gain for this bell
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.3, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + config.decay);
  
  // Play fundamental frequency
  const fundamental = ctx.createOscillator();
  fundamental.type = 'sine';
  fundamental.frequency.setValueAtTime(config.frequency, now);
  
  const fundGain = ctx.createGain();
  fundGain.gain.setValueAtTime(1, now);
  fundamental.connect(fundGain);
  fundGain.connect(masterGain);
  fundamental.start(now);
  fundamental.stop(now + config.decay);
  
  // Play overtones
  config.overtones.forEach((amplitude, index) => {
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(config.frequency * (index + 2), now);
    
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(amplitude, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + config.decay * 0.8);
    
    overtone.connect(overtoneGain);
    overtoneGain.connect(masterGain);
    overtone.start(now);
    overtone.stop(now + config.decay);
  });
}

/**
 * Plays a chime sound (shorter bell variant)
 */
export function playChime(frequency = 880, duration = 0.8): void {
  const ctx = getAudioContext();
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const now = ctx.currentTime;
  
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + duration);
  
  // Add subtle second tone for richness
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 1.5, now);
  
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.1, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + duration);
}