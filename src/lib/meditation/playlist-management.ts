// Playlist management module

import {
  Playlist,
  PlaylistInput,
  Track,
  createPlaylist,
  addTrack,
  removeTrack,
  reorderTrack,
} from "./playlists";

export interface PlaylistManagementOptions {
  onUpdate?: (playlist: Playlist) => void;
  onDelete?: (playlistId: string) => void;
}

export interface PlaylistManagementResult {
  playlists: Playlist[];
  getPlaylist: (id: string) => Playlist | undefined;
  createPlaylist: (input: PlaylistInput) => Playlist;
  updatePlaylist: (id: string, updates: Partial<PlaylistInput>) => Playlist | undefined;
  deletePlaylist: (id: string) => boolean;
  addTrackToPlaylist: (playlistId: string, track: Track) => Playlist | undefined;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Playlist | undefined;
  reorderPlaylistTrack: (playlistId: string, fromIndex: number, toIndex: number) => Playlist | undefined;
  searchPlaylists: (query: string) => Playlist[];
  filterByTrackCount: (min?: number, max?: number) => Playlist[];
  getPlaylistStats: () => PlaylistStats;
}

export interface PlaylistStats {
  totalPlaylists: number;
  totalTracks: number;
  totalDuration: number;
  emptyPlaylists: number;
}

/**
 * Manage playlists - CRUD operations and playlist management
 */
export function managePlaylists(
  playlists: Playlist[],
  options: PlaylistManagementOptions = {}
): PlaylistManagementResult {
  const list = [...playlists];

  function persist(updated: Playlist): Playlist {
    const index = list.findIndex((p) => p.id === updated.id);
    if (index !== -1) {
      list[index] = updated;
    }
    options.onUpdate?.(updated);
    return updated;
  }

  function getPlaylist(id: string): Playlist | undefined {
    return list.find((p) => p.id === id);
  }

  function createNewPlaylist(input: PlaylistInput): Playlist {
    const playlist = createPlaylist(input);
    list.push(playlist);
    return playlist;
  }

  function updateExistingPlaylist(
    id: string,
    updates: Partial<PlaylistInput>
  ): Playlist | undefined {
    const playlist = getPlaylist(id);
    if (!playlist) return undefined;

    const updated: Playlist = {
      ...playlist,
      ...updates,
      tracks: updates.tracks ?? playlist.tracks,
      updatedAt: new Date(),
    };
    return persist(updated);
  }

  function deleteExistingPlaylist(id: string): boolean {
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return false;

    list.splice(index, 1);
    options.onDelete?.(id);
    return true;
  }

  function addTrackTo(playlistId: string, track: Track): Playlist | undefined {
    const playlist = getPlaylist(playlistId);
    if (!playlist) return undefined;
    return persist(addTrack(playlist, track));
  }

  function removeTrackFrom(playlistId: string, trackId: string): Playlist | undefined {
    const playlist = getPlaylist(playlistId);
    if (!playlist) return undefined;
    return persist(removeTrack(playlist, trackId));
  }

  function reorderTrackIn(
    playlistId: string,
    fromIndex: number,
    toIndex: number
  ): Playlist | undefined {
    const playlist = getPlaylist(playlistId);
    if (!playlist) return undefined;
    return persist(reorderTrack(playlist, fromIndex, toIndex));
  }

  function search(query: string): Playlist[] {
    const lower = query.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.tracks.some((t) => t.title.toLowerCase().includes(lower))
    );
  }

  function filterByCount(min?: number, max?: number): Playlist[] {
    return list.filter((p) => {
      const count = p.tracks.length;
      if (min !== undefined && count < min) return false;
      if (max !== undefined && count > max) return false;
      return true;
    });
  }

  function getStats(): PlaylistStats {
    const totalTracks = list.reduce((sum, p) => sum + p.tracks.length, 0);
    const totalDuration = list.reduce(
      (sum, p) => sum + p.tracks.reduce((t, track) => t + track.duration, 0),
      0
    );
    const emptyPlaylists = list.filter((p) => p.tracks.length === 0).length;

    return {
      totalPlaylists: list.length,
      totalTracks,
      totalDuration,
      emptyPlaylists,
    };
  }

  return {
    get playlists() {
      return list;
    },
    getPlaylist,
    createPlaylist: createNewPlaylist,
    updatePlaylist: updateExistingPlaylist,
    deletePlaylist: deleteExistingPlaylist,
    addTrackToPlaylist: addTrackTo,
    removeTrackFromPlaylist: removeTrackFrom,
    reorderPlaylistTrack: reorderTrackIn,
    searchPlaylists: search,
    filterByTrackCount: filterByCount,
    getPlaylistStats: getStats,
  };
}

// Utility: create a new playlist
export function createNewPlaylist(input: PlaylistInput): Playlist {
  return createPlaylist(input);
}

// Utility: duplicate a playlist
export function duplicatePlaylist(playlist: Playlist, newName?: string): Playlist {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: newName ?? `${playlist.name} (copy)`,
    tracks: [...playlist.tracks],
    createdAt: now,
    updatedAt: now,
  };
}

// Utility: merge playlists
export function mergePlaylists(playlistA: Playlist, playlistB: Playlist): Playlist {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: `${playlistA.name} + ${playlistB.name}`,
    tracks: [...playlistA.tracks, ...playlistB.tracks],
    createdAt: now,
    updatedAt: now,
  };
}