/**
 * daily-reflection/prompts.ts — single entry point for the 210-prompt pool.
 *
 * Cycle 84 lesson: per-tradição files keep individual files manageable;
 * this barrel re-exports everything + freezes the merged record.
 *
 * 30 prompts × 7 tradições = 210 total.
 * Source of truth: 7 per-tradição tables under ./prompts-t/
 *
 * Public surface:
 *   - DAILY_PROMPTS: ReadonlyArray<DailyPrompt> — 210 deep-frozen entries
 *   - PROMPTS_BY_TRADICAO: Readonly<Record<Tradicao, ReadonlyArray<DailyPrompt>>>
 *   - PROMPTS_BY_TAG: Readonly<Record<PromptTag, ReadonlyArray<DailyPrompt>>>
 *   - getPromptById(id) — O(1) lookup
 *   - promptsForTradicao(t) — 30-entry array
 *   - promptsForTag(t) — 30-entry array (4-5 per tradição)
 *   - countPromptsForTradicao(t) — invariant checker
 *   - ALL_PROMPT_IDS — set of all 210 ids
 */

import {
  TRADICOES,
  TRADICAO_LABELS,
  PROMPT_TAGS,
  type Tradicao,
  type PromptTag,
  type DailyPrompt,
  type LocaleKey,
  type VoicePreset,
  type LocalizedText,
  type LocalizedAction,
} from './prompts-t/types.ts';

import { CIGANO_PROMPTS } from './prompts-t/cigano.ts';
import { CANDOMBLE_PROMPTS } from './prompts-t/candomble.ts';
import { UMBANDA_PROMPTS } from './prompts-t/umbanda.ts';
import { IFA_PROMPTS } from './prompts-t/ifa.ts';
import { CABALA_PROMPTS } from './prompts-t/cabala.ts';
import { ASTROLOGIA_PROMPTS } from './prompts-t/astrologia.ts';
import { TANTRA_PROMPTS } from './prompts-t/tantra.ts';

// ---------------------------------------------------------------------------
// Aggregation by tradição
// ---------------------------------------------------------------------------

const _BY_TRADICAO: Readonly<Record<Tradicao, ReadonlyArray<DailyPrompt>>> =
  Object.freeze({
    cigano: CIGANO_PROMPTS,
    candomble: CANDOMBLE_PROMPTS,
    umbanda: UMBANDA_PROMPTS,
    ifa: IFA_PROMPTS,
    cabala: CABALA_PROMPTS,
    astrologia: ASTROLOGIA_PROMPTS,
    tantra: TANTRA_PROMPTS,
  });

export const PROMPTS_BY_TRADICAO = _BY_TRADICAO;

// ---------------------------------------------------------------------------
// Aggregation by tag — built at module load, frozen
// ---------------------------------------------------------------------------

const _PROMPTS_BY_TAG_BUILD: Readonly<Record<PromptTag, ReadonlyArray<DailyPrompt>>> =
  Object.freeze(
    (['gratidao', 'sombra', 'intencao', 'oracao', 'estudo', 'acao', 'descanso'] as const).reduce(
      (acc, tag) => {
        const matches: DailyPrompt[] = [];
        for (const t of TRADICOES) {
          for (const p of _BY_TRADICAO[t]) {
            if (p.tag === tag) matches.push(p);
          }
        }
        acc[tag] = Object.freeze(matches);
        return acc;
      },
      {} as Record<PromptTag, ReadonlyArray<DailyPrompt>>,
    ),
  );

export const PROMPTS_BY_TAG = _PROMPTS_BY_TAG_BUILD;

// ---------------------------------------------------------------------------
// Flat list (210 entries) — frozen array
// ---------------------------------------------------------------------------

const _FLAT: ReadonlyArray<DailyPrompt> = Object.freeze(
  TRADICOES.flatMap((t) => [..._BY_TRADICAO[t]]),
);

export const DAILY_PROMPTS = _FLAT;

// ---------------------------------------------------------------------------
// Index by ID — O(1) lookup map (frozen)
// ---------------------------------------------------------------------------

const _BY_ID_BUILD: ReadonlyMap<string, DailyPrompt> = new Map(
  _FLAT.map((p) => [p.id, p] as const),
);

export const PROMPTS_BY_ID = _BY_ID_BUILD;

// ---------------------------------------------------------------------------
// Set of all 210 ids — for spec coverage tests
// ---------------------------------------------------------------------------

const _ALL_IDS_BUILD: ReadonlySet<string> = new Set(_FLAT.map((p) => p.id));

export const ALL_PROMPT_IDS = _ALL_IDS_BUILD;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getPromptById(id: string): DailyPrompt | undefined {
  return _BY_ID_BUILD.get(id);
}

export function promptsForTradicao(t: Tradicao): ReadonlyArray<DailyPrompt> {
  return _BY_TRADICAO[t];
}

export function promptsForTag(tag: PromptTag): ReadonlyArray<DailyPrompt> {
  return _PROMPTS_BY_TAG_BUILD[tag];
}

export function countPromptsForTradicao(t: Tradicao): number {
  return _BY_TRADICAO[t].length;
}

export function totalPromptCount(): number {
  return _FLAT.length;
}

// Re-export shared taxonomy so consumers can import from this barrel too.
export { TRADICOES, TRADICAO_LABELS, PROMPT_TAGS };
export type { Tradicao, PromptTag, LocaleKey, VoicePreset, LocalizedText, LocalizedAction, DailyPrompt };
