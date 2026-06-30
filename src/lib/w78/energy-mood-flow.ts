// W78-D: Energy + Mood Flow engine
// Sacred mood + energy tracker with lunar phase correlation + 7-tradition micro-practices
// Mobile-first, WCAG 2.1 AA compliant, privacy-respecting

// =============================================================================
// Branded types
// =============================================================================

export type UserId = string & { readonly __brand: 'UserId' };
export type EntryId = string & { readonly __brand: 'EntryId' };
export type ISODate = string & { readonly __brand: 'ISODate' };
export type ISODateTime = string & { readonly __brand: 'ISODateTime' };
export type YearMonth = string & { readonly __brand: 'YearMonth' };

export const userId = (s: string): UserId => s as UserId;
export const entryId = (s: string): EntryId => s as EntryId;
export const isoDate = (s: string): ISODate => s as ISODate;
export const isoDateTime = (s: string): ISODateTime => s as ISODateTime;
export const yearMonth = (s: string): YearMonth => s as YearMonth;

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Locale = 'pt-BR' | 'en' | 'es';
export type Theme = 'light' | 'dark';

export type LunarPhase =
  | 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous'
  | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';

export type Tradition =
  | 'candomble' | 'umbanda' | 'ifa' | 'cabala'
  | 'astrologia' | 'tantra' | 'cigano-ramiro';

export type PracticeIntensity = 'leve' | 'moderada' | 'profunda';

// =============================================================================
// Domain types
// =============================================================================

export type TraditionPractice = {
  readonly tradition: Tradition;
  readonly practice: string;
  readonly intensity: PracticeIntensity;
};

export type MoodEnergyEntry = {
  readonly id: EntryId;
  readonly userId: UserId;
  readonly date: ISODate;
  readonly mood: MoodLevel;
  readonly energy: EnergyLevel;
  readonly note: Option<string>;
  readonly traditionPractice: Option<TraditionPractice>;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
};

export type EntryPatch = Partial<{
  readonly mood: MoodLevel;
  readonly energy: EnergyLevel;
  readonly note: Option<string>;
  readonly traditionPractice: Option<TraditionPractice>;
}>;

export type HeatmapDay = {
  readonly date: ISODate;
  readonly intensity: number;
  readonly moodAvg: number;
  readonly energyAvg: number;
  readonly entryCount: number;
  readonly lunarPhase: LunarPhase;
  readonly isEclipse: boolean;
};

export type WeeklyFlow = {
  readonly weekStart: ISODate;
  readonly days: ReadonlyArray<HeatmapDay>;
  readonly avgIntensity: number;
  readonly avgMood: number;
  readonly avgEnergy: number;
};

export type DayOfWeekAverages = {
  readonly 0: number; readonly 1: number; readonly 2: number; readonly 3: number;
  readonly 4: number; readonly 5: number; readonly 6: number;
};

export type TrendDirection = 'rising' | 'falling' | 'stable' | 'insufficient-data';

export type PatternAnomaly = {
  readonly date: ISODate;
  readonly kind: 'spike-high' | 'spike-low' | 'low-after-eclipse' | 'lunar-amplification';
  readonly description: string;
  readonly severity: number;
};

export type Eclipse = {
  readonly date: ISODate;
  readonly type: 'solar' | 'lunar';
  readonly tradition: Tradition;
  readonly intensityBoost: number;
};

export type LunarCorrelation = {
  readonly coefficient: number;
  readonly sampleSize: number;
  readonly strongestPhase: LunarPhase;
  readonly weakestPhase: LunarPhase;
  readonly eclipseDays: number;
};

export type MicroPractice = {
  readonly id: string;
  readonly tradition: Tradition;
  readonly practice: string;
  readonly targetMood?: MoodLevel;
  readonly targetEnergy?: 'low' | 'medium' | 'high';
  readonly durationMin: number;
  readonly description: string;
};

export type TraditionSuggestion = {
  readonly tradition: Tradition;
  readonly traditionName: string;
  readonly practices: ReadonlyArray<MicroPractice>;
};

export type MoodEnergyState = {
  readonly mood: MoodLevel;
  readonly energy: EnergyLevel;
};

export type Streak = {
  readonly userId: UserId;
  readonly currentDays: number;
  readonly longestDays: number;
  readonly lastCheckIn: Option<ISODate>;
  readonly totalCheckIns: number;
};

export type StreakUpdate = {
  readonly streak: Streak;
  readonly isNewRecord: boolean;
  readonly daysAdded: number;
};

export type DateRange = { readonly start: ISODate; readonly end: ISODate };

export type Option<T> = { readonly kind: 'some'; readonly value: T } | { readonly kind: 'none' };
export const Some = <T>(value: T): Option<T> => ({ kind: 'some', value });

export const none = <T>(): Option<T> => ({ kind: 'none' });

export type Result<T, E> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };
export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export type EntryError =
  | { readonly kind: 'not-found'; readonly entryId: EntryId }
  | { readonly kind: 'invalid-mood'; readonly value: number }
  | { readonly kind: 'invalid-energy'; readonly value: number }
  | { readonly kind: 'note-too-long'; readonly length: number }
  | { readonly kind: 'invalid-date'; readonly value: string }
  | { readonly kind: 'unauthorized'; readonly userId: UserId }
  | { readonly kind: 'duplicate'; readonly date: ISODate };

export type AnonymizeError =
  | { readonly kind: 'no-data'; readonly userId: UserId }
  | { readonly kind: 'already-anonymous'; readonly userId: UserId };

// =============================================================================
// Internal state
// =============================================================================

type UserState = {
  readonly entries: Map<EntryId, MoodEnergyEntry>;
  aggregateOnly: boolean;
  anonymous: boolean;
  streak: Streak;
  readonly checkIns: Set<ISODate>;
  anonymizedEntries: ReadonlyArray<HeatmapDay>;
};

const userStates = new Map<UserId, UserState>();

const _resetAllForTests = (): void => { userStates.clear(); };

const getOrCreateUserState = (uid: UserId): UserState => {
  let s = userStates.get(uid);
  if (!s) {
    s = {
      entries: new Map(),
      aggregateOnly: false,
      anonymous: false,
      streak: { userId: uid, currentDays: 0, longestDays: 0, lastCheckIn: none<ISODate>(), totalCheckIns: 0 },
      checkIns: new Set(),
      anonymizedEntries: [],
    };
    userStates.set(uid, s);
  }
  return s;
};

// =============================================================================
// Validation
// =============================================================================

const isValidMood = (n: number): n is MoodLevel => Number.isInteger(n) && n >= 1 && n <= 5;
const isValidEnergy = (n: number): n is EnergyLevel => Number.isInteger(n) && n >= 1 && n <= 10;
const isValidISODate = (s: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
const isValidNote = (s: string): boolean => s.length >= 0 && s.length <= 500;

const generateId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;

const nowISO = (): ISODateTime => isoDateTime(new Date().toISOString());

// =============================================================================
// Logging API
// =============================================================================

export function logEntry(
  uid: UserId,
  entry: Omit<MoodEnergyEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Result<EntryId, EntryError> {
  if (!isValidMood(entry.mood)) return Err({ kind: 'invalid-mood', value: entry.mood });
  if (!isValidEnergy(entry.energy)) return Err({ kind: 'invalid-energy', value: entry.energy });
  if (entry.note.kind === 'some' && !isValidNote(entry.note.value)) {
    return Err({ kind: 'note-too-long', length: entry.note.value.length });
  }
  if (!isValidISODate(entry.date)) return Err({ kind: 'invalid-date', value: entry.date });

  const state = getOrCreateUserState(uid);
  if (state.anonymous) return Err({ kind: 'unauthorized', userId: uid });

  for (const existing of state.entries.values()) {
    if (existing.date === entry.date) return Err({ kind: 'duplicate', date: entry.date });
  }

  const id = entryId(generateId('e'));
  const now = nowISO();
  const full: MoodEnergyEntry = Object.freeze({
    id, userId: uid, date: entry.date, mood: entry.mood, energy: entry.energy,
    note: entry.note, traditionPractice: entry.traditionPractice,
    createdAt: now, updatedAt: now,
  });
  state.entries.set(id, full);
  recordCheckIn(uid, entry.date);
  return Ok(id);
}

export function updateEntry(
  eid: EntryId,
  patch: EntryPatch,
): Result<MoodEnergyEntry, EntryError> {
  let foundUser: UserId | null = null;
  let existing: MoodEnergyEntry | null = null;

  for (const [uid, state] of userStates.entries()) {
    const e = state.entries.get(eid);
    if (e) { foundUser = uid; existing = e; break; }
  }

  if (!existing || !foundUser) return Err({ kind: 'not-found', entryId: eid });

  if (patch.mood !== undefined && !isValidMood(patch.mood)) {
    return Err({ kind: 'invalid-mood', value: patch.mood });
  }
  if (patch.energy !== undefined && !isValidEnergy(patch.energy)) {
    return Err({ kind: 'invalid-energy', value: patch.energy });
  }
  if (patch.note?.kind === 'some' && !isValidNote(patch.note.value)) {
    return Err({ kind: 'note-too-long', length: patch.note.value.length });
  }

  const updated: MoodEnergyEntry = Object.freeze({
    ...existing,
    mood: patch.mood ?? existing.mood,
    energy: patch.energy ?? existing.energy,
    note: patch.note ?? existing.note,
    traditionPractice: patch.traditionPractice ?? existing.traditionPractice,
    updatedAt: nowISO(),
  });

  const state = userStates.get(foundUser);
  if (state) state.entries.set(eid, updated);

  return Ok(updated);
}

export function deleteEntry(eid: EntryId): Result<void, EntryError> {
  for (const state of userStates.values()) {
    if (state.entries.has(eid)) {
      state.entries.delete(eid);
      return Ok(undefined);
    }
  }
  return Err({ kind: 'not-found', entryId: eid });
}

export function getEntry(eid: EntryId): Option<MoodEnergyEntry> {
  for (const state of userStates.values()) {
    const e = state.entries.get(eid);
    if (e) return Some(e);
  }
  return none<MoodEnergyEntry>();
}

export function listEntries(uid: UserId, range: DateRange): ReadonlyArray<MoodEnergyEntry> {
  const state = userStates.get(uid);
  if (!state) return [];
  const out: MoodEnergyEntry[] = [];
  for (const e of state.entries.values()) {
    if (e.date >= range.start && e.date <= range.end) out.push(e);
  }
  return Object.freeze(out.sort((a, b) => a.date.localeCompare(b.date)));
}

// =============================================================================
// Calendar Heatmap
// =============================================================================

const HEATMAP_PALETTE_LIGHT = [
  '#fee2e2', '#fed7aa', '#fef3c7', '#d9f99d', '#a7f3d0', '#bfdbfe', '#ddd6fe',
];
const HEATMAP_PALETTE_DARK = [
  '#7f1d1d', '#9a3412', '#854d0e', '#365314', '#115e59', '#1e3a8a', '#4c1d95',
];

export function getHeatmapColor(intensity: number, theme: Theme): string {
  const i = Math.max(0, Math.min(0.9999, intensity));
  const idx = Math.floor(i * 7);
  const palette = theme === 'light' ? HEATMAP_PALETTE_LIGHT : HEATMAP_PALETTE_DARK;
  return palette[idx] ?? palette[0]!;
}

function lunarPhaseAmplitude(phase: LunarPhase): number {
  switch (phase) {
    case 'full': return 2;
    case 'new': return 1.5;
    case 'first-quarter':
    case 'last-quarter': return 1;
    default: return 0.5;
  }
}

export function getIntensity(entry: MoodEnergyEntry): number {
  const moodScore = (entry.mood - 1) / 4;
  const energyScore = (entry.energy - 1) / 9;
  const raw = moodScore * 0.6 + energyScore * 0.4;
  const eclipses = getEclipsesInRange({ start: entry.date, end: entry.date });
  const eclipseBoost = eclipses.length > 0 ? 0.1 : 0;
  const phase = getLunarPhase(entry.date);
  const phaseMod = lunarPhaseAmplitude(phase) * 0.05;
  return Math.max(0, Math.min(1, raw + eclipseBoost + phaseMod));
}

export function getHeatmapAccessibilityText(day: HeatmapDay): string {
  const phaseName = getMoonPhaseName(day.lunarPhase, 'pt-BR');
  const eclipseNote = day.isEclipse ? ', eclipse' : '';
  return `${day.date}: intensidade ${(day.intensity * 100).toFixed(0)}%, humor ${day.moodAvg.toFixed(1)}, energia ${day.energyAvg.toFixed(1)}, fase lunar ${phaseName}${eclipseNote}`;
}

export function generateHeatmap(uid: UserId, ym: YearMonth): ReadonlyArray<HeatmapDay> {
  const parts = ym.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const daysInMonth = new Date(y, m, 0).getDate();
  const state = userStates.get(uid);

  const days: HeatmapDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${ym}-${String(d).padStart(2, '0')}`;
    const date = isoDate(dayStr);
    let entries: MoodEnergyEntry[] = [];
    if (state) {
      for (const e of state.entries.values()) {
        if (e.date === date) entries.push(e);
      }
    }
    const moodSum = entries.reduce((s, e) => s + e.mood, 0);
    const energySum = entries.reduce((s, e) => s + e.energy, 0);
    const moodAvg = entries.length > 0 ? moodSum / entries.length : 0;
    const energyAvg = entries.length > 0 ? energySum / entries.length : 0;
    const baseIntensity = entries.length > 0
      ? ((moodAvg - 1) / 4) * 0.6 + ((energyAvg - 1) / 9) * 0.4
      : 0;
    const phase = getLunarPhase(date);
    const eclipses = getEclipsesInRange({ start: date, end: date });
    const eclipseBoost = eclipses.length > 0 ? 0.1 : 0;
    const phaseMod = lunarPhaseAmplitude(phase) * 0.05;
    const intensity = Math.max(0, Math.min(1, baseIntensity + eclipseBoost + phaseMod));
    days.push(Object.freeze({
      date, intensity, moodAvg, energyAvg,
      entryCount: entries.length, lunarPhase: phase, isEclipse: eclipses.length > 0,
    }));
  }
  return Object.freeze(days);
}

// =============================================================================
// Weekly patterns
// =============================================================================

export function getWeeklyFlow(uid: UserId, weekStart: ISODate): WeeklyFlow {
  const start = new Date(weekStart + 'T00:00:00Z');
  const days: HeatmapDay[] = [];
  let totalIntensity = 0, totalMood = 0, totalEnergy = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = isoDate(`${yyyy}-${mm}-${dd}`);
    const ym = yearMonth(`${yyyy}-${mm}`);
    const heatmap = generateHeatmap(uid, ym);
    const day = heatmap.find((h) => h.date === dateStr);
    const heatmapDay: HeatmapDay = day ?? Object.freeze({
      date: dateStr, intensity: 0, moodAvg: 0, energyAvg: 0,
      entryCount: 0, lunarPhase: getLunarPhase(dateStr), isEclipse: false,
    });
    days.push(heatmapDay);
    totalIntensity += heatmapDay.intensity;
    totalMood += heatmapDay.moodAvg;
    totalEnergy += heatmapDay.energyAvg;
  }
  return Object.freeze({
    weekStart, days: Object.freeze(days),
    avgIntensity: totalIntensity / 7, avgMood: totalMood / 7, avgEnergy: totalEnergy / 7,
  });
}

export function getDayOfWeekAverages(uid: UserId, range: DateRange): DayOfWeekAverages {
  const state = userStates.get(uid);
  const sums = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  if (state) {
    for (const e of state.entries.values()) {
      if (e.date < range.start || e.date > range.end) continue;
      const day = new Date(e.date + 'T00:00:00Z').getUTCDay();
      sums[day] = (sums[day] ?? 0) + (e.mood + e.energy);
      counts[day] = (counts[day] ?? 0) + 1;
    }
  }
  const result: Record<number, number> = {};
  for (let i = 0; i < 7; i++) {
    result[i] = (counts[i] ?? 0) > 0 ? ((sums[i] ?? 0) / (counts[i] ?? 1)) : 0;
  }
  return Object.freeze(result as DayOfWeekAverages);
}

export function getTrendDirection(uid: UserId, range: DateRange): TrendDirection {
  const state = userStates.get(uid);
  if (!state) return 'insufficient-data';
  const entries: MoodEnergyEntry[] = [];
  for (const e of state.entries.values()) {
    if (e.date >= range.start && e.date <= range.end) entries.push(e);
  }
  if (entries.length < 3) return 'insufficient-data';
  entries.sort((a, b) => a.date.localeCompare(b.date));
  const mid = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, mid);
  const secondHalf = entries.slice(mid);
  const avgFirst = firstHalf.reduce((s, e) => s + e.mood + e.energy, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, e) => s + e.mood + e.energy, 0) / secondHalf.length;
  const delta = avgSecond - avgFirst;
  if (Math.abs(delta) < 0.5) return 'stable';
  return delta > 0 ? 'rising' : 'falling';
}

export function detectPatternAnomalies(uid: UserId, range: DateRange): ReadonlyArray<PatternAnomaly> {
  const state = userStates.get(uid);
  if (!state || state.aggregateOnly) return [];
  const entries: MoodEnergyEntry[] = [];
  for (const e of state.entries.values()) {
    if (e.date >= range.start && e.date <= range.end) entries.push(e);
  }
  if (entries.length < 5) return [];
  const intensities = entries.map((e) => getIntensity(e));
  const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
  const variance = intensities.reduce((s, i) => s + (i - mean) ** 2, 0) / intensities.length;
  const stddev = Math.sqrt(variance);
  const anomalies: PatternAnomaly[] = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    const intensity = intensities[i]!;
    const z = (intensity - mean) / (stddev || 1);
    if (z > 2) {
      anomalies.push(Object.freeze({
        date: e.date, kind: 'spike-high',
        description: `Pico de energia+humor (${(intensity * 100).toFixed(0)}%)`,
        severity: Math.min(1, Math.abs(z) / 3),
      }));
    } else if (z < -2) {
      anomalies.push(Object.freeze({
        date: e.date, kind: 'spike-low',
        description: `Queda acentuada (${(intensity * 100).toFixed(0)}%)`,
        severity: Math.min(1, Math.abs(z) / 3),
      }));
    }
    const eclipses = getEclipsesInRange({ start: e.date, end: e.date });
    if (eclipses.length > 0 && intensity < 0.3) {
      anomalies.push(Object.freeze({
        date: e.date, kind: 'low-after-eclipse',
        description: `Baixa energia após eclipse ${eclipses[0]!.type === 'solar' ? 'solar' : 'lunar'}`,
        severity: 0.7,
      }));
    }
  }
  return Object.freeze(anomalies);
}

// =============================================================================
// Lunar correlation
// =============================================================================

const NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14, 0, 0);
const SYNODIC_MONTH_MS = 29.530588853 * 24 * 60 * 60 * 1000;

export function getLunarPhase(date: ISODate): LunarPhase {
  const dayMs = Date.UTC(
    Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)),
    12, 0, 0, 0,
  );
  const cycles = (dayMs - NEW_MOON_EPOCH_MS) / SYNODIC_MONTH_MS;
  let phase = cycles - Math.floor(cycles);
  if (phase < 0) phase += 1;
  const idx = Math.floor(phase * 8) % 8;
  switch (idx) {
    case 0: return 'new';
    case 1: return 'waxing-crescent';
    case 2: return 'first-quarter';
    case 3: return 'waxing-gibbous';
    case 4: return 'full';
    case 5: return 'waning-gibbous';
    case 6: return 'last-quarter';
    case 7: return 'waning-crescent';
    default: return 'new';
  }
}

const LUNAR_PHASE_NAMES: Record<Locale, Record<LunarPhase, string>> = {
  'pt-BR': {
    'new': 'Lua Nova', 'waxing-crescent': 'Lua Crescente',
    'first-quarter': 'Quarto Crescente', 'waxing-gibbous': 'Gibosa Crescente',
    'full': 'Lua Cheia', 'waning-gibbous': 'Gibosa Minguante',
    'last-quarter': 'Quarto Minguante', 'waning-crescent': 'Lua Minguante',
  },
  en: {
    'new': 'New Moon', 'waxing-crescent': 'Waxing Crescent',
    'first-quarter': 'First Quarter', 'waxing-gibbous': 'Waxing Gibbous',
    'full': 'Full Moon', 'waning-gibbous': 'Waning Gibbous',
    'last-quarter': 'Last Quarter', 'waning-crescent': 'Waning Crescent',
  },
  es: {
    'new': 'Luna Nueva', 'waxing-crescent': 'Creciente',
    'first-quarter': 'Cuarto Creciente', 'waxing-gibbous': 'Gibosa Creciente',
    'full': 'Luna Llena', 'waning-gibbous': 'Gibosa Menguante',
    'last-quarter': 'Cuarto Menguante', 'waning-crescent': 'Menguante',
  },
};

export function getMoonPhaseName(phase: LunarPhase, locale: Locale): string {
  return LUNAR_PHASE_NAMES[locale][phase];
}

const ECLIPSE_CATALOG: ReadonlyArray<Eclipse> = Object.freeze<readonly Eclipse[]>([
  Object.freeze({ date: isoDate('2024-04-08'), type: 'solar', tradition: 'cigano-ramiro', intensityBoost: 0.85 }),
  Object.freeze({ date: isoDate('2024-09-18'), type: 'lunar', tradition: 'cabala', intensityBoost: 0.7 }),
  Object.freeze({ date: isoDate('2024-10-02'), type: 'solar', tradition: 'astrologia', intensityBoost: 0.85 }),
  Object.freeze({ date: isoDate('2025-03-14'), type: 'lunar', tradition: 'umbanda', intensityBoost: 0.7 }),
  Object.freeze({ date: isoDate('2025-03-29'), type: 'solar', tradition: 'cigano-ramiro', intensityBoost: 0.85 }),
  Object.freeze({ date: isoDate('2025-09-07'), type: 'lunar', tradition: 'candomble', intensityBoost: 0.7 }),
  Object.freeze({ date: isoDate('2025-09-21'), type: 'solar', tradition: 'ifa', intensityBoost: 0.85 }),
  Object.freeze({ date: isoDate('2026-02-17'), type: 'solar', tradition: 'astrologia', intensityBoost: 0.85 }),
  Object.freeze({ date: isoDate('2026-08-12'), type: 'solar', tradition: 'cabala', intensityBoost: 0.85 }),
  Object.freeze({ date: isoDate('2026-08-28'), type: 'lunar', tradition: 'tantra', intensityBoost: 0.7 }),
]);

export function getEclipsesInRange(range: DateRange): ReadonlyArray<Eclipse> {
  return ECLIPSE_CATALOG.filter((e) => e.date >= range.start && e.date <= range.end);
}

export function getEclipseIntensityBoost(uid: UserId, eclipseDate: ISODate): number {
  const eclipses = getEclipsesInRange({ start: eclipseDate, end: eclipseDate });
  if (eclipses.length === 0) return 0;
  const state = userStates.get(uid);
  if (!state || state.aggregateOnly) {
    return eclipses[0]!.intensityBoost * 0.5;
  }
  return eclipses[0]!.intensityBoost;
}

export function getLunarCorrelation(uid: UserId, range: DateRange): LunarCorrelation {
  const state = userStates.get(uid);
  const entries: MoodEnergyEntry[] = [];
  if (state && !state.aggregateOnly) {
    for (const e of state.entries.values()) {
      if (e.date >= range.start && e.date <= range.end) entries.push(e);
    }
  }
  if (entries.length < 5) {
    return Object.freeze({
      coefficient: 0, sampleSize: entries.length,
      strongestPhase: 'full', weakestPhase: 'new', eclipseDays: 0,
    });
  }
  const phaseBuckets: Record<LunarPhase, { sum: number; count: number }> = {
    'new': { sum: 0, count: 0 }, 'waxing-crescent': { sum: 0, count: 0 },
    'first-quarter': { sum: 0, count: 0 }, 'waxing-gibbous': { sum: 0, count: 0 },
    'full': { sum: 0, count: 0 }, 'waning-gibbous': { sum: 0, count: 0 },
    'last-quarter': { sum: 0, count: 0 }, 'waning-crescent': { sum: 0, count: 0 },
  };
  for (const e of entries) {
    const phase = getLunarPhase(e.date);
    const intensity = getIntensity(e);
    phaseBuckets[phase].sum += intensity;
    phaseBuckets[phase].count += 1;
  }
  let strongestPhase: LunarPhase = 'full';
  let weakestPhase: LunarPhase = 'new';
  let strongestAvg = -1;
  let weakestAvg = 2;
  for (const phase of Object.keys(phaseBuckets) as LunarPhase[]) {
    const b = phaseBuckets[phase];
    if (b.count === 0) continue;
    const avg = b.sum / b.count;
    if (avg > strongestAvg) { strongestAvg = avg; strongestPhase = phase; }
    if (avg < weakestAvg) { weakestAvg = avg; weakestPhase = phase; }
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (const e of entries) {
    const phase = getLunarPhase(e.date);
    const phaseNum =
      phase === 'new' ? 0
      : phase === 'waxing-crescent' ? 1
      : phase === 'first-quarter' ? 2
      : phase === 'waxing-gibbous' ? 3
      : phase === 'full' ? 4
      : phase === 'waning-gibbous' ? 3
      : phase === 'last-quarter' ? 2
      : 1;
    xs.push(phaseNum);
    ys.push(getIntensity(e));
  }
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let covXY = 0, varX = 0, varY = 0;
  for (let i = 0; i < n; i++) {
    const dx = (xs[i] ?? 0) - meanX;
    const dy = (ys[i] ?? 0) - meanY;
    covXY += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }
  const denom = Math.sqrt(varX * varY);
  const coefficient = denom > 0 ? Math.abs(covXY / denom) : 0;
  const eclipses = getEclipsesInRange(range);
  return Object.freeze({
    coefficient: Math.min(1, coefficient), sampleSize: entries.length,
    strongestPhase, weakestPhase, eclipseDays: eclipses.length,
  });
}

// =============================================================================
// Tradition micro-practices
// =============================================================================

const MICRO_PRACTICES: ReadonlyArray<MicroPractice> = Object.freeze<readonly MicroPractice[]>([
  // Candomblé
  Object.freeze({ id: 'cd-l1', tradition: 'candomble', practice: 'Acender vela branca para Oxalá', targetMood: 1, durationMin: 5, description: 'Acenda uma vela branca e ore em silêncio para Oxalá.' }),
  Object.freeze({ id: 'cd-l2', tradition: 'candomble', practice: 'Oferenda simples: flores brancas', targetMood: 2, durationMin: 10, description: 'Coloque flores brancas num copo d\'água como oferenda.' }),
  Object.freeze({ id: 'cd-e1', tradition: 'candomble', practice: 'Banho de folhas de Iansã', targetEnergy: 'low', durationMin: 15, description: 'Prepare um banho ritual com folhas de Iansã.' }),
  Object.freeze({ id: 'cd-e2', tradition: 'candomble', practice: 'Cantiga para Iemanjá', targetEnergy: 'medium', durationMin: 5, description: 'Cante uma cantiga para Iemanjá.' }),
  Object.freeze({ id: 'cd-h1', tradition: 'candomble', practice: 'Cantiga para Iemanjá em roda', targetMood: 5, durationMin: 10, description: 'Cante com alegria em roda a saudação a Iemanjá.' }),
  Object.freeze({ id: 'cd-h2', tradition: 'candomble', practice: 'Saudação a Oxum no rio', targetMood: 4, durationMin: 20, description: 'Ofereça flores amarelas à beira do rio para Oxum.' }),
  // Candomblé (high energy)
  Object.freeze({ id: 'cd-he1', tradition: 'candomble', practice: 'Dança dos Orixás', targetEnergy: 'high', durationMin: 30, description: 'Dance a saudação dos Orixás em alta energia.' }),
  Object.freeze({ id: 'cd-he2', tradition: 'candomble', practice: 'Cantos de Xangô', targetEnergy: 'high', durationMin: 20, description: 'Cante os pontos de Xangô com vigor.' }),

  // Umbanda
  Object.freeze({ id: 'um-l1', tradition: 'umbanda', practice: 'Agradecer ao Preto-Velho', targetMood: 1, durationMin: 5, description: 'Acenda uma vela e peça paz ao Preto-Velho.' }),
  Object.freeze({ id: 'um-l2', tradition: 'umbanda', practice: 'Defumação leve com ervas', targetMood: 2, durationMin: 10, description: 'Queime um pouco de alecrim para limpar o ambiente.' }),
  Object.freeze({ id: 'um-e1', tradition: 'umbanda', practice: 'Saudação aos Caboclos', targetEnergy: 'low', durationMin: 5, description: 'Mentalize a força dos Caboclos e peça ânimo.' }),
  Object.freeze({ id: 'um-e2', tradition: 'umbanda', practice: 'Girar a fita', targetEnergy: 'medium', durationMin: 10, description: 'Gire uma fita branca sete vezes para limpar a energia.' }),
  Object.freeze({ id: 'um-h1', tradition: 'umbanda', practice: 'Ponto cantado de Caboclo', targetMood: 5, durationMin: 15, description: 'Cante um ponto riscado de Caboclo com alegria.' }),
  Object.freeze({ id: 'um-h2', tradition: 'umbanda', practice: 'Saudação a Baiana', targetMood: 4, durationMin: 10, description: 'Vista uma saia rodada e dance em honra à Baiana.' }),
  // Ifá
  Object.freeze({ id: 'if-l1', tradition: 'ifa', practice: 'Contar Mérindilogun no Ifá', targetMood: 1, durationMin: 20, description: 'Conte os 16 búzios pedindo orientação.' }),
  Object.freeze({ id: 'if-l2', tradition: 'ifa', practice: 'Meditação sobre Ogbe', targetMood: 2, durationMin: 15, description: 'Medite sobre o Odu Ogbe — força e luz.' }),
  Object.freeze({ id: 'if-e1', tradition: 'ifa', practice: 'Odu do dia: gratidão', targetEnergy: 'low', durationMin: 10, description: 'Consulte o Odu do dia e dê graças.' }),
  Object.freeze({ id: 'if-e2', tradition: 'ifa', practice: 'Bater o opaxorô', targetEnergy: 'medium', durationMin: 5, description: 'Bata o opaxorô três vezes para Orunmila.' }),
  Object.freeze({ id: 'if-h1', tradition: 'ifa', practice: 'Saudação a Orunmila em cântico', targetMood: 5, durationMin: 10, description: 'Cante em honra a Orunmila.' }),
  Object.freeze({ id: 'if-h2', tradition: 'ifa', practice: 'Oferecer akara a Xangô', targetMood: 4, durationMin: 15, description: 'Prepare akara como oferenda a Xangô.' }),
  // Cabala
  Object.freeze({ id: 'cb-l1', tradition: 'cabala', practice: 'Meditação em Keter', targetMood: 1, durationMin: 20, description: 'Sente-se em silêncio e medite sobre a coroa (Keter).' }),
  Object.freeze({ id: 'cb-l2', tradition: 'cabala', practice: 'Leitura do Zohar', targetMood: 2, durationMin: 30, description: 'Leia um trecho do Zohar para o dia.' }),
  Object.freeze({ id: 'cb-e1', tradition: 'cabala', practice: 'Repetir Nome Divino', targetEnergy: 'low', durationMin: 10, description: 'Repita o Nome Divino em meditação.' }),
  Object.freeze({ id: 'cb-e2', tradition: 'cabala', practice: 'Visualização na Árvore da Vida', targetEnergy: 'medium', durationMin: 15, description: 'Percorra as 10 Sefirot mentalmente.' }),
  Object.freeze({ id: 'cb-h1', tradition: 'cabala', practice: 'Estudo do Tikkun', targetMood: 5, durationMin: 25, description: 'Estude uma seção do Tikkun.' }),
  Object.freeze({ id: 'cb-h2', tradition: 'cabala', practice: 'Oração de gratidão (Modeh Ani)', targetMood: 4, durationMin: 5, description: 'Recite o Modeh Ani ao acordar.' }),
  // Astrologia
  Object.freeze({ id: 'as-l1', tradition: 'astrologia', practice: 'Observar o céu', targetMood: 1, durationMin: 10, description: 'Saia e olhe o céu por alguns minutos.' }),
  Object.freeze({ id: 'as-l2', tradition: 'astrologia', practice: 'Anotar sonho', targetMood: 2, durationMin: 10, description: 'Escreva o sonho que teve ao acordar.' }),
  Object.freeze({ id: 'as-e1', tradition: 'astrologia', practice: 'Verificar trânsitos lunares', targetEnergy: 'low', durationMin: 5, description: 'Cheque o trânsito lunar do dia.' }),
  Object.freeze({ id: 'as-e2', tradition: 'astrologia', practice: 'Meditação no planeta regente', targetEnergy: 'medium', durationMin: 15, description: 'Medite sob a regência do dia.' }),
  Object.freeze({ id: 'as-h1', tradition: 'astrologia', practice: 'Celebrar o trânsito lunar', targetMood: 5, durationMin: 20, description: 'Comemore o aspecto lunar com um ritual.' }),
  Object.freeze({ id: 'as-h2', tradition: 'astrologia', practice: 'Ritual de Vênus', targetMood: 4, durationMin: 15, description: 'Acenda uma vela rosa em honra a Vênus.' }),
  // Tantra
  Object.freeze({ id: 'tn-l1', tradition: 'tantra', practice: 'Pranayama alternado', targetMood: 1, durationMin: 10, description: 'Respire alternando narinas (Nadi Shodhana).' }),
  Object.freeze({ id: 'tn-l2', tradition: 'tantra', practice: 'Yin yoga suave', targetMood: 2, durationMin: 25, description: 'Pratique uma sequência de Yin yoga.' }),
  Object.freeze({ id: 'tn-e1', tradition: 'tantra', practice: 'Kundalini suave', targetEnergy: 'low', durationMin: 15, description: 'Faça uma meditação Kundalini leve.' }),
  Object.freeze({ id: 'tn-e2', tradition: 'tantra', practice: 'Mantra Gayatri', targetEnergy: 'medium', durationMin: 10, description: 'Repita o mantra Gayatri 108 vezes.' }),
  Object.freeze({ id: 'tn-h1', tradition: 'tantra', practice: 'Kundalini ativa', targetMood: 5, durationMin: 30, description: 'Kundalini Yoga completo com fogo interno.' }),
  Object.freeze({ id: 'tn-h2', tradition: 'tantra', practice: 'Meditação dos chakras', targetMood: 4, durationMin: 20, description: 'Medite nos sete chakras principais.' }),
  // Cigano Ramiro
  Object.freeze({ id: 'cr-l1', tradition: 'cigano-ramiro', practice: 'Puxar 1 carta de orientação', targetMood: 1, durationMin: 5, description: 'Tire uma carta cigana e medite no conselho.' }),
  Object.freeze({ id: 'cr-l2', tradition: 'cigano-ramiro', practice: 'Acender vela vermelha', targetMood: 2, durationMin: 5, description: 'Acenda uma vela vermelha para ânimo.' }),
  Object.freeze({ id: 'cr-e1', tradition: 'cigano-ramiro', practice: 'Defumação com arruda', targetEnergy: 'low', durationMin: 10, description: 'Queime arruda seca para proteção.' }),
  Object.freeze({ id: 'cr-e2', tradition: 'cigano-ramiro', practice: 'Banho de alecrim', targetEnergy: 'medium', durationMin: 15, description: 'Tome um banho de alecrim para vigor.' }),
  Object.freeze({ id: 'cr-h1', tradition: 'cigano-ramiro', practice: 'Agradecer às Ciganas', targetMood: 5, durationMin: 5, description: 'Agradeça às Ciganas pela alegria do dia.' }),
  Object.freeze({ id: 'cr-h2', tradition: 'cigano-ramiro', practice: 'Puxada cigana completa', targetMood: 4, durationMin: 30, description: 'Faça uma puxada cigana com 7 cartas.' }),
]);

const TRADITION_NAMES: Record<Tradition, string> = {
  'candomble': 'Candomblé', 'umbanda': 'Umbanda', 'ifa': 'Ifá',
  'cabala': 'Cabala', 'astrologia': 'Astrologia',
  'tantra': 'Tantra', 'cigano-ramiro': 'Cigano Ramiro',
};

function moodBucket(m: MoodLevel): 'low' | 'medium' | 'high' {
  if (m <= 2) return 'low';
  if (m === 3) return 'medium';
  return 'high';
}
function energyBucket(e: EnergyLevel): 'low' | 'medium' | 'high' {
  if (e <= 3) return 'low';
  if (e <= 6) return 'medium';
  return 'high';
}

export function suggestMicroPractice(
  state: MoodEnergyState,
  tradition: Tradition,
): ReadonlyArray<MicroPractice> {
  const mBucket = moodBucket(state.mood);
  const eBucket = energyBucket(state.energy);
  const matches = MICRO_PRACTICES.filter((p) => {
    if (p.tradition !== tradition) return false;
    const moodMatch = p.targetMood !== undefined && moodBucket(p.targetMood) === mBucket;
    const energyMatch = p.targetEnergy !== undefined && p.targetEnergy === eBucket;
    return moodMatch || energyMatch;
  });
  if (matches.length >= 3) {
    return Object.freeze(matches.slice(0, 3).map((p) => Object.freeze({ ...p })));
  }
  const allTradition = MICRO_PRACTICES.filter((p) => p.tradition === tradition);
  const seen = new Set(matches.map((p) => p.id));
  const padded: MicroPractice[] = [...matches];
  for (const p of allTradition) {
    if (seen.has(p.id)) continue;
    padded.push(p);
    if (padded.length >= 3) break;
  }
  return Object.freeze(padded.map((p) => Object.freeze({ ...p })));
}

export function getAllTraditionSuggestions(state: MoodEnergyState): ReadonlyArray<TraditionSuggestion> {
  const traditions: Tradition[] = [
    'candomble', 'umbanda', 'ifa', 'cabala', 'astrologia', 'tantra', 'cigano-ramiro',
  ];
  return Object.freeze(traditions.map((t) => Object.freeze({
    tradition: t, traditionName: TRADITION_NAMES[t], practices: suggestMicroPractice(state, t),
  })));
}

export function getPracticesForMood(mood: MoodLevel): ReadonlyArray<MicroPractice> {
  return Object.freeze(
    MICRO_PRACTICES.filter((p) => p.targetMood !== undefined && moodBucket(p.targetMood) === moodBucket(mood))
      .map((p) => Object.freeze({ ...p })),
  );
}

export function getPracticesForEnergy(energy: EnergyLevel): ReadonlyArray<MicroPractice> {
  return Object.freeze(
    MICRO_PRACTICES.filter((p) => p.targetEnergy !== undefined && p.targetEnergy === energyBucket(energy))
      .map((p) => Object.freeze({ ...p })),
  );
}

// =============================================================================
// Streaks
// =============================================================================

const dayDiff = (a: ISODate, b: ISODate): number => {
  const da = Date.UTC(Number(a.slice(0, 4)), Number(a.slice(5, 7)) - 1, Number(a.slice(8, 10)));
  const db = Date.UTC(Number(b.slice(0, 4)), Number(b.slice(5, 7)) - 1, Number(b.slice(8, 10)));
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};

export function recordCheckIn(uid: UserId, date: ISODate): StreakUpdate {
  const state = getOrCreateUserState(uid);
  if (state.checkIns.has(date)) {
    return Object.freeze({ streak: state.streak, isNewRecord: false, daysAdded: 0 });
  }
  state.checkIns.add(date);
  const last = state.streak.lastCheckIn;
  let newCurrent = 1;
  if (last.kind === 'some') {
    const diff = dayDiff(last.value, date);
    if (diff === 0) newCurrent = state.streak.currentDays;
    else if (diff === 1) newCurrent = state.streak.currentDays + 1;
    else newCurrent = 1;
  }
  const isNewRecord = newCurrent > state.streak.longestDays;
  const updated: Streak = Object.freeze({
    userId: uid,
    currentDays: newCurrent,
    longestDays: isNewRecord ? newCurrent : state.streak.longestDays,
    lastCheckIn: Some(date),
    totalCheckIns: state.streak.totalCheckIns + 1,
  });
  const daysAdded = newCurrent - state.streak.currentDays;
  state.streak = updated;
  return Object.freeze({ streak: updated, isNewRecord, daysAdded });
}

export function getCheckInStreak(uid: UserId): Streak {
  const state = userStates.get(uid);
  if (!state) return Object.freeze({
    userId: uid, currentDays: 0, longestDays: 0, lastCheckIn: none<ISODate>(), totalCheckIns: 0,
  });
  return state.streak;
}

export function isStreakBroken(uid: UserId, asOf: ISODate): boolean {
  const state = userStates.get(uid);
  if (!state) return false;
  const last = state.streak.lastCheckIn;
  if (last.kind === 'none') return false;
  const diff = dayDiff(last.value, asOf);
  return diff > 1;
}

// =============================================================================
// Export
// =============================================================================

export function exportAsJson(uid: UserId, range: DateRange): string {
  const entries = listEntries(uid, range);
  return JSON.stringify({
    userId: uid, range, exportedAt: nowISO(),
    entries: entries.map((e) => ({
      id: e.id, date: e.date, mood: e.mood, energy: e.energy,
      note: e.note.kind === 'some' ? e.note.value : null,
      traditionPractice: e.traditionPractice.kind === 'some' ? {
        tradition: e.traditionPractice.value.tradition,
        practice: e.traditionPractice.value.practice,
        intensity: e.traditionPractice.value.intensity,
      } : null,
    })),
  }, null, 2);
}

export function exportAsCsv(uid: UserId, range: DateRange): string {
  const entries = listEntries(uid, range);
  const header = 'id,date,mood,energy,note,tradition,practice,intensity\n';
  const rows = entries.map((e) => {
    const note = e.note.kind === 'some' ? `"${e.note.value.replace(/"/g, '""')}"` : '';
    const tp = e.traditionPractice.kind === 'some' ? e.traditionPractice.value : null;
    const trad = tp ? tp.tradition : '';
    const prac = tp ? `"${tp.practice.replace(/"/g, '""')}"` : '';
    const intensity = tp ? tp.intensity : '';
    return `${e.id},${e.date},${e.mood},${e.energy},${note},${trad},${prac},${intensity}`;
  }).join('\n');
  return header + rows + '\n';
}

export function exportHeatmapAsPng(): never {
  throw new Error('feature not implemented: exportHeatmapAsPng — use HTML5 canvas client-side for now');
}

// =============================================================================
// Privacy
// =============================================================================

export function isAggregateOnly(uid: UserId): boolean {
  const state = userStates.get(uid);
  return state?.aggregateOnly ?? false;
}

export function setAggregateOnly(uid: UserId, value: boolean): void {
  const state = getOrCreateUserState(uid);
  state.aggregateOnly = value;
}

export function anonymizeUser(uid: UserId): Result<void, AnonymizeError> {
  const state = userStates.get(uid);
  if (!state) return Err({ kind: 'no-data', userId: uid });
  if (state.anonymous) return Err({ kind: 'already-anonymous', userId: uid });
  const todayParts = new Date().toISOString().slice(0, 7);
  const ym = yearMonth(todayParts);
  const heatmap = generateHeatmap(uid, ym);
  state.anonymizedEntries = heatmap;
  state.entries.clear();
  state.anonymous = true;
  state.checkIns.clear();
  state.streak = Object.freeze({
    userId: uid, currentDays: 0, longestDays: 0, lastCheckIn: none<ISODate>(), totalCheckIns: 0,
  });
  return Ok(undefined);
}

export const _internal = {
  _resetAllForTests, getOrCreateUserState,
  NEW_MOON_EPOCH_MS, SYNODIC_MONTH_MS, ECLIPSE_CATALOG,
};
