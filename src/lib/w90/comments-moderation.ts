// ============================================================================
// COMMENTS MODERATION ENGINE — W90-D
// ============================================================================
// Fila de moderação para a comunidade. Comentários que disparam qualquer uma
// das 6 regras (spam, ofensa, conteúdo impróprio, desinformação, golpe,
// política) são roteados para uma fila onde moderadores podem aprovar,
// rejeitar ou escalar.
//
// Princípios:
//   - Pura, sem I/O (não acessa DB, fetch, cookies, etc.)
//   - Funções congeladas (Object.freeze) no module surface
//   - Tipos branded (evita troca acidental entre IDs)
//   - Linguagem respeitosa, não punitiva ("revisar", "orientar")
//   - Sem amarração / vinculação de identidade — apenas conteúdo
//
// Spec: 50+ asserts (src/lib/w90/__tests__/comments-moderation.spec.tsx)
// Smoke: 12+ asserts runtime (scripts/smoke-comments-moderation.mjs)
// ============================================================================

// ----------------------------------------------------------------------------
// Brand types (evita troca acidental entre IDs)
// ----------------------------------------------------------------------------
declare const __brand: unique symbol;
type Brand<TBase, TBrand extends string> = TBase & { readonly [__brand]: TBrand };

export type CommentId = Brand<string, 'CommentId'>;
export type UserId = Brand<string, 'UserId'>;
export type RuleId = Brand<string, 'RuleId'>;
export type QueueItemId = Brand<string, 'QueueItemId'>;

export const asCommentId = (s: string): CommentId => s as CommentId;
export const asUserId = (s: string): UserId => s as UserId;
export const asRuleId = (s: string): RuleId => s as RuleId;
export const asQueueItemId = (s: string): QueueItemId => s as QueueItemId;

// ----------------------------------------------------------------------------
// Tipos públicos
// ----------------------------------------------------------------------------

/** 6 razões oficiais do projeto (sem amarração, sem vinculação). */
export type ModerationReason =
  | 'spam'
  | 'ofensa'
  | 'conteudo-improprio'
  | 'desinformacao'
  | 'golpe'
  | 'politica';

/** Ações automáticas que o motor recomenda. */
export type AutoAction = 'flag' | 'hide' | 'require-review';

/** Status da fila de moderação. */
export type QueueStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

/** Severidade da regra (1 = baixo, 2 = médio, 3 = alto). */
export type Severity = 1 | 2 | 3;

/** Matcher aceita RegExp OU função (extensibilidade). */
export type RuleMatcher = RegExp | ((text: string) => boolean);

/** Definição de uma regra de moderação. */
export interface ModerationRule {
  readonly id: RuleId;
  readonly reason: ModerationReason;
  readonly label: string;
  readonly matcher: RuleMatcher;
  readonly severity: Severity;
  readonly autoAction: AutoAction;
  /** Descrição visível para moderadores (linguagem respeitosa). */
  readonly description: string;
}

/** Flag gerada quando uma regra dispara sobre um comentário. */
export interface ModerationFlag {
  readonly commentId: CommentId;
  readonly userId: UserId;
  readonly text: string;
  readonly matchedRule: RuleId;
  readonly reason: ModerationReason;
  readonly severity: Severity;
  readonly flaggedAt: number;
}

/** Item da fila de moderação (estado completo). */
export interface ModerationQueueItem {
  readonly id: QueueItemId;
  readonly flag: ModerationFlag;
  readonly status: QueueStatus;
  readonly assignedModeratorId: UserId | null;
  readonly resolvedAt: number | null;
  readonly resolutionNote: string | null;
}

/** Estatísticas agregadas da fila. */
export interface QueueStats {
  readonly total: number;
  readonly pending: number;
  readonly approved: number;
  readonly rejected: number;
  readonly escalated: number;
  readonly byReason: Readonly<Record<ModerationReason, number>>;
  readonly bySeverity: Readonly<Record<Severity, number>>;
}

// ----------------------------------------------------------------------------
// Regras default (6 razões oficiais, severidades mistas)
// ----------------------------------------------------------------------------
// IMPORTANTE: matchers são CASE-INSENSITIVE e testam contra o texto bruto.
// Linguagem direta, sem palavras-chave raciais/religiosas.
// ----------------------------------------------------------------------------

/** Helper para criar um RegExp case-insensitive a partir de keywords. */
function kw(...keywords: string[]): RegExp {
  // Escapa regex metachars para cada keyword
  const escaped = keywords.map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'iu');
}

const RULE_SPAM: ModerationRule = {
  id: asRuleId('rule-spam'),
  reason: 'spam',
  label: 'Spam ou autopromoção',
  matcher: kw(
    'compre agora',
    'clique aqui',
    'oferta imperdível',
    'promoção',
    'ganhe dinheiro',
    'renda extra',
    'trabalhe em casa',
    'link na bio',
    'compre direto',
    'desconto exclusivo',
  ),
  severity: 2,
  autoAction: 'flag',
  description:
    'Padrões típicos de spam: chamada para compra, link na bio, promessa de renda fácil.',
};

const RULE_OFENSA: ModerationRule = {
  id: asRuleId('rule-ofensa'),
  reason: 'ofensa',
  label: 'Ofensa ou ataque pessoal',
  matcher: kw(
    'idiota',
    'imbecil',
    'lixo',
    'nojo',
    'vergonha',
    'palhaço',
    'inútil',
    'burro',
    'feio',
    'patético',
  ),
  severity: 3,
  autoAction: 'hide',
  description:
    'Ataques pessoais e xingamentos diretos. Conteúdo é ocultado automaticamente.',
};

const RULE_CONTEUDO_IMPROPRIO: ModerationRule = {
  id: asRuleId('rule-conteudo-improprio'),
  reason: 'conteudo-improprio',
  label: 'Conteúdo impróprio',
  matcher: kw(
    'nsfw',
    'conteúdo adulto',
    'pornografia',
    'nudez',
    'sexo explícito',
    'vulgar',
  ),
  severity: 3,
  autoAction: 'hide',
  description:
    'Material sexualmente explícito ou inadequado para o espaço da comunidade.',
};

const RULE_DESINFORMACAO: ModerationRule = {
  id: asRuleId('rule-desinformacao'),
  reason: 'desinformacao',
  label: 'Desinformação',
  matcher: kw(
    'fake news',
    'cura garantida',
    'cura o câncer',
    'terra plana',
    'fake',
    'comprovado pela ciência',
    '100% eficaz',
  ),
  severity: 2,
  autoAction: 'require-review',
  description:
    'Afirmações falsas apresentadas como verdade, curas milagrosas sem evidência.',
};

const RULE_GOLPE: ModerationRule = {
  id: asRuleId('rule-golpe'),
  reason: 'golpe',
  label: 'Golpe ou fraude',
  matcher: kw(
    'pix urgente',
    'transferência imediata',
    'empréstimo fácil',
    'cartão clonado',
    'senha do banco',
    'bitcoin grátis',
    'investimento garantido',
    'sorteio exclusivo',
  ),
  severity: 3,
  autoAction: 'hide',
  description:
    'Tentativas de fraude, phishing ou pedido de informações financeiras.',
};

const RULE_POLITICA: ModerationRule = {
  id: asRuleId('rule-politica'),
  reason: 'politica',
  label: 'Conteúdo político-partidário',
  matcher: kw(
    'vote no candidato',
    'partido x',
    'eleição 2026',
    'presidente',
    'governador',
    'vereadores',
    'esquerda radical',
    'direita radical',
    'petista',
    'bolsonarista',
  ),
  severity: 1,
  autoAction: 'flag',
  description:
    'Conteúdo político-partidário. Pode ser discutido em outros espaços; aqui pedimos foco no espiritual.',
};

/** Conjunto padrão de 6 regras (uma por razão). */
export const DEFAULT_RULES: ReadonlyArray<ModerationRule> = Object.freeze([
  RULE_SPAM,
  RULE_OFENSA,
  RULE_CONTEUDO_IMPROPRIO,
  RULE_DESINFORMACAO,
  RULE_GOLPE,
  RULE_POLITICA,
]);

// ----------------------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------------------
export const MAX_TEXT_LENGTH = 5000;
export const MAX_RESOLUTION_NOTE_LENGTH = 500;
export const QUEUE_ITEM_ID_PREFIX = 'mq';
export const FLAG_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

// ----------------------------------------------------------------------------
// Helpers internos
// ----------------------------------------------------------------------------

/** Trunca texto para tamanho máximo. */
function clampText(text: string): string {
  return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;
}

/** Strip whitespace e normaliza para lowercase. */
function normalize(text: string): string {
  return text.trim().toLowerCase();
}

/** Aplica matcher a texto. Aceita RegExp ou função. */
function matchesRule(matcher: RuleMatcher, text: string): boolean {
  if (matcher instanceof RegExp) {
    return matcher.test(text);
  }
  return Boolean(matcher(text));
}

/** Gera id de item de fila determinístico a partir de commentId + ruleId. */
function generateQueueItemId(commentId: CommentId, ruleId: RuleId): QueueItemId {
  // Combinacao simples, determinística, suficiente para IDs únicos por par.
  const suffix = `${commentId.slice(0, 8)}-${ruleId.slice(-8)}`;
  return asQueueItemId(`${QUEUE_ITEM_ID_PREFIX}-${suffix}`);
}

// ----------------------------------------------------------------------------
// API pública — funções puras
// ----------------------------------------------------------------------------

/**
 * Avalia um texto contra todas as regras.
 * Retorna a PRIMEIRA regra que casar (severidade desempata; ordem da lista é tiebreaker).
 * Retorna null se nenhuma regra casar.
 */
export function evaluateComment(
  text: string,
  rules: ReadonlyArray<ModerationRule> = DEFAULT_RULES,
): ModerationRule | null {
  if (typeof text !== 'string' || text.length === 0) {
    return null;
  }
  const lower = normalize(text);

  // Ordena por severidade decrescente para pegar a regra mais grave primeiro
  const sorted = [...rules].sort((a, b) => b.severity - a.severity);
  for (const rule of sorted) {
    if (matchesRule(rule.matcher, lower)) {
      return rule;
    }
  }
  return null;
}

/**
 * Cria um item de fila a partir de uma flag.
 * Status inicial: 'pending', sem moderador atribuído.
 */
export function createQueueItem(
  flag: ModerationFlag,
  options?: { id?: QueueItemId },
): ModerationQueueItem {
  const id = options?.id ?? generateQueueItemId(flag.commentId, flag.matchedRule);
  return Object.freeze({
    id,
    flag,
    status: 'pending' as QueueStatus,
    assignedModeratorId: null,
    resolvedAt: null,
    resolutionNote: null,
  });
}

/**
 * Atribui um moderador ao item (não muda status).
 * Retorna novo objeto (imutabilidade).
 */
export function assignToModerator(
  item: ModerationQueueItem,
  moderatorId: UserId,
): ModerationQueueItem {
  if (!item || typeof item !== 'object') {
    throw new Error('assignToModerator: item inválido');
  }
  if (item.status !== 'pending') {
    throw new Error(`assignToModerator: item já resolvido (status=${item.status})`);
  }
  if (typeof moderatorId !== 'string' || moderatorId.length === 0) {
    throw new Error('assignToModerator: moderatorId inválido');
  }
  return Object.freeze({
    ...item,
    assignedModeratorId: moderatorId,
  });
}

/** Hook helper (mantém `note` interno pra reutilizar). */
function resolveItem(
  item: ModerationQueueItem,
  status: Extract<QueueStatus, 'approved' | 'rejected' | 'escalated'>,
  note: string,
): ModerationQueueItem {
  if (!item || typeof item !== 'object') {
    throw new Error('resolveItem: item inválido');
  }
  if (item.status !== 'pending') {
    throw new Error(`resolveItem: item já resolvido (status=${item.status})`);
  }
  const trimmed = (note ?? '').trim();
  if (trimmed.length > MAX_RESOLUTION_NOTE_LENGTH) {
    throw new Error(
      `resolveItem: note excede ${MAX_RESOLUTION_NOTE_LENGTH} caracteres`,
    );
  }
  return Object.freeze({
    ...item,
    status,
    resolvedAt: Date.now(),
    resolutionNote: trimmed.length === 0 ? null : trimmed,
  });
}

/** Aprova o item (linguagem: "orientar publicação"). */
export function approveItem(
  item: ModerationQueueItem,
  note: string = '',
): ModerationQueueItem {
  return resolveItem(item, 'approved', note);
}

/** Rejeita o item (linguagem: "orientar revisão do conteúdo"). */
export function rejectItem(
  item: ModerationQueueItem,
  note: string = '',
): ModerationQueueItem {
  return resolveItem(item, 'rejected', note);
}

/** Escala o item para revisão por outro moderador / admin. */
export function escalateItem(
  item: ModerationQueueItem,
  note: string = '',
): ModerationQueueItem {
  return resolveItem(item, 'escalated', note);
}

/**
 * Calcula estatísticas agregadas da fila.
 */
export function getQueueStats(
  items: ReadonlyArray<ModerationQueueItem>,
): QueueStats {
  const stats: QueueStats = {
    total: items.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    escalated: 0,
    byReason: {
      spam: 0,
      ofensa: 0,
      'conteudo-improprio': 0,
      desinformacao: 0,
      golpe: 0,
      politica: 0,
    },
    bySeverity: { 1: 0, 2: 0, 3: 0 },
  };

  for (const item of items) {
    if (item.status === 'pending') stats.pending += 1;
    else if (item.status === 'approved') stats.approved += 1;
    else if (item.status === 'rejected') stats.rejected += 1;
    else if (item.status === 'escalated') stats.escalated += 1;

    stats.byReason[item.flag.reason] += 1;
    stats.bySeverity[item.flag.severity] += 1;
  }

  return Object.freeze({
    ...stats,
    byReason: Object.freeze({ ...stats.byReason }),
    bySeverity: Object.freeze({ ...stats.bySeverity }),
  });
}

/**
 * Filtra itens pendentes atribuídos a um moderador específico.
 * Items já resolvidos são excluídos.
 */
export function getPendingForModerator(
  items: ReadonlyArray<ModerationQueueItem>,
  moderatorId: UserId,
): ReadonlyArray<ModerationQueueItem> {
  if (typeof moderatorId !== 'string' || moderatorId.length === 0) {
    return Object.freeze([]);
  }
  return Object.freeze(
    items.filter(
      (it) =>
        it.status === 'pending' &&
        it.assignedModeratorId !== null &&
        it.assignedModeratorId === moderatorId,
    ),
  );
}

/**
 * Filtra itens por status (helper genérico).
 */
export function filterByStatus(
  items: ReadonlyArray<ModerationQueueItem>,
  status: QueueStatus,
): ReadonlyArray<ModerationQueueItem> {
  return Object.freeze(items.filter((it) => it.status === status));
}

/**
 * Serializa fila para JSON (round-trip).
 * Datas viram ISO strings, branda types preservados.
 */
export function serializeQueue(
  items: ReadonlyArray<ModerationQueueItem>,
): string {
  return JSON.stringify(
    items.map((it) => ({
      id: it.id,
      flag: {
        commentId: it.flag.commentId,
        userId: it.flag.userId,
        text: it.flag.text,
        matchedRule: it.flag.matchedRule,
        reason: it.flag.reason,
        severity: it.flag.severity,
        flaggedAt: new Date(it.flag.flaggedAt).toISOString(),
      },
      status: it.status,
      assignedModeratorId: it.assignedModeratorId,
      resolvedAt: it.resolvedAt === null ? null : new Date(it.resolvedAt).toISOString(),
      resolutionNote: it.resolutionNote,
    })),
  );
}

/**
 * Desserializa fila de JSON. Lança se estrutura inválida.
 */
export function parseQueue(raw: string): ReadonlyArray<ModerationQueueItem> {
  if (typeof raw !== 'string') {
    throw new Error('parseQueue: raw deve ser string');
  }
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('parseQueue: payload deve ser array');
  }
  return Object.freeze(
    parsed.map((row): ModerationQueueItem => {
      if (!row || typeof row !== 'object') {
        throw new Error('parseQueue: row inválido');
      }
      return Object.freeze({
        id: asQueueItemId(String(row.id)),
        flag: Object.freeze({
          commentId: asCommentId(String(row.flag.commentId)),
          userId: asUserId(String(row.flag.userId)),
          text: clampText(String(row.flag.text ?? '')),
          matchedRule: asRuleId(String(row.flag.matchedRule)),
          reason: String(row.flag.reason) as ModerationReason,
          severity: Number(row.flag.severity) as Severity,
          flaggedAt: new Date(String(row.flag.flaggedAt)).getTime(),
        }),
        status: String(row.status) as QueueStatus,
        assignedModeratorId:
          row.assignedModeratorId === null
            ? null
            : asUserId(String(row.assignedModeratorId)),
        resolvedAt:
          row.resolvedAt === null ? null : new Date(String(row.resolvedAt)).getTime(),
        resolutionNote:
          row.resolutionNote === null ? null : String(row.resolutionNote),
      });
    }),
  );
}

/**
 * Helper: cria uma flag a partir de um match de regra + texto + user.
 * Usado pelo hook de criação.
 */
export function buildFlag(
  commentId: CommentId,
  userId: UserId,
  text: string,
  rule: ModerationRule,
  flaggedAt: number = Date.now(),
): ModerationFlag {
  return Object.freeze({
    commentId,
    userId,
    text: clampText(text),
    matchedRule: rule.id,
    reason: rule.reason,
    severity: rule.severity,
    flaggedAt,
  });
}

// ----------------------------------------------------------------------------
// Audit exports — apenas para testes (prefixo __test_exports)
// ----------------------------------------------------------------------------
export const __test_exports = Object.freeze({
  kw,
  clampText,
  normalize,
  matchesRule,
  generateQueueItemId,
  resolveItem,
});