/**
 * @akasha/core — Synthesis Engine 2.0 (POC)
 *
 * Wave 16.5 — orquestrador genérico sobre N Pilares (7+).
 *
 * Diferenças em relação à `akasha-core.ts` v1 (R-030):
 *  - v1 é hardcoded em 5 Pilares (Cabala, Astrologia, Tantra, Odu, I'Ching).
 *  - v2 aceita um conjunto aberto e tipado de Pilares via discriminada `Pilar`,
 *    incluindo os novos Pilares 6/7 (Human Design + Gene Keys) e qualquer
 *    Pilar futuro (Vedic Astrology, Numerologia Pitagórica, …).
 *
 * Filosofia (consistente com R-022 / AGENTS.md §5):
 *  - NUNCA inventar correspondências esotéricas. Esta engine não cria
 *    relações entre Pilares; ela recebe `PilarInsight[]` já preenchidos
 *    por engines de Pilar e apenas agrega, prioriza, e detecta conflitos
 *    declarados.
 *  - Conflict detection é baseada em metadados declarativos opcionais
 *    (`conflictWith: Pilar[]` por Insight) ou em heurística simples de
 *    direcionalidade de recomendação (quando `recommendation` aponta
 *    direções opostas).
 *  - Performance: O(n) sobre nº de Pilares (max ~10-20 na prática). Nada
 *    de LLM, nada de I/O.
 *
 * Referência: .hermes/plans/wave-16-research-2026-06-24.md seção 16.5
 */

// ─── 1. Tipos públicos ────────────────────────────────────────────────────────

/**
 * Identificador canônico de um Pilar do Akasha Portal.
 *
 * Hardcoded set para safety (TypeScript exhaustiveness). Para adicionar
 * um Pilar novo, editar este union E documentar em DECISIONS.md /
 * packages/AGENTS.md.
 *
 * Ordem reflete a sequência atual:
 *  1-5 = Pilares originais (Wave 1-3)
 *  6   = Pilar 6 (Human Design — Wave 4 / F-216)
 *  7   = Pilar 7 (Gene Keys — Wave 4 / F-216)
 *  8+  = reservados para Waves futuras (Vedic, Numerologias adicionais)
 */
export type Pilar =
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'odus'
  | 'iching'
  | 'humandesign'
  | 'genekeys'
  | 'vedic'
  | 'numerologiaPitagorica'
  | 'numerologiaChaldeia';

/**
 * Lista canônica de Pilares (mesma ordem do union, para iteração).
 * Útil para validação e para defaults.
 */
export const PILARES: readonly Pilar[] = [
  'cabala',
  'astrologia',
  'tantra',
  'odus',
  'iching',
  'humandesign',
  'genekeys',
  'vedic',
  'numerologiaPitagorica',
  'numerologiaChaldeia',
] as const;

/**
 * Nível de frequência (Sombra → Dom → Siddhi), inspirado no framework
 * Gene Keys (R-015 §2.1) e consistente com `synthesis-types.ts` da
 * `apps/akasha-portal`. Cada Pilar pode emitir seu próprio nível;
 * a engine 2.0 agrega sem prescrever.
 */
export type FrequencyLevel = 'shadow' | 'gift' | 'siddhi';

/**
 * Rótulo textual do Pilar para UI / logs / debugging. NÃO usar para
 * lógica de decisão (usar o discriminador `pilar`).
 */
export const PILAR_LABELS: Record<Pilar, string> = {
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  odus: 'Odus (Ifá)',
  iching: 'I Ching',
  humandesign: 'Human Design',
  genekeys: 'Gene Keys',
  vedic: 'Vedic (Jyotish)',
  numerologiaPitagorica: 'Numerologia Pitagórica',
  numerologiaChaldeia: 'Numerologia Caldeia',
};

/**
 * Insight emitido por um Pilar. Pensado como saída **normalizada** do
 * engine de Pilar — o engine 2.0 não conhece o shape interno do Pilar,
 * só recebe este contrato público.
 */
export interface PilarInsight {
  /** Pilar de origem. */
  pilar: Pilar;
  /**
   * Peso 0..1 — confiança ou intensidade deste Insight dentro do Pilar.
   * Default sugerido: 1.0 quando o Pilar só emite 1 Insight, <1 quando
   * emite múltiplos e este é o principal.
   */
  weight: number;
  /** Resumo textual (1-2 frases). NÃO é a narrativa final — é só o átomo. */
  summary: string;
  /** Recomendação prática derivada deste Pilar (1-2 frases). */
  recommendation: string;
  /**
   * Nível de frequência (Sombra/Dom/Siddhi). Opcional porque nem todo
   * Pilar opera neste eixo (ex: Tantra opera por corpo, Astrologia por
   * signo). Quando ausente, o Pilar é tratado como "neutro" para fins
   * de priorização por frequência.
   */
  frequency?: FrequencyLevel;
  /**
   * Pilares com os quais este Insight explicitamente conflita. Declaração
   * opcional do engine de Pilar — se ausente, a engine 2.0 NÃO infere
   * conflito (em respeito a R-022: não inventar correspondências).
   */
  conflictWith?: Pilar[];
  /**
   * Polaridade da recomendação (qualitative, used in tie-breaking).
   * - 'expansive'   = sugere abrir, ir em direção, agir
   * - 'contractive' = sugere parar, recolher, esperar
   * - 'neutral'     = sem direcionalidade clara
   *
   * Usado SOMENTE como heurística secundária para desempate quando
   * múltiplos Pilares têm o mesmo peso.
   */
  polarity?: 'expansive' | 'contractive' | 'neutral';
}

// ─── 2. Tipos de saída ────────────────────────────────────────────────────────

/**
 * Conflito detectado entre Insights de Pilares distintos.
 * Pode ser declarado (via `conflictWith`) ou detectado por heurística
 * leve (recomendações com polaridade oposta).
 */
export interface PilarConflict {
  pilares: [Pilar, Pilar];
  /**
   * Tipo de conflito:
   * - 'declared' = veio de `conflictWith` no PilarInsight
   * - 'polarity' = direções opostas nas recomendações
   */
  kind: 'declared' | 'polarity';
  /** Descrição textual breve do conflito para a engine narradora. */
  description: string;
}

/**
 * Pilar priorizado no agregado. Inclui weight e o insight de origem
 * para que a camada narrativa (futura) possa citar.
 */
export interface PilarInsightRanked {
  pilar: Pilar;
  insight: PilarInsight;
  /** Posição no ranking (1 = primary). */
  rank: number;
}

/**
 * Síntese final produzida por `synthesizeV2`.
 *
 * Estrutura:
 *  - `primary`    = Pilar de peso máximo (Pilar mais "fala alto")
 *  - `secondary`  = próximos N Pilares (em ordem de peso) — N configurável
 *  - `conflicts`  = conflitos detectados entre Pilares
 *  - `integration`= prompt estruturado para o Mentor LLM redigir a
 *                   narrativa final; inclui o esqueleto agregado.
 *  - `metadata`   = contagens e peso total (útil para UI/dashboards)
 *
 * Esta estrutura é deliberadamente LL-agnostic (não há texto final
 * redigido — isso é trabalho do Mentor LLM, igual ao MandatoEsqueleto
 * da v1). O Mentor pode citar `integration.citations` direto.
 */
export interface SynthesisV2Result {
  /** Pilar principal (peso máximo). Sempre presente se há ≥1 Pilar. */
  primary: PilarInsightRanked;
  /** Pilares secundários (peso ordenado, sem o primary). */
  secondary: PilarInsightRanked[];
  /** Conflitos detectados (declarados OU heurísticos). */
  conflicts: PilarConflict[];
  /** Esqueleto de integração para camada narrativa (Mentor LLM). */
  integration: {
    /** Sumário agregado (concatena `summary` dos Pilares ranked, separado por " | "). */
    aggregatedSummary: string;
    /** Recomendações agregadas na ordem de ranking. */
    rankedRecommendations: string[];
    /** Citações estruturadas — para o Mentor LLM citar a procedência. */
    citations: Array<{
      pilar: Pilar;
      label: string;
      symbol?: string;
      weight: number;
    }>;
    /** Total de Pilares que efetivamente contribuíram (peso > 0). */
    activePilarCount: number;
    /** Total de Pilares ausentes ou com peso 0. */
    absentPilarCount: number;
  };
  /** Metadados para UI/dashboards. */
  metadata: {
    /** Soma dos pesos normalizada (0..n). Útil para confiança geral. */
    totalWeight: number;
    /** Lista de Pilares ausentes (não enviados ou com peso 0). */
    absentPilares: Pilar[];
  };
}

// ─── 3. API pública ──────────────────────────────────────────────────────────

/**
 * Síntese 2.0: agrega N PilarInsight[] em uma estrutura priorizada
 * com conflitos e integração.
 *
 * @example
 * ```ts
 * const result = synthesizeV2([
 *   {
 *     pilar: 'cabala',
 *     weight: 0.8,
 *     summary: 'Life Path 7: investigador espiritual',
 *     recommendation: 'Reservar tempo semanal para estudo contemplativo',
 *     frequency: 'gift',
 *   },
 *   {
 *     pilar: 'genekeys',
 *     weight: 0.6,
 *     summary: 'Gene Key 7: Sombra Divisão → Dom Virtude → Siddhi Virtude',
 *     recommendation: 'Curar divisão interna pelo cultivo de virtudes éticas',
 *     frequency: 'shadow',
 *   },
 * ]);
 * // result.primary.pilar === 'cabala'
 * ```
 *
 * @param insights - Lista de insights por Pilar. Mínimo 1.
 * @returns Síntese priorizada + conflitos + esqueleto de integração.
 *
 * Performance: O(n²) no pior caso (conflict detection pairwise), onde
 * n = nº de Pilares (max 10-20 na prática). Aceitável para POC.
 *
 * Erros:
 *  - lança `SynthesisV2Error` se `insights` for vazio ou contiver
 *    weights inválidos (fora de 0..1).
 */
export function synthesizeV2(insights: PilarInsight[]): SynthesisV2Result {
  if (!Array.isArray(insights) || insights.length === 0) {
    throw new SynthesisV2Error('synthesizeV2 requires at least 1 PilarInsight');
  }

  // 1) Validação + normalização
  const validated = insights.map((i, idx) => validateInsight(i, idx));

  // 2) Filtra pesos zero (Pilar ausente) e ordena por weight desc
  const active = [...validated].sort((a, b) => b.weight - a.weight);

  // 3) Ranking + primary/secondary
  const ranked: PilarInsightRanked[] = active.map((insight, idx) => ({
    pilar: insight.pilar,
    insight,
    rank: idx + 1,
  }));
  const [primary, ...secondary] = ranked;
  if (!primary) {
    // TypeScript exhaustiveness — não deve acontecer após validação.
    throw new SynthesisV2Error('Internal error: no primary after ranking');
  }

  // 4) Detecção de conflitos (O(n²) pairwise, n<=20)
  const conflicts = detectConflicts(active);

  // 5) Esqueleto de integração
  const integration = buildIntegrationSkeleton(ranked, active.length);

  // 6) Metadados
  const absentPilares = computeAbsentPilares(active);
  const totalWeight = active.reduce((acc, i) => acc + i.weight, 0);

  return {
    primary,
    secondary,
    conflicts,
    integration,
    metadata: {
      totalWeight: round2(totalWeight),
      absentPilares,
    },
  };
}

// ─── 4. Validação ────────────────────────────────────────────────────────────

export class SynthesisV2Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SynthesisV2Error';
  }
}

function validateInsight(insight: PilarInsight, idx: number): PilarInsight {
  if (!insight || typeof insight !== 'object') {
    throw new SynthesisV2Error(`insights[${idx}] is not an object`);
  }
  if (!isPilar(insight.pilar)) {
    throw new SynthesisV2Error(
      `insights[${idx}].pilar is invalid: ${String(insight.pilar)}`,
    );
  }
  if (typeof insight.weight !== 'number' || insight.weight < 0 || insight.weight > 1) {
    throw new SynthesisV2Error(
      `insights[${idx}].weight must be a number in [0,1], got ${insight.weight}`,
    );
  }
  if (typeof insight.summary !== 'string' || insight.summary.length === 0) {
    throw new SynthesisV2Error(`insights[${idx}].summary must be non-empty string`);
  }
  if (typeof insight.recommendation !== 'string' || insight.recommendation.length === 0) {
    throw new SynthesisV2Error(
      `insights[${idx}].recommendation must be non-empty string`,
    );
  }
  if (
    insight.conflictWith !== undefined &&
    (!Array.isArray(insight.conflictWith) ||
      !insight.conflictWith.every((p) => isPilar(p)))
  ) {
    throw new SynthesisV2Error(
      `insights[${idx}].conflictWith must be an array of Pilar`,
    );
  }
  if (
    insight.polarity !== undefined &&
    !['expansive', 'contractive', 'neutral'].includes(insight.polarity)
  ) {
    throw new SynthesisV2Error(
      `insights[${idx}].polarity must be expansive|contractive|neutral`,
    );
  }
  return insight;
}

function isPilar(value: unknown): value is Pilar {
  return typeof value === 'string' && (PILARES as readonly string[]).includes(value);
}

// ─── 5. Conflict detection ───────────────────────────────────────────────────

function detectConflicts(active: PilarInsight[]): PilarConflict[] {
  const conflicts: PilarConflict[] = [];

  // 5a) Conflitos declarados (conflictWith explícito)
  for (const insight of active) {
    if (!insight.conflictWith) continue;
    for (const otherPilar of insight.conflictWith) {
      const other = active.find((i) => i.pilar === otherPilar);
      if (!other) continue; // Pilar ausente — não há conflito real
      // Dedup: só registra se a ordem canônica não foi vista ainda
      const key = canonicalConflictKey(insight.pilar, otherPilar);
      if (conflicts.some((c) => canonicalConflictKey(c.pilares[0], c.pilares[1]) === key)) {
        continue;
      }
      conflicts.push({
        pilares: [insight.pilar, otherPilar],
        kind: 'declared',
        description: `${PILAR_LABELS[insight.pilar]} declara conflito explícito com ${PILAR_LABELS[otherPilar]}`,
      });
    }
  }

  // 5b) Heurística: polaridades opostas entre Pilares ativos
  // Não inventa semântica — só compara a direcionalidade declarada.
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (!a || !b) continue;
      if (!a.polarity || !b.polarity) continue;
      if (a.polarity === 'neutral' || b.polarity === 'neutral') continue;
      if (a.polarity === b.polarity) continue;
      const key = canonicalConflictKey(a.pilar, b.pilar);
      if (conflicts.some((c) => canonicalConflictKey(c.pilares[0], c.pilares[1]) === key)) {
        continue; // já registrado como declarado
      }
      conflicts.push({
        pilares: [a.pilar, b.pilar],
        kind: 'polarity',
        description: `${PILAR_LABELS[a.pilar]} sugere ${a.polarity}; ${PILAR_LABELS[b.pilar]} sugere ${b.polarity}`,
      });
    }
  }

  return conflicts;
}

function canonicalConflictKey(a: Pilar, b: Pilar): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// ─── 6. Integration skeleton ─────────────────────────────────────────────────

function buildIntegrationSkeleton(
  ranked: PilarInsightRanked[],
  activeCount: number,
): SynthesisV2Result['integration'] {
  const aggregatedSummary = ranked
    .map((r) => `${PILAR_LABELS[r.pilar]}: ${r.insight.summary}`)
    .join(' | ');

  const rankedRecommendations = ranked.map(
    (r) => `${PILAR_LABELS[r.pilar]} → ${r.insight.recommendation}`,
  );

  const citations = ranked.map((r) => ({
    pilar: r.pilar,
    label: PILAR_LABELS[r.pilar],
    symbol: extractSymbol(r.insight),
    weight: r.insight.weight,
  }));

  return {
    aggregatedSummary,
    rankedRecommendations,
    citations,
    activePilarCount: activeCount,
    absentPilarCount: PILARES.length - activeCount,
  };
}

/**
 * Extrai um símbolo limpo da summary, se presente. Tentativa simples —
 * pega a primeira palavra em maiúsculas ou número (ex: "Life Path 7",
 * "Hexagrama 26", "Gene Key 7", "Sol em Leão").
 *
 * Não infere — se não achar, devolve undefined. O Mentor LLM pode
 * complementar.
 */
function extractSymbol(insight: PilarInsight): string | undefined {
  const s = insight.summary;
  // padrão: "Palavra Capitalizada número/letra"
  const m = s.match(/\b([A-ZÀ-Ú][\wÀ-ú]+(?:\s+[A-ZÀ-Ú][\wÀ-ú]+)*\s+\d{1,3})\b/);
  if (m && m[1]) return m[1];
  // fallback: primeiro "Num" ou palavra em maiúsculas
  const m2 = s.match(/\b([A-Z][a-zà-ú]+\s+[A-ZÀ-Ú][a-zà-ú]+)\b/);
  if (m2 && m2[1]) return m2[1];
  return undefined;
}

// ─── 7. Helpers públicos auxiliares ───────────────────────────────────────────

/**
 * Lista os Pilares ausentes (presentes no union `PILARES` mas não
 * em `insights` ou com peso 0).
 */
function computeAbsentPilares(active: PilarInsight[]): Pilar[] {
  const present = new Set(active.map((i) => i.pilar));
  return PILARES.filter((p) => !present.has(p));
}

/**
 * Versão alternativa que aceita `Record<Pilar, PilarInsight | null>`.
 * Útil quando a engine de Pilar já tem um output tipado por Pilar
 * (incluindo null = Pilar não calculado).
 *
 * Filtra automaticamente os `null` antes de chamar `synthesizeV2`.
 */
export function synthesizeV2FromRecord(
  record: Partial<Record<Pilar, PilarInsight | null>>,
): SynthesisV2Result {
  const arr: PilarInsight[] = [];
  for (const [pilar, insight] of Object.entries(record) as Array<
    [Pilar, PilarInsight | null | undefined]
  >) {
    if (insight) {
      arr.push({ ...insight, pilar });
    }
  }
  return synthesizeV2(arr);
}

// ─── 8. Util ─────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
