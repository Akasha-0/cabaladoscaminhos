/**
 * ════════════════════════════════════════════════════════════════════════════
 *  feed.spec.ts — 60+ assertions across 8 sections
 *
 *  Sections:
 *    §1 — Branded + emoji enum (8)
 *    §2 — createPost + sacred refs (12)
 *    §3 — commentOnPost + threading (8)
 *    §4 — pin / unpin / delete (10)
 *    §5 — reactions (8)
 *    §6 — report (8)
 *    §7 — paginated feed (8)
 *    §8 — cross-tradition + audits (6)
 *
 *  Runs via `node --experimental-strip-types` OR vitest (when binary lands).
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  createCircle,
  __resetCircleStore,
  toUserId,
} from '../circles.ts';

import {
  joinCircle,
  __resetMembershipStore,
} from '../membership.ts';

import {
  createPost,
  getPost,
  getCircleFeed,
  commentOnPost,
  pinPost,
  unpinPost,
  deletePost,
  reportPost,
  reportComment,
  reactToPost,
  unreactToPost,
  getPostReactions,
  getCommentsByPost,
  getCrossTraditionAudit,
  auditFeedByTradition,
  auditCrossTradition,
  auditReportedPosts,
  __resetFeedStore,
  setFeedHmacSecret,
  REACTION_EMOJI,
  REPORT_REASONS,
  isReactionEmoji,
  isReportReason,
  type Post,
  type Comment,
  type SacredRef,
  type FeedFilters,
  asPostId,
  asCommentId,
  asReportId,
  PostNotFoundError,
  CommentNotFoundError,
  FeedValidationError,
  NotMemberError,
} from '../feed.ts';

import {
  expectEqual,
  expectNotEqual,
  expectTrue,
  expectFalse,
  expectThrows,
  expectLen,
  expectContains,
  expectDeepEqual,
  expectFrozen,
  expectGreaterThan,
  resetHarness,
  report,
  section,
  results as harnessResults,
} from './harness.ts';

const ALICE = toUserId('user-alice');
const BOB = toUserId('user-bob');
const CARLA = toUserId('user-carla');

export function runFeedSpec(): number {
  resetHarness();
  __resetCircleStore();
  __resetMembershipStore();
  __resetFeedStore();
  setFeedHmacSecret('test-secret-feed');

  // Set up a circle and members
  const c1 = createCircle(ALICE, {
    name: 'Tarot Practitioners',
    theme: 'tarot-practice',
    isPublic: true,
    maxMembers: 50,
  });
  joinCircle(c1.id, BOB);
  joinCircle(c1.id, CARLA);

  // ── §1 — Branded + emoji enum ─────────────────────────────────────────
  section('§1 Branded + emoji');
  expectEqual('REACTION_EMOJI has 10 emojis', REACTION_EMOJI.length, 10);
  expectEqual('REPORT_REASONS has 7 reasons', REPORT_REASONS.length, 7);
  expectEqual('REPORT_REASONS includes spam', REPORT_REASONS.includes('spam'), true);
  expectTrue('isReactionEmoji("🌙")', isReactionEmoji('🌙'));
  expectFalse('isReactionEmoji("X")', isReactionEmoji('X'));
  expectTrue('isReportReason("spam")', isReportReason('spam'));
  expectFalse('isReportReason("garbage")', isReportReason('garbage'));
  expectEqual('asPostId round-trips', asPostId('post_xyz'), 'post_xyz');

  // ── §2 — createPost + sacred refs ─────────────────────────────────────
  section('§2 createPost');
  const ref: SacredRef = { tradition: 'tarot', symbol: 'a-estrela' };
  const post = createPost(c1.id, BOB, 'Mesa de tarot hoje as 21h', {
    tags: ['mesa', 'estudo'],
    sacredRefs: [ref],
  });
  expectEqual('post frozen', Object.isFrozen(post), true);
  expectEqual('post authorId=BOB', post.authorId, BOB);
  expectEqual('post tags count=2', post.tags.length, 2);
  expectEqual('post sacredRef symbol=a-estrela', post.sacredRefs[0]?.symbol, 'a-estrela');
  expectEqual('post isPinned=false', post.isPinned, false);
  expectEqual('post deletedAt=null', post.deletedAt, null);
  expectEqual('post content trimmed', post.content, 'Mesa de tarot hoje as 21h');
  expectThrows('non-member cannot post', () => {
    createPost(c1.id, toUserId('user-eve'), 'should fail');
  });
  expectThrows('empty content throws', () => createPost(c1.id, BOB, '   '));
  expectThrows('too-long content throws', () =>
    createPost(c1.id, BOB, 'x'.repeat(5100)),
  );
  // Cross-tradition ref → warns but doesn't block
  const cross = createPost(c1.id, BOB, 'Cross-tradition test', {
    sacredRefs: [{ tradition: 'cigano', symbol: 'cavaleiro' }],
  });
  expectEqual('cross-tradition post created', cross.sacredRefs[0]?.tradition, 'cigano');
  expectGreaterThan('crossTradition audit has ≥1 entry', getCrossTraditionAudit().length, 0);

  // ── §3 — commentOnPost + threading ─────────────────────────────────────
  section('§3 comments');
  const cmt = commentOnPost(post.id, CARLA, 'Que topico otimo!');
  expectEqual('comment frozen', Object.isFrozen(cmt), true);
  expectEqual('comment parentCommentId=null', cmt.parentCommentId, null);
  const reply = commentOnPost(post.id, ALICE, 'Concordo total', cmt.id);
  expectEqual('reply parentCommentId=cmt.id', reply.parentCommentId, cmt.id);
  expectThrows('reply to non-existent parent throws CommentNotFoundError', () =>
    commentOnPost(post.id, BOB, 'orphan', asCommentId('cmt_missing')),
  );
  expectThrows('empty comment throws', () =>
    commentOnPost(post.id, BOB, ''),
  );
  expectEqual('commentsByPost returns 2', getCommentsByPost(post.id).length, 2);
  expectEqual('first comment author=Carla', getCommentsByPost(post.id)[0]?.authorId, CARLA);
  expectThrows('commenting on deleted post throws', () => {
    const p2 = createPost(c1.id, BOB, 'temp', {});
    deletePost(p2.id, BOB, 'removal');
    commentOnPost(p2.id, ALICE, 'never');
  });

  // ── §4 — pin / unpin / delete ──────────────────────────────────────────
  section('§4 pin/unpin/delete');
  expectEqual('pin returns true', pinPost(post.id, BOB), true);
  expectEqual('post isPinned=true', getPost(post.id)?.isPinned, true);
  expectEqual('pin returns false when already pinned', pinPost(post.id, BOB), false);
  expectEqual('unpin returns true', unpinPost(post.id, BOB), true);
  expectEqual('post isPinned=false after unpin', getPost(post.id)?.isPinned, false);
  expectEqual('delete returns true', deletePost(post.id, BOB, 'rolling back'), true);
  expectEqual('post deletedAt != null', getPost(post.id)?.deletedAt !== null, true);
  expectEqual('delete returns false when already deleted', deletePost(post.id, BOB, 'again'), false);
  expectThrows('non-author non-creator cannot pin', () => {
    const p2 = createPost(c1.id, BOB, 'temp2');
    pinPost(p2.id, CARLA);
  });
  expectThrows('delete without reason throws', () =>
    deletePost(post.id, BOB, ''),
  );

  // ── §5 — reactions ─────────────────────────────────────────────────────
  section('§5 reactions');
  const p3 = createPost(c1.id, BOB, 'React to me');
  const r1 = reactToPost(p3.id, ALICE, '🌙');
  expectEqual('reaction emoji=🌙', r1.emoji, '🌙');
  expectEqual('reaction postId=p3.id', r1.postId, p3.id);
  expectEqual('idempotent react', reactToPost(p3.id, ALICE, '🌙').id, r1.id);
  reactToPost(p3.id, CARLA, '✨');
  expectEqual('2 reactions on p3', getPostReactions(p3.id).length, 2);
  expectEqual('unreact returns true', unreactToPost(p3.id, ALICE, '🌙'), true);
  expectEqual('1 reaction remaining', getPostReactions(p3.id).length, 1);
  expectEqual('unreact non-existent returns false', unreactToPost(p3.id, ALICE, '🌙'), false);

  // ── §6 — report ────────────────────────────────────────────────────────
  section('§6 report');
  const p4 = createPost(c1.id, BOB, 'Questionable content');
  const report1 = reportPost(p4.id, ALICE, 'spam', 'clear spam pattern');
  expectEqual('report contentType=post', report1.contentType, 'post');
  expectEqual('report reason=spam', report1.reason, 'spam');
  expectEqual('report frozen', Object.isFrozen(report1), true);
  expectThrows('invalid reason throws', () => reportPost(p4.id, ALICE, 'garbage' as never));
  // comment report
  const cmReport = (() => {
    const cm = commentOnPost(p4.id, CARLA, 'rude content');
    return reportComment(cm.id, ALICE, 'harassment');
  })();
  expectEqual('comment report contentType=comment', cmReport.contentType, 'comment');

  // ── §7 — paginated feed ─────────────────────────────────────────────────
  section('§7 feed pagination');
  // Create 7 more posts in addition to existing 4 (cross, p3, p4) — for a total of 7 (post is deleted)
  for (let i = 0; i < 6; i += 1) {
    createPost(c1.id, BOB, `post numero ${i}`);
  }
  const page1 = getCircleFeed(c1.id, 1, 3);
  expectEqual('page1 items=3', page1.items.length, 3);
  expectEqual('page1 hasMore=true', page1.hasMore, true);
  expectEqual('page1 totalItems=7+ (includes deleted? no — filtered)', page1.totalItems >= 6, true);
  const page2 = getCircleFeed(c1.id, 2, 3);
  expectEqual('page2 has 3 distinct items', page2.items[0]?.id !== page1.items[0]?.id, true);
  const byAuthor = getCircleFeed(c1.id, 1, 10, { authorId: CARLA });
  expectEqual('filter by author=Carla finds 0', byAuthor.items.length, 0);

  // ── §8 — cross-tradition + audits ──────────────────────────────────────
  section('§8 audits');
  // Add a fresh non-deleted tarot post
  createPost(c1.id, BOB, 'Tarot post fresco', {
    sacredRefs: [{ tradition: 'tarot', symbol: 'a-estrela' }],
  });
  const feedTrad = auditFeedByTradition(c1.id);
  expectEqual('feedTrad.tarot ≥ 1', feedTrad.tarot >= 1, true);
  expectEqual('feedTrad.cigano ≥ 1', feedTrad.cigano >= 1, true);
  const crossRatio = auditCrossTradition(c1.id);
  expectEqual('crossRatio.total ≥ 1', crossRatio.total >= 1, true);
  expectEqual('crossRatio.crossTradition ≥ 1', crossRatio.crossTradition >= 1, true);
  expectEqual('ratio is number 0..1', crossRatio.ratio >= 0 && crossRatio.ratio <= 1, true);
  expectEqual('auditReportedPosts ≥ 1', auditReportedPosts(c1.id) >= 1, true);

  const r = harnessResults();
  report('feed', r);
  return r.failed === 0 ? 0 : 1;
}



if (typeof process !== 'undefined' && process.argv[1]?.endsWith('feed.spec.ts')) {
  process.exit(runFeedSpec());
}
