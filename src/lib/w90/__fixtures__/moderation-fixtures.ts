// ============================================================================
// MODERATION FIXTURES — W90-D
// ============================================================================
// Mock data determinístico para a página de moderação.
// 16 items distribuídos entre as 6 razões e 4 status.
//
// IMPORTANTE: Linguagem respeitosa, sem identidade real, sem amarração.
// ============================================================================

import {
  asCommentId,
  asQueueItemId,
  asRuleId,
  asUserId,
  type ModerationQueueItem,
} from '../comments-moderation';

// ----------------------------------------------------------------------------
// Helpers de seed (determinísticos — não usar Date.now/UUID)
// ----------------------------------------------------------------------------

function flagAt(dayOffset: number): number {
  // 2026-06-30 base (UTC) — 13:00 UTC
  const base = Date.UTC(2026, 5, 30, 13, 0, 0); // month 5 = June (0-indexed)
  return base + dayOffset * 24 * 60 * 60 * 1000;
}

function flagFromParts(
  commentId: string,
  userId: string,
  ruleId: string,
  text: string,
  dayOffset: number,
): ModerationQueueItem['flag'] {
  return {
    commentId: asCommentId(commentId),
    userId: asUserId(userId),
    text,
    matchedRule: asRuleId(ruleId),
    // O reason e severity são derivados da regra; aqui fixamos pra fixture.
    // Mantemos consistência regra → reason.
    reason: reasonFromRule(ruleId),
    severity: severityFromRule(ruleId),
    flaggedAt: flagAt(dayOffset),
  } as ModerationQueueItem['flag'];
}

function reasonFromRule(ruleId: string): ModerationQueueItem['flag']['reason'] {
  if (ruleId.includes('spam')) return 'spam';
  if (ruleId.includes('ofensa')) return 'ofensa';
  if (ruleId.includes('conteudo-improprio')) return 'conteudo-improprio';
  if (ruleId.includes('desinformacao')) return 'desinformacao';
  if (ruleId.includes('golpe')) return 'golpe';
  if (ruleId.includes('politica')) return 'politica';
  throw new Error(`reasonFromRule: ruleId inválido: ${ruleId}`);
}

function severityFromRule(ruleId: string): 1 | 2 | 3 {
  if (ruleId.includes('politica')) return 1;
  if (ruleId.includes('spam') || ruleId.includes('desinformacao')) return 2;
  return 3; // ofensa, conteudo-improprio, golpe
}

function buildItem(
  id: string,
  flag: ModerationQueueItem['flag'],
  status: ModerationQueueItem['status'],
  moderatorId: string | null,
  resolvedDayOffset: number | null,
  note: string | null,
): ModerationQueueItem {
  return {
    id: asQueueItemId(id),
    flag,
    status,
    assignedModeratorId: moderatorId === null ? null : asUserId(moderatorId),
    resolvedAt: resolvedDayOffset === null ? null : flagAt(resolvedDayOffset),
    resolutionNote: note,
  };
}

// ----------------------------------------------------------------------------
// 16 itens — distribuídos em 6 razões e 4 status
// ----------------------------------------------------------------------------
// Distribuição:
//   pending: 7
//   approved: 3
//   rejected: 4
//   escalated: 2
// Por razão: spam×3, ofensa×3, conteudo-improprio×2, desinformacao×3, golpe×3, politica×2
// ----------------------------------------------------------------------------

export const FIXTURE_QUEUE: ReadonlyArray<ModerationQueueItem> = Object.freeze([
  // ----- PENDING (7) -----
  buildItem(
    'mq-pending-001',
    flagFromParts(
      'c-001',
      'u-001',
      'rule-spam',
      'Compre agora nosso ebook exclusivo, link na bio!',
      -2,
    ),
    'pending',
    'mod-001',
    null,
    null,
  ),
  buildItem(
    'mq-pending-002',
    flagFromParts(
      'c-002',
      'u-002',
      'rule-ofensa',
      'Você é um idiota por acreditar nisso.',
      -1,
    ),
    'pending',
    'mod-001',
    null,
    null,
  ),
  buildItem(
    'mq-pending-003',
    flagFromParts(
      'c-003',
      'u-003',
      'rule-desinformacao',
      'Cura garantida o câncer com este chá!',
      -1,
    ),
    'pending',
    'mod-002',
    null,
    null,
  ),
  buildItem(
    'mq-pending-004',
    flagFromParts(
      'c-004',
      'u-004',
      'rule-golpe',
      'Pix urgente, transferência imediata!',
      -3,
    ),
    'pending',
    null, // sem moderador atribuído
    null,
    null,
  ),
  buildItem(
    'mq-pending-005',
    flagFromParts(
      'c-005',
      'u-005',
      'rule-conteudo-improprio',
      'Conteúdo adulto NSFW compartilhado.',
      -1,
    ),
    'pending',
    'mod-002',
    null,
    null,
  ),
  buildItem(
    'mq-pending-006',
    flagFromParts(
      'c-006',
      'u-006',
      'rule-politica',
      'Vote no candidato X, eleição 2026!',
      -2,
    ),
    'pending',
    null,
    null,
    null,
  ),
  buildItem(
    'mq-pending-007',
    flagFromParts(
      'c-007',
      'u-007',
      'rule-spam',
      'Oferta imperdível, clique aqui!',
      0,
    ),
    'pending',
    'mod-001',
    null,
    null,
  ),

  // ----- APPROVED (3) -----
  buildItem(
    'mq-approved-001',
    flagFromParts(
      'c-101',
      'u-101',
      'rule-politica',
      'Presidente falou sobre o tema ontem.',
      -7,
    ),
    'approved',
    'mod-001',
    -6,
    'Discussão informativa, mantida com contexto.',
  ),
  buildItem(
    'mq-approved-002',
    flagFromParts(
      'c-102',
      'u-102',
      'rule-desinformacao',
      'A ciência comprova este efeito?',
      -8,
    ),
    'approved',
    'mod-002',
    -7,
    'Pergunta legítima, não desinformação.',
  ),
  buildItem(
    'mq-approved-003',
    flagFromParts(
      'c-103',
      'u-103',
      'rule-spam',
      'Promoção de evento da comunidade.',
      -10,
    ),
    'approved',
    'mod-001',
    -9,
    'Evento legítimo da rede.',
  ),

  // ----- REJECTED (4) -----
  buildItem(
    'mq-rejected-001',
    flagFromParts(
      'c-201',
      'u-201',
      'rule-golpe',
      'Empréstimo fácil sem consulta!',
      -5,
    ),
    'rejected',
    'mod-002',
    -4,
    'Conteúdo removido — orientar usuário sobre golpes.',
  ),
  buildItem(
    'mq-rejected-002',
    flagFromParts(
      'c-202',
      'u-202',
      'rule-ofensa',
      'Você é um lixo, nojo!',
      -4,
    ),
    'rejected',
    'mod-001',
    -3,
    'Conteúdo ocultado — comunicação respeitosa.',
  ),
  buildItem(
    'mq-rejected-003',
    flagFromParts(
      'c-203',
      'u-203',
      'rule-conteudo-improprio',
      'Nudez e sexo explícito compartilhado.',
      -6,
    ),
    'rejected',
    'mod-002',
    -5,
    'Conteúdo removido — política de comunidade.',
  ),
  buildItem(
    'mq-rejected-004',
    flagFromParts(
      'c-204',
      'u-204',
      'rule-desinformacao',
      'Terra plana comprovado pela ciência!',
      -3,
    ),
    'rejected',
    'mod-001',
    -2,
    'Afirmação falsa apresentada como fato.',
  ),

  // ----- ESCALATED (2) -----
  buildItem(
    'mq-escalated-001',
    flagFromParts(
      'c-301',
      'u-301',
      'rule-golpe',
      'Cartão clonado, senha do banco solicitada.',
      -2,
    ),
    'escalated',
    'mod-001',
    -1,
    'Escalado para admin — padrão grave de phishing.',
  ),
  buildItem(
    'mq-escalated-002',
    flagFromParts(
      'c-302',
      'u-302',
      'rule-ofensa',
      'Bando de imbecis, vocês são lixos!',
      -1,
    ),
    'escalated',
    'mod-002',
    0,
    'Escalado para revisão admin — alvo coletivo.',
  ),
]);

// ----------------------------------------------------------------------------
// Helpers de UI
// ----------------------------------------------------------------------------

/** Labels em PT-BR para UI (reutilizável em componentes). */
export const REASON_LABELS: Readonly<Record<string, string>> = Object.freeze({
  spam: 'Spam',
  ofensa: 'Ofensa',
  'conteudo-improprio': 'Conteúdo impróprio',
  desinformacao: 'Desinformação',
  golpe: 'Golpe',
  politica: 'Política',
});

/** Cores por severidade (Tailwind classes, sem jail/red). */
export const SEVERITY_BADGES: Readonly<Record<string, string>> = Object.freeze({
  1: 'bg-blue-100 text-blue-800 border-blue-300',
  2: 'bg-amber-100 text-amber-800 border-amber-300',
  3: 'bg-rose-100 text-rose-800 border-rose-300',
});

/** Labels de status (linguagem respeitosa). */
export const STATUS_LABELS: Readonly<Record<string, string>> = Object.freeze({
  pending: 'Aguardando revisão',
  approved: 'Aprovado',
  rejected: 'Orientado para revisão',
  escalated: 'Escalado',
});