/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — /audio/new Server Component
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Server-rendered upload page. Hands the client component to the browser
 * (AudioPostUploader is "use client") so File API + Object URL + canvas are
 * available in the browser runtime.
 *
 * Falls back to a soft auth check (cookies) — no redirect on missing auth, just
 * passes dev-user when available.
 */

import React from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AudioPostUploader } from '@/components/community/AudioPostUploader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = Object.freeze({
  title: 'Novo post de áudio · Cabala dos Caminhos',
  description: 'Publique um áudio curto (mp3, wav, ogg). Preview local antes do envio.',
  robots: { index: false, follow: false },
} as Metadata);

export default async function NewAudioPostPage() {
  let devUserId: string | undefined;
  try {
    const cookieStore = await cookies();
    devUserId = cookieStore.get('devUserId')?.value || cookieStore.get('userId')?.value;
  } catch {
    devUserId = undefined;
  }

  return (
    <main
      role="main"
      aria-label="Página de novo post de áudio"
      data-testid="audio-new-page"
      className="mx-auto w-full max-w-full px-2 py-6 md:max-w-3xl"
    >
      <AudioPostUploader devUserId={devUserId} />
    </main>
  );
}
