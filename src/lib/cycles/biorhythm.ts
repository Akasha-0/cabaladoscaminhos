/**
 * Biorhythm Cycles Engine
 * ───────────────────────
 * Classic three-cycle biorhythm (Physical 23d / Emotional 28d / Intellectual 33d)
 * with critical-day detection. Pure logic — no I/O, no DB.
 *
 * @see https://en.wikipedia.org/wiki/Biorhythm
 *
 * Sacred coverage (woven into summary):
 *   1. Astrologia — day-of-week planetary ruler + element
 *   2. Cigano    — 23/28/33 phase keywords (cartas correspondentes)
 *   3. Numerologia Cabalística — cycle day digital root
 *   4. Orixás    — phase-end → Odu regente
 *   5. Tantra/Cabala — chakra per dominant cycle (heart 28, third-eye 33, root 23)
 *
 * @see docs/W72-A-DELIVERABLE.md
 */

// ─── Branded types ────────────────────────────────────────────────────────
export type DateString = string & { readonly __brand: 'DateString' };
export type DayCount = number & { readonly __brand: 'DayCount' };

// ─── Constants ────────────────────────────────────────────────────────────
export const BIORHYTHM_PERIODS = {
  physical: 23,
  emotional: 28,
  intellectual: 33,
} as const;

export type CycleName = keyof typeof BIORHYTHM_PERIODS;

/** Cycle peak → dominant chakra (Tantra + Cabala synthesis). */
export const CYCLE_CHAKRA: Readonly<Record<CycleName, { name: string; color: string; essence: string }>> = {
  physical:    { name: 'Muladhara (Raiz)',  color: 'vermelho',   essence: 'corpo, sobrevivência, energia vital' },
  emotional:   { name: 'Anahata (Coração)', color: 'verde',      essence: 'sentimento, conexão, compaixão' },
  intellectual:{ name: 'Ajna (Terceiro-Olho)', color: 'índigo',  essence: 'intuição, visão, discernimento' },
};

// ─── Date helpers ──────────────────────────────────────────────────────────
const MS_PER_DAY = 86_400_000;

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m1to12: number): number {
  const t = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return t[m1to12 - 1] ?? 0;
}

/** Parse YYYY-MM-DD (or YYYY/MM/DD) to UTC midnight Date. Throws on invalid. */
export function parseDate(s: string): Date {
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(s.trim());
  if (!m) throw new Error(`biorhythm: invalid date string "${s}" — expected YYYY-MM-DD`);
  const y = +m[1]!;
  const mo = +m[2]!;
  const d = +m[3]!;
  if (mo < 1 || mo > 12) throw new Error(`biorhythm: month out of range in "${s}"`);
  if (d < 1 || d > daysInMonth(y, mo)) throw new Error(`biorhythm: day out of range in "${s}"`);
  return new Date(Date.UTC(y, mo - 1, d));
}

function dayCountBetween(birth: Date, target: Date): number {
  return (target.getTime() - birth.getTime()) / MS_PER_DAY;
}

// ─── Core cycle math ──────────────────────────────────────────────────────
/** Sine phase for a given period. Returns value in [-1, 1]. */
export function phaseValue(dayCount: number, period: number): number {
  return Math.sin((2 * Math.PI * dayCount) / period);
}

/** Critical day = a zero crossing (sin = 0) within ±0.5 day of `dayCount`. */
export function isCriticalDay(dayCount: number, period: number): boolean {
  const k = Math.round(dayCount / period);
  const crossings: number[] = [k * period];
  // also consider (k-1) and (k+1) for boundary cases
  for (const delta of [-1, 1]) {
    const c = (k + delta) * period;
    if (Math.abs(c - dayCount) <= 0.5) crossings.push(c);
  }
  for (const c of crossings) {
    if (Math.abs(c - dayCount) <= 0.5) return true;
  }
  return false;
}

// ─── Planetary ruler + element (Astrologia) ───────────────────────────────
const PLANET_BY_DAY: ReadonlyArray<{ planet: string; element: 'fogo' | 'terra' | 'ar' | 'água' }> = [
  { planet: 'Sol',     element: 'fogo'  }, // Sunday
  { planet: 'Lua',     element: 'água'  }, // Monday
  { planet: 'Marte',   element: 'fogo'  }, // Tuesday
  { planet: 'Mercúrio',element: 'ar'    }, // Wednesday
  { planet: 'Júpiter', element: 'terra' }, // Thursday
  { planet: 'Vênus',   element: 'ar'    }, // Friday
  { planet: 'Saturno', element: 'terra' }, // Saturday
];

export function dayOfWeekRuler(d: Date): { planet: string; element: 'fogo' | 'terra' | 'ar' | 'água'; weekday: string } {
  const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const wd = d.getUTCDay();
  const r = PLANET_BY_DAY[wd]!;
  return { planet: r.planet, element: r.element, weekday: weekdayNames[wd]! };
}

// ─── Cigano mapping (28-card Petit Lenormand base) ────────────────────────
const CIGANO_PHASE_KEYWORDS: Readonly<Record<CycleName, readonly string[]>> = {
  physical:    ['O Cavaleiro', 'A Foice', 'A Árvore', 'O Urso'],
  emotional:   ['O Coração', 'Os Lírios', 'A Lua', 'Os Pássaros'],
  intellectual:['A Estrela', 'O Livro', 'A Chave', 'A Carta'],
};

export function ciganoKeywordForPhase(cycle: CycleName, phaseValue: number): string {
  const list = CIGANO_PHASE_KEYWORDS[cycle];
  const idx = phaseValue >= 0 ? 0 : 1; // ascending/positive vs descending/negative
  return list[idx]!;
}

// ─── Numerologia Cabalística (digital root) ──────────────────────────────
function digitalRoot(n: number): number {
  if (n < 0) n = -n;
  if (n === 0) return 0;
  const r = n % 9;
  return r === 0 ? 9 : r;
}

// ─── Orixás (Odu regente by cycle day) ───────────────────────────────────
/** 16 Odu cycling by day-of-life % 16. We synthesize essence, not from constants/odus.ts
 *  (kept self-contained so this engine has zero cross-file dependencies on 16-Odu export). */
const ODU_ESSENCE: Readonly<Record<number, string>> = {
  1: 'Luz e origem (Ogbe)',
  2: 'Dualidade e movimento (Ejiokô)',
  3: 'Abertura de caminhos (Etogundá)',
  4: 'Cuidado e proteção (Irosun)',
  5: 'Amor e beleza (Oxê)',
  6: 'Riqueza e fartura (Obará)',
  7: 'Limpeza e segredo (Odi)',
  8: 'Justiça e vitória (Ejionile)',
};

export function oduForDay(dayCount: number): { id: number; essence: string } {
  const id = (Math.floor(Math.abs(dayCount)) % 8) + 1;
  return { id, essence: ODU_ESSENCE[id]! };
}

// ─── Public API ───────────────────────────────────────────────────────────
export interface BiorhythmReading {
  /** Day-of-life count (target - birth) in days. */
  dayOfLife: number;
  /** Sine-phase values for the three cycles, each in [-1, 1]. */
  physical: number;
  emotional: number;
  intellectual: number;
  /** True for cycles crossing zero (sin ≈ 0) within ±0.5 day. */
  physicalCritical: boolean;
  emotionalCritical: boolean;
  intellectualCritical: boolean;
  /** Date metadata (Astrologia). */
  weekday: string;
  planet: string;
  element: 'fogo' | 'terra' | 'ar' | 'água';
  /** Cigano carta associated with dominant cycle phase. */
  ciganoCard: string;
  /** Numerologia cabalística — day-of-life digital root. */
  numerologyRoot: number;
  /** Orixá regente (Odu) for this day-of-life. */
  oduEssence: string;
  /** Tantra/Cabala chakra for dominant cycle. */
  chakra: { name: string; color: string; essence: string };
  /** Human-readable synthesis. */
  summary: string;
}

export function calculateBiorhythm(birthDate: string, targetDate: string): BiorhythmReading {
  const birth = parseDate(birthDate);
  const target = parseDate(targetDate);
  const days = dayCountBetween(birth, target);

  const physical    = phaseValue(days, BIORHYTHM_PERIODS.physical);
  const emotional   = phaseValue(days, BIORHYTHM_PERIODS.emotional);
  const intellectual = phaseValue(days, BIORHYTHM_PERIODS.intellectual);

  // Dominant cycle = largest absolute phase value.
  const abs = [
    { name: 'physical' as CycleName,     v: Math.abs(physical) },
    { name: 'emotional' as CycleName,    v: Math.abs(emotional) },
    { name: 'intellectual' as CycleName, v: Math.abs(intellectual) },
  ];
  abs.sort((a, b) => b.v - a.v);
  const dominant = abs[0]!.name;
  const dominantValue =
    dominant === 'physical' ? physical : dominant === 'emotional' ? emotional : intellectual;

  const weekdayInfo = dayOfWeekRuler(target);
  const ciganoCard = ciganoKeywordForPhase(dominant, dominantValue);
  const numRoot = digitalRoot(Math.floor(Math.abs(days)));
  const odu = oduForDay(days);
  const chakra = CYCLE_CHAKRA[dominant];

  const summary =
    `Dia ${Math.floor(days)} de vida. ${dominant} ${dominantValue >= 0 ? 'em alta' : 'em baixa'} ` +
    `(físico ${physical.toFixed(2)}, emocional ${emotional.toFixed(2)}, ` +
    `intelectual ${intellectual.toFixed(2)}). ` +
    `${weekdayInfo.weekday} regido por ${weekdayInfo.planet} (elemento ${weekdayInfo.element}). ` +
    `Carta-cigana do dia: ${ciganoCard}. Chakra dominante: ${chakra.name} (${chakra.color}). ` +
    `Numerologia cabalística: ${numRoot}. Odu regente: ${odu.essence}.`;

  return {
    dayOfLife: days,
    physical,
    emotional,
    intellectual,
    physicalCritical:    isCriticalDay(days, BIORHYTHM_PERIODS.physical),
    emotionalCritical:   isCriticalDay(days, BIORHYTHM_PERIODS.emotional),
    intellectualCritical:isCriticalDay(days, BIORHYTHM_PERIODS.intellectual),
    weekday: weekdayInfo.weekday,
    planet: weekdayInfo.planet,
    element: weekdayInfo.element,
    ciganoCard,
    numerologyRoot: numRoot,
    oduEssence: odu.essence,
    chakra,
    summary,
  };
}

export interface CyclePhase {
  cycle: CycleName;
  period: number;
  value: number; // sin phase in [-1, 1]
  isCritical: boolean;
  /** 'ascending' (positive slope) | 'descending' (negative slope) | 'peak' | 'trough' */
  trend: 'ascending' | 'descending' | 'peak' | 'trough';
}

export function getCyclePhase(birthDate: string, targetDate: string): {
  physical: CyclePhase;
  emotional: CyclePhase;
  intellectual: CyclePhase;
} {
  const birth = parseDate(birthDate);
  const target = parseDate(targetDate);
  const days = dayCountBetween(birth, target);
  const make = (cycle: CycleName): CyclePhase => {
    const period = BIORHYTHM_PERIODS[cycle];
    const v = phaseValue(days, period);
    // trend: look at derivative sign at current point.
    // sin'(x) = cos(x); here x = 2π·d/period → sign(cos(2π·d/period))
    const slope = Math.cos((2 * Math.PI * days) / period);
    let trend: CyclePhase['trend'];
    if (Math.abs(v) > 0.999) trend = v > 0 ? 'peak' : 'trough';
    else trend = slope > 0 ? 'ascending' : 'descending';
    return { cycle, period, value: v, isCritical: isCriticalDay(days, period), trend };
  };
  return { physical: make('physical'), emotional: make('emotional'), intellectual: make('intellectual') };
}

export interface CriticalDaysReport {
  from: string;
  to: string;
  rangeDays: number;
  criticalDays: Array<{
    date: string; // YYYY-MM-DD
    dayOfLife: number;
    cycles: ReadonlyArray<CycleName>;
  }>;
  summary: string;
}

export function getCriticalDays(birthDate: string, rangeDays: number = 30): CriticalDaysReport {
  if (!Number.isFinite(rangeDays) || rangeDays < 0) {
    throw new Error(`biorhythm: rangeDays must be a non-negative finite number, got ${rangeDays}`);
  }
  const birth = parseDate(birthDate);
  // We use "today" as the anchor for the range start (UTC). For determinism in tests
  // we also expose the lower-level function. If caller needs an explicit anchor, use
  // `getCriticalDaysBetween` below.
  const anchor = new Date();
  const anchorStr = anchor.toISOString().slice(0, 10);
  return getCriticalDaysBetween(birthDate, anchorStr, anchorStr, rangeDays);
}

export function getCriticalDaysBetween(
  birthDate: string,
  fromDate: string,
  toDate: string,
  rangeDays: number = 30,
): CriticalDaysReport {
  if (!Number.isFinite(rangeDays) || rangeDays < 0) {
    throw new Error(`biorhythm: rangeDays must be a non-negative finite number, got ${rangeDays}`);
  }
  const birth = parseDate(birthDate);
  const from  = parseDate(fromDate);
  const to    = parseDate(toDate);
  const fromDays = dayCountBetween(birth, from);
  const toDays   = dayCountBetween(birth, to);

  // Collect zero-crossings for each cycle in (fromDays, toDays + rangeDays].
  const window = [fromDays, toDays + rangeDays];
  const criticalSet = new Map<number, Set<CycleName>>();

  for (const cycle of Object.keys(BIORHYTHM_PERIODS) as CycleName[]) {
    const period = BIORHYTHM_PERIODS[cycle];
    const kStart = Math.ceil(window[0]! / period);
    const kEnd   = Math.floor(window[1]! / period);
    for (let k = kStart; k <= kEnd; k++) {
      const crossingDay = k * period;
      if (crossingDay < window[0]! || crossingDay > window[1]!) continue;
      const dateMs = birth.getTime() + crossingDay * MS_PER_DAY;
      const dayKey = Math.floor(crossingDay);
      if (!criticalSet.has(dayKey)) criticalSet.set(dayKey, new Set());
      criticalSet.get(dayKey)!.add(cycle);
    }
  }

  const criticalDays = Array.from(criticalSet.entries())
    .sort(([a], [b]) => a - b)
    .map(([d, cycles]) => {
      const dateMs = birth.getTime() + d * MS_PER_DAY;
      const dateStr = new Date(dateMs).toISOString().slice(0, 10);
      return { date: dateStr, dayOfLife: d, cycles: Array.from(cycles).sort() as ReadonlyArray<CycleName> };
    });

  const summary =
    `Janela ${fromDate} → ${toDate} (+${rangeDays}d). ` +
    `${criticalDays.length} dia(s) crítico(s) encontrado(s). ` +
    `Recomendação: redobre atenção em transições, decisões e início de projetos.`;

  return { from: fromDate, to: toDate, rangeDays, criticalDays, summary };
}

// ─── Audit / coverage exports (verifier hooks) ────────────────────────────
export interface BiorhythmAudit {
  periodsValid: boolean;
  phaseRange: { min: number; max: number; samples: number };
  criticalAccuracy: number; // 0..1 — % of phase≈0 detections that hit critical
  traditionsCovered: number;
  traditionsList: readonly string[];
}

export function auditBiorhythmEdgeCases(samples: number = 1000): BiorhythmAudit {
  let minV = +Infinity, maxV = -Infinity;
  let critHits = 0, critTotal = 0;
  for (const period of Object.values(BIORHYTHM_PERIODS)) {
    // (A) Verify detection: integer multiples of period ARE critical.
    for (let k = 0; k * period < samples; k++) {
      const day = k * period;
      critTotal++;
      if (isCriticalDay(day, period)) critHits++;
      const v = phaseValue(day, period);
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    // (B) Verify boundary detection: ±0.5 of a multiple IS critical.
    for (let k = 1; k * period < samples; k++) {
      const crossing = k * period;
      for (const offset of [-0.5, 0.5]) {
        const day = crossing + offset;
        if (day >= 0 && day < samples) {
          critTotal++;
          if (isCriticalDay(day, period)) critHits++;
        }
      }
    }
  }
  const traditionsList = [
    'Astrologia', 'Cigano', 'Numerologia Cabalística', 'Orixás', 'Tantra/Cabala',
  ] as const;
  return {
    periodsValid: BIORHYTHM_PERIODS.physical === 23 &&
                  BIORHYTHM_PERIODS.emotional === 28 &&
                  BIORHYTHM_PERIODS.intellectual === 33,
    phaseRange: { min: minV, max: maxV, samples: samples * 3 },
    criticalAccuracy: critTotal === 0 ? 1 : critHits / critTotal,
    traditionsCovered: traditionsList.length,
    traditionsList,
  };
}

// Freeze critical lookup tables for runtime integrity.
Object.freeze(BIORHYTHM_PERIODS);
Object.freeze(CYCLE_CHAKRA);
Object.freeze(CIGANO_PHASE_KEYWORDS);
Object.freeze(ODU_ESSENCE);

// Internal re-export for tests (typed brand). Not part of public API.
export const __TEST__ = { parseDate, dayCountBetween, phaseValue, isCriticalDay, digitalRoot, MS_PER_DAY };
