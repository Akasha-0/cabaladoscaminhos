// ============================================================================
// src/app/(akasha)/akasha/page.tsx
// ============================================================================
// Wave 72 — Akasha chat page. Mounts the streaming `<ChatStream />` and
// wires the optional citation/tag click handlers (deep-link or analytics).
//
// This page is intentionally thin — all streaming logic lives in the
// `ChatStream` component (src/components/akasha/chat-stream.tsx). The
// page is just a server-rendered shell with a single client child.
//
// The (akasha) route group is *separate* from (community)/akashic so the
// two UIs can co-exist and A/B test. Both hit the same backend endpoint
// at /api/akashic/chat/stream.
// ============================================================================

import { ChatStream } from '@/components/akasha/chat-stream.tsx';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Akasha IA · Cabala dos Caminhos',
  description:
    'Curadora universalista que cita papers, respeita tradições e nunca prescreve.',
};

export default function AkashaChatPage() {
  return (
    <main className="h-[calc(100vh-4rem)] w-full">
      <ChatStream />
    </main>
  );
}
