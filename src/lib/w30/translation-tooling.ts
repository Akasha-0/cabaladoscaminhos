// src/lib/w30/translation-tooling.ts
// Translation tooling — key extraction + plural forms + i18n validation

export type Locale = "pt-BR" | "en" | "es";

export const SUPPORTED_LOCALES: readonly Locale[] = ["pt-BR", "en", "es"] as const;

export const DEFAULT_LOCALE: Locale = "pt-BR";

export interface TranslationEntry {
  readonly key: string;
  readonly namespace: string;
  readonly translations: Partial<Record<Locale, string>>;
  readonly pluralForm?: "zero" | "one" | "other";
  readonly context?: string;
}

/** Build a flat key from namespace + key path */
export function flattenKey(namespace: string, key: string): string {
  return `${namespace}.${key}`;
}

/** Extract all translation keys from a nested JSON object */
export function extractKeys(
  obj: Record<string, unknown>,
  namespace = "common",
  prefix = "",
): readonly string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object" && !Array.isArray(v)) {
      out.push(...extractKeys(v as Record<string, unknown>, namespace, path));
    } else {
      out.push(flattenKey(namespace, path));
    }
  }
  return out;
}

/** Get a translation by dot-notation key */
export function getTranslation(
  entries: readonly TranslationEntry[],
  key: string,
  locale: Locale,
  fallback: string = key,
): string {
  const entry = entries.find((e) => e.key === key || e.key === flattenKey(...key.split(".").slice(0, -1).reduce<[string, string]>(
    (acc, k) => [acc[0], acc[1] ? `${acc[1]}.${k}` : k],
    ["common", ""],
  )) as string);
  return entry?.translations[locale] ?? entry?.translations[DEFAULT_LOCALE] ?? fallback;
}

/** Validate that all entries have translations for all required locales */
export function validateCoverage(
  entries: readonly TranslationEntry[],
  required: readonly Locale[] = SUPPORTED_LOCALES,
): { complete: number; missing: number; gaps: readonly { key: string; locale: Locale }[] } {
  const gaps: { key: string; locale: Locale }[] = [];
  let complete = 0;
  for (const e of entries) {
    let isComplete = true;
    for (const loc of required) {
      if (!e.translations[loc]) {
        gaps.push({ key: e.key, locale: loc });
        isComplete = false;
      }
    }
    if (isComplete) complete++;
  }
  return { complete, missing: gaps.length, gaps };
}

/** Compute coverage percentage */
export function coveragePercent(entries: readonly TranslationEntry[], locale: Locale): number {
  if (entries.length === 0) return 100;
  const have = entries.filter((e) => e.translations[locale]).length;
  return Math.round((have / entries.length) * 100);
}
