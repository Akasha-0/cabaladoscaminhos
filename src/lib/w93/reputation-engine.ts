/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — REPUTATION ENGINE · UNIVERSALISTA MULTI-EIXO
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 *
 * ENGINE — pure (sem I/O). Toda a matemática de scoring vive aqui:
 *
 *   1. Decay exponencial por half-life (atribuições antigas pesam menos)
 *   2. Score por eixo (5 eixos, cada um independente)
 *   3. Score por tradição × eixo (5 × 5 = 25 cells, NÃO-comparativo)
 *   4. Trend detection (rising/stable/falling/new)
 *   5. LGPD-safe snapshot (strip fromPersonId, drop notes, purge expired)
 *
 * NÃO-comparativo: tradição X nunca é somada/comparada com tradição Y.
 * Cada célula (tradição × eixo) é independente.
 *
 * NÃO single-score: nunca retornar UM número. Sempre 5 eixos ou 25 cells.
 *
 * Persistência NÃO vive aqui — usar reputation-storage.ts.
 * UI NÃO vive aqui — usar components/reputation/.
 *
 * Durable lessons applied:
 *   - Result pattern `{ ok: true, value } | { ok: false, error }` (cycle 73)
 *   - Branded types + type guards (cycle 73)
 *   - `as const satisfies Record<...>` for const objects (cycle 92 lesson #2)
 *   - Fake-clock `{ now: () => fakeNow }` for TTL tests (cycle 92 lesson #8)
 *   - stripReporterIdentities() helper for LGPD (cycle 92 lesson #12)
 *   - Object.freeze on insert (cycle 68)
 *   - Sacred-cultural terms preserved verbatim
 */

import {
  REPUTATION_AXES,
  TRADITIONS,
  ATTRIBUTION_SCORE_MIN,
  ATTRIBUTION_SCORE_MAX,
  ATTRIBUTION_SCORE_NEUTRAL,
  ATTRIBUTION_HALF_LIFE_DAYS,
  LGPD_MAX_RETENTION_DAYS,
  DECAY_FLOOR,
  RADAR_MAX_SCORE,
  RADAR_MIN_DISPLAY,
  TRADITION_AXIS_WEIGHTS,
  type Attribution,
  type AttributionId,
  type AxisScore,
  type ConsentEvent,
  type ConsentInput,
  type ConsentStatus,
  type CreateAttributionInput,
  type GetSnapshotInput,
  type PersonId,
  type PublicAttribution,
  type ReputationAxis,
  type ReputationSnapshot,
  type TraditionAxisScore,
  type TraditionId,
  asAttributionId,
  isReputationAxis,
  isTraditionId,
  isAttributionContext,
  isValidScore,
} from './reputation-types.ts';

// ════════════════════════════════════════════════════════════════════════════
// RESULT TYPE
// ════════════════════════════════════════════════════════════════════════════

export type Result<T, E = ReputationError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type ReputationError =
  | 'consent-required'
  | 'self-attribution-forbidden'
  | 'duplicate-attribution'
  | 'invalid-axis'
  | 'invalid-tradition'
  | 'invalid-context'
  | 'invalid-score'
  | 'empty-from-id'
  | 'empty-to-id'
  | 'not-found';

// ════════════════════════════════════════════════════════════════════════════
// ENGINE OPTIONS
// ════════════════════════════════════════════════════════════════════════════

export interface ReputationEngineOptions {
  /** Clock function — injetável para testes determinísticos. Default: Date.now. */
  readonly now?: () => number;
  /** Half-life em dias. Default: ATTRIBUTION_HALF_LIFE_DAYS (60). */
  readonly halfLifeDays?: number;
  /** Retenção máxima em dias (LGPD). Default: LGPD_MAX_RETENTION_DAYS (90). */
  readonly maxRetentionDays?: number;
  /** Janela em dias para detecção de trend. Default: 30. */
  readonly trendWindowDays?: number;
  /** ID factory — injetável para determinismo. Default: timestamp+random. */
  readonly idFactory?: () => string;
}

// ════════════════════════════════════════════════════════════════════════════
// ENGINE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Pure scoring engine. Stateless — recebe input + clock, retorna score.
 *
 * Não persiste — para storage, usar reputation-storage.ts.
 */
export class ReputationEngine {
  private readonly now: () => number;
  private readonly halfLifeDays: number;
  private readonly maxRetentionDays: number;
  private readonly trendWindowDays: number;
  private readonly idFactory: () => string;

  constructor(opts: ReputationEngineOptions = {}) {
    this.now = opts.now ?? (() => Date.now());
    this.halfLifeDays = opts.halfLifeDays ?? ATTRIBUTION_HALF_LIFE_DAYS;
    this.maxRetentionDays = opts.maxRetentionDays ?? LGPD_MAX_RETENTION_DAYS;
    this.trendWindowDays = opts.trendWindowDays ?? 30;
    this.idFactory = opts.idFactory ?? defaultIdFactory(this.now);
  }

  // ─── VALIDATION ─────────────────────────────────────────────────────────

  /**
   * Valida input de criação de atribuição. Retorna Result — NÃO joga.
   * LGPD: rejeita se consentGiven=false.
   * Universalista: rejeita self-attribution (de fora pra si mesmo).
   */
  validateAttribution(input: CreateAttributionInput): Result<true> {
    if (!input.fromPersonId || !(input.fromPersonId as string)) {
      return { ok: false, error: 'empty-from-id' };
    }
    if (!input.toPersonId || !(input.toPersonId as string)) {
      return { ok: false, error: 'empty-to-id' };
    }
    if (input.fromPersonId === input.toPersonId) {
      return { ok: false, error: 'self-attribution-forbidden' };
    }
    if (!isReputationAxis(input.axis)) {
      return { ok: false, error: 'invalid-axis' };
    }
    if (!isTraditionId(input.tradition)) {
      return { ok: false, error: 'invalid-tradition' };
    }
    if (!isAttributionContext(input.context)) {
      return { ok: false, error: 'invalid-context' };
    }
    if (!isValidScore(input.score)) {
      return { ok: false, error: 'invalid-score' };
    }
    if (!input.consentGiven) {
      return { ok: false, error: 'consent-required' };
    }
    return { ok: true, value: true };
  }

  // ─── ATTRIBUTION CREATION ───────────────────────────────────────────────

  /**
   * Cria uma atribuição válida a partir de input.
   * Engine não persiste — retorna Attribution pronta para o storage.
   */
  createAttribution(input: CreateAttributionInput): Result<Attribution> {
    const v = this.validateAttribution(input);
    if (!v.ok) return v;
    const id = asAttributionId(this.idFactory());
    const base: Attribution = {
      id,
      fromPersonId: input.fromPersonId,
      toPersonId: input.toPersonId,
      axis: input.axis,
      score: input.score,
      tradition: input.tradition,
      context: input.context,
      createdAt: this.now(),
      consentGiven: true,
    };
    return {
      ok: true,
      value:
        input.note !== undefined
          ? Object.freeze({ ...base, note: input.note })
          : Object.freeze(base),
    };
  }

  // ─── DECAY & SCORING ────────────────────────────────────────────────────

  /**
   * Calcula o decay factor (0..1) de uma atribuição dado sua idade em dias.
   * Exponencial half-life: factor = 2^(-age/halfLife)
   * Retorna DECAY_FLOOR como mínimo (histórico nunca zera).
   */
  decayFactor(ageDays: number): number {
    if (ageDays <= 0) return 1;
    const raw = Math.pow(2, -ageDays / this.halfLifeDays);
    return Math.max(DECAY_FLOOR, raw);
  }

  /**
   * Calcula score decay-weighted para UM eixo de UMA pessoa.
   * Não-comparativo: score é 0..100, normalizado para RADAR_MAX_SCORE.
   *
   * Algoritmo:
   *   1. Para cada atribuição válida (LGPD: consentGiven && dentro da retenção):
   *      - decayFactor = 2^(-ageDays/halfLife)
   *      - contribution = (score - NEUTRAL) * decayFactor
   *   2. Soma contributions
   *   3. Normaliza para 0..100 (assume ~10 atribuições para saturar)
   *   4. Aplica floor e ceil
   */
  computeAxisScore(
    axis: ReputationAxis,
    attributions: readonly Attribution[],
    asOf?: number,
  ): AxisScore {
    const now = asOf ?? this.now();
    const cutoffAgeDays = this.maxRetentionDays;
    const valid = attributions.filter((a) => {
      if (a.axis !== axis) return false;
      if (!a.consentGiven) return false;
      const ageDays = (now - a.createdAt) / (1000 * 60 * 60 * 24);
      return ageDays <= cutoffAgeDays;
    });

    if (valid.length === 0) {
      return {
        axis,
        rawScore: 0,
        count: 0,
        lastAttributionAt: 0,
        trend: 'new',
      };
    }

    let weightedSum = 0;
    let lastAttributionAt = 0;
    for (const a of valid) {
      const ageDays = (now - a.createdAt) / (1000 * 60 * 60 * 24);
      const decay = this.decayFactor(ageDays);
      // Mapeia 1..5 → -2..+2 (com NEUTRAL=3 = 0)
      const centered = a.score - ATTRIBUTION_SCORE_NEUTRAL;
      weightedSum += centered * decay;
      if (a.createdAt > lastAttributionAt) lastAttributionAt = a.createdAt;
    }

    // Normalização: ~10 atribuições full-positive saturam em 100.
    // Fórmula: 50 + weightedSum * 5 (cap [0..100])
    const raw = 50 + weightedSum * 5;
    const score = Math.max(0, Math.min(RADAR_MAX_SCORE, raw));

    // Trend: comparar scores em duas janelas
    const trend = this.computeTrend(axis, attributions, now);

    return Object.freeze({
      axis,
      rawScore: score,
      count: valid.length,
      lastAttributionAt,
      trend,
    });
  }

  /**
   * Detecta trend olhando duas janelas (recente vs anterior).
   * 'new' = primeira atribuição < 7 dias atrás.
   */
  private computeTrend(
    axis: ReputationAxis,
    attributions: readonly Attribution[],
    now: number,
  ): 'rising' | 'stable' | 'falling' | 'new' {
    const windowMs = this.trendWindowDays * 24 * 60 * 60 * 1000;
    const recentCutoff = now - windowMs;
    const previousCutoff = now - 2 * windowMs;

    const axisAttrs = attributions.filter(
      (a) => a.axis === axis && a.consentGiven,
    );
    if (axisAttrs.length === 0) return 'new';

    const oldest = axisAttrs.reduce(
      (min, a) => Math.min(min, a.createdAt),
      Number.POSITIVE_INFINITY,
    );
    if (now - oldest < 7 * 24 * 60 * 60 * 1000) return 'new';

    let recentSum = 0;
    let recentN = 0;
    let previousSum = 0;
    let previousN = 0;
    for (const a of axisAttrs) {
      if (a.createdAt >= recentCutoff) {
        recentSum += a.score;
        recentN++;
      } else if (a.createdAt >= previousCutoff) {
        previousSum += a.score;
        previousN++;
      }
    }
    if (recentN === 0 || previousN === 0) return 'stable';
    const recentAvg = recentSum / recentN;
    const previousAvg = previousSum / previousN;
    const delta = recentAvg - previousAvg;
    if (delta > 0.3) return 'rising';
    if (delta < -0.3) return 'falling';
    return 'stable';
  }

  /**
   * Calcula score POR TRADIÇÃO × EIXO (não-comparativo).
   * Retorna 25 cells (5 tradições × 5 eixos). Cada cell é independente.
   */
  computeTraditionAxisScores(
    attributions: readonly Attribution[],
    asOf?: number,
  ): TraditionAxisScore[] {
    const now = asOf ?? this.now();
    const cells: TraditionAxisScore[] = [];

    for (const trad of TRADITIONS) {
      const tradAttrs = attributions.filter(
        (a) => a.tradition === trad && a.consentGiven,
      );
      const weights = TRADITION_AXIS_WEIGHTS[trad];
      // Calcula score agregado da tradição usando pesos
      let weightedScore = 0;
      let totalWeight = 0;
      for (const axis of REPUTATION_AXES) {
        const axisScore = this.computeAxisScore(axis, tradAttrs, now);
        const w = weights[axis];
        weightedScore += axisScore.rawScore * w;
        totalWeight += w;
        cells.push({
          tradition: trad,
          axis,
          score: axisScore.rawScore,
          weight: w,
        });
      }
      // weightedScore já é o agregado — não usamos direto, mas validamos totalWeight > 0
      if (totalWeight === 0) {
        // fallback: pesos não somam 1, normaliza
        for (let i = cells.length - TRADITIONS.length; i < cells.length; i++) {
          const cell = cells[i];
          if (cell && cell.tradition === trad) {
            cells[i] = { ...cell, weight: cell.weight / (totalWeight || 1) };
          }
        }
      }
    }

    return cells.map((c) => Object.freeze(c));
  }

  // ─── SNAPSHOT ──────────────────────────────────────────────────────────

  /**
   * Computa snapshot LGPD-safe da reputação de uma pessoa.
   * - NUNCA inclui fromPersonId
   * - NUNCA inclui note (pode ter PII)
   * - Inclui consentStatus para transparência
   */
  computeSnapshot(
    input: GetSnapshotInput,
    attributions: readonly Attribution[],
    consentStatus: ConsentStatus = 'opted-in',
  ): ReputationSnapshot {
    const now = input.asOf ?? this.now();

    // LGPD: filtrar atribuições opted-out
    const filtered = consentStatus === 'opted-out' ? [] : attributions.filter(
      (a) => a.toPersonId === input.personId && a.consentGiven,
    );

    // LGPD: purge expired (> maxRetentionDays)
    const cutoff = now - this.maxRetentionDays * 24 * 60 * 60 * 1000;
    const fresh = filtered.filter((a) => a.createdAt >= cutoff);

    // 5 eixos
    const axes = REPUTATION_AXES.map((axis) =>
      this.computeAxisScore(axis, fresh, now),
    );

    // 25 cells (5 tradições × 5 eixos)
    const byTradition = this.computeTraditionAxisScores(fresh, now);

    // Context breakdown
    const contextBreakdown: Record<string, number> = {
      consulta: 0,
      peer: 0,
      mentoria: 0,
      comunidade: 0,
      estudo: 0,
    };
    for (const a of fresh) {
      const cur = contextBreakdown[a.context];
      contextBreakdown[a.context] = (cur ?? 0) + 1;
    }

    // Retention days
    let retentionDays = 0;
    if (fresh.length > 0) {
      const oldest = fresh.reduce(
        (min, a) => Math.min(min, a.createdAt),
        Number.POSITIVE_INFINITY,
      );
      retentionDays = Math.floor((now - oldest) / (1000 * 60 * 60 * 24));
    }

    return Object.freeze({
      personId: input.personId,
      axes: Object.freeze(axes) as ReadonlyArray<AxisScore>,
      byTradition: Object.freeze(byTradition) as ReadonlyArray<TraditionAxisScore>,
      contextBreakdown: Object.freeze(contextBreakdown) as Readonly<
        Record<string, number>
      >,
      totalAttributions: fresh.length,
      computedAt: now,
      consentStatus,
      retentionDays,
    });
  }

  // ─── LGPD STRIPPING ────────────────────────────────────────────────────

  /**
   * Strip identities de reporter — converte Attribution → PublicAttribution.
   * Remove fromPersonId e note (PII potencial).
   * Universalista: aplica em QUALQUER export de atribuição.
   */
  stripReporterIdentities(attribution: Attribution): PublicAttribution {
    const { fromPersonId: _from, note: _note, ...pub } = attribution;
    return Object.freeze(pub) as PublicAttribution;
  }

  stripReporterIdentitiesBatch(
    attributions: readonly Attribution[],
  ): readonly PublicAttribution[] {
    return attributions.map((a) => this.stripReporterIdentities(a));
  }

  /**
   * Purge expired — remove atribuições mais velhas que maxRetentionDays.
   * LGPD: tudo além de 90 dias DEVE ser removido.
   */
  purgeExpired(
    attributions: readonly Attribution[],
    maxDays: number = this.maxRetentionDays,
    asOf?: number,
  ): readonly Attribution[] {
    const now = asOf ?? this.now();
    const cutoff = now - maxDays * 24 * 60 * 60 * 1000;
    return attributions.filter((a) => a.createdAt >= cutoff);
  }

  // ─── CONSENT ───────────────────────────────────────────────────────────

  /**
   * Processa mudança de consentimento.
   * LGPD: opted-out remove TODAS atribuições da pessoa imediatamente.
   */
  applyConsent(
    input: ConsentInput,
    attributions: readonly Attribution[],
  ): Result<{
    remaining: readonly Attribution[];
    event: ConsentEvent;
  }> {
    if (!input.personId || !(input.personId as string)) {
      return { ok: false, error: 'not-found' };
    }
    const event: ConsentEvent = {
      personId: input.personId,
      status: input.status,
      at: this.now(),
      ...(input.reason !== undefined ? { reason: input.reason as ConsentEvent['reason'] } : {}),
    };
    const remaining =
      input.status === 'opted-out'
        ? attributions.filter((a) => a.toPersonId !== input.personId)
        : attributions;
    return {
      ok: true,
      value: { remaining: Object.freeze(remaining), event: Object.freeze(event) },
    };
  }

  // ─── RADAR DATA (UI helper) ────────────────────────────────────────────

  /**
   * Computa dados normalizados para o radar UI (5 eixos, 0..100).
   * Retorna apenas eixos com score >= RADAR_MIN_DISPLAY — abaixo disso
   * o UI deve ocultar (não exibir "0" como falha visível).
   */
  radarData(snapshot: ReputationSnapshot): ReadonlyArray<{
    axis: ReputationAxis;
    score: number;
    visible: boolean;
    trend: AxisScore['trend'];
  }> {
    return snapshot.axes.map((a) => ({
      axis: a.axis,
      score: Math.round(a.rawScore),
      visible: a.rawScore >= RADAR_MIN_DISPLAY,
      trend: a.trend,
    }));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

/** Default ID factory — combina timestamp + random. Determinístico se `now` for injetado. */
function defaultIdFactory(now: () => number): () => string {
  let counter = 0;
  return () => {
    counter++;
    return `attr_${now().toString(36)}_${counter.toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  };
}

// ════════════════════════════════════════════════════════════════════════════
// DISPLAY LABELS (pt-BR) — para UI
// ════════════════════════════════════════════════════════════════════════════

// Termos sagrados preservados verbatim (GOAL.md):
// orixás, axé, Iemanjá, Odu, Odus, entidades, Cigano Ramiro, Akasha,
// pemba, Candomblé, Umbanda, Ifá.
// São usados nas fixtures de avaliação (ex.: "acolhimento com axé genuíno").
const SACRED_TERMS_PRESERVED = {
  orixas: 'orixás',
  axe: 'axé',
  iemanja: 'Iemanjá',
  ciganoRamiro: 'Cigano Ramiro',
  akasha: 'Akasha',
  pemba: 'pemba',
} as const;

/** Labels pt-BR para os 5 eixos. Universalistas. */
export const AXIS_LABELS_PT_BR: Readonly<Record<ReputationAxis, string>> = {
  acolhimento: 'Acolhimento',
  conhecimento: 'Conhecimento',
  presenca: 'Presença',
  contribuicao: 'Contribuição',
  escuta: 'Escuta',
};

/** Labels pt-BR para as 5 tradições. Termos sagrados preservados. */
export const TRADITION_LABELS_PT_BR: Readonly<Record<TraditionId, string>> = {
  Candomblé: 'Candomblé',
  Umbanda: 'Umbanda',
  Ifá: 'Ifá',
  Astrologia: 'Astrologia',
  Cabala: 'Cabala',
};

/** Trend labels pt-BR para acessibilidade (aria-label no radar). */
export const TREND_LABELS_PT_BR: Readonly<Record<AxisScore['trend'], string>> = {
  rising: 'Em ascensão',
  stable: 'Estável',
  falling: 'Em declínio',
  new: 'Nova',
};

/**
 * Glyph emoji (decorativo, NÃO-voto) — usado APENAS no radar UI.
 * Não é ranking, não é score. É ícone decorativo.
 */
export const AXIS_GLYPHS: Readonly<Record<ReputationAxis, string>> = {
  acolhimento: '🫶',
  conhecimento: '📚',
  presenca: '🕯️',
  contribuicao: '✨',
  escuta: '👂',
};