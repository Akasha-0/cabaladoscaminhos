export interface Soundscape {
  id: string;
  name: string;
  namePt: string;
  description: string;
  audioUrl: string;
  icon: string;
  tags: string[];
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'forest',
    name: 'Forest',
    namePt: 'Floresta',
    description: ' Sons de floresta com pássaros e vento nas árvores',
    audioUrl: '/audio/forest.mp3',
    icon: '🌲',
    tags: ['natureza', 'tranquilo', 'aves'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    namePt: 'Oceano',
    description: 'Ondas do mar e brisa oceânica',
    audioUrl: '/audio/ocean.mp3',
    icon: '🌊',
    tags: ['natureza', 'mar', 'relaxante'],
  },
  {
    id: 'rain',
    name: 'Rain',
    namePt: 'Chuva',
    description: 'Chuva suave caindo sobre folhas e telhados',
    audioUrl: '/audio/rain.mp3',
    icon: '🌧️',
    tags: ['natureza', 'chuva', 'meditativo'],
  },
  {
    id: 'temple',
    name: 'Temple',
    namePt: 'Templo',
    description: 'Atmosfera contemplativa de templo com sinos e cânticos',
    audioUrl: '/audio/temple.mp3',
    icon: '🏛️',
    tags: ['espiritual', 'meditativo', 'sinos'],
  },
];

let currentAudio: HTMLAudioElement | null = null;
let currentSoundscapeId: string | null = null;

export function getSoundscapes(): Soundscape[] {
  return SOUNDSCAPES;
}

export function getSoundscapeById(id: string): Soundscape | undefined {
  return SOUNDSCAPES.find((s) => s.id === id);
}

export async function playSoundscape(
  id: string,
  options: { loop?: boolean; volume?: number } = {},
): Promise<void> {
  const soundscape = getSoundscapeById(id);
  if (!soundscape) {
    throw new Error(`Soundscape not found: ${id}`);
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  currentAudio = new Audio(soundscape.audioUrl);
  currentAudio.loop = options.loop ?? true;
  currentAudio.volume = options.volume ?? 0.7;
  currentSoundscapeId = id;

  await currentAudio.play();
}

export function stopSoundscape(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    currentSoundscapeId = null;
  }
}

export function getCurrentSoundscapeId(): string | null {
  return currentSoundscapeId;
}

export function setVolume(volume: number): void {
  if (currentAudio) {
    currentAudio.volume = Math.max(0, Math.min(1, volume));
  }
}

export function pauseSoundscape(): void {
  if (currentAudio) {
    currentAudio.pause();
  }
}

export function resumeSoundscape(): void {
  if (currentAudio) {
    currentAudio.play();
  }
}
