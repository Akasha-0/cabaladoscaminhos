/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — COMMENTS THREAD COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mobile-first, ARIA-compliant thread UI. Used by the /posts/[id] demo page
 * AND can be embedded anywhere a thread should render.
 *
 * Architecture:
 *   - Thread (this file)        — list root + state management
 *   - CommentBubble             — single comment rendering + actions
 *   - Composer                  — body input + mention autocomplete + LGPD
 *
 * Data flow:
 *   - On mount, Thread fetches `engine.listThread(postId, viewerId)` and
 *     stores it in `thread` state.
 *   - Successful add / edit / delete → refresh() → setThread(t).
 *   - Reply form is collapsed by default; only one open at a time via
 *     `openReplyId` state.
 *
 * Sacred-cultural sensitivity: Sacred terms (Orixá, Caboclo, etc) pass
 * through unchanged — body content is NEVER renormalized by this component.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createCommentsEngine,
} from '@/engine/comments/factory';
import {
  createInMemoryCommentsAdapter,
  getKnownHandlesSet,
} from '@/engine/comments/adapter-memory';
import { asPostId, asUserId, type CommentsEngine, type ThreadNode, type UserId } from '@/engine/comments/types';

import { Composer } from './Composer';
import { formatTimeAgo, renderBodyWithMentions, STYLES } from './helpers';

// ────────────────────────────────────────────────────────────────────────────
// CommentBubble
// ────────────────────────────────────────────────────────────────────────────

interface CommentBubbleProps {
  node: ThreadNode;
  viewerId: UserId;
  engine: CommentsEngine;
  onReplyAdded: () => void;
  onError: (msg: string) => void;
  openReplyId: string | null;
  setOpenReplyId: (id: string | null) => void;
}

function CommentBubble({
  node,
  viewerId,
  engine,
  onReplyAdded,
  onError,
  openReplyId,
  setOpenReplyId,
}: CommentBubbleProps) {
  const formId = `reply-form-${node.id}`;
  const isOpen = openReplyId === node.id;
  const isOwn = node.authorId === viewerId;
  const isDeleted = node.status === 'deleted';
  const isRoot = node.depth === 0;

  const toggle = useCallback(() => {
    setOpenReplyId(isOpen ? null : node.id);
  }, [isOpen, node.id, setOpenReplyId]);

  const onDelete = useCallback(async () => {
    try {
      await engine.deleteComment(node.id);
      onReplyAdded();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro');
    }
  }, [engine, node.id, onReplyAdded, onError]);

  return (
    <li
      role="listitem"
      data-testid="comment-bubble"
      data-comment-id={node.id}
    >
      <article style={isRoot ? STYLES.bubble : STYLES.reply}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            opacity: 0.75,
            marginBottom: 6,
          }}
        >
          <span>
            <strong>{node.authorId}</strong>
            <span style={{ marginLeft: 6 }}>{formatTimeAgo(node.createdAt)}</span>
            {node.editedAt ? (
              <span style={{ marginLeft: 6, fontStyle: 'italic' }}>(editado)</span>
            ) : null}
          </span>
          <span data-depth={node.depth}>depth {node.depth}</span>
        </header>
        <div style={{ fontSize: 15, lineHeight: 1.4 }}>
          {isDeleted ? (
            <em style={{ opacity: 0.6 }}>[comentário removido]</em>
          ) : (
            renderBodyWithMentions(node.body)
          )}
        </div>
        {isRoot && !isDeleted ? (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={STYLES.btn}
              onClick={toggle}
              aria-expanded={isOpen}
              aria-controls={formId}
              data-testid="reply-toggle"
            >
              {isOpen ? 'Fechar resposta' : 'Responder'}
            </button>
            {isOwn ? (
              <button
                type="button"
                style={STYLES.btn}
                onClick={() => void onDelete()}
                data-testid="comment-delete"
              >
                Apagar
              </button>
            ) : null}
          </div>
        ) : null}
        {isRoot && isOpen && !isDeleted ? (
          <Composer
            formId={formId}
            mode="reply"
            knownHandles={engine.knownHandles()}
            isFirstComment={false}
            onSubmit={async (sanitized) => {
              await engine.addComment(
                node.postId,
                viewerId,
                sanitized,
                node.id,
                true,
              );
              onReplyAdded();
            }}
            onError={onError}
          />
        ) : null}
      </article>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Thread root
// ────────────────────────────────────────────────────────────────────────────

export interface ThreadProps {
  postId: string;
  viewerId: string;
  engine?: CommentsEngine;
  isFirstComment?: boolean;
}

export function Thread({
  postId,
  viewerId,
  engine,
  isFirstComment = true,
}: ThreadProps) {
  // One engine per mount. Default = in-memory + canonical seed.
  const finalEngine = useMemo<CommentsEngine>(
    () =>
      engine ??
      createCommentsEngine(
        createInMemoryCommentsAdapter(),
        getKnownHandlesSet,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [thread, setThread] = useState<ReadonlyArray<ThreadNode>>([]);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const t = await finalEngine.listThread(
        asPostId(postId),
        asUserId(viewerId),
      );
      setThread(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar thread');
    }
  }, [finalEngine, postId, viewerId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <section aria-label="Comentários" data-testid="thread-section">
      {error ? (
        <div data-testid="thread-error" style={STYLES.errorBox} role="alert">
          {error}
        </div>
      ) : null}

      <Composer
        formId="root-comment"
        mode="root"
        knownHandles={finalEngine.knownHandles()}
        isFirstComment={isFirstComment}
        onSubmit={async (sanitized) => {
          await finalEngine.addComment(
            asPostId(postId),
            asUserId(viewerId),
            sanitized,
            null,
            true,
          );
          await refresh();
        }}
        onError={(m) => setError(m)}
      />

      <ol
        role="list"
        aria-label="Lista de comentários"
        style={STYLES.thread}
        data-testid="thread-list"
      >
        {thread.length === 0 ? (
          <li
            style={{ opacity: 0.7, padding: 12, textAlign: 'center' }}
            data-testid="thread-empty"
          >
            Quebre o silêncio ✨ — seja o primeiro a comentar.
          </li>
        ) : (
          thread.map((node) => (
            <CommentBubble
              key={node.id}
              node={node}
              viewerId={asUserId(viewerId)}
              engine={finalEngine}
              onReplyAdded={() => void refresh()}
              onError={(m) => setError(m)}
              openReplyId={openReplyId}
              setOpenReplyId={setOpenReplyId}
            />
          ))
        )}
      </ol>
    </section>
  );
}

export default Thread;
