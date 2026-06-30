// ============================================================================
// /live/[id]/with-reactions — W90-B demo page (standalone, no W89-A dep).
//
// Wires the W90-B reactions engine + components end-to-end using a synthetic
// in-memory message stream. The real-world integration with W89-A's
// `LiveStreamChat` is documented in the W90-B deliverable doc; this page
// serves as a runnable demo + regression fixture that exercises the engine
// without any W89-A dependency.
//
// Why standalone?
//   - W89-A's `live-stream-chat` is not yet merged into `main` at the time of
//     W90-B's commit (it lives on `w89/live-stream-chat` branch @ 834cb58d).
//   - The wave-spawner brief mandates "Integration via props only — DO NOT
//     modify W89-A files." Keeping this page self-contained guarantees that
//     branch isolation is preserved.
//   - When W89-A lands on `main`, a follow-up cycle can replace the synthetic
//     message stream with `LiveStreamChatState` and the integration stays at
//     the props boundary (this page is the contract).
// ============================================================================

import { cookies, headers } from 'next/headers';

import LiveStreamReactionsDemo from './LiveStreamReactionsDemo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Live Stream com Reações · Cabala dos Caminhos',
  description:
    'Demo do motor de reações positivas (W90-B) com chat sintético (placeholder para integração futura com W89-A).',
  robots: { index: false, follow: false },
};

interface PageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export default async function LiveWithReactionsPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { id } = await params;

  // Best-effort cookie reads — fall back to guest values if cookies() throws
  // (e.g. during build or in restricted environments).
  let userId = 'guest';
  let userName = 'Convidado';
  let isModerator = false;

  try {
    const c = await cookies();
    userId = c.get('userId')?.value || `anon-${Math.random().toString(36).slice(2, 8)}`;
    userName = c.get('userName')?.value || 'Convidado';
    isModerator = c.get('isModerator')?.value === 'true';
  } catch {
    // Fall through with default guest identity.
  }

  // Read user-agent for a log entry (best-effort, never blocks render).
  let uaLabel = 'unknown';
  try {
    const h = await headers();
    const ua = h.get('user-agent') ?? 'unknown';
    uaLabel = ua.slice(0, 40);
  } catch {
    // ignore
  }

  return (
    <main
      data-testid="live-reactions-page"
      data-stream-id={id}
      data-user-id={userId}
      data-user-agent={uaLabel}
      className="mx-auto flex min-h-screen w-full max-w-full flex-col gap-4 px-3 py-4 md:max-w-3xl md:px-6 md:py-8"
      aria-label={`Live stream ${id} com reações`}
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">
          Live com Reações — {id}
        </h1>
        <p className="text-xs text-muted-foreground md:text-sm">
          W90-B · Motor de reações positivas · Chat sintético (W89-A integração
          pendente de merge em main). Usuário:{' '}
          <span className="font-mono">{userName}</span>
          {isModerator && (
            <span className="ml-2 inline-flex items-center rounded-full bg-[var(--spiritual-gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--spiritual-gold-dark)]">
              Moderador
            </span>
          )}
        </p>
      </header>

      <LiveStreamReactionsDemo
        streamId={id}
        userId={userId}
        userName={userName}
        isModerator={isModerator}
      />
    </main>
  );
}