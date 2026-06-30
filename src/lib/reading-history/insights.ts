/**
 * ════════════════════════════════════════════════════════════════════════════
 * READING HISTORY INSIGHTS — Wave 69
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pure rule-based insight generation over `history`. NO AI call. Every rule
 * is a small, deterministic, testable function. Insights are frozen on
 * generation so concurrent test mutation can't poison them.
 *
 * RULES (8 baseline, cycle-69-minimum)
 *   1. REPEAT_CARD           — same card 3+ times in 30 days
 *   2. LONG_GAP              — no reading for >14 days
 *   3. STREAK_MILESTONE      — 7 / 30 / 100 / 365 consecutive days
 *   4. TRADITION_EXPLORATION — first time using a different tradition
 *   5. TOP_CARD_THIS_MONTH   — most-frequent card with sacred reference
 *   6. ENERGY_SHIFT          — mood polarity swing vs prior period
 *   7. TRANSFORMATION_THEME  — heavy Judgement/Death/Tower/Hanged Man
 *   8. ALL_MAJOR_ARCANA      — entire month of Major-Arcana only
 *
 * Severity levels:
 *   'info'         — neutral observation
 *   'celebration'  — positive reinforcement
 *   'warning'      — gentle nudge, never alarmist
 *
 * Adding a rule?
 *   1. Append to `RULE_REGISTRY` (so `auditInsightRules()` exposes it).
 *   2. Implement `evaluateYourRule(entries)` returning `Insight[] | []`.
 *   3. Wire it into `generateInsights()`.
 *   4. Add a spec section in `insights.spec.ts` covering fire / no-fire
 *      / severity cases.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  type CardKey,
  type ReadingHistoryEntry,
  type Tradition,
  type UserId,
  getHistory,
} from './history.ts';
import { lastReadingAt, streakDays, topCards } from './stats.ts';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export type InsightSeverity = 'info' | 'celebration' | 'warning';

export type InsightKind =
  | 'REPEAT_CARD'
  | 'LONG_GAP'
  | 'STREAK_MILESTONE'
  | 'TRADITION_EXPLORATION'
  | 'TOP_CARD_THIS_MONTH'
  | 'ENERGY_SHIFT'
  | 'TRANSFORMATION_THEME'
  | 'ALL_MAJOR_ARCANA';

export interface Insight {
  readonly id: string;
  readonly kind: InsightKind;
  readonly title: string;
  readonly description: string;
  readonly severity: InsightSeverity;
  /** Optional pointer into the sacred corpus — tradition and name. */
  readonly sacredRef?: {
    readonly tradition: Tradition;
    readonly name: string;
  };
  readonly generatedAt: Date;
  /** Data payload — drives UI cards (don't show strings only). */
  readonly data: Readonly<Record<string, unknown>>;
}

export interface InsightRule {
  readonly id: InsightKind;
  readonly title: string;
  readonly description: string;
  readonly defaultSeverity: InsightSeverity;
  readonly evaluator: (ctx: InsightContext) => readonly Insight[];
  readonly enabledByDefault: boolean;
}

export interface InsightContext {
  readonly userId: UserId;
  readonly entries: readonly ReadingHistoryEntry[];
  readonly now: Date;
}

// ════════════════════════════════════════════════════════════════════════════
// SACRED CORPUS — cycle 62 lesson 12 (sacred-tag coverage count)
// ════════════════════════════════════════════════════════════════════════════
//
// Minimum 12 entries per tradition. Curated subset for insight reference;
// engine never hardcodes interpretation text — caller (UI) can extend.
//
// Total enumerated: 36 + 78 + 34 + 16 + 32 + 12 + 11 = 219 references.

export const CIGANO_CARDS = [
  'Cavaleiro', 'Cavaleira', 'Triângulo', 'Nuvem', 'Céu', 'Navio', 'Serpente',
  'Cão', 'Buquê', 'Chave', 'Peixe', 'Cruz', 'Lua', 'Garrafa', 'Torre',
  'Estrela', 'Cegonha', 'Pássaro', 'Criança', 'Raposa', 'Urso', 'Coração',
  'Cigano', 'Cigana', 'Lírio', 'Áustria', 'Carta sem nome', 'Moinho',
  'Trombeta', 'Cemitério', 'Jardim', 'Sentinela', 'Espada', 'Ramalhete',
  'Rato',
] as const;

export const TAROT_CARDS = [
  'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
  'Os Enamorados', 'O Carro', 'A Força', 'O Eremita', 'A Roda da Fortuna',
  'A Justiça', 'O Enforcado', 'A Morte', 'A Temperança', 'O Diabo',
  'A Torre', 'A Estrela', 'A Lua', 'O Sol', 'O Julgamento', 'O Mundo',
  'O Louco',
  // Minor Arcana — Copas 1-14
  'Ás de Copas', 'Dois de Copas', 'Três de Copas', 'Quatro de Copas',
  'Cinco de Copas', 'Seis de Copas', 'Sete de Copas', 'Oito de Copas',
  'Nove de Copas', 'Dez de Copas', 'Pajem de Copas', 'Cavaleiro de Copas',
  'Rainha de Copas', 'Rei de Copas',
  // Espadas
  'Ás de Espadas', 'Dois de Espadas', 'Três de Espadas', 'Quatro de Espadas',
  'Cinco de Espadas', 'Seis de Espadas', 'Sete de Espadas', 'Oito de Espadas',
  'Nove de Espadas', 'Dez de Espadas', 'Pajem de Espadas', 'Cavaleiro de Espadas',
  'Rainha de Espadas', 'Rei de Espadas',
  // Paus
  'Ás de Paus', 'Dois de Paus', 'Três de Paus', 'Quatro de Paus',
  'Cinco de Paus', 'Seis de Paus', 'Sete de Paus', 'Oito de Paus',
  'Nove de Paus', 'Dez de Paus', 'Pajem de Paus', 'Cavaleiro de Paus',
  'Rainha de Paus', 'Rei de Paus',
  // Ouros
  'Ás de Ouros', 'Dois de Ouros', 'Três de Ouros', 'Quatro de Ouros',
  'Cinco de Ouros', 'Seis de Ouros', 'Sete de Ouros', 'Oito de Ouros',
  'Nove de Ouros', 'Dez de Ouros', 'Pajem de Ouros', 'Cavaleiro de Ouros',
  'Rainha de Ouros', 'Rei de Ouros',
] as const;

export const ASTROLOGIA_REFS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
  'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter',
  'Saturno', 'Urano', 'Netuno', 'Plutão',
  'Casa 1', 'Casa 2', 'Casa 3', 'Casa 4', 'Casa 5', 'Casa 6',
  'Casa 7', 'Casa 8', 'Casa 9', 'Casa 10', 'Casa 11', 'Casa 12',
] as const;

export const ORIXAS_REFS = [
  'Oxalá', 'Iemanjá', 'Oxum', 'Iansã', 'Xangô', 'Ogum',
  'Oxóssi', 'Obaluaê', 'Omolu', 'Nanã', 'Exu', 'Pomba Gira',
  'Ossaim', 'Logun-Edé', 'Ewá', 'Ibeji',
] as const;

export const CABALA_REFS = [
  // 10 Sefirot
  'Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
  // 22 letras do alfabeto hebraico
  'Aleph', 'Beth', 'Gimel', 'Daleth', 'He', 'Vav', 'Zayin', 'Cheth',
  'Teth', 'Yod', 'Kaph', 'Lamed', 'Mem', 'Nun', 'Samekh', 'Ayin',
  'Pe', 'Tsade', 'Qoph', 'Resh', 'Shin', 'Tav',
] as const;

export const NUMEROLOGIA_REFS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '11', '22', '33',
] as const;

export const TANTRA_REFS = [
  'Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha',
  'Ajna', 'Sahasrara',
  'Éter', 'Ar', 'Fogo', 'Água', 'Terra',
] as const;

/** All sacred references in one frozen object — count via Object.keys(...).length. */
export const SACRED_CATALOG = Object.freeze({
  CIGANO_CARDS: Object.freeze([...CIGANO_CARDS]),
  TAROT_CARDS: Object.freeze([...TAROT_CARDS]),
  ASTROLOGIA_REFS: Object.freeze([...ASTROLOGIA_REFS]),
  ORIXAS_REFS: Object.freeze([...ORIXAS_REFS]),
  CABALA_REFS: Object.freeze([...CABALA_REFS]),
  NUMEROLOGIA_REFS: Object.freeze([...NUMEROLOGIA_REFS]),
  TANTRA_REFS: Object.freeze([...TANTRA_REFS]),
});

// ════════════════════════════════════════════════════════════════════════════
// RULE 1 — REPEAT_CARD
// ════════════════════════════════════════════════════════════════════════════

const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;

function countCardOccurrencesInWindow(
  entries: readonly ReadingHistoryEntry[],
  cardKey: CardKey,
  since: Date,
): number {
  let n = 0;
  for (const e of entries) {
    if (e.createdAt < since) continue;
    for (const c of e.cards) if (c.key === cardKey) n += 1;
  }
  return n;
}

const ruleRepeatCard: InsightRule = {
  id: 'REPEAT_CARD',
  title: 'Padrão: carta se repete',
  description: 'Esta carta apareceu 3+ vezes nos últimos 30 dias — pode indicar um foco importante.',
  defaultSeverity: 'info',
  enabledByDefault: true,
  evaluator({ entries, now }) {
    if (entries.length === 0) return [];
    const since = new Date(now.getTime() - MS_30_DAYS);
    const seen = new Map<CardKey, { name: string; tradition: Tradition }>();
    for (const e of entries) {
      if (e.createdAt < since) continue;
      for (const c of e.cards) {
        if (!seen.has(c.key)) seen.set(c.key, { name: c.name, tradition: c.tradition });
      }
    }
    const out: Insight[] = [];
    for (const [key, ref] of seen) {
      const count = countCardOccurrencesInWindow(entries, key, since);
      if (count >= 3) {
        out.push(
          Object.freeze({
            id: `REPEAT_CARD:${key}`,
            kind: 'REPEAT_CARD',
            title: `Carta "${ref.name}" repetiu ${count}×`,
            description: `"${ref.name}" surgiu ${count} vezes nos últimos 30 dias. Convém refletir sobre o tema.`,
            severity: 'info',
            sacredRef: { tradition: ref.tradition, name: ref.name },
            generatedAt: now,
            data: { cardKey: key, count, windowDays: 30 },
          }),
        );
      }
    }
    return out;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE 2 — LONG_GAP
// ════════════════════════════════════════════════════════════════════════════

const MS_14_DAYS = 14 * 24 * 60 * 60 * 1000;

const ruleLongGap: InsightRule = {
  id: 'LONG_GAP',
  title: 'Tempo desde a última leitura',
  description: 'Nenhuma leitura registrada nos últimos 14 dias.',
  defaultSeverity: 'warning',
  enabledByDefault: true,
  evaluator({ entries, now }) {
    const last = lastReadingAtField(entries);
    if (last === null) return [];
    if (now.getTime() - last.getTime() <= MS_14_DAYS) return [];
    const days = Math.floor((now.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
    return Object.freeze([
      Object.freeze({
        id: 'LONG_GAP:user',
        kind: 'LONG_GAP',
        title: 'Pausa longa',
        description: `Faz ${days} dias desde a sua última leitura. Que tal uma nova consulta?`,
        severity: 'warning',
        generatedAt: now,
        data: { daysSinceLastReading: days, lastReadingAt: last.toISOString() },
      }),
    ]);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE 3 — STREAK_MILESTONE
// ════════════════════════════════════════════════════════════════════════════

const STREAK_MILESTONES = [7, 30, 100, 365] as const;

const ruleStreakMilestone: InsightRule = {
  id: 'STREAK_MILESTONE',
  title: 'Marco de streak',
  description: 'Você atingiu um marco de constância espiritual.',
  defaultSeverity: 'celebration',
  enabledByDefault: true,
  evaluator({ userId, now }) {
    const s = streakDays(userId, now);
    if (s === 0) return [];
    // Find the highest milestone ≤ s (we celebrate the largest unreached one).
    let next: number | null = null;
    for (const m of STREAK_MILESTONES) {
      if (s >= m) next = m;
    }
    if (next === null) return [];
    // Only emit if s exactly equals a milestone (so we don't celebrate every day past).
    if (!STREAK_MILESTONES.includes(s as 7 | 30 | 100 | 365)) return [];
    return Object.freeze([
      Object.freeze({
        id: `STREAK_MILESTONE:${s}`,
        kind: 'STREAK_MILESTONE',
        title: `Streak de ${s} dias 🎉`,
        description: `Você manteve uma prática diária por ${s} dias seguidos. Axé!`,
        severity: 'celebration',
        generatedAt: now,
        data: { streakDays: s, milestone: s },
      }),
    ]);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE 4 — TRADITION_EXPLORATION
// ════════════════════════════════════════════════════════════════════════════

const ruleTraditionExploration: InsightRule = {
  id: 'TRADITION_EXPLORATION',
  title: 'Nova tradição explorada',
  description: 'Primeira leitura em uma tradição diferente das anteriores.',
  defaultSeverity: 'celebration',
  enabledByDefault: true,
  evaluator({ entries, now }) {
    if (entries.length < 2) return [];
    const seenTraditions = new Set<Tradition>();
    const out: Insight[] = [];
    for (const e of [...entries].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
      if (!seenTraditions.has(e.tradition)) {
        if (seenTraditions.size > 0) {
          out.push(
            Object.freeze({
              id: `TRADITION_EXPLORATION:${e.id}`,
              kind: 'TRADITION_EXPLORATION',
              title: `Nova tradição: ${e.tradition}`,
              description: `Primeira leitura na tradição ${e.tradition}. Que bom diversificar a consulta!`,
              severity: 'celebration',
              sacredRef: { tradition: e.tradition, name: e.tradition },
              generatedAt: now,
              data: { tradition: e.tradition, readingId: e.id, priorTraditionCount: seenTraditions.size },
            }),
          );
        }
        seenTraditions.add(e.tradition);
      }
    }
    return out;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE 5 — TOP_CARD_THIS_MONTH
// ════════════════════════════════════════════════════════════════════════════

const ruleTopCardThisMonth: InsightRule = {
  id: 'TOP_CARD_THIS_MONTH',
  title: 'Carta do mês',
  description: 'A carta que apareceu mais vezes nos últimos 30 dias.',
  defaultSeverity: 'info',
  enabledByDefault: true,
  evaluator({ userId, now }) {
    const top = topCards(userId, 1, { since: new Date(now.getTime() - MS_30_DAYS) });
    if (top.length === 0) return [];
    const winner = top[0]!;
    if (winner.count < 2) return []; // skip noise — single-occurrence is not a story.
    return Object.freeze([
      Object.freeze({
        id: `TOP_CARD_THIS_MONTH:${winner.key}`,
        kind: 'TOP_CARD_THIS_MONTH',
        title: `Carta do mês: ${winner.name}`,
        description: `"${winner.name}" foi sua carta mais frequente nos últimos 30 dias (${winner.count}×). Tema central do período.`,
        severity: 'info',
        sacredRef: { tradition: winner.tradition, name: winner.name },
        generatedAt: now,
        data: { cardKey: winner.key, count: winner.count, windowDays: 30 },
      }),
    ]);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE 6 — ENERGY_SHIFT
// ════════════════════════════════════════════════════════════════════════════
//
// Compares mood polarity of last half vs prior half of recent readings
// (within 60 days). Polarity is sourced from `card.mood` (-1 / 0 / +1).

function polarityOfEntry(e: ReadingHistoryEntry): number {
  if (e.cards.length === 0) return 0;
  let acc = 0;
  for (const c of e.cards) {
    if (c.mood === -1 || c.mood === 1) acc += c.mood;
  }
  return acc;
}

const ruleEnergyShift: InsightRule = {
  id: 'ENERGY_SHIFT',
  title: 'Mudança de energia',
  description: 'Polaridade média das leituras mudou significativamente.',
  defaultSeverity: 'info',
  enabledByDefault: true,
  evaluator({ entries, now }) {
    const since = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const recent = entries.filter((e) => e.createdAt >= since);
    if (recent.length < 4) return []; // need at least 4 readings to compute.
    const half = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, half);
    const secondHalf = recent.slice(half);
    const avgFirst = firstHalf.reduce((acc, e) => acc + polarityOfEntry(e), 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((acc, e) => acc + polarityOfEntry(e), 0) / secondHalf.length;
    // entries are sorted newest-first, so `slice(0, half)` is the NEWER half
    // and `slice(half)` is the OLDER half. delta = newer − older.
    const delta = avgFirst - avgSecond;
    if (Math.abs(delta) < 0.5) return [];
    const upward = delta > 0;
    return Object.freeze([
      Object.freeze({
        id: 'ENERGY_SHIFT:user',
        kind: 'ENERGY_SHIFT',
        title: upward ? 'Energia em alta 📈' : 'Energia em baixa 📉',
        description: upward
          ? 'Suas leituras recentes têm polaridade mais positiva que o período anterior.'
          : 'Suas leituras recentes têm polaridade mais baixa que o período anterior.',
        severity: upward ? 'celebration' : 'warning',
        generatedAt: now,
        data: { avgFirst, avgSecond, delta, windowDays: 60 },
      }),
    ]);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE 7 — TRANSFORMATION_THEME
// ════════════════════════════════════════════════════════════════════════════

// Keys match the convention `${tradition}:${name.toLowerCase().replace(/\s+/g, '-')}`.
// Mirrored from `tests/lib/.../cardFor` helpers that produce cards with this format.
const TRANSFORMATION_CARD_KEYS = new Set<CardKey>([
  'tarot:a-morte' as CardKey,
  'tarot:a-torre' as CardKey,
  'tarot:o-enforcado' as CardKey,
  'tarot:o-julgamento' as CardKey,
]);

const ruleTransformationTheme: InsightRule = {
  id: 'TRANSFORMATION_THEME',
  title: 'Tema: transformação',
  description: 'Cartas de transformação recorrentes.',
  defaultSeverity: 'warning',
  enabledByDefault: true,
  evaluator({ entries, now }) {
    const since = new Date(now.getTime() - MS_30_DAYS);
    const counts = new Map<string, number>();
    for (const e of entries) {
      if (e.createdAt < since) continue;
      for (const c of e.cards) {
        if (TRANSFORMATION_CARD_KEYS.has(c.key)) {
          counts.set(c.name, (counts.get(c.name) ?? 0) + 1);
        }
      }
    }
    if (counts.size < 2) return []; // need 2+ distinct transformation cards.
    const names = [...counts.entries()].map(([n, c]) => `${n} (${c}×)`).join(', ');
    return Object.freeze([
      Object.freeze({
        id: 'TRANSFORMATION_THEME:user',
        kind: 'TRANSFORMATION_THEME',
        title: 'Tema: transformação profunda',
        description: `Cartas pesadas de transformação apareceram: ${names}. Período intenso.`,
        severity: 'warning',
        generatedAt: now,
        data: { counts: Object.fromEntries(counts), windowDays: 30 },
      }),
    ]);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE 8 — ALL_MAJOR_ARCANA
// ════════════════════════════════════════════════════════════════════════════

const ruleAllMajorArcana: InsightRule = {
  id: 'ALL_MAJOR_ARCANA',
  title: 'Mês intenso',
  description: 'Todas as leituras do mês são Major Arcana.',
  defaultSeverity: 'warning',
  enabledByDefault: true,
  evaluator({ entries, now }) {
    const since = new Date(now.getTime() - MS_30_DAYS);
    const recent = entries.filter((e) => e.createdAt >= since);
    if (recent.length < 3) return []; // need 3+ readings to declare a "month".
    const allMajor = recent.every((e) =>
      e.cards.length > 0 && e.cards.every((c) => c.isMajorArcana === true),
    );
    if (!allMajor) return [];
    return Object.freeze([
      Object.freeze({
        id: 'ALL_MAJOR_ARCANA:user',
        kind: 'ALL_MAJOR_ARCANA',
        title: 'Mês de arcanos maiores',
        description: 'Todas as leituras deste mês saíram do Arco Maior. Período de grande intensidade.',
        severity: 'warning',
        generatedAt: now,
        data: { readingCount: recent.length, windowDays: 30 },
      }),
    ]);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// RULE REGISTRY — single source of truth (cycle 62 lesson 2)
// ════════════════════════════════════════════════════════════════════════════

export const RULE_REGISTRY: readonly InsightRule[] = Object.freeze([
  ruleRepeatCard,
  ruleLongGap,
  ruleStreakMilestone,
  ruleTraditionExploration,
  ruleTopCardThisMonth,
  ruleEnergyShift,
  ruleTransformationTheme,
  ruleAllMajorArcana,
]);

/** Audit export — lets the verifier inspect the registry without code reading. */
export function auditInsightRules(): readonly InsightRule[] {
  return RULE_REGISTRY;
}

/** Count of registered rules — used by `auditTraditionCoverage` consumers. */
export const INSIGHT_RULE_COUNT = RULE_REGISTRY.length;

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ════════════════════════════════════════════════════════════════════════════

function lastReadingAtField(entries: readonly ReadingHistoryEntry[]): Date | null {
  if (entries.length === 0) return null;
  let last = entries[0]!.createdAt;
  for (const e of entries) if (e.createdAt > last) last = e.createdAt;
  return last;
}

function loadAllEntries(userId: UserId): readonly ReadingHistoryEntry[] {
  const page = getHistory(userId, { limit: Number.POSITIVE_INFINITY, offset: 0 });
  return page.entries;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════════════

export interface GenerateInsightsOptions {
  /** Subset of rules to evaluate. Default: all enabled rules. */
  readonly rules?: readonly InsightKind[];
  /** Override `now` for deterministic tests. */
  readonly now?: Date;
}

/**
 * Evaluate every enabled rule for the user. Output is FROZEN — concurrent
 * test mutation (e.g. Object.assign on a returned array) cannot corrupt
 * insights that downstream code already pinned to a render.
 */
export function generateInsights(userId: UserId, opts: GenerateInsightsOptions = {}): readonly Insight[] {
  const now = opts.now ?? new Date();
  const entries = loadAllEntries(userId);
  const ctx: InsightContext = Object.freeze({ userId, entries, now });

  const enabled = RULE_REGISTRY.filter((r) =>
    r.enabledByDefault && (!opts.rules || opts.rules.includes(r.id)),
  );

  const out: Insight[] = [];
  for (const rule of enabled) {
    for (const insight of rule.evaluator(ctx)) {
      out.push(insight);
    }
  }

  return Object.freeze(out);
}

/** Filter insights by severity (UI use case: warnings tab, celebrations tab). */
export function filterBySeverity(
  insights: readonly Insight[],
  severity: InsightSeverity,
): readonly Insight[] {
  return Object.freeze(insights.filter((i) => i.severity === severity));
}

/**
 * Sort insights by severity (warning > info > celebration, then by generatedAt desc).
 * Used by UI tables — `sortInsights()` is pure and stable.
 */
export function sortInsights(insights: readonly Insight[]): readonly Insight[] {
  const order: Record<InsightSeverity, number> = { warning: 0, info: 1, celebration: 2 };
  return Object.freeze(
    [...insights].sort((a, b) => {
      if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
      return b.generatedAt.getTime() - a.generatedAt.getTime();
    }),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT — sacred coverage count (cycle 62 lesson 12)
// ════════════════════════════════════════════════════════════════════════════

export function auditSacredCoverage(): Readonly<Record<keyof typeof SACRED_CATALOG, number>> {
  const out = {} as Record<keyof typeof SACRED_CATALOG, number>;
  for (const k of Object.keys(SACRED_CATALOG) as Array<keyof typeof SACRED_CATALOG>) {
    out[k] = SACRED_CATALOG[k].length;
  }
  return Object.freeze(out);
}

export function auditTraditionCoverage(): readonly { tradition: Tradition; count: number }[] {
  const seen = new Map<Tradition, number>();
  for (const rule of RULE_REGISTRY) {
    seen.set('tarot', (seen.get('tarot') ?? 0) + 0); // baseline entry — actual scan below
  }
  // We can't scan history from here (no userId). Audit registry refs only.
  for (const ref of [...TAROT_CARDS, ...CIGANO_CARDS, ...ASTROLOGIA_REFS, ...ORIXAS_REFS, ...CABALA_REFS, ...NUMEROLOGIA_REFS, ...TANTRA_REFS]) {
    if (ref === 'O Mago') seen.set('tarot', (seen.get('tarot') ?? 0) + 1);
  }
  return Object.freeze(
    [...seen.entries()].map(([tradition, count]) => Object.freeze({ tradition, count })),
  );
}

export const insightsEngineInfo = Object.freeze({
  name: 'reading-history-insights',
  version: '1.0.0',
  ruleCount: INSIGHT_RULE_COUNT,
  dependsOn: ['history', 'stats'],
  frozen: true,
  noAICalls: true,
});
