// index.ts — public surface for the comments UI package.

export type {
  MentionSuggestionsProps,
} from './MentionSuggestions.ts';
export { MentionSuggestions } from './MentionSuggestions.ts';

export type {
  CommentComposerProps,
} from './CommentComposer.ts';
export { CommentComposer } from './CommentComposer.ts';

export type {
  CommentNodeProps,
} from './CommentNode.ts';
export { CommentNode } from './CommentNode.ts';

export type {
  ThreadedCommentsProps,
} from './ThreadedComments.ts';
export { ThreadedComments } from './ThreadedComments.ts';

export type {
  PostDetailPageProps,
  StatefulPostDetailPageOptions,
  StatefulPostDetailPageState,
} from './PostDetailPage.ts';
export {
  PostDetailPage,
  createInitialState,
  recomputeSuggestions,
} from './PostDetailPage.ts';