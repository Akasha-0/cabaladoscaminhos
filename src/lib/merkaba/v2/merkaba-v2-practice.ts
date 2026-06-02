/**
 * Merkaba-v2 Practice Module
 * Handles merkaba (light-body vehicle) cultivation and activation practices
 */

// Configuration for merkaba v2 practice
export interface MerkabaV2PracticeConfig {
  intensity?: number; // 1-10 scale
 duration?: number; // minutes
  breathingPattern?: 'rapid' | 'medium' | 'slow';
  focusChakra?: string; // root, heart, crown
}

// Result of a merkaba v2 practice session
export interface MerkabaV2PracticeResult {
  completed: boolean;
  energyLevel: number; // 0-100
  rotationLevel: number; // merkaba spin activation (0-100)
  activatedFields: number; // number of light fields activated (0-8)
  insights: string[];
  timestamp: Date;
}

// Metadata for merkaba fields and geometries
const FIELD_METADATA: Record<string, { geometry: string; element: string; meaning: string }> = {
  tetra: { geometry: 'Tetrahedron', element: 'Fire', meaning: 'First light vehicle - divine masculine principle' },
  antiTetra: { geometry: 'Anti-Tetrahedron', element: 'Fire', meaning: 'Counter-rotating field - divine feminine principle' },
  starTetra: { geometry: 'Star Tetrahedron', element: 'Light', meaning: 'Unified merkaba form - union of polarities' },
  merkaba: { geometry: 'Merkaba', element: 'Spirit', meaning: 'The complete light-body vehicle for sacred travel' },
  soulStar: { geometry: 'Soul Star', element: 'Cosmic', meaning: 'Gateway to higher dimensional realms' },
  causal: { geometry: 'Causal Body', element: 'Ether', meaning: 'Storehouse of karmic records and cosmic memory' },
  galactic: { geometry: 'Galactic Center', element: 'Void', meaning: 'Connection to universal source consciousness' },
  divine: { geometry: 'Divine Gateway', element: 'Light', meaning: 'Portal to creator consciousness beyond form' },
};

export async function performPractice(
  config: MerkabaV2PracticeConfig = {}
): Promise<MerkabaV2PracticeResult> {
  const { intensity = 5, duration = 20, breathingPattern = 'medium', focusChakra = 'heart' } = config;

  // Simulate practice duration
  await new Promise((resolve) => setTimeout(resolve, 30));

  const breathingMultiplier = {
    rapid: 1.5,
    medium: 1.0,
    slow: 0.7,
  }[breathingPattern];

  const baseEnergy = Math.min(100, Math.max(0, intensity * 10 * breathingMultiplier));
  const durationFactor = Math.min(1, duration / 60);
  const energyLevel = Math.round(baseEnergy * (0.5 + durationFactor * 0.5));

  // Calculate merkaba rotation and field activation based on intensity and duration
  const rotationLevel = Math.round(Math.min(100, energyLevel * durationFactor * 1.2));
  const activatedFields = Math.ceil((intensity / 10) * 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  const insights: string[] = [];
  const fieldOrder = ['tetra', 'antiTetra', 'starTetra', 'merkaba', 'soulStar', 'causal', 'galactic', 'divine'];

  // Generate insights based on activation progress
  if (activatedFields >= 2) {
    insights.push('The tetrahedron spins, building your first light vehicle');
  }
  if (activatedFields >= 4) {
    insights.push('Counter-rotating fields establish the merkaba matrix');
  }
  if (activatedFields >= 6) {
    insights.push('Your light-body expands beyond the physical form');
  }
  if (activatedFields >= 8) {
    insights.push('Complete merkaba activation - ready for sacred travel');
  }

  // Add field-specific insights
  for (let i = 0; i < activatedFields; i++) {
    const field = fieldOrder[i];
    const metadata = FIELD_METADATA[field];
    if (metadata) {
      insights.push(`${metadata.geometry} field resonates with ${metadata.element.toLowerCase()} energy`);
    }
  }

  // Chakra focus insight
  const chakraFocus: Record<string, string> = {
    root: 'Muladhara grounds the merkaba in earth frequencies',
    heart: 'Anahata opens the central channel for light-body formation',
    crown: 'Sahasrara receives the sacred geometry codes from spirit',
  };

  if (chakraFocus[focusChakra]) {
    insights.push(chakraFocus[focusChakra!]);
  }

  // Breathing pattern influence
  if (breathingPattern === 'rapid') {
    insights.push('Rapid breath accelerates the counter-rotating fields');
  } else if (breathingPattern === 'slow') {
    insights.push('Deep slow breath stabilizes the merkaba structure');
  } else {
    insights.push('Balanced breathing harmonizes the sacred geometry');
  }

  return {
    completed: true,
    energyLevel,
    rotationLevel,
    activatedFields,
    insights,
    timestamp: new Date(),
  };
}

/**
 * Gets available merkaba fields for practice
 */
export function getAvailableFields(): string[] {
  return ['tetra', 'antiTetra', 'starTetra', 'merkaba', 'soulStar', 'causal', 'galactic', 'divine'];
}

/**
 * Gets metadata for a specific merkaba field
 */
export function getFieldMetadata(field: string): { geometry: string; element: string; meaning: string } | null {
  return FIELD_METADATA[field] ?? null;
}
