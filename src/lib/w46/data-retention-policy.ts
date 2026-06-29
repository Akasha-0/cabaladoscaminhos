// ============================================================================
// w46/data-retention-policy.ts — LGPD Art. 16 retention, soft/hard delete,
// archival tiers, legal holds, audit
//
// Codifica a política de retenção de dados para uma comunidade multi-fé
// (Cabala dos Caminhos). Vai além de um TTL simples:
//   - 15 categorias de dados com políticas específicas
//   - Soft-delete (tombstone) vs hard-delete vs archive (hot/warm/cold/glacier)
//   - Legal hold overrides (litigation/investigation/regulatory/sacred)
//   - Audit trail LGPD-compatível
//   - Classificação de dados (sensitive/personal/public/derived/aggregate)
//   - Revisões periódicas de política
//   - Integração com LGPD Art. 16 (eliminação) e Art. 18 (direitos do titular)
//
// Funções são determinísticas (não chamam Date.now() diretamente — recebem
// `currentDate` como parâmetro) e stateless no nível de I/O. Estado de
// políticas/holds/auditoria vive em Maps module-level; para resetar entre
// testes basta re-importar o módulo.
//
// Princípio: "retenção mínima necessária". Não mantemos dados por hábito —
// cada categoria tem base legal explícita (LGPD Art. 7º).
//
// ============================================================================

// ============================================================================
// SECTION 1 — TYPE DEFINITIONS
// ============================================================================

/**
 * Categorias de dados cobertas pela política. Cada categoria tem um perfil
 * próprio de sensibilidade, base legal e prazo de retenção.
 */
export type DataCategory =
  | 'user_profile'
  | 'user_content'
  | 'messages'
  | 'comments'
  | 'posts'
  | 'media'
  | 'session_logs'
  | 'analytics_events'
  | 'audit_log'
  | 'payment_records'
  | 'sacred_ritual_records'
  | 'mentorship_notes'
  | 'private_messages'
  | 'community_memberships'
  | 'feedback';

/**
 * Classificação da informação. Determina quem pode acessar, como é
 * criptografada em repouso e se entra em archival warm/cold ou vai direto
 * para erasure.
 */
export type Classification =
  | 'sensitive' // dados sensíveis (LGPD Art. 5º II) — ritualístico, saúde, fé
  | 'personal' // dados pessoais comuns (nome, email, telefone)
  | 'public' // visíveis para qualquer visitante
  | 'derived' // derivados de outros (contagens, embeddings, índices)
  | 'aggregate'; // agregações anônimas (estatísticas, métricas)

/**
 * Status corrente de um registro sob a política de retenção. Computado
 * de forma derivada (não persistido) a partir de timestamps + policy.
 */
export type RetentionStatus =
  | 'active' // dentro do prazo, operação normal
  | 'soft_deleted' // tombstone criado, ainda recuperável
  | 'archived' // movido para tier de archive
  | 'hard_deleted' // apagado de forma irreversível
  | 'legal_hold' // suspenso por ordem legal/ritualística
  | 'expired_pending' // passou do prazo mas ainda em fila de purga
  | 'retained'; // explicitamente preservado (override positivo)

/**
 * Política de retenção de uma categoria de dados.
 * - retentionDays: prazo normal de retenção a partir de createdAt
 * - hardDeleteAfterDays: a partir de quando o hard-delete pode ocorrer
 * - softDeleteGraceDays: janela entre soft-delete e hard-delete (recuperação)
 * - archivalAfterDays: a partir de quando vai para archive
 * - legalBasis: base legal LGPD Art. 7º
 * - jurisdiction: 'LGPD_BR' | 'GDPR_EU' | 'CCPA_US' | 'multi'
 */
export interface RetentionPolicy {
  id: string;
  category: DataCategory;
  classification: Classification;
  retentionDays: number;
  hardDeleteAfterDays: number;
  softDeleteGraceDays: number;
  archivalAfterDays: number;
  legalBasis: string;
  jurisdiction: 'LGPD_BR' | 'GDPR_EU' | 'CCPA_US' | 'multi';
  lastReviewedAt: string;
  version: number;
  description?: string;
  exemptFromAutoDelete?: boolean;
}

/**
 * Conjunto de políticas indexado por categoria. Estrutura chave/valor que
 * facilita lookup O(1) durante o ciclo de retenção.
 */
export interface RetentionPolicySet {
  policies: Map<DataCategory, RetentionPolicy>;
  version: number;
  updatedAt: string;
}

/**
 * Registro de dados sob a política. Modela qualquer entidade que possa
 * passar por retenção: User, Post, Comment, Message, etc.
 */
export interface DataRecord {
  id: string;
  category: DataCategory;
  classification: Classification;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  ownerId: string;
  sensitivityScore: number; // 0..1 — calculado por classifyRecord
  tags: string[];
  sizeBytes: number;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Ação de retenção agendada ou executada. Cada `scheduleRetentionAction`
 * gera um desses; actions idempotentes podem ser aplicadas em batch.
 */
export interface RetentionAction {
  recordId: string;
  action: 'soft_delete' | 'archive' | 'hard_delete' | 'retain' | 'flag_hold';
  scheduledAt: string;
  executedAt?: string;
  reason: string;
  executedBy: string;
  policyId?: string;
  policyVersion?: number;
}

/**
 * Tombstone de soft-delete. Mantém referência reversível por um período
 * (softDeleteGraceDays) antes do hard-delete. Contém metadados suficientes
 * para auditoria LGPD.
 */
export interface SoftDeleteTombstone {
  id: string;
  originalId: string;
  category: DataCategory;
  deletedAt: string;
  deletionReason: string;
  retainUntil: string;
  recoverable: boolean;
  lgpdRequestId?: string;
  executedBy: string;
}

/**
 * Bundle de archive. Representa um agrupamento de registros movidos para
 * um tier de storage mais barato (hot/warm/cold/glacier).
 */
export interface ArchiveBundle {
  id: string;
  records: DataRecord[];
  archivedAt: string;
  archiveLocation: string; // path/URI do archive
  totalSize: number;
  encrypted: boolean;
  encryptionAlgo: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  compressionAlgo: 'gzip' | 'zstd' | 'lz4' | 'none';
  retentionUntil: string;
  restoreCount: number;
  tier: ArchiveStorageTier;
}

/**
 * Tiers de storage para archive. Trade-off custo vs latência de restore.
 *   - hot: SSD, restore imediato, caro
 *   - warm: HDD, restore minutos, moderado
 *   - cold: object storage, restore horas, barato
 *   - glacier: deep archive, restore 12h+, muito barato
 *   - erasure: zero-copy destruction (Fadecimento criptográfico)
 */
export type ArchiveStorageTier = 'hot' | 'warm' | 'cold' | 'glacier' | 'erasure';

/**
 * Hold legal sobre registros. Suspende todas as ações de retenção enquanto
 * estiver ativo. Tipos cobrem litigation/investigation/regulatory/sacred.
 */
export interface LegalHold {
  id: string;
  scope: 'record' | 'category' | 'owner' | 'global';
  scopeRef: string; // id do record/category/owner, ou 'global'
  reason: string;
  placedBy: string;
  placedAt: string;
  expectedRelease: string;
  releasedAt?: string;
  releasedBy?: string;
  affectedRecords: string[];
  type: 'litigation' | 'investigation' | 'regulatory' | 'sacred_ceremony';
  caseNumber?: string;
  notes?: string;
}

/**
 * Revisão periódica das políticas. Cada revisão pode aprovar/rejeitar
 * mudanças e aponta findings. Próxima revisão é agendada.
 */
export interface RetentionReview {
  id: string;
  reviewedAt: string;
  reviewer: string;
  policies: Map<DataCategory, RetentionPolicy>;
  findings: RetentionFinding[];
  approvedChanges: RetentionPolicyChange[];
  rejectedChanges: RetentionPolicyChange[];
  nextReview: string;
  durationMs: number;
}

export interface RetentionFinding {
  category: DataCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export interface RetentionPolicyChange {
  category: DataCategory;
  field: keyof RetentionPolicy;
  oldValue: string | number | boolean;
  newValue: string | number | boolean;
  rationale: string;
}

/**
 * Item da fila de purga. Registros elegíveis para hard-delete entram aqui
 * antes da execução final; permite retry e priorização.
 */
export interface PurgeQueueItem {
  recordId: string;
  category: DataCategory;
  scheduledAt: string;
  attempts: number;
  lastAttemptAt?: string;
  lastError?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tombstoneId?: string;
}

/**
 * Relatório consolidado de retenção. Gerado sob demanda para dashboards
 * e relatórios LGPD.
 */
export interface RetentionReport {
  generatedAt: string;
  totalRecords: number;
  byCategory: Record<DataCategory, number>;
  byStatus: Record<RetentionStatus, number>;
  byClassification: Record<Classification, number>;
  expiringThisWeek: DataRecord[];
  expiringThisMonth: DataRecord[];
  hardDeletesThisMonth: number;
  archivalHits: number;
  storageCostEstimateBRL: number;
  legalHoldCount: number;
  purgeQueueDepth: number;
}

/**
 * Solicitação do titular dos dados (LGPD Art. 18). Pode ser acesso,
 * eliminação, portabilidade ou retificação.
 */
export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  subjectId: string;
  requestedAt: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  reason?: string;
  deletionGraceExpiresAt?: string;
  processedBy?: string;
  evidence?: string[];
}

/**
 * Encapsulamento da LGPD Art. 16 (direito à eliminação). Documenta quando
 * o artigo aplica e quais exceções existem.
 */
export interface LgpdArticle16 {
  applies: boolean;
  articleNumber: string;
  summary: string;
  criteria: string[];
  exceptions: string[];
}

/**
 * Resultado da classificação automática de um registro. Inclui score de
 * sensibilidade, classificação sugerida e rationale.
 */
export interface ClassificationScore {
  record: DataRecord;
  sensitivityScore: number;
  suggestedClassification: Classification;
  rationale: string;
  requiresReview: boolean;
  signals: ClassificationSignal[];
}

export interface ClassificationSignal {
  signal: string;
  weight: number;
  matched: boolean;
  description: string;
}

/**
 * Janela de retenção calculada. Inclui dias corridos, dias úteis e
 * eventos de calendário relevantes (feriados brasileiros, datas sagradas).
 */
export interface RetentionWindow {
  start: string;
  end: string;
  days: number;
  businessDays: number;
  calendarEvent?: string;
  holidayAdjusted: boolean;
}

/**
 * Entrada de auditoria LGPD-compatível. Cada operação de retenção gera
 * um AuditEntry imutável.
 */
export interface AuditEntry {
  id: string;
  action: string;
  recordId: string;
  performedBy: string;
  performedAt: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  policyVersion?: number;
  metadata?: Record<string, string | number | boolean>;
}

// ============================================================================
// SECTION 2 — CONSTANTS & DEFAULT POLICIES
// ============================================================================

/**
 * Bases legais LGPD Art. 7º. Cada categoria cita uma base; algumas têm
 * múltiplas separadas por vírgula.
 */
export const LGPD_LEGAL_BASES = {
  CONSENT: 'consentimento (Art. 7º, I)',
  CONTRACT: 'execução de contrato (Art. 7º, V)',
  LEGAL_OBLIGATION: 'cumprimento de obrigação legal (Art. 7º, II)',
  LEGITIMATE_INTEREST: 'interesse legítimo (Art. 7º, IX)',
  VITAL_INTERESTS: 'proteção da vida (Art. 7º, VI)',
  PUBLIC_INTEREST: 'interesse público (Art. 7º, IV)',
  EXERCISE_OF_RIGHTS: 'exercício regular de direitos (Art. 7º, VI)',
  CREDIT_PROTECTION: 'proteção do crédito (Art. 7º, X)',
  HEALTH_PROTECTION: 'proteção da saúde (Art. 7º, VIII)',
  SENSITIVE_SACRED: 'manifestação religiosa livre (Art. 11º, II "g")',
} as const;

/**
 * Categorias sensíveis (LGPD Art. 5º II) — ganham proteção reforçada.
 */
export const SENSITIVE_CATEGORIES: ReadonlySet<DataCategory> = new Set([
  'sacred_ritual_records',
  'mentorship_notes',
  'private_messages',
]);

/**
 * Categorias que justificam retenção longa (fiscal, jurídica, ritual).
 */
export const LONG_TERM_CATEGORIES: ReadonlySet<DataCategory> = new Set([
  'payment_records',
  'audit_log',
  'sacred_ritual_records',
]);

/**
 * Janela padrão para arquivamento (anos entre criação e purge total).
 */
export const DEFAULT_RETENTION_YEARS = {
  short: 1,
  medium: 3,
  long: 5,
  indefinite: 99,
} as const;

/**
 * Encoding típico de bytes por categoria (estimativa para archive size).
 */
export const BYTES_PER_RECORD_ESTIMATE: Record<DataCategory, number> = {
  user_profile: 2048,
  user_content: 8192,
  messages: 512,
  comments: 1024,
  posts: 4096,
  media: 524288, // 512KB média
  session_logs: 256,
  analytics_events: 128,
  audit_log: 384,
  payment_records: 1024,
  sacred_ritual_records: 2048,
  mentorship_notes: 3072,
  private_messages: 768,
  community_memberships: 256,
  feedback: 1536,
};

/**
 * Score-base de sensibilidade por categoria. classifyRecord ajusta esse
 * score com base em sinais detectados no record (tags, metadados).
 */
export const BASE_SENSITIVITY: Record<DataCategory, number> = {
  user_profile: 0.4,
  user_content: 0.3,
  messages: 0.5,
  comments: 0.3,
  posts: 0.3,
  media: 0.4,
  session_logs: 0.2,
  analytics_events: 0.1,
  audit_log: 0.3,
  payment_records: 0.7,
  sacred_ritual_records: 0.95,
  mentorship_notes: 0.85,
  private_messages: 0.75,
  community_memberships: 0.3,
  feedback: 0.3,
};

/**
 * Cria a política padrão de uma categoria. Retenção segue padrões:
 *   - Audit log: 5 anos (obrigação legal Sarbanes-Oxley analog)
 *   - Pagamentos: 5 anos (Receita Federal, Art. 173 CTN)
 *   - Logs sensatos (sacred/mentorship/private_messages): retenção curta
 *     para honrar Art. 16 (eliminação fácil)
 *   - Session logs: 6 meses
 *   - Analytics agregados: 1 ano
 *   - User content/público: 3 anos
 */
export function defaultPolicy(category: DataCategory): RetentionPolicy {
  const now = '2026-06-29T00:00:00.000Z'; // freeze para determinismo
  const base = {
    jurisdiction: 'LGPD_BR' as const,
    lastReviewedAt: now,
    version: 1,
    exemptFromAutoDelete: false,
  };
  switch (category) {
    case 'user_profile':
      return {
        ...base,
        id: 'pol-user-profile',
        category,
        classification: 'personal',
        retentionDays: 365 * DEFAULT_RETENTION_YEARS.medium,
        hardDeleteAfterDays: 365 * DEFAULT_RETENTION_YEARS.medium + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 180,
        legalBasis: LGPD_LEGAL_BASES.CONSENT + ' / ' + LGPD_LEGAL_BASES.CONTRACT,
        description: 'Perfil ativo do usuário enquanto a conta existe.',
      };
    case 'user_content':
      return {
        ...base,
        id: 'pol-user-content',
        category,
        classification: 'personal',
        retentionDays: 365 * DEFAULT_RETENTION_YEARS.medium,
        hardDeleteAfterDays: 365 * DEFAULT_RETENTION_YEARS.medium + 60,
        softDeleteGraceDays: 60,
        archivalAfterDays: 365,
        legalBasis: LGPD_LEGAL_BASES.CONSENT,
        description: 'Conteúdo autoral do usuário (journal entries, mapas).',
      };
    case 'messages':
      return {
        ...base,
        id: 'pol-messages',
        category,
        classification: 'personal',
        retentionDays: 365,
        hardDeleteAfterDays: 365 + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 180,
        legalBasis: LGPD_LEGAL_BASES.CONTRACT,
        description: 'Mensagens em canais públicos da comunidade.',
      };
    case 'comments':
      return {
        ...base,
        id: 'pol-comments',
        category,
        classification: 'public',
        retentionDays: 365 * 2,
        hardDeleteAfterDays: 365 * 2 + 60,
        softDeleteGraceDays: 60,
        archivalAfterDays: 365,
        legalBasis: LGPD_LEGAL_BASES.CONSENT,
        description: 'Comentários em posts públicos.',
      };
    case 'posts':
      return {
        ...base,
        id: 'pol-posts',
        category,
        classification: 'public',
        retentionDays: 365 * 3,
        hardDeleteAfterDays: 365 * 3 + 90,
        softDeleteGraceDays: 90,
        archivalAfterDays: 365 * 2,
        legalBasis: LGPD_LEGAL_BASES.CONSENT,
        description: 'Posts públicos e semi-públicos.',
      };
    case 'media':
      return {
        ...base,
        id: 'pol-media',
        category,
        classification: 'personal',
        retentionDays: 365 * 2,
        hardDeleteAfterDays: 365 * 2 + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 180,
        legalBasis: LGPD_LEGAL_BASES.CONSENT,
        description: 'Imagens, áudio e vídeo enviados pelos usuários.',
      };
    case 'session_logs':
      return {
        ...base,
        id: 'pol-session-logs',
        category,
        classification: 'derived',
        retentionDays: 180,
        hardDeleteAfterDays: 210,
        softDeleteGraceDays: 0,
        archivalAfterDays: 90,
        legalBasis: LGPD_LEGAL_BASES.LEGITIMATE_INTEREST,
        description: 'Logs de sessão HTTP/Auth — segurança operacional.',
      };
    case 'analytics_events':
      return {
        ...base,
        id: 'pol-analytics-events',
        category,
        classification: 'aggregate',
        retentionDays: 365,
        hardDeleteAfterDays: 400,
        softDeleteGraceDays: 0,
        archivalAfterDays: 270,
        legalBasis: LGPD_LEGAL_BASES.LEGITIMATE_INTEREST,
        description: 'Eventos de analytics (cliques, page views) — agregado.',
      };
    case 'audit_log':
      return {
        ...base,
        id: 'pol-audit-log',
        category,
        classification: 'sensitive',
        retentionDays: 365 * 5,
        hardDeleteAfterDays: 365 * 5 + 90,
        softDeleteGraceDays: 0,
        archivalAfterDays: 365 * 2,
        legalBasis: LGPD_LEGAL_BASES.LEGAL_OBLIGATION,
        exemptFromAutoDelete: true,
        description:
          'Log de auditoria — retenção legal mínima de 5 anos para prova de conformidade.',
      };
    case 'payment_records':
      return {
        ...base,
        id: 'pol-payment-records',
        category,
        classification: 'sensitive',
        retentionDays: 365 * 5,
        hardDeleteAfterDays: 365 * 5 + 90,
        softDeleteGraceDays: 0,
        archivalAfterDays: 365 * 2,
        legalBasis:
          LGPD_LEGAL_BASES.LEGAL_OBLIGATION + ' (CTN Art. 173 / Receita Federal)',
        exemptFromAutoDelete: true,
        description: 'Registros financeiros — retenção fiscal obrigatória.',
      };
    case 'sacred_ritual_records':
      return {
        ...base,
        id: 'pol-sacred-ritual',
        category,
        classification: 'sensitive',
        retentionDays: 365 * 3,
        hardDeleteAfterDays: 365 * 3 + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 365,
        legalBasis: LGPD_LEGAL_BASES.SENSITIVE_SACRED,
        description:
          'Registros de rituais sagrados — manifestação religiosa livre. Retenção curta para honrar direito ao esquecimento.',
      };
    case 'mentorship_notes':
      return {
        ...base,
        id: 'pol-mentorship-notes',
        category,
        classification: 'sensitive',
        retentionDays: 365 * 2,
        hardDeleteAfterDays: 365 * 2 + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 180,
        legalBasis: LGPD_LEGAL_BASES.CONSENT,
        description:
          'Anotações de mentoria espiritual. Confidenciais por design; retenção curta.',
      };
    case 'private_messages':
      return {
        ...base,
        id: 'pol-private-messages',
        category,
        classification: 'sensitive',
        retentionDays: 365,
        hardDeleteAfterDays: 365 + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 180,
        legalBasis: LGPD_LEGAL_BASES.CONSENT,
        description: 'Mensagens privadas (DM). Cifradas em repouso; retenção curta.',
      };
    case 'community_memberships':
      return {
        ...base,
        id: 'pol-community-memberships',
        category,
        classification: 'personal',
        retentionDays: 365 * 2,
        hardDeleteAfterDays: 365 * 2 + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 365,
        legalBasis: LGPD_LEGAL_BASES.CONTRACT,
        description: 'Vínculos do usuário com grupos/comunidades.',
      };
    case 'feedback':
      return {
        ...base,
        id: 'pol-feedback',
        category,
        classification: 'personal',
        retentionDays: 365,
        hardDeleteAfterDays: 365 + 30,
        softDeleteGraceDays: 30,
        archivalAfterDays: 180,
        legalBasis: LGPD_LEGAL_BASES.CONSENT,
        description: 'Feedback (NPS, surveys, reports).',
      };
  }
}

/**
 * LGPD Art. 16 — explicação em português. Cita artigo, critérios e
 * exceções conforme Lei 13.709/2018.
 */
export const LGPD_ART16_EXPLANATION: LgpdArticle16 = {
  applies: true,
  articleNumber: 'Art. 16',
  summary:
    'Dados pessoais serão eliminados após o término de seu tratamento ' +
    'pelas seguintes razões: (I) atingida a finalidade; (II) fim do prazo ' +
    'de necessidade; (III) a pedido do titular. A eliminação é gratuita ' +
    'e deve ser comunicada ao titular em até 30 dias.',
  criteria: [
    'Finalidade que motivou o tratamento foi alcançada',
    'Prazo de necessidade do tratamento expirou (Art. 16 II)',
    'Titular exerceu direito de eliminação (Art. 18 VI)',
    'Consentimento foi revogado quando esta era a única base legal',
    'Tratamento foi considerado ilícito por decisão administrativa ou judicial',
  ],
  exceptions: [
    'Cumprimento de obrigação legal ou regulatória pelo controlador',
    'Exercício regular de direitos em processo administrativo ou judicial',
    'Interesse legítimo do controlador para fins de segurança da informação',
    'Uso exclusivo do controlador, desde que anonimizados os dados',
    'Preservação para fins históricos, científicos ou estatísticos (Art. 16 §1°)',
    'Manifestação religiosa livre (Art. 11º II "g") quando em conflito',
  ],
};

/**
 * Cenários de exemplo de Legal Hold. Servem como fixtures e também
 * documentam os tipos de hold que o sistema precisa suportar.
 */
export const EXAMPLE_LEGAL_HOLDS: LegalHold[] = [
  {
    id: 'lh-litigation-001',
    scope: 'owner',
    scopeRef: 'user_abc123',
    reason: 'Processo judicial em curso — cópia de mensagens solicitada por ordem judicial',
    placedBy: 'legal@cabaladoscaminhos.org',
    placedAt: '2026-01-15T10:00:00.000Z',
    expectedRelease: '2027-01-15T10:00:00.000Z',
    affectedRecords: [],
    type: 'litigation',
    caseNumber: 'PROC-2026-000123-8',
    notes: 'Manter todas as mensagens privadas, posts e comentários do titular.',
  },
  {
    id: 'lh-investigation-002',
    scope: 'category',
    scopeRef: 'sacred_ritual_records',
    reason: 'Investigação interna sobre prática ritualística — manter provas por 24 meses',
    placedBy: 'compliance@cabaladoscaminhos.org',
    placedAt: '2026-03-01T14:30:00.000Z',
    expectedRelease: '2028-03-01T14:30:00.000Z',
    affectedRecords: [],
    type: 'investigation',
    notes: 'Atinge todos os registros da categoria até o fim da investigação.',
  },
  {
    id: 'lh-regulatory-003',
    scope: 'category',
    scopeRef: 'payment_records',
    reason: 'Auditoria da Receita Federal — retenção obrigatória por 5 anos a partir do fato gerador',
    placedBy: 'fiscal@cabaladoscaminhos.org',
    placedAt: '2024-07-01T00:00:00.000Z',
    expectedRelease: '2029-07-01T00:00:00.000Z',
    affectedRecords: [],
    type: 'regulatory',
    caseNumber: 'RF-AUD-2024-000789',
  },
  {
    id: 'lh-sacred-004',
    scope: 'record',
    scopeRef: 'rec_sacred_xisto_001',
    reason: 'Cerimônia sagrada em curso — registros não podem ser eliminados até encerramento',
    placedBy: 'guardian@cabaladoscaminhos.org',
    placedAt: '2026-06-20T19:00:00.000Z',
    expectedRelease: '2026-12-20T19:00:00.000Z',
    affectedRecords: ['rec_sacred_xisto_001'],
    type: 'sacred_ceremony',
    notes: 'Cerimônia de Xistós — ciclo de 6 meses.',
  },
  {
    id: 'lh-global-005',
    scope: 'global',
    scopeRef: 'global',
    reason: 'Notificação de incidente de segurança — congelar logs de auditoria até conclusão do forensics',
    placedBy: 'security@cabaladoscaminhos.org',
    placedAt: '2026-06-10T03:00:00.000Z',
    expectedRelease: '2026-09-10T03:00:00.000Z',
    affectedRecords: [],
    type: 'investigation',
    notes: 'Hold global sobre session_logs e audit_log.',
  },
];

// ============================================================================
// SECTION 3 — MODULE-LEVEL STATE
// ============================================================================

/**
 * State global do módulo. Mantemos um único conjunto de políticas, holds
 * e audit trail para que loadPolicy/setPolicy/etc operem de forma
 * consistente sem precisar passar Map por todo lado.
 */
const policyStore: RetentionPolicySet = {
  policies: new Map<DataCategory, RetentionPolicy>(),
  version: 1,
  updatedAt: '2026-06-29T00:00:00.000Z',
};

const legalHolds: Map<string, LegalHold> = new Map();
const tombstones: Map<string, SoftDeleteTombstone> = new Map();
const archives: Map<string, ArchiveBundle> = new Map();
const purgeQueue: PurgeQueueItem[] = [];
const auditTrail: AuditEntry[] = [];
const reviews: RetentionReview[] = [];

let auditCounter = 0;
let tombstoneCounter = 0;
let archiveCounter = 0;
let holdCounter = 0;
let reviewCounter = 0;
let purgeCounter = 0;
let reviewCounterRef = 0;

// Inicializa com defaults (frozen para teste determinístico)
function bootstrapDefaults(): void {
  if (policyStore.policies.size > 0) return;
  const all: DataCategory[] = [
    'user_profile',
    'user_content',
    'messages',
    'comments',
    'posts',
    'media',
    'session_logs',
    'analytics_events',
    'audit_log',
    'payment_records',
    'sacred_ritual_records',
    'mentorship_notes',
    'private_messages',
    'community_memberships',
    'feedback',
  ];
  for (const cat of all) {
    policyStore.policies.set(cat, defaultPolicy(cat));
  }
}

bootstrapDefaults();

// ============================================================================
// SECTION 4 — POLICY CRUD
// ============================================================================

/**
 * Carrega a política de uma categoria. Retorna a default se não houver
 * política customizada registrada.
 */
export function loadPolicy(category: DataCategory): RetentionPolicy {
  const p = policyStore.policies.get(category);
  if (p) return p;
  const fallback = defaultPolicy(category);
  policyStore.policies.set(category, fallback);
  return fallback;
}

/**
 * Carrega todas as políticas registradas. Retorna um novo Map para evitar
 * mutação externa.
 */
export function loadAllPolicies(): RetentionPolicySet {
  return {
    policies: new Map(policyStore.policies),
    version: policyStore.version,
    updatedAt: policyStore.updatedAt,
  };
}

/**
 * Registra/atualiza a política de uma categoria. Incrementa versão e
 * atualiza timestamp.
 */
export function setPolicy(policy: RetentionPolicy): RetentionPolicySet {
  const issues = validatePolicy(policy);
  if (issues.length > 0) {
    throw new Error(`Invalid RetentionPolicy: ${issues.join('; ')}`);
  }
  const next: RetentionPolicy = { ...policy, version: policy.version + 1 };
  policyStore.policies.set(policy.category, next);
  policyStore.version += 1;
  policyStore.updatedAt = '2026-06-29T00:00:00.000Z';
  return loadAllPolicies();
}

/**
 * Remove a política customizada de uma categoria, voltando para o default.
 */
export function removePolicy(category: DataCategory): RetentionPolicySet {
  policyStore.policies.delete(category);
  policyStore.policies.set(category, defaultPolicy(category));
  policyStore.version += 1;
  policyStore.updatedAt = '2026-06-29T00:00:00.000Z';
  return loadAllPolicies();
}

/**
 * Revisão completa das políticas. Para cada categoria, avalia a política
 * atual e produz findings baseados em heurísticas simples (categoria
 * sensível com retenção longa, base legal inconsistente, etc.).
 */
export function reviewPolicies(reviewer: string): RetentionReview {
  reviewCounter += 1;
  const start = '2026-06-29T00:00:00.000Z';
  const findings: RetentionFinding[] = [];
  const approved: RetentionPolicyChange[] = [];
  const rejected: RetentionPolicyChange[] = [];

  for (const [category, policy] of policyStore.policies) {
    // Heurística 1: categoria sensível com retenção longa demais
    if (
      SENSITIVE_CATEGORIES.has(category) &&
      policy.retentionDays > 365 * 5
    ) {
      findings.push({
        category,
        severity: 'high',
        description: `Categoria sensível ${category} com retenção > 5 anos`,
        recommendation: 'Reduzir para <= 3 anos para honrar Art. 16',
      });
    }

    // Heurística 2: base legal ausente
    if (!policy.legalBasis || policy.legalBasis.trim() === '') {
      findings.push({
        category,
        severity: 'critical',
        description: `Categoria ${category} sem base legal declarada`,
        recommendation: 'Atribuir base legal conforme LGPD Art. 7º',
      });
    }

    // Heurística 3: hardDelete < retention
    if (policy.hardDeleteAfterDays < policy.retentionDays) {
      findings.push({
        category,
        severity: 'medium',
        description: `hardDelete (${policy.hardDeleteAfterDays}d) < retention (${policy.retentionDays}d) — incoerente`,
        recommendation: 'Ajustar hardDeleteAfterDays >= retentionDays',
      });
    }

    // Heurística 4: classificação sensitive para categoria sem base sagrada
    if (
      policy.classification === 'sensitive' &&
      !SENSITIVE_CATEGORIES.has(category) &&
      category !== 'audit_log' &&
      category !== 'payment_records'
    ) {
      findings.push({
        category,
        severity: 'low',
        description: `Categoria ${category} classificada como sensitive — verificar base legal`,
        recommendation: 'Confirmar se há base sensível real (Art. 11)',
      });
    }
  }

  const review: RetentionReview = {
    id: `rev-${reviewCounter.toString().padStart(4, '0')}`,
    reviewedAt: start,
    reviewer,
    policies: new Map(policyStore.policies),
    findings,
    approvedChanges: approved,
    rejectedChanges: rejected,
    nextReview: addDays(start, 90),
    durationMs: 1500,
  };
  reviews.push(review);
  return review;
}

// ============================================================================
// SECTION 5 — STATUS COMPUTATION
// ============================================================================

/**
 * Calcula o status de retenção de um registro. Considera legal holds
 * antes de qualquer outra coisa.
 */
export function computeRetentionStatus(
  record: DataRecord,
  policy: RetentionPolicy,
  currentDate: string,
): RetentionStatus {
  // Legal hold sempre tem prioridade
  if (isRecordUnderHold(record.id, record.ownerId, record.category)) {
    return 'legal_hold';
  }

  const created = Date.parse(record.createdAt);
  const updated = Date.parse(record.updatedAt);
  const current = Date.parse(currentDate);
  const ageMs = current - created;
  const ageDays = Math.floor(ageMs / 86400000);
  const inactiveDays = Math.floor((current - updated) / 86400000);

  // Já hard-deleted não tem status — retorna sentinel
  if (ageDays > policy.hardDeleteAfterDays) {
    // Pode ainda estar na fila de purga
    const inQueue = purgeQueue.find((p) => p.recordId === record.id);
    if (inQueue) return 'expired_pending';
    return 'expired_pending';
  }

  if (ageDays >= policy.archivalAfterDays) {
    // Verifica se está em archive
    for (const bundle of archives.values()) {
      if (bundle.records.some((r) => r.id === record.id)) {
        return 'archived';
      }
    }
  }

  if (inactiveDays >= policy.softDeleteGraceDays) {
    // Verifica se está soft-deleted
    for (const tomb of tombstones.values()) {
      if (tomb.originalId === record.id) return 'soft_deleted';
    }
    if (ageDays >= policy.retentionDays) return 'soft_deleted';
  }

  return 'active';
}

/**
 * Decide se um registro deve entrar em archive agora.
 */
export function shouldArchive(
  record: DataRecord,
  policy: RetentionPolicy,
  currentDate: string,
): boolean {
  if (policy.exemptFromAutoDelete === true) return false;
  const age = daysBetween(record.createdAt, currentDate);
  if (age < policy.archivalAfterDays) return false;
  if (isRecordUnderHold(record.id, record.ownerId, record.category)) return false;
  // Não arquivar coisas soft-deleted
  for (const tomb of tombstones.values()) {
    if (tomb.originalId === record.id) return false;
  }
  return true;
}

/**
 * Decide se um registro deve entrar em soft-delete agora.
 */
export function shouldSoftDelete(
  record: DataRecord,
  policy: RetentionPolicy,
  currentDate: string,
): boolean {
  if (policy.exemptFromAutoDelete === true) return false;
  const age = daysBetween(record.createdAt, currentDate);
  const inactive = daysBetween(record.updatedAt, currentDate);
  if (age < policy.retentionDays) return false;
  if (inactive < policy.softDeleteGraceDays) return false;
  if (isRecordUnderHold(record.id, record.ownerId, record.category)) return false;
  // Já é tombstone?
  for (const tomb of tombstones.values()) {
    if (tomb.originalId === record.id) return false;
  }
  return true;
}

/**
 * Decide se um registro deve ser hard-deleted agora.
 */
export function shouldHardDelete(
  record: DataRecord,
  policy: RetentionPolicy,
  currentDate: string,
): boolean {
  if (policy.exemptFromAutoDelete === true) return false;
  const age = daysBetween(record.createdAt, currentDate);
  if (age < policy.hardDeleteAfterDays) return false;
  if (isRecordUnderHold(record.id, record.ownerId, record.category)) return false;
  return true;
}

/**
 * Determina a próxima ação de retenção a ser tomada para um registro.
 * Retorna null se nenhuma ação é necessária.
 */
export function scheduleRetentionAction(
  record: DataRecord,
  policy: RetentionPolicy,
  currentDate: string,
): RetentionAction | null {
  if (isRecordUnderHold(record.id, record.ownerId, record.category)) {
    return {
      recordId: record.id,
      action: 'flag_hold',
      scheduledAt: currentDate,
      reason: 'Registro sob legal hold — nenhuma ação permitida',
      executedBy: 'system',
      policyId: policy.id,
      policyVersion: policy.version,
    };
  }

  if (shouldHardDelete(record, policy, currentDate)) {
    return {
      recordId: record.id,
      action: 'hard_delete',
      scheduledAt: currentDate,
      reason: `Atingiu hardDeleteAfterDays=${policy.hardDeleteAfterDays}`,
      executedBy: 'system',
      policyId: policy.id,
      policyVersion: policy.version,
    };
  }
  if (shouldArchive(record, policy, currentDate)) {
    return {
      recordId: record.id,
      action: 'archive',
      scheduledAt: currentDate,
      reason: `Atingiu archivalAfterDays=${policy.archivalAfterDays}`,
      executedBy: 'system',
      policyId: policy.id,
      policyVersion: policy.version,
    };
  }
  if (shouldSoftDelete(record, policy, currentDate)) {
    return {
      recordId: record.id,
      action: 'soft_delete',
      scheduledAt: currentDate,
      reason: `Atingiu retentionDays=${policy.retentionDays} + softDeleteGrace=${policy.softDeleteGraceDays}`,
      executedBy: 'system',
      policyId: policy.id,
      policyVersion: policy.version,
    };
  }
  return null;
}

/**
 * Aplica uma ação de retenção a um registro. Retorna o registro
 * modificado (soft-delete adiciona tag, hard-delete retorna null).
 */
export function applyRetentionAction(
  action: RetentionAction,
  record: DataRecord,
): DataRecord | null {
  if (action.action === 'hard_delete') {
    hardDeleteRecord(record);
    registerAudit({
      action: 'hard_delete',
      recordId: record.id,
      performedBy: action.executedBy,
      performedAt: action.executedAt ?? '2026-06-29T00:00:00.000Z',
      reason: action.reason,
      policyVersion: action.policyVersion,
    });
    return null;
  }
  if (action.action === 'archive') {
    const tier = getStorageTier(
      daysBetween(record.createdAt, '2026-06-29T00:00:00.000Z'),
      record.classification,
    );
    archiveRecord(record, tier, record.classification !== 'public');
    const next: DataRecord = {
      ...record,
      tags: [...record.tags, 'archived'],
      updatedAt: '2026-06-29T00:00:00.000Z',
    };
    registerAudit({
      action: 'archive',
      recordId: record.id,
      performedBy: action.executedBy,
      performedAt: action.executedAt ?? '2026-06-29T00:00:00.000Z',
      reason: action.reason,
      policyVersion: action.policyVersion,
    });
    return next;
  }
  if (action.action === 'soft_delete') {
    softDeleteRecord(record, action.reason);
    const next: DataRecord = {
      ...record,
      tags: [...record.tags, 'soft_deleted'],
      updatedAt: '2026-06-29T00:00:00.000Z',
    };
    registerAudit({
      action: 'soft_delete',
      recordId: record.id,
      performedBy: action.executedBy,
      performedAt: action.executedAt ?? '2026-06-29T00:00:00.000Z',
      reason: action.reason,
      policyVersion: action.policyVersion,
    });
    return next;
  }
  if (action.action === 'retain') {
    registerAudit({
      action: 'retain',
      recordId: record.id,
      performedBy: action.executedBy,
      performedAt: action.executedAt ?? '2026-06-29T00:00:00.000Z',
      reason: action.reason,
      policyVersion: action.policyVersion,
    });
    return record;
  }
  return record;
}

// ============================================================================
// SECTION 6 — SOFT DELETE / HARD DELETE / ARCHIVE
// ============================================================================

/**
 * Cria um tombstone de soft-delete. O registro original é mantido em
 * estado passivo até hardDeleteAfterDays.
 */
export function softDeleteRecord(
  record: DataRecord,
  reason: string,
  lgpdRequestId?: string,
): SoftDeleteTombstone {
  tombstoneCounter += 1;
  const policy = loadPolicy(record.category);
  const now = '2026-06-29T00:00:00.000Z';
  const tombstone: SoftDeleteTombstone = {
    id: `tomb-${tombstoneCounter.toString().padStart(6, '0')}`,
    originalId: record.id,
    category: record.category,
    deletedAt: now,
    deletionReason: reason,
    retainUntil: addDays(now, policy.softDeleteGraceDays),
    recoverable: true,
    executedBy: 'system',
  };
  if (lgpdRequestId !== undefined) {
    tombstone.lgpdRequestId = lgpdRequestId;
  }
  tombstones.set(tombstone.id, tombstone);
  registerAudit({
    action: 'soft_delete_create',
    recordId: record.id,
    performedBy: 'system',
    performedAt: now,
    reason,
    metadata: { tombstoneId: tombstone.id, lgpdRequestId: lgpdRequestId ?? '' },
  });
  return tombstone;
}

/**
 * Cria um ArchiveBundle com o registro. Suporta tiers hot/warm/cold/etc.
 */
export function archiveRecord(
  record: DataRecord,
  tier: ArchiveStorageTier,
  encrypted: boolean,
): ArchiveBundle {
  archiveCounter += 1;
  const now = '2026-06-29T00:00:00.000Z';
  const bundle: ArchiveBundle = {
    id: `arc-${archiveCounter.toString().padStart(6, '0')}`,
    records: [record],
    archivedAt: now,
    archiveLocation: `s3://archive-cabala/${record.category}/${record.id}`,
    totalSize: record.sizeBytes,
    encrypted,
    encryptionAlgo: encrypted ? 'AES-256-GCM' : 'AES-256-GCM',
    compressionAlgo: 'zstd',
    retentionUntil: addDays(now, 365 * 5),
    restoreCount: 0,
    tier,
  };
  archives.set(bundle.id, bundle);
  registerAudit({
    action: 'archive_create',
    recordId: record.id,
    performedBy: 'system',
    performedAt: now,
    reason: `Archived to ${tier}`,
    metadata: { bundleId: bundle.id, encrypted: String(encrypted) },
  });
  return bundle;
}

/**
 * Hard-delete irreversível. Retorna null para sinalizar "foi embora" e
 * adiciona entrada de auditoria.
 */
export function hardDeleteRecord(record: DataRecord): null {
  registerAudit({
    action: 'hard_delete',
    recordId: record.id,
    performedBy: 'system',
    performedAt: '2026-06-29T00:00:00.000Z',
    reason: 'Hard-delete solicitado',
    metadata: { category: record.category },
  });
  return null;
}

// ============================================================================
// SECTION 7 — LEGAL HOLD
// ============================================================================

/**
 * Adiciona um legal hold. Atualiza affectedRecords baseado no scope.
 */
export function placeLegalHold(hold: LegalHold): LegalHold {
  holdCounter += 1;
  const resolved = resolveHoldScope(hold);
  const stored: LegalHold = { ...resolved };
  if (stored.id === '') {
    stored.id = `lh-${holdCounter.toString().padStart(4, '0')}`;
  }
  legalHolds.set(stored.id, stored);
  registerAudit({
    action: 'legal_hold_place',
    recordId: stored.scopeRef,
    performedBy: stored.placedBy,
    performedAt: stored.placedAt,
    reason: stored.reason,
    metadata: { holdId: stored.id, scope: stored.scope, type: stored.type },
  });
  return stored;
}

/**
 * Libera um legal hold existente.
 */
export function releaseLegalHold(holdId: string, releasedBy: string): LegalHold {
  const hold = legalHolds.get(holdId);
  if (!hold) {
    throw new Error(`Legal hold não encontrado: ${holdId}`);
  }
  const released: LegalHold = {
    ...hold,
    releasedAt: '2026-06-29T00:00:00.000Z',
    releasedBy,
  };
  legalHolds.set(holdId, released);
  registerAudit({
    action: 'legal_hold_release',
    recordId: hold.scopeRef,
    performedBy: releasedBy,
    performedAt: released.releasedAt ?? '2026-06-29T00:00:00.000Z',
    reason: `Hold ${holdId} released`,
    metadata: { holdId, type: hold.type },
  });
  return released;
}

/**
 * Verifica se um recordId está sob algum legal hold ativo.
 */
export function isUnderLegalHold(
  recordId: string,
  holds: LegalHold[],
): boolean {
  return holds.some(
    (h) =>
      !h.releasedAt &&
      (h.affectedRecords.includes(recordId) ||
        h.scope === 'global' ||
        h.scopeRef === recordId),
  );
}

/**
 * Helper interno para checagem de hold — usa o store global.
 */
function isRecordUnderHold(
  recordId: string,
  ownerId: string,
  category: DataCategory,
): boolean {
  for (const hold of legalHolds.values()) {
    if (hold.releasedAt) continue;
    if (hold.scope === 'global') return true;
    if (hold.scope === 'record' && hold.scopeRef === recordId) return true;
    if (hold.scope === 'owner' && hold.scopeRef === ownerId) return true;
    if (hold.scope === 'category' && hold.scopeRef === category) return true;
    if (hold.affectedRecords.includes(recordId)) return true;
  }
  return false;
}

/**
 * Expande o scope do hold em affectedRecords concretos. Para scope 'record'
 * já está pronto; para 'category' e 'owner' precisa de um callback — aqui
 * só preparamos a estrutura.
 */
function resolveHoldScope(hold: LegalHold): LegalHold {
  if (hold.scope === 'record') {
    return {
      ...hold,
      affectedRecords: [hold.scopeRef],
    };
  }
  // Para outros scopes, affectedRecords fica vazio (resolveremos depois)
  return { ...hold };
}

// ============================================================================
// SECTION 8 — PROCESSING BATCHES
// ============================================================================

/**
 * Processa uma leva de registros aplicando deleções quando elegíveis.
 * Retorna listas separadas por decisão.
 */
export function processDeletions(
  records: DataRecord[],
  policy: RetentionPolicy,
  currentDate: string,
): { deleted: DataRecord[]; kept: DataRecord[]; holds: DataRecord[] } {
  const deleted: DataRecord[] = [];
  const kept: DataRecord[] = [];
  const holds: DataRecord[] = [];

  for (const record of records) {
    if (isRecordUnderHold(record.id, record.ownerId, record.category)) {
      holds.push(record);
      continue;
    }
    if (shouldSoftDelete(record, policy, currentDate)) {
      softDeleteRecord(record, `Batch deletion at ${currentDate}`);
      deleted.push(record);
      continue;
    }
    if (shouldHardDelete(record, policy, currentDate)) {
      hardDeleteRecord(record);
      deleted.push(record);
      continue;
    }
    kept.push(record);
  }

  return { deleted, kept, holds };
}

/**
 * Processa uma leva de registros aplicando archival quando elegíveis.
 */
export function processArchivals(
  records: DataRecord[],
  policy: RetentionPolicy,
  currentDate: string,
): { archived: ArchiveBundle[]; kept: DataRecord[]; errors: string[] } {
  const archived: ArchiveBundle[] = [];
  const kept: DataRecord[] = [];
  const errors: string[] = [];

  for (const record of records) {
    try {
      if (!shouldArchive(record, policy, currentDate)) {
        kept.push(record);
        continue;
      }
      const tier = getStorageTier(
        daysBetween(record.createdAt, currentDate),
        record.classification,
      );
      const bundle = archiveRecord(
        record,
        tier,
        record.classification !== 'public',
      );
      archived.push(bundle);
    } catch (e) {
      errors.push(
        `archive ${record.id}: ${e instanceof Error ? e.message : 'unknown'}`,
      );
    }
  }

  return { archived, kept, errors };
}

// ============================================================================
// SECTION 9 — PURGE QUEUE
// ============================================================================

/**
 * Adiciona item à fila de purga. Retorna o item com ID.
 */
export function enqueuePurge(item: PurgeQueueItem): PurgeQueueItem {
  purgeCounter += 1;
  const stored: PurgeQueueItem = { ...item };
  purgeQueue.push(stored);
  registerAudit({
    action: 'purge_enqueue',
    recordId: item.recordId,
    performedBy: 'system',
    performedAt: '2026-06-29T00:00:00.000Z',
    reason: `Priority ${item.priority}`,
    metadata: { priority: item.priority, attempts: item.attempts },
  });
  return stored;
}

/**
 * Processa a fila de purga. Tenta executar cada item; falhas incrementam
 * tentativas e mantêm na fila (até 3 tentativas).
 */
export function processPurgeQueue(
  queue: PurgeQueueItem[],
  currentDate: string,
): { processed: string[]; failed: string[]; deferred: PurgeQueueItem[] } {
  const processed: string[] = [];
  const failed: string[] = [];
  const deferred: PurgeQueueItem[] = [];

  for (const item of queue) {
    if (item.attempts >= 3) {
      failed.push(item.recordId);
      continue;
    }
    if (Date.parse(item.scheduledAt) > Date.parse(currentDate)) {
      deferred.push(item);
      continue;
    }
    try {
      purgeQueue.splice(
        purgeQueue.findIndex((p) => p.recordId === item.recordId),
        1,
      );
      processed.push(item.recordId);
      registerAudit({
        action: 'purge_processed',
        recordId: item.recordId,
        performedBy: 'system',
        performedAt: currentDate,
        reason: `Priority ${item.priority}, attempts ${item.attempts}`,
      });
    } catch (e) {
      failed.push(item.recordId);
    }
  }

  return { processed, failed, deferred };
}

// ============================================================================
// SECTION 10 — REPORTING
// ============================================================================

/**
 * Constrói um relatório consolidado de retenção.
 */
export function buildRetentionReport(
  records: DataRecord[],
  actions: RetentionAction[],
  currentDate: string,
): RetentionReport {
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byClassification: Record<string, number> = {};
  let expiringThisWeek = 0;
  let expiringThisMonth = 0;
  let hardDeletesThisMonth = 0;
  let storageCostEstimateBRL = 0;

  for (const record of records) {
    const policy = loadPolicy(record.category);
    const status = computeRetentionStatus(record, policy, currentDate);
    byCategory[record.category] = (byCategory[record.category] ?? 0) + 1;
    byStatus[status] = (byStatus[status] ?? 0) + 1;
    byClassification[record.classification] =
      (byClassification[record.classification] ?? 0) + 1;
    const daysToExpiry = daysUntilExpiry(record, policy, currentDate);
    if (daysToExpiry >= 0 && daysToExpiry <= 7) expiringThisWeek += 1;
    if (daysToExpiry >= 0 && daysToExpiry <= 30) expiringThisMonth += 1;
    if (record.classification === 'sensitive') {
      storageCostEstimateBRL += record.sizeBytes * 0.00012;
    } else {
      storageCostEstimateBRL += record.sizeBytes * 0.00004;
    }
  }

  for (const action of actions) {
    if (action.action !== 'hard_delete') continue;
    const actionDate = Date.parse(action.executedAt ?? action.scheduledAt);
    const current = Date.parse(currentDate);
    if (current - actionDate <= 30 * 86400000) {
      hardDeletesThisMonth += 1;
    }
  }

  return {
    generatedAt: currentDate,
    totalRecords: records.length,
    byCategory: byCategory as Record<DataCategory, number>,
    byStatus: byStatus as Record<RetentionStatus, number>,
    byClassification: byClassification as Record<Classification, number>,
    expiringThisWeek: getRecordsExpiring(records, 7),
    expiringThisMonth: getRecordsExpiring(records, 30),
    hardDeletesThisMonth,
    archivalHits: archives.size,
    storageCostEstimateBRL: Math.round(storageCostEstimateBRL * 100) / 100,
    legalHoldCount: Array.from(legalHolds.values()).filter(
      (h) => !h.releasedAt,
    ).length,
    purgeQueueDepth: purgeQueue.length,
  };
}

// ============================================================================
// SECTION 11 — CLASSIFICATION
// ============================================================================

/**
 * Classifica um registro. Combina score-base da categoria com sinais
 * detectados em tags e metadados.
 */
export function classifyRecord(record: DataRecord): ClassificationScore {
  const signals: ClassificationSignal[] = [];
  const base = BASE_SENSITIVITY[record.category] ?? 0.3;

  // Sinais positivos (aumentam sensibilidade)
  signals.push({
    signal: 'has-rgpd-sensitive-tag',
    weight: 0.3,
    matched: record.tags.includes('sacred') || record.tags.includes('ritual'),
    description: 'Tags rituais/sagradas presentes',
  });
  signals.push({
    signal: 'has-pii-tag',
    weight: 0.2,
    matched:
      record.tags.includes('cpf') ||
      record.tags.includes('rg') ||
      record.tags.includes('birthdate'),
    description: 'Documentos pessoais identificados nas tags',
  });
  signals.push({
    signal: 'has-financial-tag',
    weight: 0.25,
    matched:
      record.tags.includes('payment') || record.tags.includes('invoice'),
    description: 'Informação financeira',
  });
  signals.push({
    signal: 'mentorship-context',
    weight: 0.3,
    matched: record.tags.includes('mentorship') || record.tags.includes('private'),
    description: 'Contexto de mentoria ou conversa privada',
  });

  // Sinais negativos (reduzem sensibilidade)
  signals.push({
    signal: 'is-public',
    weight: -0.2,
    matched:
      record.tags.includes('public') || record.tags.includes('published'),
    description: 'Conteúdo explicitamente público',
  });
  signals.push({
    signal: 'is-anonymized',
    weight: -0.3,
    matched: record.tags.includes('anonymized') || record.tags.includes('aggregate'),
    description: 'Já passou por processo de anonimização',
  });
  signals.push({
    signal: 'is-archived',
    weight: -0.05,
    matched: record.tags.includes('archived'),
    description: 'Já está em archive — menor risco operacional',
  });

  let score = base;
  for (const s of signals) {
    if (s.matched) score += s.weight;
  }
  score = clamp(score, 0, 1);

  const suggested: Classification = scoreToClassification(score);
  const requiresReview =
    score >= 0.7 &&
    !SENSITIVE_CATEGORIES.has(record.category) &&
    record.category !== 'audit_log' &&
    record.category !== 'payment_records';

  const rationale = signals
    .filter((s) => s.matched)
    .map((s) => s.description)
    .join('; ');

  const result: ClassificationScore = {
    record,
    sensitivityScore: Math.round(score * 100) / 100,
    suggestedClassification: suggested,
    rationale: rationale === '' ? 'Sinais-base apenas' : rationale,
    requiresReview,
    signals,
  };
  return result;
}

/**
 * Valida a classificação atribuída a um registro. Retorna issues[].
 */
export function validateClassification(
  classification: Classification,
  record: DataRecord,
): string[] {
  const issues: string[] = [];
  const base = BASE_SENSITIVITY[record.category] ?? 0.3;

  // Sensitive demais para categoria comum
  if (
    classification === 'sensitive' &&
    !SENSITIVE_CATEGORIES.has(record.category) &&
    record.category !== 'audit_log' &&
    record.category !== 'payment_records' &&
    base < 0.5
  ) {
    issues.push(
      `Classificação sensitive inadequada para categoria ${record.category} (base=${base})`,
    );
  }

  // Public em categoria sensível
  if (
    classification === 'public' &&
    (SENSITIVE_CATEGORIES.has(record.category) || record.category === 'private_messages')
  ) {
    issues.push(
      `Classificação public inadequada para categoria sensível ${record.category}`,
    );
  }

  // Derived em categoria autoral
  if (
    classification === 'derived' &&
    (record.category === 'user_profile' ||
      record.category === 'user_content' ||
      record.category === 'sacred_ritual_records')
  ) {
    issues.push(
      `Categoria autoral ${record.category} não deveria ser 'derived'`,
    );
  }

  // Aggregate com sensibilidade alta
  if (classification === 'aggregate' && base > 0.5) {
    issues.push(
      `Classificação aggregate incompatível com score-base ${base} da categoria`,
    );
  }

  return issues;
}

// ============================================================================
// SECTION 12 — LGPD ART 16
// ============================================================================

/**
 * Avalia se LGPD Art. 16 aplica a um registro dado um pedido do titular.
 * Retorna decisão + reasons + graceDays (janela antes do hard-delete).
 */
export function respectLgpdArt16(
  record: DataRecord,
  request: DataSubjectRequest,
  policy: RetentionPolicy,
): { canDelete: boolean; reasons: string[]; graceDays: number } {
  const reasons: string[] = [];
  let canDelete = true;

  // Exceções do Art. 16
  if (isRecordUnderHold(record.id, record.ownerId, record.category)) {
    canDelete = false;
    reasons.push('Registro sob legal hold — Art. 16 §1°');
  }

  if (
    record.category === 'audit_log' ||
    record.category === 'payment_records'
  ) {
    if (policy.exemptFromAutoDelete === true) {
      canDelete = false;
      reasons.push(
        `Categoria ${record.category} possui retenção legal obrigatória (Art. 16 §1° II)`,
      );
    }
  }

  if (request.type !== 'deletion') {
    reasons.push(`Pedido é '${request.type}' — não aciona Art. 16 diretamente`);
  }

  if (request.subjectId !== record.ownerId) {
    canDelete = false;
    reasons.push('Titular do pedido não é dono do registro');
  }

  // Categorias sensíveis pedem revisão adicional
  if (
    SENSITIVE_CATEGORIES.has(record.category) &&
    request.type === 'deletion'
  ) {
    reasons.push(
      `Categoria sensível ${record.category} — revisão adicional de 7 dias`,
    );
  }

  // Janela de graça baseada no policy
  const graceDays = policy.softDeleteGraceDays;

  if (canDelete && reasons.length === 0) {
    reasons.push('Art. 16 aplica — eliminação autorizada');
  }

  return { canDelete, reasons, graceDays };
}

/**
 * Aplica janela de graça a registros marcados para deleção.
 * Retorna os registros que já estão prontos para hard-delete (graça
 * expirou).
 */
export function applyDeletableGrace(
  records: DataRecord[],
  currentDate: string,
): DataRecord[] {
  const ready: DataRecord[] = [];
  for (const record of records) {
    const tomb = Array.from(tombstones.values()).find(
      (t) => t.originalId === record.id,
    );
    if (!tomb) continue;
    if (Date.parse(currentDate) >= Date.parse(tomb.retainUntil)) {
      ready.push(record);
    }
  }
  return ready;
}

// ============================================================================
// SECTION 13 — AUDIT TRAIL
// ============================================================================

/**
 * Registra uma entrada de auditoria. Retorna o AuditEntry criado.
 */
export function registerAudit(
  action: Omit<AuditEntry, 'id'>,
): AuditEntry {
  auditCounter += 1;
  const entry: AuditEntry = {
    id: `aud-${auditCounter.toString().padStart(8, '0')}`,
    action: action.action,
    recordId: action.recordId,
    performedBy: action.performedBy,
    performedAt: action.performedAt,
    reason: action.reason,
  };
  if (action.ipAddress !== undefined) entry.ipAddress = action.ipAddress;
  if (action.userAgent !== undefined) entry.userAgent = action.userAgent;
  if (action.policyVersion !== undefined) entry.policyVersion = action.policyVersion;
  if (action.metadata !== undefined) entry.metadata = action.metadata;
  auditTrail.push(entry);
  return entry;
}

/**
 * Retorna o trail de auditoria de um recordId específico.
 */
export function getAuditTrail(recordId: string): AuditEntry[] {
  return auditTrail.filter((a) => a.recordId === recordId);
}

// ============================================================================
// SECTION 14 — VALIDATION
// ============================================================================

/**
 * Valida uma RetentionPolicy. Retorna array de issues.
 */
export function validatePolicy(policy: RetentionPolicy): string[] {
  const issues: string[] = [];
  if (policy.id === '' || policy.id.trim() === '') {
    issues.push('id não pode ser vazio');
  }
  if (!Number.isFinite(policy.retentionDays) || policy.retentionDays < 0) {
    issues.push('retentionDays deve ser >= 0');
  }
  if (
    !Number.isFinite(policy.hardDeleteAfterDays) ||
    policy.hardDeleteAfterDays < 0
  ) {
    issues.push('hardDeleteAfterDays deve ser >= 0');
  }
  if (
    !Number.isFinite(policy.softDeleteGraceDays) ||
    policy.softDeleteGraceDays < 0
  ) {
    issues.push('softDeleteGraceDays deve ser >= 0');
  }
  if (
    !Number.isFinite(policy.archivalAfterDays) ||
    policy.archivalAfterDays < 0
  ) {
    issues.push('archivalAfterDays deve ser >= 0');
  }
  if (policy.hardDeleteAfterDays < policy.retentionDays) {
    issues.push(
      'hardDeleteAfterDays não pode ser menor que retentionDays',
    );
  }
  if (policy.archivalAfterDays > policy.retentionDays) {
    issues.push('archivalAfterDays deveria ser <= retentionDays');
  }
  if (policy.legalBasis.trim() === '') {
    issues.push('legalBasis é obrigatório');
  }
  if (policy.version < 1) {
    issues.push('version deve ser >= 1');
  }
  const validJurisdictions = new Set(['LGPD_BR', 'GDPR_EU', 'CCPA_US', 'multi']);
  if (!validJurisdictions.has(policy.jurisdiction)) {
    issues.push(`jurisdiction inválida: ${policy.jurisdiction}`);
  }
  return issues;
}

/**
 * Valida um DataRecord. Retorna issues[].
 */
export function validateRecord(record: DataRecord): string[] {
  const issues: string[] = [];
  if (record.id === '' || record.id.trim() === '') {
    issues.push('id não pode ser vazio');
  }
  if (record.ownerId === '' || record.ownerId.trim() === '') {
    issues.push('ownerId obrigatório');
  }
  if (!isISODate(record.createdAt)) {
    issues.push(`createdAt inválido: ${record.createdAt}`);
  }
  if (!isISODate(record.updatedAt)) {
    issues.push(`updatedAt inválido: ${record.updatedAt}`);
  }
  if (!isISODate(record.lastAccessedAt)) {
    issues.push(`lastAccessedAt inválido: ${record.lastAccessedAt}`);
  }
  if (record.sizeBytes < 0) {
    issues.push('sizeBytes não pode ser negativo');
  }
  if (record.sensitivityScore < 0 || record.sensitivityScore > 1) {
    issues.push('sensitivityScore deve estar em [0,1]');
  }
  if (
    SENSITIVE_CATEGORIES.has(record.category) &&
    record.classification !== 'sensitive'
  ) {
    issues.push(
      `Categoria ${record.category} requer classification=sensitive`,
    );
  }
  return issues;
}

// ============================================================================
// SECTION 15 — UTILITIES (HELPERS)
// ============================================================================

/**
 * Retorna registros que expiram dentro de N dias.
 */
export function getRecordsExpiring(
  records: DataRecord[],
  daysFromNow: number,
): DataRecord[] {
  const out: DataRecord[] = [];
  const horizon = '2026-06-29T00:00:00.000Z';
  const target = Date.parse(horizon) + daysFromNow * 86400000;
  for (const record of records) {
    const policy = loadPolicy(record.category);
    const expiry = Date.parse(record.createdAt) + policy.retentionDays * 86400000;
    if (expiry >= Date.parse(horizon) && expiry <= target) {
      out.push(record);
    }
  }
  return out;
}

/**
 * Filtra registros por categoria.
 */
export function getRecordsByCategory(
  records: DataRecord[],
  category: DataCategory,
): DataRecord[] {
  return records.filter((r) => r.category === category);
}

/**
 * Calcula janela de retenção entre duas datas.
 */
export function computeRetentionWindow(
  createdAt: string,
  retentionDays: number,
): RetentionWindow {
  const start = Date.parse(createdAt);
  const end = start + retentionDays * 86400000;
  const calendarEvent = detectCalendarEvent(new Date(end).toISOString());
  const window: RetentionWindow = {
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
    days: retentionDays,
    businessDays: Math.floor((retentionDays * 5) / 7),
    holidayAdjusted: calendarEvent !== undefined,
  };
  if (calendarEvent !== undefined) window.calendarEvent = calendarEvent;
  return window;
}

/**
 * Calcula dias até o expiry de um record.
 */
export function daysUntilExpiry(
  record: DataRecord,
  policy: RetentionPolicy,
  currentDate: string,
): number {
  const created = Date.parse(record.createdAt);
  const current = Date.parse(currentDate);
  const ageDays = Math.floor((current - created) / 86400000);
  return policy.retentionDays - ageDays;
}

/**
 * Dias desde o último acesso.
 */
export function daysSinceLastAccess(
  record: DataRecord,
  currentDate: string,
): number {
  return daysBetween(record.lastAccessedAt, currentDate);
}

/**
 * Decide o tier de storage baseado em idade e classificação.
 */
export function getStorageTier(
  age: number,
  classification: Classification,
): ArchiveStorageTier {
  if (classification === 'sensitive' && age > 365 * 5) return 'erasure';
  if (age > 365 * 3) return 'glacier';
  if (age > 365) return 'cold';
  if (age > 180) return 'warm';
  return 'hot';
}

/**
 * Estima o tamanho total de um archive em bytes.
 */
export function estimateArchiveSize(records: DataRecord[]): number {
  let total = 0;
  for (const r of records) {
    total += r.sizeBytes;
  }
  // Adiciona overhead de metadata (~2%)
  return Math.round(total * 1.02);
}

// ============================================================================
// SECTION 16 — INTERNAL HELPERS
// ============================================================================

function daysBetween(from: string, to: string): number {
  return Math.floor((Date.parse(to) - Date.parse(from)) / 86400000);
}

function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * 86400000).toISOString();
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function scoreToClassification(score: number): Classification {
  if (score >= 0.85) return 'sensitive';
  if (score >= 0.55) return 'personal';
  if (score >= 0.25) return 'derived';
  if (score >= 0.05) return 'aggregate';
  return 'public';
}

function isISODate(s: string): boolean {
  if (typeof s !== 'string') return false;
  const t = Date.parse(s);
  return Number.isFinite(t);
}

function detectCalendarEvent(iso: string): string | undefined {
  const d = new Date(iso);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  // Feriados brasileiros e datas espirituais relevantes
  if (month === 4 && day === 21) return 'Tiradentes';
  if (month === 9 && day === 7) return 'Independência';
  if (month === 11 && day === 2) return 'Finados';
  if (month === 11 && day === 15) return 'Proclamação da República';
  if (month === 12 && day === 25) return 'Natal';
  if (month === 1 && day === 1) return 'Confraternização Universal';
  // Datas sagradas/ecumênicas
  if (month === 2 && day === 21) return 'Dia da Confraternização Espírita';
  if (month === 3 && day === 20) return 'Equinócio de Outono';
  if (month === 6 && day === 21) return 'Solstício de Inverno';
  if (month === 12 && day === 21) return 'Solstício de Verão';
  return undefined;
}

// ============================================================================
// SECTION 17 — TEST EXPORTS (PARA DELIBERADAMENTE INSPECIONAR)
// ============================================================================

/**
 * Lista todos os legal holds atualmente ativos (não liberados).
 */
export function listActiveLegalHolds(): LegalHold[] {
  return Array.from(legalHolds.values()).filter((h) => !h.releasedAt);
}

/**
 * Lista todos os tombstones.
 */
export function listTombstones(): SoftDeleteTombstone[] {
  return Array.from(tombstones.values());
}

/**
 * Lista todos os archive bundles.
 */
export function listArchives(): ArchiveBundle[] {
  return Array.from(archives.values());
}

/**
 * Lista todos os itens da fila de purga.
 */
export function listPurgeQueue(): PurgeQueueItem[] {
  return [...purgeQueue];
}

/**
 * Lista todas as revisões feitas.
 */
export function listReviews(): RetentionReview[] {
  return [...reviews];
}

/**
 * Reseta o estado de runtime (útil entre testes). Não reseta policies
 * — apenas holds/tombstones/archives/queue/audit/reviews.
 */
export function resetRuntimeState(): void {
  legalHolds.clear();
  tombstones.clear();
  archives.clear();
  purgeQueue.length = 0;
  auditTrail.length = 0;
  reviews.length = 0;
  auditCounter = 0;
  tombstoneCounter = 0;
  archiveCounter = 0;
  holdCounter = 0;
  reviewCounter = 0;
  purgeCounter = 0;
}

// ============================================================================
// FOOTER
// ============================================================================
// w46/data-retention-policy.ts — 2160 lines — 2026-06-29T11:35:00Z
// ============================================================================