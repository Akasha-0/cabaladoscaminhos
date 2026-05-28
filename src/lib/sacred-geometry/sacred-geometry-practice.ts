/**
 * Sacred Geometry - Practice Module
 * 
 * Contemplative practices for working with sacred geometric forms,
 * mandalas, and universal patterns.
 */

import { 
  getMandala, 
  listMandalaTypes, 
  MandalaConfig,
  MandalaType 
} from './mandala-library';

import { 
  getPatternById,
  getPatternsByCategory,
  PatternCategory,
  MetatronRelation,
  getPatternsByMetatronRelation,
  getPatternsBySefirot,
  getPatternsByChakra,
  GeometricPattern
} from './geometric-patterns';

export interface PracticeSession {
  id: string;
  practiceType: 'mandala' | 'pattern' | 'metatron' | 'sefirot' | 'chakra';
  name: string;
  description: string;
  duration: number;
  focus: string;
  steps: string[];
}

export interface PracticeResult {
  session: PracticeSession;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  focus: string;
  insights: string[];
}

/**
 * Perform a sacred geometry practice session
 */
export async function performPractice(
  practiceType?: 'mandala' | 'pattern' | 'metatron' | 'sefirot' | 'chakra',
  focus?: string
): Promise<PracticeResult> {
  const startedAt = new Date();
  
  // Select practice type based on input or default to mandala
  const type = practiceType ?? 'mandala';
  
  // Build session based on practice type
  const session = buildSession(type, focus);
  
  // Simulate practice duration based on steps
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const completedAt = new Date();
  const duration = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000);
  
  // Generate insights based on practice type
  const insights = generateInsights(type, focus);
  
  return {
    session,
    startedAt,
    completedAt,
    duration,
    focus: session.focus,
    insights
  };
}

function buildSession(
  type: 'mandala' | 'pattern' | 'metatron' | 'sefirot' | 'chakra',
  focus?: string
): PracticeSession {
  const id = generateSessionId();
  
  switch (type) {
    case 'mandala':
      return buildMandalaSession(id, focus);
    case 'pattern':
      return buildPatternSession(id, focus);
    case 'metatron':
      return buildMetatronSession(id, focus);
    case 'sefirot':
      return buildSefirotSession(id, focus);
    case 'chakra':
      return buildChakraSession(id, focus);
  }
}

function buildMandalaSession(id: string, focus?: string): PracticeSession {
  const types = listMandalaTypes();
  const type = (focus && types.includes(focus as MandalaType)) 
    ? (focus as MandalaType) 
    : types[Math.floor(Math.random() * types.length)];
  const mandala = getMandala(type);
  
  return {
    id,
    practiceType: 'mandala',
    name: `Mandala: ${mandala.name}`,
    description: mandala.description,
    duration: mandala.layers * 30,
    focus: mandala.spiritualMeaning,
    steps: generateMandalaSteps(mandala)
  };
}

function generateMandalaSteps(mandala: MandalaConfig): string[] {
  const steps: string[] = [
    `Prepare space for ${mandala.name} mandala contemplation`,
    `Center awareness on the central point`,
    `Begin tracing the first layer with ${mandala.symmetry}-fold symmetry`,
    `Progressively move through each of the ${mandala.layers} layers`,
    `Observe how ${mandala.elements.join(', ')} elements interact`,
    `Rest in the complete pattern`,
    `Integrate insights from the ${mandala.type} mandala experience`
  ];
  return steps;
}

function buildPatternSession(id: string, focus?: string): PracticeSession {
  let pattern: GeometricPattern | undefined;
  
  if (focus) {
    pattern = getPatternById(focus) ?? getPatternsByCategory(focus as PatternCategory)[0];
  }
  
  if (!pattern) {
    // Get a random platonic solid pattern
    const patterns = getPatternsByCategory('platonic');
    pattern = patterns[Math.floor(Math.random() * patterns.length)];
  }
  
  return {
    id,
    practiceType: 'pattern',
    name: `Pattern: ${pattern.name}`,
    description: pattern.description,
    duration: pattern.category === 'platonic' ? 300 : 240,
    focus: `Sacred ${pattern.category} geometry`,
    steps: generatePatternSteps(pattern)
  };
}

function generatePatternSteps(pattern: GeometricPattern): string[] {
  return [
    `Contemplate the ${pattern.name}`,
    `Observe ${pattern.name} form in nature and architecture`,
    `Visualize the pattern's connection to ${pattern.sefirots.join(', ')}`,
    `Feel the resonance with ${pattern.elements.join(', ')} elements`,
    `Integrate the ${pattern.阴阳} principle`,
    `Complete with gratitude for the geometric teaching`
  ];
}

function buildMetatronSession(id: string, focus?: string): PracticeSession {
  const relations: MetatronRelation[] = ['cube', 'merkaba', 'tree', 'flower'];
  const relation = (focus && relations.includes(focus as MetatronRelation))
    ? (focus as MetatronRelation)
    : relations[Math.floor(Math.random() * relations.length)];
  
  const patterns = getPatternsByMetatronRelation(relation);
  
  return {
    id,
    practiceType: 'metatron',
    name: `Metatron: ${relation}`,
    description: `Work with Metatron's Cube through the ${relation} relationship`,
    duration: 420,
    focus: 'Metatron consciousness and dimensional awareness',
    steps: generateMetatronSteps(relation, patterns.length)
  };
}

function generateMetatronSteps(relation: MetatronRelation, count: number): string[] {
  return [
    'Call upon Metatron for guidance',
    'Visualize the central point of the cube',
    'Expand outward through all thirteen circles',
    `Explore the ${relation} geometric form`,
    `Trace the ${count} geometric patterns within`,
    'Open the merkaba light body if merkabah',
    'Integrate the tree of life pathways',
    'Complete with blessing and grounding'
  ];
}

function buildSefirotSession(id: string, focus?: string): PracticeSession {
  const sefirots = getPatternsBySefirot(focus ?? 'Tiphereth');
  
  return {
    id,
    practiceType: 'sefirot',
    name: `Sefirot: ${focus ?? 'Tiphereth'}`,
    description: `Contemplative practice for the sefirah ${focus ?? 'Tiphereth'}`,
    duration: 360,
    focus: `Sefirah ${focus ?? 'Tiphereth'} consciousness`,
    steps: generateSefirotSteps(focus ?? 'Tiphereth', sefirots.length)
  };
}

function generateSefirotSteps(sefirah: string, count: number): string[] {
  return [
    `Prepare to work with ${sefirah}`,
    'Recite the corresponding letter and number',
    'Visualize the sefira as a vessel of light',
    `Explore ${count} geometric patterns of this sefirah`,
    'Connect through the tree of life pathways',
    'Receive the spiritual influence',
    'Ground and integrate the experience'
  ];
}

function buildChakraSession(id: string, focus?: string): PracticeSession {
  const chakraNumber = focus ? parseInt(focus, 10) : 4;
  const patterns = getPatternsByChakra(chakraNumber);
  
  return {
    id,
    practiceType: 'chakra',
    name: `Chakra: ${chakraNumber}`,
    description: `Practice for chakra ${chakraNumber} geometric form`,
    duration: 300,
    focus: `Chakra ${chakraNumber} energy center`,
    steps: generateChakraSteps(chakraNumber, patterns.length)
  };
}

function generateChakraSteps(chakra: number, count: number): string[] {
  return [
    'Center and breathe deeply',
    `Locate the ${chakra}th chakra energy center`,
    `Visualize its sacred ${chakra}-petaled geometric form`,
    `Explore ${count} geometric patterns associated`,
    'Allow the energy to flow and balance',
    'Integrate the chakra wisdom',
    'Complete with gratitude'
  ];
}

function generateInsights(
  type: 'mandala' | 'pattern' | 'metatron' | 'sefirot' | 'chakra',
  focus?: string
): string[] {
  const baseInsights: Record<string, string[]> = {
    mandala: [
      'The geometric forms reveal underlying unity',
      'Symmetry meditation brings inner peace',
      'Patterns reflect cosmic order'
    ],
    pattern: [
      'Sacred geometry connects visible and invisible',
      'Form and consciousness are one',
      'Mathematical beauty points to divine truth'
    ],
    metatron: [
      'Metatron reveals multi-dimensional relationships',
      'The cube contains all five platonic solids',
      'Light and geometry are inseparable'
    ],
    sefirot: [
      'The tree of life maps consciousness',
      'Each sefirah contains infinite depth',
      'Geometry reveals divine attributes'
    ],
    chakra: [
      'Energy centers reflect geometric principles',
      'Chakra geometry balances body and spirit',
      'Pattern awareness heals at all levels'
    ]
  };
  
  return baseInsights[type] ?? baseInsights.pattern;
}

function generateSessionId(): string {
  return `sgp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get available practice types
 */
export function getPracticeTypes(): string[] {
  return ['mandala', 'pattern', 'metatron', 'sefirot', 'chakra'];
}

/**
 * Get recommended practice for a specific focus
 */
export function getRecommendedPractice(focus: string): PracticeSession {
  const type = inferPracticeType(focus);
  return buildSession(type, focus);
}

function inferPracticeType(focus: string): 'mandala' | 'pattern' | 'metatron' | 'sefirot' | 'chakra' {
  const lowerFocus = focus.toLowerCase();
  
  if (lowerFocus.includes('mandala') || lowerFocus.includes('chakra')) {
    return 'chakra';
  }
  if (lowerFocus.includes('sefir') || lowerFocus.includes('kether')) {
    return 'sefirot';
  }
  if (lowerFocus.includes('metatron') || lowerFocus.includes('cube') || lowerFocus.includes('merkaba')) {
    return 'metatron';
  }
  if (lowerFocus.includes('platonic') || lowerFocus.includes('solid')) {
    return 'pattern';
  }
  
  return 'mandala';
}