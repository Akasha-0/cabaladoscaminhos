// index.ts — public surface of the comments engine.

export type {
  Brand,
  PostId,
  CommentId,
  UsuarioId,
  MentionHandle,
  Usuario,
  Post,
  Comment,
  CommentTreeNode,
  Notificacao,
  CommentsAdapter,
  MentionsAdapter,
  Tradicao,
} from './types.ts';

export {
  asPostId,
  asCommentId,
  asUsuarioId,
  asMentionHandle,
  TRADICOES,
  TRADICAO_EMOJI,
  MAX_THREAD_DEPTH,
} from './types.ts';

export {
  htmlEscape,
  extractMentions,
  resolveMentions,
  detectActiveMentionPrefix,
  matchSuggestions,
  applyMentionPick,
  renderBodyWithMentions,
} from './mentions.ts';
export type { ExtractedMention, SuggestionMatch } from './mentions.ts';

export {
  SAMPLE_USUARIOS,
  createInMemoryMentionsAdapter,
  defaultMentionsAdapter,
} from './InMemoryMentionsAdapter.ts';

export {
  createInMemoryCommentsAdapter,
  defaultCommentsAdapter,
  SAMPLE_POST_FOR_TEST,
  SAMPLE_COMMENT_SEEDS_FOR_TEST,
  autorHandleFor,
} from './InMemoryCommentsAdapter.ts';
export type { InMemoryCommentsAdapterOptions } from './InMemoryCommentsAdapter.ts';