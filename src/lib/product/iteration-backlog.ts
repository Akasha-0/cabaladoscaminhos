/**
 * product/iteration-backlog.ts — Iteration backlog module (Wave 38)
 * ============================================================================
 * Backlog priorizado por impact × effort × KPI linkage, derivado do Day-7
 * review. Cada item tem:
 *   - id (W38B-N)
 *   - title
 *   - source (qual sinal originou: NPS, support, bug, feature_vote, perf)
 *   - effort (S/M/L)
 *   - impact (1-5)
 *   - kpiLinked (qual KPI move)
 *   - status (TODO/IN_PROGRESS/DONE)
 *   - owner (quem está responsible)
 *   - estimatedSLA (dias)
 *   - tags
 *
 * Funções:
 *   - createBacklogItem(input) → valida com Zod
 *   - prioritizeBacklog(items) → score = impact * 10 - effortPenalty
 *   - filterByKPI(items, kpi) → subset que move um KPI específico
 *   - computeWeeklyCapacity(items, ownerDays) → quantos items cabem na semana
 *
 * NÃO acessa Prisma: pure functions + Zod schemas.
 * ============================================================================
 */

import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const EffortSchema = z.enum(['S', 'M', 'L']);
export const StatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE']);
export const ImpactSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export const SourceSchema = z.enum(['nps', 'support', 'bug', 'feature_vote', 'perf', 'retro', 'marketing', 'community']);
export const KPISchema = z.enum([
  'NPS_D7',
  'DAU_MAU',
  'D7_RETENTION',
  'COMMENTS_PER_POST',
  'AKASHA_CONVERSATIONS',
  'CONVERSION_FUNNEL',
  'PERF_P95',
  'MODERATION_SLA',
  'MARKETING_CAC',
  'COMMUNITY_HEALTH',
]);

export const BacklogItemSchema = z.object({
  id: z.string().regex(/^W38B-\d{3}$/, 'must be W38B-NNN'),
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(1000),
  source: SourceSchema,
  effort: EffortSchema,
  impact: ImpactSchema,
  kpiLinked: z.array(KPISchema).min(1),
  status: StatusSchema,
  owner: z.string(),
  estimatedSLADays: z.number().int().positive().max(14),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BacklogItem = z.infer<typeof BacklogItemSchema>;
export type Effort = z.infer<typeof EffortSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Impact = z.infer<typeof ImpactSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type KPI = z.infer<typeof KPISchema>;

// ============================================================================
// Priority scoring
// ============================================================================

const effortPenaltyMap: Record<Effort, number> = { S: 0, M: 5, L: 15 };

/**
 * Score = impact * 10 - effortPenalty
 * Examples:
 *   - Impact 5, Effort S → 50
 *   - Impact 5, Effort M → 45
 *   - Impact 5, Effort L → 35
 *   - Impact 3, Effort S → 30
 *   - Impact 3, Effort M → 25
 *   - Impact 1, Effort L → -5
 */
export function scoreBacklogItem(item: BacklogItem): number {
  return item.impact * 10 - effortPenaltyMap[item.effort];
}

/**
 * Retorna items ordenados por score descendente.
 * Items DONE ficam no final (já entregues).
 */
export function prioritizeBacklog(items: BacklogItem[]): BacklogItem[] {
  return [...items].sort((a, b) => {
    if (a.status === 'DONE' && b.status !== 'DONE') return 1;
    if (b.status === 'DONE' && a.status !== 'DONE') return -1;
    return scoreBacklogItem(b) - scoreBacklogItem(a);
  });
}

// ============================================================================
// Filtering
// ============================================================================

export function filterByStatus(items: BacklogItem[], status: Status): BacklogItem[] {
  return items.filter((item) => item.status === status);
}

export function filterByKPI(items: BacklogItem[], kpi: KPI): BacklogItem[] {
  return items.filter((item) => item.kpiLinked.includes(kpi));
}

export function filterByOwner(items: BacklogItem[], owner: string): BacklogItem[] {
  return items.filter((item) => item.owner === owner);
}

export function filterByEffort(items: BacklogItem[], effort: Effort): BacklogItem[] {
  return items.filter((item) => item.effort === effort);
}

// ============================================================================
// Capacity planning
// ============================================================================

/**
 * Estima capacidade semanal. Assumptions:
 *   - 1 dev @ 5 dias úteis/semana, ~6h foco/dia = 30h foco/semana
 *   - Effort S = 1 dia (~6h)
 *   - Effort M = 2-3 dias (~12-18h)
 *   - Effort L = 5+ dias (~30h+)
 *
 * Retorna: { capacityItems, warnings, totalEffortDays }
 */
export interface CapacityPlan {
  totalCapacityDays: number;
  totalEffortDays: number;
  capacityItems: BacklogItem[];
  overflow: BacklogItem[];
  warnings: string[];
}

const effortDaysMap: Record<Effort, number> = { S: 1, M: 2.5, L: 5 };

export function computeWeeklyCapacity(
  items: BacklogItem[],
  ownerDaysAvailable: number,
): CapacityPlan {
  const sorted = prioritizeBacklog(items).filter((i) => i.status === 'TODO' || i.status === 'IN_PROGRESS');
  const capacityItems: BacklogItem[] = [];
  const overflow: BacklogItem[] = [];
  const warnings: string[] = [];
  let used = 0;

  for (const item of sorted) {
    const days = effortDaysMap[item.effort];
    if (used + days <= ownerDaysAvailable) {
      capacityItems.push(item);
      used += days;
    } else {
      overflow.push(item);
    }
  }

  if (overflow.length > 0) {
    warnings.push(
      `${overflow.length} items overflow capacity. Consider deferring or splitting.`,
    );
  }

  return {
    totalCapacityDays: ownerDaysAvailable,
    totalEffortDays: used,
    capacityItems,
    overflow,
    warnings,
  };
}

// ============================================================================
// Builder
// ============================================================================

export function createBacklogItem(input: Omit<BacklogItem, 'createdAt' | 'updatedAt'>): BacklogItem {
  const now = new Date().toISOString();
  return BacklogItemSchema.parse({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// Top 20 seed (Wave 38 Day-7 review)
// ============================================================================

/**
 * Top 20 items priorizados pelo Day-7 review. Owners seguem convenção:
 *   - Designer (Lina)
 *   - Coder
 *   - QA (Ravena)
 *   - PM (Tomás)
 *   - DevOps
 *   - Security (Caio)
 *   - AI
 *   - Coder + Designer
 *   - Full team
 */
export function buildDay7BacklogSeed(): BacklogItem[] {
  const now = new Date().toISOString();

  const items: Array<Omit<BacklogItem, 'createdAt' | 'updatedAt'>> = [
    {
      id: 'W38B-001',
      title: 'Fix Akasha 500 intermitente',
      description: 'Akasha retorna erro 500 em ~14% das conversas. Adicionar retry pattern com exponential backoff + circuit breaker.',
      source: 'bug',
      effort: 'M',
      impact: 5,
      kpiLinked: ['AKASHA_CONVERSATIONS', 'NPS_D7'],
      status: 'TODO',
      owner: 'Coder + AI',
      estimatedSLADays: 3,
      tags: ['akasha', 'reliability', 'P0-bug'],
    },
    {
      id: 'W38B-002',
      title: 'Fix Stripe webhook timeout',
      description: 'Webhook do Stripe falha intermitente (6 reports). Implementar idempotency keys + retry queue no Redis.',
      source: 'bug',
      effort: 'M',
      impact: 5,
      kpiLinked: ['CONVERSION_FUNNEL', 'MARKETING_CAC'],
      status: 'TODO',
      owner: 'Coder',
      estimatedSLADays: 3,
      tags: ['billing', 'reliability', 'P0-bug'],
    },
    {
      id: 'W38B-003',
      title: 'Mobile crash no iPhone 12 sem internet',
      description: 'App trava quando abre Akasha offline. Adicionar offline cache + degraded mode UI.',
      source: 'bug',
      effort: 'M',
      impact: 5,
      kpiLinked: ['DAU_MAU', 'COMMUNITY_HEALTH'],
      status: 'TODO',
      owner: 'Coder',
      estimatedSLADays: 5,
      tags: ['mobile', 'offline', 'P0-bug'],
    },
    {
      id: 'W38B-004',
      title: 'Onboarding v2 (tradição explainer)',
      description: 'Etapa 3 do onboarding (seleção de tradição) confusa — adicionar preview visual + descrição 1-linha por tradição.',
      source: 'nps',
      effort: 'M',
      impact: 5,
      kpiLinked: ['D7_RETENTION', 'CONVERSION_FUNNEL'],
      status: 'TODO',
      owner: 'Designer + Coder',
      estimatedSLADays: 5,
      tags: ['onboarding', 'activation'],
    },
    {
      id: 'W38B-005',
      title: 'Feed perf optimization (p95 < 800ms)',
      description: 'Feed tem p95 = 1850ms (target 800ms). Adicionar Redis cache + otimizar queries Prisma + infinite scroll cursor.',
      source: 'perf',
      effort: 'M',
      impact: 5,
      kpiLinked: ['PERF_P95', 'DAU_MAU'],
      status: 'TODO',
      owner: 'Coder + DevOps',
      estimatedSLADays: 5,
      tags: ['performance', 'feed'],
    },
    {
      id: 'W38B-006',
      title: 'Modo escuro',
      description: '234 feature votes. Implementar tema dark seguindo design tokens (W17).',
      source: 'feature_vote',
      effort: 'M',
      impact: 4,
      kpiLinked: ['DAU_MAU', 'NPS_D7'],
      status: 'TODO',
      owner: 'Designer + Coder',
      estimatedSLADays: 5,
      tags: ['mobile', 'ui'],
    },
    {
      id: 'W38B-007',
      title: 'Notificações push para respostas',
      description: '189 votes. Adicionar Web Push + integração com notification dispatcher (W34 v2).',
      source: 'feature_vote',
      effort: 'M',
      impact: 5,
      kpiLinked: ['DAU_MAU', 'COMMENTS_PER_POST'],
      status: 'TODO',
      owner: 'Coder',
      estimatedSLADays: 5,
      tags: ['notifications', 'engagement'],
    },
    {
      id: 'W38B-008',
      title: 'Akasha /admin/insights p95 optimization',
      description: 'Rota admin/insights tem p95 = 1900ms. Pré-computar agregações em cron job (W34 pattern).',
      source: 'perf',
      effort: 'M',
      impact: 4,
      kpiLinked: ['PERF_P95'],
      status: 'TODO',
      owner: 'Coder + DevOps',
      estimatedSLADays: 3,
      tags: ['performance', 'admin'],
    },
    {
      id: 'W38B-009',
      title: 'Salvar threads como favoritos',
      description: '156 votes + support ticket recorrente. Adicionar ícone de estrela + página /favorites.',
      source: 'feature_vote',
      effort: 'S',
      impact: 3,
      kpiLinked: ['DAU_MAU'],
      status: 'TODO',
      owner: 'Coder',
      estimatedSLADays: 2,
      tags: ['community', 'quick-win'],
    },
    {
      id: 'W38B-010',
      title: 'Fix login Google em Safari',
      description: 'OAuth Google falha em 11 reports. Investigar Safari ITP + adicionar fallback para popup flow.',
      source: 'support',
      effort: 'M',
      impact: 4,
      kpiLinked: ['CONVERSION_FUNNEL'],
      status: 'TODO',
      owner: 'Coder',
      estimatedSLADays: 3,
      tags: ['auth', 'P1-bug'],
    },
    {
      id: 'W38B-011',
      title: 'Export dados LGPD (self-service)',
      description: '98 votes + LGPD compliance (art. 18). Criar /settings/data-export + ZIP gerado assincronamente.',
      source: 'feature_vote',
      effort: 'S',
      impact: 5,
      kpiLinked: ['COMMUNITY_HEALTH', 'NPS_D7'],
      status: 'TODO',
      owner: 'Coder + Security',
      estimatedSLADays: 3,
      tags: ['lgpd', 'compliance'],
    },
    {
      id: 'W38B-012',
      title: 'Busca full-text nos artigos curados',
      description: '142 votes. Implementar tsvector + GIN index no Postgres + UI de busca avançada.',
      source: 'feature_vote',
      effort: 'M',
      impact: 4,
      kpiLinked: ['COMMUNITY_HEALTH'],
      status: 'TODO',
      owner: 'Coder',
      estimatedSLADays: 5,
      tags: ['content', 'search'],
    },
    {
      id: 'W38B-013',
      title: 'Fix images > 5MB quebram layout',
      description: '18 reports. Adicionar client-side resize + CDN image transform (Supabase Storage).',
      source: 'bug',
      effort: 'S',
      impact: 3,
      kpiLinked: ['COMMUNITY_HEALTH'],
      status: 'TODO',
      owner: 'Coder',
      estimatedSLADays: 2,
      tags: ['P2-bug', 'quick-win'],
    },
    {
      id: 'W38B-014',
      title: 'Akasha contexto persistente entre sessões',
      description: '87 votes (big bet). Memory layer com Redis + embedding search para recall de conversas anteriores.',
      source: 'feature_vote',
      effort: 'L',
      impact: 5,
      kpiLinked: ['AKASHA_CONVERSATIONS', 'NPS_D7', 'D7_RETENTION'],
      status: 'TODO',
      owner: 'AI + Coder',
      estimatedSLADays: 10,
      tags: ['akasha', 'big-bet'],
    },
    {
      id: 'W38B-015',
      title: 'A/B test: signup form simplificado',
      description: 'Funnel mostra 30% conversion entre landing → signup start. Testar social login primeiro + form em 2 etapas.',
      source: 'marketing',
      effort: 'S',
      impact: 4,
      kpiLinked: ['CONVERSION_FUNNEL', 'MARKETING_CAC'],
      status: 'TODO',
      owner: 'Designer + PM',
      estimatedSLADays: 3,
      tags: ['marketing', 'experiment'],
    },
    {
      id: 'W38B-016',
      title: 'A11y: focus trap em modal de convite',
      description: 'Bug a11y reportado. Implementar focus trap + ESC close + aria-labels.',
      source: 'bug',
      effort: 'S',
      impact: 2,
      kpiLinked: ['COMMUNITY_HEALTH'],
      status: 'TODO',
      owner: 'Coder + QA',
      estimatedSLADays: 2,
      tags: ['a11y', 'quick-win'],
    },
    {
      id: 'W38B-017',
      title: 'Galeria de fotos de rituais',
      description: '76 votes. Adicionar upload múltiplo + galeria por ritual com lightbox.',
      source: 'feature_vote',
      effort: 'M',
      impact: 3,
      kpiLinked: ['COMMUNITY_HEALTH'],
      status: 'TODO',
      owner: 'Coder + Designer',
      estimatedSLADays: 4,
      tags: ['rituals', 'community'],
    },
    {
      id: 'W38B-018',
      title: 'Mentor matching v2 (skill graph)',
      description: 'Após 50 sessions, refinar matching algorithm com embeddings + skill graph (W26 mentorship infra).',
      source: 'community',
      effort: 'L',
      impact: 4,
      kpiLinked: ['COMMUNITY_HEALTH', 'D7_RETENTION'],
      status: 'TODO',
      owner: 'Coder + PM',
      estimatedSLADays: 10,
      tags: ['mentorship', 'big-bet'],
    },
    {
      id: 'W38B-019',
      title: 'Email nurture Day 7 (NPS responder)',
      description: 'Após NPS D7, enviar email personalizado para detratores pedindo elaboration + oferecendo 1:1 com PM.',
      source: 'nps',
      effort: 'S',
      impact: 4,
      kpiLinked: ['NPS_D7'],
      status: 'TODO',
      owner: 'PM + Coder',
      estimatedSLADays: 2,
      tags: ['nps', 'marketing'],
    },
    {
      id: 'W38B-020',
      title: 'Perf public landing page (LCP < 2s)',
      description: 'Lighthouse audit mostra LCP = 2.4s. Otimizar hero image (WebP + CDN) + reduzir JS bundle.',
      source: 'perf',
      effort: 'S',
      impact: 4,
      kpiLinked: ['PERF_P95', 'CONVERSION_FUNNEL', 'MARKETING_CAC'],
      status: 'TODO',
      owner: 'Coder + Designer',
      estimatedSLADays: 2,
      tags: ['performance', 'marketing'],
    },
  ];

  return items.map((i) => ({
    ...i,
    createdAt: now,
    updatedAt: now,
  }));
}