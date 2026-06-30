/**
 * daily-reflection.ts — pure data engine for "Prompt of the Day".
 *
 * Public API:
 *   - getDailyReflection(tradition, date, locale) → DailyReflection
 *   - normalizeDate(d) → 'YYYY-MM-DD' canonical form
 *   - isTradition(t) — type guard
 *   - isLocaleTag(s) — type guard
 *
 * Rotation:
 *   hash(tradition + '|' + dateISO) modulo 30 → stable per-day index.
 *   Hash is pure JS FNV-1a + base36 — no crypto, no node deps.
 *
 * Pure functions only — no I/O, no module-level mutable state.
 *
 * Cycle 84 lesson: keep `date` ISO canonical (YYYY-MM-DD) so two users
 * in different timezones but the same UTC date always see the same prompt.
 */

import {
  promptsForTradicao,
  getPromptById,
} from './prompts.ts';
import type { Tradicao } from './prompts.ts';
import {
  TRADICOES,
  type LocaleKey,
  voicePresetForTradicao,
} from './prompts-t/types.ts';

// ---------------------------------------------------------------------------
// Branded types
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type PromptId = Brand<string, 'PromptId'>;
export type DateIso = Brand<string, 'DateIso'>;
export type VoicePreset = Brand<string, 'VoicePreset'>;

// ---------------------------------------------------------------------------
// Reflection record (returned by getDailyReflection)
// ---------------------------------------------------------------------------

export interface DailyReflection {
  readonly promptId: PromptId;
  readonly tradicao: Tradicao;
  readonly tag: PromptTagPublic;
  readonly text: string;            // localized to requested locale
  readonly suggestedAction: string; // localized
  readonly suggestedActionModality: SuggestedActionModality;
  readonly audioVoicePreset: VoicePreset;
  /** ISO 8601 instant at which this reflection expires (next day 00:00 UTC). */
  readonly expiresAt: string;
  /** Date used for selection, in 'YYYY-MM-DD' form. */
  readonly date: DateIso;
}

export type PromptTagPublic =
  | 'gratidao'
  | 'sombra'
  | 'intencao'
  | 'oracao'
  | 'estudo'
  | 'acao'
  | 'descanso';

export type SuggestedActionModality =
  | 'movement'
  | 'stillness'
  | 'vocal'
  | 'ritual'
  | 'study';

// ---------------------------------------------------------------------------
// Date normalization
// ---------------------------------------------------------------------------

/**
 * Coerce any Date-like input (Date object, ISO string, or 'YYYY-MM-DD' string)
 * to canonical 'YYYY-MM-DD' form (UTC). Pure: returns input unchanged if
 * already canonical.
 */
export function normalizeDate(d: Date | string): DateIso {
  if (typeof d === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      // Validate that it parses (e.g. 2026-02-31 is invalid)
      const parsed = new Date(d + 'T00:00:00Z');
      const y = parsed.getUTCFullYear();
      const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      const day = String(parsed.getUTCDate()).padStart(2, '0');
      const canonical = `${y}-${m}-${day}`;
      if (canonical !== d) {
        // Input was malformed (e.g. 2026-02-31 collapsed). Return canonical.
        return canonical as DateIso;
      }
      return d as DateIso;
    }
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`normalizeDate: invalid input "${d}"`);
    }
    const y = parsed.getUTCFullYear();
    const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}` as DateIso;
  }
  // Date object
  if (Number.isNaN(d.getTime())) {
    throw new Error('normalizeDate: invalid Date object');
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}` as DateIso;
}

// ---------------------------------------------------------------------------
// Locale normalization
// ---------------------------------------------------------------------------

const LOCALE_ALIASES: Readonly<Record<string, LocaleKey>> = Object.freeze({
  'pt-br': 'pt-BR',
  pt: 'pt-BR',
  'pt_br': 'pt-BR',
  'pt-br-br': 'pt-BR',
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  'en-au': 'en',
  es: 'es',
  'es-es': 'es',
  'es-mx': 'es',
  'es-ar': 'es',
});

export function normalizeLocale(input: string): LocaleKey {
  const lower = input.trim().toLowerCase();
  if (lower in LOCALE_ALIASES) return LOCALE_ALIASES[lower]!;
  // Tolerant prefix match
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('es')) return 'es';
  // Default fallback per translation-tooling convention
  return 'pt-BR';
}

// ---------------------------------------------------------------------------
// Tradição type guard
// ---------------------------------------------------------------------------

const TRADICAO_SET: ReadonlySet<string> = new Set<string>(TRADICOES);

export function isTradition(s: string): s is Tradicao {
  return TRADICAO_SET.has(s);
}

// ---------------------------------------------------------------------------
// Hash: FNV-1a (32-bit) — pure JS, no crypto
// ---------------------------------------------------------------------------

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5; // FNV-1a 32-bit offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // Multiply by FNV-1a 32-bit prime, modulo 2^32 via Math.imul
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0; // Force unsigned
}

/**
 * Deterministic hash → index in [0, 30).
 * Same (tradition, date) ALWAYS returns the same index.
 * Different (tradition, date) pairs have statistically uniform distribution.
 */
export function rotationIndex(tradition: Tradicao, dateIso: string): number {
  const key = `${tradition}|${dateIso}`;
  return fnv1a32(key) % 30;
}

// ---------------------------------------------------------------------------
// Public: getDailyReflection
// ---------------------------------------------------------------------------

/**
 * Returns today's reflection for the given tradição + locale.
 * Pure: same inputs → same output, always.
 *
 * @param tradition - one of the 7 supported tradições
 * @param date     - Date object, ISO string, or 'YYYY-MM-DD' string
 * @param locale   - 'pt-BR' | 'en' | 'es' (or tolerant alias)
 */
export function getDailyReflection(
  tradition: Tradicao,
  date: Date | string,
  locale: string,
): DailyReflection {
  if (!isTradition(tradition)) {
    throw new Error(`getDailyReflection: unknown tradition "${tradition}"`);
  }
  const dateIso = normalizeDate(date);
  const normLocale = normalizeLocale(locale);

  const prompts = promptsForTradicao(tradition);
  const idx = rotationIndex(tradition, dateIso);
  const prompt = prompts[idx];
  if (prompt === undefined) {
    // Should never happen if pool has 30 entries; defensive throw
    throw new Error(
      `getDailyReflection: rotation produced undefined (tradition=${tradition}, idx=${idx})`,
    );
  }

  // Localize
  const text = prompt.text[normLocale];
  const actionText = prompt.suggestedAction[normLocale];
  const actionModality = prompt.suggestedAction.modality;

  // Expires at next day 00:00 UTC
  const expiresAt = nextDayUtc(dateIso);

  // Voice preset
  const voiceRaw = voicePresetForTradicao(tradition, normLocale);
  const voicePreset = voiceRaw as VoicePreset;

  return {
    promptId: prompt.id as PromptId,
    tradicao: prompt.tradicao,
    tag: prompt.tag as PromptTagPublic,
    text,
    suggestedAction: actionText,
    suggestedActionModality: actionModality,
    audioVoicePreset: voicePreset,
    expiresAt,
    date: dateIso,
  };
}

/**
 * Compute the ISO 8601 instant when a given 'YYYY-MM-DD' expires in the
 * daily rotation (next day 00:00:00.000Z).
 */
export function nextDayUtc(dateIso: string): string {
  const [yStr, mStr, dStr] = dateIso.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error(`nextDayUtc: invalid dateIso "${dateIso}"`);
  }
  // Date constructor: month is 0-indexed in JS
  const next = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
  return next.toISOString();
}

// ---------------------------------------------------------------------------
// Auxiliary: lookup by id (useful for history "what was my prompt on day X")
// ---------------------------------------------------------------------------

export function getReflectionByPromptId(
  promptId: string,
  locale: string,
): Omit<DailyReflection, 'date' | 'expiresAt'> | undefined {
  const prompt = getPromptById(promptId);
  if (!prompt) return undefined;
  const normLocale = normalizeLocale(locale);
  return {
    promptId: prompt.id as PromptId,
    tradicao: prompt.tradicao,
    tag: prompt.tag as PromptTagPublic,
    text: prompt.text[normLocale],
    suggestedAction: prompt.suggestedAction[normLocale],
    suggestedActionModality: prompt.suggestedAction.modality,
    audioVoicePreset: voicePresetForTradicao(prompt.tradicao, normLocale) as VoicePreset,
  };
}
