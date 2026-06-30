/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ENERGY + MOOD + SPIRITUAL-STATE DAILY CHECK-IN — Mood taxonomy + analysis
 *  Cabala dos Caminhos — wave 69, 2026-06-30
 *
 *  Pure analytics over the check-in store from `checkin.ts`.
 *
 *  Provides:
 *   - moodFrequency  — distribution (count per mood) over a window
 *   - dominantMood   — most-frequent mood in the window
 *   - moodCoOccurrence — Pairs of moods that occur on the same date
 *   - moodToSacredRef — 1..2 sacred references per mood from the project's
 *     7-tradition taxonomy (Cigano, Orixás, Astrologia, Cabala, Numerologia,
 *     Tantra, Tarot). No invented practices.
 *
 *  Cross-taxonomy alignment: each mood maps to a recurring emotional-arc
 *  archetype documented in Cabala dos Caminhos' content library.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  CHECKINS,
  type Checkin,
  type Mood,
  type UserId,
  MOODS,
} from './checkin.ts';

// ───────────────────────────────────────────────────────────────────────────
//  Mood frequency distribution
// ───────────────────────────────────────────────────────────────────────────

/** Mood → count of check-ins in window. Always contains all 10 moods (0 for unused). */
export type MoodDistribution = Readonly<Record<Mood, number>>;

/**
 * Compute the mood frequency distribution for `userId` over the last
 * `windowDays` check-ins. `windowDays` defaults to 30.
 *
 * Result includes ALL 10 moods even if some have count=0 — makes the
 * shape stable for UI rendering and avoids "missing key" bugs.
 */
export function moodFrequency(userId: UserId, windowDays = 30): MoodDistribution {
  const window = Math.max(1, Math.min(3650, windowDays));
  const counts: Record<Mood, number> = MOODS.reduce(
    (acc, m) => {
      acc[m] = 0;
      return acc;
    },
    {} as Record<Mood, number>,
  );

  const items = Array.from(CHECKINS.values())
    .filter((c) => c.userId === userId)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0))
    .slice(0, window);

  for (const c of items) counts[c.mood]++;

  return Object.freeze(counts) as MoodDistribution;
}

// ───────────────────────────────────────────────────────────────────────────
//  Dominant mood
// ───────────────────────────────────────────────────────────────────────────

export interface DominantMoodResult {
  mood: Mood | null;
  count: number;
  /** Share of total check-ins in the window (0..1) */
  share: number;
  /** Number of distinct moods that tied at `count` */
  tiedWith: number;
}

/**
 * Most-frequent mood in the window. If all counts are 0 → null.
 * Stable tie-break: lexicographic order (so tests are deterministic).
 */
export function dominantMood(userId: UserId, windowDays = 30): DominantMoodResult {
  const dist = moodFrequency(userId, windowDays);
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return { mood: null, count: 0, share: 0, tiedWith: 0 };
  }
  let topCount = -1;
  let topMood: Mood | null = null;
  for (const m of MOODS) {
    if (dist[m] > topCount) {
      topCount = dist[m]!;
      topMood = m;
    }
  }
  // tie count
  const tiedWith = Object.values(dist).filter((c) => c === topCount).length;
  return {
    mood: topMood,
    count: topCount,
    share: round4(topCount / total),
    tiedWith,
  };
}

// ───────────────────────────────────────────────────────────────────────────
//  Co-occurrence (same-day pairs)
// ───────────────────────────────────────────────────────────────────────────

export interface MoodCoOccurrence {
  /** Mood A (lex < mood B) */
  moodA: Mood;
  /** Mood B */
  moodB: Mood;
  /** Times the pair occurs (always 0 here, but kept for API symmetry) */
  count: number;
}

/**
 * Co-occurrence analysis — for each (moodA, moodB) pair with moodA < moodB,
 * report whether they co-occurred on any check-in (always within the engine:
 * one check-in has one mood, so all pairs have count 0 OR 1).
 *
 * Useful for the UI to populate "you've also felt X when you felt Y"
 * suggestions — driven by check-ins on the SAME calendar date.
 */
export function moodCoOccurrence(userId: UserId): readonly MoodCoOccurrence[] {
  // Each check-in carries ONE mood, but a user can record a check-in for
  // multiple domains (e.g. a smoke mock might inject multi-mood records
  // for testing). For production realism, group by dateKey and report
  // all intra-day mood pairs.
  const byDate = new Map<string, Set<Mood>>();
  for (const c of CHECKINS.values()) {
    if (c.userId !== userId) continue;
    const set = byDate.get(c.dateKey) ?? new Set<Mood>();
    set.add(c.mood);
    byDate.set(c.dateKey, set);
  }

  const pairCounts = new Map<string, number>();
  for (const set of byDate.values()) {
    const list = Array.from(set).sort();
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        const k = `${a}|${b}`;
        pairCounts.set(k, (pairCounts.get(k) ?? 0) + 1);
      }
    }
  }

  return Array.from(pairCounts.entries())
    .map(([k, count]) => {
      const [moodA, moodB] = k.split('|') as [Mood, Mood];
      return { moodA, moodB, count };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (a.moodA !== b.moodA) return a.moodA < b.moodA ? -1 : 1;
      return a.moodB < b.moodB ? -1 : 1;
    });
}

// ───────────────────────────────────────────────────────────────────────────
//  Sacred references — per mood
// ───────────────────────────────────────────────────────────────────────────

export interface SacredRef {
  tradition: string;
  symbol: string;
  description: string;
}

/**
 * Each mood maps to 1..2 sacred references drawn from the project's
 * 7-tradition taxonomy. Mapping is grounded in:
 *   - cigarrosciganos/lenormand-cards.ts (36 cartas)
 *   - constants/odus.ts (16 Odus + Orixás regentes)
 *   - tarot majors + astrology houses (cross-referenced via UI content)
 *
 * Returns a freshly built array on every call — caller can mutate freely.
 */
export function moodToSacredRef(mood: Mood): readonly SacredRef[] {
  const table: Readonly<Record<Mood, readonly SacredRef[]>> = {
    calm: [
      {
        tradition: 'Cigano',
        symbol: 'A Âncora (Carta 35)',
        description: 'Estabilidade, permanência, segurança emocional',
      },
      {
        tradition: 'Tantra',
        symbol: 'Chakra Anahata (4º)',
        description: 'Equilíbrio cardíaco, respiração lenta, presença',
      },
    ],
    anxious: [
      {
        tradition: 'Orixás',
        symbol: 'Orixá Ogum',
        description: 'Abertura de caminhos, firmeza diante do medo',
      },
      {
        tradition: 'Cigano',
        symbol: 'O Rato (Carta 23)',
        description: 'Desgaste mental, roubo de energia — sinaliza limpeza',
      },
    ],
    joyful: [
      {
        tradition: 'Cigano',
        symbol: 'O Sol (Carta 31)',
        description: 'Sucesso máximo, vitalidade, clareza irradiante',
      },
      {
        tradition: 'Tarot',
        symbol: 'O Sol (XIX)',
        description: 'Alegria autêntica, criança interior, iluminação',
      },
    ],
    reflective: [
      {
        tradition: 'Cigano',
        symbol: 'A Lua (Carta 32)',
        description: 'Emoções profundas, reconhecimento, mistério',
      },
      {
        tradition: 'Cabala',
        symbol: 'Sephirah Binah (3)',
        description: 'Compreensão profunda, introspecção, mãe divina',
      },
    ],
    scattered: [
      {
        tradition: 'Cigano',
        symbol: 'As Nuvens (Carta 6)',
        description: 'Confusão, nebulosidade mental, dispersão',
      },
      {
        tradition: 'Numerologia',
        symbol: 'Caminho de Vida 7 + dia 4',
        description: 'Cabeça sem ancora — combina analítico e místico',
      },
    ],
    centered: [
      {
        tradition: 'Orixás',
        symbol: 'Orixá Oxalá',
        description: 'Pureza, paz, ordem primordial',
      },
      {
        tradition: 'Cigano',
        symbol: 'A Estrela (Carta 16)',
        description: 'Guia espiritual, esperança, brilho interior',
      },
      {
        tradition: 'Astrologia',
        symbol: 'Sol em Leão (MC aspecto trígono)',
        description: 'Vitalidade estável, presença, eixo Leão-Aquário equilibrado',
      },
    ],
    grieving: [
      {
        tradition: 'Cigano',
        symbol: 'O Caixão (Carta 8)',
        description: 'Fim, encerramento de ciclo, transformação',
      },
      {
        tradition: 'Orixás',
        symbol: 'Orixá Obaluaiê',
        description: 'Senhor da cura, da sombra e da transmutação do luto',
      },
      {
        tradition: 'Tarot',
        symbol: 'A Morte (XIII)',
        description: 'Arco de transformação — não fim, mas mutação',
      },
    ],
    inspired: [
      {
        tradition: 'Tarot',
        symbol: 'O Louco (0) + O Mago (I)',
        description: 'Salto criativo, abertura ao novo, sopro iniciático',
      },
      {
        tradition: 'Orixás',
        symbol: 'Orixá Oxum',
        description: 'Inspiração, beleza, intuição criativa',
      },
    ],
    neutral: [
      {
        tradition: 'Cabala',
        symbol: 'Sephirah Tiphereth (6)',
        description: 'Equilíbrio, beleza, centro harmonizador',
      },
      {
        tradition: 'Cigano',
        symbol: 'A Casa (Carta 4)',
        description: 'Estabilidade cotidiana, presença simples',
      },
    ],
    restless: [
      {
        tradition: 'Orixás',
        symbol: 'Orixá Oyá',
        description: 'Ventos de mudança, transformadora do caos',
      },
      {
        tradition: 'Cigano',
        symbol: 'O Chicote (Carta 11)',
        description: 'Padrões repetitivos a serem cortados, inquietação',
      },
      {
        tradition: 'Astrologia',
        symbol: 'Mercúrio retrógrado',
        description: 'Inquietação mental, revisão interna, paciência',
      },
    ],
  };
  return table[mood];
}

/**
 * Validate that the catalog covers ALL 10 moods. Fails loudly if a Mood
 * variant is added without an entry. Called at engine boundary + smoke.
 */
export function assertMoodSacredRefsComplete(): void {
  for (const m of MOODS) {
    const refs = moodToSacredRef(m);
    if (refs.length < 1 || refs.length > 3) {
      throw new Error(`Mood ${m} has ${refs.length} sacred refs (need 1..3)`);
    }
    for (const r of refs) {
      if (!r.tradition || !r.symbol || !r.description) {
        throw new Error(`Mood ${m} has incomplete sacred ref: ${JSON.stringify(r)}`);
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────────────────────

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

// Re-export so consumers don't need a deep import path.
export type { Mood, UserId, Checkin };