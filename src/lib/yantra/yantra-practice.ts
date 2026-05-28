/**
 * Yantra Practice Module
 * Handles sacred geometry meditation and yantra practice sessions
 */

/**
 * Configuration for yantra practice
 */
export interface YantraPracticeConfig {
  yantra?: string; // sri, shri, lotus, triangle, square, circle, bindu, meru
  duration?: number; // minutes
  intensity?: number; // 1-10 scale
  focus?: string; // bindu, center, edges, pattern
}

/**
 * Result of a yantra practice session
 */
export interface YantraPracticeResult {
  success: boolean;
  yantra: string;
  duration: number;
  intensity: number;
  focus: string;
  geometryCompleted: boolean;
  energyAlignment: number; // 0-100
  insights: string[];
  timestamp: Date;
}

/**
 * Available yantra types for practice
 */
const YANTRA_TYPES = [
  'sri',
  'shri',
  'lotus',
  'triangle',
  'square',
  'circle',
  'bindu',
  'meru',
] as const;

/**
 * Sanskrit names and meanings for each yantra
 */
const YANTRA_METADATA: Record<string, { sanskrit: string; meaning: string; element: string }> = {
  sri: { sanskrit: 'Sri Yantra', meaning: 'Sacred instrument of abundance', element: 'earth' },
  shri: { sanskrit: 'Shri Yantra', meaning: 'Divine instrument of prosperity', element: 'fire' },
  lotus: { sanskrit: 'Padma Yantra', meaning: 'Lotus of purity', element: 'water' },
  triangle: { sanskrit: 'Trikona Yantra', meaning: 'Triangle of trinity', element: 'fire' },
  square: { sanskrit: 'Chatura Yantra', meaning: 'Four corners of stability', element: 'earth' },
  circle: { sanskrit: 'Chakra Yantra', meaning: 'Wheel of infinite cycles', element: 'ether' },
  bindu: { sanskrit: 'Bindu Yantra', meaning: 'Point of consciousness', element: 'void' },
  meru: { sanskrit: 'Meru Yantra', meaning: 'Sacred mountain of alignment', element: 'air' },
};

/**
 * Geometry completion steps for each yantra type
 */
const YANTRA_STEPS: Record<string, string[]> = {
  sri: ['center-point', 'circles', 'lotus-petals', 'triangles', 'binding'],
  shri: ['bindu-center', 'triangles-9', 'interlocking', 'petals-8', 'completion'],
  lotus: ['seed-mantra', 'petals-expand', 'stem-grounding', 'blossom-full'],
  triangle: ['base-form', 'apex-alignment', 'sides-balance', 'fire-kindled'],
  square: ['foundations-4', 'corners-set', 'sides-complete', 'stability-achieved'],
  circle: ['center-pivot', 'radius-set', 'circumference-complete', 'cycle-opens'],
  bindu: ['consciousness-point', 'expansion-subtle', 'contraction-focus', 'oneness'],
  meru: ['base-triangle', 'apex-summit', 'slopes-align', 'mountain-stable'],
};

/**
 * Performs a yantra practice session
 * @param config - Optional practice configuration
 * @returns Practice result with outcome details
 */
export async function performPractice(
  config: YantraPracticeConfig = {}
): Promise<YantraPracticeResult> {
  const { yantra = 'sri', duration = 20, intensity = 5, focus = 'center' } = config;

  // Simulate practice duration
  await new Promise((resolve) => setTimeout(resolve, 30));

  const validYantra = YANTRA_TYPES.includes(yantra as typeof YANTRA_TYPES[number])
    ? yantra
    : 'sri';

  const metadata = YANTRA_METADATA[validYantra] ?? YANTRA_METADATA['sri'];
  const steps = YANTRA_STEPS[validYantra] ?? YANTRA_STEPS['sri'];

  const baseAlignment = Math.min(100, intensity * 10);
  const durationFactor = Math.min(1, duration / 60);
  const energyAlignment = Math.round(baseAlignment * (0.4 + durationFactor * 0.6));

  const insights: string[] = [];

  // Core insight about the yantra
  insights.push(`${metadata.sanskrit} - ${metadata.meaning}`);
  insights.push(`Element: ${metadata.element}`);

  // Geometry completion insight
  insights.push(`Geometry completed: ${steps.join(' → ')}`);

  // Focus insight
  const focusInsights: Record<string, string> = {
    bindu: 'The point of zero dimension draws you into infinite presence',
    center: 'Center consciousness radiates outward in perfect symmetry',
    edges: 'Boundary awareness defines the sacred space within',
    pattern: 'Repeating geometry reveals the underlying order of existence',
  };

  if (focusInsights[focus]) {
    insights.push(focusInsights[focus]);
  }

  // Element-specific insight
  const elementInsights: Record<string, string> = {
    earth: 'Earth element grounds the sacred geometry in material reality',
    fire: 'Fire element activates the yantra with transformative power',
    water: 'Water element flows through the sacred patterns gracefully',
    ether: 'Ether element transcends physical form into pure vibration',
    air: 'Air element carries the sacred geometry across dimensions',
    void: 'Void element embraces the paradox of form and formlessness',
  };

  if (elementInsights[metadata.element]) {
    insights.push(elementInsights[metadata.element]);
  }

  return {
    success: true,
    yantra: validYantra,
    duration,
    intensity,
    focus,
    geometryCompleted: true,
    energyAlignment,
    insights,
    timestamp: new Date(),
  };
}

/**
 * Gets available yantra types for practice
 */
export function getAvailableYantras(): readonly string[] {
  return [...YANTRA_TYPES];
}

/**
 * Gets metadata for a specific yantra
 */
export function getYantraMetadata(yantra: string): { sanskrit: string; meaning: string; element: string } | null {
  return YANTRA_METADATA[yantra] ?? null;
}

/**
 * Gets practice steps for a specific yantra
 */
export function getYantraSteps(yantra: string): string[] {
  return YANTRA_STEPS[yantra] ?? YANTRA_STEPS['sri'];
}