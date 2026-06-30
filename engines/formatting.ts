/**
 * formatting.ts — Locale-aware formatters (Intl.*, Node 22 native, no deps)
 *
 * W71-A: W71-A i18n engine, sub-engine 3/4.
 *
 * Public API:
 *   - formatDate(date, locale, style?)
 *   - formatTime(date, locale)
 *   - formatNumber(value, locale, opts?)
 *   - formatCurrency(value, locale, currency)
 *   - formatRelative(date, locale, baseDate?)
 *   - formatList(items, locale, style?)
 *
 * All formatters use Intl.* — zero deps, Node 22 native.
 */

import type { Locale } from './i18n-core.ts';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type DateStyle = 'short' | 'medium' | 'long' | 'full';
export type NumberStyle = 'decimal' | 'currency' | 'percent';
export type ListStyle = 'long' | 'short' | 'narrow';
export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export type NumberOpts = {
  readonly style?: NumberStyle;
  readonly currency?: CurrencyCode;
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
};

// ────────────────────────────────────────────────────────────────────
// Date / time
// ────────────────────────────────────────────────────────────────────

/** Map our date-style tokens to Intl.DateTimeFormat options. */
function dateStyleOptions(style: DateStyle): Intl.DateTimeFormatOptions {
  switch (style) {
    case 'short':
      return { day: '2-digit', month: '2-digit', year: 'numeric' };
    case 'medium':
      return { day: '2-digit', month: 'short', year: 'numeric' };
    case 'long':
      return { day: 'numeric', month: 'long', year: 'numeric' };
    case 'full':
      return {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
  }
}

export function formatDate(
  date: Date,
  locale: Locale,
  style: DateStyle = 'short',
): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error(`formatDate: invalid date "${String(date)}"`);
  }
  return new Intl.DateTimeFormat(locale, dateStyleOptions(style)).format(date);
}

export function formatTime(date: Date, locale: Locale): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error(`formatTime: invalid date "${String(date)}"`);
  }
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// ────────────────────────────────────────────────────────────────────
// Number / currency / percent
// ────────────────────────────────────────────────────────────────────

export function formatNumber(
  value: number,
  locale: Locale,
  opts?: NumberOpts,
): string {
  if (!Number.isFinite(value)) {
    throw new Error(`formatNumber: invalid number "${value}"`);
  }
  const o: Intl.NumberFormatOptions = {};
  if (opts?.style) o.style = opts.style;
  if (opts?.currency) o.currency = opts.currency;
  if (opts?.minimumFractionDigits !== undefined) {
    o.minimumFractionDigits = opts.minimumFractionDigits;
  }
  if (opts?.maximumFractionDigits !== undefined) {
    o.maximumFractionDigits = opts.maximumFractionDigits;
  }
  return new Intl.NumberFormat(locale, o).format(value);
}

export function formatCurrency(
  value: number,
  locale: Locale,
  currency: CurrencyCode,
): string {
  if (!Number.isFinite(value)) {
    throw new Error(`formatCurrency: invalid number "${value}"`);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

// ────────────────────────────────────────────────────────────────────
// Relative time — built on Intl.RelativeTimeFormat
// ────────────────────────────────────────────────────────────────────

type Unit = Intl.RelativeTimeFormatUnit;

/** Pick the best unit for a millisecond delta. */
function pickUnit(deltaMs: number): { unit: Unit; value: number } {
  const abs = Math.abs(deltaMs);
  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  if (abs < minute) return { unit: 'second', value: Math.round(deltaMs / second) };
  if (abs < hour) return { unit: 'minute', value: Math.round(deltaMs / minute) };
  if (abs < day) return { unit: 'hour', value: Math.round(deltaMs / hour) };
  if (abs < week) return { unit: 'day', value: Math.round(deltaMs / day) };
  if (abs < month) return { unit: 'week', value: Math.round(deltaMs / week) };
  if (abs < year) return { unit: 'month', value: Math.round(deltaMs / month) };
  return { unit: 'year', value: Math.round(deltaMs / year) };
}

export function formatRelative(
  date: Date,
  locale: Locale,
  baseDate: Date = new Date(),
): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error(`formatRelative: invalid date "${String(date)}"`);
  }
  if (!(baseDate instanceof Date) || Number.isNaN(baseDate.getTime())) {
    throw new Error(`formatRelative: invalid baseDate "${String(baseDate)}"`);
  }
  const { unit, value } = pickUnit(date.getTime() - baseDate.getTime());
  return new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(
    value,
    unit,
  );
}

// ────────────────────────────────────────────────────────────────────
// List formatting — Intl.ListFormat
// ────────────────────────────────────────────────────────────────────

export function formatList(
  items: readonly string[],
  locale: Locale,
  style: ListStyle = 'long',
): string {
  if (!Array.isArray(items)) {
    throw new Error('formatList: items must be an array');
  }
  if (items.length === 0) return '';
  return new Intl.ListFormat(locale, { style }).format(items);
}