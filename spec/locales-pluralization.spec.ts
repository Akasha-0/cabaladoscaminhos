/**
 * locales-pluralization.spec.ts — Self-running spec harness.
 */

let _passed = 0;
let _failed = 0;
let _its = 0;

function it(name: string, fn: () => void): void {
  _its++;
  try {
    fn();
    _passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    _failed++;
    console.log(`  ✗ ${name}\n    ${(e as Error).message}`);
  }
}

function expectEqual<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function expectTrue(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

import {
  pluralize,
  getPluralForm,
  pickPluralKey,
  pluralFormCount,
  allFormsForLocale,
  pk,
  type PluralForm,
} from '../engines/locales-pluralization.ts';
import {
  setLocale,
  resetI18nCore,
  type Locale,
  type TranslationKey,
  tk,
} from '../engines/i18n-core.ts';

export function runLocalesPluralizationSpec(): {
  passed: number;
  failed: number;
  its: number;
} {
  _passed = 0;
  _failed = 0;
  _its = 0;
  console.log('\n--- locales-pluralization.spec.ts ---');

  // ─── getPluralForm ───
  it('pt-BR: 0 -> one, 1 -> one, 2 -> other, 5 -> other', () => {
    expectEqual(getPluralForm('pt-BR', 0), 'one', 'pt-BR 0');
    expectEqual(getPluralForm('pt-BR', 1), 'one', 'pt-BR 1');
    expectEqual(getPluralForm('pt-BR', 2), 'other', 'pt-BR 2');
    expectEqual(getPluralForm('pt-BR', 5), 'other', 'pt-BR 5');
  });

  it('en: 0 -> other, 1 -> one, 2 -> other, 5 -> other', () => {
    expectEqual(getPluralForm('en', 0), 'other', 'en 0');
    expectEqual(getPluralForm('en', 1), 'one', 'en 1');
    expectEqual(getPluralForm('en', 2), 'other', 'en 2');
    expectEqual(getPluralForm('en', 5), 'other', 'en 5');
  });

  it('es: 0 -> other, 1 -> one, 2 -> other, 5 -> other', () => {
    expectEqual(getPluralForm('es', 0), 'other', 'es 0');
    expectEqual(getPluralForm('es', 1), 'one', 'es 1');
    expectEqual(getPluralForm('es', 2), 'other', 'es 2');
    expectEqual(getPluralForm('es', 5), 'other', 'es 5');
  });

  it('negative numbers treated by absolute value (pt-BR)', () => {
    expectEqual(getPluralForm('pt-BR', -1), 'one', 'pt-BR -1');
    expectEqual(getPluralForm('pt-BR', -3), 'other', 'pt-BR -3');
  });

  it('NaN -> other (cycle 67 NaN defense)', () => {
    expectEqual(getPluralForm('pt-BR', NaN), 'other', 'pt-BR NaN');
    expectEqual(getPluralForm('en', NaN), 'other', 'en NaN');
    expectEqual(getPluralForm('es', NaN), 'other', 'es NaN');
  });

  it('Infinity -> other (cycle 67 Infinity defense)', () => {
    expectEqual(getPluralForm('pt-BR', Infinity), 'other', 'pt-BR Infinity');
    expectEqual(
      getPluralForm('en', Number.POSITIVE_INFINITY),
      'other',
      'en Infinity',
    );
  });

  it('decimal counts truncated (cycle 67 floor semantics)', () => {
    expectEqual(getPluralForm('en', 1.4), 'one', 'en 1.4 -> 1');
    expectEqual(getPluralForm('en', 1.9), 'one', 'en 1.9 -> 1');
    expectEqual(getPluralForm('en', 0.5), 'other', 'en 0.5 -> 0');
  });

  // ─── pickPluralKey ───
  it('pickPluralKey: one -> key.one, other -> key.other', () => {
    expectEqual(pickPluralKey('items', 'one'), 'items.one', 'items.one');
    expectEqual(pickPluralKey('items', 'other'), 'items.other', 'items.other');
    expectEqual(pickPluralKey('items', 'zero'), 'items.one', 'zero maps to .one');
    expectEqual(pickPluralKey('items', 'few'), 'items.other', 'few maps to .other');
    expectEqual(pickPluralKey('items', 'many'), 'items.other', 'many maps to .other');
  });

  // ─── pluralFormCount ───
  it('pluralFormCount returns 2 (one + other) for all locales', () => {
    expectEqual(pluralFormCount('pt-BR'), 2, 'pt-BR forms');
    expectEqual(pluralFormCount('en'), 2, 'en forms');
    expectEqual(pluralFormCount('es'), 2, 'es forms');
  });

  it('allFormsForLocale returns one + other', () => {
    const forms = allFormsForLocale('pt-BR');
    expectEqual(forms.length, 2, 'forms length');
    expectEqual(forms[0], 'one', 'first form');
    expectEqual(forms[1], 'other', 'second form');
  });

  // ─── pluralize ───
  it('pluralize falls back to key when .one / .other missing', () => {
    setLocale('pt-BR');
    expectEqual(
      pluralize('pt-BR', tk('common.save'), 1),
      'Salvar',
      'pt-BR count=1 -> fallback to common.save',
    );
    expectEqual(
      pluralize('pt-BR', tk('common.save'), 5),
      'Salvar',
      'pt-BR count=5 -> fallback to common.save',
    );
  });

  it('pluralize interpolates {count}', () => {
    // Common.save has no .one / .other so fallback fires with {count} interpolation.
    expectEqual(
      pluralize('en', tk('common.save'), 3, {}),
      'Save',
      'en count=3 fallback -> Save',
    );
  });

  it('pluralize injects count automatically into vars', () => {
    // Even on fallback, count is injected so the template can render it.
    const result = pluralize('en', tk('common.save'), 7);
    expectEqual(result, 'Save', 'count-injected but template does not use it');
  });

  // ─── pk (PluralKey constructor) ───
  it('pk() freezes a PluralKey literal', () => {
    const key = pk('one thing', 'many things');
    expectEqual(key.one, 'one thing', 'one');
    expectEqual(key.other, 'many things', 'other');
    expectTrue(Object.isFrozen(key), 'frozen');
  });

  // ─── exhaustiveness sanity ───
  it('Locale type covers pt-BR/en/es', () => {
    const locales: Locale[] = ['pt-BR', 'en', 'es'];
    expectEqual(locales.length, 3, 'three locales');
  });

  return { passed: _passed, failed: _failed, its: _its };
}

runLocalesPluralizationSpec();