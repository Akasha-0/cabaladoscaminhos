/**
 * analytics/funnels.ts — Funnel analytics definitions + builders (Wave 34)
 * ============================================================================
 * Define o "Funil da Jornada Espiritual" do Cabala dos Caminhos e computa
 * conversion rates entre etapas. Diferente de `funnel.ts` (Wave 20),
 * este módulo é declarativo (etapas nomeadas + thresholds) e usado pelo
 * /admin/insights para visualização waterfall.
 *
 * Funis disponíveis:
 *   - ACQUISITION (visitor → signup)
 *   - ACTIVATION  (signup → first post)
 *   - ENGAGEMENT  (first post → akasha conversation)
 *   - MONETIZATION (akasha chat → marketplace booking)
 *   - RETENTION   (booking → repeat purchase)
 *
 * Model: array ordenado de FunnelStep com criteria (eventos PostHog).
 * Computação: counts em cada step + conversion rates parciais + drop-off.
 *
 * LGPD:
 *   - Não retorna distinct_ids. Apenas counts agregados.
 *   - k-anonymity aplicada quando step tem < 5 users.
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type FunnelId =
  | "ACQUISITION"
  | "ACTIVATION"
  | "ENGAGEMENT"
  | "MONETIZATION"
  | "RETENTION";

export interface FunnelStep {
  /** Ordem (1..N). */
  order: number;
  /** Nome legível. */
  name: string;
  /** Descrição da ação esperada. */
  description: string;
  /** Eventos que contam para esse step (qualquer um matched). */
  events: string[];
  /** Distinct property filtro (e.g. method='email'). */
  filter?: Record<string, string>;
  /** Minutos apos o step anterior dentro do qual o evento é contado. */
  windowMinutes: number;
}

export interface FunnelDefinition {
  id: FunnelId;
  name: string;
  description: string;
  steps: FunnelStep[];
}

export interface FunnelEvent {
  /** Distinct identifier (uuid). Não exposto no output. */
  userId: string;
  /** Event name (snake_case). */
  event: string;
  /** Properties parseadas do evento. */
  properties: Record<string, unknown>;
  /** Timestamp ISO 8601. */
  timestamp: string;
}

export interface FunnelRow {
  step: FunnelStep;
  /** Numero de users únicos que atingiram o step. */
  users: number;
  /** Conversion desde o step anterior (0..1). NaN se step=1. */
  conversionFromPrev: number;
  /** Conversion desde o step 1 (top of funnel, 0..1). */
  conversionFromTop: number;
  /** Drop absoluto (users que abandonaram entre prev e este). */
  dropFromPrev: number;
  /** True se users < kThreshold (k-anonymity). */
  isSmall: boolean;
}

export interface FunnelResult {
  definition: FunnelDefinition;
  rows: FunnelRow[];
  /** Aggregates cross-funnel. */
  summary: {
    topUsers: number;
    bottomUsers: number;
    overallConversion: number;
    worstStep: { order: number; dropFromPrev: number } | null;
    generatedAt: string;
  };
  meta: {
    /** Total events consumidos. */
    eventsConsumed: number;
    /** Window total do funil em horas. */
    windowHours: number;
    /** k-anonymity threshold. */
    kThreshold: number;
  };
}

// ============================================================================
// Schema
// ============================================================================

export const FunnelEventSchema = z.object({
  userId: z.string().min(1),
  event: z.string().min(1),
  properties: z.record(z.unknown()),
  timestamp: z.string(),
});

// ============================================================================
// Funnel definitions (canônicas)
// ============================================================================

export const FUNNEL_ACQUISITION: FunnelDefinition = {
  id: "ACQUISITION",
  name: "Aquisição (Visitor → Signup)",
  description: "Conversão do público anônimo até criar conta.",
  steps: [
    {
      order: 1,
      name: "Visitante landing",
      description: "Usuario visitou /validacao",
      events: ["page_viewed"],
      windowMinutes: 60 * 24, // 24h
    },
    {
      order: 2,
      name: "CTA clicado",
      description: "Clicou no CTA principal da landing",
      events: ["funnel_cta_click"],
      windowMinutes: 60,
    },
    {
      order: 3,
      name: "Signup completo",
      description: "Completou signup (email, OAuth ou magic link)",
      events: ["user_signed_up"],
      windowMinutes: 60 * 2,
    },
  ],
};

export const FUNNEL_ACTIVATION: FunnelDefinition = {
  id: "ACTIVATION",
  name: "Ativação (Signup → First Post)",
  description: "Tempo até o usuário publicar o primeiro conteúdo.",
  steps: [
    {
      order: 1,
      name: "Signup",
      description: "Cadastro efetuado",
      events: ["user_signed_up"],
      windowMinutes: 60 * 24,
    },
    {
      order: 2,
      name: "Onboarding completo",
      description: "Concluiu onboarding 100%",
      events: ["onboarding_completed"],
      windowMinutes: 60 * 24,
    },
    {
      order: 3,
      name: "Primeiro post",
      description: "Criou primeiro post (text/image/quote/ritual)",
      events: ["post_created"],
      windowMinutes: 60 * 24 * 3,
    },
    {
      order: 4,
      name: "Primeira curtida",
      description: "Deu primeira curtida",
      events: ["post_liked"],
      windowMinutes: 60 * 24,
    },
  ],
};

export const FUNNEL_ENGAGEMENT: FunnelDefinition = {
  id: "ENGAGEMENT",
  name: "Engajamento (First Post → Akasha)",
  description: "Caminho até o primeiro uso da IA Akasha.",
  steps: [
    {
      order: 1,
      name: "Post criado",
      description: "Já criou pelo menos um post",
      events: ["post_created"],
      windowMinutes: 60 * 24 * 365,
    },
    {
      order: 2,
      name: "Feed visualizado",
      description: "Abriu o feed após postar",
      events: ["feed_viewed"],
      windowMinutes: 60 * 24,
    },
    {
      order: 3,
      name: "Akasha aberto",
      description: "Abriu o chat Akasha IA",
      events: ["akashic_chat_opened"],
      windowMinutes: 60 * 24 * 3,
    },
    {
      order: 4,
      name: "Mensagem enviada",
      description: "Enviou primeira mensagem para Akasha",
      events: ["akashic_message_sent"],
      windowMinutes: 60,
    },
  ],
};

export const FUNNEL_MONETIZATION: FunnelDefinition = {
  id: "MONETIZATION",
  name: "Monetização (Akasha → Marketplace)",
  description: "Engajamento profundo até primeira reserva.",
  steps: [
    {
      order: 1,
      name: "Akasha engajado",
      description: "Já conversou com Akasha pelo menos 2x",
      events: ["akashic_message_sent"],
      windowMinutes: 60 * 24 * 30,
    },
    {
      order: 2,
      name: "Marketplace visto",
      description: "Visualizou pelo menos uma listing",
      events: ["marketplace_listing_viewed"],
      windowMinutes: 60 * 24 * 3,
    },
    {
      order: 3,
      name: "Intenção de compra",
      description: "Iniciou checkout",
      events: ["marketplace_purchase_intent"],
      windowMinutes: 60 * 2,
    },
    {
      order: 4,
      name: "Booking confirmado",
      description: "Reserva efetivada (sucesso)",
      events: ["marketplace_purchase_intent"],
      filter: { status: "succeeded" },
      windowMinutes: 60,
    },
  ],
};

export const FUNNEL_RETENTION: FunnelDefinition = {
  id: "RETENTION",
  name: "Retenção (Booking → Repeat)",
  description: "Conversão para repetição de compra (LTV).",
  steps: [
    {
      order: 1,
      name: "Primeira compra",
      description: "Já fez pelo menos uma reserva",
      events: ["marketplace_purchase_intent"],
      windowMinutes: 60 * 24 * 365,
    },
    {
      order: 2,
      name: "Retorno D7",
      description: "Voltou a usar a plataforma 7 dias depois",
      events: ["page_viewed"],
      windowMinutes: 60 * 24 * 7,
    },
    {
      order: 3,
      name: "Segunda compra",
      description: "Segunda reserva efetivada",
      events: ["marketplace_purchase_intent"],
      windowMinutes: 60 * 24 * 30,
    },
  ],
};

export const ALL_FUNNELS: FunnelDefinition[] = [
  FUNNEL_ACQUISITION,
  FUNNEL_ACTIVATION,
  FUNNEL_ENGAGEMENT,
  FUNNEL_MONETIZATION,
  FUNNEL_RETENTION,
];

export const FUNNEL_BY_ID: Record<FunnelId, FunnelDefinition> = {
  ACQUISITION: FUNNEL_ACQUISITION,
  ACTIVATION: FUNNEL_ACTIVATION,
  ENGAGEMENT: FUNNEL_ENGAGEMENT,
  MONETIZATION: FUNNEL_MONETIZATION,
  RETENTION: FUNNEL_RETENTION,
};

// ============================================================================
// Builder
// ============================================================================

export interface BuildFunnelOptions {
  /** Funnel id a computar. */
  funnelId: FunnelId;
  /** Eventos de analytics pré-agregados (typical: prisma.$queryRaw). */
  events: FunnelEvent[];
  /** k-anonymity threshold (default 5). */
  kThreshold?: number;
  /** "Now" para cortar eventos futuros. */
  now?: Date;
}

/**
 * computeFunnel — processa eventos e devolve FunnelResult com conversion rates.
 *
 * Algoritmo:
 *   1. Para cada usuário, encontra a primeira ocorrência de cada step dentro
 *      da janela após o step anterior (anchor chain).
 *   2. users no step N = distinct users que atingiram step N.
 *   3. conversionFromPrev[N] = users[N] / users[N-1].
 *   4. conversionFromTop[N] = users[N] / users[1].
 *
 * @example
 *   const r = computeFunnel({ funnelId: "ACTIVATION", events: [...] });
 *   console.log(r.rows[2].conversionFromPrev);
 */
export function computeFunnel(opts: BuildFunnelOptions): FunnelResult {
  const def = FUNNEL_BY_ID[opts.funnelId];
  const kThreshold = opts.kThreshold ?? 5;
  const now = opts.now ?? new Date();

  // Para cada user, montamos timeline ordenada.
  const userTimelines = new Map<string, FunnelEvent[]>();
  for (const ev of opts.events) {
    if (new Date(ev.timestamp) > now) continue;
    if (!userTimelines.has(ev.userId)) userTimelines.set(ev.userId, []);
    userTimelines.get(ev.userId)!.push(ev);
  }
  for (const tl of userTimelines.values()) {
    tl.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  // Para cada step, contar users que o atingiram respeitando window.
  const usersAtStep: number[] = def.steps.map(() => 0);
  let anchorChainTimes = new Map<string, Date[]>(); // userId -> Date[] (anchors por step)

  for (const [userId, tl] of userTimelines.entries()) {
    let prevAnchor: Date | null = null;
    let reachedAllSoFar = true;

    for (let s = 0; s < def.steps.length; s++) {
      const step = def.steps[s];
      // Window starts:
      //   - step 1: from 'infinite past' (epoch 0)
      //   - step N>1: from prevAnchor + 0 minutes, ends at prevAnchor + windowMinutes
      const lowerBound = prevAnchor ?? new Date(0);
      const upperMs = lowerBound.getTime() + step.windowMinutes * 60_000;

      const matched = tl.find((ev) => {
        if (!step.events.includes(ev.event)) return false;
        const t = new Date(ev.timestamp).getTime();
        if (t < lowerBound.getTime()) return false;
        if (t > upperMs) return false;
        // Filter check (e.g. status='succeeded')
        if (step.filter) {
          for (const [k, v] of Object.entries(step.filter)) {
            if (String(ev.properties?.[k]) !== v) return false;
          }
        }
        return true;
      });

      if (matched) {
        usersAtStep[s] += 1;
        prevAnchor = new Date(matched.timestamp);
      } else {
        reachedAllSoFar = false;
        break; // user dropped, não conta nos próximos steps
      }
    }
    void reachedAllSoFar;
    void anchorChainTimes;
  }

  // Build rows.
  const rows: FunnelRow[] = def.steps.map((step, idx) => {
    const users = usersAtStep[idx];
    const isSmall = users < kThreshold;

    let conversionFromPrev = 0;
    if (idx === 0) {
      conversionFromPrev = 1;
    } else if (usersAtStep[idx - 1] > 0) {
      conversionFromPrev = users / usersAtStep[idx - 1];
    }

    const conversionFromTop = usersAtStep[0] > 0 ? users / usersAtStep[0] : 0;

    let dropFromPrev = 0;
    if (idx > 0) {
      dropFromPrev = usersAtStep[idx - 1] - users;
    }

    return {
      step,
      users,
      conversionFromPrev,
      conversionFromTop,
      dropFromPrev,
      isSmall,
    };
  });

  // Worst step = largest dropFromPrev (excluindo step 1).
  let worstStep: { order: number; dropFromPrev: number } | null = null;
  for (const r of rows) {
    if (r.step.order === 1) continue;
    if (!worstStep || r.dropFromPrev > worstStep.dropFromPrev) {
      worstStep = { order: r.step.order, dropFromPrev: r.dropFromPrev };
    }
  }

  const totalMinutes = def.steps.reduce((acc, s) => acc + s.windowMinutes, 0);

  return {
    definition: def,
    rows,
    summary: {
      topUsers: usersAtStep[0],
      bottomUsers: usersAtStep[usersAtStep.length - 1],
      overallConversion:
        usersAtStep[0] > 0 ? usersAtStep[usersAtStep.length - 1] / usersAtStep[0] : 0,
      worstStep,
      generatedAt: new Date().toISOString(),
    },
    meta: {
      eventsConsumed: opts.events.length,
      windowHours: Math.round(totalMinutes / 60),
      kThreshold,
    },
  };
}

// ============================================================================
// Comparação entre cohorts (delta)
// ============================================================================

export interface FunnelDelta {
  step: number;
  stepName: string;
  /** Conversion atual. */
  current: number;
  /** Conversion anterior. */
  previous: number;
  /** Diferença absoluta (current - previous). */
  diff: number;
  /** Direção. */
  direction: "UP" | "DOWN" | "FLAT";
}

/**
 * compareFunnels — diff entre dois FunnelResults (e.g. this week vs last week).
 */
export function compareFunnels(
  current: FunnelResult,
  previous: FunnelResult,
  epsilon = 0.005
): FunnelDelta[] {
  const deltas: FunnelDelta[] = [];
  for (let i = 0; i < current.rows.length; i++) {
    const c = current.rows[i].conversionFromPrev;
    const p = previous.rows[i]?.conversionFromPrev ?? 0;
    const diff = c - p;
    const direction: FunnelDelta["direction"] =
      Math.abs(diff) < epsilon ? "FLAT" : diff > 0 ? "UP" : "DOWN";
    deltas.push({
      step: current.rows[i].step.order,
      stepName: current.rows[i].step.name,
      current: c,
      previous: p,
      diff,
      direction,
    });
  }
  return deltas;
}

// ============================================================================
// Self-test
// ============================================================================

export const FUNNEL_SELF_TEST = {
  name: "analytics/funnels W34",
  tests: [
    {
      name: "basic activation funnel",
      assert: () => {
        const events: FunnelEvent[] = [
          { userId: "u1", event: "user_signed_up", properties: {}, timestamp: "2026-07-01T10:00:00Z" },
          { userId: "u1", event: "onboarding_completed", properties: {}, timestamp: "2026-07-01T11:00:00Z" },
          { userId: "u1", event: "post_created", properties: {}, timestamp: "2026-07-02T12:00:00Z" },
          { userId: "u2", event: "user_signed_up", properties: {}, timestamp: "2026-07-01T10:00:00Z" },
          { userId: "u2", event: "onboarding_completed", properties: {}, timestamp: "2026-07-01T11:00:00Z" },
          { userId: "u3", event: "user_signed_up", properties: {}, timestamp: "2026-07-01T10:00:00Z" },
        ];
        const r = computeFunnel({ funnelId: "ACTIVATION", events });
        return r.rows.length === 4 && r.rows[0].users === 3;
      },
    },
    {
      name: "k-anonymity flag",
      assert: () => {
        const events: FunnelEvent[] = [
          { userId: "u1", event: "user_signed_up", properties: {}, timestamp: "2026-07-01T10:00:00Z" },
        ];
        const r = computeFunnel({ funnelId: "ACTIVATION", events });
        return r.rows[0].isSmall === true;
      },
    },
  ],
};

export function runFunnelSelfTest(): boolean {
  for (const t of FUNNEL_SELF_TEST.tests) {
    if (!t.assert()) {
       
      console.warn(`[funnels] FAIL: ${t.name}`);
      return false;
    }
  }
  return true;
}
