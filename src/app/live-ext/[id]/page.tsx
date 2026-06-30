// ============================================================================
// app/live-ext/[id]/page.tsx — W90s-A Server Component demo page
//
// Mirrors the W89-A `app/live/[id]/page.tsx` structure but for the W90s-A
// extended chat (reactions + viewer count + moderation). Uses a different
// route (`/live-ext/[id]` vs W89-A's `/live/[id]`) so both can coexist.
//
// Server Component responsibilities:
//   - Read `userId` and `isModerator` from cookies (server-only)
//   - Render the `LiveStreamChatExt` client component
//   - Force dynamic rendering (live content)
//   - Block indexing (live pages are ephemeral)
//
// Note: this page intentionally does NOT import any server-only data layer;
// the chat is in-memory. Production wiring would seed `initialMessages` from
// a database query and the SSE channel would push new ones on top.
// ============================================================================

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LiveStreamChatExt } from '@/components/community/LiveStreamChatExt';
import { toStreamId, toUserId } from '@/lib/w89/live-stream-chat';
import type { LiveStreamId, UserId } from '@/lib/w89/live-stream-chat';
// Side-effect-only import: pulls the engine into the server bundle so
// production wiring can hydrate the page with the same engine the client
// uses. Engine is pure — no server-only side effects.
import '@/lib/w90s/live-stream-chat-ext';

// ---------------------------------------------------------------------------
// Page-level config: live content must not be indexed, must be SSR-dynamic
// ---------------------------------------------------------------------------
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const robots = { index: false, follow: false } as const;

// ---------------------------------------------------------------------------
// Metadata — title only; description omitted for live pages
// ---------------------------------------------------------------------------
export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  return {
    title: `Live ${params.id} — Cábala dos Caminhos`,
    robots: { index: false, follow: false },
    other: {
      'x-akasha-feature': 'live-stream-chat-ext',
    },
  };
}

// ---------------------------------------------------------------------------
// Page component (Server Component)
// ---------------------------------------------------------------------------
interface PageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LiveExtPage({ params }: PageProps) {
  const rawId = (params?.id ?? '').toString().trim();
  if (!rawId) {
    notFound();
  }

  // Read user/moderator cookies (server-only, throws if called from client).
  // Wrap in try/catch so pre-rendering or build-time evaluation doesn't crash.
  // Next 15+ makes cookies() async — we await it but degrade gracefully.
  let userId: UserId;
  let userName = 'convidado';
  let isModerator = false;
  try {
    const cookieStore = await Promise.resolve(cookies());
    userId = toUserId(cookieStore.get('userId')?.value ?? `anon-${rawId}`);
    userName = cookieStore.get('userName')?.value ?? 'convidado';
    isModerator = cookieStore.get('isModerator')?.value === 'true';
  } catch {
    userId = toUserId(`anon-${rawId}`);
  }

  const streamId: LiveStreamId = toStreamId(rawId);

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      data-testid="live-ext-page"
      data-stream-id={streamId as unknown as string}
    >
      <div className="mx-auto max-w-2xl px-3 py-4 md:px-4 md:py-6">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Live · {rawId}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chat ao vivo com reações, contagem de espectadores e moderação.
          </p>
        </header>

        <div className="h-[640px]">
          <LiveStreamChatExt
            streamId={streamId}
            currentUserId={userId}
            currentUserName={userName}
            isModerator={isModerator}
            initialViewerCount={0}
            initialMessages={[]}
          />
        </div>

        <footer className="mt-4 text-xs text-muted-foreground">
          Recurso W90s-A · reações com 5 emojis canônicos · contagem de espectadores · moderação silenciosa.
        </footer>
      </div>
    </main>
  );
}