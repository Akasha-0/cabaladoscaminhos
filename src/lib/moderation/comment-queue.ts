/**
 * Comment Moderation Queue (W24 stub)
 *
 * Minimal server-side helper to enqueue and moderate comments.
 * This is a PURE in-memory stub. Replace with a real persistence
 * layer + integration with Perspective API / community reports.
 */

// TODO(w24): integrate with real moderation API (Perspective API / community reports)

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface PendingComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  flagCount: number;
  status: CommentStatus;
}

/**
 * Enqueue a new pending comment. Stub: returns a fully-typed
 * PendingComment with defaults for id, status, flagCount, createdAt.
 */
export function enqueueComment(
  c: Omit<PendingComment, 'id' | 'status' | 'flagCount' | 'createdAt'>,
): PendingComment {
  return {
    ...c,
    id: crypto.randomUUID(),
    status: 'pending',
    flagCount: 0,
    createdAt: new Date(),
  };
}

/**
 * Moderate a comment. Stub: always returns true.
 */
export function moderateComment(
  id: string,
  action: 'approve' | 'reject',
): boolean {
  // TODO(w24): wire to real moderation API + persist status change
  void id;
  void action;
  return true;
}
