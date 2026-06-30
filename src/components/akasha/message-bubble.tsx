// ============================================================================
// src/components/akasha/message-bubble.tsx
// ============================================================================
// Single chat turn. Composes:
//   - markdown renderer (no deps) → safe HTML
//   - sacred-tag parser → React elements interleaved at the right offsets
//   - citation chips → collapsible list below the body
//   - typing cursor (only for the in-flight assistant turn)
//
// The component is "dumb" — it receives a fully-formed `AkashaMessage`
// and the streaming flag. The chat page owns state via the
// `useAkashaStream` hook (which already exists at
// `src/hooks/use-akasha-stream.ts`).
//
// A11y:
//   - `aria-live="polite"` for assistant bubbles (so screen readers
//     announce the streaming text without interrupting).
//   - Citations use `<button>` with `aria-expanded`.
//   - Sacred tag pills are real buttons when interactive.
// ============================================================================

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CitationChip } from './citation-chip.tsx';
import { SacredTagPill } from './sacred-tag-pill.tsx';
import { TypingCursor } from './typing-cursor.tsx';
import {
  renderWithTags,
  type TagSegment,
} from '@/lib/akasha-ui/markdown-renderer.ts';
import type { AkashaMessage, Citation, SacredTag } from '@/lib/akasha-ui/types.ts';

export interface MessageBubbleProps {
  message: AkashaMessage;
  /** True while this bubble is the one being streamed. Renders the cursor. */
  isStreaming?: boolean;
  /** Optional click handler for sacred tag pills. */
  onTagClick?: (tag: SacredTag) => void;
  /** Optional click handler for citations. */
  onCitationClick?: (citation: Citation) => void;
}

function BubbleBody({
  segments,
  onTagClick,
}: {
  segments: TagSegment[];
  onTagClick?: (tag: SacredTag) => void;
}) {
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.kind === 'html') {
          return (
            <span
              key={i}
              // The HTML is escaped + only our own tags survive (see
              // markdown-renderer.ts:isSafeUrl). Safe to inject.
              dangerouslySetInnerHTML={{ __html: seg.payload as string }}
            />
          );
        }
        // Tag segment
        const tag = seg.payload as SacredTag;
        return (
          <SacredTagPill
            key={`tag-${i}-${tag.kind}-${tag.label}`}
            tag={tag}
            onClick={onTagClick}
          />
        );
      })}
    </>
  );
}

export function MessageBubble({
  message,
  isStreaming = false,
  onTagClick,
  onCitationClick,
}: MessageBubbleProps): React.ReactElement {
  const isUser = message.role === 'user';

  // Render markdown + extract tag placeholders ONCE per message.
  const segments = useMemo(() => {
    if (isUser) return null;
    return renderWithTags(message.content);
  }, [isUser, message.content]);

  return (
    <article
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
      aria-label={isUser ? 'Sua mensagem' : 'Resposta da Akasha'}
    >
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-4 py-3 text-sm md:text-base',
          isUser
            ? 'bg-amber-500/15 text-slate-50 ring-1 ring-amber-400/30'
            : message.error
              ? 'bg-red-950/30 text-red-100 ring-1 ring-red-800/40'
              : 'bg-slate-800/60 text-slate-100 ring-1 ring-slate-700/50',
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div
            className="break-words leading-relaxed"
            aria-live={isStreaming ? 'polite' : 'off'}
            aria-atomic="false"
          >
            {segments && <BubbleBody segments={segments} onTagClick={onTagClick} />}
            {isStreaming && <TypingCursor />}
          </div>
        )}

        {/* Citations (assistant only) */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div
            className="mt-3 flex flex-col gap-1.5 border-t border-slate-700/40 pt-2"
            role="list"
            aria-label="Citações da resposta"
          >
            {message.citations.map((c) => (
              <CitationChip
                key={c.id}
                citation={c}
                onClick={onCitationClick}
                initiallyExpanded={false}
              />
            ))}
          </div>
        )}

        {/* Footer: model + took_ms */}
        {!isUser && !message.error && message.meta && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-slate-900/50 px-2 py-0.5">
              {message.meta.model}
            </span>
            <span aria-hidden>·</span>
            <span>{message.meta.took_ms}ms</span>
            {message.meta.deep_mode && (
              <>
                <span aria-hidden>·</span>
                <span className="rounded-full bg-purple-900/40 px-2 py-0.5 text-purple-200">
                  profundo
                </span>
              </>
            )}
            {message.meta.rag_degraded && (
              <>
                <span aria-hidden>·</span>
                <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-amber-200">
                  RAG reduzido
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default MessageBubble;
