// ============================================================================
// app/live/[id]/page.tsx — demo live-stream chat page (W89-A)
//
// Server component. Reads `params.id` as `streamId`, hydrates the client
// `LiveStreamChat` component. In production this would:
//
//   1. Look up the live stream metadata (title, host, scheduled start).
//   2. Resolve the current user + moderator flag from session/cookie.
//   3. Possibly pre-fetch the most recent N messages for SSR.
//
// For W89-A the demo wires:
//   - `currentUserId` from cookie `userId` (default 'demo-user')
//   - `canModerate` from cookie `isModerator` (default false)
//
// data-testid:
//   - `live-page` (root)
// ============================================================================

import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { LiveStreamChat } from '@/components/community/LiveStreamChat';

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Live · Cabala dos Caminhos`,
    description: `Sala ao vivo #${id} — chat em tempo real com a comunidade Cabala dos Caminhos.`,
    alternates: { canonical: `/live/${id}` },
    robots: { index: false, follow: false }, // live pages are ephemeral
  };
}

export default async function LiveStreamPage({ params }: PageProps) {
  const { id } = await params;

  // cookies() may be sync or async depending on Next version — try both safely.
  let userId = 'demo-user';
  let isModerator = false;
  try {
    const cookieStore = await cookies();
    userId = cookieStore.get('userId')?.value ?? userId;
    isModerator = cookieStore.get('isModerator')?.value === 'true' || isModerator;
  } catch {
    // cookies() can throw in some Next.js versions when called outside a
    // request context (e.g. during static analysis). The demo gracefully
    // falls back to defaults.
  }

  return (
    <main
      data-testid="live-page"
      data-stream-id={id}
      className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-full flex-col gap-4 px-3 py-4 sm:max-w-2xl sm:px-4 sm:py-6 md:max-w-3xl"
    >
      <header className="flex flex-col gap-1 border-b border-border pb-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Live · stream
        </p>
        <h1 className="break-all text-xl font-semibold text-foreground sm:text-2xl">
          #{id}
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe a transmissão ao vivo com a comunidade. Respeite o espaço
          sagrado do outro — em caso de dúvida, consulte o Guia da Casa.
        </p>
      </header>

      <div className="flex-1">
        <LiveStreamChat
          streamId={id}
          currentUserId={userId}
          currentUserName={isModerator ? 'Moderador' : 'Convidado'}
          canModerate={isModerator}
          slowModeSeconds={0}
        />
      </div>

      <footer className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
        Cabala dos Caminhos · Chat moderado · LGPD respeitado
      </footer>
    </main>
  );
}

// Route segment config — this is a dynamic route (params.id).
export const dynamic = 'force-dynamic';

// Module-level freeze.
Object.freeze(exports);