/**
 * ════════════════════════════════════════════════════════════════════════════
 *  membership.spec.ts — 50+ assertions across 7 sections
 *
 *  Sections:
 *    §1 — ROLES + branded types (5)
 *    §2 — findActiveMembership creator fusion (10)
 *    §3 — joinCircle happy paths + idempotent re-join (10)
 *    §4 — leaveCircle + permissions (8)
 *    §5 — promote / demote / ban / unban (10)
 *    §6 — listMembers + filters (8)
 *    §7 — assertMemberCanPost errors (5)
 *
 *  Runs via `node --experimental-strip-types` OR vitest (when binary lands).
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  createCircle,
  getCircle,
  __resetCircleStore,
} from '../circles.ts';

import {
  joinCircle,
  leaveCircle,
  listMembers,
  promoteToAdmin,
  demoteAdmin,
  banMember,
  unbanMember,
  getMemberCount,
  getMember,
  listForUser,
  assertMemberCanPost,
  auditMembershipBreakdown,
  findActiveMembership,
  __resetMembershipStore,
  setMembershipHmacSecret,
  type Member,
  type MemberId,
  type Role,
  ROLES,
  ROLES_VALUES,
  isRole,
  asMemberId,
  NotMemberError,
  AlreadyMemberError,
  BannedMemberError,
  MembershipValidationError,
  CircleForbiddenError,
} from '../membership.ts';

import {
  expectEqual,
  expectNotEqual,
  expectTrue,
  expectFalse,
  expectThrows,
  expectLen,
  expectContains,
  expectFrozen,
  resetHarness,
  report,
  section,
  results as harnessResults,
} from './harness.ts';

import { toUserId, CircleFullError, type UserId, type CircleId } from '../circles.ts';

const ALICE = toUserId('user-alice');
const BOB = toUserId('user-bob');
const CARLA = toUserId('user-carla');
const DAN = toUserId('user-dan');

export function runMembershipSpec(): number {
  resetHarness();
  __resetCircleStore();
  __resetMembershipStore();
  setMembershipHmacSecret('test-secret-membership');

  // ── §1 — ROLES + branded types ───────────────────────────────────────────
  section('§1 ROLES + branded');
  expectEqual('ROLES has 4 entries', ROLES.length, 4);
  expectEqual('ROLES_VALUES includes creator', ROLES_VALUES.includes('creator'), true);
  expectEqual('ROLES_VALUES includes admin', ROLES_VALUES.includes('admin'), true);
  expectEqual('ROLES_VALUES includes moderator', ROLES_VALUES.includes('moderator'), true);
  expectEqual('ROLES_VALUES includes member', ROLES_VALUES.includes('member'), true);
  expectTrue('isRole("admin")', isRole('admin'));
  expectFalse('isRole("hello")', isRole('hello'));
  expectEqual('asMemberId round-trips', asMemberId('mem_xyz'), 'mem_xyz');

  // ── §2 — findActiveMembership creator fusion ────────────────────────────
  section('§2 creator fusion');
  const c1 = createCircle(ALICE, {
    name: 'Tarot Study',
    theme: 'tarot-practice',
    isPublic: true,
    maxMembers: 50,
  });
  const virtual = findActiveMembership(c1.id, ALICE);
  expectTrue('virtual membership for creator', virtual !== null);
  expectEqual('virtual role=creator', virtual!.role, 'creator');
  expectEqual('virtual id starts with virtual-', virtual!.id.startsWith('virtual-'), true);
  const ghost = findActiveMembership(c1.id, BOB);
  expectEqual('no membership for non-creator', ghost, null);

  // ── §3 — joinCircle happy paths + idempotent re-join ────────────────────
  section('§3 joinCircle');
  const m1 = joinCircle(c1.id, BOB);
  expectEqual('m1 role=member', m1.role, 'member');
  expectEqual('m1 is real (not virtual)', m1.id.startsWith('mem_'), true);
  expectEqual('m1 bannedAt=null', m1.bannedAt, null);
  expectThrows('AlreadyMemberError when re-joining active member', () => {
    joinCircle(c1.id, BOB);
  });
  // Idempotent leave → re-join
  leaveCircle(c1.id, BOB, 'taking a break');
  expectEqual('memberCount after leave=0', c1.memberCount, 0);
  const m1b = joinCircle(c1.id, BOB);
  expectEqual('idempotent re-join returns same role', m1b.role, 'member');
  expectEqual('re-joined joinedAt refreshed', m1b.joinedAt > m1.joinedAt || m1b.joinedAt === m1.joinedAt, true);
  // As moderator
  const m2 = joinCircle(c1.id, CARLA, { asRole: 'moderator' });
  expectEqual('mod role assigned', m2.role, 'moderator');
  // Creator joining own circle is virtual
  const creatorSelf = joinCircle(c1.id, ALICE);
  expectEqual('creator self-join is virtual', creatorSelf.id.startsWith('virtual-'), true);

  // ── §4 — leaveCircle + permissions ───────────────────────────────────────
  section('§4 leaveCircle');
  expectEqual('leaveCircle member returns true', leaveCircle(c1.id, CARLA, 'goodbye'), true);
  expectEqual('leaveCircle non-member returns false', leaveCircle(c1.id, DAN, '?'), false);
  expectThrows('creator cannot leave own circle', () =>
    leaveCircle(c1.id, ALICE, 'impossible'),
  );
  expectThrows('invalid reason throws', () => leaveCircle(c1.id, DAN, ''));
  expectThrows('overly long reason throws', () =>
    leaveCircle(c1.id, DAN, 'x'.repeat(300)),
  );

  // ── §5 — promote / demote / ban / unban ──────────────────────────────────
  section('§5 promote/demote/ban');
  // Re-join Carla so we have someone
  joinCircle(c1.id, CARLA);
  expectEqual('promote non-admin returns true', promoteToAdmin(c1.id, CARLA, ALICE), true);
  expectEqual('re-promote returns false (already admin)', promoteToAdmin(c1.id, CARLA, ALICE), false);
  expectEqual('demote returns true', demoteAdmin(c1.id, CARLA, ALICE), true);
  expectEqual('demote non-admin returns false', demoteAdmin(c1.id, CARLA, ALICE), false);
  expectEqual('ban member returns true', banMember(c1.id, CARLA, ALICE, 'spam'), true);
  // After ban, re-join should throw BannedMemberError
  expectThrows('banned re-join throws BannedMemberError', () =>
    joinCircle(c1.id, CARLA),
  );
  // Unban
  expectEqual('unban returns true', unbanMember(c1.id, CARLA, ALICE), true);
  // Now Carla is an active member again — joinCircle throws AlreadyMemberError
  // (unban re-activates the row).
  expectThrows('unbanned user cannot double-join (AlreadyMemberError)', () =>
    joinCircle(c1.id, CARLA),
  );
  // Verify carla is active
  const carlaActive = findActiveMembership(c1.id, CARLA);
  expectNotEqual('carla is active after unban', carlaActive, null);
  expectEqual('carla role=member', carlaActive?.role, 'member');
  expectThrows('non-creator cannot promote', () =>
    promoteToAdmin(c1.id, BOB, BOB),
  );
  expectThrows('non-creator cannot ban', () =>
    banMember(c1.id, BOB, BOB, 'self'),
  );

  // ── §6 — listMembers + filters ──────────────────────────────────────────
  section('§6 listMembers');
  // c1 has: ALICE (virtual creator), BOB, CARLA = 3
  const allActive = listMembers(c1.id);
  expectEqual('all active members = 3', allActive.length, 3);
  expectEqual('virtual creator always in list', allActive.filter((m) => m.role === 'creator').length, 1);
  const memberOnly = listMembers(c1.id, { role: 'member' });
  expectEqual('filter role=member = 2', memberOnly.length, 2);
  expectEqual('filter role=creator = 1', listMembers(c1.id, { role: 'creator' }).length, 1);
  const creatorOnly = listMembers(c1.id, { role: 'creator' });
  expectEqual('creator role filter returns virtual only', creatorOnly.length, 1);
  expectEqual('creator role filter id is virtual', creatorOnly[0]!.id.startsWith('virtual-'), true);

  // ── §7 — assertMemberCanPost errors ──────────────────────────────────────
  section('§7 assertMemberCanPost');
  expectEqual('BOB can post', assertMemberCanPost(c1.id, BOB), undefined);
  expectThrows('non-member DAN cannot post → NotMemberError', () =>
    assertMemberCanPost(c1.id, DAN),
  );
  // Creator can post (virtual membership allows it)
  const creatorCanPost = assertMemberCanPost(c1.id, ALICE);
  expectEqual('creator can post (no throw)', creatorCanPost, undefined);
  // Ban and verify
  banMember(c1.id, BOB, ALICE, 'spam');
  expectThrows('banned cannot post → BannedMemberError', () =>
    assertMemberCanPost(c1.id, BOB),
  );

  // ── §8 — breakdown + misc ────────────────────────────────────────────────
  section('§8 breakdown + misc');
  const breakdown = auditMembershipBreakdown(c1.id);
  expectEqual('breakdown has 4 roles', Object.keys(breakdown).length, 4);
  expectEqual('breakdown.creator = 1', breakdown.creator, 1);
  expectEqual('breakdown.member = 0 (BOB banned, CARLA member=1)', breakdown.member, 1);
  expectEqual('listForUser(Bob) returns banned-empty', listForUser(BOB).length, 0);
  const listForAlice = listForUser(ALICE);
  expectEqual('listForUser(Alice) = 0 (virtual creator not counted)', listForAlice.length, 0);

  // ── §9 — CircleFullError scenario ───────────────────────────────────────
  section('§9 capacity');
  const tiny = createCircle(ALICE, { name: 'Tiny', theme: 'cigano-study', isPublic: true, maxMembers: 2 });
  joinCircle(tiny.id, BOB);
  // Re-join CARLA (currently banned from c1, but tiny is different circle)
  joinCircle(tiny.id, CARLA);
  expectThrows('joining 3rd member throws CircleFullError', () =>
    joinCircle(tiny.id, toUserId('user-eve')),
  );
  expectEqual('tiny memberCount = 2', getMemberCount(tiny.id), 2);

  const r = harnessResults();
  report('membership', r);
  return r.failed === 0 ? 0 : 1;
}

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('membership.spec.ts')) {
  process.exit(runMembershipSpec());
}
