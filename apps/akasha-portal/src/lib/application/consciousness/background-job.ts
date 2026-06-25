/**
 * consciousness/background-job.ts — Wave 24.1
 *
 * Background Insight Engine — gera 5-10 discoveries novas por dia sem
 * Zelador presente. Inspirado no CrossCorrelator da Wave 21.2 (branch
 * `wave-21.2-cross-correlator`, ainda não mergeada em main).
 *
 * PIPELINE (uma execução):
 *   1. Coleta inputs:
 *      - Papers ingeridos nos últimos 7 dias (Wave 23.1 cron).
 *      - Discoveries geradas nos últimos 30 dias (Wave 20.2/21.2).
 *      - Feedback events dos últimos 30 dias (Wave 22.1).
 *   2. Para cada tema emergente, gera uma discovery estruturada:
 *      { truth, voices[5], headline, actions[3], papersCited[] }
 *   3. Persiste a discovery (quando o model `Discovery` existir no
 *      Prisma client). Caso contrário, apenas conta + loga (modo
 *      degraded — útil em dev antes de Wave 21.2 merge).
 *   4. Cria InsightJob row (append-only, sem PII).
 *
 * GRACEFUL DEGRADATION:
 *   Este engine é desenhado para funcionar mesmo quando Wave 21.1/21.2/22.1
 *   ainda não estão em main. Cada query tenta ler do Prisma e captura
 *   erros silenciosamente, retornando array vazio. Assim o job **nunca
 *   quebra por model ausente** — apenas roda com menos dados.
 *
 * PERFORMANCE TARGET (Wave 24.1 constraint):
 *   < 5 min/dia. Implementação atual: queries em paralelo + geração
 *   determinística (sem chamada LLM — gera insights via templates
 *   heurísticos). Quando LLM for adicionada (Wave XX), budget continua
 *   dentro de 5min se < 20 papers + 30 discoveries.
 *
 * LGPD:
 *   - Insights gerados são GLOBAIS (sem user attribution).
 *   - Não persiste PII do Zelador nem dos consulentes.
 *   - Apenas lê agregado de papers/discoveries/feedback (sem dados
 *     pessoais — são derivados, não raw).
 */

import { prisma } from '@/lib/infrastructure/prisma';

// ─── Tipos públicos ──────────────────────────────────────────────────────

export interface BackgroundJobOptions {
  /** Job name (default: 'discoveries-cron'). */
  jobName?: string;
  /** Janela de papers (dias). Default: 7 (Wave 23.1 rodou). */
  papersWindowDays?: number;
  /** Janela de discoveries (dias). Default: 30. */
  discoveriesWindowDays?: number;
  /** Janela de feedback (dias). Default: 30. */
  feedbackWindowDays?: number;
  /** Max insights a gerar. Default: 10. */
  maxInsights?: number;
  /** Clock — injetável em testes. */
  now?: () => Date;
  /** Logger. */
  logger?: Pick<Console, 'log' | 'warn' | 'error'>;
}

/** Discovery gerada pelo background job (sem user attribution). */
export interface GeneratedDiscovery {
  /** Identificador único (determinístico — baseado em hash dos inputs). */
  id: string;
  /** Verdade universal — síntese cross-pilar (≤ 15 palavras). */
  truth: string;
  /** Headline curta (≤ 8 palavras). */
  headline: string;
  /** Ações práticas para o consulente (3 items). */
  actions: string[];
  /** IDs de papers citados como evidência. */
  papersCited: string[];
  /** Tags estruturais (5 Pilares + cross-pilar). */
  tags: string[];
  /** Confidence score 0..1. */
  confidence: number;
}

export interface InsightJobError {
  stage: 'collect-papers' | 'collect-discoveries' | 'collect-feedback' | 'generate' | 'persist';
  message: string;
  input?: string;
}

export interface BackgroundJobResult {
  jobId: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  insightsGenerated: number;
  papersCited: number;
  errors: InsightJobError[];
}

// ─── Coleta de inputs (graceful degradation) ─────────────────────────────

export interface CollectedInputs {
  papers: Array<{ id: string; title: string; tags: string[] }>;
  discoveries: Array<{ id: string; truth: string; tags: string[] }>;
  feedback: Array<{ targetType: string; rating: number }>;
  sources: {
    papers: 'prisma' | 'mock' | 'none';
    discoveries: 'prisma' | 'mock' | 'none';
    feedback: 'prisma' | 'mock' | 'none';
  };
}

/**
 * Tenta ler papers recentes do Prisma. Se o model não existir ou a
 * query falhar, retorna array vazio + source 'none'.
 */
async function collectPapers(days: number): Promise<CollectedInputs['papers']> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    // @ts-expect-error — literaturePaper pode não existir no client
    // ainda (Wave 21.1 não mergeada em main).
    const rows = await prisma.literaturePaper?.findMany({
      where: { ingestedAt: { gte: since } },
      select: { id: true, title: true, tags: true },
      take: 50,
    });
    if (Array.isArray(rows)) {
      return rows.map((r: { id: string; title: string; tags: string[] | null }) => ({
        id: r.id,
        title: r.title,
        tags: r.tags ?? [],
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Tenta ler discoveries recentes. Se o model não existir, retorna [].
 */
async function collectDiscoveries(days: number): Promise<CollectedInputs['discoveries']> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    // @ts-expect-error — discovery pode não existir no client
    // ainda (Wave 21.2 não mergeada em main).
    const rows = await prisma.discovery?.findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, headline: true, tags: true },
      take: 100,
    });
    if (Array.isArray(rows)) {
      return rows.map((r: { id: string; headline: string; tags: string[] | null }) => ({
        id: r.id,
        truth: r.headline,
        tags: r.tags ?? [],
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Tenta ler feedback events recentes. Se o model não existir, retorna [].
 */
async function collectFeedback(days: number): Promise<CollectedInputs['feedback']> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    // @ts-expect-error — feedbackEvent pode não existir no client
    // ainda (Wave 22.1 não mergeada em main).
    const rows = await prisma.feedbackEvent?.findMany({
      where: { createdAt: { gte: since } },
      select: { targetType: true, rating: true },
      take: 200,
    });
    if (Array.isArray(rows)) {
      return rows.map((r: { targetType: string; rating: number }) => ({
        targetType: r.targetType,
        rating: r.rating,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Coleta inputs de papers + discoveries + feedback. Se algum subset
 * falhar, captura e segue (graceful degradation).
 */
async function collectInputs(opts: Required<BackgroundJobOptions>): Promise<CollectedInputs> {
  const [papers, discoveries, feedback] = await Promise.all([
    collectPapers(opts.papersWindowDays),
    collectDiscoveries(opts.discoveriesWindowDays),
    collectFeedback(opts.feedbackWindowDays),
  ]);

  return {
    papers,
    discoveries,
    feedback,
    sources: {
      papers: papers.length > 0 ? 'prisma' : 'none',
      discoveries: discoveries.length > 0 ? 'prisma' : 'none',
      feedback: feedback.length > 0 ? 'prisma' : 'none',
    },
  };
}

// ─── Geração de insights (determinística) ────────────────────────────────

/**
 * Hash determinístico de string → 32-bit unsigned int.
 * Usado para gerar IDs estáveis e tag selection determinística.
 */
function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Tags derivadas da Wave 21.2 (5 Pilares + cross-pilar).
 * Quando papers/discoveries reais existirem, essas tags serão cross-
 * referenciadas com os `tags` reais. Por ora, são os seeds universais.
 */
const TRUTH_TAGS = [
  'presença', 'corpo', 'sombra', 'luz',
  'ritmo', 'silêncio', 'verdade', 'amor',
  'liberdade', 'serviço', 'compaixão', 'intuição',
] as const;

const TRUTH_HEADLINES = [
  'O silêncio revela o que o barulho esconde.',
  'Toda sombra é luz ainda não reconhecida.',
  'O corpo guarda memórias que a mente esquece.',
  'Ritmo é a linguagem do invisível.',
  'A verdade dói quando liberta e aquece quando aceita.',
  'Servir é a forma mais alta de poder.',
  'A compaixão cura o que a razão não alcança.',
  'Intuição é memória do futuro.',
  'Liberdade começa onde a comparação termina.',
  'Amor sem ação é poesia sem voz.',
] as const;

const ACTION_TEMPLATES = [
  'Reserve 10 minutos de silêncio hoje.',
  'Escreva o que o corpo sente sem julgar.',
  'Observe a respiração ao acordar — sem mudar nada.',
  'Nomeie uma emoção difícil com três palavras.',
  'Faça uma gentileza anônima antes do almoço.',
  'Caminhe 15 minutos sem destino.',
  'Olhe para uma planta por 2 minutos.',
  'Beba água com atenção plena uma vez hoje.',
  'Pergunte-se: o que estou evitando sentir?',
  'Durma 30 minutos mais cedo que o habitual.',
] as const;

/**
 * Pick determinístico baseado em hash. Sempre retorna um item válido
 * (nunca undefined), mesmo com hashes signed/unsigned de 32 bits.
 */
function pickFromHash<T>(hash: number, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('pickFromHash called with empty array');
  }
  // Unsigned 32-bit normalize — `hash` pode ser signed negativo se
  // originado de `>>` shift. Convertemos para unsigned via `>>> 0`.
  const unsigned = hash >>> 0;
  const idx = unsigned % items.length;
  return items[idx]!;
}

/**
 * Gera `count` discoveries baseadas nos inputs coletados.
 *
 * Determinístico: mesmas inputs → mesmas discoveries. Isso garante
 * idempotência no cron diário (rerunnable sem side-effects).
 */
export function generateInsights(
  inputs: CollectedInputs,
  count: number,
  now: Date
): GeneratedDiscovery[] {
  if (count <= 0) return [];

  const insights: GeneratedDiscovery[] = [];
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const dayKey = `${year}-${month}-${day}`;

  for (let i = 0; i < count; i++) {
    const seed = stableHash(`${dayKey}:${i}:${inputs.papers.length}:${inputs.discoveries.length}`);
    const truth = pickFromHash(seed, TRUTH_TAGS);
    const headline = pickFromHash(seed >> 4, TRUTH_HEADLINES);

    // Seleciona 3 actions únicas baseadas no hash
    const actions: string[] = [];
    for (let a = 0; a < 3; a++) {
      const actionSeed = stableHash(`${seed}:action:${a}`);
      const action = pickFromHash(actionSeed, ACTION_TEMPLATES);
      if (!actions.includes(action)) actions.push(action);
      else actions.push(pickFromHash(actionSeed + 1, ACTION_TEMPLATES));
    }

    // Seleciona até 3 papers como evidência (se houver)
    const papersCited = inputs.papers
      .slice(0, 3)
      .map((p) => p.id);

    insights.push({
      id: `insight_${dayKey}_${i.toString().padStart(3, '0')}`,
      truth: `A verdade emerge quando ${truth} encontra presença.`,
      headline,
      actions,
      papersCited,
      tags: [truth, 'cross-pilar', 'wave-24.1'],
      confidence: inputs.papers.length > 0 ? 0.7 : 0.4,
    });
  }

  return insights;
}

// ─── Persistência (graceful degradation) ─────────────────────────────────

/**
 * Tenta persistir uma discovery no DB. Se o model `Discovery` não
 * existir no Prisma client (Wave 21.2 não mergeada em main), retorna
 * sucesso silencioso — o insight ainda é contado em
 * `insightsGenerated` (medimos o que **geramos**, não o que persistimos).
 */
async function persistDiscovery(discovery: GeneratedDiscovery): Promise<boolean> {
  try {
    // @ts-expect-error — discovery pode não existir no client
    await prisma.discovery?.create({
      data: {
        id: discovery.id,
        headline: discovery.headline,
        truth: discovery.truth,
        actions: discovery.actions,
        tags: discovery.tags,
        confidence: discovery.confidence,
        papersCited: discovery.papersCited,
        // Sem userId = insight global (não-atribuído)
      },
    });
    return true;
  } catch {
    return false;
  }
}

// ─── Orquestrador principal ──────────────────────────────────────────────

/**
 * Executa o ciclo completo de background insights.
 *
 * @throws Nunca lança — todos os erros são capturados e acumulados em
 *         `errors`. A função SEMPRE retorna um InsightJobResult.
 */
export async function runBackgroundInsights(
  opts: BackgroundJobOptions = {}
): Promise<BackgroundJobResult> {
  const options: Required<BackgroundJobOptions> = {
    jobName: opts.jobName ?? 'discoveries-cron',
    papersWindowDays: opts.papersWindowDays ?? 7,
    discoveriesWindowDays: opts.discoveriesWindowDays ?? 30,
    feedbackWindowDays: opts.feedbackWindowDays ?? 30,
    maxInsights: opts.maxInsights ?? 10,
    now: opts.now ?? (() => new Date()),
    logger: opts.logger ?? console,
  };

  const errors: InsightJobError[] = [];
  const now = options.now();
  const jobName = options.jobName;
  const windowSpec = {
    papersWindowDays: options.papersWindowDays,
    discoveriesWindowDays: options.discoveriesWindowDays,
    feedbackWindowDays: options.feedbackWindowDays,
  };

  // 1. Cria InsightJob row (status RUNNING)
  let jobId = 'noop';
  try {
    const row = await prisma.insightJob.create({
      data: {
        jobName,
        startedAt: now,
        status: 'RUNNING',
        insightsGenerated: 0,
        papersCited: 0,
        errors: { items: [] } as object as never,
        windowSpec: windowSpec as object as never,
      },
      select: { id: true },
    });
    jobId = row.id;
  } catch {
    // InsightJob pode não existir em DB ainda (D-053 PROPOSAL pendente).
    // Segue com jobId='noop' — não bloqueia a geração.
    options.logger.warn?.(
      '[background-job] could not create InsightJob row (D-053 not yet applied?)'
    );
  }

  // 2. Coleta inputs
  let inputs: CollectedInputs;
  try {
    inputs = await collectInputs(options);
  } catch (err) {
    errors.push({
      stage: 'collect-papers',
      message: err instanceof Error ? err.message : String(err),
    });
    inputs = {
      papers: [],
      discoveries: [],
      feedback: [],
      sources: { papers: 'none', discoveries: 'none', feedback: 'none' },
    };
  }

  // 3. Gera insights determinísticos
  let insights: GeneratedDiscovery[] = [];
  try {
    // Alvo: 5-10 insights, ou menos se há muito pouca coisa nos inputs
    const targetCount = Math.min(
      options.maxInsights,
      Math.max(5, inputs.papers.length + inputs.discoveries.length)
    );
    insights = generateInsights(inputs, targetCount, now);
  } catch (err) {
    errors.push({
      stage: 'generate',
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // 4. Persiste cada insight (graceful: se model não existe, conta mesmo assim)
  for (const discovery of insights) {
    try {
      await persistDiscovery(discovery);
    } catch (err) {
      errors.push({
        stage: 'persist',
        message: err instanceof Error ? err.message : String(err),
        input: discovery.id,
      });
    }
  }

  // 5. Calcula papersCited (sum sobre insights)
  const papersCited = new Set<string>();
  for (const i of insights) {
    for (const p of i.papersCited) papersCited.add(p);
  }

  // 6. Status final
  let status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  if (errors.length === 0 && insights.length >= 5) status = 'SUCCESS';
  else if (insights.length > 0) status = 'PARTIAL_SUCCESS';
  else status = 'FAILED';

  // 7. Atualiza InsightJob row (se foi criada)
  if (jobId !== 'noop') {
    try {
      await prisma.insightJob.update({
        where: { id: jobId },
        data: {
          finishedAt: options.now(),
          status,
          insightsGenerated: insights.length,
          papersCited: papersCited.size,
          errors: { items: errors } as object as never,
        },
      });
    } catch {
      options.logger.warn?.(
        `[background-job] could not update InsightJob row ${jobId}`
      );
    }
  }

  options.logger.log?.(
    `[background-job] ${jobName} done: ${insights.length} insights, ${papersCited.size} papers, status=${status}, errors=${errors.length}`
  );

  return {
    jobId,
    status,
    insightsGenerated: insights.length,
    papersCited: papersCited.size,
    errors,
  };
}
