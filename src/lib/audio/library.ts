// Auto-generated — skip linting and formatting

import { getMeditations, getMeditationById, type Meditation } from './meditations';
import { getAmbient, getAmbientById, type AmbientSound } from './ambient';
import { getSoundscapes, getSoundscapeById, type Soundscape } from './soundscapes';
import { getPlaylists, getPlaylistById, createPlaylist, addMeditationsToPlaylist, removeMeditationFromPlaylist, deletePlaylist, type Playlist } from './playlists';
import { addFavorite, getFavorites, type Favorite } from './favorites';
import { playBell, playChime, type BellType } from './bell';
import { playSleepSound, stopSleepSound, isSleepSoundPlaying, setSleepVolume, type SleepSoundType } from './sleep';

export type { Meditation, AmbientSound, Soundscape, Playlist, Favorite, BellType, SleepSoundType };

// Unified audio library interface
export interface AudioLibrary {
  meditations: Meditation[];
  ambient: AmbientSound[];
  soundscapes: Soundscape[];
  playlists: Playlist[];
  bells: BellType[];
  sleepTypes: SleepSoundType[];
}

/**
 * Get the complete audio library
 */
export function getAudioLibrary(): AudioLibrary {
  return {
    meditations: getMeditations(),
    ambient: getAmbient(),
    soundscapes: getSoundscapes(),
    playlists: getPlaylists(),
    bells: ['temple', 'meditation', 'singing', 'chime'] as const,
    sleepTypes: ['white', 'brown'] as const,
  };
}

export { getMeditations, getMeditationById };
export { getAmbient, getAmbientById };
export { getSoundscapes, getSoundscapeById };
export { getPlaylists, getPlaylistById, createPlaylist, addMeditationsToPlaylist, removeMeditationFromPlaylist, deletePlaylist };
export { addFavorite, getFavorites };
export { playBell, playChime };
export { playSleepSound, stopSleepSound, isSleepSoundPlaying, setSleepVolume };
