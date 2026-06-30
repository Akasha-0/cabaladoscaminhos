/**
 * Translation Tooling — Public Barrel
 *
 * Re-exports the engine's public surface. Consumers should import from here
 * (never reach into the internals directly).
 *
 *   import { translate, getDictionary, pluralRule } from '@/lib/engines/translation-tooling'
 */

// Types
export type {
  Brand,
  TranslationKey,
  LocaleTag,
  LocaleKey,
  PluralCategory,
  TranslationVars,
  Dictionary,
  FrozenDictionary,
  PluralMatch,
  TranslateResult,
} from './types.ts'

export { FALLBACK_CHAIN } from './types.ts'

// Engine functions
export {
  translate,
  getDictionary,
  getAllDictionaries,
  pluralRule,
  normalizeLocale,
  formatPlural,
  interpolate,
  formatTemplate,
  checkParity,
  sizeOf,
} from './translator.ts'

// Dictionaries (handy for tools / debug pages)
export { PT_BR } from './dictionaries/pt-BR.ts'
export { EN } from './dictionaries/en.ts'
export { ES } from './dictionaries/es.ts'