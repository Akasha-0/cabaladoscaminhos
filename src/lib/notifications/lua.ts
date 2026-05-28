// ============================================================
// MOON PHASE NOTIFICATIONS - CABALA DOS CAMINHOS
// ============================================================
// Scheduler for moon phase notifications: new moon, full moon, quarters
// ============================================================

export interface MoonPhaseNotification {
  type: 'new_moon' | 'full_moon' | 'first_quarter' | 'last_quarter';
  date: Date;
  daysFromNow: number;
  title: string;
  message: string;
  significance: string;
}

export interface MoonPhaseEvent {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  illumination: number;
  age: number;
  date: Date;
}

// Lunar cycle in days (average synodic month)
const SYNODIC_MONTH = 29.53058867;

// Reference new moon: January 6, 2000 18:14 UTC
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');

/**
 * Calculate the age of the moon in days since the last new moon
 * Using a simplified algorithm based on mean lunar month
 */
export function getMoonAge(date: Date = new Date()): number {
  const msPerDay = 86400000;
  const diffMs = date.getTime() - KNOWN_NEW_MOON.getTime();
  const diffDays = diffMs / msPerDay;
  const age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  return age;
}

/**
 * Get current moon phase information
 */
export function getCurrentMoonPhase(date: Date = new Date()): MoonPhaseEvent {
  const age = getMoonAge(date);
  const illumination = calculateIllumination(age);
  const phase = getPhaseName(age);

  return {
    phase,
    illumination,
    age,
    date,
  };
}

/**
 * Calculate moon illumination percentage (0-100)
 */
function calculateIllumination(age: number): number {
  // Using the phase angle to calculate illumination
  // Phase angle: 0° = new moon, 180° = full moon
  const phaseAngle = (age / SYNODIC_MONTH) * 360;
  // Illumination follows a cosine curve: 50% at quarters, 100% at full, 0% at new
  const illumination = (1 - Math.cos(toRadians(phaseAngle))) / 2 * 100;
  return Math.round(illumination * 10) / 10;
}

/**
 * Get phase name from age
 */
function getPhaseName(age: number): MoonPhaseEvent['phase'] {
  const phaseLength = SYNODIC_MONTH / 8;
  
  if (age < phaseLength) return 'new';
  if (age < phaseLength * 2) return 'waxing_crescent';
  if (age < phaseLength * 3) return 'first_quarter';
  if (age < phaseLength * 4) return 'waxing_gibbous';
  if (age < phaseLength * 5) return 'full';
  if (age < phaseLength * 6) return 'waning_gibbous';
  if (age < phaseLength * 7) return 'last_quarter';
  return 'waning_crescent';
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the next occurrence of a specific moon phase
 * @param targetPhase The phase to find ('new', 'first_quarter', 'full', 'last_quarter')
 * @param fromDate Starting date for calculation
 */
export function getNextMoonPhase(
  targetPhase: 'new' | 'first_quarter' | 'full' | 'last_quarter',
  fromDate: Date = new Date()
): MoonPhaseEvent {
  const age = getMoonAge(fromDate);
  const phaseLength = SYNODIC_MONTH / 4;

  // Phase offsets from new moon (in days)
  const phaseOffsets: Record<string, number> = {
    new: 0,
    first_quarter: phaseLength,
    full: phaseLength * 2,
    last_quarter: phaseLength * 3,
  };

  const targetOffset = phaseOffsets[targetPhase];
  let daysUntil = targetOffset - age;

  // If we've passed this phase in the current cycle, add a full cycle
  if (daysUntil <= 0) {
    daysUntil += SYNODIC_MONTH;
  }

  const nextDate = new Date(fromDate.getTime() + daysUntil * 86400000);
  const nextAge = getMoonAge(nextDate);
  const illumination = calculateIllumination(nextAge);

  return {
    phase: targetPhase,
    illumination,
    age: nextAge,
    date: nextDate,
  };
}

/**
 * Get all moon phase notifications for the next specified days
 * @param days Number of days to look ahead
 * @param fromDate Starting date
 */
export function getMoonPhaseNotifications(
  days: number = 30,
  fromDate: Date = new Date()
): MoonPhaseNotification[] {
  const notifications: MoonPhaseNotification[] = [];
  
  // Get next 4 cycles worth to ensure coverage
  const maxDate = new Date(fromDate.getTime() + days * 86400000);
  const cyclesToCheck = Math.ceil(days / SYNODIC_MONTH) + 1;

  const phases: Array<'new' | 'first_quarter' | 'full' | 'last_quarter'> = [
    'new', 'first_quarter', 'full', 'last_quarter'
  ];

  const phaseInfo: Record<string, { title: string; significance: string; defaultMessage: string }> = {
    new: {
      title: 'Lua Nova 🌑',
      significance: 'Momento ideal para novos começos, intenções e renovação espiritual.',
      defaultMessage: 'A Lua Nova surge — um momento de renovação e novos propósitos. Aproveite para definir intenções e começar novos projetos.',
    },
    first_quarter: {
      title: 'Quarto Crescente 🌓',
      significance: 'Fase de ação e determinação. Continue os projetos iniciados na Lua Nova.',
      defaultMessage: 'A Lua entra em Quarto Crescente — hora de tomar ação e avançar com determinação em seus objetivos.',
    },
    full: {
      title: 'Lua Cheia 🌕',
      significance: 'Pico de energia e iluminação. Perfeito para meditação, gratidão e manifestação.',
      defaultMessage: 'A Lua Cheia brilha intensamente — um momento poderoso para meditação, gratidão e manifestação dos seus desejos.',
    },
    last_quarter: {
      title: 'Quarto Minguante 🌗',
      significance: 'Fase de liberação e reflexão. Solte o que não serve mais.',
      defaultMessage: 'A Lua entra em Quarto Minguante — é hora de refletir, perdoar e libertar o que não serve mais ao seu caminho.',
    },
  };

  // Find all phase occurrences within the range
  let currentDate = new Date(fromDate);
  let cycleCount = 0;

  while (currentDate <= maxDate && cycleCount < cyclesToCheck * 4) {
    for (const phase of phases) {
      const moonEvent = getNextMoonPhase(phase, currentDate);
      
      if (moonEvent.date <= maxDate && moonEvent.date >= fromDate) {
        const daysFromNow = Math.ceil(
          (moonEvent.date.getTime() - fromDate.getTime()) / 86400000
        );

        const info = phaseInfo[phase];
        
        notifications.push({
          type: `${phase}_moon` as MoonPhaseNotification['type'],
          date: moonEvent.date,
          daysFromNow,
          title: info.title,
          message: info.defaultMessage,
          significance: info.significance,
        });
      }

      // Move current date past this phase to avoid duplicates
      if (moonEvent.date > currentDate) {
        currentDate = new Date(moonEvent.date.getTime() + 86400000);
      }
    }
    cycleCount++;
  }

  // Sort by date
  notifications.sort((a, b) => a.date.getTime() - b.date.getTime());

  return notifications;
}

/**
 * Get a simplified moon phase name in Portuguese
 */
export function getMoonPhaseNamePt(phase: MoonPhaseEvent['phase']): string {
  const names: Record<MoonPhaseEvent['phase'], string> = {
    new: 'Lua Nova',
    waxing_crescent: 'Crescente',
    first_quarter: 'Quarto Crescente',
    waxing_gibbous: 'Gibosa Crescente',
    full: 'Lua Cheia',
    waning_gibbous: 'Gibosa Minguante',
    last_quarter: 'Quarto Minguante',
    waning_crescent: 'Minguante',
  };
  return names[phase];
}

/**
 * Get next upcoming full moon
 */
export function getNextFullMoon(fromDate: Date = new Date()): MoonPhaseEvent {
  return getNextMoonPhase('full', fromDate);
}

/**
 * Get next upcoming new moon
 */
export function getNextNewMoon(fromDate: Date = new Date()): MoonPhaseEvent {
  return getNextMoonPhase('new', fromDate);
}