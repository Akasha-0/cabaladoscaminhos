/**
 * daily-reflection — Public Barrel
 *
 * Consumers should import from here, never from individual files.
 *
 * Layers:
 *   - prompts (210-prompt data layer)
 *   - daily-reflection (rotation + getDailyReflection)
 *   - history-store (in-memory user history + streak)
 */

// Types & re-exports from prompts
export {
  TRADICOES,
  TRADICAO_LABELS,
  PROMPT_TAGS,
  PROMPTS_BY_TAG,
  PROMPTS_BY_TRADICAO,
  PROMPTS_BY_ID,
  DAILY_PROMPTS,
  ALL_PROMPT_IDS,
  getPromptById,
  promptsForTradicao,
  promptsForTag,
  countPromptsForTradicao,
  totalPromptCount,
} from './prompts.ts';

export type {
  LocaleKey,
  Tradicao,
  PromptTag,
  VoicePreset,
  LocalizedText,
  LocalizedAction,
  DailyPrompt,
} from './prompts-t/types.ts';

// Engine types & functions
export {
  type DailyReflection,
  type PromptId,
  type DateIso,
  type VoicePreset as DailyVoicePreset,
  type PromptTagPublic,
  type SuggestedActionModality,
  getDailyReflection,
  getReflectionByPromptId,
  normalizeDate,
  normalizeLocale,
  rotationIndex,
  isTradition,
  nextDayUtc,
} from './daily-reflection.ts';

// History types & adapter
export {
  type HistoryAdapter,
  type HistoryRecord,
  type UserId,
  type RecordId,
  createInMemoryHistoryAdapter,
  shiftDate,
  diffDays,
} from './history-store.ts';
