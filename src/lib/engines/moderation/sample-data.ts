/**
 * ════════════════════════════════════════════════════════════════════════════
 * W84-C — COMMENTS MODERATION · SAMPLE DATA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 84 · 2026-06-30
 * Author: W84-C Coder (Mavis orchestrator session 414756900012156)
 *
 * 12 sample reports across 5 comments + 3 moderators + 7 tradições + 8 reasons.
 * Carefully curated so EVERY reason appears at least once and EVERY tradição
 * is represented in the comment set.
 *
 * Comments reflect realistic Cabala dos Caminhos content: reverent sacred
 * terminology, cross-tradition comparisons, the occasional ambiguous phrase
 * that the moderation engine must judge contextually.
 */

import type { CommentId } from './moderation-engine.ts';
import type { ReportId, ModeratorId } from './audit-logger.ts';
import type { Tradicao } from './moderation-engine.ts';
import type { Report } from './moderation-engine.ts';
import type { Comment } from './moderation-engine.ts';
import type { Moderator } from './moderation-engine.ts';
import type { ReportReason } from './report-reasons.ts';
import type { ReportStatus } from './moderation-state.ts';

type ModPermission = 'approve' | 'deny' | 'escalate' | 'auto-flag' | 'batch-decide';
type ModRole = 'admin' | 'senior-mod' | 'mod';

// ════════════════════════════════════════════
// 3 MODERATORS
// ════════════════════════════════════════════

export const SAMPLE_MODERATORS: ReadonlyArray<Moderator> = Object.freeze([
  Object.freeze({
    id: 'mod-amara-001' as ModeratorId,
    name: 'Amara',
    role: 'admin' as ModRole,
    permissions: Object.freeze<readonly ModPermission[]>([
      'approve',
      'deny',
      'escalate',
      'auto-flag',
      'batch-decide',
    ]),
  }),
  Object.freeze({
    id: 'mod-kaeru-002' as ModeratorId,
    name: 'Kaeru',
    role: 'senior-mod' as ModRole,
    permissions: Object.freeze<readonly ModPermission[]>([
      'approve',
      'deny',
      'escalate',
      'batch-decide',
    ]),
  }),
  Object.freeze({
    id: 'mod-tibet-003' as ModeratorId,
    name: 'Tibério',
    role: 'mod' as ModRole,
    permissions: Object.freeze<readonly ModPermission[]>(['approve', 'deny']),
  }),
]);

// ════════════════════════════════════════════
// 5 COMMENTS (one per sacred tema + extras)
// ════════════════════════════════════════════

export const SAMPLE_COMMENTS: ReadonlyArray<Comment> = Object.freeze([
  Object.freeze({
    id: 'cmt-001' as CommentId,
    authorId: 'user-cigano-rae',
    authorName: 'Rae do Cigano Ramiro',
    tradicao: 'Cigano' as Tradicao,
    text: 'No baralho cigano, o 28 (Cigano) puxa o 29 (Cigana) e o eixo aponta pra família ancestral. Axé aos que honram a leitura.',
    createdAt: '2026-06-28T14:23:00.000Z',
  }),
  Object.freeze({
    id: 'cmt-002' as CommentId,
    authorId: 'user-iya-maria',
    authorName: 'Mãe Iyá Maria',
    tradicao: 'Candomblé' as Tradicao,
    text: 'O odù Èjì-Ogbè fala do orixá Ogum abrindo caminhos. Não confunda com Ogum do Ifá, são protocolos diferentes, cada um com sua reza.',
    createdAt: '2026-06-28T15:01:00.000Z',
  }),
  Object.freeze({
    id: 'cmt-003' as CommentId,
    authorId: 'user-astrologo-bruno',
    authorName: 'Bruno (astrologia cabalística)',
    tradicao: 'Astrologia' as Tradicao,
    text: 'Lilith em Escorpião na Casa 8 pedindo passagem? A Lilith negra é o inconsciente, não o demônio. Medo de nome não combina com trabalho sério.',
    createdAt: '2026-06-28T16:42:00.000Z',
  }),
  Object.freeze({
    id: 'cmt-004' as CommentId,
    authorId: 'user-cabala-ester',
    authorName: 'Ester da Cabala',
    tradicao: 'Cabala' as Tradicao,
    text: 'A árvore da vida se estuda em 22 caminhos + 10 sefirot. Não é "numerologia esotérica" genérica, é geometria sagrada. Respeitem os termos.',
    createdAt: '2026-06-29T08:15:00.000Z',
  }),
  Object.freeze({
    id: 'cmt-005' as CommentId,
    authorId: 'user-tantra-luana',
    authorName: 'Luana Tantrika',
    tradicao: 'Tantra' as Tradicao,
    text: 'COMPRE AGORA consulta de tarot com desconto!!! LINK NA BIO 50% OFF apenas hoje, clique aqui >>> promoção imperdível',
    createdAt: '2026-06-29T11:33:00.000Z',
  }),
  Object.freeze({
    id: 'cmt-006' as CommentId,
    authorId: 'user-umbanda-jorge',
    authorName: 'Jorge de Umbanda',
    tradicao: 'Umbanda' as Tradicao,
    text: 'Caboclo Flecheiro e Preto-Velho não são "exu genérico" — cada falange tem seu rito. Se for consultar, respeite o terreiro e a oferenda.',
    createdAt: '2026-06-29T13:18:00.000Z',
  }),
  Object.freeze({
    id: 'cmt-007' as CommentId,
    authorId: 'user-ifa-baba',
    authorName: 'Bàbá Ifáyemi',
    tradicao: 'Ifá' as Tradicao,
    text: 'Òjú Odù: a consulta com 16 búzios ou com opón-Ifá segue protocolos distintos. Não confunda o jogo de Ifá com o Ifá de matriz nagô.',
    createdAt: '2026-06-29T14:55:00.000Z',
  }),
]);

// ════════════════════════════════════════════
// 12 REPORTS — one per reason + extras
// ════════════════════════════════════════════

function r(
  seq: number,
  commentId: string,
  reason: ReportReason,
  status: ReportStatus,
  opts: {
    note?: string;
    reporterId?: string;
    decidedBy?: ModeratorId | null;
    decisionNote?: string | null;
    assignedTo?: ModeratorId | null;
  } = {},
): Report {
  const id = ('rep-' + seq.toString(36).padStart(4, '0')) as ReportId;
  const reporterId = (opts.reporterId ?? 'rep-' + seq.toString(36)) as unknown as Report['reporterId'];
  const created = new Date(Date.UTC(2026, 5, 28, 12 + seq, 0, 0)).toISOString();
  return Object.freeze({
    id,
    commentId: commentId as CommentId,
    reporterId,
    reason,
    note: opts.note ?? null,
    status,
    assignedModeratorId: opts.assignedTo ?? null,
    decidedBy: opts.decidedBy ?? null,
    decidedAt: opts.decidedBy ? created : null,
    decisionNote: opts.decisionNote ?? null,
    createdAt: created,
  });
}

export const SAMPLE_REPORTS: ReadonlyArray<Report> = Object.freeze([
  // 1. spam (comment 005 — blatant promo)
  r(1, 'cmt-005', 'spam' as ReportReason, 'pending', { note: 'Promoção explícita, não é conteúdo da casa.' }),
  // 2. harassment (auto-flagged — shouts sacred term with harassment marker)
  r(
    2,
    'cmt-003',
    'harassment' as ReportReason,
    'auto-flagged',
    { note: 'Língua solta, possível assédio contra iniciante.' },
  ),
  // 3. hate-speech (escalated, sensitive)
  r(
    3,
    'cmt-002',
    'hate-speech' as ReportReason,
    'escalated',
    {
      note: 'Suspeita de termo pejorativo direcionado a praticante de candomblé.',
      assignedTo: 'mod-amara-001' as ModeratorId,
      decidedBy: 'mod-kaeru-002' as ModeratorId,
      decisionNote: 'Escalado para admin revisar com conselho de axé.',
    },
  ),
  // 4. misinformation (reviewing)
  r(
    4,
    'cmt-002',
    'misinformation' as ReportReason,
    'reviewing',
    {
      note: 'Diferença entre Ogum do Candomblé e Ogum do Ifá pode confundir leitores.',
      assignedTo: 'mod-kaeru-002' as ModeratorId,
    },
  ),
  // 5. lgpd-violation (pending — high severity)
  r(
    5,
    'cmt-003',
    'lgpd-violation' as ReportReason,
    'pending',
    { note: 'Aparentemente expôs nome completo de terceiro sem consentimento.' },
  ),
  // 6. tradition-misrepresentation (denied by Kaeru)
  r(
    6,
    'cmt-001',
    'tradition-misrepresentation' as ReportReason,
    'denied',
    {
      note: 'Rae misturou protocolo cigano com saudação de axé; rito cultural aceitável.',
      assignedTo: 'mod-kaeru-002' as ModeratorId,
      decidedBy: 'mod-kaeru-002' as ModeratorId,
      decisionNote: 'Não é deturpação, é saudação ritual. Reporte negado.',
    },
  ),
  // 7. off-topic (denied — actually on-topic)
  r(
    7,
    'cmt-004',
    'off-topic' as ReportReason,
    'denied',
    {
      note: 'Achei que Cabala não cabia em discussão de tarot.',
      assignedTo: 'mod-tibet-003' as ModeratorId,
      decidedBy: 'mod-tibet-003' as ModeratorId,
      decisionNote: 'Cabala é base do tarot hermético, totalmente on-topic.',
    },
  ),
  // 8. other — approved with note (will require note on resolve)
  r(
    8,
    'cmt-001',
    'other' as ReportReason,
    'pending',
    { note: 'Não sei categorizar — comentarista citou Caboclo sem contexto ritual.' },
  ),
  // 9. spam #2 — different comment, escalation
  r(
    9,
    'cmt-005',
    'spam' as ReportReason,
    'reviewing',
    {
      note: 'Mesmo autor, segundo comentário promocional.',
      assignedTo: 'mod-kaeru-002' as ModeratorId,
    },
  ),
  // 10. lgpd-violation #2 — escalated
  r(
    10,
    'cmt-004',
    'lgpd-violation' as ReportReason,
    'escalated',
    {
      note: 'Suspeita de exposição de email de terceiro no texto.',
      assignedTo: 'mod-amara-001' as ModeratorId,
      decidedBy: 'mod-amara-001' as ModeratorId,
      decisionNote: 'Verificar com admin + LGPD officer.',
    },
  ),
  // 11. misinformation #2 — Tantra
  r(
    11,
    'cmt-005',
    'misinformation' as ReportReason,
    'pending',
    { note: 'Tantra não é o que o autor descreveu; pode confundir praticantes.' },
  ),
  // 12. tradition-misrepresentation #2 — pending
  r(
    12,
    'cmt-003',
    'tradition-misrepresentation' as ReportReason,
    'pending',
    { note: 'Termo "demônio" usado pra Lilith deturpa tradição astrológica.' },
  ),
]);

/** All 8 reasons covered by the 12 reports. Used by tests. */
export const SAMPLE_REASON_COVERAGE: ReadonlyArray<ReportReason> = Object.freeze([
  'spam' as ReportReason,
  'harassment' as ReportReason,
  'hate-speech' as ReportReason,
  'misinformation' as ReportReason,
  'lgpd-violation' as ReportReason,
  'tradition-misrepresentation' as ReportReason,
  'off-topic' as ReportReason,
  'other' as ReportReason,
]);

/** All 7 tradições covered across the 5 sample comments. */
export const SAMPLE_TRADITION_COVERAGE: ReadonlyArray<Tradicao> = Object.freeze([
  'Cigano' as Tradicao,
  'Candomblé' as Tradicao,
  'Umbanda' as Tradicao,
  'Ifá' as Tradicao,
  'Cabala' as Tradicao,
  'Astrologia' as Tradicao,
  'Tantra' as Tradicao,
]);