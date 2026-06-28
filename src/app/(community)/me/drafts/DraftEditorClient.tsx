// ============================================================================
// DraftEditorClient — wrapper client do <DraftEditor> (2026-06-27)
// ============================================================================
// Server component (/me/drafts/page.tsx) passa os dados iniciais; este
// componente client é quem lida com auto-save + publish + schedule.
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DraftEditor } from '@/components/community/DraftEditor';

export interface DraftEditorClientProps {
  draftId: string;
  initialTitle: string | null;
  initialContent: string;
  initialTradition: string | null;
  initialTopic: string | null;
  initialTags: string[];
}

export function DraftEditorClient(props: DraftEditorClientProps) {
  const router = useRouter();
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null);

  return (
    <DraftEditor
      initialDraftId={props.draftId}
      initialTitle={props.initialTitle}
      initialContent={props.initialContent}
      initialTradition={props.initialTradition}
      initialTopic={props.initialTopic}
      initialTags={props.initialTags}
      publishedPostId={publishedPostId}
      onPublish={async ({ title, content, tradition, topic, tags }) => {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            type: 'TEXT',
            tradition: tradition ?? null,
            topic,
            mediaUrls: [],
          }),
        });
        if (!res.ok) {
          // Mantém o draft — usuário pode tentar de novo
          const detail = await res.json().catch(() => null);
          const msg = detail?.error?.message ?? `HTTP ${res.status}`;
          throw new Error(msg);
        }
        const json = await res.json();
        const postId: string = json?.data?.id;
        if (postId) setPublishedPostId(postId);

        // Apaga o draft (já virou post)
        await fetch(`/api/drafts/${props.draftId}`, { method: 'DELETE' });
        router.refresh();
        // title/tags ficam no draft — futuramente podemos mover pra Post
        void title;
        void tags;
      }}
      onScheduled={() => {
        router.refresh();
      }}
    />
  );
}
