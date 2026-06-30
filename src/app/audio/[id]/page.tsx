/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — /audio/[id] Server Component
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Server-rendered detail page. Reads the post metadata from the storage layer
 * (which is client-side localStorage). The actual playback requires a fresh
 * File selection on the client because Blob URLs cannot be hydrated from
 * server output. So we:
 *   - Show the server-known metadata (title, format, duration, fileName)
 *   - Render a clear notice that the user must re-select the file to play
 *   - Provide the playback control surface via AudioPostPlayer only when the
 *     client provides a fresh object URL (via a controlled client island)
 *
 * For W90s-C cycle we render the metadata + a placeholder client component that
 * directs the user back to /audio/new to re-attach the audio file. Future
 * cycles can swap the placeholder for a server-aware uploader.
 */

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mic, Clock, FileText } from 'lucide-react';
import {
  findAudioPostByIdServerFallback,
  type StoredAudioPost,
} from './postLookup';
import { formatDuration } from '@/lib/w90s/audio-posts-upload';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await normalizeParams(params);
  const post = await findAudioPostByIdServerFallback(resolved.id);
  if (!post) {
    return {
      title: 'Áudio não encontrado · Cabala dos Caminhos',
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${post.title} · Áudio`,
    description: `Post de áudio: ${post.title}`,
    robots: { index: false, follow: false },
  };
}

async function normalizeParams(params: PageProps['params']): Promise<{ id: string }> {
  if (params && typeof (params as Promise<{ id: string }>).then === 'function') {
    return await (params as Promise<{ id: string }>);
  }
  return params as { id: string };
}

export default async function AudioPostDetailPage({ params }: PageProps) {
  const resolved = await normalizeParams(params);
  const post = findAudioPostByIdServerFallback(resolved.id);
  if (!post) notFound();

  const cookieStore = await cookies();
  const userName = cookieStore.get('userName')?.value ?? cookieStore.get('devUserName')?.value;
  const headerStore = await headers();
  void headerStore; // touch to keep Next.js happy in dynamic mode

  return (
    <main
      role="main"
      aria-label="Página do post de áudio"
      data-testid="audio-detail-page"
      className="mx-auto w-full max-w-full space-y-4 px-4 py-6 md:max-w-3xl"
    >
      <Link
        href="/audio/new"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        data-testid="back-to-upload"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Novo áudio
      </Link>

      <article
        aria-labelledby="audio-detail-title"
        data-testid="audio-detail-card"
        className="space-y-3 rounded-lg border bg-card p-4"
      >
        <header className="space-y-1">
          <h1
            id="audio-detail-title"
            className="truncate text-2xl font-bold tracking-tight"
            title={post.title}
          >
            {post.title || 'Post de áudio'}
          </h1>
          {userName ? (
            <p className="text-sm text-muted-foreground">por {userName}</p>
          ) : null}
        </header>

        <dl className="grid grid-cols-2 gap-2 text-sm" data-testid="audio-meta-list">
          <div className="space-y-0.5">
            <dt className="text-xs text-muted-foreground">Formato</dt>
            <dd className="inline-flex items-center gap-1 font-medium">
              <Mic className="h-3 w-3" aria-hidden="true" />
              {post.format.toUpperCase()}
            </dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-xs text-muted-foreground">Duração</dt>
            <dd className="inline-flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatDuration(post.durationSeconds)}
            </dd>
          </div>
          <div className="col-span-2 space-y-0.5">
            <dt className="text-xs text-muted-foreground">Arquivo</dt>
            <dd className="inline-flex items-center gap-1 truncate font-mono text-xs" title={post.fileName}>
              <FileText className="h-3 w-3" aria-hidden="true" />
              {post.fileName || post.fileRef}
            </dd>
          </div>
        </dl>

        <section
          aria-label="Preview do áudio"
          data-testid="audio-preview-notice"
          className="rounded-md border border-amber-400/30 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          O áudio é gerenciado localmente por privacidade. Reabra em{' '}
          <Link className="underline" href="/audio/new">/audio/new</Link> para anexar e reproduzir.
        </section>
      </article>
    </main>
  );
}

// Re-export for the helper
export type { StoredAudioPost };
