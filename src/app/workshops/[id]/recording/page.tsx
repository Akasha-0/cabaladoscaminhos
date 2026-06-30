// ============================================================================
// Workshop Recording Page — /workshops/[id]/recording (W90-C)
// ============================================================================
// Server Component that loads a workshop recording by id from the fixtures
// store and renders the WorkshopRecordingPlayer.
//
// In production this would query Postgres/Supabase; for cycle 90 we use the
// in-memory fixtures so the demo is deterministic and inspectable.
//
// data-testid: recording-page, recording-not-found
// ============================================================================

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { WorkshopRecordingPlayer } from '@/components/community/WorkshopRecordingPlayer.tsx';
import {
  getRecordingById,
  getRecordingByWorkshopId,
} from '@/lib/w90/__fixtures__/recording-fixtures.ts';
import {
  formatTimestamp,
  TRADITION_LABELS,
  uid,
  type UserId,
} from '@/lib/w90/workshop-recording.ts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface WorkshopRecordingPageProps {
  params: { id: string };
}

export default async function WorkshopRecordingPage({
  params,
}: WorkshopRecordingPageProps): Promise<React.ReactElement> {
  // Lookup by recording id first, then by workshop id (graceful fallback).
  let recording = getRecordingById(params.id);
  if (!recording) {
    recording = getRecordingByWorkshopId(params.id);
  }
  if (!recording) {
    notFound();
  }

  // Optional: derive userId from headers (set upstream by middleware).
  // Defensive read — header may be absent in tests / static contexts.
  let currentUserId: UserId | null = null;
  try {
    const h = headers();
    const raw = h.get('x-user-id');
    if (raw && raw.trim().length > 0) {
      currentUserId = uid(raw.trim());
    }
  } catch {
    currentUserId = null;
  }

  const title = `Gravação · ${recording.facilitatorName}`;
  const description = `Oficina gravada de ${TRADITION_LABELS[recording.tradition]} com ${recording.facilitatorName}, com ${recording.transcript.length} segmentos transcritos e ${formatTimestamp(recording.durationSeconds)} de duração.`;

  return (
    <main
      data-testid="recording-page"
      role="main"
      aria-label={title}
      className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-stone-50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
    >
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="video.other" />
        <meta name="robots" content="index,follow" />
      </head>

      <WorkshopRecordingPlayer
        recording={recording}
        currentUserId={currentUserId}
      />

      <footer
        data-testid="recording-footer"
        className="mx-auto mt-8 w-full max-w-3xl px-3 pb-8 text-xs text-stone-500 sm:px-6"
      >
        <p>
          Gravação de {TRADITION_LABELS[recording.tradition]} · Facilitada por{' '}
          <strong>{recording.facilitatorName}</strong> · Conteúdo reverente —
          sem amarração, sem vinculação. Apenas sabedoria compartilhada.
        </p>
      </footer>
    </main>
  );
}

export async function generateMetadata({
  params,
}: WorkshopRecordingPageProps) {
  let recording = getRecordingById(params.id);
  if (!recording) {
    recording = getRecordingByWorkshopId(params.id);
  }
  if (!recording) {
    return { title: 'Gravação não encontrada' };
  }
  return {
    title: `Gravação · ${recording.facilitatorName}`,
    description: `Oficina de ${TRADITION_LABELS[recording.tradition]} com ${recording.facilitatorName}.`,
  };
}