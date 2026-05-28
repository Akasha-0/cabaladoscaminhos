export interface AmbientSound {
  id: string;
  name: string;
  src: string;
  volume: number;
}

const ambientSounds: AmbientSound[] = [
  { id: 'rain', name: 'Rain', src: '/audio/rain.mp3', volume: 0.5 },
  { id: 'forest', name: 'Forest', src: '/audio/forest.mp3', volume: 0.4 },
  { id: 'ocean', name: 'Ocean Waves', src: '/audio/ocean.mp3', volume: 0.6 },
  { id: 'fire', name: 'Crackling Fire', src: '/audio/fire.mp3', volume: 0.35 },
  { id: 'wind', name: 'Wind', src: '/audio/wind.mp3', volume: 0.3 },
];

export function getAmbient(): AmbientSound[] {
  return [...ambientSounds];
}

export function getAmbientById(id: string): AmbientSound | undefined {
  return ambientSounds.find(sound => sound.id === id);
}