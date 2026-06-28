'use client';

// ============================================================================
// CommentReactionBar — Variante inline compacta para comments
// ============================================================================
// Wrapper fino sobre ReactionBar com variant="comment". Compartilha lógica
// de toggle, optimistic update, fetch inicial. Mantém tamanho compacto
// para caber ao lado do botão "Responder".
// ============================================================================

import React from 'react';
import { ReactionBar } from './ReactionBar';
import type { ReactionAggregate } from '@/lib/community/reactions';

export interface CommentReactionBarProps {
  commentId: string;
  isAuthenticated: boolean;
  initialReactions?: ReactionAggregate[];
  className?: string;
}

export function CommentReactionBar({
  commentId,
  isAuthenticated,
  initialReactions,
  className,
}: CommentReactionBarProps) {
  return (
    <ReactionBar
      targetType="COMMENT"
      targetId={commentId}
      isAuthenticated={isAuthenticated}
      initialReactions={initialReactions}
      variant="comment"
      className={className}
    />
  );
}