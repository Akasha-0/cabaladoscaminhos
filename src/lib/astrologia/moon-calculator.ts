// fallow-ignore-file unused-file
/**
 * Moon Phase Calculator
 * Provides accurate moon phase calculations using astronomical formulas
 */

export type MoonPhase =
  | 'new'
  | 'waxing'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waning';

// fallow-ignore-next-line unused-type
export interface MoonPhaseInfo {
  phase: MoonPhase;
  name: string;
  emoji: string;
  illumination: number;
  daysIntoPhase: number;
  daysUntilNextPhase: number;
  isWaxing: boolean;
}

// fallow-ignore-next-line unused-type
export interface VoidOfCoursePeriod {
  start: Date;
  end: Date;
  durationMinutes: number;
}

const LUNAR_CYCLE_DAYS = 29.53058867;

// Reference: known new moon at Jan 6, 2000 18:14 UTC
const REFERENCE_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

function getMoonAge(date: Date): number {
  const msSinceReference = date.getTime() - REFERENCE_NEW_MOON.getTime();
  const daysSinceReference = msSinceReference / (24 * 60 * 60 * 1000);
  return ((daysSinceReference % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
}

// fallow-ignore-next-line complexity
function getMoonPhaseInfo(date: Date): MoonPhaseInfo {
  const age = getMoonAge(date);
  const phaseIndex = (age / LUNAR_CYCLE_DAYS) * 8;

  let phase: MoonPhase;
  let name: string;
  let illumination: number;
  let isWaxing: boolean;

  if (age < 1.84566) {
    phase = 'new';
    name = 'Lua Nova';
    illumination = 0;
    isWaxing = true;
  } else if (age < 5.53698) {
    phase = 'waxing';
    name = 'Lua Crescente';
    illumination = Math.round(((age - 1.84566) / 3.69132) * 50 + 1);
    isWaxing = true;
  } else if (age < 9.2283) {
    phase = 'firstQuarter';
    name = 'Quarto Crescente';
    illumination = 50;
    isWaxing = true;
  } else if (age < 12.91962) {
    phase = 'waxingGibbous';
    name = 'Gibosa Crescente';
    illumination = Math.round(((age - 9.2283) / 3.69132) * 50 + 50);
    isWaxing = true;
  } else if (age < 16.61094) {
    phase = 'full';
    name = 'Lua Cheia';
    illumination = 100;
    isWaxing = false;
  } else if (age < 20.30226) {
    phase = 'waningGibbous';
    name = 'Gibosa Minguante';
    illumination = Math.round(100 - ((age - 16.61094) / 3.69132) * 50);
    isWaxing = false;
  } else if (age < 23.99358) {
    phase = 'lastQuarter';
    name = 'Quarto Minguante';
    illumination = 50;
    isWaxing = false;
  } else if (age < 27.6849) {
    phase = 'waning';
    name = 'Lua Minguante';
    illumination = Math.round(50 - ((age - 23.99358) / 3.69132) * 50);
    isWaxing = false;
  } else {
    phase = 'new';
    name = 'Lua Nova';
    illumination = 0;
    isWaxing = true;
  }

  // Calculate position within current phase
  const phaseLength = LUNAR_CYCLE_DAYS / 8;
  const daysIntoPhase = age % phaseLength;
  const daysUntilNextPhase = phaseLength - daysIntoPhase;

  return { phase, name, emoji: getPhaseEmoji(phase), illumination, daysIntoPhase, daysUntilNextPhase, isWaxing };
}

function getPhaseEmoji(phase: MoonPhase): string {
  const map: Record<MoonPhase, string> = {
    new: '🌑',
    waxing: '🌓',
    firstQuarter: '🌔',
    waxingGibbous: '🌔',
    full: '🌕',
    waningGibbous: '🌖',
    lastQuarter: '🌗',
    waning: '🌘',
  };
  return map[phase];
}

function getNextPhases(date: Date, count: number = 4): Array<{ phase: MoonPhase; date: Date; name: string }> {
  const result: Array<{ phase: MoonPhase; date: Date; name: string }> = [];
  let currentDate = new Date(date);
  const phaseLength = LUNAR_CYCLE_DAYS / 8;
  const age = getMoonAge(currentDate);
  const daysUntilNextPhase = phaseLength - (age % phaseLength);

  currentDate = new Date(currentDate.getTime() + daysUntilNextPhase * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const info = getMoonPhaseInfo(currentDate);
    result.push({ phase: info.phase, date: new Date(currentDate), name: info.name });
    currentDate = new Date(currentDate.getTime() + phaseLength * 24 * 60 * 60 * 1000);
  }

  return result;
}

function getUpcoming7Days(date: Date): Array<{ date: Date; phase: MoonPhase; name: string }> {
  const result: Array<{ date: Date; phase: MoonPhase; name: string }> = [];
  let currentDate = new Date(date);

  for (let i = 0; i < 7; i++) {
    const info = getMoonPhaseInfo(currentDate);
    result.push({ date: new Date(currentDate), phase: info.phase, name: info.name });
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return result;
}

/**
 * Simplified void-of-course calculator
 * Moon is void-of-course when transitioning between signs
 * Approximate method: check moon position relative to sign boundaries
// fallow-ignore-next-line complexity
 */
function calculateVoidOfCoursePeriods(
  startDate: Date,
  endDate: Date
): VoidOfCoursePeriod[] {
  const periods: VoidOfCoursePeriod[] = [];
  const SIGN_DURATION_DEGREES = 360 / 12; // 30 degrees per sign

  // Moon moves approximately 13 degrees per day
  // Transit through each sign takes roughly 2.3 days
  // Void-of-course is roughly the last ~2.5 degrees before leaving a sign

  const VOID_THRESHOLD_DEGREES = 2.5;

  let current = new Date(startDate);
  let prevMoonDegree: number | null = null;

  while (current <= endDate) {
    // Calculate moon longitude for current hour
    const moonDegree = (getMoonAge(current) / LUNAR_CYCLE_DAYS) * 360;
    const signIndex = Math.floor(moonDegree / SIGN_DURATION_DEGREES);
    const degreeInSign = moonDegree % SIGN_DURATION_DEGREES;

    if (prevMoonDegree !== null) {
      const prevSignIndex = Math.floor(prevMoonDegree / SIGN_DURATION_DEGREES);
      const prevDegreeInSign = prevMoonDegree % SIGN_DURATION_DEGREES;

      // Detect moon leaving a sign (sign change)
      if (signIndex !== prevSignIndex || (prevDegreeInSign > (SIGN_DURATION_DEGREES - VOID_THRESHOLD_DEGREES) && degreeInSign < VOID_THRESHOLD_DEGREES)) {
        // Moon is void-of-course
        const vocStart = new Date(current.getTime() - 60 * 60 * 1000); // 1 hour before
        const vocEnd = new Date(current.getTime() + 30 * 60 * 1000); // 30 min after

        const lastPeriod = periods[periods.length - 1];
        if (lastPeriod && lastPeriod.end.getTime() === vocStart.getTime()) {
          // Merge adjacent periods
          lastPeriod.end = vocEnd;
          lastPeriod.durationMinutes += 90;
        } else {
          periods.push({
            start: vocStart,
            end: vocEnd,
            durationMinutes: 90,
          });
        }
      }
    }

    prevMoonDegree = moonDegree;
    current = new Date(current.getTime() + 30 * 60 * 1000); // Step 30 minutes
  }

  return periods;
}

function isCurrentlyVoidOfCourse(date: Date): boolean {
  const age = getMoonAge(date);
  const moonDegree = (age / LUNAR_CYCLE_DAYS) * 360;
  const signIndex = Math.floor(moonDegree / (360 / 12));
  const degreeInSign = moonDegree % (360 / 12);
  return degreeInSign > (30 - 2.5);
}

function getNextVoidOfCourse(date: Date): Date | null {
  const h = new Date(date);
  h.setHours(h.getHours() + 1);

  for (let i = 0; i < 72; i++) {
    if (isCurrentlyVoidOfCourse(h)) {
      return new Date(h.getTime() - 30 * 60 * 1000);
    }
    h.setTime(h.getTime() + 30 * 60 * 1000);
  }
  return null;
}

function getBestRitualTime(date: Date): { start: Date; end: Date; quality: 'optimal' | 'good' | 'avoid' } {
  // Optimal time: last 2 hours before void-of-course, or 2 hours after
  const nextVoid = getNextVoidOfCourse(date);

  if (!nextVoid) {
    return {
      start: new Date(date.getTime() + 20 * 60 * 60 * 1000),
      end: new Date(date.getTime() + 22 * 60 * 60 * 1000),
      quality: 'good',
    };
  }

  const beforeVoid = new Date(nextVoid.getTime() - 2 * 60 * 60 * 1000);
  const optStart = new Date(nextVoid.getTime() - 30 * 60 * 1000);

  if (date >= beforeVoid && date <= nextVoid) {
    return { start: beforeVoid, end: nextVoid, quality: 'optimal' };
  }

  return { start: optStart, end: nextVoid, quality: 'good' };
}
