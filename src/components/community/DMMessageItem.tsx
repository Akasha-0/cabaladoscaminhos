'use client';

// ============================================================================
// DMMessageItem — Uma única linha de mensagem (W90s-B)
//
// Varia conforme direção:
//   - outgoing (me): alinhado à direita, fundo primary
//   - incoming (peer): alinhado à esquerda, fundo muted
//
// ARIA: role="article" com aria-label incluindo timestamp + status.
//
// data-testid:
//   - dm-message-item
//   - dm-message-bubble
//   - dm-message-status
//
// Sem emojis negativos / sem blame. Tudo respeitoso.
// ============================================================================

import React, { memo } from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { DMMessage } from '@/lib/w90s/dm-threads';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface DMMessageItemProps {
  readonly message: DMMessage;
  readonly currentUserId: string;
  readonly peerDisplayName: string;
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusIcon({ status }: { readonly status: DMMessage['status'] }) {
  if (status === 'sent') {
    return <Clock aria-hidden="true" className="size-3" />;
  }
  if (status === 'delivered') {
    return <Check aria-hidden="true" className="size-3" />;
  }
  return <CheckCheck aria-hidden="true" className="size-3" />;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
function DMMessageItemInner({ message, currentUserId, peerDisplayName }: DMMessageItemProps) {
  const isOutgoing = (message.senderId as unknown as string) === currentUserId;
  const ariaLabel = isOutgoing
    ? `Mensagem enviada às ${fmtTime(message.createdAt)} · status ${message.status}`
    : `Mensagem de ${peerDisplayName} às ${fmtTime(message.createdAt)}`;

  return (
    <article
      data-testid="dm-message-item"
      data-message-id={message.id}
      data-direction={isOutgoing ? 'outgoing' : 'incoming'}
      aria-label={ariaLabel}
      className={cn(
        'flex max-w-full',
        isOutgoing ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        data-testid="dm-message-bubble"
        className={cn(
          'max-w-[min(100%,420px)] rounded-2xl px-3 py-2 text-sm shadow-sm',
          isOutgoing
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm',
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.text}
        </p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] opacity-70">
          <time dateTime={new Date(message.createdAt).toISOString()}>{fmtTime(message.createdAt)}</time>
          {isOutgoing && (
            <span
              data-testid="dm-message-status"
              data-status={message.status}
              aria-label={`Status: ${message.status}`}
              className="inline-flex items-center gap-0.5"
            >
              <StatusIcon status={message.status} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export const DMMessageItem = memo(DMMessageItemInner);

export default DMMessageItem;
