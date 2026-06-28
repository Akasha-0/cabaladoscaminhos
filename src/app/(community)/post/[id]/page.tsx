'use client';

// ============================================================================
// POST DETAIL — /post/[id]
// ============================================================================
// Página de detalhe do post. Carrega:
//   - Post via GET /api/posts/[id]
//   - Árvore de comentários via GET /api/posts/[id]/comments?tree=true
//   - Renderiza PostCard + CommentThread (max 3 níveis, @mentions linkadas)
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { PostCard } from '@/components/community/PostCard';
import { CommentThread } from '@/components/community/CommentThread';
import { ReadProgressBar } from '@/components/community/ReadProgressBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLikePost } from '@/hooks/usePosts';
import type { ApiResponse, Comment, Post, LikeResponse } from '@/types/community';
import { formatMention, extractMentions } from '@/lib/utils/format-mention';

const MAX_COMMENT = 2000;

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id ?? '';

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  // Like (otimista via hook)
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { toggleLike } = useLikePost({
    posts: post ? [post] : [],
    updatePost: (id, partial) => {
      if (id === post?.id) {
        setLiked(Boolean(partial.liked));
        if (typeof partial.likesCount === 'number') {
          setLikesCount(partial.likesCount);
        }
      }
    },
  });

  const handleLike = useCallback(
    (id: string) => {
      void toggleLike(id);
    },
    [toggleLike]
  );

  // Fetch do post + árvore de comentários
  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${postId}`, {
            signal: ac.signal,
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`/api/posts/${postId}/comments?tree=true&limit=20`, {
            signal: ac.signal,
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        const postJson = (await postRes.json().catch(() => null)) as
          | ApiResponse<Post>
          | null;
        const commentsJson = (await commentsRes.json().catch(() => null)) as
          | ApiResponse<{ comments: Comment[]; nextCursor: string | null }>
          | null;

        if (cancelled) return;

        if (!postRes.ok || !postJson?.data) {
          setError(
            postJson?.error?.message ?? `Post não encontrado (HTTP ${postRes.status})`
          );
          setLoading(false);
          return;
        }

        setPost(postJson.data);
        setLiked(Boolean(postJson.data.liked));
        setLikesCount(postJson.data.likesCount);
        setComments(commentsJson?.data?.comments ?? []);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const e = err as { name?: string };
        if (e.name === 'AbortError') return;
        console.error('[post page] load failed', err);
        setError('Não foi possível carregar o post.');
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [postId]);

  // Submit de comentário top-level
  const handleSubmit = useCallback(async () => {
    const text = newComment.trim();
    if (!text || !postId) return;
    setSubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const json = (await res.json().catch(() => null)) as
        | ApiResponse<Comment>
        | null;
      if (!res.ok || !json?.data) {
        setCommentError(json?.error?.message ?? 'Erro ao enviar comentário');
        return;
      }
      setComments((prev) => [json.data!, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('[post page] submit failed', err);
      setCommentError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setSubmitting(false);
    }
  }, [newComment, postId]);

  // Handler de reply dentro da thread
  const handleReply = useCallback(
    async (parentId: string, content: string): Promise<Comment | null> => {
      try {
        const res = await fetch(
          `/api/posts/${postId}/comments/${parentId}/reply`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          }
        );
        const json = (await res.json().catch(() => null)) as
          | ApiResponse<Comment>
          | null;
        if (!res.ok || !json?.data) return null;

        const created = json.data!;
        // Inserir na árvore (recursivamente sob o parent)
        setComments((prev) => insertReplyDeep(prev, parentId, created));
        return created;
      } catch {
        return null;
      }
    },
    [postId]
  );

  if (loading) {
    return (
      <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 py-8 focus:outline-none">
        <div className="flex items-center justify-center min-h-[40vh] text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Carregando post…
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 py-8 focus:outline-none">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/feed')}
          className="min-h-[44px] mb-4 text-slate-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar ao feed
        </Button>
        <Card className="bg-slate-900/40 border-slate-800/50">
          <CardContent className="p-6 text-center">
            <p className="text-slate-300">{error ?? 'Post não encontrado.'}</p>
            <Link
              href="/feed"
              className="inline-block mt-4 text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline min-h-[44px] leading-[44px]"
            >
              Voltar ao feed
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Adapta o Post p/ shape esperado pelo PostCard (likes vindos de estado local)
  const postForCard: Post = {
    ...post,
    liked,
    likesCount,
  };

  return (
    <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4 focus:outline-none">
      <ReadProgressBar postId={postId} articleSelector="article[data-post-content]" mode="sticky" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/feed')}
        className="min-h-[44px] text-slate-300 hover:text-amber-300"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Feed
      </Button>

      <article data-post-content>
      <PostCard
        post={postForCard}
        currentUserId={currentUserId}
        onLike={handleLike}
        onComment={() => {
          /* scroll já é feito pelo PostCard */
        }}
      />
      </article>

      {/* Composer */}
      <Card className="bg-slate-900/40 border-slate-800/50">
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MessageCircle className="w-4 h-4" />
            <span>Adicionar comentário</span>
          </div>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário… use @handle para mencionar"
            maxLength={MAX_COMMENT}
            rows={3}
            className="min-h-[44px] bg-slate-950/60 border-slate-700/60 focus-visible:ring-amber-500/40"
            disabled={submitting}
          />
          {/* Preview com menções formatadas */}
          {newComment.trim() && (
            <div className="rounded-md border border-slate-800/60 bg-slate-950/40 p-3 text-sm text-slate-200 whitespace-pre-wrap break-words">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                Preview
              </p>
              {formatMention(newComment, {
                className:
                  'text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline font-medium',
              })}
              {extractMentions(newComment).length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Vai notificar:{' '}
                  {extractMentions(newComment)
                    .map((h) => `@${h}`)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              {newComment.length}/{MAX_COMMENT}
            </span>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || newComment.trim().length === 0}
              className="min-h-[44px] px-4 bg-amber-500 hover:bg-amber-400 text-slate-950"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando…
                </>
              ) : (
                'Comentar'
              )}
            </Button>
          </div>
          {commentError && (
            <p role="alert" className="text-xs text-red-400">
              {commentError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Thread (árvore) */}
      <section id="comments" aria-label="Comentários" className="space-y-2 scroll-mt-20">
        <h2 className="text-sm font-medium text-slate-300 px-1">
          {comments.length === 0
            ? 'Sem comentários'
            : `${comments.length} comentário${comments.length === 1 ? '' : 's'}`}
        </h2>
        <CommentThread
          comments={comments}
          postId={postId}
          currentUserId={currentUserId}
          onReply={handleReply}
        />
      </section>
    </main>
  );
}

// ============================================================================
// Helper — insere reply na posição correta da árvore (DFS)
// ============================================================================

function insertReplyDeep(list: Comment[], parentId: string, reply: Comment): Comment[] {
  return list.map((c) => {
    if (c.id === parentId) {
      return {
        ...c,
        replies: [...(c.replies ?? []), reply],
      };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: insertReplyDeep(c.replies, parentId, reply) };
    }
    return c;
  });
}
