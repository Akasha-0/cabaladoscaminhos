/**
 * Cosmic Calendar
 * Generates celestial events for a given month/year including planetary aspects
 * and moon phases.
 */

// Approximate planetary orbital periods in days (for aspect calculation)
const ORBITAL_PERIODS: Record<string, number> = {
  sun: 30.436875,
  moon: 27.321661,
  mercury: 87.9691,
  venus: 224.701,
  mars: 686.98,
  jupiter: 4332.59,
  saturn: 10759.22,
  uranus: 30688.5,
  neptune: 60182.0,
};

function getJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) -
    Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getMoonPhase(jd: number): { phase: string; illumination: number } {
  // Simplified moon phase calculation
  const daysSinceNew = (jd - 2451550.1) % 29.530588853;
  const illumination = (1 - Math.cos((2 * Math.PI * daysSinceNew) / 29.530588853)) / 2;

  if (daysSinceNew < 1.84566) return { phase: 'Nova', illumination };
  if (daysSinceNew < 5.53697) return { phase: 'Crescente', illumination };
  if (daysSinceNew < 9.22829) return { phase: 'Gibosa Crescente', illumination };
  if (daysSinceNew < 12.91961) return { phase: 'Cheia', illumination };
  if (daysSinceNew < 16.61092) return { phase: 'Gibosa Minguante', illumination };
  if (daysSinceNew < 20.30224) return { phase: 'Minguante', illumination };
  if (daysSinceNew < 23.99355) return { phase: 'Creciente', illumination };
  return { phase: 'Nova', illumination };
}

function getPlanetaryPositions(jd: number): Record<string, number> {
  const daysFromEpoch = jd - 2451545.0;
  return {
    sun: ((360 / 365.25) * daysFromEpoch) % 360,
    moon: ((360 / ORBITAL_PERIODS.moon) * daysFromEpoch) % 360,
    mercury: ((360 / ORBITAL_PERIODS.mercury) * daysFromEpoch) % 360,
    venus: ((360 / ORBITAL_PERIODS.venus) * daysFromEpoch) % 360,
    mars: ((360 / ORBITAL_PERIODS.mars) * daysFromEpoch) % 360,
    jupiter: ((360 / ORBITAL_PERIODS.jupiter) * daysFromEpoch) % 360,
    saturn: ((360 / ORBITAL_PERIODS.saturn) * daysFromEpoch) % 360,
    uranus: ((360 / ORBITAL_PERIODS.uranus) * daysFromEpoch) % 360,
    neptune: ((360 / ORBITAL_PERIODS.neptune) * daysFromEpoch) % 360,
  };
}

function calculateAspect(planet1: string, planet2: string, pos1: number, pos2: number): string | null {
  const diff = Math.abs(pos1 - pos2) % 360;
  const aspects: Record<number, string> = {
    0: 'Conjunção',
    60: 'Sextil',
    90: 'Quadratura',
    120: 'Tríno',
    180: 'Oposição',
  };

  for (const [orb, name] of Object.entries(aspects)) {
    if (Math.abs(diff - parseFloat(orb)) < 8) return `${planet1}-${planet2}: ${name}`;
  }
  return null;
}

export interface CosmicEvent {
  date: string;
  type: 'moon_phase' | 'aspect';
  title: string;
  description: string;
}

export function getCosmicEvents(month: number, year: number): CosmicEvent[] {
  const events: CosmicEvent[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const jd = getJulianDay(year, month, day);
    const moon = getMoonPhase(jd);
    const positions = getPlanetaryPositions(jd);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    events.push({
      date: dateStr,
      type: 'moon_phase',
      title: moon.phase,
      description: `Lua ${moon.phase.toLowerCase()} — iluminação de ${Math.round(moon.illumination * 100)}%`,
    });

    const planets = Object.keys(positions);
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const aspect = calculateAspect(planets[i], planets[j], positions[planets[i]], positions[planets[j]]);
        if (aspect) {
          events.push({
            date: dateStr,
            type: 'aspect',
            title: aspect.split(': ')[1],
            description: aspect,
          });
        }
      }
    }
  }

  return events;
}
