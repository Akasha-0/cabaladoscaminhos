'use client';

import { useMemo } from 'react';
import {
  getDayEnergy,
  DayEnergy,
  NumerologyNumbers,
  MoonPhase,
} from './day-energy';
import {
  getDayOdu,
  DayOduMapping,
} from './day-odu';
import {
  getLunarPhase,
  LunarPhase,
} from './lunar-phase-analyzer';
import {
  getNumberMysticism,
  NumberMysticism,
} from './number-mysticism';
import {
  getFrequencyElement,
  getFrequenciesByElement,
  FrequencyElementMapping,
} from './frequency-element';
import {
  getChakraElement,
  getElementChakras,
  ChakraElementMapping,
} from './chakra-element';
import {
  getChakraPoliedro,
  ChakraPoliedro,
} from './chakra-poliedro';

/**
 * Complete unified spiritual correlation for a specific day.
 * Integrates day-of-week, numerological, lunar, Ifá, frequency,
 * chakra and sacred geometry correlations in a single object.
 */
export interface TodayCorrelation {
  // ─── Day-of-Week Core ────────────────────────────────────────────
  /** English day name (e.g., 'monday') */
  dayName: string;
  /** Portuguese day name (e.g., 'Segunda-feira') */
  dayNamePt: string;
  /** Day index: 0=domingo … 6=sábado */
  dayIndex: number;

  // ─── Orixá ──────────────────────────────────────────────────────
  /** Primary Orixá for the day */
  orixa: string;
  /** All Orixás associated with the day */
  orixas: string[];

  // ─── Chakra ──────────────────────────────────────────────────────
  /** Primary chakra for the day (e.g., '3º Plexo Solar') */
  chakra: string;
  /** Sanskrit chakra name (e.g., 'Manipura') */
  chakraSanskrit: string;
  /** All chakras associated with the day */
  chakras: string[];
  /** Chakra-element mapping for the primary chakra */
  chakraElement: ChakraElementMapping | null;

  // ─── Planet & Element ───────────────────────────────────────────
  /** Ruling planet(s) */
  planeta: string;
  planetas: string[];
  /** Primary element for the day */
  elemento: string;
  elementEmoji: string;
  /** Kabbalistic sefirah */
  sefirah: string;
  sephirot: string[];

  // ─── Colors ──────────────────────────────────────────────────────
  primaryColor: string;
  secondaryColor: string;

  // ─── Numerology ──────────────────────────────────────────────────
  /** Tantric + Cabalistic numbers for the day */
  numerologia: NumerologyNumbers;
  /** Full mysticism data for the tantric number (1-13) */
  numeroMisticismo: NumberMysticism;
  /** All Solfeggio frequencies associated with the day's element */
  frequenciasElemento: FrequencyElementMapping[];
  /** Primary Solfeggio frequency for the day */
  frequenciaPrimaria: FrequencyElementMapping | null;

  // ─── Odu Ifá ─────────────────────────────────────────────────────
  /** Full Odu Ifá mapping for the day */
  odu: DayOduMapping | null;
  /** Primary Odu number (1-16) */
  oduNumero: number | null;
  /** Primary Odu name */
  oduNome: string | null;

  // ─── Lunar ──────────────────────────────────────────────────────
  /** Lunar phase for the current date */
  lua: LunarPhase;

  // ─── Sacred Geometry ─────────────────────────────────────────────
  /** Platonic solid associated with the primary chakra */
  poliedro: ChakraPoliedro | null;

  // ─── Ritual ──────────────────────────────────────────────────────
  /** Spiritual action and ritual purpose */
  atuacaoRitual: string;
  /** Mystical meaning of the day */
  mystery: string;
}

/** Maps day index (0=domingo … 6=sábado) to the getDayEnergy index (0=segunda).
 *  getDayEnergy is indexed Monday=0 … Sunday=6.
 *  Sunday (dayIndex 0) must wrap to energyIndex 6.
 *  Formula: energyIndex = (dayIndex + 6) % 7
 */
const DAY_INDEX_MAP: Record<number, number> = {
  0: 6, // domingo  → getDayEnergy index 6 (Domingo)
  1: 0, // segunda  → getDayEnergy index 0 (Segunda-feira)
  2: 1, // terça    → getDayEnergy index 1 (Terça-feira)
  3: 2, // quarta   → getDayEnergy index 2 (Quarta-feira)
  4: 3, // quinta   → getDayEnergy index 3 (Quinta-feira)
  5: 4, // sexta    → getDayEnergy index 4 (Sexta-feira)
  6: 5, // sábado   → getDayEnergy index 5 (Sábado)
};

const DAY_KEY_MAP: Record<number, string> = {
  0: 'domingo',
  1: 'segunda',
  2: 'terca',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
  6: 'sabado',
};

const DAY_NAME_PT_MAP: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

const DAY_ORIXA_MAP: Record<number, string> = {
  0: 'Xangô (Solar)',
  1: 'Omolu / Obaluaê',
  2: 'Iansã / Oyá',
  3: 'Xangô',
  4: 'Oxóssi',
  5: 'Oxalá',
  6: 'Oxum / Iemanjá',
};

const DAY_ELEMENT_MAP: Record<number, string> = {
  0: 'Fogo',
  1: 'Terra',
  2: 'Água',
  3: 'Fogo',
  4: 'Ar',
  5: 'Éter',
  6: 'Água',
};

const DAY_ELEMENT_EMOJI_MAP: Record<number, string> = {
  0: '🔥',
  1: '🌍',
  2: '💧',
  3: '🔥',
  4: '💨',
  5: '✨',
  6: '💧',
};

const DAY_COLOR_PRIMARY_MAP: Record<number, string> = {
  0: '#eab308',
  1: '#dc2626',
  2: '#ea580c',
  3: '#eab308',
  4: '#22c55e',
  5: '#ffffff',
  6: '#ec4899',
};

const DAY_COLOR_SECONDARY_MAP: Record<number, string> = {
  0: '#f59e0b',
  1: '#ffffff',
  2: '#dc2626',
  3: '#000000',
  4: '#000000',
  5: '#9333ea',
  6: '#1e3a5f',
};

const DAY_SEFIRAH_MAP: Record<number, string> = {
  0: 'Tiphereth',
  1: 'Malkuth / Yesod',
  2: 'Geburah',
  3: 'Hod',
  4: 'Chesed',
  5: 'Kether',
  6: 'Binah / Tiphereth',
};

const DAY_MYSTERY_MAP: Record<number, string> = {
  0: 'Recarregar energia vital, poder pessoal e propósito de vida.',
  1: 'Aterramento, limpeza espiritual, transmutação e respeito às almas.',
  2: 'Força, movimento, coragem, corte de demandas e quebra de energias.',
  3: 'Justiça divina, estudos, verdade e razão.',
  4: 'Fartura, conhecimento, expansão e cura através das matas.',
  5: 'Paz, pureza, silêncio, gratidão e conexão direta com o Divino.',
  6: 'Amor incondicional, intuição, fertilidade e águas geradoras.',
};

/**
 * Computes the full spiritual correlation for a given date.
 * When no date is supplied, uses the current system date.
 *
 * @param date - Optional date to compute correlations for
 * @returns TodayCorrelation with all spiritual dimensions unified
 */
export function getTodayCorrelation(date: Date = new Date()): TodayCorrelation {
  // Day index: 0=domingo (Sunday), 1=segunda, …, 6=sábado
  const dayIndex = date.getDay();
  const dayKey = DAY_KEY_MAP[dayIndex];
  const dayNamePt = DAY_NAME_PT_MAP[dayIndex];

  // getDayEnergy uses Monday=0 … Sunday=6
  const energyIndex = DAY_INDEX_MAP[dayIndex];
  const dayEnergy: DayEnergy = getDayEnergy(energyIndex);

  const elemento = DAY_ELEMENT_MAP[dayIndex];
  const chakraName = dayEnergy.chakras[0]; // e.g. "3º Plexo Solar (Manipura)"
  const chakraElementData = getChakraElement(chakraName);
  const chakraSanskrit = chakraElementData?.chakra ?? chakraName;
  const poliedro = getChakraPoliedro(chakraSanskrit);

  // Odu Ifá for the day
  const oduMapping = getDayOdu(dayNamePt);

  // Numerology — tantric number from day energy
  const tantricNumber = dayEnergy.numeros.tantric.value;
  let numeroMisticismo: NumberMysticism;
  try {
    numeroMisticismo = getNumberMysticism(tantricNumber);
  } catch {
    // Fallback for out-of-range numbers
    numeroMisticismo = getNumberMysticism(1);
  }

  // Solfeggio frequencies for the day's element
  const frequenciasElemento = getFrequenciesByElement(elemento);
  const frequenciaPrimaria = getFrequencyElement(frequenciasElemento[0]?.frequencia ?? 528) ?? null;

  // Lunar phase for today
  const lua = getLunarPhase(date);

  return {
    // ─── Day-of-Week Core ────────────────────────────────────────
    dayName: dayKey,
    dayNamePt,
    dayIndex,

    // ─── Orixá ──────────────────────────────────────────────────
    orixa: DAY_ORIXA_MAP[dayIndex],
    orixas: dayEnergy.orixas,

    // ─── Chakra ─────────────────────────────────────────────────
    chakra: chakraName,
    chakraSanskrit,
    chakras: dayEnergy.chakras,
    chakraElement: chakraElementData,

    // ─── Planet & Element ────────────────────────────────────────
    planeta: dayEnergy.planetas[0],
    planetas: dayEnergy.planetas,
    elemento,
    elementEmoji: DAY_ELEMENT_EMOJI_MAP[dayIndex],
    sefirah: DAY_SEFIRAH_MAP[dayIndex],
    sephirot: dayEnergy.sephirot,

    // ─── Colors ─────────────────────────────────────────────────
    primaryColor: DAY_COLOR_PRIMARY_MAP[dayIndex],
    secondaryColor: DAY_COLOR_SECONDARY_MAP[dayIndex],

    // ─── Numerology ─────────────────────────────────────────────
    numerologia: dayEnergy.numeros,
    numeroMisticismo,
    frequenciasElemento,
    frequenciaPrimaria,

    // ─── Odu Ifá ────────────────────────────────────────────────
    odu: oduMapping,
    oduNumero: oduMapping?.odu_principal.numero ?? null,
    oduNome: oduMapping?.odu_principal.nome ?? null,

    // ─── Lunar ──────────────────────────────────────────────────
    lua,

    // ─── Sacred Geometry ────────────────────────────────────────
    poliedro: poliedro ?? null,

    // ─── Ritual ─────────────────────────────────────────────────
    atuacaoRitual: dayEnergy.atuacaoRitual,
    mystery: DAY_MYSTERY_MAP[dayIndex],
  };
}

/**
 * React hook that returns the full spiritual correlation for today.
 * Recomputes whenever the day changes.
 *
 * @returns TodayCorrelation unified spiritual data for today
 *
 * @example
 * const correlation = useTodayCorrelation();
 * console.log(correlation.orixa);       // e.g. "Xangô"
 * console.log(correlation.lua.phase);  // e.g. "full"
 * console.log(correlation.poliedro);   // e.g. { poliedro: "Tetraedro", ... }
 */
export function useTodayCorrelation(): TodayCorrelation {
  // Re-evaluate on each render so the hook always reflects the current day
  return useMemo(() => getTodayCorrelation(), []);
}

/**
 * Returns the spiritual correlation for a specific day of the week.
 * Useful for weekly calendar views or scheduled content.
 *
 * @param dayIndex - 0=domingo, 1=segunda, …, 6=sábado
 * @returns TodayCorrelation for that day of the week
 */
export function getCorrelationByDayIndex(dayIndex: number): TodayCorrelation {
  if (dayIndex < 0 || dayIndex > 6) {
    throw new RangeError(`getCorrelationByDayIndex: dayIndex must be 0-6, got ${dayIndex}`);
  }
  // Use a fictional date that falls on the target day of week.
  // Use local-date constructor (year, monthIndex, day) so the date is stable
  // regardless of the system timezone offset.
  const seed = new Date(2026, 5, 7); // June 7, 2026 = Sunday (dayIndex 0 in local time)
  const offset = dayIndex - seed.getDay();
  const targetDate = new Date(2026, 5, 7 + offset);
  return getTodayCorrelation(targetDate);
}

/**
 * Returns correlations for all seven days of the week.
 * Useful for building weekly spiritual calendars.
 *
 * @returns Array of 7 TodayCorrelation objects (domingo through sábado)
 */
export function getWeekCorrelations(): TodayCorrelation[] {
  return Array.from({ length: 7 }, (_, i) => getCorrelationByDayIndex(i));
}
