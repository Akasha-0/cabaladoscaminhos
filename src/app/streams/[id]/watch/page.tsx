// ============================================================================
// /streams/[id]/watch — Live stream watch page
// ============================================================================
// Server component. Loads:
//   - Stream metadata (title, tradition, host)
//   - Initial reaction aggregates (from engine snapshot)
//   - Initial presence count (from engine)
//
// Embeds:
//   - Video player placeholder (real impl would use HLS / video tag)
//   - ReactionBar (client) — 8 emoji buttons
//   - FloatingReactions (client) — bubbles layer
//   - PresenceDot (client) — count-only presence indicator
//
// Mobile-first layout. No leaderboards. No comments here (separate scope).
// ============================================================================

import React from 'react';
import { headers, cookies } from 'next/headers';
import { ReactionBar } from '@/components/livestream/ReactionBar';
import { FloatingReactions } from '@/components/livestream/FloatingReactions';
import { PresenceDot } from '@/components/livestream/PresenceDot';
import {
  getEngine,
  asStreamId,
  asUserId,
  type ReactionType,
  REACTION_TYPES,
  REACTION_MEANINGS_PT,
} from '@/lib/w92/live-stream-reactions';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Transmissão ao vivo — Cabala dos Caminhos`,
    description: `Acompanhe a transmissão ao vivo e envie reações de presença.`,
    robots: { index: false, follow: false },
  };
}

export default async function StreamWatchPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id: rawId } = await params;
  const streamId = asStreamId(rawId);

  // Server-side: detect locale from cookie or Accept-Language header
  const cookieStore = await cookies();
  const headerStore = await headers();
  const localeCookie = cookieStore.get('locale')?.value;
  const acceptLang = headerStore.get('accept-language') ?? '';
  const locale: 'pt-BR' | 'en' =
    localeCookie === 'en' ||
    (localeCookie === undefined && acceptLang.startsWith('en'))
      ? 'en'
      : 'pt-BR';

  // Engine snapshot — server-only
  const engine = getEngine();
  const aggregates = engine.getAggregates(streamId);
  const presence = engine.getActivePresence(streamId);
  const total = engine.getTotal(streamId);

  // Stream metadata — for the brief, we use a deterministic placeholder.
  // In production this would come from prisma.
  const streamMeta = {
    id: rawId,
    title: 'Roda de Cabala — Mesa Aberta',
    tradition: 'cabala' as const,
    host: 'Mentor(a) da Comunidade',
    description:
      locale === 'pt-BR'
        ? 'Transmissão ao vivo da roda. Reaja com emojis de presença.'
        : 'Live transmission of the circle. React with presence emojis.',
  };

  // Viewer user id — read from auth cookie (placeholder logic).
  // Real auth would use NextAuth session.
  const sessionCookie = cookieStore.get('session-token')?.value;
  const isAuthenticated = Boolean(sessionCookie);
  const userId = isAuthenticated ? asUserId(sessionCookie ?? 'anon') : asUserId('anon');

  return (
    <main
      data-component="stream-watch-page"
      data-stream-id={rawId}
      className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-slate-950 text-slate-100"
    >
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 px-4 py-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-400">
              {locale === 'pt-BR' ? 'Transmissão ao vivo' : 'Live stream'}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold leading-tight">
              {streamMeta.title}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              {locale === 'pt-BR' ? 'com' : 'with'} {streamMeta.host}
            </p>
          </div>
          <PresenceDot
            initialCount={presence}
            locale={locale}
            streamId={rawId}
          />
        </div>
      </header>

      {/* Video player area + floating reactions overlay */}
      <section className="relative aspect-video w-full bg-slate-900">
        {/* Real impl: <video> with HLS source */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-slate-500">
            {locale === 'pt-BR'
              ? '[Player de vídeo aqui]'
              : '[Video player placeholder]'}
          </p>
        </div>
        {/* Floating reactions overlay */}
        <FloatingReactions locale={locale} />
      </section>

      {/* Description */}
      <section className="px-4 py-3">
        <p className="text-sm text-slate-300">{streamMeta.description}</p>
      </section>

      {/* Reaction bar (sticky-ish at bottom on mobile) */}
      <section className="sticky bottom-0 z-10 border-t border-slate-800 bg-slate-900/95 px-2 py-1 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <p className="px-2 text-xs text-slate-400">
            {locale === 'pt-BR' ? 'Reaja com presença' : 'React with presence'}
            {total > 0 && (
              <span className="ml-2 text-amber-400">
                · {total} {locale === 'pt-BR' ? 'reações' : 'reactions'}
              </span>
            )}
          </p>
        </div>
        <ReactionBar
          streamId={rawId}
          userId={userId as string}
          locale={locale}
          isAuthenticated={isAuthenticated}
        />
        {/* Aggregate counts (subtle, server-rendered) */}
        <div className="flex flex-wrap items-center gap-2 px-1 pb-2 text-xs text-slate-400">
          {REACTION_TYPES.map((t) => {
            const count = aggregates[t];
            if (count === 0) return null;
            return (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2 py-0.5"
                title={REACTION_MEANINGS_PT[t]}
              >
                <span aria-hidden="true">{t}</span>
                <span className="tabular-nums">{count}</span>
              </span>
            );
          })}
        </div>
      </section>

      {/* Hidden SEO / accessibility block — no leaderboards, no rankings */}
      <section className="sr-only" aria-label="Reactions legend">
        <h2>
          {locale === 'pt-BR' ? 'Significado das reações' : 'Reaction meanings'}
        </h2>
        <ul>
          {(Object.entries(REACTION_MEANINGS_PT) as [ReactionType, string][]).map(
            ([emoji, meaning]) => (
              <li key={emoji}>
                {emoji} — {locale === 'pt-BR' ? meaning : REACTION_MEANINGS_PT[emoji]}
              </li>
            )
          )}
        </ul>
      </section>
    </main>
  );
}