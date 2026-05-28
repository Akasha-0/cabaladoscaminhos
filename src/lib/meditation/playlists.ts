export interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistInput {
  name: string;
  tracks?: Track[];
}

export function createPlaylist(input: PlaylistInput): Playlist {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: input.name,
    tracks: input.tracks ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

export function reorderTrack(playlist: Playlist, fromIndex: number, toIndex: number): Playlist {
  if (fromIndex < 0 || fromIndex >= playlist.tracks.length) return playlist;
  if (toIndex < 0 || toIndex >= playlist.tracks.length) return playlist;

  const tracks = [...playlist.tracks];
  const [removed] = tracks.splice(fromIndex, 1);
  tracks.splice(toIndex, 0, removed);

  return { ...playlist, tracks, updatedAt: new Date() };
}

export function addTrack(playlist: Playlist, track: Track): Playlist {
  return {
    ...playlist,
    tracks: [...playlist.tracks, track],
    updatedAt: new Date(),
  };
}

export function removeTrack(playlist: Playlist, trackId: string): Playlist {
  return {
    ...playlist,
    tracks: playlist.tracks.filter((t) => t.id !== trackId),
    updatedAt: new Date(),
  };
}

export function getTrackByIndex(playlist: Playlist, index: number): Track | undefined {
  return playlist.tracks[index];
}

export function getTotalDuration(playlist: Playlist): number {
  return playlist.tracks.reduce((sum, t) => sum + t.duration, 0);
}