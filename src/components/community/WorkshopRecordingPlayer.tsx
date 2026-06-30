'use client';

// ============================================================================
// WorkshopRecordingPlayer — full player UI for workshop recordings (W90-C)
// ============================================================================
// Combines audio (and optional video) with the transcript panel, a highlights
// panel, a search box, and a language toggle. Pure presentational — parent
// supplies the recording data + manages state.
//
// data-testid inventory:
//   recording-player-root, audio-player, video-player, search-input,
//   language-toggle, highlight-{0..n}, transcript-segment-{i}
// ARIA:
//   role="region" aria-label="Workshop recording player"
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  formatTimestamp,
  getTotalDuration,
  computeHighlights,
  HIGHLIGHT_LABELS,
  TRADITION_LABELS,
  type Highlight,
  type HighlightReason,
  type WorkshopRecording,
  type UserId,
  type SegmentLanguage,
} from '@/lib/w90/workshop-recording.ts';
import { TranscriptPanel } from './TranscriptPanel.tsx';

export interface WorkshopRecordingPlayerProps {
  recording: WorkshopRecording;
  currentUserId: UserId | null;
}

export function WorkshopRecordingPlayer({
  recording,
  currentUserId,
}: WorkshopRecordingPlayerProps): React.ReactElement {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<SegmentLanguage | 'all'>('all');

  const totalDuration = useMemo(() => getTotalDuration(recording), [recording]);
  const highlights: ReadonlyArray<Highlight> = useMemo(
    () => computeHighlights(recording, { limit: 5 }),
    [recording]
  );

  const currentSegmentIndex = useMemo(
    () => findCurrentSegmentIndex(recording.transcript, currentTime),
    [recording.transcript, currentTime]
  );

  const visibleSegments = useMemo(() => {
    if (language === 'all') return recording.transcript;
    return recording.transcript.filter((s) => s.language === language);
  }, [recording.transcript, language]);

  const handleSeek = useCallback(
    (seconds: number) => {
      setCurrentTime(seconds);
      const a = audioRef.current;
      const v = videoRef.current;
      if (a) a.currentTime = seconds;
      if (v) v.currentTime = seconds;
    },
    []
  );

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, []);

  const onJumpToHighlight = useCallback(
    (h: Highlight) => {
      const seg = recording.transcript[h.segmentIndex];
      if (seg) handleSeek(seg.startSeconds);
    },
    [recording.transcript, handleSeek]
  );

  return (
    <section
      data-testid="recording-player-root"
      role="region"
      aria-label="Workshop recording player"
      className="mx-auto flex w-full max-w-full flex-col gap-6 px-3 py-4 sm:px-6 md:max-w-3xl"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400">
          {TRADITION_LABELS[recording.tradition]}
        </p>
        <h1
          data-testid="recording-title"
          className="text-2xl font-bold text-stone-900 dark:text-stone-100"
        >
          {recording.facilitatorName}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Facilitador(a) · {formatTimestamp(totalDuration)} de gravação
        </p>
        {currentUserId && (
          <p className="text-xs text-stone-500" data-testid="current-user-badge">
            Você está autenticado(a) — sua presença é registrada.
          </p>
        )}
      </header>

      {recording.videoUrl && (
        <video
          ref={videoRef}
          data-testid="video-player"
          controls
          preload="metadata"
          poster=""
          aria-label={`Vídeo da oficina com ${recording.facilitatorName}`}
          className="w-full rounded-xl bg-stone-900"
        >
          <source src={recording.videoUrl} type="video/mp4" />
          <p>Seu navegador não suporta vídeo HTML5.</p>
        </video>
      )}

      <audio
        ref={audioRef}
        data-testid="audio-player"
        controls
        preload="metadata"
        aria-label={`Áudio da oficina com ${recording.facilitatorName}`}
        className="w-full"
      >
        <source src={recording.audioUrl} type="audio/mp4" />
        <p>Seu navegador não suporta áudio HTML5.</p>
      </audio>

      <div
        data-testid="playback-status"
        aria-live="polite"
        className="flex items-center justify-between rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200"
      >
        <span>
          {isPlaying ? 'Reproduzindo' : 'Pausado'} · {formatTimestamp(currentTime)}
        </span>
        <span className="font-mono">
          {formatTimestamp(currentTime)} / {formatTimestamp(totalDuration)}
        </span>
      </div>

      <section
        data-testid="highlights-panel"
        aria-label="Momentos-chave"
        className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800/60 dark:bg-amber-950/30"
      >
        <h2 className="mb-3 text-lg font-semibold text-amber-900 dark:text-amber-100">
          ✦ Momentos-chave
        </h2>
        {highlights.length === 0 && (
          <p
            data-testid="highlights-empty"
            className="text-sm italic text-amber-900/70 dark:text-amber-200/70"
          >
            Nenhum momento-chave detectado automaticamente. Explore a transcrição
            para encontrar o que ressoa contigo.
          </p>
        )}
        <ol className="flex flex-col gap-2">
          {highlights.map((h, idx) => {
            const seg = recording.transcript[h.segmentIndex];
            return (
              <li key={`${h.segmentIndex}-${h.reason}`}>
                <button
                  type="button"
                  data-testid={`highlight-${idx}`}
                  onClick={() => onJumpToHighlight(h)}
                  className="flex w-full min-h-[44px] flex-col items-start gap-1 rounded-lg bg-white px-3 py-2 text-left transition-colors hover:bg-amber-100 dark:bg-stone-900/60 dark:hover:bg-amber-900/30"
                  aria-label={`Ir para ${HIGHLIGHT_LABELS[h.reason]} no tempo ${formatTimestamp(seg.startSeconds)}`}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <span aria-hidden="true">{reasonGlyph(h.reason)}</span>
                    <span>{HIGHLIGHT_LABELS[h.reason]}</span>
                    <span className="ml-auto font-mono text-stone-500">
                      [{formatTimestamp(seg.startSeconds)}]
                    </span>
                  </span>
                  <span className="line-clamp-2 text-sm text-stone-700 dark:text-stone-200">
                    {seg.speakerName}: {seg.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <TranscriptPanel
        segments={visibleSegments}
        currentSegmentIndex={currentSegmentIndex}
        query={query}
        onQueryChange={setQuery}
        onSeek={handleSeek}
        onLanguageToggle={(lang) => setLanguage(lang)}
        activeLanguage={language}
      />
    </section>
  );
}

function findCurrentSegmentIndex(
  segments: ReadonlyArray<{ startSeconds: number; endSeconds: number }>,
  seconds: number
): number {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (seconds >= s.startSeconds && seconds < s.endSeconds) return i;
  }
  return -1;
}

function reasonGlyph(reason: HighlightReason): string {
  switch (reason) {
    case 'question':
      return '❓';
    case 'insight':
      return '💡';
    case 'practice':
      return '🧘';
    case 'silence-break':
      return '🌬️';
  }
}