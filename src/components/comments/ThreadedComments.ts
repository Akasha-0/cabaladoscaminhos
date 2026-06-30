// ThreadedComments.ts — recursive comment list, max 3 levels deep.
// Renders CommentNode + recurses into node.children up to depth 3.
// After depth 3, children are still rendered but they're all depth 3 (flattened).

import { h, type ComponentType } from './react-stubs.js';
import type {
  CommentTreeNode,
  Usuario,
} from '../../lib/engines/comments/index.ts';
import { CommentNode } from './CommentNode.ts';

export interface ThreadedCommentsProps {
  readonly roots: ReadonlyArray<CommentTreeNode>;
  readonly usuariosById: ReadonlyMap<string, Usuario>;
  readonly highlightedCommentId: string | null;
  readonly onReply: (commentId: string) => void;
}

function renderSubtree(
  nodes: ReadonlyArray<CommentTreeNode>,
  depth: number,
  props: ThreadedCommentsProps,
): ReadonlyArray<JSX.Element> {
  const out: JSX.Element[] = [];
  for (const n of nodes) {
    const autor = props.usuariosById.get(n.autorId) ?? null;
    const isHighlighted = props.highlightedCommentId === n.id;
    out.push(
      h(CommentNode, {
        key: n.id,
        node: n,
        autor,
        isHighlighted,
        onReply: props.onReply,
        mentionedAutorHandles: [],
      }),
    );
    if (n.children.length > 0 && depth < 3) {
      const sub = renderSubtree(n.children, depth + 1, props);
      out.push(
        h(
          'div',
          {
            key: n.id + '-children',
            className: 'threaded-comments-children',
            role: 'group',
            'aria-label': 'Respostas',
          },
          ...sub,
        ),
      );
    } else if (n.children.length > 0 && depth >= 3) {
      // Flatten — render children directly at the same visual depth.
      const flat = renderSubtree(n.children, 3, props);
      out.push(
        h(
          'div',
          {
            key: n.id + '-flat',
            className: 'threaded-comments-flattened',
            role: 'group',
            'aria-label': 'Respostas achatadas (limite de profundidade)',
          },
          ...flat,
        ),
      );
    }
  }
  return out;
}

export const ThreadedComments: ComponentType<ThreadedCommentsProps> = (props) => {
  const { roots, highlightedCommentId } = props;

  if (roots.length === 0) {
    return h(
      'div',
      {
        className: 'threaded-comments-empty',
        role: 'status',
        'aria-live': 'polite',
        style: {
          padding: '16px',
          textAlign: 'center',
          color: '#666',
        },
      },
      'Seja o primeiro a comentar.',
    );
  }

  const total = countNodes(roots);

  return h(
    'section',
    {
      className: 'threaded-comments',
      role: 'log',
      'aria-label': 'Comentários do post',
      'aria-live': 'polite',
      'aria-relevant': 'additions',
      'data-comment-count': total,
    },
    h(
      'h2',
      { className: 'threaded-comments-heading', style: { fontSize: '16px', margin: '12px 0' } },
      'Comentários (' + total + ')',
    ),
    h(
      'div',
      {
        className: 'threaded-comments-list',
        role: 'list',
      },
      ...renderSubtree(roots, 0, props),
    ),
    highlightedCommentId
      ? h(
          'div',
          {
            className: 'threaded-comments-jump',
            style: { fontSize: '12px', color: '#888' },
          },
          'Destacado: ' + highlightedCommentId,
        )
      : null,
  );
};

function countNodes(nodes: ReadonlyArray<CommentTreeNode>): number {
  let n = 0;
  for (const node of nodes) {
    n += 1 + countNodes(node.children);
  }
  return n;
}