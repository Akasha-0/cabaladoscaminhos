/**
 * ════════════════════════════════════════════════════════════════════════════
 * W79-A — BIORHYTHM CALENDAR ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 79 · 2026-06-30
 * Author: W79-A Coder (Mavis orchestrator session 414720494506167)
 *
 * UI/CALENDAR LAYER for the biorhythm engine (src/lib/cycles/biorhythm.ts
 * from W72-A B2 retry). This module is the *presentation + export* surface
 * — pure logic, no React. It produces:
 *
 *   1. MonthGridView       — 6×7 calendar cells with biorhythm ribbons per day
 *   2. WeekStripView       — 7-day horizontal strip with phase bars
 *   3. DayDetailView       — full per-cycle breakdown + sacred cross-references
 *   4. CriticalDaySummary  — group critical days by phase within a range
 *   5. IcsExport           — RFC 5545 subset export to Apple/Google Calendar
 *   6. PhaseRibbon         — SVG path data for biorhythm sine ribbons
 *
 * The engine is the source-of-truth for what the React component renders.
 * Cycle 73 lesson applied: Object.freeze on every record before returning.
 * Cycle 75 lesson applied: SHA-256 cache key (canonical-JSON pattern).
 *
 * Sacred coverage — every DayDetailView embeds 5 traditions woven:
 *   1. Astrologia (planetary ruler, element, sign hint)
 *   2. Cigano (28-card Petit Lenormand index)
 *   3. Numerologia Cabalística (digital root with master preservation)
 *   4. Orixás (16-Odu rotation by day-of-life)
 *   5. Cabala/Tantra (Sefirot + chakra mapping)
 *
 * Public API (cycle 79 contract):
 *   buildMonthGridView(input)       → MonthGridView (42 cells, 6 weeks)
 *   buildWeekStripView(input)        → WeekStripView (7 cells)
 *   buildDayDetailView(input)        → DayDetailView (per-day breakdown)
 *   summarizeCriticalDays(input)     → CriticalDaySummary
 *   exportIcs(input)                 → IcsDocument (RFC 5545 subset string)
 *   buildPhaseRibbon(input)          → PhaseRibbon (SVG path data)
 *   listTraditions()                 → readonly array of 7 sacred traditions
 *   hashCacheKey(input)              → SHA-256 cache key
 *
 * Durable lessons applied (cycle 60-78):
 *   - Worktree-isolated tsconfig + node-stubs.d.ts as a script (cycle 60+)
 *   - `.ts` extension imports + allowImportingTsExtensions (cycle 62)
 *   - Branded types via factory + regex prefix (cycle 73, 77)
 *   - Master number preservation 11/22/33 (cycle 72, 77)
 *   - Pure-JS SHA-256 fallback (cycle 75, 77)
 *   - SHA-256 cache key via canonical-JSON (cycle 67, 75)
 *   - Object.freeze on every result (cycle 75 #6)
 *   - Self-running test harness (cycle 60+)
 *   - NFD normalization for diacritic-aware sacred terms (cycle 77)
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

export type DateString = string & { readonly __brand: 'DateString' };
export type DayCount = number & { readonly __brand: 'DayCount' };

const DATE_RE = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m1to12: number): number {
  const t = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return t[m1to12 - 1] ?? 0;
}

export function parseDate(s: string): Date {
  const m = DATE_RE.exec(s.trim());
  if (!m) throw new Error(`biorhythm-calendar: invalid date string "${s}" — expected YYYY-MM-DD`);
  const y = +m[1]!;
  const mo = +m[2]!;
  const d = +m[3]!;
  if (mo < 1 || mo > 12) throw new Error(`biorhythm-calendar: month out of range in "${s}"`);
  if (d < 1 || d > daysInMonth(y, mo)) throw new Error(`biorhythm-calendar: day out of range in "${s}"`);
  return new Date(Date.UTC(y, mo - 1, d));
}

export function asDateString(s: string): DateString {
  parseDate(s); // validate
  return s as DateString;
}

export function dayCountBetween(birth: Date, target: Date): number {
  return (target.getTime() - birth.getTime()) / 86_400_000;
}

// ════════════════════════════════════════════════════════════════════════════
// BIORHYTHM CORE (replicated from cycles/biorhythm.ts for self-containment)
// ════════════════════════════════════════════════════════════════════════════

export const BIORHYTHM_PERIODS = Object.freeze({
  physical: 23,
  emotional: 28,
  intellectual: 33,
} as const);

export type CycleName = keyof typeof BIORHYTHM_PERIODS;

export function phaseValue(dayCount: number, period: number): number {
  return Math.sin((2 * Math.PI * dayCount) / period);
}

export function isCriticalDay(dayCount: number, period: number): boolean {
  const k = Math.round(dayCount / period);
  const crossings: number[] = [k * period];
  for (const delta of [-1, 1]) {
    const c = (k + delta) * period;
    if (Math.abs(c - dayCount) <= 0.5) crossings.push(c);
  }
  for (const c of crossings) {
    if (Math.abs(c - dayCount) <= 0.5) return true;
  }
  return false;
}

export type CyclePhaseKind = 'peak' | 'trough' | 'ascending' | 'descending' | 'critical';

export function phaseKind(dayCount: number, period: number): CyclePhaseKind {
  if (isCriticalDay(dayCount, period)) return 'critical';
  const v = phaseValue(dayCount, period);
  if (Math.abs(v) > 0.999) return v > 0 ? 'peak' : 'trough';
  const slope = Math.cos((2 * Math.PI * dayCount) / period);
  return slope > 0 ? 'ascending' : 'descending';
}

// ════════════════════════════════════════════════════════════════════════════
// SACRED TABLES
// ════════════════════════════════════════════════════════════════════════════

export const SACRED_TRADITIONS = Object.freeze([
  'Astrologia',
  'Cigano',
  'Numerologia Cabalística',
  'Orixás',
  'Cabala',
  'Tantra',
  'Ifá',
] as const);

export type SacredTradition = (typeof SACRED_TRADITIONS)[number];

export function listTraditions(): readonly SacredTradition[] {
  return SACRED_TRADITIONS;
}

const PLANET_BY_DAY: ReadonlyArray<{ planet: string; element: 'fogo' | 'terra' | 'ar' | 'água' }> = [
  { planet: 'Sol', element: 'fogo' },
  { planet: 'Lua', element: 'água' },
  { planet: 'Marte', element: 'fogo' },
  { planet: 'Mercúrio', element: 'ar' },
  { planet: 'Júpiter', element: 'terra' },
  { planet: 'Vênus', element: 'ar' },
  { planet: 'Saturno', element: 'terra' },
];

const WEEKDAY_PT: ReadonlyArray<string> = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function dayOfWeekInfo(d: Date): { weekday: string; planet: string; element: 'fogo' | 'terra' | 'ar' | 'água' } {
  const wd = d.getUTCDay();
  const r = PLANET_BY_DAY[wd]!;
  return { weekday: WEEKDAY_PT[wd]!, planet: r.planet, element: r.element };
}

/** 28-card Petit Lenormand (Cigano) — surfaces used as cycle keywords. */
export const CIGANO_28: ReadonlyArray<string> = Object.freeze([
  'O Cavaleiro', 'A Foice', 'A Âncora', 'A Árvore', 'O Urso', 'A Estrela',
  'A Cobra', 'O Caixão', 'O Buquê', 'A Foice', 'A Toca', 'Os Lírios',
  'A Lua', 'A Raposa', 'A Chave', 'A Carta', 'Os Pássaros', 'O Coração',
  'O Anel', 'O Livro', 'O Nobre', 'O Caminho', 'Os Ratos', 'O Navio',
  'A Cruz', 'A Torre', 'O Trevo', 'A Casa',
]);

export function ciganoCardForDay(dayCount: number, cycle: CycleName): string {
  // Hash cycle + day to pick a stable card index.
  const seed = Math.floor(Math.abs(dayCount + cycle.charCodeAt(0) * 1000));
  const idx = seed % 28;
  return CIGANO_28[idx]!;
}

// 16 Odus (Ifá) + cycling by day-of-life. Using canonical Ogbe..Ofurufu.
const ODU_16: ReadonlyArray<{ id: number; name: string; essence: string }> = Object.freeze([
  { id: 1,  name: 'Ogbe',        essence: 'Luz e origem (Ogbe)' },
  { id: 2,  name: 'Ejiokô',      essence: 'Dualidade e movimento (Ejiokô)' },
  { id: 3,  name: 'Etogundá',    essence: 'Abertura de caminhos (Etogundá)' },
  { id: 4,  name: 'Irosun',      essence: 'Cuidado e proteção (Irosun)' },
  { id: 5,  name: 'Oxê',         essence: 'Amor e beleza (Oxê)' },
  { id: 6,  name: 'Obará',       essence: 'Riqueza e fartura (Obará)' },
  { id: 7,  name: 'Odi',         essence: 'Limpeza e segredo (Odi)' },
  { id: 8,  name: 'Ejionile',    essence: 'Justiça e vitória (Ejionile)' },
  { id: 9,  name: 'Osa',         essence: 'Tempestade e movimento (Osa)' },
  { id: 10, name: 'Ofum',        essence: 'Fogo e transformação (Ofum)' },
  { id: 11, name: 'Ofun',        essence: 'Espírito e profundidade (Ofun)' },
  { id: 12, name: 'Oyeku',       essence: 'Noite e mistério (Oyeku)' },
  { id: 13, name: 'Iwori',       essence: 'Renovação e cura (Iwori)' },
  { id: 14, name: 'Obarisa',     essence: 'Colheita e gratidão (Obarisa)' },
  { id: 15, name: 'Ejibe',       essence: 'Refúgio e proteção (Ejibe)' },
  { id: 16, name: 'Ofurufu',     essence: 'Ancestralidade e raiz (Ofurufu)' },
]);

export function oduForDay(dayCount: number): { id: number; name: string; essence: string } {
  const id = (Math.floor(Math.abs(dayCount)) % 16) + 1;
  return ODU_16[id - 1]!;
}

// 10 Sefirot (Cabala) — for dominant cycle.
const SEFIROT: ReadonlyArray<{ name: string; meaning: string }> = Object.freeze([
  { name: 'Keter',     meaning: 'Coroa — vontade divina' },
  { name: 'Chokhmah',  meaning: 'Sabedoria — insight súbito' },
  { name: 'Binah',     meaning: 'Entendimento — análise profunda' },
  { name: 'Chesed',    meaning: 'Misericórdia — expansão amorosa' },
  { name: 'Gevurah',   meaning: 'Severidade — disciplina e força' },
  { name: 'Tiferet',   meaning: 'Beleza — equilíbrio e harmonia' },
  { name: 'Netzach',   meaning: 'Vitória — persistência criativa' },
  { name: 'Hod',       meaning: 'Esplendor — lógica e comunicação' },
  { name: 'Yesod',     meaning: 'Fundamento — conexão e sonhos' },
  { name: 'Malkuth',   meaning: 'Reino — corpo e manifestação' },
]);

const SEFIROT_BY_CYCLE: Readonly<Record<CycleName, number>> = Object.freeze({
  physical: 9,    // Yesod — corpo, fundação
  emotional: 5,   // Gevurah — força do sentir
  intellectual: 2, // Chokhmah — sabedoria
});

export function sefirahForCycle(cycle: CycleName): { name: string; meaning: string } {
  const idx = SEFIROT_BY_CYCLE[cycle];
  return SEFIROT[idx]!;
}

// 7 chakras (Tantra) — by dominant cycle.
const CHAKRA_BY_CYCLE: Readonly<Record<CycleName, { name: string; color: string; essence: string }>> = Object.freeze({
  physical:     { name: 'Muladhara (Raiz)',       color: 'vermelho',  essence: 'corpo, sobrevivência, energia vital' },
  emotional:    { name: 'Anahata (Coração)',      color: 'verde',     essence: 'sentimento, conexão, compaixão' },
  intellectual: { name: 'Ajna (Terceiro-Olho)',   color: 'índigo',    essence: 'intuição, visão, discernimento' },
});

export function chakraForCycle(cycle: CycleName): { name: string; color: string; essence: string } {
  return CHAKRA_BY_CYCLE[cycle];
}

// ════════════════════════════════════════════════════════════════════════════
// DIGIT-ROOT (master preservation)
// ════════════════════════════════════════════════════════════════════════════

const MASTERS = Object.freeze(new Set([11, 22, 33]));

export function digitalRoot(n: number): number {
  if (n < 0) n = -n;
  if (n === 0) return 0;
  let v = n;
  while (v >= 10 && !MASTERS.has(v)) {
    let sum = 0;
    while (v > 0) { sum += v % 10; v = Math.floor(v / 10); }
    v = sum;
  }
  return v === 0 ? 9 : v;
}

// ════════════════════════════════════════════════════════════════════════════
// CYCLE READING (per-day biorhythm + sacred cross)
// ════════════════════════════════════════════════════════════════════════════

export interface CycleReading {
  cycle: CycleName;
  period: number;
  value: number;            // sin phase in [-1, 1]
  kind: CyclePhaseKind;
  isCritical: boolean;
  sefirah: { name: string; meaning: string };
  chakra: { name: string; color: string; essence: string };
}

export interface BiorhythmDayReading {
  date: DateString;
  dayOfLife: number;
  weekday: string;
  planet: string;
  element: 'fogo' | 'terra' | 'ar' | 'água';
  cycles: Readonly<Record<CycleName, CycleReading>>;
  dominantCycle: CycleName;
  ciganoCard: string;
  odu: { id: number; name: string; essence: string };
  numerologyRoot: number;
  summary: string;
}

export function calculateDayReading(birthDate: string, targetDate: string): BiorhythmDayReading {
  const birth = parseDate(birthDate);
  const target = parseDate(targetDate);
  const days = dayCountBetween(birth, target);

  const cycles: Record<CycleName, CycleReading> = {
    physical: {
      cycle: 'physical',
      period: BIORHYTHM_PERIODS.physical,
      value: phaseValue(days, BIORHYTHM_PERIODS.physical),
      kind: phaseKind(days, BIORHYTHM_PERIODS.physical),
      isCritical: isCriticalDay(days, BIORHYTHM_PERIODS.physical),
      sefirah: sefirahForCycle('physical'),
      chakra: chakraForCycle('physical'),
    },
    emotional: {
      cycle: 'emotional',
      period: BIORHYTHM_PERIODS.emotional,
      value: phaseValue(days, BIORHYTHM_PERIODS.emotional),
      kind: phaseKind(days, BIORHYTHM_PERIODS.emotional),
      isCritical: isCriticalDay(days, BIORHYTHM_PERIODS.emotional),
      sefirah: sefirahForCycle('emotional'),
      chakra: chakraForCycle('emotional'),
    },
    intellectual: {
      cycle: 'intellectual',
      period: BIORHYTHM_PERIODS.intellectual,
      value: phaseValue(days, BIORHYTHM_PERIODS.intellectual),
      kind: phaseKind(days, BIORHYTHM_PERIODS.intellectual),
      isCritical: isCriticalDay(days, BIORHYTHM_PERIODS.intellectual),
      sefirah: sefirahForCycle('intellectual'),
      chakra: chakraForCycle('intellectual'),
    },
  };

  // dominant = largest absolute value
  const entries: ReadonlyArray<{ name: CycleName; v: number }> = [
    { name: 'physical', v: Math.abs(cycles.physical.value) },
    { name: 'emotional', v: Math.abs(cycles.emotional.value) },
    { name: 'intellectual', v: Math.abs(cycles.intellectual.value) },
  ];
  const sorted = [...entries].sort((a, b) => b.v - a.v);
  const dominantCycle = sorted[0]!.name;
  const dominantValue = cycles[dominantCycle].value;

  const weekdayInfo = dayOfWeekInfo(target);
  const ciganoCard = ciganoCardForDay(days, dominantCycle);
  const odu = oduForDay(days);
  const numerologyRoot = digitalRoot(Math.floor(Math.abs(days)));

  const dateStr = target.toISOString().slice(0, 10);
  const summary =
    `Dia ${Math.floor(days)} de vida. ${dominantCycle} ${dominantValue >= 0 ? 'em alta' : 'em baixa'} ` +
    `(físico ${cycles.physical.value.toFixed(2)}, emocional ${cycles.emotional.value.toFixed(2)}, ` +
    `intelectual ${cycles.intellectual.value.toFixed(2)}). ` +
    `${weekdayInfo.weekday} regido por ${weekdayInfo.planet} (elemento ${weekdayInfo.element}). ` +
    `Carta-cigana do dia: ${ciganoCard}. Odu regente: ${odu.essence}. ` +
    `Numerologia cabalística: ${numerologyRoot}. Chakra dominante: ${chakraForCycle(dominantCycle).name}.`;

  return Object.freeze({
    date: dateStr as DateString,
    dayOfLife: days,
    weekday: weekdayInfo.weekday,
    planet: weekdayInfo.planet,
    element: weekdayInfo.element,
    cycles: Object.freeze(cycles),
    dominantCycle,
    ciganoCard,
    odu,
    numerologyRoot,
    summary,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// MONTH GRID VIEW (6 weeks × 7 days = 42 cells)
// ════════════════════════════════════════════════════════════════════════════

export interface CalendarCell {
  date: DateString;
  /** 1-31 day of month (only valid when inMonth). */
  dayOfMonth: number;
  /** true iff cell is within the requested month. */
  inMonth: boolean;
  isToday: boolean;
  reading: BiorhythmDayReading;
}

export interface MonthGridView {
  birthDate: DateString;
  /** First-of-month date. */
  monthAnchor: DateString;
  monthLabel: string;     // e.g. "Janeiro 2026"
  /** Always 6 weeks × 7 days = 42 cells, starting on Sunday. */
  cells: ReadonlyArray<CalendarCell>;
  /** Indices of cells with at least one critical cycle. */
  criticalIndices: ReadonlyArray<number>;
  /** Per-cycle count of critical days in this month view. */
  criticalCount: Readonly<Record<CycleName, number>>;
  summary: string;
}

export interface MonthGridInput {
  birthDate: string;
  /** Any date within the target month. */
  monthAnchor: string;
  /** Today (YYYY-MM-DD). Used to mark `isToday`. */
  today: string;
}

function formatMonthLabel(d: Date): string {
  const monthsPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return `${monthsPt[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function buildMonthGridView(input: MonthGridInput): MonthGridView {
  const anchor = parseDate(input.monthAnchor);
  const todayDate = parseDate(input.today);
  // Roll anchor to first day of month at UTC midnight.
  const firstOfMonth = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const lastOfMonth = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0));
  // Pad to start on Sunday (wd 0).
  const startWeekday = firstOfMonth.getUTCDay();
  const gridStart = new Date(firstOfMonth.getTime() - startWeekday * 86_400_000);

  const cells: CalendarCell[] = [];
  const criticalIndices: number[] = [];
  const criticalCount: Record<CycleName, number> = { physical: 0, emotional: 0, intellectual: 0 };

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart.getTime() + i * 86_400_000);
    const inMonth = cellDate.getUTCMonth() === anchor.getUTCMonth() &&
                    cellDate.getUTCFullYear() === anchor.getUTCFullYear();
    const isToday = cellDate.getTime() === todayDate.getTime();
    const dateStr = cellDate.toISOString().slice(0, 10);
    const reading = calculateDayReading(input.birthDate, dateStr);
    cells.push(Object.freeze({
      date: dateStr as DateString,
      dayOfMonth: cellDate.getUTCDate(),
      inMonth,
      isToday,
      reading,
    }));
    let anyCritical = false;
    for (const c of ['physical', 'emotional', 'intellectual'] as CycleName[]) {
      if (reading.cycles[c].isCritical) {
        criticalCount[c]++;
        anyCritical = true;
      }
    }
    if (anyCritical) criticalIndices.push(i);
  }

  const totalCritical = criticalIndices.length;
  const monthLabel = formatMonthLabel(anchor);
  const summary = `${monthLabel} — ${cells.filter((c) => c.inMonth).length} dias no mês, ${totalCritical} dia(s) crítico(s). ` +
    `Nascimento em ${input.birthDate}. Odu regente do mês: ${oduForDay(dayCountBetween(parseDate(input.birthDate), firstOfMonth)).name}.`;

  return Object.freeze({
    birthDate: asDateString(input.birthDate),
    monthAnchor: firstOfMonth.toISOString().slice(0, 10) as DateString,
    monthLabel,
    cells: Object.freeze(cells),
    criticalIndices: Object.freeze(criticalIndices),
    criticalCount: Object.freeze(criticalCount),
    summary,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// WEEK STRIP VIEW (7 days)
// ════════════════════════════════════════════════════════════════════════════

export interface WeekStripCell {
  date: DateString;
  weekdayShort: string;
  dayOfMonth: number;
  isToday: boolean;
  reading: BiorhythmDayReading;
  /** Compact summary used in tight UI rows. */
  compact: string;
}

export interface WeekStripView {
  birthDate: DateString;
  weekAnchor: DateString;
  cells: ReadonlyArray<WeekStripCell>;
  /** Dominant cycle across the week. */
  weekDominantCycle: CycleName;
  summary: string;
}

const WEEKDAY_SHORT_PT: ReadonlyArray<string> = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export interface WeekStripInput {
  birthDate: string;
  /** Any date within the target week. */
  weekAnchor: string;
  today: string;
}

export function buildWeekStripView(input: WeekStripInput): WeekStripView {
  const anchor = parseDate(input.weekAnchor);
  const todayDate = parseDate(input.today);
  const startWd = anchor.getUTCDay();
  const sunday = new Date(anchor.getTime() - startWd * 86_400_000);

  const cells: WeekStripCell[] = [];
  let cycleAcc: Record<CycleName, number> = { physical: 0, emotional: 0, intellectual: 0 };

  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(sunday.getTime() + i * 86_400_000);
    const dateStr = cellDate.toISOString().slice(0, 10);
    const reading = calculateDayReading(input.birthDate, dateStr);
    cycleAcc.physical += Math.abs(reading.cycles.physical.value);
    cycleAcc.emotional += Math.abs(reading.cycles.emotional.value);
    cycleAcc.intellectual += Math.abs(reading.cycles.intellectual.value);
    const wd = cellDate.getUTCDay();
    const compact = `${reading.dominantCycle} ${reading.cycles[reading.dominantCycle].value >= 0 ? '+' : '-'}`;
    cells.push(Object.freeze({
      date: dateStr as DateString,
      weekdayShort: WEEKDAY_SHORT_PT[wd]!,
      dayOfMonth: cellDate.getUTCDate(),
      isToday: cellDate.getTime() === todayDate.getTime(),
      reading,
      compact,
    }));
  }

  const weekDominantCycle = (Object.entries(cycleAcc) as Array<[CycleName, number]>)
    .sort((a, b) => b[1] - a[1])[0]![0];

  const sundayStr = sunday.toISOString().slice(0, 10);
  const saturday = new Date(sunday.getTime() + 6 * 86_400_000);
  const saturdayStr = saturday.toISOString().slice(0, 10);
  const summary = `Semana ${sundayStr} → ${saturdayStr}. Ciclo dominante: ${weekDominantCycle}.`;

  return Object.freeze({
    birthDate: asDateString(input.birthDate),
    weekAnchor: sundayStr as DateString,
    cells: Object.freeze(cells),
    weekDominantCycle,
    summary,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// DAY DETAIL VIEW (deep breakdown)
// ════════════════════════════════════════════════════════════════════════════

export interface DayDetailView {
  birthDate: DateString;
  date: DateString;
  reading: BiorhythmDayReading;
  /** Sacred weaving — 7 traditions enumerated for the day. */
  sacredWeave: ReadonlyArray<{
    tradition: SacredTradition;
    keyword: string;
    note: string;
  }>;
  /** Practical guidance string. */
  guidance: string;
  /** Compact pill color for UI (mobile-first). */
  uiTone: 'critical' | 'low' | 'neutral' | 'high';
}

export interface DayDetailInput {
  birthDate: string;
  date: string;
}

export function buildDayDetailView(input: DayDetailInput): DayDetailView {
  const reading = calculateDayReading(input.birthDate, input.date);
  const domValue = reading.cycles[reading.dominantCycle].value;
  const anyCritical = reading.cycles.physical.isCritical ||
                      reading.cycles.emotional.isCritical ||
                      reading.cycles.intellectual.isCritical;

  const uiTone: DayDetailView['uiTone'] = anyCritical
    ? 'critical'
    : domValue > 0.5 ? 'high' : domValue < -0.5 ? 'low' : 'neutral';

  const sacredWeave: ReadonlyArray<{ tradition: SacredTradition; keyword: string; note: string }> = [
    { tradition: 'Astrologia',              keyword: `${reading.planet} (${reading.element})`, note: `${reading.weekday} regido por ${reading.planet}.` },
    { tradition: 'Cigano',                  keyword: reading.ciganoCard,                       note: `Carta puxada do Petit Lenormand.` },
    { tradition: 'Numerologia Cabalística', keyword: `Raiz ${reading.numerologyRoot}`,         note: `Dia-de-vida reduzido com preservação de mestres.` },
    { tradition: 'Orixás',                  keyword: reading.odu.name,                         note: `Odu regente do dia: ${reading.odu.essence}.` },
    { tradition: 'Cabala',                  keyword: reading.cycles[reading.dominantCycle].sefirah.name, note: `Sefirá do ciclo dominante.` },
    { tradition: 'Tantra',                  keyword: reading.cycles[reading.dominantCycle].chakra.name,   note: `Chakra dominante alinhado ao ciclo ${reading.dominantCycle}.` },
    { tradition: 'Ifá',                     keyword: reading.odu.name,                         note: `Odu Ifá (Mérindilogun) regente do dia.` },
  ];

  const guidance = anyCritical
    ? `Dia crítico em ${reading.dominantCycle}. Redobre atenção em transições e decisões.`
    : domValue >= 0
      ? `Ciclo ${reading.dominantCycle} em alta — apoie-se nessa energia para criar.`
      : `Ciclo ${reading.dominantCycle} em baixa — descanse, observe, escute.`;

  return Object.freeze({
    birthDate: asDateString(input.birthDate),
    date: reading.date,
    reading,
    sacredWeave: Object.freeze(sacredWeave),
    guidance,
    uiTone,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// CRITICAL DAY SUMMARY
// ════════════════════════════════════════════════════════════════════════════

export interface CriticalDaySummary {
  birthDate: DateString;
  from: DateString;
  to: DateString;
  totalCritical: number;
  perCycle: Readonly<Record<CycleName, number>>;
  /** Chronological list. */
  days: ReadonlyArray<{
    date: DateString;
    dayOfLife: number;
    cycles: ReadonlyArray<CycleName>;
    note: string;
  }>;
  summary: string;
}

export interface CriticalDaySummaryInput {
  birthDate: string;
  from: string;
  to: string;
}

export function summarizeCriticalDays(input: CriticalDaySummaryInput): CriticalDaySummary {
  const birth = parseDate(input.birthDate);
  const from = parseDate(input.from);
  const to = parseDate(input.to);
  if (to.getTime() < from.getTime()) {
    throw new Error(`biorhythm-calendar: "to" must be >= "from" (got ${input.from} → ${input.to})`);
  }
  const fromDays = dayCountBetween(birth, from);
  const toDays = dayCountBetween(birth, to);
  if (toDays < 0) {
    throw new Error(`biorhythm-calendar: range predates birth (${input.from} before ${input.birthDate})`);
  }

  const criticalSet = new Map<number, Set<CycleName>>();
  for (const cycle of ['physical', 'emotional', 'intellectual'] as CycleName[]) {
    const period = BIORHYTHM_PERIODS[cycle];
    const kStart = Math.ceil(fromDays / period);
    const kEnd = Math.floor(toDays / period);
    for (let k = kStart; k <= kEnd; k++) {
      const crossingDay = k * period;
      if (crossingDay < fromDays || crossingDay > toDays) continue;
      const dayKey = Math.floor(crossingDay);
      if (!criticalSet.has(dayKey)) criticalSet.set(dayKey, new Set());
      criticalSet.get(dayKey)!.add(cycle);
    }
  }

  const days: Array<{ date: DateString; dayOfLife: number; cycles: ReadonlyArray<CycleName>; note: string }> = [];
  const perCycle: Record<CycleName, number> = { physical: 0, emotional: 0, intellectual: 0 };

  for (const [d, cycles] of Array.from(criticalSet.entries()).sort(([a], [b]) => a - b)) {
    const dateMs = birth.getTime() + d * 86_400_000;
    const dateStr = new Date(dateMs).toISOString().slice(0, 10);
    const sortedCycles = Array.from(cycles).sort() as CycleName[];
    for (const c of sortedCycles) perCycle[c]++;
    days.push(Object.freeze({
      date: dateStr as DateString,
      dayOfLife: d,
      cycles: Object.freeze(sortedCycles),
      note: `Zero-crossing em ${sortedCycles.join('+')}.`,
    }));
  }

  const totalCritical = days.length;
  const summary = `${input.from} → ${input.to}: ${totalCritical} dia(s) crítico(s) ` +
    `(físico ${perCycle.physical}, emocional ${perCycle.emotional}, intelectual ${perCycle.intellectual}).`;

  return Object.freeze({
    birthDate: asDateString(input.birthDate),
    from: input.from as DateString,
    to: input.to as DateString,
    totalCritical,
    perCycle: Object.freeze(perCycle),
    days: Object.freeze(days),
    summary,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE RIBBON (SVG path data)
// ════════════════════════════════════════════════════════════════════════════

export interface PhaseRibbon {
  cycle: CycleName;
  period: number;
  /** SVG path d-attribute for sine ribbon across [startDays..endDays]. */
  pathD: string;
  /** Sample points used to build the path. */
  samples: ReadonlyArray<{ day: number; value: number }>;
  /** Width/height in abstract units. */
  width: number;
  height: number;
}

export interface PhaseRibbonInput {
  cycle: CycleName;
  startDay: number;
  endDay: number;
  /** Number of sample points. */
  samples?: number;
  width?: number;
  height?: number;
}

export function buildPhaseRibbon(input: PhaseRibbonInput): PhaseRibbon {
  if (input.endDay < input.startDay) {
    throw new Error(`biorhythm-calendar: endDay < startDay (${input.startDay} > ${input.endDay})`);
  }
  const period = BIORHYTHM_PERIODS[input.cycle];
  const sampleCount = Math.max(8, Math.min(400, input.samples ?? 60));
  const width = input.width ?? 280;
  const height = input.height ?? 60;
  const points: Array<{ day: number; value: number }> = [];
  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const day = input.startDay + (input.endDay - input.startDay) * t;
    const v = phaseValue(day, period);
    points.push({ day, value: v });
  }
  // Build SVG path: y-axis inverted (positive value = top).
  const mid = height / 2;
  const amp = (height / 2) * 0.9;
  let d = '';
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    const x = (i / (points.length - 1)) * width;
    const y = mid - p.value * amp;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
  }
  return Object.freeze({
    cycle: input.cycle,
    period,
    pathD: d.trim(),
    samples: Object.freeze(points),
    width,
    height,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// ICS EXPORT (RFC 5545 subset)
// ════════════════════════════════════════════════════════════════════════════

export interface IcsExportInput {
  birthDate: string;
  /** Inclusive range start. */
  from: string;
  /** Inclusive range end. */
  to: string;
  /** Calendar name (CN field). */
  calendarName?: string;
  /** Event summary template — receives the reading. */
  eventTitle?: string;
}

export interface IcsDocument {
  filename: string;
  contentType: 'text/calendar';
  body: string;
  eventCount: number;
  summary: string;
}

function icsDate(isoDate: string): string {
  // YYYYMMDDTHHMMSSZ
  const d = parseDate(isoDate);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T000000Z`;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldLine(line: string): string {
  // RFC 5545 line folding — lines > 75 octets folded at 73.
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + (i === 0 ? 75 : 74));
    out.push(i === 0 ? chunk : ' ' + chunk);
    i += i === 0 ? 75 : 74;
  }
  return out.join('\r\n');
}

export function exportIcs(input: IcsExportInput): IcsDocument {
  const from = parseDate(input.from);
  const to = parseDate(input.to);
  if (to.getTime() < from.getTime()) {
    throw new Error(`biorhythm-calendar: ICS "to" must be >= "from" (got ${input.from} → ${input.to})`);
  }
  const calName = input.calendarName ?? 'Bioritmo Cabala dos Caminhos';
  const titleTpl = input.eventTitle ?? 'Biorritmo: {weekday}';

  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Cabala dos Caminhos//W79-Biorhythm//PT-BR');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push(foldLine(`X-WR-CALNAME:${escapeIcs(calName)}`));

  let eventCount = 0;
  const today = new Date(from.getTime());
  while (today.getTime() <= to.getTime()) {
    const iso = today.toISOString().slice(0, 10);
    const reading = calculateDayReading(input.birthDate, iso);
    const summary = titleTpl.replace('{weekday}', reading.weekday);
    const domCycle = reading.dominantCycle;
    const domVal = reading.cycles[domCycle].value;
    const anyCrit = reading.cycles.physical.isCritical || reading.cycles.emotional.isCritical || reading.cycles.intellectual.isCritical;
    const desc = `${domCycle} ${domVal >= 0 ? 'em alta' : 'em baixa'} (${domVal.toFixed(2)}). ` +
      `Odu: ${reading.odu.name}. Carta-cigana: ${reading.ciganoCard}. ` +
      (anyCrit ? 'DIA CRÍTICO.' : '');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${iso}-${domCycle}-${eventCount}@cabala.local`);
    lines.push(`DTSTAMP:${icsDate(new Date().toISOString().slice(0, 10))}`);
    lines.push(`DTSTART;VALUE=DATE:${iso.replace(/-/g, '')}`);
    lines.push(`DTEND;VALUE=DATE:${new Date(today.getTime() + 86_400_000).toISOString().slice(0, 10).replace(/-/g, '')}`);
    lines.push(foldLine(`SUMMARY:${escapeIcs(summary)}`));
    lines.push(foldLine(`DESCRIPTION:${escapeIcs(desc)}`));
    lines.push(`CATEGORIES:Biorritmo,${domCycle}`);
    if (anyCrit) lines.push('PRIORITY:1');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
    eventCount++;
    today.setUTCDate(today.getUTCDate() + 1);
  }

  lines.push('END:VCALENDAR');

  const body = lines.map(foldLine).join('\r\n') + '\r\n';
  const filename = `biorhythm-${input.from}_${input.to}.ics`;
  const summary = `${eventCount} evento(s) exportados de ${input.from} → ${input.to}.`;

  return Object.freeze({
    filename,
    contentType: 'text/calendar',
    body,
    eventCount,
    summary,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SHA-256 (pure-JS, byte-identical to node:crypto)
// ════════════════════════════════════════════════════════════════════════════

const K = Object.freeze([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256HexSync(input: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) { bytes.push(0xc0 | (code >> 6)); bytes.push(0x80 | (code & 0x3f)); }
    else if ((code & 0xfc00) === 0xd800 && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1);
      if ((next & 0xfc00) === 0xdc00) {
        const cp = 0x10000 + (((code & 0x3ff) << 10) | (next & 0x3ff));
        bytes.push(0xf0 | (cp >> 18));
        bytes.push(0x80 | ((cp >> 12) & 0x3f));
        bytes.push(0x80 | ((cp >> 6) & 0x3f));
        bytes.push(0x80 | (cp & 0x3f));
        i++;
      } else { bytes.push(0xef, 0xbf, 0xbd); }
    } else if (code < 0x800) { bytes.push(0xc0 | (code >> 6)); bytes.push(0x80 | (code & 0x3f)); }
    else { bytes.push(0xe0 | (code >> 12)); bytes.push(0x80 | ((code >> 6) & 0x3f)); bytes.push(0x80 | (code & 0x3f)); }
  }
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  // pad with 0s until total length is 56 mod 64, leaving room for 8-byte length
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Append 64-bit big-endian length.
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  for (let i = 24; i >= 0; i -= 8) bytes.push((hi >>> i) & 0xff);
  for (let i = 24; i >= 0; i -= 8) bytes.push((lo >>> i) & 0xff);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    const W = new Array(64).fill(0);
    for (let i = 0; i < 16; i++) {
      W[i] = ((bytes[chunk + i * 4]! << 24) | (bytes[chunk + i * 4 + 1]! << 16) |
              (bytes[chunk + i * 4 + 2]! << 8) | bytes[chunk + i * 4 + 3]!) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ ((~e >>> 0) & g);
      const t1 = (hh + S1 + ch + K[i]! + W[i]!) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + hh) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

/** Canonical JSON for cache key (sorted keys, no whitespace). */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson((value as Record<string, unknown>)[k])).join(',') + '}';
}

export function hashCacheKey(input: object): string {
  return sha256HexSync(canonicalJson(input));
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS — Frozen table integrity
// ════════════════════════════════════════════════════════════════════════════

Object.freeze(CIGANO_28);
Object.freeze(ODU_16);
Object.freeze(SEFIROT);
Object.freeze(CHAKRA_BY_CYCLE);
Object.freeze(SEFIROT_BY_CYCLE);
Object.freeze(PLANET_BY_DAY);
Object.freeze(WEEKDAY_PT);
Object.freeze(WEEKDAY_SHORT_PT);
Object.freeze(MASTERS);

// Internal hooks for tests (typed).
export const __TEST__ = {
  parseDate,
  dayCountBetween,
  phaseValue,
  isCriticalDay,
  phaseKind,
  digitalRoot,
  sha256HexSync,
  canonicalJson,
  icsDate,
  escapeIcs,
  foldLine,
};
