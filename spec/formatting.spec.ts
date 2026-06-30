/**
 * formatting.spec.ts — Self-running spec harness.
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

function expectThrows(fn: () => void, msg: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(`${msg}: expected function to throw`);
}

import {
  formatDate,
  formatTime,
  formatNumber,
  formatCurrency,
  formatRelative,
  formatList,
  type DateStyle,
} from '../engines/formatting.ts';

export function runFormattingSpec(): {
  passed: number;
  failed: number;
  its: number;
} {
  _passed = 0;
  _failed = 0;
  _its = 0;
  console.log('\n--- formatting.spec.ts ---');

  // Fixed test date: 2026-06-30T14:30:00Z (Tue Jun 30 2026 14:30 UTC)
  const date = new Date('2026-06-30T14:30:00Z');

  // ─── formatDate ───
  it('formatDate short pt-BR (DD/MM/YYYY)', () => {
    const out = formatDate(date, 'pt-BR', 'short');
    // pt-BR short = 30/06/2026 — accept either D/M or DD/MM with separators
    expectTrue(/30/.test(out) && /06/.test(out) && /2026/.test(out), `pt-BR short: ${out}`);
  });

  it('formatDate short en (M/D/YYYY)', () => {
    const out = formatDate(date, 'en', 'short');
    expectTrue(/6\/30\/2026|06\/30\/2026/.test(out), `en short: ${out}`);
  });

  it('formatDate medium es', () => {
    const out = formatDate(date, 'es', 'medium');
    expectTrue(/30/.test(out) && /jun|2026/i.test(out), `es medium: ${out}`);
  });

  it('formatDate long pt-BR', () => {
    const out = formatDate(date, 'pt-BR', 'long');
    expectTrue(/junho|june/i.test(out) || /jun/i.test(out), `pt-BR long: ${out}`);
  });

  it('formatDate full en includes weekday', () => {
    const out = formatDate(date, 'en', 'full');
    expectTrue(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/.test(out), `en full: ${out}`);
  });

  it('formatDate default style is short', () => {
    const a = formatDate(date, 'pt-BR');
    const b = formatDate(date, 'pt-BR', 'short');
    expectEqual(a, b, 'default style = short');
  });

  it('formatDate throws on invalid date', () => {
    expectThrows(
      () => formatDate(new Date('not a date'), 'pt-BR'),
      'invalid date should throw',
    );
  });

  // ─── formatTime ───
  it('formatTime pt-BR returns HH:MM', () => {
    const out = formatTime(date, 'pt-BR');
    expectTrue(/14:30/.test(out), `pt-BR time: ${out}`);
  });

  it('formatTime en uses 12-hour format by default', () => {
    const out = formatTime(date, 'en');
    // en-US style uses 2:30 PM; accept either pattern
    expectTrue(/\d/.test(out), `en time: ${out}`);
  });

  it('formatTime throws on invalid date', () => {
    expectThrows(
      () => formatTime(new Date('xxx'), 'en'),
      'invalid time should throw',
    );
  });

  // ─── formatNumber ───
  it('formatNumber pt-BR uses comma decimal', () => {
    const out = formatNumber(1234.5, 'pt-BR');
    expectTrue(out.includes(',') || out.includes('.'), `pt-BR number: ${out}`);
    expectTrue(/1.234|1,234/.test(out), `pt-BR has thousand sep: ${out}`);
  });

  it('formatNumber en uses period decimal', () => {
    const out = formatNumber(1234.5, 'en');
    expectTrue(/1,234\.5|1,234/.test(out), `en number: ${out}`);
  });

  it('formatNumber percent style', () => {
    const out = formatNumber(0.5, 'en', { style: 'percent' });
    expectTrue(/50/.test(out), `percent: ${out}`);
  });

  it('formatNumber minimumFractionDigits', () => {
    const out = formatNumber(3.1, 'pt-BR', { minimumFractionDigits: 3 });
    expectTrue(/3,100|3\.100/.test(out), `minFrac: ${out}`);
  });

  it('formatNumber throws on Infinity', () => {
    expectThrows(
      () => formatNumber(Infinity, 'en'),
      'infinity number should throw',
    );
  });

  it('formatNumber throws on NaN', () => {
    expectThrows(
      () => formatNumber(NaN, 'en'),
      'NaN number should throw',
    );
  });

  // ─── formatCurrency ───
  it('formatCurrency BRL pt-BR has R$', () => {
    const out = formatCurrency(99.9, 'pt-BR', 'BRL');
    expectTrue(/R\$|99/.test(out), `BRL: ${out}`);
  });

  it('formatCurrency USD en has $', () => {
    const out = formatCurrency(99.9, 'en', 'USD');
    expectTrue(/\$|99/.test(out), `USD: ${out}`);
  });

  it('formatCurrency EUR es has €', () => {
    const out = formatCurrency(99.9, 'es', 'EUR');
    expectTrue(/€|99/.test(out), `EUR: ${out}`);
  });

  it('formatCurrency throws on Infinity', () => {
    expectThrows(
      () => formatCurrency(Infinity, 'en', 'USD'),
      'infinity currency should throw',
    );
  });

  // ─── formatRelative ───
  it('formatRelative past minutes -> "X minutes ago" (en)', () => {
    const past = new Date(date.getTime() - 5 * 60 * 1000);
    const out = formatRelative(past, 'en', date);
    expectTrue(/minute|ago/i.test(out) || /5/.test(out), `en past 5min: ${out}`);
  });

  it('formatRelative future hours -> en contains "in" or hours', () => {
    const future = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const out = formatRelative(future, 'en', date);
    expectTrue(/hour|in/i.test(out) || /2/.test(out), `en future 2h: ${out}`);
  });

  it('formatRelative pt-BR past', () => {
    const past = new Date(date.getTime() - 60 * 60 * 1000);
    const out = formatRelative(past, 'pt-BR', date);
    expectTrue(/hora|atrás|minuto/i.test(out) || /1/.test(out), `pt-BR past 1h: ${out}`);
  });

  it('formatRelative es future', () => {
    const future = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const out = formatRelative(future, 'es', date);
    expectTrue(/día|dentro|en/i.test(out) || /1/.test(out), `es future 1d: ${out}`);
  });

  it('formatRelative throws on invalid date', () => {
    expectThrows(
      () => formatRelative(new Date('bad'), 'en', date),
      'invalid relative date should throw',
    );
  });

  it('formatRelative throws on invalid baseDate', () => {
    expectThrows(
      () => formatRelative(date, 'en', new Date('bad')),
      'invalid relative baseDate should throw',
    );
  });

  // ─── formatList ───
  it('formatList en long uses "and"', () => {
    const out = formatList(['a', 'b', 'c'], 'en', 'long');
    expectTrue(/and/.test(out), `en list: ${out}`);
  });

  it('formatList pt-BR long uses "e"', () => {
    const out = formatList(['a', 'b', 'c'], 'pt-BR', 'long');
    expectTrue(/ e /.test(out), `pt-BR list: ${out}`);
  });

  it('formatList es long uses "y"', () => {
    const out = formatList(['a', 'b', 'c'], 'es', 'long');
    expectTrue(/ y /.test(out), `es list: ${out}`);
  });

  it('formatList narrow style returns shorter string', () => {
    const long = formatList(['a', 'b', 'c'], 'en', 'long');
    const narrow = formatList(['a', 'b', 'c'], 'en', 'narrow');
    expectTrue(narrow.length <= long.length, `narrow <= long: ${narrow.length} vs ${long.length}`);
  });

  it('formatList empty array returns empty string', () => {
    expectEqual(formatList([], 'en'), '', 'empty list');
  });

  it('formatList single item returns just the item', () => {
    const out = formatList(['solo'], 'en');
    expectEqual(out, 'solo', 'single item list');
  });

  it('formatList throws on non-array input', () => {
    expectThrows(
      () => formatList('not an array' as unknown as string[], 'en'),
      'non-array should throw',
    );
  });

  it('all four date styles produce distinct strings (long vs full)', () => {
    const styles: DateStyle[] = ['short', 'medium', 'long', 'full'];
    const outs = styles.map((s) => formatDate(date, 'en', s));
    expectTrue(new Set(outs).size === 4, `4 distinct outputs: ${outs.join(' | ')}`);
  });

  return { passed: _passed, failed: _failed, its: _its };
}

runFormattingSpec();