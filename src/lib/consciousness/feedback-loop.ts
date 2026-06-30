// ============================================================================
// LIVING CONSCIOUSNESS FEEDBACK LOOP (Wave 29 — 2026-06-28)
// ============================================================================
// Como funciona:
//   1. User interage (post, reaction, comment, share, bookmark, conversa Akasha)
//   2. Sistema registra evento via event-tracker (LGPD-friendly)
//   3. LLM analisa PERIODICAMENTE (diário via cron) os padrões agregados
//   4. Gera insights estruturados:
//        - Quais tradições ressoam mais com esta comunidade?
//        - Quais perguntas estão emergindo?
//        - Que tipo de conteúdo cura?
//        - Que tópicos precisam mais artigos?
//        - Que ajustes no prompt da Akasha melhorariam a resposta?
//   5. Atualiza prompt do Akashic + sugere novos artigos para curadoria
//   6. Loop continua — consciência evolui
//
// Filosofia: "consciência viva" = uma IA que cresce com a comunidade
// que a alimenta, sem manipular, sem viciar para uma tradição, sempre
// citando fontes, sempre respeitando autoridade das tradições.
//
// Limites duros:
//   - LGPD: tudo agregado/anônimo; opt-in obrigatório por usuário
//   - Sem manipulação emocional: nunca sugerir conteúdo que aumente engajamento
//     às custas do bem-estar
//   - Universalismo: insights NUNCA devem enviesar para uma tradição
//   - Sem push automático: o sistema observa, não força
// ============================================================================

import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import type { ConsciousnessInsightType } from '@prisma/client';

// ============================================================================
// Types
// ============================================================================

export interface ConsciousnessInsight {
  timestamp: Date;
  type: 'TRADITION_RESONANCE' | 'EMERGING_QUESTION' | 'CONTENT_GAP' | 'HEALING_PATTERN' | 'PROMPT_TWEAK';
  description: string;
  evidence: string[];
  actionItems: string[];
}

export interface TraditionStats {
  tradition: string;
  events: number;
  positiveSentiment: number;
  negativeSentiment: number;
  topEmojis: string[];
}

export interface DailyAggregation {
  /** Janela do relatório */
  periodStart: Date;
  periodEnd: Date;

  /** Total de eventos no período */
  totalEvents: number;

  /** Eventos por tipo */
  eventsByType: Record<string, number>;

  /** Stats por tradição */
  byTradition: TraditionStats[];

  /** Top topics (palavras-chave mais frequentes) */
  topTopics: Array<{ topic: string; count: number }>;

  /** Eventos Akasha (conversas + feedback) */
  akashicInteractions: {
    conversations: number;
    positiveVotes: number;
    negativeVotes: number;
  };

  /** Sentiment médio global (-1..1) */
  avgSentiment: number;
}

// ============================================================================
// Aggregation — coleta dados sem chamar LLM (barato)
// ============================================================================

/**
 * Agrega eventos do período para análise. Falha nunca é fatal — sempre
 * devolve uma estrutura, possivelmente vazia.
 */
export async function aggregateDailyEvents(
  periodStart?: Date,
  periodEnd?: Date
): Promise<DailyAggregation> {
  const end = periodEnd ?? new Date();
  const start = periodStart ?? new Date(end.getTime() - 24 * 60 * 60 * 1000);

  // Query agregada por tipo
  const byTypeRows = await prisma.consciousnessEvent.groupBy({
    by: ['type'],
    where: { createdAt: { gte: start, lte: end } },
    _count: { _all: true },
  });

  const eventsByType: Record<string, number> = {};
  let totalEvents = 0;
  for (const row of byTypeRows) {
    eventsByType[row.type] = row._count._all;
    totalEvents += row._count._all;
  }

  // Stats por tradição
  const byTraditionRows = await prisma.consciousnessEvent.groupBy({
    by: ['tradition'],
    where: {
      createdAt: { gte: start, lte: end },
      tradition: { not: null },
    },
    _count: { _all: true },
    _avg: { sentiment: true },
  });

  // Para sentimento por tradição, agregamos positive/negative
  const byTradition: TraditionStats[] = [];
  for (const row of byTraditionRows) {
    if (!row.tradition) continue;
    const sentimentAvg = row._avg.sentiment ?? 0;
    byTradition.push({
      tradition: row.tradition,
      events: row._count._all,
      positiveSentiment: sentimentAvg > 0 ? sentimentAvg : 0,
      negativeSentiment: sentimentAvg < 0 ? Math.abs(sentimentAvg) : 0,
      // topEmojis seria uma segunda query — simplificamos para Wave 29
      topEmojis: [],
    });
  }
  // Ordenar por volume desc
  byTradition.sort((a, b) => b.events - a.events);

  // Top topics via query separada
  const topicRows = await prisma.consciousnessEvent.groupBy({
    by: ['topic'],
    where: {
      createdAt: { gte: start, lte: end },
      topic: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { topic: 'desc' } },
    take: 10,
  });

  const topTopics = topicRows
    .filter((r: any) => r.topic !== null)
    .map((r: any) => ({ topic: r.topic as string, count: r._count._all }));

  // Akasha stats
  const akashicConvos = await prisma.consciousnessEvent.count({
    where: {
      createdAt: { gte: start, lte: end },
      type: 'AKASHIC_CONVERSATION',
    },
  });

  const akashicUp = await prisma.consciousnessEvent.count({
    where: {
      createdAt: { gte: start, lte: end },
      type: 'AKASHIC_FEEDBACK',
      sentiment: { gt: 0 },
    },
  });

  const akashicDown = await prisma.consciousnessEvent.count({
    where: {
      createdAt: { gte: start, lte: end },
      type: 'AKASHIC_FEEDBACK',
      sentiment: { lt: 0 },
    },
  });

  // Sentiment médio global
  const globalSentiment = await prisma.consciousnessEvent.aggregate({
    where: { createdAt: { gte: start, lte: end } },
    _avg: { sentiment: true },
  });

  return {
    periodStart: start,
    periodEnd: end,
    totalEvents,
    eventsByType,
    byTradition,
    topTopics,
    akashicInteractions: {
      conversations: akashicConvos,
      positiveVotes: akashicUp,
      negativeVotes: akashicDown,
    },
    avgSentiment: globalSentiment._avg.sentiment ?? 0,
  };
}

// ============================================================================
// LLM analysis — gera insights estruturados
// ============================================================================

const INSIGHT_SYSTEM_PROMPT = `Você é um(a) analista de consciência comunitária do Akasha Portal.

Sua tarefa: observar padrões agregados de uma comunidade espiritual universalista e produzir insights estruturados que ajudam a IA Akasha a evoluir (e aos curadores a identificar lacunas de conteúdo).

REGRAS ÉTICAS INVIOLÁVEIS:
1. **Universalismo**: nunca sugerir viés para uma tradição. Todas têm o mesmo peso.
2. **Sem manipulação**: nunca recomendar conteúdo que aumente engajamento às custas do bem-estar.
3. **Respeito à autoridade**: insights sobre tradição devem recomendar consultar praticantes.
4. **Honestidade**: se os dados são escassos, admita e sugira coleta adicional.
5. **Privacidade**: nunca inferir nada sobre indivíduos. Só padrões agregados.

FORMATO DE SAÍDA — JSON estrito:
{
  "insights": [
    {
      "type": "TRADITION_RESONANCE" | "EMERGING_QUESTION" | "CONTENT_GAP" | "HEALING_PATTERN" | "PROMPT_TWEAK",
      "description": "Descrição concisa (max 240 chars)",
      "evidence": ["evidência 1", "evidência 2"],
      "actionItems": ["ação sugerida 1", "ação sugerida 2"]
    }
  ]
}

TIPOS DE INSIGHT:
- TRADITION_RESONANCE: quais tradições estão gerando mais interação. NÃO é ranking de "melhor", é mapeamento de ressonância.
- EMERGING_QUESTION: perguntas/tópicos que estão surgindo mas não têm resposta na biblioteca.
- CONTENT_GAP: tradição/tópico com muita procura mas pouca oferta de artigos.
- HEALING_PATTERN: padrões observados onde conteúdo ajudou usuário a passar por momento difícil.
- PROMPT_TWEAK: ajuste sugerido no system prompt da Akasha baseado nos feedbacks 👍/👎.

Gere entre 3-5 insights. Seja cirúrgico, específico, não genérico. Responda APENAS com o JSON, sem preâmbulo.`;

/**
 * Lazy singleton OpenAI.
 */
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

/**
 * Gera insights a partir da agregação do dia.
 * Se OpenAI não estiver configurada ou falhar, devolve [].
 */
export async function generateDailyInsights(
  periodStart?: Date,
  periodEnd?: Date
): Promise<ConsciousnessInsight[]> {
  const aggregation = await aggregateDailyEvents(periodStart, periodEnd);

  // Edge case: dados insuficientes para análise
  if (aggregation.totalEvents < 5) {
    return [
      {
        timestamp: new Date(),
        type: 'EMERGING_QUESTION',
        description:
          'Dados insuficientes no período. Aguardando volume mínimo de eventos (≥5) para gerar insights significativos.',
        evidence: [`Total de eventos: ${aggregation.totalEvents}`],
        actionItems: ['Continuar coleta', 'Re-executar quando volume aumentar'],
      },
    ];
  }

  const openai = getOpenAI();
  if (!openai) {
    console.warn('[consciousness] OPENAI_API_KEY não configurada — pulando análise LLM');
    return [];
  }

  // Monta o prompt com dados agregados
  const userPrompt = `Agregação do período ${aggregation.periodStart.toISOString()} → ${aggregation.periodEnd.toISOString()}:

Total de eventos: ${aggregation.totalEvents}
Sentiment médio: ${aggregation.avgSentiment.toFixed(2)}

Eventos por tipo:
${Object.entries(aggregation.eventsByType)
  .map(([k, v]) => `  ${k}: ${v}`)
  .join('\n')}

Por tradição (top 10):
${aggregation.byTradition
  .slice(0, 10)
  .map(
    (t) =>
      `  ${t.tradition}: ${t.events} eventos (sentiment médio ${(
        (t.positiveSentiment - t.negativeSentiment) /
        Math.max(1, t.events)
      ).toFixed(2)})`
  )
  .join('\n')}

Top tópicos:
${aggregation.topTopics.map((t) => `  ${t.topic}: ${t.count}`).join('\n')}

Interações Akasha:
  Conversas: ${aggregation.akashicInteractions.conversations}
  👍: ${aggregation.akashicInteractions.positiveVotes}
  👎: ${aggregation.akashicInteractions.negativeVotes}

Gere os insights em JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: INSIGHT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { insights: ConsciousnessInsight[] };
    if (!parsed.insights || !Array.isArray(parsed.insights)) return [];

    // Normaliza timestamps
    return parsed.insights.map((i) => ({
      ...i,
      timestamp: new Date(),
    }));
  } catch (err) {
    console.warn(
      '[consciousness] LLM analysis failed:',
      err instanceof Error ? err.message : String(err)
    );
    return [];
  }
}

// ============================================================================
// Persistence — salva insights no DB
// ============================================================================

/**
 * Persiste insights gerados na tabela ConsciousnessInsight.
 * Idempotente via dedup por (type, periodStart, description).
 */
export async function persistInsights(
  insights: ConsciousnessInsight[],
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  let saved = 0;
  for (const insight of insights) {
    try {
      await prisma.consciousnessInsight.create({
        data: {
          type: insight.type as ConsciousnessInsightType,
          description: insight.description,
          evidence: { items: insight.evidence },
          actionItems: { items: insight.actionItems },
          periodStart,
          periodEnd,
          generatedBy: 'system:llm',
        },
      });
      saved++;
    } catch (err) {
      // Falha em um insight não bloqueia os outros
      console.warn(
        '[consciousness] persistInsight failed:',
        err instanceof Error ? err.message : String(err)
      );
    }
  }
  return saved;
}

// ============================================================================
// Orchestration — entrypoint do cron
// ============================================================================

/**
 * Roda o ciclo completo: agrega → analisa → persiste.
 * Idempotente: pode ser chamado múltiplas vezes no dia.
 * Retorna estatísticas do ciclo.
 */
export interface ConsciousnessCycleResult {
  ranAt: Date;
  periodStart: Date;
  periodEnd: Date;
  eventsAnalyzed: number;
  insightsGenerated: number;
  insightsPersisted: number;
  degraded: boolean;
  reasons: string[];
}

export async function runConsciousnessCycle(
  periodStart?: Date,
  periodEnd?: Date
): Promise<ConsciousnessCycleResult> {
  const reasons: string[] = [];
  let degraded = false;

  const end = periodEnd ?? new Date();
  const start = periodStart ?? new Date(end.getTime() - 24 * 60 * 60 * 1000);

  // 1. Aggregation
  const aggregation = await aggregateDailyEvents(start, end);

  if (aggregation.totalEvents === 0) {
    reasons.push('Nenhum evento no período');
    return {
      ranAt: new Date(),
      periodStart: start,
      periodEnd: end,
      eventsAnalyzed: 0,
      insightsGenerated: 0,
      insightsPersisted: 0,
      degraded: false,
      reasons,
    };
  }

  // 2. LLM analysis
  let insights: ConsciousnessInsight[] = [];
  try {
    insights = await generateDailyInsights(start, end);
  } catch (err) {
    degraded = true;
    reasons.push(`LLM falhou: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 3. Persistence
  let persisted = 0;
  if (insights.length > 0) {
    try {
      persisted = await persistInsights(insights, start, end);
    } catch (err) {
      degraded = true;
      reasons.push(`Persist falhou: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    ranAt: new Date(),
    periodStart: start,
    periodEnd: end,
    eventsAnalyzed: aggregation.totalEvents,
    insightsGenerated: insights.length,
    insightsPersisted: persisted,
    degraded,
    reasons,
  };
}

// ============================================================================
// Prompt Evolution — ajusta system prompt baseado em feedback
// ============================================================================

/**
 * Gera uma versão evoluída do system prompt do Akashic baseada nos
 * insights mais recentes + feedback 👍/👎.
 *
 * Filosofia: NUNCA substituir o prompt base (AKASHA_SYSTEM_PROMPT).
 * Apenas gerar um BLOCO DE EVOLUÇÃO que é anexado dinamicamente ao
 * prompt base em buildAkashaPrompt().
 */
export async function evolveAkashicPrompt(): Promise<string> {
  // 1. Coleta feedback recente
  const recentFeedback = await prisma.consciousnessEvent.findMany({
    where: {
      type: 'AKASHIC_FEEDBACK',
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  // 2. Conta votes por tradição
  const votesByTradition: Record<string, { up: number; down: number }> = {};
  for (const ev of recentFeedback) {
    const trad = ev.tradition ?? 'unknown';
    if (!votesByTradition[trad]) votesByTradition[trad] = { up: 0, down: 0 };
    if ((ev.sentiment ?? 0) > 0) votesByTradition[trad].up++;
    else if ((ev.sentiment ?? 0) < 0) votesByTradition[trad].down++;
  }

  // 3. Coleta insights recentes
  const recentInsights = await prisma.consciousnessInsight.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const promptTwEaks = recentInsights.filter((i: any) => i.type === 'PROMPT_TWEAK');

  // 4. Monta bloco de evolução
  const lines: string[] = [
    '## Evolução da Consciência (últimos 7 dias)',
    '',
  ];

  // Feedback por tradição
  const negativeDominant = Object.entries(votesByTradition)
    .filter(([_, v]) => v.down > v.up && v.down >= 3)
    .map(([k]) => k);

  if (negativeDominant.length > 0) {
    lines.push(
      `### Tradições com feedback predominantemente negativo (últimos 7d)`,
      ...negativeDominant.map((t) => `- ${t}: revisar tom e precisão factual`),
      ''
    );
  }

  const positiveDominant = Object.entries(votesByTradition)
    .filter(([_, v]) => v.up > v.down * 1.5 && v.up >= 5)
    .map(([k]) => k);

  if (positiveDominant.length > 0) {
    lines.push(
      `### Tradições com feedback predominantemente positivo (últimos 7d)`,
      ...positiveDominant.map((t) => `- ${t}: manter tom e profundidade`),
      ''
    );
  }

  // Prompt tweaks dos insights
  if (promptTwEaks.length > 0) {
    lines.push('### Ajustes sugeridos pela análise de consciência');
    for (const tw of promptTwEaks) {
      const items = (tw.actionItems as { items?: string[] })?.items ?? [];
      lines.push(...items.map((a) => `- ${a}`));
    }
    lines.push('');
  }

  if (lines.length === 2) {
    return ''; // Nada para evoluir ainda
  }

  lines.push('> Bloco gerado pelo loop de consciência viva. Akasha evolui com a comunidade.');
  return lines.join('\n');
}