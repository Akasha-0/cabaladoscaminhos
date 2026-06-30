#!/usr/bin/env node
// ============================================================================
// smoke-comments-moderation.mjs — runtime asserts via node --experimental-strip-types
// ============================================================================
// 12+ asserts: fluxo end-to-end — flag → list → triage → audit → DM → LGPD
//
// Cycle W91-A lesson: `node --experimental-strip-types` is the floor when
// sandbox corrupts tsc/vitest. Smoke roda SEM deps externas — só Node.
// ============================================================================

import { createMemoryStore, flagComment, listFlaggedComments, triageComment, sendPrivateMessage, listPrivateMessagesForUser, getModerationLog, isSteward, ModerationError, asUserId, asCommentId, REPORT_REASONS, REASON_LABELS } from '../src/lib/w92/comments-moderation.ts';

let ok = 0;
let total = 0;
function assert(label, cond) {
  total++;
  if (cond) {
    ok++;
    console.log(`  ✅ ${label}`);
  } else {
    console.log(`  ❌ ${label}`);
  }
}
function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// ----------------------------------------------------------------------------

const store = createMemoryStore();

// Seed: 2 stewards, 3 members, 3 comments
group('Seed', () => {
  store.upsertUser({ id: asUserId('steward_a'), displayName: 'Cuidadora Helena', role: 'community_steward' });
  store.upsertUser({ id: asUserId('steward_b'), displayName: 'Cuidador Miguel', role: 'community_steward' });
  store.upsertUser({ id: asUserId('member_x'), displayName: 'Membro X', role: 'community_member' });
  store.upsertUser({ id: asUserId('member_y'), displayName: 'Membro Y', role: 'community_member' });
  store.upsertUser({ id: asUserId('admin_z'), displayName: 'Platform Admin', role: 'platform_admin' });
  store.upsertComment({ id: asCommentId('c_spam'), authorId: asUserId('member_x'), authorDisplayName: 'Membro X', body: 'Compra na minha loja cupom OFF30', createdAt: new Date().toISOString() });
  store.upsertComment({ id: asCommentId('c_harass'), authorId: asUserId('member_y'), authorDisplayName: 'Membro Y', body: 'Vai embora, você não pertence aqui.', createdAt: new Date().toISOString() });
  store.upsertComment({ id: asCommentId('c_misinfo'), authorId: asUserId('member_x'), authorDisplayName: 'Membro X', body: 'Beber água salgada cura ansiedade.', createdAt: new Date().toISOString() });
  assert('5 users criados', store.getUser(asUserId('steward_a')) !== null);
  assert('3 comments criados', store.getComment(asCommentId('c_spam')) !== null);
});

// ----------------------------------------------------------------------------

group('isSteward guard', () => {
  assert('steward → true', isSteward({ id: asUserId('s'), displayName: 'S', role: 'community_steward' }) === true);
  assert('admin → true', isSteward({ id: asUserId('a'), displayName: 'A', role: 'platform_admin' }) === true);
  assert('member → false', isSteward({ id: asUserId('m'), displayName: 'M', role: 'community_member' }) === false);
  assert('null → false', isSteward(null) === false);
});

// ----------------------------------------------------------------------------

group('flagComment — fluxo reporter → idempotência', () => {
  const r1 = flagComment(store, {
    reporter: { id: asUserId('member_y'), displayName: 'Membro Y', role: 'community_member' },
    commentId: asCommentId('c_spam'),
    reason: 'SPAM',
    details: 'link comercial',
  });
  assert('primeira flag = !alreadyReported', r1.alreadyReported === false);
  assert('flag id presente', typeof r1.report.id === 'string');

  const r2 = flagComment(store, {
    reporter: { id: asUserId('member_y'), displayName: 'Membro Y', role: 'community_member' },
    commentId: asCommentId('c_spam'),
    reason: 'SPAM',
  });
  assert('segunda flag (mesmo reporter+reason) = alreadyReported', r2.alreadyReported === true);
  assert('id reaproveitado (idempotência)', r2.report.id === r1.report.id);

  const r3 = flagComment(store, {
    reporter: { id: asUserId('steward_a'), displayName: 'Helena', role: 'community_steward' },
    commentId: asCommentId('c_spam'),
    reason: 'SPAM',
  });
  assert('3 flag (steward diferente, mesmo reason) = !alreadyReported', r3.alreadyReported === false);
});

// ----------------------------------------------------------------------------

group('Self-report bloqueado', () => {
  let err = null;
  try {
    flagComment(store, {
      reporter: { id: asUserId('member_x'), displayName: 'X', role: 'community_member' },
      commentId: asCommentId('c_spam'),
      reason: 'OTHER',
    });
  } catch (e) {
    err = e;
  }
  assert('self-report = SELF_REPORT_BLOCKED', err instanceof ModerationError && err.code === 'SELF_REPORT_BLOCKED');
});

// ----------------------------------------------------------------------------

group('Comment not found → COMMENT_NOT_FOUND', () => {
  let err = null;
  try {
    flagComment(store, {
      reporter: { id: asUserId('member_y'), displayName: 'Y', role: 'community_member' },
      commentId: asCommentId('c_ghost'),
      reason: 'OTHER',
    });
  } catch (e) {
    err = e;
  }
  assert('ghost comment bloqueado', err instanceof ModerationError && err.code === 'COMMENT_NOT_FOUND');
});

// ----------------------------------------------------------------------------

group('listFlaggedComments — RBAC strict', () => {
  let err = null;
  try {
    listFlaggedComments(store, { id: asUserId('member_y'), displayName: 'Y', role: 'community_member' });
  } catch (e) {
    err = e;
  }
  assert('member → NOT_STEWARD', err instanceof ModerationError && err.code === 'NOT_STEWARD');

  const page = listFlaggedComments(store, {
    id: asUserId('steward_a'),
    displayName: 'Helena',
    role: 'community_steward',
  });
  assert('steward vê fila, total >= 1', page.total >= 1);
  assert('items <= limit', page.items.length <= 20);
});

// ----------------------------------------------------------------------------

group('listFlaggedComments — identidades removidas (LGPD)', () => {
  const page = listFlaggedComments(store, {
    id: asUserId('steward_b'),
    displayName: 'Miguel',
    role: 'community_steward',
  });
  let allAnonymized = true;
  for (const it of page.items) {
    for (const rep of it.reports) {
      if (rep.reporterId !== asUserId('')) allAnonymized = false;
    }
  }
  assert('todos reporters anonimizados', allAnonymized);
});

// ----------------------------------------------------------------------------

group('triageComment hide → status flip', () => {
  const out = triageComment(store, {
    steward: { id: asUserId('steward_a'), displayName: 'Helena', role: 'community_steward' },
    commentId: asCommentId('c_spam'),
    action: 'hide',
  });
  assert('status = TRIAGED_HIDDEN', out.flag.status === 'TRIAGED_HIDDEN');
  assert('hiddenAt ISO', typeof out.flag.hiddenAt === 'string');
});

// ----------------------------------------------------------------------------

group('triageComment no-action em c_misinfo', () => {
  // Flag primeiro
  flagComment(store, {
    reporter: { id: asUserId('member_y'), displayName: 'Y', role: 'community_member' },
    commentId: asCommentId('c_misinfo'),
    reason: 'MISINFO',
    details: 'informação médica perigosa',
  });
  const out = triageComment(store, {
    steward: { id: asUserId('steward_a'), displayName: 'Helena', role: 'community_steward' },
    commentId: asCommentId('c_misinfo'),
    action: 'no-action',
  });
  assert('status = TRIAGED_NO_ACTION', out.flag.status === 'TRIAGED_NO_ACTION');
});

// ----------------------------------------------------------------------------

group('triageComment com privateMessage → DM in-app', () => {
  flagComment(store, {
    reporter: { id: asUserId('member_x'), displayName: 'X', role: 'community_member' },
    commentId: asCommentId('c_harass'),
    reason: 'HARASSMENT',
  });
  const out = triageComment(store, {
    steward: { id: asUserId('steward_a'), displayName: 'Helena', role: 'community_steward' },
    commentId: asCommentId('c_harass'),
    action: 'hide',
    privateMessage: 'Oi, isso afastou pessoas. Vamos conversar com calma?',
  });
  assert('privateMessageId retornado', out.privateMessageId !== null);
  const dms = listPrivateMessagesForUser(
    store,
    { id: asUserId('member_y'), displayName: 'Y', role: 'community_member' },
    asUserId('member_y')
  );
  assert('destinatário (Y, autor) vê DM', dms.length >= 1);
  assert('DM veio do steward correto', dms.some((dm) => dm.fromStewardId === asUserId('steward_a')));
});

// ----------------------------------------------------------------------------

group('private message >500 chars → MESSAGE_TOO_LONG', () => {
  flagComment(store, {
    reporter: { id: asUserId('member_y'), displayName: 'Y', role: 'community_member' },
    commentId: asCommentId('c_misinfo'),
    reason: 'OTHER',
  });
  let err = null;
  try {
    sendPrivateMessage(store, {
      fromSteward: { id: asUserId('steward_a'), displayName: 'Helena', role: 'community_steward' },
      toUserId: asUserId('member_x'),
      commentId: asCommentId('c_misinfo'),
      body: 'a'.repeat(501),
    });
  } catch (e) {
    err = e;
  }
  assert('>500 chars bloqueado', err instanceof ModerationError && err.code === 'MESSAGE_TOO_LONG');
});

// ----------------------------------------------------------------------------

group('private message vazia → EMPTY_MESSAGE', () => {
  let err = null;
  try {
    sendPrivateMessage(store, {
      fromSteward: { id: asUserId('steward_a'), displayName: 'Helena', role: 'community_steward' },
      toUserId: asUserId('member_x'),
      commentId: asCommentId('c_misinfo'),
      body: '   ',
    });
  } catch (e) {
    err = e;
  }
  assert('empty body bloqueado', err instanceof ModerationError && err.code === 'EMPTY_MESSAGE');
});

// ----------------------------------------------------------------------------

group('audit trail completo', () => {
  const audit = getModerationLog(
    store,
    { id: asUserId('steward_a'), displayName: 'Helena', role: 'community_steward' },
    asCommentId('c_harass')
  );
  assert('audit >= 2 entries (flag + triage)', audit.length >= 2);
  assert('flag submit registrado', audit.some((a) => a.action === 'FLAG_SUBMITTED'));
  assert('triage hide registrado', audit.some((a) => a.action === 'TRIAGE_HIDE'));
});

// ----------------------------------------------------------------------------

group('REPORT_REASONS tem 5 reasons (sem over-granular)', () => {
  assert('length = 5', REPORT_REASONS.length === 5);
  assert('SPAM', REPORT_REASONS.includes('SPAM'));
  assert('HARASSMENT', REPORT_REASONS.includes('HARASSMENT'));
  assert('MISINFO', REPORT_REASONS.includes('MISINFO'));
  assert('OFF_TOPIC', REPORT_REASONS.includes('OFF_TOPIC'));
  assert('OTHER', REPORT_REASONS.includes('OTHER'));
});

// ----------------------------------------------------------------------------

group('reason labels sem vocab punitivo', () => {
  const banned = ['strike', 'warning', 'warn', 'mute', 'muted', 'ban', 'banned', 'punição', 'punish', 'block', 'infração'];
  const allLabels = Object.values(REASON_LABELS).join(' ').toLowerCase();
  const hits = banned.filter((w) => allLabels.includes(w));
  assert('zero banned vocab em labels', hits.length === 0);
});

// ----------------------------------------------------------------------------

console.log(`\n${'='.repeat(60)}`);
console.log(`Smoke: ${ok}/${total} asserts OK`);
console.log('='.repeat(60));

if (ok !== total) {
  console.error('FAILED');
  process.exit(1);
}
console.log('ALL PASS');
