/**
 * ════════════════════════════════════════════════════════════════════════════
 * W76-D — COMMENTS THREADING + MENTIONS · SMOKE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 76 · 2026-06-30
 *
 * Self-running smoke harness — no vitest, no top-level await. Imports the
 * engine directly, runs 25 inline checks covering user registry, mention
 * parsing, sacred terms, thread structure, depth cap, edit/delete, sub-
 * scriptions, notifications, and cross-tradition flagging.
 *
 * Run via: `npx tsx scripts/smoke/w76-comments-threading-mentions.ts`
 *
 * Exits 0 on full PASS, 1 on any FAIL.
 */

declare const process: { exit(code: number): never };

import {
  registerUser,
  getUser,
  listUsers,
  createComment,
  replyToComment,
  editComment,
  softDeleteComment,
  listThread,
  parseMentions,
  extractSacredTerms,
  subscribeToThread,
  muteThread,
  getThreadSubscribers,
  notifyOnMention,
  notifyOnReply,
  notifyOnThreadSubscription,
  exportNotificationAudit,
  flagCrossTradition,
  _resetForTests,
  SACRED_TERMS,
  MAX_THREAD_DEPTH,
  W76_D_VERSION,
  W76_D_CYCLE,
  W76_D_SACRED_TERMS_COUNT,
  type PostId,
  type UserId,
  type CommentId,
} from '../../src/lib/w76/comments-threading-mentions.ts';

let passes = 0;
let fails = 0;
const failures: string[] = [];

function check(label: string, cond: boolean, expectMsg?: string): void {
  if (cond) {
    passes++;
    console.log('  ✓ ' + label);
  } else {
    fails++;
    failures.push(label + (expectMsg ? ' (' + expectMsg + ')' : ''));
    console.log('  ✗ ' + label);
    if (expectMsg) console.log('    ' + expectMsg);
  }
}

function section(name: string): void {
  console.log('\n[' + name + ']');
}

function tryBlock(fn: () => void): boolean {
  try {
    fn();
    return true;
  } catch (e) {
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// RUN
// ════════════════════════════════════════════════════════════════════════════

console.log('W76-D Comments Threading + Mentions — Smoke Harness\n');

_resetForTests();
const post: PostId = 'post-mesa-76' as PostId;
const alice = registerUser('alice', 'Alice Cigana');
const bob = registerUser('bob', 'Bob Ramiro');
const carla = registerUser('carla', 'Carla Cabalista');
const dani = registerUser('dani-orixa', 'Dani de Oxum');
let aliceId: UserId = alice.id;
let bobId: UserId = bob.id;
let carlaId: UserId = carla.id;
let daniId: UserId = dani.id;

// ─── 1. User registry ────────────────────────────────────────────────────────
section('1. User registry');
check('register 4 users → listUsers.length === 4', listUsers().length === 4);
check('getUser case-insensitive (ALICE → alice)', getUser('ALICE')?.id === aliceId);
check('getUser preserves hyphens (dani-orixa)', getUser('dani-orixa')?.id === daniId);
check('registerUser rejects duplicate (case-insensitive)',
  !tryBlock(() => registerUser('ALICE', 'dup')));
check('registerUser rejects empty username',
  !tryBlock(() => registerUser('', 'X')));
check('registerUser rejects username > 32 chars',
  !tryBlock(() => registerUser('a'.repeat(33), 'X')));
check('registerUser rejects symbol chars',
  !tryBlock(() => registerUser('user@host', 'X')));
const ogã = registerUser('ogã-caboclo', 'Ogã de Caboclo');
check('registerUser accepts PT-BR unicode + hyphen',
  ogã.username === 'ogã-caboclo');

// ─── 2. Mention parsing ──────────────────────────────────────────────────────
section('2. Mention parsing (Unicode word boundary)');
const m1 = parseMentions('oi @alice e @bob — @alice de novo');
check('parse multiple mentions', m1.length === 2);
const m1usernames = m1.map((x) => x.username).sort();
check('parse dedups to 2 unique usernames',
  m1usernames[0] === 'alice' && m1usernames[1] === 'bob');

const m2 = parseMentions('@alice olá');
check('@alice at start of string parses', m2.length === 1 && m2[0]?.start === 0);

const m3 = parseMentions('Ogumância @alice Ogum');
const m3usernames = m3.map((x) => x.username);
check('Ogumância is NOT a false match for Ogum (cycle 75 lesson #3)',
  !m3usernames.includes('ogumância') && m3usernames.includes('alice'));

const m4 = parseMentions('use `cfg` and ping @alice');
check('mention inside code-like context parses', m4.length === 1);

const m5 = parseMentions('chamando @dani-orixa aqui');
check('hyphenated username @dani-orixa parses',
  m5.length === 1 && m5[0]?.username === 'dani-orixa' && m5[0]?.userId === daniId);

const m6 = parseMentions('oi @ghost_user e @alice');
check('unresolved @ghost_user filtered when resolveUsers=true (default)',
  m6.length === 1 && m6[0]?.username === 'alice');

const m7 = parseMentions('oi @ghost', { resolveUsers: false });
check('unresolved mention returned with placeholder userId when resolveUsers=false',
  m7.length === 1 && m7[0]?.userId === 'unresolved:ghost');

// ─── 3. Sacred terms ─────────────────────────────────────────────────────────
section('3. Sacred terms (cross-tradition coverage)');
check('≥30 sacred terms in whitelist', SACRED_TERMS.length >= 30);
check('W76_D_SACRED_TERMS_COUNT matches whitelist length',
  W76_D_SACRED_TERMS_COUNT === SACRED_TERMS.length);
const st1 = extractSacredTerms('Honro Ogum e Orixá lado a lado');
check('extractSacredTerms preserves source casing (Ogum, Orixá)',
  st1.includes('Ogum') && st1.includes('Orixá'));
check('extractSacredTerms returns empty for no sacred body',
  extractSacredTerms('apenas prosa').length === 0);
const st2 = extractSacredTerms('Ogumância é palavra comum');
check('extractSacredTerms rejects "Ogumância" (no false match on Ogum)',
  !st2.includes('Ogum'));

// ─── 4. Thread structure ─────────────────────────────────────────────────────
section('4. Thread structure & depth cap');
_resetForTests();
const a1 = registerUser('a1', 'A1');
const b1 = registerUser('b1', 'B1');
let cursor = createComment({ postId: post, authorId: a1.id, body: 'd0' });
check('top-level comment depth=0', cursor.depth === 0);
check('top-level comment rootId === self', cursor.rootId === cursor.id);
for (let i = 1; i <= 5; i++) {
  cursor = replyToComment(cursor.id, { authorId: b1.id, body: 'd' + i });
}
check('reply chain depth=5 at MAX_THREAD_DEPTH', cursor.depth === MAX_THREAD_DEPTH);
const overflow = replyToComment(cursor.id, { authorId: a1.id, body: 'overflow' });
check('overflow reply caps at MAX_THREAD_DEPTH (5)',
  overflow.depth === MAX_THREAD_DEPTH);
check('rootId propagates through overflow',
  overflow.rootId === cursor.rootId);

// ─── 5. Cycle detection & cross-post ─────────────────────────────────────────
section('5. Cycle detection & cross-post rejection');
_resetForTests();
const a2 = registerUser('a2', 'A2');
const b2 = registerUser('b2', 'B2');
const c2 = createComment({ postId: post, authorId: a2.id, body: 'c' });
check('reply to unknown parent throws',
  !tryBlock(() => replyToComment('nonexistent-c' as CommentId,
    { authorId: b2.id, body: 'x' })));
check('reply across different post throws',
  !tryBlock(() => createComment({
    postId: 'post-other' as PostId,
    authorId: b2.id,
    body: 'cross',
    parentId: c2.id,
  })));
softDeleteComment(c2.id);
check('reply to soft-deleted parent throws',
  !tryBlock(() => replyToComment(c2.id, { authorId: b2.id, body: 'ghost' })));

// ─── 6. Edit / delete ────────────────────────────────────────────────────────
section('6. Edit / soft-delete');
_resetForTests();
const a3 = registerUser('a3', 'A3');
const b3 = registerUser('b3', 'B3');
const cm = createComment({ postId: post, authorId: a3.id, body: 'olá @b3' });
check('initial comment has 1 mention', cm.mentions.length === 1);
const edited = editComment(cm.id, 'agora com @b3 e mais nada');
check('editComment updates body', edited.body === 'agora com @b3 e mais nada');
check('editComment sets editedAt', edited.editedAt !== null);
check('editComment preserves 1 mention after edit', edited.mentions.length === 1);
check('editComment rejects empty body',
  !tryBlock(() => editComment(cm.id, '')));
check('editComment rejects deleted comment',
  !tryBlock(() => {
    const c = createComment({ postId: post, authorId: a3.id, body: 'vai morrer' });
    softDeleteComment(c.id);
    editComment(c.id, 'tentativa');
  }));
const d1 = softDeleteComment(cm.id);
const d2 = softDeleteComment(cm.id);
check('softDeleteComment is idempotent (deletedAt stable)',
  d1.deletedAt === d2.deletedAt);

// ─── 7. listThread ───────────────────────────────────────────────────────────
section('7. listThread (DFS, exclude deleted by default)');
_resetForTests();
const a4 = registerUser('a4', 'A4');
const b4 = registerUser('b4', 'B4');
const c4 = registerUser('c4', 'C4');
const r0 = createComment({ postId: post, authorId: a4.id, body: 'r0' });
const r1a = replyToComment(r0.id, { authorId: b4.id, body: 'r1a' });
const r1b = replyToComment(r0.id, { authorId: c4.id, body: 'r1b' });
const r2 = replyToComment(r1a.id, { authorId: a4.id, body: 'r2' });
softDeleteComment(r1a.id);
const liveOnly = listThread(r0.id);
check('listThread excludes deleted by default (r0, r1b, r2 = 3)',
  liveOnly.length === 3);
const allComments = listThread(r0.id, { includeDeleted: true });
check('listThread includeDeleted=true returns 4', allComments.length === 4);
const depthLimited = listThread(r0.id, { maxDepth: 1 });
check('listThread maxDepth=1 returns 2 (r0 + r1b, r2 excluded)',
  depthLimited.length === 2);

// ─── 8. Subscriptions & mute ─────────────────────────────────────────────────
section('8. Subscriptions & mute');
_resetForTests();
const a5 = registerUser('a5', 'A5');
const b5 = registerUser('b5', 'B5');
const c5 = registerUser('c5', 'C5');
const root5 = createComment({ postId: post, authorId: a5.id, body: 'root' });
replyToComment(root5.id, { authorId: b5.id, body: 'r1' });
replyToComment(root5.id, { authorId: c5.id, body: 'r2' });
const subs5 = getThreadSubscribers(root5.id);
check('auto-subscribe: root author + 2 repliers = 3',
  subs5.length === 3 && subs5.includes(a5.id) && subs5.includes(b5.id) && subs5.includes(c5.id));
subscribeToThread(root5.id, b5.id);
check('subscribeToThread is idempotent (already subscribed)',
  getThreadSubscribers(root5.id).filter((x) => x === b5.id).length === 1);
muteThread(root5.id, b5.id);
const subs5b = getThreadSubscribers(root5.id);
check('muteThread removes from subscribers',
  !subs5b.includes(b5.id));
const muted5 = getThreadSubscribers(root5.id);
check('subscribers count after mute = 2', muted5.length === 2);

// ─── 9. Notification hooks ──────────────────────────────────────────────────
section('9. Notification hooks (audit immutability)');
_resetForTests();
const a6 = registerUser('a6', 'A6');
const b6 = registerUser('b6', 'B6');
const cm6 = createComment({ postId: post, authorId: a6.id, body: 'oi @b6' });
const ev1 = notifyOnMention(cm6.id, a6.id, b6.id);
check('notifyOnMention kind=mention', ev1.kind === 'mention');
check('notifyOnMention brand=W76-D', ev1.brand === 'W76-D');
check('self-notification rejected (actor === recipient)',
  !tryBlock(() => notifyOnMention(cm6.id, a6.id, a6.id)));

const cm6r = replyToComment(cm6.id, { authorId: b6.id, body: 'reply' });
const ev2 = notifyOnReply(cm6r.id, a6.id, b6.id);
check('notifyOnReply kind=reply', ev2.kind === 'reply');
check('notifyOnReply recipientId=parent author', ev2.recipientId === a6.id);

subscribeToThread(cm6.rootId, b6.id);
const ev3 = notifyOnThreadSubscription(cm6.id, b6.id, a6.id);
check('notifyOnThreadSubscription kind=subscription', ev3.kind === 'subscription');

const audit = exportNotificationAudit();
check('audit log has 3 events', audit.length === 3);
check('audit is frozen array', Object.isFrozen(audit));
check('audit.push() rejected (frozen)',
  !tryBlock(() => (audit as unknown as unknown[]).push({})));

// ─── 10. Cross-tradition flag (perspective_only ALWAYS) ──────────────────────
section('10. Cross-tradition flag — perspective_only, NEVER blocks');
_resetForTests();
const a7 = registerUser('a7', 'A7');
const c7 = createComment({ postId: post, authorId: a7.id, body: 'apenas prosa' });
check('single-tradition body → no flag', c7.moderationFlag === null);

const c7multi = createComment({
  postId: post,
  authorId: a7.id,
  body: 'Honro Ogum e Oxum lado a lado — Ogum e Oxum e mais.',
});
check('multi-tradition body → flag present',
  c7multi.moderationFlag !== null &&
  c7multi.moderationFlag?.kind === 'cross_tradition_perspective');
check('flag.sacredTermsFound includes Ogum and Oxum',
  c7multi.moderationFlag?.sacredTermsFound.includes('Ogum') === true &&
  c7multi.moderationFlag?.sacredTermsFound.includes('Oxum') === true);

const flag1 = flagCrossTradition(c7multi.id);
check('flagCrossTradition returns perspectiveOnly=true ALWAYS',
  flag1?.perspectiveOnly === true);
const blob = JSON.stringify(flag1);
check('flag NEVER contains "blocked" or "wrong" or "spam"',
  !/blocked/i.test(blob) && !/wrong/i.test(blob) && !/spam/i.test(blob));

const c7buckets = createComment({
  postId: post,
  authorId: a7.id,
  body: 'Ogum (Orixá) + Kether (Cabala) + Mantra (Oriente) + Cigano.',
});
const flag2 = flagCrossTradition(c7buckets.id);
const buckets = flag2?.traditionsPresent ?? [];
check('flag groups terms into Africanas + Cabala + Oriente + Cartomancia',
  buckets.includes('Africanas') &&
  buckets.includes('Cabala') &&
  buckets.includes('Oriente') &&
  buckets.includes('Cartomancia & Runas'));

const cleaned = editComment(c7multi.id, 'agora só Ogum');
check('editComment removes flag when terms drop below 2',
  cleaned.moderationFlag === null);

// ─── 11. End-to-end Mesa Real thread ─────────────────────────────────────────
section('11. End-to-end Mesa Real Casa 8 thread');
_resetForTests();
const aliceE = registerUser('alice', 'Alice Cigana');
const bobE = registerUser('bob', 'Bob Ramiro');
const carlaE = registerUser('carla', 'Carla Cabalista');

const rootE = createComment({
  postId: post,
  authorId: aliceE.id,
  body: 'A Casa 8 (Caixão) sobre sexualidade — Ogum encontra Oxum e Sephirah Binah.',
});
const r1E = replyToComment(rootE.id, { authorId: bobE.id, body: '@alice concordo, @carla?' });
const r2E = replyToComment(r1E.id, { authorId: carlaE.id, body: '@alice sim, Cabala ilumina Tantra.' });
const r3E = replyToComment(r2E.id, { authorId: aliceE.id, body: 'fechando — Ogum, Oxum e Kether.' });

const listE = listThread(rootE.id);
check('end-to-end: 4 comments in thread', listE.length === 4);
check('end-to-end: r3E.rootId === rootE.id', r3E.rootId === rootE.id);
check('end-to-end: r3E.depth === 3', r3E.depth === 3);
check('end-to-end: r1E has 2 mentions (alice, carla)', r1E.mentions.length === 2);
check('end-to-end: 3 subs (root + 2 replies)', getThreadSubscribers(rootE.id).length === 3);
check('end-to-end: root has cross-tradition flag', rootE.moderationFlag !== null);

notifyOnMention(r1E.id, bobE.id, aliceE.id);
notifyOnMention(r1E.id, bobE.id, carlaE.id);
notifyOnReply(r2E.id, bobE.id, carlaE.id);
const auditE = exportNotificationAudit();
check('end-to-end: 3 notification events', auditE.length === 3);
const kinds = auditE.map((e) => e.kind).sort();
check('end-to-end: events are [mention, mention, reply]',
  kinds[0] === 'mention' && kinds[1] === 'mention' && kinds[2] === 'reply');

// ─── 12. Version constants ───────────────────────────────────────────────────
section('12. Version constants');
check('W76_D_VERSION === 1.0.0', W76_D_VERSION === '1.0.0');
check('W76_D_CYCLE === 76', W76_D_CYCLE === 76);

// ════════════════════════════════════════════════════════════════════════════
// RESULT
// ════════════════════════════════════════════════════════════════════════════

console.log('');
console.log('  RESULT: ' + passes + ' PASS · ' + fails + ' FAIL · ' + (passes + fails) + ' total');
console.log('');
if (fails > 0) {
  console.log('  Failures:');
  for (const f of failures) console.log('    · ' + f);
  process.exit(1);
}
console.log('  W76-D SMOKE: ALL GREEN ✅');
process.exit(0);
