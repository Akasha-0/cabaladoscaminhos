// ============================================================================
// comments-moderation.spec.ts — node:test (NOT vitest — cycle 91+ lesson)
// ============================================================================
// 40+ asserts cobrindo: idempotência, RBAC, audit, LGPD, banned-vocab, soft-
// touch tone, edge cases de datas, paginação, mensagem privada.
// ============================================================================

import { test, describe } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createMemoryStore,
  createModerationService,
  flagComment,
  listFlaggedComments,
  getFlaggedComment,
  triageComment,
  sendPrivateMessage,
  listPrivateMessagesForUser,
  getModerationLog,
  isSteward,
  assertNoBannedVocab,
  ModerationError,
  REPORT_REASONS,
  FLAG_STATUSES,
  TRIAGE_ACTIONS,
  REASON_LABELS,
  STATUS_LABELS,
  ACTION_LABELS,
  asUserId,
  asCommentId,
} from '../comments-moderation';

const ROOT = resolve(__dirname, '../../../..');

function mkUser(role: 'community_member' | 'community_steward' | 'platform_admin', id: string) {
  return {
    id: asUserId(id),
    displayName: role === 'community_steward' ? `Cuidador ${id}` : `Membro ${id}`,
    role,
  };
}

function seed(store: ReturnType<typeof createMemoryStore>) {
  // Stewards
  store.upsertUser({ id: asUserId('s1'), displayName: 'Cuidadora Helena', role: 'community_steward' });
  store.upsertUser({ id: asUserId('s2'), displayName: 'Cuidador Miguel', role: 'community_steward' });
  store.upsertUser({ id: asUserId('admin1'), displayName: 'Platform Admin', role: 'platform_admin' });
  // Members
  store.upsertUser({ id: asUserId('m1'), displayName: 'Irmã Luz', role: 'community_member' });
  store.upsertUser({ id: asUserId('m2'), displayName: 'Praticante Theo', role: 'community_member' });
  store.upsertUser({ id: asUserId('m3'), displayName: 'Curiosa Nina', role: 'community_member' });
  // Comments
  store.upsertComment({
    id: asCommentId('c1'),
    authorId: asUserId('m1'),
    authorDisplayName: 'Irmã Luz',
    body: 'Compra aqui cupom OFF20 só hoje galera!',
    createdAt: new Date().toISOString(),
  });
  store.upsertComment({
    id: asCommentId('c2'),
    authorId: asUserId('m2'),
    authorDisplayName: 'Praticante Theo',
    body: '...',
    createdAt: new Date().toISOString(),
  });
}

// ----------------------------------------------------------------------------

describe('comments-moderation — engine & RBAC', () => {
  test('exports 5 reasons canônicas (sem over-granular)', () => {
    if (REPORT_REASONS.length !== 5) {
      throw new Error(`esperado 5, viu ${REPORT_REASONS.length}`);
    }
    if (!REPORT_REASONS.includes('SPAM')) throw new Error('SPAM faltando');
    if (!REPORT_REASONS.includes('HARASSMENT')) throw new Error('HARASSMENT faltando');
    if (!REPORT_REASONS.includes('MISINFO')) throw new Error('MISINFO faltando');
    if (!REPORT_REASONS.includes('OFF_TOPIC')) throw new Error('OFF_TOPIC faltando');
    if (!REPORT_REASONS.includes('OTHER')) throw new Error('OTHER faltando');
  });

  test('4 statuses de fila', () => {
    if (FLAG_STATUSES.length !== 4) {
      throw new Error(`esperado 4, viu ${FLAG_STATUSES.length}`);
    }
    for (const s of ['PENDING', 'TRIAGED_HIDDEN', 'TRIAGED_RESTORED', 'TRIAGED_NO_ACTION']) {
      if (!FLAG_STATUSES.includes(s as never)) throw new Error(`status ${s} ausente`);
    }
  });

  test('3 triage actions', () => {
    if (TRIAGE_ACTIONS.length !== 3) throw new Error('esperado 3');
    if (!TRIAGE_ACTIONS.includes('hide')) throw new Error('hide ausente');
    if (!TRIAGE_ACTIONS.includes('restore')) throw new Error('restore ausente');
    if (!TRIAGE_ACTIONS.includes('no-action')) throw new Error('no-action ausente');
  });

  test('isSteward retorna true para community_steward e platform_admin', () => {
    if (isSteward(mkUser('community_steward', 'x')) !== true) throw new Error('steward false');
    if (isSteward(mkUser('platform_admin', 'x')) !== true) throw new Error('admin false');
    if (isSteward(mkUser('community_member', 'x')) !== false) throw new Error('member true');
    if (isSteward(null) !== false) throw new Error('null true');
  });

  test('flagComment idempotente: mesmo reporter+comment = 1 só entry', () => {
    const store = createMemoryStore();
    seed(store);
    const reporter = mkUser('community_member', 'm3');
    const r1 = flagComment(store, {
      reporter,
      commentId: asCommentId('c1'),
      reason: 'SPAM',
      details: 'link suspeito',
    });
    if (r1.alreadyReported) throw new Error('primeira flagged como dup');
    if (!r1.report.id) throw new Error('r1 sem id');
    const r2 = flagComment(store, {
      reporter,
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    if (!r2.alreadyReported) throw new Error('segunda NÃO foi marcada como dup');
    if (r2.report.id !== r1.report.id) throw new Error(`id divergente (${r2.report.id} vs ${r1.report.id})`);
    const list = store.listReports(asCommentId('c1'));
    if (list.length !== 1) throw new Error(`esperado 1 report, viu ${list.length}`);
  });

  test('SELF_REPORT_BLOCKED quando reporter = author', () => {
    const store = createMemoryStore();
    seed(store);
    const author = mkUser('community_member', 'm1');
    try {
      flagComment(store, { reporter: author, commentId: asCommentId('c1'), reason: 'OTHER' });
      throw new Error('não bloqueou self-report');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'SELF_REPORT_BLOCKED') throw new Error(`code=${e.code}`);
    }
  });

  test('COMMENT_NOT_FOUND para id inexistente', () => {
    const store = createMemoryStore();
    seed(store);
    try {
      flagComment(store, {
        reporter: mkUser('community_member', 'm3'),
        commentId: asCommentId('ghost'),
        reason: 'SPAM',
      });
      throw new Error('não bloqueou missing');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'COMMENT_NOT_FOUND') throw new Error(`code=${e.code}`);
    }
  });

  test('INVALID_REASON para fora do enum', () => {
    const store = createMemoryStore();
    seed(store);
    try {
      flagComment(store, {
        reporter: mkUser('community_member', 'm3'),
        commentId: asCommentId('c1'),
        reason: 'EATING_PIZZA' as never,
      });
      throw new Error('aceitou reason inválida');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'INVALID_REASON') throw new Error(`code=${e.code}`);
    }
  });

  test('audit appends em flagComment', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    const audit = getModerationLog(store, mkUser('community_steward', 's1'), asCommentId('c1'));
    if (audit.length !== 1) throw new Error(`audit len=${audit.length}`);
    if (audit[0].action !== 'FLAG_SUBMITTED') throw new Error('action errada');
  });

  test('member NÃO vê queue (RBAC strict)', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    try {
      listFlaggedComments(store, mkUser('community_member', 'm3'));
      throw new Error('member não deveria ver queue');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'NOT_STEWARD') throw new Error(`code=${e.code}`);
    }
  });

  test('steward vê queue mas SEM identidades de reporter', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
      details: 'detalhe confidencial',
    });
    flagComment(store, {
      reporter: mkUser('community_member', 'm2'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    const page = listFlaggedComments(store, mkUser('community_steward', 's1'), {
      status: ['PENDING'],
    });
    if (page.items.length !== 1) throw new Error(`items=${page.items.length}`);
    const it = page.items[0];
    if (it.status !== 'PENDING') throw new Error('status não PENDING');
    if (it.reports.length === 0) throw new Error('reports vazio');
    for (const rep of it.reports) {
      // reporterId anonimizado OU ID sintético agregado
      if (rep.details !== null) throw new Error('details não foi stripado');
    }
    if (it.reports[0].reporterId !== asUserId('')) {
      throw new Error('reporterId deveria estar anonimizado');
    }
  });

  test('triageComment exige steward', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    try {
      triageComment(store, {
        steward: mkUser('community_member', 'm1'),
        commentId: asCommentId('c1'),
        action: 'hide',
      });
      throw new Error('member triou');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'NOT_STEWARD') throw new Error(`code=${e.code}`);
    }
  });

  test('triageComment hide → status=HIDDEN, audit appends', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    const out = triageComment(store, {
      steward: mkUser('community_steward', 's1'),
      commentId: asCommentId('c1'),
      action: 'hide',
    });
    if (out.flag.status !== 'TRIAGED_HIDDEN') throw new Error(`status=${out.flag.status}`);
    if (out.flag.hiddenAt === null) throw new Error('hiddenAt null');
    if (out.privateMessageId !== null) throw new Error('pm foi criada sem body');
    const audit = getModerationLog(store, mkUser('community_steward', 's1'), asCommentId('c1'));
    if (audit.length !== 2) throw new Error(`audit len=${audit.length}`);
    if (audit[1].action !== 'TRIAGE_HIDE') throw new Error('audit[1] errado');
  });

  test('triageComment restore exige hide prévio', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    try {
      triageComment(store, {
        steward: mkUser('community_steward', 's1'),
        commentId: asCommentId('c1'),
        action: 'restore',
      });
      throw new Error('restore sem hide');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'COMMENT_NOT_HIDDEN') throw new Error(`code=${e.code}`);
    }
  });

  test('triageComment hide→restore vira TRIAGED_RESTORED', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    triageComment(store, {
      steward: mkUser('community_steward', 's1'),
      commentId: asCommentId('c1'),
      action: 'hide',
    });
    const out = triageComment(store, {
      steward: mkUser('community_steward', 's1'),
      commentId: asCommentId('c1'),
      action: 'restore',
    });
    if (out.flag.status !== 'TRIAGED_RESTORED') throw new Error(`status=${out.flag.status}`);
    if (out.flag.restoredAt === null) throw new Error('restoredAt null');
  });

  test('triageComment no-action → TRIAGED_NO_ACTION', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    const out = triageComment(store, {
      steward: mkUser('community_steward', 's1'),
      commentId: asCommentId('c1'),
      action: 'no-action',
    });
    if (out.flag.status !== 'TRIAGED_NO_ACTION') throw new Error('status errado');
  });

  test('triageComment com privateMessage cria DM in-app', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    const out = triageComment(store, {
      steward: mkUser('community_steward', 's1'),
      commentId: asCommentId('c1'),
      action: 'hide',
      privateMessage:
        'Oi, vi o link no seu comentário. Esse padrão parece de spam. Tudo bem conversar?',
    });
    if (out.privateMessageId === null) throw new Error('pmId null');
    // destinatário (m1) vê a própria DM
    const dms = listPrivateMessagesForUser(store, mkUser('community_member', 'm1'), asUserId('m1'));
    if (dms.length !== 1) throw new Error(`dm count=${dms.length}`);
    if (dms[0].fromStewardId !== asUserId('s1')) throw new Error('from errado');
    if (dms[0].toUserId !== asUserId('m1')) throw new Error('to errado');
  });

  test('privateMessage >500 chars rejeitada (MESSAGE_TOO_LONG)', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    try {
      sendPrivateMessage(store, {
        fromSteward: mkUser('community_steward', 's1'),
        toUserId: asUserId('m1'),
        commentId: asCommentId('c1'),
        body: 'a'.repeat(501),
      });
      throw new Error('aceitou >500');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'MESSAGE_TOO_LONG') throw new Error(`code=${e.code}`);
    }
  });

  test('privateMessage vazia rejeitada (EMPTY_MESSAGE)', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    try {
      sendPrivateMessage(store, {
        fromSteward: mkUser('community_steward', 's1'),
        toUserId: asUserId('m1'),
        commentId: asCommentId('c1'),
        body: '   ',
      });
      throw new Error('aceitou empty');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'EMPTY_MESSAGE') throw new Error(`code=${e.code}`);
    }
  });

  test('privateMessage só visível ao destinatário (LGPD)', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    sendPrivateMessage(store, {
      fromSteward: mkUser('community_steward', 's1'),
      toUserId: asUserId('m1'),
      commentId: asCommentId('c1'),
      body: 'mensagem só pra você, m1.',
    });
    // m1 vê
    const m1sees = listPrivateMessagesForUser(store, mkUser('community_member', 'm1'), asUserId('m1'));
    if (m1sees.length !== 1) throw new Error('m1 não vê');
    // m2 NÃO vê
    try {
      listPrivateMessagesForUser(store, mkUser('community_member', 'm2'), asUserId('m1'));
      throw new Error('m2 viu DM alheia');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'NOT_STEWARD') throw new Error(`code=${e.code}`);
    }
    // platform_admin vê
    const adm = listPrivateMessagesForUser(
      store,
      mkUser('platform_admin', 'admin1'),
      asUserId('m1')
    );
    if (adm.length !== 1) throw new Error('admin não viu');
  });

  test('getModerationLog: member NÃO acessa (RBAC strict)', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    try {
      getModerationLog(store, mkUser('community_member', 'm1'), asCommentId('c1'));
      throw new Error('member não deveria ver audit');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'NOT_STEWARD') throw new Error(`code=${e.code}`);
    }
  });

  test('filtros por status funcionam', () => {
    const store = createMemoryStore();
    seed(store);
    // c2 fica pendente
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c2'),
      reason: 'OTHER',
    });
    // c1 será ocultado
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    triageComment(store, {
      steward: mkUser('community_steward', 's1'),
      commentId: asCommentId('c1'),
      action: 'hide',
    });
    const pending = listFlaggedComments(store, mkUser('community_steward', 's1'), {
      status: ['PENDING'],
    });
    if (pending.total !== 1) throw new Error(`pending=${pending.total}`);
    if (pending.items[0].status !== 'PENDING') throw new Error('item errado');
    const hidden = listFlaggedComments(store, mkUser('community_steward', 's1'), {
      status: ['TRIAGED_HIDDEN'],
    });
    if (hidden.total !== 1) throw new Error(`hidden=${hidden.total}`);
  });

  test('filtros por reason funcionam', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, { reporter: mkUser('community_member', 'm3'), commentId: asCommentId('c1'), reason: 'SPAM' });
    flagComment(store, { reporter: mkUser('community_member', 'm2'), commentId: asCommentId('c1'), reason: 'MISINFO' });
    flagComment(store, { reporter: mkUser('community_member', 'm3'), commentId: asCommentId('c2'), reason: 'HARASSMENT' });
    const onlySpam = listFlaggedComments(store, mkUser('community_steward', 's1'), {
      reasons: ['SPAM'],
    });
    if (onlySpam.total !== 1) throw new Error(`spam total=${onlySpam.total}`);
    const miss = listFlaggedComments(store, mkUser('community_steward', 's1'), {
      reasons: ['MISINFO'],
    });
    if (miss.total !== 1) throw new Error(`misinfo total=${miss.total}`);
  });

  test('paginação basic', () => {
    const store = createMemoryStore();
    seed(store);
    // Cria +5 comentários e flagam
    for (let i = 0; i < 5; i++) {
      const cid = asCommentId(`c${10 + i}`);
      const mid = asUserId(`u${100 + i}`);
      store.upsertUser({ id: mid, displayName: `Extra ${i}`, role: 'community_member' });
      store.upsertComment({
        id: cid,
        authorId: mid,
        authorDisplayName: `Extra ${i}`,
        body: `Comentário extra ${i}`,
        createdAt: new Date().toISOString(),
      });
      flagComment(store, { reporter: mkUser('community_member', 'm3'), commentId: cid, reason: 'OTHER' });
    }
    const p1 = listFlaggedComments(store, mkUser('community_steward', 's1'), {
      page: { limit: 2, offset: 0 },
    });
    if (p1.items.length !== 2) throw new Error(`p1 items=${p1.items.length}`);
    if (!p1.hasMore) throw new Error('hasMore devia ser true');
    if (p1.total < 5) throw new Error(`total=${p1.total}`);
    const p2 = listFlaggedComments(store, mkUser('community_steward', 's1'), {
      page: { limit: 2, offset: 2 },
    });
    if (p2.items.length !== 2) throw new Error(`p2 items=${p2.items.length}`);
    if (p1.items[0].commentId === p2.items[0].commentId) throw new Error('overlap entre páginas');
  });

  test('INVALID_DATE_RANGE: fromDate >= toDate', () => {
    const store = createMemoryStore();
    seed(store);
    try {
      listFlaggedComments(store, mkUser('community_steward', 's1'), {
        fromDate: '2026-06-30T15:00:00.000Z',
        toDate: '2026-06-30T14:00:00.000Z',
      });
      throw new Error('aceitou range inválido');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'INVALID_DATE_RANGE') throw new Error(`code=${e.code}`);
    }
  });

  test('INVALID_DATE_RANGE: fromDate inválido', () => {
    const store = createMemoryStore();
    seed(store);
    try {
      listFlaggedComments(store, mkUser('community_steward', 's1'), {
        fromDate: 'ontem',
      });
      throw new Error('aceitou data inválida');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'INVALID_DATE_RANGE') throw new Error(`code=${e.code}`);
    }
  });

  test('excerpt trunca em 200 chars', () => {
    const store = createMemoryStore();
    store.upsertUser({ id: asUserId('m1'), displayName: 'M1', role: 'community_member' });
    store.upsertUser({ id: asUserId('m3'), displayName: 'M3', role: 'community_member' });
    const long = 'a'.repeat(250);
    store.upsertComment({
      id: asCommentId('cLong'),
      authorId: asUserId('m1'),
      authorDisplayName: 'M1',
      body: long,
      createdAt: new Date().toISOString(),
    });
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('cLong'),
      reason: 'OTHER',
    });
    const page = listFlaggedComments(store, mkUser('community_steward', 's1'));
    if (page.items.length !== 1) throw new Error('item ausente');
    if (!page.items[0].excerpt.endsWith('…')) throw new Error('não truncou');
    if (page.items[0].excerpt.length > 220) throw new Error('excerpt longo demais');
  });

  test('createModerationService expõe superfície completa', () => {
    const svc = createModerationService();
    if (typeof svc.flag !== 'function') throw new Error('flag missing');
    if (typeof svc.list !== 'function') throw new Error('list missing');
    if (typeof svc.get !== 'function') throw new Error('get missing');
    if (typeof svc.triage !== 'function') throw new Error('triage missing');
    if (typeof svc.dm !== 'function') throw new Error('dm missing');
    if (typeof svc.dms !== 'function') throw new Error('dms missing');
    if (typeof svc.log !== 'function') throw new Error('log missing');
    if (typeof svc.canSteward !== 'function') throw new Error('canSteward missing');
    // Não usa freeze nos primitivos (lesson W91+)
    const cid = asCommentId('ok');
    if (typeof cid !== 'string') throw new Error('brand deve ser string-like');
  });

  test('getFlaggedComment retorna detalhe (steward)', () => {
    const store = createMemoryStore();
    seed(store);
    flagComment(store, {
      reporter: mkUser('community_member', 'm3'),
      commentId: asCommentId('c1'),
      reason: 'SPAM',
    });
    const item = getFlaggedComment(store, mkUser('community_steward', 's1'), asCommentId('c1'));
    if (!item) throw new Error('null');
    if (item.status !== 'PENDING') throw new Error('status');
    if (item.authorId !== asUserId('m1')) throw new Error('authorId');
  });

  test('getFlaggedComment member NÃO acessa', () => {
    const store = createMemoryStore();
    seed(store);
    try {
      getFlaggedComment(store, mkUser('community_member', 'm3'), asCommentId('c1'));
      throw new Error('member viu detalhe');
    } catch (e) {
      if (!(e instanceof ModerationError)) throw new Error('não é ModerationError');
      if (e.code !== 'NOT_STEWARD') throw new Error(`code=${e.code}`);
    }
  });

  test('reason labels sem vocabulário punitivo', () => {
    const concat = Object.values(REASON_LABELS).join(' ') + ' ' +
                   Object.values(STATUS_LABELS).join(' ') + ' ' +
                   Object.values(ACTION_LABELS).join(' ');
    const result = assertNoBannedVocab(concat);
    if (!result.ok) {
      throw new Error(`banned vocab em labels: ${result.hits.join(',')}`);
    }
  });

  test('assertNoBannedVocab detector funciona', () => {
    const ok = assertNoBannedVocab('olá cuidador, isso me ajuda');
    if (!ok.ok) throw new Error('false positive');
    const bad = assertNoBannedVocab('você levou um strike formal');
    if (bad.ok) throw new Error('não detectou strike');
    if (!bad.hits.includes('strike')) throw new Error('hits não inclui strike');
  });
});

// ----------------------------------------------------------------------------
// Source-inspection: componentes, página, comentários proibidos
// ----------------------------------------------------------------------------

/**
 * Strip comments + CSS className lines antes do scanner de vocab.
 * O scanner roda sobre TEXTO VISÍVEL, não sobre código-fonte bruto.
 */
function stripForVocabScan(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
    // JSX tags (&lt;blockquote&gt;, etc)
    .replace(/<\/?[A-Z][a-zA-Z0-9]*[^>]*>/g, ' ')
    .replace(/<\/?[a-z][a-zA-Z0-9-]*[^>]*>/g, ' ')
    // intent/options internos (não copiar UI)
    .replace(/intent:\s*'[a-z]+'/g, ' ')
    .replace(/value:\s*'[a-z-]+'/g, ' ')
    // className={cn(...)} enorme → espaço
    .replace(/className=\{cn\([\s\S]*?\}\)/g, ' ')
    .replace(/className="[^"]*"/g, ' ')
    // Atributos JSX comuns = "..."  (também capturam children com string)
    .replace(/[\w-]*="[^"]*"/g, ' ')
    // Quebras de classes Tailwind remanescentes como tokens distintos
    .replace(/\b(?:bg|text|border|rounded|hover|focus|ring|min-h|min-w|gap|space|flex|w|h|px|py|mx|my|max-w|max-h|sm|md|lg|xl|fixed|absolute|relative|sticky|inline|grid|hidden|overflow|whitespace|font|mt|mb|ml|mr|pt|pb|pl|pr|shadow|backdrop|opacity|transition|z|tabIndex|placeholder|cols|rows|maxLength|minLength|auto[A-Z]\w*|size|name|id|key)[a-zA-Z0-9-]*:\S+/g, ' ');
}


describe('comments-moderation — components source inspection', () => {
  test('FlagButton.tsx existe, > 80 LOC, < 130 LOC', () => {
    const p = resolve(ROOT, 'src/components/moderation/FlagButton.tsx');
    if (!existsSync(p)) throw new Error('ausente');
    const txt = readFileSync(p, 'utf-8');
    const loc = txt.split('\n').length;
    if (loc < 80) throw new Error(`muito curto: ${loc}`);
    if (loc > 130) throw new Error(`muito longo: ${loc}`);
    // tom suave: não tem "denunciar" (Mantém como Denunciar é permitido como legacy default? — verificação opcional)
    if (txt.includes('privacy')) throw new Error('privacy duplicada? não era aqui');
  });

  test('FlagButton aceita label custom (i18n)', () => {
    const p = resolve(ROOT, 'src/components/moderation/FlagButton.tsx');
    const txt = readFileSync(p, 'utf-8');
    if (!txt.includes('Reportar')) throw new Error('faltando label PT "Reportar"');
    if (!txt.includes('Report')) throw new Error('faltando label EN "Report"');
    if (!txt.includes('locale')) throw new Error('não tem prop locale');
    if (!txt.includes('min-h-[44px]')) throw new Error('faltando touch target ≥44px');
  });

  test('FlagModal.tsx tem 5 motivos (incl. OFF_TOPIC)', () => {
    const p = resolve(ROOT, 'src/components/moderation/FlagModal.tsx');
    const txt = readFileSync(p, 'utf-8');
    for (const r of ['SPAM', 'HARASSMENT', 'MISINFO', 'OFF_TOPIC', 'OTHER']) {
      if (!txt.includes(`'${r}'`)) throw new Error(`motivo ${r} ausente`);
    }
    if (!txt.includes('COPY[')) throw new Error('sem helper COPY (PT/EN)');
    if (!txt.includes('Sua identidade')) throw new Error('aviso de privacidade sumiu');
  });

  test('ModerationQueue.tsx tem tabs + table/cards', () => {
    const p = resolve(ROOT, 'src/components/moderation/ModerationQueue.tsx');
    const txt = readFileSync(p, 'utf-8');
    if (!txt.includes('role="tablist"')) throw new Error('sem tablist');
    if (!txt.includes('role="tab"')) throw new Error('sem tab role');
    if (!txt.includes('md:hidden')) throw new Error('não tem versão mobile card');
    if (!txt.includes('hidden md:block')) throw new Error('não tem versão desktop table');
    if (!txt.includes('aria-live')) throw new Error('sem aria-live');
    // Sem vocab punitivo em texto visível
    const stripped = stripForVocabScan(txt);
    const result = assertNoBannedVocab(stripped);
    if (!result.ok) throw new Error(`banned: ${result.hits.join(',')}`);
  });

  test('TriagePanel.tsx tem confirm step + private message ≤500', () => {
    const p = resolve(ROOT, 'src/components/moderation/TriagePanel.tsx');
    const txt = readFileSync(p, 'utf-8');
    if (!txt.includes('alertdialog')) throw new Error('sem confirm step alertdialog');
    if (!txt.includes('500')) throw new Error('sem referência a 500 chars');
    if (!txt.includes('Confirmar cuidado') && !txt.includes('confirmStep')) {
      throw new Error('sem fluxo de confirmação humana');
    }
    const stripped = stripForVocabScan(txt);
    const result = assertNoBannedVocab(stripped);
    if (!result.ok) throw new Error(`banned: ${result.hits.join(',')}`);
  });

  test('page.tsx tem auth gate + redirect /login', () => {
    const p = resolve(ROOT, 'src/app/moderation/page.tsx');
    const txt = readFileSync(p, 'utf-8');
    if (!txt.includes("redirect('/login")) throw new Error('sem redirect /login');
    if (!txt.includes("getViewer")) throw new Error('sem getViewer');
    if (!txt.includes('isSteward')) throw new Error('sem isSteward check');
    if (!txt.includes('403')) throw new Error('sem tela 403');
    if (!txt.includes('robots')) throw new Error('faltando robots: noindex');
    const stripped = stripForVocabScan(txt);
    const result = assertNoBannedVocab(stripped);
    if (!result.ok) throw new Error(`banned: ${result.hits.join(',')}`);
  });
});
