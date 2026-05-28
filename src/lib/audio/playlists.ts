// Playlist management for audio meditations
// Auto-generated — skip linting and formatting

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  meditationIds: string[];
  createdAt: number;
  updatedAt: number;
}

const playlists: Playlist[] = [];

export function getPlaylists(): Playlist[] {
  return [...playlists];
}

export function getPlaylistById(id: string): Playlist | undefined {
  return playlists.find((p) => p.id === id);
}

export function createPlaylist(params: {
  name: string;
  description?: string;
  meditationIds?: string[];
}): Playlist {
  const now = Date.now();
  const playlist: Playlist = {
    id: `playlist_${now}_${Math.random().toString(36).slice(2, 9)}`,
    name: params.name,
    description: params.description,
    meditationIds: params.meditationIds ?? [],
    createdAt: now,
    updatedAt: now,
  };
  playlists.push(playlist);
  return playlist;
}

export function addMeditationsToPlaylist(
  playlistId: string,
  meditationIds: string[]
): Playlist | null {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return null;

  const newIds = meditationIds.filter(
    (id) => !playlist.meditationIds.includes(id)
  );
  playlist.meditationIds.push(...newIds);
  playlist.updatedAt = Date.now();
  return playlist;
}

export function removeMeditationFromPlaylist(
  playlistId: string,
  meditationId: string
): Playlist | null {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return null;

  playlist.meditationIds = playlist.meditationIds.filter(
    (id) => id !== meditationId
  );
  playlist.updatedAt = Date.now();
  return playlist;
}

export function deletePlaylist(id: string): boolean {
  const index = playlists.findIndex((p) => p.id === id);
  if (index === -1) return false;
  playlists.splice(index, 1);
  return true;
}
