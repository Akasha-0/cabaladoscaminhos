// Ebó Scheduler - Cabala Dos Caminhos
// Schedules ebó (sacrificial offerings) based on Odu, day of week, and moon phase
// No linting, no formatting

import { getNextMoonPhase, getCurrentMoonPhase } from '../notifications/lua';
import { OduInfo } from '../odus/calculos';

// Preference flags — caller controls which factors matter
export interface EboPreference {
  /** Days of week to consider (0=Sun … 6=Sat). Empty = any day. */
  daysOfWeek?: number[];
  /** Preferred moon phases. Empty = any phase. */
  moonPhases?: PhaseKey[];
  /** Look-ahead window in days (default 90). */
  windowDays?: number;
}

export interface ScheduledEbo {
  date: Date;
  reason: string;
  score: number; // higher = better match
}

type PhaseKey = 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// Moon-phase scores (0 = neutral, positive = favorable, negative = unfavorable)
const PHASE_SCORES: Record<PhaseKey, number> = {
  new: 2,
  waxing_crescent: 1,
  first_quarter: 1,
  waxing_gibbous: 1,
  full: 1,
  waning_gibbous: 0,
  last_quarter: -1,
  waning_crescent: 0,
};

/** Day-of-week score for ebós. */
function dayScore(dayOfWeek: number): number {
  // segunda-feira (1) — aterramento, limpeza, descarrego
  // terca-feira (2) — corte de demandas
  // quarta-feira (3) — verdade
  // quinta-feira (4) — fartura
  // sexta-feira (6) — pureza, paz
  // sabado (5) — amor, intuição
  // domingo (0) — poder pessoal
  const scores: Record<number, number> = {
    1: 2, // segunda: descarrego
    2: 1, // terca: corte
    3: 0,
    4: 1, // quinta: fartura
    5: 1, // sabado: amor/intuição
    6: 2, // sexta: pureza
    0: 1, // domingo: poder pessoal
  };
  return scores[dayOfWeek] ?? 0;
}

/** Phase score from lua.ts MoonPhaseEvent.phase. */
function phaseScore(phase: PhaseKey): number {
  return PHASE_SCORES[phase] ?? 0;
}

/** Check if an Odu's ebós prefer a particular phase. */
function oduPrefersPhase(odu: OduInfo, phase: PhaseKey): boolean {
  if (!odu.orixaRegente) return false;
  const orixa = odu.orixaRegente.toLowerCase();

  // Omolu / Obaluaê / Nanã → minguante (descarrego, cura)
  if (/omolu|obalua|nan/.test(orixa)) {
    return phase === 'last_quarter' || phase === 'waning_crescent';
  }
  // Oxum / Iemanjá / Oxalá → cheia (amor, purificação)
  if (/oxum|iemanj|oxala/.test(orixa)) {
    return phase === 'full' || phase === 'waning_gibbous';
  }
  // Oxóssi / Ogum / Xangô → crescente (caminho, prosperidade)
  if (/oxossi|ogum|xango/.test(orixa)) {
    return phase === 'first_quarter' || phase === 'waxing_crescent' || phase === 'waxing_gibbous';
  }
  // Exu / Logun → nova (proteção, firmeza)
  if (/exu|logun/.test(orixa)) {
    return phase === 'new';
  }
  return false;
}

/**
 * Score a candidate date for a given Odu.
 * Score = dayScore + phaseScore + (oduPhaseMatch ? +2 : 0)
 */
function scoreCandidate(date: Date, odu: OduInfo): number {
  const dow = date.getDay();
  const phase = getCurrentMoonPhase(date).phase as PhaseKey;
  let score = dayScore(dow) + phaseScore(phase);
  if (oduPrefersPhase(odu, phase)) score += 2;
  return score;
}

// Portuguese names for human-readable output
const DOW_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const PHASE_NAMES: Record<PhaseKey, string> = {
  new: 'Lua Nova',
  waxing_crescent: 'Lua Crescente',
  first_quarter: 'Lua Crescente',
  waxing_gibbous: 'Lua Crescente',
  full: 'Lua Cheia',
  waning_gibbous: 'Lua Minguante',
  last_quarter: 'Lua Minguante',
  waning_crescent: 'Lua Minguante',
};

/**
 * Core scheduler — finds the best scheduling windows for an ebó given an Odu.
 *
 * Returns an array of ScheduledEbo sorted by score descending.
 * The first entry is the optimal date; subsequent entries are alternatives.
 */
export function scheduleEbo(
  odu: OduInfo | number,
  preference: EboPreference = {}
): ScheduledEbo[] {
  const oduInfo: OduInfo = typeof odu === 'number'
    ? { numero: odu, nome: '', significado: '', elementos: '', orixaRegente: '', quizilas: [], preceitos: [], ebos: [] }
    : odu;

  const { daysOfWeek = [], moonPhases = [], windowDays = 90 } = preference;
  const candidates: ScheduledEbo[] = [];

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = 0; i <= windowDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(12, 0, 0, 0);

    const dow = date.getDay();
    if (daysOfWeek.length > 0 && !daysOfWeek.includes(dow)) continue;

    const phase = getCurrentMoonPhase(date).phase as PhaseKey;
    if (moonPhases.length > 0 && !moonPhases.includes(phase)) continue;

    const score = scoreCandidate(date, oduInfo);
    candidates.push({
      date,
      reason: `${DOW_NAMES[dow]}, ${PHASE_NAMES[phase]}`,
      score,
    });
  }

  // Sort by score descending, then by date ascending within same score
  candidates.sort((a, b) => b.score - a.score || a.date.getTime() - b.date.getTime());

  return candidates;
}

/**
 * Returns the single best scheduled date for an ebó, or null if no candidates found.
 */
export function getNextScheduledEbo(
  odu: OduInfo | number,
  preference: EboPreference = {}
): ScheduledEbo | null {
  return scheduleEbo(odu, preference)[0] ?? null;
}

/**
 * Returns the next date matching a specific moon phase within the window.
 */
export function getNextMoonPhaseDate(
  phase: 'new' | 'first_quarter' | 'full' | 'last_quarter',
  windowDays = 90
): Date {
  const from = new Date();
  from.setHours(12, 0, 0, 0);
  const event = getNextMoonPhase(phase, from);
  return event.date;
}
