/**
 * prompts-t/types.ts — shared types + helpers for per-tradição prompt tables.
 */

export type LocaleKey = 'pt-BR' | 'en' | 'es';
export const LOCALES: ReadonlyArray<LocaleKey> = ['pt-BR', 'en', 'es'] as const;

export const TRADICOES = [
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
] as const;
export type Tradicao = (typeof TRADICOES)[number];

export const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  cigano: 'Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
});

export const PROMPT_TAGS = [
  'gratidao',
  'sombra',
  'intencao',
  'oracao',
  'estudo',
  'acao',
  'descanso',
] as const;
export type PromptTag = (typeof PROMPT_TAGS)[number];

export type VoicePreset = string;

export interface LocalizedText {
  readonly 'pt-BR': string;
  readonly en: string;
  readonly es: string;
}

export interface LocalizedAction extends LocalizedText {
  readonly modality: 'movement' | 'stillness' | 'vocal' | 'ritual' | 'study';
}

export interface DailyPrompt {
  readonly id: string;
  readonly tradicao: Tradicao;
  readonly tag: PromptTag;
  readonly text: LocalizedText;
  readonly suggestedAction: LocalizedAction;
  readonly durationSeconds: number;
}

export function frozenPrompt(
  tradicao: Tradicao,
  idx: number,
  tag: PromptTag,
  text: LocalizedText,
  suggestedAction: LocalizedAction,
  durationSeconds: number = 180,
): DailyPrompt {
  const textFrozen: LocalizedText = Object.freeze({
    'pt-BR': text['pt-BR'],
    en: text.en,
    es: text.es,
  });
  const actionFrozen: LocalizedAction = Object.freeze({
    'pt-BR': suggestedAction['pt-BR'],
    en: suggestedAction.en,
    es: suggestedAction.es,
    modality: suggestedAction.modality,
  });
  return Object.freeze({
    id: `${tradicao}-${String(idx).padStart(4, '0')}`,
    tradicao,
    tag,
    text: textFrozen,
    suggestedAction: actionFrozen,
    durationSeconds,
  });
}

export function voicePresetForTradicao(t: Tradicao, locale: LocaleKey): VoicePreset {
  if (locale === 'pt-BR') {
    return t === 'cigano' ? 'cal-ptbr-male'
      : t === 'candomble' ? 'cal-ptbr-female'
      : t === 'umbanda' ? 'cal-ptbr-male'
      : t === 'ifa' ? 'cal-ptbr-male'
      : t === 'cabala' ? 'cal-ptbr-male'
      : t === 'astrologia' ? 'cal-ptbr-female'
      : 'cal-ptbr-female';
  }
  if (locale === 'en') return 'calm-en-male';
  return 'calm-es-female';
}
