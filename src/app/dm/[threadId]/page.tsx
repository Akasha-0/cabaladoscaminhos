// ============================================================================
// /dm/[threadId] — Thread detail page (Server Component) — W90s-B
//
// Server-renderiza o shell e hidrata o DMThreadView via client component.
// ============================================================================

import { cookies } from 'next/headers';
import { DMThreadDetailClient } from './DMThreadDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Conversa · Akasha',
  robots: { index: false, follow: false },
};

export default async function DMThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('dm.userId')?.value ?? 'me';

  return (
    <main
      className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 md:py-6"
      data-testid="dm-thread-page"
      data-thread-id={threadId}
    >
      <DMThreadDetailClient currentUserId={userId} threadId={threadId} />
    </main>
  );
}
