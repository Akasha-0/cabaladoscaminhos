'use client';

/**
 * Retrograde periods for Mercury, Venus, and Mars.
 * Covers 2024–2027 with astrology-specific advice per planet.
 */

export interface RetrogradePeriod {
  planet: 'mercury' | 'venus' | 'mars';
  start: Date;
  end: Date;
  advice: string;
}

const periods: RetrogradePeriod[] = [
  // ── Mercury 2024 ──────────────────────────────────────────
  { planet: 'mercury', start: new Date('2024-12-13'), end: new Date('2025-01-01'), advice: 'Recheck contracts and documents. Avoid finalizing major agreements.' },
  { planet: 'mercury', start: new Date('2024-04-01'), end: new Date('2024-04-25'), advice: 'Clarify communications before sending. Technology may misbehave — back up data.' },
  { planet: 'mercury', start: new Date('2024-08-05'), end: new Date('2024-08-28'), advice: 'Postpone launches of new websites, podcasts, or messaging platforms.' },

  // ── Mercury 2025 ──────────────────────────────────────────
  { planet: 'mercury', start: new Date('2025-03-14'), end: new Date('2025-04-07'), advice: 'Review intellectual-property filings and NDAs before signing.' },
  { planet: 'mercury', start: new Date('2025-07-17'), end: new Date('2025-08-09'), advice: 'Re-examine business plans; delays in travel and logistics are likely.' },
  { planet: 'mercury', start: new Date('2025-11-08'), end: new Date('2025-12-01'), advice: 'Re-negotiate pricing. Mercury rx seasons a busy Q4 — stay on top of paperwork.' },

  // ── Mercury 2026 ──────────────────────────────────────────
  { planet: 'mercury', start: new Date('2026-02-25'), end: new Date('2026-03-20'), advice: 'Double-check travel bookings and routing. Review media and content before publishing.' },
  { planet: 'mercury', start: new Date('2026-06-26'), end: new Date('2026-07-20'), advice: 'Revisit contracts, SaaS renewals, and software deployments during this window.' },
  { planet: 'mercury', start: new Date('2026-10-19'), end: new Date('2026-11-16'), advice: 'Stress-test backup and archival systems. Mercury Rx coincides with year-end planning.' },

  // ── Venus 2024–25 ──────────────────────────────────────────
  { planet: 'venus', start: new Date('2024-12-22'), end: new Date('2025-02-01'), advice: 'Pause major purchases or investments. Reconsider financial commitments after the station.' },
  { planet: 'venus', start: new Date('2024-07-22'), end: new Date('2024-09-08'), advice: 'Venus retrograde in Leo: review brand identity, aesthetics, and relationship contracts.' },

  // ── Venus 2026 ─────────────────────────────────────────────
  { planet: 'venus', start: new Date('2026-03-01'), end: new Date('2026-03-26'), advice: 'Postpone new brand launches or partnerships. Re-evaluate ongoing financial agreements.' },
  { planet: 'venus', start: new Date('2026-10-27'), end: new Date('2026-12-08'), advice: 'Venus rx in Sagittarius/Direct: reassess values-driven decisions and joint finances.' },

  // ── Mars 2024–25 ───────────────────────────────────────────
  { planet: 'mars', start: new Date('2024-12-06'), end: new Date('2025-02-14'), advice: 'Mars Rx in Leo/Aries: avoid confrontations, legal actions, or signing binding agreements. Channel energy into physical training.' },
  { planet: 'mars', start: new Date('2024-06-17'), end: new Date('2024-08-20'), advice: 'Mars Rx in Aquarius: delay launches of aggressive campaigns. Reflect on how you assert yourself.' },

  // ── Mars 2026 ───────────────────────────────────────────────
  { planet: 'mars', start: new Date('2026-07-15'), end: new Date('2026-09-07'), advice: 'Mars Rx begins mid-July. Avoid starting disputes or irreversible commitments.' },
];

/**
 * Returns all retrograde periods optionally filtered by planet.
 */
export function getRetrogradePeriods(planet?: 'mercury' | 'venus' | 'mars'): RetrogradePeriod[] {
  if (planet) return periods.filter(p => p.planet === planet);
  return periods;
}
