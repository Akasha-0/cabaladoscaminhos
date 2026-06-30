/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — Server-side audio post lookup
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Storage is localStorage (client-only). The server does NOT have a backend
 * for audio posts in this cycle, so we return a deterministic placeholder
 * matching the id passed in the URL. This guarantees the route loads a
 * well-shaped card even though the actual audio lives in the client.
 *
 * Future cycles can swap this for a fetch to a real backend.
 */

import type { StoredAudioPost } from '@/lib/w90s/audio-storage';

export function findAudioPostByIdServerFallback(id: string): StoredAudioPost | null {
  if (!id || typeof id !== 'string' || id.trim().length === 0) return null;

  // Reasonable placeholder seeded from id (deterministic)
  const seed = hashString(id);
  const formats: StoredAudioPost['format'][] = ['mp3', 'wav', 'ogg'];
  const format = formats[seed % formats.length] ?? 'mp3';
  const durationSeconds = 30 + (seed % 270); // 30s..5min
  const sizeBytes = 200_000 + (seed % 1_500_000); // 200KB..1.7MB

  return {
    id: id as unknown as StoredAudioPost['id'],
    title: humanizeId(id),
    fileName: `${humanizeId(id)}.${format}`,
    sizeBytes,
    format,
    durationSeconds,
    peaksLength: 80,
    createdAt: new Date(0).toISOString(),
    lgpdConsent: true,
    lgpdVersion: '2026-06-30',
    fileRef: id,
    objectUrl: null,
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function humanizeId(id: string): string {
  const stripped = id.replace(/^ap-/, '').replace(/[-_]+/g, ' ').trim();
  if (!stripped) return 'Post de áudio';
  return stripped.slice(0, 80);
}
