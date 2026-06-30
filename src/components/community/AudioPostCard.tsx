/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — AudioPostCard (server component)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Server-rendered card for the audio post feed.
 *
 * Renders:
 *   - Uploader's display name (if provided)
 *   - Title + duration
 *   - Format chip (mp3 / wav / ogg)
 *   - Link to detail page (host component decides if embed-player is used)
 *
 * No client JS — fully server. The card is intentionally minimal because the
 * interactive player lives in `/audio/[id]`.
 */

import React from 'react';
import Link from 'next/link';
import { Mic, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/lib/w90s/audio-posts-upload';
import type { StoredAudioPost } from '@/lib/w90s/audio-storage';

export interface AudioPostCardProps {
  post: StoredAudioPost;
  uploaderName?: string;
  detailHref?: string;
}

const FORMAT_LABEL: Record<StoredAudioPost['format'], string> = {
  mp3: 'MP3',
  wav: 'WAV',
  ogg: 'OGG',
};

export function AudioPostCard({
  post,
  uploaderName,
  detailHref,
}: AudioPostCardProps) {
  const href =
    detailHref ?? `/audio/${encodeURIComponent(post.id as string)}`;

  return (
    <article
      aria-labelledby={`audio-post-${post.id}-title`}
      data-testid="audio-post-card"
      data-format={post.format}
      className="w-full"
    >
      <Card className="w-full">
        <CardContent className="space-y-2 p-4">
          <header className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                id={`audio-post-${post.id}-title`}
                className="truncate text-base font-semibold leading-tight"
                title={post.title}
              >
                {post.title || 'Post de áudio'}
              </h3>
              {uploaderName ? (
                <p className="text-xs text-muted-foreground">por {uploaderName}</p>
              ) : null}
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              data-testid="audio-format-chip"
            >
              <Mic className="h-3 w-3" aria-hidden="true" />
              {FORMAT_LABEL[post.format]}
            </span>
          </header>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatDuration(post.durationSeconds)}
            </span>
            <Link
              href={href}
              prefetch={false}
              className="text-primary underline-offset-2 hover:underline"
              data-testid="audio-post-link"
            >
              Abrir player
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}

export default AudioPostCard;
