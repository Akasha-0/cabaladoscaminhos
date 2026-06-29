// src/lib/w28/voice-mode-player.ts
// Cycle 28 — Voice mode audio player UI types + queue helpers.
// Extends w27/voice-mode (VoiceConfig + VoiceClip) with a player queue and state machine.

import type { VoiceClip } from "@/lib/w27/voice-mode";

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export interface VoicePlayerTrack {
  clip: VoiceClip;
  /** Pre-signed audio URL (15min TTL). */
  audioUrl: string;
  /** Display label shown in the queue. */
  label: string;
  /** Duration in seconds. */
  durationSec: number;
}

export interface VoicePlayerQueue {
  tracks: VoicePlayerTrack[];
  currentIndex: number;
  state: PlayerState;
  currentTimeSec: number;
  volume: number; // 0.0 to 1.0
  playbackRate: number; // 0.5 to 2.0
}

export const INITIAL_VOICE_PLAYER: VoicePlayerQueue = {
  tracks: [],
  currentIndex: 0,
  state: "idle",
  currentTimeSec: 0,
  volume: 1.0,
  playbackRate: 1.0,
};

export function nextTrackIndex(queue: VoicePlayerQueue): number {
  return Math.min(queue.currentIndex + 1, queue.tracks.length - 1);
}

export function prevTrackIndex(queue: VoicePlayerQueue): number {
  return Math.max(queue.currentIndex - 1, 0);
}

export function hasNext(queue: VoicePlayerQueue): boolean {
  return queue.currentIndex < queue.tracks.length - 1;
}

export function hasPrev(queue: VoicePlayerQueue): boolean {
  return queue.currentIndex > 0;
}

export function isPlaying(queue: VoicePlayerQueue): boolean {
  return queue.state === "playing";
}
