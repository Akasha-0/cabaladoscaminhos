// ============================================================================
// comments-moderation.ts — Engine de moderação suave para comentários
// ============================================================================
// Princípios (Cabala dos Caminhos — soft-touch moderation):
//
//  1. SEM strike / warning / mute / ban / punição.
//     Acolhimento + presença + diálogo é o caminho. Esta engine NÃO usa
//     vocabulário punitivo em nenhuma superfície pública.
//
//  2. Idempotência de report: o mesmo `(reporterId, commentId)` é um único
//     report. Convergir ao invés de escalar contagens por spam-clique.
//
//  3. Auditoria COM identidade do steward / autor do comentário + COM reason,
//     mas SEM expor quem reportou (LGPD Art. 18 — minimização).
//
//  4. Mensagem privada ao autor é OPCIONAL e SEM template automático.
//     Humana, contextual, ≤500 chars. Nunca exposta publicamente.
//
//  5. RBAC: somente `role === 'community_steward'` pode triar.
//     Comentário do autor nunca vê status "hidden" — vê apenas silêncio /
//     notificação genérica "Aguarde revisão".
//
// Superfície pública (8 funções + 7 tipos):
//   - flagComment()                   — reporter cria report (idempotente)
//   - listFlaggedComments()           — paginada, filtra por status/reason/datas
//   - getFlaggedComment()             — detalhe p/ steward (sem identidades)
//   - triageComment()                 — hide | restore | no-action (RBAC)
//   - sendPrivateMessage()            — in-app DM p/ autor (sem e-mail)
//   - listPrivateMessagesForUser()    — DMs recebidas pelo autor
//   - getModerationLog()              — audit trail completo
//   - isSteward()                     — RBAC guard
//
// Estado é in-memory (Map). Em produção, troque por Prisma + Postgres. A
// interface pública é estável; o storage é injectable via createStore().
// ============================================================================

// ----------------------------------------------------------------------------
// Brand types — IDs tipados sem Object.freeze (lesson W91+: freeze quebra
// narrowing em strict-mode).
// ----------------------------------------------------------------------------

export type UserId = string & { readonly __brand: 'UserId' };
export type CommentId = string & { readonly __brand: 'CommentId' };
export type ReportId = string & { readonly __brand: 'ReportId' };
export type AuditId = string & { readonly __brand: 'AuditId' };
export type PrivateMessageId = string & { readonly __brand: 'PrivateMessageId' };

export function asUserId(s: string): UserId {
  return s as UserId;
}
export function asCommentId(s: string): CommentId {
  return s as CommentId;
}
export function asReportId(s: string): ReportId {
  return s as ReportId;
}
export function asAuditId(s: string): AuditId {
  return s as AuditId;
}
export function asPrivateMessageId(s: string): PrivateMessageId {
  return s as PrivateMessageId;
}

// ----------------------------------------------------------------------------
// Vocabulário do domínio
// ----------------------------------------------------------------------------

/** 5 razões canônicas (sem over-granularidade). */
export const REPORT_REASONS = ['SPAM', 'HARASSMENT', 'MISINFO', 'OFF_TOPIC', 'OTHER'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** Status do comment NA fila de moderação (não confundir com "punido"). */
export const FLAG_STATUSES = ['PENDING', 'TRIAGED_HIDDEN', 'TRIAGED_RESTORED', 'TRIAGED_NO_ACTION'] as const;
export type FlagStatus = (typeof FLAG_STATUSES)[number];

/** Ações do steward (todas humanas, sem automação). */
export const TRIAGE_ACTIONS = ['hide', 'restore', 'no-action'] as const;
export type TriageAction = (typeof TRIAGE_ACTIONS)[number];

/** Roles. */
export type UserRole = 'community_member' | 'community_steward' | 'platform_admin';

/** Rótulos i18n PT-BR (tom acolhedor). NÃO usar strike/warning/mute/ban. */
export const REASON_LABELS: Readonly<Record<ReportReason, string>> = {
  SPAM: 'Spam ou autopromoção',
  HARASSMENT: 'Acolhimento comprometido (conteúdo que afasta pessoas)',
  MISINFO: 'Informação que precisa de cuidado',
  OFF_TOPIC: 'Fora do tom da conversa',
  OTHER: 'Outro motivo (descreva com suas palavras)',
};

export const REASON_HELPERS: Readonly<Record<ReportReason, string>> = {
  SPAM: 'Links repetidos, venda, golpe — sem convite à conversa.',
  HARASSMENT: 'Ataques pessoais, intimidação, discurso que afasta pertencimento.',
  MISINFO: 'Fato apresentado como verdade mas que pode confundir.',
  OFF_TOPIC: 'Não combina com o tom deste espaço.',
  OTHER: 'Se você sente, vale trazer. Cuidadores leem com presença.',
};

export const STATUS_LABELS: Readonly<Record<FlagStatus, string>> = {
  PENDING: 'Aguardando cuidado',
  TRIAGED_HIDDEN: 'Cuidado aplicado (oculto)',
  TRIAGED_RESTORED: 'Restaurado — sem necessidade de ação',
  TRIAGED_NO_ACTION: 'Visto e acolhido sem mudança',
};

export const ACTION_LABELS: Readonly<Record<TriageAction, string>> = {
  hide: 'Ocultar',
  restore: 'Restaurar',
  'no-action': 'Acolhimento sem mudança',
};

// ----------------------------------------------------------------------------
// Erros tipados (cada mensagem SEM vocabulário punitivo)
// ----------------------------------------------------------------------------

export class ModerationError extends Error {
  readonly code:
    | 'NOT_STEWARD'
    | 'NOT_AUTHENTICATED'
    | 'INVALID_REASON'
    | 'COMMENT_NOT_FOUND'
    | 'REPORT_NOT_FOUND'
    | 'MESSAGE_TOO_LONG'
    | 'EMPTY_MESSAGE'
    | 'SELF_REPORT_BLOCKED'
    | 'COMMENT_ALREADY_HIDDEN'
    | 'COMMENT_NOT_HIDDEN'
    | 'INVALID_DATE_RANGE';
  constructor(
    code: ModerationError['code'],
    message: string
  ) {
    super(message);
    this.name = 'ModerationError';
    this.code = code;
  }
}

// ----------------------------------------------------------------------------
// Records
// ----------------------------------------------------------------------------

export interface Report {
  readonly id: ReportId;
  readonly reporterId: UserId; // armazenado, mas nunca devolvido publicamente
  readonly commentId: CommentId;
  readonly reason: ReportReason;
  readonly details: string | null;
  readonly createdAt: string; // ISO
}

/** Estado do comment na fila. `hiddenAt` é setado pelo steward em hide. */
export interface FlaggedComment {
  readonly commentId: CommentId;
  readonly authorId: UserId;
  readonly authorDisplayName: string; // público
  readonly excerpt: string; // truncado em 200 chars pela store
  readonly status: FlagStatus;
  readonly reports: readonly Report[]; // store.removeReporterIds() antes de devolver
  readonly createdAt: string; // ISO
  readonly firstFlaggedAt: string; // ISO
  readonly hiddenAt: string | null;
  readonly restoredAt: string | null;
  readonly triagedBy: UserId | null;
}

export interface AuditEntry {
  readonly id: AuditId;
  readonly commentId: CommentId;
  readonly actorId: UserId;
  readonly actorRole: UserRole;
  readonly action: 'FLAG_SUBMITTED' | 'TRIAGE_HIDE' | 'TRIAGE_RESTORE' | 'TRIAGE_NO_ACTION' | 'PRIVATE_MESSAGE_SENT';
  readonly note: string | null;
  readonly createdAt: string; // ISO
}

export interface PrivateMessage {
  readonly id: PrivateMessageId;
  readonly fromStewardId: UserId;
  readonly toUserId: UserId;
  readonly commentId: CommentId;
  readonly body: string;
  readonly sentAt: string; // ISO
  readonly readAt: string | null;
}

export interface User {
  readonly id: UserId;
  readonly displayName: string;
  readonly role: UserRole;
}

export interface Comment {
  readonly id: CommentId;
  readonly authorId: UserId;
  readonly authorDisplayName: string;
  readonly body: string;
  readonly createdAt: string;
}

// ----------------------------------------------------------------------------
// Filtros + paginação
// ----------------------------------------------------------------------------

export interface FlagFilters {
  readonly status?: readonly FlagStatus[];
  readonly reasons?: readonly ReportReason[];
  /** ISO string; inclusivo no start, exclusivo no end se ambos enviados. */
  readonly fromDate?: string;
  readonly toDate?: string;
  /** `limit` (padrão 20, máx 100), `offset` (padrão 0). */
  readonly page?: { limit: number; offset: number };
}

export interface FlagPage {
  readonly items: readonly FlaggedComment[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
}

// ----------------------------------------------------------------------------
// Store — interface injetável (trocar por Prisma em produção)
// ----------------------------------------------------------------------------

export interface ModerationStore {
  // Comments
  getComment(commentId: CommentId): Comment | null;
  upsertComment(comment: Comment): void;
  // Reports
  upsertReport(r: Omit<Report, 'id' | 'createdAt'>): Report | null; // null se já existe (idempotência)
  listReports(commentId: CommentId): readonly Report[];
  // Flag state (one per comment)
  setFlagStatus(commentId: CommentId, patch: Partial<Pick<FlaggedComment, 'status' | 'hiddenAt' | 'restoredAt' | 'triagedBy'>>): void;
  getFlagState(commentId: CommentId): FlaggedComment | null;
  listFlagState(filters: FlagFilters): readonly FlaggedComment[];
  // Audit
  appendAudit(e: Omit<AuditEntry, 'id' | 'createdAt'>): AuditEntry;
  listAudit(commentId: CommentId): readonly AuditEntry[];
  // Private messages
  appendPrivateMessage(m: Omit<PrivateMessage, 'id' | 'sentAt' | 'readAt'>): PrivateMessage;
  listPrivateMessagesToUser(userId: UserId): readonly PrivateMessage[];
  // Users
  upsertUser(u: User): void;
  getUser(userId: UserId): User | null;
}

// ----------------------------------------------------------------------------
// Store in-memory — createMemoryStore()
// ----------------------------------------------------------------------------

export function createMemoryStore(): ModerationStore {
  const comments = new Map<CommentId, Comment>();
  const users = new Map<UserId, User>();
  const reports = new Map<CommentId, Report[]>(); // comment → reports
  const flagState = new Map<CommentId, FlaggedComment>();
  const audit: AuditEntry[] = [];
  const dms: PrivateMessage[] = [];

  // tiny monotonic counters for ids
  let reportSeq = 0;
  let auditSeq = 0;
  let dmSeq = 0;
  const now = () => new Date().toISOString();

  const flagStateOrCreate = (commentId: CommentId): FlaggedComment | null => {
    const existing = flagState.get(commentId);
    if (existing) return existing;
    const comment = comments.get(commentId);
    if (!comment) return null;
    const fresh: FlaggedComment = {
      commentId,
      authorId: comment.authorId,
      authorDisplayName: comment.authorDisplayName,
      excerpt: comment.body.length > 200 ? `${comment.body.slice(0, 200)}…` : comment.body,
      status: 'PENDING',
      reports: [],
      createdAt: comment.createdAt,
      firstFlaggedAt: now(),
      hiddenAt: null,
      restoredAt: null,
      triagedBy: null,
    };
    flagState.set(commentId, fresh);
    return fresh;
  };

  return {
    getComment(commentId) {
      return comments.get(commentId) ?? null;
    },
    upsertComment(c) {
      comments.set(c.id, c);
      // se já estava flagado, atualiza excerpt baseado no body novo (autor pode ter editado)
      const flag = flagState.get(c.id);
      if (flag) {
        const updated: FlaggedComment = {
          ...flag,
          excerpt: c.body.length > 200 ? `${c.body.slice(0, 200)}…` : c.body,
        };
        flagState.set(c.id, updated);
      }
    },

    upsertReport(r) {
      const existing = reports.get(r.commentId) ?? [];
      const dup = existing.find(
        (rep) => rep.reporterId === r.reporterId && rep.reason === r.reason
      );
      if (dup) return null; // idempotente — não duplica
      const id = asReportId(`rep_${Date.now().toString(36)}_${(++reportSeq).toString(36)}`);
      const record: Report = {
        id,
        reporterId: r.reporterId,
        commentId: r.commentId,
        reason: r.reason,
        details: r.details,
        createdAt: now(),
      };
      reports.set(r.commentId, [...existing, record]);
      const flag = flagStateOrCreate(r.commentId);
      if (flag) {
        flagState.set(r.commentId, { ...flag, reports: [...flag.reports, record] });
      }
      return record;
    },
    listReports(commentId) {
      return reports.get(commentId) ?? [];
    },

    setFlagStatus(commentId, patch) {
      const flag = flagState.get(commentId);
      if (!flag) return;
      flagState.set(commentId, { ...flag, ...patch });
    },
    getFlagState(commentId) {
      return flagState.get(commentId) ?? null;
    },
    listFlagState(filters) {
      const all = Array.from(flagState.values());
      const filtered = all.filter((f) => {
        if (filters.status?.length && !filters.status.includes(f.status)) return false;
        if (filters.reasons?.length) {
          const hasReason = f.reports.some((r) => filters.reasons!.includes(r.reason));
          if (!hasReason) return false;
        }
        if (filters.fromDate && f.firstFlaggedAt < filters.fromDate) return false;
        if (filters.toDate && f.firstFlaggedAt >= filters.toDate) return false;
        return true;
      });
      filtered.sort((a, b) => (a.firstFlaggedAt < b.firstFlaggedAt ? 1 : -1)); // mais recente primeiro
      const limit = filters.page?.limit ?? 20;
      const offset = filters.page?.offset ?? 0;
      const slice = filtered.slice(offset, offset + limit);
      return slice;
    },

    appendAudit(e) {
      const id = asAuditId(`aud_${Date.now().toString(36)}_${(++auditSeq).toString(36)}`);
      const record: AuditEntry = { id, createdAt: now(), ...e };
      audit.push(record);
      return record;
    },
    listAudit(commentId) {
      return audit.filter((a) => a.commentId === commentId);
    },

    appendPrivateMessage(m) {
      const id = asPrivateMessageId(`pm_${Date.now().toString(36)}_${(++dmSeq).toString(36)}`);
      const record: PrivateMessage = { id, sentAt: now(), readAt: null, ...m };
      dms.push(record);
      return record;
    },
    listPrivateMessagesToUser(userId) {
      return dms.filter((m) => m.toUserId === userId);
    },

    upsertUser(u) {
      users.set(u.id, u);
    },
    getUser(userId) {
      return users.get(userId) ?? null;
    },
  };
}

// ----------------------------------------------------------------------------
// Helpers internos
// ----------------------------------------------------------------------------

function validateDateRange(filters: FlagFilters): void {
  if (filters.fromDate && Number.isNaN(Date.parse(filters.fromDate))) {
    throw new ModerationError('INVALID_DATE_RANGE', 'fromDate inválido (espera ISO 8601).');
  }
  if (filters.toDate && Number.isNaN(Date.parse(filters.toDate))) {
    throw new ModerationError('INVALID_DATE_RANGE', 'toDate inválido (espera ISO 8601).');
  }
  if (filters.fromDate && filters.toDate && filters.fromDate >= filters.toDate) {
    throw new ModerationError('INVALID_DATE_RANGE', 'fromDate deve ser anterior a toDate.');
  }
}

function trimBody(body: string): string {
  return body.trim();
}

// ----------------------------------------------------------------------------
// 8 funções públicas — todas named exports
// ----------------------------------------------------------------------------

/**
 * flagComment — registra um report. Idempotente por (reporterId, commentId).
 * Não exige role especial: qualquer membro pode sinalizar.
 */
export function flagComment(
  store: ModerationStore,
  ctx: {
    reporter: User;
    commentId: CommentId;
    reason: ReportReason;
    details?: string | null;
  }
): { report: Report; alreadyReported: boolean } {
  const { reporter, commentId, reason, details = null } = ctx;
  if (!reporter?.id) {
    throw new ModerationError('NOT_AUTHENTICATED', 'Reporter sem identidade.');
  }
  if (!REPORT_REASONS.includes(reason)) {
    throw new ModerationError('INVALID_REASON', `Motivo '${reason}' não reconhecido.`);
  }
  const comment = store.getComment(commentId);
  if (!comment) {
    throw new ModerationError('COMMENT_NOT_FOUND', 'Comentário não encontrado.');
  }
  if (comment.authorId === reporter.id) {
    throw new ModerationError(
      'SELF_REPORT_BLOCKED',
      'Você não precisa sinalizar o próprio comentário. Use editar.'
    );
  }
  store.upsertUser(reporter);
  const record = store.upsertReport({
    reporterId: reporter.id,
    commentId,
    reason,
    details: details && trimBody(details).length > 0 ? trimBody(details).slice(0, 500) : null,
  });
  if (record) {
    store.appendAudit({
      commentId,
      actorId: reporter.id,
      actorRole: reporter.role,
      action: 'FLAG_SUBMITTED',
      note: `reason=${reason}`,
    });
  }
  const final = store.listReports(commentId);
  const mine = final.find((r) => r.reporterId === reporter.id);
  if (!mine) {
    // impossível — upsert idempotente mas alguma race; falhamos graceful
    throw new ModerationError('REPORT_NOT_FOUND', 'Falha interna registrando sinalização.');
  }
  return { report: mine, alreadyReported: record === null };
}

/**
 * listFlaggedComments — paginada, filtra status / reason / intervalo de datas.
 * SEMPRE remove identidades dos reporters antes de devolver.
 */
export function listFlaggedComments(
  store: ModerationStore,
  viewer: User,
  filters: FlagFilters = {}
): FlagPage {
  if (!isSteward(viewer)) {
    throw new ModerationError('NOT_STEWARD', 'Apenas cuidadores veem a fila.');
  }
  validateDateRange(filters);
  const limit = Math.min(Math.max(filters.page?.limit ?? 20, 1), 100);
  const offset = Math.max(filters.page?.offset ?? 0, 0);
  const page = { limit, offset };
  // Para o `total` calculamos sem paginação (page indefinido).
  // IMPORTANTE: passar `page: undefined` explicitamente senão o spread
  // `{ ...filters }` mantém o `page` original e a store pagina de novo.
  const allCount = store.listFlagState({ ...filters, page: undefined }).length;
  // Agora a página corrente (paginada)
  const allInPage = store.listFlagState({ ...filters, page });
  // Remove identidades dos reporters — só count por reason
  const items = allInPage.map(stripReporterIdentities);
  return {
    items,
    total: allCount,
    limit,
    offset,
    hasMore: offset + items.length < allCount,
  };
}

/** getFlaggedComment — detalhe para o steward (sem identidades). */
export function getFlaggedComment(
  store: ModerationStore,
  viewer: User,
  commentId: CommentId
): FlaggedComment | null {
  if (!isSteward(viewer)) {
    throw new ModerationError('NOT_STEWARD', 'Apenas cuidadores veem detalhes.');
  }
  const flag = store.getFlagState(commentId);
  if (!flag) return null;
  return stripReporterIdentities(flag);
}

/**
 * triageComment — steward aplica ação humana:
 *   - 'hide'         → status=TRIAGED_HIDDEN, hiddenAt=now
 *   - 'restore'      → status=TRIAGED_RESTORED, restoredAt=now
 *   - 'no-action'    → status=TRIAGED_NO_ACTION (visto e acolhido)
 *
 * privateMessage opcional — se fornecida, envia DM in-app ao autor.
 */
export function triageComment(
  store: ModerationStore,
  ctx: {
    steward: User;
    commentId: CommentId;
    action: TriageAction;
    privateMessage?: string;
  }
): { flag: FlaggedComment; privateMessageId: PrivateMessageId | null } {
  const { steward, commentId, action, privateMessage } = ctx;
  if (!isSteward(steward)) {
    throw new ModerationError('NOT_STEWARD', 'Ação requer perfil de cuidador.');
  }
  if (!TRIAGE_ACTIONS.includes(action)) {
    throw new ModerationError('INVALID_REASON', `Ação '${action}' não reconhecida.`);
  }
  const flag = store.getFlagState(commentId);
  if (!flag) {
    throw new ModerationError('COMMENT_NOT_FOUND', 'Comentário não está na fila.');
  }
  if (action === 'hide' && flag.status === 'TRIAGED_HIDDEN') {
    throw new ModerationError('COMMENT_ALREADY_HIDDEN', 'Comentário já acolhido com ocultação.');
  }
  if (action === 'restore' && flag.status !== 'TRIAGED_HIDDEN') {
    throw new ModerationError('COMMENT_NOT_HIDDEN', 'Comentário não está oculto para restaurar.');
  }

  const nowIso = new Date().toISOString();
  const next: Partial<FlaggedComment> = {
    triagedBy: steward.id,
    ...(action === 'hide' && { status: 'TRIAGED_HIDDEN', hiddenAt: nowIso, restoredAt: null }),
    ...(action === 'restore' && { status: 'TRIAGED_RESTORED', restoredAt: nowIso }),
    ...(action === 'no-action' && { status: 'TRIAGED_NO_ACTION' }),
  };
  store.setFlagStatus(commentId, next);

  store.appendAudit({
    commentId,
    actorId: steward.id,
    actorRole: steward.role,
    action:
      action === 'hide'
        ? 'TRIAGE_HIDE'
        : action === 'restore'
        ? 'TRIAGE_RESTORE'
        : 'TRIAGE_NO_ACTION',
    note: null,
  });

  let pmId: PrivateMessageId | null = null;
  const body = privateMessage ? trimBody(privateMessage) : '';
  if (body.length > 0) {
    const sent = sendPrivateMessage(store, {
      fromSteward: steward,
      toUserId: flag.authorId,
      commentId,
      body,
    });
    pmId = sent.id;
  }
  const updated = store.getFlagState(commentId);
  if (!updated) {
    throw new ModerationError('COMMENT_NOT_FOUND', 'Falha interna após triagem.');
  }
  return { flag: stripReporterIdentities(updated), privateMessageId: pmId };
}

/**
 * sendPrivateMessage — mensagem in-app do steward ao autor do comentário.
 * NÃO envia e-mail. SEMPRE visível só ao destinatário.
 * Limite 500 chars. Sem template (humano por design).
 */
export function sendPrivateMessage(
  store: ModerationStore,
  ctx: {
    fromSteward: User;
    toUserId: UserId;
    commentId: CommentId;
    body: string;
  }
): PrivateMessage {
  const { fromSteward, toUserId, commentId, body } = ctx;
  if (!isSteward(fromSteward)) {
    throw new ModerationError('NOT_STEWARD', 'Mensagem privada é função de cuidador.');
  }
  const text = trimBody(body);
  if (text.length === 0) {
    throw new ModerationError('EMPTY_MESSAGE', 'Mensagem vazia não é enviada.');
  }
  if (text.length > 500) {
    throw new ModerationError('MESSAGE_TOO_LONG', 'Mensagem excede 500 caracteres (limite humano).');
  }
  const flag = store.getFlagState(commentId);
  if (!flag) {
    throw new ModerationError('COMMENT_NOT_FOUND', 'Comentário não está na fila.');
  }
  const record = store.appendPrivateMessage({
    fromStewardId: fromSteward.id,
    toUserId,
    commentId,
    body: text,
  });
  store.appendAudit({
    commentId,
    actorId: fromSteward.id,
    actorRole: fromSteward.role,
    action: 'PRIVATE_MESSAGE_SENT',
    note: null,
  });
  return record;
}

/**
 * listPrivateMessagesForUser — DMs recebidas pelo autor.
 * NÃO é público. Apenas o próprio `userId` (ou platform_admin) pode listar.
 */
export function listPrivateMessagesForUser(
  store: ModerationStore,
  viewer: User,
  target: UserId
): readonly PrivateMessage[] {
  if (!viewer?.id) {
    throw new ModerationError('NOT_AUTHENTICATED', 'Sessão necessária.');
  }
  if (viewer.id !== target && viewer.role !== 'platform_admin') {
    throw new ModerationError(
      'NOT_STEWARD',
      'Mensagens privadas são visíveis apenas ao próprio destinatário.'
    );
  }
  return store.listPrivateMessagesToUser(target);
}

/**
 * getModerationLog — audit trail completo.
 * Apenas steward vê reports detalhados (mas NÃO quem reportou).
 * Platform_admin vê tudo.
 */
export function getModerationLog(
  store: ModerationStore,
  viewer: User,
  commentId: CommentId
): readonly AuditEntry[] {
  if (viewer.role === 'community_member') {
    throw new ModerationError('NOT_STEWARD', 'Audit não acessível a membros.');
  }
  return store.listAudit(commentId);
}

/**
 * isSteward — RBAC guard exportado. Função pura.
 */
export function isSteward(user: User | null | undefined): boolean {
  return !!user && (user.role === 'community_steward' || user.role === 'platform_admin');
}

// ----------------------------------------------------------------------------
// Strip de identidades — preserva contagem por reason, esconde reporterId
// ----------------------------------------------------------------------------

interface InternalFlaggedComment extends Omit<FlaggedComment, 'reports'> {
  reports: readonly Report[];
}

function stripReporterIdentities(flag: FlaggedComment): FlaggedComment {
  // Para o steward: `reports` vira resumo por reason + count (SEM reporterId).
  // Mantemos Report[] "reduzido" onde reporterId='' mas só para satisfazer a
  // tipagem. LGPD Art. 18 — minimização: nem mesmo o steward sabe quem sinalizou.
  const summaryByReason = new Map<ReportReason, number>();
  for (const r of flag.reports) {
    summaryByReason.set(r.reason, (summaryByReason.get(r.reason) ?? 0) + 1);
  }
  const syntheticReports: Report[] = Array.from(summaryByReason.entries()).map(([reason, n]) => ({
    id: asReportId(`agg_${reason.toLowerCase()}_${n}`),
    reporterId: asUserId(''), // anonimizado — pipeline público nunca devolve isto
    commentId: flag.commentId,
    reason,
    details: null,
    createdAt: flag.firstFlaggedAt,
  }));
  const out: FlaggedComment = {
    ...flag,
    reports: syntheticReports,
  };
  return out;
}

// ----------------------------------------------------------------------------
// Helper factory: cria um ModerationService pronto pra testes / produção
// ----------------------------------------------------------------------------

export interface ModerationService {
  readonly store: ModerationStore;
  readonly flag: typeof flagComment;
  readonly list: typeof listFlaggedComments;
  readonly get: typeof getFlaggedComment;
  readonly triage: typeof triageComment;
  readonly dm: typeof sendPrivateMessage;
  readonly dms: typeof listPrivateMessagesForUser;
  readonly log: typeof getModerationLog;
  readonly canSteward: typeof isSteward;
}

export function createModerationService(store: ModerationStore = createMemoryStore()): ModerationService {
  return {
    store,
    flag: (s, ctx) => flagComment(s, ctx),
    list: (s, viewer, f) => listFlaggedComments(s, viewer, f),
    get: (s, viewer, cid) => getFlaggedComment(s, viewer, cid),
    triage: (s, ctx) => triageComment(s, ctx),
    dm: (s, ctx) => sendPrivateMessage(s, ctx),
    dms: (s, viewer, target) => listPrivateMessagesForUser(s, viewer, target),
    log: (s, viewer, cid) => getModerationLog(s, viewer, cid),
    canSteward: (u) => isSteward(u),
  };
}

// ----------------------------------------------------------------------------
// Banned-vocabulary scanner — defeito em design (assertion helper).
// Se algum dia alguém escrever "strike" em copy público, este helper pega.
// ----------------------------------------------------------------------------

const BANNED_PUBLIC_VOCAB = [
  'strike',
  'strikes',
  'warning',
  'warn',
  'mute',
  'muted',
  'ban',
  'banned',
  'punição',
  'punido',
  'infração',
  'ofensa',
  'punish',
  'block',
];

export function assertNoBannedVocab(text: string): { ok: true } | { ok: false; hits: string[] } {
  const lower = text.toLowerCase();
  const hits = BANNED_PUBLIC_VOCAB.filter((w) => lower.includes(w));
  return hits.length === 0 ? { ok: true } : { ok: false, hits };
}
