// Moon Phase to Ritual Sync - Cabala dos Caminhos
// Syncs rituals to optimal moon phases for enhanced spiritual effectiveness

import { getMoonAge, getCurrentMoonPhase, getNextMoonPhase, MoonPhaseEvent } from '../notifications/lua';

/**
 * Moon phase types for ritual matching
 */
export type MoonPhaseTarget =
  | 'new'           // New Moon - beginnings, intentions, fresh starts
  | 'waxing'        // Waxing phases - growth, building, attraction
  | 'full'          // Full Moon - culmination, manifestation, release
  | 'waning';       // Waning phases - letting go, clearing, completion

/**
 * Ritual intention aligned with moon phases
 */
export interface RitualIntention {
  id: string;
  name: string;
  description?: string;
  targetPhase: MoonPhaseTarget;
  optimalDays?: number; // Days before/after peak phase
}

/**
 * A ritual synced to a moon phase with optimal date
 */
export interface SyncedRitual {
  ritual: RitualIntention;
  optimalDate: Date;
  phase: MoonPhaseEvent['phase'];
  illumination: number;
  daysFromNow: number;
  syncQuality: 'excellent' | 'good' | 'fair';
}

/**
 * Configuration for ritual sync
 */
export interface RitualSyncConfig {
  /** Look ahead days for finding optimal dates */
  lookAheadDays?: number;
  /** Preferred phase for rituals without explicit phase */
  defaultPhase?: MoonPhaseTarget;
  /** Include rituals that are already in progress */
  includeActiveRituals?: boolean;
}

const DEFAULT_CONFIG: Required<RitualSyncConfig> = {
  lookAheadDays: 30,
  defaultPhase: 'full',
  includeActiveRituals: true,
};

/**
 * Phase compatibility matrix - which rituals work best with which phases
 */
const PHASE_COMPATIBILITY: Record<MoonPhaseTarget, string[]> = {
  new: ['intention', 'manifestation', 'beginning', 'renewal', 'start', 'new', 'initiation'],
  waxing: ['growth', 'attraction', 'abundance', 'building', 'strengthening', 'increase'],
  full: ['culmination', 'release', 'clarity', 'manifestation', 'completion', 'power', 'full'],
  waning: ['letting-go', 'clearing', 'purification', 'completion', 'restoration', 'transformation'],
};

/**
 * Quality thresholds for sync scoring
 */
const SYNC_QUALITY_THRESHOLDS = {
  excellent: 0.9,  // Within 1 day of optimal
  good: 0.7,       // Within 2 days
  fair: 0.5,       // Within 4 days
};

/**
 * Calculate sync quality based on distance from optimal phase
 */
function calculateSyncQuality(ritual: RitualIntention, moonEvent: MoonPhaseEvent): 'excellent' | 'good' | 'fair' {
  const phaseNames: Record<MoonPhaseTarget, string[]> = {
    new: ['new'],
    waxing: ['waxing_crescent', 'first_quarter', 'waxing_gibbous'],
    full: ['full'],
    waning: ['waning_gibbous', 'last_quarter', 'waning_crescent'],
  };

  const targetPhases = phaseNames[ritual.targetPhase];
  const isOptimalPhase = targetPhases.includes(moonEvent.phase);

  if (!isOptimalPhase) {
    return 'fair';
  }

  // Calculate day distance from phase peak
  let dayFromPeak = 0;
  switch (moonEvent.phase) {
    case 'new':
      dayFromPeak = moonEvent.age;
      break;
    case 'full':
      dayFromPeak = Math.abs(moonEvent.age - 14.77); // Full moon is ~14.77 days into cycle
      break;
    case 'first_quarter':
      dayFromPeak = Math.abs(moonEvent.age - 7.38);
      break;
    case 'last_quarter':
      dayFromPeak = Math.abs(moonEvent.age - 22.15);
      break;
    default:
      dayFromPeak = 2; // For crescent/gibbous, give benefit of doubt
  }

  const normalizedScore = Math.max(0, 1 - (dayFromPeak / 4));

  if (normalizedScore >= SYNC_QUALITY_THRESHOLDS.excellent) return 'excellent';
  if (normalizedScore >= SYNC_QUALITY_THRESHOLDS.good) return 'good';
  return 'fair';
}

/**
 * Find optimal date for a ritual based on moon phase
 */
function findOptimalDate(ritual: RitualIntention, fromDate: Date, lookAheadDays: number): SyncedRitual {
  let bestDate = fromDate;
  let bestQuality: 'excellent' | 'good' | 'fair' = 'fair';
  let bestPhase: MoonPhaseEvent['phase'] = 'full';
  let bestIllumination = 0;
  let bestDaysFromNow = 0;

  // Search each day in the look-ahead period
  for (let i = 0; i < lookAheadDays; i++) {
    const checkDate = new Date(fromDate);
    checkDate.setDate(checkDate.getDate() + i);
    const moonEvent = getCurrentMoonPhase(checkDate);
    const quality = calculateSyncQuality(ritual, moonEvent);

    // Track best match
    if (quality === 'excellent' || (quality === 'good' && bestQuality === 'fair') || (quality === 'good' && bestQuality === 'good' && i < bestDaysFromNow)) {
      bestDate = checkDate;
      bestQuality = quality;
      bestPhase = moonEvent.phase;
      bestIllumination = moonEvent.illumination;
      bestDaysFromNow = i;

      if (quality === 'excellent') break; // Found perfect match
    }
  }

  // Fallback to next specific phase if no good match found
  if (bestQuality === 'fair') {
    const targetPhase = mapTargetToPhase(ritual.targetPhase);
    const nextPhase = getNextMoonPhase(targetPhase, fromDate);
    bestDate = nextPhase.date;
    bestDaysFromNow = Math.ceil((nextPhase.date.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    bestPhase = nextPhase.phase;
    bestIllumination = nextPhase.illumination;
    bestQuality = 'good';
  }

  return {
    ritual,
    optimalDate: bestDate,
    phase: bestPhase,
    illumination: bestIllumination,
    daysFromNow: bestDaysFromNow,
    syncQuality: bestQuality,
  };
}

/**
 * Map ritual target phase to specific moon phase
 */
function mapTargetToPhase(target: MoonPhaseTarget): 'new' | 'first_quarter' | 'full' | 'last_quarter' {
  switch (target) {
    case 'new': return 'new';
    case 'waxing': return 'first_quarter';
    case 'full': return 'full';
    case 'waning': return 'last_quarter';
  }
}

/**
 * Infer ritual phase from name/description keywords
 */
function inferRitualPhase(ritual: RitualIntention): MoonPhaseTarget {
  const text = `${ritual.name} ${ritual.description || ''}`.toLowerCase();

  for (const [phase, keywords] of Object.entries(PHASE_COMPATIBILITY)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return phase as MoonPhaseTarget;
    }
  }

  return 'full'; // Default to full moon for maximum energy
}

/**
 * Sort rituals by optimal date
 */
function sortByOptimalDate(syncedRituals: SyncedRitual[]): SyncedRitual[] {
  return [...syncedRituals].sort((a, b) => a.optimalDate.getTime() - b.optimalDate.getTime());
}

/**
 * Filter synced rituals by quality
 */
function filterByQuality(syncedRituals: SyncedRitual[], minQuality: SyncedRitual['syncQuality']): SyncedRitual[] {
  const qualityOrder: SyncedRitual['syncQuality'][] = ['excellent', 'good', 'fair'];
  const minIndex = qualityOrder.indexOf(minQuality);

  return syncedRituals.filter(r => qualityOrder.indexOf(r.syncQuality) <= minIndex);
}

/**
 * Main function: Sync rituals to optimal moon phases
 * Matches rituals to their most auspicious dates based on moon phase alignment
 *
 * @param rituals Array of ritual intentions to sync
 * @param config Optional sync configuration
 * @returns Array of rituals with their optimal moon-synced dates
 */
export function syncRitualsToMoon(
  rituals: RitualIntention[],
  config: RitualSyncConfig = {}
): SyncedRitual[] {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const fromDate = new Date();

  // Ensure each ritual has a target phase
  const enrichedRituals = rituals.map(ritual => {
    if (!ritual.targetPhase) {
      return { ...ritual, targetPhase: inferRitualPhase(ritual) };
    }
    return ritual;
  });

  // Sync each ritual to optimal moon phase
  const syncedRituals = enrichedRituals.map(ritual =>
    findOptimalDate(ritual, fromDate, mergedConfig.lookAheadDays)
  );

  // Sort by optimal date for easy scheduling
  return sortByOptimalDate(syncedRituals);
}

/**
 * Get the next optimal date for a specific ritual
 */
export function getNextOptimalDate(
  ritual: RitualIntention,
  fromDate: Date = new Date()
): SyncedRitual {
  return findOptimalDate(
    ritual.targetPhase ? ritual : { ...ritual, targetPhase: inferRitualPhase(ritual) },
    fromDate,
    30 // Default look-ahead
  );
}

/**
 * Get recommended rituals for current moon phase
 */
export function getRitualsForCurrentPhase(): RitualIntention[] {
  const currentPhase = getCurrentMoonPhase();
  const phaseToTarget: Record<MoonPhaseEvent['phase'], MoonPhaseTarget> = {
    new: 'new',
    waxing_crescent: 'waxing',
    first_quarter: 'waxing',
    waxing_gibbous: 'waxing',
    full: 'full',
    waning_gibbous: 'waning',
    last_quarter: 'waning',
    waning_crescent: 'waning',
  };

  const targetPhase = phaseToTarget[currentPhase.phase];

  // Common ritual templates for each phase
  const ritualTemplates: Record<MoonPhaseTarget, Omit<RitualIntention, 'id'>[]> = {
    new: [
      { name: 'Nova intenção de lua', description: 'Definir intentions para o ciclo lunar', targetPhase: 'new' },
      { name: 'Renovação de compromissos', description: 'Recommit to spiritual practices', targetPhase: 'new' },
    ],
    waxing: [
      { name: 'Ritual de crescimento', description: 'Build and attract positive energy', targetPhase: 'waxing' },
      { name: 'Manifestação de desejo', description: 'Focus on desires and goals', targetPhase: 'waxing' },
    ],
    full: [
      { name: 'Ritual de colmear', description: 'Culminate intentions and celebrate progress', targetPhase: 'full' },
      { name: 'Ritual de liberação', description: 'Release what no longer serves', targetPhase: 'full' },
    ],
    waning: [
      { name: 'Ritual de purificação', description: 'Clear negative energy and patterns', targetPhase: 'waning' },
      { name: 'Ritual de soltura', description: 'Let go of burdens and limitations', targetPhase: 'waning' },
    ],
  };

  return ritualTemplates[targetPhase].map((template, index) => ({
    ...template,
    id: `template-${targetPhase}-${index}`,
  }));
}

/**
 * Check if a specific date is optimal for a ritual type
 */
export function isOptimalDate(ritual: RitualIntention, date: Date): boolean {
  const moonEvent = getCurrentMoonPhase(date);
  const quality = calculateSyncQuality(ritual, moonEvent);
  return quality === 'excellent' || quality === 'good';
}

/**
 * Get moon phase description for ritual guidance
 */
export function getPhaseRitualGuidance(phase: MoonPhaseEvent['phase']): string {
  const guidance: Record<MoonPhaseEvent['phase'], string> = {
    new: 'Período de renovação e novos começos. Ideal para definir intentions e iniciar projetos espirituais.',
    waxing_crescent: 'Energia crescente de intenção. Construa momentum para seus objetivos.',
    first_quarter: 'Momento de ação e determinação. Tome decisões importantes.',
    waxing_gibbous: 'Período de refinamento. Ajuste detalhes e intensifique esforços.',
    full: 'Pico de energia lunar. Maximum power for manifestations and releases.',
    waning_gibbous: 'Energia de integração. Processe insights e consolide aprendizados.',
    last_quarter: 'Período de perdão e soltar. Libere o que não serve mais.',
    waning_crescent: 'Fase de descanso e reflexão.Prepare-se para o próximo ciclo.',
  };
  return guidance[phase];
}