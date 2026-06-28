'use client';

// ============================================================================
// CommentThread — Renderiza árvore de comentários com @mentions + replies
// ============================================================================
// Estratégia:
//   - Componente recursivo, com profundidade máxima `maxDepth=3` (UI).
//   - Estado de "reply aberto" por comentário (apenas 1 aberto por vez).
//   - Submissão via endpoint dedicado `POST /api/posts/[id]/comments/[commentId]/reply`
//     OU reuso do endpoint flat com `parentId`. O hook useComments propaga
//     o novo reply na árvore local sem refetch.
//   - 44px touch targets (botões "Responder" / "Enviar" / textarea min-h).
//   - Mobile-first: padding consistente, foco visível, scroll-snap no textarea.
// ============================================================================

import React, { useCallback, useState } from 'react';
import { MessageCircle, CornerDownRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMention, extractMentions } from '@/lib/utils/format-mention';
import type { Comment } from '@/types/community';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FlagButton } from '@/components/moderation/FlagButton';
import { CommentReactionBar } from '@/components/community/CommentReactionBar';
import { useHaptic } from '@/hooks/useHaptic';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const MAX_DEPTH = 3;
const MAX_CONTENT = 2000;

export interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  currentUserId?: string | null;
  /** Callback opcional pra criar reply (default: usa endpoint). */
  onReply?: (parentId: string, content: string) => Promise<Comment | null>;
  /** Limite de profundidade (default 3 — não muda sem revisar UI). */
  maxDepth?: number;
  /** Empty state customizado. */
  emptyState?: React.ReactNode;
}

export function CommentThread({
  comments,
  postId,
  currentUserId,
  onReply,
  maxDepth = MAX_DEPTH,
  emptyState,
}: CommentThreadProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        {emptyState ?? 'Nenhum comentário ainda. Quebre o silêncio ✨'}
      </div>
    );
  }

  return (
    <ol className="space-y-3" aria-label="Comentários">
      {comments.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          depth={1}
          maxDepth={maxDepth}
          postId={postId}
          currentUserId={currentUserId}
          onReply={onReply}
        />
      ))}
    </ol>
  );
}

// ============================================================================
// CommentNode — recursivo (até maxDepth)
// ============================================================================

interface CommentNodeProps {
  comment: Comment;
  depth: number;
  maxDepth: number;
  postId: string;
  currentUserId?: string | null;
  onReply?: (parentId: string, content: string) => Promise<Comment | null>;
}

function CommentNode({
  comment,
  depth,
  maxDepth,
  postId,
  currentUserId,
  onReply,
}: CommentNodeProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [optimisticReplies, setOptimisticReplies] = useState<Comment[]>([]);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const { light: lightHaptic, success: successHaptic, error: errorHaptic } = useHaptic();
  const { tap: tapSound, submit: submitSound, success: successSound, error: errorSound } = useSoundEffects();

  const replies: Comment[] = [
    ...(comment.replies ?? []),
    ...optimisticReplies,
  ];
  const optimisticIds = React.useMemo(
    () => new Set(optimisticReplies.map((r) => r.id)),
    [optimisticReplies]
  );

  const initials = (comment.author.displayName || 'AN')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  const handleSubmitReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text) return;
    lightHaptic();
    submitSound();
    setSubmitting(true);
    setLocalError(null);
    try {
      const created = onReply
        ? await onReply(comment.id, text)
        : await postReply(postId, comment.id, text);

      if (created) {
        setOptimisticReplies((prev) => [...prev, created]);
        setJustAddedId(created.id);
        setReplyText('');
        setReplyOpen(false);
        successHaptic();
        successSound();
        // Clear slide-in flag após animação (~600ms)
        window.setTimeout(() => setJustAddedId(null), 700);
      } else {
        setLocalError('Não foi possível enviar. Tente novamente.');
        errorHaptic();
        errorSound();
      }
    } catch (err) {
      console.error('[CommentThread] reply failed', err);
      setLocalError(err instanceof Error ? err.message : 'Erro de rede');
      errorHaptic();
      errorSound();
    } finally {
      setSubmitting(false);
    }
  }, [comment.id, onReply, postId, replyText, lightHaptic, submitSound, successHaptic, successSound, errorHaptic, errorSound]);

  const indentPx = depth === 1 ? 0 : Math.min((depth - 1) * 16, 32);
  const atMaxDepth = depth >= maxDepth;

  return (
    <li
      id={`comment-${comment.id}`}
      className={cn(
        'rounded-lg border border-slate-800/60 bg-slate-900/30 p-3 sm:p-4',
        depth > 1 && 'border-l-2 border-l-amber-500/30'
      )}
      style={{ marginLeft: indentPx }}
    >
      <header className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-xs">
            {initials || 'AN'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-medium text-slate-100 text-sm truncate">
              {comment.author.displayName}
            </span>
            <span className="text-xs text-slate-500 truncate">
              @{comment.author.handle} · {formatRelative(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-200 whitespace-pre-wrap break-words">
            {formatMention(comment.content, {
              className:
                'text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline font-medium',
            })}
          </p>

          {/* Ações — 44px touch targets */}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-md text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800/50 active:bg-slate-800 transition-colors"
              aria-expanded={replyOpen}
              aria-controls={`reply-form-${comment.id}`}
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>{replyOpen ? 'Cancelar' : 'Responder'}</span>
            </button>
            <span className="text-xs text-slate-500">
              {comment.likesCount > 0 ? `· ${comment.likesCount} curtidas` : ''}
            </span>
            {currentUserId !== comment.author.id && (
              <span className="ml-auto">
                <FlagButton
                  targetType="COMMENT"
                  targetId={comment.id}
                  label="Denunciar"
                />
              </span>
            )}
          </div>

          {/* Reactions — emoji universalista, variante inline compacta */}
          <div className="mt-1.5">
            <CommentReactionBar
              commentId={comment.id}
              isAuthenticated={Boolean(currentUserId)}
            />
          </div>

          {/* Reply form */}
          {replyOpen && (
            <div
              id={`reply-form-${comment.id}`}
              className="mt-2 space-y-2"
            >
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Responder @${comment.author.handle}…`}
                maxLength={MAX_CONTENT}
                rows={2}
                className="min-h-[44px] text-sm bg-slate-950/60 border-slate-700/60 focus-visible:ring-amber-500/40"
                disabled={submitting}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {replyText.length}/{MAX_CONTENT}
                </span>
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting || replyText.trim().length === 0}
                  onClick={handleSubmitReply}
                  className="min-h-[44px] px-4 bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      Responder
                    </>
                  )}
                </Button>
              </div>
              {localError && (
                <p role="alert" className="text-xs text-red-400">
                  {localError}
                </p>
              )}
              {/* Preview de menções detectadas — feedback discreto */}
              {replyText && extractMentions(replyText).length > 0 && (
                <p className="text-xs text-slate-500">
                  Vai notificar:{' '}
                  {extractMentions(replyText)
                    .map((h) => `@${h}`)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Respostas aninhadas — recursivo até maxDepth */}
      {replies.length > 0 && (
        <ol className="mt-3 space-y-2" aria-label="Respostas">
          {replies.map((r) => {
            const isOptimistic = optimisticIds.has(r.id) || r.id === justAddedId;
            return atMaxDepth ? (
              // Colapsa excedente: mostra link para a sub-thread em página
              // própria (futuro) — por ora, renderiza inline mas avisa.
              <li
                key={r.id}
                className={cn(
                  'text-xs text-slate-500 pl-2 border-l border-slate-800',
                  isOptimistic && 'animate-slide-in-from-right'
                )}
              >
                <span className="italic">
                  @{r.author.handle}: {r.content.slice(0, 80)}
                  {r.content.length > 80 ? '…' : ''}
                </span>
              </li>
            ) : (
              <div
                key={r.id}
                className={cn(isOptimistic && 'animate-slide-in-from-right')}
              >
                <CommentNode
                  comment={r}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  postId={postId}
                  currentUserId={currentUserId}
                  onReply={onReply}
                />
              </div>
            );
          })}
        </ol>
      )}
    </li>
  );
}

// ============================================================================
// Default reply transport — POST /api/posts/[id]/comments/[commentId]/reply
// ============================================================================

async function postReply(
  postId: string,
  parentCommentId: string,
  content: string
): Promise<Comment | null> {
  try {
    const res = await fetch(
      `/api/posts/${postId}/comments/${parentCommentId}/reply`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }
    );
    const json = (await res.json().catch(() => null)) as
      | { data?: Comment; error?: { message?: string } }
      | null;
    if (!res.ok || !json?.data) {
      // Fallback: usa endpoint flat com parentId (compat)
      const fallback = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: parentCommentId }),
      });
      const fallbackJson = (await fallback.json().catch(() => null)) as
        | { data?: Comment; error?: { message?: string } }
        | null;
      if (!fallback.ok || !fallbackJson?.data) return null;
      return fallbackJson.data;
    }
    return json.data;
  } catch {
    return null;
  }
}

// ============================================================================
// Helper — tempo relativo curto (pt-BR)
// ============================================================================

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}sem`;
  const mo = Math.floor(day / 30);
  return `${mo}m`;
}
