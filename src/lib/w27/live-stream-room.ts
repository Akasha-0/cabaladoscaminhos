// w27/live-stream-room.ts — live stream room UI stub
// Feature: sala de live stream (audio + video + chat sincronizado)
// Status: STUB — integracao com provider (100ms / Daily / LiveKit) pendente

export type StreamStatus = 'agendada' | 'ao-vivo' | 'encerrada' | 'cancelada';
export type StreamModality = 'audio-only' | 'video' | 'tela-compartilhada';

export interface LiveStreamRoom {
  id: string;
  slug: string;
  hostId: string;
  title: string;
  description: string;
  status: StreamStatus;
  modality: StreamModality;
  scheduledStart: string; // ISO 8601
  actualStart?: string;
  endedAt?: string;
  maxParticipants: number;
  trilha: string;
  isPrivate: boolean;
  recordingEnabled: boolean;
  createdAt: string;
}

export interface StreamParticipant {
  id: string;
  roomId: string;
  userId: string;
  role: 'host' | 'co-host' | 'participante' | 'observador';
  joinedAt: string;
  leftAt?: string;
  spokeSeconds: number;
  reactions: number;
}

export function isLiveNow(room: LiveStreamRoom, now: Date = new Date()): boolean {
  if (room.status !== 'ao-vivo') return false;
  if (!room.actualStart) return false;
  return new Date(room.actualStart) <= now;
}

