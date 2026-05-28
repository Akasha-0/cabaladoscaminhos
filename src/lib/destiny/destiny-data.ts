// @ts-nocheck
// Destiny data — paths, profiles, and spiritual evolution

export interface DestinyProfile {
  id: string;
  name: string;
  portugueseName: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  spiritualGifts: string[];
  lifePurpose: string;
  compatiblePaths: string[];
}

export interface DestinyPhase {
  id: string;
  name: string;
  portugueseName: string;
  ageRange: string;
  description: string;
  lessons: string[];
  keyExperiences: string[];
  growthAreas: string[];
}

export interface DestinyAspect {
  id: string;
  name: string;
  portugueseName: string;
  element: string;
  meaning: string;
  affirmation: string;
}

const profiles: DestinyProfile[] = [
  {
    id: 'creator',
    name: 'Creator',
    portugueseName: 'Criador',
    description: 'Souls with creative potential and manifestation abilities',
    characteristics: ['innovation', 'vision', 'artistic expression', 'manifestation'],
    strengths: ['imagination', 'originality', 'transformative power'],
    challenges: ['impatience', 'perfectionism', 'scattered energy'],
    spiritualGifts: ['manifestation', 'creation', 'inspiration'],
    lifePurpose: 'Create new realities and inspire others through creative expression',
    compatiblePaths: ['path-1', 'path-22'],
  },
  {
    id: 'healer',
    name: 'Healer',
    portugueseName: 'Curador',
    description: 'Souls with healing abilities and compassionate nature',
    characteristics: ['compassion', 'empathy', 'intuition', 'nurturing'],
    strengths: ['emotional intelligence', 'deep listening', 'restoration'],
    challenges: ['codependency', 'absorbing others pain', 'boundaries'],
    spiritualGifts: ['energy healing', 'emotional liberation', 'compassion'],
    lifePurpose: 'Heal wounds of the past and facilitate spiritual awakening in others',
    compatiblePaths: ['path-11', 'path-12'],
  },
  {
    id: 'teacher',
    name: 'Teacher',
    portugueseName: 'Professor',
    description: 'Souls with wisdom transmission and knowledge sharing',
    characteristics: ['wisdom', 'patience', 'clarity', 'communication'],
    strengths: ['knowledge', 'teaching ability', 'clarity of expression'],
    challenges: ['arrogance', 'rigidity', 'distant authority'],
    spiritualGifts: ['wisdom transmission', 'knowledge sharing', 'mentorship'],
    lifePurpose: 'Guide seekers on their path and illuminate the truth',
    compatiblePaths: ['path-2', 'path-3'],
  },
  {
    id: 'warrior',
    name: 'Warrior',
    portugueseName: 'Guerreiro',
    description: 'Souls with strength, courage, and protective energy',
    characteristics: ['courage', 'determination', 'strength', 'discipline'],
    strengths: ['protection', 'determination', 'fearlessness'],
    challenges: ['aggression', 'stubbornness', 'conflict'],
    spiritualGifts: ['protection', 'courage', 'transformation'],
    lifePurpose: 'Protect truth, overcome obstacles, and transform darkness into light',
    compatiblePaths: ['path-4', 'path-5'],
  },
  {
    id: 'mystic',
    name: 'Mystic',
    portugueseName: 'Místico',
    description: 'Souls with direct connection to divine realms',
    characteristics: ['intuition', 'mystical awareness', 'transcendence', 'meditation'],
    strengths: ['spiritual perception', 'union with divine', 'wisdom'],
    challenges: ['detachment', 'isolation', 'otherworldly focus'],
    spiritualGifts: ['prophetic vision', 'divine communion', 'spiritual revelation'],
    lifePurpose: 'Bridge heaven and earth, transmitting divine wisdom to incarnated realms',
    compatiblePaths: ['path-13', 'path-14'],
  },
  {
    id: 'sage',
    name: 'Sage',
    portugueseName: 'Sábio',
    description: 'Souls with accumulated wisdom and integration capacity',
    characteristics: ['wisdom', 'integration', 'balance', 'discernment'],
    strengths: ['discernment', 'balance', 'synthesis', 'integration'],
    challenges: ['analysis paralysis', 'too much knowledge', 'isolation'],
    spiritualGifts: ['wisdom', 'synthesis', 'counsel', 'discernment'],
    lifePurpose: 'Integrate all knowledge and guide others through complex spiritual terrain',
    compatiblePaths: ['path-7', 'path-8'],
  },
];

const phases: DestinyPhase[] = [
  {
    id: 'awakening',
    name: 'Awakening Phase',
    portugueseName: 'Fase do Despertar',
    ageRange: '0-12',
    description: 'Initial soul awakening and early life purpose identification',
    lessons: ['trust', 'safety', 'basic trust in life'],
    keyExperiences: ['birth', 'first relationships', 'initial trauma or joy'],
    growthAreas: ['security', 'basic needs', 'initial worldview'],
  },
  {
    id: 'discovery',
    name: 'Discovery Phase',
    portugueseName: 'Fase da Descoberta',
    ageRange: '12-25',
    description: 'Soul exploration and identity formation',
    lessons: ['identity', 'choice', 'exploration'],
    keyExperiences: ['puberty', 'education', 'first relationships', 'rebellion'],
    growthAreas: ['autonomy', 'values', 'direction'],
  },
  {
    id: 'construction',
    name: 'Construction Phase',
    portugueseName: 'Fase da Construção',
    ageRange: '25-40',
    description: 'Building life structure aligned with destiny',
    lessons: ['responsibility', 'creation', 'commitment'],
    keyExperiences: ['career', 'partnership', 'parenting', 'financial independence'],
    growthAreas: ['maturity', 'creation', 'service'],
  },
  {
    id: 'integration',
    name: 'Integration Phase',
    portugueseName: 'Fase da Integração',
    ageRange: '40-60',
    description: 'Integrating life experiences into wisdom',
    lessons: ['surrender', 'acceptance', 'wisdom'],
    keyExperiences: ['career peaks', 'family expansion', 'midlife crisis', 'success'],
    growthAreas: ['wisdom', 'generativity', 'acceptance'],
  },
  {
    id: 'transcendence',
    name: 'Transcendence Phase',
    portugueseName: 'Fase da Transcendência',
    ageRange: '60+',
    description: 'Spiritual maturation and soul completion',
    lessons: ['completion', 'legacy', 'eternal perspective'],
    keyExperiences: ['wisdom sharing', 'completion of cycles', 'approaching transition'],
    growthAreas: ['wisdom transmission', 'soul completion', 'eternal identity'],
  },
];

const aspects: DestinyAspect[] = [
  {
    id: 'dharma',
    name: 'Dharma',
    portugueseName: 'Dharma',
    element: 'fire',
    meaning: 'Divine purpose and cosmic duty',
    affirmation: 'I align with my divine purpose and fulfill my cosmic dharma',
  },
  {
    id: 'karma',
    name: 'Karma',
    portugueseName: 'Carma',
    element: 'earth',
    meaning: 'Action and consequence law',
    affirmation: 'I act with consciousness, creating positive karma through intentional living',
  },
  {
    id: 'reincarnation',
    name: 'Reincarnation',
    portugueseName: 'Reencarnação',
    element: 'air',
    meaning: 'Soul cyclical return to matter',
    affirmation: 'I honor my soul journey through multiple incarnations',
  },
  {
    id: 'mission',
    name: 'Mission',
    portugueseName: 'Missão',
    element: 'water',
    meaning: 'Specific soul contract with humanity',
    affirmation: 'I fulfill my sacred mission with love and dedication',
  },
  {
    id: 'free_will',
    name: 'Free Will',
    portugueseName: 'Livre Arbítrio',
    element: 'ether',
    meaning: 'Capacity to choose and create destiny',
    affirmation: 'I consciously choose my path, creating my destiny with wisdom',
  },
  {
    id: 'fate',
    name: 'Fate',
    portugueseName: 'Destino',
    element: 'time',
    meaning: 'Cosmic predetermined points in soul journey',
    affirmation: 'I honor the sacred timing of my soul\'s evolution',
  },
];

export interface DestinyData {
  profiles: DestinyProfile[];
  phases: DestinyPhase[];
  aspects: DestinyAspect[];
  totalProfiles: number;
  totalPhases: number;
  totalAspects: number;
  highestProfileId: string;
}

function buildData(): DestinyData {
  return {
    profiles,
    phases,
    aspects,
    totalProfiles: profiles.length,
    totalPhases: phases.length,
    totalAspects: aspects.length,
    highestProfileId: profiles[profiles.length - 1].id,
  };
}

// Singleton cache
let cachedData: DestinyData | null = null;

export function getData(): DestinyData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getProfileById(id: string): DestinyProfile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getProfilesByCharacteristic(char: string): DestinyProfile[] {
  return profiles.filter((p) => p.characteristics.includes(char));
}

export function getPhaseById(id: string): DestinyPhase | undefined {
  return phases.find((p) => p.id === id);
}

export function getPhaseByAge(age: number): DestinyPhase | undefined {
  const ageRanges: { [key: string]: [number, number] } = {
    awakening: [0, 12],
    discovery: [12, 25],
    construction: [25, 40],
    integration: [40, 60],
    transcendence: [60, 150],
  };
  for (const [phaseId, [min, max]] of Object.entries(ageRanges)) {
    if (age >= min && age < max) {
      return phases.find((p) => p.id === phaseId);
    }
  }
  return undefined;
}

export function getAspectById(id: string): DestinyAspect | undefined {
  return aspects.find((a) => a.id === id);
}

export function getAspectsByElement(element: string): DestinyAspect[] {
  return aspects.filter((a) => a.element === element);
}

export function getCompatibleProfiles(profileId: string): DestinyProfile[] {
  const profile = getProfileById(profileId);
  if (!profile) return [];
  return profile.compatiblePaths
    .map((pathId) => profiles.find((p) => p.id === pathId))
    .filter(Boolean) as DestinyProfile[];
}