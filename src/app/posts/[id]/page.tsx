/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — POST DETAIL PAGE (demo for the comments engine)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mobile-first, accessible demo page that mounts the Thread component
 * against the in-memory adapter. Used to:
 *   1. Provide a real React tree for the smoke runner + visual review.
 *   2. Validate the <Thread /> end-to-end against default seed data.
 *
 * Sacred-cultural sensitivity: the surrounding chrome preserves the user
 * experience language; sacred terms appear via the thread body (the engine
 * is the source of truth).
 */

'use client';

import React, { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';

import { Thread } from '@/components/comments/Thread';
import {
  SAMPLE_POST_ID_1,
  SAMPLE_POST_ID_2,
  createInMemoryCommentsAdapter,
  getKnownHandlesSet,
} from '@/engine/comments/adapter-memory';
import { createCommentsEngine } from '@/engine/comments/factory';

const MVP_VIEWER_ID = 'u_visitor';

const POST_TITLES: Readonly<Record<string, { title: string; tradition: string; excerpt: string }>> = {
  [SAMPLE_POST_ID_1]: {
    title: 'Reflexão sobre o Axé no Candomblé',
    tradition: 'Candomblé',
    excerpt:
      'Visitei o terreiro ontem e o axé do Caboclo da Praia estava fortíssimo. Como vocês cuidam da corrente?',
  },
  [SAMPLE_POST_ID_2]: {
    title: 'O Louco + Keter: início de ciclo',
    tradition: 'Cabala',
    excerpt:
      'Tirei O Louco no Tarô hoje e confirmei a Sefirá de Keter pela manhã — bate, né?',
  },
};

const STYLES = {
  page: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '16px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#e8e8e8',
    background: 'transparent',
  } as const,
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid rgba(127,127,127,0.2)',
  } as const,
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    background: 'rgba(127,200,127,0.16)',
    border: '1px solid rgba(127,200,127,0.4)',
    fontSize: 12,
    marginRight: 6,
  } as const,
};

export default function PostDetailPage(): React.ReactElement {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : SAMPLE_POST_ID_1;

  if (!(id in POST_TITLES)) {
    notFound();
  }
  const meta = POST_TITLES[id] ?? POST_TITLES[SAMPLE_POST_ID_1]!;

  const engine = useMemo(
    () =>
      createCommentsEngine(
        createInMemoryCommentsAdapter(),
        getKnownHandlesSet,
      ),
    [],
  );

  return (
    <main style={STYLES.page}>
      <header style={STYLES.header}>
        <span style={STYLES.badge}>{meta.tradition}</span>
        <h1 style={{ margin: '8px 0', fontSize: 22, lineHeight: 1.3 }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>
          {meta.excerpt}
        </p>
      </header>

      <Thread
        postId={id}
        viewerId={MVP_VIEWER_ID}
        engine={engine}
        isFirstComment
      />

      <footer
        style={{
          marginTop: 24,
          paddingTop: 12,
          borderTop: '1px solid rgba(127,127,127,0.2)',
          fontSize: 12,
          opacity: 0.6,
        }}
      >
        Demo W87-C — dados em memória. Cada visitante opera o mesmo engine.
      </footer>
    </main>
  );
}
